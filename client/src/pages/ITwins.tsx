import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Box, MapPin, Users, Settings2, Plus } from "lucide-react";

const itwins = [
  { id: "TWN-1", name: "London Crossrail", location: "London, UK", users: 142, status: "Active", storage: "1.2 TB" },
  { id: "TWN-2", name: "Sydney Water Plant", location: "Sydney, AU", users: 89, status: "Active", storage: "850 GB" },
  { id: "TWN-3", name: "JFK Terminal 4", location: "New York, US", users: 310, status: "Syncing", storage: "3.4 TB" },
  { id: "TWN-4", name: "Dubai Metro Expansion", location: "Sydney, AU", users: 45, status: "Offline", storage: "420 GB" },
];

export default function ITwins() {
  return (
    <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">iTwins Directory</h1>
          <p className="text-muted-foreground mt-1">Manage digital twins and federated models</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" /> New iTwin</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {itwins.map((itwin) => (
          <Card key={itwin.id} className="bg-card/50 backdrop-blur-sm border-muted/50 hover:border-primary/50 transition-colors group cursor-pointer">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Box className="w-5 h-5" />
                </div>
                <Badge variant="outline" className={
                  itwin.status === 'Active' ? 'border-green-500/30 text-green-500' :
                  itwin.status === 'Syncing' ? 'border-blue-500/30 text-blue-500' : 'border-muted-foreground/30 text-muted-foreground'
                }>
                  {itwin.status}
                </Badge>
              </div>
              <CardTitle className="text-xl mt-4">{itwin.name}</CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" /> {itwin.location}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{itwin.users} Members</span>
                </div>
                <div className="text-muted-foreground">
                  {itwin.storage}
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 pb-4">
              <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground">
                <Settings2 className="w-4 h-4 mr-2" /> Manage Configuration
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}