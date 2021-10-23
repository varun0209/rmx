import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';

@Component({
  selector: 'app-container-summary-dialog',
  templateUrl: './container-summary-dialog.component.html',
  styleUrls: ['./container-summary-dialog.component.css']
})
export class ContainerSummaryDialogComponent implements OnInit {
  title: any;
  serialNumbers: any;
  flag: any;
  modelTittle: any;
  isModalOpen: any;

  constructor(@Inject(MAT_DIALOG_DATA,) public data: any,
    public masterPageService: MasterPageService) { }

  ngOnInit(): void {
    if (this.data) {
      this.title = this.data.title;
      this.serialNumbers = this.data.serialNumbers;
      this.flag = this.data.flag;
      this.modelTittle = this.data.modelTittle;
      this.isModalOpen = this.data.isModalOpen;
    }
  }

}
