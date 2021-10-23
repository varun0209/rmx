import { Injectable } from '@angular/core';
import { AppErrorService } from './../utilities/rlcutl/app-error.service';
import { ApiConfigService } from './../utilities/rlcutl/api-config.service';
import { ApiService } from './../utilities/rlcutl/api.service';
import { String } from 'typescript-string-operations';
import {  map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {

  constructor(
    private apiConfigService: ApiConfigService,
    private appErrService: AppErrorService,
    private apiService: ApiService) { }


  // getContainerCategoryTypes
  getContainerCategoryTypes(clientData, uiData) {
    const requestObj = { ClientData: clientData, UIData: uiData };
    const result = this.commonResponse(this.apiConfigService.getContainerCategoryTypesUrl, requestObj);
    return result;
  }

  // getOperators
  getOperators(clientData, uiData) {
    const requestObj = { ClientData: clientData, UIData: uiData };
    const result = this.commonResponse(this.apiConfigService.getOperatorsUrl, requestObj);
    return result;
  }

  // getObjects
  getObjects(clientData, uiData) {
    const requestObj = { ClientData: clientData, UIData: uiData };
    const result = this.commonResponse(this.apiConfigService.getObjectsUrl, requestObj);
    return result;
  }

  // getLogicalOperators
  getLogicalOperators(clientData, uiData) {
    const requestObj = { ClientData: clientData, UIData: uiData };
    const result = this.commonResponse(this.apiConfigService.getLogicalOperatorsUrl, requestObj);
    return result;
  }

  // getProperties
  getProperties(clientData, uiData, objectSelected) {
    const requestObj = { ClientData: clientData, UIData: uiData };
    const url = String.Join('/', this.apiConfigService.getPropertiesUrl, objectSelected);
    const result = this.commonResponse(url, requestObj);
    return result;
  }

  // returning response
  commonResponse(url, requestObj) {
    return this.apiService.apiPostRequest(url, requestObj)
      .pipe(map(response => {
        return response.body;
      }, erro => {
        this.appErrService.handleAppError(erro);
      }));
  }
}

