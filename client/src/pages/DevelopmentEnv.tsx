import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Code2, GitPullRequest, GitMerge, CheckCircle2, PlayCircle, GitCommit, Search, RefreshCw, Terminal, ActivitySquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const deployments = [
  { id: "DEP-901", service: "api-gateway", env: "production", status: "Success", time: "10 mins ago", author: "j.smith", branch: "main", commit: "a1b2c3d" },
  { id: "DEP-902", service: "auth-service", env: "staging", status: "Deploying", time: "Just now", author: "m.johnson", branch: "feature/oauth", commit: "e4f5g6h" },
  { id: "DEP-903", service: "events-processor", env: "production", status: "Success", time: "2 hours ago", author: "system", branch: "main", commit: "i7j8k9l" },
  { id: "DEP-904", service: "mobile-api", env: "development", status: "Failed", time: "4 hours ago", author: "a.davis", branch: "fix/alarms", commit: "m1n2o3p" },
  { id: "DEP-905", service: "web-client", env: "production", status: "Success", time: "1 day ago", author: "j.smith", branch: "main", commit: "q4r5s6t" },
];

export default function DevelopmentEnv() {
  return (
    <div className="p-6 lg:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Badge variant="outline" className="mb-3 border-blue-500/30 text-blue-400 bg-blue-500/5">
            <Code2 className="w-3 h-3 mr-1" /> Development Environment
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight">Engineering Hub</h1>
          <p className="text-muted-foreground mt-2 text-lg max-w-2xl">
            Manage deployments, service health, and code integrations across the Bentley ecosystem.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="glass"><Terminal className="w-4 h-4 mr-2" /> Open Console</Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white"><PlayCircle className="w-4 h-4 mr-2" /> Trigger Pipeline</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active PRs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24</div>
            <p className="text-xs text-blue-400 mt-1 flex items-center">
              <GitPullRequest className="w-3 h-3 mr-1" /> 8 need review
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card border-blue-500/20 bg-blue-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-400">Deployments Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400">18</div>
            <p className="text-xs text-muted-foreground mt-1">Across all environments</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Build Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">94.2%</div>
            <Progress value={94.2} className="h-1.5 mt-2" indicatorClassName="bg-green-500" />
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">API Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">42</div>
            <p className="text-xs text-green-400 mt-1 flex items-center">
              <ActivitySquare className="w-3 h-3 mr-1" /> All healthy
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-white/10">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/5 bg-secondary/10">
          <div className="flex flex-col space-y-1.5">
            <CardTitle className="text-xl">Recent Deployments</CardTitle>
            <CardDescription>CI/CD pipeline execution history</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search deployments..." className="pl-10 glass bg-background/50 h-10 w-[250px]" />
            </div>
            <Button variant="outline" size="icon" className="glass h-10 w-10"><RefreshCw className="w-4 h-4" /></Button>
          </div>
        </CardHeader>
        <div className="p-0">
          <Table>
            <TableHeader className="bg-secondary/5">
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead className="w-[120px] pl-6 font-semibold">Deploy ID</TableHead>
                <TableHead className="font-semibold">Service</TableHead>
                <TableHead className="font-semibold">Environment</TableHead>
                <TableHead className="font-semibold">Commit</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right pr-6 font-semibold">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deployments.map((dep) => (
                <TableRow key={dep.id} className="cursor-pointer border-white/5 hover:bg-secondary/30 transition-colors">
                  <TableCell className="pl-6 font-mono text-xs text-muted-foreground">{dep.id}</TableCell>
                  <TableCell>
                    <div className="font-medium">{dep.service}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">by {dep.author}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`
                      ${dep.env === 'production' ? 'border-primary/30 text-primary' : ''}
                      ${dep.env === 'staging' ? 'border-yellow-500/30 text-yellow-500' : ''}
                      ${dep.env === 'development' ? 'border-blue-500/30 text-blue-400' : ''}
                      uppercase text-[10px] tracking-wider bg-transparent
                    `}>
                      {dep.env}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <GitCommit className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="font-mono text-xs">{dep.commit}</span>
                      <span className="text-xs text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded">{dep.branch}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                     <div className="flex items-center gap-2">
                      {dep.status === 'Success' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                      {dep.status === 'Deploying' && <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />}
                      {dep.status === 'Failed' && <div className="w-2 h-2 rounded-full bg-destructive" />}
                      <span className={`text-sm ${dep.status === 'Failed' ? 'text-destructive' : ''}`}>{dep.status}</span>
                     </div>
                  </TableCell>
                  <TableCell className="text-right pr-6 text-muted-foreground text-sm">{dep.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}