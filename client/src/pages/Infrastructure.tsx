import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Server, Cloud, Database, HardDrive, Cpu, Shield, Settings } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const clusters = [
  { name: "US-East-1 (Primary)", status: "Healthy", nodes: 24, cpu: 65, mem: 72, provider: "Azure AKS" },
  { name: "EU-West-1 (Failover)", status: "Healthy", nodes: 12, cpu: 42, mem: 48, provider: "Azure AKS" },
  { name: "AP-South-1 (Edge)", status: "Warning", nodes: 8, cpu: 88, mem: 92, provider: "Azure AKS" },
];

export default function Infrastructure() {
  return (
    <div className="p-6 lg:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Badge variant="outline" className="mb-3 border-orange-500/30 text-orange-400 bg-orange-500/5">
            <Server className="w-3 h-3 mr-1" /> Control Plane
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight">Infrastructure</h1>
          <p className="text-muted-foreground mt-2 text-lg max-w-2xl">
            Monitor and manage physical and cloud resources powering the Bentley ecosystem.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="glass"><Shield className="w-4 h-4 mr-2" /> Security Scan</Button>
          <Button className="bg-orange-600 hover:bg-orange-700 text-white"><Settings className="w-4 h-4 mr-2" /> Provision Resource</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="glass-card">
          <CardHeader className="pb-2 flex flex-row justify-between items-center">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Compute</CardTitle>
            <Cpu className="w-4 h-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">2,048 <span className="text-xl text-muted-foreground font-medium">vCPUs</span></div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2 flex flex-row justify-between items-center">
            <CardTitle className="text-sm font-medium text-muted-foreground">Memory Allocated</CardTitle>
            <HardDrive className="w-4 h-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">16.4 <span className="text-xl text-muted-foreground font-medium">TB</span></div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2 flex flex-row justify-between items-center">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cloud Spend</CardTitle>
            <Cloud className="w-4 h-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$142.5k</div>
            <p className="text-xs text-muted-foreground mt-1">Est. this month</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2 flex flex-row justify-between items-center">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Nodes</CardTitle>
            <Server className="w-4 h-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">44</div>
            <p className="text-xs text-green-400 mt-1">All responsive</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Kubernetes Clusters</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {clusters.map((cluster, i) => (
            <Card key={i} className={`glass-card ${cluster.status === 'Warning' ? 'border-yellow-500/30 bg-yellow-500/5' : ''}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{cluster.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Cloud className="w-3.5 h-3.5" /> {cluster.provider}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className={cluster.status === 'Healthy' ? 'text-green-400 border-green-400/30' : 'text-yellow-400 border-yellow-400/30'}>
                    {cluster.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Active Nodes</span>
                  <span className="font-bold">{cluster.nodes}</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1"><Cpu className="w-3.5 h-3.5" /> CPU Usage</span>
                    <span className={cluster.cpu > 80 ? "text-yellow-400 font-medium" : ""}>{cluster.cpu}%</span>
                  </div>
                  <Progress value={cluster.cpu} className="h-1.5 bg-secondary" indicatorClassName={cluster.cpu > 80 ? "bg-yellow-500" : "bg-orange-500"} />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1"><HardDrive className="w-3.5 h-3.5" /> Memory</span>
                    <span className={cluster.mem > 80 ? "text-yellow-400 font-medium" : ""}>{cluster.mem}%</span>
                  </div>
                  <Progress value={cluster.mem} className="h-1.5 bg-secondary" indicatorClassName={cluster.mem > 80 ? "bg-yellow-500" : "bg-orange-500"} />
                </div>
              </CardContent>
              <CardFooter>
                 <Button variant="ghost" className="w-full bg-secondary/40">Manage Cluster</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}