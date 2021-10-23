import { Component, OnInit, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'rmaccordian',
  templateUrl: './rmaccordian.component.html',
  styleUrls: ['./rmaccordian.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RmaccordianComponent),
      multi: true
    }]
})
export class RmaccordianComponent implements OnInit, ControlValueAccessor {

  constructor() { }

  ngOnInit() {
  }

   writeValue(value: any) {}

   registerOnChange(fn: any) {}

   registerOnTouched() {}

}
