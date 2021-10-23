import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ViewChildren } from '@angular/core';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiConfigService } from '../../utilities/rlcutl/api-config.service';
import { AppService } from '../../utilities/rlcutl/app.service';
import { String } from 'typescript-string-operations';
import { ContainerSummaryComponent } from '../../framework/busctl/container-summary/container-summary.component';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';
import { TransactionService } from '../../services/transaction.service';
import { ClientData } from '../../models/common/ClientData';
import { UiData } from '../../models/common/UiData';
import { StatusCodes } from '../../enums/status.enum';
import { Transaction } from '../../models/testing/Transaction';
import { DropDownSettings } from '../../models/common/dropDown.config';
import { CommonService } from '../../services/common.service';
import { MultiSelectComponent } from 'ng-multiselect-dropdown';
import { checkNullorUndefined } from '../../enums/nullorundefined';
import { ContainerProcessConfirmationComponent } from '../../dialogs/container-process-confirmation/container-process-confirmation.component';

@Component({
  selector: 'app-container-process',
  templateUrl: './container-process.component.html',
  styleUrls: ['./container-process.component.css']
})
export class ContainerProcessComponent implements OnInit, OnDestroy {

  @ViewChild(ContainerSummaryComponent) contsummaryParent: ContainerSummaryComponent;
  @ViewChild('containerConfirmation') containerConfirmation: ElementRef;
  @ViewChild('transation') transaction: MultiSelectComponent;

  transactionList: Transaction[];
  transactions: Transaction[];
  isTransactionDisabled = true;
  isRecordDisabled = true;
  isClearDisabled = true;
  containerPopupMessage: any;

  // inbound properties
  inbContainerID = "";
  headingsobj = [];
  inboundProperties: any;
  multipleContainerList: any;
  inboundContainerId: string;

  operationObj: any;
  clientData = new ClientData();
  uiData = new UiData();

  dropdownSettings: DropDownSettings;
  operationId: string;

  constructor(
    private apiConfigService: ApiConfigService,
    private spinner: NgxSpinnerService,
    private snackbar: XpoSnackBar,
    public appErrService: AppErrorService,
    public masterPageService: MasterPageService,
    public appService: AppService,
    public transactionService: TransactionService,
    public commonService: CommonService
  ) {
  }

  ngOnInit() {
    this.operationObj = this.masterPageService.getRouteOperation();
    if (this.operationObj) {
      this.uiData.OperationId = this.operationObj.OperationId;
      this.uiData.OperCategory = this.operationObj.Category;
      this.operationId = this.operationObj.OperationId;
      this.clientData = JSON.parse(localStorage.getItem("clientData"));
      this.masterPageService.setTitle(this.operationObj.Title);
      this.masterPageService.setModule(this.operationObj.Module);
      this.dropdownSettings = new DropDownSettings();
      this.dropdownSettings.idField = 'TransId';
      this.dropdownSettings.textField = 'Description';
    }
  }
  //operationId
  setCurrentOperationId(operationId) {
    this.uiData.OperationId = operationId;
  }

  //containerSummaryProperties
  containerSummaryProperties(event: any) {
    this.headingsobj = [];
    this.headingsobj = Object.keys(event);
    this.inboundProperties = event;
  }

  getAutoPopulatedSerailNum(event: any) {
    if (!checkNullorUndefined(event) && event != '') {
      // whirpool
    } else {
      this.getTransactionList();
    }
  }

  getContainerList(event) {
    this.multipleContainerList = event;
  }

  //inbContainerID
  getinbContainerID(inbcontid) {
    this.inbContainerID = inbcontid;
  }

  getTransactionList() {
    let requestObj = { ClientData: this.clientData, UIData: this.uiData };
    let url = String.Join("/", this.apiConfigService.getContainerTransactions, this.inbContainerID);
    this.commonService.commonApiCall(url, requestObj, (res) => {
      if (!checkNullorUndefined(res.Response)) {
        this.transactionList = res.Response;
        this.dropdownSettings.itemsShowLimit = this.transactionList.length;
        this.isTransactionDisabled = false;
        this.appService.setFocus('transaction');
        this.spinner.hide();
      }
    });
  }

  onItemDeSelect() {
    if (this.transactions.length === 0) {
      this.clear();
    }
  }

  deSelectCheckBox() {
    this.transactions.pop();
    let lastestTrans = this.transactions;
    this.transactions = lastestTrans.slice(0);
    this.onItemDeSelect();
  }

  getRecordData() {
    this.transaction.closeDropdown();
    let requestObj = { ClientData: this.clientData, UIData: this.uiData, Transaction: this.transactions[this.transactions.length - 1] };
    const url = String.Join("/", this.apiConfigService.checkContainerTransaction, this.inbContainerID);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (!checkNullorUndefined(res.Response)) {
        this.masterPageService.openModelPopup(ContainerProcessConfirmationComponent, false, 'dialog-width-sm', {
          data: {"containerPopupMessage": res.Response }})
        this.masterPageService.dialogRef.componentInstance.emitDeSelectCheckBox.subscribe(($e) => {
          this.deSelectCheckBox();
        });
      }
      if (statusFlag) {
        this.isRecordDisabled = false;
        this.isClearDisabled = false;
        this.spinner.hide();
      }
    });
  }

  recordTransation() {
    this.spinner.show();
    this.appErrService.clearAlert();
    let requestObj = { ClientData: this.clientData, UIData: this.uiData, ContainerTransactions: this.transactions };
    const url = String.Join("/", this.apiConfigService.recordContainerTransaction, this.inbContainerID);
    this.commonService.commonApiCall(url, requestObj, (res) => {
      if (!checkNullorUndefined(res.Response)) {
        this.snackbar.success(res.Response);
        this.resetClear();
        this.spinner.hide();
      }
    });
  }

  //reset button click
  resetClear() {
    this.clear();
    this.masterPageService.inboundContainerFocus();
    this.masterPageService.disabledContainer = false;
    this.clearContainerSummary();
    if (!checkNullorUndefined(this.contsummaryParent)) {
      this.contsummaryParent.containersList = [];
      this.contsummaryParent.deviceList = [];
      this.contsummaryParent.containerSummaryPropertiesList = [];
      this.contsummaryParent.canAllowNextContainerStatus = null;
      this.contsummaryParent.containerSummaryProperties = [];
      this.contsummaryParent.containerActualProp = null;
    }
    this.headingsobj = [];
    this.inboundProperties = null;
    this.isTransactionDisabled = true;
    this.transactionList = [];
    this.uiData.OperationId = this.operationId;
  }


  clear() {
    this.isClearDisabled = true;
    this.appErrService.clearAlert();
    this.transactions = [];
    this.isRecordDisabled = true;
  }


  private clearContainerSummary() {
    if (!checkNullorUndefined(this.contsummaryParent)) {
      this.contsummaryParent.inbContainerDisabled = false;
      this.contsummaryParent.rmtextchild.value = "";
      this.contsummaryParent.quantity = "";
      this.contsummaryParent.category = "";
      this.contsummaryParent.isClearDisabled = true;
    }
  }


  ngOnDestroy() {
    this.masterPageService.disabledContainer = true;
    //clearing the readOnlyDevice subscription methods data
    if (this.contsummaryParent) {
      if (this.contsummaryParent.dialogRef) {
        this.contsummaryParent.dialogRef.close();
      }
    }
    this.masterPageService.defaultProperties();
  }


}



