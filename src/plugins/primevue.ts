import '@/styles/tailwind.css';
import PrimeVue from 'primevue/config';
// import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

const FtTheme = definePreset(Aura, {});

export {
  PrimeVue,
  FtTheme,
  // ConfirmationService,
  ToastService,
};
