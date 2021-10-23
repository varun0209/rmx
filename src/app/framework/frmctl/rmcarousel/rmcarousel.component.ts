import { Component, OnInit, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'rmcarousel',
  templateUrl: './rmcarousel.component.html',
  styleUrls: ['./rmcarousel.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RmcarouselComponent),
      multi: true
    }]
})
export class RmcarouselComponent implements OnInit, ControlValueAccessor {
 
  constructor() { }

  ngOnInit() {
            
  }

  writeValue(value: any) {}

  registerOnChange(fn: any) {}

  registerOnTouched() {}

}
