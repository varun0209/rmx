import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { checkNullorUndefined } from '../../../enums/nullorundefined';

@Component({
  selector: 'rmcontrol-display',
  templateUrl: './rmcontrol-display.component.html',
  styleUrls: ['./rmcontrol-display.component.css']
})
export class RmcontrolDisplayComponent implements OnInit {
  @Input() value: string;
  @Input() label: string;
  @Input() iconStyle: string;
  @Input() divStyle:string;
  @Input() isIconDisabled: boolean;
  @Output() iconEventEmit = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  showIcon() {
    if (!checkNullorUndefined(this.isIconDisabled)) {
      return true;
    }
  }
  onClick() {
    this.iconEventEmit.emit();
  }

}
