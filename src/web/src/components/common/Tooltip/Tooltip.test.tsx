// react v18.2.0
import React from 'react';
// @testing-library/react v14.0.0
import { render, screen, fireEvent, act } from '@testing-library/react';
// jest v29.0.0
import '@testing-library/jest-dom';

// Internal imports
import Tooltip from './Tooltip';
import { tooltipContainer, tooltipArrow } from './Tooltip.styles';
import { validateAuthData } from '../../utils/validation.util';

// Mock the validation utility
jest.mock('../../utils/validation.util', () => ({
  validateAuthData: jest.fn()
}));

/**
 * Requirement: Component Testing
 * Location: Technical Specification/System Design/Testing
 * Description: Unit tests for the Tooltip component to verify rendering, styling,
 * and interaction behavior
 */

describe('Tooltip Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    (validateAuthData as jest.Mock).mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('rendersTooltipCorrectly', () => {
    it('renders tooltip with default props', () => {
      render(
        <Tooltip content="Test tooltip">
          <button>Hover me</button>
        </Tooltip>
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByRole('tooltip')).toHaveAttribute('aria-hidden', 'true');
      expect(screen.getByRole('tooltip')).toHaveClass('top');
    });

    it('applies custom position class', () => {
      render(
        <Tooltip content="Test tooltip" position="bottom">
          <button>Hover me</button>
        </Tooltip>
      );

      expect(screen.getByRole('tooltip')).toHaveClass('bottom');
    });

    it('applies custom className', () => {
      render(
        <Tooltip content="Test tooltip" className="custom-tooltip">
          <button>Hover me</button>
        </Tooltip>
      );

      expect(screen.getByRole('tooltip')).toHaveClass('custom-tooltip');
    });

    it('renders with ReactNode content', () => {
      const content = <div data-testid="custom-content">Custom Content</div>;
      render(
        <Tooltip content={content}>
          <button>Hover me</button>
        </Tooltip>
      );

      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    });
  });

  describe('validatesTooltipData', () => {
    it('validates string content using validateAuthData', () => {
      (validateAuthData as jest.Mock).mockReturnValue(true);
      
      render(
        <Tooltip content="Test tooltip">
          <button>Hover me</button>
        </Tooltip>
      );

      expect(validateAuthData).toHaveBeenCalledWith({
        username: 'Test tooltip',
        password: '',
        token: ''
      });
    });

    it('logs warning when content validation fails', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      (validateAuthData as jest.Mock).mockReturnValue(false);

      render(
        <Tooltip content="Invalid content">
          <button>Hover me</button>
        </Tooltip>
      );

      expect(consoleSpy).toHaveBeenCalledWith('Invalid tooltip content format');
      consoleSpy.mockRestore();
    });
  });

  describe('handlesUserInteraction', () => {
    it('shows tooltip on hover with delay', async () => {
      render(
        <Tooltip content="Test tooltip" showDelay={200}>
          <button>Hover me</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByRole('button'));
      
      // Tooltip should not be visible immediately
      expect(screen.getByRole('tooltip')).toHaveAttribute('aria-hidden', 'true');
      
      // Fast-forward time to trigger the delay
      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(screen.getByRole('tooltip')).toHaveAttribute('aria-hidden', 'false');
    });

    it('hides tooltip on mouse leave with delay', async () => {
      render(
        <Tooltip content="Test tooltip" hideDelay={150}>
          <button>Hover me</button>
        </Tooltip>
      );

      // Show the tooltip
      fireEvent.mouseEnter(screen.getByRole('button'));
      act(() => {
        jest.advanceTimersByTime(200);
      });

      // Hide the tooltip
      fireEvent.mouseLeave(screen.getByRole('button'));
      
      // Tooltip should still be visible before delay
      expect(screen.getByRole('tooltip')).toHaveAttribute('aria-hidden', 'false');
      
      // Fast-forward time to trigger the hide delay
      act(() => {
        jest.advanceTimersByTime(150);
      });

      expect(screen.getByRole('tooltip')).toHaveAttribute('aria-hidden', 'true');
    });

    it('shows tooltip on focus', () => {
      render(
        <Tooltip content="Test tooltip">
          <button>Focus me</button>
        </Tooltip>
      );

      fireEvent.focus(screen.getByRole('button'));
      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(screen.getByRole('tooltip')).toHaveAttribute('aria-hidden', 'false');
    });

    it('does not show tooltip when disabled', () => {
      render(
        <Tooltip content="Test tooltip" disabled={true}>
          <button>Hover me</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByRole('button'));
      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(screen.getByRole('tooltip')).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('cleanup', () => {
    it('cleans up timeouts on unmount', () => {
      const { unmount } = render(
        <Tooltip content="Test tooltip">
          <button>Hover me</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByRole('button'));
      unmount();

      // Advance timers to ensure no errors occur after unmount
      act(() => {
        jest.advanceTimersByTime(1000);
      });
    });
  });
});