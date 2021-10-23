import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { String } from 'typescript-string-operations';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppService } from './../../utilities/rlcutl/app.service';
import { MasterPageService } from './../../utilities/rlcutl/master-page.service';
import { SurveyService } from './../../services/survey.service';
import { ApiService } from './../../utilities/rlcutl/api.service';
import { AppErrorService } from './../../utilities/rlcutl/app-error.service';
import { ApiConfigService } from './../../utilities/rlcutl/api-config.service';
import { Testing, TestingDeviceRoutes } from '../../models/testing/Testing';
import { TestingDevice } from './../../models/testing/TestingDevice';
import { CommonService } from './../../services/common.service';
import { ImageProcessComponent } from './../../framework/frmctl/image-process/image-process.component';
import { FindTraceHoldComponent } from './../../framework/busctl/find-trace-hold/find-trace-hold.component';
import { ContainerSuggestionComponent } from './../../framework/busctl/container-suggestion/container-suggestion.component';
import { ContainerSummaryComponent } from './../../framework/busctl/container-summary/container-summary.component';
import { Grid } from './../../models/common/Grid';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { LottableTrans } from './../../models/common/LottableTrans';
import { CommonEnum } from './../../enums/common.enum';
import { Container } from './../../models/common/Container';
import { ClientData } from './../../models/common/ClientData';
import { UiData } from './../../models/common/UiData';
import { StatusCodes } from './../../enums/status.enum';
import { TraceTypes } from './../../enums/traceType.enum';
import { StorageData } from './../../enums/storage.enum';
import { MessageType } from './../../enums/message.enum';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-qualification',
  templateUrl: './qualification.component.html',
  styleUrls: ['./qualification.component.css']
})
export class QualificationComponent implements OnInit, OnDestroy {

  @ViewChild('serialNumberInput') serialnumberInput: ElementRef;
  @ViewChild(ContainerSummaryComponent) contsummaryParent: ContainerSummaryComponent;
  @ViewChild(ContainerSuggestionComponent) childContainer: ContainerSuggestionComponent;

  // variables
  inbContainerID: string;
  serialNumber: string;
  inboundProperties: any;
  inbContainerResponse: any;
  multipleContainerList: any;
  inboundContainerId: string;
  suggestedContainerID: string;
  validTestSerialNumberResponse: any;
  surveyResponse: any;
  surveyTransactions: any;
  routeAttributes: any;
  testResult: any;
  operationObj: any;
  appConfig: any;
  controlConfig: any;
  message: string;
  headingsobj = [];
  processQueData = []; // container details
  isSaveDisabled = true;
  isSurveyClearDisabled = true;
  isAutoPopulatedSerialNumber = false;
  isSerialNumberValidated = false;



  // objects
  clientData = new ClientData();
  uiData = new UiData();
  grid: Grid;
  container = new Container();
  // deviceObj = new TestingDevice();
  surveyDevice = new Testing();
  readOnlySurveyDevice = new Testing();
  deviceRoutes = new TestingDeviceRoutes();
  lottableTrans: LottableTrans;

  emitReadOnlyDeviceResponse: Subscription;
  emitDoneSurveyResponse: Subscription;
  emitSurveyResult: Subscription;
  operationId: any;
  dialogRef: any;

  constructor(
    private appService: AppService,
    public appErrService: AppErrorService,
    public masterPageService: MasterPageService,
    private spinner: NgxSpinnerService,
    private apiConfigService: ApiConfigService,
    private commonService: CommonService,
    public surveyService: SurveyService,
    private snackbar: XpoSnackBar,
    private apiService: ApiService,
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
    // emited survey result on serialnumber scan
    this.emitSurveyResult = this.surveyService.surveyResult.subscribe(surveyResponse => {
      if (!this.appService.checkNullOrUndefined(surveyResponse)) {
        this.getSurveyResponse(surveyResponse);
      }

    });
    // emitDoneManualTransaction response
    this.emitDoneSurveyResponse = this.surveyService.doneSurveyResponse.subscribe(doneResponse => {
      if (!this.appService.checkNullOrUndefined(doneResponse)) {
        this.getCompletedSurveyResponse(doneResponse);
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
      this.message = this.appService.getErrorText('2660048');
      // this.originationOperation = this.masterPageService.originationOperation.subscribe(val => {
      //   this.deviceOrigination = val;
      // });
    }
  }

  //operationId
  setCurrentOperationId(operationId) {
    this.uiData.OperationId = operationId;
  }

  getContainerSummaryResponse(response) {
    this.inbContainerResponse = response;
  }

  containerSummaryProperties(event) {
    this.headingsobj = [];
    this.headingsobj = Object.keys(event);
    this.inboundProperties = event;
  }

  getinbContainerID(inbcontid) {
    this.inbContainerID = inbcontid;
  }

  getContainerList(event) {
    this.multipleContainerList = event;
  }

  getAutoPopulatedSerailNum(event: any) {
    if (!this.appService.checkNullOrUndefined(event) && event !== '') {
      this.isAutoPopulatedSerialNumber = true;
      this.serialNumber = event;
      this.masterPageService.disabledSerialNumber = true;
      this.isSurveyClearDisabled = false;
      this.validateTestSerialNumber(this.serialNumber, this.serialnumberInput);
    } else {
      if (this.serialNumber && this.isSerialNumberValidated) {
        this.masterPageService.disabledSerialNumber = true;
      } else {
        this.masterPageService.disabledSerialNumber = false;
        this.serailNumberFocus();
      }
      this.isSurveyClearDisabled = false;
      this.spinner.hide();
    }
  }

  // validateTestSerialNumber
  validateTestSerialNumber(serialNumber, inpcontrol: any) {
    if (serialNumber !== '') {
      // this.grading.Device = new TestingDevice();
      // if(!this.appService.checkNullOrUndefined(this.deviceOrigination) && this.deviceOrigination!=''){
      //     this.grading.Device.Origination = this.deviceOrigination;
      // }
      this.surveyDevice.Device = new TestingDevice();
      this.appErrService.clearAlert();
      this.spinner.show();
      this.isSurveyClearDisabled = false;
      this.surveyDevice.Device.SerialNumber = serialNumber;
      localStorage.setItem(StorageData.testSerialNumber, this.surveyDevice.Device.SerialNumber);
      this.surveyDevice.Device.Clientid = this.clientData.ClientId;
      const requestObj = { ClientData: this.clientData, UIData: this.uiData, Containers: this.multipleContainerList };
      const url = String.Join('/', this.apiConfigService.validateTestSerialNumberUrl, this.surveyDevice.Device.SerialNumber, this.masterPageService.categoryName);
      this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
        if (statusFlag) {
          this.validTestSerialNumberResponse = res.Response;
          const traceData = { traceType: TraceTypes.serialNumber, traceValue: this.validTestSerialNumberResponse.SerialNumber, uiData: this.uiData };
          const traceResult = this.commonService.findTraceHold(traceData, this.uiData);
          traceResult.subscribe(result => {
            if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
              if (this.appService.checkNullOrUndefined(result.Response)) {
                this.commonService.getReadOnlyDeviceDetails(this.validTestSerialNumberResponse.SerialNumber, this.uiData);
              } else {
                this.canProceed(result, TraceTypes.serialNumber);
              }
            } else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
              this.spinner.hide();
              this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
            }
          });
        } else {
          this.masterPageService.disabledSerialNumber = false;
          inpcontrol.applyRequired(true);
          inpcontrol.applySelect();
        }
      });

    } else {
      this.appErrService.setAlert(this.message, true);
    }
  }

  validTestSerialNumber(result = this.validTestSerialNumberResponse) {
    if (result) {
      this.surveyDevice.Device = result;
      this.readOnlySurveyDevice.Device = result;
      // enabling/disable serial number for multi container process
      this.isSerialNumberValidated = true;
      this.masterPageService.disabledSerialNumber = true;
      // inboundContainerid its storing for sending request of current inbound container id
      this.inboundContainerId = this.surveyDevice.Device.ContainerID;
      if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
        this.contsummaryParent.searchContainerID(this.surveyDevice.Device.ContainerID);
      }
      const requestObj = { ClientData: this.clientData, Device: this.surveyDevice.Device, UIData: this.uiData };
      this.surveyService.getSurvey(requestObj);
      this.validTestSerialNumberResponse = null;
    }
  }

  canProceed(traceResponse, type) {
    if (traceResponse.Response.canProceed === CommonEnum.yes) {
      this.appErrService.setAlert(traceResponse.StatusMessage, true, MessageType.info);
    }
    if (!this.appService.checkNullOrUndefined(traceResponse.Response.TraceHold)) {
      const uiObj = { uiData: this.uiData };
      traceResponse = Object.assign(traceResponse, uiObj);
      this.dialogRef = this.dialog.open(FindTraceHoldComponent, { hasBackdrop: true, disableClose: true, panelClass: 'dialog-width-sm', data: { modalData: traceResponse } });
      this.dialogRef.afterClosed().subscribe((returnedData) => {
        if (returnedData) {
        if (returnedData.Response.canProceed === CommonEnum.yes) {
          if (type === TraceTypes.serialNumber) {
            this.commonService.getReadOnlyDeviceDetails(this.validTestSerialNumberResponse.Response.SerialNumber, this.uiData);
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

  // on updated questions with and
  getRefreshedSurvey(event) {
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, SurveyTransactions: event.SurveyResponse, UIData: this.uiData, Device: this.surveyDevice.Device };
    this.surveyService.getRefreshedSurvey(requestObj);
  }

  // on survey completion
  doneSurvey(event) {
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, SurveyTransactions: event, UIData: this.uiData, Device: this.surveyDevice.Device };
    this.surveyService.sendSurveyInfo(requestObj);
  }

  // on resurvey event
  reSurvey() {
    this.spinner.show();
    if (this.masterPageService.hideControls.controlProperties.containerSuggestion === undefined) {
      this.clearContainerID();
    }
    this.surveyDevice.Device = this.readOnlySurveyDevice.Device;
    const requestObj = { ClientData: this.clientData, Device: this.surveyDevice.Device, UIData: this.uiData };
    this.surveyService.getReSurvey(requestObj);
  }

  // emitted survey response on serial number scan
  getSurveyResponse(res) {
    if (res.Status === StatusCodes.pass) {
      if (!this.appService.checkNullOrUndefined(res.Response)) {
        this.surveyDevice.Device = res.Response.Device;
        this.surveyResponse = res.Response.SurveyTransactions;
        this.testResult= res.Response.TestResult;
        if (this.surveyResponse.SurveyTrans.length > 0) {
          this.surveyService.showSurvey = true;
        }
        this.enableContainerSuggestion();
      }
    }
  }

  // getdoneManualTransactionResponse
  getCompletedSurveyResponse(response) {
    if (!this.appService.checkNullOrUndefined(response)) {
      this.getManualManualProcessSurvey(response);
    }
  }



  //#region container suggestion(outbound container)
  getSuggestContainer(value) {
    this.containerFocus();
    if (this.appService.checkNullOrUndefined(value)) {
      this.configContainerProperties();
      this.childContainer.getSuggestContainer(this.surveyDevice.Device);
    } else {
      this.clearContainerID();
      this.configContainerProperties();
      this.childContainer.getSuggestContainer(this.surveyDevice.Device);
    }
  }

  // validateContainer and sending updated device to child conatiner
  validateContainer(response) {
    if (response.ContainerID != null && response.ContainerID !== undefined) {
      this.surveyDevice.Device.ContainerID = response.ContainerID;
      this.surveyDevice.Device.ContainerCycle = response.ContainerCycle;
    }
    this.childContainer.validateContainer(this.surveyDevice.Device);
  }

  getContainerId(containerid) {
    this.suggestedContainerID = containerid;
  }

  // input match
  checkContainer(container) {
    if (!this.appService.checkNullOrUndefined(container)) {
      this.isSaveDisabled = false;
      this.surveyDevice.Device.ContainerID = container.ContainerID;
      this.surveyDevice.Device.ContainerCycle = container.ContainerCycle;
    } else {
      this.isSaveDisabled = true;
    }
  }

  // validateConta iner Response from child conatiner
  validateContainerResponse(response) {
    if (!this.appService.checkNullOrUndefined(response)) {
      this.container = response;
      this.isSaveDisabled = true;
      this.surveyDevice.Device.ContainerCycle = response.ContainerCycle;
      this.surveyDevice.Device.ContainerID = response.ContainerID;
      this.saveSerialNum();
    } else {
      this.saveSerialNum();
    }
  }

  // validate container fail response
  emitValidateContainerFailResponse(response) {
    if (!this.appService.checkNullOrUndefined(response)) {
      this.surveyDevice.Device.ContainerID = response.ContainerID;
      this.surveyDevice.Device.ContainerCycle = response.ContainerCycle;
    }
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

  // showing container details on inbound container
  getQueuedTestSerialNumbers() {
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, Containers: this.multipleContainerList };
    this.commonService.commonApiCall(this.apiConfigService.getQueuedTestSerialNumbers, requestObj, (res, statusFlag) => {
      const result = res;
      if (statusFlag) {
        this.onProcessQueGenerateJsonGrid(res.Response);
        this.grid = new Grid();
        this.grid.ItemsPerPage = this.appConfig.testing.griditemsPerPage;
        this.masterPageService.gridContainerDetails = this.appService.onGenerateJson(this.processQueData, this.grid);
      }
    });
  }
  //#endregion container suggestion(outbound container)

  //#region  regular api mthods load Program Values, getRoute
  getManualManualProcessSurvey(response) {
    this.surveyResponse = response.SurveyTransactions;
    this.surveyDevice.Device = response.Device;
    this.surveyDevice.TestResultDetails = response.TestResultDetails;
    const requestObj = { ClientData: this.clientData, Device: this.surveyDevice.Device, UIData: this.uiData, SurveyTransactions: this.surveyResponse };
    this.commonService.commonApiCall(this.apiConfigService.manualProcessSurveyUrl, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        // this.spinner.hide();
        const result = res.Response;
        this.surveyDevice.Device = result.Device;
        this.surveyTransactions = result.ServiceTransactions;
        this.routeAttributes = result.RouteAttributes;
        // this.surveyDevice.TestResultDetails = result.TestResultDetails;
        this.loadProgramValues(this.surveyDevice.Device);
        if (this.surveyDevice.Device.hasOwnProperty('AutoFail') && this.surveyDevice.Device.AutoFail && this.surveyDevice.Device.AutoFail.hasOwnProperty('AutoFailMessage') && this.surveyDevice.Device.AutoFail.AutoFailMessage) {
          this.snackbar.info(this.surveyDevice.Device.AutoFail.AutoFailMessage);
        }
      }
    });
  }


  loadProgramValues(device) {
    const programName = device.ProgramName;
    const requestObj = { ClientData: this.clientData, Device: device, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.loadProgramValuesurl, programName);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.surveyDevice.Device = res.Response;
        // this.getroute(this.surveyDevice.Device, this.routeAttributes);
        this.getroute(this.surveyDevice.Device);
      }
    });
  }

  // getRoute
  getroute(device) {
    // this.deviceRoutes.Device = device;
    // this.deviceRoutes.RouteAttributes = routeAttributes;
    const requestObj = { ClientData: this.clientData, Device: device, UIData: this.uiData };
    this.commonService.commonApiCall(this.apiConfigService.getRouteUrl, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.surveyDevice.Device = res.Response;
        this.saveTransaction(this.surveyTransactions);
      }
    });
  }

  // SaveTransactions
  saveTransaction(serviceSaveTransactions) {
    const requestObj = { ClientData: this.clientData, Transactions: serviceSaveTransactions, UIData: this.uiData, Device: this.surveyDevice.Device, TestResultDetails: this.surveyDevice.TestResultDetails };
    this.commonService.commonApiCall(this.apiConfigService.saveTransaction, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.saveSerialNumberTestResult(this.surveyDevice.Device);

      }
    });
  }

  // saveSerialNumberTestResult
  saveSerialNumberTestResult(device) {
    this.deviceRoutes.RouteAttributes = this.routeAttributes;
    const requestObj = { ClientData: this.clientData, Device: device, RouteAttributes: this.deviceRoutes.RouteAttributes, UIData: this.uiData };
    this.commonService.commonApiCall(this.apiConfigService.saveSurveySerialNumberTestResultUrl, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.spinner.hide();
        this.testResult = res.Response;
        this.enableContainerSuggestion();
      }
    });
  }

  // Updated Device
  getUpdatedDevice(updatedDevice) {
    const requestObj = { ClientData: this.clientData, Device: updatedDevice, UIData: this.uiData };
    this.commonService.commonApiCall(this.apiConfigService.updateDeviceUrl, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.surveyDevice.Device = res.Response;
        this.commonService.postUpdateProcess(this.apiConfigService.postCommonUpdateProcess, requestObj);
        this.addSerialNumberSnap(this.surveyDevice.Device);
      } else {
        this.setSaveValue(false);
      }
    });
  }

  // addSerialNumberSnap
  addSerialNumberSnap(device) {
    const requestObj = { ClientData: this.clientData, Device: device, UIData: this.uiData };
    this.commonService.commonApiCall(this.apiConfigService.addSerialNumberSnapUrl, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.serialNumber = '';
        if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
          this.contsummaryParent.isClearDisabled = false;
        }
        this.getQueuedTestSerialNumbers();
        this.refreshContainer();
        this.clearContainerID();
        this.updateLottables();
      } else {
        this.setSaveValue(false);
      }
    });
  }


  // refreshContainer
  refreshContainer() {
    this.spinner.show();
    // settting this flag to avoid two error messages
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, Containers: this.multipleContainerList, Devices: this.contsummaryParent.deviceList };
    const url = String.Join('/', this.apiConfigService.refreshContainerUrl, this.inboundContainerId);
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
              this.Clear();
            } else { // verizon
              if (!this.appService.checkNullOrUndefined(this.contsummaryParent) && this.contsummaryParent.containerSummaryPropertiesList.length && !this.appService.checkNullOrUndefined(result.Response.canAllowNextContainer)) {
                const index = this.contsummaryParent.containerSummaryPropertiesList.findIndex(c => c.containerId === this.inboundContainerId);
                if (index !== -1) {
                  this.contsummaryParent.containerSummaryPropertiesList.splice(index, 1);
                }
                if (this.contsummaryParent.containersList && this.contsummaryParent.containersList.length) {
                  const containerIndex = this.contsummaryParent.containersList.findIndex(c => c.ContainerID === this.inboundContainerId);
                  if (!this.appService.checkNullOrUndefined(containerIndex)) {
                    this.contsummaryParent.containersList.splice(containerIndex, 1);
                  }
                }
                if (this.contsummaryParent.containersList.length) {
                  if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
                    this.contsummaryParent.searchContainerID(this.contsummaryParent.containersList[this.contsummaryParent.containersList.length - 1].ContainerID);
                  }
                }
                if (this.contsummaryParent.containerSummaryPropertiesList.length === 0 && result.Response.canAllowNextContainer === CommonEnum.no) {
                  this.Clear();
                } else if (result.Response.canAllowNextContainer === CommonEnum.no) {
                  this.serialNumberClear();
                } else {
                  this.clearContainerSummary();
                  this.serialNumberClear();
                  if (this.contsummaryParent.containerSummaryPropertiesList.length === 0) {
                    this.masterPageService.disabledSerialNumber = true;
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
              const index = this.contsummaryParent.containerSummaryPropertiesList.findIndex(c => c.containerId === this.inboundContainerId);
              if (index !== -1) {
                this.contsummaryParent.containerSummaryPropertiesList[index].inboundProperties.Quantity = result.Response.Quantity;
              }
              if (result.Response.canAllowNextContainer === CommonEnum.yes) {
                this.clearContainerSummary();
              }
            } else {
              if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
                this.contsummaryParent.getInboundDetails();
              }
            }
            this.serialNumberClear();
          }
        } else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
          // this.Clear();
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



  updateLottables() {
    this.lottableTrans = new LottableTrans();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, Device: this.surveyDevice.Device, LottableTrans: this.lottableTrans };
    this.commonService.commonApiCall(this.apiConfigService.updateDeviceUrl, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        const result = res.Response;
      }
    });
  }

  setSaveValue(val) {
    this.isSaveDisabled = val;
  }

  //#endregion regular api mthods

  saveSerialNum() {
    this.setSaveValue(true);
    const result = this.commonService.validateReadOnlyDeviceDetails(this.uiData, this.testResult);
    result.subscribe(response => {
      if (!this.appService.checkNullOrUndefined(response) && response.Status === StatusCodes.pass) {
        if (!this.appService.checkNullOrUndefined(this.surveyDevice.Device)) {
          this.getUpdatedDevice(this.surveyDevice.Device);
        }
      } else if (!this.appService.checkNullOrUndefined(response) && response.Status === StatusCodes.fail) {
        this.spinner.hide();
        this.Clear();
        this.appErrService.setAlert(response.ErrorMessage.ErrorDetails, true);
      }
    });
  }

  // container suggestion refactor method
  enableContainerSuggestion() {
    if (this.surveyResponse.ReSurveyVisible === CommonEnum.yes) {
      if (this.masterPageService.hideControls.controlProperties.containerSuggestion === undefined) {
        this.configContainerProperties();
        this.childContainer.suggestedContainerFocus();
      } else {
        this.isSaveDisabled = false;
        this.saveFocus();
      }
    }
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

  // save button foucs
  saveFocus() {
    this.appService.setFocus('save');
  }

  // Serial Number Focus
  serailNumberFocus() {
    this.appService.setFocus('serialNumber');
  }

  // conatiner focus
  containerFocus() {
    this.appService.setFocus('containerInputId');
  }

  clearContainerSummary() {
    if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
      this.contsummaryParent.inbContainerDisabled = false;
      this.contsummaryParent.rmtextchild.value = '';
      this.contsummaryParent.quantity = '';
      this.contsummaryParent.category = '';
      this.contsummaryParent.isClearDisabled = true;
    }
  }

  serialNumberClear() {
    if (!this.isAutoPopulatedSerialNumber) {
      this.serialNumber = '';
    }
    this.masterPageService.disabledSerialNumber = false;
    this.appErrService.clearAlert();
    this.surveyService.clearSurvey();
    this.clearContainerID();
    this.isSurveyClearDisabled = true;
    this.serailNumberFocus();
  }

  Clear() {
    this.serialNumber = '';
    this.isSurveyClearDisabled = true;
    this.inboundProperties = null;
    this.isSerialNumberValidated = false;
    this.masterPageService.disabledSerialNumber = true;
    this.headingsobj = [];
    // this.surveyTransactions = null;
    // this.routeAttributes = null;
    // this.testResult = null;
    this.multipleContainerList = null;
    this.inbContainerResponse = null;
    this.surveyResponse = null;
    this.clearContainerSummary();
    this.masterPageService.inboundContainerFocus();
    if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
      this.contsummaryParent.containersList = [];
      this.contsummaryParent.deviceList = [];
      this.contsummaryParent.containerSummaryPropertiesList = [];
      this.contsummaryParent.canAllowNextContainerStatus = null;
      this.contsummaryParent.containerSummaryProperties = [];
      this.contsummaryParent.containerActualProp = null;
    }
    this.masterPageService.gridContainerDetails = null;
    this.clearContainerID();
    this.surveyService.clearSurvey();
    this.appErrService.clearAlert();
    this.uiData.OperationId = this.operationId;
  }

  ngOnDestroy() {
    this.masterPageService.gridContainerDetails = null;
    this.masterPageService.disabledSerialNumber = true;
    this.commonService.emitReadOnlyDeviceResponse.next(null);
    this.surveyService.surveyResult.next(null);
    this.surveyService.doneSurveyResponse.next(null);
    this.inbContainerResponse = null;
    this.emitSurveyResult.unsubscribe();
    this.emitDoneSurveyResponse.unsubscribe();
    if (this.dialogRef) {
      this.dialogRef.close();
    }
    this.masterPageService.defaultProperties();
    this.surveyService.clearSurvey();
    this.masterPageService.showUtilityIcon = false;
  }

}
