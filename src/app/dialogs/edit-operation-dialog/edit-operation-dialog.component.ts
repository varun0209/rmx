import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-operation-dialog',
  templateUrl: './edit-operation-dialog.component.html',
  styleUrls: ['./edit-operation-dialog.component.css']
})
export class EditOperationDialogComponent implements OnInit {
  operationData: any;
  appConfig: any;
  @Output() emitSaveOperationData = new EventEmitter();

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    if(this.data){
      this.operationData = this.data.operationData
      this.appConfig = this.data.appConfig
    }
  }

  saveOperationData(event) {
    this.emitSaveOperationData.next(event)
  }

}
