import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { checkNullorUndefined } from '../../../enums/nullorundefined';
import { MasterPageService } from '../../../utilities/rlcutl/master-page.service';

@Component({
  selector: 'app-rmtimmerout',
  templateUrl: './rmtimmerout.component.html',
  styleUrls: ['./rmtimmerout.component.css']
})
export class RmtimmeroutComponent implements OnInit {
  timmerCount: any;
  waitngTime: any;
  
  constructor(public masterPageService : MasterPageService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<RmtimmeroutComponent>,
  ) { }

  ngOnInit() { 
    if(!checkNullorUndefined(this.data.waitngTime)){
      this.waitngTime = this.data.waitngTime;
    }
   }

  modelClose(value) {
    this.dialogRef.close(value);
  }

}
