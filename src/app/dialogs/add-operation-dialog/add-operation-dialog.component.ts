import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';

@Component({
  selector: 'app-add-operation-dialog',
  templateUrl: './add-operation-dialog.component.html',
  styleUrls: ['./add-operation-dialog.component.css']
})
export class AddOperationDialogComponent implements OnInit {
  @Output() emitAddOperationData = new EventEmitter();
  appConfig: any;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
  public masterPageService: MasterPageService) { }

  ngOnInit(): void {
    if (this.data) {
      this.appConfig = this.data.appConfig
    }
  }

  addOperationData(event) {
    this.emitAddOperationData.next(event);
  }

}
