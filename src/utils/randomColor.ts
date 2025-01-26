export default function () {
  return `#${(Math.floor(Math.random() * (0xFFFFFF - 0x100000 + 1)) + 0x100000).toString(16)}`;
}
