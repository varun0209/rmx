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
import { StatusCodes } from '../enums/status.enum';
import { map } from 'rxjs/operators';
import { checkNullorUndefined } from '../enums/nullorundefined';

@Injectable()
export class ReceivingService {

  authorizationkey: string;

  receivingDevice = new ReceivingDevice();
  receivingDevicesList = [];
  updatedReceipt = new Receipt();
  //lottable object
  lottableTrans: LottableTrans;
  ReceiptTrans: any;
  ReceiptDetails: any;
  ReceiptTransResponse = [];
  ReceiptDetailResponse = [];
  statusCode = StatusCodes;

  public emitGetTransactions = new BehaviorSubject<any>(null);

  constructor(
    private apiservice: ApiService,
    private apiConfigService: ApiConfigService,
    private spinner: NgxSpinnerService,
    private appErrService: AppErrorService,
    private masterPageService: MasterPageService
  ) {

  }


  //Search Based on Key
  searchInputKey(clientData, uiData, receivingMode, searchText) {
    if (!(checkNullorUndefined(searchText)) && searchText !== "") {
      this.spinner.show();
      const url = String.Join('/', this.apiConfigService.searchKeyUrl, searchText.trim());
      let requestObj = { ClientData: clientData, UIData: uiData, ReceivingMode: receivingMode };
      let result = this.commonResponse(url, requestObj);
      return result;
    }
  }

  //createReceipt
  createReceipt(clientData, uiData, authorizationObj, authorizationkey) {
    if (!(checkNullorUndefined(authorizationkey)) && authorizationkey !== "") {
      this.spinner.show();
      this.authorizationkey = authorizationkey;
      const url = String.Join('/', this.apiConfigService.createReceiptUrl, authorizationkey.trim());
      let requestObj = { ClientData: clientData, UIData: uiData, Authorization: authorizationObj };
      let result = this.commonResponse(url, requestObj);
      return result;
    }
  }

  getReceiptDetail(clientData, uiData, receipt, receivingDevice, receiptDetail, skuObj, twoDBarcode, receivingMode, callback: (data) => void) {
    this.spinner.show();
    let requestObj = { ClientData: clientData, Receipt: receipt, ReceivingDevice: receivingDevice, ReceiptDetail: receiptDetail, SKU: skuObj, TwoDBarcode: twoDBarcode, UIData: uiData, ReceivingMode: receivingMode }
    return this.apiservice.apiPostRequest(this.apiConfigService.getReceiptDetailUrl, requestObj)
      .subscribe(response => {
        let res = response.body;
        //this.spinner.hide();
        callback(res);
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }

  validateSerialNumber(inputVal, clientData, uiData, twoDBarcode, receivingDevices, receivingESNMasters, receiptDetail, swVersion, skuObj, receiptObj) {
    if (!checkNullorUndefined(inputVal) && inputVal !== "") {
      this.spinner.show();
      const url = String.Join('/', this.apiConfigService.validateSerialNumber, inputVal.trim());
      let requestObj = { ClientData: clientData, UIData: uiData, TwoDBarcode: twoDBarcode, ReceivingDevices: receivingDevices, ReceivingESNMasters: receivingESNMasters, ReceiptDetail: receiptDetail, SoftwareVersion: swVersion, SKU: skuObj, Receipt: receiptObj };
      let result = this.commonResponse(url, requestObj);
      return result;
    }
    else if (!checkNullorUndefined(twoDBarcode)) {
      this.spinner.show();
      // const url = String.Join('/', this.apiConfigService.validateSerialNumber, inputVal.trim());
      let requestObj = { ClientData: clientData, UIData: uiData, TwoDBarcode: twoDBarcode, ReceivingDevices: receivingDevices, ReceivingESNMasters: receivingESNMasters, ReceiptDetail: receiptDetail, SoftwareVersion: swVersion, SKU: skuObj, Receipt: receiptObj };
      let result = this.commonResponse(this.apiConfigService.validateSerialNumber, requestObj);
      return result;
    }

  }

  getManufacturerSKU(clientData, uiData, receivingDevice, receivingESNMaster, sku, conditionCode, twoDBarcode) {
    let requestObj = { ClientData: clientData, UIData: uiData, ReceivingDevice: receivingDevice, ReceivingESNMaster: receivingESNMaster, TwoDBarcode: twoDBarcode, SKU: sku };
    const url = String.Join('/', this.apiConfigService.getManufacturerSKUUrl, conditionCode);
    let result = this.commonResponse(url, requestObj);
    return result;
  }

  getDetermineSKU(clientData, uiData, receipt, receiptDetail, receivingDevice, receivingESNMaster, twoDBarcode, selectedSKU, conditionCode) {
    let requestObj = { ClientData: clientData, UIData: uiData, Receipt: receipt, ReceiptDetail: receiptDetail, ReceivingDevice: receivingDevice, ReceivingESNMaster: receivingESNMaster, TwoDBarcode: twoDBarcode };
    const url = String.Join('/', this.apiConfigService.getDetermineSKUsUrl, encodeURIComponent(encodeURIComponent(selectedSKU)), conditionCode);
    let result = this.commonResponse(url, requestObj);
    return result;
  }

  getEligibleSKUs(clientData, uiData, skuValue) {
    let requestObj = { ClientData: clientData, UIData: uiData };
    const url = String.Join("/", this.apiConfigService.getEligibleSKUsUrl, encodeURIComponent(encodeURIComponent(skuValue.trim().toUpperCase())));
    let result = this.commonResponse(url, requestObj);
    return result;
  }

  getExpectedSKUs(clientData, uiData, receipt, twoDBarcode, receivingMode) {
    let requestObj = { ClientData: clientData, UIData: uiData, Receipt: receipt, TwoDBarcode: twoDBarcode, ReceivingMode: receivingMode };
    let result = this.commonResponse(this.apiConfigService.getExpectedSKUsUrl, requestObj);
    return result;
  }

  getCondition(clientData, uiData, skuObj, twoDBarcode, receipt) {
    let requestObj = { ClientData: clientData, UIData: uiData, SKU: skuObj, TwoDBarcode: twoDBarcode, Receipt: receipt };
    let result = this.commonResponse(this.apiConfigService.getConditionUrl, requestObj);
    return result;
  }

  loadReceivingvalues(clientData, uiData, listOfReceivingDevices, listOfReceivingESNMasters, receiptDetail) {
    this.spinner.show();
    let requestObj = { ClientData: clientData, UIData: uiData, ReceivingDevices: listOfReceivingDevices, ReceivingESNMasters: listOfReceivingESNMasters, ReceiptDetail: receiptDetail };
    this.apiservice.apiPostRequest(this.apiConfigService.loadReceivingvalues, requestObj)
      .subscribe(response => {
        let res = response.body;
        if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
          this.receivingDevicesList = res.Response;
          this.updatedReceipt.ExternReceiptkey = this.authorizationkey;
          this.processDevice(clientData, this.receivingDevicesList, this.updatedReceipt, uiData);
        } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          //this.onErroralert = true;
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }


  //getProgram
  processDevice(clientData, listOfReceivingDevices, receipt, uiData) {
    let requestObj = { ClientData: clientData, ReceivingDevices: listOfReceivingDevices, Receipt: receipt, UIData: uiData };
    this.apiservice.apiPostRequest(this.apiConfigService.processDeviceUrl, requestObj)
      .subscribe(response => {
        let res = response.body;
        if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
          this.updatedReceipt = res.Response.Receipt;
          this.receivingDevicesList = res.Response.ReceivingDevices;
          if (res.Response.ReceivingDevices[0].ProgramName != "") {
            this.loadReceivingProgramValues(clientData, uiData, this.receivingDevicesList, this.updatedReceipt, res.Response.ReceivingDevices[0].ProgramName, this.masterPageService.operation);
          }
          else {
            this.getRoute(clientData, this.receivingDevicesList, uiData);
          }
        } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          // this.onErroralert = true;
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });;
  }

  // loadReceivingProgramValues - clientdata, uidata, list of receiving devices
  loadReceivingProgramValues(clientData, uiData, listOfReceivingDevices, receipt, programName, operation) {
    let requestObj = { ClientData: clientData, UIData: uiData, ReceivingDevices: listOfReceivingDevices, Receipt: receipt };
    const url = String.Join("/", this.apiConfigService.loadReceivingProgramValuesUrl, programName, operation);
    this.apiservice.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let res = response.body;
        if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
          this.updatedReceipt = res.Response.Receipt;  //last place for updated receipt in this file
          this.receivingDevicesList = res.Response.ReceivingDevices;
          this.getRoute(clientData, this.receivingDevicesList, uiData);
        } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(res.errormessage.errordetails, true);
          //this.onerroralert = true;
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }

  // getRoute - clientdata, uidata, list of receiving devices
  getRoute(clientData, listOfReceivingDevices, uiData) {
    let requestObj = { ClientData: clientData, Devices: listOfReceivingDevices, UIData: uiData, Receipt: this.updatedReceipt }
    this.apiservice.apiPostRequest(this.apiConfigService.recGetRouteUrl, requestObj)
      .subscribe(response => {
        let res = response.body;
        if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
          this.receivingDevicesList = res.Response.devices;  //last place for updated receivingDevice in this file
          this.getTransactions(clientData, this.receivingDevicesList, uiData);
        } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          //this.onErroralert = true;
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }

  // getTransactions - clientdata, uidata, list of receiving devices
  getTransactions(clientData, listOfReceivingDevices, uiData) {
    let requestObj = { ClientData: clientData, Devices: listOfReceivingDevices, UIData: uiData }
    let result = this.commonResponse(this.apiConfigService.recGetTransactionUrl, requestObj);
    this.emitGetTransactions.next(result);
  }

  getSuggestContainer(clientData, uiData, listOfReceivingDevices,) {
    let requestObj = { ClientData: clientData, Devices: listOfReceivingDevices, UIData: uiData }
    let result = this.commonResponse(this.apiConfigService.recSuggestContainerUrl, requestObj);
    return result;
  }

  // addSerialNumber - clientdata, uidata, receipt, container, list of receiving devices
  addSerialNumber(clientData, uiData, receivingDevices, receipt, container, isMobile, selectedExternLineNo) {
    let requestObj = { ClientData: clientData, ReceivingDevices: receivingDevices, Receipt: receipt, Container: container, UIData: uiData };
    const url = String.Join("/", this.apiConfigService.addSerialNumberUrl, isMobile, selectedExternLineNo);
    let result = this.commonResponse(url, requestObj);
    return result;
  }

  // for non-serialized items
  addAccessory(clientData, uiData, receipt, receivingDevice, receiptDetail, sku, twoDBarcode, isMobile, selectedExternLineNo) {
    const requestObj = {
      ClientData: clientData, UIData: uiData, Receipt: receipt, ReceivingDevice: receivingDevice,
      ReceiptDetail: receiptDetail, SKU: sku, TwoDBarcode: twoDBarcode
    };
    const url = String.Join('/', this.apiConfigService.addAccessoryUrl, isMobile, selectedExternLineNo);
    const result = this.commonResponse(url, requestObj);
    return result;
  }
  // addSerialNumber - clientdata, uidata,listofTransactions, list of receiving devices
  SaveTransaction(clientData, uiData, listofTransactions, receivingDevices) {
    let requestObj = { ClientData: clientData, Transactions: listofTransactions, UIData: uiData, Devices: receivingDevices, TestResultDetails: {} };
    let result = this.commonResponse(this.apiConfigService.recSaveTransactionUrl, requestObj);
    return result;
  }

  // addSerialNumber - clientdata, uidata,List of LottableTrans, list of receiving devices
  updateLottables(clientData, uiData, receivingDevices, receiptDetail) {
    this.lottableTrans = new LottableTrans();
    let headerobj = Object.keys(this.lottableTrans);
    headerobj.forEach(res => {
      if (res) {
        this.lottableTrans[res] = receiptDetail[res];
      }
    });
    let requestObj = { ClientData: clientData, UIData: uiData, Devices: receivingDevices, LottableTrans: this.lottableTrans };
    let result = this.commonResponse(this.apiConfigService.updateLottables, requestObj);
    return result;
  }

  //Receiving Modes
  getReceivingModes(clientData, uiData) {
    let requestObj = { ClientData: clientData, UIData: uiData };
    this.apiservice.apiPostRequest(this.apiConfigService.getReceivingModesUrl, requestObj)
      .subscribe(response => {
        let res = response.body;
        this.spinner.hide();
        if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
          if (res.Response.ReceivingModes.length > 0 && res.Response.ReceivingModes.length == 1) {
            let mode = res.Response.ReceivingModes;
            this.masterPageService.selectedMode(mode[0].Text, mode.indexOf(mode.Text));
          } else {
            this.masterPageService.modes = res.Response.ReceivingModes;
          }
        } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }



  //validate Tracking number
  validateTrackingNumber(clientData, uiData, trackingNoObj) {
    this.spinner.show();
    let requestObj = { ClientData: clientData, UIData: uiData, TrackingNumber: trackingNoObj };
    let result = this.commonResponse(this.apiConfigService.trackingNoUrl, requestObj);
    return result;
  }

  //Validate 2D barcode
  validate2DBarcode(clientData, uiData, barcodeObj) {
    let requestObj = { ClientData: clientData, UIData: uiData, TwoDBarcode: barcodeObj };
    let result = this.commonResponse(this.apiConfigService.validate2DBarcodeUrl, requestObj);
    return result;
  }



  //returning response
  commonResponse(url, requestObj) {
    return this.apiservice.apiPostRequest(url, requestObj)
      .pipe(map(response => {
        return response.body;
      }, erro => {
        this.appErrService.handleAppError(erro);
      }));
  }


  //Receipt Detail
  onDetailPopupJsonGrid(Response: ReceiptDetail[]) {
    if (!checkNullorUndefined(Response)) {
      this.ReceiptDetailResponse = [];
      let headingsobj = Object.keys(Response[0]);
      Response.forEach(res => {
        let element: ReceiptDetail = new ReceiptDetail();
        headingsobj.forEach(singleheader => {
          element[singleheader] = res[singleheader];
        })
        this.ReceiptDetailResponse.push(element);
      });
    }
    else {
      this.ReceiptDetailResponse = [];
    }
  }


  onReceiptTransGenerateJsonGrid(Response: Receipttrans[]) {
    if (!checkNullorUndefined(Response)) {
      this.ReceiptTransResponse = [];
      let headingsobj = Object.keys(Response[0]);
      Response.forEach(res => {
        let element: Receipttrans = new Receipttrans();
        headingsobj.forEach(singleheader => {
          element[singleheader] = res[singleheader];
        })
        this.ReceiptTransResponse.push(element);
      });
    }
    else {
      this.ReceiptTransResponse = [];
    }
  }


  clearSubscription() {
    this.emitGetTransactions.next(null);
  }
}
