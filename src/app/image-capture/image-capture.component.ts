import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { AppErrorService } from '../utilities/rlcutl/app-error.service';
import { MasterPageService } from '../utilities/rlcutl/master-page.service';
import { ClientData } from '../models/common/ClientData';
import { UiData } from '../models/common/UiData';
import { CommonService } from '../services/common.service';
import { ImageProcessComponent } from '../framework/frmctl/image-process/image-process.component';
import { AppService } from '../utilities/rlcutl/app.service';
import { StatusCodes } from '../enums/status.enum';
import { NgxSpinnerService } from 'ngx-spinner';
import { TestingDevice } from '../models/testing/TestingDevice';
import { Container } from '../models/common/Container';
import { StorageData } from '../enums/storage.enum';
import { CommonEnum } from '../enums/common.enum';
import { TransactionService } from '../services/transaction.service';
import { Grid } from '../models/common/Grid';
import { ApiConfigService } from '../utilities/rlcutl/api-config.service';
import { ContainerSuggestionComponent } from '../framework/busctl/container-suggestion/container-suggestion.component';
import { ApiService } from '../utilities/rlcutl/api.service';
import { String } from 'typescript-string-operations';
import { TraceTypes } from '../enums/traceType.enum';
import { MessageType } from '../enums/message.enum';
import { FindTraceHoldComponent } from '../framework/busctl/find-trace-hold/find-trace-hold.component';
import { ContainerSummaryComponent } from '../framework/busctl/container-summary/container-summary.component';
import { Testing, TestingDeviceRoutes } from '../models/testing/Testing';
import { TestResultDetails } from '../models/testing/TestResultDetails';
import { Subscription } from 'rxjs';
import { ListofTransactions } from '../models/common/ListofTransactions';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-image-capture',
  templateUrl: './image-capture.component.html',
  styleUrls: ['./image-capture.component.css']
})
export class ImageCaptureComponent implements OnInit, OnDestroy {

  @ViewChild(ContainerSummaryComponent) contsummaryParent: ContainerSummaryComponent;
  @ViewChild(ContainerSuggestionComponent) childContainer: ContainerSuggestionComponent;
  @ViewChild('serialNumberInput') serialnumberInput: ElementRef;

  emitReadOnlyDeviceResponse: Subscription;

  // config data
  controlConfig: any;
  operationObj: any;
  appConfig: any;


  // inbound container props

  inbContainerID: string;
  multipleContainerList = [];

  // process queue grid prps
  processQueData = [];

  // container batch props
  inboundProperties: any;
  headingsobj = [];

  // serai number props
  isAutoPopulateSerialNumber = false;
  serialNumber: string;

  // serial number props
  isClearDisabled = true;
  isSerialNumberValidated = false;
  validTestSerialNumberResponse: any;

  // originaiton operation
  originationOperation: Subscription;
  deviceOrigination: string;

  // object declaration
  clientData = new ClientData();
  container = new Container();
  uiData = new UiData();
  testing = new Testing();
  grid: Grid;
  listofTransactions: ListofTransactions;

  // save button
  isSaveDisabled = true;
  imageCaptureData: any;
  showDoNotReject = CommonEnum.no;
  operationId: string;
  dialogRef: any;



  constructor(
    private apiService: ApiService,
    private apiConfigService: ApiConfigService,
    private appService: AppService,
    public appErrService: AppErrorService,
    public masterPageService: MasterPageService,
    public transactionService: TransactionService,
    private commonService: CommonService,
    private spinner: NgxSpinnerService,
    private snackbar: XpoSnackBar,
    private dialog: MatDialog
  ) {
    // emitting readOnlyDevice response
    this.emitReadOnlyDeviceResponse = this.commonService.emitReadOnlyDeviceResponse.subscribe(res => {
      if (!this.appService.checkNullOrUndefined(res)) {
        if (!this.appService.checkNullOrUndefined(res.Status) && res.Status === StatusCodes.pass) {
          this.validTestSerialNumber();
        } else if (!this.appService.checkNullOrUndefined(res.Status) && res.Status === StatusCodes.fail) {
          this.serialNumberClear();
        }
      }
    });
  }

  ngOnInit() {
    this.operationObj = this.masterPageService.getRouteOperation();
    if (this.operationObj) {
      this.uiData.OperationId = this.operationObj.OperationId;
      this.uiData.OperCategory = this.operationObj.Category;
      this.operationId = this.operationObj.OperationId;
      this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
      this.masterPageService.setTitle(this.operationObj.Title);
      this.masterPageService.setModule(this.operationObj.Module);
      this.appConfig = JSON.parse(localStorage.getItem(StorageData.appConfig));
      this.controlConfig = JSON.parse(localStorage.getItem(StorageData.controlConfig));
      this.masterPageService.containerDetailsHeader(CommonEnum.containerDetails);
      this.originationOperation = this.masterPageService.originationOperation.subscribe(val => {
        this.deviceOrigination = val;
      });
    }
  }


  // start
  //operationId
  setCurrentOperationId(operationId) {
    this.uiData.OperationId = operationId;
  }

  // inbContainerID
  getinbContainerID(inbcontid) {
    this.inbContainerID = inbcontid;
  }

  // multicontainer list
  getContainerList(event) {
    this.multipleContainerList = event;
  }

  // grid data code
  getQueuedTestSerialNumbers() {
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, Containers: this.multipleContainerList };
    this.commonService.commonApiCall(this.apiConfigService.getQueuedTestSerialNumbers, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.onProcessQueGenerateJsonGrid(res.Response);
        this.grid = new Grid();
        this.grid.ItemsPerPage = this.appConfig.testing.griditemsPerPage;
        this.masterPageService.gridContainerDetails = this.appService.onGenerateJson(this.processQueData, this.grid);
      }
    });
  }

  // Process que generation
  onProcessQueGenerateJsonGrid(Response) {
    if (!this.appService.checkNullOrUndefined(Response)) {
      const ChildElements = [];
      this.processQueData = [];
      Response.forEach(res => {
        const element: any = { ChildElements: ChildElements };
        element.SerialNumber = res.SerialNumber;
        element.Test = res.Test;
        element.Result = res.Result;
        element.NextTest = res.NextTest;
        element.CanMove = res.CanMove;
        element.Status = res.Status;
        this.processQueData.push(element);
      });
    }
  }

  // containerSummaryProperties
  containerSummaryProperties(event: any) {
    this.headingsobj = [];
    this.headingsobj = Object.keys(event);
    this.inboundProperties = event;
  }

  getAutoPopulatedSerailNum(event) {
    if (!this.appService.checkNullOrUndefined(event) && event !== '') {
      this.isAutoPopulateSerialNumber = true;
      this.serialNumber = event;
      this.transactionService.disabledSerialNumber = true;
      this.validateTestSerialNumber(this.serialNumber, this.serialnumberInput);
    } else {
      if (this.serialNumber && this.isSerialNumberValidated) {
        this.transactionService.disabledSerialNumber = true;
      } else {
        this.transactionService.disabledSerialNumber = false;
        this.serailNumberFocus();
      }
      this.spinner.hide();
    }
  }

  validateTestSerialNumber(serialNumber, inpcontrol: any) {
    if (serialNumber !== '') {
      this.testing.Device = new TestingDevice();
      if (!this.appService.checkNullOrUndefined(this.deviceOrigination) && this.deviceOrigination !== '') {
        this.testing.Device.Origination = this.deviceOrigination;
      }
      if (this.masterPageService.hideControls && this.masterPageService.hideControls.controlProperties && this.masterPageService.hideControls.controlProperties.containerSuggestion === undefined) {
        this.clearContainerID();
      }
      this.appErrService.clearAlert();
      this.spinner.show();
      this.isClearDisabled = false;

      const requestObj = { ClientData: this.clientData, UIData: this.uiData, Containers: this.multipleContainerList };
      const url = String.Join('/', this.apiConfigService.validateTestSerialNumberUrl, serialNumber, this.masterPageService.categoryName);
      this.apiService.apiPostRequest(url, requestObj)
        .subscribe(response => {
          const result = response.body;
          if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
            this.validTestSerialNumberResponse = response.body;
            const traceData = { traceType: TraceTypes.serialNumber, traceValue: this.validTestSerialNumberResponse.Response.SerialNumber, uiData: this.uiData };
            const traceResult = this.commonService.findTraceHold(traceData, this.uiData);
            traceResult.subscribe(traceResponse => {
              if (!this.appService.checkNullOrUndefined(traceResponse) && traceResponse.Status === StatusCodes.pass) {
                if (this.appService.checkNullOrUndefined(traceResponse.Response)) {
                  this.commonService.getReadOnlyDeviceDetails(this.validTestSerialNumberResponse.Response.SerialNumber, this.uiData);
                } else {
                  this.canProceed(traceResponse, TraceTypes.serialNumber);
                }
              } else if (!this.appService.checkNullOrUndefined(traceResponse) && traceResponse.Status === StatusCodes.fail) {
                this.spinner.hide();
                this.appErrService.setAlert(traceResponse.ErrorMessage.ErrorDetails, true);
              }
            });
          } else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
            this.spinner.hide();
            this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
            this.transactionService.disabledSerialNumber = false;
            inpcontrol.applyRequired(true);
            inpcontrol.applySelect();
          }
        },
          error => {
            this.appErrService.handleAppError(error);
          });
    } else {
      this.appErrService.setAlert(this.appService.getErrorText('2660048'), true);
    }
  }

  canProceed(traceResponse, type) {
    if (traceResponse.Response.canProceed === 'Y') {
      this.appErrService.setAlert(traceResponse.StatusMessage, true, MessageType.info);
    }
    if (!this.appService.checkNullOrUndefined(traceResponse.Response.TraceHold)) {
      const uiObj = { uiData: this.uiData };
      traceResponse = Object.assign(traceResponse, uiObj);
      this.dialogRef = this.dialog.open(FindTraceHoldComponent, { hasBackdrop: true, disableClose: true, panelClass: 'dialog-width-sm', data: { modalData: traceResponse } });
      this.dialogRef.afterClosed().subscribe((returnedData) => {
        if (returnedData) {
          if (returnedData.Response.canProceed === 'Y') {
            if (type === TraceTypes.serialNumber) {
              this.commonService.getReadOnlyDeviceDetails(this.validTestSerialNumberResponse.Response.SerialNumber, this.uiData);
            }
          } else if (returnedData.Response.canProceed === 'N') {
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

  validTestSerialNumber(result = this.validTestSerialNumberResponse) {
    this.testing.Device = result.Response;
    // enabling/disable serial number for multi container process
    this.isSerialNumberValidated = true;
    if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
      this.contsummaryParent.searchContainerID(this.testing.Device.ContainerID);
    }
    this.transactionService.disabledSerialNumber = true;
    this.imageCaptureDailog();
    this.validTestSerialNumberResponse = null;
  }


  // image capture popup
  imageCaptureDailog() {
    const result = this.commonService.getDocTrkImages(this.serialNumber, this.uiData, this.testing.Device);
    result.subscribe(res => {
      this.spinner.hide();
      this.showDoNotReject = res.Response.ShowDoNotReject;
      this.testing.Device = res.Response.device;
      const modalDataObj = {
        data: {
          ClientData: this.clientData, UIData: this.uiData, Device: this.testing.Device,
          docTrackingImages: Array.isArray(res.Response.lstDocTrkImage) ? res.Response.lstDocTrkImage : []
        }, ShowDoNotReject: res.Response.ShowDoNotReject
      };
      this.dialogRef = this.dialog.open(ImageProcessComponent, { hasBackdrop: true, disableClose: true, panelClass: 'dialog-width-lg', data: { requestObj: modalDataObj } });
      this.dialogRef.afterClosed().subscribe((returnedData) => {
        if (returnedData) {
          if (returnedData.hasOwnProperty('CapturedImages')) {
            this.imageCaptureData = returnedData.CapturedImages;
          }
          if (returnedData.hasOwnProperty('Device')) {
            this.testing.Device = returnedData.Device;
          }
          this.testing.Device.Step = this.uiData.OperationId;
          this.loadProgramValues();
        } else {
          this.transactionService.disabledSerialNumber = false;
          this.serailNumberFocus();
        }
      });

      if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
        this.spinner.hide();
        this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
      }
    });
  }


  // load Program Values
  loadProgramValues() {
    const requestObj = { ClientData: this.clientData, Device: this.testing.Device, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.loadProgramValuesurl, this.testing.Device.ProgramName);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.testing.Device = res.Response;
        this.getRoute();
      }
    });
  }

  // Getroute
  getRoute() {
    const requestObj = { ClientData: this.clientData, Device: this.testing.Device, UIData: this.uiData };
    this.commonService.commonApiCall(this.apiConfigService.getRouteUrl, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.testing.Device = res.Response;
        this.getTransactions();
      }
    });
  }

  // Get transactions
  getTransactions() {
    this.listofTransactions = new ListofTransactions();
    const requestObj = { ClientData: this.clientData, Device: this.testing.Device, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getTransaction, this.uiData.OperationId);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.spinner.hide();
        this.listofTransactions = res.Response;
        this.configContainerProperties();
        this.childContainer.suggestedContainerFocus();
      }
    });
  }

  getSuggestContainer(value) {
    this.containerFocus();
    if (this.appService.checkNullOrUndefined(value)) {
      this.configContainerProperties();
      this.childContainer.getSuggestContainer(this.testing.Device);
    } else {
      this.clearContainerID();
      this.configContainerProperties();
      this.childContainer.getSuggestContainer(this.testing.Device);
    }
  }

  // validateContainer and sending updated device to child conatiner
  validateContainer(response) {
    if (response.ContainerID != null && response.ContainerID !== undefined) {
      this.testing.Device.ContainerID = response.ContainerID;
      this.testing.Device.ContainerCycle = response.ContainerCycle;
    }
    this.childContainer.validateContainer(this.testing.Device);
  }


  // input match
  checkContainer(container) {
    if (!this.appService.checkNullOrUndefined(container)) {
      this.isSaveDisabled = false;
      this.testing.Device.ContainerID = container.ContainerID;
      this.testing.Device.ContainerCycle = container.ContainerCycle;
    } else {
      this.isSaveDisabled = true;
    }
  }



  // validateContainer Response from child conatiner
  validateContainerResponse(response) {
    if (!this.appService.checkNullOrUndefined(response)) {
      this.testing.Device.ContainerCycle = response.ContainerCycle;
      this.testing.Device.ContainerID = response.ContainerID;
    }
    this.saveOperation();
  }

  // validate container fail response
  emitValidateContainerFailResponse(response) {
    if (!this.appService.checkNullOrUndefined(response)) {
      this.testing.Device.ContainerID = response.ContainerID;
      this.testing.Device.ContainerCycle = response.ContainerCycle;
    }
  }

  // enabling the button and container ID
  configContainerProperties() {
    if (!this.appService.checkNullOrUndefined(this.childContainer)) {
      this.childContainer.isContainerDisabled = false;
      this.childContainer.isClearContainerDisabled = false;
    }
  }


  setSaveValue(val) {
    this.isSaveDisabled = val;
  }


  saveOperation() {
    this.setSaveValue(true);
    const result = this.commonService.validateReadOnlyDeviceDetails(this.uiData);
    result.subscribe(response => {
      if (!this.appService.checkNullOrUndefined(response) && response.Status === StatusCodes.pass) {
        if (!this.appService.checkNullOrUndefined(this.testing.Device)) {
          this.getUpdatedDevice();
        }
      } else if (!this.appService.checkNullOrUndefined(response) && response.Status === StatusCodes.fail) {
        this.spinner.hide();
        this.serialNumberClear();
        this.appErrService.setAlert(response.ErrorMessage.ErrorDetails, true);
      }
    });
  }


  // Updated Device
  getUpdatedDevice() {
    const requestObj = { ClientData: this.clientData, Device: this.testing.Device, UIData: this.uiData };
    this.commonService.commonApiCall(this.apiConfigService.updateDeviceUrl, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.testing.Device = res.Response;
        // this.commonService.postUpdateProcess(this.apiConfigService.postCommonUpdateProcess, requestObj);
        this.saveTransaction();
      } else {
        this.setSaveValue(false);
      }
    });
  }

  saveTransaction() {
    const requestObj = {
      ClientData: this.clientData, Transactions: this.listofTransactions,
      UIData: this.uiData, Device: this.testing.Device, TestResultDetails: {}
    };
    const url = String.Join('/', this.apiConfigService.saveTransaction);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.addSerialNumberSnap();
      } else {
        this.setSaveValue(false);
      }
    });
  }

  // addSerialNumberSnap
  addSerialNumberSnap() {
    const requestObj = { ClientData: this.clientData, Device: this.testing.Device, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.addSerialNumberSnapUrl);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.getQueuedTestSerialNumbers();
        this.refreshContainer();
        if (this.imageCaptureData.length) {
          const uploadrequestObj = { ClientData: this.clientData, UIData: this.uiData, EsnCapImages: this.imageCaptureData, Device: this.testing.Device };
          this.commonService.uploadCapturedImages(uploadrequestObj);
        }
      } else {
        this.setSaveValue(false);
      }
    });
  }


  // refreshContainer
  refreshContainer() {
    this.spinner.show();
    // settting this flag to avoid two error messages
    const requestObj = {
      ClientData: this.clientData, UIData: this.uiData, Containers: this.multipleContainerList,
      Devices: this.contsummaryParent.deviceList
    };
    const url = String.Join('/', this.apiConfigService.refreshContainerUrl, this.inbContainerID);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const result = response.body;
        this.spinner.hide();
        this.isSerialNumberValidated = false;
        if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
          if (result.Response.Quantity === 0) {
            if (result.StatusMessage) {
              this.snackbar.success(result.StatusMessage);
            }
            // whirlpool
            if (!this.appService.checkNullOrUndefined(this.contsummaryParent) && this.contsummaryParent.containerSummaryPropertiesList.length === 0) {
              this.inboundContainerReset();
            } else { // verizon
              if (!this.appService.checkNullOrUndefined(this.contsummaryParent) && this.contsummaryParent.containerSummaryPropertiesList.length && !this.appService.checkNullOrUndefined(result.Response.canAllowNextContainer)) {
                const index = this.contsummaryParent.containerSummaryPropertiesList.findIndex(c => c.containerId === this.inbContainerID);
                if (index !== -1) {
                  this.contsummaryParent.containerSummaryPropertiesList.splice(index, 1);
                }
                if (this.contsummaryParent.containersList && this.contsummaryParent.containersList.length) {
                  const containerIndex = this.contsummaryParent.containersList.findIndex(c => c.ContainerID === this.inbContainerID);
                  if (!this.appService.checkNullOrUndefined(containerIndex)) {
                    this.contsummaryParent.containersList.splice(containerIndex, 1);
                  }
                }
                if (this.contsummaryParent.containersList.length) {
                  if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
                    this.contsummaryParent.searchContainerID(this.contsummaryParent.containersList[this.contsummaryParent.containersList.length - 1].ContainerID);
                  }
                }
                if (this.contsummaryParent.containerSummaryPropertiesList.length === 0 && result.Response.canAllowNextContainer === 'N') {
                  this.inboundContainerReset();
                } else if (result.Response.canAllowNextContainer === 'N') {
                  this.serialNumberClear();
                } else {
                  this.clearInboundContainer();
                  this.serialNumberClear();
                  if (this.contsummaryParent.containerSummaryPropertiesList.length === 0) {
                    this.transactionService.disabledSerialNumber = true;
                    this.masterPageService.inboundContainerFocus();
                  }
                }
              }
            }
          } else {
            this.container.Quantity = result.Response.Quantity;
            if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
              this.contsummaryParent.quantity = (this.container.Quantity).toString();
            }
            if (!this.appService.checkNullOrUndefined(this.contsummaryParent) && this.contsummaryParent.containerSummaryPropertiesList.length && !this.appService.checkNullOrUndefined(result.Response.canAllowNextContainer)) {
              const index = this.contsummaryParent.containerSummaryPropertiesList.findIndex(c => c.containerId === this.inbContainerID);
              if (index !== -1) {
                this.contsummaryParent.containerSummaryPropertiesList[index].inboundProperties.Quantity = result.Response.Quantity;
              }
              if (result.Response.canAllowNextContainer === CommonEnum.yes) {
                this.clearInboundContainer();
              }
            } else {
              if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
                this.contsummaryParent.getInboundDetails();
              }
            }
            this.serialNumberClear();
          }
        } else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
          this.spinner.hide();
          this.masterPageService.inboundContainerFocus();
          if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
            this.contsummaryParent.rmtextchild.applySelect();
            this.contsummaryParent.rmtextchild.applyRequired(true);
          }
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }

  // Serial Number Focus
  serailNumberFocus() {
    this.appService.setFocus('serialNumber');
  }

  inboundContainerReset() {
    // inbound container props
    this.serialNumberClear();
    this.inbContainerID = '';
    this.clearInboundContainer();
    this.multipleContainerList = [];
    this.masterPageService.gridContainerDetails = null;  // grid queue props
    this.headingsobj = []; // container batch props
    this.inboundProperties = null;
    this.isClearDisabled = true;
    this.processQueData = [];
    this.masterPageService.inboundContainerFocus();
    this.showDoNotReject = CommonEnum.no;
    this.transactionService.disabledSerialNumber = true;
    this.uiData.OperationId = this.operationId;
  }

  // clear on serial number
  serialNumberClear() {
    this.appErrService.clearAlert();
    if (!this.isAutoPopulateSerialNumber) {
      this.serialNumber = '';
    }
    this.isAutoPopulateSerialNumber = false;
    this.isSerialNumberValidated = false;
    this.transactionService.disabledSerialNumber = false;
    this.isSaveDisabled = true;
    this.imageCaptureData = null;
    this.clearContainerID();
    this.serailNumberFocus();
  }

  changeInput() {
    this.isClearDisabled = false;
    this.appErrService.clearAlert();
  }

  // clear inbound container
  clearInboundContainer() {
    if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
      this.contsummaryParent.inbContainerDisabled = false;
      this.contsummaryParent.rmtextchild.value = '';
      this.contsummaryParent.quantity = '';
      this.contsummaryParent.category = '';
      this.contsummaryParent.isClearDisabled = true;
      this.contsummaryParent.deviceList = [];
      this.contsummaryParent.containersList = [];
      this.contsummaryParent.containerSummaryPropertiesList = [];
      this.contsummaryParent.canAllowNextContainerStatus = null;
      this.contsummaryParent.containerSummaryProperties = [];
      this.contsummaryParent.containerActualProp = null;
    }
  }

  // clear container suggestion
  clearContainerID() {
    if (!this.appService.checkNullOrUndefined(this.childContainer)) {
      const container = this.childContainer;
      container.ContainerID = '';
      container.suggestedContainer = '';
      container.categoryName = '';
      container.isContainerDisabled = true;
      container.isClearContainerDisabled = true;
      container.applyRequired(false);
    }
  }

  ngOnDestroy(): void {
    this.commonService.emitReadOnlyDeviceResponse.next(null);
    this.emitReadOnlyDeviceResponse.unsubscribe();
    if (this.dialogRef) {
      this.dialogRef.close();
    }
    if (this.contsummaryParent) {
      if (this.contsummaryParent.dialogRef) {
        this.contsummaryParent.dialogRef.close();
      }
      this.contsummaryParent.containersList = [];
      this.contsummaryParent.deviceList = [];
    }
    this.masterPageService.defaultProperties();
    this.transactionService.disabledSerialNumber = true;
    this.masterPageService.gridContainerDetails = null;
    this.masterPageService.showUtilityIcon = false;
  }

  // end















  // conatiner focus
  containerFocus() {
    this.appService.setFocus('containerInputId');
  }

  // save button foucs
  saveFocus() {
    this.appService.setFocus('save');
  }



}
