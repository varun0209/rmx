import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';

@Component({
  selector: 'app-container-process-confirmation',
  templateUrl: './container-process-confirmation.component.html',
  styleUrls: ['./container-process-confirmation.component.css']
})
export class ContainerProcessConfirmationComponent implements OnInit {
  @Output() emitDeSelectCheckBox = new EventEmitter();
  containerPopupMessage: any;

  constructor(public masterPageService: MasterPageService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    if (this.data) {
      this.containerPopupMessage = this.data.containerPopupMessage;
    }
  }

  deSelectCheckBox() {
    this.emitDeSelectCheckBox.next();
  }

}
