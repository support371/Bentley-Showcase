import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Download, Plus, MapPin, Database, HardDrive, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const itwins = [
  { id: "TWN-1", name: "London Crossrail", location: "London, UK", users: 142, status: "Active", storage: "1.2 TB", lastSync: "2m ago" },
  { id: "TWN-2", name: "Sydney Water Plant", location: "Sydney, AU", users: 89, status: "Active", storage: "850 GB", lastSync: "15m ago" },
  { id: "TWN-3", name: "JFK Terminal 4", location: "New York, US", users: 310, status: "Syncing", storage: "3.4 TB", lastSync: "In Progress" },
  { id: "TWN-4", name: "Dubai Metro", location: "Dubai, UAE", users: 45, status: "Offline", storage: "420 GB", lastSync: "2 days ago" },
];

export default function ITwins() {
  return (
    <div className="p-6 lg:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">iTwins Directory</h1>
          <p className="text-muted-foreground mt-2 text-lg max-w-2xl">
            Manage your digital twins, federated models, and access permissions across all infrastructure projects.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="glass"><Download className="w-4 h-4 mr-2" /> Export List</Button>
          <Button><Plus className="w-4 h-4 mr-2" /> New iTwin</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total iTwins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">148</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Syncs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">12</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Storage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">42.5 TB</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3,842</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="grid" className="w-full">
        <div className="flex justify-between items-center mb-6">
          <TabsList className="bg-secondary/50 p-1 rounded-xl">
            <TabsTrigger value="grid" className="rounded-lg px-4">Grid View</TabsTrigger>
            <TabsTrigger value="list" className="rounded-lg px-4">List View</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-4 max-w-sm flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search projects..." className="pl-9 glass border-white/10 bg-background/50 h-10" />
            </div>
            <Button variant="outline" size="icon" className="glass h-10 w-10 shrink-0"><Filter className="w-4 h-4" /></Button>
          </div>
        </div>

        <TabsContent value="grid" className="mt-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {itwins.map((itwin) => (
            <Card key={itwin.id} className="glass-card group hover:border-primary/40 transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className={`
                    ${itwin.status === 'Active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}
                    ${itwin.status === 'Syncing' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : ''}
                    ${itwin.status === 'Offline' ? 'bg-muted/50 text-muted-foreground' : ''}
                  `}>
                    {itwin.status === 'Syncing' && <RefreshCw className="w-3 h-3 mr-1 animate-spin" />}
                    {itwin.status}
                  </Badge>
                  <span className="text-xs font-mono text-muted-foreground">{itwin.id}</span>
                </div>
                <CardTitle className="text-xl mt-4 line-clamp-1">{itwin.name}</CardTitle>
                <CardDescription className="flex items-center gap-1.5 mt-2">
                  <MapPin className="w-3.5 h-3.5" /> {itwin.location}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Storage</span>
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      <HardDrive className="w-4 h-4 text-muted-foreground" /> {itwin.storage}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Last Sync</span>
                    <div className="text-sm font-medium">
                      {itwin.lastSync}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button variant="ghost" className="w-full bg-secondary/30 hover:bg-primary hover:text-primary-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                  Open Workspace
                </Button>
              </CardFooter>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="list" className="mt-0">
           <Card className="glass-card overflow-hidden">
             <Table>
                <TableHeader className="bg-secondary/20">
                  <TableRow className="hover:bg-transparent border-white/5">
                    <TableHead className="pl-6 font-semibold">Project Name</TableHead>
                    <TableHead className="font-semibold">Location</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Storage</TableHead>
                    <TableHead className="font-semibold">Users</TableHead>
                    <TableHead className="text-right pr-6 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                   {itwins.map((itwin) => (
                    <TableRow key={itwin.id} className="border-white/5 hover:bg-secondary/30 cursor-pointer transition-colors">
                      <TableCell className="pl-6 font-medium">{itwin.name}</TableCell>
                      <TableCell className="text-muted-foreground">{itwin.location}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`
                          ${itwin.status === 'Active' ? 'text-green-500 border-green-500/20' : ''}
                          ${itwin.status === 'Syncing' ? 'text-blue-500 border-blue-500/20' : ''}
                        `}>
                          {itwin.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{itwin.storage}</TableCell>
                      <TableCell>{itwin.users}</TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="ghost" size="sm">Manage</Button>
                      </TableCell>
                    </TableRow>
                   ))}
                </TableBody>
             </Table>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}