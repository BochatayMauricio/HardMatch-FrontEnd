import { HttpInterceptorFn } from '@angular/common/http';
import { BACKEND_API_URL } from '../../utils/constants';

const AUTH_EXCLUDED_PATHS = ['/auth/login', '/auth/register'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isBackendRequest = req.url.startsWith(BACKEND_API_URL);
  const isExcludedAuthPath = AUTH_EXCLUDED_PATHS.some((path) => req.url.includes(path));

  if (!isBackendRequest || isExcludedAuthPath) {
    return next(req);
  }

  const token = localStorage.getItem('token');
  if (!token) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authReq);
};
