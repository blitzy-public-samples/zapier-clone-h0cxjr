// jest v29.0.0
import { DataMapper } from '../../../src/core/integration/DataMapper';
import { validateWorkflow } from '../../../src/utils/validation.util';
import { handleError } from '../../../src/utils/error.util';

/**
 * Unit tests for the DataMapper class
 * Requirements Addressed:
 * - Integration Capabilities (Technical Specification/Core Features and Functionalities/Integration Capabilities)
 *   Verifies the DataMapper class correctly transforms and maps data between different formats and structures.
 */

describe('DataMapper', () => {
  let dataMapper: DataMapper;

  beforeEach(() => {
    dataMapper = new DataMapper();
  });

  describe('transform', () => {
    test('should successfully transform data with valid input', () => {
      // Arrange
      const sourceData = {
        user: {
          firstName: 'John',
          lastName: 'Doe',
          age: 30
        }
      };

      const transformationLogic = JSON.stringify({
        fullName: '$concat:user.firstName:user.lastName',
        isAdult: true,
        ageInMonths: '$sum:user.age:0',
        details: {
          upperName: '$toUpper:user.firstName',
          lowerName: '$toLower:user.lastName'
        }
      });

      // Act
      const result = dataMapper.transform(sourceData, transformationLogic);

      // Assert
      expect(result).toEqual({
        fullName: 'JohnDoe',
        isAdult: true,
        ageInMonths: 30,
        details: {
          upperName: 'JOHN',
          lowerName: 'doe'
        }
      });
    });

    test('should throw error for invalid source data', () => {
      // Arrange
      const invalidData = null;
      const transformationLogic = JSON.stringify({
        test: 'value'
      });

      // Act & Assert
      expect(() => {
        dataMapper.transform(invalidData, transformationLogic);
      }).toThrow('Transformation failed: Invalid source data: Data must be a valid object');
    });

    test('should throw error for invalid transformation logic', () => {
      // Arrange
      const sourceData = { test: 'value' };
      const invalidLogic = 'invalid-json';

      // Act & Assert
      expect(() => {
        dataMapper.transform(sourceData, invalidLogic);
      }).toThrow('Transformation failed: Unexpected token');
    });

    test('should handle unknown transformation operators', () => {
      // Arrange
      const sourceData = { value: 'test' };
      const transformationLogic = JSON.stringify({
        result: '$unknownOperator:value'
      });

      // Act & Assert
      expect(() => {
        dataMapper.transform(sourceData, transformationLogic);
      }).toThrow('Transformation failed: Unknown transformation operator: unknownOperator');
    });
  });

  describe('validateMapping', () => {
    test('should validate correct mapping configuration', () => {
      // Arrange
      const validConfig = {
        sourceFields: ['user.firstName', 'user.lastName'],
        targetFields: ['name.first', 'name.last'],
        transformations: {
          'user.firstName': {
            type: 'string'
          },
          'user.lastName': {
            type: 'string'
          }
        }
      };

      // Act & Assert
      expect(dataMapper.validateMapping(validConfig)).toBe(true);
    });

    test('should throw error for missing source fields', () => {
      // Arrange
      const invalidConfig = {
        targetFields: ['name.first'],
        transformations: {}
      };

      // Act & Assert
      expect(() => {
        dataMapper.validateMapping(invalidConfig);
      }).toThrow('Mapping validation failed: Invalid mapping configuration: Source and target fields must be arrays');
    });

    test('should throw error for mismatched field counts', () => {
      // Arrange
      const invalidConfig = {
        sourceFields: ['user.firstName', 'user.lastName'],
        targetFields: ['name.first'],
        transformations: {}
      };

      // Act & Assert
      expect(() => {
        dataMapper.validateMapping(invalidConfig);
      }).toThrow('Mapping validation failed: Source and target fields must have the same length');
    });

    test('should throw error for invalid field types', () => {
      // Arrange
      const invalidConfig = {
        sourceFields: ['user.firstName', null],
        targetFields: ['name.first', 'name.last'],
        transformations: {}
      };

      // Act & Assert
      expect(() => {
        dataMapper.validateMapping(invalidConfig);
      }).toThrow('Mapping validation failed: Field paths must be strings');
    });

    test('should throw error for invalid transformation type', () => {
      // Arrange
      const invalidConfig = {
        sourceFields: ['user.firstName'],
        targetFields: ['name.first'],
        transformations: {
          'user.firstName': 'invalid'
        }
      };

      // Act & Assert
      expect(() => {
        dataMapper.validateMapping(invalidConfig);
      }).toThrow('Mapping validation failed: Invalid transformation for field user.firstName');
    });
  });

  describe('mapData', () => {
    test('should correctly map data with valid configuration', () => {
      // Arrange
      const sourceData = {
        user: {
          firstName: 'John',
          lastName: 'Doe',
          age: 30
        }
      };

      const mappingConfig = {
        sourceFields: ['user.firstName', 'user.lastName', 'user.age'],
        targetFields: ['name.first', 'name.last', 'details.age'],
        transformations: {
          'user.firstName': {
            type: 'string'
          },
          'user.lastName': {
            type: 'string'
          },
          'user.age': {
            type: 'number'
          }
        }
      };

      // Act
      const result = dataMapper.mapData(sourceData, mappingConfig);

      // Assert
      expect(result).toEqual({
        name: {
          first: 'John',
          last: 'Doe'
        },
        details: {
          age: 30
        }
      });
    });

    test('should handle custom transformations', () => {
      // Arrange
      const sourceData = {
        user: {
          name: 'john doe'
        }
      };

      const mappingConfig = {
        sourceFields: ['user.name'],
        targetFields: ['formattedName'],
        transformations: {
          'user.name': {
            type: 'custom',
            operator: '$toUpper:value'
          }
        }
      };

      // Act
      const result = dataMapper.mapData(sourceData, mappingConfig);

      // Assert
      expect(result).toEqual({
        formattedName: 'JOHN DOE'
      });
    });

    test('should throw error for invalid source data', () => {
      // Arrange
      const invalidData = null;
      const mappingConfig = {
        sourceFields: ['field'],
        targetFields: ['target'],
        transformations: {}
      };

      // Act & Assert
      expect(() => {
        dataMapper.mapData(invalidData, mappingConfig);
      }).toThrow('Data mapping failed: Invalid source data: Data must be a valid object');
    });

    test('should handle missing source fields gracefully', () => {
      // Arrange
      const sourceData = {
        user: {}
      };

      const mappingConfig = {
        sourceFields: ['user.firstName'],
        targetFields: ['name'],
        transformations: {
          'user.firstName': {
            type: 'string'
          }
        }
      };

      // Act
      const result = dataMapper.mapData(sourceData, mappingConfig);

      // Assert
      expect(result).toEqual({
        name: undefined
      });
    });
  });
});