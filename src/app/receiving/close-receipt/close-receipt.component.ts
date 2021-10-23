import { Authorization } from './../../models/receiving/Authorization';
import { Component, OnInit, OnDestroy, ViewChild, TemplateRef, ElementRef } from '@angular/core';
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
import { UiData } from '../../models/common/UiData';
import { TraceTypes } from '../../enums/traceType.enum';
import { CommonService } from '../../services/common.service';
import { MessageType } from '../../enums/message.enum';
import { FindTraceHoldComponent } from '../../framework/busctl/find-trace-hold/find-trace-hold.component';
import { StorageData } from '../../enums/storage.enum';
import { StatusCodes } from '../../enums/status.enum';
import { Receipt } from '../../models/receiving/Receipt';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { OperationEnum } from '../../enums/operation.enum';
import { CommonEnum } from '../../enums/common.enum';
import { MatDialog } from '@angular/material/dialog';
@Component({
    selector: 'app-close-receipt',
    templateUrl: './close-receipt.component.html',
    styleUrls: ['./close-receipt.component.css']
})
export class CloseReceiptComponent implements OnInit, OnDestroy {

    @ViewChild('searchKey') searchKey: ElementRef;

    // common props
    operationObj: any;
    clientData = new ClientData();
    uiData = new UiData();
    appConfig: any;


    // clear and reset props
    isResetBtnDisabled = true;
    isCloseButtonDisabled = true;

    // Search Key
    searchInput: string;

    // grid props
    authListDetails: any;
    receiptkey: string;
    cancelReceiptList = [];
    serialnumberList = [];
    serialnumberListCount = 0;
    grid: Grid;

    // popup props
    modeltitle: string;
    dialogRef: any;


    constructor(
        public apiservice: ApiService,
        private apiConfigService: ApiConfigService,
        public appErrService: AppErrorService,
        private spinner: NgxSpinnerService,
        private masterPageService: MasterPageService,
        private appService: AppService,
        private router: Router,
        private commonService: CommonService,
        private snackbar: XpoSnackBar,
        private dialog: MatDialog) { }

    ngOnInit() {
        this.operationObj = this.masterPageService.getRouteOperation();
        if (this.operationObj) {
            this.uiData.OperationId = this.operationObj.OperationId;
            this.uiData.OperCategory = this.operationObj.Category;
            this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
            this.masterPageService.setTitle(this.operationObj.Title);
            this.masterPageService.setModule(this.operationObj.Module);
            this.appConfig = JSON.parse(localStorage.getItem(StorageData.appConfig));
            this.appService.setFocus('searchKey');
        }
    }


    // Search Based Key
    searchInputKey(inputControl: any) {
        this.authListDetails = null;
        this.appErrService.clearAlert();
        if (!(this.appService.checkNullOrUndefined(this.searchInput)) && this.searchInput !== '') {
            const requestObj = { ClientData: this.clientData, UIData: this.uiData };
            const url = String.Join('/', this.apiConfigService.getReceiptsForSearchkey, this.searchInput.trim());
            this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
                this.spinner.hide();
                if (statusFlag && res.Response.hasOwnProperty('Receipts') && res.Response.Receipts.length) {
                    this.receiptsList(res.Response.Receipts);
                } else {
                    inputControl.applyRequired(true);
                    inputControl.applySelect();
                }
            });
        }
    }

    receiptsList(resp) {
        this.grid = new Grid();
        this.grid.ItemsPerPage = this.appConfig.default.griditemsPerPage;
        this.grid.ShowCheckbox = true;
        const authListResponse = [];
        resp.forEach(res => {
            res.ShowCheckbox = res.Qty === '0' ? true : false;
            res.checkboxChecked = this.cancelReceiptList.filter(ele => ele.Receiptkey === res.Receiptkey).length ? true : false;
            res.DeleteVisible = res.Qty > '0' ? true : false;
            authListResponse.push(res);
        });
        this.authListDetails = this.appService.onGenerateJson(authListResponse, this.grid);
    }

    // Change input box
    changeInput(inputControl: RmtextboxComponent) {
        this.appErrService.clearAlert();
        this.isResetBtnDisabled = false;
        this.isCloseButtonDisabled = true;
        // this.authListDetails = null;
        this.cancelReceiptList = [];
        this.modeltitle = '';
        this.receiptkey = '';
        this.serialnumberList = [];
        inputControl.applyRequired(false);
    }

    deleteDetailRow(template: TemplateRef<any>, row, modalclass: any) {
        this.serialnumberListCount = 0;
        this.appErrService.clearAlert();
        const requestObj = { ClientData: this.clientData, UIData: this.uiData };
        const url = String.Join('/', this.apiConfigService.getSerialNumbersForReceipt, row.Receiptkey);
        this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
            this.spinner.hide();
            if (statusFlag && res.Response && res.Response.hasOwnProperty('Serialnumbrs') && res.Response.Serialnumbrs.length) {
                this.receiptkey = row.Receiptkey;
                this.serialnumberListCount = res.Response.Serialnumbrs.length;
                this.serialnumberList = res.Response.Serialnumbrs;
                this.modeltitle = OperationEnum.recoverSerialNumber;
                this.dialogRef = this.dialog.open(template, {
                    hasBackdrop: true,
                    disableClose: true,
                    panelClass: 'dialog-width-md'
                });
            }
        });
    }

    deleteSerialNumberData(event) {
        this.appErrService.clearAlert();
        if (!this.appService.checkNullOrUndefined(event)) {
            this.serialnumberList = this.serialnumberList.filter(res => res.SerilNumber !== event);
            if (!this.serialnumberList.length) {
                this.modelClose();
            }
        }
    }

    modelClose() {
        if (this.serialnumberListCount !== this.serialnumberList.length) {
            this.isCloseButtonDisabled = true;
            this.cancelReceiptList = [];
            this.searchInputKey(this.searchKey);
        }
        this.dialogRef.close();
    }


    checkboxDetailRow(row) {
        this.appErrService.clearAlert();
        if (row.row === CommonEnum.checkAll) {
            if (row.element.target.checked) {
                this.cancelReceiptList = this.authListDetails.Elements.filter(res => res.ShowCheckbox);
            } else {
                this.cancelReceiptList = [];
            }
            this.receiptsList(this.authListDetails.Elements);
        } else {
            if (row.element.target.checked) {
                this.cancelReceiptList.push(row.row);
            } else {
                this.cancelReceiptList = this.cancelReceiptList.filter(res => res.Receiptkey !== row.row.Receiptkey);
            }
        }
        this.isCloseButtonDisabled = this.cancelReceiptList.length ? false : true;
    }


    onCloseReceipt() {
        this.isCloseButtonDisabled=true;
        this.appErrService.clearAlert();
        const requestObj = { ClientData: this.clientData, UIData: this.uiData, Receipts: this.cancelReceiptList };
        const url = String.Join('/', this.apiConfigService.cancelReceipts);
        this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
            this.spinner.hide();
            if (statusFlag && res.Response) {
                this.snackbar.success(res.Response);
                this.reset();
            }else{
                this.isCloseButtonDisabled=false;
            }
        });
    }


    reset() {
        this.appErrService.clearAlert();
        this.isResetBtnDisabled = true;
        this.isCloseButtonDisabled = true;
        this.authListDetails = null;
        this.cancelReceiptList = [];
        this.searchInput = '';
        this.modeltitle = '';
        this.receiptkey = '';
        this.serialnumberList = [];
        this.serialnumberListCount = 0;
        this.appService.setFocus('searchKey');
    }


    ngOnDestroy() {
        this.masterPageService.defaultProperties();
        if (this.dialogRef) {
            this.dialogRef.close();
        }
    }

}
