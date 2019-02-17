const DATA_VAR_NAME = "data";

export type Template<T extends object> = (data: T) => string;

/**
 * Stringify a template into a function.
 */
export function compile(value: string, displayName = "template") {
  const str = value.replace(/"|{{[^{]+}}/g, prop => {
    if (prop === '"') return '\\"';
    return `" + ${DATA_VAR_NAME}.${prop.slice(2, -2).trim()} + "`;
  });

  return `function ${displayName}(${DATA_VAR_NAME}) { return "${str}"; }`;
}

/**
 * Fast and simple string templates.
 */
export function template<T extends object = object>(
  value: string,
  displayName?: string
) {
  const body = compile(value, displayName);
  return new Function(`return (${body});`)() as Template<T>;
}
