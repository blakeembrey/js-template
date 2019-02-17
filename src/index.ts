const DATA_VAR_NAME = "data";

export type Template<T extends object> = (data: T) => string;

/**
 * Fast and simple string templates.
 */
export function template<T extends object = object>(value: string) {
  const str = value.replace(/"|{{[^{]+}}/g, prop => {
    if (prop === '"') return '\\"';
    return `" + ${DATA_VAR_NAME}.${prop.slice(2, -2).trim()} + "`;
  });

  return new Function(DATA_VAR_NAME, `return "${str}";`) as Template<T>;
}
