import { PageTransition } from '@/components/shared/PageTransition';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { User, Bell, Moon, Globe, Mail, Smartphone, MessageSquare, Hash } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="language" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Language & Region
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile
                  </CardTitle>
                  <CardDescription>
                    Update your profile information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input defaultValue="Ashley B." />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" defaultValue="ashley@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input type="tel" defaultValue="+1 234 567 8900" />
                  </div>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input defaultValue="Psychologist" />
                  </div>
                  <Button>Save Changes</Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notifications
                  </CardTitle>
                  <CardDescription>
                    Manage your notification preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <div className="flex items-start gap-3 pr-20">
                      <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="space-y-0.5 flex-1">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via email
                        </p>
                      </div>
                    </div>
                    <div className="absolute top-0 right-0">
                      <Switch defaultChecked />
                    </div>
                  </div>
                  <Separator />
                  <div className="relative">
                    <div className="flex items-start gap-3 pr-20">
                      <Smartphone className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="space-y-0.5 flex-1">
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive push notifications
                        </p>
                      </div>
                    </div>
                    <div className="absolute top-0 right-0">
                      <Switch defaultChecked />
                    </div>
                  </div>
                  <Separator />
                  <div className="relative">
                    <div className="flex items-start gap-3 pr-20">
                      {/* Telegram Icon */}
                      <svg className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.12l-6.87 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                      </svg>
                      <div className="space-y-0.5 flex-1">
                        <Label>Telegram Bot</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via Telegram bot
                        </p>
                      </div>
                    </div>
                    <div className="absolute top-0 right-0">
                      <Switch />
                    </div>
                  </div>
                  <Separator />
                  <div className="relative">
                    <div className="flex items-start gap-3 pr-20">
                      {/* Slack Icon */}
                      <Hash className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="space-y-0.5 flex-1">
                        <Label>Slack</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications in Slack
                        </p>
                      </div>
                    </div>
                    <div className="absolute top-0 right-0">
                      <Switch />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Moon className="h-5 w-5" />
                    Appearance
                  </CardTitle>
                  <CardDescription>
                    Customize the appearance of the application
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable dark mode theme
                      </p>
                    </div>
                    <Switch checked={isDark} onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Language & Region Tab */}
          <TabsContent value="language" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Language & Region
                  </CardTitle>
                  <CardDescription>
                    Set your language and region preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ru">Russian</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select defaultValue="utc">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utc">UTC</SelectItem>
                        <SelectItem value="est">EST</SelectItem>
                        <SelectItem value="pst">PST</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}
