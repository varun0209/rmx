import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { String } from 'typescript-string-operations';
import { TraceTypes } from '../../enums/traceType.enum';
import { CommonService } from '../../services/common.service';
import { MessageType } from '../../enums/message.enum';
import { FindTraceHoldComponent } from '../../framework/busctl/find-trace-hold/find-trace-hold.component';
import { UiData } from '../../models/common/UiData';
import { GenericRelease } from '../../models/utility/generic-release';
import { ClientData } from '../../models/common/ClientData';
import { ContainerSummaryComponent } from '../../framework/busctl/container-summary/container-summary.component';
import { TestingDevice } from '../../models/testing/TestingDevice';
import { Testing, TestingDeviceRoutes } from '../../models/testing/Testing';
import { Subscription } from 'rxjs';
import { ContainerSuggestionComponent } from '../../framework/busctl/container-suggestion/container-suggestion.component';
import { ListofTransactions } from '../../models/common/ListofTransactions';
import { NgxSpinnerService } from 'ngx-spinner';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';

import { MasterPageService } from '../../utilities/rlcutl/master-page.service';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';
import { ApiConfigService } from '../../utilities/rlcutl/api-config.service';
import { ApiService } from '../../utilities/rlcutl/api.service';
import { AppService } from '../../utilities/rlcutl/app.service';
import { LottableTrans } from '../../models/common/LottableTrans';
import { StatusCodes } from '../../enums/status.enum';
import { EngineResult } from '../../models/common/EngineResult';
import { Grid } from './../../models/common/Grid';
import { CommonEnum } from './../../enums/common.enum';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-generic-release',
  templateUrl: './generic-release.component.html',
  styleUrls: ['./generic-release.component.css']
})
export class GenericReleaseComponent implements OnInit, OnDestroy {

  @ViewChild(ContainerSummaryComponent) contsummaryParent: ContainerSummaryComponent;
  @ViewChild(ContainerSuggestionComponent) childContainer: ContainerSuggestionComponent;
  @ViewChild('serialNumberInput') serialnumberInput: any;

  // inbound properties
  inbContainerID = '';
  headingsobj = [];
  inboundProperties: any;
  multipleContainerList: any;
  inboundContainerId: string;


  // serial number
  isSerialNumberDisabled = true;
  validTestSerialNumberResponse: any;
  isAutoPopulatedSerialNumber = false;

  // trace
  traceTypes = TraceTypes;


  // client Control Labels
  controlConfig: any;
  clientData = new ClientData();
  uiData = new UiData();
  genericReleaseModel = new GenericRelease();
  listofTransactions: ListofTransactions;

  isEnableDynamicButton = true;
  isClearDisabled = true;
  isSaveDisabled = true;
  serialNumber;

  isAutoDisabled = true;
  getReleaseTypeResponse: any;
  releaseTypesList = [];
  isReleaseTypeDisabled = true;
  isReleaseOptionsDisabled = true;
  releaseOptionSelected = '';

  // grading Device object
  releaseDevice = new TestingDevice();

  // originaiton operation
  originationOperation: Subscription;
  emitReadOnlyDeviceResponse: Subscription;

  deviceOrigination: string;

  releaseType: any;
  releaseOptionsList: any[];

  tosterMessage: any;
  lottableTrans: LottableTrans;
  operationObj: any;

  nextRoutes: string;
  isRouteReason: string;

  grid: Grid;

  processAllDisabled = true;
  showContainerMode = false;
  operationId: string;
  dialogRef: any;

  constructor(public masterPageService: MasterPageService,
    public appErrService: AppErrorService,
    public appService: AppService,
    private commonService: CommonService,
    private spinner: NgxSpinnerService,
    private snackbar: XpoSnackBar,
    private apiConfigService: ApiConfigService,
    private apiService: ApiService,
    private dialog: MatDialog
  ) {
    // emitting readOnlyDevice response
    this.emitReadOnlyDeviceResponse = this.commonService.emitReadOnlyDeviceResponse.subscribe(res => {
      if (!this.appService.checkNullOrUndefined(res)) {
        if (!this.appService.checkNullOrUndefined(res.Status) && res.Status == StatusCodes.pass) {
          this.validTestSerialNumber();
        } else if (!this.appService.checkNullOrUndefined(res.Status) && res.Status == StatusCodes.fail) {
          this.clear();
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
      this.clientData = JSON.parse(localStorage.getItem('clientData'));
      this.masterPageService.setTitle(this.operationObj.Title);
      this.masterPageService.setModule(this.operationObj.Module);
      this.controlConfig = JSON.parse(localStorage.getItem('controlConfig'));
      this.masterPageService.setRouteCardHeader(CommonEnum.routeDetails);
      this.masterPageService.containerDetailsHeader(CommonEnum.containerDetails);
      this.masterPageService.setActiveTabValue = CommonEnum.containerDetails;
      this.originationOperation = this.masterPageService.originationOperation.subscribe(val => {
        if (!this.appService.checkNullOrUndefined(val)) {
          this.deviceOrigination = val;
        }
      });
    }
  }

   //operationId
   setCurrentOperationId(operationId) {
    this.uiData.OperationId = operationId;
}


  checkOperationList() {
    return (this.masterPageService.routeOperationList.length || this.masterPageService.nextRoutesList.length || this.masterPageService.gridContainerDetails);
  }

  // containerSummaryProperties
  containerSummaryProperties(event: any) {
    this.headingsobj = [];
    this.headingsobj = Object.keys(event);
    this.inboundProperties = event;
  }

  // inbContainerID
  getinbContainerID(inbcontid) {
    this.inbContainerID = inbcontid;
  }

  getAutoPopulatedSerailNum(event: any) {
    if (!this.appService.checkNullOrUndefined(event) && event != '') {
      this.serialNumber = event;
      this.isAutoPopulatedSerialNumber = true;
      this.validateTestSerialNumber(this.serialNumber, this.serialnumberInput);
    } else {
      this.checkContainerModeEligibility();
    }
    this.commonService.getQueuedTestSerialNumbers(this.clientData,this.uiData,this.inbContainerID);
  }



  getContainerList(event) {
    this.multipleContainerList = event;
  }

  checkContainerModeEligibility() {
    this.processAllDisabled = true;
    this.showContainerMode = false;
    this.isSerialNumberDisabled = false;
    this.serailNumberFocus();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, Containers: this.multipleContainerList, Device: this.contsummaryParent.deviceList[0] };
    const url = String.Join('/', this.apiConfigService.checkContainerModeEligibilityUrl);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        if (res.Response.ShowProcessAll === CommonEnum.yes) {
          this.processAllDisabled = false;
          this.showContainerMode = true;
        }
      }
    });
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

  private clearContainerSummary() {
    if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
      this.contsummaryParent.inbContainerDisabled = false;
      this.contsummaryParent.rmtextchild.value = '';
      this.contsummaryParent.quantity = '';
      this.contsummaryParent.category = '';
      this.contsummaryParent.isClearDisabled = true;
    }
  }

  // validateTestSerialNumber
  validateTestSerialNumber(serialNumber, inpcontrol: any) {
    this.appErrService.clearAlert();
    this.spinner.show();
    this.processAllDisabled = true;
    this.showContainerMode = false;
    if (!this.appService.checkNullOrUndefined(this.deviceOrigination) && this.deviceOrigination != '') {
      this.releaseDevice.Origination = this.deviceOrigination;
    }
    if (this.masterPageService.hideControls && this.masterPageService.hideControls.controlProperties && this.masterPageService.hideControls.controlProperties.containerSuggestion == undefined) {
      this.clearContainerID();
    }
    this.isClearDisabled = false;
    this.releaseDevice.SerialNumber = serialNumber;
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getValidateSerialnumberCommonUrl, this.contsummaryParent.rmtextchild.value, serialNumber);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (res.Status === StatusCodes.pass && !this.appService.checkNullOrUndefined(res)) {
          this.validTestSerialNumberResponse = response.body;
          const traceData = { traceType: this.traceTypes.serialNumber, traceValue: this.validTestSerialNumberResponse.Response.SerialNumber, uiData: this.uiData }
          const traceResult = this.commonService.findTraceHold(traceData, this.uiData);
          traceResult.subscribe(result => {
            if (result.Status === StatusCodes.pass && !this.appService.checkNullOrUndefined(result)) {
              if (this.appService.checkNullOrUndefined(result.Response)) {
                this.commonService.getReadOnlyDeviceDetails(this.validTestSerialNumberResponse.Response.SerialNumber, this.uiData);
              } else {
                this.canProceed(result, this.traceTypes.serialNumber);
                this.spinner.hide();
              }
            } else if (result.Status === StatusCodes.fail) {
              this.spinner.hide();
              this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
            }
          });
        } else if (res.Status === StatusCodes.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          inpcontrol.applyRequired(true);
          inpcontrol.applySelect();
          this.spinner.hide();
        }
      },
        error => {
          this.appErrService.handleAppError(error);
          this.spinner.hide();
        });

  }

  processAll() {
    this.isSerialNumberDisabled = true;
    this.serialNumber = '';
    this.processAllDisabled = true;
    this.getReleaseTypes(this.contsummaryParent.deviceList[0]);
    this.serialnumberInput.applyRequired(false);
  }

  validTestSerialNumber(result = this.validTestSerialNumberResponse) {
    this.releaseDevice = result.Response;
    // inboundContainerid its storing for sending request of current inbound container id
    this.inboundContainerId = this.releaseDevice.ContainerID;
    if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
      this.contsummaryParent.searchContainerID(this.releaseDevice.ContainerID);
    }
    this.getReleaseTypes(this.releaseDevice);
    this.validTestSerialNumberResponse = null;
  }

  getReleaseTypes(device) {
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, Device: device };
    const url = String.Join('/', this.apiConfigService.getReleaseTypes);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          if (!this.appService.checkNullOrUndefined(res.Response['ReleaseTypes'])) {
            this.releaseTypesList = res.Response['ReleaseTypes'];
            this.isReleaseTypeDisabled = false;
            this.isSerialNumberDisabled = true;
            if (this.releaseTypesList.length === 1) {
              this.releaseType = this.releaseTypesList[0].Id;
              this.getReleaseType();
            } else {
              this.spinner.hide();
            }
          }
        } else if (res.Status === StatusCodes.fail && !this.appService.checkNullOrUndefined(res)) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          this.spinner.hide();
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }

  onReleaseTypeChange(event) {
    this.clearReleaseType();
    this.releaseType = event.value;
    this.getReleaseType();
  }

  getReleaseType() {
    this.spinner.show();
    const device = (this.releaseDevice && Object.keys(this.releaseDevice).length) ? this.releaseDevice : this.contsummaryParent.deviceList[0];
    const requestObj = { ClientData: this.clientData, Device: device, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getReleaseType, this.releaseType);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (res.Status === StatusCodes.pass && !this.appService.checkNullOrUndefined(res)) {
          if (!this.appService.checkNullOrUndefined(res.Response['GenericHoldRelease'])) {
            this.getReleaseTypeResponse = res.Response['GenericHoldRelease'];
            if (!this.appService.checkNullOrUndefined(res.Response['NextRoutes'])) {
              this.masterPageService.nextRoutesList = res.Response['NextRoutes'];
            }
            if (!this.appService.checkNullOrUndefined(res.Response['HoldReason'])) {
              this.isRouteReason = res.Response['HoldReason'];
            }
            if (!this.appService.checkNullOrUndefined(res.Response['Operations'])) {
              this.masterPageService.routeOperationList = this.routeFlowList(res.Response['Operations']);
            }
            if (!this.appService.checkNullOrUndefined(res.Response['RouteId'])) {
              this.masterPageService.RouteId = res.Response['RouteId'];
            }
            if (res.Response['AutoEnabled']) {
              // auto button api call
            } else {
              this.getReleaseOptions();
            }
            this.isAutoDisabled = !res.Response['AutoEnabled'];
            if (this.masterPageService.routeOperationList.length || this.masterPageService.nextRoutesList.length) {
              this.masterPageService.setActiveTabValue = CommonEnum.routeDetails;
            }
          }
        } else if (res.Status === StatusCodes.fail && !this.appService.checkNullOrUndefined(res)) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          this.spinner.hide();
        }
      },
        error => {
          this.spinner.hide();
          this.appErrService.handleAppError(error);
        });
  }

  getReleaseOptions() {
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getReleaseOptions, this.releaseType);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const res = response.body;
        this.spinner.hide();
        if (res.Status === StatusCodes.pass && !this.appService.checkNullOrUndefined(res)) {
          if (!this.appService.checkNullOrUndefined(res.Response['ReleaseOptions'])) {
            this.releaseOptionSelected = '';
            this.releaseOptionsList = res.Response['ReleaseOptions'];
            if (this.getReleaseTypeResponse['RouteChangeEligible'] && this.masterPageService.nextRoutesList.length) {
              this.masterPageService.isNextRoutesDisabled = false;
              this.nextRoutesFocus();
            } else {
              this.isReleaseOptionsDisabled = false;
              this.releaseOptionsFocus();
            }
          }
        } else if (res.Status === StatusCodes.fail && !this.appService.checkNullOrUndefined(res)) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      },
        error => {
          this.spinner.hide();
          this.appErrService.handleAppError(error);
        });
  }

  onNextRoutersChange(event) {
    this.nextRoutes = event.value;
    this.isReleaseOptionsDisabled = false;
    this.releaseOptionsFocus();
  }

  routeFlowList(item) {
    let flag = false;
    item.map(res => {
      if (this.releaseDevice.NextStep == res.Id) {
        flag = true;
        res.color = 'activeOps';
      } else if (!flag) {
        res.color = 'completedOps';
      }
    });
    return item;
  }

  canProceed(traceResponse, type) {
    if (traceResponse.Response.canProceed == 'Y') {
      this.appErrService.setAlert(traceResponse.StatusMessage, true, MessageType.info);
    }
    if (!this.appService.checkNullOrUndefined(traceResponse.Response.TraceHold)) {
      const uiObj = { uiData: this.uiData }
      traceResponse = Object.assign(traceResponse, uiObj);
      this.dialogRef = this.dialog.open(FindTraceHoldComponent, { hasBackdrop: true, disableClose: true, panelClass: 'dialog-width-sm', data: { modalData: traceResponse } });
      this.dialogRef.afterClosed().subscribe((returnedData) => {
          if (returnedData) {
        if (returnedData.Response.canProceed == 'Y') {
          if (type == this.traceTypes.serialNumber) {
            this.validTestSerialNumber();
          }
        } else if (returnedData.Response.canProceed == 'N') {
          if (type == this.traceTypes.serialNumber) {
            this.serailNumberFocus();
          }
          this.appErrService.setAlert(returnedData.StatusMessage, true);
        }
      }
      });
    }
  }


  changeReleaseOptions(selectedOption) {
    this.releaseOptionSelected = selectedOption;
    this.isEnableDynamicButton = false;
    this.releaseFocus();
  }

  dinamicReleaseAPI() {
    this.isEnableDynamicButton = true;
    if (this.showContainerMode) {
      this.dynamicRelease(this.contsummaryParent.deviceList[0], CommonEnum.yes);
      return;
    }
    const result = this.commonService.validateReadOnlyDeviceDetails(this.uiData);
    result.subscribe(resp => {
      if (!this.appService.checkNullOrUndefined(resp) && resp.Status === StatusCodes.pass) {
        this.dynamicRelease(this.releaseDevice, CommonEnum.no);
      } else if (!this.appService.checkNullOrUndefined(resp) && resp.Status === StatusCodes.fail) {
        this.spinner.hide();
        this.resetClear();
        this.appErrService.setAlert(resp.ErrorMessage.ErrorDetails, true);
      }
    });
  }


  private dynamicRelease(device = this.releaseDevice, showContainerMode = CommonEnum.no) {
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, Device: device, GenericHoldRelease: this.getReleaseTypeResponse };
    let url = '';
    if (!this.appService.checkNullOrUndefined(this.nextRoutes)) {
      url = String.Join('/', this.apiConfigService.dinamicURL, this.getReleaseTypeResponse['ActionMethodApi'], showContainerMode, this.releaseOptionSelected, this.nextRoutes);
    } else {
      url = String.Join('/', this.apiConfigService.dinamicURL, this.getReleaseTypeResponse['ActionMethodApi'], showContainerMode, this.releaseOptionSelected);
    }
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (res.Status === StatusCodes.pass && !this.appService.checkNullOrUndefined(res)) {
          if (this.showContainerMode) {
            this.saveAllReleasedDevices(res.Response);
          } else {
            this.releaseDevice = res.Response;
            this.getTransactions(res.StatusMessage);
          }
        } else if (res.Status === StatusCodes.fail && !this.appService.checkNullOrUndefined(res)) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          this.spinner.hide();
        }
      }, error => {
        this.spinner.hide();
        this.appErrService.handleAppError(error);
      });
  }

  saveAllReleasedDevices(deviceList) {
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, Devices: deviceList, Containers: this.multipleContainerList };
    const url = String.Join('/', this.apiConfigService.saveAllReleasedDevicesUrl);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        this.snackbar.success(res.StatusMessage);
        this.resetClear();
      }
    });
  }




  // Get transactions
  getTransactions(status) {
    this.listofTransactions = new ListofTransactions();
    const requestObj = { ClientData: this.clientData, Device: this.releaseDevice, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getTransaction, this.uiData.OperationId);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (res.Status === StatusCodes.pass && !this.appService.checkNullOrUndefined(res)) {
          this.configContainerProperties();
          this.containerFocus();
          this.listofTransactions = res.Response;
          if (status !== '') {
            this.snackbar.success(status);
          }
          this.isReleaseOptionsDisabled = true;
          this.clearRouteDetails();
          this.isReleaseTypeDisabled = true;
          this.masterPageService.setActiveTabValue = CommonEnum.containerDetails;
          this.isEnableDynamicButton = true;
        } else if (res.Status === StatusCodes.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
        this.spinner.hide();
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }


  // getSuggestContainer sending receive device to child conatiner
  getSuggestContainer(value) {
    this.containerFocus();
    if (this.appService.checkNullOrUndefined(value)) {
      this.configContainerProperties();
      this.childContainer.getSuggestContainer(this.releaseDevice);
    } else {
      this.clearContainerID();
      this.configContainerProperties();
      this.childContainer.getSuggestContainer(this.releaseDevice);
    }
  }

  // validateContainer and sending updated device to child conatiner
  validateContainer(response) {
    if (response.ContainerID != null && response.ContainerID != undefined) {
      this.releaseDevice.ContainerID = response.ContainerID;
      this.releaseDevice.ContainerCycle = response.ContainerCycle;
    }
    this.childContainer.validateContainer(this.releaseDevice);
  }

  // input match
  checkContainer(container) {
    if (!this.appService.checkNullOrUndefined(container)) {
      this.isSaveDisabled = false;
      this.releaseDevice.ContainerID = container.ContainerID;
      this.releaseDevice.ContainerCycle = container.ContainerCycle;
    } else {
      this.isSaveDisabled = true;
    }
  }



  // validateContainer Response from child conatiner
  validateContainerResponse(response) {
    if (!this.appService.checkNullOrUndefined(response)) {
      this.releaseDevice.ContainerCycle = response.ContainerCycle;
      this.releaseDevice.ContainerID = response.ContainerID;
    }
    this.saveTransaction();
  }

  // validate container fail response
  emitValidateContainerFailResponse(response) {
    if (!this.appService.checkNullOrUndefined(response)) {
      this.releaseDevice.ContainerID = response.ContainerID;
      this.releaseDevice.ContainerCycle = response.ContainerCycle;
    }
  }


  saveTransaction() {
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, Transactions: this.listofTransactions, UIData: this.uiData, Device: this.releaseDevice, TestResultDetails: {} };
    const url = String.Join('/', this.apiConfigService.saveTransaction);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (res.Status === StatusCodes.pass && !this.appService.checkNullOrUndefined(res)) {
          this.getUpdatedDevice();
        } else if (res.Status === StatusCodes.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          this.spinner.hide();
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }

  // Updated Device
  getUpdatedDevice() {
    const requestObj = { ClientData: this.clientData, Device: this.releaseDevice, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.updateDeviceUrl);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (res.Status === StatusCodes.pass && !this.appService.checkNullOrUndefined(res)) {
          this.releaseDevice = res.Response;
          const postUrl = String.Join('/', this.apiConfigService.postCommonUpdateProcess);
          this.commonService.postUpdateProcess(postUrl, requestObj);
          this.addSerialNumberSnap();
        } else if (res.Status === StatusCodes.fail && !this.appService.checkNullOrUndefined(res)) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          this.spinner.hide();
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }

  addSerialNumberSnap() {
    const originalStep = this.releaseDevice.Step;
    this.releaseDevice.Step = this.uiData.OperationId;
    const requestObj = { ClientData: this.clientData, Device: this.releaseDevice, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.addSerialNumberSnapUrl);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (res.Status === StatusCodes.pass) {
          this.tosterMessage = res.Response;
          this.updateLottables(originalStep);
        } else if (res.Status === StatusCodes.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          this.spinner.hide();
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }




  // updateLottables
  updateLottables(originalStep) {
    this.lottableTrans = new LottableTrans();
    this.releaseDevice.Step = originalStep;
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, Device: this.releaseDevice, LottableTrans: this.lottableTrans };
    this.apiService.apiPostRequest(this.apiConfigService.updateLottables, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (res.Status === StatusCodes.pass) {
          this.refreshContainer();
        } else if (res.Status === StatusCodes.fail && !this.appService.checkNullOrUndefined(res)) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }

  // refresh container
  refreshContainer() {
    this.spinner.show();
    // settting this flag to avoid two error messages
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, Containers: this.multipleContainerList, Devices: this.contsummaryParent.deviceList };
    const url = String.Join('/', this.apiConfigService.refreshContainerUrl, this.inboundContainerId);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const result = response.body;
        this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
          // settting this flag to avoid two error messages
          if (result.Response.Quantity == 0) {
            this.snackbar.success(result.StatusMessage);
            // whirlpool
            if (!this.appService.checkNullOrUndefined(this.contsummaryParent) && this.contsummaryParent.containerSummaryPropertiesList.length == 0) {
              this.resetClear();
            } else { // verizon
              if (!this.appService.checkNullOrUndefined(this.contsummaryParent) && this.contsummaryParent.containerSummaryPropertiesList.length && !this.appService.checkNullOrUndefined(result.Response.canAllowNextContainer)) {
                const index = this.contsummaryParent.containerSummaryPropertiesList.findIndex(c => c.containerId == this.inboundContainerId);
                if (index != -1) {
                  this.contsummaryParent.containerSummaryPropertiesList.splice(index, 1);
                }
                if (this.contsummaryParent.containersList && this.contsummaryParent.containersList.length) {
                  const containerIndex = this.contsummaryParent.containersList.findIndex(c => c.ContainerID == this.inboundContainerId);
                  if (!this.appService.checkNullOrUndefined(containerIndex)) {
                    this.contsummaryParent.containersList.splice(containerIndex, 1);
                  }
                }
                if (this.contsummaryParent.containersList.length) {
                  if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
                    this.contsummaryParent.searchContainerID(this.contsummaryParent.containersList[this.contsummaryParent.containersList.length - 1].ContainerID);
                  }
                }
                if (this.contsummaryParent.containerSummaryPropertiesList.length == 0 && result.Response.canAllowNextContainer == 'N') {
                  this.resetClear();
                } else if (result.Response.canAllowNextContainer == 'N') {
                  this.clear();
                } else {
                  this.clearContainerSummary();
                  this.clear();
                  if (this.contsummaryParent.containerSummaryPropertiesList.length == 0) {
                    this.isSerialNumberDisabled = true;
                  }
                  this.masterPageService.inboundContainerFocus();
                }
              }
            }
          } else {
            if (!this.appService.checkNullOrUndefined(this.contsummaryParent) && this.contsummaryParent.containerSummaryPropertiesList.length && !this.appService.checkNullOrUndefined(result.Response.canAllowNextContainer)) {
              const index = this.contsummaryParent.containerSummaryPropertiesList.findIndex(c => c.containerId == this.inboundContainerId);
              if (index != -1) {
                this.contsummaryParent.containerSummaryPropertiesList[index].inboundProperties.Quantity = result.Response.Quantity;
              }
              if (result.Response.canAllowNextContainer == 'N') {
                this.clear();
              } else {
                this.clearContainerSummary();
                this.clear();
                this.masterPageService.inboundContainerFocus();
              }
            } else {
              if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
                this.contsummaryParent.getInboundDetails();
              }
              this.clear();
            }
          }
        } else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
          this.resetClear();
          if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
            this.contsummaryParent.rmtextchild.applySelect();
            this.contsummaryParent.rmtextchild.applyRequired(true);
          }
          this.masterPageService.inboundContainerFocus();
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }


  // reset button click
  resetClear() {
    this.isAutoPopulatedSerialNumber = false;
    this.clear(true);
    this.masterPageService.inboundContainerFocus();
    this.clearContainerSummary();
    this.masterPageService.getCategoryTest();
    if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
      this.contsummaryParent.containersList = [];
      this.contsummaryParent.deviceList = [];
      this.contsummaryParent.containerSummaryPropertiesList = [];
      this.contsummaryParent.canAllowNextContainerStatus = null;
      this.contsummaryParent.containerSummaryProperties = [];
      this.contsummaryParent.containerActualProp = null;
    }
    this.headingsobj = [];
    this.inboundProperties = null;
    this.masterPageService.disabledContainer = false;
    this.isSerialNumberDisabled = true;
    this.masterPageService.gridContainerDetails = null;
    this.uiData.OperationId = this.operationId;
  }



  clear(isReset = false) {
    this.appErrService.clearAlert();
    if (!this.isAutoPopulatedSerialNumber) {
      this.serialNumber = '';
    }
    this.showContainerMode = false;
    this.processAllDisabled = true;
    this.isClearDisabled = true;
    this.releaseDevice = new TestingDevice();
    this.inboundContainerId = '';
    this.isSerialNumberDisabled = false;
    this.clearContainerID();
    this.serailNumberFocus();
    this.clearReleaseType();
    this.masterPageService.setActiveTabValue = CommonEnum.containerDetails;
    if (!isReset) {
      this.checkContainerModeEligibility();
    }
  }

  clearReleaseType() {
    this.releaseType = '';
    this.appErrService.clearAlert();
    this.releaseOptionSelected = '';
    this.getReleaseTypeResponse = null;
    this.isAutoDisabled = true;
    this.releaseOptionsList = [];
    this.isReleaseOptionsDisabled = true;
    this.isSaveDisabled = true;
    this.isEnableDynamicButton = true;
    this.isReleaseTypeDisabled = true;
    this.nextRoutes = null;
    this.isRouteReason = null;
    this.clearRouteDetails();
  }

  clearRouteDetails() {
    this.masterPageService.nextRoutesList = [];
    this.masterPageService.isNextRoutesDisabled = true;
    this.masterPageService.routeOperationList = [];
    this.masterPageService.RouteId = '';
  }

  // Serial Number Focus

  serailNumberFocus() {
    this.appService.setFocus('serialNumber');
  }

  containerFocus() {
    this.appService.setFocus('containerInputId');
  }

  processFocus() {
    this.appService.setFocus('processId');
  }

  releaseOptionsFocus() {
    this.appService.setFocus('releaseOptions');
  }

  nextRoutesFocus() {
    this.appService.setFocus('nextRoutes');
  }

  releaseFocus() {
    this.appService.setFocus('Release');
  }

  // enabling the button and container ID
  configContainerProperties() {
    if (!this.appService.checkNullOrUndefined(this.childContainer)) {
      this.childContainer.isContainerDisabled = false;
      this.childContainer.isClearContainerDisabled = false;
    }
  }

  ngOnDestroy() {
    this.masterPageService.disabledContainer = true;
    this.resetClear()
    this.masterPageService.showUtilityIcon = false;
    if (!this.appService.checkNullOrUndefined(this.originationOperation) && this.originationOperation) {
      this.originationOperation.unsubscribe();
    }
    this.masterPageService.clearOriginationSubscription();
    // clearing the readOnlyDevice subscription methods data
    this.commonService.emitReadOnlyDeviceResponse.next(null);
    this.emitReadOnlyDeviceResponse.unsubscribe();
    if (this.dialogRef) {
      this.dialogRef.close();
    }
    this.commonService.readOnlyDevice = null;
    if (this.contsummaryParent) {
      if (this.contsummaryParent.dialogRef) {
        this.contsummaryParent.dialogRef.close();
      }
    }
    this.masterPageService.setRouteCardHeader(null);
    this.masterPageService.defaultProperties();
  }
}