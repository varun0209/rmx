import { Component, OnInit, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'rmpopovers',
  templateUrl: './rmpopovers.component.html',
  styleUrls: ['./rmpopovers.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RmpopoversComponent),
      multi: true
    }]
})
export class RmpopoversComponent implements OnInit, ControlValueAccessor {

  @Input() title: string;
  @Input() dataContent: any;
  @Input() PopoverName: string;

  constructor() { }

  ngOnInit() {

  }

  writeValue(value: any) {}

  registerOnChange(fn: any) {}

  registerOnTouched() {}

}
