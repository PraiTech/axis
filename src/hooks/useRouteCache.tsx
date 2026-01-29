import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

// Cache для загруженных компонентов
const componentCache = new Map<string, React.ComponentType<any>>();

// Предзагруженные компоненты
const preloadedComponents = new Set<string>();

export function useRouteCache() {
  const location = useLocation();
  const [loadedRoutes, setLoadedRoutes] = useState<Set<string>>(new Set(['/']));
  const cacheRef = useRef<Map<string, React.ComponentType<any>>>(new Map());

  // Предзагрузка всех маршрутов
  useEffect(() => {
    const routes = [
      '/',
      '/clients',
      '/payments',
      '/transactions',
      '/invoices',
      '/schedule',
      '/investment',
      '/goals',
      '/orders',
      '/settings',
    ];

    // Предзагружаем все маршруты сразу
    routes.forEach((route) => {
      if (!preloadedComponents.has(route)) {
        preloadedComponents.add(route);
        // Импортируем компоненты заранее
        import(`@/pages/${route === '/' ? 'Dashboard' : route.slice(1).charAt(0).toUpperCase() + route.slice(2)}`)
          .catch(() => {
            // Игнорируем ошибки для несуществующих маршрутов
          });
      }
    });
  }, []);

  useEffect(() => {
    setLoadedRoutes((prev) => new Set([...prev, location.pathname]));
  }, [location.pathname]);

  return { loadedRoutes, cacheRef };
}

// Функция для предзагрузки маршрута
export function prefetchRoute(routePath: string) {
  if (preloadedComponents.has(routePath)) {
    return;
  }

  preloadedComponents.add(routePath);
  const componentName = routePath === '/' 
    ? 'Dashboard' 
    : routePath.slice(1).charAt(0).toUpperCase() + routePath.slice(2);

  import(`@/pages/${componentName}`)
    .then((module) => {
      componentCache.set(routePath, module.default);
    })
    .catch(() => {
      // Игнорируем ошибки
    });
}
