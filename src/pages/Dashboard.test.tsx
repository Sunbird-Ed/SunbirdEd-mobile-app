import { render, screen } from '@testing-library/react';
import Dashboard from './Dashboard';

// Mock Ionic components
jest.mock('@ionic/react', () => ({
  IonPage: ({ children }: any) => <div data-testid="ion-page">{children}</div>,
  IonHeader: ({ children }: any) => <header data-testid="ion-header">{children}</header>,
  IonToolbar: ({ children }: any) => <div data-testid="ion-toolbar">{children}</div>,
  IonTitle: ({ children, size }: any) => (
    <h1 data-testid="ion-title" data-size={size}>{children}</h1>
  ),
  IonContent: ({ children }: any) => <main data-testid="ion-content">{children}</main>,
  IonCard: ({ children }: any) => <div data-testid="ion-card">{children}</div>,
  IonCardHeader: ({ children }: any) => <div data-testid="ion-card-header">{children}</div>,
  IonCardTitle: ({ children }: any) => <h2 data-testid="ion-card-title">{children}</h2>,
  IonCardContent: ({ children }: any) => <div data-testid="ion-card-content">{children}</div>,
  IonList: ({ children }: any) => <ul data-testid="ion-list">{children}</ul>,
  IonItem: ({ children }: any) => <li data-testid="ion-item">{children}</li>,
  IonLabel: ({ children }: any) => <div data-testid="ion-label">{children}</div>,
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    render(<Dashboard />);
  });

  it('renders without crashing', () => {
    expect(screen.getByTestId('ion-page')).toBeInTheDocument();
  });

  it('renders the page title', () => {
    const titles = screen.getAllByText('Dashboard');
    expect(titles.length).toBeGreaterThan(0);
    expect(titles[0]).toBeInTheDocument();
  });

  it('renders the Analytics Overview card', () => {
    expect(screen.getByText('Analytics Overview')).toBeInTheDocument();
  });

  it('renders list of analytics items', () => {
    expect(screen.getByTestId('ion-list')).toBeInTheDocument();
  });

  it('renders Total Students item', () => {
    expect(screen.getByText('Total Students')).toBeInTheDocument();
    expect(screen.getByText('125 students enrolled')).toBeInTheDocument();
  });

  it('renders Active Sessions item', () => {
    expect(screen.getByText('Active Sessions')).toBeInTheDocument();
    expect(screen.getByText('12 ongoing sessions')).toBeInTheDocument();
  });

  it('renders Completion Rate item', () => {
    expect(screen.getByText('Completion Rate')).toBeInTheDocument();
    expect(screen.getByText('87% average completion')).toBeInTheDocument();
  });

  it('renders three list items', () => {
    const items = screen.getAllByTestId('ion-item');
    expect(items).toHaveLength(3);
  });

  it('renders content area with padding', () => {
    const content = screen.getByTestId('ion-content');
    expect(content.querySelector('.ion-padding')).toBeInTheDocument();
  });

  it('each list item has a label', () => {
    const labels = screen.getAllByTestId('ion-label');
    expect(labels).toHaveLength(3);
  });

  it('renders header with collapse="condense"', () => {
    const headers = screen.getAllByTestId('ion-header');
    expect(headers.length).toBeGreaterThan(0);
  });

  it('renders large title in condensed header', () => {
    const titles = screen.getAllByTestId('ion-title');
    const largeTitle = titles.find(title => title.getAttribute('data-size') === 'large');
    expect(largeTitle).toBeInTheDocument();
  });
});
