import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

import { provideAnimations } from '@angular/platform-browser/animations';

import { provideToastr } from 'ngx-toastr';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideToastr({
      positionClass: 'toast-bottom-center',
      preventDuplicates: true,
      timeOut: 3000,
      progressBar: true,
      progressAnimation: 'increasing',
    })
  ]
};
