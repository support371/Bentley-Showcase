import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Workflow, Play, Settings2, Clock, CheckCircle2, AlertCircle, Plus, MoreHorizontal } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const workflows = [
  { id: "WF-001", name: "Daily DB Backup", status: "Active", lastRun: "2 hours ago", nextRun: "In 22 hours", successRate: 100 },
  { id: "WF-002", name: "iModel Sync Verification", status: "Active", lastRun: "15 mins ago", nextRun: "In 45 mins", successRate: 98.5 },
  { id: "WF-003", name: "Weekly Usage Report", status: "Paused", lastRun: "3 days ago", nextRun: "-", successRate: 100 },
  { id: "WF-004", name: "Stale Resource Cleanup", status: "Active", lastRun: "Yesterday", nextRun: "Tomorrow", successRate: 92.4 },
  { id: "WF-005", name: "User Onboarding Email", status: "Active", lastRun: "5 mins ago", nextRun: "Event-based", successRate: 99.9 },
  { id: "WF-006", name: "Failed Sync Retry Loop", status: "Error", lastRun: "1 hour ago", nextRun: "Stopped", successRate: 64.2 },
];

export default function AutomationEnv() {
  return (
    <div className="p-6 lg:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Badge variant="outline" className="mb-3 border-purple-500/30 text-purple-400 bg-purple-500/5">
            <Workflow className="w-3 h-3 mr-1" /> Automation Environment
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight">Workflows & Tasks</h1>
          <p className="text-muted-foreground mt-2 text-lg max-w-2xl">
            Build, monitor, and manage automated background jobs and recurring system tasks.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="glass"><Clock className="w-4 h-4 mr-2" /> Execution History</Button>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white"><Plus className="w-4 h-4 mr-2" /> Create Workflow</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="glass-panel border-l-4 border-l-purple-500">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Workflows</p>
              <p className="text-3xl font-bold mt-1">42</p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-full text-purple-400">
              <Workflow className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-panel border-l-4 border-l-green-500">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Executions Today</p>
              <p className="text-3xl font-bold mt-1">8,405</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-full text-green-400">
              <Play className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-panel border-l-4 border-l-yellow-500">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Failed Runs</p>
              <p className="text-3xl font-bold mt-1">14</p>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-full text-yellow-500">
              <AlertCircle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workflows.map((wf) => (
          <Card key={wf.id} className={`glass-card group hover:border-purple-500/30 transition-all ${wf.status === 'Error' ? 'border-destructive/30 bg-destructive/5' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <Badge variant="outline" className={`
                  ${wf.status === 'Active' ? 'text-green-400 border-green-400/20' : ''}
                  ${wf.status === 'Paused' ? 'text-muted-foreground border-muted-foreground/20' : ''}
                  ${wf.status === 'Error' ? 'text-destructive border-destructive/20' : ''}
                `}>
                  {wf.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5 animate-pulse" />}
                  {wf.status}
                </Badge>
                <Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="w-4 h-4" /></Button>
              </div>
              <CardTitle className="text-lg mt-3">{wf.name}</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Last Run</p>
                    <p className="font-medium flex items-center gap-1.5">
                      {wf.status === 'Error' ? <AlertCircle className="w-3.5 h-3.5 text-destructive" /> : <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />}
                      {wf.lastRun}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Next Run</p>
                    <p className="font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      {wf.nextRun}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Success Rate</span>
                    <span className={wf.successRate < 90 ? "text-destructive" : "text-foreground"}>{wf.successRate}%</span>
                  </div>
                  <Progress value={wf.successRate} className="h-1.5" indicatorClassName={wf.successRate < 90 ? "bg-destructive" : "bg-purple-500"} />
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 border-t border-white/5 mt-4">
              <div className="w-full flex gap-2 mt-4">
                <Button variant="secondary" className="flex-1 bg-secondary/50 hover:bg-secondary"><Settings2 className="w-4 h-4 mr-2" /> Edit</Button>
                <Button variant="outline" size="icon" className="glass shrink-0"><Play className="w-4 h-4" /></Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}