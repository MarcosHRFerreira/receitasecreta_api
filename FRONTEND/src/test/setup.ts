import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock localStorage
const storage: { [key: string]: string } = {};

const localStorageMock: Storage = {
  length: 0,
  key: (index: number) => {
    const keys = Object.keys(storage);
    return keys[index] || null;
  },
  getItem: (key: string) => {
    return storage[key] || null;
  },
  setItem: (key: string, value: string) => {
    storage[key] = value;
  },
  removeItem: (key: string) => {
    delete storage[key];
  },
  clear: () => {
    Object.keys(storage).forEach(key => {
      delete storage[key];
    });
  },
};

// Update length property
Object.defineProperty(localStorageMock, 'length', {
  get: () => Object.keys(storage).length,
});

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});