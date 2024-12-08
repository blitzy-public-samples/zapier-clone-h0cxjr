/**
 * @fileoverview DataMapper class implementation for transforming and mapping data between different formats
 * 
 * Requirements Addressed:
 * - Integration Capabilities (Technical Specification/Core Features and Functionalities/Integration Capabilities)
 *   Implements data mapping tools to transform and map data between different formats and structures
 *   for seamless integration.
 * 
 * Human Tasks:
 * - Review and update mapping configurations when new integration protocols are added
 * - Ensure mapping validation rules align with business requirements
 * - Monitor mapping performance and optimize transformation logic as needed
 */

import { IConnector } from '../../interfaces/IConnector';
import { IIntegration } from '../../interfaces/IIntegration';
import { IWorkflow } from '../../interfaces/IWorkflow';
import { validateWorkflow } from '../../utils/validation.util';
import { SUPPORTED_PROTOCOLS } from '../../constants/integration.constants';

/**
 * DataMapper class responsible for transforming and mapping data between different formats and structures.
 * Ensures compatibility and seamless data flow between various integration connectors and workflows.
 */
export class DataMapper {
  /**
   * Transforms data based on a specific transformation logic.
   * 
   * @param data - Source data object to be transformed
   * @param transformationLogic - String representation of the transformation logic
   * @returns Transformed data object
   * @throws Error if transformation fails or logic is invalid
   */
  public transform(data: object, transformationLogic: string): object {
    try {
      // Validate input data
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid source data: Data must be a valid object');
      }

      if (!transformationLogic || typeof transformationLogic !== 'string') {
        throw new Error('Invalid transformation logic: Logic must be a valid string');
      }

      // Parse transformation logic
      const parsedLogic = JSON.parse(transformationLogic);

      // Apply transformation rules
      const transformedData = this.applyTransformationRules(data, parsedLogic);

      return transformedData;
    } catch (error) {
      throw new Error(`Transformation failed: ${error.message}`);
    }
  }

  /**
   * Validates the mapping configuration to ensure it adheres to the required structure.
   * 
   * @param mappingConfig - Configuration object defining the mapping rules
   * @returns true if the mapping configuration is valid
   * @throws Error if validation fails
   */
  public validateMapping(mappingConfig: object): boolean {
    try {
      // Check if mapping config exists
      if (!mappingConfig || typeof mappingConfig !== 'object') {
        throw new Error('Invalid mapping configuration: Configuration must be a valid object');
      }

      // Validate mapping structure
      const { sourceFields, targetFields, transformations } = mappingConfig as any;

      if (!Array.isArray(sourceFields) || !Array.isArray(targetFields)) {
        throw new Error('Invalid mapping configuration: Source and target fields must be arrays');
      }

      if (!transformations || typeof transformations !== 'object') {
        throw new Error('Invalid mapping configuration: Transformations must be a valid object');
      }

      // Validate field mappings
      this.validateFieldMappings(sourceFields, targetFields, transformations);

      return true;
    } catch (error) {
      throw new Error(`Mapping validation failed: ${error.message}`);
    }
  }

  /**
   * Maps data from one structure to another based on the provided mapping configuration.
   * 
   * @param sourceData - Source data object to be mapped
   * @param mappingConfig - Configuration object defining the mapping rules
   * @returns Mapped data object
   * @throws Error if mapping fails
   */
  public mapData(sourceData: object, mappingConfig: object): object {
    try {
      // Validate inputs
      if (!this.validateMapping(mappingConfig)) {
        throw new Error('Invalid mapping configuration');
      }

      if (!sourceData || typeof sourceData !== 'object') {
        throw new Error('Invalid source data: Data must be a valid object');
      }

      // Extract mapping configuration
      const { sourceFields, targetFields, transformations } = mappingConfig as any;

      // Initialize result object
      const mappedData: Record<string, any> = {};

      // Apply field mappings
      for (let i = 0; i < sourceFields.length; i++) {
        const sourceField = sourceFields[i];
        const targetField = targetFields[i];
        const transformation = transformations[sourceField];

        // Get source value
        const sourceValue = this.getNestedValue(sourceData, sourceField);

        // Apply transformation if defined
        const transformedValue = transformation 
          ? this.applyTransformation(sourceValue, transformation)
          : sourceValue;

        // Set mapped value
        this.setNestedValue(mappedData, targetField, transformedValue);
      }

      return mappedData;
    } catch (error) {
      throw new Error(`Data mapping failed: ${error.message}`);
    }
  }

  /**
   * Applies transformation rules to the source data.
   * 
   * @private
   * @param data - Source data to transform
   * @param rules - Transformation rules to apply
   * @returns Transformed data
   */
  private applyTransformationRules(data: object, rules: any): object {
    const result: Record<string, any> = {};

    for (const [key, rule] of Object.entries(rules)) {
      if (typeof rule === 'string' && rule.startsWith('$')) {
        // Handle special transformation operators
        result[key] = this.executeTransformationOperator(data, rule);
      } else if (typeof rule === 'object') {
        // Recursively transform nested objects
        result[key] = this.applyTransformationRules(data, rule);
      } else {
        // Direct value assignment
        result[key] = rule;
      }
    }

    return result;
  }

  /**
   * Validates field mappings between source and target fields.
   * 
   * @private
   * @param sourceFields - Array of source field paths
   * @param targetFields - Array of target field paths
   * @param transformations - Object containing transformation rules
   * @throws Error if validation fails
   */
  private validateFieldMappings(
    sourceFields: string[],
    targetFields: string[],
    transformations: Record<string, any>
  ): void {
    if (sourceFields.length !== targetFields.length) {
      throw new Error('Source and target fields must have the same length');
    }

    // Validate each field mapping
    sourceFields.forEach((sourceField, index) => {
      if (typeof sourceField !== 'string' || typeof targetFields[index] !== 'string') {
        throw new Error('Field paths must be strings');
      }

      // Validate transformation if defined
      const transformation = transformations[sourceField];
      if (transformation && typeof transformation !== 'object') {
        throw new Error(`Invalid transformation for field ${sourceField}`);
      }
    });
  }

  /**
   * Gets a nested value from an object using a dot-notation path.
   * 
   * @private
   * @param obj - Source object
   * @param path - Dot-notation path to the desired value
   * @returns The value at the specified path
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Sets a nested value in an object using a dot-notation path.
   * 
   * @private
   * @param obj - Target object
   * @param path - Dot-notation path where to set the value
   * @param value - Value to set
   */
  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      current[key] = current[key] || {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  /**
   * Executes a transformation operator on the source data.
   * 
   * @private
   * @param data - Source data
   * @param operator - Transformation operator string
   * @returns Transformed value
   */
  private executeTransformationOperator(data: any, operator: string): any {
    const [op, ...args] = operator.slice(1).split(':');

    switch (op) {
      case 'concat':
        return args.map(arg => this.getNestedValue(data, arg)).join('');
      case 'sum':
        return args.reduce((sum, arg) => sum + (Number(this.getNestedValue(data, arg)) || 0), 0);
      case 'toUpper':
        return String(this.getNestedValue(data, args[0])).toUpperCase();
      case 'toLower':
        return String(this.getNestedValue(data, args[0])).toLowerCase();
      case 'default':
        const value = this.getNestedValue(data, args[0]);
        return value === undefined ? args[1] : value;
      default:
        throw new Error(`Unknown transformation operator: ${op}`);
    }
  }

  /**
   * Applies a specific transformation to a value.
   * 
   * @private
   * @param value - Value to transform
   * @param transformation - Transformation rule to apply
   * @returns Transformed value
   */
  private applyTransformation(value: any, transformation: any): any {
    if (!transformation.type) {
      return value;
    }

    switch (transformation.type) {
      case 'string':
        return String(value);
      case 'number':
        return Number(value);
      case 'boolean':
        return Boolean(value);
      case 'date':
        return new Date(value);
      case 'custom':
        return this.executeTransformationOperator({ value }, transformation.operator);
      default:
        throw new Error(`Unknown transformation type: ${transformation.type}`);
    }
  }
}