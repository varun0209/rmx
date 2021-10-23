import { Component, OnInit, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'rmpassword',
  templateUrl: './rmpassword.component.html',
  styleUrls: ['./rmpassword.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RmpasswordComponent),
      multi: true
    }]
})
export class RmpasswordComponent implements OnInit, ControlValueAccessor {

   @Input() disabled: string;

  constructor() { }

  ngOnInit() {
  }

  writeValue(value: any) {}

  registerOnChange(fn: any) {}

  registerOnTouched() {}

}
