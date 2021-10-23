import { MessageType } from './../../../enums/message.enum';
import { Component, OnInit, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'rmalert',
  templateUrl: './rmalert.component.html',
  styleUrls: ['./rmalert.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RmalertComponent),
      multi: true
    }]
})
export class RmalertComponent implements OnInit, ControlValueAccessor {

  static readonly IconMap: { [key: string]: string } = {
    success: 'check_circle',
    warn: 'warning',
    error: 'error',
    info: 'info',
  };


  @Input() text: string;
  @Input() type: string;
  iconClass: any;

  textheading = 'Alert';
  @Input() alertColor = MessageType.failure;
  iconName = RmalertComponent.IconMap[MessageType.failure];


  constructor() {

  }

  ngOnInit() {
    this.iconName = RmalertComponent.IconMap[this.alertColor];
  }

  writeValue(value: any) { }

  registerOnChange(fn: any) { }

  registerOnTouched() { }

}