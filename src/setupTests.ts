import '@testing-library/jest-dom';

// Mock Ionic CSS imports
jest.mock('@ionic/react/css/core.css', () => ({}));
jest.mock('@ionic/react/css/normalize.css', () => ({}));
jest.mock('@ionic/react/css/structure.css', () => ({}));
jest.mock('@ionic/react/css/typography.css', () => ({}));
jest.mock('@ionic/react/css/padding.css', () => ({}));
jest.mock('@ionic/react/css/float-elements.css', () => ({}));
jest.mock('@ionic/react/css/text-alignment.css', () => ({}));
jest.mock('@ionic/react/css/text-transformation.css', () => ({}));
jest.mock('@ionic/react/css/flex-utils.css', () => ({}));
jest.mock('@ionic/react/css/display.css', () => ({}));
jest.mock('./theme/variables.css', () => ({}));
jest.mock('./pages/Home.css', () => ({}));

// Global test setup
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
