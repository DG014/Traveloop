import '@testing-library/jest-dom';

const IntersectionObserverMock = class {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserverMock
});

const ResizeObserverMock = class {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: ResizeObserverMock
});

