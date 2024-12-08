# Contributing to the Workflow Automation Platform

Thank you for your interest in contributing to the Workflow Automation Platform! This document outlines the guidelines for contributing to the project.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Environment](#development-environment)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Continuous Integration](#continuous-integration)
- [Security Guidelines](#security-guidelines)
- [Submitting Changes](#submitting-changes)
- [Licensing](#licensing)

## Code of Conduct

All contributors are expected to adhere to the project's Code of Conduct to ensure a welcoming and inclusive environment. We are committed to providing a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

## Getting Started

1. Fork the repository to your GitHub account
2. Clone your forked repository:
   ```bash
   git clone https://github.com/YOUR-USERNAME/workflow-automation-platform.git
   ```
3. Set up the development environment as described in the README.md file

## Development Environment

### Backend Setup
1. Install Node.js version 20 or higher
2. Navigate to the backend directory:
   ```bash
   cd src/backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
5. Configure your local environment variables in the `.env` file

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd src/web
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
4. Configure your local environment variables in the `.env` file

## Coding Standards

### Backend Standards
1. Follow the TypeScript linting rules defined in `.eslintrc.ts`
2. Use Prettier for code formatting with the configuration in `.prettierrc`
3. Maintain type safety throughout the codebase
4. Document all public APIs and complex functions
5. Follow the error handling patterns defined in `error.constants.ts`

### Frontend Standards
1. Follow React best practices and hooks guidelines
2. Use TypeScript for all new components and features
3. Follow the component structure defined in the project
4. Use styled-components for styling
5. Ensure accessibility compliance (WCAG 2.1 AA)

## Testing Requirements

### Backend Testing
1. Write unit tests for all new features and bug fixes
2. Maintain minimum test coverage of 80%
3. Run tests using:
   ```bash
   npm test
   ```
4. Include integration tests for API endpoints
5. Follow the testing patterns in existing test files

### Frontend Testing
1. Write unit tests for React components
2. Include integration tests for critical user flows
3. Write end-to-end tests using Cypress for key features
4. Run tests using:
   ```bash
   npm test
   ```
5. Verify tests pass in CI pipeline

## Continuous Integration

All contributions must pass the CI pipeline before being merged. The pipeline includes:

### Backend CI (.github/workflows/backend-ci.yml)
1. Code linting
2. Unit and integration tests
3. Type checking
4. Build verification
5. Docker image build

### Frontend CI (.github/workflows/frontend-ci.yml)
1. Code linting
2. Unit tests
3. Build verification
4. End-to-end tests

### Security Scans (.github/workflows/security-scan.yml)
1. Dependency vulnerability scanning
2. Code security analysis
3. Container image scanning

## Security Guidelines

1. Follow secure coding practices
2. Never commit sensitive information or credentials
3. Use environment variables for configuration
4. Follow the security policies defined in SECURITY.md
5. Report security vulnerabilities responsibly

## Submitting Changes

1. Create a new branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes following the coding standards
3. Write clear and concise commit messages
4. Push your changes to your fork
5. Submit a pull request with:
   - Clear description of changes
   - Link to related issues
   - Test coverage information
   - Screenshots for UI changes

## Licensing

By contributing to this project, you agree that your contributions will be licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

For questions or support, please open an issue or contact the maintainers.