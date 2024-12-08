/**
 * Entry point for the React application
 * Requirements addressed:
 * - Application Initialization (Technical Specification/User Interface Design/Critical User Flows)
 *   Initializes the React application by rendering the root component and applying global styles.
 * - Design System Specifications (Technical Specification/User Interface Design/Design System Specifications)
 *   Ensures consistent typography, color palette, spacing, and other design elements.
 * 
 * Human Tasks:
 * 1. Verify React version compatibility in package.json
 * 2. Ensure theme configuration is properly loaded
 * 3. Test application initialization across different browsers
 * 4. Review global style application with design team
 */

// react v18.2.0
import React from 'react';
// react-dom v18.2.0
import ReactDOM from 'react-dom/client';

// Internal imports
import App from './App';
import { theme } from './config/theme.config';
import { applyGlobalStyles } from './styles/global';

/**
 * Initialize the React application by:
 * 1. Applying global styles
 * 2. Creating root element
 * 3. Rendering the App component
 */
const main = () => {
  // Apply global styles defined in the theme configuration
  applyGlobalStyles();

  // Get the root element where the React app will be mounted
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found. Please ensure there is a div with id="root" in the HTML.');
  }

  // Create React root and render the application
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// Initialize the application
main();

// Enable hot module replacement in development
if (import.meta.hot) {
  import.meta.hot.accept();
}