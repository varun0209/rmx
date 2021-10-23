import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { AppService } from '../utilities/rlcutl/app.service';
import { StorageData } from '../enums/storage.enum';


@Directive({
    selector: '[numbersOnly]'
})
export class NumberOnlyDirective {
    private regex: any;
    // Allow key codes for special events. Reflect :
    @Input() numberPattern: any;
    oldValue: any;
    // Backspace, Delete, Tab
    private specialKeys: Array<string> = ['Backspace', 'Delete', 'Tab'];

    constructor(private el: ElementRef, private appService: AppService) {
        const pattern = JSON.parse(localStorage.getItem(StorageData.patternList));
        if (!this.appService.checkNullOrUndefined(pattern)) {
           this.regex = new RegExp(pattern.defaultNumberPattern);
        }
    }
    @HostListener('input', ['$event'])
    onInputChange(event) {
        const current: string = this.el.nativeElement.value;
        // if caller screen regular expression exist
        if (this.numberPattern) {
            this.regex = new RegExp(this.numberPattern);
        }
        if (String(current).match(this.regex)) {
            this.oldValue = current;
            event.preventDefault();
        } else {
            if (!this.appService.checkNullOrUndefined(this.oldValue) && this.el.nativeElement.value != '') {
                this.el.nativeElement.value = this.oldValue;
            } else {
                this.oldValue = '';
                this.el.nativeElement.value = '';
            }
        }
    }
}