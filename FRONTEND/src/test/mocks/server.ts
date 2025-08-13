import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Setup MSW server for Node.js environment (tests)
export const server = setupServer(...handlers);

// Enable API mocking before tests
beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'warn'
  });
});

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
});

// Clean up after tests
afterAll(() => {
  server.close();
});