import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Setup MSW worker for browser environment
export const worker = setupWorker(...handlers);

// Start the worker in development mode
if (process.env.NODE_ENV === 'development') {
  worker.start({
    onUnhandledRequest: 'warn'
  });
}