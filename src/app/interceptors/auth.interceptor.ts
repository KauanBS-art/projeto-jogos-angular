import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  const isAuthRequest = req.url.endsWith('/auth');

  const authorizedRequest = token && !isAuthRequest
    ? req.clone({
      setHeaders: {
        Authorization: token
      }
    })
    : req;

  return next(authorizedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAuthRequest) {
        authService.logout();
      }

      return throwError(() => error);
    })
  );
};
