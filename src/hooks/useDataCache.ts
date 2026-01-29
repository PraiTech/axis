// Простой кеш для данных
const dataCache = new Map<string, any>();
let preloaded = false;

// Предзагрузка всех данных - вызывается при старте приложения
export function preloadAllData() {
  if (preloaded) return; // Уже загружено
  
  // Импортируем данные заранее, чтобы они были в памяти
  import('@/data/mockData').then((mockData) => {
    // Кешируем все данные сразу
    dataCache.set('dashboardMetrics', mockData.dashboardMetrics);
    dataCache.set('clients', mockData.clients);
    dataCache.set('sessions', mockData.sessions);
    dataCache.set('transactions', mockData.transactions);
    dataCache.set('payments', mockData.payments);
    dataCache.set('invoices', mockData.invoices);
    dataCache.set('orders', mockData.orders);
    dataCache.set('investments', mockData.investments);
    dataCache.set('goals', mockData.goals);
    dataCache.set('bankCards', mockData.bankCards);
    preloaded = true;
  }).catch(() => {
    // Игнорируем ошибки
  });
}

// Хук для получения закешированных данных
export function useCachedData<T>(key: string, data: T): T {
  // Данные уже в памяти благодаря прямому импорту, просто возвращаем
  return data;
}
