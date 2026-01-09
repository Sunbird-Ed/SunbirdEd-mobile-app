import { render, screen } from '@testing-library/react';
import Profile from './Profile';

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
  IonCardContent: ({ children, className }: any) => (
    <div data-testid="ion-card-content" className={className}>{children}</div>
  ),
  IonAvatar: ({ children, style }: any) => (
    <div data-testid="ion-avatar" style={style}>{children}</div>
  ),
  IonList: ({ children }: any) => <ul data-testid="ion-list">{children}</ul>,
  IonItem: ({ children }: any) => <li data-testid="ion-item">{children}</li>,
  IonLabel: ({ children }: any) => <div data-testid="ion-label">{children}</div>,
  IonButton: ({ children, color, expand }: any) => (
    <button data-testid="ion-button" data-color={color} data-expand={expand}>
      {children}
    </button>
  ),
}));

describe('Profile Component', () => {
  beforeEach(() => {
    render(<Profile />);
  });

  it('renders without crashing', () => {
    expect(screen.getByTestId('ion-page')).toBeInTheDocument();
  });

  it('renders the page title', () => {
    const titles = screen.getAllByText('Profile');
    expect(titles.length).toBeGreaterThan(0);
    expect(titles[0]).toBeInTheDocument();
  });

  it('renders user avatar', () => {
    expect(screen.getByTestId('ion-avatar')).toBeInTheDocument();
  });

  it('renders profile image', () => {
    const img = screen.getByAltText('Profile');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://ionicframework.com/docs/img/demos/avatar.svg');
  });

  it('renders teacher name', () => {
    expect(screen.getByText('Teacher Name')).toBeInTheDocument();
  });

  it('renders teacher email', () => {
    expect(screen.getByText('teacher@sahayak.com')).toBeInTheDocument();
  });

  it('renders Account Details card', () => {
    expect(screen.getByText('Account Details')).toBeInTheDocument();
  });

  it('renders role information', () => {
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Primary Teacher')).toBeInTheDocument();
  });

  it('renders school information', () => {
    expect(screen.getByText('School')).toBeInTheDocument();
    expect(screen.getByText('Demo School')).toBeInTheDocument();
  });

  it('renders member since information', () => {
    expect(screen.getByText('Member Since')).toBeInTheDocument();
    expect(screen.getByText('January 2025')).toBeInTheDocument();
  });

  it('renders logout button', () => {
    const logoutButton = screen.getByTestId('ion-button');
    expect(logoutButton).toHaveTextContent('Logout');
    expect(logoutButton).toHaveAttribute('data-color', 'danger');
    expect(logoutButton).toHaveAttribute('data-expand', 'block');
  });

  it('renders two cards', () => {
    const cards = screen.getAllByTestId('ion-card');
    expect(cards).toHaveLength(2);
  });

  it('renders list with three items', () => {
    const items = screen.getAllByTestId('ion-item');
    expect(items).toHaveLength(3);
  });

  it('renders content area with padding', () => {
    const content = screen.getByTestId('ion-content');
    expect(content.querySelector('.ion-padding')).toBeInTheDocument();
  });

  it('profile card has center text alignment', () => {
    const cardContents = screen.getAllByTestId('ion-card-content');
    const profileCard = cardContents[0];
    expect(profileCard).toHaveClass('ion-text-center');
  });

  it('avatar has correct styling', () => {
    const avatar = screen.getByTestId('ion-avatar');
    expect(avatar).toHaveStyle({
      width: '100px',
      height: '100px',
      margin: '0 auto',
    });
  });
});
