import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';
import { ApiService } from '../../utilities/rlcutl/api.service';
import { ApiConfigService } from '../../utilities/rlcutl/api-config.service';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppService } from '../../utilities/rlcutl/app.service';
import { RmtextboxComponent } from '../../framework/frmctl/rmtextbox/rmtextbox.component';
import { String } from 'typescript-string-operations';
import { ClientData } from '../../models/common/ClientData';
import { dropdown } from '../../models/common/Dropdown';
import { TestingDevice } from '../../models/testing/TestingDevice';
import { ListofTransactions } from '../../models/common/ListofTransactions';
import { UiData } from '../../models/common/UiData';
import { Subscription } from 'rxjs';
import { EngineResult } from '../../models/common/EngineResult';
import { LottableTrans } from '../../models/common/LottableTrans';
import { SkuTransferComponent } from '../shared/sku-transfer/sku-transfer.component';
import { EsnSwapComponent } from './esn-swap/esn-swap.component';
import { EsnRemoveReviveComponent } from './esn-remove-revive/esn-remove-revive.component';
import { AttributeUpdatesComponent } from './attribute-updates/attribute-updates.component';
import { ContainerSummaryComponent } from '../../framework/busctl/container-summary/container-summary.component';
import { ContainerSuggestionComponent } from './../../framework/busctl/container-suggestion/container-suggestion.component';
import { DeviceModes } from '../../enums/deviceManagment.enum';
import { TraceTypes } from '../../enums/traceType.enum';
import { CommonService } from '../../services/common.service';
import { MessageType } from '../../enums/message.enum';
import { FindTraceHoldComponent } from '../../framework/busctl/find-trace-hold/find-trace-hold.component';
import { StorageData } from '../../enums/storage.enum';
import { StatusCodes } from '../../enums/status.enum';
import { DeviceManagementService } from '../../services/device-management.service';
import { CommonEnum } from '../../enums/common.enum';
import { MatDialog } from '@angular/material/dialog';


@Component({
    selector: 'app-manage-sn',
    templateUrl: './manage-sn.component.html',
    styleUrls: ['./manage-sn.component.css']
})
export class ManageSnComponent implements OnInit, OnDestroy {

    operationObj: any;
    controlConfig: any;
    isReasonRequired = false;
    enableDynamicSelector = false;
    isAutoPopulatedSerialNumber = false;

    // enum
    deviceModes = DeviceModes;

    clientData = new ClientData();
    uiData = new UiData();

    // show select mode div
    selectedDeviceMode: string;

    // originaiton operation
    originationOperation: Subscription;
    deviceOrigination: string;

    emitReadOnlyDeviceResponse: Subscription;
    emitRouteResponse: Subscription;
    emitSaveRMxResponse: Subscription;

    // dropdown
    optionsList = [];
    options: any = [];
    optionDisable = true;

    // container properties
    headingsobj = [];
    inboundProperties: any;
    multipleContainerList: any;
    inboundContainerId: string;

    serialNumber: any;
    deviceMgmt = new TestingDevice();
    attrDeviceMgmt = new TestingDevice();

    dmDevice = new TestingDevice();

    // selected reason
    selectedReason: any;
    reasonsList: any;
    enableReasonTextbox = false;

    // sku-transfer
    originalSku: any;

    appendUrl = '';
    saveUrl = '';
    loadDynamicUrl: any;

    // grid data
    gridData = [];

    // Rollback
    isRollbackDisabled = true;
    isProcessRouteDisabled = true;
    skuDisabled: boolean;
    isProcessAllDisabled = true;
    isProcessAll = CommonEnum.no;
    tosterMessage: any;
    deviceSnap: any;
    lottableTrans: LottableTrans;
    isReasonDisabled = true;
    isContainerDisabled = true;
    listofTransactions: ListofTransactions;
    serialNumberInputCtrl: RmtextboxComponent;
    serialNumberValue: any;
    validSerialResponse: any;
    traceTypes = TraceTypes;
    dialogRef: any;
    storageData = StorageData;
    statusCode = StatusCodes;

    skuObject: any;
    appConfig: any;
    isDaysToExpireDisabled = true;
    daysToExpire: any[];
    operationId: string;

    @ViewChild(ContainerSummaryComponent) contsummaryParent: ContainerSummaryComponent;
    @ViewChild(ContainerSuggestionComponent) childContainer: ContainerSuggestionComponent;
    @ViewChild(RmtextboxComponent) rmtextbox: RmtextboxComponent;
    @ViewChild(SkuTransferComponent) skuTransferComponent: SkuTransferComponent;
    @ViewChild(EsnSwapComponent) esnSwapComponent: EsnSwapComponent;
    @ViewChild(AttributeUpdatesComponent) attributeUpdatesComponent: AttributeUpdatesComponent;
    @ViewChild(EsnRemoveReviveComponent) esnRemoveReviveComponent: EsnRemoveReviveComponent;

    constructor(
        public masterPageService: MasterPageService,
        public appErrService: AppErrorService,
        private spinner: NgxSpinnerService,
        private snackbar: XpoSnackBar,
        private apiConfigService: ApiConfigService,
        private apiService: ApiService,
        public appService: AppService,
        private commonService: CommonService,
        private deviceManagementService: DeviceManagementService,
        private dialog: MatDialog
    ) {

        this.originationOperation = this.masterPageService.originationOperation.subscribe(val => {
            if (!this.appService.checkNullOrUndefined(val)) {
                this.deviceOrigination = val;
            }
        });

        // emitting readOnlyDevice response
        this.emitReadOnlyDeviceResponse = this.commonService.emitReadOnlyDeviceResponse.subscribe(res => {
            if (!this.appService.checkNullOrUndefined(res)) {
                if (!this.appService.checkNullOrUndefined(res.Status) && res.Status === this.statusCode.pass) {
                    this.validSerialNumber();
                } else if (!this.appService.checkNullOrUndefined(res.Status) && res.Status === this.statusCode.fail) {
                    this.clearSerialNumber();
                }
            }
        });

        // emitting Device response
        this.emitRouteResponse = this.deviceManagementService.emitRouteResponse.subscribe(res => {
            if (!this.appService.checkNullOrUndefined(res)) {
                this.getRouteResponse(res);
            }
        });

        // emitting Saveoperation response
        this.emitSaveRMxResponse = this.deviceManagementService.emitSaveRMxResponse.subscribe(res => {
            if (!this.appService.checkNullOrUndefined(res)) {
                if (!this.appService.checkNullOrUndefined(res.Status) && res.Status === StatusCodes.fail) {
                    this.resetClear();
                } else if (res) {
                    this.refreshContainer();
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
            this.appConfig = JSON.parse(localStorage.getItem(StorageData.appConfig));
            this.masterPageService.setTitle(this.operationObj.Title);
            this.masterPageService.setModule(this.operationObj.Module);
            this.controlConfig = JSON.parse(localStorage.getItem(this.storageData.controlConfig));
            this.masterPageService.disabledContainer = false;
            localStorage.setItem(this.storageData.module, this.operationObj.Module);
            this.appErrService.appMessage();
            this.selectedReason = { Id: '', Text: '' };
            this.getOptions();
            this.masterPageService.inboundContainerFocus();
            this.masterPageService.containerDetailsHeader(CommonEnum.containerDetails);
            this.masterPageService.setDeviceCardHeader(CommonEnum.deviceDetails);
            this.masterPageService.setActiveTabValue = CommonEnum.containerDetails;
            this.skuObject = {
                getEligSKu: {
                    url: this.apiConfigService.getEligibleSKUsUtlUrl,
                    requestObj: { ClientData: this.clientData, UIData: this.uiData },
                    enable: true
                },
                type: DeviceModes.rmxTransfer
            };
        }
    }

    //operationId
    setCurrentOperationId(operationId) {
        this.uiData.OperationId = operationId;
    }

    checkGridList() {
        return ((this.masterPageService.hideControls.controlProperties.hasOwnProperty('containerDetailsTab') && this.masterPageService.gridContainerDetails)
            || this.masterPageService.serialNumberProperties);
    }
    // geOptions
    getOptions() {
        const requestObj = { ClientData: this.clientData, UIData: this.uiData };
        const url = String.Join('/', this.apiConfigService.getOptionsUrl);
        this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
            if (statusFlag) {
                if (!this.appService.checkNullOrUndefined(res.Response)) {
                    this.optionsList = res.Response;
                    res.Response.forEach(element => {
                        const dd: dropdown = new dropdown();
                        dd.Id = element.Option;
                        dd.Text = element.Option;
                        this.options.push(dd);
                    });
                    this.spinner.hide();
                }
            }
        });
    }

    // onchange dropdown mode
    changeDeviceMode(selectedMode) {
        this.isReasonRequired = false;
        if (!this.appService.checkNullOrUndefined(this.esnRemoveReviveComponent)) {
            this.esnRemoveReviveComponent.esnRemoveReviveClear();
        }
        if (!this.appService.checkNullOrUndefined(this.attributeUpdatesComponent)) {
            this.attributeUpdatesComponent.attrClear();
        }
        if (!this.appService.checkNullOrUndefined(this.skuTransferComponent)) {
            this.skuTransferComponent.skuClear();
        }
        if (!this.appService.checkNullOrUndefined(this.esnSwapComponent)) {
            this.esnSwapComponent.esnClear();
        }
        this.clearSerialNumber();
        this.appErrService.clearAlert();
        this.selectedDeviceMode = selectedMode.value;
        this.isProcessAll = CommonEnum.no;
        this.isProcessAllDisabled = true;
        if (this.selectedDeviceMode === DeviceModes.rollback
            || this.selectedDeviceMode === DeviceModes.skuTransfer
            || this.selectedDeviceMode === DeviceModes.routeCalculate
            || this.selectedDeviceMode === this.deviceModes.softwareVersion) {
            this.checkProcessAll();
        } else {
            this.getReasons();
        }
        if (this.selectedDeviceMode === DeviceModes.esnRemove || this.selectedDeviceMode === DeviceModes.esnRevive) {
            this.isReasonRequired = true;
        }
        if (!this.appService.checkNullOrUndefined(this.serialNumberValue) && this.serialNumberValue !== '') {
            this.serialNumber = this.serialNumberValue;
            this.validateSerialNumber(this.serialNumberValue, this.serialNumberInputCtrl);
        } else {
            this.masterPageService.disabledSerialNumber = false;
            this.serialNumberFocus();
        }
    }

    checkProcessAll() {
        const requestObj = { ClientData: this.clientData, UIData: this.uiData, Containers: this.multipleContainerList, DeviceManagement: this.getDeviceManagementObj() };
        const url = String.Join('/', this.apiConfigService.dmProcessAllEigible);
        this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
            this.getReasons();
            if (statusFlag && res.Response.hasOwnProperty('isDMProcessAllEligible')) {
                this.isProcessAllDisabled = (res.Response.isDMProcessAllEligible === CommonEnum.yes) ? false : true;
                this.isProcessAll = CommonEnum.yes;
            }
        });
    }

    processAll() {
        this.masterPageService.disabledSerialNumber = true;
        this.serialNumber = '';
        this.isProcessAllDisabled = true
        if (this.selectedDeviceMode === DeviceModes.rollback) {
            this.updateAppendSaveUrl();
            this.getPerformedOptions(this.contsummaryParent.deviceList[0].SerialNumber);
            return;
        }
        this.dmProcessAll();
    }

    updateAppendSaveUrl() {
        const data = this.getDeviceManagementObj();
        if (!this.appService.checkNullOrUndefined(this.getDeviceManagementObj())) {
            this.appendUrl = data.LoadUrl.LOADURL;
            this.saveUrl = data.LoadUrl.SAVEURL;
        }
    }

    dmSaveAll() {
        const requestObj = { ClientData: this.clientData, UIData: this.uiData, Containers: this.multipleContainerList, DeviceManageSnap: this.gridData[0], DeviceManagement: this.getDeviceManagementObj(), Device: this.deviceMgmt, DMDevice: this.dmDevice };
        const url = String.Join('/', this.apiConfigService.dmSaveAll);
        this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
            this.spinner.hide();
            if (statusFlag) {
                this.snackbar.success(res.StatusMessage);
                this.resetClear();
            }
        });
    }

    // after clicking on process all for route calucate and sku transfer
    dmProcessAll() {
        const requestObj = { ClientData: this.clientData, UIData: this.uiData, DeviceManagement: this.getDeviceManagementObj() };
        const url = String.Join('/', this.apiConfigService.dmProcessAll, this.inboundContainerId);
        this.commonService.commonApiCall(url, requestObj, (result, statusFlag) => {
            this.spinner.hide();
            if (statusFlag) {
                this.validSerialNumber(result);
            }
        });
    }

    // get Reasons
    getReasons() {
        this.spinner.show();
        this.reasonsList = [];
        const requestObj = { ClientData: this.clientData, UIData: this.uiData, DeviceManagement: this.getDeviceManagementObj() };
        const getReasonsUrl = String.Join('/', this.apiConfigService.getReasons);
        this.apiService.apiPostRequest(getReasonsUrl, requestObj)
            .subscribe(response => {
                const res = response.body;
                if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
                    if (!this.appService.checkNullOrUndefined(res.Response.Reasons)) {
                        this.reasonsList = res.Response.Reasons;
                        this.enableReasonTextbox = false;
                    }
                } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
                    this.enableReasonTextbox = true;
                }
                this.spinner.hide();
            }, erro => {
                this.appErrService.handleAppError(erro);
            });
    }


    getDeviceManagementObj() {
        return this.optionsList.find(d => d.Option === this.selectedDeviceMode);
    }

    // get inbound properties
    containerSummaryProperties(event: any) {
        this.headingsobj = [];
        this.headingsobj = Object.keys(event);
        this.inboundProperties = event;
    }

    getContainerList(event) {
        this.multipleContainerList = event;
    }

    // inbContainerID
    getinbContainerID(inbcontid) {
        this.inboundContainerId = inbcontid;
    }

    // serial number populate
    getAutoPopulatedSerialNum(event: any, inputCtrl: RmtextboxComponent) {
        if (!this.appService.checkNullOrUndefined(event) && event !== '') {
            // for whirlpool
            this.serialNumberValue = event;
            this.serialNumberInputCtrl = inputCtrl;
            this.masterPageService.disabledSerialNumber = true;
            this.isAutoPopulatedSerialNumber = true;
        }
        this.optionsFocus();
        this.optionDisable = false;
        if (this.selectedDeviceMode) {
            this.serialNumberFocus();
        }
        this.commonService.getQueuedTestSerialNumbers(this.clientData, this.uiData, this.inboundContainerId);
        this.spinner.hide();
    }

    // change event  Reason
    onSelectedReason(event) {
        if (!this.appService.checkNullOrUndefined(event.target)) { // for dropdown
            this.selectedReason = this.reasonsList.find(d => d.Id === event.value);
        } else {    // for textbox
            this.selectedReason = { Id: event, Text: event };
        }
        if (this.selectedDeviceMode === DeviceModes.esnRemove || this.selectedDeviceMode === DeviceModes.esnRevive) {
            this.deviceMgmt.HoldReasonCode = this.selectedReason.Id;
            this.dmDevice.ReasonCode = this.selectedReason.Id;
            if (this.selectedDeviceMode === DeviceModes.esnRemove &&
                !this.masterPageService.hideControls.controlProperties.hasOwnProperty('daysToExpire')) {
                this.getRemoveDaysToExpire();
            } else {
                this.isProcessRouteDisabled = false;
            }
        }
    }




    getRemoveDaysToExpire() {
        this.daysToExpire = [];
        const requestObj = { ClientData: this.clientData, UIData: this.uiData };
        const url = String.Join('/', this.apiConfigService.getRemoveDaysToExpire, this.selectedReason.Id);
        this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
            this.spinner.hide();
            if (statusFlag && res.Response['Reasons'].length) {
                this.daysToExpire = res.Response['Reasons'];
                this.dmDevice.DaysToExpire = res.Response['Reasons'][0].Id;
                if (res.Response['Reasons'].length > 1) {
                    this.isDaysToExpireDisabled = false;
                    this.appService.setFocus('daysToExpire');
                } else {
                    this.isDaysToExpireDisabled = true;
                    this.routeCalProcessFocus();
                }
                this.isProcessRouteDisabled = false;
            }
        });
    }

    // esn remove-revive comments
    getDaysToExpire(event) {
        this.dmDevice.DaysToExpire = event;
        this.routeCalProcessFocus();
    }

    // validateSerialNumber
    validateSerialNumber(serialNumber, inpcontrol: RmtextboxComponent) {
        this.masterPageService.disabledSerialNumber = true;
        this.spinner.show();
        if (serialNumber !== '') {
            this.deviceMgmt = new TestingDevice();
            if (!this.appService.checkNullOrUndefined(this.deviceOrigination) && this.deviceOrigination !== '') {
                this.deviceMgmt.Origination = this.deviceOrigination;
            }
            this.appErrService.clearAlert();
            this.deviceMgmt.SerialNumber = serialNumber;
            this.deviceMgmt.Clientid = this.clientData.ClientId;
            const containerId = this.contsummaryParent.rmtextchild.value;
            this.deviceMgmt.ContainerID = containerId != null && containerId !== '' ? containerId : '';
            const DeviceManagement = this.optionsList.find(d => d.Option === this.selectedDeviceMode);
            const requestObj = { ClientData: this.clientData, UIData: this.uiData, DeviceManagement: DeviceManagement };
            const url = String.Join('/', this.apiConfigService.getValidateSerialnumberUrl, this.deviceMgmt.ContainerID, this.deviceMgmt.SerialNumber);
            this.apiService.apiPostRequest(url, requestObj)
                .subscribe(res => {
                    const result = res.body;
                    if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.pass) {
                        if (!this.appService.checkNullOrUndefined(result.Response)) {
                            this.validSerialResponse = res.body;
                            const traceData = { traceType: this.traceTypes.serialNumber, traceValue: this.deviceMgmt.SerialNumber, uiData: this.uiData };
                            const traceResult = this.commonService.findTraceHold(traceData, this.uiData);
                            traceResult.subscribe(resp => {
                                if (!this.appService.checkNullOrUndefined(resp) && resp.Status === this.statusCode.pass) {
                                    if (this.appService.checkNullOrUndefined(resp.Response)) {
                                        this.commonService.getReadOnlyDeviceDetails(this.deviceMgmt.SerialNumber, this.uiData);
                                    } else {
                                        this.canProceed(resp, this.traceTypes.serialNumber);
                                    }
                                } else if (!this.appService.checkNullOrUndefined(resp) && resp.Status === this.statusCode.fail) {
                                    this.spinner.hide();
                                    this.appErrService.setAlert(resp.ErrorMessage.ErrorDetails, true);
                                }
                            });
                        }
                    } else if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.fail) {
                        this.masterPageService.disabledSerialNumber = false;
                        inpcontrol.applyRequired(true);
                        inpcontrol.applySelect();
                        this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
                        this.spinner.hide();
                    }
                },
                    error => {
                        this.appErrService.handleAppError(error);
                        this.masterPageService.disabledSerialNumber = false;
                    });
        }
    }


    validSerialNumber(result = this.validSerialResponse) {
        // common
        this.optionDisable = true;
        this.isReasonDisabled = false;
        this.deviceMgmt = result.Response.Device;
        this.dmDevice = result.Response.DMDevice;
        this.enableDynamicSelector = true;
        this.isProcessAllDisabled = true;
        this.updateAppendSaveUrl();

        // sku
        this.originalSku = [  // for readonly control(rmcard)
            { listItem: 'Current SKU', listItemDetails: result.Response.DMDevice.SKU.Sku },
            { listItem: 'Model', listItemDetails: result.Response.DMDevice.SKU.Model },
            { listItem: 'Disposition', listItemDetails: result.Response.DMDevice.Disposition },
            { listItem: 'Condition Code', listItemDetails: result.Response.DMDevice.ConditionCode }
        ];
        this.appService.setFocus('skuInputid');

        // esn
        this.appService.setFocus('transferSerialNumber');

        // attributeupdate
        if ((this.selectedDeviceMode === DeviceModes.dataElements) || (this.selectedDeviceMode === DeviceModes.routeCalculate)) {
            this.attrDeviceMgmt = result.Response.Device;
            if (!this.appService.checkNullOrUndefined(result.Response.SerialNumberProperties)) {
                this.masterPageService.serialNumberProperties = result.Response.SerialNumberProperties;
                if (this.enableDynamicSelector) {
                    this.masterPageService.enableDynamicSelector = true;
                }
                this.masterPageService.setActiveTabValue = CommonEnum.deviceDetails;
            }
            // Route Calculate
            if (this.selectedDeviceMode === DeviceModes.routeCalculate) {
                this.isProcessRouteDisabled = false;
                this.routeCalProcessFocus();
            }

        }
        if (this.selectedDeviceMode === DeviceModes.rollback) {
            this.getPerformedOptions();
        } else {
            this.spinner.hide();
        }
        // reason focus
        if (this.isReasonRequired) {
            this.reasonFocus();
        }
        if (this.selectedDeviceMode === DeviceModes.softwareVersion) {
            this.appService.setFocus('softwareVersion')
        }
        this.validSerialResponse = null;
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
                    if (type === this.traceTypes.serialNumber) {
                        this.commonService.getReadOnlyDeviceDetails(this.deviceMgmt.SerialNumber, this.uiData);
                    }
                } else if (returnedData.Response.canProceed === CommonEnum.no) {
                    if (type === this.traceTypes.serialNumber) {
                        this.serialNumberFocus();
                        this.masterPageService.disabledSerialNumber = false;
                    }
                    this.appErrService.setAlert(returnedData.StatusMessage, true);
                }
            }
            });
        }
        this.spinner.hide();
    }

    // getPerformedOptions
    getPerformedOptions(serialNo?) {
        if (this.appendUrl !== '') {
            this.spinner.show();
            const requestObj = { ClientData: this.clientData, UIData: this.uiData };
            this.loadDynamicUrl = this.apiConfigService.getPerformedOptionsUrl + this.appendUrl;
            const getPerformedOptionsUrl = String.Join('/', this.loadDynamicUrl, serialNo ? serialNo : this.serialNumber, serialNo ? CommonEnum.yes : CommonEnum.no);
            this.apiService.apiPostRequest(getPerformedOptionsUrl, requestObj)
                .subscribe(response => {
                    const res = response.body;
                    this.spinner.hide();
                    if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
                        if (!this.appService.checkNullOrUndefined(res.Response)) {
                            this.gridData = res.Response.SerailNumberSnap;
                            this.deviceMgmt = res.Response.Device;
                            if (this.gridData.length === 1) {
                                this.isRollbackDisabled = true;
                            }
                        }
                    } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
                        this.optionDisable = false;
                        this.masterPageService.disabledSerialNumber = false;
                        this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                    }
                }, erro => {
                    this.optionDisable = false;
                    this.masterPageService.disabledSerialNumber = false;
                    this.appErrService.handleAppError(erro);
                });
        } else {
            this.spinner.hide();
        }
    }

    // getSelectedIndex on rollback
    getSelectedIndex(event: any) {
        if (event.target.checked) {
            const data = this.gridData.find(e => e.Step === event.value);
            if (!this.appService.checkNullOrUndefined(data)) {
                this.deviceSnap = data;
                this.isRollbackDisabled = false;
                this.rollbackFocus();
            }
        } else {
            this.isRollbackDisabled = true;
        }
        this.clearContainerID();
    }

    // esn remove-revive comments
    getComments(event) {
        this.deviceMgmt.Comments = event;
    }
    // process
    process(devices?) {
        this.spinner.show();
        this.appErrService.clearAlert();
        if (!this.appService.checkNullOrUndefined(devices)) {
            this.deviceMgmt = (!this.appService.checkNullOrUndefined(devices.Device)) ? devices.Device : this.deviceMgmt;
            this.dmDevice = (!this.appService.checkNullOrUndefined(devices.DMDevice)) ? devices.DMDevice : this.dmDevice;
        }
        if ((this.isProcessAll === CommonEnum.yes) &&
            (this.selectedDeviceMode === DeviceModes.rollback || this.selectedDeviceMode === DeviceModes.routeCalculate || this.selectedDeviceMode === DeviceModes.skuTransfer || this.selectedDeviceMode === DeviceModes.softwareVersion)
            && !this.serialNumber) {
            this.dmSaveAll();
            return;
        }
        const requestObj = { ClientData: this.clientData, UIData: this.uiData, DeviceManagement: this.getDeviceManagementObj(), DeviceManageSnap: this.deviceSnap, Device: this.deviceMgmt, DMDevice: this.dmDevice };
        const url = String.Join('/', this.apiConfigService.processUrl);
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                const res = response.body;
                if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
                    if (!this.appService.checkNullOrUndefined(res.Response)) {
                        this.deviceMgmt = res.Response;
                        if (this.selectedDeviceMode === DeviceModes.esnRemove || this.selectedDeviceMode === DeviceModes.esnRevive) {
                            this.isReasonDisabled = true;
                        }
                        if (this.masterPageService.hideControls && this.masterPageService.hideControls.controlProperties && this.masterPageService.hideControls.controlProperties.containerSuggestion === undefined) {
                            // for verison
                            this.loadProgramValues();
                        } else {
                            // for whirlpool
                            this.saveOperation();
                        }
                    }
                } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                    this.spinner.hide();
                }
            },
                error => {
                    this.appErrService.handleAppError(error);
                });
    }

    // load Program Values
    loadProgramValues() {
        const requestObj = { ClientData: this.clientData, Device: this.deviceMgmt, UIData: this.uiData };
        const url = String.Join('/', this.apiConfigService.loadProgramValuesurl, this.deviceMgmt.ProgramName, this.uiData.OperationId);
        this.deviceManagementService.loadProgramValues(url, requestObj);
    }

    // Getroute
    getRouteResponse(res) {
        this.spinner.hide();
        this.deviceMgmt = res;
        this.configContainerProperties();
        this.containerFocus();
        if (!this.appService.checkNullOrUndefined(this.skuTransferComponent)) {
            this.skuTransferComponent.disableSkuTransfer = true;
            this.skuTransferComponent.skuDisabled = true;
        }
        if (!this.appService.checkNullOrUndefined(this.attributeUpdatesComponent)) {
            this.attributeUpdatesComponent.isDisableControls = true;
        }
        if (!this.appService.checkNullOrUndefined(this.esnSwapComponent)) {
            this.esnSwapComponent.isSwapDisabled = true;
        }
        if (this.selectedDeviceMode === DeviceModes.routeCalculate) {
            this.isProcessRouteDisabled = true;
            this.mapObject(res);
        }
        if (this.selectedDeviceMode === DeviceModes.esnRemove || this.selectedDeviceMode === DeviceModes.esnRevive) {
            this.isProcessRouteDisabled = true;
        }
    }

    mapObject(deviceObj) {
        const data = {};
        // tslint:disable-next-line:forin
        for (const prop in this.masterPageService.serialNumberProperties) {
            Object.keys(deviceObj).map(resp => {
                if (resp === prop) {
                    data[prop] = deviceObj[resp];
                }
            });
        }
        this.masterPageService.serialNumberProperties = data;
    }

    // getSuggestContainer sending receive device to child conatiner
    getSuggestContainer(value) {
        this.containerFocus();
        if (this.appService.checkNullOrUndefined(value)) {
            this.configContainerProperties();
            this.childContainer.getSuggestContainer(this.deviceMgmt);
        } else {
            this.clearContainerID();
            this.configContainerProperties();
            this.childContainer.getSuggestContainer(this.deviceMgmt);
        }
    }

    getSuggestAutoCompleteContainerResponse(response) {
        if (response.Container.ContainerID != null && response.Container.ContainerID !== undefined) {
            this.deviceMgmt.ContainerID = response.Container.ContainerID;
            this.deviceMgmt.ContainerCycle = response.Container.ContainerCycle;
        }
        this.saveOperation();
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
        this.saveOperation();
    }

    // validate container fail response
    emitValidateContainerFailResponse(response) {
        if (!this.appService.checkNullOrUndefined(response)) {
            this.deviceMgmt.ContainerID = response.ContainerID;
            this.deviceMgmt.ContainerCycle = response.ContainerCycle;
        }
    }

    saveOperation() {
        let url;
        if (this.saveUrl !== '') {
            this.loadDynamicUrl = this.apiConfigService.getPerformedOptionsUrl + this.saveUrl;
            url = String.Join('/', this.loadDynamicUrl);
        }
        const requestObj = { ClientData: this.clientData, Device: this.deviceMgmt, UIData: this.uiData, DMDevice: this.dmDevice, selectedReason: this.selectedReason, DeviceManagement: this.getDeviceManagementObj(), selectedTab: DeviceModes.rmxTransfer };
        this.deviceManagementService.saveOperation(url, requestObj);
    }

    // refreshContainer
    refreshContainer() {
        const requestObj = {
            ClientData: this.clientData, UIData: this.uiData, Containers: this.multipleContainerList,
            Devices: this.contsummaryParent.deviceList
        };
        const url = String.Join('/', this.apiConfigService.refreshContainerUrl, this.inboundContainerId);
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                const result = response.body;
                let canHideSpinner = true;
                if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.pass) {
                    if (result.Response.Quantity === 0) {
                        if (result.StatusMessage) {
                            this.snackbar.success(result.StatusMessage);
                        }
                        // whirlpool
                        if (!this.appService.checkNullOrUndefined(this.contsummaryParent) && this.contsummaryParent.containerSummaryPropertiesList.length == 0) {
                            this.resetClear();
                        } else { // verizon
                            if (!this.appService.checkNullOrUndefined(this.contsummaryParent) && this.contsummaryParent.containerSummaryPropertiesList.length
                                && !this.appService.checkNullOrUndefined(result.Response.canAllowNextContainer)) {
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
                                    this.resetClear();
                                } else if (result.Response.canAllowNextContainer === CommonEnum.no) {
                                    this.clearSerialNumber();
                                } else {
                                    this.clearContainerSummary();
                                    this.clearSerialNumber();
                                    if (this.contsummaryParent.containerSummaryPropertiesList.length === 0) {
                                        this.masterPageService.disabledSerialNumber = true;
                                        this.masterPageService.inboundContainerFocus();
                                    }
                                }
                            }
                        }
                    } else {
                        if (!this.appService.checkNullOrUndefined(this.contsummaryParent) &&
                            this.contsummaryParent.containerSummaryPropertiesList.length
                            && !this.appService.checkNullOrUndefined(result.Response.canAllowNextContainer)) {
                            const index = this.contsummaryParent.containerSummaryPropertiesList.findIndex(c => c.containerId === this.inboundContainerId);
                            if (index !== -1) {
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
                        this.clearSerialNumber();
                    }
                    if (canHideSpinner) {
                        this.spinner.hide();
                    }
                } else if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.fail) {
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


    // emit device
    emitDevice(device) {
        this.process(device);
    }

    // reset button click
    resetClear() {
        this.clearSerialNumber();
        this.clearContainerSummary();
        this.masterPageService.inboundContainerFocus();
        this.inboundProperties = [];
        this.multipleContainerList = null;
        this.inboundContainerId = '';
        this.appErrService.clearAlert();
        this.appErrService.setAlert('', false);
        this.headingsobj = [];
        this.originalSku = '';
        this.tosterMessage = '';
        this.serialNumber = '';
        this.serialNumberValue = '';
        this.isProcessAllDisabled = true;
        this.isProcessAll = CommonEnum.no;
        this.isReasonRequired = false;
        this.selectedDeviceMode = this.options[-1];
        if (!this.appService.checkNullOrUndefined(this.skuTransferComponent)) {
            this.skuTransferComponent.skuClear();
        }
        if (!this.appService.checkNullOrUndefined(this.esnSwapComponent)) {
            this.esnSwapComponent.esnClear();
        }
        if (!this.appService.checkNullOrUndefined(this.attributeUpdatesComponent)) {
            this.attributeUpdatesComponent.attrClear();
        }
        if (!this.appService.checkNullOrUndefined(this.esnRemoveReviveComponent)) {
            this.esnRemoveReviveComponent.esnRemoveReviveClear();
        }
        if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
            this.contsummaryParent.containersList = [];
            this.contsummaryParent.deviceList = [];
            this.contsummaryParent.containerSummaryPropertiesList = [];
            this.contsummaryParent.canAllowNextContainerStatus = null;
            this.contsummaryParent.containerSummaryProperties = [];
            this.contsummaryParent.containerActualProp = null;
        }
        this.isAutoPopulatedSerialNumber = false;
        this.masterPageService.disabledSerialNumber = true;
        this.optionDisable = true;
        this.masterPageService.gridContainerDetails = null;
        this.masterPageService.inboundContainerFocus();
        this.uiData.OperationId = this.operationId;
    }

    clearSerialNumber() {
        this.appErrService.clearAlert();
        this.masterPageService.disabledSerialNumber = false;
        this.isProcessAllDisabled = (this.isProcessAll === CommonEnum.yes) ? false : true;
        this.optionDisable = false;
        this.selectedReason = { Id: '', Text: '' };
        this.enableDynamicSelector = false;
        this.masterPageService.enableDynamicSelector = false;
        this.masterPageService.setActiveTabValue = CommonEnum.containerDetails;
        this.gridData = [];
        this.isRollbackDisabled = true;
        this.isProcessRouteDisabled = true;
        this.isReasonDisabled = true;
        this.serialNumberFocus();
        this.originalSku = [];
        this.skuDisabled = false;
        this.isDaysToExpireDisabled = true;
        this.clearContainerID();
        if (!this.isAutoPopulatedSerialNumber) {
            this.serialNumber = '';
        }
        this.masterPageService.serialNumberProperties = null;
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

    // Clear Container Summary
    clearContainerSummary() {
        if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
            const container = this.contsummaryParent;
            container.inbContainerDisabled = false;
            container.rmtextchild.value = '';
            container.isClearDisabled = true;
        }
    }

    // Serial Number Focus
    serialNumberFocus() {
        this.appService.setFocus('serialNumber');
    }

    // save focus
    rollbackFocus() {
        this.appService.setFocus('rollBack');
    }

    containerFocus() {
        this.appService.setFocus('containerInputId');
    }

    optionsFocus() {
        this.appService.setFocus('opCategorydropdown');
    }

    // focus on Route Calculate Process
    routeCalProcessFocus() {
        this.appService.setFocus('routeProcess');
    }

    // resason Focus
    reasonFocus() {
        this.appService.setFocus('Reason');
    }

    softwareVersionFocus() {
        this.appService.setFocus('softwareVersion');
    }

    // enabling the button and container ID
    configContainerProperties() {
        if (!this.appService.checkNullOrUndefined(this.childContainer)) {
            this.childContainer.isContainerDisabled = false;
            this.childContainer.isClearContainerDisabled = false;
        }
        this.isRollbackDisabled = true;
    }

    ngOnDestroy() {
        this.masterPageService.moduleName.next(null);
        this.appErrService.clearAlert();
        this.resetClear();
        this.masterPageService.options = [];
        this.masterPageService.showUtilityIcon = false;
        this.masterPageService.disabledSerialNumber = true;
        if (!this.appService.checkNullOrUndefined(this.originationOperation) && this.originationOperation) {
            this.originationOperation.unsubscribe();
        }
        this.masterPageService.selectedOptionMode.next(null);
        // clearing the readOnlyDevice subscription methods data
        this.commonService.emitReadOnlyDeviceResponse.next(null);
        this.emitReadOnlyDeviceResponse.unsubscribe();
        this.deviceManagementService.emitRouteResponse.next(null);
        this.emitRouteResponse.unsubscribe();
        this.deviceManagementService.emitSaveRMxResponse.next(null);
        this.emitSaveRMxResponse.unsubscribe();
        this.masterPageService.clearOriginationSubscription();
        if (this.masterPageService.hideControls.controlProperties) {
            this.masterPageService.hideControls.controlProperties = new EngineResult();
        }
        if (this.dialogRef) {
            this.dialogRef.close();
        }
        this.masterPageService.hideDialog();
        this.masterPageService.setDeviceCardHeader(null);
        this.commonService.readOnlyDevice = null;
    }
}
