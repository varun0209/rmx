import { Authorization } from './../../models/receiving/Authorization';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from './../../utilities/rlcutl/app.service';
import { MasterPageService } from './../../utilities/rlcutl/master-page.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppErrorService } from './../../utilities/rlcutl/app-error.service';
import { ApiConfigService } from './../../utilities/rlcutl/api-config.service';
import { ApiService } from './../../utilities/rlcutl/api.service';
import { Grid } from './../../models/common/Grid';
import { String } from 'typescript-string-operations';
import { RmtextboxComponent } from '../../framework/frmctl/rmtextbox/rmtextbox.component';
import { ClientData } from '../../models/common/ClientData';
import { Receipt } from '../../models/receiving/Receipt';
import { UiData } from '../../models/common/UiData';
import { StorageData } from '../../enums/storage.enum';
import { StatusCodes } from '../../enums/status.enum';
import { checkNullorUndefined } from '../../enums/nullorundefined';

@Component({
  selector: 'receipt-search',
  templateUrl: './receipt-search.component.html',
  styleUrls: ['./receipt-search.component.css']
})
export class ReceiptSearchComponent implements OnInit {

  @ViewChild(RmtextboxComponent) searchKeyInput: RmtextboxComponent;

  //Search Key
  searchInput: string;
  issearchKeyDisabled: boolean = false;
  externReceiptKey: string;
  receiptKey: string;

  //Authorization
  receiptList = [];
  receiptListResponse = [];
  receiptListDetails: any;
  editReceiptRow: any;


  authorization: Authorization;
  grid: Grid;
  clientData = new ClientData();
  uiData = new UiData();
  operationObj: any;
  appConfig: any;
  storageData = StorageData;
  statusCode = StatusCodes;

  constructor(public apiservice: ApiService,
    private apiConfigService: ApiConfigService,
    public appErrService: AppErrorService,
    private spinner: NgxSpinnerService,
    private masterPageService: MasterPageService,
    private appService: AppService,
    private router: Router) { }

  ngOnInit() {
    this.operationObj = this.masterPageService.getRouteOperation();
    if (this.operationObj) {
      this.uiData.OperationId = this.operationObj.OperationId;
      this.uiData.OperCategory = this.operationObj.Category;
      this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
      this.masterPageService.setTitle(this.operationObj.Title);
      this.masterPageService.setModule(this.operationObj.Module);
      this.appService.setFocus('searchKey');
      this.appConfig = JSON.parse(localStorage.getItem(this.storageData.appConfig));
      if (this.appService.checkDevice()) {
        this.router.navigate(['receive']);
      }
    }
  }

  //Search Based Key
  searchInputKey() {
    if (!(checkNullorUndefined(this.searchInput)) && this.searchInput !== "") {
      let requestObj = { ClientData: this.clientData, UIData: this.uiData };
      this.spinner.show();
      const url = String.Join('/', this.apiConfigService.searchReceiptAPI, this.searchInput.trim())
      this.apiservice.apiPostRequest(url, requestObj)
        .subscribe(response => {
          let res = response.body;
          this.spinner.hide();
          if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
            this.receiptList = res.Response;
            this.onAuthListGenerateJsonGrid(res.Response);
            this.grid = new Grid();
            this.grid.ItemsPerPage = this.appConfig.default.griditemsPerPage;
            this.grid.EditVisible = true;
            this.receiptListDetails = this.appService.onGenerateJson(this.receiptListResponse, this.grid);
          }
          else if (!checkNullorUndefined(res) && res.Status  !=  this.statusCode.pass) {
            this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
            this.searchKeyInput.applyRequired(true);
          }

        }, erro => {
          this.appErrService.handleAppError(erro);
        });
    }
  }

  //Change input box
  changeInput(inputControl: RmtextboxComponent) {
    this.receiptListDetails = null;
    inputControl.applyRequired(false);
    this.appErrService.clearAlert();
  }

  onAuthListGenerateJsonGrid(Response) {
    if (!checkNullorUndefined(Response)) {
      this.receiptListResponse = [];
      let headingsobj = Object.keys(Response[0]);
      Response.forEach(res => {
        let element: Receipt = new Receipt();
        // let element: Authorization = new Authorization() ;
        headingsobj.forEach(singleheader => {
          element[singleheader] = res[singleheader];
        })
        this.receiptListResponse.push(element);
      });
    }
  }

  editReceiptDetailRow(response) {
    localStorage.removeItem("Receipt_Key");
    this.editReceiptRow = this.receiptList.find(c => {
      if (c.Receiptkey == response.Receiptkey) {
        return c;
      }
    });
    let receiptSearchObj = { 'receiptKey': this.editReceiptRow.Receiptkey, 'ExternReceiptkey': this.editReceiptRow.ExternReceiptkey };
    localStorage.setItem(this.storageData.receiptSearchObj, JSON.stringify(receiptSearchObj));
    localStorage.setItem(this.storageData.receivingObj, JSON.stringify(this.operationObj));
    this.router.navigate(['receive']);
  }

  ngOnDestroy() {
    this.masterPageService.categoryName = null;
    this.masterPageService.moduleName.next(null);
    this.appErrService.clearAlert();
    this.masterPageService.clearModule();
    this.masterPageService.showUtilityIcon = false;
    this.masterPageService.hideModal();
  }
}
