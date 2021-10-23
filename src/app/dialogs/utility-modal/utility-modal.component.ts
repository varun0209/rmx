import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OperationEnum } from '../../enums/operation.enum';

@Component({
  selector: 'app-utility-modal',
  templateUrl: './utility-modal.component.html',
  styleUrls: ['./utility-modal.component.css']
})
export class UtilityModalComponent implements OnInit {

  operation = OperationEnum;
  utilityTitle: any;
  modeltitle: any;
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    if(this.data) {
      this.utilityTitle =  this.data.utilityTitle;
      this.modeltitle =  this.data.modeltitle;
    }
  }

}
