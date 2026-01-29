// Mock data for CRM Panel

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  totalIncome: number;
  status: 'active' | 'inactive';
  sessions: number;
  lastMeeting: string;
  communicationChannels: {
    type: string;
    username: string;
  }[];
  notes: string;
}

export interface Transaction {
  id: string;
  clientId: string;
  clientName: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  description: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface Payment {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  date: string;
  method: string;
  status: 'paid' | 'pending' | 'failed';
}

export interface Invoice {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  date: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue' | 'draft';
  items: {
    description: string;
    quantity: number;
    price: number;
  }[];
}

export interface Session {
  id: string;
  clientId: string;
  clientName: string;
  service: string;
  price: number;
  date: string;
  duration: string;
  status: 'applied' | 'new' | 'conducted' | 'rejected';
  notes: string;
}

export interface Investment {
  id: string;
  name: string;
  type: string;
  amount: number;
  currentValue: number;
  return: number;
  returnPercent: number;
  date: string;
}

export interface InvestmentTemplate {
  id: string;
  name: string;
  type: string;
  whereInvested: string; // Куда инвестировали (компания, криптовалюта и т.д.)
  comments: string; // Комментарии
  createdAt: string;
}

// Рекурсивная структура задачи - может иметь бесконечное количество вложенных подзадач
export interface GoalTask {
  id: string;
  title: string;
  target: number;
  current: number;
  subtasks?: GoalTask[]; // Рекурсивная структура - задачи могут иметь подзадачи
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  deadline: string;
  status: 'in-progress' | 'completed' | 'on-hold';
  subtasks?: GoalTask[]; // Используем GoalTask для всех уровней вложенности
}

export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  items: string[];
  total: number;
  date: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  category: string;
  isActive: boolean;
  createdAt: string;
}

// Текущая дата для моков (локальная, чтобы «сегодня» и срочные инвойсы всегда отображались)
const _mockNow = new Date();
const _pad = (n: number) => String(n).padStart(2, '0');
const _todayStr = `${_mockNow.getFullYear()}-${_pad(_mockNow.getMonth() + 1)}-${_pad(_mockNow.getDate())}`;
const _addDays = (d: Date, days: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return `${x.getFullYear()}-${_pad(x.getMonth() + 1)}-${_pad(x.getDate())}`;
};

// Clients
export const clients: Client[] = [
  {
    id: '1',
    name: 'Carter Mills',
    email: 'carter.mills@example.com',
    phone: '+1 234 567 8901',
    avatar: 'C',
    totalIncome: 2640,
    status: 'active',
    sessions: 12,
    lastMeeting: '2025-01-20T09:00:00',
    communicationChannels: [
      { type: 'Telegram', username: '@carter_mills' },
      { type: 'Instagram', username: '@carter_mills' }
    ],
    notes: 'Regular client, prefers morning sessions'
  },
  {
    id: '2',
    name: 'Mason Clarke',
    email: 'mason.clarke@example.com',
    phone: '+1 234 567 8902',
    avatar: 'M',
    totalIncome: 1760,
    status: 'active',
    sessions: 8,
    lastMeeting: '2025-01-17T10:00:00',
    communicationChannels: [
      { type: 'Telegram', username: '@mason_clarke' }
    ],
    notes: ''
  },
  {
    id: '3',
    name: 'Adam Collins',
    email: 'adam.collins@example.com',
    phone: '+1 234 567 8903',
    avatar: 'A',
    totalIncome: 1400,
    status: 'active',
    sessions: 7,
    lastMeeting: '2024-12-22T10:00:00',
    communicationChannels: [
      { type: 'Instagram', username: '@adam_collins' }
    ],
    notes: 'Prefers online sessions'
  },
  {
    id: '4',
    name: 'Coleman Reeves',
    email: 'coleman.reeves@example.com',
    phone: '+1 234 567 8904',
    avatar: 'C',
    totalIncome: 1540,
    status: 'active',
    sessions: 7,
    lastMeeting: '2024-12-19T17:00:00',
    communicationChannels: [],
    notes: ''
  },
  {
    id: '5',
    name: 'Martin Cole',
    email: 'martin.cole@example.com',
    phone: '+1 234 567 8905',
    avatar: 'M',
    totalIncome: 1320,
    status: 'active',
    sessions: 6,
    lastMeeting: '2024-12-17T12:00:00',
    communicationChannels: [
      { type: 'Telegram', username: '@martin_cole' }
    ],
    notes: ''
  },
  {
    id: '6',
    name: 'Mattew Black',
    email: 'mattew.black@example.com',
    phone: '+1 234 567 8906',
    avatar: 'M',
    totalIncome: 2250,
    status: 'active',
    sessions: 10,
    lastMeeting: '2025-01-15T14:00:00',
    communicationChannels: [
      { type: 'Telegram', username: '@mattew_black' },
      { type: 'Instagram', username: '@mattew_black' }
    ],
    notes: 'High-value client, prefers afternoon sessions'
  },
  {
    id: '7',
    name: 'Robert Smith',
    email: 'robert.smith@example.com',
    phone: '+1 234 567 8907',
    avatar: 'R',
    totalIncome: 1980,
    status: 'active',
    sessions: 9,
    lastMeeting: '2025-01-18T11:00:00',
    communicationChannels: [
      { type: 'Telegram', username: '@robert_smith' }
    ],
    notes: ''
  },
  {
    id: '8',
    name: 'Esther Howard',
    email: 'esther.howard@example.com',
    phone: '+1 234 567 8908',
    avatar: 'E',
    totalIncome: 1100,
    status: 'active',
    sessions: 5,
    lastMeeting: '2025-01-10T15:00:00',
    communicationChannels: [],
    notes: ''
  },
  {
    id: '9',
    name: 'Darlene Robertson',
    email: 'darlene.robertson@example.com',
    phone: '+1 234 567 8909',
    avatar: 'D',
    totalIncome: 2420,
    status: 'active',
    sessions: 11,
    lastMeeting: '2025-01-22T10:00:00',
    communicationChannels: [
      { type: 'Telegram', username: '@darlene_r' },
      { type: 'Instagram', username: '@darlene_r' }
    ],
    notes: 'Regular client, very engaged'
  },
  {
    id: '10',
    name: 'Brooklyn Simmons',
    email: 'brooklyn.simmons@example.com',
    phone: '+1 234 567 8910',
    avatar: 'B',
    totalIncome: 880,
    status: 'active',
    sessions: 4,
    lastMeeting: '2025-01-05T13:00:00',
    communicationChannels: [],
    notes: ''
  },
  {
    id: '11',
    name: 'Jane Cooper',
    email: 'jane.cooper@example.com',
    phone: '+1 234 567 8911',
    avatar: 'J',
    totalIncome: 1650,
    status: 'active',
    sessions: 7,
    lastMeeting: '2025-01-12T09:00:00',
    communicationChannels: [
      { type: 'Telegram', username: '@jane_cooper' }
    ],
    notes: ''
  },
  {
    id: '12',
    name: 'Cameron Williamson',
    email: 'cameron.williamson@example.com',
    phone: '+1 234 567 8912',
    avatar: 'C',
    totalIncome: 1320,
    status: 'active',
    sessions: 6,
    lastMeeting: '2025-01-08T16:00:00',
    communicationChannels: [],
    notes: ''
  },
  {
    id: '13',
    name: 'Annette Black',
    email: 'annette.black@example.com',
    phone: '+1 234 567 8913',
    avatar: 'A',
    totalIncome: 990,
    status: 'active',
    sessions: 4,
    lastMeeting: '2024-12-28T14:00:00',
    communicationChannels: [
      { type: 'Instagram', username: '@annette_black' }
    ],
    notes: ''
  },
  {
    id: '14',
    name: 'Willum Bickham',
    email: 'willum.bickham@example.com',
    phone: '+1 234 567 8914',
    avatar: 'W',
    totalIncome: 2200,
    status: 'active',
    sessions: 10,
    lastMeeting: '2025-01-19T10:00:00',
    communicationChannels: [],
    notes: ''
  },
  {
    id: '15',
    name: 'Guy Hawkins',
    email: 'guy.hawkins@example.com',
    phone: '+1 234 567 8915',
    avatar: 'G',
    totalIncome: 1870,
    status: 'active',
    sessions: 8,
    lastMeeting: '2025-01-16T11:00:00',
    communicationChannels: [
      { type: 'Telegram', username: '@guy_hawkins' }
    ],
    notes: ''
  },
  {
    id: '16',
    name: 'Howard',
    email: 'howard@example.com',
    phone: '+1 234 567 8916',
    avatar: 'H',
    totalIncome: 1540,
    status: 'active',
    sessions: 7,
    lastMeeting: '2025-01-14T15:00:00',
    communicationChannels: [],
    notes: ''
  },
  {
    id: '17',
    name: 'Jhon Smith',
    email: 'jhon.smith@example.com',
    phone: '+1 234 567 8917',
    avatar: 'J',
    totalIncome: 1210,
    status: 'active',
    sessions: 5,
    lastMeeting: '2025-01-11T09:00:00',
    communicationChannels: [
      { type: 'Telegram', username: '@jhon_smith' },
      { type: 'Instagram', username: '@jhon_smith' }
    ],
    notes: ''
  },
  {
    id: '18',
    name: 'Cynthia',
    email: 'cynthia@example.com',
    phone: '+1 234 567 8918',
    avatar: 'C',
    totalIncome: 1980,
    status: 'active',
    sessions: 9,
    lastMeeting: '2025-01-20T14:00:00',
    communicationChannels: [],
    notes: ''
  },
  {
    id: '19',
    name: 'Jenny',
    email: 'jenny@example.com',
    phone: '+1 234 567 8919',
    avatar: 'J',
    totalIncome: 1100,
    status: 'active',
    sessions: 5,
    lastMeeting: '2025-01-13T10:00:00',
    communicationChannels: [
      { type: 'Telegram', username: '@jenny' }
    ],
    notes: ''
  },
  {
    id: '20',
    name: 'Nick Ohny',
    email: 'nick.ohny@example.com',
    phone: '+1 234 567 8920',
    avatar: 'N',
    totalIncome: 1760,
    status: 'active',
    sessions: 8,
    lastMeeting: '2025-01-17T13:00:00',
    communicationChannels: [],
    notes: ''
  }
];

// Transactions
export const transactions: Transaction[] = [
  {
    id: 't1',
    clientId: '1',
    clientName: 'Carter Mills',
    type: 'income',
    amount: 220,
    category: 'Session Payment',
    date: '2025-01-20T09:00:00',
    description: 'Individual Therapy Session',
    status: 'completed'
  },
  {
    id: 't2',
    clientId: '2',
    clientName: 'Mason Clarke',
    type: 'income',
    amount: 220,
    category: 'Session Payment',
    date: '2025-01-17T10:00:00',
    description: 'Individual Therapy Session',
    status: 'completed'
  },
  {
    id: 't3',
    clientId: '6',
    clientName: 'Mattew Black',
    type: 'income',
    amount: 220,
    category: 'Session Payment',
    date: '2025-01-15T14:00:00',
    description: 'Social Dysfunction',
    status: 'completed'
  },
  {
    id: 't4',
    clientId: '6',
    clientName: 'Mattew Black',
    type: 'income',
    amount: 200,
    category: 'Session Payment',
    date: '2024-12-10T11:00:00',
    description: 'Child Rearing Psychological Consultation',
    status: 'completed'
  },
  {
    id: 't5',
    clientId: '6',
    clientName: 'Mattew Black',
    type: 'income',
    amount: 160,
    category: 'Session Payment',
    date: '2024-11-15T15:00:00',
    description: 'Family Psychological Counseling',
    status: 'completed'
  },
  {
    id: 't6',
    clientId: '14',
    clientName: 'Willum Bickham',
    type: 'income',
    amount: 740000,
    category: 'IT Info',
    date: '2026-06-20T10:00:00',
    description: 'IT Services Payment',
    status: 'completed'
  },
  {
    id: 't7',
    clientId: '15',
    clientName: 'Guy Hawkins',
    type: 'income',
    amount: 740000,
    category: 'SaaS',
    date: '2026-06-20T10:00:00',
    description: 'SaaS Subscription',
    status: 'completed'
  },
  {
    id: 't8',
    clientId: '16',
    clientName: 'Howard',
    type: 'income',
    amount: 740000,
    category: 'Operational',
    date: '2026-06-20T10:00:00',
    description: 'Operational Services',
    status: 'completed'
  },
  {
    id: 't9',
    clientId: '3',
    clientName: 'Adam Collins',
    type: 'income',
    amount: 200,
    category: 'Session Payment',
    date: '2024-12-22T10:00:00',
    description: 'Online Therapy Session',
    status: 'completed'
  },
  {
    id: 't10',
    clientId: '9',
    clientName: 'Darlene Robertson',
    type: 'income',
    amount: 220,
    category: 'Session Payment',
    date: '2025-01-22T10:00:00',
    description: 'Individual Therapy Session',
    status: 'completed'
  },
  ...Array.from({ length: 40 }, (_, i) => ({
    id: `t${i + 11}`,
    clientId: String((i % 20) + 1),
    clientName: clients[i % 20].name,
    type: Math.random() > 0.2 ? 'income' : 'expense' as 'income' | 'expense',
    amount: Math.floor(Math.random() * 1000) + 100,
    category: ['Session Payment', 'Consultation', 'Group Session', 'Online Session'][i % 4],
    date: new Date(2025, 0, Math.floor(Math.random() * 30) + 1).toISOString(),
    description: 'Therapy Session',
    status: ['completed', 'pending', 'failed'][Math.floor(Math.random() * 3)] as 'completed' | 'pending' | 'failed'
  }))
];

// Payments
export const payments: Payment[] = transactions
  .filter(t => t.type === 'income')
  .map(t => ({
    id: `p${t.id}`,
    clientId: t.clientId,
    clientName: t.clientName,
    amount: t.amount,
    date: t.date,
    method: ['Credit Card', 'Bank Transfer', 'PayPal', 'Cash'][Math.floor(Math.random() * 4)],
    status: t.status === 'completed' ? 'paid' : t.status === 'pending' ? 'pending' : 'failed' as 'paid' | 'pending' | 'failed'
  }));

// Invoices
export const invoices: Invoice[] = [
  {
    id: 'inv1',
    clientId: '1',
    clientName: 'Carter Mills',
    amount: 220,
    date: '2025-01-20',
    dueDate: '2025-02-20',
    status: 'paid',
    items: [
      { description: 'Individual Therapy Session', quantity: 1, price: 220 }
    ]
  },
  {
    id: 'inv2',
    clientId: '6',
    clientName: 'Mattew Black',
    amount: 220,
    date: '2025-01-15',
    dueDate: '2025-02-15',
    status: 'paid',
    items: [
      { description: 'Social Dysfunction', quantity: 1, price: 220 }
    ]
  },
  {
    id: 'inv3',
    clientId: '2',
    clientName: 'Mason Clarke',
    amount: 220,
    date: '2025-01-17',
    dueDate: '2025-02-17',
    status: 'pending',
    items: [
      { description: 'Individual Therapy Session', quantity: 1, price: 220 }
    ]
  },
  {
    id: 'inv-rent-1',
    clientId: '0',
    clientName: 'Office Rent',
    amount: 2500,
    date: _addDays(_mockNow, -5),
    dueDate: _addDays(_mockNow, 1),
    status: 'pending',
    items: [
      { description: 'Office rent for the month', quantity: 1, price: 2500 }
    ]
  },
  {
    id: 'inv-rent-2',
    clientId: '0',
    clientName: 'Utilities',
    amount: 450,
    date: _addDays(_mockNow, -10),
    dueDate: _addDays(_mockNow, 2),
    status: 'pending',
    items: [
      { description: 'Electricity, water, internet', quantity: 1, price: 450 }
    ]
  },
  {
    id: 'inv-equipment',
    clientId: '0',
    clientName: 'Equipment',
    amount: 1200,
    date: _addDays(_mockNow, -15),
    dueDate: _addDays(_mockNow, 3),
    status: 'pending',
    items: [
      { description: 'Office equipment payment', quantity: 1, price: 1200 }
    ]
  },
  {
    id: 'inv-overdue',
    clientId: '0',
    clientName: 'Insurance',
    amount: 320,
    date: _addDays(_mockNow, -20),
    dueDate: _addDays(_mockNow, -2),
    status: 'overdue',
    items: [
      { description: 'Office insurance (overdue)', quantity: 1, price: 320 }
    ]
  },
  {
    id: 'inv-software',
    clientId: '0',
    clientName: 'Software Subscription',
    amount: 89,
    date: _addDays(_mockNow, -25),
    dueDate: _addDays(_mockNow, 10),
    status: 'pending',
    items: [
      { description: 'CRM subscription for the year', quantity: 1, price: 89 }
    ]
  },
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `inv${i + 4}`,
    clientId: String((i % 20) + 1),
    clientName: clients[i % 20].name,
    amount: Math.floor(Math.random() * 500) + 100,
    date: new Date(2025, 0, Math.floor(Math.random() * 30) + 1).toISOString().split('T')[0],
    dueDate: new Date(2025, 1, Math.floor(Math.random() * 30) + 1).toISOString().split('T')[0],
    status: ['paid', 'pending', 'overdue', 'draft'][Math.floor(Math.random() * 4)] as 'paid' | 'pending' | 'overdue' | 'draft',
    items: [
      { description: 'Therapy Session', quantity: 1, price: Math.floor(Math.random() * 500) + 100 }
    ]
  }))
];

// Sessions
export const sessions: Session[] = [
  // События на сегодня (динамическая дата)
  {
    id: 'sess-today-1',
    clientId: '1',
    clientName: 'Carter Mills',
    service: 'Individual Therapy Session',
    price: 220,
    date: `${_todayStr}T10:00:00`,
    duration: '1 hour',
    status: 'applied',
    notes: ''
  },
  {
    id: 'sess-today-2',
    clientId: '2',
    clientName: 'Mason Clarke',
    service: 'Group Therapy Session',
    price: 180,
    date: `${_todayStr}T14:00:00`,
    duration: '1 hour 30 minutes',
    status: 'applied',
    notes: ''
  },
  {
    id: 'sess-today-3',
    clientId: '6',
    clientName: 'Mattew Black',
    service: 'Family Psychological Counseling',
    price: 250,
    date: `${_todayStr}T16:00:00`,
    duration: '1 hour',
    status: 'applied',
    notes: ''
  },
  {
    id: 'sess-today-4',
    clientId: '9',
    clientName: 'Darlene Robertson',
    service: 'Online Consultation',
    price: 200,
    date: `${_todayStr}T18:00:00`,
    duration: '45 minutes',
    status: 'applied',
    notes: ''
  },
  {
    id: 'sess-today-5',
    clientId: '3',
    clientName: 'Adam Collins',
    service: 'Couples Therapy',
    price: 300,
    date: `${_todayStr}T11:30:00`,
    duration: '1 hour 15 minutes',
    status: 'applied',
    notes: ''
  },
  {
    id: '47819249001',
    clientId: '6',
    clientName: 'Mattew Black',
    service: 'Social Dysfunction',
    price: 220,
    date: '2024-02-24T11:00:00',
    duration: '1 hour 30 minutes',
    status: 'applied',
    notes: ''
  },
  {
    id: '47819249002',
    clientId: '6',
    clientName: 'Mattew Black',
    service: 'Child Rearing Psychological Consultation',
    price: 200,
    date: '2024-02-20T10:00:00',
    duration: '1 hour 15 minutes',
    status: 'conducted',
    notes: ''
  },
  {
    id: '47819249003',
    clientId: '6',
    clientName: 'Mattew Black',
    service: 'Gestalt Psychology',
    price: 200,
    date: '2024-02-15T14:00:00',
    duration: '1 hour 30 minutes',
    status: 'new',
    notes: ''
  },
  {
    id: '47819249004',
    clientId: '6',
    clientName: 'Mattew Black',
    service: 'Family Psychological Counseling',
    price: 160,
    date: '2024-01-28T16:00:00',
    duration: '1 hour',
    status: 'conducted',
    notes: ''
  },
  {
    id: '47819249005',
    clientId: '6',
    clientName: 'Mattew Black',
    service: 'Social Dysfunction',
    price: 220,
    date: '2024-01-15T11:00:00',
    duration: '1 hour 30 minutes',
    status: 'rejected',
    notes: 'Client cancelled'
  },
  ...Array.from({ length: 50 }, (_, i) => {
    const client = clients[i % 20];
    const services = ['Individual Therapy', 'Group Therapy', 'Online Consultation', 'Family Counseling', 'Couples Therapy'];
    const statuses: Session['status'][] = ['applied', 'new', 'conducted', 'rejected'];
    return {
      id: `sess${i + 6}`,
      clientId: client.id,
      clientName: client.name,
      service: services[i % 5],
      price: [160, 200, 220, 250, 300][i % 5],
      date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
      duration: ['1 hour', '1 hour 15 minutes', '1 hour 30 minutes', '45 minutes'][i % 4],
      status: statuses[Math.floor(Math.random() * 4)],
      notes: ''
    };
  })
];

// Investments
export const investments: Investment[] = [
  {
    id: 'inv1',
    name: 'Tech Stocks Portfolio',
    type: 'Stocks',
    amount: 50000,
    currentValue: 54000,
    return: 4000,
    returnPercent: 8,
    date: '2024-01-15'
  },
  {
    id: 'inv2',
    name: 'Real Estate Fund',
    type: 'Real Estate',
    amount: 100000,
    currentValue: 108000,
    return: 8000,
    returnPercent: 8,
    date: '2023-06-20'
  },
  {
    id: 'inv3',
    name: 'Cryptocurrency',
    type: 'Crypto',
    amount: 20000,
    currentValue: 24000,
    return: 4000,
    returnPercent: 20,
    date: '2024-03-10'
  },
  {
    id: 'inv4',
    name: 'Bonds Portfolio',
    type: 'Bonds',
    amount: 75000,
    currentValue: 78000,
    return: 3000,
    returnPercent: 4,
    date: '2023-12-05'
  }
];

// Investment Templates (настройки инвестиций)
export const investmentTemplates: InvestmentTemplate[] = [
  {
    id: 'tpl1',
    name: 'Tech Stocks Portfolio',
    type: 'Stocks',
    whereInvested: 'Apple, Microsoft, Google',
    comments: 'Diversified portfolio of technology stocks',
    createdAt: '2024-01-15'
  },
  {
    id: 'tpl2',
    name: 'Real Estate Fund',
    type: 'Real Estate',
    whereInvested: 'REIT Funds',
    comments: 'Real estate investments through REIT',
    createdAt: '2023-06-20'
  },
  {
    id: 'tpl3',
    name: 'Cryptocurrency',
    type: 'Crypto',
    whereInvested: 'Bitcoin, Ethereum',
    comments: 'Cryptocurrency investments',
    createdAt: '2024-03-10'
  },
  {
    id: 'tpl4',
    name: 'Bonds Portfolio',
    type: 'Bonds',
    whereInvested: 'Government Bonds',
    comments: 'Conservative bond investments',
    createdAt: '2023-12-05'
  }
];

// Goals
export const goals: Goal[] = [
  {
    id: 'g1',
    title: 'Monthly Revenue Target',
    description: 'Achieve $20,000 monthly revenue',
    target: 20000,
    current: 13567,
    deadline: '2025-01-31',
    status: 'in-progress',
    subtasks: [
      {
        id: 'g1-s1',
        title: 'Session revenue',
        target: 12000,
        current: 8200,
        subtasks: [
          { id: 'g1-s1-t1', title: 'Individual sessions', target: 8000, current: 5600 },
          { id: 'g1-s1-t2', title: 'Group sessions', target: 4000, current: 2600 },
        ],
      },
      {
        id: 'g1-s2',
        title: 'Consultations & other',
        target: 8000,
        current: 5367,
        subtasks: [
          { id: 'g1-s2-t1', title: 'Online consultations', target: 5000, current: 3200 },
          { id: 'g1-s2-t2', title: 'Workshops', target: 3000, current: 2167 },
        ],
      },
    ],
  },
  {
    id: 'g2',
    title: 'Client Acquisition',
    description: 'Reach 30 active clients',
    target: 30,
    current: 20,
    deadline: '2025-03-31',
    status: 'in-progress',
    subtasks: [
      {
        id: 'g2-s1',
        title: 'Organic channels',
        target: 15,
        current: 10,
        subtasks: [
          { id: 'g2-s1-t1', title: 'Social media', target: 8, current: 5 },
          { id: 'g2-s1-t2', title: 'Referrals', target: 7, current: 5 },
        ],
      },
      {
        id: 'g2-s2',
        title: 'Paid acquisition',
        target: 15,
        current: 10,
        subtasks: [
          { id: 'g2-s2-t1', title: 'Ads', target: 10, current: 7 },
          { id: 'g2-s2-t2', title: 'Partnerships', target: 5, current: 3 },
        ],
      },
    ],
  },
  {
    id: 'g3',
    title: 'Session Completion Rate',
    description: 'Maintain 95% session completion rate',
    target: 95,
    current: 92,
    deadline: '2025-02-28',
    status: 'in-progress'
  },
  {
    id: 'g4',
    title: 'Investment Growth',
    description: 'Reach $200,000 in investments',
    target: 200000,
    current: 164000,
    deadline: '2025-06-30',
    status: 'in-progress'
  },
  {
    id: 'g5',
    title: 'Online Presence',
    description: 'Reach 1000 followers on social media',
    target: 1000,
    current: 750,
    deadline: '2025-04-30',
    status: 'in-progress'
  },
  {
    id: 'g6',
    title: 'Quarterly Target Q4',
    description: 'Complete Q4 revenue goal',
    target: 50000,
    current: 50000,
    deadline: '2024-12-31',
    status: 'completed'
  },
  {
    id: 'g7',
    title: 'New Office Setup',
    description: 'Prepare new office space',
    target: 1,
    current: 0,
    deadline: '2025-08-31',
    status: 'on-hold'
  }
];

// Orders
export const orders: Order[] = [
  {
    id: 'ord1',
    clientId: '1',
    clientName: 'Carter Mills',
    items: ['Individual Therapy Session', 'Follow-up Consultation'],
    total: 440,
    date: '2025-01-20',
    status: 'completed'
  },
  {
    id: 'ord2',
    clientId: '6',
    clientName: 'Mattew Black',
    items: ['Social Dysfunction', 'Family Counseling'],
    total: 380,
    date: '2025-01-15',
    status: 'completed'
  },
  {
    id: 'ord3',
    clientId: '9',
    clientName: 'Darlene Robertson',
    items: ['Individual Therapy Session'],
    total: 220,
    date: '2025-01-22',
    status: 'processing'
  },
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `ord${i + 4}`,
    clientId: String((i % 20) + 1),
    clientName: clients[i % 20].name,
    items: ['Therapy Session', 'Consultation'],
    total: Math.floor(Math.random() * 500) + 100,
    date: new Date(2025, 0, Math.floor(Math.random() * 30) + 1).toISOString().split('T')[0],
    status: ['pending', 'processing', 'completed', 'cancelled'][Math.floor(Math.random() * 4)] as Order['status']
  }))
];

// Services
export const services: Service[] = [
  {
    id: 'srv1',
    name: 'Individual Therapy Session',
    description: 'One-on-one therapy session with a licensed therapist',
    price: 220,
    duration: '1 hour',
    category: 'Therapy',
    isActive: true,
    createdAt: '2024-01-15'
  },
  {
    id: 'srv2',
    name: 'Follow-up Consultation',
    description: 'Follow-up consultation session',
    price: 180,
    duration: '45 minutes',
    category: 'Consultation',
    isActive: true,
    createdAt: '2024-01-15'
  },
  {
    id: 'srv3',
    name: 'Social Dysfunction',
    description: 'Specialized therapy for social dysfunction issues',
    price: 220,
    duration: '1 hour 30 minutes',
    category: 'Therapy',
    isActive: true,
    createdAt: '2024-02-10'
  },
  {
    id: 'srv4',
    name: 'Family Counseling',
    description: 'Family psychological counseling session',
    price: 160,
    duration: '1 hour',
    category: 'Counseling',
    isActive: true,
    createdAt: '2024-01-20'
  },
  {
    id: 'srv5',
    name: 'Child Rearing Psychological Consultation',
    description: 'Consultation for child rearing psychological support',
    price: 200,
    duration: '1 hour 15 minutes',
    category: 'Consultation',
    isActive: true,
    createdAt: '2024-02-05'
  },
  {
    id: 'srv6',
    name: 'Group Therapy Session',
    description: 'Group therapy session with multiple participants',
    price: 120,
    duration: '1 hour 30 minutes',
    category: 'Therapy',
    isActive: true,
    createdAt: '2024-01-25'
  },
  {
    id: 'srv7',
    name: 'Online Consultation',
    description: 'Remote consultation via video call',
    price: 200,
    duration: '1 hour',
    category: 'Consultation',
    isActive: true,
    createdAt: '2024-01-10'
  },
  {
    id: 'srv8',
    name: 'Couples Therapy',
    description: 'Therapy session for couples',
    price: 250,
    duration: '1 hour',
    category: 'Therapy',
    isActive: true,
    createdAt: '2024-02-15'
  }
];

// Dashboard Metrics
export const dashboardMetrics = {
  revenue: 13567,
  payments: 7,
  averageCheck: 272,
  sessions: 8,
  sessionTypes: [
    { name: 'Individual', value: 45, color: '#0284c7', revenue: 9900, avgDuration: '1 h', trend: 12 },
    { name: 'Pair', value: 25, color: '#6366f1', revenue: 5500, avgDuration: '1 h 15 min', trend: 5 },
    { name: 'Online', value: 20, color: '#0d9488', revenue: 4000, avgDuration: '45 min', trend: -2 },
    { name: 'Group', value: 10, color: '#0891b2', revenue: 1800, avgDuration: '1 h 30 min', trend: 8 }
  ],
  dynamics: [
    { month: 'JAN', value: 5 },
    { month: 'FEB', value: 7 },
    { month: 'MAR', value: 6 },
    { month: 'APR', value: 9 },
    { month: 'MAY', value: 8 },
    { month: 'JUN', value: 10 },
    { month: 'JUL', value: 12 }
  ],
  leadSources: [
    { source: 'Telegram', value: 44 },
    { source: 'Instagram', value: 24 },
    { source: 'Website', value: 128 },
    { source: 'Offline', value: 69 },
    { source: 'Advertising', value: 41 }
  ],
  totalBalance: 80440,
  totalSpending: 64200,
  salesOverview: [
    { month: 'Jan', value: 32000 },
    { month: 'Feb', value: 28000 },
    { month: 'Mar', value: 35000 },
    { month: 'Apr', value: 64200 },
    { month: 'May', value: 64200 },
    { month: 'Jun', value: 64200 },
    { month: 'Jul', value: 45000 },
    { month: 'Aug', value: 38000 },
    { month: 'Sep', value: 42000 }
  ]
};

// Bank Cards
export const bankCards = [
  {
    id: 'card1',
    amount: 64200,
    currency: 'USD',
    status: 'active',
    holder: 'NICK OHNY',
    expiry: '05/26',
    type: 'visa'
  },
  {
    id: 'card2',
    amount: 44200,
    currency: 'USD',
    status: 'active',
    holder: 'JOHN SMITH',
    expiry: '08/27',
    type: 'mastercard'
  },
  {
    id: 'card3',
    amount: 32000,
    currency: 'USD',
    status: 'active',
    holder: 'ASHLEY B',
    expiry: '12/25',
    type: 'visa'
  },
  {
    id: 'card4',
    amount: 28000,
    currency: 'USD',
    status: 'active',
    holder: 'CARTER M',
    expiry: '03/26',
    type: 'mastercard'
  }
];
