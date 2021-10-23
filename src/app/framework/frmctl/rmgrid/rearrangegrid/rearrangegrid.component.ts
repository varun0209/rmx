import { Component, Inject, OnInit } from '@angular/core';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { checkNullorUndefined } from '../../../../enums/nullorundefined';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MasterPageService } from '../../../../utilities/rlcutl/master-page.service';

@Component({
  selector: 'app-rearrangegrid',
  templateUrl: './rearrangegrid.component.html',
  styleUrls: ['./rearrangegrid.component.css']
})
export class RearrangegridComponent implements OnInit {

  outputData = [];
  onClose: any;
  isOKDisabled= true;

  constructor(
    public masterPageService: MasterPageService,
    @Inject(MAT_DIALOG_DATA) public data: {inputData: any},
    public dialogRef: MatDialogRef<RearrangegridComponent>,
    ) {
     }

  ngOnInit() {
  }

  updateChanges(){
    if(!checkNullorUndefined(this.outputData) && this.outputData.length){
      this.dialogRef.close(this.outputData);
    }
  }

    drop(event: CdkDragDrop<string[]>) {
      if (event.previousContainer === event.container) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      } else {
        transferArrayItem(event.previousContainer.data,
                          event.container.data,
                          event.previousIndex,
                          event.currentIndex);
      }
    }

}
