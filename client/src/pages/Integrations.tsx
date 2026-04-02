import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Link2, Webhook, Zap, ArrowRight } from "lucide-react";

const integrations = [
  { id: "INT-1", name: "SAP ERP", desc: "Sync asset management and procurement data", status: true, type: "Webhook", icon: Link2 },
  { id: "INT-2", name: "ServiceNow", desc: "Work order generation and status tracking", status: true, type: "API", icon: Zap },
  { id: "INT-3", name: "Microsoft Teams", desc: "Alert routing and incident response channels", status: false, type: "OAuth", icon: Webhook },
  { id: "INT-4", name: "Azure Event Grid", desc: "Data lake synchronization and analytics", status: true, type: "Streaming", icon: Zap },
  { id: "INT-5", name: "Slack", desc: "Team notifications for critical system alarms", status: false, type: "OAuth", icon: Webhook },
  { id: "INT-6", name: "Esri ArcGIS", desc: "Geospatial context mapping integration", status: true, type: "API", icon: Link2 },
];

export default function Integrations() {
  return (
    <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrations Hub</h1>
          <p className="text-muted-foreground mt-1">Connect Bentley Operations to external services</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((int) => (
          <Card key={int.id} className="bg-card/50 backdrop-blur-sm border-muted/50 hover:border-primary/30 transition-colors">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-foreground transition-colors ${int.status ? 'bg-primary/10 text-primary' : 'bg-secondary'}`}>
                  <int.icon className="w-6 h-6" />
                </div>
                <Switch checked={int.status} />
              </div>
              <CardTitle className="text-xl mt-4">{int.name}</CardTitle>
              <CardDescription className="mt-1 line-clamp-2 h-10">
                {int.desc}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="shadow-none bg-secondary/50">
                  {int.type}
                </Badge>
                {int.status ? (
                  <span className="text-xs text-green-500 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5" /> Connected
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground flex items-center">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground mr-1.5" /> Disconnected
                  </span>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="outline" className="w-full justify-between group">
                Configure
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}