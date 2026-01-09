# SunbirdED Mobile App

A mobile application built with Ionic React framework for educational purposes.

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=sunbirded-mobile-app&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=sunbirded-mobile-app)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=sunbirded-mobile-app&metric=coverage)](https://sonarcloud.io/summary/new_code?id=sunbirded-mobile-app)

## 🚀 Tech Stack

- **React**: 19.2.1
- **TypeScript**: 5.9.3
- **Ionic React**: 8.5.5
- **Vite**: 5.4.11
- **Capacitor**: 7.4.4
- **React Router**: 5.3.4
- **Jest**: 30.2.0
- **Testing Library**: 16.3.1

## 📋 Prerequisites

- Node.js 18.x or 20.x (LTS versions)
- npm 10.x
- Git

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/SunbirdEd-mobile-app.git
   cd SunbirdEd-mobile-app
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

## 🏃‍♂️ Running the App

### Development Server

Start the development server with hot reload:

```bash
npm run dev
```

The app will be available at `http://localhost:8080` (or next available port).

### Preview Production Build

```bash
npm run build
npm run preview
```

## 🧪 Testing

### Run all tests
```bash
npm test
```

### Watch mode
```bash
npm run test:watch
```

### Coverage report
```bash
npm run test:coverage
```

Test coverage threshold is set to 70% for statements, branches, functions, and lines.

## 🏗️ Building

### Web Build

```bash
npm run build
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint          # Check for issues
npm run lint:fix      # Auto-fix issues
```

## 📱 Mobile Platforms

### Android

```bash
npx cap sync android
npx cap open android
```

### iOS (macOS only)

```bash
npx cap sync ios
npx cap open ios
```

## 📁 Project Structure

```
src/
├── pages/              # Page components
│   ├── Home.tsx
│   ├── Dashboard.tsx
│   └── Profile.tsx
├── theme/              # Ionic theme variables
│   └── variables.css
├── App.tsx             # Main app component with routing
├── main.tsx            # Application entry point
└── setupTests.ts       # Test configuration

.github/
└── workflows/          # CI/CD workflows
    └── pr-checks.yml   # PR validation workflow

```

## 🔄 CI/CD

The project includes automated checks on pull requests:

- **Lint Check**: Validates code style and quality
- **Test Suite**: Runs all tests with coverage
- **SonarCloud**: Code quality and security analysis

## 🤝 Contributing

1. Create a new branch from `develop`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and ensure:
   - All tests pass (`npm test`)
   - Linting passes (`npm run lint`)
   - Code coverage meets threshold

3. Commit your changes following conventional commits:
   ```bash
   git commit -m "feat: add new feature"
   ```

4. Push and create a Pull Request to `develop`

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate coverage report |
| `npm run type-check` | Type check without emitting |
| `npm run lint` | Check code quality |
| `npm run lint:fix` | Fix linting issues |

## 🔧 Configuration

- **Vite**: [vite.config.ts](vite.config.ts)
- **TypeScript**: [tsconfig.json](tsconfig.json)
- **Jest**: [jest.config.js](jest.config.js)
- **ESLint**: [eslint.config.js](eslint.config.js)
- **PostCSS**: [postcss.config.js](postcss.config.js)
- **Capacitor**: [capacitor.config.ts](capacitor.config.ts)

## 📄 License

This project is licensed under the ISC License.

## 👥 Support

For issues and questions, please create an issue in the GitHub repository.
