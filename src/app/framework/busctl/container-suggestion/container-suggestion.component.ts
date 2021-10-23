import { Component, OnInit, ViewChild, Output, EventEmitter, AfterViewInit, Input, OnDestroy, ElementRef } from '@angular/core';
import { AppErrorService } from './../../../utilities/rlcutl/app-error.service';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiConfigService } from './../../../utilities/rlcutl/api-config.service';
import { ApiService } from './../../../utilities/rlcutl/api.service';
import { Container } from '../../../models/common/Container';
import { MasterPageService } from './../../../utilities/rlcutl/master-page.service';
import { Message } from '../../../models/common/Message';
import { String } from 'typescript-string-operations';
import { AppService } from '../../../utilities/rlcutl/app.service';
import { MessagingService } from '../../../utilities/rlcutl/messaging.service';
import { MessageType } from '../../../enums/message.enum';
import { ClientData } from '../../../models/common/ClientData';
import { UiData } from '../../../models/common/UiData';
import { StorageData } from '../../../enums/storage.enum';
import { StatusCodes } from '../../../enums/status.enum';
import { CommonEnum } from '../../../enums/common.enum';
import { checkNullorUndefined } from '../../../enums/nullorundefined';

@Component({
    selector: 'container-suggestion',
    templateUrl: './container-suggestion.component.html',
    styleUrls: ['./container-suggestion.component.css']
})
export class ContainerSuggestionComponent implements OnInit {

    @ViewChild('containerInput') containerInput: ElementRef;

    ContainerID: string;
    suggestedContainer: string;
    suggestContainer = [];
    categoryName: string;
    blinkStyle = true;
    serialNumber: string;
    isExceptionCategory: string;
    containerResponse: any;

    container = new Container();
    clientData = new ClientData();


    @Input() class: string;
    @Input() id: string;
    @Input() csLabel: string;
    @Input() placeholder: string = "";
    @Input() inbContainerId: string;
    @Input() isContainerDisabled: boolean = true;
    @Input() isClearContainerDisabled: boolean = true;
    @Input() isMoveDisabled: boolean = false;
    @Input() verifyserialNumber: string;
    @Input() iconBtnDisabled: boolean;
    @Input() showPrint: boolean = false;
    @Input() isAsterisk: boolean = false;
    @Input() uiData: UiData;

    @Output() emitDevice = new EventEmitter();
    @Output() emitvalidateContainer = new EventEmitter();
    @Output() focusContainer = new EventEmitter();
    @Output() getSuggestContainerResponse = new EventEmitter();
    @Output() getSuggestAutoCompleteContainerResponse = new EventEmitter();
    @Output() getSuggestExpContainerResponse = new EventEmitter();
    @Output() validateContainerValue = new EventEmitter();
    @Output() emitCheckContainer = new EventEmitter();
    @Output() errorEmit = new EventEmitter();
    @Output() emitContainerId = new EventEmitter();
    @Output() emitValidateContainerFailResponse = new EventEmitter();
    @Output() emitContainerPrint = new EventEmitter();

    // for paste event
    message: string;
    content: any;
    IsSpecialChar: boolean = false;
    containerCycle: string;
    suggestContainerCycle: string;
    //messages
    messageNum: string;
    messageType: string;
    storageData = StorageData;
    statusCode = StatusCodes;

    constructor(
        private apiService: ApiService,
        private apiConfigService: ApiConfigService,
        private spinner: NgxSpinnerService,
        private snackbar: XpoSnackBar,
        private appErrService: AppErrorService,
        private masterPageService: MasterPageService,
        public app: AppService,
        private messagingService: MessagingService
    ) { }

    ngOnInit() {
        this.message = this.app.getErrorText('2660036');
        this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
    }

    //on focus of container
    emitGetSuggestContainer() {
        if (this.isContainerDisabled == false) {
            this.focusContainer.emit();
        }
    }
    //on enter of container
    emitValidateContainer() {
        if (this.isContainerDisabled == false) {
            if (this.IsSpecialChar == false) {
                this.validateContainerValue.emit(this.containerResponse);
                this.containerInput.nativeElement.blur();
            }
            else {
                this.appErrService.setAlert(this.message, true);
                this.app.applyRequired(true, this.id);
                this.applySelect();
            }
        }

    }
    //getSuggestContainer
    getSuggestContainer(device?) {
        if (!checkNullorUndefined(device)) {
            if (this.isContainerDisabled == false) {
                if (checkNullorUndefined(this.suggestedContainer) || this.suggestedContainer == "") {
                    this.blinkStyle = true;
                    this.spinner.show();
                    let requestObj = { ClientData: this.clientData, Device: device, UIData: this.uiData };
                    const url = String.Join("/", this.apiConfigService.suggestContainerUrl);
                    this.apiService.apiPostRequest(url, requestObj)
                        .subscribe(response => {
                            let res = response.body;
                            if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                                this.containerResponse = res.Response.Container;
                                this.suggestedContainer = res.Response.Container.ContainerID;
                                this.categoryName = res.Response.Container.CategoryName;
                                this.suggestContainerCycle = res.Response.Container.ContainerCycle;
                                this.getSuggestContainerResponse.emit(this.containerResponse);
                                if (res.Response.hasOwnProperty('CanAutoPopulate') && res.Response.CanAutoPopulate && res.Response.CanAutoPopulate == CommonEnum.yes) {
                                    this.ContainerID = res.Response.Container.ContainerID;
                                    this.isContainerDisabled = true;
                                    this.blinkStyle = false;
                                    this.getSuggestAutoCompleteContainerResponse.emit(res.Response);
                                } else {
                                    this.isContainerDisabled = false;
                                    this.isClearContainerDisabled = false;
                                    this.blinkStyle = true;
                                    this.spinner.hide();
                                }
                            }
                            else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                                this.spinner.hide();
                                this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                                this.errorEmit.emit(true);
                            }
                        }, erro => {
                            this.appErrService.handleAppError(erro);
                        });
                }
            }

        }
        else {
            this.suggestExceptionContainer();
        }
    }

    // suggestExceptionContainer
    suggestExceptionContainer(devicesListObj?) {
        if (this.isContainerDisabled === false) {
            if (this.app.checkNullOrUndefined(this.suggestedContainer) || this.suggestedContainer === '') {
                this.blinkStyle = true;
                this.spinner.show();
                let requestObj;
                let url;
                if (!this.app.checkNullOrUndefined(devicesListObj) && Array.isArray(devicesListObj)) {
                    requestObj = { ClientData: this.clientData, UIData: this.uiData, Devices: devicesListObj };
                    url = String.Join('/', this.apiConfigService.suggestExceptionContainerUrl, this.isExceptionCategory);
                } else {
                    requestObj = { ClientData: this.clientData, UIData: this.uiData };
                    url = String.Join('/', this.apiConfigService.suggestExceptionContainerUrl, this.verifyserialNumber, this.isExceptionCategory);
                }
                this.apiService.apiPostRequest(url, requestObj)
                    .subscribe(response => {
                        const res = response.body;
                        this.spinner.hide();
                        if (!this.app.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
                            if (!this.app.checkNullOrUndefined(res.StatusMessage) && res.StatusMessage !== '') {
                                this.snackbar.error(res.StatusMessage);
                            }
                            if (!this.app.checkNullOrUndefined(devicesListObj) && Array.isArray(devicesListObj)) {
                                this.containerResponse = { Container: res.Response };
                            } else {
                                this.containerResponse = res.Response;
                            }
                            this.suggestedContainer = this.containerResponse.Container.ContainerID;
                            this.suggestContainerCycle = this.containerResponse.Container.ContainerCycle;
                            this.categoryName = this.containerResponse.Container.CategoryName;
                            this.getSuggestExpContainerResponse.emit(this.containerResponse);
                            this.isContainerDisabled = false;
                            this.isClearContainerDisabled = false;
                            this.blinkStyle = true;
                        } else if (!this.app.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
                            this.spinner.hide();
                            this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                        }
                    }, erro => {
                        this.appErrService.handleAppError(erro);
                    });
            }
        }
    }


    //validate container
    validateContainer(device) {
        if (!checkNullorUndefined(device)) {
            if (!checkNullorUndefined(this.ContainerID) && this.ContainerID !== "") {
                this.spinner.show();
                let userMessage = new Message();
                this.emitContainerId.emit(this.ContainerID);
                if (this.suggestedContainer == "" || checkNullorUndefined(this.suggestedContainer)) {
                    device.ContainerID = this.ContainerID.toUpperCase().trim();
                    this.containerCycle = device.ContainerCycle;
                    device.ContainerCycle = this.suggestContainerCycle;

                    let requestObj = { ClientData: this.clientData, Device: device, UIData: this.uiData };
                    const url = String.Join("/", this.apiConfigService.validateContainerUrl, this.categoryName);
                    this.apiService.apiPostRequest(url, requestObj)
                        .subscribe(response => {
                            let res = response.body;
                            if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                                this.spinner.hide();
                                device.ContainerID = this.inbContainerId;
                                device.ContainerCycle = this.containerCycle;
                                this.containerInput.nativeElement.select();
                                this.applyRequired(true);
                                this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                                this.errorEmit.emit(true);
                                this.emitValidateContainerFailResponse.emit(device);
                            }
                            else if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                                this.container = res.Response;
                                this.blinkStyle = false;
                                this.isContainerDisabled = true;
                                this.applyRequired(false);
                                this.containerInput.nativeElement.blur();
                                this.emitvalidateContainer.emit(this.container);

                            }
                        }, erro => {
                            this.errorEmit.emit(true);
                            this.appErrService.handleAppError(erro);
                        });
                }
                else {
                    this.blinkStyle = true;
                    if (this.ContainerID == this.suggestedContainer) {
                        this.isContainerDisabled = true;
                        this.blinkStyle = false;
                        this.emitvalidateContainer.emit();
                    }
                    else {
                        this.spinner.hide();
                        this.app.applyRequired(true, this.id);
                        this.emitContainerId.emit(this.ContainerID);
                        this.containerInput.nativeElement.select();
                        let userMessage = new Message();
                        this.messageNum = "2660040";
                        this.messageType = MessageType.failure;
                        userMessage = this.messagingService.SendUserMessage(this.messageNum, this.messageType);
                        this.appErrService.setAlert(userMessage.messageText, true);
                        this.errorEmit.emit(true);
                    }
                }
            } else {
                this.app.applyRequired(true, this.id);
                let userMessage = new Message();
                this.messageNum = "2660041";
                this.messageType = MessageType.failure;
                userMessage = this.messagingService.SendUserMessage(this.messageNum, this.messageType);
                this.appErrService.setAlert(userMessage.messageText, true);
                this.errorEmit.emit(true);
            }
        }
    }

    applySelect() {
        const selectControl = <HTMLInputElement>this.containerInput.nativeElement;
        selectControl.select();
    }
    //on input enter on container 
    checkContainer() {
        if (!checkNullorUndefined(this.ContainerID) && this.ContainerID !== "") {
            this.appErrService.clearAlert();
            this.errorEmit.emit(false);
            this.app.applyRequired(false, this.id);
            var pattern = /[^a-zA-Z0-9]/;
            if (pattern.test(this.ContainerID)) {
                this.containerInput.nativeElement['value'] = "";
                this.snackbar.error(this.message);
                this.appErrService.setAlert(this.message, true);
                this.IsSpecialChar = true;
                this.app.applyRequired(true, this.id);
                this.applySelect();
            }
            else {
                if (!checkNullorUndefined(this.suggestedContainer) && !checkNullorUndefined(this.ContainerID) && (this.suggestedContainer == this.ContainerID.trim().toUpperCase())) {
                    this.ContainerID = this.ContainerID.toUpperCase();
                    const container = {
                        ContainerID: this.ContainerID,
                        ContainerCycle: this.suggestContainerCycle
                    }
                    this.emitCheckContainer.emit(container);
                    this.app.applyRequired(false, this.id);
                    this.blinkStyle = false;
                    this.IsSpecialChar = false;
                }
                else {
                    this.IsSpecialChar = false;
                    this.blinkStyle = true;
                    this.emitCheckContainer.emit();
                }
            }
        } else {
            this.IsSpecialChar = false;
            this.blinkStyle = true;
            this.emitCheckContainer.emit();
        }

    }

    //refresh button
    refreshContainer() {
        this.appErrService.clearAlert();
        this.app.applyRequired(false, this.id);
        this.isContainerDisabled = false;
        this.focusContainer.emit(this.isContainerDisabled);
        this.errorEmit.emit(false);
    }

    //focus on container
    suggestedContainerFocus() {
        let inputContainer = <HTMLInputElement>document.getElementById(this.id);
        if (inputContainer) {
            inputContainer.focus();
        }
    }

    //appply required on container
    applyRequired(val: boolean) {
        if (val && this.id) {
            let elem: HTMLElement = document.getElementById(this.id);
            return elem.setAttribute("style", "border: 1px solid red;");
        }
        else if (this.id) {
            let elem: HTMLElement = document.getElementById(this.id);
            return elem.removeAttribute('style');
        }
    }

    pasteEvent($event: any) {
        var pattern = /[^a-zA-Z0-9]/;
        this.content = $event.clipboardData.getData('text/plain');

        //Special characters exists
        if (pattern.test(this.content)) {
            this.snackbar.error(this.message);
            this.app.applyRequired(true, this.id);
            this.IsSpecialChar = true;
        }
        else {
            this.IsSpecialChar = false;
        }
    }
    onContainerPrint() {
        this.emitContainerPrint.emit();
    }
}
