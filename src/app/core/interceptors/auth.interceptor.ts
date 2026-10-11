import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const mutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  return next(
    req.clone({
      withCredentials: true,
      setHeaders: mutating ? { 'X-CSRF-Protection': '1' } : {},
    }),
  );
};
