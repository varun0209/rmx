import { ListofTransactions } from './../../models/common/ListofTransactions';
import { FindTraceHoldComponent } from './../../framework/busctl/find-trace-hold/find-trace-hold.component';
import { CommonService } from './../../services/common.service';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppService } from './../../utilities/rlcutl/app.service';
import { ApiConfigService } from './../../utilities/rlcutl/api-config.service';
import { ApiService } from './../../utilities/rlcutl/api.service';
import { TransactionService } from './../../services/transaction.service';
import { MasterPageService } from './../../utilities/rlcutl/master-page.service';
import { AppErrorService } from './../../utilities/rlcutl/app-error.service';
import { CommonEnum } from './../../enums/common.enum';
import { UiData } from './../../models/common/UiData';
import { Container } from './../../models/common/Container';
import { ClientData } from './../../models/common/ClientData';
import { Testing, TestingDeviceRoutes } from './../../models/testing/Testing';
import { TestingDevice } from './../../models/testing/TestingDevice';
import { StorageData } from './../../enums/storage.enum';
import { StatusCodes } from './../../enums/status.enum';
import { String } from 'typescript-string-operations';
import { Grid } from './../../models/common/Grid';
import { ContainerSuggestionComponent } from './../../framework/busctl/container-suggestion/container-suggestion.component';
import { ContainerSummaryComponent } from './../../framework/busctl/container-summary/container-summary.component';
import { TraceTypes } from './../../enums/traceType.enum';
import { MessageType } from './../../enums/message.enum';
import { LottableTrans } from '../../models/common/LottableTrans';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-rma-capture',
    templateUrl: './rma-capture.component.html',
    styleUrls: ['./rma-capture.component.css']
})
export class RmaCaptureComponent implements OnInit, OnDestroy {

    @ViewChild(ContainerSummaryComponent) contsummaryParent: ContainerSummaryComponent;
    @ViewChild(ContainerSuggestionComponent) childContainer: ContainerSuggestionComponent;

    inboundContainerId: string;
    inboundProperties: any;
    operationObj: any;
    //uiDataOpearionId: string;
    serialNumber: string;
    serialnumberInput: string;
    rma = '';
    isRMADisabled = true;
    rmaPrint = true;
    rmaPrintDisabled = true;
    isProcessDisabled = true;
    isAutoPopulateSerialNumber = false;
    isSerialNumberClearDisabled = true;

    // display properties
    displayProp: any;
    displayProperites: any;
    displayPropheadingobj = [];
    headingsobj = [];

    // container Summary properties
    multipleContainerList: any;

    // client Control Labels
    controlConfig: any;
    appConfig: any;
    validTestSerialNumberResponse: any;
    deviceOrigination: string;

    originationOperation: Subscription;
    emitReadOnlyDeviceResponse: Subscription;

    grid: Grid;
    listofTransactions: ListofTransactions;
    clientData = new ClientData();
    container = new Container();
    uiData = new UiData();
    testing = new Testing();
    deviceRoutes = new TestingDeviceRoutes();
    lottableTrans: LottableTrans;
    operationId: string;
    dialogRef: any;

    constructor(
        public appService: AppService,
        private apiService: ApiService,
        private apiConfigService: ApiConfigService,
        private spinner: NgxSpinnerService,
        private snackbar: XpoSnackBar,
        public appErrService: AppErrorService,
        public masterPageService: MasterPageService,
        public transactionService: TransactionService,
        private commonService: CommonService,
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
            // this.uiDataOpearionId = this.operationObj.OperationId;
            this.masterPageService.containerDetailsHeader(CommonEnum.containerDetails);
            this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
            this.masterPageService.setTitle(this.operationObj.Title);
            this.masterPageService.setModule(this.operationObj.Module);
            this.controlConfig = JSON.parse(localStorage.getItem(StorageData.controlConfig));
            this.appConfig = JSON.parse(localStorage.getItem(StorageData.appConfig));
            this.originationOperation = this.masterPageService.originationOperation.subscribe(val => {
                this.deviceOrigination = val;
            });
            this.appService.setFocus('inbContainer');
        }
    }

    //operationId
    setCurrentOperationId(operationId) {
        this.uiData.OperationId = operationId;
    }

    // auto populate serial number
    getAutoPopulatedSerailNum(event: any) {
        if (!this.appService.checkNullOrUndefined(event) && event !== '') {
            this.serialNumber = event;
            this.validateTestSerialNumber(this.serialNumber, this.serialnumberInput);
            this.transactionService.disabledSerialNumber = true;
            this.isSerialNumberClearDisabled = false;
            this.isAutoPopulateSerialNumber = true;
        } else {
            if (this.serialNumber) {
                this.transactionService.disabledSerialNumber = true;
            } else {
                this.transactionService.disabledSerialNumber = false;
                this.serailNumberFocus();
            }
            this.isSerialNumberClearDisabled = false;
            this.getContainersDevices();
        }
    }

    containerSummaryProperties(event: any) {
        this.headingsobj = [];
        this.headingsobj = Object.keys(event);
        this.inboundProperties = event;
    }

    getContainerList(event: any) {
        this.multipleContainerList = event;
    }

    // getContainersDevices
    getContainersDevices() {
        this.appErrService.clearAlert();
        const requestObj = { ClientData: this.clientData, UIData: this.uiData, Containers: this.multipleContainerList };
        const url = String.Join('/', this.apiConfigService.getContainersDevices);
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                const result = response.body;
                this.spinner.hide();
                if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
                    if (!this.appService.checkNullOrUndefined(result.Response) && result.Response.length > 0) {
                        this.grid = new Grid();
                        this.masterPageService.gridContainerDetails = this.appService.onGenerateJson(result.Response, this.grid);
                    }
                } else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
                    this.spinner.hide();
                    this.masterPageService.gridContainerDetails = null;
                    this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
                }
            },
                error => {
                    this.appErrService.handleAppError(error);
                });
    }

    // validateTestSerialNumber
    validateTestSerialNumber(serialNumber, inpcontrol: any) {
        if (serialNumber !== '') {
            // this.uiData.OperationId = this.uiDataOpearionId;
            this.testing.Device = new TestingDevice();
            if (!this.appService.checkNullOrUndefined(this.deviceOrigination) && this.deviceOrigination !== '') {
                this.testing.Device.Origination = this.deviceOrigination;
            }
            this.clearContainerID();
            this.isSerialNumberClearDisabled = false;
            this.spinner.show();
            this.appErrService.clearAlert();
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
        this.spinner.hide();
        this.testing.Device = result.Response;
        // inboundContainerid its storing for sending request of current inbound container id
        this.inboundContainerId = this.testing.Device.ContainerID;
        if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
            this.contsummaryParent.searchContainerID(this.testing.Device.ContainerID);
        }
        this.transactionService.disabledSerialNumber = true;
        this.rmaPrintDisabled = false;
        this.isRMADisabled = false;
        this.appService.setFocus('rma');
        this.rmaPrint = true;
        this.validTestSerialNumberResponse = null;
    }

    changeRMAInput() {
        this.isProcessDisabled = false;
        if (!this.rma) {
            this.isProcessDisabled = true;
        }
    }

    setSaveValue(val) {
        this.isProcessDisabled = val;
    }
    // Process RMA capture
    rmaProcess() {
        this.setSaveValue(true);
        if (this.serialNumber && this.rma) {
            const requestObj = { ClientData: this.clientData, UIData: this.uiData, Device: this.testing.Device };
            const url = String.Join('/', this.apiConfigService.processCaptureUrl, this.rma, this.rmaPrint.toString());
            this.apiService.apiPostRequest(url, requestObj)
                .subscribe(response => {
                    const result = response.body;
                    if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
                        this.isRMADisabled = true;
                        this.rmaPrintDisabled = true;
                        this.testing.Device = result.Response;
                        this.loadProgramValues(this.testing.Device);
                    } else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
                        this.spinner.hide();
                        this.setSaveValue(false);
                        this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
                    }
                },
                    error => {
                        this.appErrService.handleAppError(error);
                    });
        }

    }

    // load Program Values
    loadProgramValues(device) {
        this.spinner.show();
        const requestObj = { ClientData: this.clientData, Device: device, UIData: this.uiData };
        const url = String.Join('/', this.apiConfigService.loadProgramValuesurl, device.ProgramName);
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                const res = response.body;
                if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
                    this.testing.Device = res.Response;
                    this.getroute(this.testing);
                } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
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

    // getRoute
    getroute(device) {
        this.spinner.show();
        const requestObj = { ClientData: this.clientData, RouteRequest: device, UIData: this.uiData };
        const url = String.Join('/', this.apiConfigService.getTestRouteUrl);
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                this.spinner.hide();
                const res = response.body;
                if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
                    this.testing.Device = res.Response;
                    if (!this.appService.checkNullOrUndefined(this.childContainer)) {
                        this.configContainerProperties();
                        this.childContainer.suggestedContainerFocus();
                    }
                } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                    this.setSaveValue(false);
                    this.spinner.hide();
                }
            },
                error => {
                    this.appErrService.handleAppError(error);
                });

    }
    //#region container suggestion

    // Refresh and getSuggestionContainer(focus)
    // getSuggestContainer sending receive device to child conatiner
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
            this.testing.Device.ContainerID = container.ContainerID;
            this.testing.Device.ContainerCycle = container.ContainerCycle;
        }
    }

    // validateConta iner Response from child conatiner
    validateContainerResponse(response) {
        if (!this.appService.checkNullOrUndefined(response)) {
            this.container = response;
            this.testing.Device.ContainerCycle = response.ContainerCycle;
            this.testing.Device.ContainerID = response.ContainerID;
            this.getTransaction();
        } else {
            this.getTransaction();
        }
    }

    // validate container fail response
    emitValidateContainerFailResponse(response) {
        if (!this.appService.checkNullOrUndefined(response)) {
            this.testing.Device.ContainerID = response.ContainerID;
            this.testing.Device.ContainerCycle = response.ContainerCycle;
        }
    }
    //#endregion container suggestion

    //#region common methods


    // get Transactions
    getTransaction() {
        this.spinner.show();
        let result = this.commonService.validateReadOnlyDeviceDetails(this.uiData);
        result.subscribe(response => {
            if (!this.appService.checkNullOrUndefined(response) && response.Status === StatusCodes.pass) {
                const requestObj = { ClientData: this.clientData, UIData: this.uiData, Device: this.testing.Device };
                const url = String.Join('/', this.apiConfigService.getTransaction, this.uiData.OperationId);
                this.apiService.apiPostRequest(url, requestObj)
                    .subscribe(response => {
                        const res = response.body;
                        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
                            this.listofTransactions = new ListofTransactions();
                            this.listofTransactions = res.Response;
                            this.saveTransaction();
                        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
                            this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                            this.spinner.hide();
                        }
                    },
                        error => {
                            this.appErrService.handleAppError(error);
                        });
            } else if (!this.appService.checkNullOrUndefined(response) && response.Status === StatusCodes.fail) {
                this.spinner.hide();
                this.clear();
                this.appErrService.setAlert(response.ErrorMessage.ErrorDetails, true);
            }
        })
    }

    // save transaction
    saveTransaction() {
        const requestObj = {
            ClientData: this.clientData, Transactions: this.listofTransactions,
            UIData: this.uiData, Device: this.testing.Device, TestResultDetails: {}
        };
        const url = String.Join('/', this.apiConfigService.saveTransaction);
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                const res = response.body;
                if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
                    this.getUpdateDevice(this.testing.Device);
                } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                    this.spinner.hide();
                }
            }, erro => {
                this.appErrService.handleAppError(erro);
            });
    }

    getUpdateDevice(device) {
        const requestObj = {
            ClientData: this.clientData, Transactions: this.listofTransactions,
            UIData: this.uiData, Device: device, TestResultDetails: {}
        };
        this.apiService.apiPostRequest(this.apiConfigService.updateDeviceUrl, requestObj)
            .subscribe(response => {
                const res = response.body;
                if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
                    this.testing.Device = res.Response;
                    this.addSerialNumberSnap(this.testing.Device);
                } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                    this.spinner.hide();
                }
            }, erro => {
                this.appErrService.handleAppError(erro);
            });
    }

    addSerialNumberSnap(device) {
        const requestObj = { ClientData: this.clientData, Device: device, UIData: this.uiData };
        this.apiService.apiPostRequest(this.apiConfigService.addSerialNumberSnapUrl, requestObj)
            .subscribe(response => {
                const res = response.body;
                this.spinner.hide();
                if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
                    this.getContainersDevices();
                    this.refreshContainer();
                    this.updateLottables();
                    this.snackbar.success(res.Response);
                } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
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
                if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
                    if (result.Response.Quantity == 0) {
                        //whirlpool
                        if (!this.appService.checkNullOrUndefined(this.contsummaryParent) && this.contsummaryParent.containerSummaryPropertiesList.length == 0) {
                            this.clear();
                        } else { //verizon
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
                                    this.clear();
                                } else if (result.Response.canAllowNextContainer == 'N') {
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
                        if (!this.appService.checkNullOrUndefined(this.contsummaryParent) && this.contsummaryParent.containerSummaryPropertiesList.length && !this.appService.checkNullOrUndefined(result.Response.canAllowNextContainer)) {
                            let index = this.contsummaryParent.containerSummaryPropertiesList.findIndex(c => c.containerId == this.inboundContainerId);
                            if (index != -1) {
                                this.contsummaryParent.containerSummaryPropertiesList[index].inboundProperties.Quantity = result.Response.Quantity;
                            }
                            if (result.Response.canAllowNextContainer == CommonEnum.yes) {
                                this.clearContainerSummary();
                            }
                        } else {
                            if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
                                this.contsummaryParent.getInboundDetails();
                            }
                        }
                        this.serialNumberClear();
                    }
                    if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
                        this.contsummaryParent.isClearDisabled = false;
                    }
                }
                else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
                    this.clear();
                    this.spinner.hide();
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

    //#endregion common methods





    changeInput() {
        this.isSerialNumberClearDisabled = false;
        this.appErrService.clearAlert();
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

    isPrint() {
        this.rmaPrint = !this.rmaPrint;
    }

    clear() {
        this.masterPageService.gridContainerDetails = null;
        this.clearContainerSummary();
        this.serialNumber = '';
        this.transactionService.disabledSerialNumber = true;
        this.masterPageService.inboundContainerFocus();
        this.appErrService.clearAlert();
        this.clearContainerID();
        this.inboundProperties = null;
        this.headingsobj = [];
        this.displayPropheadingobj = [];
        this.displayProperites = null;
        this.inboundContainerId = '';
        this.rma = '';
        this.isRMADisabled = true;
        this.isProcessDisabled = true;
        this.isSerialNumberClearDisabled = true;
        this.rmaPrint = true;
        this.rmaPrintDisabled = true;
        this.clearInboundContainer();
        this.appService.setFocus('inbContainer');
        this.emitReadOnlyDeviceResponse.unsubscribe();
        this.clearObjects();
        this.uiData.OperationId = this.operationId;
    }

    clearInboundContainer() {
        if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
            this.contsummaryParent.containersList = [];
            this.contsummaryParent.deviceList = [];
            this.contsummaryParent.containerSummaryPropertiesList = [];
            this.contsummaryParent.canAllowNextContainerStatus = null;
            this.contsummaryParent.containerSummaryProperties = [];
            this.contsummaryParent.containerActualProp = null;
        }
    }

    clearObjects() {
        this.container = new Container();
        this.testing = new Testing();
        this.listofTransactions = new ListofTransactions();
    }

    serialNumberClear() {
        this.serailNumberFocus();
        this.transactionService.disabledSerialNumber = false;
        if (!this.isAutoPopulateSerialNumber) {
            this.serialNumber = '';
        }
        this.rma = '';
        this.isRMADisabled = true;
        this.rmaPrintDisabled = true;
        this.isSerialNumberClearDisabled = true;
        this.isProcessDisabled = true;
        this.clearContainerID();
        this.appErrService.clearAlert();
        this.rmaPrint = true;
    }



    serailNumberFocus() {
        this.appService.setFocus('serialNumber');
    }

    // conatiner focus
    containerFocus() {
        this.appService.setFocus('containerInputId');
    }

    ngOnDestroy() {
        this.clearObjects();
        this.clear();
        this.masterPageService.gridContainerDetails = null;
        this.emitReadOnlyDeviceResponse.unsubscribe();
        this.masterPageService.defaultProperties();
    }

}
