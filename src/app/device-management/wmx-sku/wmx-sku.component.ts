import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppService } from '../../utilities/rlcutl/app.service';
import { ClientData } from '../../models/common/ClientData';
import { UiData } from '../../models/common/UiData';
import { ApiConfigService } from '../../utilities/rlcutl/api-config.service';
import { String } from 'typescript-string-operations';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from '../../services/common.service';
import { DeviceModes } from '../../enums/deviceManagment.enum';
import { StorageData } from '../../enums/storage.enum';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';
import { Grid } from '../../models/common/Grid';
import { TestingDevice } from '../../models/testing/TestingDevice';
import { Container } from '../../models/common/Container';
import { TraceTypes } from '../../enums/traceType.enum';
import { StatusCodes } from '../../enums/status.enum';
import { MessageType } from '../../enums/message.enum';
import { FindTraceHoldComponent } from '../../framework/busctl/find-trace-hold/find-trace-hold.component';
import { ListofTransactions } from '../../models/common/ListofTransactions';
import { Subscription } from 'rxjs';
import { RmtextboxComponent } from '../../framework/frmctl/rmtextbox/rmtextbox.component';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { ApiService } from '../../utilities/rlcutl/api.service';
import { ReceivingService } from '../../services/receiving.service';
import { LottableTrans } from '../../models/common/LottableTrans';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-wmx-sku',
  templateUrl: './wmx-sku.component.html',
  styleUrls: ['./wmx-sku.component.css']
})
export class WmxSkuComponent implements OnInit, OnDestroy {


  emitReadOnlyDeviceResponse: Subscription;

  uiData = new UiData;
  clientData = new ClientData();

  operationObj: any;
  controlConfig: any;

  selectedBatchReason: any;
  reasonsList = [];

  // models
  batchId: any;
  batchSerialNumber: any;

  deviceMgmt = new TestingDevice();
  dmDevice = new TestingDevice();
  containerObj = new Container();


  transferDevice = new TestingDevice();
  VendorDevices = {};
  containersList = [];
  transferDeviceList: any;
  grid: Grid;
  buttonName: any;


  // disabled props
  isBatchIdDisabled = false;
  isResetDisabled = true;
  isBatchSerialNoDisabled = true;
  isBatchReasonDisabled = true;
  isSkuTransferFlag = false;
  isFullCaseEnbale = null;
  listofTransactions: ListofTransactions;
  lottableTrans: LottableTrans;

  originalSku = [];
  skuObject: any;
  appConfig: any;
  dialogRef: any;

  constructor(
    public appService: AppService,
    private apiConfigService: ApiConfigService,
    private spinner: NgxSpinnerService,
    private commonService: CommonService,
    public masterPageService: MasterPageService,
    public appErrService: AppErrorService,
    private apiService: ApiService,
    private snackbar: XpoSnackBar,
    public receivingService: ReceivingService,
    private dialog: MatDialog
  ) {

    // emitting readOnlyDevice response
    this.emitReadOnlyDeviceResponse = this.commonService.emitReadOnlyDeviceResponse.subscribe(res => {
      if (!this.appService.checkNullOrUndefined(res)) {
        if (!this.appService.checkNullOrUndefined(res.Status) && res.Status == StatusCodes.pass) {
          this.isBatchSerialNoDisabled = true;
          this.isBatchReasonDisabled = false;
          this.reasonFocus();
        } else if (!this.appService.checkNullOrUndefined(res.Status) && res.Status == StatusCodes.fail) {
          this.clearBatchSerialNo();
        }
      }
    });

  }

  ngOnInit() {
    this.operationObj = this.masterPageService.getRouteOperation();
    if (this.operationObj) {
      this.uiData.OperationId = this.operationObj.OperationId;
      this.uiData.OperCategory = this.operationObj.Category;
      this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
      this.appConfig = JSON.parse(localStorage.getItem(StorageData.appConfig));
      this.masterPageService.setTitle(this.operationObj.Title);
      this.masterPageService.setModule(this.operationObj.Module);
      this.controlConfig = JSON.parse(localStorage.getItem(StorageData.controlConfig));
      this.masterPageService.disabledContainer = false;
      localStorage.setItem(StorageData.module, this.operationObj.Module);
      this.appErrService.appMessage();
      this.selectedBatchReason = { Id: '', Text: '' };
      this.getReasons();
      this.inboundContainerFocus();
      this.skuObject = {
        getEligSKu: {
          url: this.apiConfigService.getEligibleSKUsUtlUrl,
          requestObj: { ClientData: this.clientData, UIData: this.uiData },
          enable: true,
        },
        type: DeviceModes.wmxToSku
      };
    }
  }

  // get Reasons
  getReasons() {
    this.spinner.show();
    this.reasonsList = [];
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const getReasonsUrl = String.Join('/', this.apiConfigService.getReasons);
    this.apiService.apiPostRequest(getReasonsUrl, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          if (!this.appService.checkNullOrUndefined(res.Response.Reasons)) {
            this.reasonsList = res.Response.Reasons;
          }
        }
        this.spinner.hide();
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }


  validateSkuTransferSerialnumbers(inpcontrol: RmtextboxComponent) {
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.validateSkuTransferSerialnumbersUrl, this.batchId);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag && !this.appService.checkNullOrUndefined(res.Response)) {
        if (res.Response.hasOwnProperty('TransferDevice')) {
          this.transferDevice = res.Response.TransferDevice;
        }
        if (res.Response.hasOwnProperty('VendorDevices')) {
          this.VendorDevices = res.Response.VendorDevices;
          this.showGrid();
        }
        if (res.Response.hasOwnProperty('FullCaseEnbale')) {
          this.isFullCaseEnbale = res.Response.FullCaseEnbale;
          if (this.isFullCaseEnbale) {
            this.isBatchReasonDisabled = false;
            this.buttonName = DeviceModes.processAll;
          } else {
            this.buttonName = DeviceModes.process;
          }
        }
        this.isBatchSerialNoDisabled = false;
        this.deviceMgmt = res.Response['DMDevice'];
        this.isBatchIdDisabled = true;
        if (this.masterPageService.hideControls && this.masterPageService.hideControls.controlProperties &&
          this.masterPageService.hideControls.controlProperties.batchSerialNo.hasOwnProperty('Disabled')) {
          this.reasonFocus();
        } else {
          this.serialNumberFocus();
        }
        this.isSkuTransferFlag = true;

        this.originalSku = [  // for readonly control(rmcard)
          { listItem: 'Current SKU', listItemDetails: res.Response.DMDevice.SKU.Sku },
          { listItem: 'Model', listItemDetails: res.Response.DMDevice.SKU.Model },
          { listItem: 'Disposition', listItemDetails: res.Response.DMDevice.Disposition },
          { listItem: 'Condition Code', listItemDetails: res.Response.DMDevice.ConditionCode }
        ];
      } else {
        inpcontrol.applyRequired(true);
        inpcontrol.applySelect();
      }
    });
  }

  showGrid() {
    this.transferDeviceList = [];
    this.grid = new Grid();
    const serialNo = (this.VendorDevices.hasOwnProperty('Serial_Numbers') && this.VendorDevices['Serial_Numbers'].length) ? this.VendorDevices['Serial_Numbers'] : [];
    this.transferDeviceList = this.appService.onGenerateJson(serialNo, this.grid);
  }

  validateSkuTransferSerialnumber(inpcontrol: RmtextboxComponent) {
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, TransferDevice: this.transferDevice, VendorDevices: this.VendorDevices };
    const url = String.Join('/', this.apiConfigService.validateSkuTransferSerialnumberUrl, this.batchId, this.batchSerialNumber);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response) && res.Response['Device']) {
          this.deviceMgmt = res.Response['Device'];
          this.dmDevice = res.Response['DMDevice'];
          this.buttonName = DeviceModes.process;
          this.findTrace();
        }
      } else {
        inpcontrol.applyRequired(true);
        inpcontrol.applySelect();
      }
    });
  }

  findTrace() {
    const traceData = { traceType: TraceTypes.serialNumber, traceValue: this.batchSerialNumber, uiData: this.uiData };
    const traceResult = this.commonService.findTraceHold(traceData, this.uiData);
    traceResult.subscribe(result => {
      if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
        if (this.appService.checkNullOrUndefined(result.Response)) {
          this.commonService.getReadOnlyDeviceDetails(this.batchSerialNumber, this.uiData);
        } else {
          this.canProceed(result, TraceTypes.serialNumber);
        }
        this.spinner.hide();
      } else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
        this.spinner.hide();
        this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
      }
    });
  }

  canProceed(traceResponse, type) {
    if (traceResponse.Response.canProceed == 'Y') {
      this.appErrService.setAlert(traceResponse.StatusMessage, true, MessageType.info);
    }
    if (!this.appService.checkNullOrUndefined(traceResponse.Response.TraceHold)) {
      const uiObj = { uiData: this.uiData };
      traceResponse = Object.assign(traceResponse, uiObj);
      this.dialogRef = this.dialog.open(FindTraceHoldComponent, { hasBackdrop: true, disableClose: true, panelClass: 'dialog-width-sm', data: { modalData: traceResponse } });
      this.dialogRef.afterClosed().subscribe((returnedData) => {
        if (returnedData) {
        if (returnedData.Response.canProceed == 'Y') {
          if (type == TraceTypes.serialNumber) {
            this.commonService.getReadOnlyDeviceDetails(this.batchSerialNumber, this.uiData);
          }
        } else if (returnedData.Response.canProceed == 'N') {
          if (type == TraceTypes.serialNumber) {
            this.isBatchSerialNoDisabled = false;
            this.serialNumberFocus();
          }
          this.appErrService.setAlert(returnedData.StatusMessage, true);
        }
        }
      });
    }
  }

  onSelectedBatchReason(event) {
    if (!this.appService.checkNullOrUndefined(event.target)) { // for dropdown
      if (this.isFullCaseEnbale && this.buttonName == DeviceModes.processAll) {
        this.batchSerialNumber = '';
      }
      this.selectedBatchReason = this.reasonsList.find(d => d.Id === event.value);
      this.isBatchReasonDisabled = true;
      this.isBatchSerialNoDisabled = true;
    }
  }

  processSKu(devices) {
    if (!this.appService.checkNullOrUndefined(devices)) {
      this.deviceMgmt = (!this.appService.checkNullOrUndefined(devices.Device)) ? devices.Device : this.deviceMgmt;
      this.dmDevice = (!this.appService.checkNullOrUndefined(devices.DMDevice)) ? devices.DMDevice : this.dmDevice;
    }
    if (this.selectedBatchReason.Id != '') {
      if (this.isFullCaseEnbale && this.buttonName == DeviceModes.processAll) {
        this.rollbackSKUContainerDevices();
      } else {
        this.rollbackSkuSerialNumber();
      }
    } else {
      this.appErrService.setAlert('Please Select Reason', true);
    }
  }


  rollbackSKUContainerDevices() {
    const requestObj = {
      ClientData: this.clientData, UIData: this.uiData, TransferDevice: this.transferDevice, ReasonCode: this.selectedBatchReason,
      DMDevice: this.deviceMgmt, VendorDevices: this.VendorDevices
    };
    const url = String.Join('/', this.apiConfigService.rollbackSKUContainerDevicesUrl);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.updateLottables(DeviceModes.fullCase);
      }
    });
  }


  rollbackSkuSerialNumber() {
      const requestObj = { ClientData: this.clientData, UIData: this.uiData, TransferDevice: this.deviceMgmt, VendorDevices: this.VendorDevices };
    const url = String.Join('/', this.apiConfigService.rollbackSkuSerialNumberUrl);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.getTransactions();
      }
    });
  }


  // Get transactions
  getTransactions() {
    this.listofTransactions = new ListofTransactions();
    const requestObj = { ClientData: this.clientData, Device: this.deviceMgmt, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getTransaction, this.uiData.OperationId);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.listofTransactions = res.Response;
        this.saveTransaction();
      }
    });
  }

  saveTransaction() {
    if (!this.appService.checkNullOrUndefined(this.selectedBatchReason)) {
      this.listofTransactions.Trans[0]['Reason'] = this.selectedBatchReason.Text;
    }
    const requestObj = {
      ClientData: this.clientData, Transactions: this.listofTransactions,
      UIData: this.uiData, Device: this.deviceMgmt, TestResultDetails: {}
    };
    const url = String.Join('/', this.apiConfigService.saveTransaction);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.updateLottables(DeviceModes.single);
      }
    });
  }

  // updateLottables
  updateLottables(mode) {
    this.lottableTrans = new LottableTrans();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, Device: this.deviceMgmt, LottableTrans: this.lottableTrans };
    const url = String.Join('/', this.apiConfigService.updateLottables);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.transferSKU(mode);
      }
    });
  }

  transferSKU(value) {
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, TransferDevice: this.transferDevice, VendorDevices: this.VendorDevices };
    const url = String.Join('/', this.apiConfigService.transferSKUUrl, value, this.batchId);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.processWT(value);
      } else {
        this.resetBatchId();
      }
    });
  }

  processWT(value) {
    let requestObj;
    if (value == DeviceModes.single) {
      requestObj = { ClientData: this.clientData, UIData: this.uiData, TransferDevice: this.deviceMgmt, VendorDevices: this.VendorDevices };
    } else {
      requestObj = { ClientData: this.clientData, UIData: this.uiData, TransferDevice: this.transferDevice, VendorDevices: this.VendorDevices };
    }
    const url = String.Join('/', this.apiConfigService.processWTUrl, value);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response) && res.Response != '') {
          this.snackbar.success(res.Response);
        }
      }
      this.resetBatchId();
    });
  }

  onChangeBatchId() {
    this.isResetDisabled = false;
  }

  // Serial Number Focus
  serialNumberFocus() {
    this.appService.setFocus('batchSerialNumber');
  }

  // Inbound Focus
  inboundContainerFocus() {
    this.appService.setFocus('inboundBatchContainer');
  }

  // Reason Focus
  reasonFocus() {
    this.appService.setFocus('batchReason');
  }

  // process focus
  rollbackFocus() {
    this.appService.setFocus('rollBack');
  }

  resetBatchId() {
    this.clearBatchSerialNo();
    this.isResetDisabled = true;
    this.isBatchSerialNoDisabled = true;
    this.batchSerialNumber = '';
    this.batchId = '';
    this.transferDeviceList = null;
    this.isBatchIdDisabled = false;
    this.transferDevice = new TestingDevice();
    this.VendorDevices = {};
    this.isFullCaseEnbale = null;
    this.isBatchReasonDisabled = true;
    this.isSkuTransferFlag = false;
    this.inboundContainerFocus();
  }

  clearBatchSerialNo(flag?) {
    this.appErrService.clearAlert();
    this.selectedBatchReason = { Id: '', Text: '' };
    this.isBatchSerialNoDisabled = false;
    this.batchSerialNumber = '';
    if (this.masterPageService.hideControls && this.masterPageService.hideControls.controlProperties &&
      this.masterPageService.hideControls.controlProperties.batchSerialNo.hasOwnProperty('Disabled')) {
      this.reasonFocus();
    } else {
      this.serialNumberFocus();
    }
    this.isBatchReasonDisabled = false;
    // if (this.isFullCaseEnbale && this.buttonName == DeviceModes.processAll) {
    // } else {
    //   this.isBatchReasonDisabled = true;
    // }
    this.buttonName = DeviceModes.processAll;

  }

  ngOnDestroy() {
    this.commonService.emitReadOnlyDeviceResponse.next(null);
    this.emitReadOnlyDeviceResponse.unsubscribe();
    this.commonService.clearReadOnly();
    this.masterPageService.defaultProperties();
    if (this.dialogRef) {
      this.dialogRef.close();
    }
    this.masterPageService.showUtilityIcon = false;
  }

}

