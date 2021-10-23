import { Component, OnInit, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'rmprogress',
  templateUrl: './rmprogress.component.html',
  styleUrls: ['./rmprogress.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RmprogressComponent),
      multi: true
    }]
})
export class RmprogressComponent implements OnInit, ControlValueAccessor {

  @Input() status: string;

  constructor() { }

  ngOnInit() {
  }

  writeValue(value: any) {}

  registerOnChange(fn: any) {}

  registerOnTouched() {}

}
