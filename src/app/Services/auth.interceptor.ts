import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../Services/auth.service';
import { ToastrService } from 'ngx-toastr';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Inyectamos las dependencias necesarias en el contexto funcional
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastr = inject(ToastrService);

  // 2. Buscamos el token donde sea que esté guardado (por si usaron el "Recordarme")
  const token = localStorage.getItem('token') || sessionStorage.getItem('token'); 

  let clonedRequest = req;

  if (token) {
    clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // 3. Dejamos pasar la petición, pero nos quedamos "escuchando" la respuesta con un pipe
  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      
      // 4. Si el backend nos rebota con un 401 (Unauthorized)
      // Y la petición NO era un intento de login (para no pisar los errores de contraseña incorrecta)
      if (error.status === 401 && !req.url.includes('/auth/login')) {
        
        // Limpiamos la basura de la sesión expirada
        authService.logout(); 
        
        // Le avisamos al usuario amablemente
        toastr.info('Tu sesión ha expirado por seguridad. Por favor, vuelve a ingresar.', 'Sesión expirada');
        
        // Lo mandamos a la puerta
        router.navigate(['/login']); 
      }

      // Si es otro error (ej. 404, 500), lo dejamos seguir viaje para que el componente lo maneje
      return throwError(() => error);
    })
  );
};