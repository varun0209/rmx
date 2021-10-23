import { Component, OnInit, forwardRef, Input, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'rmmulticoldropdown',
  templateUrl: './rmmulticoldropdown.component.html',
  styleUrls: ['./rmmulticoldropdown.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RmmulticoldropdownComponent),
      multi: true
    }]
})
export class RmmulticoldropdownComponent implements OnInit, ControlValueAccessor {

  @Input() disabled: boolean;
  @Input() value: string;
  options: any;
  @Input() dpOptions: any;
  @Input() id:string;
  @Input() name: string;
  @Output() onChangeVal = new EventEmitter();

  constructor() { }

  ngOnInit() {
    //this.options = this.dpOptions;
  }

  ngOnChanges() {
    this.options=[];
    this.options = this.dpOptions;
  }

  onChangeData(event) {
    this.onChangeVal.emit(event);
  }

  writeValue(value: any) { }

  registerOnChange(fn: any) { }

  registerOnTouched() { }

}
