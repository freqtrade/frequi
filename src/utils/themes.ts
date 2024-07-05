interface ThemeType {
  name: string;
  description: string;
  dark: boolean;
  bootswatch: boolean;
}
const themeList: ThemeType[] = [
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

export function getTheme(theme: string): ThemeType | undefined {
  if (theme !== undefined) {
    return themeList.find((item) => item.name.toLowerCase() === theme.toLowerCase());
  }
  return undefined;
}
