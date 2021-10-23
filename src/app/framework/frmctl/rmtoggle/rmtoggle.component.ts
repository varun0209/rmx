import { Component, OnInit, forwardRef, Input, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonEnum } from './../../../enums/common.enum';

@Component({
  selector: 'rmtoggle',
  templateUrl: './rmtoggle.component.html',
  styleUrls: ['./rmtoggle.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RmtoggleComponent),
      multi: true
    }]
})
export class RmtoggleComponent implements OnInit, ControlValueAccessor {

  @Input() label: string;
  @Input() toggleval: boolean;
  @Input() toggleDivClass:string;
  @Input() togglelblClass:string;
  @Input() togglelblClassLabel:string;
  @Input() trueLabel = CommonEnum.lblYes;
  @Input() falseLabel = CommonEnum.lblNo;

  @Input() name: string;
  @Input() disabled: boolean;
  @Input() id: string;
  @Output() onChangeVal = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }



  onChangeData() {
    this.onChangeVal.emit(this.toggleval);
  }
  writeValue(value: any) { }

  registerOnChange(fn: any) { }

  registerOnTouched() { }

}
