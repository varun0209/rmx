import { Component, OnInit, OnChanges, Inject } from '@angular/core';
import { MasterPageService } from '../../../utilities/rlcutl/master-page.service';
import { AppErrorService } from '../../../utilities/rlcutl/app-error.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { FindTraceInfo } from '../../../models/common/TraceFound';
import { TraceStatus } from '../../../enums/traceStatus.enum';
import { CommonService } from '../../../services/common.service';
import { StatusCodes } from '../../../enums/status.enum';
import { checkNullorUndefined } from '../../../enums/nullorundefined';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';



@Component({
  selector: 'app-find-trace-hold',
  templateUrl: './find-trace-hold.component.html',
  styleUrls: ['./find-trace-hold.component.css']
})
export class FindTraceHoldComponent implements OnInit, OnChanges {

  traceInfo= new FindTraceInfo();
  uiData: any;
  traceStatus = TraceStatus;
  isOkDisabled = true;
  isClearDisabled = true;
  // onClose: any;
  statusCode = StatusCodes;


  constructor(
    public masterPageService: MasterPageService,
    public appErrService: AppErrorService,
    private spinner: NgxSpinnerService,
    public commonService: CommonService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<FindTraceHoldComponent>,
    ) {
      
      spinner.hide();
     }

  ngOnInit() {
    if(!checkNullorUndefined(this.data.modalData)){
        this.traceInfo = this.data.modalData.Response.TraceHold;
        this.uiData = this.data.modalData.Response.uiData;
      }
    if(this.traceInfo.Status == this.traceStatus.active){
      this.isOkDisabled = true;
    }else if(this.traceInfo.Status == this.traceStatus.found){
      this.isOkDisabled = false;
    }
  }

  ngOnChanges(){

  }

  updateCheck(){
    if(this.traceInfo.Status == this.traceStatus.active){
      this.uiData = this.data.modalData.uiData;
      let result = this.commonService.updateTraceNotes(this.traceInfo,this.uiData);
      result.subscribe(response => {
        if ( !checkNullorUndefined(response) && response.Status === this.statusCode.pass) {
          this.spinner.hide();
          this.dialogRef.close(response);
        }
        else if (!checkNullorUndefined(response) && response.Status === this.statusCode.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(response.ErrorMessage.ErrorDetails, true);
        }
      })
      }
    else if (this.traceInfo.Status == this.traceStatus.found){
      this.dialogRef.close(this.data.modalData);
    }
  }

  Clear(){
    this.traceInfo.FoundNotes = '';
  }

  changeNotesInput(input){
    if(input == ''){
      this.isClearDisabled = true;
      this.isOkDisabled = true;
    }else{
      this.isClearDisabled = false;
      this.isOkDisabled = false;
    }
  }
  
}