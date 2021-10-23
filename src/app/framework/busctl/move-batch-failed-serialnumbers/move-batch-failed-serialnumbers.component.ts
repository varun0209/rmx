import { Component, OnInit, Input, ViewChild, OnDestroy, EventEmitter, Output } from '@angular/core';
import { AppErrorService } from '../../../utilities/rlcutl/app-error.service';
import { RmtextboxComponent } from '../../frmctl/rmtextbox/rmtextbox.component';
import { AppService } from '../../../utilities/rlcutl/app.service';
import { MasterPageService } from '../../../utilities/rlcutl/master-page.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ClientData } from '../../../models/common/ClientData';
import { UiData } from '../../../models/common/UiData';
import { StorageData } from '../../../enums/storage.enum';
import { ApiConfigService } from '../../../utilities/rlcutl/api-config.service';
import { String } from 'typescript-string-operations';
import { ApiService } from './../../../utilities/rlcutl/api.service';
import { StatusCodes } from '../../../enums/status.enum';
import { CommonService } from '../../../services/common.service';
import { TraceTypes } from '../../../enums/traceType.enum';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { FindTraceHoldComponent } from '../find-trace-hold/find-trace-hold.component';
import { ContainerSuggestionComponent } from '../../busctl/container-suggestion/container-suggestion.component';
import { Container } from './../../../models/common/Container';
import { CommonEnum } from '../../../enums/common.enum';
import { Grid } from '../../../models/common/Grid';
import { TestingDeviceRoutes } from '../../../models/testing/Testing';
import { Message } from '../../../models/common/Message';
import { MessageType } from '../../../enums/message.enum';
import { MessagingService } from '../../../utilities/rlcutl/messaging.service';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'move-batch-failed-serialnumbers',
  templateUrl: './move-batch-failed-serialnumbers.component.html',
  styleUrls: ['./move-batch-failed-serialnumbers.component.css']
})
export class MoveBatchFailedSerialnumbersComponent implements OnInit, OnDestroy {

  @ViewChild(ContainerSuggestionComponent) childContainer: ContainerSuggestionComponent;
  @ViewChild('inputContainerId') inputContainerId: RmtextboxComponent;

  @Input() title: string;
  @Output() emitCloseSamplingBatch = new EventEmitter();


  clientData = new ClientData();
  uiData = new UiData();
  operationObj: any;
  showAlert = false;
  text: string;
  controlConfig: any;
  serialNumber: string;
  failedDevicesResponseData: any;
  inBoundcontainer = new Container();
  deviceRoutes = new TestingDeviceRoutes();
  isClearDisabled = true;
  isContainerDisabled = false;
  containerId = '';
  serialNumbers: any;
  validMoveSerialNumberResponse: any;
  isSerialNumDisabled = true;
  suggestedContainerID = '';
  serialNumberFailDevice: any;
  isMoveDisabled = true;
  suggestedContainerId: string;
  grid: Grid;
  tempFailedSerialNumbers = [];
  hideInboundContainer = false;
  @Input() inboundContainerId;
  @Input() gridData;
  @Input() batchStatus;
  isBatchCloseDisabled = true;
  batchId = '';
  appConfig: any;
  dialogRef: any;

  constructor(
    public appErrService: AppErrorService,
    public appService: AppService,
    public masterPageService: MasterPageService,
    public spinner: NgxSpinnerService,
    private apiConfigService: ApiConfigService,
    public apiService: ApiService,
    private commonService: CommonService,
    private snackbar: XpoSnackBar,    
    private messagingService: MessagingService,
    private dialog: MatDialog
  ) {
  }

  ngOnInit() {
    // if (this.title) { 
    //   this.operationObj = this.masterPageService.getOperationForPopUp(this.title);
    // } else {
    //   this.operationObj = this.masterPageService.getRouteOperation();
    //   this.masterPageService.setTitle(this.operationObj.Title);
    //   this.containerFocus();
    // }
    // if (this.operationObj) {
    //   this.uiData.OperationId = this.operationObj.OperationId;
    //   this.uiData.OperCategory = this.operationObj.Category;
    // }

    this.appConfig = JSON.parse(localStorage.getItem(StorageData.appConfig));
    this.uiData.OperationId = this.appConfig.closeBatch.UIData.OperationId;
    this.uiData.OperCategory = this.appConfig.closeBatch.UIData.OperCategory;
    this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
    this.controlConfig = JSON.parse(localStorage.getItem(StorageData.controlConfig));
    this.masterPageService.showtogglePageWise = false;
    if (!this.appService.checkNullOrUndefined(this.inboundContainerId)) {
      this.hideInboundContainer = true;
    }
    if (!this.appService.checkNullOrUndefined(this.gridData)) {
      this.onProcessJsonGrid(this.gridData);
      this.isSerialNumDisabled = false;
      this.serialNumberFocus();
    }
    if (!this.title) {
      this.containerFocus();
      this.masterPageService.setTitle(this.appConfig.closeBatch.Title);
    }
    this.clearAlert();
  }



  clearAlert() {
    this.showAlert = false;
    this.text = '';
    this.appErrService.specialCharErrMsg = '';
  }

  public getFailedDevices() {
    this.commonService.getFailedDevices(this.containerId).subscribe(res => {
      if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
        this.failedDevicesResponseData = res;
        const traceData = {
          traceType: TraceTypes.containerID,
          traceValue: this.containerId,
          uiData: this.uiData
        };
        const traceResult = this.commonService.findTraceHold(traceData, this.uiData);
        traceResult.subscribe(result => {
          if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
            if (this.appService.checkNullOrUndefined(result.Response)) {
              this.failedDevicesResponse();
            } else {
              this.canProceed(result, TraceTypes.containerID);
            }
            this.spinner.hide();
          } else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
            this.spinner.hide();
            this.showAlert = true;
            this.text = result.ErrorMessage.ErrorDetails;
            this.snackbar.error(this.text);
          }
        });
      } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
        this.inputContainerId.applyRequired(true);
        this.inputContainerId.applySelect();
        this.spinner.hide();
        this.showAlert = true;
        this.text = res.ErrorMessage.ErrorDetails;
        this.snackbar.error(this.text);
      }
    })
  }

  failedDevicesResponse(res = this.failedDevicesResponseData) {
    if (!this.appService.checkNullOrUndefined(res.Response)) {
      if (!this.appService.checkNullOrUndefined(res.Response.batchId)) {
        this.batchId = res.Response.batchId;
      }
      if (res.Response.deviceErrors && res.Response.deviceErrors.length) {
        this.onProcessJsonGrid(res.Response.deviceErrors);
        this.isContainerDisabled = true;
        this.isSerialNumDisabled = false;
        this.serialNumberFocus();
      }
      if (!res.Response.deviceErrors.length) {
        this.isBatchCloseDisabled = false;
      }
    }
    this.failedDevicesResponseData = null;
  }

  onProcessJsonGrid(Response) {
    if (!this.appService.checkNullOrUndefined(Response)) {
      this.tempFailedSerialNumbers = [];
      Response.forEach(res => {
        delete res.Type;
        this.tempFailedSerialNumbers.push(res);
      });
    }
    this.grid = new Grid();
    this.serialNumbers = this.appService.onGenerateJson(this.tempFailedSerialNumbers, this.grid);
  }

  // container focus
  containerFocus() {
    this.appService.setFocus('containerId');
  }

  // changeContainer
  changeContainer(inputControl: RmtextboxComponent) {
    this.isClearDisabled = false;
    this.clearAlert();
    if (inputControl) {
      inputControl.applyRequired(false);
    }
  }

  // clearEmit
  clearEmit(value) {
    this.isClearDisabled = value;
  }

  // canProceed trace method
  canProceed(traceResponse, type, inbContainer?) {
    if (traceResponse.Response.canProceed === CommonEnum.yes) {
      this.snackbar.info(traceResponse.StatusMessage);
    }
    if (!this.appService.checkNullOrUndefined(traceResponse.Response.TraceHold)) {
      const uiObj = { uiData: this.uiData };
      traceResponse = Object.assign(traceResponse, uiObj);
      this.dialogRef = this.dialog.open(FindTraceHoldComponent, { hasBackdrop: true, disableClose: true, panelClass: 'dialog-width-sm', data: { modalData: traceResponse } });
      this.dialogRef.afterClosed().subscribe((returnedData) => {
        if (returnedData) {
        if (returnedData.Response.canProceed === CommonEnum.yes) {
          if (type === TraceTypes.containerID) {
            this.failedDevicesResponse();
          }
          if (type === TraceTypes.serialNumber) {
            this.validMoveSerialNumber(inbContainer);
          }
        } else if (returnedData.Response.canProceed === CommonEnum.no) {
          if (type === TraceTypes.containerID) {
            this.containerFocus();
          }
          if (type === TraceTypes.serialNumber) {
            this.serialNumberFocus();
          }
          this.showAlert = true;
          this.text = returnedData.StatusMessage;
          this.snackbar.error(this.text);
        }
        this.spinner.hide();
        }
      });
    }
  }

  serialNumberFocus() {
    this.appService.setFocus('serialNmbr');
  }

  // validate move serial number
  validateMoveSerialNumber(inputcontrol: RmtextboxComponent) {
    if (!this.appService.checkNullOrUndefined(this.serialNumber)) {
      const checkSerialNumberExist = this.serialNumbers.Elements.findIndex(e => e.SerialNumber === this.serialNumber);
      if (checkSerialNumberExist === -1) {
        this.showAlert = true;
        let userMessage = new Message();
        userMessage = this.messagingService.SendUserMessage('2660044', MessageType.failure);
        this.text = userMessage.messageText;
        return;
      }
      this.clearAlert();
      this.spinner.show();
      const requestObj = { ClientData: this.clientData, UIData: this.uiData };
      const url = String.Join('/', this.apiConfigService.validateMoveSerialNumberUrl, this.serialNumber);
      this.apiService.apiPostRequest(url, requestObj)
        .subscribe(response => {
          const res = response.body;
          if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
            this.validMoveSerialNumberResponse = res;
            if (this.validMoveSerialNumberResponse
              && this.validMoveSerialNumberResponse.Response &&
              this.validMoveSerialNumberResponse.Response.Device) {
              const traceData = {
                traceType: TraceTypes.serialNumber,
                traceValue: this.validMoveSerialNumberResponse.Response.Device.SerialNumber, uiData: this.uiData
              };
              const traceResult = this.commonService.findTraceHold(traceData, this.uiData);
              traceResult.subscribe(result => {
                if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
                  if (this.appService.checkNullOrUndefined(result.Response)) {
                    this.validMoveSerialNumber(inputcontrol);
                  } else {
                    this.canProceed(result, TraceTypes.serialNumber, inputcontrol);
                  }
                } else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
                  this.spinner.hide();
                  this.showAlert = true;
                  this.text = result.ErrorMessage.ErrorDetails;
                  this.snackbar.error(this.text);
                }
              });
            } else {
              inputcontrol.applyRequired(true);
              inputcontrol.applySelect();
            }
          } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
            this.showAlert = true;
            this.text = res.ErrorMessage.ErrorDetails;
            inputcontrol.applyRequired(true);
            inputcontrol.applySelect();
          }
        },
          error => {
            inputcontrol.applyRequired(true);
            inputcontrol.applySelect();
            this.appErrService.handleAppError(error, false);
            this.showAlert = true;
            this.text = this.appErrService.emiterrorvalue;
          });
    }
  }

  validMoveSerialNumber(inputcontrol: RmtextboxComponent, res = this.validMoveSerialNumberResponse) {
    this.isSerialNumDisabled = true;
    this.serialNumberFailDevice = res.Response.Device;
    this.inBoundcontainer = res.Response.Container;
    this.loadProgramValues();
    inputcontrol.applyRequired(false);
    this.validMoveSerialNumberResponse = null;
  }

  // load Program Values
  loadProgramValues() {
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, Device: this.serialNumberFailDevice, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.loadProgramValuesurl, this.serialNumberFailDevice.ProgramName);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          this.serialNumberFailDevice = res.Response;
          this.getRoute();
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          this.spinner.hide();
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }

  // Getroute
  getRoute() {
    const requestObj = { ClientData: this.clientData, Device: this.serialNumberFailDevice, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getRouteUrl);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          this.serialNumberFailDevice = res.Response;
          this.configContainerProperties();
          this.childContainer.suggestedContainerFocus();
          this.spinner.hide();
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          this.spinner.hide();
        }
      }, error => {
        this.appErrService.handleAppError(error);
      });
  }
  // change input box
  changeInput(inputControl: RmtextboxComponent) {
    this.isClearDisabled = false;
    inputControl.applyRequired(false);
    this.showAlert = false;
    this.appErrService.clearAlert();
  }

  // getContainerId
  getContainerId(containerid) {
    this.suggestedContainerID = containerid;
  }

  // Refresh and getSuggestionContainer(focus)
  // getSuggestContainer sending receive device to child conatiner
  getSuggestContainer(value) {
    this.childContainer.suggestedContainerFocus();
    if (this.appService.checkNullOrUndefined(value)) {
      this.configContainerProperties();
      this.childContainer.getSuggestContainer(this.serialNumberFailDevice);
    } else {
      this.clearContainerID();
      this.configContainerProperties();
      this.childContainer.getSuggestContainer(this.serialNumberFailDevice);
    }
  }

  // validateContainer and sending updated device to child conatiner
  validateContainer(response) {
    if (response.ContainerID != null && response.ContainerID !== undefined) {
      this.serialNumberFailDevice.ContainerID = response.ContainerID;
      this.serialNumberFailDevice.ContainerCycle = response.ContainerCycle;
    }
    this.childContainer.validateContainer(this.serialNumberFailDevice);
  }

  // validate container fail response
  emitValidateContainerFailResponse(response) {
    if (!this.appService.checkNullOrUndefined(response)) {
      this.serialNumberFailDevice.ContainerID = response.ContainerID;
      this.serialNumberFailDevice.ContainerCycle = response.ContainerCycle;
    }
  }


  // validateConta iner Response from child conatiner
  validateContainerResponse(response) {
    if (!this.appService.checkNullOrUndefined(response)) {
      this.isMoveDisabled = true;
      this.serialNumberFailDevice.ContainerCycle = response.ContainerCycle;
      this.serialNumberFailDevice.ContainerID = response.ContainerID;
      this.getUpdateDevice();
    } else {
      this.getUpdateDevice();
    }
  }

  // update device
  getUpdateDevice() {
    if (!this.appService.checkNullOrUndefined(this.serialNumberFailDevice) && this.serialNumberFailDevice !== '') {
      this.spinner.show();
      const requestObj = { ClientData: this.clientData, Device: this.serialNumberFailDevice, UIData: this.uiData };
      const url = String.Join('/', this.apiConfigService.updateDeviceUrl);
      this.apiService.apiPostRequest(url, requestObj)
        .subscribe(response => {
          const res = response.body;
          if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
            const postUrl = String.Join('/', this.apiConfigService.postCommonUpdateProcess);
            this.commonService.postUpdateProcess(postUrl, requestObj);
            if (this.serialNumbers) {
              if (this.serialNumbers.Elements.length > 0) {
                this.serialNumbers.Elements.forEach((element, i) => {
                  if (element.SerialNumber === this.serialNumberFailDevice.SerialNumber) {
                    this.serialNumbers.Elements.splice(i, 1);
                  }
                });
                this.serialNumber = '';
                this.isSerialNumDisabled = false;
                this.serialNumberFocus();
              }
              if (this.serialNumbers.Elements.length >= 1) {
                this.spinner.hide();
                this.clearContainerID();
              }
              if (this.serialNumbers.Elements.length === 0) {
                if (this.hideInboundContainer) {
                  this.masterPageService.hideModal();
                  this.emitCloseSamplingBatch.emit();
                } else {
                  this.closeSamplingBatch();
                }
              }
            } else {
              this.isMoveDisabled = true;
            }
            // this.snackbar.success(res.Response);
          } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
            this.spinner.hide();
            this.showAlert = true;
            this.text = res.ErrorMessage.ErrorDetails;
            this.isContainerDisabled = false;
          }
        },
          error => {
            this.appErrService.handleAppError(error, false);
            this.showAlert = true;
            this.text = this.appErrService.emiterrorvalue;
          });
    }
  }

  closeSamplingBatch() {
    this.commonService.closeSamplingBatch(this.containerId, this.batchId, this.uiData, this.batchStatus).subscribe(res => {
      if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
        if (res.Response) {
          this.snackbar.success(res.Response);
        }
        this.Clear();
        this.spinner.hide();
      } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
        this.spinner.hide();
        this.clearContainerID();
        this.containerFocus();
        this.isSerialNumDisabled = true;
        this.isContainerDisabled = false;
        this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        this.showAlert = true;
        this.text = res.ErrorMessage.ErrorDetails;
      }
    });
  }

  Clear() {
    if (this.hideInboundContainer) {
      this.isSerialNumDisabled = false;
      this.serialNumberFocus();
    } else {
      this.isContainerDisabled = false;
      this.isSerialNumDisabled = true;
      this.containerFocus();
      this.batchId = '';
      this.serialNumbers = null;
      this.isBatchCloseDisabled = true;
      this.tempFailedSerialNumbers = [];
    }
    this.serialNumber = '';
    this.containerId = '';
    this.clearContainerID();
    this.suggestedContainerId = '';
    this.isMoveDisabled = true;
    this.isClearDisabled = true;
    this.clearAlert();
    this.appErrService.clearAlert();
  }

  // enabling the button and container ID
  configContainerProperties() {
    this.childContainer.isContainerDisabled = false;
    this.childContainer.isClearContainerDisabled = false;
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

  // input match
  checkContainer(container) {
    if (!this.appService.checkNullOrUndefined(container)) {
      this.isMoveDisabled = false;
      this.serialNumberFailDevice.ContainerID = container.ContainerID;
      this.serialNumberFailDevice.ContainerCycle = container.ContainerCycle;
    } else {
      this.isMoveDisabled = true;
    }
  }

  ngOnDestroy() {
    this.clearAlert();
    if (this.dialogRef) {
      this.dialogRef.close();
    }
    this.masterPageService.hideDialog();
    this.masterPageService.showtogglePageWise = true;
  }
}
