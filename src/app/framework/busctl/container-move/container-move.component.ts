import { Container } from './../../../models/common/Container';
import { Component, OnInit, OnDestroy, Input, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { RmtextboxComponent } from './../../frmctl/rmtextbox/rmtextbox.component';
import { AppErrorService } from './../../../utilities/rlcutl/app-error.service';
import { AppService } from './../../../utilities/rlcutl/app.service';
import { ApiConfigService } from './../../../utilities/rlcutl/api-config.service';
import { ApiService } from './../../../utilities/rlcutl/api.service';
import { String } from 'typescript-string-operations';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { ClientData } from '../../../models/common/ClientData';
import { MasterPageService } from '../../../utilities/rlcutl/master-page.service';
import { UiData } from '../../../models/common/UiData';
import { TraceTypes } from '../../../enums/traceType.enum';
import { CommonService } from '../../../services/common.service';
import { FindTraceHoldComponent } from '../../../framework/busctl/find-trace-hold/find-trace-hold.component';
import { StorageData } from '../../../enums/storage.enum';
import { StatusCodes } from '../../../enums/status.enum';
import { AudioType } from './../../../enums/audioType.enum';
import { CommonEnum } from '../../../enums/common.enum';
import { InvMove } from '../../../models/common/InvMove';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'container-move',
    templateUrl: './container-move.component.html',
    styleUrls: ['./container-move.component.css']
})
export class ContainerMoveComponent implements OnInit, OnDestroy {

    @ViewChild('inputLocation') inputLocation: ElementRef;
    @ViewChild('inputParentContainer') inputParentContainer: ElementRef;

    //Form
    containerMoveForm: FormGroup;
    text: string;
    showAlert = false;
    containerId = '';
    locationId = '';
    currentLocationId = '';
    isContainerDisabled = false;
    isLocationDisabled = true;
    isParentContainerDisabled = true;
    isClearDisabled = true;
    isMoveDisabled = true;
    validatedContainerResponse = new Container();
    @Input() flag = true;
    @Input() tittle: string;
    clientData = new ClientData();
    uiData = new UiData();

    controlConfig: any;
    operationObj: any;

    validMoveContainerResponse: any;
    traceTypes = TraceTypes;
    parentContainerId = '';
    parentContainerObj = new Container();
    locationObj: any = {};

    // toggle prop
    toggleValue = CommonEnum.no;
    istoggleDisabled = true;
    commonEnum = CommonEnum;
    invMoveObject = new InvMove();
    dialogRef: any;

    constructor(private form: FormBuilder,
        private apiService: ApiService,
        private apiConfigService: ApiConfigService,
        public appErrService: AppErrorService,
        private spinner: NgxSpinnerService,
        private snackbar: XpoSnackBar,
        private appService: AppService,
        private masterPageService: MasterPageService,
        private commonService: CommonService,
        private dialog: MatDialog

    ) { }

    ngOnInit() {
        if (this.tittle) {
            this.operationObj = this.masterPageService.getOperationForPopUp(this.tittle);
        } else {
            this.operationObj = this.masterPageService.getRouteOperation();
            this.masterPageService.setTitle(this.operationObj.Title);
            // this.masterPageService.setModule(this.operationObj.Module);
        }
        if (this.operationObj) {
            this.uiData.OperationId = this.operationObj.OperationId;
            this.uiData.OperCategory = this.operationObj.Category;
        }
        this.controlConfig = JSON.parse(localStorage.getItem(StorageData.controlConfig));
        this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
        this.buildForm();
        this.showAlert = false;
        this.text = '';
        this.containerFocus();
        this.clearAlert();
        this.masterPageService.showtogglePageWise = false;
        if (!this.tittle) {
            this.getRoleCapabilities();
        }
    }

    ngOnDestroy() {
        this.appErrService.alertMsg = '';
        this.clearAlert();
        this.masterPageService.showtogglePageWise = true;
        if (this.dialogRef) {
            this.dialogRef.close();
        }
        this.masterPageService.hideDialog();
    }


    buildForm() {
        return this.containerMoveForm = this.form.group({
            containerId: [],
            locationId: [],
            parentContainerId: []
        });
    }

    getRoleCapabilities() {
        const requestObj = { ClientData: this.clientData, UIData: this.uiData };
        this.commonService.commonApiCall(this.apiConfigService.getRoleCapabilitiesUrl, requestObj, (res, statusFlag) => {
            this.spinner.hide();
            if (statusFlag && res.Response && res.Response.hasOwnProperty('canPerformInvMove')) {
                this.istoggleDisabled = res.Response.canPerformInvMove === CommonEnum.yes ? false : true;
            }
        });
    }


    onToggleChange(val) {
        this.appErrService.clearAlert();
        this.toggleValue = val ? CommonEnum.yes : CommonEnum.no;
        this.containerFocus();
        this.Clear();
    }


    //validate Container
    validateMoveContainer(inputcontrol: RmtextboxComponent, containerId) {
        this.clearAlert();
        this.spinner.show();
        const requestObj = { ClientData: this.clientData, UIData: this.uiData, MoveType: this.invMoveObject };
        const url = String.Join('/', this.apiConfigService.validateContainerLocationMoveUrl, containerId);
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                const res = response.body;
                this.spinner.hide();
                if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
                    this.validMoveContainerResponse = res;
                    const traceData = { traceType: this.traceTypes.containerID, traceValue: this.validMoveContainerResponse.Response.ContainerID, uiData: this.uiData };
                    const traceResult = this.commonService.findTraceHold(traceData, this.uiData);
                    traceResult.subscribe(result => {
                        if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
                            if (this.appService.checkNullOrUndefined(result.Response)) {
                                this.validMoveContainer();
                            } else {
                                this.canProceed(result, this.traceTypes.containerID);
                            }
                            this.spinner.hide();
                        } else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
                            this.spinner.hide();
                            this.showAlert = true;
                            this.text = result.ErrorMessage.ErrorDetails;
                            this.appErrService.alertSound(AudioType.error);
                            this.snackbar.error(this.text);
                        }
                    });
                } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
                    inputcontrol.applyRequired(true);
                    inputcontrol.applySelect();
                    this.spinner.hide();
                    this.showAlert = true;
                    this.text = res.ErrorMessage.ErrorDetails;
                    this.appErrService.alertSound(AudioType.error);
                    this.snackbar.error(this.text);
                }
            }, erro => {
                this.appErrService.handleAppError(erro, false);
                this.showAlert = true;
                this.text = this.appErrService.emiterrorvalue;
            });

    }

    validMoveContainer(res = this.validMoveContainerResponse) {
        this.validatedContainerResponse = res.Response;
        this.currentLocationId = this.validatedContainerResponse.Location;
        this.isContainerDisabled = true;
        this.isLocationDisabled = false;
        this.isParentContainerDisabled = false;
        this.appErrService.alertSound(AudioType.success);
        this.locationFocus();
        this.validMoveContainerResponse = null;
    }

    canProceed(traceResponse, type) {
        if (traceResponse.Response.canProceed === 'Y') {
            this.snackbar.info(traceResponse.StatusMessage);
        }
        if (!this.appService.checkNullOrUndefined(traceResponse.Response.TraceHold)) {
            const uiObj = { uiData: this.uiData };
            traceResponse = Object.assign(traceResponse, uiObj);
            this.dialogRef = this.dialog.open(FindTraceHoldComponent, { hasBackdrop: true, disableClose: true, panelClass: 'dialog-width-sm', data: { modalData: traceResponse } });
            this.dialogRef.afterClosed().subscribe((returnedData) => {
                if (returnedData) {
                    if (returnedData.Response.canProceed === 'Y') {
                        if (type === this.traceTypes.containerID) {
                            this.validMoveContainer();
                        }
                    } else if (returnedData.Response.canProceed === 'N') {
                        if (type === this.traceTypes.containerID) {
                            this.containerFocus();
                        }
                        this.showAlert = true;
                        this.text = returnedData.StatusMessage;
                        this.appErrService.alertSound(AudioType.error);
                        this.snackbar.error(this.text);
                    }
                }
            });
        }
    }

    validateContainer() {
        if (!this.isLocationDisabled) {
            this.validateContainerLocation(this.inputLocation, this.locationId);
        }
        if (!this.isParentContainerDisabled) {
            this.validateParentContainer(this.inputParentContainer, this.parentContainerId);
        }
    }

    //Location Validation
    validateContainerLocation(inputcontrol: any, locationId) {
        this.isMoveDisabled = true;
        this.clearAlert();
        this.spinner.show();
        const requestObj = { ClientData: this.clientData, UIData: this.uiData, Container: this.validatedContainerResponse, MoveType: this.invMoveObject };
        const url = String.Join('/', this.apiConfigService.validateContainerLocationUrl, locationId);
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                const res = response.body;
                if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
                    this.isLocationDisabled = true;
                    this.isParentContainerDisabled = true;
                    this.parentContainerId = '';
                    if (!this.appService.checkNullOrUndefined(res.Response.Location)) {
                        this.locationObj = res.Response.Location;
                    }
                    this.appErrService.alertSound(AudioType.success);
                    this.moveContainer();
                } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
                    this.isMoveDisabled = false;
                    this.spinner.hide();
                    inputcontrol.applyRequired(true);
                    inputcontrol.applySelect();
                    this.showAlert = true;
                    this.text = res.ErrorMessage.ErrorDetails;
                    this.appErrService.alertSound(AudioType.error);
                    this.snackbar.error(this.text);
                }
            }, erro => {
                this.appErrService.handleAppError(erro, false);
                this.showAlert = true;
                this.text = this.appErrService.emiterrorvalue;
            });
    }


    validateParentContainer(inputcontrol: any, containerId) {
        this.isMoveDisabled = true;
        this.clearAlert();
        this.spinner.show();
        const requestObj = { ClientData: this.clientData, UIData: this.uiData, Container: this.validatedContainerResponse, MoveType: this.invMoveObject };
        const url = String.Join('/', this.apiConfigService.validatemoveContainerUrl, this.parentContainerId);
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                const res = response.body;
                if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
                    if (!this.appService.checkNullOrUndefined(res.Response.ParentContainer)) {
                        this.parentContainerObj = new Container();
                        this.parentContainerObj = res.Response.ParentContainer;
                    }
                    this.isLocationDisabled = true;
                    this.isParentContainerDisabled = true;
                    this.locationId = '';
                    this.appErrService.alertSound(AudioType.success);
                    this.moveContainer();
                } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
                    this.isMoveDisabled = false;
                    this.spinner.hide();
                    inputcontrol.applyRequired(true);
                    inputcontrol.applySelect();
                    this.showAlert = true;
                    this.text = res.ErrorMessage.ErrorDetails;
                    this.appErrService.alertSound(AudioType.error);
                    this.snackbar.error(this.text);
                }
            }, erro => {
                this.appErrService.handleAppError(erro, false);
                this.showAlert = true;
                this.text = this.appErrService.emiterrorvalue;
            });
    }

    //Moving container from one location another location
    moveContainer() {
        this.clearAlert();
        this.spinner.show();
        let requestObj: any = {};
        const isLocation = this.locationId ? true : false;
        const url = String.Join('/', this.apiConfigService.moveContainerUrl, isLocation.toString());
        if (Object.keys(this.parentContainerObj).length) {
            requestObj = { ClientData: this.clientData, Container: this.validatedContainerResponse, ParentContainer: this.parentContainerObj, UIData: this.uiData, MoveType: this.invMoveObject };
        } else if (!this.appService.checkNullOrUndefined(this.locationObj)) {
            requestObj = { ClientData: this.clientData, Container: this.validatedContainerResponse, Location: this.locationObj, UIData: this.uiData, MoveType: this.invMoveObject };
        }
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                const res = response.body;
                this.spinner.hide();
                if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
                    const postUrl = String.Join('/', this.apiConfigService.postContainerUpdateProcess);
                    const reqObj = {
                        ClientData: this.clientData, Container: this.validatedContainerResponse,
                        UIData: this.uiData
                    };
                    this.commonService.postUpdateProcess(postUrl, reqObj);
                    this.snackbar.success(res.StatusMessage);
                    this.Clear();
                } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
                    this.showAlert = true;
                    this.text = res.ErrorMessage.ErrorDetails;
                    this.appErrService.alertSound(AudioType.error);
                    this.snackbar.error(this.text);
                }
            }, erro => {
                this.appErrService.handleAppError(erro, false);
                this.showAlert = true;
                this.text = this.appErrService.emiterrorvalue;
            });

    }

    //container focus
    containerFocus() {
        this.appService.setFocus('containerId');
    }

    //container focus
    locationFocus() {
        this.appService.setFocus('locationId');
    }

    //move button foucs
    moveFocus() {
        this.appService.setFocus('moveContainer');
    }
    changeInput(inputControl: RmtextboxComponent) {
        inputControl.applyRequired(false);
        this.isClearDisabled = false;
        this.showAlert = false;
        this.text = '';
        this.appErrService.clearAlert();
    }

    changeLocation(inputControl: RmtextboxComponent) {
        this.isMoveDisabled = false;
        this.isParentContainerDisabled = true;
        this.parentContainerId = '';
        this.changeInput(inputControl);
    }
    changeParentContainer(inputControl: RmtextboxComponent) {
        this.isMoveDisabled = false;
        this.isLocationDisabled = true;
        this.locationId = '';
        this.changeInput(inputControl);
    }

    //location field value empty
    locationEmptyValue() {
        this.isMoveDisabled = true;
        if (this.locationId === '') {
            this.isParentContainerDisabled = false;
            this.parentContainerId = '';
        }

    }
    //parent container field value empty
    parentContainerEmptyValue() {
        this.isMoveDisabled = true;
        if (this.parentContainerId === '') {
            this.isLocationDisabled = false;
            this.locationId = '';
        }
    }

    Clear() {
        this.currentLocationId = '';
        this.isContainerDisabled = false;
        this.containerFocus();
        this.containerId = '';
        this.locationId = '';
        this.parentContainerId = '';
        this.isLocationDisabled = true;
        this.isClearDisabled = true;
        this.isMoveDisabled = true;
        this.isParentContainerDisabled = true;
        this.parentContainerObj = new Container();
        this.locationObj = {};
        this.clearAlert();
        this.validatedContainerResponse = null;
        this.appErrService.clearAlert();
    }
    clearAlert() {
        this.showAlert = false;
        this.text = '';
        this.appErrService.specialCharErrMsg = '';
        this.appErrService.clearAlert();
    }

    //clearEmit
    clearEmit(value) {
        this.isClearDisabled = value;
    }
}
