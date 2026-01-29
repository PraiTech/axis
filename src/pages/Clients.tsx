import { useState, useMemo, useEffect } from 'react';
import { PageTransition } from '@/components/shared/PageTransition';
import { clients, sessions, payments, type Client, type Session } from '@/data/mockData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Edit, ArrowLeft, Clock, UserPlus, MoreVertical, Trash2, ExternalLink, Rss, Calendar as CalendarIcon, CreditCard, Filter, X, User, Users as UsersIcon, AlertCircle } from 'lucide-react';
import { format, isToday, parseISO, differenceInMinutes } from 'date-fns';
import { motion } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import logger from '@/lib/logger';

function generateClientId(list: Client[]) {
  const ids = list.map(c => parseInt(c.id, 10)).filter(n => !isNaN(n));
  return String((ids.length ? Math.max(...ids) : 0) + 1);
}

// Client Card Component with Neumorphic Avatar
interface ClientCardProps {
  client: Client;
  index: number;
  onSelect: () => void;
  onRemove: (e: React.MouseEvent) => void;
}

// Приглушенные цвета для аватарок
const getAvatarColor = (index: number) => {
  const colors = [
    { bg: 'bg-slate-100', icon: 'text-slate-600' },
    { bg: 'bg-indigo-50', icon: 'text-indigo-500' },
    { bg: 'bg-cyan-50', icon: 'text-cyan-500' },
    { bg: 'bg-purple-50', icon: 'text-purple-500' },
    { bg: 'bg-pink-50', icon: 'text-pink-500' },
    { bg: 'bg-amber-50', icon: 'text-amber-500' },
    { bg: 'bg-emerald-50', icon: 'text-emerald-500' },
  ];
  return colors[index % colors.length];
};

function ClientCard({ client, index, onSelect, onRemove }: ClientCardProps) {
  const avatarColor = getAvatarColor(index);

  return (
    <motion.div
      layout={false}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
      className="group relative"
    >
      <div
        className="client-card relative rounded-2xl p-6 cursor-pointer overflow-hidden"
        onClick={onSelect}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="relative">
            <div
              className={`client-card-avatar h-14 w-14 rounded-2xl flex items-center justify-center ${avatarColor.bg}`}
            >
              <User className={`h-6 w-6 ${avatarColor.icon}`} />
            </div>
            {/* Status Indicator */}
            {client.status === 'active' && (
              <span className="absolute -bottom-1 -right-1 h-4 w-4 bg-white rounded-full flex items-center justify-center">
                <span className="h-2.5 w-2.5 bg-emerald-400 rounded-full"></span>
              </span>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="text-slate-300 hover:text-slate-500 transition-colors p-1 rounded"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={onSelect}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(e);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Main Info */}
        <div className="mb-6">
          <h3 className="text-slate-800 text-lg font-semibold transition-colors group-hover:text-slate-900">
            {client.name}
          </h3>
          <p className="text-slate-400 text-sm font-light mt-1">{client.email}</p>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-4"></div>

        {/* Stats Row */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Sessions</span>
            <div className="flex items-center gap-1 mt-0.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-slate-700 font-medium">{client.sessions}</span>
            </div>
          </div>
          
          <div className="h-8 w-px bg-slate-100"></div> {/* Vertical Divider */}

          <div className="flex flex-col text-right">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Total</span>
            <span className="text-slate-800 font-bold text-lg tracking-tight">
              ${client.totalIncome.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Clients() {
  const [clientsList, setClientsList] = useState<Client[]>(() => [...clients]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [mainTab, setMainTab] = useState<'clients' | 'schedule'>('clients');
  const [activeTab, setActiveTab] = useState<'client' | 'feed' | 'sessions' | 'payments'>('client');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [addClientForm, setAddClientForm] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });
  const [infoDialog, setInfoDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
  }>({ open: false, title: '', message: '' });

  useEffect(() => {
    logger.componentMount('Clients');
    logger.dataFetch('Clients', 'mockData', {
      clientsCount: clientsList.length,
      sessionsCount: sessions.length
    });
  }, [clientsList.length]);

  useEffect(() => {
    if (searchQuery) {
      logger.userAction('Clients', 'Searching clients', { query: searchQuery });
    }
  }, [searchQuery]);

  useEffect(() => {
    if (selectedClient) {
      const c = clientsList.find(x => x.id === selectedClient);
      logger.userAction('Clients', 'Selecting client', {
        clientId: selectedClient,
        clientName: c?.name
      });
    }
  }, [selectedClient, clientsList]);

  const showInfo = (title: string, message: string) => {
    setInfoDialog({ open: true, title, message });
  };

  const handleAddClient = () => {
    const { name, email, phone, notes } = addClientForm;
    if (!name.trim() || !email.trim()) return;
    const id = generateClientId(clientsList);
    const avatar = name.trim().charAt(0).toUpperCase();
    const newClient: Client = {
      id,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || '+1 000 000 0000',
      avatar,
      totalIncome: 0,
      status: 'active',
      sessions: 0,
      lastMeeting: new Date().toISOString(),
      communicationChannels: [],
      notes: notes.trim() || '',
    };
    setClientsList(prev => [...prev, newClient]);
    setAddClientForm({ name: '', email: '', phone: '', notes: '' });
    setAddClientOpen(false);
    logger.userAction('Clients', 'Client added', { clientId: id, name: newClient.name });
  };

  const handleRemoveClient = (e: React.MouseEvent, clientId: string) => {
    e.stopPropagation();
    setClientsList(prev => prev.filter(c => c.id !== clientId));
    if (selectedClient === clientId) setSelectedClient(null);
    logger.userAction('Clients', 'Client removed', { clientId });
  };

  const filteredClients = useMemo(() => {
    if (!searchQuery) return clientsList;
    const query = searchQuery.toLowerCase();
    return clientsList.filter(client =>
      client.name.toLowerCase().includes(query) ||
      client.email.toLowerCase().includes(query)
    );
  }, [searchQuery, clientsList]);


  const client = useMemo(() => 
    selectedClient ? clientsList.find(c => c.id === selectedClient) : null,
    [selectedClient, clientsList]
  );

  const clientIndex = useMemo(() => 
    selectedClient ? clientsList.findIndex(c => c.id === selectedClient) : -1,
    [selectedClient, clientsList]
  );

  const clientSessions = useMemo(() => 
    selectedClient ? sessions.filter(s => s.clientId === selectedClient) : [],
    [selectedClient]
  );

  const clientPayments = useMemo(() => 
    selectedClient ? payments.filter(p => p.clientId === selectedClient) : [],
    [selectedClient]
  );

  const handleAddSession = () => {
    logger.userAction('Clients', 'Adding session', {
      clientId: selectedClient
    });
    alert('Add Session functionality - to be implemented');
  };

  const handleUploadPhoto = () => {
    logger.userAction('Clients', 'Uploading photo', {
      clientId: selectedClient
    });
    showInfo('Upload Photo', 'Upload photo functionality will be available soon.');
  };

  const handleAddChannel = () => {
    logger.userAction('Clients', 'Adding communication channel', {
      clientId: selectedClient
    });
    showInfo('Add Channel', 'Adding new communication channels will be available soon.');
  };

  const handleRemoveChannel = (index: number) => {
    logger.userAction('Clients', 'Removing communication channel', {
      clientId: selectedClient,
      channelIndex: index
    });
    showInfo('Remove Channel', 'Removing individual channels will be available soon.');
  };

  // Schedule logic
  const todaySessions = useMemo(() => {
    return sessions
      .filter(s => isToday(parseISO(s.date)))
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
  }, []);

  const otherSessions = useMemo(() => {
    return sessions
      .filter(s => !isToday(parseISO(s.date)))
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
  }, []);

  const getUrgencyLevel = (sessionDate: string): { level: 'urgent' | 'soon' | 'normal'; minutes: number; label: string } => {
    const now = new Date();
    const sessionTime = parseISO(sessionDate);
    const minutesUntil = differenceInMinutes(sessionTime, now);
    
    if (minutesUntil < 30) {
      return { level: 'urgent', minutes: minutesUntil, label: `${minutesUntil} min` };
    } else if (minutesUntil < 120) {
      return { level: 'soon', minutes: minutesUntil, label: `${Math.floor(minutesUntil / 60)} h ${minutesUntil % 60} min` };
    } else {
      return { level: 'normal', minutes: minutesUntil, label: `${Math.floor(minutesUntil / 60)} h` };
    }
  };

  const groupedSessionsByClient = useMemo(() => {
    const grouped = new Map<string, Session[]>();
    sessions.forEach(session => {
      if (!grouped.has(session.clientId)) {
        grouped.set(session.clientId, []);
      }
      grouped.get(session.clientId)!.push(session);
    });
    
    // Sort sessions within each client group
    grouped.forEach((clientSessions, clientId) => {
      clientSessions.sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
    });
    
    return Array.from(grouped.entries()).map(([clientId, clientSessions]) => {
      const client = clients.find(c => c.id === clientId);
      return {
        clientId,
        clientName: client?.name || 'Unknown',
        sessions: clientSessions
      };
    }).sort((a, b) => a.clientName.localeCompare(b.clientName));
  }, []);

  if (selectedClient && client) {
    return (
      <PageTransition>
        <div className="space-y-6">
          {/* Back Button */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedClient(null)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* Tabs Section - Top Center */}
          <div className="w-full">
            <Tabs 
              value={activeTab} 
              onValueChange={(value) => setActiveTab(value as 'client' | 'feed' | 'sessions' | 'payments')}
              className="w-full"
            >
              <div className="flex flex-col items-center gap-4">
                <TabsList className="h-auto p-1.5 bg-slate-100/50 border border-slate-200 rounded-xl w-full max-w-2xl justify-center">
                  <TabsTrigger 
                    value="client" 
                    className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm rounded-lg px-5 py-3 gap-2 font-medium transition-all flex-1"
                  >
                    <User className="h-4 w-4" />
                    <span>Client</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="feed" 
                    className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm rounded-lg px-5 py-3 gap-2 font-medium transition-all flex-1"
                  >
                    <Rss className="h-4 w-4" />
                    <span>My Feed</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="sessions"
                    className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm rounded-lg px-5 py-3 gap-2 font-medium transition-all flex-1"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    <span>Sessions</span>
                    <Badge variant="secondary" className="ml-1.5 h-5 min-w-5 px-1.5 text-xs">
                      {clientSessions.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="payments"
                    className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm rounded-lg px-5 py-3 gap-2 font-medium transition-all flex-1"
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Payments</span>
                    {clientPayments.length > 0 && (
                      <Badge variant="secondary" className="ml-1.5 h-5 min-w-5 px-1.5 text-xs">
                        {clientPayments.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
                
                {activeTab === 'sessions' && (
                  <div className="w-full max-w-4xl flex justify-end">
                    <Button onClick={handleAddSession} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Session
                    </Button>
                  </div>
                )}
              </div>

              {/* Client Tab Content - First tab with all client information */}
              <TabsContent value="client" className="mt-6">
                <div className="max-w-4xl mx-auto">
                  <Card className="border-0 shadow-md">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center space-y-4">
                        {(() => {
                          const avatarColor = clientIndex >= 0 ? getAvatarColor(clientIndex) : { bg: 'bg-slate-50', icon: 'text-slate-600' };
                          return (
                            <div 
                              className={`h-24 w-24 rounded-full flex items-center justify-center transition-all duration-300 ease-out ${avatarColor.bg}`}
                              style={{
                                boxShadow: `
                                  inset 5px 5px 10px rgba(0, 0, 0, 0.2),
                                  inset -4px -4px 8px rgba(255, 255, 255, 1),
                                  inset 2px 2px 5px rgba(0, 0, 0, 0.12)
                                `
                              }}
                            >
                              <User className={`h-12 w-12 ${avatarColor.icon}`} />
                            </div>
                          );
                        })()}
                        <div className="text-center">
                          <h3 className="text-xl font-semibold flex items-center justify-center gap-2">
                            {client.name}
                            <Edit className="h-4 w-4" />
                          </h3>
                          <Button variant="outline" className="mt-2" onClick={handleUploadPhoto}>
                            Upload Photo
                          </Button>
                        </div>
                      </div>

                      <div className="mt-6 space-y-4">
                        <div>
                          <Label>Total Income</Label>
                          <p className="text-2xl font-bold">$ {client.totalIncome.toLocaleString()}</p>
                        </div>

                        <div className="flex items-center justify-between">
                          <Label>In Active Work</Label>
                          <Switch checked={client.status === 'active'} />
                        </div>

                        <div>
                          <Label className="mb-2 block">Communication Channels</Label>
                          <div className="space-y-2">
                            {client.communicationChannels.map((channel, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <Select defaultValue={channel.type}>
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Telegram">Telegram</SelectItem>
                                    <SelectItem value="Instagram">Instagram</SelectItem>
                                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Input defaultValue={channel.username} className="flex-1" />
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleRemoveChannel(idx)}
                                >
                                  ×
                                </Button>
                              </div>
                            ))}
                            <Button variant="outline" className="w-full" onClick={handleAddChannel}>
                              + Add
                            </Button>
                          </div>
                        </div>

                        <div>
                          <Label>Notes</Label>
                          <p className="text-sm text-muted-foreground mt-2">
                            {client.notes || 'No notes yet'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* My Feed Tab Content */}
              <TabsContent value="feed" className="mt-6 space-y-4">
                <div className="max-w-4xl mx-auto">
                <Card className="border-0 shadow-md">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-semibold flex items-center gap-2">
                          <Rss className="h-5 w-5 text-slate-600" />
                          Activity Feed
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Recent activities and updates for {client.name}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {clientSessions.length > 0 ? (
                      <div className="space-y-3">
                        {clientSessions.slice(0, 10).map((session, index) => {
                          const statusConfig = {
                            applied: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
                            new: { color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
                            conducted: { color: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-500' },
                            rejected: { color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500' }
                          };
                          const config = statusConfig[session.status] || statusConfig.conducted;
                          
                          return (
                            <motion.div
                              layout={false}
                              key={session.id}
                              initial={{ opacity: 0, x: -12 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.25) }}
                              className="group relative flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all duration-200"
                            >
                              <div className={`flex-shrink-0 w-2 h-2 rounded-full ${config.dot}`} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <p className="font-semibold text-slate-900 group-hover:text-slate-950 transition-colors">
                                      {session.service}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1.5">
                                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" />
                                        {format(new Date(session.date), 'MMM dd, yyyy • hh:mm a')}
                                      </span>
                                      <span className="text-slate-300">•</span>
                                      <Badge variant="outline" className={`${config.color} border text-xs px-2 py-0.5`}>
                                        {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="flex-shrink-0">
                                    <span className="text-lg font-bold text-slate-900">
                                      ${session.price}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Rss className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium">No activity yet</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Activities will appear here once sessions are created
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                </div>
              </TabsContent>

              {/* Sessions Tab Content */}
              <TabsContent value="sessions" className="mt-6 space-y-4">
                <div className="max-w-4xl mx-auto">
                <Card className="border-0 shadow-md">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <CardTitle className="text-xl font-semibold flex items-center gap-2">
                          <CalendarIcon className="h-5 w-5 text-slate-600" />
                          Sessions
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Manage and track all client sessions
                        </p>
                      </div>
                    </div>
                    
                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200">
                      <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input 
                          placeholder="Search by Payment ID..." 
                          className="pl-9 h-9"
                        />
                      </div>
                      <Calendar 
                        value={selectedDate} 
                        onChange={setSelectedDate}
                        className="w-[180px]"
                      />
                      <Select defaultValue="all">
                        <SelectTrigger className="w-[160px] h-9">
                          <SelectValue placeholder="All Services" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Services</SelectItem>
                          <SelectItem value="individual">Individual Therapy</SelectItem>
                          <SelectItem value="group">Group Therapy</SelectItem>
                          <SelectItem value="consultation">Consultation</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select defaultValue="all">
                        <SelectTrigger className="w-[160px] h-9">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="applied">Applied</SelectItem>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="conducted">Conducted</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                      {(selectedDate) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedDate(undefined)}
                          className="h-9 gap-1.5"
                        >
                          <X className="h-3.5 w-3.5" />
                          Clear
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {clientSessions.length > 0 ? (
                      <div className="rounded-lg border border-slate-200 overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                              <TableHead className="font-semibold text-slate-700">Session ID</TableHead>
                              <TableHead className="font-semibold text-slate-700">Service</TableHead>
                              <TableHead className="font-semibold text-slate-700">Date & Time</TableHead>
                              <TableHead className="font-semibold text-slate-700">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {clientSessions.map((session) => {
                              const statusConfig = {
                                applied: { color: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
                                new: { color: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-500' },
                                conducted: { color: 'text-slate-700', bg: 'bg-slate-50', dot: 'bg-slate-500' },
                                rejected: { color: 'text-red-700', bg: 'bg-red-50', dot: 'bg-red-500' }
                              };
                              const config = statusConfig[session.status] || statusConfig.conducted;
                              
                              return (
                                <TableRow key={session.id} className="hover:bg-slate-50/50 transition-colors">
                                  <TableCell>
                                    <button 
                                      className="text-primary hover:text-primary/80 hover:underline font-medium transition-colors"
                                      onClick={() => {
                                        logger.userAction('Clients', 'Opening session', { sessionId: session.id });
                                        alert(`Session details for ${session.id}`);
                                      }}
                                    >
                                      {session.id}
                                    </button>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-col">
                                      <span className="font-medium text-slate-900">{session.service}</span>
                                      <span className="text-sm text-muted-foreground">${session.price}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-col">
                                      <span className="text-slate-900">
                                        {format(new Date(session.date), 'MMM dd, yyyy')}
                                      </span>
                                      <span className="text-sm text-muted-foreground">
                                        {format(new Date(session.date), 'hh:mm a')} • {session.duration}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                                      <span className={`font-medium ${config.color}`}>
                                        {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                                      </span>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <CalendarIcon className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium">No sessions found</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Start by adding a new session
                        </p>
                        <Button onClick={handleAddSession} className="mt-4 gap-2">
                          <Plus className="h-4 w-4" />
                          Add First Session
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                </div>
              </TabsContent>

              {/* Payments Tab Content */}
              <TabsContent value="payments" className="mt-6 space-y-4">
                <div className="max-w-4xl mx-auto">
                <Card className="border-0 shadow-md">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-semibold flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-slate-600" />
                          Payments
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Payment history and transaction details
                        </p>
                      </div>
                      {clientPayments.length > 0 && (
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Amount</p>
                          <p className="text-2xl font-bold text-slate-900">
                            ${clientPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {clientPayments.length > 0 ? (
                      <div className="rounded-lg border border-slate-200 overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                              <TableHead className="font-semibold text-slate-700">Payment ID</TableHead>
                              <TableHead className="font-semibold text-slate-700">Amount</TableHead>
                              <TableHead className="font-semibold text-slate-700">Date</TableHead>
                              <TableHead className="font-semibold text-slate-700">Method</TableHead>
                              <TableHead className="font-semibold text-slate-700">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {clientPayments.map((payment) => {
                              const statusConfig = {
                                paid: { color: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
                                pending: { color: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-500' },
                                failed: { color: 'text-red-700', bg: 'bg-red-50', dot: 'bg-red-500' }
                              };
                              const config = statusConfig[payment.status] || statusConfig.paid;
                              
                              return (
                                <TableRow key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                                  <TableCell>
                                    <button 
                                      className="text-primary hover:text-primary/80 hover:underline font-medium transition-colors"
                                      onClick={() => {
                                        logger.userAction('Clients', 'Opening payment', { paymentId: payment.id });
                                        alert(`Payment details for ${payment.id}`);
                                      }}
                                    >
                                      {payment.id}
                                    </button>
                                  </TableCell>
                                  <TableCell>
                                    <span className="font-bold text-lg text-slate-900">
                                      ${payment.amount.toLocaleString()}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-col">
                                      <span className="text-slate-900">
                                        {format(new Date(payment.date), 'MMM dd, yyyy')}
                                      </span>
                                      <span className="text-sm text-muted-foreground">
                                        {format(new Date(payment.date), 'hh:mm a')}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                                      {payment.method}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                                      <span className={`font-medium ${config.color}`}>
                                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                      </span>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <CreditCard className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium">No payments found</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Payment records will appear here once transactions are made
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <Dialog
          open={infoDialog.open}
          onOpenChange={(open) =>
            setInfoDialog((prev) => ({
              ...prev,
              open,
            }))
          }
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{infoDialog.title || 'Coming soon'}</DialogTitle>
              {infoDialog.message && (
                <DialogDescription>{infoDialog.message}</DialogDescription>
              )}
            </DialogHeader>
            <DialogFooter>
              <Button
                onClick={() =>
                  setInfoDialog((prev) => ({
                    ...prev,
                    open: false,
                  }))
                }
              >
                OK
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
            <p className="text-muted-foreground">
              Manage your clients and their information
            </p>
          </div>
          {mainTab === 'clients' && (
            <Button onClick={() => setAddClientOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          )}
        </div>

        {/* Main Tabs: Clients and Schedule */}
        <Tabs value={mainTab} onValueChange={(value) => setMainTab(value as 'clients' | 'schedule')} className="w-full">
          <TabsList className="h-auto p-1.5 bg-slate-100/50 border border-slate-200 rounded-xl w-full max-w-md">
            <TabsTrigger 
              value="clients" 
              className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm rounded-lg px-5 py-3 gap-2 font-medium transition-all flex-1"
            >
              <UsersIcon className="h-4 w-4" />
              <span>Clients</span>
            </TabsTrigger>
            <TabsTrigger 
              value="schedule" 
              className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm rounded-lg px-5 py-3 gap-2 font-medium transition-all flex-1"
            >
              <CalendarIcon className="h-4 w-4" />
              <span>Schedule</span>
            </TabsTrigger>
          </TabsList>

          {/* Clients Tab Content */}
          <TabsContent value="clients" className="mt-6 space-y-6">

            <div className="flex items-center gap-4 relative z-10">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
                <Input
                  placeholder="Search clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 relative z-10"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 relative z-0">
              {filteredClients.map((client, index) => {
                return (
                  <ClientCard
                    key={client.id}
                    client={client}
                    index={index}
                    onSelect={() => setSelectedClient(client.id)}
                    onRemove={(e) => handleRemoveClient(e, client.id)}
                  />
                );
              })}
            </div>
          </TabsContent>

          {/* Schedule Tab Content */}
          <TabsContent value="schedule" className="mt-6 space-y-6">
            {/* Today's Sessions — compact luxury list */}
            <Card className="border border-slate-200/60 shadow-sm overflow-hidden bg-white">
              <CardHeader className="py-4 px-5 border-b border-slate-100">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-slate-900 text-white">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold text-slate-900 tracking-tight">
                        Today's Appointments
                      </CardTitle>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {todaySessions.length > 0 
                          ? `${todaySessions.length} ${todaySessions.length === 1 ? 'appointment' : 'appointments'}`
                          : 'No appointments'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {todaySessions.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {todaySessions.map((session, index) => {
                      const urgency = getUrgencyLevel(session.date);
                      const sessionDate = parseISO(session.date);
                      const urgencyConfig = {
                        urgent: { time: 'bg-red-500/10 text-red-700 border-red-200/60', dot: 'bg-red-500' },
                        soon: { time: 'bg-amber-500/10 text-amber-800 border-amber-200/60', dot: 'bg-amber-500' },
                        normal: { time: 'bg-slate-100 text-slate-700 border-slate-200/60', dot: 'bg-slate-400' }
                      };
                      const config = urgencyConfig[urgency.level];
                      return (
                        <motion.div
                          layout={false}
                          key={session.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: Math.min(index * 0.02, 0.15), duration: 0.2 }}
                          className="group flex items-center gap-4 px-5 py-3 hover:bg-slate-50/80 transition-colors"
                        >
                          <div className={`flex-shrink-0 w-12 text-center py-1.5 rounded-md border font-semibold text-sm tabular-nums ${config.time}`}>
                            {format(sessionDate, 'HH:mm')}
                          </div>
                          <div className="flex-1 min-w-0 flex items-center gap-4">
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 text-sm truncate">{session.clientName}</p>
                              <p className="text-xs text-slate-500 truncate">{session.service}</p>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {session.duration}
                              </span>
                              <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} title={urgency.label} />
                            </div>
                          </div>
                          <div className="flex-shrink-0 flex items-center gap-3">
                            <span className="font-semibold text-slate-900 text-sm">${session.price}</span>
                            <Badge variant="outline" className="text-[10px] font-medium px-2 py-0 h-5 border-slate-200 text-slate-600 bg-white">
                              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                            </Badge>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 px-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
                      <CalendarIcon className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="text-slate-600 font-medium text-sm">No appointments today</p>
                    <p className="text-xs text-slate-400 mt-0.5">Appointments will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Other Sessions */}
            {otherSessions.length > 0 && (
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-slate-600" />
                    Other Appointments
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {otherSessions.length} {otherSessions.length === 1 ? 'appointment' : 'appointments'}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="rounded-xl border border-slate-200/60 overflow-hidden bg-white/95">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100/50 hover:bg-slate-50/50 border-b border-slate-200">
                          <TableHead className="font-bold text-slate-700 py-4">Date and Time</TableHead>
                          <TableHead className="font-bold text-slate-700 py-4">Client</TableHead>
                          <TableHead className="font-bold text-slate-700 py-4">Service</TableHead>
                          <TableHead className="font-bold text-slate-700 py-4">Duration</TableHead>
                          <TableHead className="font-bold text-slate-700 py-4">Status</TableHead>
                          <TableHead className="font-bold text-slate-700 py-4 text-right">Price</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {otherSessions.map((session, idx) => {
                          const sessionDate = parseISO(session.date);
                          const statusConfig = {
                            applied: { color: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500', border: 'border-emerald-200' },
                            new: { color: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-500', border: 'border-blue-200' },
                            conducted: { color: 'text-slate-700', bg: 'bg-slate-50', dot: 'bg-slate-500', border: 'border-slate-200' },
                            rejected: { color: 'text-red-700', bg: 'bg-red-50', dot: 'bg-red-500', border: 'border-red-200' }
                          };
                          const config = statusConfig[session.status] || statusConfig.conducted;
                          
                          return (
                            <TableRow 
                              key={session.id} 
                              className="hover:bg-gradient-to-r hover:from-slate-50/50 hover:to-transparent transition-all duration-200 border-b border-slate-100/50"
                            >
                              <TableCell className="py-4">
                                <div className="flex flex-col gap-1">
                                  <span className="text-slate-900 font-semibold">
                                    {format(sessionDate, 'dd.MM.yyyy')}
                                  </span>
                                  <span className="text-sm font-medium text-slate-500">
                                    {format(sessionDate, 'HH:mm')}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <span className="font-semibold text-slate-900">{session.clientName}</span>
                              </TableCell>
                              <TableCell className="py-4">
                                <span className="text-slate-700">{session.service}</span>
                              </TableCell>
                              <TableCell className="py-4">
                                <span className="text-sm font-medium text-slate-600">{session.duration}</span>
                              </TableCell>
                              <TableCell className="py-4">
                                <Badge variant="outline" className={`${config.bg} ${config.color} ${config.border} border flex items-center gap-1.5 w-fit`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                                  <span className="font-medium text-xs">
                                    {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                                  </span>
                                </Badge>
                              </TableCell>
                              <TableCell className="py-4 text-right">
                                <span className="font-bold text-lg text-slate-900">${session.price}</span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step-by-step schedule by client */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50/50">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-slate-900 flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/20">
                        <UsersIcon className="h-5 w-5 text-white" />
                      </div>
                      <span>Step-by-step Schedule of All Clients</span>
                    </CardTitle>
                    <p className="text-sm font-medium text-slate-500 ml-14">
                      Schedule grouped by clients
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  {groupedSessionsByClient.map((group, groupIndex) => (
                    <motion.div
                      layout={false}
                      key={group.clientId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: Math.min(groupIndex * 0.03, 0.25) }}
                      className="border border-slate-200/60 rounded-2xl p-5 bg-white/95 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center gap-4 mb-5 pb-4 border-b border-slate-100">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center shadow-sm">
                          <User className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-slate-900">{group.clientName}</h3>
                          <p className="text-sm font-medium text-slate-500">
                            {group.sessions.length} {group.sessions.length === 1 ? 'session' : 'sessions'}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2.5">
                        {group.sessions.map((session) => {
                          const sessionDate = parseISO(session.date);
                          const isTodaySession = isToday(sessionDate);
                          const statusConfig = {
                            applied: { color: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500', border: 'border-emerald-200' },
                            new: { color: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-500', border: 'border-blue-200' },
                            conducted: { color: 'text-slate-700', bg: 'bg-slate-50', dot: 'bg-slate-500', border: 'border-slate-200' },
                            rejected: { color: 'text-red-700', bg: 'bg-red-50', dot: 'bg-red-500', border: 'border-red-200' }
                          };
                          const config = statusConfig[session.status] || statusConfig.conducted;
                          
                          return (
                            <div
                              key={session.id}
                              className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 hover:shadow-sm ${
                                isTodaySession 
                                  ? 'bg-gradient-to-r from-blue-50 to-blue-100/50 border-blue-200 shadow-sm' 
                                  : `bg-white border-slate-200/60 hover:bg-slate-50/50`
                              }`}
                            >
                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className={`w-2.5 h-2.5 rounded-full ${config.dot} flex-shrink-0`} />
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-slate-900 mb-1.5">{session.service}</p>
                                  <div className="flex flex-wrap items-center gap-2.5">
                                    <span className="text-sm font-medium text-slate-600">
                                      {format(sessionDate, 'dd.MM.yyyy')}
                                    </span>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-sm font-medium text-slate-600">
                                      {format(sessionDate, 'HH:mm')}
                                    </span>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-sm text-slate-500">{session.duration}</span>
                                    {isTodaySession && (
                                      <>
                                        <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 text-xs font-medium px-2 py-0.5">
                                          Today
                                        </Badge>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 flex-shrink-0">
                                <Badge variant="outline" className={`${config.bg} ${config.color} ${config.border} border text-xs font-medium px-2.5 py-1`}>
                                  {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                                </Badge>
                                <span className="font-bold text-lg text-slate-900 min-w-[60px] text-right">${session.price}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={addClientOpen} onOpenChange={setAddClientOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                New client
              </DialogTitle>
              <DialogDescription>
                Add a new client. Name and email are required.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={addClientForm.name}
                  onChange={(e) => setAddClientForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="John Doe"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={addClientForm.email}
                  onChange={(e) => setAddClientForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="john@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={addClientForm.phone}
                  onChange={(e) => setAddClientForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={addClientForm.notes}
                  onChange={(e) => setAddClientForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Optional notes"
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddClientOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddClient} disabled={!addClientForm.name.trim() || !addClientForm.email.trim()}>
                Add client
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={infoDialog.open}
          onOpenChange={(open) => setInfoDialog(prev => ({ ...prev, open }))}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{infoDialog.title || 'Info'}</DialogTitle>
              {infoDialog.message && (
                <DialogDescription>{infoDialog.message}</DialogDescription>
              )}
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setInfoDialog(prev => ({ ...prev, open: false }))}>
                OK
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
