import { Component, OnInit, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'rmtooltip',
  templateUrl: './rmtooltip.component.html',
  styleUrls: ['./rmtooltip.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RmtooltipComponent),
      multi: true
    }]
})
export class RmtooltipComponent implements OnInit, ControlValueAccessor {

  @Input() title: string;
  @Input() label: string;

  constructor() { }

  ngOnInit() {
  }

  writeValue(value: any) {}

  registerOnChange(fn: any) {}

  registerOnTouched() {}

}
