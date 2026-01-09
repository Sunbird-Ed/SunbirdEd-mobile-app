import { render, screen } from '@testing-library/react';
import App from './App';

// Mock Ionic components
jest.mock('@ionic/react', () => ({
  IonApp: ({ children }: any) => <div data-testid="ion-app">{children}</div>,
  IonTabs: ({ children }: any) => <div data-testid="ion-tabs">{children}</div>,
  IonRouterOutlet: ({ children }: any) => <div data-testid="ion-router-outlet">{children}</div>,
  IonTabBar: ({ children }: any) => <div data-testid="ion-tab-bar">{children}</div>,
  IonTabButton: ({ children, tab, href }: any) => (
    <button data-testid={`tab-button-${tab}`} data-href={href}>
      {children}
    </button>
  ),
  IonIcon: ({ icon }: any) => <span data-testid="ion-icon">{icon}</span>,
  IonLabel: ({ children }: any) => <span data-testid="ion-label">{children}</span>,
  setupIonicReact: jest.fn(),
}));

jest.mock('@ionic/react-router', () => ({
  IonReactRouter: ({ children }: any) => <div data-testid="ion-react-router">{children}</div>,
}));

jest.mock('react-router-dom', () => ({
  Route: ({ children, path }: any) => <div data-testid={`route-${path}`}>{children}</div>,
  Redirect: ({ to }: any) => <div data-testid={`redirect-${to}`}>Redirect to {to}</div>,
}));

jest.mock('ionicons/icons', () => ({
  home: 'home-icon',
  person: 'person-icon',
  statsChart: 'stats-chart-icon',
}));

jest.mock('./pages/Home', () => ({
  __esModule: true,
  default: () => <div data-testid="home-page">Home Page</div>,
}));

jest.mock('./pages/Dashboard', () => ({
  __esModule: true,
  default: () => <div data-testid="dashboard-page">Dashboard Page</div>,
}));

jest.mock('./pages/Profile', () => ({
  __esModule: true,
  default: () => <div data-testid="profile-page">Profile Page</div>,
}));

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('ion-app')).toBeInTheDocument();
  });

  it('renders IonReactRouter', () => {
    render(<App />);
    expect(screen.getByTestId('ion-react-router')).toBeInTheDocument();
  });

  it('renders IonTabs', () => {
    render(<App />);
    expect(screen.getByTestId('ion-tabs')).toBeInTheDocument();
  });

  it('renders tab bar with three tabs', () => {
    render(<App />);
    expect(screen.getByTestId('tab-button-home')).toBeInTheDocument();
    expect(screen.getByTestId('tab-button-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('tab-button-profile')).toBeInTheDocument();
  });

  it('renders tab buttons with correct labels', () => {
    render(<App />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('tab buttons have correct href attributes', () => {
    render(<App />);
    expect(screen.getByTestId('tab-button-home')).toHaveAttribute('data-href', '/home');
    expect(screen.getByTestId('tab-button-dashboard')).toHaveAttribute('data-href', '/dashboard');
    expect(screen.getByTestId('tab-button-profile')).toHaveAttribute('data-href', '/profile');
  });

  it('renders all route components', () => {
    render(<App />);
    expect(screen.getByTestId('route-/home')).toBeInTheDocument();
    expect(screen.getByTestId('route-/dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('route-/profile')).toBeInTheDocument();
  });

  it('renders redirect to home route', () => {
    render(<App />);
    expect(screen.getByTestId('redirect-/home')).toBeInTheDocument();
  });
});
