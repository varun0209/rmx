import { Directive, ElementRef, Input, SimpleChanges } from '@angular/core';
import { NG_VALIDATORS, Validators, AbstractControl } from '@angular/forms';
import { AppService } from '../utilities/rlcutl/app.service';
import { StorageData } from '../enums/storage.enum';

@Directive({
  selector: '[requiredIf]',
  providers: [
    { provide: NG_VALIDATORS, useExisting: RequiredIfDirective, multi: true }
  ]
})
export class RequiredIfDirective implements Validators {
  @Input("requiredIf")
  requiredIf: boolean;
  oldValue: any;
  @Input() numberPattern: any;

  constructor(private el: ElementRef, private appService: AppService) {
    const pattern = JSON.parse(localStorage.getItem(StorageData.patternList));
    if (!this.appService.checkNullOrUndefined(pattern)) {
       this.numberPattern = new RegExp(pattern.defaultNumberPattern);
    }

  }

  validate(c: AbstractControl): any {
    if (this.el.nativeElement.type == "number") {
      let current: string = this.el.nativeElement.value;
      if (String(current).match(this.numberPattern)) {
        this.oldValue = current;
        event.preventDefault();
        return null;
      } else {
        if (!this.appService.checkNullOrUndefined(this.oldValue) && this.el.nativeElement.value != '') {
          this.el.nativeElement.value = this.oldValue;
        }
        if (this.el.nativeElement.value == '') {
          this.oldValue = '';
          this.el.nativeElement.value = '';
          return {
            requiredIf: { condition: this.requiredIf }
          };
        }
      }
    } else {
      let value = c.value;
      if ((value === null || value === undefined || value === "" || value.length === 0) && this.requiredIf) {
        return {
          requiredIf: { condition: this.requiredIf }
        };
      }
      return null;
    }
  }

  registerOnValidatorChange(fn: () => void): void { this._onChange = fn; }
  private _onChange: () => void;

  ngOnChanges(changes: SimpleChanges): void {

    if ('requiredIf' in changes) {

      if (this._onChange) this._onChange();
    }
  }

}
