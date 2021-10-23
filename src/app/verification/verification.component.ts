import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, Input, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppErrorService } from './../utilities/rlcutl/app-error.service';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiConfigService } from './../utilities/rlcutl/api-config.service';
import { ApiService } from './../utilities/rlcutl/api.service';
import { AppService } from './../utilities/rlcutl/app.service';
import { dropdown } from './../models/common/Dropdown';
import { String, StringBuilder } from 'typescript-string-operations';
import { AutomationQueue } from './../models/testing/AutomationQueue';
import { Container } from './../models/common/Container';
import { TestingDevice } from '../models/testing/TestingDevice';
import { ContainerSummaryComponent } from './../framework/busctl/container-summary/container-summary.component';
import { MasterPageService } from './../utilities/rlcutl/master-page.service';
import { RmtextboxComponent } from './../framework/frmctl/rmtextbox/rmtextbox.component';
import { TestTransaction } from './../models/testing/Transaction';
import { ContainerSuggestionComponent } from '../framework/busctl/container-suggestion/container-suggestion.component';
import { TestStatus } from '../enums/testStatus.enum';
import { SerialNumberStatus } from '../enums/serialnumberStatus.enum';
import { TestBtnNames } from './../enums/test-btn-names.enum';
import { Grid } from '../models/common/Grid';
import { Message } from '../models/common/Message';
import { MessageType } from '../enums/message.enum';
import { MessagingService } from '../utilities/rlcutl/messaging.service';
import { TransactionService } from '../services/transaction.service';
import { Testing, TestingDeviceRoutes } from '../models/testing/Testing';
import { ClientData } from '../models/common/ClientData';
import { UiData } from '../models/common/UiData';
import { LottableTrans } from '../models/common/LottableTrans';
import { EngineResult } from '../models/common/EngineResult';
import { TraceTypes } from '../enums/traceType.enum';
import { CommonService } from '../services/common.service';
import { FindTraceHoldComponent } from '../framework/busctl/find-trace-hold/find-trace-hold.component';
import { StorageData } from '../enums/storage.enum';
import { StatusCodes } from '../enums/status.enum';
import { ContainerDevice } from '../models/verification/container-device';
import { CommonEnum } from '../enums/common.enum';
import { checkNullorUndefined } from '../enums/nullorundefined';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-verification',
    templateUrl: './verification.component.html',
    styleUrls: ['./verification.component.css']
})
export class VerificationComponent implements OnInit, OnDestroy {

    @ViewChild(ContainerSummaryComponent) contsummaryParent: ContainerSummaryComponent;
    @ViewChild(RmtextboxComponent) rmtextbox: RmtextboxComponent;
    @ViewChild(ContainerSuggestionComponent) childContainer: ContainerSuggestionComponent;
    @ViewChild('serialNumberInput') serialnumberInput: ElementRef;


    serialNumber = "";
    suggestedContainerID = "";
    inbContainerID = "";
    isSaveDisabled = true;
    isTestsClearDisabled = true;
    isAutoPopulatedSerialNumber = false;

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
    inbContainerResponse: any;
    transactions = [];
    serialNumbers = [];



    //Testing objects
    testing = new Testing();

    deviceRoutes = new TestingDeviceRoutes();
    clientData = new ClientData();
    container = new Container();
    uiData = new UiData();
    lottableTrans: LottableTrans;

    // //enum
    testStatus = TestStatus;
    testBtnName = TestBtnNames;

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

    //dynamic panel scrolling
    scrollPosition: number;

    //originaiton operation
    originationOperation: Subscription;
    deviceOrigination: string;

    //container Summary properties
    multipleContainerList: any;
    inboundContainerId: string;
    validTestSerialNumberResponse: any;
    testResult: any;

    containerDevice = new ContainerDevice();
    isFailAllDisabled = true;
    isMoveDisabled = true;
    isShowOutboundContainer = true;

    moveBatchButton = CommonEnum.MOVEBATCH;
    commonEnum = CommonEnum;
    operationId: string;
    dialogRef: any;

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
        private dialog: MatDialog

    ) {
        //emitting testing response
        this.emitGetTestResponse = this.transactionService.emitGetTestResponse.subscribe(res => {
            if (!checkNullorUndefined(res)) {
                this.getTestResponse(res);
            }
        });
        //emitting gettransaction response
        this.emitGetTransaction = this.transactionService.emitGetTransaction.subscribe(res => {
            if (!checkNullorUndefined(res)) {
                this.getTransactionResponse(res);
            }
        });
        //emitting showAutoManual response
        this.emitShowAutoManual = this.transactionService.emitShowAutoManual.subscribe(res => {
            if (!checkNullorUndefined(res)) {
                this.showAutoManualResponse(res);
            }
        });
        //emitting emitGetTransAtrributeValues response
        this.emitGetTransAtrributeValues = this.transactionService.emitGetTransAtrributeValues.subscribe(res => {
            if (!checkNullorUndefined(res)) {
                this.getTransAtrributeValuesResponse(res);
            }
        });
        //emitDoneManualTransaction response
        this.emitDoneManualTransactionResponse = this.transactionService.doneManualTransactionResponse.subscribe(doneResponse => {
            if (!checkNullorUndefined(doneResponse)) {
                this.getdoneManualTransactionResponse(doneResponse);
            }
        });
        //emitting readOnlyDevice response
        this.emitReadOnlyDeviceResponse = this.commonService.emitReadOnlyDeviceResponse.subscribe(res => {
            if (!checkNullorUndefined(res)) {
                if (!checkNullorUndefined(res.Status) && res.Status == StatusCodes.pass) {
                    this.validTestSerialNumber();
                } else if (!checkNullorUndefined(res.Status) && res.Status == StatusCodes.fail) {
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
            //this.uiDataOpearionId = this.operationObj.OperationId;
            this.masterPageService.containerDetailsHeader(CommonEnum.containerDetails);
            this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
            this.masterPageService.setTitle(this.operationObj.Title);
            this.masterPageService.setModule(this.operationObj.Module);
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

    // inbContainerID
    getinbContainerID(inbcontid) {
        this.inbContainerID = inbcontid;
    }

    getContainerList(event) {
        this.multipleContainerList = event;
    }

    // validateTestSerialNumber
    validateTestSerialNumber(serialNumber, inpcontrol: any) {
        if (serialNumber != "") {
            //this.uiData.OperationId = this.uiDataOpearionId;
            this.testing.Device = new TestingDevice();
            if (!checkNullorUndefined(this.deviceOrigination) && this.deviceOrigination != '') {
                this.testing.Device.Origination = this.deviceOrigination;
            }
            this.clearContainerID();
            this.isTestsClearDisabled = false;
            this.spinner.show();
            this.appErrService.clearAlert();
            this.testing.Device.SerialNumber = serialNumber;
            localStorage.setItem(StorageData.testSerialNumber, this.testing.Device.SerialNumber);
            this.testing.Device.Clientid = this.clientData.ClientId;
            let requestObj = { ClientData: this.clientData, UIData: this.uiData, Containers: this.multipleContainerList };
            const url = String.Join("/", this.apiConfigService.validateTestSerialNumberUrl, this.testing.Device.SerialNumber, this.masterPageService.categoryName);
            this.apiService.apiPostRequest(url, requestObj)
                .subscribe(response => {
                    let result = response.body;
                    if (!checkNullorUndefined(result) && result.Status === StatusCodes.pass) {
                        this.validTestSerialNumberResponse = response.body;
                        let traceData = { traceType: TraceTypes.serialNumber, traceValue: this.validTestSerialNumberResponse.Response.SerialNumber, uiData: this.uiData }
                        let traceResult = this.commonService.findTraceHold(traceData, this.uiData);
                        traceResult.subscribe(result => {
                            if (!checkNullorUndefined(result) && result.Status === StatusCodes.pass) {
                                if (checkNullorUndefined(result.Response)) {
                                    this.commonService.getReadOnlyDeviceDetails(this.validTestSerialNumberResponse.Response.SerialNumber, this.uiData);
                                } else {
                                    this.canProceed(result, TraceTypes.serialNumber)
                                }
                            } else if (!checkNullorUndefined(result) && result.Status === StatusCodes.fail) {
                                this.spinner.hide();
                                this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
                            }
                        });
                    }
                    else if (!checkNullorUndefined(result) && result.Status === StatusCodes.fail) {
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
    }

    validTestSerialNumber(result = this.validTestSerialNumberResponse) {
        this.testing.Device = result.Response;
        //inboundContainerid its storing for sending request of current inbound container id
        this.inboundContainerId = this.testing.Device.ContainerID;
        if (!checkNullorUndefined(this.contsummaryParent)) {
            this.contsummaryParent.searchContainerID(this.testing.Device.ContainerID);
        }
        this.transactionService.getTest(this.testing.Device, this.uiData);
        this.validTestSerialNumberResponse = null;
    }

    canProceed(traceResponse, type) {
        if (traceResponse.Response.canProceed == CommonEnum.yes) {
            this.appErrService.setAlert(traceResponse.StatusMessage, true, MessageType.info);
        }
        if (!checkNullorUndefined(traceResponse.Response.TraceHold)) {
            let uiObj = { uiData: this.uiData }
            traceResponse = Object.assign(traceResponse, uiObj);
            this.dialogRef = this.dialog.open(FindTraceHoldComponent, { hasBackdrop: true, disableClose: true, panelClass: 'dialog-width-sm', data: { modalData: traceResponse } });
            this.dialogRef.afterClosed().subscribe((returnedData) => {
                if (returnedData) {
                    if (returnedData.Response.canProceed == CommonEnum.yes) {
                        if (type == TraceTypes.serialNumber) {
                            this.commonService.getReadOnlyDeviceDetails(this.validTestSerialNumberResponse.Response.SerialNumber, this.uiData);
                        }
                    } else if (returnedData.Response.canProceed == CommonEnum.no) {
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

    //auto populate serial number
    getAutoPopulatedSerailNum(event: any) {
        if (!checkNullorUndefined(event) && event != '') {
            this.serialNumber = event;
            this.validateTestSerialNumber(this.serialNumber, this.serialnumberInput);
            this.transactionService.disabledSerialNumber = true;
            this.isTestsClearDisabled = false;
            this.isAutoPopulatedSerialNumber = true;
        } else {
            if (this.serialNumber) {
                this.transactionService.disabledSerialNumber = true;
            } else {
                this.transactionService.disabledSerialNumber = false;
                this.serailNumberFocus();
            }
            this.isTestsClearDisabled = false;
            this.getContainersDevices();
        }
    }


    //containerSummaryProperties
    containerSummaryProperties(event: any) {
        this.headingsobj = [];
        this.headingsobj = Object.keys(event);
        this.inboundProperties = event;
    }

    //getTest Response
    getTestResponse(res) {
        if (!checkNullorUndefined(res) && res.Status === StatusCodes.pass) {
            this.masterPageService.operCategoryTests = res.Response.OperTransactions.Trans;
            if (!checkNullorUndefined(res.Response.OperTransactions.Trans)) {
                this.displayProp = res.Response.OperTransactions.Trans[0].DisplayProps;
            }
            this.displayPropheadingobj = [];
            this.displayPropheadingobj = Object.keys(this.displayProp);
            this.displayProperites = this.displayProp;
            this.testing.Device = res.Response.Device;
            this.testResult = res.Response.TestResult;
            this.masterPageService.operCategoryTests.forEach((item, i) => {
                if (item.Status == TestStatus.inprocess) {
                    if (item.TestType == "A" || item.TestType == "B") {
                        const elementId = this.appService.getElementId(TestBtnNames.auto, item.OperationId);
                        this.appService.setFocus(elementId);
                    }
                    else {
                        const elementId = this.appService.getElementId(TestBtnNames.manual, item.OperationId);
                        this.appService.setFocus(elementId);
                    }
                }
            })
            if (!checkNullorUndefined(res.Response.IsOutBoundContainerReq) && res.Response.IsOutBoundContainerReq === CommonEnum.no) {
                this.isShowOutboundContainer = false;
            }
            else if (!checkNullorUndefined(res.Response.IsOutBoundContainerReq) && res.Response.IsOutBoundContainerReq === CommonEnum.yes) {
                this.isShowOutboundContainer = true;
            }
            if (res.Response.MoveEligible == CommonEnum.yes) {
                if (!checkNullorUndefined(res.Response.OperTransactions) && !checkNullorUndefined(res.Response.OperTransactions.Trans) && res.Response.OperTransactions.Trans.length) {
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
            this.transactionService.disabledSerialNumber = true;
            this.transactionService.isAutoDisabled = false;
            this.transactionService.isManualDisabled = false;
            this.serailNumberonBlur();
        } else if (!checkNullorUndefined(res) && res.Status === StatusCodes.fail) {
            this.rmtextbox.applyRequired(true);
            this.rmtextbox.applySelect();
            this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
    }

    //need to updated uidata based on operation,
    getTransaction(item, parentIndex) {
        this.uiData.OperationId = item.OperationId;
        this.transactionService.getTransaction(item, parentIndex, this.uiData, null, this.testing.Device, null);
    }

    //getTransactionResponse
    getTransactionResponse(res) {
        this.transactionsResponse = res.Response.TestTransactions;
        this.transactions = res.Response.TestTransactions.Trans;
        // get controlid based on attribute ('RESULT') ,
        let resultControlId = '';
        if (this.transactionsResponse.DoneEnable == CommonEnum.yes) {
            this.transactionService.isDoneDisabled = false;
            this.appService.setFocus(TestBtnNames.done);
        }
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

    //show auto manual buttoons
    showAutoManual(item) {
        this.spinner.show();
        this.uiData.OperationId = item.OperationId;
        this.transactionService.showAutoManual(item, this.testing.Device, this.uiData);
    }

    //showAutoManualResponse
    showAutoManualResponse(res) {
        this.testing.Device = res.Response.Device;
        this.masterPageService.operCategoryTests = res.Response.OperTransactions.Trans;
        if (!checkNullorUndefined(res.Response.OperTransactions.Trans)) {
            this.displayProp = res.Response.OperTransactions.Trans[0].DisplayProps;
        }
        this.displayPropheadingobj = [];
        this.displayPropheadingobj = Object.keys(this.displayProp);
        this.displayProperites = this.displayProp;
        this.masterPageService.operCategoryTests.forEach((item, i) => {
            if (item.Status == TestStatus.inprocess) {

                if (item.TestType == "A" || item.TestType == "B") {
                    const elementId = this.appService.getElementId(TestBtnNames.auto, item.OperationId);
                    this.appService.setFocus(elementId);
                }
                else {
                    const elementId = this.appService.getElementId(this.controlConfig.testBtnNameManual, item.OperationId);
                    this.appService.setFocus(elementId);
                }

            }
            else if (item.Status == TestStatus.retest) {
                const elementId = this.appService.getElementId(TestBtnNames.retest, item.OperationId);
                this.appService.setFocus(elementId);
            }
        })
        if (res.Response.MoveEligible == CommonEnum.no) {
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

        if (res.Response.DoneEnable == CommonEnum.yes) {
            this.transactionService.isDoneDisabled = false;
        }
    }
    //Done
    doneManualTransaction(item) {
        this.testing.TestTransactions = this.transactionsResponse;
        this.transactionService.doneManualTransaction(item, this.testing, this.uiData);
    }

    //getdoneManualTransactionResponse
    getdoneManualTransactionResponse(res) {
        if (!checkNullorUndefined(res)) {
            this.showManualProcessTest(res);
        }
    }

    //show manual process test
    showManualProcessTest(res) {
        this.spinner.show();
        this.testing.Device = res.Device;
        this.testing.TestResultDetails = res.TestResultDetails;
        let requestObj = { ClientData: this.clientData, Device: this.testing.Device, TestTransactions: this.transactionsResponse, UIData: this.uiData };
        const url = String.Join("/", this.apiConfigService.manualProcessTestUrl)
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                let result = response.body;
                if (!checkNullorUndefined(result) && result.Status === StatusCodes.pass) {
                    this.serviceTransactions = result.Response.ServiceTransactions;
                    this.routeAttributes = result.Response.RouteAttributes;
                    this.testing.Device = result.Response.Device;
                    this.isSaveDisabled = true;
                    this.transactionService.isAutoDisabled = true;
                    this.transactionService.isManualDisabled = true;
                    this.masterPageService.getCategoryTest();
                    this.loadProgramValues(this.testing.Device)
                }
                else if (!checkNullorUndefined(result) && result.Status === StatusCodes.fail) {
                    this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
                    this.spinner.hide();
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
                if (!checkNullorUndefined(res) && res.Status === StatusCodes.pass) {
                    this.testing.Device = res.Response;
                    this.getroute(this.testing.Device, this.routeAttributes);
                }
                else if (!checkNullorUndefined(res) && res.Status === StatusCodes.fail) {
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
                if (!checkNullorUndefined(res) && res.Status === StatusCodes.pass) {
                    this.testing.Device = res.Response;
                    this.saveTransaction(this.serviceTransactions);
                }
                else if (!checkNullorUndefined(res) && res.Status === StatusCodes.fail) {
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
                if (!checkNullorUndefined(res) && res.Status === StatusCodes.pass) {
                    this.saveSerialNumberTestResult(this.testing.Device);
                }
                else if (!checkNullorUndefined(res) && res.Status === StatusCodes.fail) {
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
                this.spinner.hide();
                if (!checkNullorUndefined(res) && res.Status === StatusCodes.pass) {
                    this.testResult = res.Response;
                    this.updateBatchDetailsTrans();
                }
                else if (!checkNullorUndefined(res) && res.Status === StatusCodes.fail) {
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
                if (!checkNullorUndefined(res) && res.Status === StatusCodes.pass) {
                    if (resetFlag == CommonEnum.no) {
                        this.transactionService.getTest(this.testing.Device, this.uiData);
                    } else {
                        this.getVerificationStatus(null);
                        this.spinner.hide();
                    }
                    if (!checkNullorUndefined(res.Response) &&
                        !checkNullorUndefined(res.Response.skipBatchProcess) &&
                        res.Response.skipBatchProcess === CommonEnum.yes) {
                        return;
                    }
                }
                else if (!checkNullorUndefined(res) && res.Status === StatusCodes.fail) {
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                    this.spinner.hide();
                }
            },
                error => {
                    this.appErrService.handleAppError(error);
                });
    }

    getVerificationStatus(containerDevice, isSaveSerialNo = false) {
        this.moveBatchButton = CommonEnum.MOVEBATCH;
        this.isMoveDisabled = true;
        const requestObj = {
            ClientData: this.clientData,
            Device: containerDevice ? containerDevice : this.testing.Device, UIData: this.uiData
        };
        const IsConatinerLevel = containerDevice ? CommonEnum.yes : CommonEnum.no;
        const url = String.Join('/', this.apiConfigService.getVerificationStatus, this.inbContainerID, IsConatinerLevel);
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                let res = response.body;
                if (isSaveSerialNo) {
                    this.refreshContainer();
                }
                if (!checkNullorUndefined(res) && res.Status === StatusCodes.pass) {
                    if (!checkNullorUndefined(res.Response) &&
                        !checkNullorUndefined(res.Response.skipBatchProcess) &&
                        res.Response.skipBatchProcess === CommonEnum.yes) {
                        return;
                    }
                    if (res.Response.hasOwnProperty('IsShowCloseContainer') && res.Response.IsShowCloseContainer === CommonEnum.yes) {
                        this.moveBatchButton = CommonEnum.CLOSECONTAINER;
                        this.isMoveDisabled = false;
                    } else {
                        if (!checkNullorUndefined(res.Response)
                            && res.Response.IsVerificationDone === CommonEnum.yes) {
                            this.isMoveDisabled = false;
                        }
                    }
                    if (res.StatusMessage) {
                        this.snackbar.info(res.StatusMessage);
                    }
                }
                else if (!checkNullorUndefined(res) && res.Status === StatusCodes.fail) {
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                    this.spinner.hide();
                }
            },
                error => {
                    this.appErrService.handleAppError(error);
                });
    }
    // move batch
    moveBatch() {
        this.isMoveDisabled = true;
        this.spinner.show();
        this.appErrService.clearAlert();
        const moveBatchFlag = this.moveBatchButton === CommonEnum.MOVEBATCH ? CommonEnum.no : CommonEnum.yes;
        const requestObj = {
            ClientData: this.clientData,
            Device: !checkNullorUndefined(this.testing.Device) ? this.testing.Device : this.contsummaryParent.deviceList[0], UIData: this.uiData
        };
        const inboundContainerID = this.inboundContainerId ? this.inboundContainerId : this.contsummaryParent.deviceList[0].ContainerID;
        const url = String.Join('/', this.apiConfigService.moveQCFDevices, inboundContainerID, moveBatchFlag);
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                const res = response.body;
                if (!checkNullorUndefined(res) && res.Status === StatusCodes.pass) {
                    this.snackbar.success(res.StatusMessage);
                    this.Clear();
                } else if (!checkNullorUndefined(res) && res.Status === StatusCodes.fail) {
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

    //after clicking save button / on validateContainerResponse
    saveSerialNum() {
        this.setSaveValue(true);
        let result = this.commonService.validateReadOnlyDeviceDetails(this.uiData, this.testResult);
        result.subscribe(response => {
            if (!checkNullorUndefined(response) && response.Status === StatusCodes.pass) {
                if (!checkNullorUndefined(this.testing.Device)) {
                    this.getUpdatedDevice(this.testing.Device);
                }
            }
            else if (!checkNullorUndefined(response) && response.Status === StatusCodes.fail) {
                this.spinner.hide();
                this.Clear();
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
                if (!checkNullorUndefined(res) && res.Status === StatusCodes.pass) {
                    this.testing.Device = res.Response;
                    const postUrl = String.Join('/', this.apiConfigService.postCommonUpdateProcess);
                    this.commonService.postUpdateProcess(postUrl, requestObj);
                    this.addSerialNumberSnap(this.testing.Device);
                }
                else if (!checkNullorUndefined(res) && res.Status === StatusCodes.fail) {
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                    this.setSaveValue(false);
                    this.spinner.hide();
                }
            },
                error => {
                    this.appErrService.handleAppError(error);
                });

    }

    //addSerialNumberSnap
    addSerialNumberSnap(device) {
        this.spinner.show();
        let requestObj = { ClientData: this.clientData, Device: device, UIData: this.uiData };
        const url = String.Join("/", this.apiConfigService.addSerialNumberSnapUrl);
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                let res = response.body;
                if (!checkNullorUndefined(res) && res.Status === StatusCodes.pass) {
                    this.serialNumber = "";
                    if (!checkNullorUndefined(this.contsummaryParent)) {
                        this.contsummaryParent.isClearDisabled = false;
                    }
                    this.transactionService.isAutoDisabled = true;
                    this.transactionService.isManualDisabled = true;
                    this.displayProperites = null;
                    this.masterPageService.getCategoryTest();
                    this.clearContainerID();
                    this.updateLottables();
                    this.getVerificationStatus(null, true);
                }
                else if (!checkNullorUndefined(res) && res.Status === StatusCodes.fail) {
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                    this.setSaveValue(false);
                    this.spinner.hide();
                }
            },
                error => {
                    this.appErrService.handleAppError(error);
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
                if (!checkNullorUndefined(result) && result.Status === StatusCodes.pass) {
                    if (result.Response.Quantity == 0) {
                        if (result.StatusMessage) {
                            this.snackbar.success(result.StatusMessage);
                        }
                        //whirlpool
                        if (!checkNullorUndefined(this.contsummaryParent) && this.contsummaryParent.containerSummaryPropertiesList.length == 0) {
                            this.Clear();
                        } else { //verizon
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
                                if (this.contsummaryParent.containerSummaryPropertiesList.length == 0 && result.Response.canAllowNextContainer == CommonEnum.no) {
                                    this.Clear();
                                } else if (result.Response.canAllowNextContainer == CommonEnum.no) {
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
                        //for getting updated Container Devices List
                        this.getContainersDevices();
                        //verizon
                        if (!checkNullorUndefined(this.contsummaryParent) && this.contsummaryParent.containerSummaryPropertiesList.length && !checkNullorUndefined(result.Response.canAllowNextContainer)) {
                            let index = this.contsummaryParent.containerSummaryPropertiesList.findIndex(c => c.containerId == this.inboundContainerId);
                            if (index != -1) {
                                this.contsummaryParent.containerSummaryPropertiesList[index].inboundProperties.Quantity = result.Response.Quantity;
                            }
                            if (result.Response.canAllowNextContainer == CommonEnum.yes) {
                                this.clearContainerSummary();
                            }
                        } else { //whirlpool
                            if (!checkNullorUndefined(this.contsummaryParent)) {
                                this.contsummaryParent.getInboundDetails();
                            }
                        }
                        if (!checkNullorUndefined(this.contsummaryParent)) {
                            this.contsummaryParent.isClearDisabled = false;
                        }
                        this.serialNumberClear();
                    }
                }
                else if (!checkNullorUndefined(result) && result.Status === StatusCodes.fail) {
                    this.spinner.hide();
                    this.masterPageService.inboundContainerFocus();
                    if (!checkNullorUndefined(this.contsummaryParent)) {
                        this.contsummaryParent.rmtextchild.applySelect();
                        this.contsummaryParent.rmtextchild.applyRequired(true);
                        this.contsummaryParent.isClearDisabled = false;
                    }
                    this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
                }
            },
                error => {
                    this.appErrService.handleAppError(error);
                });
    }

    //updateLottables
    updateLottables() {
        this.lottableTrans = new LottableTrans();
        let requestObj = { ClientData: this.clientData, UIData: this.uiData, Device: this.testing.Device, LottableTrans: this.lottableTrans };
        this.apiService.apiPostRequest(this.apiConfigService.updateLottables, requestObj)
            .subscribe(response => {
                let res = response.body;
                if (!checkNullorUndefined(res) && res.Status === StatusCodes.fail) {
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                }
            }, erro => {
                this.appErrService.handleAppError(erro);
            });
    }

    //showTransResults
    showTransResults(item) {
        item.isEditable = !item.isEditable;
        this.uiData.OperationId = item.OperationId;
        if (item.isEditable) {
            if (!checkNullorUndefined(this.serialNumber)) {
                this.spinner.show();
                let requestObj = { ClientData: this.clientData, UIData: this.uiData };
                const url = String.Join("/", this.apiConfigService.showTransResultsUrl, this.uiData.OperationId, this.serialNumber);
                this.apiService.apiPostRequest(url, requestObj)
                    .subscribe(response => {
                        let res = response.body;
                        this.spinner.hide();
                        if (!checkNullorUndefined(res) && res.Status === StatusCodes.pass) {
                            if (res.Response.TestTransactions.Trans.length > 0) {
                                this.transactionService.transactions = res.Response.TestTransactions.Trans;
                            }
                        }
                        else if (!checkNullorUndefined(res) && res.Status === StatusCodes.fail) {
                            this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                        }

                    },
                        error => {
                            this.appErrService.handleAppError(error);
                        });
            }
        }
    }

    //change input
    changeInput() {
        this.isTestsClearDisabled = false;
        this.appErrService.clearAlert();
    }

    //reset button
    Clear() {
        this.masterPageService.gridContainerDetails = null;
        this.isMoveDisabled = true;
        this.isShowOutboundContainer = true;
        this.masterPageService.getCategoryTest();
        this.clearContainerSummary();
        this.serialNumber = "";
        this.transactionService.disabledSerialNumber = true;
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
        this.isAutoPopulatedSerialNumber = false;
        this.headingsobj = [];
        this.displayPropheadingobj = [];
        this.displayProperites = null;
        //this.uiData.OperationId = this.uiDataOpearionId;
        this.inboundContainerId = "";
        this.moveBatchButton = CommonEnum.MOVEBATCH;
        if (!checkNullorUndefined(this.contsummaryParent)) {
            this.contsummaryParent.containersList = [];
            this.contsummaryParent.deviceList = [];
            this.contsummaryParent.containerSummaryPropertiesList = [];
            this.contsummaryParent.canAllowNextContainerStatus = null;
            this.contsummaryParent.containerSummaryProperties = [];
            this.contsummaryParent.containerActualProp = null;
        }
        this.multipleContainerList = null;
        this.uiData.OperationId = this.operationId;
    }

    private clearContainerSummary() {
        if (!checkNullorUndefined(this.contsummaryParent)) {
            this.contsummaryParent.inbContainerDisabled = false;
            this.contsummaryParent.rmtextchild.value = "";
            this.contsummaryParent.quantity = "";
            this.contsummaryParent.category = "";
            this.contsummaryParent.isClearDisabled = true;
        }
    }

    //clear button
    serialNumberClear() {
        this.masterPageService.getCategoryTest();
        this.transactionService.isAutoDisabled = true;
        this.transactionService.isManualDisabled = true;
        this.isSaveDisabled = true;
        if (!this.isAutoPopulatedSerialNumber) {
            this.serialNumber = "";
        }
        this.transactionService.disabledSerialNumber = false;
        this.serailNumberFocus();
        this.isTestsClearDisabled = true;
        this.clearContainerID();
        this.appErrService.setAlert("", false);
        this.displayProperites = null;
        //this.uiData.OperationId = this.uiDataOpearionId;
        this.inboundContainerId = "";
        this.isShowOutboundContainer = true;
    }

    //clear container suggestion
    clearContainerID() {
        if (!checkNullorUndefined(this.childContainer)) {
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
        if (checkNullorUndefined(value)) {
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
        if (!checkNullorUndefined(response)) {
            this.testing.Device.ContainerID = response.ContainerID;
            this.testing.Device.ContainerCycle = response.ContainerCycle;
        }
    }


    //validateConta iner Response from child conatiner
    validateContainerResponse(response) {
        if (!checkNullorUndefined(response)) {
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

    //container Summary response
    getContainerSummaryResponse(response) {
        this.inbContainerResponse = response;
    }

    //input match
    checkContainer(container) {
        if (!checkNullorUndefined(container)) {
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


    //getContainersDevices
    getContainersDevices() {
        // this.spinner.show();
        this.appErrService.clearAlert();
        let requestObj = { ClientData: this.clientData, UIData: this.uiData, Containers: this.multipleContainerList };
        const url = String.Join("/", this.apiConfigService.getContainersDevices);
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                let result = response.body;
                this.spinner.hide();
                if (!checkNullorUndefined(result) && result.Status === StatusCodes.pass) {
                    if (!checkNullorUndefined(result.Response) && result.Response.length > 0) {
                        this.grid = new Grid();
                        this.masterPageService.gridContainerDetails = this.appService.onGenerateJson(result.Response, this.grid);
                        // this.isFailAllDisabled = false;
                    }
                }
                else if (!checkNullorUndefined(result) && result.Status === StatusCodes.fail) {
                    this.spinner.hide();
                    this.masterPageService.gridContainerDetails = null;
                    this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
                }
            },
                error => {
                    this.appErrService.handleAppError(error);
                });
    }


    ngOnDestroy() {
        this.masterPageService.gridContainerDetails = null;
        this.masterPageService.categoryName = null;
        this.masterPageService.disabledContainer = true;
        this.transactionService.disabledSerialNumber = true;
        this.masterPageService.operationList = [];
        this.masterPageService.operationsdropdown = [];
        this.masterPageService.operCategoryTests = [];
        this.masterPageService.setDropDown(false);
        this.masterPageService.operation = "";
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
        this.masterPageService.showUtilityIcon = false;
        if (!checkNullorUndefined(this.originationOperation) && this.originationOperation) {
            this.originationOperation.unsubscribe();
        }
        this.masterPageService.clearOriginationSubscription();
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
        this.commonService.readOnlyDevice = null;
        this.masterPageService.defaultProperties();
    }
}