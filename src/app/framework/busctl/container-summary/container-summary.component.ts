import { CommonEnum } from './../../../enums/common.enum';
import { Component, OnInit, ViewChild, Output, EventEmitter, AfterViewInit, Input, OnDestroy, TemplateRef } from '@angular/core';
import { AppErrorService } from './../../../utilities/rlcutl/app-error.service';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiConfigService } from './../../../utilities/rlcutl/api-config.service';
import { ApiService } from './../../../utilities/rlcutl/api.service';
import { TestingDevice } from './../../../models/testing/TestingDevice';
import { RmtextboxComponent } from './../../frmctl/rmtextbox/rmtextbox.component';
import { Container } from '../../../models/common/Container';
import { String } from 'typescript-string-operations';
import { MasterPageService } from './../../../utilities/rlcutl/master-page.service';
import { Message } from '../../../models/common/Message';
import { MessageType } from '../../../enums/message.enum';
import { MessagingService } from '../../../utilities/rlcutl/messaging.service';
import { ContainerSuggestionComponent } from '../container-suggestion/container-suggestion.component';
import { SerialNumberMoveComponent } from '../serial-number-move/serial-number-move.component';
import { AppService } from '../../../utilities/rlcutl/app.service';
import { ClientData } from '../../../models/common/ClientData';
import { UiData } from '../../../models/common/UiData';
import { TraceTypes } from '../../../enums/traceType.enum';
import { CommonService } from '../../../services/common.service';
import { FindTraceHoldComponent } from '../../../framework/busctl/find-trace-hold/find-trace-hold.component';
import { StorageData } from '../../../enums/storage.enum';
import { StatusCodes } from '../../../enums/status.enum';
import { OperationEnum } from '../../../enums/operation.enum';
import { checkNullorUndefined } from '../../../enums/nullorundefined';
import { ContainerSummaryDialogComponent } from '../../../dialogs/container-summary-dialog/container-summary-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'container-summary',
    templateUrl: './container-summary.component.html',
    styleUrls: ['./container-summary.component.css']
})
export class ContainerSummaryComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild(RmtextboxComponent) rmtextchild: RmtextboxComponent;
    @ViewChild('popTemplate') template: TemplateRef<any>;
    @Input() inbContainerDisabled: boolean;
    @Input() id: string;
    @Input() uiData: UiData;
    @Input() isHideResetButton = false;
    @Input() isHideContSummarySection = false;
    @Input() transferTypeConfigObj: any;
    containerSummaryPropertiesList: any = [];
    containerSummaryProperties = [];
    containerActualProp: any;
    activeContainerId: any;

    @Output() receiptKey = new EventEmitter<string>();
    @Output() queList = new EventEmitter<string>();
    @Output() emitshowAlert = new EventEmitter<boolean>();
    @Output() emitalertText = new EventEmitter<string>();
    @Output() emitcontainerID = new EventEmitter<string>();
    @Output() emitisContainerValid = new EventEmitter<boolean>();
    @Output() clearEmit = new EventEmitter<boolean>();
    @Output() clear = new EventEmitter();
    @Output() emitSerialNumber = new EventEmitter();
    @Output() emitSpinner = new EventEmitter();
    @Output() emitContainerSummaryResponse = new EventEmitter();
    @Output() validateFQASerialNumbers = new EventEmitter();
    @Output() emitContainerSummaryProperties = new EventEmitter();
    @Output() containerList = new EventEmitter();
    @Output() emitCurrentOperationId = new EventEmitter();
    @ViewChild(ContainerSuggestionComponent) childContainer: ContainerSuggestionComponent;
    @ViewChild(SerialNumberMoveComponent) childSerialNumberMove: SerialNumberMoveComponent;

    // dynamic button props
    @Input() isDynamicButton = false;
    @Input() isDynamicButtonDisabled = true;
    @Input() dynamicButtonId: string;
    @Input() dynamicButtonName: string;
    @Input() dynamicButtonIcon: string;

    @Output() dynamicButtonClick = new EventEmitter();

    //variables
    category: string;
    quantity: any;
    text: string;
    serialNumbers = [];
    conatainerSummaryResponse: any;
    isClearDisabled = true;
    // Modal popup
    closeBtnName: string;
    title: string = "Invalid Serial Numbers";

    isModalOpen: boolean = false;
    inbContainerId: string;
    //messages
    messageNum: string;
    messagesCategory: string;
    messageType: string;
    flag: boolean = true;
    headingsobj = [];

    //client Control Labels
    controlConfig: any;
    clientData = new ClientData();
    autoQueuetempList: boolean = false;
    containersList = [];
    searchInbContainerId: any;
    deviceList = [];
    canAllowNextContainerStatus: any;

    traceTypes = TraceTypes;
    validinboundContainerResponse: any;
    storageData = StorageData;
    statusCode = StatusCodes;
    modelTittle = OperationEnum.serialNumberMove;
    dialogRef: any;

    constructor(
        private apiService: ApiService,
        private apiConfigService: ApiConfigService,
        private spinner: NgxSpinnerService,
        private snackbar: XpoSnackBar,
        private appErrService: AppErrorService,
        private app: AppService,
        private masterPageService: MasterPageService,
        private commonService: CommonService,
        private dialog: MatDialog
    ) { }

    ngOnInit() {
        this.controlConfig = JSON.parse(localStorage.getItem(this.storageData.controlConfig));
        this.title = this.app.getErrorText('2660042');
        this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
    }

    ngAfterViewInit() {
    }

    ngOnDestroy() {
        this.appErrService.setAlert('', false);
        if (this.dialogRef) {
            this.dialogRef.close();
        }
    }

    openModal() {
        this.isModalOpen = true;
        this.dialogRef = this.masterPageService.openModelPopup(ContainerSummaryDialogComponent, false, 'dialog-width-md', {
            data: {
                "title": this.title,
                "serialNumbers": this.serialNumbers,
                "flag": this.flag,
                "modelTittle": this.modelTittle,
                "isModalOpen": this.isModalOpen
            }
        })
    }

    //close the modal
    hideModal() {
        this.dialogRef.hide();
        this.rmtextchild.applyRequired(true);
        this.rmtextchild.applySelect();
    }

    getAutoVirtualContainer() {
        const requestObj = { ClientData: this.clientData, UIData: this.uiData };
        this.commonService.commonApiCall(this.apiConfigService.getAutoVirtualContainerUrl, requestObj, (res, statsFlag) => {
            this.spinner.hide();
            if (statsFlag) {
                if (res.StatusMessage) {
                    this.snackbar.success(res.StatusMessage);
                }
                this.inbContainerId = res.Response.ContainerID;
                this.validateInboundContainer({ value: res.Response.ContainerID });
            } else {
                this.inbContainerDisabled = false;
                this.isClearDisabled = false;
            }
        });
    }

    //Validate container
    validateInboundContainer(inbContainer) {
        // if (this.inbContainerDisabled == false) {
        this.spinner.show();
        this.appErrService.clearAlert();
        let container = new Container();
        container.ClientId = localStorage.getItem(this.storageData.clientId);
        container.Location = localStorage.getItem(this.storageData.location);
        container.ContainerID = inbContainer.value.trim();
        let requestObj = { ClientData: this.clientData, Container: container, UIData: this.uiData, Containers: this.containersList };
        const url = String.Join("/", this.apiConfigService.validateInboundContainerUrl);
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                let res = response.body;
                if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                    this.validinboundContainerResponse = res;
                    let traceData = { traceType: this.traceTypes.containerID, traceValue: container.ContainerID, uiData: this.uiData }
                    let traceResult = this.commonService.findTraceHold(traceData, this.uiData);
                    traceResult.subscribe(result => {
                        if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) {
                            if (checkNullorUndefined(result.Response)) {
                                this.validInboundContainer(inbContainer.value.trim());
                            } else {
                                this.canProceed(result, this.traceTypes.containerID, inbContainer.value.trim())
                            }
                        } else if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) {
                            this.spinner.hide();
                            this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
                        }
                    });
                }
                else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                    this.spinner.hide();
                    this.category = "";
                    this.quantity = "";
                    this.emitisContainerValid.emit(false);
                    this.inbContainerDisabled = false;
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                    this.rmtextchild.applySelect();
                    this.rmtextchild.applyRequired(true);
                }
            },
                error => {
                    this.appErrService.handleAppError(error);
                });
        // }

    }

    validInboundContainer(inbContainer, res = this.validinboundContainerResponse) {
        this.conatainerSummaryResponse = res.Response;
        this.emitContainerSummaryResponse.emit(this.conatainerSummaryResponse);
        this.masterPageService.operationDisabled = true;
        this.inbContainerDisabled = true;
        const url = String.Join('/', this.apiConfigService.validateContainerSerialNumbersUrl, inbContainer);
        this.getserialNumbers(url, res.Response.CategoryName, res.Response.Quantity, inbContainer);
        localStorage.setItem('inbContainerCategoryName', res.Response.CategoryName);
        this.validinboundContainerResponse = null;
    }

    canProceed(traceResponse, type, inbContainer) {
        if (traceResponse.Response.canProceed === CommonEnum.yes) {
            this.appErrService.setAlert(traceResponse.StatusMessage, true, MessageType.info);
        }
        if (!checkNullorUndefined(traceResponse.Response.TraceHold)) {
            let uiObj = { uiData: this.uiData }
            traceResponse = Object.assign(traceResponse, uiObj);
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
                    if (returnedData.Response.canProceed === CommonEnum.yes) {
                        if (type == this.traceTypes.containerID) {
                            this.validInboundContainer(inbContainer);
                        }
                    } else if (returnedData.Response.canProceed === CommonEnum.no) {
                        if (type == this.traceTypes.containerID) {
                            this.inboundContainerFocus();
                        }
                        this.appErrService.setAlert(returnedData.StatusMessage, true);
                    }
                }
            });
        }
    }

    //Get serial Number
    getserialNumbers(val, category, quantity, inbContainer) {
        let requestObj;
        if (this.transferTypeConfigObj && Object.keys(this.transferTypeConfigObj).length) {
            requestObj = { ClientData: this.clientData, UIData: this.uiData, Containers: this.containersList, Devices: this.deviceList, TransferTypeConfig: this.transferTypeConfigObj };
        } else {
            requestObj = { ClientData: this.clientData, UIData: this.uiData, Containers: this.containersList, Devices: this.deviceList };
        }
        this.apiService.apiPostRequest(val, requestObj)
            .subscribe(response => {
                let res = response.body;
                if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                    this.serialNumbers = [];
                    // if(res.Response instanceof Array){
                    // for (let result of res.Response) {
                    //     let testingDevice = new TestingDevice();
                    //     testingDevice.SerialNumber = result.SerialNumber;
                    //     this.serialNumbers.push(testingDevice);
                    // }
                    // }
                    this.category = category;
                    this.quantity = quantity;
                    this.emitcontainerID.emit(inbContainer);
                    this.containersList = [];
                    this.containerList.emit(res.Response.Containers);
                    this.containersList = res.Response.Containers;
                    this.deviceList = [];
                    this.deviceList = res.Response.DeviceList;
                    if (!checkNullorUndefined(res.Response) && !checkNullorUndefined(res.Response.CanAllowNextContainer)) {
                        this.canAllowNextContainerStatus = res.Response.CanAllowNextContainer;
                    }
                    //validate Fqa Serialnumber
                    this.validateFQASerialNumbers.emit({ InboundContainer: inbContainer, AutoPopSerialNumber: res.Response.AutoPopSerialNumber });
                    let batchCheck;
                    if (this.masterPageService.hideControls.controlProperties.hasOwnProperty('batchOperations') && res.Response.DeviceList.length) {
                        batchCheck = this.masterPageService.hideControls.controlProperties.batchOperations.find(o => o === this.deviceList[0].NextStep);
                    }
                    if (this.app.checkNullOrUndefined(batchCheck)) {
                        if (!checkNullorUndefined(this.masterPageService.hideControls.controlProperties.autoQueue)) {
                            if (this.masterPageService.hideControls.controlProperties.autoQueue.Hidden == false) {
                                this.queList.emit();
                                this.autoQueuetempList = false;
                            }
                        } else {
                            this.queList.emit();
                            this.autoQueuetempList = true;
                        }
                    }
                    if (!checkNullorUndefined(this.deviceList) && this.deviceList.length) {
                        this.receiptKey.emit(this.deviceList[0]);
                    }
                    if (res.Response.hasOwnProperty('CurrentOperation') && res.Response.CurrentOperation) {
                        this.emitCurrentOperationId.emit(res.Response.CurrentOperation);
                    }
                    this.getInboundDetails(res.Response.AutoPopSerialNumber);
                }
                else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                    this.spinner.hide();
                    this.inbContainerDisabled = false;
                    this.masterPageService.operationDisabled = false;
                    if (res.Response && res.Response.ErrList && res.Response.ErrList.length > 0) {
                        this.serialNumbers = this.onGenerateJson(res.Response.ErrList);
                        this.category = "";
                        this.quantity = "";
                        this.emitisContainerValid.emit(false);
                        this.openModal();
                    }
                    else {
                        this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                        this.rmtextchild.applyRequired(true);
                        this.rmtextchild.applySelect();
                    }
                }
            },
                error => {
                    this.appErrService.handleAppError(error);
                });
    }

    //getInboundDetails
    getInboundDetails(autoPopSerialNumber?) {
        this.spinner.show();
        let requestObj = { ClientData: this.clientData, UIData: this.uiData };
        const getInboundDetailsUrl = String.Join("/", this.apiConfigService.getInboundDetailsUrl, this.inbContainerId);
        this.apiService.apiPostRequest(getInboundDetailsUrl, requestObj)
            .subscribe(response => {
                let res = response.body;
                this.emitSpinner.emit();
                if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                    if (this.isHideContSummarySection) {
                        this.emitSerialNumber.emit(autoPopSerialNumber);
                        return;
                    }
                    if (res.Response && res.Response.length > 0) {
                        if (!checkNullorUndefined(res.Response[0].Properties)) {
                            if (this.containerSummaryPropertiesList.length) {
                                let index = this.containerSummaryPropertiesList.filter(c => c.containerId == res.Response[0].ContainerID).length;
                                if (index != 1) {
                                    this.containerSummaryPropertiesList.unshift({ containerId: res.Response[0].ContainerID, inboundProperties: res.Response[0].Properties });
                                }
                            } else {
                                if (this.canAllowNextContainerStatus == 'Y') {
                                    this.containerSummaryPropertiesList.push({ containerId: res.Response[0].ContainerID, inboundProperties: res.Response[0].Properties });
                                }
                            }
                            if (this.containerSummaryPropertiesList.length) {
                                this.setContainerProperties(res.Response[0].ContainerID);
                                this.checkContainerStatus();
                            } else {
                                this.emitContainerSummaryProperties.emit(res.Response[0].Properties);
                            }
                        }
                    }
                    this.emitSerialNumber.emit(autoPopSerialNumber);
                }
                else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                    this.spinner.hide()
                }
            },
                error => {
                    this.appErrService.handleAppError(error);
                });
    }


    private setContainerProperties(containerId: any) {
        if (this.containerSummaryPropertiesList.length) {
            let containerSummaryProperty = this.containerSummaryPropertiesList.find(c => c.containerId == containerId);
            this.containerSummaryProperties = Object.keys(containerSummaryProperty.inboundProperties);
            this.containerActualProp = containerSummaryProperty.inboundProperties;
            this.activeContainerId = containerId;
        }
    }

    //change of contianer id
    getSelectedContainerId(value) {
        this.activeContainerId = value.containerId;
        this.setContainerProperties(value.containerId);
    }

    //search container id
    searchContainerID(containerId?) {
        this.activeContainerId = !checkNullorUndefined(containerId) ? containerId : this.searchInbContainerId
        this.setContainerProperties(this.activeContainerId);
    }


    checkContainerStatus() {
        if (!checkNullorUndefined(this.canAllowNextContainerStatus) && this.canAllowNextContainerStatus == 'Y') {
            this.rmtextchild.value = "";
            this.inbContainerDisabled = false;
            this.masterPageService.inboundContainerFocus();
        }
        if (!checkNullorUndefined(this.canAllowNextContainerStatus) && this.canAllowNextContainerStatus == 'N') {
            if (this.containerSummaryPropertiesList.length != 1) {
                this.rmtextchild.value = "";
                this.inbContainerDisabled = true;
            }
        }
    }
    Clear() {
        this.clear.emit();
    }
    changeInput(val) {
        this.isClearDisabled = false;
        this.clearEmit.emit(false);
        if (this.serialNumbers.length > 0) {
            val = "";
            this.serialNumbers = [];
            this.emitcontainerID.emit(val);
        }
        else {
            this.rmtextchild.applyRequired(false);
            this.appErrService.setAlert('', false);
        }
        this.category = "";
        this.quantity = "";
    }

    //Inbound Container Focus
    inboundContainerFocus() {
        let inputSerial = <HTMLInputElement>document.getElementById('inboundcontainer');
        if (inputSerial) {
            inputSerial.focus();
        }
    }
    onGenerateJson(Response) {
        let jsonResponse: any;
        let elements = [];
        let ChildElements = [];
        let jsonData = {};
        let columnNames = [];
        let colValues = [];
        let result = {};

        Response.forEach(res => {
            let element: any = { ChildElements: ChildElements };
            element.SerialNumber = res.SerialNumber;
            element.Message = res.Message;
            elements.push(element);
        });

        jsonResponse = {
            "SearchVisible": true,
            "SortDisabled": false,
            "ItemsPerPage": 12,
            "EditVisible": false,
            "DeleteVisible": false,
            "PaginationId": "validateSerialNo",
            "PaginationVisible": true,
            "ToolbarVisible": false,
            "ExportVisible": false,
            "ImportVisible": false,
            Elements: elements
        }
        return jsonResponse;
    }
    clearContainerSummary() {
        this.inbContainerDisabled = false;
        this.rmtextchild.value = "";
        this.quantity = "";
        this.category = "";
        this.isClearDisabled = true;
    }

    clearProperties() {
        this.containersList = [];
        this.deviceList = [];
        this.containerSummaryPropertiesList = [];
        this.canAllowNextContainerStatus = null;
        this.containerSummaryProperties = [];
        this.containerActualProp = null;
    }


}

