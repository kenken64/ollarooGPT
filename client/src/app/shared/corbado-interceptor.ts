import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { db } from '../shared/prompt-db';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
    console.log("AuthTokenInterceptor");
    console.log(req.url);

    // Retrieve the auth token (this returns a promise)
    const authTokenVal = db.getAuthToken();

    return from(authTokenVal).pipe(
        switchMap((authToken) => {
            let authReq = req;

            // If token exists, clone request with Authorization header
            if (authToken) {
                console.log('Auth token:', authToken);
                authReq = req.clone({
                    headers: req.headers.set('Authorization', `Bearer ${authToken}`)
                });
            }

            console.log('Original Request Headers:', req.headers);
            console.log('Cloned Request Headers:', authReq.headers);

            // Proceed with the modified or original request
            return next(authReq);
        }),
        tap(() => {
            // Success side effect
        }),
        catchError((err: any) => {
            // Handle response error
            if (err instanceof HttpErrorResponse) {
                if (err.status === 401) {
                    db.clearAuthToken();
                }
            }
            // You can rethrow the error if needed or handle it
            return throwError(() => err);
        })
    );
};