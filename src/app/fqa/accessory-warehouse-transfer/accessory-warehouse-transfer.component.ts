import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { CommonEnum } from '../../enums/common.enum';
import { StatusCodes } from '../../enums/status.enum';
import { StorageData } from '../../enums/storage.enum';
import { ClientData } from '../../models/common/ClientData';
import { Grid } from '../../models/common/Grid';
import { UiData } from '../../models/common/UiData';
import { CommonService } from '../../services/common.service';
import { ApiConfigService } from '../../utilities/rlcutl/api-config.service';
import { ApiService } from '../../utilities/rlcutl/api.service';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';
import { AppService } from '../../utilities/rlcutl/app.service';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';
import { MessagingService } from '../../utilities/rlcutl/messaging.service';
import { String, StringBuilder } from 'typescript-string-operations';
import { Observable, Subscription, interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { RmtextboxComponent } from '../../framework/frmctl/rmtextbox/rmtextbox.component';
import { SKU } from '../../models/receiving/ReceivingDevice';
import { AccessoryPartsList } from '../../models/fqa/AccessoryPartsList';
import { Message } from '../../models/common/Message';
import { MessageType } from '../../enums/message.enum';

@Component({
  selector: 'app-accessory-warehouse-transfer',
  templateUrl: './accessory-warehouse-transfer.component.html',
  styleUrls: ['./accessory-warehouse-transfer.component.css']
})
export class AccessoryWarehouseTransferComponent implements OnInit, OnDestroy {

  @ViewChild('part') partInput: RmtextboxComponent;

  isContainerDisabled = false;
  containerId: string;
  ispartNoDisabled = true;
  partNo: string;
  countCase = null;
  CaseCntEnable: string;
  TotalCount: number;
  totalCaseCount: number;
  defaultCaseValue = 0;
  isCountCaseDisabled: boolean = true;
  batchId: string;
  operationObj: any;
  controlConfig: any;
  appConfig: any;
  accessoryPartList: AccessoryPartsList[];
  accessoryListItems: any;
  accessoryResponse: any;
  verifiedPartNumber = '';
  isVerifyDisabled: boolean = true;


  // que grid
  grid: Grid;
  processQueData = [];
  batchQueData = [];
  pollingData: any;
  clear: any;

  // buttons 
  isResetDisabled = true;
  isClearDisabled = true;
  disableProcess = true;

  messageNum: string;

  // object declaration
  clientData = new ClientData();
  uiData = new UiData();


  constructor(
    private apiService: ApiService,
    private apiConfigService: ApiConfigService,
    private spinner: NgxSpinnerService,
    private snackbar: XpoSnackBar,
    public appErrService: AppErrorService,
    public masterPageService: MasterPageService,
    private messagingService: MessagingService,
    private appService: AppService,
    private commonService: CommonService) { }

  ngOnInit() {
    this.operationObj = this.masterPageService.getRouteOperation();
    if (this.operationObj) {
      this.uiData.OperationId = this.operationObj.OperationId;
      this.uiData.OperCategory = this.operationObj.Category;
      this.masterPageService.setTitle(this.operationObj.Title);
      this.masterPageService.setModule(this.operationObj.Module);
      localStorage.setItem(StorageData.module, this.operationObj.Module);
      this.masterPageService.setCardHeader(CommonEnum.processQueue);
      this.controlConfig = JSON.parse(localStorage.getItem(StorageData.controlConfig));
      this.appConfig = JSON.parse(localStorage.getItem(StorageData.appConfig));
      this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
      this.masterPageService.operationObj = this.operationObj;
      this.appErrService.appMessage();
      this.appService.setFocus('containerId');
      this.getProcessQueue();
    }
  }



  // get process que
  getProcessQueue() {
    this.batchQueData = [];
    this.spinner.show();
    const timeinterval: number = this.appConfig.fqa.queueInterval;
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getBatchQueueUrl);
    this.clear = document.getElementById('stopProcessQueue');
    // const stop$ = fromEvent(this.clear, 'click');
    this.pollingData = interval(timeinterval).pipe(
      startWith(0),
      switchMap(() => this.apiService.apiPostRequest(url, requestObj)))
      .subscribe(response => {
        const res = response.body;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          this.batchQueData = res.Response;
          this.onProcessQueGenerateJsonGrid(res.Response);
          this.grid = new Grid();
          this.grid.SearchVisible = false;
          this.masterPageService.tempQueList = this.appService.onGenerateJson(this.processQueData, this.grid);
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.spinner.hide();
          this.masterPageService.tempQueList = null;
          this.pollingData.unsubscribe();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          this.snackbar.error(res.ErrorMessage.ErrorDetails);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }


  onProcessQueGenerateJsonGrid(Response) {
    if (!this.appService.checkNullOrUndefined(Response)) {
      this.processQueData = [];
      Response.forEach(res => {
        const element: any = {};
        element.BatchId = res.BatchId;
        element.Container = res.ContainerId;
        element.Status = res.Status;
        element.Remarks = res.Remarks;
        element.WTContainerId = res.WTContainerId;
        element.WTReceiptKey = res.WTReceiptKey;
        this.processQueData.push(element);
      });
    }
  }

  validateTransfer(inpcontrol: RmtextboxComponent) {
    if (this.containerId) {
      this.isContainerDisabled = true;
      this.spinner.show();
      const requestObj = { ClientData: this.clientData, UIData: this.uiData };
      const url = String.Join('/', this.apiConfigService.validateAccessoryContainerUrl, this.containerId);
      this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
        if (statusFlag && !this.appService.checkNullOrUndefined(res.Response)) {
          if (res.Response.hasOwnProperty('Accessories')) {
            this.accessoryResponse = res.Response.Accessories;
            this.accessoryPartsGrid(res.Response.Accessories.AccTrans);
            const grid = new Grid();
            this.accessoryListItems = this.appService.onGenerateJson(this.accessoryPartList, grid);
          }
          this.TotalCount = res.Response.TotalCount;
          this.CaseCntEnable = res.Response.CaseCntEnable;
          if (res.Response.hasOwnProperty('Accessories') && res.Response.Accessories.AccTrans.length === 1
           && (this.appService.checkNullOrUndefined(res.Response.Accessories.AccTrans[0].Remarks) || res.Response.Accessories.AccTrans[0].Remarks == '')) {
            this.partNo = res.Response.Accessories.AccTrans[0].SKU;
            this.partVerification(this.partInput, this.partNo);
          } else {  
            this.spinner.hide();          
            this.ispartNoDisabled = false;
            this.partNumberFocus();
            if (this.CaseCntEnable == "Y") {
              this.isCountCaseDisabled = false;
            }
          }
        } else {
          this.isContainerDisabled = false;
          inpcontrol.applyRequired(true);
          inpcontrol.applySelect();
        }
      });
    }
  }

  validateCaseCaount() {
    if (this.countCase) {
      if (this.countCase === this.TotalCount) {
        this.accessoryListItems['Elements'].forEach((element, i) => {
          element.Verify = "Y";
        });
        this.disableProcess = true;
      }
      const requestObj = { ClientData: this.clientData, UIData: this.uiData, Accessories: this.accessoryResponse };
      const url = String.Join('/', this.apiConfigService.validateAccessoryCaseCountUrl, this.countCase);
      this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
        this.spinner.hide();
        if (statusFlag && !this.appService.checkNullOrUndefined(res.Response)) {

          if (res.Response.hasOwnProperty('Accessories')) {
            this.accessoryResponse = res.Response.Accessories;
          }
          this.totalCaseCount = res.Response.CaseCount;
          this.TotalCount = res.Response.TotalCount;
          this.batchId = res.Response.BatchId;
          this.ispartNoDisabled = true;
          this.isCountCaseDisabled = true;
          if (res.Response.ProcessEnable === 'Y') {
            this.partNo = '';
            this.ispartNoDisabled = true;
            this.disableProcess = false;
            this.processFocus();
          }
        }
      });

    }
  }

  // validating parts from list 
  partVerification(inputControl: RmtextboxComponent, value) {
    if (this.isCountCaseDisabled === false) {
      this.countCase = null;
    }
    inputControl.applyRequired(false);
    this.appErrService.clearAlert();
    let part = this.accessoryListItems['Elements'].find(x => (x.SKU == this.partNo));
    if (!this.appService.checkNullOrUndefined(part)) {
      this.accessoryListItems['Elements'].forEach(element => {
        if (this.defaultCaseValue == 0) {
          this.countCase = (this.countCase !== null ? 0 : this.countCase)
        }
        if (element.SKU == this.partNo && (this.appService.checkNullOrUndefined(element.Remarks) || element.Remarks == '')) {
          if (element.Verify == "N") {
            element.Verify = 'Y';
            //increment the case count only if countCase is less than Total count value(from validatefqa serial # api response)....compare against TotalCount variable
            if (this.countCase < this.TotalCount) {
              this.countCase++;
              this.isCountCaseDisabled = true;
              this.partNo = "";
              this.partNumberFocus();
            }
          }
          else {
            inputControl.applyRequired(true);
            this.appErrService.setAlert(this.appService.getErrorText('3720017'), true);
          }
        }
        this.defaultCaseValue++;
      });
      if (this.countCase == this.TotalCount) {
        this.validateCaseCaount();
      }
    } else {
      this.ispartNoDisabled = false;
      inputControl.applyRequired(true);
      inputControl.applySelect();
      let userMessage = new Message();
      this.messageNum = "3720050";
      userMessage = this.messagingService.SendUserMessage(this.messageNum, MessageType.failure);
      this.appErrService.setAlert(userMessage.messageText, true);
    }

  }

  process() {
    if (this.batchId) {
      this.spinner.show();
      const requestObj = { ClientData: this.clientData, UIData: this.uiData, Accessories: this.accessoryResponse };
      const url = String.Join('/', this.apiConfigService.processAccessoryUrl, this.batchId);
      this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
        this.spinner.hide();
        if (statusFlag && !this.appService.checkNullOrUndefined(res.Response)) {
          this.snackbar.success(res.Response);
        }
        this.reset();
      });
    }
  }

  //**processing grid**//
  accessoryPartsGrid(dataGrid) {
    if (!this.appService.checkNullOrUndefined(dataGrid)) {
      this.accessoryPartList = [];
      dataGrid.forEach(res => {
        let element: AccessoryPartsList = new AccessoryPartsList();
        element.SKU = res.SKU;
        element.Remarks = res.Remarks;
        element.Verify = 'N';
        this.accessoryPartList.push(element);
      });
    }
  }


  // clearing serialnumber verfication
  clearPartVerification() {
    if (this.accessoryListItems && this.accessoryListItems['Elements']) {
      this.accessoryListItems['Elements'].forEach((element, i) => {
        element.Verify = 'N';
      });
    }
  }



  onChangeContainerId(event) {
    this.appErrService.clearAlert();
    this.isResetDisabled = false;
  }

  containerEmptyValue() {
    this.isResetDisabled = true;
  }

  onChangepartNo() {
    this.isClearDisabled = false;
    this.appErrService.clearAlert();
  }


  caseCountinputChange() {
    this.isClearDisabled = false;
    this.caseCountBorder(false);
    this.appErrService.clearAlert();
  }

  // casecount validation error
  caseCountBorder(val: boolean) {
    if (val) {
      let elem: HTMLElement = document.getElementById('caseCount');
      return elem.setAttribute("style", "border: 1px solid red;");
    }
    else {
      let elem: HTMLElement = document.getElementById('caseCount');
      return elem.removeAttribute('style');
    }
  }

  onCaseCountBlur() {
    this.caseCountBorder(false);
  }

  //inbound container focus
  inboundContainerFocus() {
    this.appService.setFocus('containerId');
  }
  //Part Number Focus
  partNumberFocus() {
    this.appService.setFocus('partNo');
  }

  processFocus() {
    this.appService.setFocus('process');
  }

  reset() {
    this.isResetDisabled = true;
    this.isContainerDisabled = false;
    this.containerId = '';
    this.clearSku();
    this.ispartNoDisabled = true;
    this.isCountCaseDisabled = true;
    this.accessoryPartList = [];
    this.accessoryListItems = null;
    this.accessoryResponse = null;
    this.inboundContainerFocus()
  }

  clearSku() {
    // clear
    this.appErrService.clearAlert();
    this.isClearDisabled = true;
    this.partNo = '';
    this.ispartNoDisabled = false;
    this.isCountCaseDisabled = false;
    this.countCase = null;
    this.batchId = '';
    this.defaultCaseValue = 0;
    this.disableProcess = true;
    this.clearPartVerification();
    this.partNumberFocus();
  }

  ngOnDestroy() {
    if (this.pollingData != undefined) {
      this.pollingData.unsubscribe();
      this.clear.click();
    }
    this.masterPageService.tempQueList = null;
    this.masterPageService.defaultProperties();
  }


}
