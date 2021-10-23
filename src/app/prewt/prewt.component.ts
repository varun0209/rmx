import { CommonEnum } from './../enums/common.enum';
import { Component, OnInit, ViewChild, OnDestroy, Input, ElementRef } from '@angular/core';
import { MasterPageService } from '../utilities/rlcutl/master-page.service';
import { ApiConfigService } from '../utilities/rlcutl/api-config.service';
import { ApiService } from '../utilities/rlcutl/api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { AppErrorService } from '../utilities/rlcutl/app-error.service';
import { AppService } from '../utilities/rlcutl/app.service';
import { ContainerSummaryComponent } from '../framework/busctl/container-summary/container-summary.component';
import { RmtextboxComponent } from '../framework/frmctl/rmtextbox/rmtextbox.component';
import { String, StringBuilder } from 'typescript-string-operations';
import { TestingDevice } from '../models/testing/TestingDevice';
import { SerialNumberStatus } from '../enums/serialnumberStatus.enum';
import { Testing, TestingDeviceRoutes } from '../models/testing/Testing';
import { TransactionService } from '../services/transaction.service';
import { Subscription } from 'rxjs';
import { ClientData } from '../models/common/ClientData';
import { UiData } from '../models/common/UiData';
import { LottableTrans } from '../models/common/LottableTrans';
import { EngineResult } from '../models/common/EngineResult';
import { StorageData } from '../enums/storage.enum';
import { StatusCodes } from '../enums/status.enum';
import { CommonService } from '../services/common.service';
import { TraceTypes } from '../enums/traceType.enum';
import { MessageType } from '../enums/message.enum';
import { FindTraceHoldComponent } from '../framework/busctl/find-trace-hold/find-trace-hold.component';
import { checkNullorUndefined } from '../enums/nullorundefined';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-prewt',
  templateUrl: './prewt.component.html',
  styleUrls: ['./prewt.component.css']
})
export class PrewtComponent implements OnInit, OnDestroy {

  @ViewChild(ContainerSummaryComponent) contsummaryParent: ContainerSummaryComponent;
  @ViewChild(RmtextboxComponent) rmtextbox: RmtextboxComponent;
  @ViewChild('serialNumberInput') serialnumberInput: ElementRef;


  //prewt Device object
  prewt = new Testing();
  lottableTrans: LottableTrans;

  //prewt Device object
  //prewtDevice = new TestingDevice();
  isSaveDisabled = true;
  isTestsClearDisabled = true;
  serialnumberStatus = SerialNumberStatus;
  transactionsResponse: any;
  transactions = [];
  serviceTransactions: any;
  routeAttributes: any;
  headingsobj = [];
  inboundProperties: any;
  deviceRoutes = new TestingDeviceRoutes();
  @Input() containerSummaryResponse: any;
  serialNumber: any;
  operationId: string;

  message: string;

  //client Control Labels
  controlConfig: any;
  clientData = new ClientData();
  uiData = new UiData();

  emitGetTestResponse: Subscription;
  emitGetTransaction: Subscription;
  emitGetTransAtrributeValues: Subscription;
  emitReadOnlyDeviceResponse: Subscription;

  displayProp: any;
  displayPropheadingobj = [];
  displayProperites: any;

  isAutoPopulateSerialNumber = false;
  operationObj: any;

  //dynamic panel scrolling
  scrollPosition: number;
  //originaiton operation
  originationOperation: Subscription;
  deviceOrigination: string;

  //container Summary properties
  multipleContainerList: any;
  inboundContainerId: string;
  isSerialNumberValidated = false;
  storageData = StorageData;
  statusCode = StatusCodes;
  traceTypes = TraceTypes;
  validTestSerialNumberResponse: any;
  testResult: any;
  dialogRef: any;

  constructor(
    private apiService: ApiService,
    private apiConfigService: ApiConfigService,
    private spinner: NgxSpinnerService,
    private snackbar: XpoSnackBar,
    public appErrService: AppErrorService,
    public masterPageService: MasterPageService,
    public appService: AppService,
    public transactionService: TransactionService,
    public commonService: CommonService,
    private dialog: MatDialog
  ) {
    this.emitGetTestResponse = transactionService.emitGetTestResponse.subscribe(res => {
      if (!checkNullorUndefined(res)) {
        this.getTestResponse(res);
      }
    });
    this.emitGetTransaction = this.transactionService.emitGetTransaction.subscribe(res => {
      if (!checkNullorUndefined(res)) {
        this.getTransactionResponse(res);
      }
    });

    this.emitGetTransAtrributeValues = this.transactionService.emitGetTransAtrributeValues.subscribe(res => {
      if (!checkNullorUndefined(res)) {
        this.getTransAtrributeValuesResponse(res);
      }
    });
    //emitting readOnlyDevice response
    this.emitReadOnlyDeviceResponse = this.commonService.emitReadOnlyDeviceResponse.subscribe(res => {
      if (!checkNullorUndefined(res)) {
        if (!checkNullorUndefined(res.Status) && res.Status == this.statusCode.pass) {
          this.validTestSerialNumber();
        } else if (!checkNullorUndefined(res.Status) && res.Status == this.statusCode.fail) {
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
      this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
      this.masterPageService.setTitle(this.operationObj.Title);
      this.masterPageService.setModule(this.operationObj.Module);
      this.controlConfig = JSON.parse(localStorage.getItem(this.storageData.controlConfig));
      this.message = this.appService.getErrorText('2660048');
      this.originationOperation = this.masterPageService.originationOperation.subscribe(val => {
        this.deviceOrigination = val;
      });
    }
  }

  //containerSummaryProperties
  containerSummaryProperties(event: any) {
    this.headingsobj = [];
    this.headingsobj = Object.keys(event);
    this.inboundProperties = event;
  }

  //operationId
  setCurrentOperationId(operationId) {
    this.uiData.OperationId = operationId;
  }


  getContainerList(event) {
    this.multipleContainerList = event;
  }

  getAutoPopulatedSerailNum(event: any) {
    if (!checkNullorUndefined(event) && event != '') {
      this.serialNumber = event;
      this.isAutoPopulateSerialNumber = true;
      this.validateTestSerialNumber(this.serialNumber, this.serialnumberInput);
      this.masterPageService.disabledSerialNumber = true;
      this.isTestsClearDisabled = false;
    } else {
      if (this.serialNumber && this.isSerialNumberValidated) {
        this.masterPageService.disabledSerialNumber = true;
      } else {
        this.masterPageService.disabledSerialNumber = false;
        this.serailNumberFocus();
      }
      this.isTestsClearDisabled = false;
      this.spinner.hide();
    }
  }

  //Clear Container Summary
  clearContainerSummary() {
    if (!checkNullorUndefined(this.contsummaryParent)) {
      let container = this.contsummaryParent;
      container.inbContainerDisabled = false;
      container.rmtextchild.value = "";
      container.isClearDisabled = true;
      // container.inboundProperties = null;
    }
  }

  //ValidateTestSerialNumber
  validateTestSerialNumber(serialNumber, inpcontrol: any) {
    if (serialNumber != "") {
      this.prewt.Device = new TestingDevice();
      if (!checkNullorUndefined(this.deviceOrigination) && this.deviceOrigination != '') {
        this.prewt.Device.Origination = this.deviceOrigination;
      }
      this.spinner.show();
      this.isTestsClearDisabled = false;
      this.prewt.Device.SerialNumber = serialNumber;
      localStorage.setItem(this.storageData.testSerialNumber, this.prewt.Device.SerialNumber);
      this.prewt.Device.Clientid = localStorage.getItem(this.storageData.clientId);
      let requestObj = { ClientData: this.clientData, UIData: this.uiData, Containers: this.multipleContainerList };
      const url = String.Join("/", this.apiConfigService.validateTestSerialNumberUrl, this.prewt.Device.SerialNumber, this.masterPageService.categoryName);
      this.apiService.apiPostRequest(url, requestObj)
        .subscribe(response => {
          let result = response.body;
          if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) {
            this.validTestSerialNumberResponse = response.body;
            let traceData = { traceType: this.traceTypes.serialNumber, traceValue: this.validTestSerialNumberResponse.Response.SerialNumber, uiData: this.uiData }
            let traceResult = this.commonService.findTraceHold(traceData, this.uiData);
            traceResult.subscribe(result => {
              if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) {
                if (checkNullorUndefined(result.Response)) {
                  this.commonService.getReadOnlyDeviceDetails(this.validTestSerialNumberResponse.Response.SerialNumber, this.uiData);
                } else {
                  this.canProceed(result, this.traceTypes.serialNumber)
                }
                this.spinner.hide();
              } else if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) {
                this.spinner.hide();
                this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
              }
            });
          }
          else if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) {
            this.spinner.hide();
            this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
            this.masterPageService.disabledSerialNumber = false;
            inpcontrol.applyRequired(true);
            inpcontrol.applySelect();
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

  validTestSerialNumber(result = this.validTestSerialNumberResponse) {
    this.prewt.Device = result.Response;
    //enabling/disable serial number for multi container process
    this.isSerialNumberValidated = true;
    //inboundContainerid its storing for sending request of current inbound container id
    this.inboundContainerId = this.prewt.Device.ContainerID;
    if (!checkNullorUndefined(this.contsummaryParent)) {
      this.contsummaryParent.searchContainerID(this.prewt.Device.ContainerID);
    }
    this.transactionService.getTest(this.prewt.Device, this.uiData)
    this.validTestSerialNumberResponse = null;
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
            if (type == this.traceTypes.serialNumber) {
              this.commonService.getReadOnlyDeviceDetails(this.validTestSerialNumberResponse.Response.SerialNumber, this.uiData);
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
    this.spinner.hide();
  }

  //getTest Response 
  getTestResponse(res) {
    if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
      this.masterPageService.operCategoryTests = res.Response.OperTransactions.Trans;
      if (!checkNullorUndefined(res.Response.OperTransactions.Trans)) {
        this.displayProp = res.Response.OperTransactions.Trans[0].DisplayProps;
        // this.operationId = res.Response.OperTransactions.Trans[0].OperationId;
      }
      this.displayPropheadingobj = [];
      this.displayPropheadingobj = Object.keys(this.displayProp);
      this.displayProperites = this.displayProp;
      this.prewt.Device = res.Response.Device;
      this.testResult = res.Response.TestResult;
      this.masterPageService.operCategoryTests.forEach((item, i) => {
        this.transactionService.getTransaction(item, i, this.uiData, null, null);
      })
      this.masterPageService.disabledSerialNumber = true;
      this.isSaveDisabled = false;
      this.serailNumberonBlur();
      this.appErrService.setAlert("", false);
    } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
      this.rmtextbox.applyRequired(true);
      this.rmtextbox.applySelect();
      this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
    }
  }

  //Serial Number Focus
  serailNumberFocus() {
    let inputSerialNumber = <HTMLInputElement>document.getElementById('serialNumber');
    if (inputSerialNumber) {
      inputSerialNumber.focus();

    }
  }

  serailNumberonBlur() {
    let inputSerialNumber = <HTMLInputElement>document.getElementById('serialNumber');
    if (inputSerialNumber) {
      inputSerialNumber.blur();

    }
  }
  changeInput() {
    this.isTestsClearDisabled = false;
    this.appErrService.clearAlert();
  }

  //getTransactionResponse
  getTransactionResponse(res) {
    this.transactionsResponse = res.Response.TestTransactions;
    this.transactions = res.Response.TestTransactions.Trans;
    let resultControlId = '';
    this.isSaveDisabled = false;
    if (!checkNullorUndefined(this.transactions)) {
      this.transactions.forEach((element) => {
        element.TransControls.forEach((el) => {
          if (el.Focus == true) {
            if (el.Disable == false) {
              resultControlId = el.ControlId;
              const elementId = this.appService.getElementId(resultControlId, element.TransId);
              this.appService.setFocus(elementId);
            }
          }
        });
      });
    }
  }
  //get attribute values for IVC 
  getTransAtrributeValues(transaction, event, rowIndex, parentItem, parentIndex) {
    this.scrollPosition = 0;
    this.prewt.TestTransactions = this.transactionsResponse;
    this.scrollPosition = this.appService.getScrollPosition();
    this.transactionService.getTransAtrributeValues(transaction, event, rowIndex, parentItem, parentIndex, this.prewt, this.uiData, this.scrollPosition)
  }

  //getTransAtrributeValuesResponse
  getTransAtrributeValuesResponse(res) {
    this.transactionsResponse = res.Response;
    this.transactions = res.Response.Trans;
    let resultControlId = '';
    if (!checkNullorUndefined(this.transactions)) {
      this.transactions.forEach((element) => {
        element.TransControls.forEach((el) => {
          if (el.Focus == true) {
            if (el.Disable == false) {
              resultControlId = el.ControlId;
              const elementId = this.appService.getElementId(resultControlId, element.TransId);
              this.appService.setFocus(elementId);
            }
          }
        });
      });
    }
    this.isSaveDisabled = false;
  }

  //manual process test
  showManualProcessTest() {
    // this.prewt.Device = this.prewtDevice;
    this.spinner.show();
    let requestObj = { ClientData: this.clientData, Device: this.prewt.Device, TestTransactions: this.transactionsResponse, UIData: this.uiData };
    const url = String.Join("/", this.apiConfigService.manualProcessTestUrl)
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let result = response.body;
        if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) {
          this.serviceTransactions = result.Response.ServiceTransactions;
          this.routeAttributes = result.Response.RouteAttributes;
          this.prewt.Device = result.Response.Device;
          if(result.StatusMessage){
            this.snackbar.success(result.StatusMessage);
          }
          this.masterPageService.inboundContainerFocus();
          this.masterPageService.getCategoryTest();
          this.loadProgramValues(this.prewt.Device)
        }
        else if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) {
          this.spinner.hide();
          this.setSaveValue(false);
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }

      },
        error => {
          this.appErrService.handleAppError(error);
        });

  }


  //load Program Values
  loadProgramValues(device) {
    this.spinner.show();
    let programName = device.ProgramName;
    let requestObj = { ClientData: this.clientData, Device: device, UIData: this.uiData };
    const url = String.Join("/", this.apiConfigService.loadProgramValuesurl, programName);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let res = response.body;
        if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
          this.prewt.Device = res.Response;
          this.getroute(this.prewt.Device, this.routeAttributes);
        }
        else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
          this.setSaveValue(false);
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          this.spinner.hide();
        }
      },
        error => {
          this.appErrService.handleAppError(error);
          this.spinner.hide();
        });

  }

  //getRoute
  getroute(device, routeAttributes) {
    this.spinner.show();
    this.deviceRoutes.Device = device;
    this.deviceRoutes.RouteAttributes = routeAttributes;
    let requestObj = { ClientData: this.clientData, RouteRequest: this.deviceRoutes, UIData: this.uiData };
    const url = String.Join("/", this.apiConfigService.getTestRouteUrl);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let res = response.body;
        if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
          this.prewt.Device = res.Response;
          this.saveTransaction(this.serviceTransactions);
        }
        else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          this.setSaveValue(false);
          this.spinner.hide();
        }
      },
        error => {
          this.appErrService.handleAppError(error);
          this.spinner.hide();
        });

  }

  //SaveTransactions
  saveTransaction(serviceSaveTransactios) {
    this.spinner.show();
    let requestObj = { ClientData: this.clientData, Transactions: serviceSaveTransactios, UIData: this.uiData, Device: this.prewt.Device, TestResultDetails: {} }
    const url = String.Join("/", this.apiConfigService.saveTransaction);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let res = response.body;
        if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
          this.saveSerialNumberTestResult(this.prewt.Device);
        }
        else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
          this.setSaveValue(false);
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          this.spinner.hide();
        }
      },
        error => {
          this.appErrService.handleAppError(error);
          this.spinner.hide();
        });
  }

  saveSerialNumberTestResult(device) {
    let requestObj = { ClientData: this.clientData, Device: device, RouteAttributes: this.deviceRoutes.RouteAttributes, UIData: this.uiData }
    const url = String.Join("/", this.apiConfigService.saveSerialNumberTestResultUrl);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let res = response.body;
        if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
          this.testResult = res.Response;
          this.getUpdatedDevice(this.prewt.Device);
        }
        else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          this.setSaveValue(false);
          this.spinner.hide();
        }
      },
        error => {
          this.appErrService.handleAppError(error);
          this.spinner.hide();
        });
  }
  //Updated Device
  getUpdatedDevice(updatedDevice) {
    let result = this.commonService.validateReadOnlyDeviceDetails(this.uiData, this.testResult);
    result.subscribe(response => {
      if (!checkNullorUndefined(response) && response.Status === this.statusCode.pass) {
        let requestObj = { ClientData: this.clientData, Device: updatedDevice, UIData: this.uiData };
        const url = String.Join("/", this.apiConfigService.updateDeviceUrl);
        this.apiService.apiPostRequest(url, requestObj)
          .subscribe(response => {
            let res = response.body;
            if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
              this.prewt.Device = res.Response;
              const postUrl = String.Join('/', this.apiConfigService.postCommonUpdateProcess);
              this.commonService.postUpdateProcess(postUrl, requestObj);
              this.addSerialNumberSnap(this.prewt.Device);
            }
            else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
              this.setSaveValue(false);
              this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
              this.spinner.hide();
            }
          },
            error => {
              this.appErrService.handleAppError(error);
              this.spinner.hide();
            });
      }
      else if (!checkNullorUndefined(response) && response.Status === this.statusCode.fail) {
        this.spinner.hide();
        this.resetClear();
        this.appErrService.setAlert(response.ErrorMessage.ErrorDetails, true);
      }
    })


  }

  //addSerialNumberSnap
  addSerialNumberSnap(device) {
    this.spinner.show();
    let requestObj = { ClientData: this.clientData, Device: device, UIData: this.uiData };
    const url = String.Join("/", this.apiConfigService.addSerialNumberSnapUrl);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let res = response.body;
        if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
          this.displayProperites = null;
          this.masterPageService.getCategoryTest();
          this.refreshContainer();
          this.updateLottables();
        }
        else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
          this.setSaveValue(false);
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          this.spinner.hide();
        }
      },
        error => {
          this.appErrService.handleAppError(error);
          this.spinner.hide();
        });
  }

  //refreshContainer
  refreshContainer() {
    this.spinner.show();
    let requestObj = { ClientData: this.clientData, UIData: this.uiData, Containers: this.multipleContainerList, Devices: this.contsummaryParent.deviceList };
    const url = String.Join("/", this.apiConfigService.refreshContainerUrl, this.inboundContainerId);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let result = response.body;
        this.spinner.hide();
        this.isSerialNumberValidated = false;
        if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) {
          if (result.Response.Quantity == 0) {
            this.snackbar.success(result.StatusMessage);
            //whirlpool
            if (!checkNullorUndefined(this.contsummaryParent) && this.contsummaryParent.containerSummaryPropertiesList.length == 0) {
              this.resetClear();
            } else {
              if (!checkNullorUndefined(this.contsummaryParent) && this.contsummaryParent.containerSummaryPropertiesList.length && !checkNullorUndefined(result.Response.canAllowNextContainer)) {
                let index = this.contsummaryParent.containerSummaryPropertiesList.findIndex(c => c.containerId == this.inboundContainerId);
                if (index != -1) {
                  this.contsummaryParent.containerSummaryPropertiesList.splice(index, 1);
                }
                if (this.contsummaryParent.containersList && this.contsummaryParent.containersList.length) {
                  let containerIndex = this.contsummaryParent.containersList.findIndex(c => c.ContainerID == this.inboundContainerId);
                  if (!checkNullorUndefined(containerIndex)) {
                    this.contsummaryParent.containersList.splice(containerIndex, 1);
                  }
                }
                if (this.contsummaryParent.containersList.length) {
                  if (!checkNullorUndefined(this.contsummaryParent)) {
                    this.contsummaryParent.searchContainerID(this.contsummaryParent.containersList[this.contsummaryParent.containersList.length - 1].ContainerID);
                  }
                }
                if (this.contsummaryParent.containerSummaryPropertiesList.length == 0 && result.Response.canAllowNextContainer == 'N') {
                  this.resetClear();
                }
                else if (result.Response.canAllowNextContainer == 'N') {
                  this.serialNumberClear();
                } else {
                  this.clearContainerSummary();
                  this.serialNumberClear();
                  if (this.contsummaryParent.containerSummaryPropertiesList.length == 0) {
                    this.masterPageService.disabledSerialNumber = true;
                    this.masterPageService.inboundContainerFocus();
                  }
                }
              }
            }
          } else {
            if (!checkNullorUndefined(this.contsummaryParent) && this.contsummaryParent.containerSummaryPropertiesList.length && !checkNullorUndefined(result.Response.canAllowNextContainer)) {
              let index = this.contsummaryParent.containerSummaryPropertiesList.findIndex(c => c.containerId == this.inboundContainerId);
              if (index != -1) {
                this.contsummaryParent.containerSummaryPropertiesList[index].inboundProperties.Quantity = result.Response.Quantity;
              }
              if (result.Response.canAllowNextContainer == CommonEnum.yes) {
                this.clearContainerSummary();
              }
            } else {
              if (!checkNullorUndefined(this.contsummaryParent)) {
                this.contsummaryParent.getInboundDetails();
              }
            }
            this.serialNumberClear();
          }
        }
        else if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) {
          this.resetClear();
          this.isTestsClearDisabled = true;
          if (!checkNullorUndefined(this.contsummaryParent)) {
            if (!checkNullorUndefined(this.contsummaryParent.rmtextchild)) {
              this.contsummaryParent.inbContainerDisabled = false;
            }
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

  saveSerialNum() {
    if (!checkNullorUndefined(this.prewt.Device)) {
      this.setSaveValue(true);
      this.showManualProcessTest();
    }
  }


  //updateLottables 
  updateLottables() {
    this.lottableTrans = new LottableTrans();
    let requestObj = { ClientData: this.clientData, UIData: this.uiData, Device: this.prewt.Device, LottableTrans: this.lottableTrans };
    this.apiService.apiPostRequest(this.apiConfigService.updateLottables, requestObj)
      .subscribe(response => {
        let res = response.body;
        if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }



  setSaveValue(val) {
    this.isSaveDisabled = val;
  }


  //reset button click
  resetClear() {
    this.masterPageService.getCategoryTest();
    this.clearContainerSummary();
    this.masterPageService.inboundContainerFocus();
    this.serialNumber = "";
    this.masterPageService.disabledSerialNumber = true;
    this.inboundProperties = [];
    this.headingsobj = [];
    this.displayPropheadingobj = [];
    this.displayProperites = null;
    this.transactionService.transactions = [];
    this.transactionService.isAutoDisabled = true;
    this.transactionService.isManualDisabled = true;
    this.masterPageService.operationDisabled = false;
    this.isTestsClearDisabled = true;
    this.appErrService.clearAlert();
    this.appErrService.setAlert("", false);
    this.isSaveDisabled = true;
    this.isAutoPopulateSerialNumber = false;
    if (!checkNullorUndefined(this.contsummaryParent)) {
      this.contsummaryParent.containersList = [];
      this.contsummaryParent.deviceList = [];
      this.contsummaryParent.containerSummaryPropertiesList = [];
      this.contsummaryParent.canAllowNextContainerStatus = null;
      this.contsummaryParent.containerSummaryProperties = [];
      this.contsummaryParent.containerActualProp = null;
    }
    this.multipleContainerList = null;
    this.inboundContainerId = "";
    this.isSerialNumberValidated = false;
    this.uiData.OperationId = this.operationId;
  }
  //clear button
  serialNumberClear() {
    this.masterPageService.getCategoryTest();
    this.serailNumberFocus();
    this.masterPageService.disabledSerialNumber = false;
    this.masterPageService.operationDisabled = false;
    this.isSaveDisabled = true;
    this.transactionService.transactions = [];
    this.isTestsClearDisabled = true;
    this.appErrService.clearAlert();
    this.displayPropheadingobj = [];
    this.displayProperites = null;
    if (!this.isAutoPopulateSerialNumber) {
      this.serialNumber = "";
    }
    this.inboundContainerId = "";
    this.isSerialNumberValidated = false;
  }

  ngOnDestroy() {
    this.masterPageService.categoryName = null;
    this.masterPageService.disabledContainer = true;
    this.masterPageService.operation = "";
    this.masterPageService.operationList = [];
    this.masterPageService.operationDisabled = false;
    this.masterPageService.operationsdropdown = [];
    this.masterPageService.operCategoryTests = [];
    this.masterPageService.setDropDown(false);
    this.masterPageService.clearModule();
    this.appErrService.clearAlert();
    this.transactionService.transactions = [];
    this.transactionService.transactionsResponse = [];
    this.transactionsResponse = [];
    this.transactions = [];
    this.emitGetTestResponse.unsubscribe();
    this.emitGetTransaction.unsubscribe();
    this.emitGetTransAtrributeValues.unsubscribe();
    //clearing the readOnlyDevice subscription methods data
    this.commonService.emitReadOnlyDeviceResponse.next(null);
    this.emitReadOnlyDeviceResponse.unsubscribe();
    this.transactionService.clearSubscription();
    // localStorage.removeItem("operationObj");
    if (this.contsummaryParent) {
      if (this.contsummaryParent.dialogRef) {
        this.contsummaryParent.dialogRef.close();
      }
    }
    this.masterPageService.moduleName.next(null);
    if (!checkNullorUndefined(this.originationOperation) && this.originationOperation) {
      this.originationOperation.unsubscribe();
    }
    this.masterPageService.clearOriginationSubscription();
    if (this.masterPageService.hideControls.controlProperties) {
      this.masterPageService.hideControls.controlProperties = new EngineResult();
    }
    this.commonService.readOnlyDevice = null;
  }

}
