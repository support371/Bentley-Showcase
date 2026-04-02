import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, MapPin, AlertTriangle, ShieldAlert, CheckCircle2, Clock, ArrowRight, User } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const alarms = [
  { id: "ALM-8092", title: "HVAC Pressure Drop", location: "JFK Terminal 4 - Sector B", severity: "Critical", time: "10 mins ago", assigned: "Unassigned" },
  { id: "ALM-8091", title: "Generator Offline", location: "Sydney Water Plant - Gen 2", severity: "Critical", time: "45 mins ago", assigned: "m.johnson" },
  { id: "ALM-8090", title: "Access Door Ajar", location: "London Crossrail - Stn 4", severity: "Warning", time: "2 hours ago", assigned: "System" },
  { id: "ALM-8089", title: "Temp Variance", location: "Dubai Metro - Line Red", severity: "Warning", time: "4 hours ago", assigned: "a.davis" },
  { id: "ALM-8088", title: "Routine Maint Overdue", location: "JFK Terminal 4 - HVAC", severity: "Info", time: "1 day ago", assigned: "Unassigned" },
];

export default function MobileAlarms() {
  return (
    <div className="min-h-full bg-background flex flex-col max-w-md mx-auto border-x border-white/5 relative">
      {/* Mobile Header Simulation */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2 rounded-full lg:hidden">
             {/* Back button or menu for real mobile */}
             <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
             <div className="w-1.5 h-1.5 rounded-full bg-foreground mx-0.5" />
             <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
          </Button>
          <h1 className="font-semibold text-lg flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" /> Active Alarms
          </h1>
        </div>
        <Badge variant="destructive" className="font-mono text-xs shadow-none">2 Critical</Badge>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto pb-24">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-secondary/50 p-1 rounded-xl mb-4">
            <TabsTrigger value="active" className="rounded-lg">Active</TabsTrigger>
            <TabsTrigger value="resolved" className="rounded-lg">Resolved</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-3">
          {alarms.map((alarm) => (
            <Card key={alarm.id} className={`glass-card overflow-hidden transition-all active:scale-[0.98] ${alarm.severity === 'Critical' ? 'border-destructive/30 bg-destructive/5' : ''}`}>
              {alarm.severity === 'Critical' && (
                <div className="h-1 w-full bg-destructive" />
              )}
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className={`
                    text-[10px] uppercase tracking-wider shadow-none border-transparent px-1.5 py-0
                    ${alarm.severity === 'Critical' ? 'bg-destructive/10 text-destructive' : ''}
                    ${alarm.severity === 'Warning' ? 'bg-yellow-500/10 text-yellow-500' : ''}
                    ${alarm.severity === 'Info' ? 'bg-blue-500/10 text-blue-400' : ''}
                  `}>
                    {alarm.severity === 'Critical' && <ShieldAlert className="w-3 h-3 mr-1" />}
                    {alarm.severity === 'Warning' && <AlertTriangle className="w-3 h-3 mr-1" />}
                    {alarm.severity}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {alarm.time}
                  </span>
                </div>
                
                <h3 className="font-semibold text-base mb-1">{alarm.title}</h3>
                
                <div className="text-sm text-muted-foreground flex items-center gap-1.5 mb-3 line-clamp-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0" /> {alarm.location}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-xs">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${alarm.assigned === 'Unassigned' ? 'bg-secondary text-muted-foreground' : 'bg-primary/20 text-primary'}`}>
                      <User className="w-3 h-3" />
                    </div>
                    <span className={alarm.assigned === 'Unassigned' ? 'text-muted-foreground italic' : 'font-medium'}>
                      {alarm.assigned}
                    </span>
                  </div>
                  
                  <Button size="sm" variant={alarm.severity === 'Critical' ? "destructive" : "secondary"} className="h-7 text-xs px-3">
                    Acknowledge
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Mobile Bottom Nav Simulation */}
      <div className="fixed bottom-0 left-0 right-0 lg:absolute lg:bottom-0 bg-background/90 backdrop-blur-xl border-t border-white/5 p-3 flex justify-around items-center max-w-md mx-auto pb-safe">
        <div className="flex flex-col items-center text-primary gap-1">
          <Bell className="w-5 h-5" />
          <span className="text-[10px] font-medium">Alarms</span>
        </div>
        <div className="flex flex-col items-center text-muted-foreground hover:text-foreground transition-colors gap-1">
          <MapPin className="w-5 h-5" />
          <span className="text-[10px] font-medium">Map</span>
        </div>
        <div className="flex flex-col items-center text-muted-foreground hover:text-foreground transition-colors gap-1">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-[10px] font-medium">Tasks</span>
        </div>
      </div>
    </div>
  );
}