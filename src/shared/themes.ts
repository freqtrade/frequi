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
  {
    name: 'Cerulean',
    description: 'A calm blue sky',
    dark: false,
    bootswatch: true,
  },
  {
    name: 'Cosmo',
    description: 'An ode to Metro',
    dark: false,
    bootswatch: true,
  },

  {
    name: 'Cyborg',
    description: 'Jet black and electric blue',
    dark: true,
    bootswatch: true,
  },

  {
    name: 'Darkly',
    description: 'Flatly in night mode',
    dark: true,
    bootswatch: true,
  },

  {
    name: 'Flatly',
    description: 'Flat and modern',
    dark: false,
    bootswatch: true,
  },

  {
    name: 'Journal',
    description: 'Crisp like a new sheet of paper',
    dark: false,
    bootswatch: true,
  },

  {
    name: 'Litera',
    description: 'The medium is the message',
    dark: false,
    bootswatch: true,
  },

  {
    name: 'Lumen',
    description: 'Light and shadow',
    dark: false,
    bootswatch: true,
  },

  {
    name: 'Lux',
    description: 'A touch of class',
    dark: false,
    bootswatch: true,
  },

  {
    name: 'Materia',
    description: 'Material is the metaphor',
    dark: false,
    bootswatch: true,
  },

  {
    name: 'Minty',
    description: 'A fresh feel',
    dark: false,
    bootswatch: true,
  },

  {
    name: 'Pulse',
    description: 'A trace of purple',
    dark: false,
    bootswatch: true,
  },

  {
    name: 'Sandstone',
    description: 'A touch of warmth',
    dark: false,
    bootswatch: true,
  },

  {
    name: 'Simplex',
    description: 'Mini and minimalist',
    dark: false,
    bootswatch: true,
  },

  {
    name: 'Sketchy',
    description: 'A hand-drawn look for mockups and mirth',
    dark: false,
    bootswatch: true,
  },

  {
    name: 'Slate',
    description: 'Shades of gunmetal gray',
    dark: true,
    bootswatch: true,
  },

  {
    name: 'Solar',
    description: 'A spin on Solarized',
    dark: true,
    bootswatch: true,
  },

  {
    name: 'Spacelab',
    description: 'Silvery and sleek',
    dark: false,
    bootswatch: true,
  },

  {
    name: 'Superhero',
    description: 'The brave and the blue',
    dark: true,
    bootswatch: true,
  },

  {
    name: 'United',
    description: 'Ubuntu orange and unique font',
    dark: false,
    bootswatch: true,
  },

  {
    name: 'Yeti',
    description: 'A friendly foundation',
    dark: false,
    bootswatch: true,
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
