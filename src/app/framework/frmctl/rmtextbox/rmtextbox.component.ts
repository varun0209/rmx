import { TwoDBarcode } from './../../../models/receiving/TwoDBarcode';
import { NgxSpinnerService } from 'ngx-spinner';
import { UiData } from './../../../models/common/UiData';
import { CommonService } from './../../../services/common.service';
import { ApiConfigService } from './../../../utilities/rlcutl/api-config.service';
import { Component, OnInit, Input, Output, forwardRef, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AppService } from '../../../utilities/rlcutl/app.service';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { AppErrorService } from '../../../utilities/rlcutl/app-error.service';
import { StorageData } from '../../../enums/storage.enum';
import { TextCase } from '../../../enums/textcase.enum';
import { checkNullorUndefined } from '../../../enums/nullorundefined';

const noop = () => {
};

@Component({
    selector: 'rmtextbox',
    templateUrl: './rmtextbox.component.html',
    styleUrls: ['./rmtextbox.component.css'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => RmtextboxComponent),
            multi: true
        }
    ]
})
export class RmtextboxComponent implements OnInit, ControlValueAccessor {
    @Input() type: string;
    @Input() maxlength: string;
    @Input() prependBtnId: string;
    @Input() id: string;
    @Input() name: string;
    @Input() disabled: boolean;
    @Input() placeholder: string;
    @Output() onChangeVal = new EventEmitter();
    @Input() class: string;
    @ViewChild('inputtext') inputtext: ElementRef;
    @Output() enter = new EventEmitter();
    @Output() onControlChange = new EventEmitter();
    @Input() flag: boolean;
    @Input() divClass: string;
    @Input() iconstyle: string;
    @Input() hidePrintIcon: boolean = false;
    @Input() hideSearchIcon: boolean = false;
    @Input() iconBtnDisabled: boolean;
    @Input() searchIconBtnDisabled = false;
    @Input() isAllowEmptyValue = false;
    @Input() prependiIconStyle: string;
    @Input() closeTooltip: string;
    @Input() prependiconBtnDisabled = false;
    @Input() hidePrependIcon: boolean = false;
    @Output() clearEmit = new EventEmitter();
    @Output() iconEventEmit = new EventEmitter();
    @Output() searchEventEmit = new EventEmitter();
    @Output() specialCharecterEmit = new EventEmitter();
    @Output() prependIconEevntEmit = new EventEmitter();
    @Output() closeEventEmit = new EventEmitter();
    @Output() printEventEmit = new EventEmitter();
    @Input() textBoxPattern: any;
    @Input() showCloseIcon = false;
    @Input() printCloseIcon = false;
    @Input() closeIconBtnDisabled = true;
    @Input() printIconBtnDisabled = true;
    @Output() isInputValueEmpty = new EventEmitter();
    @Input() textCase: TextCase = TextCase.uppercase;
    @Input() emptyContainerIcon = false;
    @Input() emptyContTooltip: string;
    @Input() emptyContainerBtnDisabled = true;
    @Output() emptyContainerEmit = new EventEmitter();
    @Input() isSerialNumber = false;
    // for paste event
    @Input() errorMessage: string;
    @Input() uiData = new UiData();
    message: string;
    content: any;
    IsSpecialChar: boolean = false;
    textLabel: any;
    twoDBarcodeObj = new TwoDBarcode();

    private regex: any;
    storageData = StorageData;
    controlConfig = JSON.parse(localStorage.getItem('controlConfig'));

    constructor(public app: AppService,
        private snackbar: XpoSnackBar,
        private apiConfigService: ApiConfigService,
        private appErrService: AppErrorService,
        private commonService: CommonService,
        private spinner: NgxSpinnerService
    ) {
        const pattern = JSON.parse(localStorage.getItem(StorageData.patternList));
        if (!this.app.checkNullOrUndefined(pattern)) {
            this.regex = new RegExp(pattern.textboxPattern);
        }
        if (localStorage.getItem(this.storageData.appConfig) != null) {
            let appConfig = JSON.parse(localStorage.getItem(this.storageData.appConfig));
            this.maxlength = appConfig.default.textboxLength;
        }
    }

    ngOnInit() {
        this.message = this.app.getErrorText('2660036');
    }

    onControlChangeEvent() {
        // this.onControlChange.emit();
        this.applyRequired(false);
    }

    onprePendiIconClick() {
        this.prependIconEevntEmit.emit();
    }

    onEnter(event) {
        if (!this.app.checkNullOrUndefined(event) && !this.app.checkNullOrUndefined(event.target)) {
            event.target.blur();
        }
        if (this.disabled == false || this.app.checkNullOrUndefined(this.disabled)) {
            this.appErrService.clearAlert();
            if (this.IsSpecialChar == false) {
                if (!this.app.checkNullOrUndefined(this.value) && this.value !== "") {
                    if (this.isSerialNumber && this.controlConfig
                        && this.controlConfig.hasOwnProperty('canValidateSerialNum')
                        && this.controlConfig.canValidateSerialNum) {
                        this.validate2DBarcode();
                    }
                    else {
                        this.enter.emit(this.value.trim());
                    }
                } else if (this.isAllowEmptyValue) {
                    this.enter.emit();
                } else {
                    this.applyRequired(true);
                }
            } else {
                this.isPopupFlagCheck();
                this.applyRequired(true);
                this.applySelect();
            }
        }
    }

    onClick() {
        this.iconEventEmit.emit();
    }
    onSearchClick() {
        this.appErrService.clearAlert();
        if (!this.app.checkNullOrUndefined(this.value) && this.value !== "") {
            this.searchEventEmit.emit(this.value.trim());
        } else if (this.isAllowEmptyValue) {
            this.searchEventEmit.emit();
        }
    }

    onCloseClick() {
        this.appErrService.clearAlert();
        if (!this.app.checkNullOrUndefined(this.value) && this.value !== "") {
            this.closeEventEmit.emit(this.value.trim());
        }
    }

    onPrintClick() {
        this.appErrService.clearAlert();
        if (!this.app.checkNullOrUndefined(this.value) && this.value !== "") {
            this.printEventEmit.emit(this.value.trim());
        }
    }

    onContaineremptyClick() {
        this.appErrService.clearAlert();
        this.emptyContainerEmit.emit();
    }

    onSetValue(value: string) {
        switch (this.textCase) {
            case TextCase.lowercase:
                return value.toLowerCase();
            case TextCase.nocase:
                return value;
            default:
                return value.toUpperCase();
        }
    }

    inputChange(isPaste = false) {
        if (!this.app.checkNullOrUndefined(this.value) && this.value !== "") {
            this.appErrService.clearAlert();
            //const pattern = /[^a-zA-Z0-9]/;
            if (this.textBoxPattern) {
                this.regex = new RegExp(this.textBoxPattern);
                // this.regex = this.textBoxPattern;
            }
            if (this.regex.test(this.value.trim())) {
                switch (this.textCase) {
                    case TextCase.lowercase:
                        this.inputtext.nativeElement['value'] = this.value.toLowerCase();
                        break;
                    case TextCase.nocase:
                        this.inputtext.nativeElement['value'] = this.value;
                        break;
                    default:
                        this.inputtext.nativeElement['value'] = this.value.toUpperCase();
                        break;
                }

                if (!this.app.checkNullOrUndefined(this.errorMessage)) {
                    this.message = this.errorMessage;
                }
                this.snackbar.error(this.message);
                this.IsSpecialChar = true;
                this.specialCharecterEmit.emit(this.IsSpecialChar);
                this.applyRequired(true);
                this.applySelect();
                this.isPopupFlagCheck();
                this.clearEmit.emit(false);
                this.inputtext.nativeElement['value'] = '';
                this.value = '';
            } else {
                this.IsSpecialChar = false;

                switch (this.textCase) {
                    case TextCase.lowercase:
                        this.value = this.value.trim().toLowerCase();
                        break;
                    case TextCase.nocase:
                        this.value = this.value.trim()
                        break;
                    default:
                        this.value = this.value.trim().toUpperCase();
                        break;
                }

                if (this.value.length > this.maxlength) {
                    this.applyRequired(true);
                }
                else {
                    this.onChangeVal.emit();
                    this.appErrService.specialCharErrMsg = "";
                    this.applyRequired(false);

                }
            }
        } else {
            if (!isPaste) {
                this.isInputValueEmpty.emit();
            }
        }

    }

    isPopupFlagCheck() {
        if (this.flag == true) {
            this.appErrService.specialCharErrMsg = this.message;
        }
        else {
            this.appErrService.setAlert(this.message, true);
        }
    }

    applyRequired(val: boolean) {
        if (val) {
            let elem: HTMLElement = document.getElementById(this.id);
            return elem.setAttribute("style", "border: 1px solid red;");

        }
        else {
            let elem: HTMLElement = document.getElementById(this.id);
            return elem.removeAttribute('style');
        }
    }

    applySelect() {
        const selectControl = <HTMLInputElement>this.inputtext.nativeElement;
        selectControl.select();
    }


    validate2DBarcode() {
        this.spinner.show();
        this.twoDBarcodeObj.Barcode = this.value;
        const requestObj = { ClientData: JSON.parse(localStorage.getItem('clientData')), UIData: this.uiData, TwoDBarcode: this.twoDBarcodeObj };
        this.commonService.commonApiCall(this.apiConfigService.commonValidate2DBarcodeUrl, requestObj, (res, statusFlag) => {
            this.spinner.hide();
            if (statusFlag) {
                if (res.Response.hasOwnProperty('ESNs')) {
                    let ESNsArray = res.Response.ESNs;
                    if (!checkNullorUndefined(ESNsArray) && ESNsArray instanceof Array && ESNsArray.length) {
                        this.value = ESNsArray[0];
                        this.enter.emit(this.value.trim());
                    }
                }
            }
        });
    }


    //The internal data model
    private innerValue: any = '';

    //Placeholders for the callbacks which are later provided
    //by the Control Value Accessor
    private onTouchedCallback: () => void = noop;
    private onChangeCallback: (_: any) => void = noop;

    //get accessor
    get value(): any {
        return this.innerValue;
    };

    //set accessor including call the onchange callback
    set value(v: any) {
        if (v !== this.innerValue) {
            this.innerValue = v;
            this.onChangeCallback(v);
        }
    }

    //Set touched on blur
    onBlur() {
        this.onTouchedCallback();
    }

    //From ControlValueAccessor interface
    writeValue(value: any) {
        if (value !== this.innerValue) {
            this.innerValue = value;
        }
    }

    //From ControlValueAccessor interface
    registerOnChange(fn: any) {
        this.onChangeCallback = fn;
    }

    //From ControlValueAccessor interface
    registerOnTouched(fn: any) {
        this.onTouchedCallback = fn;
    }

    omit_special_char(event) {
        //var pattern = /[^a-zA-Z0-9]/;
        if (this.textBoxPattern) {
            this.regex = this.textBoxPattern;
        }
        //var pattern = /^[^*|\":<>[\]{}`\\()';@&$#%^ /=_+~.!?-]+$/;
        if (event.key.match(this.regex)) {
            return false;
        }
    }

}
