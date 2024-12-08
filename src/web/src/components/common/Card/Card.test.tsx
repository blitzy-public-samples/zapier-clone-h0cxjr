/**
 * Unit tests for the Card component
 * Implements requirements from Technical Specification/User Interface Design/Testing
 * 
 * Human Tasks:
 * 1. Review test coverage with QA team
 * 2. Validate accessibility testing requirements
 * 3. Consider adding visual regression tests
 */

// react v18.2.0
import React from 'react';
// @testing-library/react v14.0.0
import { render, screen } from '@testing-library/react';
// jest v29.0.0
import { describe, it, expect } from '@testing-library/jest-utils';

import Card from './Card';

describe('Card Component', () => {
  // Test rendering with all sections
  it('renders Card component with header, body, and footer', () => {
    const headerContent = <h2>Test Header</h2>;
    const bodyContent = <p>Test Body Content</p>;
    const footerContent = <button>Test Button</button>;

    render(
      <Card
        header={headerContent}
        body={bodyContent}
        footer={footerContent}
        data-testid="test-card"
      />
    );

    // Verify all sections are rendered
    const cardElement = screen.getByTestId('test-card');
    expect(cardElement).toBeInTheDocument();
    expect(screen.getByText('Test Header')).toBeInTheDocument();
    expect(screen.getByText('Test Body Content')).toBeInTheDocument();
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  // Test rendering without optional sections
  it('renders Card component without optional sections', () => {
    const bodyContent = <p>Test Body Content</p>;

    render(
      <Card
        body={bodyContent}
        data-testid="test-card"
      />
    );

    const cardElement = screen.getByTestId('test-card');
    expect(cardElement).toBeInTheDocument();
    expect(screen.getByText('Test Body Content')).toBeInTheDocument();
    
    // Verify optional sections are not rendered
    const headerElements = cardElement.getElementsByClassName('card-header');
    const footerElements = cardElement.getElementsByClassName('card-footer');
    expect(headerElements.length).toBe(0);
    expect(footerElements.length).toBe(0);
  });

  // Test applying additional styles and classes
  it('applies additional styles and classes', () => {
    const bodyContent = <p>Test Body Content</p>;
    const customClass = 'custom-card';
    const customStyle = { marginTop: '20px' };

    render(
      <Card
        body={bodyContent}
        className={customClass}
        style={customStyle}
        data-testid="test-card"
      />
    );

    const cardElement = screen.getByTestId('test-card');
    expect(cardElement).toHaveClass(customClass);
    expect(cardElement).toHaveStyle({ marginTop: '20px' });
  });

  // Test body content is required
  it('requires body content to be provided', () => {
    // Suppress console.error for this test as we expect a prop-type warning
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(
        // @ts-expect-error - Testing missing required prop
        <Card data-testid="test-card" />
      );
    }).toThrow();

    // Restore console.error
    console.error = originalError;
  });

  // Test complex content rendering
  it('renders complex content in all sections', () => {
    const headerContent = (
      <div>
        <h2>Complex Header</h2>
        <span>Subtitle</span>
      </div>
    );
    
    const bodyContent = (
      <div>
        <p>Paragraph 1</p>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      </div>
    );
    
    const footerContent = (
      <div>
        <button>Cancel</button>
        <button>Submit</button>
      </div>
    );

    render(
      <Card
        header={headerContent}
        body={bodyContent}
        footer={footerContent}
        data-testid="test-card"
      />
    );

    expect(screen.getByText('Complex Header')).toBeInTheDocument();
    expect(screen.getByText('Subtitle')).toBeInTheDocument();
    expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  // Test snapshot
  it('matches snapshot', () => {
    const { container } = render(
      <Card
        header={<h2>Header</h2>}
        body={<p>Body</p>}
        footer={<button>Footer</button>}
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});