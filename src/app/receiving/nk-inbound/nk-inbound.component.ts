import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { AppErrorService } from './../../utilities/rlcutl/app-error.service';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiConfigService } from './../../utilities/rlcutl/api-config.service';
import { AppService } from './../../utilities/rlcutl/app.service';
import { String } from 'typescript-string-operations';
import { ContainerSummaryComponent } from './../../framework/busctl/container-summary/container-summary.component';
import { MasterPageService } from './../../utilities/rlcutl/master-page.service';
import { Grid } from '../../models/common/Grid';
import { TransactionService } from '../../services/transaction.service';
import { ClientData } from '../../models/common/ClientData';
import { UiData } from '../../models/common/UiData';
import { CommonService } from '../../services/common.service';
import { StorageData } from '../../enums/storage.enum';
import { StatusCodes } from '../../enums/status.enum';
import { CommonEnum } from '../../enums/common.enum';
import { ReceivingService } from '../../services/receiving.service';
import { AudioType } from '../../enums/audioType.enum';

@Component({
  selector: 'app-nk-inbound',
  templateUrl: './nk-inbound.component.html',
  styleUrls: ['./nk-inbound.component.css']
})

export class NkInboundComponent implements OnInit, OnDestroy {

  @ViewChild(ContainerSummaryComponent) contsummaryParent: ContainerSummaryComponent;

  // config
  operationObj: any;
  clientData = new ClientData();
  uiData = new UiData();

  // container props
  multipleContainerList: any;
  inbContainerID = '';

  // container batch props
  inboundProperties: any;
  headingsobj = [];

  // side panal props
  serialNumberList = [];
  grid: Grid;
  appConfig: any;

  // process
  isNKInboundProcessDisabled = true;
  colorCodeDetails = { ColorCode: '', Color: '' };
  operationId: string;

  constructor(
    private apiConfigService: ApiConfigService,
    private spinner: NgxSpinnerService,
    private snackbar: XpoSnackBar,
    public appErrService: AppErrorService,
    public masterPageService: MasterPageService,
    public appService: AppService,
    public transactionService: TransactionService,
    public receivingService: ReceivingService,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.operationObj = this.masterPageService.getRouteOperation();
    if (this.operationObj) {
      this.uiData.OperationId = this.operationObj.OperationId;
      this.uiData.OperCategory = this.operationObj.Category;
      this.operationId = this.operationObj.OperationId;
      this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
      this.masterPageService.containerDetailsHeader(CommonEnum.containerDetails);
      this.masterPageService.setTitle(this.operationObj.Title);
      this.masterPageService.setModule(this.operationObj.Module);
      this.appConfig = JSON.parse(localStorage.getItem(StorageData.appConfig));
    }
  }

   //operationId
   setCurrentOperationId(operationId) {
    this.uiData.OperationId = operationId;
}

  // containerSummaryProperties
  containerSummaryProperties(event) {
    this.headingsobj = [];
    this.headingsobj = Object.keys(event);
    this.inboundProperties = event;
  }

  // inbContainerID
  getinbContainerID(inbcontid) {
    this.inbContainerID = inbcontid;
  }

  getAutoPopulatedSerailNum() {
    this.isNKInboundProcessDisabled = false;
    this.appService.setFocus('processNKInbound');
    this.spinner.hide();
  }

  // CONTAINER LIST
  getContainerList(event) {
    this.multipleContainerList = event;
  }

  // clear inbound container properties
  private clearContainerSummary() {
    if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
      this.contsummaryParent.inbContainerDisabled = false;
      this.contsummaryParent.rmtextchild.value = '';
      this.contsummaryParent.quantity = '';
      this.contsummaryParent.category = '';
      this.contsummaryParent.isClearDisabled = true;
      this.contsummaryParent.deviceList = [];
      this.contsummaryParent.containersList = [];
      this.contsummaryParent.containerSummaryPropertiesList = [];
      this.contsummaryParent.canAllowNextContainerStatus = null;
      this.contsummaryParent.containerSummaryProperties = [];
      this.contsummaryParent.containerActualProp = null;
    }
  }

  // Inbound container props reset
  inboundContainerReset() {
    this.appErrService.clearAlert();
    this.headingsobj = [];
    this.inboundProperties = null;
    this.serialNumberList = [];
    this.inbContainerID = '';
    this.masterPageService.gridContainerDetails = null;
    this.multipleContainerList = null;
    this.clearContainerSummary();
    this.masterPageService.inboundContainerFocus();
    this.isNKInboundProcessDisabled = true;
    this.colorCodeDetails = { ColorCode: '', Color: '' };
    this.uiData.OperationId = this.operationId;
  }

  // Container details props
  getQueuedTestSerialNumbers() {
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, Containers: this.multipleContainerList };
    const url = String.Join('/', this.apiConfigService.getQueuedTestSerialNumbers);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.onProcessQueGenerateJsonGrid(res.Response);
        this.grid = new Grid();
        this.grid.ItemsPerPage = this.appConfig.testing.griditemsPerPage;
        this.masterPageService.gridContainerDetails = this.appService.onGenerateJson(this.serialNumberList, this.grid);
      }
    });
  }

  // update inbound detailes api
  updateNKInboundDevices() {
    const requestObj = {
      ClientData: this.clientData, UIData: this.uiData, Devices: this.contsummaryParent.deviceList, Container: this.multipleContainerList.length ? this.multipleContainerList[0] : null
    };
    const url = String.Join('/', this.apiConfigService.updateNKInboundDevices);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          this.inbContainerID = res.Response['Container'];
          this.contsummaryParent.deviceList = res.Response['Devices'];
          this.getTransactions();
        }
      }
    });
  }

  // get trans api
  getTransactions() {
    const requestObj = {
      ClientData: this.clientData,
      UIData: this.uiData,
      Devices: this.contsummaryParent.deviceList
    };
    this.commonService.commonApiCall(this.apiConfigService.recGetTransactionUrl, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          this.saveTransaction(res.Response);
          this.closeContainer();
          this.getReceiptColorCode();
        }
      }
    });
  }

  // Save transactions after add serial number
  saveTransaction(transList) {
    const result = this.receivingService.SaveTransaction(this.clientData, this.uiData, transList, this.contsummaryParent.deviceList);
    result.subscribe(response => {
      const res = response;
      if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
        this.spinner.hide();
        this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
      }
    }, erro => {
      this.appErrService.handleAppError(erro);
    });
  }

  // close container api
  closeContainer() {
    const requestObj = { ClientData: this.clientData, Container: this.inbContainerID, UIData: this.uiData };
    this.commonService.commonApiCall(this.apiConfigService.closeContainerUrl, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        this.snackbar.success(res.StatusMessage);
      }
    });
  }

  // get color code api
  getReceiptColorCode() {
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, Devices: this.contsummaryParent.deviceList };
    this.commonService.commonApiCall(this.apiConfigService.getReceiptColorCodeUrl, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.spinner.hide();
        this.isNKInboundProcessDisabled = true;
        this.colorCodeDetails = res.Response;
      }
    });
  }

  // Process que generation
  onProcessQueGenerateJsonGrid(Response) {
    if (!this.appService.checkNullOrUndefined(Response)) {
      const ChildElements = [];
      this.serialNumberList = [];
      Response.forEach(res => {
        const element: any = { ChildElements: ChildElements };
        element.SerialNumber = res.SerialNumber;
        element.Test = res.Test;
        element.Result = res.Result;
        element.NextTest = res.NextTest;
        element.CanMove = res.CanMove;
        element.Status = res.Status;
        this.serialNumberList.push(element);
      });
    }
  }

  ngOnDestroy() {
    this.inboundContainerReset();
    this.masterPageService.defaultProperties();
  }

}