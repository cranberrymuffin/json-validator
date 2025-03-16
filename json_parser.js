export function parseJson(str, idx) {
  const dict = {};
  try {
    if (str[idx] !== '{') {
      console.error("Expected '{' at index " + idx);
      return null;
    }
    idx += 1;

    // Skip whitespace after opening brace
    while (idx < str.length && /\s/.test(str[idx])) {
      idx++;
    }

    // Handle empty object
    if (str[idx] === '}') {
      return [dict, idx + 1];
    }

    let key = null;
    let wasSeperatorSeen = false;
    let wasCommaSeen = true;
    let value = null;

    while (str[idx] !== '}') {
      if (/\S/.test(str[idx])) {
        if (key === null && wasCommaSeen) {
          key = parseString(str, idx);
          if (key !== null) {
            idx = key[1];
            key = key[0];
            wasCommaSeen = false;
          } else {
            console.error('Expected key at index ' + idx);
            return null;
          }
        } else if (!wasSeperatorSeen && str[idx] === ':') {
          wasSeperatorSeen = true;
          idx += 1;
        } else if (value === null && wasSeperatorSeen) {
          value = parseValue(str, idx);
          if (value !== null) {
            idx = value[1];
            value = value[0];
            dict[key] = value;
            key = null;
            value = null;
            wasSeperatorSeen = false;
          } else {
            console.error(
              "Expected value for key '" + key + "' at index " + idx,
            );
            return null;
          }
        } else if (!wasCommaSeen && str[idx] === ',') {
          wasCommaSeen = true;
          idx += 1;
        } else {
          return null;
        }
      } else {
        idx += 1;
      }
    }
    idx += 1;
    if (key === null && value === null && !wasCommaSeen && !wasSeperatorSeen) {
      return [dict, idx];
    }
    return null;
  } catch (error) {
    console.error('Error in parseJson: ' + error);
    return null;
  }
}

export function parseValue(str, idx) {
  let val = parseNull(str, idx);
  if (val !== null) {
    return val;
  }
  val = parseBoolean(str, idx);
  if (val !== null) {
    return val;
  }
  val = parseString(str, idx);
  if (val !== null) {
    return val;
  }
  val = parseNumber(str, idx);
  if (val !== null) {
    return val;
  }
  val = parseArray(str, idx);
  if (val !== null) {
    return val;
  }
  val = parseJson(str, idx);
  if (val !== null) {
    return val;
  }
  console.error('No valid value at index ' + idx);
  return null;
}

export function parseArray(str, idx) {
  const arr = [];
  try {
    if (str[idx] !== '[') {
      return null;
    }
    idx += 1;

    // Skip whitespace after opening bracket
    while (idx < str.length && /\s/.test(str[idx])) {
      idx++;
    }

    // Handle empty array
    if (str[idx] === ']') {
      return [arr, idx + 1];
    }

    let wasCommaSeen = true;

    while (str[idx] !== ']') {
      if (/\S/.test(str[idx])) {
        if (wasCommaSeen) {
          const val = parseValue(str, idx);
          if (val !== null) {
            arr.push(val[0]);
            idx = val[1];
            wasCommaSeen = false;
          } else {
            return null;
          }
        } else if (str[idx] === ',') {
          wasCommaSeen = true;
          idx += 1;
        } else {
          return null;
        }
      } else {
        idx += 1;
      }
    }
    idx += 1;
    if (!wasCommaSeen) {
      return [arr, idx];
    }
    return null;
  } catch (error) {
    console.error('Error in parseArray: ' + error);
    return null;
  }
}

export function parseBoolean(str, idx) {
  try {
    const true_val = 'true';
    const false_val = 'false';
    if (str.slice(idx, idx + true_val.length) === true_val) {
      return [true, idx + true_val.length];
    } else if (str.slice(idx, idx + false_val.length) === false_val) {
      return [false, idx + false_val.length];
    }
    return null;
  } catch (error) {
    console.error('Error in parseBoolean: ' + error);
    return null;
  }
}

export function parseString(str, idx) {
  try {
    let data = '';
    if (str[idx] !== '"') {
      return null;
    }
    idx += 1;

    while (
      idx < str.length &&
      (str[idx] !== '"' || (idx > 0 && str[idx - 1] === '\\'))
    ) {
      if (str[idx] === '\\') {
        idx++;
        if (idx >= str.length) {
          console.error('Unexpected end of string after escape character');
          return null;
        }

        switch (str[idx]) {
          case '"': // double quote
          case '\\': // backslash
          case '/': // forward slash
            data += str[idx];
            break;
          case 'b': // backspace
            data += '\\b';
            break;
          case 'f': // form feed
            data += '\\f';
            break;
          case 'n': // newline
            data += '\\n';
            break;
          case 'r': // carriage return
            data += '\\r';
            break;
          case 't': // tab
            data += '\\t';
            break;
          case 'u': // unicode
            if (idx + 4 >= str.length) {
              console.error('Incomplete Unicode escape sequence');
              return null;
            }
            const hex = str.slice(idx + 1, idx + 5);
            if (!/^[0-9A-Fa-f]{4}$/.test(hex)) {
              console.error('Invalid Unicode escape sequence');
              return null;
            }
            data += String.fromCharCode(parseInt(hex, 16));
            idx += 4;
            break;
          default:
            // Invalid escape sequence
            console.error('Invalid escape sequence: \\' + str[idx]);
            return null;
        }
      } else {
        data += str[idx];
      }
      idx++;
    }

    if (idx >= str.length || str[idx] !== '"') {
      console.error('Unterminated string');
      return null;
    }

    return [data, idx + 1];
  } catch (error) {
    console.error('Error in parseString: ' + error);
    return null;
  }
}

export function parseNumber(str, idx) {
  try {
    let data = '';
    let start = idx;

    // Handle sign
    if (str[idx] === '-' || str[idx] === '+') {
      data += str[idx];
      idx++;
    }

    // Handle integer part
    while (str[idx] >= '0' && str[idx] <= '9') {
      data += str[idx];
      idx++;
    }

    // Handle decimal point and fraction
    if (str[idx] === '.') {
      data += str[idx];
      idx++;
      while (str[idx] >= '0' && str[idx] <= '9') {
        data += str[idx];
        idx++;
      }
    }

    // Handle exponent
    if (str[idx] === 'e' || str[idx] === 'E') {
      data += str[idx];
      idx++;
      if (str[idx] === '+' || str[idx] === '-') {
        data += str[idx];
        idx++;
      }
      while (str[idx] >= '0' && str[idx] <= '9') {
        data += str[idx];
        idx++;
      }
    }

    if (data === '' || data === '-' || data === '+') {
      return null;
    }

    const num = Number(data);
    // Special case: convert -0 to 0
    if (Object.is(num, -0)) {
      return [0, idx];
    }
    return [num, idx];
  } catch (error) {
    console.error('Error in parseNumber: ' + error);
    return null;
  }
}

export function parseNull(str, idx) {
  try {
    const null_val = 'null';
    if (str.slice(idx, idx + null_val.length) === null_val) {
      return [null, idx + null_val.length];
    }
    return null;
  } catch (error) {
    console.error('Error in parseNull: ' + error);
    return null;
  }
}
