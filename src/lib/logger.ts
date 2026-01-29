/**
 * Подробная система логирования для консоли
 * Поддерживает различные уровни логирования с цветами и форматированием
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
}

interface LogEntry {
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  timestamp: string;
  component?: string;
  action?: string;
}

class Logger {
  private isEnabled: boolean = true;
  private logHistory: LogEntry[] = [];
  private maxHistorySize: number = 1000;

  constructor() {
    // Включаем логирование в development режиме
    this.isEnabled = import.meta.env.DEV || true;
  }

  private formatTimestamp(): string {
    const now = new Date();
    return now.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });
  }

  private getLogStyle(level: LogLevel): string {
    const styles: Record<LogLevel, string> = {
      [LogLevel.DEBUG]: 'color: #6b7280; font-weight: normal;',
      [LogLevel.INFO]: 'color: #3b82f6; font-weight: normal;',
      [LogLevel.WARN]: 'color: #f59e0b; font-weight: bold;',
      [LogLevel.ERROR]: 'color: #ef4444; font-weight: bold;',
      [LogLevel.SUCCESS]: 'color: #10b981; font-weight: bold;',
    };
    return styles[level] || '';
  }

  private getLogIcon(level: LogLevel): string {
    const icons: Record<LogLevel, string> = {
      [LogLevel.DEBUG]: '🔍',
      [LogLevel.INFO]: 'ℹ️',
      [LogLevel.WARN]: '⚠️',
      [LogLevel.ERROR]: '❌',
      [LogLevel.SUCCESS]: '✅',
    };
    return icons[level] || '';
  }

  private log(level: LogLevel, category: string, message: string, data?: any, component?: string, action?: string) {
    if (!this.isEnabled) return;

    const timestamp = this.formatTimestamp();
    const entry: LogEntry = {
      level,
      category,
      message,
      data,
      timestamp,
      component,
      action,
    };

    // Сохраняем в историю
    this.logHistory.push(entry);
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }

    // Формируем сообщение для консоли
    const icon = this.getLogIcon(level);
    const style = this.getLogStyle(level);
    const componentInfo = component ? `[${component}]` : '';
    const actionInfo = action ? ` → ${action}` : '';
    const categoryInfo = category ? `[${category}]` : '';

    const logMessage = `%c${icon} [${timestamp}] ${level} ${categoryInfo} ${componentInfo}${actionInfo} ${message}`;

    // Выбираем метод консоли в зависимости от уровня
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(logMessage, style, data || '');
        break;
      case LogLevel.INFO:
        console.info(logMessage, style, data || '');
        break;
      case LogLevel.WARN:
        console.warn(logMessage, style, data || '');
        break;
      case LogLevel.ERROR:
        console.error(logMessage, style, data || '');
        if (data instanceof Error) {
          console.error('Stack trace:', data.stack);
        }
        break;
      case LogLevel.SUCCESS:
        console.log(logMessage, style, data || '');
        break;
      default:
        console.log(logMessage, style, data || '');
    }

    // Группируем данные, если они есть
    if (data && typeof data === 'object' && !(data instanceof Error)) {
      console.groupCollapsed('📦 Данные');
      console.log(data);
      console.groupEnd();
    }
  }

  // Публичные методы для разных уровней логирования
  debug(category: string, message: string, data?: any, component?: string, action?: string) {
    this.log(LogLevel.DEBUG, category, message, data, component, action);
  }

  info(category: string, message: string, data?: any, component?: string, action?: string) {
    this.log(LogLevel.INFO, category, message, data, component, action);
  }

  warn(category: string, message: string, data?: any, component?: string, action?: string) {
    this.log(LogLevel.WARN, category, message, data, component, action);
  }

  error(category: string, message: string, data?: any, component?: string, action?: string) {
    this.log(LogLevel.ERROR, category, message, data, component, action);
  }

  success(category: string, message: string, data?: any, component?: string, action?: string) {
    this.log(LogLevel.SUCCESS, category, message, data, component, action);
  }

  // Специализированные методы для частых случаев
  componentMount(componentName: string, props?: any) {
    this.info('COMPONENT', `Компонент ${componentName} смонтирован`, props, componentName, 'MOUNT');
  }

  componentUnmount(componentName: string) {
    this.info('COMPONENT', `Компонент ${componentName} размонтирован`, undefined, componentName, 'UNMOUNT');
  }

  stateChange(componentName: string, stateName: string, oldValue: any, newValue: any) {
    this.debug('STATE', `Изменение состояния: ${stateName}`, { oldValue, newValue }, componentName, 'STATE_CHANGE');
  }

  userAction(componentName: string, action: string, data?: any) {
    this.info('USER_ACTION', `Действие пользователя: ${action}`, data, componentName, action);
  }

  routeChange(from: string, to: string) {
    this.info('ROUTING', `Переход с ${from} на ${to}`, { from, to }, 'Router', 'ROUTE_CHANGE');
  }

  dataFetch(componentName: string, source: string, data?: any) {
    this.info('DATA', `Загрузка данных из ${source}`, data, componentName, 'FETCH');
  }

  render(componentName: string, props?: any) {
    this.debug('RENDER', `Рендеринг компонента ${componentName}`, props, componentName, 'RENDER');
  }

  // Получить историю логов
  getHistory(): LogEntry[] {
    return [...this.logHistory];
  }

  // Очистить историю
  clearHistory() {
    this.logHistory = [];
    console.clear();
    this.info('SYSTEM', 'Log history cleared', undefined, 'Logger', 'CLEAR');
  }

  // Включить/выключить логирование
  enable() {
    this.isEnabled = true;
    this.info('SYSTEM', 'Logging enabled', undefined, 'Logger', 'ENABLE');
  }

  disable() {
    this.isEnabled = false;
    console.log('Logging disabled');
  }

  // Экспорт истории в консоль
  exportHistory() {
    console.group('📋 История логов');
    this.logHistory.forEach((entry, index) => {
      const icon = this.getLogIcon(entry.level);
      const style = this.getLogStyle(entry.level);
      console.log(
        `%c${icon} [${entry.timestamp}] ${entry.level} [${entry.category}] ${entry.message}`,
        style,
        entry.data || ''
      );
    });
    console.groupEnd();
    return this.logHistory;
  }
}

// Создаем единственный экземпляр логгера
export const logger = new Logger();

// Экспортируем для удобства
export default logger;
