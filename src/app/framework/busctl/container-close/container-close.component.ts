import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, TemplateRef, OnDestroy, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MasterPageService } from './../../../utilities/rlcutl/master-page.service';
import { RmtextboxComponent } from './../../frmctl/rmtextbox/rmtextbox.component';
import { AppErrorService } from './../../../utilities/rlcutl/app-error.service';
import { AppService } from './../../../utilities/rlcutl/app.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { String, StringBuilder } from 'typescript-string-operations';
import { ApiConfigService } from './../../../utilities/rlcutl/api-config.service';
import { ApiService } from './../../../utilities/rlcutl/api.service';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { Container } from './../../../models/common/Container';
import { ClientData } from '../../../models/common/ClientData';
import { UiData } from '../../../models/common/UiData';
import { TraceTypes } from '../../../enums/traceType.enum';
import { CommonService } from '../../../services/common.service';
import { FindTraceHoldComponent } from '../../../framework/busctl/find-trace-hold/find-trace-hold.component';
import { StorageData } from '../../../enums/storage.enum';
import { StatusCodes } from '../../../enums/status.enum';
import { AudioType } from './../../../enums/audioType.enum';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'container-close',
    templateUrl: './container-close.component.html',
    styleUrls: ['./container-close.component.css']
})
export class ContainerCloseComponent implements OnInit, OnDestroy {

    @ViewChild('inputContainer') inputContainer: ElementRef;

    containerID = '';
    category: string;
    quantity: number;
    closeContainerForm: FormGroup;
    container = new Container();
    isContainerDisabled = false;
    isClearDisabled = true;
    isCloseDisabled = true;
    showCategory = false;
    showQuantity = false;
    text: string;
    showAlert = false;
    @Input() flag = true;
    @Input() tittle: string;
    clientData = new ClientData();
    uiData = new UiData();

    operationObj: any;
    traceTypes = TraceTypes;
    dialogRef: any;
    validCloseContainerResponse: any;
    isInboundContainer = false;
    constructor(
        private apiService: ApiService,
        private apiConfigService: ApiConfigService,
        private spinner: NgxSpinnerService,
        private snackbar: XpoSnackBar,
        public appErrService: AppErrorService,
        private appService: AppService,
        private masterPageService: MasterPageService,
        private form: FormBuilder,
        private commonService: CommonService,
        private dialog: MatDialog
    ) { }

    //SerialNum
    ngOnInit() {
        if (this.tittle) {
            this.operationObj = this.masterPageService.getOperationForPopUp(this.tittle);
        } else {
            this.operationObj = this.masterPageService.getRouteOperation();
            this.masterPageService.setTitle(this.operationObj.Title);
        }
        this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
        if (this.operationObj) {
            this.uiData.OperationId = this.operationObj.OperationId;
            this.uiData.OperCategory = this.operationObj.Category;
        }
        this.buildForm();
        this.containerFocus();
        this.clearAlert();
        this.masterPageService.showtogglePageWise = false;
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
        return this.closeContainerForm = this.form.group({
            containerId: []
        });
    }

    Clear() {
        this.clearAlert();
        this.appErrService.clearAlert();
        this.containerID = '';
        this.category = '';
        this.quantity = null;
        this.showCategory = false;
        this.showQuantity = false;
        this.isCloseDisabled = true;
        this.isContainerDisabled = false;
        this.isClearDisabled = true;
        this.isInboundContainer = false;
        this.containerFocus();
        this.clearAlert();
    }

    containerFocus() {
        setTimeout(() => {
            const inputContainer = <HTMLInputElement>document.getElementById('containerID');
            if (!this.appService.checkNullOrUndefined(inputContainer)) {
                inputContainer.focus();
            }
        }, 0);
    }

    containerCloseConfirmFocus() {
        setTimeout(() => {
            const inputContainer = <HTMLInputElement>document.getElementById('confirmClose');
            if (!this.appService.checkNullOrUndefined(inputContainer)) {
                inputContainer.focus();
            }
        }, 0);
    }


    closeFocus() {
        setTimeout(() => {
            const inputClose = <HTMLInputElement>document.getElementById('close');
            if (!this.appService.checkNullOrUndefined(inputClose)) {
                inputClose.focus();
            }
        }, 0);
    }

    isAttributeIDInputValueEmpty() {
        this.appErrService.clearAlert();
        this.isCloseDisabled = true;
    }

    //change input box
    changeInput(inputControl: RmtextboxComponent) {
        this.isCloseDisabled = false;
        this.isClearDisabled = false;
        inputControl.applyRequired(false);
        this.appErrService.clearAlert();
        this.clearAlert();
    }

    onControllerChange(inputControl) {
        inputControl.applyRequired(false);
        this.appErrService.clearAlert();
        this.clearAlert();
    }


    validateCloseContainer(inputcontrol: RmtextboxComponent, containerId) {
        this.isCloseDisabled = true;
        this.spinner.show();
        this.appErrService.clearAlert();
        this.clearAlert();
        const requestObj = { ClientData: this.clientData, UIData: this.uiData };
        const url = String.Join('/', this.apiConfigService.validateCloseContainerUrl, containerId);
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                const res = response.body;
                this.spinner.hide();
                if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
                    this.validCloseContainerResponse = res;
                    const traceData = { traceType: this.traceTypes.containerID, traceValue: this.validCloseContainerResponse.Response.ContainerID, uiData: this.uiData };
                    const traceResult = this.commonService.findTraceHold(traceData, this.uiData);
                    traceResult.subscribe(result => {
                        if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
                            if (this.appService.checkNullOrUndefined(result.Response)) {
                                this.validCloseContainer();
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
                    this.isCloseDisabled = false;
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
                this.appErrService.alertSound(AudioType.error);
                this.text = this.appErrService.emiterrorvalue;
            });
    }

    canProceed(traceResponse, type) {
        if (traceResponse.Response.canProceed === 'Y') {
            this.snackbar.info(traceResponse.StatusMessage);
        }
        if (!this.appService.checkNullOrUndefined(traceResponse.Response.TraceHold)) {
            const uiObj = { uiData: this.uiData };
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
                if (returnedData.Response.canProceed === 'Y') {
                    if (type === this.traceTypes.containerID) {
                        this.validCloseContainer();
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

    validCloseContainer(res = this.validCloseContainerResponse) {
        this.container = res.Response;
        this.showCategory = true;
        this.showQuantity = true;
        this.category = this.container.CategoryName;
        this.quantity = this.container.Quantity;
        this.isContainerDisabled = true;
        this.appErrService.alertSound(AudioType.success);
        this.closeFocus();
        this.isInboundContainer = res.Response['IsInboundContainer'] ? true : false;
        this.isCloseDisabled = false;
        if (!this.isInboundContainer) {
            this.closeContainer(this.inputContainer);
        } else {
            this.containerCloseConfirmFocus();
        }
        this.validCloseContainerResponse = null;
    }

    closeContainer(inputcontrol: any) {
        this.isCloseDisabled = true;
        this.spinner.show();
        const requestObj = { ClientData: this.clientData, Container: this.container, UIData: this.uiData };
        const url = String.Join('/', this.apiConfigService.closeContainerUrl);
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                const res = response.body;
                this.spinner.hide();
                if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
                    this.snackbar.success(res.StatusMessage);
                    this.Clear();
                    this.masterPageService.hideDialog();
                    this.isClearDisabled = true;
                } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
                    this.isCloseDisabled = false;
                    inputcontrol.applyRequired(true);
                    inputcontrol.applySelect();
                    this.spinner.hide();
                    this.showAlert = true;
                    this.appErrService.alertSound(AudioType.error);
                    this.text = res.ErrorMessage.ErrorDetails;
                }
            }, erro => {
                this.appErrService.handleAppError(erro, false);
                this.showAlert = true;
                this.text = this.appErrService.emiterrorvalue;
            });
    }
    clearAlert() {
        this.showAlert = false;
        this.text = '';
        this.appErrService.specialCharErrMsg = '';
    }

    //clearEmit
    clearEmit(value) {
        this.isClearDisabled = value;
    }

}
