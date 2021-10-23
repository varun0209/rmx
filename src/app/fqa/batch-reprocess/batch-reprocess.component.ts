import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ApiService } from '../../utilities/rlcutl/api.service';
import { ApiConfigService } from '../../utilities/rlcutl/api-config.service';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';
import { MessagingService } from '../../utilities/rlcutl/messaging.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';
import { AppService } from '../../utilities/rlcutl/app.service';
import { Grid } from '../../models/common/Grid';
import { RmtextboxComponent } from '../../framework/frmctl/rmtextbox/rmtextbox.component';
import { RmgridComponent } from '../../framework/frmctl/rmgrid/rmgrid.component';
import { FqaDetailsList } from './../../models/fqa/FqaDetailsList';
import { String } from 'typescript-string-operations';
import { MessageType } from '../../enums/message.enum';
import { Message } from '../../models/common/Message';
import { dropdown } from '../../models/common/Dropdown';
import { ClientData } from '../../models/common/ClientData';
import { UiData } from '../../models/common/UiData';
import { StorageData } from '../../enums/storage.enum';
import { StatusCodes } from '../../enums/status.enum';
import { checkNullorUndefined } from '../../enums/nullorundefined';

@Component({
  selector: 'app-batch-reprocess',
  templateUrl: './batch-reprocess.component.html',
  styleUrls: ['./batch-reprocess.component.css']
})
export class BatchReprocessComponent implements OnInit {
  @ViewChild(RmtextboxComponent) rmtextchild: RmtextboxComponent;
  @ViewChild(RmgridComponent) rmgrid: RmgridComponent;


  operationObj: any;
  //client Control Labels
  clientData = new ClientData();
  uiData = new UiData();

  isbatchIddisabled: boolean = false;

  //grid
  grid: Grid;

  batchId: any;
  isClearDisabled: boolean = false;

  batchProcessList = [];
  batchDetailsList: FqaDetailsList[];
  storageData = StorageData;
  statusCode = StatusCodes;

  constructor(private apiService: ApiService,
    private apiConfigService: ApiConfigService,
    private spinner: NgxSpinnerService,
    private snackbar: XpoSnackBar,
    public appErrService: AppErrorService,
    public masterPageService: MasterPageService,
    private messagingService: MessagingService,
    private appService: AppService

  ) {

  }

  ngOnInit() {
    this.operationObj =  this.masterPageService.getRouteOperation();
    if(this.operationObj){
    this.uiData.OperationId = this.operationObj.OperationId;
    this.uiData.OperCategory = this.operationObj.Category;
    this.masterPageService.setTitle(this.operationObj.Title);
    this.masterPageService.setModule(this.operationObj.Module);
    this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
    this.batchIdFocus();
    }
  }

  //batchId Focus
  batchIdFocus() {
    this.appService.setFocus('batchId');
  }
    // eligible batch id statuses to scan are 500(error status) and 700(inventory update failure status)
  batchIdVerification(inputControl: RmtextboxComponent, value) {
    this.spinner.show();
    let requestObj = { ClientData: this.clientData, UIData:this.uiData};
    const url = String.Join("/", this.apiConfigService.getReprocessBatchDetails, value);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let res = response.body;
        this.spinner.hide();
        if (!checkNullorUndefined(res) &&  res.Status === this.statusCode.pass ) {
          let templist = {
            BatchId: res.Response.BatchId,
            Status: res.Response.Status,
            Remarks: res.Response.Remarks,
            ReceiptKey: res.Response.ReceiptKey,
            ContainerId: res.Response.ContainerId,
            ClientId: res.Response.ClientId
          }
          this.batchProcessList = [];
          this.batchProcessList.push(templist);
          this.batchReprocessGenerateJsonGrid(this.batchProcessList);
          this.grid = new Grid();
          this.batchDetailsList = this.appService.onGenerateJson(this.batchProcessList, this.grid);
          this.isbatchIddisabled = true;
          this.appService.setFocus('Reprocess');
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

  //batchReprocess json grid. 
  batchReprocessGenerateJsonGrid(Response: FqaDetailsList[]) {
    this.batchProcessList = [];
    if (!checkNullorUndefined(Response)) {
      let headingsobj = Object.keys(Response[0]);
      Response.forEach(res => {
        let element: FqaDetailsList = new FqaDetailsList();
        headingsobj.forEach(singleheader => {
          element[singleheader] = res[singleheader];
        })
        this.batchProcessList.push(element);
      });

    }
  }


// on reprocess of batch id with 500 status changes to status 300(queued)
// on reprocess of batch id with 700 status changes to status 700(no change)
  saveReprocess() {
    this.spinner.show();
    let requestObj = { ClientData: this.clientData, UIData:this.uiData };
    const url = String.Join("/", this.apiConfigService.reprocessBatch, this.batchId);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let res = response.body;
        this.spinner.hide();
        if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
          this.snackbar.success(res.Response);
          this.reprocessClear();
        }
        if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
          this.spinner.hide();
          this.snackbar.error(res.ErrorMessage.ErrorDetails);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });

  }

  //change input box
  changeInput(inputControl: RmtextboxComponent) {
    inputControl.applyRequired(false);
    this.appErrService.clearAlert();
  }

  reprocessClear() {
    this.batchId = "";
    this.batchDetailsList =null;
    this.isbatchIddisabled = false;
    this.batchIdFocus();

  }
  ngOnDestroy() {
    // localStorage.removeItem("operationObj");
    this.appErrService.clearAlert();
    this.masterPageService.moduleName.next(null);
    this.masterPageService.showUtilityIcon = false;
    this.masterPageService.hideModal();
  }
}
