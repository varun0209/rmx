import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ApiService } from '../../utilities/rlcutl/api.service';
import { ApiConfigService } from '../../utilities/rlcutl/api-config.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';
import { AppService } from '../../utilities/rlcutl/app.service';
import { TransactionService } from '../../services/transaction.service';
import { RmtextboxComponent } from '../../framework/frmctl/rmtextbox/rmtextbox.component';
import { ClientData } from '../../models/common/ClientData';
import { String } from 'typescript-string-operations';
import { Container } from '../../models/common/Container';
import { Grid } from '../../models/common/Grid';
import { ReceiptInjectList, ReceiptInjectDevice, ReceiptInjectDevices } from '../../models/utility/receipt-inject';
import { UiData } from '../../models/common/UiData';
import { interval, Observable, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { TraceTypes } from '../../enums/traceType.enum';
import { CommonService } from '../../services/common.service';
import { MessageType } from '../../enums/message.enum';
import { FindTraceHoldComponent } from '../../framework/busctl/find-trace-hold/find-trace-hold.component';
import { StorageData } from '../../enums/storage.enum';
import { StatusCodes } from '../../enums/status.enum';
import { checkNullorUndefined } from '../../enums/nullorundefined';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-receipt-injection',
  templateUrl: './receipt-injection.component.html',
  styleUrls: ['./receipt-injection.component.css']
})
export class ReceiptInjectionComponent implements OnInit, OnDestroy {

  @ViewChild(RmtextboxComponent) rmtextchild: RmtextboxComponent;
  toteId: string = '';
  isToteDisabled = false;
  headingsobj = [];
  inboundProperties: any;
  isResetDisabled = true;
  //containerSummaryProperties
  //receiptInjectionList: any[];
  isProcessDisabled = true;
  operationObj: any;
  controlConfig: any;
  clientData = new ClientData();
  uiData = new UiData();

  message: any;
  grid: Grid;
  quantity: number;
  //outbound container(container suggestion properties)
  container = new Container();
  suggestedContainerID = "";
  receiptInjectDevice: ReceiptInjectDevice = new ReceiptInjectDevice();
  //receiptDeviceList
  receiptDeviceList: ReceiptInjectList[];
  ReceiptInjectDevices: ReceiptInjectDevices;
  //messages
  messageNum: string;
  messagesCategory: string;
  messageType: string;
  batchId: string;
  appConfig: any;
  clear: any;
  pollingData: any;
  processQueData = [];
  batchQueData = [];
  traceTypes = TraceTypes;

   //originaiton operation
   originationOperation: Subscription;
   deviceOrigination:string;
  validRMInboundContainerResponse: any;
  storageData = StorageData;
  statusCode = StatusCodes;
  dialogRef: any;

  constructor(private apiService: ApiService,
    private apiConfigService: ApiConfigService,
    private spinner: NgxSpinnerService,
    private snackbar: XpoSnackBar,
    public appErrService: AppErrorService,
    public masterPageService: MasterPageService,
    private appService: AppService,
    public transactionService: TransactionService,
    private commonService: CommonService,
    private dialog: MatDialog

  ) { }

  ngOnInit() {
    this.operationObj = this.masterPageService.getRouteOperation();
    if (this.operationObj) {
      this.uiData.OperationId = this.operationObj.OperationId;
      this.uiData.OperCategory = this.operationObj.Category;
      this.masterPageService.setTitle(this.operationObj.Title);
      this.masterPageService.setModule(this.operationObj.Module);
      this.controlConfig = JSON.parse(localStorage.getItem(this.storageData.controlConfig));
      this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
      this.masterPageService.setCardHeader("Process Queue");
      this.appConfig = JSON.parse(localStorage.getItem(this.storageData.appConfig));
      this.message = this.appService.getErrorText('2660048');
      this.toteFocus();
      this.getProcessQueue();
      this.originationOperation = this.masterPageService.originationOperation.subscribe(val => {
        this.deviceOrigination = val;
         });
    }
  }



  //get process que
  getProcessQueue() {
    this.spinner.show();
    let timeinterval: number = this.appConfig.fqa.queueInterval;
    let requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join("/", this.apiConfigService.getBatchQueueUrl);
    this.clear = document.getElementById('stopProcessQueue');
    // const stop$ = Observable.fromEvent(this.clear, 'click');
    this.pollingData = interval(timeinterval).pipe(
      startWith(0),
      switchMap(() => this.apiService.apiPostRequest(url, requestObj)))
      .subscribe(response => {
        let res = response.body;
         if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
          this.batchQueData = res.Response;
          this.onProcessQueGenerateJsonGrid(res.Response);
          this.grid = new Grid();
          this.grid.SearchVisible = false;
          this.masterPageService.tempQueList = this.appService.onGenerateJson(this.processQueData, this.grid);
        }
         else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
          this.spinner.hide();
          this.masterPageService.tempQueList = null;
          this.pollingData.unsubscribe();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }




  // validateTestSerialNumber
  validateRMInboundContainer(inpcontrol: RmtextboxComponent) {
    if (this.toteId != "") {
      this.appErrService.clearAlert();
      this.spinner.show();
      let requestObj = { ClientData: this.clientData, UIData: this.uiData };
      const url = String.Join("/", this.apiConfigService.validateRMInboundContainerUrl, this.toteId);
      this.apiService.apiPostRequest(url, requestObj)
        .subscribe(response => {
          let result = response.body;
          if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) { 
            this.validRMInboundContainerResponse = response.body;
            let traceData = { traceType: this.traceTypes.containerID, traceValue: this.toteId, uiData: this.uiData }
            let traceResult = this.commonService.findTraceHold(traceData, this.uiData);
            traceResult.subscribe(result => {
              if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) { 
                if (checkNullorUndefined(result.Response)) {
                  this.validRMInboundContainer();
                } else {
                  this.canProceed(result, this.traceTypes.containerID);
                }
                this.spinner.hide();
              } else  if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) { 
                this.spinner.hide();
                this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
              }
            });
          }
          else  if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) { 
            this.spinner.hide();
            inpcontrol.applyRequired(true);
            inpcontrol.applySelect();
            this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
          }
        },
          error => {
            this.appErrService.handleAppError(error);
          });
    }
    else {
      this.appErrService.setAlert(this.message, true);
    }
  }

  validRMInboundContainer(res = this.validRMInboundContainerResponse) {
    this.isToteDisabled = true;
    // this.headingsobj = [];
    // this.headingsobj = Object.keys(result.Response);
    // this.inboundProperties = result.Response;
    this.getInboundDetails();
    this.validateRMInboundDevices();
    this.validRMInboundContainerResponse = null;
  }

  canProceed(traceResponse, type) {
    if (traceResponse.Response.canProceed == 'Y') {
      this.appErrService.setAlert(traceResponse.StatusMessage, true, MessageType.info);
    }
    if (!checkNullorUndefined(traceResponse.Response.TraceHold)) {
      let uiObj = { uiData: this.uiData }
      traceResponse = Object.assign(traceResponse, uiObj);
      this.dialogRef = this.dialog.open(FindTraceHoldComponent, { hasBackdrop: true, disableClose: true, panelClass: 'dialog-width-sm', data: { modalData: traceResponse } });
      this.dialogRef.afterClosed().subscribe((returnedData) => {
        if (returnedData) {
        if (returnedData.Response.canProceed == 'Y') {
          if (type == this.traceTypes.containerID) {
            this.validRMInboundContainer();
          }
        } else if (returnedData.Response.canProceed == 'N') {
          if (type == this.traceTypes.containerID) {
            this.toteFocus();
          }
          this.appErrService.setAlert(returnedData.StatusMessage, true);
        }
      }
      });
    }
  }


  getInboundDetails() {
    this.spinner.show();
    let requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join("/", this.apiConfigService.getInboundDetails, this.toteId);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let result = response.body;
        if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) { 
          if (result.Response.length > 0) {
            if (!checkNullorUndefined(result.Response[0].Properties)) {
              this.headingsobj = [];
              this.headingsobj = Object.keys(result.Response[0].Properties);
              this.inboundProperties = result.Response[0].Properties;
            }
          }
        }
        else  if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) { 
          this.spinner.hide();
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }



  //validateRMInboundDevices
  validateRMInboundDevices() {
    this.spinner.show();
    let requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join("/", this.apiConfigService.validateRMInboundDevicesUrl, this.toteId);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let result = response.body;
        this.spinner.hide();
        if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) { 
          this.ReceiptInjectDevices = new ReceiptInjectDevices();
          this.ReceiptInjectDevices.InjectionDevice = result.Response.InjectionDevice;
          this.receiptInjectGrid(result);
          this.isProcessDisabled = false;
          this.processFocus();
        }
        else if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) { 
          this.receiptInjectGrid(result);
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }

  //receipt inject grid 
  receiptInjectGrid(result) {
    this.batchId = result.Response.BatchId;
    this.receiptDeviceGrid(result.Response.InjectionDevice);
    this.grid = new Grid();
    this.grid.PaginationId = "serialNumberRemarks";
    this.receiptDeviceList = this.appService.onGenerateJson(this.receiptDeviceList, this.grid);
  }


  //TransferProcess
  TransferProcess() {
    this.spinner.show();
    this.appErrService.clearAlert();
    let requestObj = { ClientData: this.clientData, InjectionDevices: this.ReceiptInjectDevices, UIData: this.uiData };
    const url = String.Join("/", this.apiConfigService.transferProcess, this.toteId, this.batchId);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let result = response.body;
        this.spinner.hide();
        if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) { 
          this.snackbar.success(result.Response);
          this.resetClear();
        }
        else if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) { 
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }




  //change Input
  changeInput(event) {
    this.isResetDisabled = false;
    this.appErrService.clearAlert();
  }
  // tote focus
  toteFocus() {
    this.appService.setFocus('toteId');
  }
  //save button foucs
  processFocus() {
    this.appService.setFocus('process');
  }


  //reset button click
  resetClear() {
    this.appErrService.clearAlert();
    this.rmtextchild.value = '';
    this.batchId = '';
    this.isProcessDisabled = true;
    this.isToteDisabled = false;
    this.isProcessDisabled = true;
    this.isResetDisabled = true;
    this.inboundProperties = null;
    this.receiptDeviceList = null;
    this.headingsobj = [];
    this.toteFocus();
  }

  //**processing grid**//
  receiptDeviceGrid(dataGrid) {
    if (!checkNullorUndefined(dataGrid)) {
      let headingsobj = Object.keys(dataGrid[0]);
      this.receiptDeviceList = [];
      dataGrid.forEach(res => {
        let element: ReceiptInjectList = new ReceiptInjectList();
        headingsobj.forEach(singleheader => {
          element[singleheader] = res[singleheader];
        })
        this.receiptDeviceList.push(element);
      });
    }
  }

  onProcessQueGenerateJsonGrid(Response) {
    if (!checkNullorUndefined(Response)) {
      this.processQueData = [];
      Response.forEach(res => {
        let element: any = {};
        element.BatchId = res.BatchId;
        element.Container = res.ContainerId;
        element.Status = res.Status;
        element.Remarks = res.Remarks;
        element.WTContainerId = res.WTContainerId;
        element.WTReceiptKey = res.WTReceiptKey;
        this.processQueData.push(element);
      });
    }
  }


  ngOnDestroy() {
    this.masterPageService.requiredFields = undefined;
    if (this.pollingData != undefined) {
      this.pollingData.unsubscribe();
      this.clear.click();
    }
    this.masterPageService.moduleName.next(null);
    this.masterPageService.clearModule();
    this.masterPageService.tempQueList = null;
    this.appErrService.clearAlert();
    this.masterPageService.showUtilityIcon = false;
    if (!checkNullorUndefined(this.originationOperation) && this.originationOperation) {
      this.originationOperation.unsubscribe();
    }
    this.masterPageService.clearOriginationSubscription();
    if(this.dialogRef){
          this.dialogRef.close();
        }
    this.masterPageService.hideDialog();
  }

}
