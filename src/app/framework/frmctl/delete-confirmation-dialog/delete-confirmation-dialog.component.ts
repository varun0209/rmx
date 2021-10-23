import { MasterPageService } from './../../../utilities/rlcutl/master-page.service';
import { Component, OnInit, Output, EventEmitter, ViewChild, TemplateRef } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-confirmation-dialog',
  templateUrl: './delete-confirmation-dialog.component.html',
  styleUrls: ['./delete-confirmation-dialog.component.css']
})
export class DeleteConfirmationDialogComponent implements OnInit {
  @Output() emitConfirmation = new EventEmitter();
  constructor(
    public masterPageService: MasterPageService,
    private dialogRef: MatDialogRef<DeleteConfirmationDialogComponent>
  ) { }

  ngOnInit() {
  }

  confirmation(event) {
    this.emitConfirmation.emit(event);
  }


}
