import { Component, OnInit, forwardRef, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Placeholder } from '@angular/compiler/src/i18n/i18n_ast';
import { AppService } from '../../../utilities/rlcutl/app.service';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { AppErrorService } from '../../../utilities/rlcutl/app-error.service';
import { StorageData } from '../../../enums/storage.enum';
import { checkNullorUndefined } from '../../../enums/nullorundefined';

const noop = () => {
};

@Component({
    selector: 'rmtextarea',
    templateUrl: './rmtextarea.component.html',
    styleUrls: ['./rmtextarea.component.css'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => RmtextareaComponent),
            multi: true
        }]
})
export class RmtextareaComponent implements OnInit, ControlValueAccessor {

    @Input() rows: number;
    @Input() placeholder: string;
    @Input() disabled: boolean;
    @Input() id: string;
    @Input() name: string;
    @Input() maxlength: string;
    @Output() onChangeVal = new EventEmitter();
    @ViewChild('inputtext') inputtext: ElementRef;
    @Output() enter = new EventEmitter();
    @Output() onControlChange = new EventEmitter();
    @Input() flag: boolean;
    @Input() widthInput: any;
    @Input() divClass: string;
    @Input() iconstyle: string;
    @Input() hidePrintIcon = false;
    @Input() hideSearchIcon = false;
    @Input() iconBtnDisabled: boolean;
    @Input() searchIconBtnDisabled = false;
    @Output() clearEmit = new EventEmitter();
    @Output() iconEventEmit = new EventEmitter();
    @Output() searchEventEmit = new EventEmitter();
    @Output() specialCharecterEmit = new EventEmitter();
    @Input() textAreaPattern: any;
    @Input() allowUppercase = false;
    @Input() allowAutoResize = false;
    @Input() allowMaxlengthTextarea = true;


    // for paste event
    @Input() errorMessage: string;
    message: string;
    content: any;
    IsSpecialChar = false;
    textLabel: any;

    // enum
    storageData = StorageData;
    private regex: any;

    // The internal data model
    private innerValue: any = '';

    // Placeholders for the callbacks which are later provided
    //by the Control Value Accessor
    private onTouchedCallback: () => void = noop;
    private onChangeCallback: (_: any) => void = noop;


    constructor(
        public app: AppService,
        private snackbar: XpoSnackBar,
        private appErrService: AppErrorService) {
        const pattern = JSON.parse(localStorage.getItem(StorageData.patternList));
        if (!this.app.checkNullOrUndefined(pattern)) {
                this.regex = new RegExp(pattern.textareaPattern);
        }
    }

    ngOnInit() {
        this.message = this.app.getErrorText('2660036');
        const appConfig = JSON.parse(localStorage.getItem(this.storageData.appConfig));
        if (this.allowMaxlengthTextarea) {
            this.maxlength = appConfig.default.textareaLength;
        }

    }

    onControlChangeEvent() {
        // this.onControlChange.emit();
        this.applyRequired(false);

    }

    onEnter(event) {
        event.preventDefault();
        if (this.disabled === false || checkNullorUndefined(this.disabled)) {
            if (this.IsSpecialChar === false) {
                if (!checkNullorUndefined(this.value) && this.value !== '') {
                    this.enter.emit(this.value.trim());
                } else {
                    this.applyRequired(true);
                }
            } else {
                this.isPopupFlagCheck();
                this.applyRequired(true);
                this.applySelect();
            }
            if (this.allowAutoResize) {
                this.autoResize();
            }
        }
    }

    onClick() {
        this.iconEventEmit.emit();
    }
    onSearchClick() {
        if (!checkNullorUndefined(this.value) && this.value !== '') {
            this.searchEventEmit.emit(this.value);
        }
    }


    inputChange() {
        if (this.allowUppercase && this.value) {
            this.value = this.value.toUpperCase();
        }
        if (!checkNullorUndefined(this.value) && this.value !== '') {
            this.value = this.value.trim();
            this.appErrService.clearAlert();
            if (this.textAreaPattern) {
                this.regex = new RegExp(this.textAreaPattern);
            }
            if (this.regex.test(this.value.trim()) && this.textAreaPattern) {
                if (!this.app.checkNullOrUndefined(this.errorMessage)) {
                    this.message = this.errorMessage;
                }
                this.snackbar.error(this.message);
                this.IsSpecialChar = true;
                this.applyRequired(true);
                this.isPopupFlagCheck();
                this.clearEmit.emit(false);
                this.inputtext.nativeElement['value'] = '';
                this.value = '';
            } else {
                this.IsSpecialChar = false;
                if (this.value.length > this.maxlength) {
                    this.applyRequired(true);
                    this.onChangeVal.emit(this.value);
                } else {
                    this.onChangeVal.emit(this.value);
                    this.appErrService.clearAlert();
                    this.applyRequired(false);
                    if (this.allowAutoResize) {
                        this.autoResize();
                    }
                }
            }
        } else {
            this.onChangeVal.emit(this.value);
        }

    }

    autoResize() {
        const elem: HTMLElement = document.getElementById(this.id);
        if (elem) {
            elem.style.height = (elem.scrollHeight) + 'px';
        }
    }
    isPopupFlagCheck() {
        if (this.flag === true) {
            this.appErrService.specialCharErrMsg = this.message;
        } else {
            this.appErrService.setAlert(this.message, true);
        }
    }

    applyRequired(val: boolean) {
        if (val) {
            const elem: HTMLElement = document.getElementById(this.id);
            return elem.setAttribute('style', 'border: 1px solid red;');
        } else {
            const elem: HTMLElement = document.getElementById(this.id);
            return elem.removeAttribute('style');
        }
    }

    applySelect() {
        const selectControl = <HTMLInputElement>this.inputtext.nativeElement;
        selectControl.select();
    }


    //get accessor
    get value(): any {
        return this.innerValue;
    }

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

    omit_special_char(event, regexPattern?: any) {
        if (regexPattern) {
            this.regex = regexPattern;
        }
        if (event.key.match(this.regex)) {
            return false;
        }
    }


}
