import { useState, useMemo } from 'react';
import { PageTransition } from '@/components/shared/PageTransition';
import { services, type Service } from '@/data/mockData';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Plus,
  Edit,
  Trash2,
  Filter,
  DollarSign,
  Clock,
  Tag,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

export default function Services() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [servicesList, setServicesList] = useState<Service[]>(() => [...services]);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: '',
    isActive: true
  });

  const filtered = servicesList.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && service.isActive) ||
      (statusFilter === 'inactive' && !service.isActive);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = useMemo(() => {
    return Array.from(new Set(servicesList.map(s => s.category)));
  }, [servicesList]);

  const handleAddService = () => {
    const newService: Service = {
      id: `srv${servicesList.length + 1}`,
      name: serviceForm.name,
      description: serviceForm.description,
      price: parseFloat(serviceForm.price),
      duration: serviceForm.duration,
      category: serviceForm.category,
      isActive: serviceForm.isActive,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setServicesList([...servicesList, newService]);
    setServiceForm({
      name: '',
      description: '',
      price: '',
      duration: '',
      category: '',
      isActive: true
    });
    setIsAddDialogOpen(false);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setServiceForm({
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      duration: service.duration,
      category: service.category,
      isActive: service.isActive
    });
    setIsAddDialogOpen(true);
  };

  const handleUpdateService = () => {
    if (!editingService) return;
    setServicesList(servicesList.map(s => 
      s.id === editingService.id 
        ? {
            ...s,
            name: serviceForm.name,
            description: serviceForm.description,
            price: parseFloat(serviceForm.price),
            duration: serviceForm.duration,
            category: serviceForm.category,
            isActive: serviceForm.isActive
          }
        : s
    ));
    setEditingService(null);
    setServiceForm({
      name: '',
      description: '',
      price: '',
      duration: '',
      category: '',
      isActive: true
    });
    setIsAddDialogOpen(false);
  };

  const handleDeleteService = (id: string) => {
    setServicesList(servicesList.filter(s => s.id !== id));
  };

  const handleToggleActive = (id: string) => {
    setServicesList(servicesList.map(s => 
      s.id === id ? { ...s, isActive: !s.isActive } : s
    ));
  };

  const stats = useMemo(() => {
    const totalServices = servicesList.length;
    const activeServices = servicesList.filter(s => s.isActive).length;
    const totalRevenue = servicesList.reduce((sum, s) => sum + s.price, 0);
    const avgPrice = totalServices > 0 ? totalRevenue / totalServices : 0;
    return { totalServices, activeServices, totalRevenue, avgPrice };
  }, [servicesList]);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Services
            </h1>
            <p className="text-muted-foreground mt-1.5">
              Manage and configure your services
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingService(null);
              setServiceForm({
                name: '',
                description: '',
                price: '',
                duration: '',
                category: '',
                isActive: true
              });
              setIsAddDialogOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Service
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Services</p>
                  <p className="text-2xl font-bold mt-1">{stats.totalServices}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Tag className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Services</p>
                  <p className="text-2xl font-bold mt-1">{stats.activeServices}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold mt-1">${Math.round(stats.totalRevenue)}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg. Price</p>
                  <p className="text-2xl font-bold mt-1">${Math.round(stats.avgPrice)}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[280px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, description, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[160px] h-10 border-gray-200">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] h-10 border-gray-200">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Table */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Service Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Tag className="h-12 w-12 text-gray-300" />
                          <p className="text-gray-500 font-medium">No services found</p>
                          <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((service, index) => (
                      <motion.tr
                        key={service.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200 group"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-900">{service.name}</p>
                            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{service.description}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {service.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-base text-gray-900">
                            ${service.price.toLocaleString()}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Clock className="h-3.5 w-3.5 text-gray-400" />
                            {service.duration}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={service.isActive}
                              onCheckedChange={() => handleToggleActive(service.id)}
                            />
                            <span className={cn(
                              "text-xs font-medium",
                              service.isActive ? "text-green-600" : "text-gray-500"
                            )}>
                              {service.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 hover:bg-blue-100 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleEditService(service)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 hover:bg-red-100 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleDeleteService(service.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
              <DialogDescription>
                {editingService ? 'Update service information' : 'Create a new service for your catalog'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Service Name</Label>
                <Input
                  id="name"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  placeholder="e.g., Individual Therapy Session"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  placeholder="Describe the service..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={serviceForm.duration}
                    onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                    placeholder="e.g., 1 hour"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select value={serviceForm.category} onValueChange={(value) => setServiceForm({ ...serviceForm, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Therapy">Therapy</SelectItem>
                    <SelectItem value="Consultation">Consultation</SelectItem>
                    <SelectItem value="Counseling">Counseling</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Active Status</Label>
                <Switch
                  id="isActive"
                  checked={serviceForm.isActive}
                  onCheckedChange={(checked) => setServiceForm({ ...serviceForm, isActive: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={editingService ? handleUpdateService : handleAddService}>
                {editingService ? 'Update' : 'Create'} Service
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
