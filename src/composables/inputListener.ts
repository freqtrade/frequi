// codes we care about
export enum KeyCode {
  SHIFT_LEFT = 'ShiftLeft',
  CTRL_LEFT = 'ControlLeft',
}

export function useInputListener() {
  const allCodes = Object.values(KeyCode) as string[];
  const pressed = ref<string[]>([]);

  function onKeyDown(e: KeyboardEvent) {
    if (!allCodes.includes(e.code) || pressed.value.includes(e.code)) return;
    pressed.value.push(e.code);
  }

  function onKeyUp(e: KeyboardEvent) {
    const i = pressed.value.indexOf(e.code);
    if (i > -1) {
      pressed.value.splice(i, 1);
    }
  }

  useEventListener(document, 'keydown', onKeyDown);
  useEventListener(document, 'keyup', onKeyUp);

  return {
    isKeyPressed: (key: KeyCode) => pressed.value.includes(key),
    isAnyPressed: computed(() => pressed.value.length > 0),
  };
}
