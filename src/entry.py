from __future__ import annotations

import asgi, base64, hashlib, hmac, json, os, re, secrets, uuid, inspect
from datetime import datetime, timedelta, timezone
from typing import Any, Literal
from fastapi import Depends, FastAPI, HTTPException, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator
from workers import WorkerEntrypoint

VERSION = "1.0.0"
COOKIE = "bentley_session"
TTL = 60 * 60 * 24 * 14
ROLES = {"owner","admin","developer","operator","marketing_manager","viewer","auditor"}
READ = ROLES
WRITE = {"owner","admin","developer","operator"}
ADMIN = {"owner","admin"}
MARKETING = {"owner","admin","marketing_manager"}
AUDIT = {"owner","admin","auditor"}
ALLOWED_ORIGINS = {"https://bentley-showcase.vercel.app","http://localhost:3000","http://localhost:5173"}

app = FastAPI(title="Bentley Showcase Enterprise SaaS Backend", version=VERSION)

class Default(WorkerEntrypoint):
    async def fetch(self, request):
        return await asgi.fetch(app, request, self.env)

def utcnow() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()

def uid(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex}"

async def aw(v):
    return await v if inspect.isawaitable(v) else v

def env(req: Request, key: str, default=None):
    e = req.scope.get("env")
    if e is None: return default
    try: return getattr(e, key)
    except Exception:
        try: return e[key]
        except Exception: return default

def dumps(v): return v if isinstance(v, str) else json.dumps(v or {}, separators=(",",":"))

def loads(v):
    if not v: return {}
    if isinstance(v, (dict, list)): return v
    try: return json.loads(v)
    except Exception: return {}

def clean(row):
    if row is None: return None
    row = dict(row)
    for k in ("metadata_json","config_json","payload_json","result_json"):
        if k in row: row[k] = loads(row[k])
    row.pop("password_hash", None); row.pop("token_hash", None)
    return row

def rows(result):
    if result is None: return []
    if isinstance(result, dict): return [dict(r) for r in result.get("results", [])]
    return [dict(r) for r in (getattr(result, "results", None) or [])]

async def qrun(db, sql, params=()):
    if db is None:
        raise HTTPException(503, {"code":"database_unavailable","message":"D1 binding DB is not configured"})
    stmt = db.prepare(sql)
    if params: stmt = stmt.bind(*list(params))
    return await aw(stmt.run())

async def qall(db, sql, params=()):
    stmt = db.prepare(sql)
    if params: stmt = stmt.bind(*list(params))
    return rows(await aw(stmt.all()))

async def qone(db, sql, params=()):
    stmt = db.prepare(sql)
    if params: stmt = stmt.bind(*list(params))
    r = await aw(stmt.first())
    return dict(r) if r else None

async def kv_put(kv, key, value, ttl=TTL):
    if not kv: return
    try: await aw(kv.put(key, value, expirationTtl=ttl))
    except Exception:
        try: await aw(kv.put(key, value))
        except Exception: pass

async def kv_del(kv, key):
    if kv:
        try: await aw(kv.delete(key))
        except Exception: pass

async def send_queue(queue, payload):
    if not queue: return False
    try:
        await aw(queue.send(payload)); return True
    except Exception:
        try: await aw(queue.send(dumps(payload))); return True
        except Exception: return False

@app.middleware("http")
async def cors(req: Request, call_next):
    origin = req.headers.get("origin")
    configured = env(req, "CORS_ORIGINS")
    allowed = {x.strip() for x in str(configured).split(",") if x.strip()} if configured else ALLOWED_ORIGINS
    if req.method == "OPTIONS":
        res = Response(status_code=204)
    else:
        res = await call_next(req)
    if origin in allowed:
        res.headers["Access-Control-Allow-Origin"] = origin
        res.headers["Access-Control-Allow-Credentials"] = "true"
        res.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type, X-Seed-Secret"
        res.headers["Access-Control-Allow-Methods"] = "GET, POST, PATCH, DELETE, OPTIONS"
        res.headers["Vary"] = "Origin"
    res.headers["X-Backend-Version"] = VERSION
    return res

@app.exception_handler(HTTPException)
async def http_exc(_, exc):
    return JSONResponse(status_code=exc.status_code, content={"error": exc.detail if isinstance(exc.detail, dict) else {"message": exc.detail}})

@app.exception_handler(RequestValidationError)
async def validation_exc(_, exc):
    return JSONResponse(status_code=422, content={"error":{"code":"validation_error","message":"Request validation failed","details":exc.errors()}})

def phash(password: str) -> str:
    salt = os.urandom(16)
    derived = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 210000)
    return "pbkdf2_sha256$210000$%s$%s" % (base64.b64encode(salt).decode(), base64.b64encode(derived).decode())

def pverify(password: str, stored: str) -> bool:
    try:
        scheme, iters, salt, derived = stored.split("$", 3)
        actual = hashlib.pbkdf2_hmac("sha256", password.encode(), base64.b64decode(salt), int(iters))
        return scheme == "pbkdf2_sha256" and hmac.compare_digest(actual, base64.b64decode(derived))
    except Exception: return False

def thash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()

def get_token(req: Request):
    auth = req.headers.get("authorization","")
    return auth[7:].strip() if auth.lower().startswith("bearer ") else req.cookies.get(COOKIE)

async def user(req: Request):
    token = get_token(req)
    if not token: raise HTTPException(401, {"code":"unauthenticated","message":"Authentication required"})
    row = await qone(env(req,"DB"), """SELECT users.*, sessions.id session_id FROM sessions JOIN users ON users.id=sessions.user_id
        WHERE sessions.token_hash=? AND sessions.expires_at > ?""", [thash(token), utcnow()])
    if not row: raise HTTPException(401, {"code":"invalid_session","message":"Session invalid or expired"})
    return clean(row)

async def audit(req, actor, action, target_type, target_id=None, status="success", meta=None):
    try:
        await qrun(env(req,"DB"), "INSERT INTO audit_logs (id,actor_user_id,action,target_type,target_id,status,metadata_json,created_at) VALUES (?,?,?,?,?,?,?,?)",
                   [uid("aud"), actor, action, target_type, target_id, status, dumps(meta), utcnow()])
    except Exception: pass

async def activity(req, project_id, actor, event, detail, status="info", meta=None):
    try:
        await qrun(env(req,"DB"), "INSERT INTO activity_logs (id,project_id,actor_user_id,event,detail,status,metadata_json,created_at) VALUES (?,?,?,?,?,?,?,?)",
                   [uid("act"), project_id, actor, event, detail, status, dumps(meta), utcnow()])
    except Exception: pass

async def org_role(req, u, org_id):
    org = await qone(env(req,"DB"), "SELECT * FROM organizations WHERE id=?", [org_id])
    if not org: raise HTTPException(404, {"code":"org_not_found","message":"Organization not found"})
    if org["owner_user_id"] == u["id"]: return "owner"
    m = await qone(env(req,"DB"), "SELECT role FROM organization_members WHERE org_id=? AND user_id=? AND status='active'", [org_id,u["id"]])
    return m["role"] if m else None

async def require_org(req, u, org_id, roles=READ):
    r = await org_role(req,u,org_id)
    if r not in roles: raise HTTPException(403, {"code":"forbidden","message":"Insufficient organization permissions"})
    return r

async def proj_role(req, u, project_id):
    db = env(req,"DB")
    p = await qone(db, "SELECT * FROM projects WHERE id=?", [project_id])
    if not p: raise HTTPException(404, {"code":"project_not_found","message":"Project not found"})
    if p["owner_user_id"] == u["id"]: return "owner"
    r = await qone(db, "SELECT role FROM project_members WHERE project_id=? AND user_id=? AND status='active'", [project_id,u["id"]])
    if r: return r["role"]
    return await org_role(req,u,p["org_id"])

async def require_project(req,u,project_id,roles=READ):
    r = await proj_role(req,u,project_id)
    if r not in roles: raise HTTPException(403, {"code":"forbidden","message":"Insufficient project permissions"})
    return r

async def ensure_child(req, table, id, project_id, label):
    r = await qone(env(req,"DB"), f"SELECT * FROM {table} WHERE id=? AND project_id=?", [id, project_id])
    if not r: raise HTTPException(404, {"code":"not_found","message":f"{label} not found"})
    return r

def slug(s):
    return re.sub(r"[^a-z0-9]+","-",s.lower()).strip("-") or uuid.uuid4().hex[:8]

async def insert(req, table, data):
    keys = list(data)
    await qrun(env(req,"DB"), f"INSERT INTO {table} ({','.join(keys)}) VALUES ({','.join(['?']*len(keys))})", [data[k] for k in keys])
    return clean(await qone(env(req,"DB"), f"SELECT * FROM {table} WHERE id=?", [data["id"]]))

async def patch(req, table, id, data):
    data = {k:v for k,v in data.items() if v is not None}
    if data:
        data["updated_at"] = utcnow()
        await qrun(env(req,"DB"), f"UPDATE {table} SET {','.join([k+'=?' for k in data])} WHERE id=?", [*data.values(), id])
    r = await qone(env(req,"DB"), f"SELECT * FROM {table} WHERE id=?", [id])
    if not r: raise HTTPException(404, {"code":"not_found","message":f"{table} record not found"})
    return clean(r)

async def delete(req, table, id):
    r = await qone(env(req,"DB"), f"SELECT * FROM {table} WHERE id=?", [id])
    if not r: raise HTTPException(404, {"code":"not_found","message":f"{table} record not found"})
    await qrun(env(req,"DB"), f"DELETE FROM {table} WHERE id=?", [id])
    return clean(r)

async def make_job(req, project_id, typ, payload, actor=None):
    job = await insert(req, "jobs", {"id":uid("job"),"project_id":project_id,"type":typ,"status":"queued","payload_json":dumps(payload),"result_json":"{}","error_message":None,"attempts":0,"created_at":utcnow(),"updated_at":utcnow()})
    sent = await send_queue(env(req,"JOB_QUEUE"), {"job_id":job["id"],"project_id":project_id,"type":typ,"payload":payload})
    await activity(req, project_id, actor, f"job.{typ}.queued", f"Queued {typ}", "queued", {"queue_sent":sent})
    return {**job, "queue_sent": sent}

class Signup(BaseModel):
    email: str; password: str = Field(min_length=8); name: str
    @field_validator("email")
    @classmethod
    def email_ok(cls, v):
        v=v.strip().lower()
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", v): raise ValueError("invalid email")
        return v
class Login(BaseModel): email: str; password: str
class OrgIn(BaseModel): name: str; slug: str|None=None; plan: str="enterprise"; status: str="active"
class OrgPatch(BaseModel): name:str|None=None; slug:str|None=None; plan:str|None=None; status:str|None=None
class ProjectIn(BaseModel):
    org_id:str; name:str; slug:str|None=None; status:str="active"; repo_url:str|None=None; production_url:str|None=None; runtime:str="cloudflare-workers-python-fastapi"
class ProjectPatch(BaseModel): name:str|None=None; slug:str|None=None; status:str|None=None; repo_url:str|None=None; production_url:str|None=None; runtime:str|None=None
class MemberIn(BaseModel): user_id:str; role:Literal["owner","admin","developer","operator","marketing_manager","viewer","auditor"]; status:str="active"
class MemberPatch(BaseModel): role:Literal["owner","admin","developer","operator","marketing_manager","viewer","auditor"]|None=None; status:str|None=None
class ServiceIn(BaseModel): name:str; provider:str; environment:str="production"; status:str="active"; url:str|None=None; latest_commit:str|None=None; metadata_json:dict[str,Any]=Field(default_factory=dict)
class ServicePatch(BaseModel): name:str|None=None; provider:str|None=None; environment:str|None=None; status:str|None=None; url:str|None=None; latest_commit:str|None=None; metadata_json:dict[str,Any]|None=None
class ActionIn(BaseModel): action:Literal["health","logs","redeploy","rollback","promote"]; payload:dict[str,Any]=Field(default_factory=dict)
class ToolIn(BaseModel):
    name:str; category:Literal["production","marketing","automation","ai","integration","analytics"]; status:str="active"; owner:str|None=None; connected_service:str|None=None; description:str|None=None; metadata_json:dict[str,Any]=Field(default_factory=dict)
class ToolPatch(BaseModel):
    name:str|None=None; category:Literal["production","marketing","automation","ai","integration","analytics"]|None=None; status:str|None=None; owner:str|None=None; connected_service:str|None=None; description:str|None=None; last_run_at:str|None=None; metadata_json:dict[str,Any]|None=None
class ToolRun(BaseModel): input:dict[str,Any]=Field(default_factory=dict)
class CampaignIn(BaseModel): name:str; channel:Literal["telegram","whatsapp","discord","facebook","x","twitter","email"]; status:str="draft"; content:str|None=None; scheduled_at:str|None=None; metadata_json:dict[str,Any]=Field(default_factory=dict)
class CampaignPatch(BaseModel): name:str|None=None; channel:str|None=None; status:str|None=None; content:str|None=None; scheduled_at:str|None=None; metadata_json:dict[str,Any]|None=None
class AutomationIn(BaseModel): name:str; trigger_type:str; status:str="active"; config_json:dict[str,Any]=Field(default_factory=dict)
class AutomationPatch(BaseModel): name:str|None=None; trigger_type:str|None=None; status:str|None=None; runs:int|None=None; last_run_at:str|None=None; config_json:dict[str,Any]|None=None
class JobIn(BaseModel): type:str; status:str="queued"; payload_json:dict[str,Any]=Field(default_factory=dict)
class JobPatch(BaseModel): type:str|None=None; status:str|None=None; payload_json:dict[str,Any]|None=None; result_json:dict[str,Any]|None=None; error_message:str|None=None; attempts:int|None=None
class IntegrationIn(BaseModel):
    provider:Literal["github","vercel","cloudflare","telegram","whatsapp","bentley_itwin","slack","stripe","datadog"]; name:str; status:str="active"; external_account_id:str|None=None; metadata_json:dict[str,Any]=Field(default_factory=dict)
class IntegrationPatch(BaseModel):
    provider:Literal["github","vercel","cloudflare","telegram","whatsapp","bentley_itwin","slack","stripe","datadog"]|None=None; name:str|None=None; status:str|None=None; external_account_id:str|None=None; metadata_json:dict[str,Any]|None=None
class ActivityIn(BaseModel): event:str; detail:str; status:str="info"; metadata_json:dict[str,Any]=Field(default_factory=dict)

@app.get("/")
async def root(): return {"service":"Bentley Showcase Enterprise SaaS Backend","status":"ok","version":VERSION,"runtime":"cloudflare-workers-python-fastapi"}
@app.get("/health")
async def health(req:Request):
    dbs="ok"
    try: await qone(env(req,"DB"),"SELECT 1 ok")
    except Exception: dbs="unavailable"
    return {"status":"healthy" if dbs=="ok" else "degraded","database":dbs,"kv_sessions":"configured" if env(req,"SESSIONS") else "missing","queue":"configured" if env(req,"JOB_QUEUE") else "missing","version":VERSION,"runtime":"cloudflare-workers-python-fastapi"}
@app.get("/status")
async def status(req:Request):
    return {**await health(req), "capabilities":{"auth":True,"organizations":True,"projects":True,"rbac":True,"production_services":True,"marketing_tools":True,"automations":True,"integrations":True,"audit_logs":True,"d1_persistence":env(req,"DB") is not None,"kv_sessions":env(req,"SESSIONS") is not None,"queues_ready":env(req,"JOB_QUEUE") is not None}}

async def new_session(req, user_id):
    token = secrets.token_urlsafe(48); h=thash(token); exp=(datetime.now(timezone.utc)+timedelta(seconds=TTL)).replace(microsecond=0).isoformat()
    await qrun(env(req,"DB"), "INSERT INTO sessions (id,user_id,token_hash,expires_at,created_at,updated_at) VALUES (?,?,?,?,?,?)", [uid("ses"),user_id,h,exp,utcnow(),utcnow()])
    await kv_put(env(req,"SESSIONS"), f"session:{h}", dumps({"user_id":user_id,"expires_at":exp}))
    return {"token":token,"expires_at":exp}
@app.post("/auth/signup")
async def signup(p:Signup, req:Request, res:Response):
    if await qone(env(req,"DB"),"SELECT id FROM users WHERE email=?", [p.email]): raise HTTPException(409, {"code":"email_exists","message":"Email already registered"})
    user_id=uid("usr"); t=utcnow()
    await qrun(env(req,"DB"),"INSERT INTO users (id,email,password_hash,name,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?)",[user_id,p.email,phash(p.password),p.name,"active",t,t])
    s=await new_session(req,user_id); res.set_cookie(COOKIE,s["token"],max_age=TTL,httponly=True,secure=True,samesite="none")
    await audit(req,user_id,"auth.signup","user",user_id); return {"user":clean(await qone(env(req,"DB"),"SELECT * FROM users WHERE id=?",[user_id])),"session":s}
@app.post("/auth/login")
async def login(p:Login, req:Request, res:Response):
    u=await qone(env(req,"DB"),"SELECT * FROM users WHERE email=?", [p.email.strip().lower()])
    if not u or not pverify(p.password,u.get("password_hash","")):
        await audit(req,None,"auth.login_failed","user",None,"failed",{"email":p.email}); raise HTTPException(401, {"code":"invalid_credentials","message":"Invalid email or password"})
    s=await new_session(req,u["id"]); res.set_cookie(COOKIE,s["token"],max_age=TTL,httponly=True,secure=True,samesite="none")
    await audit(req,u["id"],"auth.login","user",u["id"]); return {"user":clean(u),"session":s}
@app.post("/auth/logout")
async def logout(req:Request, res:Response, u=Depends(user)):
    token=get_token(req)
    if token:
        h=thash(token); await qrun(env(req,"DB"),"DELETE FROM sessions WHERE token_hash=?", [h]); await kv_del(env(req,"SESSIONS"),f"session:{h}")
    res.delete_cookie(COOKIE); await audit(req,u["id"],"auth.logout","user",u["id"]); return {"ok":True}
@app.get("/auth/me")
async def me(u=Depends(user)): return {"user":u}

@app.get("/orgs")
async def orgs(req:Request,u=Depends(user)):
    rs=await qall(env(req,"DB"),"""SELECT DISTINCT organizations.* FROM organizations LEFT JOIN organization_members ON organization_members.org_id=organizations.id WHERE organizations.owner_user_id=? OR organization_members.user_id=? ORDER BY organizations.created_at DESC""",[u["id"],u["id"]])
    return {"organizations":[clean(r) for r in rs]}
@app.post("/orgs")
async def create_org(p:OrgIn, req:Request,u=Depends(user)):
    oid=uid("org"); t=utcnow(); o=await insert(req,"organizations",{"id":oid,"name":p.name,"slug":p.slug or slug(p.name),"plan":p.plan,"status":p.status,"owner_user_id":u["id"],"created_at":t,"updated_at":t})
    await qrun(env(req,"DB"),"INSERT INTO organization_members (id,org_id,user_id,role,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?)",[uid("omem"),oid,u["id"],"owner","active",t,t])
    await audit(req,u["id"],"org.create","organization",oid); return {"organization":o}
@app.get("/orgs/{org_id}")
async def get_org(org_id:str, req:Request,u=Depends(user)):
    await require_org(req,u,org_id); return {"organization":clean(await qone(env(req,"DB"),"SELECT * FROM organizations WHERE id=?",[org_id]))}
@app.patch("/orgs/{org_id}")
async def upd_org(org_id:str,p:OrgPatch,req:Request,u=Depends(user)):
    await require_org(req,u,org_id,ADMIN); o=await patch(req,"organizations",org_id,p.model_dump(exclude_unset=True)); await audit(req,u["id"],"org.update","organization",org_id); return {"organization":o}
@app.delete("/orgs/{org_id}")
async def del_org(org_id:str,req:Request,u=Depends(user)):
    await require_org(req,u,org_id,{"owner"}); d=await delete(req,"organizations",org_id); await audit(req,u["id"],"org.delete","organization",org_id); return {"deleted":d}

@app.get("/projects")
async def projects(req:Request,u=Depends(user)):
    rs=await qall(env(req,"DB"),"""SELECT DISTINCT projects.* FROM projects LEFT JOIN project_members ON project_members.project_id=projects.id LEFT JOIN organizations ON organizations.id=projects.org_id LEFT JOIN organization_members ON organization_members.org_id=organizations.id WHERE projects.owner_user_id=? OR project_members.user_id=? OR organizations.owner_user_id=? OR organization_members.user_id=? ORDER BY projects.created_at DESC""",[u["id"],u["id"],u["id"],u["id"]])
    return {"projects":[clean(r) for r in rs]}
@app.post("/projects")
async def create_project(p:ProjectIn,req:Request,u=Depends(user)):
    await require_org(req,u,p.org_id,WRITE); pid=uid("prj"); t=utcnow()
    pr=await insert(req,"projects",{"id":pid,"org_id":p.org_id,"name":p.name,"slug":p.slug or slug(p.name),"status":p.status,"repo_url":p.repo_url,"production_url":p.production_url,"runtime":p.runtime,"owner_user_id":u["id"],"created_at":t,"updated_at":t})
    await qrun(env(req,"DB"),"INSERT INTO project_members (id,project_id,user_id,role,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?)",[uid("pmem"),pid,u["id"],"owner","active",t,t])
    await audit(req,u["id"],"project.create","project",pid); await activity(req,pid,u["id"],"project.created",f"Created project {p.name}"); return {"project":pr}
@app.get("/projects/{project_id}")
async def get_project(project_id:str,req:Request,u=Depends(user)):
    await require_project(req,u,project_id); return {"project":clean(await qone(env(req,"DB"),"SELECT * FROM projects WHERE id=?",[project_id]))}
@app.patch("/projects/{project_id}")
async def upd_project(project_id:str,p:ProjectPatch,req:Request,u=Depends(user)):
    await require_project(req,u,project_id,WRITE); pr=await patch(req,"projects",project_id,p.model_dump(exclude_unset=True)); await audit(req,u["id"],"project.update","project",project_id); await activity(req,project_id,u["id"],"project.updated","Updated project settings"); return {"project":pr}
@app.delete("/projects/{project_id}")
async def del_project(project_id:str,req:Request,u=Depends(user)):
    await require_project(req,u,project_id,{"owner"}); d=await delete(req,"projects",project_id); await audit(req,u["id"],"project.delete","project",project_id); return {"deleted":d}

@app.get("/projects/{project_id}/members")
async def members(project_id:str,req:Request,u=Depends(user)):
    await require_project(req,u,project_id,ADMIN|AUDIT); rs=await qall(env(req,"DB"),"SELECT project_members.*, users.email, users.name FROM project_members LEFT JOIN users ON users.id=project_members.user_id WHERE project_id=? ORDER BY project_members.created_at DESC",[project_id]); return {"members":[clean(r) for r in rs]}
@app.post("/projects/{project_id}/members")
async def add_member(project_id:str,p:MemberIn,req:Request,u=Depends(user)):
    await require_project(req,u,project_id,ADMIN); m=await insert(req,"project_members",{"id":uid("pmem"),"project_id":project_id,"user_id":p.user_id,"role":p.role,"status":p.status,"created_at":utcnow(),"updated_at":utcnow()}); await audit(req,u["id"],"project_member.create","project_member",m["id"],meta={"project_id":project_id}); return {"member":m}
@app.patch("/projects/{project_id}/members/{member_id}")
async def upd_member(project_id:str,member_id:str,p:MemberPatch,req:Request,u=Depends(user)):
    await require_project(req,u,project_id,ADMIN); await ensure_child(req,"project_members",member_id,project_id,"member"); m=await patch(req,"project_members",member_id,p.model_dump(exclude_unset=True)); await audit(req,u["id"],"project_member.update","project_member",member_id,meta={"project_id":project_id}); return {"member":m}
@app.delete("/projects/{project_id}/members/{member_id}")
async def del_member(project_id:str,member_id:str,req:Request,u=Depends(user)):
    await require_project(req,u,project_id,ADMIN); await ensure_child(req,"project_members",member_id,project_id,"member"); d=await delete(req,"project_members",member_id); await audit(req,u["id"],"project_member.delete","project_member",member_id,meta={"project_id":project_id}); return {"deleted":d}

@app.get("/projects/{project_id}/production-services")
async def services(project_id:str,req:Request,u=Depends(user)):
    await require_project(req,u,project_id); rs=await qall(env(req,"DB"),"SELECT * FROM production_services WHERE project_id=? ORDER BY created_at DESC",[project_id]); return {"production_services":[clean(r) for r in rs]}
@app.post("/projects/{project_id}/production-services")
async def add_service(project_id:str,p:ServiceIn,req:Request,u=Depends(user)):
    await require_project(req,u,project_id,WRITE); s=await insert(req,"production_services",{"id":uid("svc"),"project_id":project_id,**p.model_dump(exclude={"metadata_json"}),"metadata_json":dumps(p.metadata_json),"created_at":utcnow(),"updated_at":utcnow()}); await audit(req,u["id"],"production_service.create","production_service",s["id"],meta={"project_id":project_id}); return {"production_service":s}
@app.patch("/projects/{project_id}/production-services/{service_id}")
async def upd_service(project_id:str,service_id:str,p:ServicePatch,req:Request,u=Depends(user)):
    await require_project(req,u,project_id,WRITE); await ensure_child(req,"production_services",service_id,project_id,"service"); data=p.model_dump(exclude_unset=True)
    if "metadata_json" in data: data["metadata_json"]=dumps(data["metadata_json"])
    s=await patch(req,"production_services",service_id,data); await audit(req,u["id"],"production_service.update","production_service",service_id,meta={"project_id":project_id}); return {"production_service":s}
@app.delete("/projects/{project_id}/production-services/{service_id}")
async def del_service(project_id:str,service_id:str,req:Request,u=Depends(user)):
    await require_project(req,u,project_id,ADMIN); await ensure_child(req,"production_services",service_id,project_id,"service"); d=await delete(req,"production_services",service_id); await audit(req,u["id"],"production_service.delete","production_service",service_id,meta={"project_id":project_id}); return {"deleted":d}
@app.post("/projects/{project_id}/production-services/{service_id}/actions")
async def service_action(project_id:str,service_id:str,p:ActionIn,req:Request,u=Depends(user)):
    await require_project(req,u,project_id,WRITE); await ensure_child(req,"production_services",service_id,project_id,"service"); j=await make_job(req,project_id,f"production_service.{p.action}",{"service_id":service_id,**p.payload},u["id"]); await audit(req,u["id"],f"production_service.action.{p.action}","production_service",service_id,meta={"job_id":j["id"]}); return {"action":p.action,"job":j}

@app.get("/projects/{project_id}/tools")
async def tools(project_id:str,req:Request,u=Depends(user)):
    await require_project(req,u,project_id); return {"tools":[clean(r) for r in await qall(env(req,"DB"),"SELECT * FROM project_tools WHERE project_id=? ORDER BY created_at DESC",[project_id])]}
@app.post("/projects/{project_id}/tools")
async def add_tool(project_id:str,p:ToolIn,req:Request,u=Depends(user)):
    await require_project(req,u,project_id,WRITE|MARKETING); t=await insert(req,"project_tools",{"id":uid("tool"),"project_id":project_id,**p.model_dump(exclude={"metadata_json"}),"last_run_at":None,"metadata_json":dumps(p.metadata_json),"created_at":utcnow(),"updated_at":utcnow()}); await audit(req,u["id"],"tool.create","tool",t["id"],meta={"project_id":project_id}); return {"tool":t}
@app.patch("/projects/{project_id}/tools/{tool_id}")
async def upd_tool(project_id:str,tool_id:str,p:ToolPatch,req:Request,u=Depends(user)):
    await require_project(req,u,project_id,WRITE|MARKETING); await ensure_child(req,"project_tools",tool_id,project_id,"tool"); data=p.model_dump(exclude_unset=True)
    if "metadata_json" in data: data["metadata_json"]=dumps(data["metadata_json"])
    t=await patch(req,"project_tools",tool_id,data); await audit(req,u["id"],"tool.update","tool",tool_id,meta={"project_id":project_id}); return {"tool":t}
@app.delete("/projects/{project_id}/tools/{tool_id}")
async def del_tool(project_id:str,tool_id:str,req:Request,u=Depends(user)):
    await require_project(req,u,project_id,ADMIN); await ensure_child(req,"project_tools",tool_id,project_id,"tool"); d=await delete(req,"project_tools",tool_id); await audit(req,u["id"],"tool.delete","tool",tool_id,meta={"project_id":project_id}); return {"deleted":d}
@app.post("/projects/{project_id}/tools/{tool_id}/run")
async def run_tool(project_id:str,tool_id:str,p:ToolRun,req:Request,u=Depends(user)):
    await require_project(req,u,project_id,WRITE|MARKETING); tool=await ensure_child(req,"project_tools",tool_id,project_id,"tool"); await qrun(env(req,"DB"),"UPDATE project_tools SET last_run_at=?,updated_at=? WHERE id=?",[utcnow(),utcnow(),tool_id]); j=await make_job(req,project_id,f"tool.run.{tool['category']}",{"tool_id":tool_id,"input":p.input},u["id"]); await audit(req,u["id"],"tool.run","tool",tool_id,meta={"job_id":j["id"]}); return {"job":j}

@app.get("/projects/{project_id}/marketing/campaigns")
async def campaigns(project_id:str,req:Request,u=Depends(user)):
    await require_project(req,u,project_id); return {"campaigns":[clean(r) for r in await qall(env(req,"DB"),"SELECT * FROM marketing_campaigns WHERE project_id=? ORDER BY created_at DESC",[project_id])]}
@app.post("/projects/{project_id}/marketing/campaigns")
async def add_campaign(project_id:str,p:CampaignIn,req:Request,u=Depends(user)):
    await require_project(req,u,project_id,MARKETING); ch="x" if p.channel=="twitter" else p.channel; c=await insert(req,"marketing_campaigns",{"id":uid("cmp"),"project_id":project_id,"name":p.name,"channel":ch,"status":p.status,"content":p.content,"scheduled_at":p.scheduled_at,"published_at":None,"metadata_json":dumps(p.metadata_json),"created_at":utcnow(),"updated_at":utcnow()}); await audit(req,u["id"],"marketing_campaign.create","marketing_campaign",c["id"],meta={"project_id":project_id}); return {"campaign":c}
@app.patch("/projects/{project_id}/marketing/campaigns/{campaign_id}")
async def upd_campaign(project_id:str,campaign_id:str,p:CampaignPatch,req:Request,u=Depends(user)):
    await require_project(req,u,project_id,MARKETING); await ensure_child(req,"marketing_campaigns",campaign_id,project_id,"campaign"); data=p.model_dump(exclude_unset=True)
    if data.get("channel")=="twitter": data["channel"]="x"
    if "metadata_json" in data: data["metadata_json"]=dumps(data["metadata_json"])
    c=await patch(req,"marketing_campaigns",campaign_id,data); await audit(req,u["id"],"marketing_campaign.update","marketing_campaign",campaign_id,meta={"project_id":project_id}); return {"campaign":c}
@app.post("/projects/{project_id}/marketing/campaigns/{campaign_id}/publish")
async def publish(project_id:str,campaign_id:str,req:Request,u=Depends(user)):
    await require_project(req,u,project_id,MARKETING); c=await ensure_child(req,"marketing_campaigns",campaign_id,project_id,"campaign"); await qrun(env(req,"DB"),"UPDATE marketing_campaigns SET status='publishing',published_at=?,updated_at=? WHERE id=?",[utcnow(),utcnow(),campaign_id]); j=await make_job(req,project_id,"marketing.publish",{"campaign_id":campaign_id,"channel":c["channel"]},u["id"]); await audit(req,u["id"],"marketing_campaign.publish","marketing_campaign",campaign_id,meta={"job_id":j["id"]}); return {"campaign_id":campaign_id,"job":j}

@app.get("/projects/{project_id}/automations")
async def automations(project_id:str,req:Request,u=Depends(user)):
    await require_project(req,u,project_id); return {"automations":[clean(r) for r in await qall(env(req,"DB"),"SELECT * FROM automations WHERE project_id=? ORDER BY created_at DESC",[project_id])]}
@app.post("/projects/{project_id}/automations")
async def add_auto(project_id:str,p:AutomationIn,req:Request,u=Depends(user)):
    await require_project(req,u,project_id,WRITE); a=await insert(req,"automations",{"id":uid("auto"),"project_id":project_id,"name":p.name,"trigger_type":p.trigger_type,"status":p.status,"runs":0,"last_run_at":None,"config_json":dumps(p.config_json),"created_at":utcnow(),"updated_at":utcnow()}); await audit(req,u["id"],"automation.create","automation",a["id"],meta={"project_id":project_id}); return {"automation":a}
@app.patch("/projects/{project_id}/automations/{automation_id}")
async def upd_auto(project_id:str,automation_id:str,p:AutomationPatch,req:Request,u=Depends(user)):
    await require_project(req,u,project_id,WRITE); await ensure_child(req,"automations",automation_id,project_id,"automation"); data=p.model_dump(exclude_unset=True)
    if "config_json" in data: data["config_json"]=dumps(data["config_json"])
    a=await patch(req,"automations",automation_id,data); await audit(req,u["id"],"automation.update","automation",automation_id,meta={"project_id":project_id}); return {"automation":a}
@app.post("/projects/{project_id}/automations/{automation_id}/run")
async def run_auto(project_id:str,automation_id:str,req:Request,u=Depends(user)):
    await require_project(req,u,project_id,WRITE); await ensure_child(req,"automations",automation_id,project_id,"automation"); await qrun(env(req,"DB"),"UPDATE automations SET runs=runs+1,last_run_at=?,updated_at=? WHERE id=?",[utcnow(),utcnow(),automation_id]); j=await make_job(req,project_id,"automation.run",{"automation_id":automation_id},u["id"]); await audit(req,u["id"],"automation.run","automation",automation_id,meta={"job_id":j["id"]}); return {"job":j}
@app.post("/webhooks/inbound")
async def webhook(req:Request):
    body=await req.json(); project_id=body.get("project_id"); trigger=body.get("trigger_type","webhook")
    if not project_id: raise HTTPException(400, {"code":"project_id_required","message":"project_id is required"})
    autos=await qall(env(req,"DB"),"SELECT * FROM automations WHERE project_id=? AND trigger_type=? AND status='active'",[project_id,trigger])
    jobs=[await make_job(req,project_id,"automation.webhook",{"automation_id":a["id"],"body":body},None) for a in autos]
    await audit(req,None,"webhook.inbound","project",project_id,meta={"trigger_type":trigger,"jobs":len(jobs)}); return {"accepted":True,"jobs":jobs}

@app.get("/projects/{project_id}/jobs")
async def jobs(project_id:str,req:Request,u=Depends(user)):
    await require_project(req,u,project_id); return {"jobs":[clean(r) for r in await qall(env(req,"DB"),"SELECT * FROM jobs WHERE project_id=? ORDER BY created_at DESC",[project_id])]}
@app.post("/projects/{project_id}/jobs")
async def add_job(project_id:str,p:JobIn,req:Request,u=Depends(user)):
    await require_project(req,u,project_id,WRITE); j=await make_job(req,project_id,p.type,p.payload_json,u["id"]); await audit(req,u["id"],"job.create","job",j["id"],meta={"project_id":project_id}); return {"job":j}
@app.patch("/projects/{project_id}/jobs/{job_id}")
async def upd_job(project_id:str,job_id:str,p:JobPatch,req:Request,u=Depends(user)):
    await require_project(req,u,project_id,WRITE); await ensure_child(req,"jobs",job_id,project_id,"job"); data=p.model_dump(exclude_unset=True)
    for k in ("payload_json","result_json"):
        if k in data: data[k]=dumps(data[k])
    j=await patch(req,"jobs",job_id,data); await audit(req,u["id"],"job.update","job",job_id,meta={"project_id":project_id}); return {"job":j}
@app.post("/projects/{project_id}/jobs/{job_id}/retry")
async def retry(project_id:str,job_id:str,req:Request,u=Depends(user)):
    await require_project(req,u,project_id,WRITE); j=await ensure_child(req,"jobs",job_id,project_id,"job"); await qrun(env(req,"DB"),"UPDATE jobs SET status='queued',attempts=attempts+1,updated_at=? WHERE id=?",[utcnow(),job_id]); sent=await send_queue(env(req,"JOB_QUEUE"),{"job_id":job_id,"project_id":project_id,"type":j["type"],"payload":loads(j["payload_json"])}); await audit(req,u["id"],"job.retry","job",job_id,meta={"queue_sent":sent}); return {"job_id":job_id,"queue_sent":sent}

@app.get("/projects/{project_id}/integrations")
async def integrations(project_id:str,req:Request,u=Depends(user)):
    await require_project(req,u,project_id); return {"integrations":[clean(r) for r in await qall(env(req,"DB"),"SELECT * FROM integrations WHERE project_id=? ORDER BY created_at DESC",[project_id])]}
@app.post("/projects/{project_id}/integrations")
async def add_integration(project_id:str,p:IntegrationIn,req:Request,u=Depends(user)):
    await require_project(req,u,project_id,ADMIN); i=await insert(req,"integrations",{"id":uid("int"),"project_id":project_id,**p.model_dump(exclude={"metadata_json"}),"metadata_json":dumps(p.metadata_json),"created_at":utcnow(),"updated_at":utcnow()}); await audit(req,u["id"],"integration.create","integration",i["id"],meta={"project_id":project_id}); return {"integration":i}
@app.patch("/projects/{project_id}/integrations/{integration_id}")
async def upd_integration(project_id:str,integration_id:str,p:IntegrationPatch,req:Request,u=Depends(user)):
    await require_project(req,u,project_id,ADMIN); await ensure_child(req,"integrations",integration_id,project_id,"integration"); data=p.model_dump(exclude_unset=True)
    if "metadata_json" in data: data["metadata_json"]=dumps(data["metadata_json"])
    i=await patch(req,"integrations",integration_id,data); await audit(req,u["id"],"integration.update","integration",integration_id,meta={"project_id":project_id}); return {"integration":i}
@app.delete("/projects/{project_id}/integrations/{integration_id}")
async def del_integration(project_id:str,integration_id:str,req:Request,u=Depends(user)):
    await require_project(req,u,project_id,ADMIN); await ensure_child(req,"integrations",integration_id,project_id,"integration"); d=await delete(req,"integrations",integration_id); await audit(req,u["id"],"integration.delete","integration",integration_id,meta={"project_id":project_id}); return {"deleted":d}

@app.get("/projects/{project_id}/activity")
async def get_activity(project_id:str,req:Request,u=Depends(user)):
    await require_project(req,u,project_id); return {"activity":[clean(r) for r in await qall(env(req,"DB"),"SELECT * FROM activity_logs WHERE project_id=? ORDER BY created_at DESC LIMIT 100",[project_id])]}
@app.post("/projects/{project_id}/activity")
async def add_activity(project_id:str,p:ActivityIn,req:Request,u=Depends(user)):
    await require_project(req,u,project_id,WRITE); aid=uid("act"); await qrun(env(req,"DB"),"INSERT INTO activity_logs (id,project_id,actor_user_id,event,detail,status,metadata_json,created_at) VALUES (?,?,?,?,?,?,?,?)",[aid,project_id,u["id"],p.event,p.detail,p.status,dumps(p.metadata_json),utcnow()]); await audit(req,u["id"],"activity.create","activity",aid,meta={"project_id":project_id}); return {"activity":clean(await qone(env(req,"DB"),"SELECT * FROM activity_logs WHERE id=?",[aid]))}
@app.get("/audit")
async def audits(req:Request, project_id:str|None=None, u=Depends(user)):
    if project_id: await require_project(req,u,project_id,AUDIT)
    return {"audit":[clean(r) for r in await qall(env(req,"DB"),"SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 200")]}

@app.get("/bootstrap")
async def bootstrap(req:Request,u=Depends(user)):
    ps=(await projects(req,u))["projects"]; os_=(await orgs(req,u))["organizations"]; selected=ps[0] if ps else None
    out={"current_user":u,"organizations":os_,"projects":ps,"selected_project":selected,"tool_counts":{},"service_counts":{},"open_alerts":[],"recent_activity":[],"capabilities":{"production_services":True,"marketing":True,"automations":True,"integrations":True,"audit":True,"queues_ready":env(req,"JOB_QUEUE") is not None},"backend_version":VERSION}
    if selected:
        pid=selected["id"]
        out["tool_counts"]={r["category"]:r["count"] for r in await qall(env(req,"DB"),"SELECT category, COUNT(*) count FROM project_tools WHERE project_id=? GROUP BY category",[pid])}
        out["service_counts"]={r["status"]:r["count"] for r in await qall(env(req,"DB"),"SELECT status, COUNT(*) count FROM production_services WHERE project_id=? GROUP BY status",[pid])}
        out["recent_activity"]=[clean(r) for r in await qall(env(req,"DB"),"SELECT * FROM activity_logs WHERE project_id=? ORDER BY created_at DESC LIMIT 10",[pid])]
        out["open_alerts"]=[{"kind":"job",**r} for r in await qall(env(req,"DB"),"SELECT id,type,error_message FROM jobs WHERE project_id=? AND status IN ('failed','blocked') ORDER BY updated_at DESC LIMIT 10",[pid])]
    return out

@app.post("/seed/initial-workspace")
async def seed(req:Request):
    secret=env(req,"SEED_SECRET"); supplied=req.headers.get("x-seed-secret")
    if not secret or supplied != secret: raise HTTPException(403, {"code":"forbidden","message":"Set SEED_SECRET and pass X-Seed-Secret"})
    db=env(req,"DB"); email=env(req,"SEED_OWNER_EMAIL","owner@gem-cybersecurity.example"); password=env(req,"SEED_OWNER_PASSWORD",secrets.token_urlsafe(18)); t=utcnow()
    u=await qone(db,"SELECT * FROM users WHERE email=?",[email])
    if not u:
        user_id=uid("usr"); await qrun(db,"INSERT INTO users (id,email,password_hash,name,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?)",[user_id,email,phash(password),"GEM Cybersecurity Owner","active",t,t]); u=await qone(db,"SELECT * FROM users WHERE id=?",[user_id])
    o=await qone(db,"SELECT * FROM organizations WHERE slug='gem-cybersecurity'")
    if not o:
        oid=uid("org"); await qrun(db,"INSERT INTO organizations (id,name,slug,plan,status,owner_user_id,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)",[oid,"GEM Cybersecurity","gem-cybersecurity","enterprise","active",u["id"],t,t]); await qrun(db,"INSERT INTO organization_members (id,org_id,user_id,role,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?)",[uid("omem"),oid,u["id"],"owner","active",t,t]); o=await qone(db,"SELECT * FROM organizations WHERE id=?",[oid])
    p=await qone(db,"SELECT * FROM projects WHERE slug='bentley-showcase'")
    if not p:
        pid=uid("prj"); await qrun(db,"INSERT INTO projects (id,org_id,name,slug,status,repo_url,production_url,runtime,owner_user_id,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)",[pid,o["id"],"Bentley Showcase","bentley-showcase","active","https://github.com/support371/Bentley-Showcase","https://bentley-showcase.vercel.app","cloudflare-workers-python-fastapi",u["id"],t,t]); await qrun(db,"INSERT INTO project_members (id,project_id,user_id,role,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?)",[uid("pmem"),pid,u["id"],"owner","active",t,t]); p=await qone(db,"SELECT * FROM projects WHERE id=?",[pid])
    for name,provider,statusv,url in [("Vercel Frontend","vercel","active","https://bentley-showcase.vercel.app"),("Cloudflare Worker API","cloudflare","provisioning",None),("Cloudflare D1","cloudflare","ready",None)]:
        if not await qone(db,"SELECT id FROM production_services WHERE project_id=? AND name=?",[p["id"],name]):
            await qrun(db,"INSERT INTO production_services (id,project_id,name,provider,environment,status,url,latest_commit,metadata_json,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)",[uid("svc"),p["id"],name,provider,"production",statusv,url,None,"{}",t,t])
    for name,cat,owner,desc in [("Deployment Control","production","GEM Ops","Vercel/Cloudflare promotion controls"),("Campaign Publisher","marketing","GEM Marketing","Multi-channel campaign publishing"),("Incident Automation","automation","GEM Ops","Alert handling and remediation automation"),("iTwin Assistant","ai","GEM AI","Bentley iTwin project intelligence"),("Analytics Overview","analytics","GEM Growth","Workspace analytics")]:
        if not await qone(db,"SELECT id FROM project_tools WHERE project_id=? AND name=?",[p["id"],name]):
            await qrun(db,"INSERT INTO project_tools (id,project_id,name,category,status,owner,connected_service,description,last_run_at,metadata_json,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",[uid("tool"),p["id"],name,cat,"active",owner,None,desc,None,"{}",t,t])
    for prov in ["github","vercel","cloudflare","telegram","whatsapp","bentley_itwin","slack","stripe","datadog"]:
        if not await qone(db,"SELECT id FROM integrations WHERE project_id=? AND provider=?",[p["id"],prov]):
            await qrun(db,"INSERT INTO integrations (id,project_id,provider,name,status,external_account_id,metadata_json,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)",[uid("int"),p["id"],prov,prov.replace("_"," ").title(),"configured",None,"{}",t,t])
    for name,trig in [("Nightly Health Sweep","cron.daily"),("Deployment Webhook Intake","webhook"),("Marketing Publish Queue","manual")]:
        if not await qone(db,"SELECT id FROM automations WHERE project_id=? AND name=?",[p["id"],name]):
            await qrun(db,"INSERT INTO automations (id,project_id,name,trigger_type,status,runs,last_run_at,config_json,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)",[uid("auto"),p["id"],name,trig,"active",0,None,"{}",t,t])
    await activity(req,p["id"],u["id"],"workspace.seeded","Initial GEM Cybersecurity workspace seeded"); await audit(req,u["id"],"seed.initial_workspace","project",p["id"])
    return {"ok":True,"owner_email":email,"owner_password_was_generated":env(req,"SEED_OWNER_PASSWORD") is None,"organization":clean(o),"project":clean(p)}
