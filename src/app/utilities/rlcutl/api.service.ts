import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import * as X2JS from 'x2js';
//import { Engine } from 'json-rules-engine';
import { EngineResult } from '../../models/common/EngineResult';
import { ApiConfigService } from './api-config.service';
import { ClientData } from '../../models/common/ClientData';
import { ApplicationError } from '../../models/common/ApplicationError';
import { StatusCodes } from '../../enums/status.enum';
import { StorageData } from '../../enums/storage.enum';

@Injectable()
export class ApiService {
  public options;
  clientData = new ClientData();
  statusCode = StatusCodes;
  storageData = StorageData;

  constructor(private http: HttpClient, private apiConfigService: ApiConfigService) {
    this.options = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  }

  // get API request
  public apiGetRequest(url: any): Observable<any> {
    return this.http.get(url, { headers: this.options, observe: 'response' })
      .pipe((tap<any>(response => { return response; })),
        catchError(this.handleError('apiGetRequest')));
  }

  // Post API request
  public apiPostRequest(url: any, obj?: any): Observable<any> {
    return this.http.post(url, obj, { headers: this.options, observe: 'response' })
      .pipe((tap<any>(response => {
        if (response.body && response.body.Status == this.statusCode.fail) {
          this.createLog(url, response, obj);
        }
        return response;
      })),
        catchError(this.handleError('apiPostRequest')));
  }

  createLog(url, response, request) {
    this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
    let appErr = new ApplicationError();
    appErr.Request = request;
    appErr.Response = response;
    appErr.URL = url;
    appErr.IsTextLog = true;
    let requestObj = { ClientData: this.clientData, ApplicationError: appErr };
    this.apiPostRequest(this.apiConfigService.appErrorUrl, requestObj).subscribe();
}

  // API error handling
  private handleError(operation: String) {
  return (err: HttpErrorResponse) => {
    let errMsg = `error in ${operation}()  status: ${err.status}, ${err.statusText || ''}, ${err} `;
    if (err instanceof HttpErrorResponse) {

      //console.log(`status: ${err.status}, ${err.statusText}`);

    }
    return throwError(err);
  }
}

  // Method to convert object to a JSON string. parameter can be any object.
  public convertToJson(param: any) {
  var data = JSON.stringify(param);
  return data;
}

  // Method to convert JSON string to an object. parameter can be any JSON string.
  public convertToObject(param: any) {
  var data = JSON.parse(param);
  return data;
}

  // Convert XML to JSON
  public convertXmlToJson(param: any) {
  var x2js = new X2JS();
  var result = x2js.xml2js(param);
  return result;
}

  //Json rule engine
  // public runJsonRule(rules: any[], validationData: any, factUrl: string):any {
  //     let engine = new Engine();
  //     let result: EngineResult = new EngineResult();

  //     // add rules to the engine
  //     rules.forEach(finalrule => {
  //         if (finalrule.ACTIVE_FLG == 'Y') {
  //             engine.addRule({
  //                 conditions: {
  //                     all: JSON.parse(finalrule.FORMULA) //all: this.convertToObject(finalrule.FORMULA)
  //                 },
  //                 event: {
  //                     // define the event to fire when the conditions evaluate truthy
  //                     type: finalrule.FORMULA_TYPE,
  //                     params: {
  //                         message: 'Formula is Valid!'
  //                     }
  //                 },
  //                 priority: finalrule.RANK    // priority only follows descending order
  //             });
  //         }
  //     });

  //     let facts = { Device: validationData };
  //     engine.run(facts).catch(console.log);

  //     // Register listeners with the engine for rule success and failure
  //     engine
  //         .on('success', (event, almanac) => {
  //             console.log('Device DID meet conditions for ' + event.type + ' file');              
  //             engine.stop();                
  //             this.apiGetRequest(factUrl).subscribe((data) => {

  //                 //this.result = data.json();
  //                 result.OUT_OPER_RESULT = "OUT RESULT1";
  //                 result.ASSIGN_PROPERTIES = "OUT RESULT2"
  //                 console.log(result);   
  //                 });              
  //         })
  //         .on('failure', event => {
  //             console.log('Device did ' + 'NOT' + ' meet conditions for ' + event.type + ' file');
  //         });         
  //     return result;
  // }


}

