import { render, screen } from '@testing-library/react';
import Home from './Home';

// Mock Ionic components
jest.mock('@ionic/react', () => ({
  IonPage: ({ children }: any) => <div data-testid="ion-page">{children}</div>,
  IonHeader: ({ children }: any) => <header data-testid="ion-header">{children}</header>,
  IonToolbar: ({ children }: any) => <div data-testid="ion-toolbar">{children}</div>,
  IonTitle: ({ children }: any) => <h1 data-testid="ion-title">{children}</h1>,
  IonContent: ({ children }: any) => <main data-testid="ion-content">{children}</main>,
  IonCard: ({ children }: any) => <div data-testid="ion-card">{children}</div>,
  IonCardHeader: ({ children }: any) => <div data-testid="ion-card-header">{children}</div>,
  IonCardTitle: ({ children }: any) => <h2 data-testid="ion-card-title">{children}</h2>,
  IonCardContent: ({ children }: any) => <div data-testid="ion-card-content">{children}</div>,
  IonButton: ({ children, color, expand, className }: any) => (
    <button data-testid="ion-button" data-color={color} data-expand={expand} className={className}>
      {children}
    </button>
  ),
}));

describe('Home Component', () => {
  beforeEach(() => {
    render(<Home />);
  });

  it('renders without crashing', () => {
    expect(screen.getByTestId('ion-page')).toBeInTheDocument();
  });

  it('renders the page title', () => {
    expect(screen.getByText('Sahayak - Home')).toBeInTheDocument();
  });

  it('renders the condensed header title', () => {
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('renders welcome card with title', () => {
    expect(screen.getByText('Welcome to Sahayak')).toBeInTheDocument();
  });

  it('renders welcome message', () => {
    expect(screen.getByText(/Your educational management companion app/i)).toBeInTheDocument();
  });

  it('renders Quick Actions card', () => {
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
  });

  it('renders View Students button', () => {
    const buttons = screen.getAllByTestId('ion-button');
    const viewStudentsButton = buttons.find(button => button.textContent === 'View Students');
    expect(viewStudentsButton).toBeInTheDocument();
    expect(viewStudentsButton).toHaveAttribute('data-color', 'primary');
    expect(viewStudentsButton).toHaveAttribute('data-expand', 'block');
  });

  it('renders Track Progress button', () => {
    const buttons = screen.getAllByTestId('ion-button');
    const trackProgressButton = buttons.find(button => button.textContent === 'Track Progress');
    expect(trackProgressButton).toBeInTheDocument();
    expect(trackProgressButton).toHaveAttribute('data-color', 'secondary');
    expect(trackProgressButton).toHaveAttribute('data-expand', 'block');
  });

  it('renders two cards', () => {
    const cards = screen.getAllByTestId('ion-card');
    expect(cards).toHaveLength(2);
  });

  it('renders content area with padding', () => {
    const content = screen.getByTestId('ion-content');
    expect(content.querySelector('.ion-padding')).toBeInTheDocument();
  });

  it('Track Progress button has margin-top class', () => {
    const buttons = screen.getAllByTestId('ion-button');
    const trackProgressButton = buttons.find(button => button.textContent === 'Track Progress');
    expect(trackProgressButton).toHaveClass('ion-margin-top');
  });
});
