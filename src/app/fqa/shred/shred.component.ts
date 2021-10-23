import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';
import { NgxSpinnerService } from '../../../../node_modules/ngx-spinner';
import { ApiService } from '../../utilities/rlcutl/api.service';
import { ApiConfigService } from '../../utilities/rlcutl/api-config.service';
import { String } from 'typescript-string-operations';
import { RmtextboxComponent } from '../../framework/frmctl/rmtextbox/rmtextbox.component';
import { ContainerSummaryComponent } from '../../framework/busctl/container-summary/container-summary.component';
import { interval, Observable, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { Message } from '../../models/common/Message';
import { MessageType } from '../../enums/message.enum';
import { AppService } from '../../utilities/rlcutl/app.service';
import { RmgridComponent } from '../../framework/frmctl/rmgrid/rmgrid.component';
import { Grid } from '../../models/common/Grid';
import { ClientData } from '../../models/common/ClientData';
import { UiData } from '../../models/common/UiData';
import { LottableTrans } from '../../models/common/LottableTrans';
import { TraceTypes } from '../../enums/traceType.enum';
import { CommonService } from '../../services/common.service';
import { FindTraceHoldComponent } from '../../framework/busctl/find-trace-hold/find-trace-hold.component';
import { StorageData } from '../../enums/storage.enum';
import { StatusCodes } from '../../enums/status.enum';
import { CommonEnum } from '../../enums/common.enum';
import { TransactionService } from '../../services/transaction.service';
import { FqaDevice } from '../../models/fqa/FqaDevice';
import { MessagingService } from '../../utilities/rlcutl/messaging.service';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-shred',
  templateUrl: './shred.component.html',
  styleUrls: ['./shred.component.css'],
})
export class ShredComponent implements OnInit, OnDestroy {
  @ViewChild('serialNumberInput') serialNumberInput: RmtextboxComponent;
  @ViewChild(ContainerSummaryComponent) contsummaryParent: ContainerSummaryComponent;
  @ViewChild('serialNumberConfirm') serialNumberConfirm: TemplateRef<any>;
  @ViewChild(RmgridComponent) rmgrid: RmgridComponent;

  grid: Grid;
  processQueData = [];
  batchQueData = [];
  pollingData: any;
  //  client Control Labels
  clientData = new ClientData();
  uiData = new UiData();
  lottableTrans: LottableTrans;
  controlConfig: any;
  appConfig: any;
  headingsobj = [];
  inboundProperties: any;
  operationObj: any;
  inboundContainer: string;
  clear: any;
  multipleContainerList = [];
  subscription: Subscription;

  //  originaiton operation
  originationOperation: Subscription;
  deviceOrigination: string;
  emitReadOnlyDeviceResponseForContainer: Subscription;
  serialNumber: string;
  gayLordID: any;
  inbContainerResponse: any;
  serialNumbers: any;
  inbContainerID: any;
  isShredClearDisabled = true;
  inboundContainerId: string;
  isShredReasonCodeDisabled = true;
  isProcessDisabled = true;
  isClearDisabled = true;
  validShredSerialNumberResponse: any;
  confirmationMessage: any;
  shredDevice = new FqaDevice();
  shredDeviceList: FqaDevice[] = [];
  verifiedShredDeviceList: any[] = [];
  shredDeviceGridList: any;
  isAutoPopulatedSerialNumber = false;
  batchId = '';
  isAddGayLordBtnDisabled = true;
  operationId: string;
  dialogRef: any;

  constructor(
    private apiService: ApiService,
    private apiConfigService: ApiConfigService,
    private spinner: NgxSpinnerService,
    private snackbar: XpoSnackBar,
    public masterPageService: MasterPageService,
    public messagingService: MessagingService,
    public appErrService: AppErrorService,
    public transactionService: TransactionService,
    public appService: AppService,
    private commonService: CommonService,
    private dialog: MatDialog
  ) {
    //  emitting readOnlyDevice response
    this.emitReadOnlyDeviceResponseForContainer = this.commonService.emitReadOnlyDeviceResponseForContainer.subscribe(
      (res) => {
        if (!this.appService.checkNullOrUndefined(res)) {
          if (!this.appService.checkNullOrUndefined(res.Status) && res.Status === StatusCodes.pass) {
            this.generateGrid();
          } else if (!this.appService.checkNullOrUndefined(res.Status) && res.Status === StatusCodes.fail) {
            this.serialNumberClear();
          }
        }
      }
    );
  }

  ngOnInit() {
    this.operationObj = this.masterPageService.getRouteOperation();
    if (this.operationObj) {
      this.uiData.OperationId = this.operationObj.OperationId;
      this.uiData.OperCategory = this.operationObj.Category;
      this.operationId = this.operationObj.OperationId;
      this.masterPageService.setTitle(this.operationObj.Title);
      this.masterPageService.setModule(this.operationObj.Module);
      this.masterPageService.setCardHeader(CommonEnum.processQueue);
      this.masterPageService.setFqaCardHeader(CommonEnum.batchDetails);
      localStorage.setItem(StorageData.module, this.operationObj.Module);
      this.appConfig = JSON.parse(localStorage.getItem(StorageData.appConfig));
      this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
      this.masterPageService.operationObj = this.operationObj;
      this.controlConfig = JSON.parse(localStorage.getItem(StorageData.controlConfig));
      this.originationOperation = this.masterPageService.originationOperation.subscribe(
        (val) => {
          this.deviceOrigination = val;
        }
      );
      this.appErrService.appMessage();
      this.getProcessQueue();
    }
  }
  //operationId
  setCurrentOperationId(operationId) {
    this.uiData.OperationId = operationId;
  }

  //#region Process Queue

  //  get process queue
  getProcessQueue() {
    this.batchQueData = [];
    this.spinner.show();
    const timeinterval: number = this.appConfig.fqa.queueInterval;
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getBatchQueueUrl);
    this.clear = document.getElementById('stopProcessQueue');
    // const stop$ = Observable.fromEvent(this.clear, 'click');
    this.pollingData = interval(timeinterval).pipe(
      startWith(0),
      switchMap(() => this.apiService.apiPostRequest(url, requestObj))
    )
      .subscribe(
        (response) => {
          // this.spinner.hide();
          const res = response.body;
          if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
            this.batchQueData = res.Response;
            this.onProcessQueGenerateJsonGrid(res.Response);
            this.grid = new Grid();
            this.grid.SearchVisible = false;
            this.masterPageService.tempQueList = this.appService.onGenerateJson(
              this.processQueData,
              this.grid
            );
          } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
            this.spinner.hide();
            if (!this.appService.checkNullOrUndefined(!this.contsummaryParent)) {
              this.contsummaryParent.isClearDisabled = false;
            }
            this.masterPageService.tempQueList = null;
            this.pollingData.unsubscribe();
            this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
            this.snackbar.error(res.ErrorMessage.ErrorDetails);
          }
        },
        (error) => {
          this.appErrService.handleAppError(error);
        }
      );
  }

  onProcessQueGenerateJsonGrid(Response) {
    if (!this.appService.checkNullOrUndefined(Response)) {
      this.processQueData = [];
      Response.forEach((res) => {
        const element: any = {};
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

  //#endregion Process Queue

  //#region  GayLord methods

  // getGaylordId
  getGaylordId() {
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getGaylordId);
    this.apiService.apiPostRequest(url, requestObj).subscribe(
      (response) => {
        const result = response.body;
        if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
          this.spinner.hide();
          if (
            !this.appService.checkNullOrUndefined(result.Response) &&
            !this.appService.checkNullOrUndefined(result.Response.Container)
          ) {
            if (!this.appService.checkNullOrUndefined(result.Response.Container.ContainerID)) {
              this.gayLordID = result.Response.Container.ContainerID;
            }
          }
        } else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
      (error) => {
        this.appErrService.handleAppError(error);
      }
    );
  }
  // closeGayLordId
  closeGayLordId() {
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join(
      '/',
      this.apiConfigService.closeGayLordId,
      this.gayLordID
    );
    this.apiService.apiPostRequest(url, requestObj).subscribe(
      (response) => {
        const result = response.body;
        this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
          if (!this.appService.checkNullOrUndefined(result.Response)) {
            this.snackbar.success(result.Response);
            this.gayLordID = '';
            this.dialogRef.close();
          }
        } else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
      (error) => {
        this.appErrService.handleAppError(error);
      }
    );
  }

  // createGayLordId
  createGayLordId() {
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.createGayLordId);
    this.apiService.apiPostRequest(url, requestObj).subscribe(
      (response) => {
        const result = response.body;
        this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
          if (
            !this.appService.checkNullOrUndefined(result.Response) &&
            result.Response.Container.ContainerID
          ) {
            this.gayLordID = result.Response.Container.ContainerID;
          }
        } else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
      (error) => {
        this.appErrService.handleAppError(error);
      }
    );
  }
  // Modal Popup
  closeGayLordIDConfirm(template: TemplateRef<any>) {
    this.dialogRef =  this.dialog.open(template, {
      hasBackdrop: true, disableClose: true,
      panelClass: 'dialog-width-sm'
    });
  }

  //#endregion  GayLord methods

  //#region  conainer summary level methods
  // getting container list
  getContainerList(event) {
    this.multipleContainerList = event;
  }

  // container Summary response
  getContainerSummaryResponse(response) {
    this.inbContainerResponse = response;
  }
  // auto populate serial number
  getAutoPopulatedSerailNum(event: any) {
    if (!this.appService.checkNullOrUndefined(event) && event !== '') {
      this.serialNumber = event;
      this.shredSerialNumber(this.serialNumber, this.serialNumberInput);
      this.transactionService.disabledSerialNumber = true;
      this.isShredClearDisabled = false;
      this.isAutoPopulatedSerialNumber = true;
    } else {
      this.transactionService.disabledSerialNumber = false;
      this.serailNumberFocus();
      this.spinner.hide();
    }
    this.getGaylordId();
    this.isAddGayLordBtnDisabled = false;
  }
  // inbContainerID
  getinbContainerID(inbcontid) {
    this.inbContainerID = inbcontid;
  }

  // containerSummaryProperties
  containerSummaryProperties(event: any) {
    this.headingsobj = [];
    this.headingsobj = Object.keys(event);
    this.inboundProperties = event;
  }

  // reset button
  Reset() {
    this.gayLordID = '';
    this.isAutoPopulatedSerialNumber = false;
    this.serialNumberClear();
    this.serialNumber = '';
    this.transactionService.disabledSerialNumber = true;
    this.masterPageService.disabledContainer = false;
    this.masterPageService.inboundContainerFocus();
    this.appErrService.clearAlert();
    this.inboundProperties = null;
    this.headingsobj = [];
    this.inboundProperties = null;
    this.inboundContainerId = '';
    this.clearContainerSummary();
    if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
      this.contsummaryParent.clearProperties();
    }
    this.multipleContainerList = null;
    this.commonService.readOnlyDeviceArray = [];
    this.uiData.OperationId = this.operationId;
  }

  // clear containersummary
  private clearContainerSummary() {
    if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
      this.contsummaryParent.clearContainerSummary();
    }
  }

  //#endregion  conainer summary level methods

  //#region   serial number level methods

  // Serial Number Focus
  serailNumberFocus() {
    this.appService.setFocus('serialNumber');
  }

  // on change event of serialnumber
  onChangeSerialNumber(inputControl: RmtextboxComponent) {
    this.isShredClearDisabled = false;
    inputControl.applyRequired(false);
    this.appErrService.clearAlert();
  }

  // on entering serialnumber
  shredSerialNumber(serialNumber, inpcontrol: any) {
    this.appErrService.clearAlert();
    if (this.shredDeviceList.length > 0) {
      inpcontrol.applyRequired(false);
      const index = this.shredDeviceList.findIndex(
        (ele) => ele.SerialNumber === this.serialNumber
      );
      if (index === -1) {
        this.validateShredSerialNumber(serialNumber, inpcontrol);
      } else {
        inpcontrol.applyRequired(true);
        inpcontrol.applySelect();
        this.appErrService.setAlert(this.appService.getErrorText('3720017'), true);
      }
    } else {
      this.validateShredSerialNumber(serialNumber, inpcontrol);
    }
  }

  // validateShred serialnumber api
  private validateShredSerialNumber(serialNumber: any, inpcontrol: any) {
    this.shredDevice = new FqaDevice();
    if (!this.isAutoPopulatedSerialNumber) {
      this.spinner.show();
    }
    this.appErrService.clearAlert();
    this.shredDevice.SerialNumber = serialNumber;
    localStorage.setItem(
      StorageData.testSerialNumber,
      this.shredDevice.SerialNumber
    );
    const requestObj = {
      ClientData: this.clientData,
      UIData: this.uiData,
      Containers: this.multipleContainerList,
      FQADevices: this.shredDeviceList,
    };
    const url = String.Join(
      '/',
      this.apiConfigService.validateShredSerialNumber,
      this.shredDevice.SerialNumber,
      this.batchId
    );
    this.apiService.apiPostRequest(url, requestObj).subscribe(
      (response) => {
        const result = response.body;
        if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
          this.validShredSerialNumberResponse = response.body;
          const traceData = {
            traceType: TraceTypes.serialNumber,
            traceValue: serialNumber,
            uiData: this.uiData,
          };
          const traceResult = this.commonService.findTraceHold(
            traceData,
            this.uiData
          );
          traceResult.subscribe((result) => {
            if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
              if (this.appService.checkNullOrUndefined(result.Response)) {
                this.validShredSerialNumber();
              } else {
                this.canProceed(result, TraceTypes.serialNumber);
              }
            } else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
              this.spinner.hide();
              this.appErrService.setAlert(
                result.ErrorMessage.ErrorDetails,
                true
              );
            }
          });
        } else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
          this.spinner.hide();
          this.transactionService.disabledSerialNumber = false;
          inpcontrol.applyRequired(true);
          inpcontrol.applySelect();
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
      (error) => {
        this.appErrService.handleAppError(error);
      }
    );
  }

  // valida shred serialnumber
  validShredSerialNumber(result = this.validShredSerialNumberResponse) {
    this.spinner.hide();
    if (!this.appService.checkNullOrUndefined(result.Response.FQADevices)) {
      this.shredDeviceList = result.Response.FQADevices;

      this.shredDevice = this.shredDeviceList.find(
        (el) => el.SerialNumber === this.serialNumber
      );
      // inboundContainerid its storing for sending request of current inbound container id
      this.inboundContainerId = this.shredDevice.ContainerID;
      if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
        this.contsummaryParent.searchContainerID(this.shredDevice.ContainerID);
      }
      result.Response.FQADevices.forEach((element) => {
        const index = this.shredDeviceList.findIndex(
          (ele) => ele.SerialNumber === element.SerialNumber
        );
        if (index === -1) {
          if (!this.appService.checkNullOrUndefined(this.deviceOrigination) && this.deviceOrigination !== '') {
            element.Origination = this.deviceOrigination;
          }
          this.shredDeviceList.push(element);
        }
      });
      this.serialNumber = this.shredDevice.SerialNumber;
      this.batchId = result.Response.BatchId;
      this.onProcessShredGenerateJsonGrid(result.Response.FQADevices);
    }
    if (!this.appService.checkNullOrUndefined(result.Response.isConfirmationReq) &&
      result.Response.isConfirmationReq === CommonEnum.yes
    ) {
      if (!this.appService.checkNullOrUndefined(result.Response.confirmationMessage)) {
        this.confirmationMessage = result.Response.confirmationMessage;
      }
      this.dialogRef =  this.dialog.open(this.serialNumberConfirm, {
        hasBackdrop: true, disableClose: true,
        panelClass: 'dialog-width-sm'
      });
    } else {
      this.commonService.getReadOnlyDeviceDetails(
        this.serialNumber,
        this.uiData,
        true
      );
    }

    this.validShredSerialNumberResponse = null;
  }

  // generating the grid data
  generateGrid() {
    this.grid = new Grid();
    this.shredDeviceGridList = this.appService.onGenerateJson(
      this.verifiedShredDeviceList,
      this.grid
    );
    if (!this.isAutoPopulatedSerialNumber) {
      this.serialNumber = '';
    }
    this.serailNumberFocus();
    this.isShredClearDisabled = false;
  }

  onProcessShredGenerateJsonGrid(Response) {
    if (!this.appService.checkNullOrUndefined(Response)) {
      this.verifiedShredDeviceList = [];
      Response.forEach((res) => {
        const element: any = {};
        element.SerialNumber = res.SerialNumber;
        element.ReasonCodeDesc = res.ReasonCodeDesc;
        this.verifiedShredDeviceList.push(element);
      });
    }
  }

  // can proceed trace method
  canProceed(traceResponse, type) {
    if (traceResponse.Response.canProceed === CommonEnum.yes) {
      this.appErrService.setAlert(
        traceResponse.StatusMessage,
        true,
        MessageType.info
      );
    }
    if (!this.appService.checkNullOrUndefined(traceResponse.Response.TraceHold)) {
      const uiObj = { uiData: this.uiData };
      traceResponse = Object.assign(traceResponse, uiObj);
      this.dialogRef = this.dialog.open(FindTraceHoldComponent, { hasBackdrop: true, disableClose: true, panelClass: 'dialog-width-sm', data: { modalData: traceResponse } });
      this.dialogRef.afterClosed().subscribe((returnedData) => {
        if (returnedData) {
          if (returnedData.Response.canProceed === CommonEnum.yes) {
            if (type === TraceTypes.serialNumber) {
              this.validShredSerialNumber();
            }
          } else if (returnedData.Response.canProceed === CommonEnum.no) {
            if (type === TraceTypes.serialNumber) {
              this.serailNumberFocus();
            }
            this.appErrService.setAlert(returnedData.StatusMessage, true);
          }
        }
      });
    }
    this.spinner.hide();
  }
  //  for adding serialNumber to process
  addSerialNumberToProcess() {
    this.commonService.getReadOnlyDeviceDetails(
      this.serialNumber,
      this.uiData,
      true
    );
    this.dialogRef.close();
  }
  //  for removing serialNumber from process
  removeSerialNumberFromProcess(serialNumber) {
    this.shredDeviceList = this.shredDeviceList.filter(
      (el) => el.SerialNumber !== serialNumber
    );
    this.verifiedShredDeviceList = this.verifiedShredDeviceList.filter(
      (el) => el.SerialNumber !== serialNumber
    );
    if (!this.isAutoPopulatedSerialNumber) {
      this.serialNumber = '';
    }
    if (this.isAutoPopulatedSerialNumber) {
      this.transactionService.disabledSerialNumber = false;
    }
    this.dialogRef.close();
    this.serailNumberFocus();
  }

  // serialnumber clear method
  serialNumberClear() {
    this.shredDevice = new FqaDevice();
    this.shredDeviceList = [];
    this.verifiedShredDeviceList = [];
    this.transactionService.disabledSerialNumber = false;
    if (!this.appService.checkNullOrUndefined(this.shredDeviceGridList)) {
      this.shredDeviceGridList = null;
    }
    this.batchId = '';
    if (!this.isAutoPopulatedSerialNumber) {
      this.serialNumber = '';
    }
    this.isAddGayLordBtnDisabled = true;
    this.serailNumberFocus();
    this.isShredClearDisabled = true;
    this.commonService.readOnlyDeviceArray = [];
  }

  //#endregionregion  serial number level methods

  //#region   Process Button level methods

  //  processing on button click
  processTransfer() {
    this.updateLottables();
  }

  // updateLottables
  updateLottables() {
    this.spinner.show();
    this.lottableTrans = new LottableTrans();
    const requestObj = {
      ClientData: this.clientData,
      UIData: this.uiData,
      Devices: this.shredDeviceList,
      LottableTrans: this.lottableTrans,
    };
    this.apiService.apiPostRequest(this.apiConfigService.updateLottables, requestObj).subscribe(
        (response) => {
          const res = response.body;
          if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
            this.process();
          } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
            this.spinner.hide();
            this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          }
        },
        (erro) => {
          this.appErrService.handleAppError(erro);
        }
      );
  }

  // validate Read Only Device Check before process
  process() {
    const result = this.commonService.validateReadOnlyDeviceDetailsForContainer(this.uiData);
    result.subscribe((response) => {
      if (!this.appService.checkNullOrUndefined(response) && response.Status === StatusCodes.pass) {
        this.spinner.show();
        this.shredProcess();
      } else if (!this.appService.checkNullOrUndefined(response) && response.Status === StatusCodes.fail) {
        this.spinner.hide();
        this.Reset();
        this.appErrService.setAlert(response.ErrorMessage.ErrorDetails, true);
      }
    });
  }

  // shred process method
  shredProcess() {
    this.spinner.show();
    const requestObj = {
      ClientData: this.clientData,
      UIData: this.uiData,
      FQADevices: this.shredDeviceList,
    };
    const url = String.Join(
      '/',
      this.apiConfigService.shredProcess,
      this.batchId,
      this.gayLordID
    );
    this.apiService.apiPostRequest(url, requestObj).subscribe(
      (response) => {
        const result = response.body;
        this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
          if (!this.appService.checkNullOrUndefined(result.Response)) {
            this.snackbar.success(result.Response);
            const postUrl = String.Join(
              '/',
              this.apiConfigService.postFqaUpdateProcess,
              this.batchId
            );
            this.commonService.postUpdateProcess(postUrl, requestObj);
            this.masterPageService.gridBatchId = this.batchId;
            setTimeout(() => {
              this.masterPageService.gridBatchId = '';
            }, 20000);
            this.batchId = '';
            this.clearContainerSummary();
            this.Reset();
          }
        } else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
      (error) => {
        this.appErrService.handleAppError(error);
      }
    );
  }
  //#endregion process button level methods

  ngOnDestroy() {
    if (this.pollingData !== undefined) {
      this.pollingData.unsubscribe();
      this.clear.click();
    }
    this.masterPageService.gridBatchId = '';
    this.commonService.readOnlyDeviceArray = [];
    this.masterPageService.tempQueList = null;
    localStorage.removeItem('operationObj');
    if (this.contsummaryParent) {
      if (this.contsummaryParent.dialogRef) {
        this.contsummaryParent.dialogRef.close();
      }
      this.contsummaryParent.containersList = [];
      this.contsummaryParent.deviceList = [];
    }
    this.transactionService.disabledSerialNumber = true;
    this.masterPageService.operationObj = null;
    this.masterPageService.showUtilityIcon = false;
    this.masterPageService.defaultProperties();
    this.originationOperation.unsubscribe();
    //  clearing the readOnlyDevice subscription methods data
    this.commonService.emitReadOnlyDeviceResponseForContainer.next(null);
    this.emitReadOnlyDeviceResponseForContainer.unsubscribe();
    this.masterPageService.clearOriginationSubscription();
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
}
