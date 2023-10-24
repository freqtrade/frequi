interface childObjects {
  [key: string]: any;
}
interface MutatingObject {
  [key: string]: childObjects[];
}

/**
 *
 * @param originalobj Object in the form {Name, [{metric: value}]]}
 * @param valueKey Key to use for result
 * @returns Object in the form [{valueKey: metric, Name: value}]
 */
export function formatObjectForTable(originalobj: MutatingObject, valueKey: string) {
  const result = Object.entries(originalobj).reduce((acc: childObjects[], [key, value]) => {
    value.forEach((item) => {
      const [metric, val] = Object.entries(item)[0];
      const existingItem = acc.find((i) => i[valueKey] === metric);
      if (existingItem) {
        existingItem[key] = val;
      } else {
        acc.push({
          [valueKey]: metric,
          [key]: val,
        });
      }
    });
    return acc;
  }, []);
  return result;
}
