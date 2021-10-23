import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { RmtextboxComponent } from './../../../frmctl/rmtextbox/rmtextbox.component';
import { AppErrorService } from './../../../../utilities/rlcutl/app-error.service';
import { ApiConfigService } from './../../../../utilities/rlcutl/api-config.service';
import { ApiService } from './../../../../utilities/rlcutl/api.service';
import { String } from 'typescript-string-operations';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { ClientData } from '../../../../models/common/ClientData';
import { AppService } from '../../../../utilities/rlcutl/app.service';
import { MasterPageService } from '../../../../utilities/rlcutl/master-page.service';
import { UiData } from '../../../../models/common/UiData';
import { TraceTypes } from '../../../../enums/traceType.enum';
import { CommonService } from '../../../../services/common.service';
import { FindTraceHoldComponent } from '../../../../framework/busctl/find-trace-hold/find-trace-hold.component';
import { StorageData } from '../../../../enums/storage.enum';
import { StatusCodes } from '../../../../enums/status.enum';
import { Container } from './../../../../models/common/Container';
import { ListofTransactions } from '../../../../models/common/ListofTransactions';
import { AudioType } from './../../../../enums/audioType.enum';
import { InvMove } from '../../../../models/common/InvMove';
import { CommonEnum } from '../../../../enums/common.enum';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'inventory-move',
    templateUrl: './inventory-move.component.html',
    styleUrls: ['./inventory-move.component.css']
})
export class InventoryMoveComponent implements OnInit, OnDestroy {


    @Input() clientData = new ClientData();
    @Input() uiData = new UiData();
    controlConfig: any;
    //Form
    inventoryMoveForm: FormGroup;
    invMoveObject = new InvMove();

    //properties
    containerId = '';
    locationId = '';
    currentLocationId = '';
    reasonCode = [];
    invAccount = '';
    isContainerDisabled = false;
    isLocationDisabled = true;
    isReasonCodeDisabled = true;
    isClearDisabled = true;
    isMoveDisabled = true;

    locationObj: any = {};
    reasonCodeObj: any = {};
    reasonCodeList = [];
    reasonCodeOptions = [];

    // multi-select dropdown settings
    dropdownSettings = {};
    listofTransactions: ListofTransactions;
    validatedContainerResponse = new Container();

    //trace props
    validMoveContainerResponse: any;
    traceTypes = TraceTypes;


    //alert
    text: string;
    showAlert = false;
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
        this.controlConfig = JSON.parse(localStorage.getItem(StorageData.controlConfig));
        this.dropdownSettings = {
            singleSelection: true,
            idField: 'Id',
            textField: 'Text',
            itemsShowLimit: 3,
            closeDropDownOnSelection: true
        };
        this.buildForm();
        this.containerFocus();
        this.clearAlert();
        this.masterPageService.showtogglePageWise = false;
        this.invMoveObject.IsInvMove = true;
    }


    ngOnDestroy() {
        this.clearAlert();
        this.masterPageService.showtogglePageWise = true;
        if (this.dialogRef) {
            this.dialogRef.close();
        }
        this.masterPageService.hideModal();
    }

    buildForm() {
        return this.inventoryMoveForm = this.form.group({
            containerId: [],
            locationId: [],
            reasonCodes: []
        });
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
                            this.appErrService.alertSound(AudioType.error);
                            this.text = result.ErrorMessage.ErrorDetails;
                            this.snackbar.error(this.text);
                        }
                    });
                } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
                    inputcontrol.applyRequired(true);
                    inputcontrol.applySelect();
                    this.spinner.hide();
                    this.showAlert = true;
                    this.appErrService.alertSound(AudioType.error);
                    this.text = res.ErrorMessage.ErrorDetails;
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
        this.invAccount = this.validatedContainerResponse.InvAccount;
        this.isContainerDisabled = true;
        this.isLocationDisabled = false;
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
                    this.appErrService.alertSound(AudioType.error);
                    this.text = returnedData.StatusMessage;
                    this.snackbar.error(this.text);
                }
            }
            });
        }
    }

    //Location Validation
    validateContainerLocation(inputcontrol: RmtextboxComponent, locationId) {
        this.clearAlert();
        this.spinner.show();
        const requestObj = { ClientData: this.clientData, UIData: this.uiData, Container: this.validatedContainerResponse, MoveType: this.invMoveObject };
        const url = String.Join('/', this.apiConfigService.validateContainerLocationUrl, locationId);
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                const res = response.body;
                if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
                    this.isLocationDisabled = true;
                    this.isReasonCodeDisabled = false;
                    if (!this.appService.checkNullOrUndefined(res.Response.Location)) {
                        this.locationObj = res.Response.Location;
                        this.getTranscationsForContainer();
                    }
                } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
                    this.spinner.hide();
                    inputcontrol.applyRequired(true);
                    inputcontrol.applySelect();
                    this.showAlert = true;
                    this.appErrService.alertSound(AudioType.error);
                    this.text = res.ErrorMessage.ErrorDetails;
                    this.snackbar.error(this.text);
                }
            }, erro => {
                this.appErrService.handleAppError(erro, false);
                this.showAlert = true;
                this.text = this.appErrService.emiterrorvalue;
            });
    }

    //getTranscationsForContainer
    getTranscationsForContainer() {
        const requestObj = { ClientData: this.clientData, UIData: this.uiData, Container: this.validatedContainerResponse, MoveType: this.invMoveObject };
        this.apiService.apiPostRequest(this.apiConfigService.getTranscationsForContainerUrl, requestObj)
            .subscribe(response => {
                const res = response.body;
                if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
                    if (!this.appService.checkNullOrUndefined(res.Response)) {
                        this.listofTransactions = new ListofTransactions();
                        this.listofTransactions = res.Response;
                        this.appErrService.alertSound(AudioType.success);
                        this.getReasonCodes();
                        this.reasonCodeFocus();
                    }
                } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
                    this.spinner.hide();
                    this.showAlert = true;
                    this.appErrService.alertSound(AudioType.error);
                    this.text = res.ErrorMessage.ErrorDetails;
                    this.snackbar.error(this.text);
                }
            }, erro => {
                this.appErrService.handleAppError(erro);
            });
    }
    //getReasonCodes
    getReasonCodes() {
        this.reasonCodeList = [];
        this.reasonCodeObj = {};
        const requestObj = { ClientData: this.clientData, UIData: this.uiData, Location: this.locationObj, MoveType: this.invMoveObject };
        this.apiService.apiPostRequest(this.apiConfigService.getReasonCodesUrl, requestObj)
            .subscribe(response => {
                const res = response.body;
                this.spinner.hide();
                if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
                    if (!this.appService.checkNullOrUndefined(res.Response.ReasonCodes)) {
                            if ((res.Response.ReasonCodes).length) {
                                this.reasonCodeList = res.Response.ReasonCodes;
                                this.getreasonCodeOptions(this.reasonCodeList);
                                const obj = this.reasonCodeList.find(r => r.Deafult_YN === CommonEnum.yes);
                                if (obj) {
                                    this.reasonCodeObj = obj;
                                    this.reasonCode = [String.Join(' - ', obj.ReasonCd, obj.Description)];
                                    this.isMoveDisabled = false;
                                }
                            }
                    }
                } 
                else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.noResult) {
                    this.isMoveDisabled = false;
                    this.isReasonCodeDisabled = true;
                    this.moveFocus(); 
                    this.snackbar.info(res.StatusMessage);
                }
                else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
                    this.showAlert = true;
                    this.appErrService.alertSound(AudioType.error);
                    this.text = res.ErrorMessage.ErrorDetails;
                    this.snackbar.error(this.text);
                }
            }, erro => {
                this.appErrService.handleAppError(erro);
            });
    }


    //Moving container from one location another location
    moveContainer() {
        this.isMoveDisabled = true;
        this.clearAlert();
        this.spinner.show();
        const url = String.Join('/', this.apiConfigService.moveContainerUrl, 'true');
        const requestObj = { ClientData: this.clientData, Container: this.validatedContainerResponse, Location: this.locationObj, UIData: this.uiData, ReasonCode: this.reasonCodeObj, MoveType: this.invMoveObject };
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
                    this.saveServiceTransaction();
                    this.snackbar.success(res.StatusMessage);
                    this.Clear();
                } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
                    this.isMoveDisabled = false;
                    this.showAlert = true;
                    this.appErrService.alertSound(AudioType.error);
                    this.text = res.ErrorMessage.ErrorDetails;
                    this.snackbar.error(this.text);
                }
            }, erro => {
                this.appErrService.handleAppError(erro, false);
                this.showAlert = true;
                this.text = this.appErrService.emiterrorvalue;
            });

    }

    //saveServiceTransaction
    saveServiceTransaction() {
        const requestObj = { ClientData: this.clientData, UIData: this.uiData, Container: this.validatedContainerResponse, Transactions: this.listofTransactions, MoveType: this.invMoveObject };
        this.apiService.apiPostRequest(this.apiConfigService.saveServiceTransactionUrl, requestObj)
            .subscribe(response => {
                const res = response.body;
                if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
                    this.spinner.hide();
                    this.showAlert = true;
                    this.appErrService.alertSound(AudioType.error);
                    this.text = res.ErrorMessage.ErrorDetails;
                    this.snackbar.error(this.text);
                }
            }, erro => {
                this.appErrService.handleAppError(erro);
            });
    }

    getreasonCodeOptions(data) {
        this.reasonCodeOptions = [];
        data.forEach(element => {
            this.reasonCodeOptions.push(String.Join(' - ', element.ReasonCd, element.Description));
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

    //reasonCodeFocus
    reasonCodeFocus() {
        this.appService.setFocus('reasonCode');
    }

    //move button foucs
    moveFocus() {
        this.appService.setFocus('moveContainer');
    }

    //changeContainer
    changeContainer(inputControl: RmtextboxComponent) {
        this.isClearDisabled = false;
        this.clearAlert();
        if (inputControl) {
            inputControl.applyRequired(false);
        }
    }

    //changeLocation
    changeLocation(inputControl: RmtextboxComponent) {
        this.reasonCode = [];
        this.changeContainer(inputControl);
    }
    //changeReasonCode
    changeReasonCode(val) {
        this.reasonCodeObj = this.reasonCodeList.find(r => (String.Join(' - ', r.ReasonCd, r.Description)) === val);
        if (this.reasonCodeObj) {
            this.isMoveDisabled = false;
            this.appErrService.alertSound(AudioType.success);
            this.moveFocus();
        }
        this.clearAlert();
    }
    reasonCodeDeselect() {
        this.reasonCodeObj = {};
        this.isMoveDisabled = true;
    }
    //clear
    Clear() {
        this.currentLocationId = '';
        this.invAccount = '';
        this.containerId = '';
        this.locationId = '';
        this.reasonCode = [];
        this.isContainerDisabled = false;
        this.isLocationDisabled = true;
        this.isClearDisabled = true;
        this.isMoveDisabled = true;
        this.isReasonCodeDisabled = true;
        this.validatedContainerResponse = null;
        this.locationObj = {};
        this.reasonCodeObj = {};
        this.reasonCodeList = [];
        this.reasonCodeOptions = [];
        this.listofTransactions = new ListofTransactions();
        this.clearAlert();
        this.containerFocus();
    }

    //clearAlert
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
