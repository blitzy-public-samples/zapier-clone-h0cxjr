// react version: 18.2.0
import React from 'react';
import styled from '@emotion/styled';
import { useTheme } from '../../hooks/useTheme';
import { useDispatch, useSelector } from 'react-redux';
import { uiSlice } from '../../store/slices/uiSlice';

/**
 * Human Tasks:
 * 1. Verify navigation links match the latest application routes
 * 2. Ensure accessibility compliance with WCAG 2.1 AA standards
 * 3. Test responsive behavior across all breakpoints
 * 4. Validate color contrast ratios for all theme modes
 */

// Requirement: Design System Specifications - Ensures consistent styling
const SidebarContainer = styled.aside`
  display: flex;
  flex-direction: column;
  width: 280px;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.surface};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.md};
  position: fixed;
  left: 0;
  top: 0;
  z-index: ${({ theme }) => theme.zIndex.sidebar};
  transition: transform 0.3s ease-in-out;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    transform: translateX(${({ isOpen }) => (isOpen ? '0' : '-100%')});
  }
`;

// Requirement: Design System Specifications - Typography and spacing
const Logo = styled.div`
  font-family: ${({ theme }) => theme.fonts.primary};
  font-size: ${({ theme }) => theme.fonts.sizes.xl};
  font-weight: ${({ theme }) => theme.fonts.weights.bold};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.md};
`;

// Requirement: Design System Specifications - Navigation styling
const NavList = styled.nav`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

// Requirement: Design System Specifications - Navigation item styling
const NavItem = styled.a`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-family: ${({ theme }) => theme.fonts.primary};
  font-size: ${({ theme }) => theme.fonts.sizes.base};
  font-weight: ${({ theme }) => theme.fonts.weights.medium};
  text-decoration: none;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryLight};
    color: ${({ theme }) => theme.colors.primary};
  }

  &.active {
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.background};
  }
`;

// Requirement: Design System Specifications - Footer styling
const SidebarFooter = styled.div`
  margin-top: auto;
  padding: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.fonts.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Sidebar: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.ui.sidebar?.isOpen ?? true);

  const toggleSidebar = () => {
    dispatch(uiSlice.actions.toggleModal('sidebar'));
  };

  // Requirement: Design System Specifications - Consistent component structure
  return (
    <SidebarContainer theme={theme} isOpen={isOpen}>
      <Logo theme={theme}>
        Workflow Platform
      </Logo>
      
      <NavList theme={theme}>
        <NavItem href="/dashboard" theme={theme}>
          Dashboard
        </NavItem>
        <NavItem href="/workflows" theme={theme}>
          Workflows
        </NavItem>
        <NavItem href="/integrations" theme={theme}>
          Integrations
        </NavItem>
        <NavItem href="/analytics" theme={theme}>
          Analytics
        </NavItem>
        <NavItem href="/settings" theme={theme}>
          Settings
        </NavItem>
      </NavList>

      <SidebarFooter theme={theme}>
        <p>Version 1.0.0</p>
      </SidebarFooter>
    </SidebarContainer>
  );
};

export default Sidebar;