/**
 * @fileoverview Date utility functions for consistent date handling across the application
 * @version 1.0.0
 * 
 * Human Tasks:
 * 1. Ensure date-fns version 2.30.0 is included in package.json dependencies
 * 2. Verify that the application's timezone settings align with business requirements
 * 3. Review and document any specific date format standards for the organization
 */

// date-fns v2.30.0
import { format, parse, isValid } from 'date-fns';

/**
 * Formats a given date into a specified string format.
 * Addresses requirement: "Date Utility Functions" - Ensures consistent date formatting
 * across the application.
 * 
 * @param {Date} date - The date to format
 * @param {string} formatString - The desired output format (using date-fns format tokens)
 * @returns {string} The formatted date string
 * @throws {Error} If the input date is invalid
 */
export const formatDate = (date: Date, formatString: string): string => {
  // Validate input date
  if (!(date instanceof Date) || !isValid(date)) {
    throw new Error('Invalid date provided to formatDate');
  }

  try {
    return format(date, formatString);
  } catch (error) {
    throw new Error(`Error formatting date: ${(error as Error).message}`);
  }
};

/**
 * Parses a date string into a Date object based on a specified format.
 * Addresses requirement: "Date Utility Functions" - Ensures consistent date parsing
 * across the application.
 * 
 * @param {string} dateString - The date string to parse
 * @param {string} formatString - The format of the input date string (using date-fns format tokens)
 * @returns {Date} The parsed Date object
 * @throws {Error} If the date string cannot be parsed or is invalid
 */
export const parseDate = (dateString: string, formatString: string): Date => {
  if (!dateString || !formatString) {
    throw new Error('Date string and format string are required');
  }

  try {
    const parsedDate = parse(dateString, formatString, new Date());
    
    if (!isValid(parsedDate)) {
      throw new Error('Invalid date string for the specified format');
    }

    return parsedDate;
  } catch (error) {
    throw new Error(`Error parsing date: ${(error as Error).message}`);
  }
};

/**
 * Checks if a given date string is valid based on a specified format.
 * Addresses requirement: "Date Utility Functions" - Ensures date validation
 * across the application.
 * 
 * @param {string} dateString - The date string to validate
 * @param {string} formatString - The expected format of the date string
 * @returns {boolean} True if the date string is valid, false otherwise
 */
export const isDateValid = (dateString: string, formatString: string): boolean => {
  if (!dateString || !formatString) {
    return false;
  }

  try {
    const parsedDate = parse(dateString, formatString, new Date());
    return isValid(parsedDate);
  } catch {
    return false;
  }
};