import { Component, OnInit, forwardRef, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'rmlistbox',
  templateUrl: './rmlistbox.component.html',
  styleUrls: ['./rmlistbox.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RmlistboxComponent),
      multi: true
    }]
})
export class RmlistboxComponent implements OnInit, ControlValueAccessor {

  listGroupItems: any;
  @Input() listBox: string;
  @Output() onChangeVal = new EventEmitter();
  @Input() value: any;
  @Input() id: string;
  @Input() disabled: boolean;

  constructor() { }

  ngOnInit() {

  }

  ngOnChanges() {
    this.listGroupItems = [];
    this.listGroupItems = this.listBox;
  }

  changeData() {
    this.onChangeVal.emit(this.value);
  }

  writeValue(value: any) { }

  registerOnChange(fn: any) { }

  registerOnTouched() { }

}
