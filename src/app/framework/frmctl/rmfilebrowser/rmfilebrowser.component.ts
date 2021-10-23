import { Component, OnInit, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'rmfilebrowser',
  templateUrl: './rmfilebrowser.component.html',
  styleUrls: ['./rmfilebrowser.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RmfilebrowserComponent),
      multi: true
    }]
})
export class RmfilebrowserComponent implements OnInit, ControlValueAccessor {

   @Input() id: string;
   @Input() for: string;
   @Input() disabled: boolean;
   @Input() customFile: string;

  constructor() { }

  ngOnInit() {
  }

   writeValue(value: any) {}

   registerOnChange(fn: any) {}

   registerOnTouched() {}
}
