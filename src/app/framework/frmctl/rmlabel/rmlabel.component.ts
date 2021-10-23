import { Component, OnInit, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'rmlabel',
  templateUrl: './rmlabel.component.html',
  styleUrls: ['./rmlabel.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RmlabelComponent),
      multi: true
    }]
})
export class RmlabelComponent implements OnInit, ControlValueAccessor {

  @Input() for: string;
  @Input() label: string;
  @Input() lblStyle:string;
  @Input() isAsterisk:boolean = false;
  @Input() labelFor: string;

  constructor() { }

  ngOnInit() {
    
  }

  writeValue(value: any) {}

  registerOnChange(fn: any) {}

  registerOnTouched() {}

}
