from workers import WorkerEntrypoint
from fastapi import FastAPI, Request
from pydantic import BaseModel
import asgi

class Default(WorkerEntrypoint):
    async def fetch(self, request):
        return await asgi.fetch(app, request, self.env)

app = FastAPI(title="Bentley Webpage", version="0.1.0")

@app.get("/")
async def root():
    return {"message": "Bentley Webpage is running!", "status": "ok"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/env")
async def get_env(req: Request):
    env = req.scope["env"]
    return {"message": "Environment variables accessible via env binding"}

class Item(BaseModel):
    name: str
    description: str | None = None
    price: float
    tax: float | None = None

_items: dict[int, dict] = {}
_item_counter = 0

@app.post("/items/")
async def create_item(item: Item):
    global _item_counter
    _item_counter += 1
    _items[_item_counter] = {**item.model_dump(), "id": _item_counter}
    return _items[_item_counter]

@app.get("/items/{item_id}")
async def read_item(item_id: int):
    if item_id not in _items:
        return {"error": "Item not found"}
    return _items[item_id]

@app.get("/items/")
async def list_items():
    return list(_items.values())

@app.put("/items/{item_id}")
async def update_item(item_id: int, item: Item, q: str | None = None):
    if item_id not in _items:
        return {"error": "Item not found"}
    _items[item_id] = {**item.model_dump(), "id": item_id}
    if q:
        _items[item_id]["q"] = q
    return _items[item_id]

@app.delete("/items/{item_id}")
async def delete_item(item_id: int):
    if item_id not in _items:
        return {"error": "Item not found"}
    deleted = _items.pop(item_id)
    return {"deleted": deleted}
