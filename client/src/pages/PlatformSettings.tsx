import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Shield, Users, Key, Bell, CreditCard, Lock, Save } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PlatformSettings() {
  return (
    <div className="p-6 lg:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Badge variant="outline" className="mb-3 border-muted-foreground/30 text-muted-foreground bg-muted/50">
            <Settings className="w-3 h-3 mr-1" /> Administration
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight">Platform Settings</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Configure global preferences, security policies, and access controls.
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground"><Save className="w-4 h-4 mr-2" /> Save Changes</Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-secondary/50 p-1 rounded-xl mb-8 flex overflow-x-auto">
          <TabsTrigger value="general" className="rounded-lg px-6"><Settings className="w-4 h-4 mr-2" /> General</TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg px-6"><Shield className="w-4 h-4 mr-2" /> Security</TabsTrigger>
          <TabsTrigger value="team" className="rounded-lg px-6"><Users className="w-4 h-4 mr-2" /> Team</TabsTrigger>
          <TabsTrigger value="billing" className="rounded-lg px-6"><CreditCard className="w-4 h-4 mr-2" /> Billing</TabsTrigger>
          <TabsTrigger value="api" className="rounded-lg px-6"><Key className="w-4 h-4 mr-2" /> API Keys</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-0 space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Organization Profile</CardTitle>
              <CardDescription>Update your enterprise identity and global contact info.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input id="org-name" defaultValue="Bentley Systems" className="glass bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-slug">URL Slug</Label>
                  <Input id="org-slug" defaultValue="bentley-corp" className="glass bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input id="support-email" defaultValue="support@bentley.com" className="glass bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Default Timezone</Label>
                  <Input id="timezone" defaultValue="UTC (GMT+0)" className="glass bg-background/50" disabled />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Platform Preferences</CardTitle>
              <CardDescription>Configure default behaviors for all users.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/20 border border-white/5">
                <div className="space-y-0.5">
                  <Label className="text-base">Require SSO (SAML)</Label>
                  <p className="text-sm text-muted-foreground">Force all users to authenticate via corporate identity provider.</p>
                </div>
                <Switch checked={true} />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/20 border border-white/5">
                <div className="space-y-0.5">
                  <Label className="text-base">Beta Features</Label>
                  <p className="text-sm text-muted-foreground">Allow users to opt-in to experimental platform capabilities.</p>
                </div>
                <Switch checked={false} />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/20 border border-white/5">
                <div className="space-y-0.5">
                  <Label className="text-base">Strict Data Locality</Label>
                  <p className="text-sm text-muted-foreground">Prevent iModel synchronization across different geographic regions.</p>
                </div>
                <Switch checked={true} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Placeholders for other tabs to show completeness of UI */}
        <TabsContent value="security" className="mt-0">
          <Card className="glass-card flex flex-col items-center justify-center p-12 text-center h-[400px]">
            <Lock className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <CardTitle className="text-2xl mb-2">Security & Access Control</CardTitle>
            <CardDescription className="max-w-md text-base">Configure Role-Based Access Control (RBAC), password policies, and audit log retention rules.</CardDescription>
            <Button className="mt-6"><Shield className="w-4 h-4 mr-2" /> Configure Policies</Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}