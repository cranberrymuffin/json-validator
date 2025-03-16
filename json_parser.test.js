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

  test('parseJson should handle empty objects and arrays', () => {
    const emptyObj = '{}';
    const emptyArr = '[]';
    const [objResult] = parseJson(emptyObj, 0);
    const [arrResult] = parseValue(emptyArr, 0);
    expect(objResult).toEqual({});
    expect(arrResult).toEqual([]);
  });

  test('parseJson should handle deeply nested structures', () => {
    const nestedJson = `{
      "level1": {
        "level2": {
          "level3": {
            "array": [1, 2, [3, 4, {"key": "value"}]]
          }
        }
      }
    }`;
    const [result] = parseJson(nestedJson, 0);
    expect(result.level1.level2.level3.array).toEqual([
      1,
      2,
      [3, 4, { key: 'value' }],
    ]);
  });

  test('parseString should handle special characters and escapes', () => {
    const specialChars = '"Hello\\n\\t\\"World\\""';
    const [value] = parseString(specialChars, 0);
    expect(value).toBe('Hello\\n\\t"World"');

    const unicodeStr = '"Hello \\u0041\\u0042C"';
    const [unicodeValue] = parseString(unicodeStr, 0);
    expect(unicodeValue).toBe('Hello ABC');
  });

  test('parseNumber should handle various number formats', () => {
    const numbers = [
      ['0', 0],
      ['-0', 0],
      ['123', 123],
      ['-123', -123],
      ['0.123', 0.123],
      ['-0.123', -0.123],
      ['1e5', 100000],
      ['1E5', 100000],
      ['1.23e-4', 0.000123],
      ['1.23E-4', 0.000123],
    ];

    numbers.forEach(([input, expected]) => {
      const [value] = parseNumber(input, 0);
      expect(value).toBe(expected);
    });
  });

  test('parseJson should handle whitespace correctly', () => {
    const jsonWithSpaces = `
      {
        "spaces"  :  "value"  ,
        "tabs"\t:\t"value"\t,
        "mixed"  \t:\n"value"
      }
    `;
    const [result] = parseJson(jsonWithSpaces, 0);
    expect(result).toEqual({
      spaces: 'value',
      tabs: 'value',
      mixed: 'value',
    });
  });

  test('parseArray should handle mixed-type arrays', () => {
    const mixedArray = '[1, "string", true, null, {"key": "value"}, [1, 2, 3]]';
    const [result] = parseArray(mixedArray, 0);
    expect(result).toEqual([
      1,
      'string',
      true,
      null,
      { key: 'value' },
      [1, 2, 3],
    ]);
  });

  test('parseJson should handle complex object with multiple data types', () => {
    const complexJson = `{
      "empty": {},
      "numbers": [0, -0, 1.23, -1.23, 1e5, 1.23e-4],
      "strings": ["", "hello", "special\\nchars", "unicode\\u0041"],
      "booleans": {"true": true, "false": false},
      "nullValue": null,
      "nested": {"array": [1, {"key": null}]}
    }`;
    const [result] = parseJson(complexJson, 0);
    expect(result).toEqual({
      empty: {},
      numbers: [0, 0, 1.23, -1.23, 1e5, 1.23e-4],
      strings: ['', 'hello', 'special\\nchars', 'unicodeA'],
      booleans: { true: true, false: false },
      nullValue: null,
      nested: { array: [1, { key: null }] },
    });
  });
});
