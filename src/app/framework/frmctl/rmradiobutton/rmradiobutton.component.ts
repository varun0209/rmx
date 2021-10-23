import { Component, OnInit, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'rmradiobutton',
  templateUrl: './rmradiobutton.component.html',
  styleUrls: ['./rmradiobutton.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RmradiobuttonComponent),
      multi: true
    }]
})
export class RmradiobuttonComponent implements OnInit, ControlValueAccessor {

   @Input() label: string;
   @Input() disabled: string;

  constructor() { }

  ngOnInit() {
  }

  writeValue(value: any) {}

  registerOnChange(fn: any) {}

  registerOnTouched() {}

}
