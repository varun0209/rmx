import { CommonEnum } from './../enums/common.enum';
import { Component, OnInit, ViewChild, Input, ElementRef } from '@angular/core';
import { MasterPageService } from '../utilities/rlcutl/master-page.service';
import { ApiConfigService } from '../utilities/rlcutl/api-config.service';
import { ApiService } from '../utilities/rlcutl/api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { AppErrorService } from '../utilities/rlcutl/app-error.service';
import { AppService } from '../utilities/rlcutl/app.service';
import { ContainerSummaryComponent } from '../framework/busctl/container-summary/container-summary.component';
import { TransactionService } from '../services/transaction.service';
import { ClientData } from '../models/common/ClientData';
import { Subscription } from 'rxjs';
import { TestStatus } from '../enums/testStatus.enum';
import { TestBtnNames } from '../enums/test-btn-names.enum';
import { RmtextboxComponent } from '../framework/frmctl/rmtextbox/rmtextbox.component';
import { Testing, TestingDeviceRoutes } from '../models/testing/Testing';
import { TestingDevice } from '../models/testing/TestingDevice';
import { String, StringBuilder } from 'typescript-string-operations';
import { ContainerSuggestionComponent } from '../framework/busctl/container-suggestion/container-suggestion.component';
import { Container } from '../models/common/Container';
import { UiData } from '../models/common/UiData';
import { LottableTrans } from '../models/common/LottableTrans';
import { EngineResult } from '../models/common/EngineResult';
import { StorageData } from '../enums/storage.enum';
import { StatusCodes } from '../enums/status.enum';
import { CommonService } from '../services/common.service';
import { TraceTypes } from '../enums/traceType.enum';
import { FindTraceHoldComponent } from '../framework/busctl/find-trace-hold/find-trace-hold.component';
import { MessageType } from '../enums/message.enum';
import { checkNullorUndefined } from '../enums/nullorundefined';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-repair',
    templateUrl: './repair.component.html',
    styleUrls: ['./repair.component.css']
})
export class RepairComponent implements OnInit {
    @ViewChild(ContainerSummaryComponent) contsummaryParent: ContainerSummaryComponent;
    @ViewChild(RmtextboxComponent) rmtextbox: RmtextboxComponent;
    @Input() suggestedContainer: string;
    @Input() containerSummaryResponse: any;
    @ViewChild(ContainerSuggestionComponent) childContainer: ContainerSuggestionComponent;
    @ViewChild('serialNumberInput') serialnumberInput: ElementRef;

    transactionsResponse: any;
    transactions = [];
    serviceTransactions: any;
    routeAttributes: any;
    headingsobj = [];
    inboundProperties: any;
    isTestsClearDisabled = true;
    isAutoPopulateSerialNumber = false;
    serialNumber: string = "";
    isSaveDisabled = true;
    operationId: string;
    deviceRoutes = new TestingDeviceRoutes();

    //client Control Labels
    controlConfig: any;
    clientData = new ClientData();
    uiData = new UiData();

    displayProp: any;
    displayPropheadingobj = [];
    displayProperites: any;
    emitGetTestResponse: Subscription;
    emitGetTransaction: Subscription;
    emitShowAutoManual: Subscription;
    emitGetTransAtrributeValues: Subscription;
    doneManualTransactionResponse: Subscription;
    emitReadOnlyDeviceResponse: Subscription;
    //enum
    testStatus = TestStatus;
    testBtnName = TestBtnNames;

    //Testing Device object
    repair = new Testing();
    lottableTrans: LottableTrans;
    //repairDevice = new TestingDevice();
    message: any;
    operationObj: any;
    appConfig: any;
    Accessories = [];

    container = new Container();
    suggestedContainerID = "";
    inbContainerID = "";
    inbContainerResponse: any;

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
    validTestSerialNumberResponse: any;
    traceTypes = TraceTypes;
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
        this.emitShowAutoManual = this.transactionService.emitShowAutoManual.subscribe(res => {
            if (!checkNullorUndefined(res)) {
                this.showAutoManualResponse(res);
            }
        });
        this.emitGetTransAtrributeValues = this.transactionService.emitGetTransAtrributeValues.subscribe(res => {
            if (!checkNullorUndefined(res)) {
                this.getTransAtrributeValuesResponse(res);
            }
        });
        this.doneManualTransactionResponse = this.transactionService.doneManualTransactionResponse.subscribe(doneResponse => {
            if (!checkNullorUndefined(doneResponse)) {
                this.getdoneManualTransactionResponse(doneResponse);
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
            this.message = this.appService.getErrorText('2660048');
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

    //containerSummaryProperties
    containerSummaryProperties(event: any) {
        this.headingsobj = [];
        this.headingsobj = Object.keys(event);
        this.inboundProperties = event;
    }


    getContainerList(event) {
        this.multipleContainerList = event;
    }

    //getAutoPopulatedSerailNum
    getAutoPopulatedSerailNum(event: any) {
        if (!checkNullorUndefined(event) && event != '') {
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

    // validateTestSerialNumber
    validateTestSerialNumber(serialNumber, inpcontrol: any) {
        if (serialNumber != "") {
            this.repair.Device = new TestingDevice();
            if (!checkNullorUndefined(this.deviceOrigination) && this.deviceOrigination != '') {
                this.repair.Device.Origination = this.deviceOrigination;
            }
            this.appErrService.clearAlert();
            this.spinner.show();
            this.isTestsClearDisabled = false;
            this.repair.Device.SerialNumber = serialNumber;
            localStorage.setItem(this.storageData.testSerialNumber, this.repair.Device.SerialNumber);
            this.repair.Device.Clientid = this.clientData.ClientId;
            let requestObj = { ClientData: this.clientData, UIData: this.uiData, Containers: this.multipleContainerList };
            const url = String.Join("/", this.apiConfigService.validateTestSerialNumberUrl, this.repair.Device.SerialNumber, this.masterPageService.categoryName);
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
                            } else if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) {
                                this.spinner.hide();
                                this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
                            }
                        });
                    }
                    else if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) {
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
        this.repair.Device = result.Response;
        //enabling/disable serial number for multi container process
        this.isSerialNumberValidated = true;
        //inboundContainerid its storing for sending request of current inbound container id
        this.inboundContainerId = this.repair.Device.ContainerID;
        if (!checkNullorUndefined(this.contsummaryParent)) {
            this.contsummaryParent.searchContainerID(this.repair.Device.ContainerID);
        }
        this.transactionService.getTest(this.repair.Device, this.uiData);
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
            }
            this.displayPropheadingobj = [];
            this.displayPropheadingobj = Object.keys(this.displayProp);
            this.displayProperites = this.displayProp;
            this.repair.Device = res.Response.Device;
            this.testResult = res.Response.TestResult;
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
            })

            if (res.Response.MoveEligible == "Y") {
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
        } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
            this.rmtextbox.applyRequired(true);
            this.rmtextbox.applySelect();
            this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
    }

    //show auto and manual buttons
    showAutoManual(item) {
        this.spinner.show();
        this.transactionService.showAutoManual(item, this.repair.Device, this.uiData);
    }

    //showAutoManualResponse
    showAutoManualResponse(res) {
        this.repair.Device = res.Response.Device;
        this.masterPageService.operCategoryTests = res.Response.OperTransactions.Trans;
        if (!checkNullorUndefined(res.Response.OperTransactions.Trans)) {
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
        this.repair.TestTransactions = this.transactionsResponse;
        this.scrollPosition = this.appService.getScrollPosition();
        this.transactionService.getTransAtrributeValues(transaction, event, rowIndex, parentItem, parentIndex, this.repair, this.uiData, this.scrollPosition)
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

        if (res.Response.DoneEnable == "Y") {
            this.transactionService.isDoneDisabled = false;
        }
    }


    //Done
    doneManualTransaction(item) {
        // this.operationId = item.OperationId;
        this.repair.TestTransactions = this.transactionsResponse;
        this.transactionService.doneManualTransaction(item, this.repair, this.uiData);
    }


    //getdoneManualTransactionResponse
    getdoneManualTransactionResponse(res) {
        if (!checkNullorUndefined(res)) {
            this.repair.Device = res.Device;
            this.repair.TestResultDetails = res.TestResultDetails;
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
                if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                    this.showManualProcessTest();
                }
                else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
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
        let requestObj = { ClientData: this.clientData, Device: this.repair.Device, TestTransactions: this.transactionsResponse, UIData: this.uiData };
        const url = String.Join("/", this.apiConfigService.manualProcessTestUrl)
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                let result = response.body;
                if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) {
                    this.serviceTransactions = result.Response.ServiceTransactions;
                    this.routeAttributes = result.Response.RouteAttributes;
                    this.repair.Device = result.Response.Device;
                    this.isSaveDisabled = true;
                    this.transactionService.isAutoDisabled = true;
                    this.transactionService.isManualDisabled = true;
                    this.masterPageService.inboundContainerFocus();
                    this.masterPageService.getCategoryTest();
                    this.loadProgramValues(this.repair.Device);
                }
                else if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) {
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
                if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                    this.repair.Device = res.Response;
                    this.getroute(this.repair.Device, this.routeAttributes);
                }
                else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
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
                if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                    this.repair.Device = res.Response;
                    this.saveTransaction(this.serviceTransactions);
                }
                else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
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
        let requestObj = { ClientData: this.clientData, Transactions: serviceSaveTransactios, UIData: this.uiData, Device: this.repair.Device, TestResultDetails: this.repair.TestResultDetails }
        const url = String.Join("/", this.apiConfigService.saveTransaction);
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                let res = response.body;
                if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                    this.saveSerialNumberTestResult(this.repair.Device);
                }
                else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
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
                if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                    this.testResult = res.Response;
                    this.transactionService.getTest(this.repair.Device, this.uiData);
                }
                else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
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
            if (!checkNullorUndefined(response) && response.Status === this.statusCode.pass) {
                if (!checkNullorUndefined(this.repair.Device)) {
                    this.getUpdatedDevice(this.repair.Device);
                }
            }
            else if (!checkNullorUndefined(response) && response.Status === this.statusCode.fail) {
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
                if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                    this.repair.Device = res.Response;
                    const postUrl = String.Join('/', this.apiConfigService.postCommonUpdateProcess);
                    this.commonService.postUpdateProcess(postUrl, requestObj);
                    this.addSerialNumberSnap(this.repair.Device);
                }
                else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                    this.setSaveValue(false);
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
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
                if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                    this.displayProperites = null;
                    this.refreshContainer();
                    this.updateLottables();
                }
                else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
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
                if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) {
                    if (result.Response.Quantity == 0) {
                        this.snackbar.success(result.StatusMessage);
                        //whirlpool
                        if (!checkNullorUndefined(this.contsummaryParent) && this.contsummaryParent.containerSummaryPropertiesList.length == 0) {
                            this.resetClear();
                        } else { //verizon
                            this.resetValues(result);
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
                                        this.transactionService.disabledSerialNumber = true;
                                        this.masterPageService.inboundContainerFocus();
                                    }
                                }
                            }

                        }
                    } else {
                        this.resetValues(result);
                        if (!checkNullorUndefined(this.contsummaryParent) && this.contsummaryParent.containerSummaryPropertiesList.length && !checkNullorUndefined(result.Response.canAllowNextContainer)) {
                            let index = this.contsummaryParent.containerSummaryPropertiesList.findIndex(c => c.containerId == this.inboundContainerId);
                            if (index != -1) {
                                this.contsummaryParent.containerSummaryPropertiesList[index].inboundProperties.Quantity = result.Response.Quantity;
                            }
                            if (result.Response.canAllowNextContainer === CommonEnum.yes) {
                                this.clearContainerSummary();
                            }
                        }
                        else {
                            if (!checkNullorUndefined(this.contsummaryParent)) {
                                this.contsummaryParent.getInboundDetails();
                            }
                        }
                        this.serialNumberClear();
                    }
                }
                else if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) {
                    this.resetClear();
                    if (!checkNullorUndefined(this.contsummaryParent)) {
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
        if (!checkNullorUndefined(this.contsummaryParent)) {
            this.contsummaryParent.isClearDisabled = false;
            this.contsummaryParent.quantity = (this.container.Quantity).toString();
        }
        this.transactionService.disabledSerialNumber = false;
        this.serailNumberFocus();
    }
    //updateLottables 
    updateLottables() {
        this.lottableTrans = new LottableTrans();
        let requestObj = { ClientData: this.clientData, UIData: this.uiData, Device: this.repair.Device, LottableTrans: this.lottableTrans };
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


    //container Summary response
    getContainerSummaryResponse(response) {
        this.inbContainerResponse = response;
    }


    //reset button click
    resetClear() {
        this.masterPageService.getCategoryTest();
        this.serialNumber = "";
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
        this.appErrService.setAlert("", false);
        this.isSaveDisabled = true;
        this.isAutoPopulateSerialNumber = false;
        this.inbContainerResponse = null;
        this.inboundProperties = null;
        this.clearContainerSummary();
        this.clearContainerID();
        this.masterPageService.inboundContainerFocus();
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

    clearContainerSummary() {
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
        if (!this.isAutoPopulateSerialNumber) {
            this.serialNumber = "";
        }
        this.transactionService.disabledSerialNumber = false;
        this.transactionService.isAutoDisabled = true;
        this.transactionService.isManualDisabled = true;
        this.serailNumberFocus();
        this.isSaveDisabled = true;
        this.transactionService.transactions = [];
        this.isTestsClearDisabled = true;
        this.appErrService.clearAlert();
        this.appErrService.setAlert("", false);
        this.displayPropheadingobj = [];
        this.displayProperites = null;
        this.clearContainerID();
        this.inboundContainerId = "";
        this.isSerialNumberValidated = false;
    }


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
    //change Input
    changeInput() {
        this.isTestsClearDisabled = false;
        this.appErrService.clearAlert();
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
            this.childContainer.getSuggestContainer(this.repair.Device);
        } else {
            this.clearContainerID();
            this.configContainerProperties();
            this.childContainer.getSuggestContainer(this.repair.Device);
        }
    }

    //validateContainer and sending updated device to child conatiner
    validateContainer(response) {
        if (response.ContainerID != null && response.ContainerID != undefined) {
            this.repair.Device.ContainerID = response.ContainerID;
            this.repair.Device.ContainerCycle = response.ContainerCycle;
        }
        this.childContainer.validateContainer(this.repair.Device);

    }

    //validate container fail response
    emitValidateContainerFailResponse(response) {
        if (!checkNullorUndefined(response)) {
            this.repair.Device.ContainerID = response.ContainerID;
            this.repair.Device.ContainerCycle = response.ContainerCycle;
        }
    }

    //validateConta iner Response from child conatiner
    validateContainerResponse(response) {
        if (!checkNullorUndefined(response)) {
            this.container = response;
            this.isSaveDisabled = true;
            this.repair.Device.ContainerCycle = response.ContainerCycle;
            this.repair.Device.ContainerID = response.ContainerID;
            this.saveSerialNum();
        }
        else {
            this.saveSerialNum();
        }
    }


    //save button foucs
    saveFocus() {
        this.appService.setFocus('save');
    }


    //input match 
    checkContainer(container) {
        if (!checkNullorUndefined(container)) {
            this.isSaveDisabled = false;
            this.repair.Device.ContainerID = container.ContainerID;
            this.repair.Device.ContainerCycle = container.ContainerCycle;
        }
        else {
            this.isSaveDisabled = true;
        }
    }

    getContainerId(containerid) {
        this.suggestedContainerID = containerid;
    }

    //enabling the button and container ID
    configContainerProperties() {
        this.childContainer.isContainerDisabled = false;
        this.childContainer.isClearContainerDisabled = false;
    }

    //inbContainerID
    getinbContainerID(inbcontid) {
        this.inbContainerID = inbcontid;
    }

    ngOnDestroy() {
        this.masterPageService.moduleName.next(null);
        this.masterPageService.categoryName = null;
        this.masterPageService.disabledContainer = true;
        this.masterPageService.operation = "";
        this.masterPageService.operationList = [];
        this.masterPageService.operationsdropdown = [];
        this.masterPageService.operCategoryTests = [];
        this.masterPageService.clearModule();
        this.appErrService.clearAlert();
        this.transactionService.transactions = [];
        this.transactionService.transactionsResponse = [];
        this.transactionsResponse = [];
        this.transactions = [];
        this.emitGetTestResponse.unsubscribe();
        this.emitGetTransaction.unsubscribe();
        this.emitShowAutoManual.unsubscribe();
        this.emitGetTransAtrributeValues.unsubscribe();
        this.doneManualTransactionResponse.unsubscribe();
        //clearing the readOnlyDevice subscription methods data
        this.commonService.emitReadOnlyDeviceResponse.next(null);
        this.emitReadOnlyDeviceResponse.unsubscribe();
        this.transactionService.clearSubscription();
        this.transactionService.disabledSerialNumber = true;
        if (this.contsummaryParent) {
            if (this.contsummaryParent.dialogRef) {
                this.contsummaryParent.dialogRef.close();
            }
        }
        if (!checkNullorUndefined(this.originationOperation) && this.originationOperation) {
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
