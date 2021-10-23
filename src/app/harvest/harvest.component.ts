import { Component, OnInit, ElementRef, ViewChild, Input, OnDestroy } from '@angular/core';
import { StorageData } from '../enums/storage.enum';
import { ClientData } from '../models/common/ClientData';
import { UiData } from '../models/common/UiData';
import { AppService } from '../utilities/rlcutl/app.service';
import { MasterPageService } from '../utilities/rlcutl/master-page.service';
import { Subscription } from 'rxjs';
import { AppErrorService } from '../utilities/rlcutl/app-error.service';
import { TransactionService } from '../services/transaction.service';
import { TestStatus } from '../enums/testStatus.enum';
import { TestBtnNames } from '../enums/test-btn-names.enum';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from '../utilities/rlcutl/api.service';
import { ApiConfigService } from '../utilities/rlcutl/api-config.service';
import { CommonService } from '../services/common.service';
import { String } from 'typescript-string-operations';
import { TraceTypes } from '../enums/traceType.enum';
import { StatusCodes } from '../enums/status.enum';
import { ContainerSummaryComponent } from '../framework/busctl/container-summary/container-summary.component';
import { RmtextboxComponent } from '../framework/frmctl/rmtextbox/rmtextbox.component';
import { ContainerSuggestionComponent } from '../framework/busctl/container-suggestion/container-suggestion.component';
import { FindTraceHoldComponent } from '../framework/busctl/find-trace-hold/find-trace-hold.component';
import { MessageType } from '../enums/message.enum';
import { Testing, TestingDeviceRoutes } from '../models/testing/Testing';
import { TestingDevice } from '../models/testing/TestingDevice';
import { EngineResult } from '../models/common/EngineResult';
import { Container } from '../models/common/Container';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { RmautoExtenderOneComponent } from '../framework/frmctl/rmauto-extender-one/rmauto-extender-one.component';
import { CommonEnum } from '../enums/common.enum';
import { LottableTrans } from '../models/common/LottableTrans';
import { DynamicPanelComponent } from '../framework/busctl/dynamic-panel/dynamic-panel.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-harvest',
  templateUrl: './harvest.component.html',
  styleUrls: ['./harvest.component.css']
})
export class HarvestComponent implements OnInit, OnDestroy {
  @ViewChild(ContainerSummaryComponent) contsummaryParent: ContainerSummaryComponent;
  @ViewChild(RmtextboxComponent) rmtextbox: RmtextboxComponent;
  @Input() suggestedContainer: string;
  @Input() containerSummaryResponse: any;
  @ViewChild(ContainerSuggestionComponent) childContainer: ContainerSuggestionComponent;
  @ViewChild('serialNumberInput') serialnumberInput: ElementRef;
  @ViewChild(DynamicPanelComponent) dynamicPanel: DynamicPanelComponent;

  //#region  variable declaration
  receiptKey = '';
  authKey = '';

  serialNumber: string;
  suggestedContainerID = '';
  inbContainerID: string;
  isSaveDisabled = true;
  isTestsClearDisabled = true;
  isAutoPopulateSerialNumber = false;
  isSerialNumberValidated = false;
  partsList = [];
  message: any;
  operationObj: any;
  appConfig: any;
  controlConfig: any;
  inboundProperties: any;
  headingsobj = [];
  displayProp: any;
  displayPropheadingobj = [];
  displayProperites: any;
  validTestSerialNumberResponse: any;
  inbContainerResponse: any;
  multipleContainerList: any;
  inboundContainerId: string;
  testResult: any;
  operationId: string;
  harvestTransaction: any;
  transactionsResponse: any;
  transactions = [];
  serviceTransactions: any;
  routeAttributes: any;
  //originaiton operation
  originationOperation: Subscription;
  deviceOrigination: string;
  autoExtenderOneAddDisable = true;
  autoExtenderOneDoneDisable = false;
  //dynamic panel scrolling
  scrollPosition: number;

  emitGetTestResponse: Subscription;
  emitGetTransaction: Subscription;
  emitShowAutoManual: Subscription;
  emitGetTransAtrributeValues: Subscription;
  doneManualTransactionResponse: Subscription;
  emitReadOnlyDeviceResponse: Subscription;


  //enum
  testStatus = TestStatus;
  testBtnName = TestBtnNames;

  //object declaration
  clientData = new ClientData();
  uiData = new UiData();
  testing = new Testing();
  container = new Container();
  deviceRoutes = new TestingDeviceRoutes();
  lottableTrans: LottableTrans;
  dialogRef: any;

 //#endregion

  constructor(
    private apiService: ApiService,
    private apiConfigService: ApiConfigService,
    public appService: AppService,
    private commonService: CommonService,
    public appErrService: AppErrorService,
    public masterPageService: MasterPageService,
    public transactionService: TransactionService,
    private spinner: NgxSpinnerService,
    private snackbar: XpoSnackBar,
    private dialog: MatDialog

  ) {
    this.emitGetTestResponse = transactionService.emitGetTestResponse.subscribe(res => {
      if (!this.appService.checkNullOrUndefined(res)) {
        if (this.partsList.length == 0) {
          this.getHarvestEligibleParts();
        }
        this.getTestResponse(res);
      }
    });

    this.emitGetTransaction = this.transactionService.emitGetTransaction.subscribe(res => {
      if (!this.appService.checkNullOrUndefined(res)) {
        this.getTransactionResponse(res);
      }
    });

    this.emitShowAutoManual = this.transactionService.emitShowAutoManual.subscribe(res => {
      if (!this.appService.checkNullOrUndefined(res)) {
        this.showAutoManualResponse(res);
      }
    });

    this.doneManualTransactionResponse = this.transactionService.doneManualTransactionResponse.subscribe(doneResponse => {
      if (!this.appService.checkNullOrUndefined(doneResponse)) {
        this.getdoneManualTransactionResponse(doneResponse);
      }
    });

    //emitting readOnlyDevice response
    this.emitReadOnlyDeviceResponse = this.commonService.emitReadOnlyDeviceResponse.subscribe(res => {
      if (!this.appService.checkNullOrUndefined(res)) {
        if (!this.appService.checkNullOrUndefined(res.Status) && res.Status == StatusCodes.pass) {
          this.validTestSerialNumber();
        } else if (!this.appService.checkNullOrUndefined(res.Status) && res.Status == StatusCodes.fail) {
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
      this.message = this.appService.getErrorText('2660048');
      this.appConfig = JSON.parse(localStorage.getItem(StorageData.appConfig));
      this.controlConfig = JSON.parse(localStorage.getItem(StorageData.controlConfig));
      this.originationOperation = this.masterPageService.originationOperation.subscribe(val => {
        this.deviceOrigination = val;
      });
    }
  }

   //operationId
   setCurrentOperationId(operationId) {
    this.uiData.OperationId = operationId;
}


  //#region  inbound container

  //retrive inbound container id
  getinbContainerID(inbcontid) {
    this.inbContainerID = inbcontid;
  }

  //containerSummaryProperties
  containerSummaryProperties(event: any) {
    this.headingsobj = [];
    this.headingsobj = Object.keys(event);
    this.inboundProperties = event;
  }

  // after validating the inbound container response
  getContainerSummaryResponse(response) {
    this.inbContainerResponse = response;
  }

  //auto populate serial number
  getAutoPopulatedSerailNum(event: any) {
    if (!this.appService.checkNullOrUndefined(event) && event != '') {
      this.serialNumber = event;
      this.isAutoPopulateSerialNumber = true;
      this.validateTestSerialNumber(this.serialNumber, this.serialnumberInput);
      this.transactionService.disabledSerialNumber = true;
      this.isTestsClearDisabled = false;
    } else {
      if (this.serialNumber && this.isSerialNumberValidated) {
        this.transactionService.disabledSerialNumber = true;
      } else {
        this.transactionService.disabledSerialNumber = false;
        this.serailNumberFocus();
      }
      this.isTestsClearDisabled = false;
      this.spinner.hide();
    }
  }

  getContainerList(event) {
    this.multipleContainerList = event;
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

  // clear on inbound
  resetClear() {
    this.masterPageService.getCategoryTest();
    this.serialNumber = '';
    this.authKey = '';
    this.receiptKey = '';
    this.transactionService.disabledSerialNumber = true;
    this.masterPageService.disabledContainer = false;
    this.headingsobj = [];
    this.displayPropheadingobj = [];
    this.displayProperites = null;
    this.transactionService.transactions = [];
    this.transactionService.isAutoDisabled = true;
    this.transactionService.isManualDisabled = true;
    this.isTestsClearDisabled = true;
    this.appErrService.clearAlert();
    this.appErrService.setAlert('', false);
    this.isSaveDisabled = true;
    this.isAutoPopulateSerialNumber = false;
    this.inbContainerResponse = null;
    this.inboundProperties = null;
    this.clearContainerSummary();
    this.clearContainerID();
    this.masterPageService.inboundContainerFocus();
    if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
      this.contsummaryParent.containersList = [];
      this.contsummaryParent.deviceList = [];
      this.contsummaryParent.containerSummaryPropertiesList = [];
      this.contsummaryParent.canAllowNextContainerStatus = null;
      this.contsummaryParent.containerSummaryProperties = [];
      this.contsummaryParent.containerActualProp = null;
    }
    this.multipleContainerList = null;
    this.inboundContainerId = '';
    this.isSerialNumberValidated = false;
    this.partsList = [];
    this.uiData.OperationId = this.operationId;
  }
  //#endregion inbound container

  ////#region  get eligible parts
  getHarvestEligibleParts() {
    this.partsList = [];
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, Device: this.testing.Device };
    this.commonService.commonApiCall(this.apiConfigService.getHarvestEligiblePartsUrl, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        this.partsList = res.Response.HarvestEligibileParts;
      }
    });
  }

  //#region receipt
  createAccessoryReceipt() {
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, Device: this.testing.Device };
    this.commonService.commonApiCall(this.apiConfigService.importAccessoryReceiptUrl, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.receiptKey = res.Response.ReceiptKey;
        this.authKey = res.Response.AuthKey;
        this.createAccessoryReceiptDetail();
      }
    });
  }

  createAccessoryReceiptDetail() {
    if (this.authKey && this.receiptKey) {
      const requestObj = { ClientData: this.clientData, UIData: this.uiData, Device: this.testing.Device, TestTransactions: this.testing.TestTransactions };
      const url = String.Join('/', this.apiConfigService.saveAccessoryDetailsUrl, this.authKey, this.receiptKey)
      this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
        if (statusFlag) {
          this.spinner.hide();
          this.autoExtenderOneDoneDisable = true;
          this.autoExtenderOneAddDisable = false;
          if (res.Response.TestTransactions.DoneEnable == CommonEnum.yes) {
            this.transactionService.isDoneDisabled = false;
            this.appService.setFocus(this.testBtnName.done);
          }
          this.testing.TestTransactions = res.Response.TestTransactions;
          this.transactionService.transactions = this.testing.TestTransactions.Trans;
          this.snackbar.success(res.StatusMessage)
        }
      });
    }
  }
  //#end region receipt


  //#end region


  //#region serial number
  // validateTestSerialNumber
  validateTestSerialNumber(serialNumber, inpcontrol: any) {
    if (serialNumber != '') {
      this.testing.Device = new TestingDevice();
      if (!this.appService.checkNullOrUndefined(this.deviceOrigination) && this.deviceOrigination != '') {
        this.testing.Device.Origination = this.deviceOrigination;
      }
      this.appErrService.clearAlert();
      this.spinner.show();
      this.isTestsClearDisabled = false;
      this.testing.Device.SerialNumber = serialNumber;
      localStorage.setItem(StorageData.testSerialNumber, this.testing.Device.SerialNumber);
      this.testing.Device.Clientid = this.clientData.ClientId;
      let requestObj = { ClientData: this.clientData, UIData: this.uiData, Containers: this.multipleContainerList };
      const url = String.Join('/', this.apiConfigService.validateTestSerialNumberUrl, this.testing.Device.SerialNumber, this.masterPageService.categoryName);
      this.apiService.apiPostRequest(url, requestObj)
        .subscribe(response => {
          let result = response.body;
          if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
            this.validTestSerialNumberResponse = response.body;
            let traceData = { traceType: TraceTypes.serialNumber, traceValue: this.validTestSerialNumberResponse.Response.SerialNumber, uiData: this.uiData }
            let traceResult = this.commonService.findTraceHold(traceData, this.uiData);
            traceResult.subscribe(result => {
              if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
                if (this.appService.checkNullOrUndefined(result.Response)) {
                  this.commonService.getReadOnlyDeviceDetails(this.validTestSerialNumberResponse.Response.SerialNumber, this.uiData);
                } else {
                  this.canProceed(result, TraceTypes.serialNumber)
                }
              } else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
                this.spinner.hide();
                this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
              }
            });
          }
          else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
            this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
            this.transactionService.disabledSerialNumber = false;
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

  private validTestSerialNumber(result = this.validTestSerialNumberResponse) {
    this.testing.Device = result.Response;
    //enabling/disable serial number for multi container process
    this.isSerialNumberValidated = true;
    //inboundContainerid its storing for sending request of current inbound container id
    this.inboundContainerId = this.testing.Device.ContainerID;
    if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
      this.contsummaryParent.searchContainerID(this.testing.Device.ContainerID);
    }

    this.transactionService.getTest(this.testing.Device, this.uiData);
    this.validTestSerialNumberResponse = null;
  }

  canProceed(traceResponse, type) {
    if (traceResponse.Response.canProceed == 'Y') {
      this.appErrService.setAlert(traceResponse.StatusMessage, true, MessageType.info);
    }
    if (!this.appService.checkNullOrUndefined(traceResponse.Response.TraceHold)) {
      let uiObj = { uiData: this.uiData }
      traceResponse = Object.assign(traceResponse, uiObj);
      this.dialogRef = this.dialog.open(FindTraceHoldComponent, { hasBackdrop: true, disableClose: true, panelClass: 'dialog-width-sm', data: { modalData: traceResponse } });
      this.dialogRef.afterClosed().subscribe((returnedData) => {
          if (returnedData) {
        if (returnedData.Response.canProceed == 'Y') {
          if (type == TraceTypes.serialNumber) {
            this.commonService.getReadOnlyDeviceDetails(this.validTestSerialNumberResponse.Response.SerialNumber, this.uiData);
          }
        } else if (returnedData.Response.canProceed == 'N') {
          if (type == TraceTypes.serialNumber) {
            this.serailNumberFocus();
          }
          this.appErrService.setAlert(returnedData.StatusMessage, true);
        }
      }
      });
    }
    this.spinner.hide();
  }

  changeInput() {
    this.isTestsClearDisabled = false;
    this.appErrService.clearAlert();
  }

  //#endregion serialnumber


  //#region  outbound container

  //get suggested container
  containerFocus() {
    this.appService.setFocus('containerInputId');
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

  //validate outbound container
  validateContainer(response) {
    if (response.ContainerID != null && response.ContainerID != undefined) {
      this.testing.Device.ContainerID = response.ContainerID;
      this.testing.Device.ContainerCycle = response.ContainerCycle;
    }
    this.childContainer.validateContainer(this.testing.Device);

  }

  // retrive outbound container from parent component
  getContainerId(containerid) {
    this.suggestedContainerID = containerid;
  }


  //validateConta iner Response from child conatiner
  validateContainerResponse(response) {
    if (!this.appService.checkNullOrUndefined(response)) {
      this.container = response;
      this.isSaveDisabled = true;
      this.testing.Device.ContainerCycle = response.ContainerCycle;
      this.testing.Device.ContainerID = response.ContainerID;
      this.saveSerialNum();
    }
    else {
      this.saveSerialNum();
    }
  }

  //validate container fail response
  emitValidateContainerFailResponse(response) {
    if (!this.appService.checkNullOrUndefined(response)) {
      this.testing.Device.ContainerID = response.ContainerID;
      this.testing.Device.ContainerCycle = response.ContainerCycle;
    }
  }

  //refresh container
  checkContainer(container) {
    if (!this.appService.checkNullOrUndefined(container)) {
      this.isSaveDisabled = false;
      this.testing.Device.ContainerID = container.ContainerID;
      this.testing.Device.ContainerCycle = container.ContainerCycle;
    }
    else {
      this.isSaveDisabled = true;
    }
  }

  //enabling the button and container ID
  configContainerProperties() {
    this.childContainer.isContainerDisabled = false;
    this.childContainer.isClearContainerDisabled = false;
  }


  //clear container suggestion
  clearContainerID() {
    if (!this.appService.checkNullOrUndefined(this.childContainer)) {
      let container = this.childContainer;
      container.ContainerID = '';
      container.suggestedContainer = '';
      container.categoryName = '';
      container.isContainerDisabled = true;
      container.isClearContainerDisabled = true;
      container.applyRequired(false);
    }
  }

  //#endregion outbound container


  ////#region  transaction
  //getTest Response
  getTestResponse(res) {
    if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
      this.masterPageService.operCategoryTests = res.Response.OperTransactions.Trans;
      if (!this.appService.checkNullOrUndefined(res.Response.OperTransactions.Trans)) {
        this.displayProp = res.Response.OperTransactions.Trans[0].DisplayProps;
      }
      this.displayPropheadingobj = [];
      this.displayPropheadingobj = Object.keys(this.displayProp);
      this.displayProperites = this.displayProp;
      this.testing.Device = res.Response.Device;
      this.testResult = res.Response.TestResult;
      this.masterPageService.operCategoryTests.forEach((item, i) => {
        if (item.Status == this.testStatus.inprocess) {

          if (item.TestType == 'A' || item.TestType == 'B') {
            const elementId = this.appService.getElementId(this.testBtnName.auto, item.OperationId);
            this.appService.setFocus(elementId);
          }
          else {
            const elementId = this.appService.getElementId(this.controlConfig.testBtnNameManual, item.OperationId);
            this.appService.setFocus(elementId);
          }
        }
      })

      if (res.Response.MoveEligible == 'Y') {
        if (this.masterPageService.hideControls.controlProperties.containerSuggestion == undefined) {
          this.configContainerProperties();
          this.childContainer.suggestedContainerFocus();
        } else {
          this.isSaveDisabled = false;
          this.saveFocus();
        }
      }
      this.transactionService.disabledSerialNumber = true;
      this.transactionService.isAutoDisabled = false;
      this.transactionService.isManualDisabled = false;
      this.serailNumberonBlur();
    } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
      this.rmtextbox.applyRequired(true);
      this.rmtextbox.applySelect();
      this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
    }
  }

  //getTransactionResponse
  getTransactionResponse(res) {
    this.transactionsResponse = res.Response.TestTransactions;
    this.transactions = res.Response.TestTransactions.Trans;
    // get controlid based on attribute ('RESULT') ,
    let resultControlId = '';
    if (this.transactionsResponse.DoneEnable == 'Y') {
      this.transactionService.isDoneDisabled = false;
      this.appService.setFocus(this.testBtnName.done);
    }
    if (!this.appService.checkNullOrUndefined(this.transactions)) {
      this.transactions.forEach((element) => {
        element.TransControls.forEach((el) => {
          if (el.Focus == true) {
            if (el.Disable == false) {
              resultControlId = el.ControlId;

              const elementId = this.appService.getElementId(resultControlId, element.TransId);
              this.appService.setFocus(elementId);
            }
          }
          if(el.AttributeName === "AUTOEXTENDER1"){
            if(el.SelectedValue.length){
              this.autoExtenderOneAddDisable = false;
              this.autoExtenderOneDoneDisable = true;
            } else{
              this.autoExtenderOneAddDisable = true;
              this.autoExtenderOneDoneDisable = false;
            }
          }
        });
      });
    }
  }



  showAutoManual(item) {
    this.spinner.show();
    this.transactionService.showAutoManual(item, this.testing.Device, this.uiData);
  }

  //showAutoManualResponse
  showAutoManualResponse(res) {
    this.testing.Device = res.Response.Device;
    this.masterPageService.operCategoryTests = res.Response.OperTransactions.Trans;
    if (!this.appService.checkNullOrUndefined(res.Response.OperTransactions.Trans)) {
      this.displayProp = res.Response.OperTransactions.Trans[0].DisplayProps;
    }
    this.displayPropheadingobj = [];
    this.displayPropheadingobj = Object.keys(this.displayProp);
    this.displayProperites = this.displayProp;
    this.masterPageService.operCategoryTests.forEach((item, i) => {
      if (item.Status == this.testStatus.inprocess) {
        if (item.TestType == "A" || item.TestType == "B") {
          const elementId = this.appService.getElementId(this.testBtnName.auto, item.OperationId);
          this.appService.setFocus(elementId);
        }
        else {
          const elementId = this.appService.getElementId(this.controlConfig.testBtnNameManual, item.OperationId);
          this.appService.setFocus(elementId);
        }

      }
      else if (item.Status == this.testStatus.retest) {
        const elementId = this.appService.getElementId(this.testBtnName.retest, item.OperationId);
        this.appService.setFocus(elementId);

      }
    })
    if (res.Response.MoveEligible == "N") {
      if (this.masterPageService.hideControls.controlProperties.containerSuggestion == undefined) {
        this.clearContainerID();
      }
    }
    this.isSaveDisabled = true;
    this.transactionService.isAutoDisabled = false;
    this.transactionService.isManualDisabled = false;
    this.transactionService.disabledSerialNumber = true;
    this.autoExtenderOneDoneDisable = true;
    this.autoExtenderOneAddDisable = false;
  }


  //Done
  doneManualTransaction(item) {
    // this.operationId = item.OperationId;
    this.testing.TestTransactions = this.transactionsResponse;
    this.transactionService.doneManualTransaction(item, this.testing, this.uiData);
  }

  //getdoneManualTransactionResponse
  getdoneManualTransactionResponse(res) {
    if (!this.appService.checkNullOrUndefined(res)) {
      this.testing.Device = res.Device;
      this.testing.TestResultDetails = res.TestResultDetails;
      this.saveAccTransResult(res.Accessories);
    }
  }


  //saveAccTransResult
  saveAccTransResult(Accessories) {
    this.spinner.show();
    let requestObj = { ClientData: this.clientData, Accessories: Accessories, UIData: this.uiData };
    const url = String.Join("/", this.apiConfigService.saveAccTransResult);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let res = response.body;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          this.showManualProcessTest();
        }
        else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }

  //showManualProcessTest
  showManualProcessTest() {
    this.spinner.show();
    let requestObj = { ClientData: this.clientData, Device: this.testing.Device, TestTransactions: this.transactionsResponse, UIData: this.uiData };
    const url = String.Join("/", this.apiConfigService.manualProcessTestUrl)
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let result = response.body;
        if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
          this.serviceTransactions = result.Response.ServiceTransactions;
          this.routeAttributes = result.Response.RouteAttributes;
          this.testing.Device = result.Response.Device;
          this.isSaveDisabled = true;
          this.transactionService.isAutoDisabled = true;
          this.transactionService.isManualDisabled = true;
          if(result.StatusMessage){
            this.snackbar.success(result.StatusMessage);
          }
          this.masterPageService.inboundContainerFocus();
          this.masterPageService.getCategoryTest();
          this.loadProgramValues(this.testing.Device);
        }
        else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
          this.spinner.hide();
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
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          this.testing.Device = res.Response;
          this.getroute(this.testing.Device, this.routeAttributes);
        }
        else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          this.spinner.hide();
        }
      },
        error => {
          this.appErrService.handleAppError(error);
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
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          this.testing.Device = res.Response;
          this.saveTransaction(this.serviceTransactions);
        }
        else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          this.spinner.hide();
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }

  //SaveTransactions
  saveTransaction(serviceSaveTransactios) {
    this.spinner.show();
    let requestObj = { ClientData: this.clientData, Transactions: serviceSaveTransactios, UIData: this.uiData, Device: this.testing.Device, TestResultDetails: this.testing.TestResultDetails }
    const url = String.Join("/", this.apiConfigService.saveTransaction);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let res = response.body;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          this.saveSerialNumberTestResult(this.testing.Device);
        }
        else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          this.spinner.hide();
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }

  //saveSerialNumberTestResult
  saveSerialNumberTestResult(device) {
    let requestObj = { ClientData: this.clientData, Device: device, RouteAttributes: this.deviceRoutes.RouteAttributes, UIData: this.uiData }
    const url = String.Join("/", this.apiConfigService.saveSerialNumberTestResultUrl);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let res = response.body;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          this.testResult = res.Response;
          this.transactionService.getTest(this.testing.Device, this.uiData);
        }
        else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }

  //save button
  saveSerialNum() {
    this.setSaveValue(true);
    let result = this.commonService.validateReadOnlyDeviceDetails(this.uiData, this.testResult);
    result.subscribe(response => {
      if (!this.appService.checkNullOrUndefined(response) && response.Status === StatusCodes.pass) {
        if (!this.appService.checkNullOrUndefined(this.testing.Device)) {
          this.getUpdatedDevice(this.testing.Device);
        }
      }
      else if (!this.appService.checkNullOrUndefined(response) && response.Status === StatusCodes.fail) {
        this.spinner.hide();
        this.resetClear();
        this.appErrService.setAlert(response.ErrorMessage.ErrorDetails, true);
      }
    })
  }

  //Updated Device
  getUpdatedDevice(updatedDevice) {
    this.spinner.show();
    let requestObj = { ClientData: this.clientData, Device: updatedDevice, UIData: this.uiData };
    const url = String.Join("/", this.apiConfigService.updateDeviceUrl);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let res = response.body;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          this.testing.Device = res.Response;
          const postUrl = String.Join('/', this.apiConfigService.postCommonUpdateProcess);
          this.commonService.postUpdateProcess(postUrl, requestObj);
          this.addSerialNumberSnap(this.testing.Device);
        }
        else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.setSaveValue(false);
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          this.spinner.hide();
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }

  setSaveValue(val) {
    this.isSaveDisabled = val;
  }

  //addSerialNumberSnap
  addSerialNumberSnap(device) {
    this.spinner.show();
    let requestObj = { ClientData: this.clientData, Device: device, UIData: this.uiData };
    const url = String.Join("/", this.apiConfigService.addSerialNumberSnapUrl);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let res = response.body;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          this.displayProperites = null;
          this.refreshContainer();
          this.updateLottables();
        }
        else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          this.setSaveValue(false);
          this.spinner.hide();
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }


  //refresh container
  refreshContainer() {
    this.spinner.show();
    let requestObj = { ClientData: this.clientData, UIData: this.uiData, Containers: this.multipleContainerList, Devices: this.contsummaryParent.deviceList };
    const url = String.Join("/", this.apiConfigService.refreshContainerUrl, this.inboundContainerId);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let result = response.body;
        this.spinner.hide();
        this.isSerialNumberValidated = false;
        if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
          if (result.Response.Quantity == 0) {
            this.snackbar.success(result.StatusMessage);
            //whirlpool
            if (!this.appService.checkNullOrUndefined(this.contsummaryParent) && this.contsummaryParent.containerSummaryPropertiesList.length == 0) {
              this.resetClear();
            } else { //verizon
              this.resetValues(result);
              if (!this.appService.checkNullOrUndefined(this.contsummaryParent) && this.contsummaryParent.containerSummaryPropertiesList.length && !this.appService.checkNullOrUndefined(result.Response.canAllowNextContainer)) {
                let index = this.contsummaryParent.containerSummaryPropertiesList.findIndex(c => c.containerId == this.inboundContainerId);
                if (index != -1) {
                  this.contsummaryParent.containerSummaryPropertiesList.splice(index, 1);
                }
                if (this.contsummaryParent.containersList && this.contsummaryParent.containersList.length) {
                  let containerIndex = this.contsummaryParent.containersList.findIndex(c => c.ContainerID == this.inboundContainerId);
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
                }
                else if (result.Response.canAllowNextContainer == 'N') {
                  this.serialNumberClear();
                } else {
                  this.clearContainerSummary();
                  this.serialNumberClear();
                  if (this.contsummaryParent.containerSummaryPropertiesList.length == 0) {
                    this.transactionService.disabledSerialNumber = true;
                    this.masterPageService.inboundContainerFocus();
                  }
                }
              }

            }
          } else {
            this.resetValues(result);
            if (!this.appService.checkNullOrUndefined(this.contsummaryParent) && this.contsummaryParent.containerSummaryPropertiesList.length && !this.appService.checkNullOrUndefined(result.Response.canAllowNextContainer)) {
              let index = this.contsummaryParent.containerSummaryPropertiesList.findIndex(c => c.containerId == this.inboundContainerId);
              if (index != -1) {
                this.contsummaryParent.containerSummaryPropertiesList[index].inboundProperties.Quantity = result.Response.Quantity;
              }
              if (result.Response.canAllowNextContainer === CommonEnum.yes) {
                this.clearContainerSummary();
              }
            }
            else {
              if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
                this.contsummaryParent.getInboundDetails();
              }
            }
            this.serialNumberClear();
          }
        }
        else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
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

  private resetValues(result: any) {
    this.serialNumber = "";
    this.isSaveDisabled = true;

    this.transactionService.isAutoDisabled = true;
    this.transactionService.isManualDisabled = true;
    this.masterPageService.getCategoryTest();
    this.clearContainerID();
    this.container.Quantity = result.Response.Quantity;
    if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
      this.contsummaryParent.isClearDisabled = false;
      this.contsummaryParent.quantity = (this.container.Quantity).toString();
    }
    this.transactionService.disabledSerialNumber = false;
    this.serailNumberFocus();
  }

  //updateLottables
  updateLottables() {
    this.lottableTrans = new LottableTrans();
    let requestObj = { ClientData: this.clientData, UIData: this.uiData, Device: this.testing.Device, LottableTrans: this.lottableTrans };
    this.apiService.apiPostRequest(this.apiConfigService.updateLottables, requestObj)
      .subscribe(response => {
        let res = response.body;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }



  getHarvestPart(transaction, event, rowIndex, parentItem, parentIndex) {
    this.scrollPosition = 0;
    let index = transaction.TransControls.findIndex(x => (String.Join('_', x.ControlId, transaction.TransId)) === event.name);
    if (this.transactionsResponse.Trans[rowIndex].TransControls[index].Property.controlType === 'autoextender1') {
      this.transactionsResponse.Trans[rowIndex].TransControls[index].SelectedValue = event.Text;
    }
    this.testing.TestTransactions = this.transactionsResponse;
    this.scrollPosition = this.appService.getScrollPosition();
    if (this.authKey && this.receiptKey) {
      this.createAccessoryReceiptDetail();
    } else {
      this.createAccessoryReceipt();
    }
  }

  ////#endregion  transaction

  //Serial Number Focus
  serailNumberFocus() {
    this.appService.setFocus('serialNumber');
  }

  //serailNumberonBlur
  serailNumberonBlur() {
    let inputSerialNumber = <HTMLInputElement>document.getElementById('serialNumber');
    if (inputSerialNumber) {
      inputSerialNumber.blur();

    }
  }

  //save button foucs
  saveFocus() {
    this.appService.setFocus('save');
  }


  serialNumberClear() {
    this.masterPageService.getCategoryTest();
    if (!this.isAutoPopulateSerialNumber) {
      this.serialNumber = '';
    }
    this.transactionService.disabledSerialNumber = false;
    this.transactionService.isAutoDisabled = true;
    this.transactionService.isManualDisabled = true;
    this.serailNumberFocus();
    this.isSaveDisabled = true;
    this.authKey = '';
    this.receiptKey = '';
    this.autoExtenderOneAddDisable = true;
    this.autoExtenderOneDoneDisable = false;
    this.transactionService.transactions = [];
    this.isTestsClearDisabled = true;
    this.appErrService.clearAlert();
    this.appErrService.setAlert('', false);
    this.displayPropheadingobj = [];
    this.displayProperites = null;
    this.clearContainerID();
    this.inboundContainerId = '';
    this.isSerialNumberValidated = false;
    this.partsList = [];
  }

  ngOnDestroy() {
    this.masterPageService.moduleName.next(null);
    this.masterPageService.categoryName = null;
    this.masterPageService.disabledContainer = true;
    this.masterPageService.operation = "";
    this.masterPageService.operationList = [];
    this.masterPageService.operationsdropdown = [];
    this.masterPageService.operCategoryTests = [];
    this.transactionService.disabledSerialNumber = true;
    this.transactionService.transactions = [];
    this.transactionService.transactionsResponse = [];
    this.transactionsResponse = [];
    this.transactions = [];
    this.masterPageService.clearModule();
    this.appErrService.clearAlert();
    this.emitGetTestResponse.unsubscribe();
    this.emitGetTransaction.unsubscribe();
    this.emitShowAutoManual.unsubscribe();
    this.emitReadOnlyDeviceResponse.unsubscribe();
    this.doneManualTransactionResponse.unsubscribe();
    this.commonService.emitReadOnlyDeviceResponse.next(null);
    this.emitReadOnlyDeviceResponse.unsubscribe();
    this.transactionService.clearSubscription();
    if (this.contsummaryParent) {
      if (this.contsummaryParent.dialogRef) {
        this.contsummaryParent.dialogRef.close();
      }
    }
    if (!this.appService.checkNullOrUndefined(this.originationOperation) && this.originationOperation) {
      this.originationOperation.unsubscribe();
    }
    this.masterPageService.clearOriginationSubscription();
    if (this.masterPageService.hideControls.controlProperties) {
      this.masterPageService.hideControls.controlProperties = new EngineResult();
    }
    this.masterPageService.hideDialog();
    this.commonService.readOnlyDevice = null;
  }

}
