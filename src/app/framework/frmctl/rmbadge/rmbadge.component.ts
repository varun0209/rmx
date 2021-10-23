import { Component, OnInit, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'rmbadge',
  templateUrl: './rmbadge.component.html',
  styleUrls: ['./rmbadge.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RmbadgeComponent),
      multi: true
    }]
})
export class RmbadgeComponent implements OnInit, ControlValueAccessor {

  @Input() text: string;
  @Input() badgenumber: number;
  @Input() isblink: false;

  constructor() { }

  ngOnInit() {
  }

  writeValue(value: any) {}

  registerOnChange(fn: any) {}

  registerOnTouched() {}

}
