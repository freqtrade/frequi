/* Provide Type for Vite's import.meta.env structure */
interface ImportMeta {
  env: {
    BASE_URL: string;
    MODE: string;
    PROD: boolean;
    DEV: boolean;
  };
}
