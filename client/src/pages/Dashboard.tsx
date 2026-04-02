import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertTriangle, Server, Cloud, ShieldAlert, Zap, Box, CheckCircle2, MoreVertical, ArrowUpRight } from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const eventData = [
  { time: "00:00", events: 120, alerts: 2 },
  { time: "04:00", events: 300, alerts: 5 },
  { time: "08:00", events: 800, alerts: 12 },
  { time: "12:00", events: 1200, alerts: 8 },
  { time: "16:00", events: 900, alerts: 4 },
  { time: "20:00", events: 450, alerts: 1 },
  { time: "24:00", events: 200, alerts: 0 },
];

const usageData = [
  { name: "API", value: 85 },
  { name: "Storage", value: 65 },
  { name: "Compute", value: 45 },
  { name: "Network", value: 90 },
];

export default function Dashboard() {
  return (
    <div className="p-6 lg:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Badge variant="outline" className="mb-3 border-primary/30 text-primary bg-primary/5">
            <Zap className="w-3 h-3 mr-1 fill-primary" /> Enterprise Workspace
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight">Operations Overview</h1>
          <p className="text-muted-foreground mt-2 text-lg max-w-2xl">
            Live telemetry, system health, and processing metrics across all your connected iTwins and services.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right mr-2 hidden md:block">
            <p className="text-sm font-medium">System Status</p>
            <p className="text-xs text-muted-foreground">All services operational</p>
          </div>
          <div className="w-12 h-12 rounded-full glass flex items-center justify-center relative glow-success">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card group hover:border-primary/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active iTwins</CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Box className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">1,248</div>
            <div className="flex items-center mt-2 text-sm text-green-400 font-medium">
              <Activity className="w-4 h-4 mr-1" />
              <span>+12.5%</span>
              <span className="text-muted-foreground ml-2 font-normal">from last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card group hover:border-primary/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Processed Events</CardTitle>
            <div className="p-2 rounded-lg bg-secondary text-foreground group-hover:bg-foreground group-hover:text-background transition-colors">
              <Activity className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">3.2M</div>
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <span className="text-foreground font-medium mr-1">45k/hr</span> average throughput
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card group hover:border-destructive/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Alarms</CardTitle>
            <div className="p-2 rounded-lg bg-destructive/10 text-destructive group-hover:bg-destructive group-hover:text-destructive-foreground transition-colors">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">24</div>
            <div className="flex items-center mt-2 text-sm text-destructive font-medium">
              <ShieldAlert className="w-4 h-4 mr-1" />
              <span>3 Critical</span>
              <span className="text-muted-foreground ml-2 font-normal">require action</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card group hover:border-primary/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Infrastructure</CardTitle>
            <div className="p-2 rounded-lg bg-secondary text-foreground group-hover:bg-foreground group-hover:text-background transition-colors">
              <Server className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">99.99%</div>
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <Cloud className="w-4 h-4 mr-1" /> Azure AKS Cluster
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Event Processing Volume</CardTitle>
              <CardDescription>Real-time throughput metrics across all environments</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8">1H</Button>
              <Button variant="secondary" size="sm" className="h-8 bg-primary/20 text-primary hover:bg-primary/30">24H</Button>
              <Button variant="outline" size="sm" className="h-8">7D</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={eventData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="time" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
                    }}
                    itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 500 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="events" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorEvents)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 flex flex-col">
          <Card className="glass-card flex-1">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">System Resources</CardTitle>
              <CardDescription>Current utilization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {usageData.map((item) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-muted-foreground">{item.value}%</span>
                  </div>
                  <Progress value={item.value} className="h-2" 
                    indicatorClassName={item.value > 80 ? "bg-primary" : "bg-muted-foreground"} 
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Alerts</CardTitle>
              <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: "High Memory Usage", desc: "AKS Node Pool 2", time: "15m ago", type: "warning" },
                  { title: "API Rate Limit", desc: "Client 4A threshold", time: "3h ago", type: "destructive" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-3 rounded-lg bg-secondary/30 border border-white/5 hover:bg-secondary/50 transition-colors">
                    <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      item.type === 'destructive' ? 'bg-destructive/20 text-destructive' : 'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full text-primary hover:text-primary/80">
                View all alerts <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}