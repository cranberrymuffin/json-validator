import {
  parseJson,
  parseNull,
  parseBoolean,
  parseString,
  parseNumber,
  parseArray,
  parseValue,
} from './json_parser';

describe('JSON Parser', () => {
  // Sample input
  const json1 = `{
    "name": "Alice",
    "age": 25.0,
    "email": "alice@example.com",
    "isGraduated": true,
    "isStudent": false,
    "data": [1.23e4, 12300, 5.67E-8, -0.0000000567],
    "address": {
      "street": "123 Main St",
      "city": "Wonderland",
      "zip": "12345"
    },
    "status": null
  }`;

  test('parseJson should parse a valid JSON string into an object', () => {
    const [result] = parseJson(json1, 0);
    expect(result).toHaveProperty('name', 'Alice');
    expect(result).toHaveProperty('age', 25.0);
    expect(result).toHaveProperty('isStudent', false);
    expect(result).toHaveProperty('data');
    expect(result.address).toHaveProperty('street', '123 Main St');
    expect(result.status).toBeNull();
  });

  test('parseNull should return null for null values', () => {
    const [value, idx] = parseNull(json1, json1.indexOf('null'));
    expect(value).toBeNull();
    expect(idx).toBeGreaterThan(json1.indexOf('null'));
  });

  test('parseBoolean should return correct boolean values', () => {
    const [valueTrue] = parseBoolean(json1, json1.indexOf('true'));
    const [valueFalse] = parseBoolean(json1, json1.indexOf('false'));
    expect(valueTrue).toBe(true);
    expect(valueFalse).toBe(false);
  });

  test('parseString should parse a valid string', () => {
    const [value] = parseString(json1, json1.indexOf('"Alice"'));
    expect(value).toBe('Alice');
  });

  test('parseNumber should parse numbers including floats and exponents', () => {
    const [value] = parseNumber(json1, json1.indexOf('25.0'));
    expect(value).toBe(25.0);
    const [valueExp] = parseNumber(json1, json1.indexOf('1.23e4'));
    expect(valueExp).toBe(12300);
  });

  test('parseArray should parse arrays correctly', () => {
    const [value] = parseArray(json1, json1.indexOf('['));
    expect(value).toEqual([1.23e4, 12300, 5.67e-8, -0.0000000567]);
  });

  test('parseValue should return correct parsed values', () => {
    let [value, idx] = parseValue(json1, json1.indexOf('25.0'));
    expect(value).toBe(25.0);
    [value, idx] = parseValue(json1, json1.indexOf('"Alice"'));
    expect(value).toBe('Alice');
    [value, idx] = parseValue(json1, json1.indexOf('true'));
    expect(value).toBe(true);
  });
});
