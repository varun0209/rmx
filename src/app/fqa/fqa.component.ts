import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, TemplateRef } from '@angular/core';
import { MasterPageService } from '../utilities/rlcutl/master-page.service';
import { RmgridService } from '../framework/frmctl/rmgrid/rmgrid.service';
import { AppErrorService } from '../utilities/rlcutl/app-error.service';
import { NgxSpinnerService } from '../../../node_modules/ngx-spinner';
import { Container } from '../models/common/Container';
import { ApiService } from '../utilities/rlcutl/api.service';
import { ApiConfigService } from '../utilities/rlcutl/api-config.service';
import { ToastrService } from '../../../node_modules/ngx-toastr';
import { String, StringBuilder } from 'typescript-string-operations';
import { RmtextboxComponent } from '../framework/frmctl/rmtextbox/rmtextbox.component';
import { ContainerSummaryComponent } from '../framework/busctl/container-summary/container-summary.component';
import { interval, Observable, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { Message } from '../models/common/Message';
import { MessagingService } from '../utilities/rlcutl/messaging.service';
import { MessageType } from '../enums/message.enum';
import { ContainerSuggestionComponent } from '../framework/busctl/container-suggestion/container-suggestion.component';
import { FqaDevice, FqaDeviceList } from '../models/fqa/FqaDevice';
import { AppService } from '../utilities/rlcutl/app.service';
import { RmgridComponent } from '../framework/frmctl/rmgrid/rmgrid.component';
import { Grid } from '../models/common/Grid';
import { ClientData } from '../models/common/ClientData';
import { UiData } from '../models/common/UiData';
import { dropdown } from '../models/common/Dropdown';
import { WarehouseTransferModes } from '../enums/WarehouseTransferModes';
import { LottableTrans } from './../models/common/LottableTrans';
import { EngineResult } from '../models/common/EngineResult';
import { TraceTypes } from '../enums/traceType.enum';
import { CommonService } from '../services/common.service';
import { FindTraceHoldComponent } from '../framework/busctl/find-trace-hold/find-trace-hold.component';
import { StorageData } from '../enums/storage.enum';
import { StatusCodes } from '../enums/status.enum';
import { CommonEnum } from '../enums/common.enum';
import { OperationEnum } from '../enums/operation.enum';
import { checkNullorUndefined } from '../enums/nullorundefined';
import { MatDialog } from '@angular/material/dialog';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';

@Component({
    selector: 'app-fqa',
    templateUrl: './fqa.component.html',
    styleUrls: ['./fqa.component.css']
})
export class FqaComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild(RmtextboxComponent) rmtextchild: RmtextboxComponent;
    @ViewChild('serialNumberInput') serialNumberInput: RmtextboxComponent;
    @ViewChild(ContainerSummaryComponent) contsummaryParent: ContainerSummaryComponent;
    @ViewChild(ContainerSuggestionComponent) childContainer: ContainerSuggestionComponent;
    @ViewChild(RmgridComponent) rmgrid: RmgridComponent;
    @ViewChild('popTemplate') template: TemplateRef<any>;

    //variables
    warehouseTransferModes = WarehouseTransferModes;
    text: string;
    CaseCntEnable: string;
    batchId: string = "";
    containerID = "";
    serialNumber = "";
    verifiedSerialNumber = "";
    countCase = null;
    FQAPrintDisabled = true;
    FQAPrint: boolean = false;
    pollingData: any;
    clear: any;
    TotalCount: number;
    totalCaseCount: number;
    defaultCaseValue = 0;
    //messages
    messageNum: string;
    messagesCategory: string;
    messageType: string;

    isSerialNumberResetDisabled = true;
    isProcessDisabled: boolean = true;
    // isClearDisabled: boolean = true;
    isVerifyDisabled: boolean = true;
    isCountCaseDisabled: boolean = true;
    isContainerEnable: boolean;
    fqaDeviceListProperties: boolean
    isMoveDisabled: boolean = true;
    isSerialNumberVerification: boolean;
    // FqaClear
    isfqaClearDisabled: boolean = true;
    //fqaDeviceList
    fqaDeviceListResponse: any;
    FqaCase: any;
    fqaDeviceList: FqaDeviceList[];
    serialNumberList = [];
    fqaVerifiedDeviceList: FqaDevice[] = [];
    fqaDevice: FqaDevice = new FqaDevice();
    container = new Container();
    subscription: Subscription;

    grid: Grid;
    processQueData = [];
    batchQueData = [];
    //client Control Labels
    clientData = new ClientData();
    uiData = new UiData();
    lottableTrans: LottableTrans;

    controlConfig: any;

    headingsobj = [];
    inboundProperties: any;
    operationObj: any;
    inboundContainer: string;
    appConfig: any;
    isModeDisabled: boolean = false;
    Mode: string;
    modesList = [];

    disabledContSummary: boolean = false;
    FqaOnChangeMode: Subscription;
    // Modal popup
    closeBtnName: string;
    title: string = "Invalid Serial Numbers";
    deviceErrors = [];
    fqaDeviceListData = [];
    isContainerVerification = true;
    selectedFQAMode: string;
    checkmode: any;
    flag: boolean = true;
    isModalOpen: boolean = false;

    //originaiton operation
    originationOperation: Subscription;
    deviceOrigination: string;
    emitReadOnlyDeviceResponse: Subscription;
    emitReadOnlyDeviceResponseForContainer: Subscription;

    //show select mode div
    isShowControls = true;

    multipleContainerList = [];
    traceTypes = TraceTypes;
    validSingleunitSerialNumberResponse: any;
    storageData = StorageData;
    statusCode = StatusCodes;
    validcountCaseResponse: any;
    modelTittle = OperationEnum.serialNumberMove;
    emitSpinner: Subscription;
    operationId: string;
    dialogRef: any;

    constructor(private apiService: ApiService,
        private apiConfigService: ApiConfigService,
        private spinner: NgxSpinnerService,
        private snackbar: XpoSnackBar,
        public appErrService: AppErrorService,
        public masterPageService: MasterPageService,
        private messagingService: MessagingService,
        private appService: AppService,
        private commonService: CommonService,
        private dialog: MatDialog
    ) {

        this.emitSpinner = this.masterPageService.emitHideSpinner.subscribe(spinnerFlag => {
            if (!this.appService.checkNullOrUndefined(spinnerFlag) && spinnerFlag) {
                if (!checkNullorUndefined(this.controlConfig.ribbondropdown) && this.controlConfig.ribbondropdown.Show) {
                    this.masterPageService.showRibbondropdown = this.controlConfig.ribbondropdown.Show;
                    this.appService.setFocus('opCategorydropdown');
                    this.isShowControls = false;
                    this.getModes();
                } else {
                    this.spinner.hide();
                }
            }
        });

        this.subscription = this.masterPageService.clearAll$.subscribe(
            clear => {
                if (clear) {
                    if (!checkNullorUndefined(this.contsummaryParent)) {
                        this.contsummaryParent.rmtextchild.value = "";
                        this.contsummaryParent.quantity = "";
                        this.contsummaryParent.category = "";
                        this.contsummaryParent.isClearDisabled = true;
                    }
                    this.serialNumber = "";
                    this.masterPageService.disabledSerialNumber = true;
                    if (this.pollingData != undefined) {
                        this.pollingData.unsubscribe();
                        this.clear.click();
                    }
                    this.masterPageService.tempQueList = null;
                    this.appErrService.setAlert("", false);
                }
            });
        this.FqaOnChangeMode = this.masterPageService.selectedOptionMode.subscribe(mode => {
            if (!checkNullorUndefined(mode)) {
                this.changeFQAMode(mode);
            }
        });
        //emitting readOnlyDevice response
        this.emitReadOnlyDeviceResponse = this.commonService.emitReadOnlyDeviceResponse.subscribe(res => {
            if (!checkNullorUndefined(res)) {
                if (!checkNullorUndefined(res.Status) && res.Status == this.statusCode.pass) {
                    this.validateSingleunitSerialNumber();
                } else if (!checkNullorUndefined(res.Status) && res.Status == this.statusCode.fail) {
                    this.Clear();
                }
            }
        });
        //emitting readOnlyDevice response
        this.emitReadOnlyDeviceResponseForContainer = this.commonService.emitReadOnlyDeviceResponseForContainer.subscribe(res => {
            if (!checkNullorUndefined(res)) {
                if (!checkNullorUndefined(res.Status) && res.Status == this.statusCode.pass) {
                    this.validatecountCaseSuccess();
                } else if (!checkNullorUndefined(res.Status) && res.Status == this.statusCode.fail) {
                    this.Clear();
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
            this.masterPageService.setTitle(this.operationObj.Title);
            this.masterPageService.setModule(this.operationObj.Module);
            this.masterPageService.setCardHeader(CommonEnum.processQueue);
            this.masterPageService.setFqaCardHeader(CommonEnum.batchDetails);
            this.masterPageService.module = this.operationObj.Module;
            this.masterPageService.disabledSerialNumber = true;
            this.controlConfig = JSON.parse(localStorage.getItem(this.storageData.controlConfig));
            localStorage.setItem(this.storageData.module, this.operationObj.Module);
            this.appErrService.appMessage();
            this.appConfig = JSON.parse(localStorage.getItem(this.storageData.appConfig));
            this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
            this.masterPageService.operationObj = this.operationObj;
            this.masterPageService.hideSpinner = true;
            this.originationOperation = this.masterPageService.originationOperation.subscribe(val => {
                this.deviceOrigination = val;
            });
        }
    }

    ngAfterViewInit() {
        this.getProcessQueue();

    }
    changeFQAMode(selectedFQAMode) {
        if (!checkNullorUndefined(this.contsummaryParent)) {
            this.contsummaryParent.containersList = [];
            this.contsummaryParent.deviceList = [];
            this.contsummaryParent.containerSummaryPropertiesList = [];
            this.contsummaryParent.canAllowNextContainerStatus = null;
            this.contsummaryParent.containerSummaryProperties = [];
            this.contsummaryParent.containerActualProp = null;
        }
        this.isShowControls = true;
        this.selectedFQAMode = selectedFQAMode;
        this.FQAPrintDisabled = false;
        this.inboundContainer = null;
        this.FqaCase = null;
        this.fqaDeviceListData = [];
        this.inboundProperties = null;
        this.headingsobj = [];
        this.isCountCaseDisabled = true;
        this.appErrService.clearAlert();
        this.checkmode = this.masterPageService.hideControls.controlProperties[selectedFQAMode];
        if (this.checkmode) {
            this.masterPageService.disabledSerialNumber = false;
            this.appService.setFocus('serialNum');
            this.clearSignleUnit();
        }
        else {
            this.masterPageService.disabledContainer = true;
            this.masterPageService.disabledSerialNumber = true;
            this.masterPageService.inboundContainerFocus();
            this.clearContainerVerification();
        }
        this.commonService.readOnlyDeviceArray = [];
    }

    getContainerList(event) {
        this.multipleContainerList = event;
    }

    //operationId
    setCurrentOperationId(operationId) {
        this.uiData.OperationId = operationId;
    }


    //Emit inbContainerID, autopopulated serialnumber
    validateFQASerialNumbers(obj) {
        this.inboundContainer = obj.InboundContainer;
        this.spinner.show();
        let requestObj = { ClientData: this.clientData, UIData: this.uiData };
        const url = String.Join("/", this.apiConfigService.validateFQASerialNumbersUrl, this.inboundContainer);
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                let res = response.body;
                if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                    this.TotalCount = res.Response.TotalCount;
                    this.fqaDeviceListResponse = res.Response;
                    this.CaseCntEnable = res.Response.CaseCntEnable;
                    this.isSerialNumberVerification = true;
                    this.masterPageService.disabledSerialNumber = false;
                    this.FQAPrint = true;
                    this.FQAPrintDisabled = false;
                    if (!checkNullorUndefined(this.rmgrid)) {
                        this.rmgrid.isClear = true;
                    }
                    res.Response.FqaVerifyDevices.forEach((element) => {
                        const index = this.fqaDeviceListData.findIndex(ele => ele.SerialNumber === element.SerialNumber);
                        if (index === -1) {
                            if (!checkNullorUndefined(this.deviceOrigination) && this.deviceOrigination != '') {
                                element.Origination = this.deviceOrigination;
                            }
                            this.fqaDeviceListData.push(element);
                        }
                    });
                    this.fqaDeviceGrid(res.Response.FqaVerifyDevices);
                    this.grid = new Grid();
                    this.grid.PaginationId = "serialNumberRemarks";
                    this.fqaDeviceList = this.appService.onGenerateJson(this.fqaDeviceList, this.grid);
                    this.fqaDeviceListProperties = true;
                    if (obj.AutoPopSerialNumber) {
                        if (res.Response.hasOwnProperty('FqaVerifyDevices') && res.Response.FqaVerifyDevices.length === 1
                            && (this.appService.checkNullOrUndefined(res.Response.FqaVerifyDevices[0].Remarks) || res.Response.FqaVerifyDevices[0].Remarks == '')) {
                            this.serialNumber = res.Response.FqaVerifyDevices[0].SerialNumber;
                            this.serialNumberVerification(this.serialNumberInput);
                        }
                    } else {
                        this.masterPageService.disabledSerialNumber = false;
                        this.serialNumberFocus();
                        //enable or disable case count based on res.Response.
                        //CaseCntEnable and store this value in variable. On page load disable case count.
                        if (this.CaseCntEnable == "Y") {
                            this.isCountCaseDisabled = false;
                        }
                        this.spinner.hide();
                    }
                }
                else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                    this.spinner.hide();
                    this.text = res.ErrorMessage.ErrorDetails;
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                    this.snackbar.error(this.text);
                }
            },
                error => {
                    this.appErrService.handleAppError(error);
                });
    }

    //get process que
    getProcessQueue() {
        this.batchQueData = [];
        this.spinner.show();
        let timeinterval: number = this.appConfig.fqa.queueInterval;
        let requestObj = { ClientData: this.clientData, UIData: this.uiData };
        const url = String.Join("/", this.apiConfigService.getBatchQueueUrl);
        this.clear = document.getElementById('stopProcessQueue');
        // const stop$ = fromEvent(this.clear, 'click');
        this.pollingData = interval(timeinterval).pipe(
            startWith(0),
            switchMap(() => this.apiService.apiPostRequest(url, requestObj)))
            .subscribe(response => {
                let res = response.body;
                if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                    // this.masterPageService.tempQueList = this.onProcessQueGenerateJson(res.Response);
                    this.batchQueData = res.Response;
                    this.onProcessQueGenerateJsonGrid(res.Response);
                    this.grid = new Grid();
                    this.grid.SearchVisible = false;
                    this.masterPageService.tempQueList = this.appService.onGenerateJson(this.processQueData, this.grid);
                }
                else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                    this.spinner.hide();
                    if (!checkNullorUndefined(!this.contsummaryParent)) {
                        this.contsummaryParent.isClearDisabled = false;
                    }
                    this.masterPageService.tempQueList = null;
                    this.pollingData.unsubscribe();
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                    this.text = res.ErrorMessage.ErrorDetails;
                    this.snackbar.error(this.text);
                }
            },
                error => {
                    this.appErrService.handleAppError(error);
                });
    }



    //serial number verification 
    serialNumberVerification(inputControl: RmtextboxComponent) {
        if (this.checkmode && this.checkmode.inboundContainer.Hidden) {
            this.singleUnitVarification(inputControl);
        } else {
            if (this.isCountCaseDisabled === false) {
                this.countCase = null;
            }
            inputControl.applyRequired(false);
            this.appErrService.clearAlert();
            let serial = this.fqaDeviceList['Elements'].find(x => (x.SerialNumber == this.serialNumber || x.MSN == this.serialNumber));

            if (!checkNullorUndefined(serial)) {
                this.fqaDeviceList['Elements'].forEach(element => {

                    if (this.defaultCaseValue == 0) {
                        this.countCase = (this.countCase !== null ? 0 : this.countCase)
                    }
                    if ((element.SerialNumber == this.serialNumber || element.MSN == this.serialNumber) && element.Remarks == "") {
                        this.FQAPrint = true;
                        this.FQAPrintDisabled = false;
                        if (element.Verify == "N") {
                            element.Verify = 'Y';
                            this.fqaDeviceListData.forEach((ele) => {
                                if (ele.SerialNumber == element.SerialNumber) {
                                    ele.Verify = "Y";
                                }
                            })
                            //increment the case count only if countCase is less than Total count value(from validatefqa serial # api response)....compare against TotalCount variable
                            if (this.countCase < this.TotalCount) {
                                this.countCase++;
                                this.isCountCaseDisabled = true;
                                this.serialNumber = "";
                                this.serialNumberFocus();
                            }
                        }
                        else {
                            inputControl.applyRequired(true);
                            this.appErrService.setAlert(this.appService.getErrorText('3720017'), true);
                        }
                    } else if ((element.SerialNumber == this.serialNumber || element.MSN == this.serialNumber) && element.Remarks !== "") {
                        this.verifiedSerialNumber = this.serialNumber;
                        this.isContainerEnable = true;
                        this.isVerifyDisabled = true;
                        this.masterPageService.disabledSerialNumber = true;
                        this.configContainerProperties();
                        this.containerFocus();
                    }
                    this.defaultCaseValue++;
                });
                if (this.countCase == this.TotalCount) {
                    this.validatecountCase();
                }
            }
            else {
                inputControl.applyRequired(true);
                inputControl.applySelect();
                let userMessage = new Message();
                this.messageNum = "2660044";
                this.messageType = MessageType.failure;
                userMessage = this.messagingService.SendUserMessage(this.messageNum, this.messageType);
                this.appErrService.setAlert(userMessage.messageText, true);
            }
        }

    }


    singleUnitVarification(inputControl) {
        if (this.fqaDeviceListData.length > 0) {
            inputControl.applyRequired(false);
            this.appErrService.clearAlert();
            const index = this.fqaDeviceListData.findIndex(ele => ele.SerialNumber === this.serialNumber);
            if (index === -1) {
                this.singleunitSerialNumberverfication();
            }
            else {
                inputControl.applyRequired(true);
                inputControl.applySelect();
                this.appErrService.setAlert(this.appService.getErrorText('3720017'), true);
            }
        } else {
            this.singleunitSerialNumberverfication();
        }
    }

    //**single Unit and single unit case build  *//
    singleunitSerialNumberverfication() {
        this.spinner.show();
        let requestObj = { ClientData: this.clientData, UIData: this.uiData, FqaCase: this.FqaCase };
        const url = String.Join("/", this.apiConfigService.varifyFQASerialNumbersUrl, this.serialNumber, this.selectedFQAMode);
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                let res = response.body;
                this.spinner.hide();
                if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                    this.validSingleunitSerialNumberResponse = response.body;
                    let traceData = { traceType: this.traceTypes.serialNumber, traceValue: this.serialNumber, uiData: this.uiData }
                    let traceResult = this.commonService.findTraceHold(traceData, this.uiData);
                    traceResult.subscribe(result => {
                        if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) {
                            if (checkNullorUndefined(result.Response)) {
                                this.commonService.getReadOnlyDeviceDetails(this.serialNumber, this.uiData, true);
                            } else {
                                this.canProceed(result, this.traceTypes.serialNumber);
                            }
                            this.spinner.hide();
                        } else if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) {
                            this.spinner.hide();
                            this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
                        }
                    });
                }
                else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                    this.spinner.hide();
                    if (!checkNullorUndefined(res.Response.DeviceErrors)) {
                        this.inValidSerialNumberGrid(res.Response.DeviceErrors);
                        this.grid = new Grid();
                        this.grid.PaginationId = "validateSerialNo",
                            this.deviceErrors = this.appService.onGenerateJson(this.serialNumberList, this.grid);
                        this.openModal();
                    }
                    else {
                        this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                    }
                }
            },
                error => {
                    this.appErrService.handleAppError(error);
                });
    }

    validateSingleunitSerialNumber(res = this.validSingleunitSerialNumberResponse) {
        this.FQAPrint = true;
        this.FQAPrintDisabled = false;
        this.totalCaseCount = res.Response.CaseCount;
        this.TotalCount = res.Response.TotalCount;
        this.fqaDeviceListResponse = res.Response;
        if (!checkNullorUndefined(res.Response.FqaCase)) {
            // **singleunit Case Build process** //
            this.FqaCase = res.Response.FqaCase;
            this.batchId = this.FqaCase.Batchid;
            if (this.totalCaseCount == this.TotalCount) {
                this.masterPageService.disabledSerialNumber = true; // case full scenario
                let userMessage = new Message();
                this.messageNum = "3720023";
                this.messageType = MessageType.info;
                userMessage = this.messagingService.SendUserMessage(this.messageNum, this.messageType);
                this.appErrService.setAlert(userMessage.messageText, true, userMessage.messageType);
            } else {
                this.serialNumber = "";
                this.serialNumberFocus();
            }
        } else {
            // **singleunit process** //
            this.masterPageService.disabledSerialNumber = true;
            this.batchId = res.Response.Batchid;
        }
        this.FQAPrint = true;
        this.FQAPrintDisabled = false;
        this.countCase = this.TotalCount;
        if (res.Response.ProcessEnable == 'Y') {
            this.isProcessDisabled = false;
            this.appService.setFocus('Process');
        }
        if (!checkNullorUndefined(this.rmgrid)) {
            this.rmgrid.isClear = true;
        }
        res.Response.FqaVerifyDevices.forEach((element) => {
            const index = this.fqaDeviceListData.findIndex(ele => ele.SerialNumber === element.SerialNumber);
            if (index === -1) {
                if (!checkNullorUndefined(this.deviceOrigination) && this.deviceOrigination != '') {
                    element.Origination = this.deviceOrigination;
                }
                this.fqaDeviceListData.push(element);
            }
        });
        this.fqaVerifiedDeviceList = this.fqaDeviceListData;
        this.fqaDeviceGrid(this.fqaDeviceListData);
        this.grid = new Grid();
        this.grid.PaginationId = "serialNumberRemarks";
        this.fqaDeviceList = this.appService.onGenerateJson(this.fqaDeviceList, this.grid);
        this.fqaDeviceListProperties = true;
        this.validSingleunitSerialNumberResponse = null;
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
                        this.commonService.getReadOnlyDeviceDetails(this.serialNumber, this.uiData, true);
                    }
                } else if (returnedData.Response.canProceed == 'N') {
                    if (type == this.traceTypes.serialNumber) {
                        this.serialNumberFocus();
                    }
                    this.appErrService.setAlert(returnedData.StatusMessage, true);
                }
                }
            });
        }
    }
    openModal() {
        // this.modalRef = this.modalService.show(this.template, { backdrop: 'static', keyboard: false, class: 'modal-md modal-dialog-centered' });
        this.dialogRef = this.dialog.open(this.template, {
            hasBackdrop: true,
            disableClose: true,
            panelClass: 'dialog-width-sm'
        });
        this.isModalOpen = true;
    }

    //close the modal
    hideModal() {
        this.dialogRef.close();
        this.appErrService.setAlert("", false);
        this.appErrService.clearAlert();
        this.serialNumberInput.applyRequired(true);
        this.serialNumberInput.applySelect();
        this.fqaDeviceListProperties = false;
    }

    //Validate Count Case
    validatecountCase() {
        var caseCountConatiner = <HTMLInputElement>document.getElementById('caseCount');
        if (!checkNullorUndefined(this.countCase)) {
            if (this.countCase === this.TotalCount) {
                this.fqaDeviceList['Elements'].forEach((element, i) => {
                    element.Verify = "Y";
                    this.fqaDeviceListData.forEach((ele) => {
                        if (ele.SerialNumber == element.SerialNumber) {
                            ele.Verify = "Y";
                        }
                    });
                });
                this.isfqaClearDisabled = true;
            }
            this.fqaVerifiedDeviceList = this.fqaDeviceListData;
            let FqaVerifyDevices: any = {};
            FqaVerifyDevices.FqaVerifyDevice = this.fqaVerifiedDeviceList;
            let requestObj = { ClientData: this.clientData, FqaVerifyDevices: FqaVerifyDevices, UIData: this.uiData };
            const url = String.Join("/", this.apiConfigService.validateCaseCountUrl, this.countCase.toString());
            this.apiService.apiPostRequest(url, requestObj)
                .subscribe(response => {
                    let res = response.body;
                    this.spinner.hide();
                    if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                        this.validcountCaseResponse = res;
                        this.commonService.getReadOnlyDeviceDetailsForContainer(this.contsummaryParent.rmtextchild.value, this.uiData);
                    }
                    if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                        this.spinner.hide();
                        this.text = res.ErrorMessage.ErrorDetails;
                        this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                        this.snackbar.error(this.text);
                        this.caseCountBorder(true);
                        caseCountConatiner.select();
                    }
                },
                    error => {
                        this.appErrService.handleAppError(error);
                    });
        }
    }
    private validatecountCaseSuccess(res = this.validcountCaseResponse) {
        if (res) {
            this.fqaDeviceListData = res.Response.FqaVerifyDevices;
            this.fqaVerifiedDeviceList = this.fqaDeviceListData;
            this.batchId = res.Response.BatchId;
            if (res.Response.ProcessEnable === 'Y') {
                this.isProcessDisabled = false;
                this.isCountCaseDisabled = true;
                this.isVerifyDisabled = true;
                // this.isfqaClearDisabled = false;
                this.serialNumber = '';
                this.masterPageService.disabledSerialNumber = true;
                this.processFocus();
            }
        }
        //disable case count and based on the response show rmbadge with batchid(got from response) and enable process button based on processenable value from response.. 
        //call process api when user clicks on process button. If status is pass then call getbatchqueue api. on clear container button click stop polling and clear the queue
        this.validcountCaseResponse = null;
    }


    //Process
    process() {
        let result = this.commonService.validateReadOnlyDeviceDetailsForContainer(this.uiData);
        result.subscribe(response => {
            if (!checkNullorUndefined(response) && response.Status === this.statusCode.pass) {
                this.spinner.show();
                if (this.fqaVerifiedDeviceList.length > 0) {
                    if (this.batchId && this.inboundContainer) {
                        let FqaVerifyDevices: any = {};
                        FqaVerifyDevices.FqaVerifyDevice = this.fqaVerifiedDeviceList;
                        let requestObj = { ClientData: this.clientData, FqaVerifyDevices: FqaVerifyDevices, UIData: this.uiData };
                        const url = String.Join("/", this.apiConfigService.fqaProcessUrl, this.batchId, this.inboundContainer);
                        this.apiService.apiPostRequest(url, requestObj)
                            .subscribe(response => {
                                let res = response.body;
                                this.spinner.hide();
                                if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                                    const postUrl = String.Join('/', this.apiConfigService.postFqaUpdateProcess, this.batchId);
                                    this.commonService.postUpdateProcess(postUrl, requestObj);
                                    this.masterPageService.gridBatchId = this.batchId;
                                    setTimeout(() => {
                                        this.masterPageService.gridBatchId = "";
                                    }, 20000);
                                    this.snackbar.success(res.Response);
                                    this.isVerifyDisabled = false;
                                    this.batchId = "";
                                    this.countCase = null;
                                    this.isCountCaseDisabled = true;
                                    if (!checkNullorUndefined(this.contsummaryParent)) {
                                        this.contsummaryParent.isClearDisabled = false;
                                    }
                                    this.fqaDeviceListProperties = true;
                                    if (!checkNullorUndefined(this.rmgrid)) {
                                        this.rmgrid.isClear = false;
                                    }
                                    this.fqaDeviceList = null;
                                    this.clearContainerSummary();
                                    if (this.selectedFQAMode == this.warehouseTransferModes.singleUnitCaseBuild) {
                                        this.masterPageService.disabledSerialNumber = false;
                                        this.isSerialNumberResetDisabled = true;
                                        this.FqaCase = null;
                                    }
                                    this.isVerifyDisabled = true;
                                    this.reset(); //clearing after process
                                    this.Clear();
                                }
                                else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                                    this.spinner.hide();
                                    this.text = res.ErrorMessage.ErrorDetails;
                                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                                    this.snackbar.error(this.text);
                                }
                            },
                                error => {
                                    this.appErrService.handleAppError(error);
                                });
                    }
                }
            }
            else if (!checkNullorUndefined(response) && response.Status === this.statusCode.fail) {
                this.spinner.hide();
                this.reset();
                this.Clear();
                this.appErrService.setAlert(response.ErrorMessage.ErrorDetails, true);
            }
        })

    }

    // processing on button click
    processTransfer() {
        this.updateLottables();
    }

    //updateLottables 
    updateLottables() {
        this.spinner.show();
        this.lottableTrans = new LottableTrans();
        const url = String.Join("/", this.apiConfigService.updateLottables, this.contsummaryParent.rmtextchild.value);
        const requestObj = { ClientData: this.clientData, UIData: this.uiData, LottableTrans: this.lottableTrans };
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                const res = response.body;
                if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                    this.process();
                } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                    this.spinner.hide();
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                }
            }, erro => {
                this.appErrService.handleAppError(erro);
            });
    }


    //move serial number 
    moveSerialNumber() {
        this.spinner.show();
        let requestObj = { ClientData: this.clientData, Device: this.fqaDevice, UIData: this.uiData };
        const url = String.Join("/", this.apiConfigService.moveSerialNumberUrl);
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                let res = response.body;
                this.spinner.hide();
                if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                    this.snackbar.success(res.Response);
                    this.isMoveDisabled = true;
                    this.clearContainerID();
                    this.refreshFQASerialNumbers();
                    this.isContainerEnable = false;  //added for hiding container
                }
                else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                    this.spinner.hide();
                    this.text = res.ErrorMessage.ErrorDetails;
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                    this.snackbar.error(this.text);
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
        const url = String.Join("/", this.apiConfigService.refreshContainerUrl, this.contsummaryParent.rmtextchild.value);
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                let result = response.body;
                // .subscribe(result => {
                this.spinner.hide();
                if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) {
                    if (result.Response.Quantity == 0) {
                        this.reset();
                        if (result.StatusMessage) {
                            this.snackbar.success(result.StatusMessage);//need to check                            
                        }
                    } else {
                        this.container.Quantity = result.Response.Quantity;
                        this.contsummaryParent.quantity = (this.container.Quantity).toString();
                        if (!checkNullorUndefined(this.contsummaryParent)) {
                            this.contsummaryParent.getInboundDetails();
                        }
                    }

                }
                if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) {
                    this.containerReload();
                    this.contsummaryParent.quantity = "";
                    this.contsummaryParent.category = "";
                    this.isCountCaseDisabled = true;
                    this.contsummaryParent.inbContainerDisabled = false;
                    this.contsummaryParent.rmtextchild.applySelect();
                    this.contsummaryParent.rmtextchild.applyRequired(true);
                    this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
                }
            },
                error => {
                    this.appErrService.handleAppError(error);
                });
    }

    //refreshFQASerialNumbers
    refreshFQASerialNumbers() {
        this.fqaVerifiedDeviceList = this.fqaDeviceListData;
        this.spinner.show();
        let FqaVerifyDevices: any = {};
        FqaVerifyDevices.FqaVerifyDevice = this.fqaVerifiedDeviceList;
        let requestObj = { ClientData: this.clientData, FqaVerifyDevices: FqaVerifyDevices, UIData: this.uiData };
        const url = String.Join("/", this.apiConfigService.refreshFQASerialNumbers, this.verifiedSerialNumber);
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                let res = response.body;
                this.spinner.hide();
                if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                    this.fqaDeviceListData = [];
                    res.Response.FqaVerifyDevices.forEach((element) => {
                        this.fqaDeviceListData.push(element);
                    });
                    this.fqaDeviceGrid(res.Response.FqaVerifyDevices);
                    this.grid = new Grid();
                    this.grid.PaginationId = "serialNumberRemarks";
                    this.fqaDeviceList = this.appService.onGenerateJson(this.fqaDeviceList, this.grid);
                    if (res.Response.CaseCountEnable == "Y") {
                        this.isCountCaseDisabled = false;
                    }
                    this.TotalCount = res.Response.TotalCount;
                    this.masterPageService.disabledSerialNumber = false;
                    this.serialNumber = "";
                    this.isVerifyDisabled = true;
                    this.serialNumberFocus();
                    this.refreshContainer();
                }
                else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                    this.spinner.hide();
                    this.text = res.ErrorMessage.ErrorDetails;
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                    this.snackbar.error(this.text);
                }
            },
                error => {
                    this.appErrService.handleAppError(error);
                });
    }


    //enable clear button container validation
    validateContainerSummary(val) {
        this.appErrService.clearAlert();
        this.contsummaryParent.isClearDisabled = val;
        if (val == false) {
            this.contsummaryParent.quantity = "";
            this.contsummaryParent.category = "";
        }
    }

    //change input box
    changeInput(inputControl: RmtextboxComponent) {
        this.isVerifyDisabled = false;
        this.isfqaClearDisabled = false;
        this.isSerialNumberResetDisabled = false;
        inputControl.applyRequired(false);
        this.appErrService.clearAlert();
    }

    caseCountinputChange() {
        this.caseCountBorder(false);
        this.appErrService.clearAlert();
    }

    //change control
    onControllerChange(inputControl) {
        inputControl.applyRequired(false);
        this.appErrService.clearAlert();
    }
    //toggle fqaReprint
    changeFQAPrint(val: boolean) {
        this.FQAPrint = val;
    }

    //Emit Clear 
    clearEmit(val) {
        this.isfqaClearDisabled = val;
    }

    //clear
    reset() {
        this.defaultCaseValue = 0;
        this.countCase = null;
        this.TotalCount = 0;
        this.headingsobj = [];
        this.inboundProperties = null;
        if (this.selectedFQAMode !== this.warehouseTransferModes.singleUnitCaseBuild) {
            this.containerReload();
            this.clearContainerSummary();
            if (!checkNullorUndefined(this.contsummaryParent)) {
                this.contsummaryParent.containersList = [];
                this.contsummaryParent.deviceList = [];
                this.contsummaryParent.containerSummaryPropertiesList = [];
                this.contsummaryParent.canAllowNextContainerStatus = null;
                this.contsummaryParent.containerSummaryProperties = [];
                this.contsummaryParent.containerActualProp = null;
            }
        }
        this.multipleContainerList = null;
        this.appErrService.clearAlert();
        this.FQAPrint = false;
        this.FQAPrintDisabled = true;
        this.commonService.readOnlyDeviceArray = [];
        this.uiData.OperationId = this.operationId;
    }

    containerReload() {
        this.serialNumber = "";
        this.containerID = "";
        this.batchId = "";
        this.isCountCaseDisabled = true;
        this.isfqaClearDisabled = true;
        if (!checkNullorUndefined(this.contsummaryParent)) {
            this.contsummaryParent.isClearDisabled = true;
        }
        this.FQAPrint = false;
        this.isVerifyDisabled = true;
        this.isProcessDisabled = true;
        this.masterPageService.disabledSerialNumber = true;
        this.isContainerEnable = false;
        this.fqaDeviceListProperties = false;
        this.isSerialNumberVerification = false;
        this.fqaDeviceList = null;
        this.fqaDeviceListData = [];
        this.masterPageService.inboundContainerFocus();
        this.clearContainerID();
    }

    // clearing serialnumber verfication
    clearSerialNumberVerification() {
        if (this.fqaDeviceList && this.fqaDeviceList['Elements']) {
            this.fqaDeviceList['Elements'].forEach((element, i) => {
                element.Verify = 'N';
                this.fqaDeviceListData.forEach((ele) => {
                    if (ele.SerialNumber === element.SerialNumber) {
                        ele.Verify = 'N';
                    }
                });
            });
        }
    }

    //clear button 
    fqaClear() { //modes other than single unit
        this.appErrService.clearAlert();
        this.serialNumber = "";
        this.isfqaClearDisabled = true;
        this.isProcessDisabled = true;
        this.isMoveDisabled = true; // input property created in container suggestion but not assigning,
        if (!(this.selectedFQAMode == WarehouseTransferModes.singleUnitCaseBuild)) {
            if (this.countCase == this.TotalCount && this.batchId !== "") {
                this.isCountCaseDisabled = true;
                this.isProcessDisabled = false;
                this.masterPageService.disabledSerialNumber = true;
            }
            else if (this.fqaDeviceListData.length > 0) {
                this.clearSerialNumberVerification();
                this.masterPageService.disabledSerialNumber = false;
                this.isCountCaseDisabled = false;
                this.countCase = null;
            }
        }
        else if ((!checkNullorUndefined(this.totalCaseCount)) && this.totalCaseCount == this.TotalCount) {
            this.isProcessDisabled = false;
        }
        this.clearContainerID();
        if (this.masterPageService.disabledSerialNumber == false) {
            this.serialNumberFocus();
        }
    }

    //serial Number reset 
    serialNumberReset() {
        this.FqaCase = null;
        this.isSerialNumberResetDisabled = true;
        this.clearSignleUnit();
        this.commonService.readOnlyDeviceArray = [];
    }

    //single unit clear 
    clearSignleUnit() {
        this.serialNumber = '';
        this.fqaDeviceListProperties = false;
        this.countCase = null;
        this.batchId = "";
        this.FQAPrint = false;
        this.fqaDeviceList = null;
        this.fqaDeviceListData = [];
        this.isfqaClearDisabled = true;
        this.isProcessDisabled = true;
        this.isCountCaseDisabled = true;
        this.fqaVerifiedDeviceList = [];
        this.masterPageService.disabledSerialNumber = false;
        this.serialNumberFocus();
    }
    clearContainerVerification() {
        this.serialNumber = '';
        this.clearContainerID();
        this.fqaDeviceListProperties = false;
        //  this.containerReload();
        this.clearContainerSummary();
        this.appErrService.clearAlert();
        this.serialNumber = "";
        this.containerID = "";
        this.batchId = "";
        this.countCase = null;
        /*  if (!checkNullorUndefined(!this.contsummaryParent)) {
            this.contsummaryParent.isClearDisabled = true;
        }  */
        this.FQAPrint = false;
        this.isVerifyDisabled = true;
        this.isProcessDisabled = true;
        this.masterPageService.disabledSerialNumber = true;
        this.isContainerEnable = false;
        this.fqaDeviceListProperties = false;
        this.isSerialNumberVerification = false;
        this.fqaDeviceList = null;

        this.masterPageService.inboundContainerFocus();
        this.clearContainerID()
    }
    //Clear Container Suggestion 
    clearContainerID() {
        if (!checkNullorUndefined(this.childContainer)) {
            let container = this.childContainer;
            container.ContainerID = "";
            container.suggestedContainer = "";
            container.categoryName = "";
            container.isContainerDisabled = true;
            container.iconBtnDisabled = true;
            container.isClearContainerDisabled = true;
            container.applyRequired(false);
            container.containerResponse = null;
        }
    }

    //Clear Container Summary
    clearContainerSummary() {
        if (!checkNullorUndefined(this.contsummaryParent)) {
            let container = this.contsummaryParent;
            container.inbContainerDisabled = false;
            container.rmtextchild.value = "";
            container.quantity = "";
            container.category = "";
            container.isClearDisabled = true;
        }
    }


    //Serial Number Focus
    serialNumberFocus() {
        this.appService.setFocus('serialNum');
    }

    //Container Focus
    containerFocus() {
        this.appService.setFocus('containerInputId');
    }

    //Move button Focus 
    moveFocus() {
        this.appService.setFocus('Move');
    }
    processFocus() {
        this.appService.setFocus('Process');
    }

    /**container suggestion bussiness control logics */
    //Refresh and getSuggestionContainer(focus) 
    //getSuggestContainer sending receive device to child conatiner 
    getSuggestContainer(value) {
        this.containerFocus();
        let container = this.childContainer;
        container.isExceptionCategory = "Y";
        container.verifyserialNumber = this.verifiedSerialNumber;
        if (checkNullorUndefined(value)) {
            this.configContainerProperties();
            container.getSuggestContainer();
        } else {
            this.clearContainerID();
            this.isMoveDisabled = true;
            this.configContainerProperties();
            container.getSuggestContainer();
        }
    }

    //getSuggestContainerRespons 
    getSuggestContainerResponse(response) {
        this.fqaDevice = response.Device;
        this.fqaDevice.ContainerCycle = response.Container.ContainerCycle;
    }

    //validateContainer and sending updated device to child conatiner 
    validateContainer(response) {
        if (!checkNullorUndefined(response)) {
            this.fqaDevice.ContainerID = response.Container.ContainerID;
            this.fqaDevice.ContainerCycle = response.Container.ContainerCycle;
            this.childContainer.validateContainer(this.fqaDevice);
        }
    }

    //After enter button on container
    getContainerId(containerid) {
        this.containerID = containerid;
    }

    // emiting after "enter" validating Containerid (after validatingcontainerapi  or container id matching with suggest container) 
    validateContainerResponse(response) {
        // this.moveFocus();
        if (!checkNullorUndefined(response)) {
            this.container = response;
            this.isMoveDisabled = false;
            this.fqaDevice.ContainerCycle = this.container.ContainerCycle;
            this.fqaDevice.ContainerID = this.container.ContainerID;
            this.moveSerialNumber();
        }
        else {
            this.fqaDevice.ContainerID = this.containerID;
            this.moveSerialNumber();
        }
    }

    //input match 
    checkContainer(container) {
        if (!checkNullorUndefined(container)) {
            this.isMoveDisabled = false;
            this.fqaDevice.ContainerID = container.ContainerID;
            this.fqaDevice.ContainerCycle = container.ContainerCycle;
        }
        else {
            this.isMoveDisabled = true;
        }
    }

    //enabling the button and container ID
    configContainerProperties() {
        if (!checkNullorUndefined(this.childContainer)) {
            this.childContainer.isContainerDisabled = false;
            this.childContainer.isClearContainerDisabled = false;
        }
    }
    /**container suggestion bussiness logic end **/




    // casecount validation error
    caseCountBorder(val: boolean) {
        if (val) {
            let elem: HTMLElement = document.getElementById('caseCount');
            return elem.setAttribute("style", "border: 1px solid red;");
        }
        else {
            let elem: HTMLElement = document.getElementById('caseCount');
            return elem.removeAttribute('style');
        }
    }

    onCaseCountBlur() {
        this.caseCountBorder(false);
    }


    //**processing grid**//
    fqaDeviceGrid(dataGrid) {
        if (!checkNullorUndefined(dataGrid)) {
            this.fqaDeviceList = [];
            dataGrid.forEach(res => {
                let element: FqaDevice = new FqaDevice();
                element.SerialNumber = res.SerialNumber;
                if (!checkNullorUndefined(res.MSN) && res.MSN != "") {  //for Verizon
                    element.MSN = res.MSN;
                }
                element.Remarks = res.Remarks;
                element.Verify = res.Verify;
                this.fqaDeviceList.push(element);
            });
        }
    }

    //Invalid Serial numbers//
    inValidSerialNumberGrid(dataGrid) {
        if (!checkNullorUndefined(dataGrid)) {
            this.serialNumberList = [];
            dataGrid.forEach(res => {
                let element: FqaDevice = new FqaDevice();
                element.SerialNumber = res.SerialNumber;
                element.Remarks = res.Message;
                this.serialNumberList.push(element);
            });
        }
    }


    onProcessQueGenerateJsonGrid(Response) {
        if (!checkNullorUndefined(Response)) {
            this.processQueData = [];
            Response.forEach(res => {
                let element: any = {};
                element.BatchId = res.BatchId;
                element.Container = res.ContainerId;
                element.Status = res.Status;
                element.Remarks = res.Remarks;
                element.WTContainerId = res.WTContainerId;
                element.WTReceiptKey = res.WTReceiptKey;
                this.processQueData.push(element);
            });
        }
    }

    //**processing grid ends**//

    //containerSummaryProperties
    containerSummaryProperties(event: any) {
        this.headingsobj = [];
        this.headingsobj = Object.keys(event);
        this.inboundProperties = event;
    }
    getModes() {
        this.spinner.show();
        /* UIData: this.uiData */
        let requestObj = { ClientData: this.clientData };
        const getModesUrl = String.Join("/", this.apiConfigService.getModes);
        this.apiService.apiPostRequest(getModesUrl, requestObj)
            .subscribe(response => {
                let res = response.body;
                if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                    res.Response.Modes.forEach((element) => {
                        let dd: dropdown = new dropdown();
                        dd.Id = element.Id;
                        dd.Text = element.Text;
                        this.masterPageService.options.push(dd);
                    });
                    if (res.Response.Modes.length === 1) {
                        this.masterPageService.option = res.Response.Modes[0].Id;
                        this.changeFQAMode(res.Response.Modes[0].Text);
                    }
                    this.spinner.hide();
                } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                }
            }, erro => {
                this.appErrService.handleAppError(erro);
            });
    }

    Clear() {
        if (this.selectedFQAMode == this.warehouseTransferModes.singleUnit) {
            this.clearSignleUnit();
        } else {
            this.fqaClear();
        }
        this.commonService.readOnlyDeviceArray = [];
    }

    getSNRetestStatus() {
        if (this.selectedFQAMode == this.warehouseTransferModes.singleUnitCaseBuild) {
            return true;
        }
    }

    ngOnDestroy() {
        if (this.pollingData != undefined) {
            this.pollingData.unsubscribe();
            this.clear.click();
        }
        this.masterPageService.categoryName = null;
        this.masterPageService.operationList = [];
        this.masterPageService.operationsdropdown = [];
        this.masterPageService.module = "";
        this.masterPageService.operCategoryTests = [];
        this.masterPageService.setDropDown(false);
        this.masterPageService.clearModule();
        this.appErrService.clearAlert();
        this.masterPageService.tempQueList = null;
        this.masterPageService.operationDisabled = false;
        // localStorage.removeItem("operationObj");
        if (this.contsummaryParent) {
            if (this.contsummaryParent.dialogRef) {
                this.contsummaryParent.dialogRef.close();
            }
        }
        this.totalCaseCount = 0;
        this.batchQueData = [];
        this.masterPageService.disabledSerialNumber = true;
        this.masterPageService.moduleName.next(null);
        this.masterPageService.operationObj = null;
        this.masterPageService.showUtilityIcon = false;
        this.masterPageService.showRibbondropdown = false;
        this.masterPageService.options = [];
        this.fqaVerifiedDeviceList = [];
        this.fqaDeviceListData = [];
        this.FqaOnChangeMode.unsubscribe();
        this.masterPageService.selectedOptionMode.next(null);
        if (!checkNullorUndefined(this.originationOperation) && this.originationOperation) {
            this.originationOperation.unsubscribe();
        }
        //clearing the readOnlyDevice subscription methods data
        this.commonService.emitReadOnlyDeviceResponse.next(null);
        this.emitReadOnlyDeviceResponse.unsubscribe();
        this.commonService.emitReadOnlyDeviceResponseForContainer.next(null);
        this.emitReadOnlyDeviceResponseForContainer.unsubscribe();
        this.masterPageService.clearOriginationSubscription();
        this.masterPageService.gridBatchId = "";
        if (this.masterPageService.hideControls.controlProperties) {
            this.masterPageService.hideControls.controlProperties = new EngineResult();
        }
        if (this.dialogRef) {
            this.dialogRef.close();
        }
        this.commonService.readOnlyDeviceArray = [];
        if (this.emitSpinner) {
            this.emitSpinner.unsubscribe();
        }
        this.masterPageService.emitHideSpinner.next(null);
        this.masterPageService.option = null;
        this.masterPageService.hideSpinner = false;
    }
}
