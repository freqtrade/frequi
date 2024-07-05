export default function () {
  return `#${((Math.random() * 0xffffff) << 0).toString(16)}`;
}
