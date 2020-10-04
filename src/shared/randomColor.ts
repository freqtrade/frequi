export default function () {
  // eslint-disable-next-line no-bitwise
  return `#${((Math.random() * 0xffffff) << 0).toString(16)}`;
}
