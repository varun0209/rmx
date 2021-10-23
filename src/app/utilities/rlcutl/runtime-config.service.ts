import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RuntimeSettings } from '../../models/common/RuntimeSettings';
import { tap } from 'rxjs/operators';

@Injectable()
export class RuntimeConfigService {
  runtimeConfig: any = null;
  
  constructor (private injector: Injector,private http: HttpClient) { }

  public loadRuntimeConfig():Promise<any>  {
    const http = this.injector.get(HttpClient);

    return http.get('./assets/settings/runtime-config.json').pipe(
      tap((res) => this.runtimeConfig = res)
    ).toPromise();
  }

  public exportInputParameter(): Promise<any> {
    const http = this.injector.get(HttpClient);

    return http.get('./assets/settings/export-config.json').pipe(
      tap((res) => res)
    ).toPromise();
  }
}