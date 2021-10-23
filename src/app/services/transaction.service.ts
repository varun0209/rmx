import { Injectable } from '@angular/core';
import { ApiService } from '../utilities/rlcutl/api.service';
import { ApiConfigService } from '../utilities/rlcutl/api-config.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { AppErrorService } from '../utilities/rlcutl/app-error.service';
import { MasterPageService } from '../utilities/rlcutl/master-page.service';
import { Router } from '@angular/router';
import { AppService } from '../utilities/rlcutl/app.service';
import { Test } from '../models/testing/TestTransaction';
import { String, StringBuilder } from 'typescript-string-operations';
import { TestStatus } from '../enums/testStatus.enum';
import { TestBtnNames } from '../enums/test-btn-names.enum';
import { BehaviorSubject } from 'rxjs';
import { ClientData } from '../models/common/ClientData';
import { StorageData } from '../enums/storage.enum';
import { StatusCodes } from '../enums/status.enum';
import { CommonEnum } from '../enums/common.enum';
import { checkNullorUndefined } from '../enums/nullorundefined';
@Injectable()
export class TransactionService {

  isDoneDisabled: boolean = false;
  isAutoDisabled: boolean = true;
  isManualDisabled: boolean = true;
  transactions = [];
  transactionsResponse: any;
  testStatus = TestStatus;
  testBtnName = TestBtnNames;
  controlConfig: any;
  disabledSerialNumber = true;
  clientData = new ClientData();
  storageData = StorageData;
  statusCode = StatusCodes;

  public emitGetTestResponse = new BehaviorSubject<any>(null);
  public emitGetTransaction = new BehaviorSubject<any>(null);
  public emitShowAutoManual = new BehaviorSubject<any>(null);
  public emitGetTransAtrributeValues = new BehaviorSubject<any>(null);
  public doneManualTransactionResponse = new BehaviorSubject<any>(null);

  constructor(private apiService: ApiService,
    private apiConfigService: ApiConfigService,
    private spinner: NgxSpinnerService,
    private appErrService: AppErrorService,
    private masterPageService: MasterPageService,
    private appService: AppService,
    private snackbar: XpoSnackBar
    
  ) {
    this.controlConfig = JSON.parse(localStorage.getItem(this.storageData.controlConfig));
  }


  //Get Test
  getTest(testingDevice, UIData) {
    this.spinner.show();
    this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
    let requestObj = { ClientData: this.clientData, Device: testingDevice, UIData: UIData };
    const testurl = String.Join("/", this.apiConfigService.getTestUrl, this.masterPageService.categoryName);
    this.apiService.apiPostRequest(testurl, requestObj)
      .subscribe(response => {
        let res = response.body;
        this.spinner.hide();
        if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
          this.emitGetTestResponse.next(res);
        }
        else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
          this.emitGetTestResponse.next(res);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }

  //getTransaction
  getTransaction(item, parentIndex, UIData, testDetails, testingDevice, autoFail?) {
    this.spinner.show();
    this.appErrService.clearAlert();
    this.transactions = [];
    item.isEditable = !item.isEditable;
    item.iscancelEditable = true;
    item.isdoneEditable = true;
    item.isautoEditable = true;
    item.ismanualEditable = true;
    this.isDoneDisabled = true;
    let test = new Test();
    test.OperationId = item.OperationId;
    test.Clientid = this.clientData.ClientId;
    let requestObj = { ClientData: this.clientData, UIData: UIData, Device: testingDevice, TestDetails: testDetails, AutoFail: autoFail };
    const url = String.Join("/", this.apiConfigService.getTransactionUrl, test.OperationId, localStorage.getItem(this.storageData.testSerialNumber));
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let res = response.body;
        this.spinner.hide();
        if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
          this.transactionsResponse = res.Response.TestTransactions;
          //emiting the transaction response
          this.transactions = res.Response.TestTransactions.Trans;
          this.emitGetTransaction.next(res);
          if (res.Response.hasOwnProperty('AutoFail') && res.Response.AutoFail && res.Response.AutoFail.AutoFailMessage) {
            this.snackbar.info(res.Response.AutoFail.AutoFailMessage);
            }
        }
        else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });

  }


  //show auto and manual buttons
  showAutoManual(item, device, UIData) {
    this.spinner.show();
    this.appErrService.clearAlert();
    let requestObj = { ClientData: this.clientData, Device: device, UIData: UIData };
    const testurl = String.Join("/", this.apiConfigService.getTestUrl, this.masterPageService.categoryName, item.OperationId);
    this.apiService.apiPostRequest(testurl, requestObj)
      .subscribe(response => {
        let res = response.body;
        this.spinner.hide();
        if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
          this.masterPageService.operCategoryTests = res.Response.OperTransactions.Trans;
          this.emitShowAutoManual.next(res);
        }
        else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }


  //get attribute values for IVC
  getTransAtrributeValues(transaction, event, rowIndex, parentItem, parentIndex, testing, UIData, scrollPosition?) {
    this.transactionsResponse = testing.TestTransactions;
    let attributeName = "";
    this.isDoneDisabled = true;
    let transId = transaction.TransId;
    let parentAttributeId: string;
    if (!checkNullorUndefined(event.SelectedAttributeValues) && event.SelectedAttributeValues.length > 0) {
      parentAttributeId = event.SelectedAttributeValues[0].Id;
    } else {
      parentAttributeId = event.Id;
    }
    let index = transaction.TransControls.findIndex(x => (String.Join('_', x.ControlId, transaction.TransId)) === event.name);
    //let lastTrans = this.transactionsResponse.Trans.length - 1;
    if (transaction.TransControls[index + 1] != undefined) {
      attributeName = transaction.TransControls[index + 1].AttributeName;
    }
    if (this.transactionsResponse.Trans[rowIndex].TransControls[index].Property.controlType === 'dropdown') {
      this.transactionsResponse.Trans[rowIndex].TransControls[index].SelectedValue = event.Text;
      this.transactionsResponse.Trans[rowIndex].TransControls[index].SelectedAttributeValue = {
        Id: parentAttributeId,
        Text: event.Text
      };
    } else if (this.transactionsResponse.Trans[rowIndex].TransControls[index].Property.controlType === 'multiSelectDropDown') {
      this.transactionsResponse.Trans[rowIndex].TransControls[index].SelectedValue = '';
      this.transactionsResponse.Trans[rowIndex].TransControls[index].SelectedValues = event.SelectedAttributeValues.map(ele => ele.Text);
      this.transactionsResponse.Trans[rowIndex].TransControls[index].SelectedAttributeValues = event.SelectedAttributeValues;
    } else if (this.transactionsResponse.Trans[rowIndex].TransControls[index].Property.controlType === 'textbox') {
      this.transactionsResponse.Trans[rowIndex].TransControls[index].SelectedValue = event.Text;
    } else if (this.transactionsResponse.Trans[rowIndex].TransControls[index].Property.controlType === 'radiobutton') {
      this.transactionsResponse.Trans[rowIndex].TransControls[index].SelectedValue = event.Text;
    } else if (this.transactionsResponse.Trans[rowIndex].TransControls[index].Property.controlType === 'checkbox') {
      this.transactionsResponse.Trans[rowIndex].TransControls[index].SelectedValue = event.Text;

    } else if (this.transactionsResponse.Trans[rowIndex].TransControls[index].Property.controlType === 'autoextender') {
      this.transactionsResponse.Trans[rowIndex].TransControls[index].SelectedValue = event.Text;
    }
    this.spinner.show();
    let requestObj = { ClientData: this.clientData, TestTransactions: testing.TestTransactions, Device: testing.Device, UIData: UIData };
    const url = String.Join("/", this.apiConfigService.getTransAttributeValuesUrl, transId, parentAttributeId, attributeName);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let res = response.body;
        this.spinner.hide();
        if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
          this.transactionsResponse = res.Response;
          this.transactions = res.Response.Trans;
          //emiting the transaction response
          this.emitGetTransAtrributeValues.next(res);
          // this.appService.setScroll(rowIndex);
          this.appService.setScroll(scrollPosition);
        }
        else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });

  }

  //Done
  doneManualTransaction(item, testing, UIData) {
    this.spinner.show();
    this.appErrService.clearAlert();
    let requestObj = { ClientData: this.clientData, Device: testing.Device, TestTransactions: testing.TestTransactions, UIData: UIData };
    const url = String.Join("/", this.apiConfigService.saveTransResultUrl);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let res = response.body;
        if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
          //emitting do manual transaction response
          this.doneManualTransactionResponse.next(res.Response);
        }
        else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }


  ////cancel transaction
  cancelTransaction(item, parentIndex) {
    this.appErrService.clearAlert();
    item.isEditable = !item.isEditable;
    if (!checkNullorUndefined(this.transactionsResponse.Trans)) {
      this.transactionsResponse.Trans.forEach(el => {
        el.TransControls.forEach(i => {
          i.SelectedValue = "";
        });
      });
    }
    this.isDoneDisabled = true;
    this.isDoneDisabled = true;
    if (item.TestType == "A" || item.TestType == "B") {
      const elementId = this.appService.getElementId(this.testBtnName.auto, item.OperationId);
      this.appService.setFocus(elementId);
    }
    else {
      const elementId = this.appService.getElementId(this.controlConfig.testBtnNameManual, item.OperationId);
      this.appService.setFocus(elementId);
      this.transactions = [];
    }
  }

  
  getSamplingDetails(UIData, device, resetFlag = CommonEnum.no, ConatinerLevelFlag = CommonEnum.no) {
    this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
    const requestObj = { ClientData: this.clientData, UIData: UIData, Device: device };
    const testurl = String.Join('/', this.apiConfigService.getBatchDetailTrans, resetFlag, ConatinerLevelFlag);
    this.apiService.apiPostRequest(testurl, requestObj)
      .subscribe(response => {
        let res = response.body;
        if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
          if (!checkNullorUndefined(res.Response) &&
            !checkNullorUndefined(res.Response.skipBatchProcess) &&
            res.Response.skipBatchProcess === CommonEnum.yes) {
            return;
          }
          this.masterPageService.samplingBatchDeatil = res.Response;
        }
        else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          this.spinner.hide();
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }

  clearSubscription() {
    this.doneManualTransactionResponse.next(null);
    this.emitGetTransaction.next(null);
    this.emitGetTransAtrributeValues.next(null);
    this.emitShowAutoManual.next(null);
    this.emitGetTestResponse.next(null);
  }
}
