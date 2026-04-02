import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, LayoutTemplate, Palette, Settings2, ExternalLink, RefreshCw, Layers, Box, Check } from "lucide-react";

export default function WebsiteStudio() {
  return (
    <div className="p-6 lg:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Badge variant="outline" className="mb-3 border-teal-500/30 text-teal-400 bg-teal-500/5">
            <Globe className="w-3 h-3 mr-1" /> Control Plane
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight">Website Studio</h1>
          <p className="text-muted-foreground mt-2 text-lg max-w-2xl">
            Manage the public-facing Bentley platform website, documentation, and landing pages.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="glass"><RefreshCw className="w-4 h-4 mr-2" /> Sync Content</Button>
          <Button className="bg-teal-600 hover:bg-teal-700 text-white"><ExternalLink className="w-4 h-4 mr-2" /> Open Editor</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 glass-card">
          <CardHeader>
             <CardTitle>Active Properties</CardTitle>
             <CardDescription>Managed sites and domains</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             {[
               { name: "Bentley Main Site", url: "bentley.com", status: "Published", visitors: "1.2M / mo", type: "Marketing" },
               { name: "Developer Docs", url: "docs.bentley.com", status: "Published", visitors: "450K / mo", type: "Documentation" },
               { name: "Partner Portal", url: "partners.bentley.com", status: "Draft", visitors: "-", type: "Portal" },
             ].map((site, i) => (
               <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-secondary/20 hover:bg-secondary/40 transition-colors group">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
                     <Globe className="w-6 h-6" />
                   </div>
                   <div>
                     <h3 className="font-semibold text-base flex items-center gap-2">
                       {site.name}
                       <Badge variant="outline" className={site.status === 'Published' ? 'text-green-400 border-green-400/30' : 'text-yellow-400 border-yellow-400/30'}>
                         {site.status}
                       </Badge>
                     </h3>
                     <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                       <a href="#" className="hover:text-teal-400 transition-colors flex items-center gap-1">{site.url} <ExternalLink className="w-3 h-3" /></a>
                       <span>•</span>
                       <span>{site.type}</span>
                     </p>
                   </div>
                 </div>
                 <div className="text-right hidden sm:block">
                   <p className="text-sm font-medium">{site.visitors}</p>
                   <p className="text-xs text-muted-foreground">Traffic</p>
                 </div>
               </div>
             ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Design System</CardTitle>
              <CardDescription>Global brand configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary" />
                <div className="w-10 h-10 rounded-full bg-secondary" />
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="w-10 h-10 rounded-full bg-teal-500" />
                <Button variant="ghost" size="icon" className="rounded-full"><Settings2 className="w-4 h-4" /></Button>
              </div>
              <div className="space-y-2 text-sm pt-4 border-t border-white/5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Primary Font</span>
                  <span className="font-mono">Inter</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Display Font</span>
                  <span className="font-mono">JetBrains Mono</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Border Radius</span>
                  <span className="font-mono">12px (lg)</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full bg-secondary/50"><Palette className="w-4 h-4 mr-2" /> Theme Editor</Button>
            </CardFooter>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Components</CardTitle>
              <CardDescription>Library sync status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-teal-400" />
                  <span className="font-medium">shadcn/ui</span>
                </div>
                <Badge variant="outline" className="text-green-400 border-green-400/30 shadow-none"><Check className="w-3 h-3 mr-1" /> Synced</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-3">42 components available in Web Studio</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}