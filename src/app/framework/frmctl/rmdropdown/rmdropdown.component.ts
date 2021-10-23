import { Component, OnInit, forwardRef, Input, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AppErrorService } from '../../../utilities/rlcutl/app-error.service';

@Component({
  selector: 'rmdropdown',
  templateUrl: './rmdropdown.component.html',
  styleUrls: ['./rmdropdown.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RmdropdownComponent),
      multi: true
    }]
})
export class RmdropdownComponent implements OnInit, ControlValueAccessor {

  @Input() multiple = false;
  @Input() required = false;
  @Input() disabled: boolean;
  @Input() value: string;
  @Input() id: string;
  options: any;
  @Input() dpOptions: any;
  @Input() name: string;
  @Input() class: string;
  @Input() description: string;
  @Output() onChangeVal = new EventEmitter();
  @Output() searchEventEmit = new EventEmitter();
  @Input() showSearchIcon = false;
  @Input() searchIconBtnDisabled = false;

  constructor(private appErrService: AppErrorService) {

  }

  ngOnInit() {
  }

  ngOnChanges() {
    this.options = [];
    this.options = this.dpOptions;
  }


  onChangeData(event) {
    this.appErrService.clearAlert();
    this.onChangeVal.emit(event);
  }

  onSearchClick() {
    this.appErrService.clearAlert();
    this.searchEventEmit.emit();
  }

  // Receive user input and send to search method**
  onKey(value) {
    this.options = this.search(value);
  }

  search(value: string) {
    let filter = value.toLowerCase();
    return this.dpOptions.filter(option => option.Text.toLowerCase().startsWith(filter));
  }
  
  writeValue(value: any) { }

  registerOnChange(fn: any) { }

  registerOnTouched() { }

}
