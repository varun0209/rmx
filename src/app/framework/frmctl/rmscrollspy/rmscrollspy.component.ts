import { Component, OnInit, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'rmscrollspy',
  templateUrl: './rmscrollspy.component.html',
  styleUrls: ['./rmscrollspy.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RmscrollspyComponent),
      multi: true
    }]
})
export class RmscrollspyComponent implements OnInit, ControlValueAccessor {

  constructor() { }

  ngOnInit() {
  }

  writeValue(value: any) {}

  registerOnChange(fn: any) {}

  registerOnTouched() {}

}
