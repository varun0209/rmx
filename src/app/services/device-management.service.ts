import { Injectable } from '@angular/core';
import { CommonService } from './common.service';
import { ApiConfigService } from '../utilities/rlcutl/api-config.service';
import { String } from 'typescript-string-operations';
import { BehaviorSubject } from 'rxjs';
import { DeviceModes } from '../enums/deviceManagment.enum';
import { AppService } from '../utilities/rlcutl/app.service';
import { StatusCodes } from '../enums/status.enum';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppErrorService } from '../utilities/rlcutl/app-error.service';
import { ListofTransactions } from '../models/common/ListofTransactions';
import { LottableTrans } from '../models/common/LottableTrans';

@Injectable({
  providedIn: 'root'
})
export class DeviceManagementService {

  public emitRouteResponse = new BehaviorSubject<any>(null);
  public emitSaveRMxResponse = new BehaviorSubject<any>(null);
  public emitSaveWMxResponse = new BehaviorSubject<any>(null);

  listofTransactions: ListofTransactions;
  lottableTrans: LottableTrans;

  requestObj: any;
  tosterMessage: any;
  vendorDevices = {};

  constructor(
    private commonService: CommonService,
    private apiConfigService: ApiConfigService,
    private appService: AppService,
    private spinner: NgxSpinnerService,
    private appErrService: AppErrorService,
  ) { }

  // load Program Values
  loadProgramValues(url, requestObj) {
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        requestObj.Device = res.Response;
        this.getRoute(requestObj);
      }
    });
  }

  // Getroute
  getRoute(requestObj) {
    const url = String.Join('/', this.apiConfigService.getRouteUrl);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.emitRouteResponse.next(res.Response);
      }
    });
  }

  // SaveOperation
  saveOperation(url, reqObj, readOnly = true) {
    this.requestObj = reqObj;
    if (readOnly) {
      const result = this.commonService.validateReadOnlyDeviceDetails(this.requestObj.UIData);
      result.subscribe(response => {
        if (!this.appService.checkNullOrUndefined(response) && response.Status === StatusCodes.pass) {
          this.checkReadOnly(url);
        } else if (!this.appService.checkNullOrUndefined(response) && response.Status === StatusCodes.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(response.ErrorMessage.ErrorDetails, true);
          this.emitSaveRMxResponse.next(response);
        }
      });
    } else {
      if (this.requestObj.selectedTab == DeviceModes.wmxTransfer) {
        this.rollBackSerialNumber(url);
      } else {
        this.checkReadOnly(url);
      }
    }
  }

  rollBackSerialNumber(url) {
    const requestObj = { ClientData: this.requestObj.ClientData, Device: this.requestObj.Device, DMDevice: this.requestObj.DMDevice, UIData: this.requestObj.UIData, VendorDevices: this.requestObj.VendorDevices };
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.vendorDevices = res.Response;
        this.getTransactions();
      }
    });
  }

  checkReadOnly(url) {
    if (this.appService.checkNullOrUndefined(url)) {
      this.getTransactions();
    } else {
      const requestObj = { ClientData: this.requestObj.ClientData, Device: this.requestObj.Device, DMDevice: this.requestObj.DMDevice, UIData: this.requestObj.UIData, VendorDevices: this.requestObj.VendorDevices };
      this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
        if (statusFlag) {
          this.getTransactions();
          this.tosterMessage = res.Response;
        }
      });
    }
  }

  // Get transactions
  getTransactions() {
    this.listofTransactions = new ListofTransactions();
    const requestObj = { ClientData: this.requestObj.ClientData, Device: this.requestObj.Device, UIData: this.requestObj.UIData };
    const url = String.Join('/', this.apiConfigService.getTransaction, this.requestObj.UIData.OperationId);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.listofTransactions = res.Response;
        this.saveTransaction();
      }
    });
  }

  saveTransaction() {
    if (!this.appService.checkNullOrUndefined(this.requestObj.selectedReason)) {
      this.listofTransactions.Trans[0]['Reason'] = this.requestObj.selectedReason.Text;
    }
    const requestObj = {
      ClientData: this.requestObj.ClientData, Transactions: this.listofTransactions,
      UIData: this.requestObj.UIData, Device: this.requestObj.Device, TestResultDetails: {}
    };
    const url = String.Join('/', this.apiConfigService.saveTransaction);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.getUpdatedDevice();
      }
    });
  }

  // Updated Device
  getUpdatedDevice() {
    const requestObj = {
      ClientData: this.requestObj.ClientData, Device: this.requestObj.Device, DMDevice: this.requestObj.DMDevice, UIData: this.
        requestObj.UIData, DeviceManagement: this.requestObj.DeviceManagement,
    };
    const url = String.Join('/', this.apiConfigService.updateDeviceUtilityUrl);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.requestObj.Device = res.Response;
        const reqObj = {
          ClientData: this.requestObj.ClientData, Device: this.requestObj.Device,
          DeviceManagement: this.requestObj.DeviceManagement, UIData: this.requestObj.UIData
        };
        const postUrl = String.Join('/', this.apiConfigService.postCommonUpdateProcess);
        this.commonService.postUpdateProcess(postUrl, reqObj);
        this.addSerialNumberSnap();
      }
    });
  }

  // addSerialNumberSnap
  addSerialNumberSnap() {
    const originalStep = this.requestObj.Device.Step;
    this.requestObj.Device.Step = this.requestObj.UIData.OperationId;
    const requestObj = { ClientData: this.requestObj.ClientData, Device: this.requestObj.Device, UIData: this.requestObj.UIData };
    const url = String.Join('/', this.apiConfigService.addSerialNumberSnapUrl);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        if (this.requestObj.selectedTab == DeviceModes.rmxTransfer) {
          this.requestObj.Device.Step = originalStep;
          this.tosterMessage = res.Response;
          this.updateLottables();
        } else if (this.requestObj.selectedTab == DeviceModes.wmxTransfer) {
          this.emitSaveWMxResponse.next(this.vendorDevices);
        }
      }
    });
  }

  // updateLottables
  updateLottables() {
    this.lottableTrans = new LottableTrans();
    const requestObj = { ClientData: this.requestObj.ClientData, UIData: this.requestObj.UIData, Device: this.requestObj.Device, LottableTrans: this.lottableTrans };
    const url = String.Join('/', this.apiConfigService.updateLottables);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.createTransfer();
      }
    });
  }

  // createTransfer
  createTransfer() {
    const requestObj = { ClientData: this.requestObj.ClientData, UIData: this.requestObj.UIData, DeviceManagement: this.requestObj.DeviceManagement, Device: this.requestObj.Device, DMDevice: this.requestObj.DMDevice };
    const url = String.Join('/', this.apiConfigService.createTransfer);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.emitSaveRMxResponse.next(this.tosterMessage);
        this.spinner.hide();
      }
    });
  }

}
