import { Component, OnInit, forwardRef, Input, Output , EventEmitter} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'rmmultiselect',
  templateUrl: './rmmultiselect.component.html',
  styleUrls: ['./rmmultiselect.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RmmultiselectComponent),
      multi: true
    }]
})
export class RmmultiselectComponent implements OnInit, ControlValueAccessor {

  @Input() placeHolder: string;
  @Input() name:string;
  @Input() disabled: false;
  @Input() data: string;
  @Input() id: string;
  @Input() dropdownSettings: any;
  @Input() selectedItems: any;
  @Input() class: string;
  @Output() onSelectedItem = new EventEmitter();  
  @Output() onDeSelectItem = new EventEmitter();

  constructor() { }

  ngOnInit() {

  }

  onItemSelect(item: any) {
    this.onSelectedItem.emit(item);
  }

  onDeSelect(item: any) {
    this.onDeSelectItem.emit(item)
  }

  onSelectAll(items: any) { }

  writeValue(value: any) { }

  registerOnChange(fn: any) { }

  registerOnTouched() { }


}
