const INPUT_VAR_NAME = "it";
const QUOTE_CHAR = '"';
const ESCAPE_CHAR = "\\";

export type Template<T extends object> = (data: T) => string;

/**
 * Stringify a template into a function.
 */
export function compile(value: string) {
  let result = QUOTE_CHAR;
  for (let i = 0; i < value.length; i++) {
    const char = value[i];

    // Escape special characters due to quoting.
    if (char === QUOTE_CHAR || char === ESCAPE_CHAR) {
      result += ESCAPE_CHAR;
    }

    // Process template param.
    if (char === "{" && value[i + 1] === "{") {
      const start = i + 2;
      let end = 0;
      let withinString = "";

      for (let j = start; j < value.length; j++) {
        const char = value[j];
        if (withinString) {
          if (char === ESCAPE_CHAR) j++;
          else if (char === withinString) withinString = "";
          continue;
        } else if (char === "}" && value[j + 1] === "}") {
          i = j + 1;
          end = j;
          break;
        } else if (char === '"' || char === "'" || char === "`") {
          withinString = char;
        }
      }

      if (!end) throw new TypeError(`Template parameter not closed at ${i}`);

      const param = value.slice(start, end).trim();
      const sep = param[0] === "[" ? "" : ".";
      result += `${QUOTE_CHAR} + (${INPUT_VAR_NAME}${sep}${param}) + ${QUOTE_CHAR}`;
      continue;
    }

    result += char;
  }
  result += QUOTE_CHAR;

  return `function (${INPUT_VAR_NAME}) { return ${result}; }`;
}

/**
 * Fast and simple string templates.
 */
export function template<T extends object = object>(value: string) {
  const body = compile(value);
  return new Function(`return (${body});`)() as Template<T>;
}
