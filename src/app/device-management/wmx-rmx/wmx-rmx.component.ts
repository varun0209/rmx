import { Component, OnInit, Input, ViewChild, OnDestroy, Output, EventEmitter } from '@angular/core';
import { AppService } from '../../utilities/rlcutl/app.service';
import { ClientData } from '../../models/common/ClientData';
import { UiData } from '../../models/common/UiData';
import { ApiConfigService } from '../../utilities/rlcutl/api-config.service';
import { String } from 'typescript-string-operations';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from '../../services/common.service';
import { DeviceModes } from '../../enums/deviceManagment.enum';
import { StorageData } from '../../enums/storage.enum';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';
import { Grid } from '../../models/common/Grid';
import { ContainerSuggestionComponent } from '../../framework/busctl/container-suggestion/container-suggestion.component';
import { TestingDevice } from '../../models/testing/TestingDevice';
import { Container } from '../../models/common/Container';
import { TraceTypes } from '../../enums/traceType.enum';
import { StatusCodes } from '../../enums/status.enum';
import { MessageType } from '../../enums/message.enum';
import { FindTraceHoldComponent } from '../../framework/busctl/find-trace-hold/find-trace-hold.component';
import { ListofTransactions } from '../../models/common/ListofTransactions';
import { Subscription } from 'rxjs';
import { RmtextboxComponent } from '../../framework/frmctl/rmtextbox/rmtextbox.component';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { DeviceManagementService } from '../../services/device-management.service';
import { ApiService } from '../../utilities/rlcutl/api.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-wmx-rmx',
    templateUrl: './wmx-rmx.component.html',
    styleUrls: ['./wmx-rmx.component.css']
})
export class WmxRmxComponent implements OnInit, OnDestroy {

    @ViewChild(ContainerSuggestionComponent) childContainer: ContainerSuggestionComponent;
    emitRouteResponse: Subscription;
    emitSaveWMxResponse: Subscription;

    clientData = new ClientData();
    uiData = new UiData();
    deviceMgmt = new TestingDevice();
    dmDevice = new TestingDevice();
    containerObj = new Container();
    listofTransactions: ListofTransactions;

    reasonsList = [];

    transferDevice = new TestingDevice();
    VendorDevices = {};
    controlConfig: any;

    isProcessAllDisabled = true;

    selectedBatchReason: any;
    deviceBatchSnap: any;
    optionOrginalList = [];
    containersList = [];
    transferDeviceList: any;
    grid: Grid;
    buttonName = DeviceModes.process;
    // models
    batchId: any;
    batchSerialNumber: any;

    // disabled props
    isBatchIdDisabled = false;
    isResetDisabled = true;
    isBatchSerialNoDisabled = true;
    isBatchReasonDisabled = true;
    isBatchRollbackDisabled = true;
    isBatchContainerDisabled = true;
    isContainerDisabled = true;
    isFullCaseEnbale = false;
    serailNumberSnapList = [];
    operationObj: any;
    dialogRef: any;

    constructor(
        public appService: AppService,
        private apiConfigService: ApiConfigService,
        private spinner: NgxSpinnerService,
        private commonService: CommonService,
        public masterPageService: MasterPageService,
        public appErrService: AppErrorService,
        private deviceManagementService: DeviceManagementService,
        private snackbar: XpoSnackBar,
        private apiService: ApiService,
        private dialog: MatDialog
    ) {


        // emitting Device response
        this.emitRouteResponse = this.deviceManagementService.emitRouteResponse.subscribe(res => {
            if (!this.appService.checkNullOrUndefined(res)) {
                this.getRoute(res);
            }
        });

        // emitting Saveoperation response
        this.emitSaveWMxResponse = this.deviceManagementService.emitSaveWMxResponse.subscribe(res => {
            if (!this.appService.checkNullOrUndefined(res)) {
                this.displaySerialsGrid(res);
            } 
        });
    }

    ngOnInit() {
        this.operationObj = this.masterPageService.getRouteOperation();
        if (this.operationObj) {
            this.uiData.OperationId = this.operationObj.OperationId;
            this.uiData.OperCategory = this.operationObj.Category;
            this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
            this.masterPageService.setTitle(this.operationObj.Title);
            this.masterPageService.setModule(this.operationObj.Module);
            this.controlConfig = JSON.parse(localStorage.getItem(StorageData.controlConfig));
            this.masterPageService.disabledContainer = false;
            localStorage.setItem(StorageData.module, this.operationObj.Module);
            this.appErrService.appMessage();
            this.selectedBatchReason = { Id: '', Text: '' };
            this.inboundContainerFocus();
            this.getReasons();
        }
    }


    // get Reasons
    getReasons() {
        this.spinner.show();
        this.reasonsList = [];
        const requestObj = { ClientData: this.clientData, UIData: this.uiData };
        const getReasonsUrl = String.Join('/', this.apiConfigService.getReasons);
        this.apiService.apiPostRequest(getReasonsUrl, requestObj)
            .subscribe(response => {
                const res = response.body;
                if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
                    if (!this.appService.checkNullOrUndefined(res.Response.Reasons)) {
                        this.reasonsList = res.Response.Reasons;
                    }
                }
                this.spinner.hide();
            }, erro => {
                this.appErrService.handleAppError(erro);
            });
    }


    ValidateTransferSerialnumbers(inpcontrol: RmtextboxComponent) {
        const requestObj = { ClientData: this.clientData, UIData: this.uiData };
        const url = String.Join('/', this.apiConfigService.validateTransferSerialnumbersUrl, this.batchId);
        this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
            this.spinner.hide();
            if (statusFlag && !this.appService.checkNullOrUndefined(res.Response)) {
                if (res.Response.hasOwnProperty('TransferDevice')) {
                    this.transferDevice = res.Response.TransferDevice;
                }
                if (res.Response.hasOwnProperty('VendorDevices')) {
                    this.VendorDevices = res.Response.VendorDevices;
                    this.showGrid();
                }
                if (res.Response.hasOwnProperty('FullCaseEnbale')) {
                    this.isFullCaseEnbale = res.Response.FullCaseEnbale;
                    if (this.isFullCaseEnbale) {
                        this.isProcessAllDisabled = false;
                    }
                }
                this.isBatchSerialNoDisabled = false;
                this.isBatchIdDisabled = true;
                this.serialNumberFocus();
            } else {
                inpcontrol.applyRequired(true);
                inpcontrol.applySelect();
            }
        });
    }

    getTransferedDetail() {
        this.serailNumberSnapList = [];
        const requestObj = { ClientData: this.clientData, UIData: this.uiData, TransferDevice: this.transferDevice, VendorDevices: this.VendorDevices };
        const url = String.Join('/', this.apiConfigService.getTransferedDetailUrl, this.batchId);
        this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
            this.spinner.hide();
            if (statusFlag && !this.appService.checkNullOrUndefined(res.Response)) {
                if (res.Response.hasOwnProperty('TransferDevice')) {
                    this.deviceMgmt = res.Response.TransferDevice;
                }
                if (res.Response.hasOwnProperty('Snaps')) {
                    this.serailNumberSnapList = res.Response.Snaps;
                }
                this.isBatchReasonDisabled = false;
                this.reasonFocus();
                this.isBatchSerialNoDisabled = true;
                this.buttonName = DeviceModes.processAll;
            }
            this.isProcessAllDisabled = true;
        });
    }

    showGrid() {
        this.transferDeviceList = [];
        this.grid = new Grid();
        const serialNo = (this.VendorDevices.hasOwnProperty('Serial_Numbers') && this.VendorDevices['Serial_Numbers'].length) ? this.VendorDevices['Serial_Numbers'] : [];
        this.transferDeviceList = this.appService.onGenerateJson(serialNo, this.grid);
    }

    validateTransferSerialnumber(inpcontrol: RmtextboxComponent) {
        const requestObj = { ClientData: this.clientData, UIData: this.uiData, TransferDevice: this.transferDevice, VendorDevices: this.VendorDevices };
        const url = String.Join('/', this.apiConfigService.validateTransferSerialnumberUrl, this.batchId, this.batchSerialNumber);
        this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
            if (statusFlag) {
                if (!this.appService.checkNullOrUndefined(res.Response) && res.Response['Device']) {
                    this.deviceMgmt = res.Response['Device'];
                    this.dmDevice = res.Response['DMDevice'];
                    this.buttonName = DeviceModes.process;
                    this.isProcessAllDisabled = true;
                    this.findTrace();
                }
            } else {
                inpcontrol.applyRequired(true);
                inpcontrol.applySelect();
            }
        });
    }


    findTrace() {
        const traceData = { traceType: TraceTypes.serialNumber, traceValue: this.batchSerialNumber, uiData: this.uiData };
        const traceResult = this.commonService.findTraceHold(traceData, this.uiData);
        traceResult.subscribe(result => {
            if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
                if (this.appService.checkNullOrUndefined(result.Response)) {
                    this.getTransferedDetails();
                } else {
                    this.canProceed(result, TraceTypes.serialNumber);
                }
            } else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
                this.spinner.hide();
                this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
            }
        });
    }

    canProceed(traceResponse, type) {
        if (traceResponse.Response.canProceed == 'Y') {
            this.appErrService.setAlert(traceResponse.StatusMessage, true, MessageType.info);
        }
        if (!this.appService.checkNullOrUndefined(traceResponse.Response.TraceHold)) {
            const uiObj = { uiData: this.uiData };
            traceResponse = Object.assign(traceResponse, uiObj);
            this.dialogRef = this.dialog.open(FindTraceHoldComponent, { hasBackdrop: true, disableClose: true, panelClass: 'dialog-width-sm', data: { modalData: traceResponse } });
            this.dialogRef.afterClosed().subscribe((returnedData) => {
              if (returnedData) {
                if (returnedData.Response.canProceed == 'Y') {
                    if (type == TraceTypes.serialNumber) {
                        this.getTransferedDetails();
                    }
                } else if (returnedData.Response.canProceed == 'N') {
                    if (type == TraceTypes.serialNumber) {
                        this.isBatchSerialNoDisabled = false;
                        this.serialNumberFocus();
                    }
                    this.appErrService.setAlert(returnedData.StatusMessage, true);
                    this.spinner.hide();
                }
            }
            });
        }
    }

    getTransferedDetails() {
        this.serailNumberSnapList = [];
        const requestObj = {
            ClientData: this.clientData, UIData: this.uiData, VendorDevices: this.VendorDevices
        };
        const url = String.Join('/', this.apiConfigService.getTransferedDetailsUrl, this.batchSerialNumber);
        this.commonService.commonApiCall(url, requestObj, (res) => {
            if (!this.appService.checkNullOrUndefined(res.Response) && res.Response['Device']) {
                if (res.Response['SerailNumberSnap'].length) {
                    this.serailNumberSnapList = res.Response.SerailNumberSnap;
                    this.deviceMgmt = res.Response.Device;
                    this.isBatchSerialNoDisabled = true;
                    this.isBatchReasonDisabled = false;
                    this.reasonFocus();
                }
            }
            this.spinner.hide();
        });
    }

    batchRollback() {
        if (this.isFullCaseEnbale && this.buttonName == DeviceModes.processAll) {
            this.getRollbackContainerDevices();
        } else {
            this.process();
        }
    }

    // process
    process() {
        const requestObj = {
            ClientData: this.clientData, UIData: this.uiData,
            DeviceManageSnap: this.deviceBatchSnap, Device: this.deviceMgmt, DMDevice: this.dmDevice, VendorDevices: this.VendorDevices,
        };
        const url = String.Join('/', this.apiConfigService.getProcessUrl);
        this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
            if (statusFlag) {
                if (!this.appService.checkNullOrUndefined(res.Response)) {
                    this.deviceMgmt = res.Response;
                    if (this.masterPageService.hideControls && this.masterPageService.hideControls.controlProperties
                        && this.masterPageService.hideControls.controlProperties.containerSuggestion == undefined) {
                        // for verison
                        this.loadProgramValues();
                    }
                }
            }
        });
    }


    // load Program Values
    loadProgramValues() {
        const requestObj = { ClientData: this.clientData, Device: this.deviceMgmt, UIData: this.uiData };
        const url = String.Join('/', this.apiConfigService.loadProgramValuesurl, this.deviceMgmt.ProgramName, this.uiData.OperationId);
        this.deviceManagementService.loadProgramValues(url, requestObj);
    }

    // Getroute
    getRoute(res) {
        this.spinner.hide();
        this.deviceMgmt = res;
        this.isBatchRollbackDisabled = true;
        this.isBatchReasonDisabled = true;
        this.configContainerProperties();
        this.outboundContainerFocus();
    }

    // get rollback container devices
    getRollbackContainerDevices() {
        this.isBatchRollbackDisabled = true;
        const requestObj = {
            ClientData: this.clientData,
            UIData: this.uiData,
            TransferDevice: this.deviceMgmt,
            VendorDevices: this.VendorDevices,
            ReasonCode: this.selectedBatchReason,
            Container: this.containerObj,
            DeviceManageSnap: this.deviceBatchSnap
        };
        const url = String.Join('/', this.apiConfigService.rollbackContainerDevicesUrl, this.batchId);
        this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
            // if (statusFlag) {
            //     this.transferFullcase(DeviceModes.fullCase);
            // } else {
            //     this.resetBatchId();
            // }
            this.spinner.hide();
            this.resetBatchId();
        });
    }

    displaySerialsGrid(res) {
        this.spinner.hide();
        const serialNo = (res.hasOwnProperty('Serial_Numbers') && Array.isArray(res['Serial_Numbers']) && res['Serial_Numbers'].length) ? res['Serial_Numbers'] : [];
        if (serialNo.length) {
            this.VendorDevices = res;
            this.transferDeviceList = this.appService.onGenerateJson(serialNo, this.grid);
            this.clearBatchSerialNo();
        } else {
            this.resetBatchId();
        }
        return;
    }

    transferFullcase(value) {
        let tempDevice: any;
        if (value === DeviceModes.serialNumber) {
            tempDevice = this.dmDevice;
            tempDevice.ContainerID = this.deviceMgmt.ContainerID;
            tempDevice.ContainerCycle = this.deviceMgmt.ContainerCycle;
        }
        const requestObj = { ClientData: this.clientData, UIData: this.uiData, TransferDevice: tempDevice ? tempDevice : this.transferDevice, VendorDevices: this.VendorDevices };
        const url = String.Join('/', this.apiConfigService.transferUrl, value, this.batchId);
        this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
            this.spinner.hide();
            if (statusFlag) {
                if (!this.appService.checkNullOrUndefined(res) && res.StatusMessage !== '') {
                    this.snackbar.success(res.StatusMessage);
                }
                if (!this.appService.checkNullOrUndefined(res.Response) && res.Response !== '') {
                    const serialNo = (res.Response.hasOwnProperty('Serial_Numbers') && Array.isArray(res.Response['Serial_Numbers']) && res.Response['Serial_Numbers'].length) ? res.Response['Serial_Numbers'] : [];
                    if (serialNo.length) {
                        this.VendorDevices = res.Response;
                        this.transferDeviceList = this.appService.onGenerateJson(serialNo, this.grid);
                        this.clearBatchSerialNo();
                    } else {
                        this.resetBatchId();
                    }
                    return;
                }
                (this.isFullCaseEnbale && this.buttonName === DeviceModes.processAll) ? this.resetBatchId() : this.clearBatchSerialNo();
            }
        });
    }

    getSelectedBatchIndex(event) {
        if (event.target.checked) {
            const data = this.serailNumberSnapList.find(e => e.Step == event.value);
            if (!this.appService.checkNullOrUndefined(data)) {
                this.deviceBatchSnap = data;
                if (this.isFullCaseEnbale && this.buttonName == DeviceModes.processAll) {
                    this.getUpdatedDeviceSnap();
                } else {
                    this.enableRollback();
                }
            }
        } else {
            this.isBatchRollbackDisabled = true;
            this.deviceBatchSnap = null;
            this.clearContainerID();
        }
    }

    // get rollback container devices
    getUpdatedDeviceSnap() {
        const requestObj = {
            ClientData: this.clientData,
            UIData: this.uiData,
            TransferDevice: this.deviceMgmt,
            DeviceManageSnap: this.deviceBatchSnap
        };
        this.clearContainerID();
        const url = String.Join('/', this.apiConfigService.getUpdatedDeviceSnap);
        this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
            this.spinner.hide();
            if (statusFlag && res.Response.hasOwnProperty('TransferDevice')) {
                this.deviceMgmt = res.Response.TransferDevice;
                if (this.selectedBatchReason.Id != '') {
                    this.enableProcessAll();
                }
            }
        });
    }

    enableRollback() {
        if (this.selectedBatchReason.Id != '' && !this.appService.checkNullOrUndefined(this.deviceBatchSnap)) {
            this.isBatchRollbackDisabled = false;
            this.rollbackFocus();
        } else {
            this.isBatchRollbackDisabled = true;
        }
    }

    onSelectedBatchReason(event) {
        if (!this.appService.checkNullOrUndefined(event.target)) { // for dropdown
            this.selectedBatchReason = this.reasonsList.find(d => d.Id === event.value);
            if (this.isFullCaseEnbale && this.buttonName == DeviceModes.processAll) {
                if (!this.appService.checkNullOrUndefined(this.deviceBatchSnap)) {
                    this.enableProcessAll();
                }
            } else {
                this.enableRollback();
            }
        }
    }

    enableProcessAll() {
        this.isBatchReasonDisabled = true;
        this.isBatchSerialNoDisabled = true;
        this.batchSerialNumber = '';
        this.configContainerProperties();
        this.outboundContainerFocus();
    }

    containerSuggestion(value) {
        this.getSuggestContainer(value);
        this.outboundContainerFocus();
        this.configContainerProperties();
    }

    // getSuggestContainer sending receive device to child conatiner
    getSuggestContainer(value) {
        if (!this.appService.checkNullOrUndefined(value)) {
            this.clearContainerID();
        }
        this.childContainer.getSuggestContainer(this.deviceMgmt);
    }



    // getSuggestContainerResponse
    getSuggestContainerResponse(response) {
        if (response.ContainerID != null && response.ContainerID !== undefined) {
            this.deviceMgmt.ContainerID = response.ContainerID;
            this.deviceMgmt.ContainerCycle = response.ContainerCycle;
        }
    }



    // validateContainer and sending updated device to child conatiner
    validateContainer(response) {
        if (response.ContainerID != null && response.ContainerID !== undefined) {
            this.deviceMgmt.ContainerID = response.ContainerID;
            this.deviceMgmt.ContainerCycle = response.ContainerCycle;
        }
        this.childContainer.validateContainer(this.deviceMgmt);
    }

    // input match
    checkContainer(container) {
        if (this.isFullCaseEnbale && this.buttonName == DeviceModes.processAll) {
            if (!this.appService.checkNullOrUndefined(container)) {
                this.isBatchRollbackDisabled = false;
                this.containerObj = container;
            } else {
                this.isBatchRollbackDisabled = true;
            }
        }
        if (!this.appService.checkNullOrUndefined(container)) {
            this.deviceMgmt.ContainerID = container.ContainerID;
            this.deviceMgmt.ContainerCycle = container.ContainerCycle;
        }
    }


    // validateContainer Response from child conatiner
    validateContainerResponse(response) {
        if (!this.appService.checkNullOrUndefined(response)) {
            this.deviceMgmt.ContainerCycle = response.ContainerCycle;
            this.deviceMgmt.ContainerID = response.ContainerID;
        }
        if (this.isFullCaseEnbale && this.buttonName == DeviceModes.processAll) {
            this.getRollbackContainerDevices();  // todo
        } else {
            this.saveOperation();
        }
    }

    // validate container fail response
    emitValidateContainerFailResponse(response) {
        if (!this.appService.checkNullOrUndefined(response)) {
            this.deviceMgmt.ContainerID = response.ContainerID;
            this.deviceMgmt.ContainerCycle = response.ContainerCycle;
        }
    }

    // enabling the button and container ID
    configContainerProperties() {
        if (!this.appService.checkNullOrUndefined(this.childContainer)) {
            this.childContainer.isContainerDisabled = false;
            this.childContainer.isClearContainerDisabled = false;
        }
    }

    saveOperation() {
        const requestObj = { ClientData: this.clientData, Device: this.deviceMgmt, UIData: this.uiData, DMDevice: this.dmDevice, selectedReason: this.selectedBatchReason, selectedTab: DeviceModes.wmxTransfer,VendorDevices: this.VendorDevices };
        const url = String.Join('/', this.apiConfigService.rollbackSerialNumberUrl, this.batchId);
        this.deviceManagementService.saveOperation(url, requestObj, false);
    }

    // outbound Focus
    outboundContainerFocus() {
        this.appService.setFocus('containerBatchInputId');
    }

    // Serial Number Focus
    serialNumberFocus() {
        this.appService.setFocus('batchSerialNumber');
    }

    // Inbound Focus
    inboundContainerFocus() {
        this.appService.setFocus('inboundBatchContainer');
    }

    // Reason Focus
    reasonFocus() {
        this.appService.setFocus('batchReason');
    }

    // process focus
    rollbackFocus() {
        this.appService.setFocus('rollBack');
    }

    onChangeBatchId() {
        this.isResetDisabled = false;
    }

    resetBatchId() {
        this.clearBatchSerialNo();
        this.isResetDisabled = true;
        this.isBatchSerialNoDisabled = true;
        this.batchSerialNumber = '';
        this.batchId = '';
        this.transferDeviceList = null;
        this.isBatchIdDisabled = false;
        this.transferDevice = new TestingDevice();
        this.VendorDevices = {};
        this.isProcessAllDisabled = true;
        this.isFullCaseEnbale = false;
        this.inboundContainerFocus();
    }

    clearBatchSerialNo() {
        this.appErrService.clearAlert();
        this.selectedBatchReason = { Id: '', Text: '' };
        this.isBatchSerialNoDisabled = false;
        this.isBatchRollbackDisabled = true;
        this.deviceBatchSnap = null;
        this.batchSerialNumber = '';
        this.clearContainerID();
        this.serialNumberFocus();
        this.isBatchReasonDisabled = true;
        this.serailNumberSnapList = [];
        this.isProcessAllDisabled = this.isFullCaseEnbale ? false : true;
        this.buttonName = DeviceModes.process;
        this.deviceMgmt = new TestingDevice();
        this.dmDevice = new TestingDevice();
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

    ngOnDestroy() {
        this.deviceManagementService.emitRouteResponse.next(null);
        this.emitRouteResponse.unsubscribe();
        this.deviceManagementService.emitSaveWMxResponse.next(null);
        this.emitSaveWMxResponse.unsubscribe();
        this.masterPageService.defaultProperties();
        if (this.dialogRef) {
            this.dialogRef.close();
        }
        this.masterPageService.showUtilityIcon = false;
    }

}
