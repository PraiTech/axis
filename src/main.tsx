import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import logger from './lib/logger'
import { AuthProvider } from './contexts/AuthContext'

// Логирование инициализации приложения
logger.info('SYSTEM', 'PsyTrack application initialization', {
  timestamp: new Date().toISOString(),
  environment: import.meta.env.MODE,
  version: import.meta.env.VITE_APP_VERSION || '1.0.0'
}, 'Application', 'INIT');

const rootElement = document.getElementById('app');
if (!rootElement) {
  logger.error('SYSTEM', 'Root element #app not found', undefined, 'Application', 'INIT_ERROR');
  throw new Error('Root element not found');
}

logger.debug('SYSTEM', 'Root element found', { elementId: 'app' }, 'Application', 'INIT');

const root = createRoot(rootElement);
logger.debug('SYSTEM', 'React root created', undefined, 'Application', 'INIT');

// Глобальные обработчики ошибок
window.addEventListener('error', (event) => {
  logger.error('GLOBAL_ERROR', 'Unhandled error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  }, 'GlobalErrorHandler', 'UNHANDLED_ERROR');
});

window.addEventListener('unhandledrejection', (event) => {
  logger.error('GLOBAL_ERROR', 'Unhandled promise rejection', {
    reason: event.reason,
    promise: event.promise
  }, 'GlobalErrorHandler', 'UNHANDLED_REJECTION');
});

// Логирование производительности
if ('performance' in window) {
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (perfData) {
      logger.info('PERFORMANCE', 'Page load metrics', {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        totalTime: perfData.loadEventEnd - perfData.fetchStart
      }, 'Performance', 'PAGE_LOAD');
    }
  });
}

root.render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);

logger.success('SYSTEM', 'Application successfully started', {
  strictMode: true,
  renderTime: new Date().toISOString()
}, 'Application', 'MOUNTED');
