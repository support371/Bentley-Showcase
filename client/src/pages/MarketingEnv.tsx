import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Megaphone, TrendingUp, Users, Target, MousePointerClick, BarChart3, ArrowUpRight, Zap } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar } from "recharts";
import { Progress } from "@/components/ui/progress";

const trafficData = [
  { day: "Mon", visitors: 12000, conversions: 400 },
  { day: "Tue", visitors: 15000, conversions: 550 },
  { day: "Wed", visitors: 18000, conversions: 800 },
  { day: "Thu", visitors: 14000, conversions: 450 },
  { day: "Fri", visitors: 16000, conversions: 600 },
  { day: "Sat", visitors: 9000, conversions: 200 },
  { day: "Sun", visitors: 11000, conversions: 350 },
];

export default function MarketingEnv() {
  return (
    <div className="p-6 lg:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Badge variant="outline" className="mb-3 border-pink-500/30 text-pink-400 bg-pink-500/5">
            <Megaphone className="w-3 h-3 mr-1" /> Marketing Environment
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight">Growth & Acquisition</h1>
          <p className="text-muted-foreground mt-2 text-lg max-w-2xl">
            Monitor platform adoption, campaign performance, and enterprise lead generation.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="glass"><BarChart3 className="w-4 h-4 mr-2" /> Generate Report</Button>
          <Button className="bg-pink-600 hover:bg-pink-700 text-white"><Zap className="w-4 h-4 mr-2" /> New Campaign</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Visitors</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">95.0K</div>
            <div className="flex items-center mt-2 text-sm text-green-400 font-medium">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+18.2%</span>
              <span className="text-muted-foreground ml-2 font-normal">vs last week</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">MQLs Generated</CardTitle>
            <Target className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">3,350</div>
            <div className="flex items-center mt-2 text-sm text-green-400 font-medium">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+5.4%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-pink-500/20 bg-pink-500/5">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-pink-400">Conversion Rate</CardTitle>
            <MousePointerClick className="w-4 h-4 text-pink-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-pink-400">3.5%</div>
            <Progress value={35} className="h-1.5 mt-2 bg-pink-500/20" indicatorClassName="bg-pink-500" />
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Campaigns</CardTitle>
            <Megaphone className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">12</div>
            <div className="mt-2 text-sm text-muted-foreground">
              Across 4 regions
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 glass-card">
          <CardHeader>
            <CardTitle>Traffic & Conversions</CardTitle>
            <CardDescription>Daily performance over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="day" 
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
                  />
                  <Tooltip 
                    cursor={{fill: 'hsl(var(--secondary)/0.5)'}}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '12px',
                    }}
                  />
                  <Bar dataKey="visitors" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="conversions" fill="hsl(340 75% 60%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card flex flex-col">
          <CardHeader>
             <CardTitle>Top Campaigns</CardTitle>
             <CardDescription>By lead volume</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-6">
             {[
               { name: "Enterprise Q3 Webinar", leads: 845, cost: "$12k", trend: "+12%" },
               { name: "LinkedIn Retargeting", leads: 620, cost: "$8k", trend: "+5%" },
               { name: "Partner Summit 2026", leads: 430, cost: "$25k", trend: "-2%" },
               { name: "Search Ads - EU", leads: 315, cost: "$4k", trend: "+8%" },
             ].map((camp, i) => (
               <div key={i} className="flex items-center justify-between">
                 <div className="space-y-1">
                   <p className="text-sm font-medium leading-none">{camp.name}</p>
                   <p className="text-xs text-muted-foreground">Spend: {camp.cost}</p>
                 </div>
                 <div className="text-right">
                   <p className="text-sm font-bold">{camp.leads}</p>
                   <p className={`text-xs ${camp.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{camp.trend}</p>
                 </div>
               </div>
             ))}
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full text-pink-400 hover:text-pink-300">View All Campaigns <ArrowUpRight className="w-4 h-4 ml-1" /></Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}