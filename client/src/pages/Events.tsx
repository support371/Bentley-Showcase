import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Download, Activity, AlertTriangle, Info, Clock } from "lucide-react";

const events = [
  { id: "EVT-8932", type: "imodel.updated", source: "Project Alpha", status: "Processed", time: "2 mins ago", severity: "info" },
  { id: "EVT-8931", type: "webhook.delivery", source: "SAP Integration", status: "Failed", time: "15 mins ago", severity: "error" },
  { id: "EVT-8930", type: "user.login", source: "Auth Service", status: "Processed", time: "1 hour ago", severity: "info" },
  { id: "EVT-8929", type: "alarm.triggered", source: "Node Pool 2", status: "Processed", time: "2 hours ago", severity: "warning" },
  { id: "EVT-8928", type: "imodel.created", source: "Project Beta", status: "Processed", time: "4 hours ago", severity: "info" },
  { id: "EVT-8927", type: "api.rate_limit", source: "Client 4A", status: "Warning", time: "5 hours ago", severity: "warning" },
  { id: "EVT-8926", type: "auth.token_expired", source: "Mobile Ops App", status: "Processed", time: "6 hours ago", severity: "info" },
  { id: "EVT-8925", type: "sync.conflict", source: "JFK Terminal 4", status: "Failed", time: "8 hours ago", severity: "error" },
];

export default function Events() {
  return (
    <div className="p-6 lg:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Events Stream</h1>
          <p className="text-muted-foreground mt-2 text-lg max-w-2xl">
            Live processing log, historical events, and audit trails across the platform.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="glass"><Download className="w-4 h-4 mr-2" /> Export Logs</Button>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground"><Activity className="w-4 h-4 mr-2" /> Live View</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
         <Card className="glass-panel border-l-4 border-l-primary">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Processing Rate</p>
                <p className="text-3xl font-bold">12.4k <span className="text-lg text-muted-foreground font-normal">/sec</span></p>
              </div>
              <Activity className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
         </Card>
         <Card className="glass-panel border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Warnings (24h)</p>
                <p className="text-3xl font-bold">482</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
         </Card>
         <Card className="glass-panel border-l-4 border-l-destructive">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Errors (24h)</p>
                <p className="text-3xl font-bold">14</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
                <span className="text-destructive font-bold">!</span>
              </div>
            </div>
          </CardContent>
         </Card>
      </div>

      <Card className="glass-card overflow-hidden border-white/10 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/5 bg-secondary/10">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search events by ID, type, or source..." className="pl-10 glass bg-background/50 h-10 border-white/10 focus-visible:ring-primary/50" />
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <span className="text-muted-foreground">Viewing 50 of 3.2M</span>
            <div className="h-4 w-px bg-white/10 mx-2" />
            <span className="flex items-center gap-2 text-green-400">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              Streaming
            </span>
          </div>
        </CardHeader>
        <div className="p-0">
          <Table>
            <TableHeader className="bg-secondary/5">
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead className="w-[120px] pl-6 font-semibold">Event ID</TableHead>
                <TableHead className="font-semibold">Type & Source</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right pr-6 font-semibold">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id} className="cursor-pointer border-white/5 hover:bg-secondary/30 transition-colors group">
                  <TableCell className="pl-6">
                    <span className="font-mono text-xs text-muted-foreground group-hover:text-foreground transition-colors">{event.id}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {event.severity === 'error' && <AlertTriangle className="w-4 h-4 text-destructive" />}
                      {event.severity === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                      {event.severity === 'info' && <Info className="w-4 h-4 text-blue-400" />}
                      <div>
                        <div className="font-medium">{event.type}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{event.source}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`
                      ${event.status === 'Processed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}
                      ${event.status === 'Warning' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : ''}
                      ${event.status === 'Failed' ? 'bg-destructive/10 text-destructive border-destructive/20' : ''}
                      shadow-none backdrop-blur-sm
                    `}>
                      {event.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                     <div className="flex items-center justify-end gap-1.5 text-muted-foreground text-sm">
                       <Clock className="w-3.5 h-3.5" />
                       {event.time}
                     </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}