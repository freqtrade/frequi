export function deepClone<T>(object: T): T {
  return JSON.parse(JSON.stringify(object));
}
