import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { AppService } from '../utilities/rlcutl/app.service';
import { String } from 'typescript-string-operations';
import { ApiService } from '../utilities/rlcutl/api.service';
import { ApiConfigService } from '../utilities/rlcutl/api-config.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppErrorService } from '../utilities/rlcutl/app-error.service';
import { MasterPageService } from '../utilities/rlcutl/master-page.service';
import { ClientData } from '../models/common/ClientData';
import { StorageData } from '../enums/storage.enum';
import { StatusCodes } from '../enums/status.enum';
import { checkNullorUndefined } from '../enums/nullorundefined';


@Injectable()
export class LoginService {
  langConfig: any;
  clientData = new ClientData();
    roleCapabilities: any;
    storageData = StorageData;
    statusCode = StatusCodes;
  constructor(
    private http: HttpClient,
    private snackbar: XpoSnackBar,
    private appService:AppService,
    private spinner: NgxSpinnerService,
    private appErrService: AppErrorService,
    private apiConfigService: ApiConfigService,
    private apiService: ApiService,
  ) { }


 

getTimeOutConfig(): any {
  this.http.get('./assets/app-timeout.json').subscribe(
      data => {
          localStorage.setItem(this.storageData.timeOutConfig, JSON.stringify(data));
          this.appService.timeOutConfig();
      },
      (error: HttpErrorResponse) => {
          this.snackbar.error("Failed to load timeout configuration data");
      }
  );
}

// getRoleCapabilities
getRoleCapabilities(uiData){
    this.spinner.show();
    this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
    let requestObj = { ClientData: this.clientData, UIData: uiData };
    const url = String.Join("/", this.apiConfigService.getRoleCapabilities);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let result = response.body;
        this.spinner.hide();
        if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) {
              this.roleCapabilities = result.Response;
        }
        else  if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) { 
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }


}
