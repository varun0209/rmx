import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ApiService } from '../../utilities/rlcutl/api.service';
import { ApiConfigService } from '../../utilities/rlcutl/api-config.service';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { AppService } from '../../utilities/rlcutl/app.service';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';
import { ClientData } from '../../models/common/ClientData';
import { UiData } from '../../models/common/UiData';
import { RmtextboxComponent } from '../../framework/frmctl/rmtextbox/rmtextbox.component';
import { String } from 'typescript-string-operations';
import { Container } from '../../models/common/Container';
import { TrackingNumber } from '../../models/utility/TrackingNumber';
import { TraceTypes } from '../../enums/traceType.enum';
import { CommonService } from '../../services/common.service';
import { FindTraceHoldComponent } from '../../framework/busctl/find-trace-hold/find-trace-hold.component';
import { MessageType } from '../../enums/message.enum';
import { StorageData } from '../../enums/storage.enum';
import { StatusCodes } from '../../enums/status.enum';
import { checkNullorUndefined } from '../../enums/nullorundefined';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-trackingnumber-move',
    templateUrl: './trackingnumber-move.component.html',
    styleUrls: ['./trackingnumber-move.component.css']
})
export class TrackingnumberMoveComponent implements OnInit {


    clientData = new ClientData();
    uiData = new UiData();

    controlConfig: any;
    operationObj: any;

    text: string;
    showAlert = false;


    isClearDisabled = true;


    trackingObj: TrackingNumber = new TrackingNumber();
    container: Container = new Container();
    isTrackingNumberDisabled = false;
    isContainerDisabled = true;
    isMoveDisabled = true;

    traceTypes = TraceTypes;
    validMoveTrackingNumberResponse: any;
    storageData = StorageData;
    statusCode = StatusCodes;
    dialogRef: any;
    constructor(
        private apiService: ApiService,
        private apiConfigService: ApiConfigService,
        public appErrService: AppErrorService,
        private spinner: NgxSpinnerService,
        private snackbar: XpoSnackBar,
        private appService: AppService,
        private masterPageService: MasterPageService,
        private commonService: CommonService,
        private dialog: MatDialog) { }



    ngOnInit() {
        this.operationObj = this.masterPageService.getRouteOperation();
        if (this.operationObj) {
            this.uiData.OperationId = this.operationObj.OperationId;
            this.uiData.OperCategory = this.operationObj.Category;
            this.masterPageService.setTitle(this.operationObj.Title);
            this.masterPageService.setModule(this.operationObj.Module);
            this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
            this.controlConfig = JSON.parse(localStorage.getItem(this.storageData.controlConfig));
            this.masterPageService.showtogglePageWise = false;
            this.trackingNumberFocus();
        }
    }

    //validateMoveTrackingNumber
    validateMoveTrackingNumber(inputcontrol: RmtextboxComponent, trackingNumber) {
        this.spinner.show();
        this.clearAlert();
        let requestObj = { ClientData: this.clientData, UIData: this.uiData };
        const url = String.Join("/", this.apiConfigService.validateMoveTrackingNumberUrl, trackingNumber)
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                let res = response.body;
                this.spinner.hide();
                if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                    this.validMoveTrackingNumberResponse = response.body;
                    let traceData = { traceType: this.traceTypes.trackingNumber, traceValue: trackingNumber, uiData: this.uiData }
                    let traceResult = this.commonService.findTraceHold(traceData, this.uiData);
                    traceResult.subscribe(result => {
                        if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) {
                            if (checkNullorUndefined(result.Response)) {
                                this.validateMoveTrackingNumberSuccess();
                            } else {
                                this.canProceed(result, this.traceTypes.trackingNumber);
                            }
                            this.spinner.hide();
                        } else if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) {
                            this.spinner.hide();
                            this.showAlert = true;
                            this.text = result.ErrorMessage.ErrorDetails;
                            this.snackbar.error(this.text);
                        }
                    });
                }
                else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                    this.spinner.hide();
                    inputcontrol.applyRequired(true);
                    inputcontrol.applySelect();
                    this.showAlert = true;
                    this.text = res.ErrorMessage.ErrorDetails;
                    this.snackbar.error(this.text);
                }
            }, erro => {
                this.appErrService.handleAppError(erro, false);
                this.showAlert = true;
                this.text = this.appErrService.emiterrorvalue;
            });
    }


    private validateMoveTrackingNumberSuccess(result= this.validMoveTrackingNumberResponse) {
        this.trackingObj = result.Response;
        this.isTrackingNumberDisabled = true;
        this.isContainerDisabled = false;
        this.containerFocus();
        this.validMoveTrackingNumberResponse = null;
    }

    canProceed(traceResponse, type) {
        if (traceResponse.Response.canProceed == 'Y') {
            this.snackbar.info(traceResponse.StatusMessage);
        }
        if (!checkNullorUndefined(traceResponse.Response.TraceHold)) {
            let uiObj = { uiData: this.uiData }
            traceResponse = Object.assign(traceResponse, uiObj);
            this.dialogRef = this.dialog.open(FindTraceHoldComponent, { hasBackdrop: true, disableClose: true, panelClass: 'dialog-width-sm', data: { modalData: traceResponse } });
            this.dialogRef.afterClosed().subscribe((returnedData) => {
                if (returnedData) {
                    if (returnedData.Response.canProceed == 'Y') {
                        if (type == this.traceTypes.trackingNumber) {
                            this.validateMoveTrackingNumberSuccess();
                        }
                    } else if (returnedData.Response.canProceed == 'N') {
                        if (type == this.traceTypes.trackingNumber) {
                            this.trackingNumberFocus();
                        }
                        this.showAlert = true;
                        this.text = returnedData.StatusMessage;
                        this.snackbar.error(this.text);
                    }
                }
            });
        }
    }


    //validate Container
    validateMoveContainer(inputcontrol: RmtextboxComponent, containerId) {
        this.spinner.show();
        this.clearAlert();
        let requestObj = { ClientData: this.clientData, UIData: this.uiData, TrackingNumber: this.trackingObj };
        const url = String.Join("/", this.apiConfigService.validateToContainerUrl, containerId);
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                let res = response.body;
                this.spinner.hide();
                if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                    this.trackingObj = res.Response.TrackingNumber;
                    this.container = res.Response.Container;
                    this.isContainerDisabled = true;
                    this.isMoveDisabled = false;
                    this.moveContainerFocus();
                }
                else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                    inputcontrol.applyRequired(true);
                    inputcontrol.applySelect();
                    this.spinner.hide();
                    this.showAlert = true;
                    this.text = res.ErrorMessage.ErrorDetails;
                    this.snackbar.error(this.text);
                }
            }, erro => {
                this.appErrService.handleAppError(erro, false);
                this.showAlert = true;
                this.text = this.appErrService.emiterrorvalue;
            });
    }

    //Moving container
    moveContainer() {
        this.isMoveDisabled = true;
        this.spinner.show();
        this.clearAlert();
        const url = String.Join("/", this.apiConfigService.moveTrackingNumberUrl);
        let requestObj = { ClientData: this.clientData, UIData: this.uiData, TrackingNumber: this.trackingObj, Container: this.container };
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                let res = response.body;
                this.spinner.hide();
               if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                    this.snackbar.success(res.StatusMessage);
                    this.Clear();
                }
                else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                    this.isMoveDisabled = false;
                    this.showAlert = true;
                    this.text = res.ErrorMessage.ErrorDetails;
                    this.snackbar.error(this.text);
                }
            }, erro => {
                this.appErrService.handleAppError(erro, false);
                this.showAlert = true;
                this.text = this.appErrService.emiterrorvalue;
            });

    }




    changeInput(inputControl: RmtextboxComponent) {
        inputControl.applyRequired(false);
        this.isClearDisabled = false;
        this.clearAlert();
    }


    trackingNumberFocus() {
        this.appService.setFocus('trackingNumber');
    }

    containerFocus() {
        this.appService.setFocus('containerId');
    }

    moveContainerFocus() {
        this.appService.setFocus('moveContainer');
    }

    Clear() {
        this.isTrackingNumberDisabled = false;
        this.isContainerDisabled = true;
        this.isMoveDisabled = true;
        this.isClearDisabled = true;
        this.clearAlert();
        this.trackingNumberFocus();
        this.container = new Container();
        this.trackingObj = new TrackingNumber();;
    }


    clearAlert() {
        this.showAlert = false;
        this.text = "";
    }

    ngOnDestroy() {
        if (this.masterPageService.moduleName) {
            this.masterPageService.moduleName.next(null);
        }
        this.masterPageService.clearModule();
        this.masterPageService.showtogglePageWise = true;
    }

}
