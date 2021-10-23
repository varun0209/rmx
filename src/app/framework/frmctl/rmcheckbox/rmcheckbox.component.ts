import { Component, OnInit, forwardRef, Input, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'rmcheckbox',
  templateUrl: './rmcheckbox.component.html',
  styleUrls: ['./rmcheckbox.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RmcheckboxComponent),
      multi: true
    }]
})
export class RmcheckboxComponent implements OnInit, ControlValueAccessor {

  @Input() disabled: boolean;
  @Input() checked: string;
  @Input() label: string;
  @Input() index:number;
  @Input() value:any;
  @Output() onChangeVal = new EventEmitter();
  constructor() { }

  ngOnInit() {
  }

   writeValue(value: any) {}

   registerOnChange(fn: any) {}

   registerOnTouched() {}

   onChangeData(event){
     this.onChangeVal.emit(event);
   }
}
