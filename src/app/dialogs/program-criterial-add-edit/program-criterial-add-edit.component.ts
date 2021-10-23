import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';

@Component({
  selector: 'app-program-criterial-add-edit',
  templateUrl: './program-criterial-add-edit.component.html',
  styleUrls: ['./program-criterial-add-edit.component.css']
})
export class ProgramCriterialAddEditComponent implements OnInit {
  appConfig: any;
  DialogData: any;
  textboxPattern: any;
  @Output() emitSave = new EventEmitter();

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
  private appErrService: AppErrorService) { }

  ngOnInit(): void {
    if (this.data) {
      alert();
      this.appConfig = this.data.appConfig,
        this.DialogData = this.data.DialogData,
        this.textboxPattern = this.data.textboxPattern
    }
  }

  changedName() {
    this.appErrService.clearAlert()
  }

  saveNameGroup() {
    this.emitSave.emit(this.DialogData);
  }
}
