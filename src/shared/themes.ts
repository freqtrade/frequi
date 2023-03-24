export interface ThemeType {
  name: string;
  description: string;
  dark: boolean;
  bootswatch: boolean;
}
export const themeList: ThemeType[] = [
  {
    name: 'Bootstrap',
    description: 'Plain bootstrap default theme',
    dark: false,
    bootswatch: false,
  },
  {
    name: 'Bootstrap_dark',
    description: 'Plain dark bootstrap default theme',
    dark: true,
    bootswatch: false,
  },
];

export function storeCurrentTheme(themeName: string) {
  window.localStorage.theme = themeName;
}

export function getTheme(theme: string): ThemeType | undefined {
  if (theme !== undefined) {
    return themeList.find((item) => item.name.toLowerCase() === theme.toLowerCase());
  }
  return undefined;
}

export function getCurrentTheme(): string {
  const { theme } = window.localStorage;
  return theme;
}
