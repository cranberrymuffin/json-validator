export function parseJson(str, idx) {
  const dict = {};
  try {
    if (str[idx] !== '{') {
      console.error("Expected '{' at index " + idx);
      return null;
    }
    idx += 1;
    let key = null;
    let value = null;
    while (str[idx] !== '}') {
      if (str[idx] !== ',' && /\S/.test(str[idx]) && str[idx] !== ':') {
        if (key === null) {
          key = parseString(str, idx);
          if (key !== null) {
            idx = key[1];
            key = key[0];
          } else {
            console.error('Expected key at index ' + idx);
            return null;
          }
        } else if (value === null) {
          value = parseValue(str, idx);
          if (value !== null) {
            idx = value[1];
            value = value[0];
            dict[key] = value;
            key = null;
            value = null;
          } else {
            console.error(
              "Expected value for key '" + key + "' at index " + idx,
            );
            return null;
          }
        }
      } else {
        idx += 1;
      }
    }
    idx += 1;
    return [dict, idx];
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
    while (str[idx] !== ']') {
      if (str[idx] !== ',' && /\S/.test(str[idx])) {
        const val = parseValue(str, idx);
        if (val !== null) {
          arr.push(val[0]);
          idx = val[1];
        } else {
          return null;
        }
      } else {
        idx += 1;
      }
    }
    idx += 1;
    return [arr, idx];
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
    while (str[idx] !== '"') {
      data += str[idx];
      if (str[idx] == '\\' && idx + 1 < str.length && str[idx + 1] == '"') {
        data += str[idx + 1];
        idx += 2;
      } else {
        idx += 1;
      }
    }
    idx += 1;
    return [data, idx];
  } catch (error) {
    console.error('Error in parseString: ' + error);
    return null;
  }
}

export function parseNumber(str, idx) {
  try {
    let data = '';
    while (
      (str[idx] >= '0' && str[idx] <= '9') ||
      str[idx] === '-' ||
      str[idx] === 'e' ||
      str[idx] === 'E' ||
      str[idx] === '.'
    ) {
      data += str[idx];
      idx += 1;
    }
    if (data === '') {
      return null;
    } else {
      return [Number(data), idx];
    }
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
