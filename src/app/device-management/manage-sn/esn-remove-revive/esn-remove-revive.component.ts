import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { DeviceModes } from '../../../../app/enums/deviceManagment.enum';
import { MasterPageService } from '../../../../app/utilities/rlcutl/master-page.service';
@Component({
  selector: 'app-esn-remove-revive',
  templateUrl: './esn-remove-revive.component.html',
  styleUrls: ['./esn-remove-revive.component.css']
})
export class EsnRemoveReviveComponent implements OnInit {

  @Output() emitClear = new EventEmitter();
  @Output() emitProcess = new EventEmitter();
  @Output() emitComment = new EventEmitter();
  @Output() emitDaysToExpire = new EventEmitter();
  @Input() isProcessDisabled = true;
  @Input() isDaysToExpireDisabled = true;
  @Input() daysToExpire: any[];
  @Input() selectedDay: string;
  @Input() selectedDeviceMode: string;
  deviceModes = DeviceModes;

  comments: string;
 

  constructor(public masterPageService:MasterPageService) { }

  ngOnInit() {
  }

  process() {
    this.emitProcess.emit();
  }

  onSelectedReason() {
    this.emitComment.emit(this.comments);
  }

  esnRemoveReviveClear() {
    this.comments = '';
    this.selectedDay = '';
    this.emitClear.emit();
  }

  changeDaysToExpire(event) {
    this.emitDaysToExpire.emit(event.value);
  }
}
