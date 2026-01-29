import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { lazy, Suspense, useEffect } from 'react';
import { PageSkeleton } from '@/components/shared/SkeletonLoader';
import { preloadAllData } from '@/hooks/useDataCache';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import logger from '@/lib/logger';

// Lazy load pages for code splitting с предзагрузкой
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Clients = lazy(() => import('@/pages/Clients'));
const Payments = lazy(() => import('@/pages/Payments'));
const Transactions = lazy(() => import('@/pages/Transactions'));
const Invoices = lazy(() => import('@/pages/Invoices'));
const Schedule = lazy(() => import('@/pages/Schedule'));
const Investment = lazy(() => import('@/pages/Investment'));
const Goals = lazy(() => import('@/pages/Goals'));
const Orders = lazy(() => import('@/pages/Orders'));
const Settings = lazy(() => import('@/pages/Settings'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));

// Предзагружаем все данные при старте
preloadAllData();

// Предзагружаем все маршруты в фоне после загрузки основного контента
// Используем requestIdleCallback для неблокирующей загрузки
if (typeof window !== 'undefined') {
  const preloadRoutes = () => {
    const routes = [
      () => import('@/pages/Dashboard'),
      () => import('@/pages/Clients'),
      () => import('@/pages/Payments'),
      () => import('@/pages/Transactions'),
      () => import('@/pages/Invoices'),
      () => import('@/pages/Schedule'),
      () => import('@/pages/Investment'),
      () => import('@/pages/Goals'),
      () => import('@/pages/Orders'),
      () => import('@/pages/Settings'),
    ];

    // Загружаем маршруты в фоне с большим интервалом, чтобы не мешать скроллу и вводу
    routes.forEach((routeLoader, index) => {
      setTimeout(() => {
        routeLoader().catch(() => {});
      }, 2000 + index * 300);
    });
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(preloadRoutes, { timeout: 3000 });
  } else {
    setTimeout(preloadRoutes, 2500);
  }
}

// Компонент для отслеживания изменений маршрута
function RouteTracker() {
  const location = useLocation();

  useEffect(() => {
    logger.routeChange(location.pathname, location.pathname);
    logger.info('ROUTING', `Текущий маршрут: ${location.pathname}`, {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      key: location.key
    }, 'Router', 'ROUTE_ACTIVE');
  }, [location]);

  return null;
}

function App() {
  useEffect(() => {
    logger.componentMount('App');
    logger.info('ROUTING', 'Router initialization', {
      routes: [
        '/', '/clients', '/payments', '/transactions', 
        '/invoices', '/schedule', '/investment', '/goals', '/orders', '/settings'
      ]
    }, 'App', 'INIT');
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
          <RouteTracker />
          <Routes>
          {/* Публичные роуты */}
          <Route
            path="/login"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <Login />
              </Suspense>
            }
          />
          <Route
            path="/register"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <Register />
              </Suspense>
            }
          />

          {/* Защищенные роуты */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <Dashboard />
                </Suspense>
              }
            />
            <Route
              path="clients"
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <Clients />
                </Suspense>
              }
            />
            <Route
              path="payments"
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <Payments />
                </Suspense>
              }
            />
            <Route
              path="transactions"
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <Transactions />
                </Suspense>
              }
            />
            <Route
              path="invoices"
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <Invoices />
                </Suspense>
              }
            />
            <Route
              path="schedule"
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <Schedule />
                </Suspense>
              }
            />
            <Route
              path="investment"
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <Investment />
                </Suspense>
              }
            />
            <Route
              path="goals"
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <Goals />
                </Suspense>
              }
            />
            <Route
              path="orders"
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <Orders />
                </Suspense>
              }
            />
            <Route
              path="settings"
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <Settings />
                </Suspense>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
