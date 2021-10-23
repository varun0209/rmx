import { Component, Input, OnInit, Output, EventEmitter, OnChanges } from '@angular/core';

@Component({
  selector: 'rmddbtn',
  templateUrl: './rmddbtn.component.html',
  styleUrls: ['./rmddbtn.component.css']
})
export class RmddbtnComponent {


  @Input() ddBtnClass: string;
  @Input() ddBtnOptionsList: any;
  @Input() isEnableDynamicBtn = true;
  @Input() isDdBtnDisabled = true;
  @Output() ddBtnClick = new EventEmitter();
  @Output() selectedBtn = new EventEmitter();

  selectedBtnOption = '';
  options: any;

  constructor() { }

  optionBtnEvent(val) {
    this.ddBtnClick.emit(val);
  }

  changeDdBtnOptions(selectedOption) {
    this.selectedBtnOption = selectedOption;
    this.selectedBtn.emit(this.selectedBtnOption);
  }

}
