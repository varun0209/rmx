import { Injectable, Injector,  } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from "@angular/common/http";
import { Observable } from "rxjs";
import { Router } from '@angular/router';
import { StorageData } from '../app/enums/storage.enum';
import { UserIdleService } from 'angular-user-idle';
import { tap } from 'rxjs/operators';
import { checkNullorUndefined } from "./enums/nullorundefined";

@Injectable()
export class TokenInterceptor implements HttpInterceptor{
 
    storageData = StorageData;

    constructor(private router: Router,
        private userIdle: UserIdleService
        ) {
     }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!checkNullorUndefined(localStorage.getItem(this.storageData.token))) {
            request = request.clone({
                setHeaders: {
                    Authorization: 'Bearer ' + localStorage.getItem(this.storageData.token)
                }
            });
        }
        return next.handle(request).pipe(
            // There may be other events besides the response.
            tap((event: HttpResponse<any>) => {
                if (event instanceof HttpResponse) {
                    // do stuff with response if you want
                }
            }, (err: any) => {
                if (err instanceof HttpErrorResponse) {
                    if (err.status === 401) {
                        // redirect to the login route
                        this.authLogout();
                    }
                }
            })
        );

    }
    authLogout(){
        this.userIdle.stopWatching();
        localStorage.clear();
        this.router.navigate(['login']);
    }
}
