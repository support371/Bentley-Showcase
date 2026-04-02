import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Download } from "lucide-react";

const events = [
  { id: "EVT-8932", type: "imodel.updated", source: "Project Alpha", status: "Processed", time: "2 mins ago" },
  { id: "EVT-8931", type: "webhook.delivery", source: "SAP Integration", status: "Failed", time: "15 mins ago" },
  { id: "EVT-8930", type: "user.login", source: "Auth Service", status: "Processed", time: "1 hour ago" },
  { id: "EVT-8929", type: "alarm.triggered", source: "Node Pool 2", status: "Processed", time: "2 hours ago" },
  { id: "EVT-8928", type: "imodel.created", source: "Project Beta", status: "Processed", time: "4 hours ago" },
  { id: "EVT-8927", type: "api.rate_limit", source: "Client 4A", status: "Warning", time: "5 hours ago" },
];

export default function Events() {
  return (
    <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events Stream</h1>
          <p className="text-muted-foreground mt-1">Live processing log and historical events</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Export</Button>
          <Button><Filter className="w-4 h-4 mr-2" /> Views</Button>
        </div>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-muted/50">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search events by ID, type, or source..." className="pl-9 bg-background/50" />
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Showing 6 of 3.2M</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[100px] pl-6">ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-mono text-xs pl-6">{event.id}</TableCell>
                  <TableCell className="font-medium">{event.type}</TableCell>
                  <TableCell>{event.source}</TableCell>
                  <TableCell>
                    <Badge variant={
                      event.status === 'Processed' ? 'default' : 
                      event.status === 'Warning' ? 'secondary' : 'destructive'
                    } className={
                      event.status === 'Processed' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20 shadow-none' : 
                      event.status === 'Warning' ? 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 shadow-none' : 'shadow-none'
                    }>
                      {event.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground pr-6">{event.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}