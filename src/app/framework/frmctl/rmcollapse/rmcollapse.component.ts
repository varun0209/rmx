import { Component, OnInit, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'rmcollapse',
  templateUrl: './rmcollapse.component.html',
  styleUrls: ['./rmcollapse.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RmcollapseComponent),
      multi: true
    }]
})
export class RmcollapseComponent implements OnInit, ControlValueAccessor {

  constructor() { }

  ngOnInit() {
  }

   writeValue(value: any) {}

   registerOnChange(fn: any) {}

   registerOnTouched() {}

}
