import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import type { InvestmentTemplate, Investment } from '@/data/mockData';
import { Plus, Check } from 'lucide-react';
import { format, parse } from 'date-fns';

interface AddInvestmentDialogProps {
  open: boolean;
  onClose: () => void;
  templates: InvestmentTemplate[];
  onAddTemplate: (template: Omit<InvestmentTemplate, 'id' | 'createdAt'>) => void;
  onAddInvestment: (investment: Omit<Investment, 'id' | 'currentValue' | 'return' | 'returnPercent'>) => void;
}

const investmentTypes = ['Stocks', 'Real Estate', 'Crypto', 'Bonds'];

export function AddInvestmentDialog({
  open,
  onClose,
  templates,
  onAddTemplate,
  onAddInvestment,
}: AddInvestmentDialogProps) {
  const [activeTab, setActiveTab] = useState<'select' | 'settings'>('select');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  
  // Форма для новой инвестиции (используется в обеих вкладках)
  const [investmentForm, setInvestmentForm] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Форма для настроек шаблона (вкладка 2)
  const [templateForm, setTemplateForm] = useState({
    name: '',
    type: '',
    whereInvested: '',
    comments: '',
  });

  const handleClose = () => {
    setActiveTab('select');
    setSelectedTemplateId('');
    setInvestmentForm({
      amount: '',
      date: new Date().toISOString().split('T')[0],
    });
    setTemplateForm({
      name: '',
      type: '',
      whereInvested: '',
      comments: '',
    });
    onClose();
  };

  const handleSaveTemplate = () => {
    if (!templateForm.name || !templateForm.type || !templateForm.whereInvested) {
      alert('Please fill in all required fields');
      return;
    }

    onAddTemplate({
      name: templateForm.name,
      type: templateForm.type,
      whereInvested: templateForm.whereInvested,
      comments: templateForm.comments,
    });

    // Очистка формы
    setTemplateForm({
      name: '',
      type: '',
      whereInvested: '',
      comments: '',
    });

    alert('Investment template saved! You can now select it in the "Investment" tab');
  };

  const handleAddInvestment = () => {
    if (!investmentForm.amount || !investmentForm.date) {
      alert('Please fill in amount and date');
      return;
    }

    const amount = parseFloat(investmentForm.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (activeTab === 'select') {
      // Используем выбранный шаблон
      if (!selectedTemplateId) {
        alert('Please select an investment template');
        return;
      }

      const template = templates.find(t => t.id === selectedTemplateId);
      if (!template) {
        alert('Template not found');
        return;
      }

      onAddInvestment({
        name: template.name,
        type: template.type,
        amount: amount,
        date: investmentForm.date,
      });
    } else {
      // Используем форму настроек
      if (!templateForm.name || !templateForm.type || !templateForm.whereInvested) {
        alert('Please fill in all required fields in settings');
        return;
      }

      onAddInvestment({
        name: templateForm.name,
        type: templateForm.type,
        amount: amount,
        date: investmentForm.date,
      });
    }

    handleClose();
  };

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleClose();
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Добавить инвестицию</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'select' | 'settings')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="select">Инвестиция</TabsTrigger>
            <TabsTrigger value="settings">Настройки</TabsTrigger>
          </TabsList>

          {/* Вкладка 1: Выбор инвестиции */}
          <TabsContent value="select" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Выберите шаблон инвестиции</Label>
              {templates.length === 0 ? (
                <div className="text-sm text-muted-foreground p-4 border rounded-md">
                  No saved templates. Create a template in the "Settings" tab
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {templates.map((template) => {
                    const isSelected = selectedTemplateId === template.id;
                    return (
                      <div
                        key={template.id}
                        onClick={() => setSelectedTemplateId(template.id)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                            : 'border-border hover:border-primary/50 hover:bg-accent/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{template.name}</h4>
                              {isSelected && <Check className="h-4 w-4 text-primary" />}
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div>
                                <span className="font-medium">Тип:</span> {template.type}
                              </div>
                              <div>
                                <span className="font-medium">Куда инвестировано:</span> {template.whereInvested}
                              </div>
                              {template.comments && (
                                <div>
                                  <span className="font-medium">Комментарии:</span> {template.comments}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedTemplate && (
              <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                <div>
                  <Label htmlFor="amount">Сумма инвестиции ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={investmentForm.amount}
                    onChange={(e) => setInvestmentForm({ ...investmentForm, amount: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="date">Дата инвестиции</Label>
                  <Calendar
                    value={investmentForm.date ? parse(investmentForm.date, 'yyyy-MM-dd', new Date()) : undefined}
                    onChange={(d) => setInvestmentForm({ ...investmentForm, date: d ? format(d, 'yyyy-MM-dd') : '' })}
                    placeholder="DD.MM.YYYY"
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </TabsContent>

          {/* Вкладка 2: Настройки */}
          <TabsContent value="settings" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="template-name">Название инвестиции *</Label>
                <Input
                  id="template-name"
                  placeholder="Example: Tech Stocks Portfolio"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="template-type">Тип инвестиции *</Label>
                <Select
                  value={templateForm.type}
                  onValueChange={(value) => setTemplateForm({ ...templateForm, type: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {investmentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="where-invested">Куда инвестировано *</Label>
                <Input
                  id="where-invested"
                  placeholder="Example: Apple, Microsoft, Google or Bitcoin, Ethereum"
                  value={templateForm.whereInvested}
                  onChange={(e) => setTemplateForm({ ...templateForm, whereInvested: e.target.value })}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Укажите компанию, криптовалюту или другой объект инвестирования
                </p>
              </div>

              <div>
                <Label htmlFor="comments">Комментарии</Label>
                <Textarea
                  id="comments"
                  placeholder="Additional information about the investment..."
                  value={templateForm.comments}
                  onChange={(e) => setTemplateForm({ ...templateForm, comments: e.target.value })}
                  className="mt-1"
                  rows={4}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSaveTemplate} variant="outline" className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Сохранить шаблон
              </Button>
            </div>

            {/* Форма для добавления инвестиции из настроек */}
            <div className="pt-4 border-t space-y-4">
              <h4 className="font-semibold">Добавить инвестицию с этими настройками</h4>
              <div>
                <Label htmlFor="settings-amount">Сумма инвестиции ($)</Label>
                <Input
                  id="settings-amount"
                  type="number"
                  placeholder="Enter amount"
                  value={investmentForm.amount}
                  onChange={(e) => setInvestmentForm({ ...investmentForm, amount: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="settings-date">Дата инвестиции</Label>
                <Calendar
                  value={investmentForm.date ? parse(investmentForm.date, 'yyyy-MM-dd', new Date()) : undefined}
                  onChange={(d) => setInvestmentForm({ ...investmentForm, date: d ? format(d, 'yyyy-MM-dd') : '' })}
                  placeholder="DD.MM.YYYY"
                  className="mt-1"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Отмена
          </Button>
          <Button onClick={handleAddInvestment}>
            Добавить инвестицию
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
