import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Database, HardDrive, RefreshCw, Layers, GitBranch, ArrowUpRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

const imodels = [
  { id: "MOD-101", name: "Architectural Root", itwin: "London Crossrail", size: "4.2 GB", lastSync: "10 mins ago", version: "v42", elements: "1.2M", health: 98 },
  { id: "MOD-102", name: "Structural MEP", itwin: "London Crossrail", size: "8.1 GB", lastSync: "1 hour ago", version: "v89", elements: "3.4M", health: 100 },
  { id: "MOD-103", name: "HVAC Systems", itwin: "JFK Terminal 4", size: "2.1 GB", lastSync: "5 mins ago", version: "v12", elements: "840K", health: 92 },
  { id: "MOD-104", name: "Site Context", itwin: "Sydney Water Plant", size: "1.5 GB", lastSync: "1 day ago", version: "v5", elements: "420K", health: 99 },
  { id: "MOD-105", name: "Electrical Grids", itwin: "Dubai Metro", size: "3.2 GB", lastSync: "2 days ago", version: "v18", elements: "2.1M", health: 85 },
];

export default function IModels() {
  return (
    <div className="p-6 lg:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">iModels Explorer</h1>
          <p className="text-muted-foreground mt-2 text-lg max-w-2xl">
            Repository of structural data, versions, and physical elements indexed across your digital twins.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="glass"><GitBranch className="w-4 h-4 mr-2" /> Compare Versions</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="glass-card relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <HardDrive className="w-24 h-24 text-primary" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground relative z-10">Total DB Indexed</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold tracking-tight">14.8 <span className="text-2xl text-muted-foreground font-medium">TB</span></div>
            <p className="text-sm text-green-400 mt-2 font-medium">+2.4 TB this month</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Layers className="w-24 h-24 text-primary" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground relative z-10">Total Elements</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold tracking-tight">482 <span className="text-2xl text-muted-foreground font-medium">Million</span></div>
            <p className="text-sm text-muted-foreground mt-2">Across 8,234 models</p>
          </CardContent>
        </Card>

        <Card className="glass-card relative overflow-hidden group border-primary/30 bg-primary/5">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <RefreshCw className="w-24 h-24 text-primary" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary relative z-10">Changeset Velocity</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold tracking-tight text-primary">45 <span className="text-2xl opacity-70 font-medium">/ min</span></div>
            <p className="text-sm text-primary/70 mt-2 font-medium">Peak processing rate</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card overflow-hidden border-white/10">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5 bg-secondary/10">
          <Tabs defaultValue="all" className="w-[400px]">
            <TabsList className="grid w-full grid-cols-3 bg-background/50 glass">
              <TabsTrigger value="all">All Models</TabsTrigger>
              <TabsTrigger value="syncing">Syncing (12)</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex-1 max-w-sm relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Find by name, ID, or iTwin..." className="pl-10 glass bg-background/50 h-10" />
          </div>
        </CardHeader>
        <div className="p-0">
          <Table>
            <TableHeader className="bg-secondary/5">
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead className="w-[100px] pl-6 font-semibold">Model ID</TableHead>
                <TableHead className="font-semibold">Details</TableHead>
                <TableHead className="font-semibold">Parent iTwin</TableHead>
                <TableHead className="font-semibold">Health</TableHead>
                <TableHead className="font-semibold">Size / Elements</TableHead>
                <TableHead className="text-right pr-6 font-semibold">Last Sync</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {imodels.map((model) => (
                <TableRow key={model.id} className="cursor-pointer border-white/5 hover:bg-secondary/30 transition-colors group">
                  <TableCell className="pl-6">
                    <span className="font-mono text-xs text-muted-foreground group-hover:text-primary transition-colors">{model.id}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                        <Database className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {model.name}
                          <Badge variant="secondary" className="font-mono text-[10px] h-5 bg-secondary/80">
                            {model.version}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{model.itwin}</TableCell>
                  <TableCell>
                    <div className="w-24 space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-muted-foreground">Index Status</span>
                        <span className="font-medium text-green-400">{model.health}%</span>
                      </div>
                      <Progress value={model.health} className="h-1.5" indicatorClassName={model.health > 95 ? "bg-green-500" : "bg-yellow-500"} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{model.size}</div>
                    <div className="text-xs text-muted-foreground">{model.elements} elements</div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                     <div className="flex items-center justify-end gap-3 text-muted-foreground text-sm group-hover:text-foreground transition-colors">
                       {model.lastSync}
                       <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"><ArrowUpRight className="w-4 h-4" /></Button>
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