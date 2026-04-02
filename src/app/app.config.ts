import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';

import { routes } from './app.routes';
import { authInterceptor } from './Services/auth.interceptor';
import { provideMarkdown } from 'ngx-markdown';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideAnimations(),
    provideMarkdown(),
    provideHttpClient(
    withInterceptors([authInterceptor])
    ),

    provideToastr({
      positionClass: 'toast-bottom-center',
      preventDuplicates: true,
      timeOut: 3000,
      progressBar: true,
      progressAnimation: 'increasing',
    })
  ]
};