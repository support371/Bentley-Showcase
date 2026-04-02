import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Sidebar } from "@/components/Sidebar";
import Dashboard from "@/pages/Dashboard";
import Events from "@/pages/Events";
import ITwins from "@/pages/ITwins";
import IModels from "@/pages/IModels";
import Integrations from "@/pages/Integrations";

// New Pages
import DevelopmentEnv from "@/pages/DevelopmentEnv";
import MarketingEnv from "@/pages/MarketingEnv";
import AutomationEnv from "@/pages/AutomationEnv";
import MobileAlarms from "@/pages/MobileAlarms";
import WebsiteStudio from "@/pages/WebsiteStudio";
import Infrastructure from "@/pages/Infrastructure";
import PlatformSettings from "@/pages/PlatformSettings";

const ControlPlanePlaceholder = ({ name }: { name: string }) => (
  <div className="p-8 h-full flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
    <h1 className="text-3xl font-bold tracking-tight mb-2">Control Plane: {name}</h1>
    <p className="text-muted-foreground">Administrative configurations and settings</p>
  </div>
);

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/events" component={Events} />
      <Route path="/itwins" component={ITwins} />
      <Route path="/imodels" component={IModels} />
      <Route path="/integrations" component={Integrations} />
      
      <Route path="/env/development" component={DevelopmentEnv} />
      <Route path="/env/marketing" component={MarketingEnv} />
      <Route path="/env/automation" component={AutomationEnv} />

      <Route path="/cp/website" component={WebsiteStudio} />
      <Route path="/cp/infra" component={Infrastructure} />
      
      <Route path="/cp/:section">
        {(params) => <ControlPlanePlaceholder name={params.section || 'Section'} />}
      </Route>

      <Route path="/mobile/alarms" component={MobileAlarms} />
      <Route path="/mobile/:section">
        {(params) => <ControlPlanePlaceholder name={`Mobile ${params.section}`} />}
      </Route>
      
      <Route path="/admin" component={PlatformSettings} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex min-h-screen bg-[#0a0c10] text-foreground selection:bg-primary/30">
          <div className="fixed inset-0 z-[-1] pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
          <Sidebar />
          <main className="flex-1 overflow-y-auto relative">
            <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none z-[-1]" />
            <Router />
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;