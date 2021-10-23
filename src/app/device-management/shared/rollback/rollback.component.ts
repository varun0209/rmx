import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AppService } from '../../../utilities/rlcutl/app.service';

@Component({
  selector: 'app-rollback',
  templateUrl: './rollback.component.html',
  styleUrls: ['./rollback.component.css']
})
export class RollbackComponent implements OnInit {
  @Input() gridProperties: any[] = [];
  @Output() checkedIndex = new EventEmitter();
  @Input() isRollbackDisabled = true;
  @Output() emitSaveOperation = new EventEmitter();
  @Output() clearRollbackData = new EventEmitter();
  @Input() buttonName: any;
  headingsobj = [];

  constructor(
    public appService: AppService
  ) { }

  ngOnInit() {
    this.gridProperties.forEach((element, index) => {
      element.selected = false;
    });
    this.headingsobj = Object.keys(this.gridProperties[0]);
  }

  getCheckId(selectedIndex, event: any) {
    if (this.gridProperties.length > 0) {
      this.gridProperties.forEach((element, index) => {
        if (selectedIndex != index) {
          element.selected = false;
        } else {
          element.selected = true;
        }
      });
    }
    this.checkedIndex.emit(event);
  }

  saveOperation() {
    this.emitSaveOperation.emit();
  }

  // Serial Number Focus
  serialNumberFocus() {
    this.appService.setFocus('serialNumber');
  }

  serialNumberClear() {
    this.clearRollbackData.emit();
  }

}
