import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';

const MedicalRed = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{red.50}',
      100: '{red.100}',
      200: '{red.200}',
      300: '{red.300}',
      400: '{red.400}',
      500: '{red.500}',
      600: '{red.600}',
      700: '{red.700}',
      800: '{red.800}',
      900: '{red.900}',
      950: '{red.950}',
    },
    // colorScheme pitfall fix from ngprime web
    colorScheme: {
      light: {
        primary: {
          color: '{red.600}',
          inverseColor: '#ffffff',
          hoverColor: '{red.700}',
          activeColor: '{red.800}',
        },
        highlight: {
          background: '{red.50}',
          focusBackground: '{red.100}',
          color: '{red.700}',
          focusColor: '{red.800}',
        },
      },
      dark: {
        primary: {
          color: '{red.400}',
          inverseColor: '{surface.900}',
          hoverColor: '{red.300}',
          activeColor: '{red.200}',
        },
        highlight: {
          background: 'color-mix(in srgb, {red.400}, transparent 84%)',
          focusBackground: 'color-mix(in srgb, {red.400}, transparent 76%)',
          color: '{red.200}',
          focusColor: '{red.100}',
        },
      },
    },
  },
});

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    providePrimeNG({
      theme: {
        preset: MedicalRed,
        options: {
          darkModeSelector: '.app-dark',
          cssLayer: false,
        },
      },
    }),
  ],
};
