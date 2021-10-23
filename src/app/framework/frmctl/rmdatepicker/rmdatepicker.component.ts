import { Component, OnInit, forwardRef, Input, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { checkNullorUndefined } from '../../../enums/nullorundefined';

@Component({
  selector: 'rmdatepicker',
  templateUrl: './rmdatepicker.component.html',
  styleUrls: ['./rmdatepicker.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RmdatepickerComponent),
      multi: true
    }]
})
export class RmdatepickerComponent implements OnInit, ControlValueAccessor {
  @Input() minDate: Date;
  @Input() ngClass: string;
  @Input() ngModel: string;
  //@Input() minDate: string;
  @Input() maxDate: string;
  @Input() DateValue: Date;
  @Input() disabled: boolean;
  @Input() datePickerDisabled = false;
  @Output() clearEmit = new EventEmitter();
  constructor() {
    this.minDate = new Date();
   // this.minDate.setDate(this.minDate.getDate() - 1);
  }

  ngOnInit() {

  }
  onValueChange(value: any): void {
    if (!checkNullorUndefined(value) && value !== "") {
      value = new Date(value).toLocaleString();
      this.clearEmit.emit(value);
    }
  }
  writeValue(value: any) { }

  registerOnChange(fn: any) { }

  registerOnTouched() { }

}
