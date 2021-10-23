import { Component, OnInit, ViewChild } from '@angular/core';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';
import { ApiConfigService } from '../../utilities/rlcutl/api-config.service';
import { ApiService } from '../../utilities/rlcutl/api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';
import { AppService } from '../../utilities/rlcutl/app.service';
import { String } from 'typescript-string-operations';
import { ClientData } from '../../models/common/ClientData';
import { Grid } from '../../models/common/Grid';
import { Subscription, Observable } from 'rxjs';
import { UiData } from '../../models/common/UiData';
import { StorageData } from '../../enums/storage.enum';
import { StatusCodes } from '../../enums/status.enum';
import { dropdown } from '../../models/common/Dropdown';
import { Aqlbypass } from '../../models/utility/aqlbypass'
import { checkNullorUndefined } from '../../enums/nullorundefined';

@Component({
    selector: 'app-aqlbypass',
    templateUrl: './aql-bypass.component.html',
    styleUrls: ['./aql-bypass.component.css']
})
export class AqlbypassComponent implements OnInit {

    //client and common Control properties
    clientData = new ClientData();
    uiData = new UiData();
    operationObj: any;
    emitHideSpinner: Subscription;
    grid: Grid;


    //properties
    searchKey: string = '';
    searchDropdownVal: string = '';
    searchDropdownList: any[];
    receiptOrAuthKey: string = '';


    //boolean variables
    isSearchDropDownDisabled = false;
    isSearchIconBtnDisabled = true;
    isResetBtnDisabled = true;
    isSearchKeyInputDisabled = false;
    isBypassBtnDisabled = true;

    //objects 
    receiptOrAuthData: any;
    tempAqlBypassList: any;
    aqlbypass = new Aqlbypass();

    constructor(private apiService: ApiService,
        private apiConfigService: ApiConfigService,
        private spinner: NgxSpinnerService,
        private snackbar: XpoSnackBar,
        public appErrService: AppErrorService,
        public masterPageService: MasterPageService,
        public appService: AppService) {
        this.emitHideSpinner = this.masterPageService.emitHideSpinner.subscribe(spinnerFlag => {
            if (!checkNullorUndefined(spinnerFlag) && spinnerFlag) {
                this.getResultsAqlTypes();
            }
        });
    }

    ngOnInit() {
        this.operationObj = this.masterPageService.getRouteOperation();
        if (this.operationObj) {
            this.uiData.OperationId = this.operationObj.OperationId;
            this.uiData.OperCategory = this.operationObj.Category;
            this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
            //setting value to hidespinner (based on this value we are emiting emithidespinner method)
            this.masterPageService.hideSpinner = true;
            this.masterPageService.setTitle(this.operationObj.Title);
            this.masterPageService.setModule(this.operationObj.Module);
        }
    }


    //getResults all aqltypes
    getResultsAqlTypes() {
        this.spinner.show();
        let requestObj = { ClientData: this.clientData, UIData: this.uiData };
        const url = String.Join("/", this.apiConfigService.getAqlTypes);
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                let result = response.body;
                this.spinner.hide();
                if (!checkNullorUndefined(result) && result.Status === StatusCodes.pass) {
                    if (!checkNullorUndefined(result.Response) && result.Response.AQLTypes && result.Response.AQLTypes.length) {
                        this.searchDropdownList = [];
                        result.Response.AQLTypes.forEach((element) => {
                            let dd: dropdown = new dropdown();
                            dd.Id = element.ID;
                            dd.Text = element.TEXT;
                            this.searchDropdownList.push(dd);
                        });
                        this.dropDownListFocus();
                    }
                }
                else if (!checkNullorUndefined(result) && result.Status === StatusCodes.fail) {
                    this.spinner.hide();
                    this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
                }
            },
            error => {
                this.appErrService.handleAppError(error);
            });

    }

    //search receipt or auth key search
    searchReceiptOrAuthKey() {
        this.appErrService.clearAlert();
        if (this.searchKey && this.searchDropdownVal) {
            this.spinner.show();
            let requestObj = { ClientData: this.clientData, UIData: this.uiData };
            const url = String.Join("/", this.apiConfigService.getReceiptList, this.searchDropdownVal, this.searchKey.trim());
            this.apiService.apiPostRequest(url, requestObj)
                .subscribe(response => {
                    let result = response.body;
                    this.spinner.hide();
                    if (!checkNullorUndefined(result) && result.Status === StatusCodes.pass) {
                        if (!checkNullorUndefined(result.Response)) {
                            if (!checkNullorUndefined(result.Response.ReceiptkeysList) && result.Response.ReceiptkeysList.length)
                                this.onProcessReceiptOrAuthGrid(result.Response.ReceiptkeysList);

                        }
                    }
                    else if (!checkNullorUndefined(result) && result.Status === StatusCodes.fail) {
                        this.spinner.hide();
                        this.receiptOrAuthData = null;
                        this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
                    }
                },
                error => {
                    this.appErrService.handleAppError(error);
                });
        }

    }


    //on change receipt key dropdown
    changeSearchDropdown(event) {
        this.appErrService.clearAlert();
        this.searchDropdownVal = event;
        this.searchKey = '';
        this.receiptOrAuthData = null;
        this.isResetBtnDisabled = false;
        this.isBypassBtnDisabled = true;
        this.isSearchIconBtnDisabled = true;
        this.searchKeyFocus();
    }

    //receiptsearch input focus
    searchKeyFocus() {
        this.appService.setFocus('searchKey');
    }

    //bypass button focus
    byPassBtnFocus() {
        this.appService.setFocus('byPass');
    }

    //dropDownListFocus
    dropDownListFocus() {
        this.appService.setFocus('searchkeyDropdown');
    }

    //change ReceiptKey
    changeSearchInput() {
        this.isResetBtnDisabled = false;
        this.isSearchIconBtnDisabled = false;
        this.appErrService.clearAlert();
    }

    //checking inputtextbox empty value
    isInputValueEmpty() {
        this.appErrService.clearAlert();
        if (!this.searchKey) {
            this.isSearchIconBtnDisabled = true;
        }
    }



    //select each record
    editReceiptOrAuthDetailRow(event: Aqlbypass) {
        this.appErrService.clearAlert();
        if (event.Receiptkey) {
            this.receiptOrAuthKey = event.Receiptkey;
            this.isSearchIconBtnDisabled = true;
            this.isSearchKeyInputDisabled = false;
            this.isBypassBtnDisabled = false;
            this.isResetBtnDisabled = false;
            this.isSearchDropDownDisabled = true;
            if (this.searchKey !== '') {
                this.isSearchIconBtnDisabled = true;
                this.isSearchKeyInputDisabled = true;
            }
            this.byPassBtnFocus();
        }
    }

    //onProcessAttributeRouteJsonGrid
    onProcessReceiptOrAuthGrid(Response: Aqlbypass[]) {
        if (!checkNullorUndefined(Response)) {
            this.tempAqlBypassList = [];
            let headingsArray = Object.keys(Response[0]);
            Response.forEach(res => {
                let element: Aqlbypass = new Aqlbypass();
                headingsArray.forEach(aqlInfo => {
                    element[aqlInfo] = res[aqlInfo];
                })
                this.tempAqlBypassList.push(element);
            });
        }
        this.grid = new Grid();
        this.grid.EditVisible = true;
        this.receiptOrAuthData = this.appService.onGenerateJson(this.tempAqlBypassList, this.grid);
    }

    //onclick bypass button
    AQLByPass() {
        this.appErrService.clearAlert();
        this.spinner.show();
        let requestObj = { ClientData: this.clientData, UIData: this.uiData };
        const url = String.Join("/", this.apiConfigService.saveAqlBypassUrl, this.receiptOrAuthKey.trim());
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                let result = response.body;
                this.spinner.hide();
                if (!checkNullorUndefined(result) && result.Status === StatusCodes.pass) {
                    if (!checkNullorUndefined(result.Response)) {
                        this.snackbar.success(result.StatusMessage);

                        if (!checkNullorUndefined(this.receiptOrAuthData) && this.receiptOrAuthData.Elements.length > 0) {
                            if (this.receiptOrAuthData.Elements.length > 1) {
                                this.searchReceiptOrAuthKey();
                                this.disabledControls();
                            }
                        }
                        if (this.receiptOrAuthData.Elements.length == 1) {
                            this.reset();
                        }
                    }
                }
                else if (!checkNullorUndefined(result) && result.Status === StatusCodes.fail) {
                    this.spinner.hide();
                    this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
                }
            },
            error => {
                this.appErrService.handleAppError(error);
            });
    }

    //disabled controls more than row in grid
    disabledControls() {
        this.appErrService.clearAlert();
        this.isBypassBtnDisabled = true;
        this.isResetBtnDisabled = false;
        this.isSearchIconBtnDisabled = false;
        this.isSearchDropDownDisabled = false;
        this.isSearchKeyInputDisabled = false;
    }

    //reset button properties 
    reset() {
        this.appErrService.clearAlert();
        this.isBypassBtnDisabled = true;
        this.isResetBtnDisabled = true;
        this.isSearchIconBtnDisabled = true;
        this.isSearchDropDownDisabled = false;
        this.isSearchKeyInputDisabled = false;
        this.receiptOrAuthData = null;
        this.searchDropdownVal = '';
        this.searchKey = '';
    }

    ngOnDestroy() {
        this.emitHideSpinner.unsubscribe();
        this.masterPageService.defaultProperties();
    }

}
