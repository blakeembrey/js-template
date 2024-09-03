export type Template<T extends object> = (data: T) => string;

function* parse(value: string): Generator<Token, Token> {
  let index = 0;

  while (index < value.length) {
    if (value[index] === "\\") {
      yield { type: "ESCAPED", index, value: value[index + 1] || "" };
      index += 2;
      continue;
    }

    if (value[index] === "{" && value[index + 1] === "{") {
      yield { type: "{{", index, value: "{{" };
      index += 2;
      continue;
    }

    if (value[index] === "}" && value[index + 1] === "}") {
      yield { type: "}}", index, value: "{{" };
      index += 2;
      continue;
    }

    yield { type: "CHAR", index, value: value[index++] };
  }

  return { type: "END", index, value: "" };
}

interface Token {
  type: "{{" | "}}" | "CHAR" | "ESCAPED" | "END";
  index: number;
  value: string;
}

class It {
  #peek?: Token;

  constructor(private tokens: Generator<Token, Token>) {}

  peek(): Token {
    if (!this.#peek) {
      const next = this.tokens.next();
      this.#peek = next.value;
    }
    return this.#peek;
  }

  tryConsume(type: Token["type"]): Token | undefined {
    const token = this.peek();
    if (token.type !== type) return undefined;
    this.#peek = undefined;
    return token;
  }

  consume(type: Token["type"]): Token {
    const token = this.peek();
    if (token.type !== type) {
      throw new TypeError(
        `Unexpected ${token.type} at index ${token.index}, expected ${type}`,
      );
    }
    this.#peek = undefined;
    return token;
  }
}

/**
 * Fast and simple string templates.
 */
export function template<T extends object = object>(value: string) {
  const it = new It(parse(value));
  const values: Array<string | Template<T>> = [];
  let text = "";

  while (true) {
    const value = it.tryConsume("CHAR") || it.tryConsume("ESCAPED");
    if (value) {
      text += value.value;
      continue;
    }

    if (text) {
      values.push(text);
      text = "";
    }

    if (it.tryConsume("{{")) {
      const path: string[] = [];
      let key = "";

      while (true) {
        const escaped = it.tryConsume("ESCAPED");
        if (escaped) {
          key += escaped.value;
          continue;
        }

        const char = it.tryConsume("CHAR");
        if (char) {
          if (char.value === ".") {
            path.push(key);
            key = "";
            continue;
          }
          key += char.value;
          continue;
        }

        path.push(key);
        it.consume("}}");
        break;
      }

      values.push(getter(path));
      continue;
    }

    it.consume("END");
    break;
  }

  return (data: T) => {
    let result = "";
    for (const value of values) {
      result += typeof value === "string" ? value : value(data);
    }
    return result;
  };
}

const hasOwnProperty = Object.prototype.hasOwnProperty;

function getter(path: string[]) {
  return (data: any) => {
    let value = data;
    for (const key of path) {
      if (hasOwnProperty.call(value, key)) {
        value = value[key];
      } else {
        throw new TypeError(`Missing ${path.map(escape).join(".")} in data`);
      }
    }
    return value;
  };
}

function escape(key: string) {
  return key.replace(/\./g, "\\.");
}
