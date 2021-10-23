import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ApiService } from '../../utilities/rlcutl/api.service';
import { ApiConfigService } from '../../utilities/rlcutl/api-config.service';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';
import { AppService } from '../../utilities/rlcutl/app.service';
import { Grid } from '../../models/common/Grid';
import { RmtextboxComponent } from '../../framework/frmctl/rmtextbox/rmtextbox.component';
import { String } from 'typescript-string-operations';
import { dropdown } from '../../models/common/Dropdown';
import { DockInfo, DockRcvData, DockInfoDetails } from '../../models/receiving/dockreceiving/DockInfo';
import { RmdatepickerComponent } from '../../framework/frmctl/rmdatepicker/rmdatepicker.component';
import { DatePipe } from '@angular/common';
import { ClientData } from '../../models/common/ClientData';
import { UiData } from '../../models/common/UiData';
import { Container } from '../../models/common/Container';
import { Subscription } from 'rxjs';
import { EngineResult } from '../../models/common/EngineResult';
import { TraceTypes } from '../../enums/traceType.enum';
import { CommonService } from '../../services/common.service';
import { MessageType } from '../../enums/message.enum';
import { FindTraceHoldComponent } from '../../framework/busctl/find-trace-hold/find-trace-hold.component';
import { StorageData } from '../../enums/storage.enum';
import { StatusCodes } from '../../enums/status.enum';
import { DropDownSettings } from '../../models/common/dropDown.config';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'dock-receive',
    templateUrl: './dock-receive.component.html',
    styleUrls: ['./dock-receive.component.css']
})
export class DockReceiveComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild(RmdatepickerComponent) childDatePicker: RmdatepickerComponent;

    clientData = new ClientData();
    uiData = new UiData();

    // Form
    dockreceivingform: FormGroup;
    dockreceivingtrackingform: FormGroup;
    // grid
    grid: Grid;
    tempProcessDockList = [];
    processDockList: any;
    buttonName = 'START';

    // intializing objects
    dockInfo = new DockInfo();
    dockInfoDetails = new DockInfoDetails();
    docRcvDataList: DockRcvData[] = [];
    dockRcvData: DockRcvData = new DockRcvData();
    container = new Container();

    carrierName = '';
    carriersList = [];
    carrierOptions: any = [];
    isCarrierDisabled = false;

    shipmentTypes = [];
    shipmentTypeOptions = [];
    isShipmentTypeDisabled = false;
    trailerNumSearchIconBtnDisabled = false;
    shippementSearchIconBtnDisabled = false;
    trackingSearchDisabled = false;
    isShippmentDisabled = false;

    dockTypes = [];
    dockTypeOptions = [];
    isDockTypeDisabled = false;

    minDate: Date = new Date();
    unloadStartValue = '';
    unloadEndValue = '';
    startDateFlag = true;
    endDateFlag = true;
    editStartDate = '';
    editEndDate = '';
    unloadEndMinDate: Date = new Date();
    unLoadStartDisabled = false;
    unLoadEndDisabled = false;
    unLoadStartSearchDisabled = true;
    unLoadEndSearchDisabled = true;

    isDockValueDisabled = false;
    isDocTrailerDisabled = false;
    isDockLoadDisabled = false;

    isAddDisabled = true;
    isClearDisabled = true;
    isEditMode = false;

    // AnthorTab
    trailerLoadTypeOptions = [];
    trailerLoadType: string;
    category: string;

    isTrackingAddDisabled = true;
    isCartonCountDisabled = true;
    isTrackingNumDisabled = false;
    isClearTrakingDisabled = true;
    isContainerIdDisabled = true;
    trackingNumValidateFlag = true;
    trackingNumber: string;
    containerID: string;
    isConatinerCloseDisabled = true;
    // tracking Detail
    invalidData = false;
    operationObj: any;
    appConfig: any;
    controlConfig: any;
    isTrackingNumberExist = false;
    isTrackingSearchEligible = true;
    emitHideSpinner: Subscription;
    cartonCountPattern: any;
    carrierObj: any = {};
    trackingPrintDisabled = true;
    trackingPrint = false;
    isShowGenerateTrackingNumber = false;
    isGenerateTrackingNumberDisabled = true;
    modeltitle: string;
    validContainerResponse: any;
    // traceTypes = TraceTypes
    messageType: string;
    validTrackingNumberResponse: any;
    // storageData = StorageData;
    // statusCode = StatusCodes;
    isValidatorRequired = false;
    isSearchCarrierDisabled = true;
    isMultiCartonMode = true;
    validateDockProps: any = {};
    editModeRecord: any = {};

    dropdownSettings: DropDownSettings;
    selectedDockType = [];
    dialogRef: any;
    constructor(
        public apiservice: ApiService,
        public form: FormBuilder,
        private apiConfigService: ApiConfigService,
        private snackbar: XpoSnackBar,
        public appErrService: AppErrorService,
        private spinner: NgxSpinnerService,
        public masterPageService: MasterPageService,
        private appService: AppService,
        public datepipe: DatePipe,
        private dialog: MatDialog,
        private commonService: CommonService
    ) {
        const pattern = JSON.parse(localStorage.getItem(StorageData.patternList));
        if (!this.appService.checkNullOrUndefined(pattern)) {
            this.cartonCountPattern = new RegExp(pattern.cartonCountPattern);
        }
        // emitting hide spinner
        this.emitHideSpinner = this.masterPageService.emitHideSpinner.subscribe(spinnerFlag => {
            if (!this.appService.checkNullOrUndefined(spinnerFlag) && spinnerFlag) {
                this.getCarrier();
                this.controlConfig = this.masterPageService.hideControls.controlProperties;
                if (this.controlConfig.hasOwnProperty('startDT')) {
                    this.minDate = new Date(this.datepipe.transform(this.controlConfig.startDT, this.controlConfig.dateFomat));
                    this.unloadEndMinDate = new Date(this.datepipe.transform(this.controlConfig.startDT, this.controlConfig.dateFomat));
                }
            }
        });
    }

    ngOnInit() {
        this.operationObj = this.masterPageService.getRouteOperation();
        if (this.operationObj) {
            this.uiData.OperationId = this.operationObj.OperationId;
            this.uiData.OperCategory = this.operationObj.Category;
            this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
            // setting value to hidespinner (based on this value we are emiting emithidespinner method)
            this.masterPageService.hideSpinner = true;
            this.masterPageService.setTitle(this.operationObj.Title);
            this.masterPageService.setModule(this.operationObj.Module);
            this.buildForm();
            this.dockInfo.DockLoc = this.clientData.Location;
            this.appConfig = JSON.parse(localStorage.getItem(StorageData.appConfig));
            this.dropdownSettings = new DropDownSettings();
            this.dropdownSettings.idField = 'Id';
            this.dropdownSettings.textField = 'Text';
            this.dropdownSettings.singleSelection = true;
            this.carrierFocus();
        }
    }


    // Intialize the form controls
    buildForm() {
        this.dockreceivingform = this.form.group({
            carrierName: [],
            shipmentRef: [],
            carrier: [],
            shipmentTypeId: [],
            dockType: [],
            dockValue: [],
            dockLocation: [],
            trailerNumber: [],
            trailerLoadType: [],
            unloadStart: null,
            unloadEnd: null,
            trailerOut: []
        });

        this.dockreceivingtrackingform = this.form.group({
            trackingNumber: [],
            cartonCount: [],
            containerId: [],
            trackingPrint: [],
            multiCartonMode: []
        });
    }

    ngAfterViewInit() {
        this.dockreceivingform.valueChanges
            .pipe(debounceTime(300),
                distinctUntilChanged())
            .subscribe(changedValue => {
                if (this.invalidData === true) {
                    this.isAddDisabled = true;
                } else if (this.invalidData === false) {
                    this.isAddDisabled = !this.dockreceivingform.valid;
                } else {
                    this.isAddDisabled = true;
                }
            });

        this.dockreceivingtrackingform.valueChanges
            .pipe(debounceTime(300),
                distinctUntilChanged())
            .subscribe(changedValue => {
                if (this.trackingNumValidateFlag === false) {
                    this.isTrackingAddDisabled = !this.dockreceivingtrackingform.valid;
                }
            });
    }


    // getCarrier
    getCarrier() {
        this.spinner.show();
        const requestObj = { ClientData: this.clientData, UIData: this.uiData };
        const getCarrierUrl = String.Join('/', this.apiConfigService.getCarrierUrl);
        this.apiservice.apiPostRequest(getCarrierUrl, requestObj)
            .subscribe(response => {
                const res = response.body;
                if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
                    if (!this.appService.checkNullOrUndefined(res.Response)) {
                        this.carriersList = res.Response;
                        res.Response.forEach(element => {
                            const dd: dropdown = new dropdown();
                            dd.Id = element.CarrierCode;
                            dd.Text = element.CarrierCode;
                            this.carrierOptions.push(dd);
                        });
                    }
                    this.shipmentTypeData();
                } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
                    this.spinner.hide();
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                }
            }, erro => {
                this.appErrService.handleAppError(erro);
            });
    }

    shipmentTypeData() {
        this.spinner.show();
        const requestObj = { ClientData: this.clientData, UIData: this.uiData };
        this.apiservice.apiPostRequest(this.apiConfigService.getShipmentTypesUrl, requestObj)
            .subscribe(response => {
                const res = response.body;
                if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
                    if (!this.appService.checkNullOrUndefined(res.Response) && !this.appService.checkNullOrUndefined(res.Response.ShipmentTypes)) {
                        this.shipmentTypes = res.Response.ShipmentTypes;
                        this.shipmentTypes.forEach(element => {
                            const dd: dropdown = new dropdown();
                            dd.Id = element.Id;
                            dd.Text = element.Text;
                            this.shipmentTypeOptions.push(dd);
                        });
                        this.dockInfo.ShipmentType = this.shipmentTypeOptions[0].Id;
                        this.validateDockProps['SHIPMENTTYPE'] = this.shipmentTypeOptions[0].Id;
                    }
                    this.getDockType();
                } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
                    this.spinner.hide();
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                }
            }, erro => {
                this.appErrService.handleAppError(erro);
            });
    }

    getDockType() {
        this.spinner.show();
        const requestObj = { ClientData: this.clientData, UIData: this.uiData };
        this.apiservice.apiPostRequest(this.apiConfigService.getDockTypesUrl, requestObj)
            .subscribe(response => {
                const res = response.body;
                if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
                    if (!this.appService.checkNullOrUndefined(res.Response) && !this.appService.checkNullOrUndefined(res.Response.DockTypes)) {
                        //  this.dockTypes = res.Response.DockTypes;
                        this.dockTypeOptions = res.Response.DockTypes;
                        //  this.dockTypes.forEach(element => {
                        //      let dd: dropdown = new dropdown();
                        //      dd.Id = element.Id;
                        //      dd.Text = element.Text;
                        //      this.dockTypeOptions.push(dd);
                        //  });
                    }
                    this.getStatus();
                } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
                    this.spinner.hide();
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                }
            }, erro => {
                this.appErrService.handleAppError(erro);
            });
    }


    // statusTypeOptions
    getStatus() {
        this.spinner.show();
        const requestObj = { ClientData: this.clientData, UIData: this.uiData };
        const getCarrierUrl = String.Join('/', this.apiConfigService.getStatuses, 'LOADTYPE');
        this.apiservice.apiPostRequest(getCarrierUrl, requestObj)
            .subscribe(response => {
                this.spinner.hide();
                const res = response.body;
                if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
                    res.Response.forEach(element => {
                        const dd: dropdown = new dropdown();
                        dd.Id = element.Status_Code;
                        dd.Text = element.Status_Code;
                        this.trailerLoadTypeOptions.push(dd);
                    });
                } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                }
            }, erro => {
                this.appErrService.handleAppError(erro);
            });
    }


    // validateContainerId
    validateContainer() {
        this.spinner.show();
        const requestObj = { ClientData: this.clientData, UIData: this.uiData };
        const url = String.Join('/', this.apiConfigService.validateContainerIdUrl, this.container.ContainerID);
        this.apiservice.apiPostRequest(url, requestObj)
            .subscribe(response => {
                const res = response.body;
                this.spinner.hide();
                if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
                    this.validContainerResponse = response.body;
                    const traceData = { traceType: TraceTypes.containerID, traceValue: this.validContainerResponse.Response.ContainerID, uiData: this.uiData };
                    const traceResult = this.commonService.findTraceHold(traceData, this.uiData);
                    traceResult.subscribe(result => {
                        if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
                            if (this.appService.checkNullOrUndefined(result.Response)) {
                                this.validateContainerID();
                            } else {
                                this.canProceed(result, TraceTypes.containerID);
                            }
                            this.spinner.hide();
                        } else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
                            this.spinner.hide();
                            this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
                        }
                    });
                } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                }
            }, erro => {
                this.appErrService.handleAppError(erro);
            });
    }

    validateContainerID(res = this.validContainerResponse) {
        this.container = res.Response;
        this.containerID = this.container.ContainerID;
        this.isContainerIdDisabled = true;
        this.isConatinerCloseDisabled = false;
        if (this.trackingNumber) {
            this.trackingNumValidateFlag = false;
            this.isTrackingAddDisabled = false;
        } else {
            this.trackingNumValidateFlag = true;
            this.isTrackingAddDisabled = true;
        }
        this.isTrackingNumDisabled = false;
        this.trackingNumberFocus();
        if (this.isShowGenerateTrackingNumber) {
            this.isGenerateTrackingNumberDisabled = false;
        }
        this.validContainerResponse = null;
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
                    if (type === TraceTypes.containerID) {
                        this.validateContainerID();
                    } else if (type === TraceTypes.trackingNumber) {
                        this.validTrackingNumber();
                    }
                } else if (returnedData.Response.canProceed === 'N') {
                    if (type === TraceTypes.containerID) {
                        //  this.containerIdFocus();
                    } else if (type === TraceTypes.trackingNumber) {
                        this.trackingNumberFocus();
                    }
                    this.appErrService.setAlert(returnedData.StatusMessage, true);
                }
                }
            });
        }
    }

    //  Modal Popup
    closeContainerConfirm(template: TemplateRef<any>) {
        this.dialogRef = this.dialog.open(template, { hasBackdrop: true, disableClose: true, panelClass:'dialog-width-sm' })
    }


    // closeContainer
    closeContainer() {
        this.dialogRef.close();
        this.spinner.show();
        const requestObj = { ClientData: this.clientData, Container: this.container, UIData: this.uiData };
        const url = String.Join('/', this.apiConfigService.closeContainerUrl);
        this.apiservice.apiPostRequest(url, requestObj)
            .subscribe(response => {
                const res = response.body;
                this.spinner.hide();
                if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
                    this.createContainerLabel();
                    this.snackbar.success(res.StatusMessage);
                } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                }
            }, erro => {
                this.appErrService.handleAppError(erro);
            });
    }


    // createContainerLabelPrint
    createContainerLabel() {
        this.spinner.show();
        const requestObj = { ClientData: this.clientData, UIData: this.uiData, Container: this.container };
        const createLabelUrl = String.Join('/', this.apiConfigService.createLabelUrl, this.uiData.OperationId);
        this.apiservice.apiPostRequest(createLabelUrl, requestObj)
            .subscribe(response => {
                const res = response.body;
                this.spinner.hide();
                if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
                    this.Clear();
                } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                }
            }, erro => {
                this.appErrService.handleAppError(erro);
            });
    }


    // createTrackingPrint
    createTrackingNumberPrint() {
        this.spinner.show();
        const requestObj = { ClientData: this.clientData, UIData: this.uiData, Carrier: this.carrierObj, DockInfoDetails: this.dockInfoDetails };
        const createLabelUrl = String.Join('/', this.apiConfigService.receivecreateLabelUrl, this.uiData.OperationId);
        this.apiservice.apiPostRequest(createLabelUrl, requestObj)
            .subscribe(response => {
                const res = response.body;
                this.spinner.hide();
                if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
                    this.trackingPrint = false;
                } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                }
            }, erro => {
                this.appErrService.handleAppError(erro);
            });
    }

    // validate Tracking number
    isValidTrackingNumber(trackingNumber) {
        if (this.isTrackingSearchEligible) {
            return;
        }
        if (this.masterPageService.hideControls && this.masterPageService.hideControls.controlProperties) {
            if (this.masterPageService.hideControls.controlProperties.docContainerID) {
                this.validateTrackingNumber(trackingNumber);
                return;
            }
        }
        if (!this.containerID) {
            return;
        } else {
            this.validateTrackingNumber(trackingNumber);
        }

    }

    validateTrackingNumber(trackingNumber) {
        this.spinner.show();
        const requestObj = { ClientData: this.clientData, UIData: this.uiData, DockInfo: this.dockInfo, Container: this.container };
        const url = String.Join('/', this.apiConfigService.validateTrackingNumberUrl, trackingNumber);
        this.apiservice.apiPostRequest(url, requestObj)
            .subscribe(response => {
                const res = response.body;
                this.spinner.hide();
                if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
                    this.validTrackingNumberResponse = response.body;
                    const traceData = { traceType: TraceTypes.trackingNumber, traceValue: res.Response.FullTrackingNumber, uiData: this.uiData };
                    const traceResult = this.commonService.findTraceHold(traceData, this.uiData);
                    traceResult.subscribe(result => {
                        if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
                            if (this.appService.checkNullOrUndefined(result.Response)) {
                                this.validTrackingNumber();
                            } else {
                                this.canProceed(result, TraceTypes.trackingNumber);
                            }
                            this.spinner.hide();
                        } else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
                            this.spinner.hide();
                            this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
                        }
                    });
                } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
                    this.dockInfoDetails.FullTrackingNumber = '';
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                }
            }, erro => {
                this.appErrService.handleAppError(erro);
            });
    }

    validTrackingNumber(res = this.validTrackingNumberResponse) {
        this.dockInfoDetails.FullTrackingNumber = res.Response.FullTrackingNumber;
        this.dockInfoDetails.TrackingNumber = res.Response.TrackingNumber;
        this.dockInfoDetails.CatId = res.Response.CatId;
        this.trackingNumber = res.Response.TrackingNumber;
        this.dockInfoDetails.CartonCount = 1;
        this.isTrackingNumDisabled = true;
        this.isClearTrakingDisabled = false;
        this.trackingNumValidateFlag = false;
        this.trackingPrintDisabled = false;
        this.isGenerateTrackingNumberDisabled = true;
        if (this.masterPageService.hideControls.controlProperties && this.masterPageService.hideControls.controlProperties.showCartonMode) {
            if (this.isMultiCartonMode) {
                this.isCartonCountDisabled = false;
                this.cartonCountFocus();
            } else {
                this.isTrackingAddDisabled = false;
                this.saveDockData(this.isMultiCartonMode);
            }
        } else {
            this.isCartonCountDisabled = false;
            this.cartonCountFocus();
        }
        this.validTrackingNumberResponse = null;
    }

    validateGetTrackingNumber() {
        if (this.isTrackingSearchEligible) {
            return;
        }
        if (this.masterPageService.hideControls && this.masterPageService.hideControls.controlProperties) {
            if (this.masterPageService.hideControls.controlProperties.docContainerID) {
                this.getTrackingNumber();
                return;
            }
        }
        if (!this.containerID) {
            return;
        } else {
            this.getTrackingNumber();
        }
    }

    getTrackingNumber() {
        this.spinner.show();
        const requestObj = { ClientData: this.clientData, UIData: this.uiData };
        const url = String.Join('/', this.apiConfigService.getTrackingNumberUrl);
        this.apiservice.apiPostRequest(url, requestObj)
            .subscribe(response => {
                const res = response.body;
                this.spinner.hide();
                if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
                    this.dockInfoDetails.FullTrackingNumber = res.Response.FullTrackingNumber;
                    this.validateTrackingNumber(res.Response.FullTrackingNumber);
                } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                }
            }, erro => {
                this.appErrService.handleAppError(erro);
            });
    }

    // start / save button calling this api - gives dockInfo object along with DockReceiptId
    generateDockReceipt() {
        this.appErrService.clearAlert();
        if (this.buttonName === 'START') {
            if (this.checkDateValues()) {
                this.spinner.show();
                this.dockInfo.UnloadStart = this.unloadStartValue;
                this.dockInfo.UnloadEnd = this.unloadEndValue;
                this.dockInfoDetails = new DockInfoDetails();
                const requestObj = { ClientData: this.clientData, UIData: this.uiData, DockInfo: this.dockInfo };
                const generateDockReceiptUrl = String.Join('/', this.apiConfigService.generateDockReceiptUrl);
                this.apiservice.apiPostRequest(generateDockReceiptUrl, requestObj)
                    .subscribe(response => {
                        const res = response.body;
                        this.spinner.hide();
                        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
                            this.invalidData = true;
                            this.isAddDisabled = true;
                            this.isTrackingSearchEligible = false;
                            this.dockInfo = res.Response.DockInfo;
                            if (!this.appService.checkNullOrUndefined(res.Response.GenerateTrcknbrEnabled)) {
                                this.isShowGenerateTrackingNumber = res.Response.GenerateTrcknbrEnabled;
                                this.isGenerateTrackingNumberDisabled = !res.Response.GenerateTrcknbrEnabled;
                            }
                            if (this.processDockList) {
                                this.processDockList = null;
                                this.tempProcessDockList = [];
                            }
                            this.unloadStartValue = this.datepipe.transform(this.dockInfo.UnloadStart, 'yyyy-MM-dd h:mm:ss a');
                            this.unloadEndValue = this.datepipe.transform(this.dockInfo.UnloadEnd, 'yyyy-MM-dd h:mm:ss a');
                            // this.isTrackingNumDisabled = false;
                            this.isContainerIdDisabled = false;
                            this.disablingDock(true);
                            this.isSearchCarrierDisabled = true;
                            this.unLoadStartSearchDisabled = true;
                            this.unLoadEndSearchDisabled = true;
                            this.snackbar.success(res.StatusMessage);
                            this.generateTrackingNumber();  // using whirlpool
                        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
                            this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                        }
                    }, erro => {
                        this.appErrService.handleAppError(erro);
                    });
            } else {
                this.appErrService.setAlert(this.appService.getErrorText('82600219'), true);
            }
        } else if (this.buttonName === 'SAVE') {
            this.spinner.show();
            this.dockInfo.UnloadStart = this.unloadStartValue;
            this.dockInfo.UnloadEnd = this.unloadEndValue;
            const requestObj = { ClientData: this.clientData, DockInfo: this.dockInfo, DockInfoDetails: this.dockInfoDetails, UIData: this.uiData };
            this.apiservice.apiPostRequest(this.apiConfigService.updateDockInfoUrl, requestObj)
                .subscribe(response => {
                    const res = response.body;
                    this.spinner.hide();
                    if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
                        this.docRcvDataList = res.Response.DockRcvData;
                        this.onProcessDockGenerateJsonGrid(this.docRcvDataList);
                        this.snackbar.success(res.StatusMessage);
                        this.isEditMode = false;
                        this.Clear(true);
                        this.isClearDisabled = false;
                    } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
                        this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                    }
                }, erro => {
                    this.appErrService.handleAppError(erro);
                });
        }

    }


    // generateTrackingNumber
    generateTrackingNumber() {
        this.spinner.show();
        const requestObj = { ClientData: this.clientData, UIData: this.uiData };
        const generateTrackingNumberUrl = String.Join('/', this.apiConfigService.generateTrackingNumber);
        this.apiservice.apiPostRequest(generateTrackingNumberUrl, requestObj)
            .subscribe(response => {
                const res = response.body;
                this.spinner.hide();
                if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
                    // whirlpool (client specific)
                    if (res.Response.TrackingNumber) {
                        this.isTrackingNumberExist = true;
                        this.dockInfoDetails.TrackingNumber = res.Response.TrackingNumber;
                        this.isTrackingNumDisabled = true;
                        if (!res.Response.CartonCount) {
                            this.dockInfoDetails.CartonCount = 1;
                        }
                        this.isClearTrakingDisabled = false;
                        this.trackingNumValidateFlag = false;
                    } else {
                        // For verizon
                        this.trackingNumValidateFlag = true;
                        if (this.masterPageService.hideControls && this.masterPageService.hideControls.controlProperties) {
                            if (!this.masterPageService.hideControls.controlProperties.docContainerID) {
                                this.isTrackingNumDisabled = true;
                                this.isGenerateTrackingNumberDisabled = true;
                                this.containerFocus();
                            } else {
                                if (this.isShowGenerateTrackingNumber) {
                                    this.generatedTrknBtnFocus();
                                } else {
                                    this.trackingNumberFocus();
                                }
                            }
                        }
                    }
                } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                }
            }, erro => {
                this.appErrService.handleAppError(erro);
            });

    }

    // get dock info by search search value i.e shippment and trailer number  and tracking number
    getDockInfo(searchValue, searchType) {
        if (searchValue && searchType) {
            const dockRcvSearchData: any = {};
            dockRcvSearchData.SearchKey = searchType;
            dockRcvSearchData.SearchValue = searchValue;
            this.appErrService.clearAlert();
            const requestObj = { ClientData: this.clientData, UIData: this.uiData, DockRcvSearchValues: dockRcvSearchData };
            this.spinner.show();
            const url = String.Join('/', this.apiConfigService.getDockInfoUrl);
            this.apiservice.apiPostRequest(url, requestObj)
                .subscribe(response => {
                    const res = response.body;
                    this.spinner.hide();
                    if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
                        if (!this.appService.checkNullOrUndefined(res.Response.DockRcvData) && res.Response.DockRcvData.length) {
                            this.docRcvDataList = res.Response.DockRcvData;
                            this.onProcessDockGenerateJsonGrid(this.docRcvDataList);
                        }
                    } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
                        this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                        if (this.processDockList) {
                            this.processDockList = null;
                            this.tempProcessDockList = [];
                        }
                    }
                }, erro => {
                    this.appErrService.handleAppError(erro);
                });
        }
    }

    // get dockdetails --on edit button in grid we are calling this api
    getDockDetails() {
        this.spinner.show();
        const requestObj = { ClientData: this.clientData, UIData: this.uiData, DockRcvData: this.dockRcvData };
        this.apiservice.apiPostRequest(this.apiConfigService.getDockDetailsUrl, requestObj)
            .subscribe(response => {
                const res = response.body;
                this.spinner.hide();
                if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
                    this.dockInfo = res.Response.DockInfo;
                    this.dockInfoDetails = res.Response.DockInfoDetails;
                    this.container = res.Response.Container;
                    this.containerID = this.container.ContainerID;
                    this.unloadStartValue = this.datepipe.transform(this.dockInfo.UnloadStart, 'yyyy-MM-dd h:mm:ss a');
                    this.unloadEndValue = this.datepipe.transform(this.dockInfo.UnloadEnd, 'yyyy-MM-dd h:mm:ss a');
                    this.getCarrierName();
                    this.disablingDock(false);
                    this.isCarrierDisabled = true;
                    this.isSearchCarrierDisabled = true;
                    this.unLoadStartSearchDisabled = true;
                    this.unLoadEndSearchDisabled = true;
                    if (this.masterPageService.hideControls.controlProperties && this.masterPageService.hideControls.controlProperties.editMode) {
                        this.isEditMode = true;
                        // this.isClearTrakingDisabled = false;
                    } else {
                        this.disableTrackingNumberSection();
                        this.isShipmentTypeDisabled = true;
                        this.shippementSearchIconBtnDisabled = true;
                    }
                    this.trackingNumValidateFlag = true;
                    this.invalidData = false;
                    this.isAddDisabled = false;
                    this.trailerNumSearchIconBtnDisabled = true;
                    this.isConatinerCloseDisabled = false;
                    this.trackingSearchDisabled = true;
                    this.isTrackingSearchEligible = false;
                    this.isGenerateTrackingNumberDisabled = true;
                    this.isShowGenerateTrackingNumber = false;
                    this.isValidatorRequired = false;
                    this.isClearDisabled = false;
                    if (this.masterPageService.hideControls && this.masterPageService.hideControls.controlProperties) {
                        if (!this.masterPageService.hideControls.controlProperties.shipmentReferenceSearch) {
                            this.isShippmentDisabled = true;
                            this.shippementSearchIconBtnDisabled = true;
                        }
                        if (!this.masterPageService.hideControls.controlProperties.trailerNumberSearch) {
                            this.isDocTrailerDisabled = true;
                            this.trailerNumSearchIconBtnDisabled = true;
                        }
                    }
                    this.buttonName = 'SAVE';
                } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                }
            }, erro => {
                this.appErrService.handleAppError(erro);
            });
    }

    // InsertDockReceiptDetail and Header Info(add button on tracking number section)
    saveDockData(checkMultiCarton = true) {
        if (this.isTrackingAddDisabled === false) {
            this.spinner.show();
            this.dockInfoDetails.ContainerCycle = this.container.ContainerCycle;
            this.dockInfoDetails.ContainerId = this.container.ContainerID;
            this.dockInfoDetails.DockReceiptId = this.dockInfo.DockReceiptId;
            const requestObj = { ClientData: this.clientData, DockInfo: this.dockInfo, DockInfoDetails: this.dockInfoDetails, UIData: this.uiData };
            this.apiservice.apiPostRequest(this.apiConfigService.saveDockDataUrl, requestObj)
                .subscribe(response => {
                    const res = response.body;
                    this.spinner.hide();
                    if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
                        if (this.trackingPrint) {
                            this.createTrackingNumberPrint();
                        }
                        this.docRcvDataList = res.Response.DockRcvData;
                        this.container = res.Response.Container;
                        this.onProcessDockGenerateJsonGrid(this.docRcvDataList);
                        this.isContainerIdDisabled = true;
                        // for whirlpool
                        if (this.isTrackingNumberExist) {
                            this.Clear(true);
                        } else {
                            this.clearTrackingNumberSection();
                            if (!checkMultiCarton) {
                                this.isMultiCartonMode = false;
                            }
                        }
                        this.snackbar.success(res.StatusMessage);
                    } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
                        this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                    }
                }, erro => {
                    this.appErrService.handleAppError(erro);
                });
        }
    }

    deleteDockDetailRow(event, deleteModal) {
        this.dockRcvData = event;
        this.openModal(deleteModal, 'dialog-width-sm');
    }

    // deleteDockDetails
    deleteDockDetails() {
        this.dialogRef.close();
        const requestObj = { ClientData: this.clientData, UIData: this.uiData, DockRcvData: this.dockRcvData };
        this.spinner.show();
        const url = String.Join('/', this.apiConfigService.deleteDockDetailsUrl);
        this.apiservice.apiPostRequest(url, requestObj)
            .subscribe(response => {
                const res = response.body;
                this.spinner.hide();
                if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
                    this.snackbar.success(res.StatusMessage);
                    if (this.trackingSearchDisabled) {
                        this.container = res.Response.Container;
                    }
                    if (!this.appService.checkNullOrUndefined(res.Response.DockRcvData) && res.Response.DockRcvData.length) {
                        this.docRcvDataList = res.Response.DockRcvData;
                        this.onProcessDockGenerateJsonGrid(this.docRcvDataList);
                        if (!this.appService.checkNullOrUndefined(this.editModeRecord) && Object.keys(this.editModeRecord).length) {
                            this.Clear(true);
                            this.isClearDisabled = false;
                        }
                    } else if (!this.appService.checkNullOrUndefined(res.Response.DockRcvData) && res.Response.DockRcvData.length === 0) {
                        this.processDockList = null;
                        this.tempProcessDockList = [];
                        this.Clear();
                    }
                    this.dockInfoDetails = new DockInfoDetails();
                } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                }
            }, erro => {
                this.appErrService.handleAppError(erro);
            });
    }

    //  validateDock
    validateDock(isValid, controlId?) {
        if (isValid) {
            this.spinner.show();
            this.appErrService.clearAlert();
            const validateDock = {
                Props: this.validateDockProps
            };
            const requestObj = { ClientData: this.clientData, UIData: this.uiData, ValidateDock: validateDock };
            const url = String.Join('/', this.apiConfigService.validateDockUrl);
            this.apiservice.apiPostRequest(url, requestObj)
                .subscribe(response => {
                    const res = response.body;
                    this.spinner.hide();
                    if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
                        this.shippementSearchIconBtnDisabled = true;
                        this.isShippmentDisabled = true;
                        this.isValidatorRequired = false;
                    } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
                        this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                        if (controlId) {
                            this.appService.applyRequired(true, controlId);
                        }
                    }
                }, erro => {
                    this.appErrService.handleAppError(erro);
                });
        }
    }

    openModal(template: TemplateRef<any>, modalclass: any) {
        this.modeltitle = 'Confirm Delete';
        this.dialogRef = this.dialog.open(template, { hasBackdrop: true, disableClose: true, panelClass: modalclass})
    }

    // onProcessDockGenerateJsonGrid
    onProcessDockGenerateJsonGrid(Response) {
        if (!this.appService.checkNullOrUndefined(Response)) {
            this.tempProcessDockList = [];
            this.processDockList = [];
            const headingsobj = Object.keys(Response[0]);
            Response.forEach(res => {
                const element: DockRcvData = new DockRcvData();
                headingsobj.forEach(singleheader => {
                    element[singleheader] = res[singleheader];
                });
                this.tempProcessDockList.push(element);
            });
            this.grid = new Grid();
            this.grid.EditVisible = true;
            if (this.masterPageService.hideControls && this.masterPageService.hideControls.controlProperties && this.masterPageService.hideControls.controlProperties.showDelete) {
                this.grid.DeleteVisible = true;
            }
            this.grid.ItemsPerPage = this.appConfig.dockreceiving.griditemsPerPage;
            this.processDockList = this.appService.onGenerateJson(this.tempProcessDockList, this.grid);
        }
    }

    //  carton mode change
    onCartonModeChange(event) {
        this.isMultiCartonMode = !this.isMultiCartonMode;
        this.isClearDisabled = false;
        if (!this.isMultiCartonMode) {
            this.dockInfoDetails.CartonCount = 1;
            this.isCartonCountDisabled = true;
        } else {
            this.isCartonCountDisabled = false;
        }
    }

    // change carrier Category Dropdown
    changeCarrier(event) {
        this.dockInfo.CarrierCode = event.value;
        this.getCarrierName();
        this.isClearDisabled = false;
        this.carrierObj.CarrierCode = event.value;
        this.carrierObj.CarrierName = this.carrierName;
        this.isSearchCarrierDisabled = false;
    }

    // getCarrierName
    getCarrierName() {
        const carrier = this.carriersList.find(c => c.CarrierCode === this.dockInfo.CarrierCode);
        if (!this.appService.checkNullOrUndefined(carrier)) {
            this.carrierName = carrier.CarrierName;
        }
    }

    // Change ShipmentType
    changeShipmentType(event, key) {
        this.dockInfo.ShipmentType = event.value;
        this.isClearDisabled = false;
        this.isShippmentDisabled = false;
        this.dockInfo.ShipmentRef = '';
        this.validateDockProps[key] = event.value;
    }

    // Change DockType
    changeDockType(event) {
        this.dockInfo.DockType = event.Id;
        if (event.Id) {
            this.isClearDisabled = false;
        }
    }

    deSelectDockType() {
        this.dockInfo.DockType = '';
        this.selectedDockType = [];
    }

    // change StatusType
    changeStatusType(event) {
        this.dockInfo.TrailerLoad = event.value;
        this.isClearDisabled = false;
    }


    // Serial number focus
    carrierFocus() {
        this.appService.setFocus('carrier');
    }

    // shipmentRefFocus
    shipmentRefFocus() {
        this.appService.setFocus('shipmentRef');
    }
    cartonCountFocus() {
        this.appService.setFocus('cartonCount');
    }

    containerFocus() {
        this.appService.setFocus('ContainerId');
    }

    trackingNumberFocus() {
        this.appService.setFocus('trackingNumberId');
    }

    generatedTrknBtnFocus() {
        this.appService.setFocus('genTrknId');
    }


    // changeInput
    changeInput(inputControl: RmtextboxComponent) {
        if (this.invalidData === false) {
            this.appErrService.clearAlert();
        }
        this.isClearDisabled = false;
    }

    changeShipmentRef(isValidationRequired, key, value) {
        if (isValidationRequired) {
            // based on this flag add button will enable
            this.isValidatorRequired = true;
            this.validateDockProps[key] = value;
        }
        this.isClearDisabled = false;
        this.appErrService.clearAlert();
    }

    specialCharacterEmit(event) {
        if (event === true) {
            setTimeout(() => {
                this.isAddDisabled = true;
            }, 301);
        }
    }

    // clear
    Clear(isGridRequired?) {
        this.isEditMode = false;
        this.isMultiCartonMode = true;
        this.appErrService.clearAlert();
        this.isClearDisabled = true;
        this.isAddDisabled = true;
        this.trackingPrint = false;
        this.isValidatorRequired = false;
        this.isSearchCarrierDisabled = true;
        this.validateDockProps = {};
        // this.dockInfo = new DockInfo();
        this.clearDockReceipt();
        this.buttonName = 'START';
        this.unloadStartValue = null;
        this.unloadEndValue = null;
        this.unLoadStartSearchDisabled = true;
        this.unLoadEndSearchDisabled = true;
        this.invalidData = false;
        this.carrierName = '';
        this.disablingDock(false);
        if (this.processDockList && !isGridRequired) {
            this.processDockList = null;
            this.tempProcessDockList = [];
        }
        this.clearTrackingNumberSection(true);
        this.isGenerateTrackingNumberDisabled = true;
        this.isShowGenerateTrackingNumber = false;
        this.editModeRecord = {};
        this.selectedDockType = [];
        if (this.controlConfig.hasOwnProperty('startDT')) {
            this.minDate = new Date(this.datepipe.transform(this.controlConfig.startDT, this.controlConfig.dateFomat));
            this.unloadEndMinDate = new Date(this.datepipe.transform(this.controlConfig.startDT, this.controlConfig.dateFomat));
        }
        this.carrierFocus();
    }


    clearDockReceipt() {
        this.dockInfo.DockReceiptId = '';
        this.dockInfo.CarrierCode = '';
        this.dockInfo.DockValue = '';
        this.dockInfo.ShipmentRef = '';
        this.dockInfo.TrailerLoad = '';
        this.dockInfo.TrailerNumber = '';
        this.dockInfo.UnloadStart = '';
        this.dockInfo.UnloadEnd = '';
        this.dockInfo.DockType = '';
        this.dockInfo.TrailerOut = null;
        this.carrierName = '';
        if (!this.appService.checkNullOrUndefined(this.shipmentTypeOptions) && this.shipmentTypeOptions.length) {
            this.dockInfo.ShipmentType = this.shipmentTypeOptions[0].Id;
            this.validateDockProps['SHIPMENTTYPE'] = this.shipmentTypeOptions[0].Id;
        }
    }


    clearTrackingNumberSection(isClear?) {
        if (isClear) {
            this.containerID = '';
            this.trackingNumber = '';
            this.isMultiCartonMode = true;
            this.isTrackingNumDisabled = false;
            this.isTrackingSearchEligible = true;
            this.isContainerIdDisabled = true;
            this.isConatinerCloseDisabled = true;
            this.isCartonCountDisabled = true;
            this.isClearTrakingDisabled = true;
            this.isTrackingAddDisabled = true;
            this.isTrackingNumberExist = false;
            this.trackingNumValidateFlag = true;
            this.trackingPrintDisabled = true;
            this.container = new Container();
            this.dockInfoDetails = new DockInfoDetails();
            this.carrierObj = {};
        } else {
            // for verizon
            if (!this.isTrackingNumberExist) {
                if (this.masterPageService.hideControls && this.masterPageService.hideControls.controlProperties) {
                    if (!this.masterPageService.hideControls.controlProperties.docContainerID) {
                        this.isTrackingNumDisabled = true;
                        this.isGenerateTrackingNumberDisabled = true;
                        this.containerFocus();
                    } else {
                        this.isTrackingNumDisabled = false;
                        this.isGenerateTrackingNumberDisabled = false;
                        if (this.isShowGenerateTrackingNumber) {
                            this.generatedTrknBtnFocus();
                        } else {
                            this.trackingNumberFocus();
                        }
                    }
                }
                this.isMultiCartonMode = true;
                this.isCartonCountDisabled = true;
                this.isTrackingAddDisabled = true;
                this.trackingNumValidateFlag = true;
                this.isClearTrakingDisabled = true;
                this.trackingPrint = false;
                this.trackingPrintDisabled = true;
                this.dockInfoDetails = new DockInfoDetails();
            } else {
                // for whirlpool
                this.dockInfoDetails.CartonCount = null;
                this.isCartonCountDisabled = false;
                this.isTrackingNumDisabled = true;
                this.isTrackingSearchEligible = false;
                this.trackingNumValidateFlag = true;
                this.cartonCountFocus();
            }
        }
        this.appErrService.clearAlert();
    }


    disableTrackingNumberSection() {
        this.isClearTrakingDisabled = true;
        this.isCartonCountDisabled = true;
        if (this.masterPageService.hideControls && this.masterPageService.hideControls.controlProperties && this.masterPageService.hideControls.controlProperties.isCartonCountEdit) {
           this.isCartonCountDisabled = this.isMultiCartonMode ? false : true;
        }
        this.isTrackingAddDisabled = true;
        this.isTrackingNumDisabled = true;
        this.isContainerIdDisabled = true;
    }


    // input change start date
    editunLoadStartDate(startDate: any, dp1: any, startdateRef: any) {
        dp1.hide();
        if (startDate) {
            this.invalidData = true;
            this.isAddDisabled = true;
            const d = new Date(startDate);
            if (d.toDateString() === 'Invalid Date') {
                this.editStartDate = '';
                this.unLoadStartSearchDisabled = true;
                return;
            } else {
                //  this.editStartDate = event;
                this.editStartDate = this.datepipe.transform(startDate, 'yyyy-MM-dd h:mm:ss a');
                this.startDateFlag = false;
                this.unLoadStartSearchDisabled = false;
            }
        } else {
            this.unLoadStartSearchDisabled = true;
            this.editStartDate = '';
            this.invalidData = false;
            //  this.dockreceivingform.value.unloadStart=null;
            if (this.dockreceivingform.valid) {
                this.isAddDisabled = false;
            }
            startdateRef.blur();
        }
    }

    // input change end date
    editunLoadEndtDate(endDate: any, dp2: any, endDateRef: any) {
        dp2.hide();
        if (endDate) {
            this.invalidData = true;
            this.isAddDisabled = true;
            const d = new Date(endDate);
            if (d.toDateString() === 'Invalid Date') {
                this.editEndDate = '';
                this.unLoadEndSearchDisabled = true;
                return;
            } else {
                //  this.editEndDate = endDate;
                this.editEndDate = '';
                this.editEndDate = this.datepipe.transform(endDate, 'yyyy-MM-dd h:mm:ss a');
                this.endDateFlag = false;
                this.unLoadEndSearchDisabled = false;
            }
        } else {
            this.editEndDate = '';
            this.invalidData = false;
            this.unLoadEndSearchDisabled = true;
            if (this.dockreceivingform.valid) {
                this.isAddDisabled = false;
            }
            endDateRef.blur();
        }
    }

    // change start date
    unLoadStartEditDate(event) {
        this.unloadStartValue = '';
        this.unloadStartValue = this.editStartDate;
        if (new Date(this.unloadStartValue) >= new Date(this.unloadEndValue)) {
            this.unloadEndValue = '';
        } else {
            this.unLoadStartSearchDisabled = true;
            this.appErrService.clearAlert();
        }
        this.invalidData = false;
        this.isAddDisabled = false;
    }

    // change edit date
    unLoadEndEditDate(event) {
        this.unloadEndValue = '';
        this.unloadEndValue = this.editEndDate;
        if (new Date(this.unloadEndValue) < new Date(this.unloadStartValue)) {
            this.appErrService.setAlert(this.appService.getErrorText('2660047'), true);
            this.invalidData = true;
        } else {
            this.invalidData = false;
            this.appErrService.clearAlert();
        }
    }

    // bs value change start date
    unLoadStartDateChange(value) {
        if (value) {
            this.invalidData = false;
            this.isAddDisabled = false;
            if (!this.startDateFlag) {
                this.startDateFlag = true;
                return;
            }
            if (this.appService.checkNullOrUndefined(value) || value === '') {
                this.startDateFlag = true;
                return;
            }
            this.appErrService.clearAlert();
            this.isClearDisabled = false;
            this.unLoadStartSearchDisabled = false;
            const convertedTime = this.currentTime(new Date());
            const convertDate = this.getDate(value);
            const datetimeConv = convertDate + ' ' + convertedTime;
            this.unloadStartValue = this.datepipe.transform(datetimeConv, 'yyyy-MM-dd h:mm:ss a');
            this.unloadEndMinDate = new Date(this.unloadStartValue);
            this.unloadEndMinDate.setDate(+this.datepipe.transform(this.unloadStartValue, 'dd'));
            if (new Date(this.unloadStartValue) >= new Date(this.unloadEndValue)) {
                this.unloadEndValue = '';
                this.unLoadEndSearchDisabled = true;
            } else {
                this.appErrService.clearAlert();
            }
            this.startDateFlag = true;
        }
    }


    // bs value change end date
    unLoadEndDateChange(value) {
        if (value) {
            this.invalidData = false;
            this.isAddDisabled = false;
            if (!this.endDateFlag) {
                this.endDateFlag = true;
                return;
            }
            if (this.appService.checkNullOrUndefined(value) || value === '') {
                this.endDateFlag = true;
                return;
            }
            this.appErrService.clearAlert();
            if (!this.appService.checkNullOrUndefined(value) && value !== '') {
                this.isClearDisabled = false;
                this.unLoadEndSearchDisabled = false;
                const convertedTime = this.currentTime(new Date());
                const convertDate = this.getDate(value);
                const datetimeConv = convertDate + ' ' + convertedTime;
                this.unloadEndValue = this.datepipe.transform(datetimeConv, 'yyyy-MM-dd h:mm:ss a');
                this.isClearDisabled = false;
                if (new Date(this.unloadEndValue) < new Date(this.unloadStartValue)) {
                    this.appErrService.setAlert(this.appService.getErrorText('2660047'), true);
                    this.invalidData = true;
                } else {
                    this.invalidData = false;
                }
            }
        }
    }

    // get date from selected date
    getDate(newDate: Date): string {
        const date = new Date(newDate);
        return this.datepipe.transform(date, 'yyyy-MM-dd');
    }

    // get system time
    currentTime(datetime: Date): string {
        const date = new Date(datetime);
        return this.datepipe.transform(date, 'h:mm:ss a');
    }

    // checking selected date with current date and need to check unloadstat and unloadEnd value available or not
    checkDateValues() {
        const currentDayDate = new Date().setHours(0, 0, 0, 0);
        if ((this.appService.checkNullOrUndefined(this.unloadStartValue) || this.unloadStartValue === '')
            && (this.appService.checkNullOrUndefined(this.unloadEndValue) || this.unloadEndValue === '')) {
            return true;
        }
        if (this.unloadStartValue) {
            const selectedDate = new Date(this.unloadStartValue).setHours(0, 0, 0, 0);
            return currentDayDate <= selectedDate;
        } else if ((this.appService.checkNullOrUndefined(this.unloadStartValue) || this.unloadStartValue === '') && this.unloadEndValue) {
            const selectedDate = new Date(this.unloadEndValue).setHours(0, 0, 0, 0);
            return currentDayDate <= selectedDate;
        }
    }


    // edit Dock Details Row
    editDockDetailRow(event: DockRcvData) {
        this.minDate = new Date();
        // this.isMultiCartonMode = true;
        this.trackingPrintDisabled = true;
        this.isTrackingNumDisabled = true;
        this.trackingPrint = false;
        if (!this.appService.checkNullOrUndefined(event.DockType) && event.DockType !== '') {
            this.selectedDockType = [{ Id: event.DockType, Text: event.DockType }];
        } else {
            this.selectedDockType = [];
        }
        this.dockRcvData = Object.assign(this.dockInfo, event);
        this.editModeRecord = { ...this.dockRcvData };
        this.getDockDetails();
    }

    // disable/enable  dock controls
    disablingDock(dataFlag) {
        this.isCarrierDisabled = dataFlag;
        this.isShipmentTypeDisabled = dataFlag;
        this.isShippmentDisabled = dataFlag;
        this.isDockTypeDisabled = dataFlag;
        this.isDockValueDisabled = dataFlag;
        this.isDocTrailerDisabled = dataFlag;
        this.unLoadStartDisabled = dataFlag;
        this.unLoadEndDisabled = dataFlag;
        this.isDockLoadDisabled = dataFlag;
        this.trailerNumSearchIconBtnDisabled = dataFlag;
        this.shippementSearchIconBtnDisabled = dataFlag;
        this.trackingSearchDisabled = dataFlag;
    }



    isPrint() {
        this.trackingPrint = !this.trackingPrint;
    }


    ngOnDestroy() {
        this.masterPageService.showUtilityIcon = false;
        this.emitHideSpinner.unsubscribe();
        this.controlConfig = null;
        this.masterPageService.defaultProperties();
    }
}
