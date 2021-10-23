import { Component, OnInit, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'rmnavtabs',
  templateUrl: './rmnavtabs.component.html',
  styleUrls: ['./rmnavtabs.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RmnavtabsComponent),
      multi: true
    }]
})
export class RmnavtabsComponent implements OnInit, ControlValueAccessor {

  constructor() { }

  ngOnInit() {
  }

   writeValue(value: any) {}
 
   registerOnChange(fn: any) {}

   registerOnTouched() {}

}
