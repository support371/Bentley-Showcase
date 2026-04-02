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
  MoreHorizontal,
  Menu,
  ChevronRight
} from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

const mainNavItems: NavItem[] = [
  { title: "Dashboard", href: "/", icon: <LayoutDashboard className="w-4 h-4" /> },
  { title: "Events", href: "/events", icon: <Activity className="w-4 h-4" /> },
  { title: "iTwins", href: "/itwins", icon: <Box className="w-4 h-4" /> },
  { title: "iModels", href: "/imodels", icon: <Database className="w-4 h-4" /> },
  { title: "Integrations", href: "/integrations", icon: <LinkIcon className="w-4 h-4" /> },
  { title: "Admin", href: "/admin", icon: <Settings className="w-4 h-4" /> },
];

const mobileOpsItems: NavItem[] = [
  { title: "Alarms", href: "/mobile/alarms", icon: <Bell className="w-4 h-4" /> },
  { title: "Monitors", href: "/mobile/monitors", icon: <MonitorPlay className="w-4 h-4" /> },
  { title: "Reports", href: "/mobile/reports", icon: <FileText className="w-4 h-4" /> },
  { title: "Mobile Admin", href: "/mobile/admin", icon: <Settings className="w-4 h-4" /> },
  { title: "Mobile Integrations", href: "/mobile/integrations", icon: <LinkIcon className="w-4 h-4" /> },
];

const controlPlaneItems: NavItem[] = [
  { title: "Website Studio", href: "/cp/website", icon: <LayoutDashboard className="w-4 h-4" /> },
  { title: "Infrastructure", href: "/cp/infra", icon: <Database className="w-4 h-4" /> },
  { title: "Marketplace & News", href: "/cp/marketplace", icon: <Box className="w-4 h-4" /> },
  { title: "Client Delivery", href: "/cp/delivery", icon: <Activity className="w-4 h-4" /> },
  { title: "Operations", href: "/cp/ops", icon: <Settings className="w-4 h-4" /> },
];

export function Sidebar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const NavContent = () => (
    <ScrollArea className="h-full py-6 pr-6 pl-4 lg:pl-6">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-xl">B</span>
        </div>
        <span className="font-bold text-lg tracking-tight">Operations</span>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
            Core Platform
          </h4>
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    location === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon}
                  {item.title}
                </a>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 px-2 mb-3">
            <Smartphone className="w-4 h-4 text-muted-foreground" />
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Mobile Ops
            </h4>
          </div>
          <div className="space-y-1">
            {mobileOpsItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    location === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon}
                  {item.title}
                </a>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
            Control Plane
          </h4>
          <div className="space-y-1">
            {controlPlaneItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    location === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon}
                  {item.title}
                </a>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  );

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden absolute top-4 left-4 z-50">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 border-r-0">
          <NavContent />
        </SheetContent>
      </Sheet>

      <div className="hidden lg:block w-64 border-r bg-card/50 backdrop-blur-xl h-screen sticky top-0">
        <NavContent />
      </div>
    </>
  );
}