import { Component, OnInit, forwardRef, Input, Output, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ApiService } from '../../../utilities/rlcutl/api.service';
import { ApiConfigService } from '../../../utilities/rlcutl/api-config.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { AppErrorService } from '../../../utilities/rlcutl/app-error.service';
import { MasterPageService } from '../../../utilities/rlcutl/master-page.service';
import { String, StringBuilder } from 'typescript-string-operations';
import { SKU } from '../../../models/receiving/ReceivingSKU';
import { AppService } from '../../../utilities/rlcutl/app.service';
import { CommonService } from '../../../services/common.service';
import { checkNullorUndefined } from '../../../enums/nullorundefined';


@Component({
    selector: 'rmtypeahead',
    templateUrl: './rmtypeahead.component.html',
    styleUrls: ['./rmtypeahead.component.css'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => RmtypeaheadComponent),
            multi: true
        }]
})
export class RmtypeaheadComponent implements OnInit, ControlValueAccessor {

    @ViewChild('input') input: ElementRef;
    @ViewChild('skuInput') SKUInput: ElementRef;

    typeahead: any[] = [];
    @Input() typeaheadOptionField: string;
    @Input() skuDisabled = false;
    @Input() isSkuBtnDisabled = true;
    @Input() readonly = false;
    @Input() required = false;
    @Input() class: string;
    @Input() ConditionCode: string;
    @Input() id: string;
    @Input() selectedSKUModel: string;
    @Input() selectedSKU: string;
    @Input() SKU: string;
    @Input() placeholder: string;
    @Input() typeaheadPattern: string;
    @Input() typeaheadOptionsLimit: number;
    @Input() waitTime:string;
    changeCallback = (data: any) => { };
    touchCallback = () => { };
    @Input() skus: SKU[] = [];

    @Output() typeaheadResponse = new EventEmitter();
    @Output() getDetermineSKUsResponse = new EventEmitter();

    @Output() inputEvent = new EventEmitter();
    skuobj: any;

    // for paste event
    @Input() errorMessage: string;
    message: string;
    content: any;
    IsSpecialChar: boolean = false;

    constructor(
        private apiService: ApiService,
        private apiConfigService: ApiConfigService,
        private spinner: NgxSpinnerService,
        private snackbar: XpoSnackBar,
        private appErrService: AppErrorService,
        private masterPageService: MasterPageService,
        private app: AppService,
        private commonService: CommonService
    ) { }

    ngOnInit() {
        this.message = this.app.getErrorText('2660036');
    }

    getEligibleSKUs() {
        this.appErrService.clearAlert();
        if (!this.app.checkNullOrUndefined(this.errorMessage)) {
            this.message = this.errorMessage;
        }
        if (this.commonService.checkPattern(null, this.typeaheadPattern, this.message, this.SKU)) {
            if (!checkNullorUndefined(this.content)) {
                let val = this.content;
                if (val !== this.SKU) {
                    this.IsSpecialChar = false;
                }
            }
            if (this.skuDisabled == false && this.IsSpecialChar == false) {
                if (!checkNullorUndefined(this.SKU) && this.SKU !== "") {
                    this.inputEvent.emit(this.SKU.trim());
                } else {
                    this.inputEvent.emit();
                }
            }
            if (this.IsSpecialChar == true) {
                this.applyRequired(true);
                this.SKUInput.nativeElement['value'] = this.SKU.toUpperCase();
                this.applySelect();
                this.appErrService.setAlert(this.message, true);
            }
            else if (this.IsSpecialChar == false) {
                this.applyRequired(false);
            }
        } else {
            this.SKUInput.nativeElement['value'] = '';
            this.applyRequired(true);
            this.inputEvent.emit();
        }
    }

    typeaheadOnSelect(event) {
        this.typeaheadResponse.emit(event);
    }



    writeValue(obj: any) {

    }

    registerOnChange(fn: any) {
        this.changeCallback = fn;
    }

    registerOnTouched(fn: any) {
        this.touchCallback = fn;
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
        const selectControl = <HTMLInputElement>this.SKUInput.nativeElement;
        selectControl.select();
    }

    pasteEvent($event: any) {
        var pattern = /[^a-zA-Z0-9]/;
        this.content = $event.clipboardData.getData('text/plain');

        //Special characters exists
        if (pattern.test(this.content.trim())) {
            this.snackbar.error(this.message);
            this.applyRequired(true);
            this.IsSpecialChar = true;
        }
        else {
            this.IsSpecialChar = false;
        }
    }

    omit_special_char(event) {
        var pattern = /[\s]+$/;
        if (!checkNullorUndefined(event.key)) {
            if (event.key.match(pattern)) {
                return false;
            }
        }
    }
}
