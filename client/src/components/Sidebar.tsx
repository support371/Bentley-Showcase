import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Activity, 
  Box, 
  Database, 
  Link as LinkIcon, 
  Settings, 
  Smartphone, 
  Bell, 
  MonitorPlay, 
  FileText, 
  Menu,
  Code2,
  Megaphone,
  Workflow,
  Globe,
  Server,
  Store,
  Truck,
  Rocket,
  BookOpen
} from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

const environments = [
  { title: "Operations Core", href: "/", icon: <LayoutDashboard className="w-4 h-4" /> },
  { title: "Development", href: "/env/development", icon: <Code2 className="w-4 h-4" /> },
  { title: "Marketing", href: "/env/marketing", icon: <Megaphone className="w-4 h-4" /> },
  { title: "Automation", href: "/env/automation", icon: <Workflow className="w-4 h-4" /> },
];

const operationsItems: NavItem[] = [
  { title: "Events Stream", href: "/events", icon: <Activity className="w-4 h-4" /> },
  { title: "iTwins Directory", href: "/itwins", icon: <Box className="w-4 h-4" /> },
  { title: "iModels Explorer", href: "/imodels", icon: <Database className="w-4 h-4" /> },
  { title: "Integrations Hub", href: "/integrations", icon: <LinkIcon className="w-4 h-4" /> },
];

const mobileOpsItems: NavItem[] = [
  { title: "Active Alarms", href: "/mobile/alarms", icon: <Bell className="w-4 h-4" /> },
  { title: "Live Monitors", href: "/mobile/monitors", icon: <MonitorPlay className="w-4 h-4" /> },
  { title: "Field Reports", href: "/mobile/reports", icon: <FileText className="w-4 h-4" /> },
];

const controlPlaneItems: NavItem[] = [
  { title: "Website Studio", href: "/cp/website", icon: <Globe className="w-4 h-4" /> },
  { title: "Infrastructure", href: "/cp/infra", icon: <Server className="w-4 h-4" /> },
  { title: "Marketplace & News", href: "/cp/marketplace", icon: <Store className="w-4 h-4" /> },
  { title: "Client Delivery", href: "/cp/delivery", icon: <Truck className="w-4 h-4" /> },
  { title: "Service Catalog", href: "/cp/catalog", icon: <BookOpen className="w-4 h-4" /> },
  { title: "Launch Readiness", href: "/cp/launch", icon: <Rocket className="w-4 h-4" /> },
  { title: "Platform Settings", href: "/admin", icon: <Settings className="w-4 h-4" /> },
];

export function Sidebar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const NavLink = ({ item, depth = 0 }: { item: NavItem, depth?: number }) => {
    const isActive = location === item.href;
    return (
      <Link href={item.href}>
        <a
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            depth > 0 && "ml-4",
            isActive
              ? "bg-primary/10 text-primary glow-primary/10"
              : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
          )}
          onClick={() => setIsOpen(false)}
        >
          <span className={cn("transition-colors", isActive ? "text-primary" : "text-muted-foreground")}>
            {item.icon}
          </span>
          {item.title}
        </a>
      </Link>
    );
  };

  const NavContent = () => (
    <div className="h-full flex flex-col glass border-r-0">
      <div className="flex items-center gap-3 p-6">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
          <span className="text-primary-foreground font-bold text-xl tracking-tighter">B</span>
        </div>
        <div>
          <h2 className="font-bold text-lg tracking-tight leading-none">Bentley</h2>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">Platform</p>
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 pb-6">
        <div className="space-y-6">
          
          <div>
            <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3 px-3">
              Environments
            </h4>
            <div className="space-y-1">
              {environments.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </div>
          </div>

          <Accordion type="multiple" defaultValue={["operations", "mobile", "control-plane"]} className="w-full space-y-4">
            <AccordionItem value="operations" className="border-none">
              <AccordionTrigger className="py-2 px-3 hover:no-underline rounded-lg hover:bg-secondary/30 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Operations Features
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-0">
                <div className="space-y-1">
                  {operationsItems.map((item) => (
                    <NavLink key={item.href} item={item} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="mobile" className="border-none">
              <AccordionTrigger className="py-2 px-3 hover:no-underline rounded-lg hover:bg-secondary/30 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-3.5 h-3.5" />
                  Mobile Ops
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-0">
                <div className="space-y-1">
                  {mobileOpsItems.map((item) => (
                    <NavLink key={item.href} item={item} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="control-plane" className="border-none">
              <AccordionTrigger className="py-2 px-3 hover:no-underline rounded-lg hover:bg-secondary/30 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Control Plane
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-0">
                <div className="space-y-1">
                  {controlPlaneItems.map((item) => (
                    <NavLink key={item.href} item={item} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t border-white/5 bg-background/30 backdrop-blur-md">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
            AD
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">Admin User</p>
            <p className="text-xs text-green-400 truncate">Platform Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden absolute top-4 left-4 z-50 glass">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 border-r-0 bg-transparent">
          <NavContent />
        </SheetContent>
      </Sheet>

      <div className="hidden lg:block w-72 h-screen sticky top-0 z-40 border-r border-white/5 relative">
        <NavContent />
      </div>
    </>
  );
}