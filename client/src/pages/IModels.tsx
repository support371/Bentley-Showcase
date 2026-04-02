import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Database, HardDrive, RefreshCw } from "lucide-react";

const imodels = [
  { id: "MOD-101", name: "Architectural Root", itwin: "London Crossrail", size: "4.2 GB", lastSync: "10 mins ago", version: "v42" },
  { id: "MOD-102", name: "Structural MEP", itwin: "London Crossrail", size: "8.1 GB", lastSync: "1 hour ago", version: "v89" },
  { id: "MOD-103", name: "HVAC Systems", itwin: "JFK Terminal 4", size: "2.1 GB", lastSync: "5 mins ago", version: "v12" },
  { id: "MOD-104", name: "Site Context", itwin: "Sydney Water Plant", size: "1.5 GB", lastSync: "1 day ago", version: "v5" },
];

export default function IModels() {
  return (
    <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">iModels Explorer</h1>
          <p className="text-muted-foreground mt-1">Repository of structural data and models</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Storage</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full text-primary">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold">14.8 TB</div>
              <p className="text-xs text-muted-foreground">Across all iModels</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur-sm border-muted/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Models</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <div className="p-3 bg-secondary rounded-full text-foreground">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold">8,234</div>
              <p className="text-xs text-muted-foreground">Indexed in DB</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-muted/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sync Rate</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <div className="p-3 bg-secondary rounded-full text-foreground">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold">45 / min</div>
              <p className="text-xs text-muted-foreground">Changesets processed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-muted/50">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search models by name or iTwin..." className="pl-9 bg-background/50" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[100px] pl-6">ID</TableHead>
                <TableHead>Model Name</TableHead>
                <TableHead>Parent iTwin</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="text-right pr-6">Last Sync</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {imodels.map((model) => (
                <TableRow key={model.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-mono text-xs pl-6">{model.id}</TableCell>
                  <TableCell className="font-medium flex items-center gap-2">
                    <Database className="w-4 h-4 text-muted-foreground" />
                    {model.name}
                  </TableCell>
                  <TableCell>{model.itwin}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono text-xs shadow-none">
                      {model.version}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{model.size}</TableCell>
                  <TableCell className="text-right text-muted-foreground pr-6">{model.lastSync}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}