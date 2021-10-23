import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, Input, ElementRef, TemplateRef, Optional } from '@angular/core';
import { AppErrorService } from './../../utilities/rlcutl/app-error.service';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiConfigService } from './../../utilities/rlcutl/api-config.service';
import { ApiService } from './../../utilities/rlcutl/api.service';
import { AppService } from './../../utilities/rlcutl/app.service';
import { dropdown } from './../../models/common/Dropdown';
import { String, StringBuilder } from 'typescript-string-operations';
import { AutomationQueue } from './../../models/testing/AutomationQueue';
import { Container } from './../../models/common/Container';
import { Observable, Subscription, interval, fromEvent } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { TestingDevice } from '../../models/testing/TestingDevice';
import { ContainerSummaryComponent } from './../../framework/busctl/container-summary/container-summary.component';
import { MasterPageService } from './../../utilities/rlcutl/master-page.service';
import { RmtextboxComponent } from './../../framework/frmctl/rmtextbox/rmtextbox.component';
import { TestTransaction } from './../../models/testing/Transaction';
import { ContainerSuggestionComponent } from '../../framework/busctl/container-suggestion/container-suggestion.component';
import { TestStatus } from '../../enums/testStatus.enum';
import { SerialNumberStatus } from '../../enums/serialnumberStatus.enum';
import { TestBtnNames } from './../../enums/test-btn-names.enum';
import { Grid } from '../../models/common/Grid';
import { Message } from '../../models/common/Message';
import { MessageType } from '../../enums/message.enum';
import { MessagingService } from '../../utilities/rlcutl/messaging.service';
import { TransactionService } from '../../services/transaction.service';
import { Testing, TestingDeviceRoutes } from '../../models/testing/Testing';
import { ClientData } from '../../models/common/ClientData';
import { UiData } from '../../models/common/UiData';
import { LottableTrans } from '../../models/common/LottableTrans';
import { EngineResult } from '../../models/common/EngineResult';
import { TraceTypes } from '../../enums/traceType.enum';
import { CommonService } from '../../services/common.service';
import { FindTraceHoldComponent } from '../../framework/busctl/find-trace-hold/find-trace-hold.component';
import { StorageData } from '../../enums/storage.enum';
import { StatusCodes } from '../../enums/status.enum';
import { CommonEnum } from '../../enums/common.enum';
import { OperationEnum } from '../../enums/operation.enum';
import { checkNullorUndefined } from '../../enums/nullorundefined';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-testing',
    templateUrl: './testing.component.html',
    styleUrls: ['./testing.component.css']
})
export class TestingComponent implements OnInit, OnDestroy {

    @ViewChild(ContainerSummaryComponent) contsummaryParent: ContainerSummaryComponent;
    @ViewChild(RmtextboxComponent) rmtextbox: RmtextboxComponent;
    @ViewChild(ContainerSuggestionComponent) childContainer: ContainerSuggestionComponent;
    @ViewChild('serialNumberInput') serialnumberInput: ElementRef;
    @ViewChild('failedDevicemodal') failedDevicemodal: TemplateRef<any>;

    intervalId: any;
    count = 0;
    operationId: string;
    testSerialNumber: string;
    serialNumber = "";
    suggestedContainerID = "";
    inbContainerID = "";
    ishideQueList: boolean = true;
    isSaveDisabled = true;
    isMoveDisabled = true;
    modeltitle = OperationEnum.moveBatchFailedDevices;
    title = OperationEnum.closebatch;
    isTestsClearDisabled = true;
    isAutoPopulatedSerialNumber = false;
    showActiveOperationFlag = true;

    //display properties
    displayProp: any;
    displayProperites: any;
    displayPropheadingobj = [];
    headingsobj = [];

    //inbound container properties
    inboundProperties: any;
    //transaction response
    transactionsResponse: any;
    serviceTransactions: any;
    routeAttributes: any;
    pollingData: any;
    inbContainerResponse: any;
    transactions = [];
    temList = [];

    //Test Transactions
    tests = [];

    //App message
    messageNum: string;
    messageType: string;

    //Testing objects
    // tesingDevice = new TestingDevice();
    testing = new Testing();

    deviceRoutes = new TestingDeviceRoutes();
    clientData = new ClientData();
    container = new Container();
    uiData = new UiData();
    lottableTrans: LottableTrans;

    //enum
    testStatus = TestStatus;
    testBtnName = TestBtnNames;
    serialnumberStatus = SerialNumberStatus;

    //grid
    clear: any;
    grid: Grid;
    processQueData = [];
    operationObj: any;

    //client Control Labels
    controlConfig: any;
    appConfig: any;

    //uiDataOpearionId: string;
    //subsciption declaration
    subscription: Subscription;
    emitGetTestResponse: Subscription;
    emitGetTransaction: Subscription;
    emitShowAutoManual: Subscription;
    emitGetTransAtrributeValues: Subscription;
    emitDoneManualTransactionResponse: Subscription;
    emitReadOnlyDeviceResponse: Subscription;
    emitHideSpinner: Subscription;

    //dynamic panel scrolling
    scrollPosition: number;

    //originaiton operation
    originationOperation: Subscription;
    deviceOrigination: string;

    //container Summary properties
    multipleContainerList: any;
    inboundContainerId: string;
    isProcessCompleted = false;
    traceTypes = TraceTypes;
    validTestSerialNumberResponse: any;
    isSerialNumberValidated = false;
    storageData = StorageData;
    statusCode = StatusCodes;
    testResult: any;
    isShowOutboundContainer = true;
    failedDevicesData: any;
    batchId = '';
    moveBatchButton = CommonEnum.MOVEBATCH;
    commonEnum = CommonEnum;

    // print data
    isSerialNoPrintDisabled = true;
    batchStatus: any;
    readOnlyDevice: any;
    testDetails: any;
    IsAllTestsCompleted = true;
    dialogRef: MatDialogRef<FindTraceHoldComponent, any>;

    constructor(
        private apiService: ApiService,
        private apiConfigService: ApiConfigService,
        private spinner: NgxSpinnerService,
        private snackbar: XpoSnackBar,
        public appErrService: AppErrorService,
        public masterPageService: MasterPageService,
        public appService: AppService,
        private messagingService: MessagingService,
        public transactionService: TransactionService,
        private commonService: CommonService,
        private dialog: MatDialog,

    ) {
        this.subscription = this.masterPageService.clearAll$.subscribe(
            clear => {
                if (clear) {
                    if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
                        this.contsummaryParent.rmtextchild.value = "";
                        this.contsummaryParent.quantity = "";
                        this.contsummaryParent.category = "";
                        this.contsummaryParent.isClearDisabled = true;
                    }
                    this.serialNumber = "";
                    this.transactionService.disabledSerialNumber = true;
                    if (this.pollingData != undefined) {
                        this.pollingData.unsubscribe();
                        this.masterPageService.tempQueList = null;
                        this.clear.click();
                    }
                    this.appErrService.setAlert("", false);
                }
            });
        //emitting testing response
        this.emitGetTestResponse = this.transactionService.emitGetTestResponse.subscribe(res => {
            if (!this.appService.checkNullOrUndefined(res)) {
                this.getTestResponse(res);
            }
        });
        //emitting gettransaction response
        this.emitGetTransaction = this.transactionService.emitGetTransaction.subscribe(res => {
            if (!this.appService.checkNullOrUndefined(res)) {
                this.getTransactionResponse(res);
            }
        });
        //emitting showAutoManual response
        this.emitShowAutoManual = this.transactionService.emitShowAutoManual.subscribe(res => {
            if (!this.appService.checkNullOrUndefined(res)) {
                this.showAutoManualResponse(res);
            }
        });
        //emitting emitGetTransAtrributeValues response
        this.emitGetTransAtrributeValues = this.transactionService.emitGetTransAtrributeValues.subscribe(res => {
            if (!this.appService.checkNullOrUndefined(res)) {
                this.getTransAtrributeValuesResponse(res);
            }
        });
        //emitDoneManualTransaction response
        this.emitDoneManualTransactionResponse = this.transactionService.doneManualTransactionResponse.subscribe(doneResponse => {
            if (!this.appService.checkNullOrUndefined(doneResponse)) {
                this.getdoneManualTransactionResponse(doneResponse);
            }
        });
        //emitting readOnlyDevice response
        this.emitReadOnlyDeviceResponse = this.commonService.emitReadOnlyDeviceResponse.subscribe(res => {
            if (!this.appService.checkNullOrUndefined(res)) {
                if (!this.appService.checkNullOrUndefined(res.Status) && res.Status == this.statusCode.pass) {
                    this.readOnlyDevice = res.Response.ReadonlyDevice;
                    this.validTestSerialNumber();
                } else if (!this.appService.checkNullOrUndefined(res.Status) && res.Status == this.statusCode.fail) {
                    this.serialNumberClear();
                }
            }
        });

        this.emitHideSpinner = this.masterPageService.emitHideSpinner.subscribe(spinnerFlag => {
            if (!this.appService.checkNullOrUndefined(spinnerFlag) && spinnerFlag) {
                if (this.masterPageService.hideControls.controlProperties.hasOwnProperty('isAutoDeviceProcessing')) {
                    this.contsummaryParent.getAutoVirtualContainer();
                } else {
                    this.spinner.hide();
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
            //this.uiDataOpearionId = this.operationObj.OperationId;
            this.masterPageService.hideSpinner = true;
            this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
            this.masterPageService.setCardHeader(CommonEnum.automationQueue);
            this.masterPageService.setSamplingCardHeader(CommonEnum.samplingDetails);
            this.masterPageService.containerDetailsHeader(CommonEnum.containerDetails);
            this.masterPageService.setTitle(this.operationObj.Title);
            this.masterPageService.setUiData(this.uiData);
            this.masterPageService.setModule(this.operationObj.Module);
            this.serialNumber = '';
            localStorage.setItem(this.storageData.module, this.operationObj.Module);
            this.appErrService.appMessage();
            this.appConfig = JSON.parse(localStorage.getItem(this.storageData.appConfig));
            this.controlConfig = JSON.parse(localStorage.getItem(this.storageData.controlConfig));
            this.originationOperation = this.masterPageService.originationOperation.subscribe(val => {
                this.deviceOrigination = val;
            });
        }
    }

    //operationId
    setCurrentOperationId(operationId) {
        this.uiData.OperationId = operationId;
    }

    //inbContainerID
    getinbContainerID(inbcontid) {
        this.inbContainerID = inbcontid;
    }

    getContainerId(containerid) {
        this.suggestedContainerID = containerid;
    }

    //Serial Number Focus
    serailNumberFocus() {
        this.appService.setFocus('serialNumber');
    }

    serailNumberonBlur() {
        let inputSerialNumber = <HTMLInputElement>document.getElementById('serialNumber');
        if (inputSerialNumber) {
            inputSerialNumber.blur();
        }
    }

    hideQueList() {
        this.ishideQueList = !this.ishideQueList;
    }


    getContainerList(event) {
        this.multipleContainerList = event;
    }




    // validateTestSerialNumber
    validateTestSerialNumber(serialNumber, inpcontrol: any) {
        if (serialNumber != "") {
            // this.uiData.OperationId = this.uiDataOpearionId;
            this.testing.Device = new TestingDevice();
            if (!this.appService.checkNullOrUndefined(this.deviceOrigination) && this.deviceOrigination != '') {
                this.testing.Device.Origination = this.deviceOrigination;
            }
            if (this.masterPageService.hideControls && this.masterPageService.hideControls.controlProperties && this.masterPageService.hideControls.controlProperties.containerSuggestion == undefined) {
                this.clearContainerID();
            }
            this.isTestsClearDisabled = false;
            this.spinner.show();
            this.appErrService.clearAlert();
            localStorage.setItem(this.storageData.testSerialNumber, serialNumber);
            const requestObj = { ClientData: this.clientData, UIData: this.uiData, Containers: this.multipleContainerList };
            const url = String.Join("/", this.apiConfigService.validateTestSerialNumberUrl, serialNumber, this.masterPageService.categoryName);
            this.apiService.apiPostRequest(url, requestObj)
                .subscribe(response => {
                    let result = response.body;
                    if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.pass) {
                        this.validTestSerialNumberResponse = response.body;
                        let traceData = { traceType: this.traceTypes.serialNumber, traceValue: this.validTestSerialNumberResponse.Response.SerialNumber, uiData: this.uiData }
                        let traceResult = this.commonService.findTraceHold(traceData, this.uiData);
                        traceResult.subscribe(result => {
                            if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.pass) {
                                if (this.appService.checkNullOrUndefined(result.Response)) {
                                    this.commonService.getReadOnlyDeviceDetails(this.validTestSerialNumberResponse.Response.SerialNumber, this.uiData);
                                } else {
                                    this.canProceed(result, this.traceTypes.serialNumber)
                                }
                            } else if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.fail) {
                                this.spinner.hide();
                                this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
                            }
                        });
                    }
                    else if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.fail) {
                        this.spinner.hide();
                        this.transactionService.disabledSerialNumber = false;
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
            let userMessage = new Message();
            this.messageNum = "8780012";
            this.messageType = MessageType.failure;
            userMessage = this.messagingService.SendUserMessage(this.messageNum, this.messageType);
            this.appErrService.setAlert(userMessage.messageText, true);
        }
    }

    validTestSerialNumber(result = this.validTestSerialNumberResponse) {
        this.testing.Device = result.Response;
        //enabling/disable serial number for multi container process
        this.isSerialNumberValidated = true;
        //inboundContainerid its storing for sending request of current inbound container id
        this.inboundContainerId = this.testing.Device.ContainerID;
        if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
            this.contsummaryParent.searchContainerID(this.testing.Device.ContainerID);
        }
        this.transactionService.getTest(this.testing.Device, this.uiData);

        // to remove the highlighed color on operations
        this.showActiveOperationFlag = false;
        this.validTestSerialNumberResponse = null;
    }

    canProceed(traceResponse, type) {
        if (traceResponse.Response.canProceed == CommonEnum.yes) {
            this.appErrService.setAlert(traceResponse.StatusMessage, true, MessageType.info);
        }
        if (!this.appService.checkNullOrUndefined(traceResponse.Response.TraceHold)) {
            let uiObj = { uiData: this.uiData }
            traceResponse = Object.assign(traceResponse, uiObj);
            // this.modalRef = this.modalService.show(FindTraceHoldComponent, { initialState: { modalData: traceResponse }, backdrop: 'static', keyboard: false, class: 'modal-md modal-dialog-centered' });
            this.dialogRef = this.dialog.open(FindTraceHoldComponent, {
                hasBackdrop: true,
                disableClose: true,
                panelClass: 'dialog-width-sm',
                data: {
                    modalData: traceResponse
                }
            });
            this.dialogRef.afterClosed().subscribe((returnedData) => {
                if (returnedData) {
                    if (returnedData.Response.canProceed == CommonEnum.yes) {
                        if (type == this.traceTypes.serialNumber) {
                            this.commonService.getReadOnlyDeviceDetails(this.validTestSerialNumberResponse.Response.SerialNumber, this.uiData);
                        }
                    } else if (returnedData.Response.canProceed == CommonEnum.no) {
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

    //auto populate serial number
    getAutoPopulatedSerailNum(event: any) {
        if (!this.appService.checkNullOrUndefined(event) && event != '') {
            this.serialNumber = event;
            this.validateTestSerialNumber(this.serialNumber, this.serialnumberInput);
            this.transactionService.disabledSerialNumber = true;
            this.isTestsClearDisabled = false;
            this.isAutoPopulatedSerialNumber = true;
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


    //containerSummaryProperties
    containerSummaryProperties(event: any) {
        this.headingsobj = [];
        this.headingsobj = Object.keys(event);
        this.inboundProperties = event;
    }

    //getTest Responseg
    getTestResponse(res) {
        if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
            this.masterPageService.operCategoryTests = res.Response.OperTransactions.Trans;
            if (!this.appService.checkNullOrUndefined(res.Response.OperTransactions.Trans)) {
                this.displayProp = res.Response.OperTransactions.Trans[0].DisplayProps;
            }
            this.displayPropheadingobj = [];
            this.displayPropheadingobj = Object.keys(this.displayProp);
            this.displayProperites = this.displayProp;
            this.testing.Device = res.Response.Device;
            this.testResult = res.Response.TestResult;
            this.testDetails = res.Response.TestDetails;
            if (res.Response.hasOwnProperty('IsPrintEnableReq') && res.Response.IsPrintEnableReq === CommonEnum.yes) {
                this.isSerialNoPrintDisabled = false;
            } else {
                this.isSerialNoPrintDisabled = true;
            }
            this.masterPageService.operCategoryTests.forEach((item, i) => {
                if (item.Status == this.testStatus.inprocess) {
                    if (item.TestType == "A" || item.TestType == "B") {
                        const elementId = this.appService.getElementId(this.testBtnName.auto, item.OperationId);
                        this.appService.setFocus(elementId);
                    }
                    else {
                        const elementId = this.appService.getElementId(this.testBtnName.manual, item.OperationId);
                        this.appService.setFocus(elementId);
                    }
                }
            })
            if (!this.appService.checkNullOrUndefined(res.Response.IsOutBoundContainerReq) && res.Response.IsOutBoundContainerReq === CommonEnum.no) {
                this.isShowOutboundContainer = false;
            }
            else if (!this.appService.checkNullOrUndefined(res.Response.IsOutBoundContainerReq) && res.Response.IsOutBoundContainerReq === CommonEnum.yes) {
                this.isShowOutboundContainer = true;
            }

            if (res.Response.MoveEligible == CommonEnum.yes) {
                if (!this.appService.checkNullOrUndefined(res.Response.OperTransactions) && !this.appService.checkNullOrUndefined(res.Response.OperTransactions.Trans) && res.Response.OperTransactions.Trans.length) {
                    this.uiData.OperationId = res.Response.OperTransactions.Trans[0].OperationId;
                }
                if (this.masterPageService.hideControls.controlProperties.containerSuggestion == undefined && this.isShowOutboundContainer) {
                    this.configContainerProperties();
                    this.childContainer.suggestedContainerFocus();
                } else {
                    this.isSaveDisabled = false;
                    this.saveFocus();
                }
            }

            else if ((res.Response.OperTransactions.Trans[0].TestType == 'M' || res.Response.OperTransactions.Trans[0].TestType == 'B')
                && res.Response.OperTransactions.Trans[0].Status != this.testStatus.retest
                && (this.testDetails.IsAllTestsCompleted === CommonEnum.no ||
                    ((!this.appService.checkNullOrUndefined(this.testing.Device.AutoFail))
                        && this.testing.Device.AutoFail.hasOwnProperty("AutoFailLevel")
                        && this.testing.Device.AutoFail.AutoFailLevel === 1))) {
                this.getTransaction(res.Response.OperTransactions.Trans[0], 0);
                this.IsAllTestsCompleted = false;
            } else {
                this.transactionService.isAutoDisabled = false;
                this.transactionService.isManualDisabled = false;
                this.IsAllTestsCompleted = true;
            }
            this.transactionService.disabledSerialNumber = true;
            this.serailNumberonBlur();
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
            this.rmtextbox.applyRequired(true);
            this.rmtextbox.applySelect();
            this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
    }

    //need to updated uidata based on operation,
    getTransaction(item, parentIndex) {
        this.uiData.OperationId = item.OperationId;
        const autoFail = this.testing.Device.hasOwnProperty("AutoFail") ? this.testing.Device.AutoFail : null;
        this.transactionService.getTransaction(item, parentIndex, this.uiData, this.testDetails, null, autoFail);
    }

    //getTransactionResponse
    getTransactionResponse(res) {
        this.transactionsResponse = res.Response.TestTransactions;
        this.transactions = res.Response.TestTransactions.Trans;
        this.testing.Device.AutoFail = res.Response.AutoFail;
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
                });
            });
        }
    }

    //show auto manual buttoons
    showAutoManual(item) {
        this.spinner.show();
        this.uiData.OperationId = item.OperationId;
        this.IsAllTestsCompleted = true;
        if (this.masterPageService.hideControls.controlProperties.hasOwnProperty('isAutoDeviceProcessing')) {
            this.retryTestProfile();
        }
        this.transactionService.showAutoManual(item, this.testing.Device, this.uiData);
    }


    // send test profile for  automation device processing
    retryTestProfile() {
        const requestObj = { ClientData: this.clientData, UIData: this.uiData, Device: this.testing.Device };
        this.apiService.apiPostRequest(this.apiConfigService.retryTestProfileUrl, requestObj)
            .subscribe();
    }

    //showAutoManualResponse
    showAutoManualResponse(res) {
        this.testing.Device = res.Response.Device;
        this.testDetails = res.Response.TestDetails;
        this.masterPageService.operCategoryTests = res.Response.OperTransactions.Trans;
        if (!this.appService.checkNullOrUndefined(res.Response.OperTransactions.Trans)) {
            this.displayProp = res.Response.OperTransactions.Trans[0].DisplayProps;
        }
        if (res.Response.hasOwnProperty('IsPrintEnableReq') && res.Response.IsPrintEnableReq === CommonEnum.yes) {
            this.isSerialNoPrintDisabled = false;
        } else {
            this.isSerialNoPrintDisabled = true;
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
    }

    //get attribute values for IVC
    getTransAtrributeValues(transaction, event, rowIndex, parentItem, parentIndex) {
        this.scrollPosition = 0;
        this.testing.TestTransactions = this.transactionsResponse;
        this.scrollPosition = this.appService.getScrollPosition();
        this.transactionService.getTransAtrributeValues(transaction, event, rowIndex, parentItem, parentIndex, this.testing, this.uiData, this.scrollPosition)
    }
    //getTransAtrributeValuesResponse
    getTransAtrributeValuesResponse(res) {
        this.transactionsResponse = res.Response;
        this.transactions = res.Response.Trans;
        let resultControlId = '';
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
                });
            });
        }

        if (res.Response.DoneEnable == "Y") {
            this.transactionService.isDoneDisabled = false;
            this.appService.setFocus(this.testBtnName.done);
        }
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
            // this.showManualProcessTest(res);
        }
    }

    // show manual process test
    showManualProcessTest() {
        this.spinner.show();
        // this.testing.Device = res.Device;
        // this.testing.TestResultDetails = res.TestResultDetails;
        const requestObj = { ClientData: this.clientData, Device: this.testing.Device, TestTransactions: this.transactionsResponse, UIData: this.uiData };
        this.apiService.apiPostRequest(this.apiConfigService.manualTestUrl, requestObj)
            .subscribe(response => {
                const result = response.body;
                if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.pass) {
                    //  this.serviceTransactions = result.Response.ServiceTransactions;
                    //  this.routeAttributes = result.Response.RouteAttributes;
                    this.testing.Device = result.Response.Device;
                    this.isSaveDisabled = true;
                    this.transactionService.isAutoDisabled = true;
                    this.transactionService.isManualDisabled = true;
                    // this.loadProgramValues(this.testing.Device);
                    this.updateBatchDetailsTrans();
                    this.getAutoFailMessage();
                } else if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.fail) {
                    this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
                    this.spinner.hide();
                }

            },
                error => {
                    this.appErrService.handleAppError(error);
                });

    }



    getAutoFailMessage() {
        if (this.testing.Device.hasOwnProperty('AutoFail') && this.testing.Device.AutoFail && this.testing.Device.AutoFail.hasOwnProperty('AutoFailMessage') && this.testing.Device.AutoFail.AutoFailMessage) {
            this.snackbar.info(this.testing.Device.AutoFail.AutoFailMessage);
        }
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
                if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
                    this.testing.Device = res.Response;
                    this.getroute(this.testing.Device, this.routeAttributes);
                }
                else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
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
                if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
                    this.testing.Device = res.Response;
                    this.saveTransaction(this.serviceTransactions);
                }
                else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
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
        let requestObj = { ClientData: this.clientData, Transactions: serviceSaveTransactios, UIData: this.uiData, Device: this.testing.Device, TestResultDetails: this.testing.TestResultDetails };
        const url = String.Join("/", this.apiConfigService.saveTransaction);
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                let res = response.body;
                if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
                    this.saveSerialNumberTestResult(this.testing.Device);
                }
                else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
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
                if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
                    this.testResult = res.Response;
                    this.updateBatchDetailsTrans();
                }
                else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                    this.spinner.hide();
                }
            },
                error => {
                    this.appErrService.handleAppError(error);
                });
    }

    updateBatchDetailsTrans(resetFlag = CommonEnum.no) {
        if (!this.testing.Device.SamplingBatchId) {
            if (resetFlag == CommonEnum.no) {
                this.transactionService.getTest(this.testing.Device, this.uiData);
            }
            return;
        }
        this.spinner.show();
        const requestObj = { ClientData: this.clientData, Device: this.testing.Device, UIData: this.uiData };
        const url = String.Join('/', this.apiConfigService.updateBatchDetailsTrans, this.testing.Device.SamplingBatchId, this.testing.Device.TestResult, resetFlag);
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                let res = response.body;
                if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
                    if (resetFlag == CommonEnum.no) {
                        this.transactionService.getTest(this.testing.Device, this.uiData);
                    } else {
                        this.getBatchStatus(null);
                        this.spinner.hide();
                    }
                    if (!this.appService.checkNullOrUndefined(res.Response) &&
                        !this.appService.checkNullOrUndefined(res.Response.skipBatchProcess) &&
                        res.Response.skipBatchProcess === CommonEnum.yes) {
                        return;
                    }
                    this.transactionService.getSamplingDetails(this.uiData, this.testing.Device, resetFlag);
                }
                else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                    this.spinner.hide();
                }
            },
                error => {
                    this.appErrService.handleAppError(error);
                });
    }

    getBatchStatus(containerDevice, isSaveSerialNo = false) {
        this.moveBatchButton = CommonEnum.MOVEBATCH;
        this.isMoveDisabled = true;
        this.batchStatus = '';
        const requestObj = {
            ClientData: this.clientData,
            Device: containerDevice ? containerDevice : this.testing.Device, UIData: this.uiData
        };
        const IsConatinerLevel = containerDevice ? CommonEnum.yes : CommonEnum.no;
        const url = String.Join('/', this.apiConfigService.getBatchStatus, this.inbContainerID, IsConatinerLevel);
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                if (isSaveSerialNo) {
                    this.getQueuedTestSerialNumbers(isSaveSerialNo);
                }
                let res = response.body;
                if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
                    if (!this.appService.checkNullOrUndefined(res.Response) &&
                        !this.appService.checkNullOrUndefined(res.Response.skipBatchProcess) &&
                        res.Response.skipBatchProcess === CommonEnum.yes) {
                        return;
                    }
                    if (res.Response.hasOwnProperty('IsShowCloseContainer') && res.Response.IsShowCloseContainer === CommonEnum.yes) {
                        this.moveBatchButton = CommonEnum.CLOSECONTAINER;
                        this.isMoveDisabled = false;
                        this.batchStatus = CommonEnum.pass;
                    } else {
                        if (!this.appService.checkNullOrUndefined(res.Response.BatchSatus) &&
                            res.Response.BatchSatus != CommonEnum.inprocess
                            && res.Response.IsReachedMaxLimit === CommonEnum.yes) {
                            if (res.Response.hasOwnProperty('IsShowOnlyCloseBatch') &&
                                res.Response.IsShowOnlyCloseBatch === CommonEnum.yes) {
                                this.moveBatchButton = CommonEnum.CLOSEBATCH;
                            }
                            this.isMoveDisabled = false;
                            this.batchStatus = res.Response.BatchSatus;
                        }
                    }
                    if (this.isShowOutboundContainer && !containerDevice) {
                        this.updateBatchTaskResult();
                    }
                    if (res.StatusMessage) {
                        this.snackbar.info(res.StatusMessage);
                    }
                }
                else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                    this.spinner.hide();
                }
            },
                error => {
                    this.appErrService.handleAppError(error);
                });
    }


    updateBatchTaskResult() {
        if (!this.testing.Device.SamplingBatchId) {
            return;
        }
        const requestObj = {
            ClientData: this.clientData,
            UIData: this.uiData
        };
        const url = String.Join('/', this.apiConfigService.updateBatchTaskResult, this.inboundContainerId, this.testing.Device.SamplingBatchId);
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe();
    }

    printSerialNo() {
        this.isSerialNoPrintDisabled = true;
        this.spinner.show();
        const requestObj = { ClientData: this.clientData, UIData: this.uiData, Device: this.testing.Device };
        const url = String.Join('/', this.apiConfigService.createLabelUrl, this.uiData.OperationId);
        this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
            if (statusFlag) {
                this.spinner.hide();
                let userMessage = new Message();
                userMessage = this.messagingService.SendUserMessage('2660086', MessageType.success);
                if (userMessage.messageText) {
                    this.snackbar.success(userMessage.messageText);
                }
            } else {
                this.isSerialNoPrintDisabled = false;
            }
        });
    }


    // move batch
    moveBatch() {
        this.isMoveDisabled = true;
        if (this.moveBatchButton === CommonEnum.CLOSEBATCH) {
            this.getAQLDevices();
            return;
        }
        this.spinner.show();
        this.appErrService.clearAlert();
        const requestObj = {
            ClientData: this.clientData,
            Device: !this.appService.checkNullOrUndefined(this.testing.Device) ? this.testing.Device : this.contsummaryParent.deviceList[0], UIData: this.uiData
        };
        const inboundContainerID = this.inboundContainerId ? this.inboundContainerId : this.contsummaryParent.deviceList[0].ContainerID;
        const moveBatchFlag = this.moveBatchButton === CommonEnum.MOVEBATCH ? CommonEnum.no : CommonEnum.yes;
        const url = String.Join('/', this.apiConfigService.moveBatch, inboundContainerID, moveBatchFlag, this.batchStatus);
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                const res = response.body;
                if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
                    if (res.Response) {
                        this.snackbar.success(res.Response);
                    }
                    this.Clear();
                } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
                    this.isMoveDisabled = false;
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                }
                this.spinner.hide();
            },
                error => {
                    this.isMoveDisabled = false;
                    this.appErrService.handleAppError(error);
                });
    }


    setSaveValue(val) {
        this.isSaveDisabled = val;
    }


    validateAndUpdateDevice() {
        this.setSaveValue(true);
        this.lottableTrans = new LottableTrans();
        this.spinner.show();
        const requestObj = {
            ClientData: this.clientData, ReadonlyDevice: this.readOnlyDevice,
            Device: this.testing.Device, TestResult: this.testResult, LottableTrans: this.lottableTrans, UIData: this.uiData
        };
        const url = String.Join('/', this.apiConfigService.validateAndUpdateDevice);
        this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
            if (statusFlag) {
                this.testing.Device = res.Response.Device;
                this.serialNumber = '';
                if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
                    this.contsummaryParent.isClearDisabled = false;
                }
                this.transactionService.isAutoDisabled = true;
                this.transactionService.isManualDisabled = true;
                this.displayProperites = null;
                this.masterPageService.getCategoryTest();
                this.clearContainerID();
                this.getBatchStatus(null, true);
            } else {
                (res.Response.hasOwnProperty('IsValidationFail') === CommonEnum.yes) ? this.Clear() : this.setSaveValue(false);
            }
        });
    }

    //refreshContainer
    refreshContainer() {
        this.spinner.show();
        //settting this flag to avoid two error messages
        this.isProcessComplete(true);
        let requestObj = { ClientData: this.clientData, UIData: this.uiData, Containers: this.multipleContainerList, Devices: this.contsummaryParent.deviceList };
        const url = String.Join("/", this.apiConfigService.refreshContainerUrl, this.inboundContainerId);
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                let result = response.body;
                let canHideSpinner = true;
                this.isSerialNumberValidated = false;
                this.isProcessComplete(true);
                if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.pass) {
                    if (result.Response.Quantity == 0) {
                        if (result.StatusMessage) {
                            this.snackbar.success(result.StatusMessage);
                        }
                        //whirlpool
                        if (!this.appService.checkNullOrUndefined(this.contsummaryParent) && this.contsummaryParent.containerSummaryPropertiesList.length == 0) {
                            this.Clear();
                        } else { //verizon
                            if (!this.appService.checkNullOrUndefined(this.contsummaryParent) && this.contsummaryParent.containerSummaryPropertiesList.length
                                && !this.appService.checkNullOrUndefined(result.Response.canAllowNextContainer)) {
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
                                    this.Clear();
                                } else if (result.Response.canAllowNextContainer == 'N') {
                                    this.serialNumberClear();
                                    this.isProcessComplete(false);
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
                        this.container.Quantity = result.Response.Quantity;
                        if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
                            this.contsummaryParent.quantity = (this.container.Quantity).toString();
                        }
                        if (!this.appService.checkNullOrUndefined(this.contsummaryParent) && this.contsummaryParent.containerSummaryPropertiesList.length
                            && !this.appService.checkNullOrUndefined(result.Response.canAllowNextContainer)) {
                            let index = this.contsummaryParent.containerSummaryPropertiesList.findIndex(c => c.containerId == this.inboundContainerId);
                            if (index != -1) {
                                this.contsummaryParent.containerSummaryPropertiesList[index].inboundProperties.Quantity = result.Response.Quantity;
                            }
                            if (result.Response.canAllowNextContainer === CommonEnum.yes) {
                                this.clearContainerSummary();
                            }
                        } else {
                            if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
                                canHideSpinner = false;
                                this.contsummaryParent.getInboundDetails();
                            }
                        }
                        this.serialNumberClear();
                        this.isProcessComplete(false);
                    }
                    if (canHideSpinner) {
                        this.spinner.hide();
                    }
                } else if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.fail) {
                    //this.Clear();
                    this.spinner.hide();
                    this.masterPageService.inboundContainerFocus();
                    if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
                        this.contsummaryParent.rmtextchild.applySelect();
                        this.contsummaryParent.rmtextchild.applyRequired(true);
                    }
                    this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
                    this.isProcessComplete(false);
                }
            },
                error => {
                    this.appErrService.handleAppError(error);
                    this.isProcessComplete(false);
                });
    }

    //updateLottables
    updateLottables() {
        this.lottableTrans = new LottableTrans();
        let requestObj = { ClientData: this.clientData, UIData: this.uiData, Device: this.testing.Device, LottableTrans: this.lottableTrans };
        this.apiService.apiPostRequest(this.apiConfigService.updateLottables, requestObj)
            .subscribe(response => {
                let res = response.body;
                if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                }
            }, erro => {
                this.appErrService.handleAppError(erro);
            });
    }

    //auto que (getQueuedSerialNumbers)
    getQueuedSerialNumbers() {
        this.spinner.show();
        if (this.pollingData != undefined) {
            this.pollingData.unsubscribe();
            this.masterPageService.tempQueList = null;
            this.clear.click();
        }
        if (this.masterPageService.categoryName != undefined && this.masterPageService.categoryName != "" && this.inbContainerID != "") {
            let container = new Container();
            let timeinterval: number = this.appConfig.testing.queueInterval;
            container.ClientId = this.clientData.ClientId;
            let containerId = this.inbContainerID;
            let requestObj = { ClientData: this.clientData, UIData: this.uiData, Containers: this.multipleContainerList };
            container.ContainerID = containerId != null ? containerId : "";
            const url = String.Join("/", this.apiConfigService.getQueuedSerialNumbersUrl);
            this.clear = document.getElementById('stopProcessQueue');
            // const stop$ = fromEvent(this.clear, 'click');
            this.pollingData = interval(timeinterval).pipe(
                startWith(0),
                switchMap(() => this.apiService.apiPostRequest(url, requestObj)))
                .subscribe(response => {
                    let res = response.body;
                    this.count++;
                    if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
                        if (res.Response.length > 0) {
                            this.temList = res.Response;
                            this.onProcessQueGenerateJsonGrid(res.Response);
                            this.grid = new Grid();
                            this.grid.ItemsPerPage = this.appConfig.testing.griditemsPerPage;
                            this.masterPageService.tempQueList = this.appService.onGenerateJson(this.processQueData, this.grid);
                            if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
                                this.contsummaryParent.isClearDisabled = false;
                            }
                        }
                    }
                    else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
                        this.spinner.hide();
                        if (this.isProcessCompleted == false) {
                            if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
                                this.contsummaryParent.isClearDisabled = false;
                                this.contsummaryParent.inbContainerDisabled = false;
                                this.contsummaryParent.rmtextchild.applyRequired(true);
                                this.contsummaryParent.rmtextchild.applySelect();
                                this.contsummaryParent.quantity = "";
                                this.contsummaryParent.category = "";
                            }
                            this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                        } else {
                            if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
                                this.contsummaryParent.isClearDisabled = true;
                                this.contsummaryParent.inbContainerDisabled = false;
                                this.contsummaryParent.rmtextchild.applySelect();
                                this.contsummaryParent.quantity = "";
                                this.contsummaryParent.category = "";
                            }
                        }
                        this.transactionService.disabledSerialNumber = true;
                        this.masterPageService.tempQueList = null;
                        this.temList = [];
                        this.pollingData.unsubscribe();
                    }
                },
                    error => {
                        this.appErrService.handleAppError(error);
                    });
        }
        else {
            this.spinner.hide();
            let userMessage = new Message();
            this.messageNum = "8780013";
            this.messageType = MessageType.failure;
            userMessage = this.messagingService.SendUserMessage(this.messageNum, this.messageType);
            this.appErrService.setAlert(userMessage.messageText, true);
        }
    }

    // performPortClear
    performPortClear() {
        const requestObj = { ClientData: this.clientData, UIData: this.uiData, Device: this.testing.Device };
        this.apiService.apiPostRequest(this.apiConfigService.performPortClearUrl, requestObj)
            .subscribe(response => {
                const res = response.body;
                // if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
                //   this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                // }
            }, erro => {
                this.appErrService.handleAppError(erro);
            });
    }

    getSamplingDetails(device) {
        this.transactionService.getSamplingDetails(this.uiData, device, CommonEnum.no, CommonEnum.yes);
        this.getQueuedTestSerialNumbers();
        this.getBatchStatus(this.contsummaryParent.deviceList[0]);
        this.commonService.getOperations(this.operationObj.Module, this.contsummaryParent.deviceList[0], this.uiData);
    }


    getQueuedTestSerialNumbers(isSaveSerialNo = false) {
        let requestObj = { ClientData: this.clientData, UIData: this.uiData, Containers: this.multipleContainerList };
        const testurl = String.Join('/', this.apiConfigService.getQueuedTestSerialNumbers);
        this.apiService.apiPostRequest(testurl, requestObj)
            .subscribe(response => {
                let res = response.body;
                if (isSaveSerialNo) {
                    if (this.masterPageService.hideControls.controlProperties.hasOwnProperty('isAutoDeviceProcessing')) {
                        this.performPortClear();   //  for auto device processing, need to cal before refresh container
                    }
                    this.refreshContainer();
                }
                if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
                    this.grid = new Grid();
                    this.grid.ItemsPerPage = this.appConfig.testing.griditemsPerPage;
                    const data = this.masterPageService.hideControls;
                    if (data.controlProperties.hasOwnProperty('gridRequiredProp') &&
                        (!checkNullorUndefined(data.controlProperties.gridRequiredProp)) &&
                        data.controlProperties.gridRequiredProp.hasOwnProperty('grid1')) {
                        const value = data.controlProperties.gridRequiredProp.grid1;
                        const key = Object.keys(data.controlProperties.gridRequiredProp)[Object.values(data.controlProperties.gridRequiredProp).indexOf(value)];
                        if (!checkNullorUndefined(key)) {
                            this.grid.RequiredColConfig = key;
                        }
                        if (!checkNullorUndefined(res.Response)) {
                            this.processQueData = res.Response;
                            this.masterPageService.gridContainerDetails = this.appService.onGenerateJson(res.Response, this.grid);
                        }
                    } else {
                        this.onProcessQueGenerateJsonGrid(res.Response);
                        this.masterPageService.gridContainerDetails = this.appService.onGenerateJson(this.processQueData, this.grid);
                    }
                }
                else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                    this.spinner.hide();
                }
            },
                error => {
                    this.appErrService.handleAppError(error);
                });
    }

    //add to queue on Auto
    autoTestQueueData(item) {
        this.spinner.show();
        let requestObj = { ClientData: this.clientData, Device: this.testing.Device, UIData: this.uiData };
        const url = String.Join("/", this.apiConfigService.addTestQueueDataUrl, item.TransId);
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                let result = response.body;
                this.spinner.hide();
                if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.pass) {
                    this.snackbar.success(result.StatusMessage);
                    this.serialNumber = ""
                    this.transactionService.disabledSerialNumber = false;
                    this.serailNumberFocus();
                    this.masterPageService.getCategoryTest();
                    this.transactionService.isAutoDisabled = true;
                    this.transactionService.isManualDisabled = true;
                    this.rmtextbox.applyRequired(false);
                }
                else if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.fail) {
                    this.spinner.hide();
                    this.transactionService.disabledSerialNumber = false;
                    this.rmtextbox.applyRequired(true);
                    this.rmtextbox.applySelect();
                    this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
                }

            },
                error => {
                    this.appErrService.handleAppError(error);
                });
    }

    //showTransResults
    showTransResults(item) {
        item.isEditable = !item.isEditable;
        this.uiData.OperationId = item.OperationId;
        if (item.isEditable) {
            if (!this.appService.checkNullOrUndefined(this.serialNumber)) {
                this.spinner.show();
                let requestObj = { ClientData: this.clientData, UIData: this.uiData };
                const url = String.Join("/", this.apiConfigService.showTransResultsUrl, this.uiData.OperationId, this.serialNumber);
                this.apiService.apiPostRequest(url, requestObj)
                    .subscribe(response => {
                        let res = response.body;
                        this.spinner.hide();
                        if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
                            if (res.Response.TestTransactions.Trans.length > 0) {
                                this.transactionService.transactions = res.Response.TestTransactions.Trans;
                            }
                        }
                        else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
                            this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                        }

                    },
                        error => {
                            this.appErrService.handleAppError(error);
                        });
            }
        }
    }


    isProcessComplete(val) {
        this.isProcessCompleted = val;
    }



    //change input
    changeInput() {
        this.isTestsClearDisabled = false;
        this.appErrService.clearAlert();
    }

    //reset button
    Clear() {
        this.processQueData = [];
        this.isMoveDisabled = true;
        this.masterPageService.getCategoryTest();
        this.clearContainerSummary();
        this.serialNumber = "";
        this.isSerialNoPrintDisabled = true;
        this.transactionService.disabledSerialNumber = true;
        if (this.pollingData != undefined) {
            this.pollingData.unsubscribe();
            this.masterPageService.tempQueList = null;
        }
        this.moveBatchButton = CommonEnum.MOVEBATCH;
        this.masterPageService.samplingBatchDeatil = null;
        this.masterPageService.gridContainerDetails = null;
        this.isTestsClearDisabled = true;
        this.transactionService.isAutoDisabled = true;
        this.transactionService.isManualDisabled = true;
        this.isSaveDisabled = true;
        this.masterPageService.disabledContainer = false;
        this.masterPageService.inboundContainerFocus();
        this.appErrService.clearAlert();
        this.clearContainerID();
        this.inboundProperties = null;
        this.masterPageService.operationDisabled = false;
        this.temList = [];
        this.isAutoPopulatedSerialNumber = false;
        this.headingsobj = [];
        this.displayPropheadingobj = [];
        this.displayProperites = null;
        //  this.uiData.OperationId = this.uiDataOpearionId;
        this.isSerialNumberValidated = false;
        if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
            this.contsummaryParent.containersList = [];
            this.contsummaryParent.deviceList = [];
            this.contsummaryParent.containerSummaryPropertiesList = [];
            this.contsummaryParent.canAllowNextContainerStatus = null;
            this.contsummaryParent.containerSummaryProperties = [];
            this.contsummaryParent.containerActualProp = null;
        }
        this.multipleContainerList = null;
        this.isProcessComplete(false);
        this.showActiveOperationFlag = true;
        this.batchId = '';
        this.uiData.OperationId = this.operationId;
    }

    private clearContainerSummary() {
        if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
            this.contsummaryParent.inbContainerDisabled = false;
            this.contsummaryParent.rmtextchild.value = "";
            this.contsummaryParent.quantity = "";
            this.contsummaryParent.category = "";
            this.contsummaryParent.isClearDisabled = true;
        }
    }

    //clear button
    serialNumberClear() {
        //this.masterPageService.getCategoryTest();
        this.masterPageService.operCategoryTests = this.commonService.operationList;
        this.transactionService.isAutoDisabled = true;
        this.transactionService.isManualDisabled = true;
        this.isSaveDisabled = true;
        if (!this.isAutoPopulatedSerialNumber) {
            this.serialNumber = "";
        }
        this.isSerialNoPrintDisabled = true;
        this.transactionService.disabledSerialNumber = false;
        this.serailNumberFocus();
        this.isTestsClearDisabled = true;
        this.clearContainerID();
        this.appErrService.setAlert("", false);
        this.displayProperites = null;
        //this.uiData.OperationId = this.uiDataOpearionId;
        this.isSerialNumberValidated = false;
        this.isShowOutboundContainer = true;
        this.showActiveOperationFlag = true;
        this.readOnlyDevice = {};
        this.IsAllTestsCompleted = true;
    }

    //clear container suggestion
    clearContainerID() {
        if (!this.appService.checkNullOrUndefined(this.childContainer)) {
            let container = this.childContainer;
            container.ContainerID = "";
            container.suggestedContainer = "";
            container.categoryName = "";
            container.isContainerDisabled = true;
            container.isClearContainerDisabled = true;
            container.applyRequired(false);
        }
    }

    //save button foucs
    saveFocus() {
        this.appService.setFocus('save');
    }
    //conatiner focus
    containerFocus() {
        this.appService.setFocus('containerInputId');
    }
    //Refresh and getSuggestionContainer(focus)
    //getSuggestContainer sending receive device to child conatiner
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

    //validateContainer and sending updated device to child conatiner
    validateContainer(response) {
        if (response.ContainerID != null && response.ContainerID != undefined) {
            this.testing.Device.ContainerID = response.ContainerID;
            this.testing.Device.ContainerCycle = response.ContainerCycle;
        }
        this.childContainer.validateContainer(this.testing.Device);

    }

    //validate container fail response
    emitValidateContainerFailResponse(response) {
        if (!this.appService.checkNullOrUndefined(response)) {
            this.testing.Device.ContainerID = response.ContainerID;
            this.testing.Device.ContainerCycle = response.ContainerCycle;
        }
    }


    //validateConta iner Response from child conatiner
    validateContainerResponse(response) {
        if (!this.appService.checkNullOrUndefined(response)) {
            this.container = response;
            this.isSaveDisabled = true;
            this.testing.Device.ContainerCycle = response.ContainerCycle;
            this.testing.Device.ContainerID = response.ContainerID;
            this.validateAndUpdateDevice();
        }
        else {
            this.validateAndUpdateDevice();
        }
    }

    //container Summary response
    getContainerSummaryResponse(response) {
        this.inbContainerResponse = response;
    }

    //input match
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




    //Process que generation
    onProcessQueGenerateJsonGrid(Response) {
        if (!this.appService.checkNullOrUndefined(Response)) {
            let ChildElements = [];
            this.processQueData = [];
            Response.forEach(res => {
                let element: any = { ChildElements: ChildElements };
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

    getAQLDevices() {
        this.commonService.getFailedDevices(this.inbContainerID).subscribe(res => {
            if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
                if (!this.appService.checkNullOrUndefined(res.Response)) {
                    if (!this.appService.checkNullOrUndefined(res.Response.batchId)) {
                        this.batchId = res.Response.batchId;
                    }
                    if (!res.Response.deviceErrors.length) {
                        this.closeSamplingBatch();
                    } else {
                        this.masterPageService.openModelPopup(this.failedDevicemodal, true);
                        this.failedDevicesData = res.Response.deviceErrors;
                        this.spinner.hide();
                    }
                }
            } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
                this.spinner.hide();
                this.isMoveDisabled = false;
                this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
            }
        });
    }

    closeSamplingBatch() {
        this.commonService.closeSamplingBatch(this.inbContainerID, this.batchId, this.uiData, this.batchStatus).subscribe(res => {
            if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
                if (res.Response) {
                    this.snackbar.success(res.Response);
                }
                this.Clear();
                this.spinner.hide();
            } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
                this.spinner.hide();
                this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
            }
        });
    }

    ngOnDestroy() {
        clearInterval(this.intervalId);
        if (this.pollingData != undefined) {
            this.pollingData.unsubscribe();
            this.clear.click();
            this.masterPageService.tempQueList = null;
        }
        this.isShowOutboundContainer = true;
        this.masterPageService.samplingBatchDeatil = null;
        this.masterPageService.gridContainerDetails = null;
        this.inbContainerResponse = null;
        this.masterPageService.categoryName = null;
        this.masterPageService.disabledContainer = true;
        this.transactionService.disabledSerialNumber = true;
        this.masterPageService.hideSpinner = false;
        this.masterPageService.operationList = [];
        this.masterPageService.operationsdropdown = [];
        this.masterPageService.operCategoryTests = [];
        this.commonService.operationList = [];
        this.subscription.unsubscribe();
        this.masterPageService.setDropDown(false);
        this.masterPageService.clearModule();
        this.masterPageService.operation = "";
        this.transactionsResponse = [];
        this.transactions = [];
        this.appErrService.clearAlert();
        this.transactionService.transactions = [];
        this.transactionService.transactionsResponse = [];
        //clearing the transactionSerice subscription methods data
        this.transactionService.clearSubscription();
        //unsubscribing the emit methods from transactionservice
        this.emitGetTestResponse.unsubscribe();
        this.emitGetTransaction.unsubscribe();
        this.emitGetTransAtrributeValues.unsubscribe();
        this.emitShowAutoManual.unsubscribe();
        this.emitDoneManualTransactionResponse.unsubscribe();
        //clearing the readOnlyDevice subscription methods data
        this.commonService.emitReadOnlyDeviceResponse.next(null);
        this.emitReadOnlyDeviceResponse.unsubscribe();
        this.masterPageService.moduleName.next(null);
        this.masterPageService.emitUiData.next(null);
        this.emitHideSpinner.unsubscribe();
        this.masterPageService.emitHideSpinner.next(null);
        this.masterPageService.uiData = null;
        this.masterPageService.showUtilityIcon = false;
        if (!this.appService.checkNullOrUndefined(this.originationOperation) && this.originationOperation) {
            this.originationOperation.unsubscribe();
        }
        this.masterPageService.clearOriginationSubscription();
        if (this.masterPageService.hideControls.controlProperties) {
            this.masterPageService.hideControls.controlProperties = new EngineResult();
        }
        if (this.contsummaryParent) {
            if (this.contsummaryParent.dialogRef) {
                this.contsummaryParent.dialogRef.close();
            }
            this.contsummaryParent.containersList = [];
            this.contsummaryParent.deviceList = [];
        }
        if (this.dialogRef) {
            this.dialogRef.close();
        }
        this.masterPageService.hideDialog();
        this.commonService.readOnlyDevice = null;

    }
}



