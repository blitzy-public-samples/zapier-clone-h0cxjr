/**
 * Card Component
 * Implements requirements from Technical Specification/User Interface Design/Design System Specifications
 * 
 * Human Tasks:
 * 1. Review accessibility requirements with UX team
 * 2. Validate responsive behavior on different screen sizes
 * 3. Confirm hover state interactions with design team
 */

// react v18.2.0
import React from 'react';
// prop-types v15.8.1
import PropTypes from 'prop-types';

import {
  CardContainer,
  CardHeader,
  CardBody,
  CardFooter
} from './Card.styles';

interface CardProps {
  /** Content to be displayed in the card header */
  header?: React.ReactNode;
  /** Content to be displayed in the card body */
  body: React.ReactNode;
  /** Content to be displayed in the card footer */
  footer?: React.ReactNode;
  /** Additional CSS class names */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
  /** Optional test ID for testing purposes */
  'data-testid'?: string;
}

/**
 * Card component that provides a consistent container for content with optional header and footer sections.
 * Requirement: Design System Specifications - Implements consistent card layout and styling
 */
const Card: React.FC<CardProps> = ({
  header,
  body,
  footer,
  className,
  style,
  'data-testid': testId
}) => {
  return (
    <CardContainer 
      className={className}
      style={style}
      data-testid={testId}
    >
      {header && (
        <CardHeader>
          {header}
        </CardHeader>
      )}
      
      <CardBody>
        {body}
      </CardBody>

      {footer && (
        <CardFooter>
          {footer}
        </CardFooter>
      )}
    </CardContainer>
  );
};

Card.propTypes = {
  header: PropTypes.node,
  body: PropTypes.node.isRequired,
  footer: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
  'data-testid': PropTypes.string
};

Card.defaultProps = {
  header: undefined,
  footer: undefined,
  className: undefined,
  style: undefined,
  'data-testid': undefined
};

export default Card;