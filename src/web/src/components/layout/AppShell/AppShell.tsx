/**
 * AppShell Component
 * Implements requirements from Technical Specification/User Interface Design/Design System Specifications
 * 
 * Human Tasks:
 * 1. Verify layout responsiveness across different screen sizes
 * 2. Test keyboard navigation between Header and Sidebar components
 * 3. Validate color contrast ratios in different theme modes
 * 4. Review component accessibility with screen readers
 */

// react v18.2.0
import React from 'react';
import styled from '@emotion/styled';

// Internal imports
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import { theme } from '../../styles/theme';
import { applyGlobalStyles } from '../../styles/global';
import useTheme from '../../hooks/useTheme';

// Requirement: Design System Specifications - Layout structure
const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
`;

// Requirement: Design System Specifications - Main content layout
const MainContent = styled.main`
  display: flex;
  flex: 1;
  margin-left: 280px; // Width of sidebar
  margin-top: 64px; // Height of header
  padding: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.surface};
  transition: margin-left 0.3s ease-in-out;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    margin-left: 0;
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

// Requirement: Design System Specifications - Content wrapper
const ContentWrapper = styled.div`
  width: 100%;
  max-width: ${({ theme }) => theme.breakpoints.xl};
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.md};
`;

/**
 * AppShell component that provides the main layout structure for the application
 * Requirement: Design System Specifications - Consistent layout and styling
 */
const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get theme configuration
  const themeConfig = useTheme();

  // Apply global styles on component mount
  React.useEffect(() => {
    applyGlobalStyles();
  }, []);

  return (
    <AppContainer theme={themeConfig}>
      {/* Header component for top navigation */}
      <Header />

      {/* Sidebar component for main navigation */}
      <Sidebar />

      {/* Main content area */}
      <MainContent theme={themeConfig}>
        <ContentWrapper theme={themeConfig}>
          {children}
        </ContentWrapper>
      </MainContent>
    </AppContainer>
  );
};

export default AppShell;