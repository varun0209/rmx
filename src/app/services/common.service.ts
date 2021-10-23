import { Grid } from './../models/common/Grid';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AppErrorService } from './../utilities/rlcutl/app-error.service';
import { ApiService } from './../utilities/rlcutl/api.service';
import { ApiConfigService } from './../utilities/rlcutl/api-config.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { String } from 'typescript-string-operations';
import { ReceivingDevice } from './../models/receiving/ReceivingDevice';
import { ReceiptDetail, Receipttrans } from '../models/receiving/Receipt';
import { MasterPageService } from './../utilities/rlcutl/master-page.service';
import { Receipt } from './../models/receiving/Receipt';
import { LottableTrans } from './../models/common/LottableTrans';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { AppService } from '../utilities/rlcutl/app.service';
import { FindTraceHoldComponent } from '../framework/busctl/find-trace-hold/find-trace-hold.component';
import { StorageData } from '../enums/storage.enum';
import { StatusCodes } from '../enums/status.enum';
import { OperationEnum } from '../enums/operation.enum';
import { UiData } from '../models/common/UiData';
import * as XLSX from 'xlsx';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { dropdown } from '../models/common/Dropdown';
import { map } from 'rxjs/operators';
import { checkNullorUndefined } from '../enums/nullorundefined';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  clientData: any;
  uiData: any;
  response: any;
  modeltitle: string;
  traceData: any;
  modalData: any;
  uiObject: { uiData: any; };
  storageData = StorageData;
  readOnlyDevice: any;
  readOnlyDeviceArray = [];
  public emitReadOnlyDeviceResponse = new BehaviorSubject<any>(null);
  public emitReadOnlyDeviceResponseForContainer = new BehaviorSubject<any>(null);
  statusCode = StatusCodes;
  operationList = [];
  grid: Grid;
  constructor(
    private snackbar: XpoSnackBar,
    private appService: AppService,
    private spinner: NgxSpinnerService,
    private appErrService: AppErrorService,
    private apiConfigService: ApiConfigService,
    private apiService: ApiService,
    private http: HttpClient,
    private masterPageService: MasterPageService
  ) { }

  // to check dynamic pattern
  checkPattern(defaultPattern, OptPattern, message, value) {
    let regPattern;
    if (!this.appService.checkNullOrUndefined(defaultPattern)) {
      regPattern = new RegExp(defaultPattern);
    }
    if (!this.appService.checkNullOrUndefined(OptPattern)) {
      regPattern = new RegExp(OptPattern);
    }
    if (!this.appService.checkNullOrUndefined(regPattern)) {
      if (regPattern.test(value.trim())) {
        this.appErrService.setAlert(message, true);
        return false;
      }
    }
    return true;
  }

  // postCommonUpdateProcess
  postUpdateProcess(url, requestObj) {
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe();
  }

  findTraceHold(traceData, uiData) {
    this.spinner.show();
    this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
    const requestObj = { ClientData: this.clientData, UIData: uiData };
    const url = String.Join('/', this.apiConfigService.findTraceHold, traceData.traceType, traceData.traceValue);
    return this.apiService.apiPostRequest(url, requestObj)
      .pipe(map(response => {
        return response.body;
      },
        error => {
          this.appErrService.handleAppError(error);
        }));
  }

  updateTraceNotes(traceInfo, uiData) {
    this.spinner.show();
    this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
    const requestObj = { ClientData: this.clientData, UIData: uiData, TraceHold: traceInfo };
    const url = String.Join('/', this.apiConfigService.updateTraceNotes);
    return this.apiService.apiPostRequest(url, requestObj)
      .pipe(map(response => {
        return response.body;
      },
        error => {
          this.appErrService.handleAppError(error);
        }));
  }

  // get dock tracking images
  getDocTrkImages(serialNumber, uiData, device) {
    this.spinner.show();
    this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
    const requestObj = { ClientData: this.clientData, UIData: uiData, Device: device };
    const url = String.Join('/', this.apiConfigService.getDocTrkImagesUrl, serialNumber);
    return this.apiService.apiPostRequest(url, requestObj)
      .pipe(map(response => {
        return response.body;
      },
        error => {
          this.appErrService.handleAppError(error);
        }));
  }

  // upload Images
  uploadCapturedImages(requestObj) {
    this.apiService.apiPostRequest(this.apiConfigService.uploadCapImagesUrl, requestObj)
      .subscribe(response => {
        const result = response.body;
        if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      }, error => {
        this.appErrService.handleAppError(error);
      });
  }


  getReadOnlyDeviceDetails(serialNumber, uiData, isArrayRequired?) {
    this.readOnlyDevice = {};
    this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
    const requestObj = { ClientData: this.clientData, UIData: uiData };
    const url = String.Join('/', this.apiConfigService.getReadOnlyDeviceDetails, serialNumber);
    return this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const result = response.body;
        if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) {
          if (!checkNullorUndefined(result.Response) && !checkNullorUndefined(result.Response.ReadonlyDevice)) {
            this.readOnlyDevice = result.Response.ReadonlyDevice;
            if (!checkNullorUndefined(isArrayRequired) && isArrayRequired) {
              this.readOnlyDeviceArray.push(this.readOnlyDevice);
            }
          }
        } else if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
        if (result.Status) {
          this.emitReadOnlyDeviceResponse.next(result);
          if (!checkNullorUndefined(isArrayRequired) && isArrayRequired) {
            this.emitReadOnlyDeviceResponseForContainer.next(result);
          }
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }

  getReadOnlyDeviceDetailsForContainer(containerID, uiData) {
    this.spinner.show();
    this.readOnlyDeviceArray = [];
    this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
    const requestObj = { ClientData: this.clientData, UIData: uiData };
    const url = String.Join('/', this.apiConfigService.getReadOnlyDeviceDetailsForContainer, containerID);
    return this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const result = response.body;
        this.spinner.hide();
        if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) {
          if (!checkNullorUndefined(result.Response) && !checkNullorUndefined(result.Response.ReadonlyDevices)) {
            this.readOnlyDeviceArray = result.Response.ReadonlyDevices;
          }
        } else if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
        if (result.Status) {
          this.emitReadOnlyDeviceResponseForContainer.next(result);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }

  validateReadOnlyDeviceDetails(uiData, testResult?) {
    this.spinner.show();
    this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
    const requestObj = { ClientData: this.clientData, UIData: uiData, TestResult: testResult, ReadonlyDevice: this.readOnlyDevice };
    const url = String.Join('/', this.apiConfigService.validateReadOnlyDeviceDetails);
    return this.apiService.apiPostRequest(url, requestObj)
      .pipe(map(response => {
        return response.body;
      },
        error => {
          this.appErrService.handleAppError(error);
        }));
  }


  validateReadOnlyDeviceDetailsForContainer(uiData) {
    this.spinner.show();
    this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
    const requestObj = { ClientData: this.clientData, UIData: uiData, ReadonlyDevices: this.readOnlyDeviceArray };
    const url = String.Join('/', this.apiConfigService.validateReadOnlyDeviceDetailsForContainer);
    return this.apiService.apiPostRequest(url, requestObj)
      .pipe(map(response => {
        return response.body;
      },
        error => {
          this.appErrService.handleAppError(error);
        }));
  }

  // getQueuedTestSerialNumbers
  getQueuedTestSerialNumbers(clientData, uiData, inboundContainerId) {
    this.masterPageService.gridContainerDetails = null;
    const requestObj = { ClientData: clientData, UIData: uiData };
    const testurl = String.Join('/', this.apiConfigService.getContainersDeviceInfoUrl, inboundContainerId);
    this.apiService.apiPostRequest(testurl, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (!this.appService.checkNullOrUndefined(res)
          && res.Status === StatusCodes.pass
          && !this.appService.checkNullOrUndefined(res.Response)
          && res.Response.length
        ) {
          this.grid = new Grid();
          this.masterPageService.gridContainerDetails = this.appService.onGenerateJson(res.Response, this.grid);
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }
  clearReadOnly() {
    this.readOnlyDevice = {};
    this.readOnlyDeviceArray = [];
  }

  // common Api need to use in all screens
  commonApiCall(url, requestObj, callBack) {
    this.spinner.show();
    this.appErrService.clearAlert();
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (!checkNullorUndefined(res) && res.Status === StatusCodes.pass) {
          callBack(res, true);
        } else if (res.Status === StatusCodes.fail && !checkNullorUndefined(res)) {
          if (!checkNullorUndefined(res.ErrorMessage.ErrorDetails)) {
            this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          } else {
            this.appErrService.setAlert(res.StatusMessage, true);
          }
          this.spinner.hide();
          callBack(res, false);
        } else if (res.Status === StatusCodes.noResult && !checkNullorUndefined(res)) {
          if (res.hasOwnProperty('StatusMessage')) {
            this.snackbar.info(res.StatusMessage)
          }
          callBack(res, false);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }

  // get Operations
  getOperations(mname, device, uiData) {
    this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
    if (mname != null && mname != undefined) {
      this.spinner.show();
      const requestObj = { ClientData: this.clientData, Device: device, UIData: uiData };
      const url = String.Join('/', this.apiConfigService.getRouteOperationsUrl, mname);
      this.apiService.apiPostRequest(url, requestObj)
        .subscribe(response => {
          const res = response.body;
          if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
            if (!checkNullorUndefined(res.Response) && res.Response.length) {
              this.masterPageService.operCategoryTests = res.Response.filter(x => x.Category === this.masterPageService.categoryName);
              this.operationList = res.Response.filter(x => x.Category === this.masterPageService.categoryName);
            }
          } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
            this.spinner.hide();
            this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          }
        }, erro => {
          this.appErrService.handleAppError(erro);
        });
    }

  }

  // getting failed devices
  getFailedDevices(containerId) {
    this.spinner.show();
    this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
    const operationObj = this.masterPageService.getOperationForPopUp(OperationEnum.moveBatchFailedDevices);
    const uiData = new UiData();
    if (operationObj) {
      uiData.OperationId = operationObj.OperationId;
      uiData.OperCategory = operationObj.Category;
    }
    const requestObj = { ClientData: this.clientData, UIData: uiData };
    const url = String.Join('/', this.apiConfigService.getAQLFailedDevices, containerId);
    return this.apiService.apiPostRequest(url, requestObj)
      .pipe(map(response => {
        return response.body;
      }, erro => {
        this.appErrService.handleAppError(erro, false);
      }));
  }

  // close sampling batch
  closeSamplingBatch(inbContainerID, batchId, uiData, batchStatus) {
    this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
    const requestObj = { ClientData: this.clientData, UIData: uiData };
    const url = String.Join('/', this.apiConfigService.closeSamplingBatch, inbContainerID, batchId, batchStatus);
    return this.apiService.apiPostRequest(url, requestObj)
      .pipe(map(response => {
        return response.body;
      }, error => {
        this.appErrService.handleAppError(error, false);
      }));
  }

  // to print report
  printReport(data, filename) {
    const workBook = XLSX.utils.book_new(); // create a new blank book
    const workSheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workBook, workSheet, 'data'); // add the worksheet to the book
    XLSX.writeFile(workBook, `${filename}.xlsx`); // initiate a file download in browser
  }

  // to load countries list from json file
  getAllCountries(): any {
    return this.http.get('./assets/allCountries.json').pipe(map((res) => {
      return res;
    },
      (error: HttpErrorResponse) => {
        this.snackbar.error('Failed to load Countries data');
      }));
  }

  // to load states list from json file
  getAllStates(): any {
    return this.http.get('./assets/allStates.json').pipe(map((res) => {
      return res;
    },
      (error: HttpErrorResponse) => {
        this.snackbar.error('Failed to load States data');
      }));
  }

  exportTo(data, file, ext) {
    if (ext === 'Excel') {
      this.printReport(data, file);
    } else if (ext === 'CSV') {
      this.jsonToCSV(data, file);
    }
  }

  jsonToCSV(data, filename = 'data') {
    if (data.length) {   // i.e  converting CSV file to JSON
      const csvData = this.ConvertToCSV(data, Object.keys(data[0]));
      const blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
      const dwldLink = document.createElement('a');
      const url = URL.createObjectURL(blob);
      const isSafariBrowser = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
      if (isSafariBrowser) {  // if Safari open in new window to save file with random filename.
        dwldLink.setAttribute('target', '_blank');
      }
      dwldLink.setAttribute('href', url);
      dwldLink.setAttribute('download', filename + '.csv');
      dwldLink.style.visibility = 'hidden';
      document.body.appendChild(dwldLink);
      dwldLink.click();
      document.body.removeChild(dwldLink);
    }
  }

  ConvertToCSV(objArray, headerList) {
    const array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    let row = 'S.No,';

    for (let index in headerList) {
      row += headerList[index] + ',';
    }
    row = row.slice(0, -1);
    str += row + '\r\n';
    for (let i = 0; i < array.length; i++) {
      let line = (i + 1) + '';
      for (let index in headerList) {
        let head = headerList[index];

        line += ',' + array[i][head];
      }
      str += line + '\r\n';
    }
    return str;
  }

  convertExcelToJSON(event, callBack) {
    let xlsxFiles = null;
    let jsonData = [];
    const columns = [];
    const reader = new FileReader();
    this.spinner.show();
    const file = event[0];
    reader.onload = () => {
      xlsxFiles = XLSX.read(reader.result, { type: 'binary', cellDates: true });
      jsonData = xlsxFiles.SheetNames.reduce((initial, name) => {
        const sheet = xlsxFiles.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet, { raw: false, defval: '' });
        return initial;
      }, {});
      for (const key in jsonData) {
        if (jsonData[key].length) {
          columns.push({ Id: key, Text: key });
        } else {
          delete jsonData[key];
        }
      }
      this.spinner.hide();
      if (columns.length) {
        callBack(jsonData, columns);
      } else {
        this.snackbar.error(this.appService.getErrorText('2660076'));
        callBack(null);
      }
    };
    reader.readAsBinaryString(file);
  }

  // removing comma from start and end
  getTruncateObj(obj, pattern) {
    if (!this.appService.checkNullOrUndefined(obj)) {
      Object.keys(obj).forEach(element => {
        if (!this.appService.checkNullOrUndefined(obj[element])) {
          if (typeof obj[element] === 'string') {
            obj[element] = obj[element].replace(pattern, '');
          }
        }
      });
      return obj;
    }
  }

  // build dropdown values
  dropdownList(values) {
    const ddlist = [];
    values.forEach(element => {
      const dd: dropdown = new dropdown();
      dd.Id = element.Id;
      dd.Text = element.Text;
      ddlist.push(dd);
    });
    return ddlist;
  }
}
