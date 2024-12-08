# Workflow Automation Platform - Frontend

This document provides essential information for setting up, developing, testing, and deploying the React-based frontend application for the Workflow Automation Platform.

## Project Overview

The frontend application is built using modern web technologies:

- React 18.2.0 with TypeScript
- Vite for build tooling and development server
- Redux Toolkit for state management
- Styled Components for styling
- Jest and Cypress for testing
- Docker for containerization

## Setup Instructions

### Prerequisites

- Node.js >= 18.0.0
- npm >= 7.0.0
- Docker (for containerized deployment)

### Environment Setup

1. Clone the repository and navigate to the web directory:
```bash
cd src/web
```

2. Copy the environment template:
```bash
cp .env.example .env
```

3. Install dependencies:
```bash
npm ci
```

### Development Environment

1. Start the development server:
```bash
npm start
```
The application will be available at `http://localhost:3000`

2. Build for production:
```bash
npm run build
```

## Development Guidelines

### Code Structure

The application follows a feature-based structure:

```
src/
├── components/     # Reusable UI components
├── config/         # Configuration files
├── constants/      # Application constants
├── hooks/          # Custom React hooks
├── pages/          # Page components
├── routes/         # Routing configuration
├── services/       # API services
├── store/          # Redux store configuration
├── styles/         # Global styles and theme
├── types/          # TypeScript type definitions
└── utils/         # Utility functions
```

### Code Quality

- ESLint and Prettier are configured for code quality and formatting
- Run linting: `npm run lint`
- Format code: `npm run format`

### Type Safety

- TypeScript is used throughout the application
- Strict mode is enabled in `tsconfig.json`
- Use type definitions from `src/types/`

### State Management

- Redux Toolkit for global state management
- Use local state for component-specific state
- Custom hooks for reusable state logic

## Testing and Deployment

### Testing

1. Run unit and integration tests:
```bash
npm test
```

2. Run end-to-end tests:
```bash
npm run e2e
```

3. View test coverage:
```bash
npm test -- --coverage
```

### Continuous Integration

- GitHub Actions workflow is configured in `.github/workflows/frontend-ci.yml`
- CI pipeline runs on push to main and pull requests
- Includes linting, testing, and build verification

### Docker Deployment

1. Build the Docker image:
```bash
docker build -t workflow-automation-frontend .
```

2. Run the container:
```bash
docker run -p 3000:3000 workflow-automation-frontend
```

### Production Deployment

1. Set required environment variables:
- `REACT_APP_API_BASE_URL`: Backend API URL
- `REACT_APP_API_TIMEOUT`: API request timeout
- `REACT_APP_AUTH_TOKEN_EXPIRATION`: Authentication token expiration

2. Build the production bundle:
```bash
npm run build
```

3. Deploy the contents of the `dist` directory to your hosting service

## Additional Resources

- [Technical Specification](../docs/technical-specification.md)
- [API Documentation](../docs/api-documentation.md)
- [Component Library](../docs/component-library.md)

## Contributing

1. Follow the established code structure and naming conventions
2. Write tests for new features and bug fixes
3. Update documentation as needed
4. Submit pull requests for review

## License

This project is proprietary and confidential. Unauthorized copying or distribution is prohibited.