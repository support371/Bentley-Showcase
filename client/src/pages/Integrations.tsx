import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Link2, Webhook, Zap, ArrowRight, Settings2, ShieldCheck, ActivitySquare, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

const integrations = [
  { id: "INT-1", name: "SAP ERP", category: "Enterprise", desc: "Sync asset management and procurement data bilaterally.", status: true, health: 98, type: "Webhook", icon: Link2 },
  { id: "INT-2", name: "ServiceNow", category: "ITSM", desc: "Work order generation and automated status tracking.", status: true, health: 100, type: "API", icon: Zap },
  { id: "INT-3", name: "Microsoft Teams", category: "Communications", desc: "Alert routing and incident response channels.", status: false, health: 0, type: "OAuth", icon: Webhook },
  { id: "INT-4", name: "Azure Event Grid", category: "Infrastructure", desc: "Data lake synchronization and real-time analytics streaming.", status: true, health: 99.9, type: "Streaming", icon: Zap },
  { id: "INT-5", name: "Slack", category: "Communications", desc: "Team notifications for critical system alarms and events.", status: false, health: 0, type: "OAuth", icon: Webhook },
  { id: "INT-6", name: "Esri ArcGIS", category: "Geospatial", desc: "Geospatial context mapping and 3D location integration.", status: true, health: 95, type: "API", icon: Link2 },
];

export default function Integrations() {
  return (
    <div className="p-6 lg:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Integrations Hub</h1>
          <p className="text-muted-foreground mt-2 text-lg max-w-2xl">
            Manage connections, configure webhooks, and monitor API health across external systems.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="glass">Manage API Keys</Button>
          <Button><Plus className="w-4 h-4 mr-2" /> Add Integration</Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-secondary/50 p-1 rounded-xl mb-6">
          <TabsTrigger value="all" className="rounded-lg px-6">All Services</TabsTrigger>
          <TabsTrigger value="enterprise" className="rounded-lg px-6">Enterprise</TabsTrigger>
          <TabsTrigger value="communications" className="rounded-lg px-6">Communications</TabsTrigger>
          <TabsTrigger value="infrastructure" className="rounded-lg px-6">Infrastructure</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((int) => (
              <Card key={int.id} className="glass-card group hover:border-primary/40 transition-all duration-300 relative overflow-hidden">
                {int.status && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-indigo-500/50" />
                )}
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-foreground transition-all duration-500 shadow-inner ${int.status ? 'bg-primary/20 text-primary shadow-primary/20' : 'bg-secondary/80 text-muted-foreground'}`}>
                        <int.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <Badge variant="outline" className="mb-1 text-[10px] uppercase tracking-wider bg-background/50 backdrop-blur-sm">
                          {int.category}
                        </Badge>
                      </div>
                    </div>
                    <Switch checked={int.status} className={int.status ? "data-[state=checked]:bg-primary" : ""} />
                  </div>
                  <CardTitle className="text-xl mt-4">{int.name}</CardTitle>
                  <CardDescription className="mt-2 text-sm leading-relaxed min-h-[40px]">
                    {int.desc}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-mono text-xs bg-secondary/80">
                        {int.type}
                      </Badge>
                    </div>
                    {int.status ? (
                      <span className="text-xs text-green-400 font-medium flex items-center">
                        <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Active
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground font-medium flex items-center">
                        Inactive
                      </span>
                    )}
                  </div>

                  {int.status && (
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <ActivitySquare className="w-3.5 h-3.5" /> API Health
                        </span>
                        <span className="font-medium">{int.health}%</span>
                      </div>
                      <Progress value={int.health} className="h-1.5" indicatorClassName={int.health > 95 ? 'bg-green-500' : 'bg-yellow-500'} />
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-2 pb-5">
                  <Button variant={int.status ? "default" : "outline"} className={`w-full justify-between group ${int.status ? 'bg-secondary/50 hover:bg-secondary text-foreground' : 'glass'}`}>
                    <span className="flex items-center gap-2">
                      <Settings2 className="w-4 h-4" /> Configuration
                    </span>
                    <ArrowRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        {/* Other tabs would filter the list, keeping simple for mockup */}
      </Tabs>
    </div>
  );
}