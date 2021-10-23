import { Component, OnInit, OnDestroy } from '@angular/core';
import { RmtextboxComponent } from './../../framework/frmctl/rmtextbox/rmtextbox.component';
import { ApiService } from './../../utilities/rlcutl/api.service';
import { ApiConfigService } from './../../utilities/rlcutl/api-config.service';
import { AppErrorService } from './../../utilities/rlcutl/app-error.service';
import { AppService } from './../../utilities/rlcutl/app.service';
import { MasterPageService } from './../../utilities/rlcutl/master-page.service';
import { MessagingService } from './../../utilities/rlcutl/messaging.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { String } from 'typescript-string-operations';
import { Message } from './../../models/common/Message';
import { MessageType } from '../../enums/message.enum';
import { Grid } from './../../models/common/Grid';
import { ClientData } from '../../models/common/ClientData';
import { UiData } from '../../models/common/UiData';
import { StorageData } from '../../enums/storage.enum';
import { StatusCodes } from '../../enums/status.enum';
import { checkNullorUndefined } from '../../enums/nullorundefined';

@Component({
  selector: 'batch-detail',
  templateUrl: './batch-detail.component.html',
  styleUrls: ['./batch-detail.component.css']
})
export class BatchDetailComponent implements OnInit, OnDestroy {


  serialNumberBatch: string;
  isdisabledBatchSerialNumber: boolean = false;
  isClearDisabled: boolean = true;
  batchQueData = [];
  batchSerialNumberList: any;
  isbatchDetailDisabled: boolean = false;

  //client Control Labels
  clientData = new ClientData();
  uiData = new UiData();

  grid: Grid;
  storageData = StorageData;
  statusCode = StatusCodes;
  controlConfig: any;

  
   
  constructor(private apiService: ApiService,
    private apiConfigService: ApiConfigService,
    private spinner: NgxSpinnerService,
    private snackbar: XpoSnackBar,
    private appErrService: AppErrorService,
    public masterPageService: MasterPageService,
    private messagingService: MessagingService,
    private appService: AppService) {

  }

  ngOnInit() {
    this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
    if(this.masterPageService.operationObj){
      this.uiData.OperationId =this.masterPageService.operationObj.OperationId;
      this.uiData.OperCategory = this.masterPageService.operationObj.Category;
      this.controlConfig = JSON.parse(localStorage.getItem(this.storageData.controlConfig));
    }
  }


  ngOnDestroy() {
    this.serialNumberBatch = "";
    this.batchSerialNumberList = null;
    this.isClearDisabled = true;
    this.masterPageService.moduleName.next(null);
    this.masterPageService.operationObj=null;
    this.masterPageService.hideModal();
  }
  getBatchDetails(inputControl: RmtextboxComponent, value) {
    this.spinner.show();
    let requestObj = { ClientData: this.clientData,UIData:this.uiData };
    const url = String.Join("/", this.apiConfigService.getBatchDetails, value);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let res = response.body;
        this.spinner.hide();
        if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
          this.isbatchDetailDisabled = true;
          this.appService.setFocus('Clear');
          this.batchSerialNumberList = res.Response;
        }
        if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
          this.spinner.hide();
          inputControl.applyRequired(true);
          inputControl.applySelect();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          this.snackbar.error(res.ErrorMessage.ErrorDetails);
        }
      },
        error => {
          inputControl.applyRequired(true);
          inputControl.applySelect();
          this.appErrService.handleAppError(error);
        });
  }

  Clear() {
    this.serialNumberBatch = "";
    this.batchSerialNumberList = null;
    this.isbatchDetailDisabled = false;
    this.isClearDisabled = true;
    this.appErrService.clearAlert();
    this.appService.setFocus('batch');

  }

  //change input box
  changeInput(inputControl: RmtextboxComponent) {
    this.batchSerialNumberList = null;
    this.isClearDisabled = false;
    inputControl.applyRequired(false);
    this.appErrService.clearAlert();
  }


}
