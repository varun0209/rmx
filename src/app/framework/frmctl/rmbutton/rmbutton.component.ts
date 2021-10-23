import { Component, OnInit, forwardRef, Input, Output,EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { checkNullorUndefined } from '../../../enums/nullorundefined';

@Component({
  selector: 'rmbutton',
  templateUrl: './rmbutton.component.html',
  styleUrls: ['./rmbutton.component.css'],
   providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RmbuttonComponent),
      multi: true
    }]
})
export class RmbuttonComponent implements OnInit, ControlValueAccessor {

  @Input() disabled = false;
  @Input() value: string;
  @Input() buttonname;
  @Input() iconstyle:string;
  @Input() class:string;
  @Input() id: string;
  @Output() onclick = new EventEmitter();

  
  constructor() { }

  ngOnInit() {
  }
  onBtnClick(event) {
    if (!checkNullorUndefined(event) && !checkNullorUndefined(event.target)) {
      event.target.blur();
    }
    this.onclick.emit();
  }
  writeValue(value: any) {}

  registerOnChange(fn: any) {}

  registerOnTouched() {}
}
