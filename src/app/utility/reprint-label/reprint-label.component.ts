import { Component, OnInit, ViewChild, OnDestroy, TemplateRef } from '@angular/core';
import { AppService } from '../../utilities/rlcutl/app.service';
import { ClientData } from '../../models/common/ClientData';
import { ApiService } from '../../utilities/rlcutl/api.service';
import { ApiConfigService } from '../../utilities/rlcutl/api-config.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';
import { String } from 'typescript-string-operations';
import { AdhocDocumentPrint } from '../../models/utility/reprint-label';
import { UiData } from '../../models/common/UiData';
import { StorageData } from '../../enums/storage.enum';
import { Grid } from '../../models/common/Grid';
import { CommonService } from '../../services/common.service';
import { Subscription } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { StatusCodes } from '../../enums/status.enum';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-reprint-label',
    templateUrl: './reprint-label.component.html',
    styleUrls: ['./reprint-label.component.css']
})

export class ReprintLabelComponent implements OnInit, OnDestroy {

    @ViewChild('base64Img') base64Img: TemplateRef<any>;
    emitHideSpinner: Subscription;

    // common
    operationObj: any;
    clientData = new ClientData();
    uiData = new UiData();
    grid: Grid;
    appConfig: any;

    // model
    lableReprintConfig = new AdhocDocumentPrint();

    lableReprintList: any;
    lableReprintArrayList: any;
    parametersReprintList = [];
    tempParametersReprintList = [];
    imageUrl: any;
    isShowProperty = false;
    isResetDisabled = true;
    isPreviewDisabled = true;
    printNameOptions = [];
    dialogRef: any;

    constructor(
        private apiConfigService: ApiConfigService,
        public appErrService: AppErrorService,
        private spinner: NgxSpinnerService,
        private snackbar: XpoSnackBar,
        public masterPageService: MasterPageService,
        private appService: AppService,
        private apiService: ApiService,
        private commonService: CommonService,
        private sanitizer: DomSanitizer,
        private dialog: MatDialog
    ) {
        this.emitHideSpinner = this.masterPageService.emitHideSpinner.subscribe(spinnerFlag => {
            if (!this.appService.checkNullOrUndefined(spinnerFlag) && spinnerFlag) {
                this.getAdhocDocumnet();
            }
        });
    }


    ngOnInit() {
        this.operationObj = this.masterPageService.getRouteOperation();
        if (this.operationObj) {
            this.uiData.OperationId = this.operationObj.OperationId;
            this.uiData.OperCategory = this.operationObj.Category;
            this.masterPageService.setTitle(this.operationObj.Title);
            this.masterPageService.setModule(this.operationObj.Module);
            this.masterPageService.hideSpinner = true;
            this.appConfig = JSON.parse(localStorage.getItem(StorageData.appConfig));
            this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
        }
    }


    getAdhocDocumnet() {
        const requestObj = {
            ClientData: this.clientData, UIData: this.uiData, AdhocDocumentPrint: { FileName: null }
        };
        const getLabelsUrl = String.Join('/', this.apiConfigService.getAdhocDocumnet);
        this.commonService.commonApiCall(getLabelsUrl, requestObj, (res, flag) => {
            this.spinner.hide();
            if (flag) {
                if (!this.appService.checkNullOrUndefined(res.Response) && res.Response.length) {
                    this.lableReprintArrayList = res.Response;
                    const lableReprintRes = [];
                    res.Response.forEach(resp => {
                        const element: any = {};
                        element.Label = resp.Label;
                        element.DockCategory = resp.DockCategory;
                        element.DockFormat = resp.DockFormat;
                        element.Description = resp.Description;
                        element.PrinterType = resp.PrinterType;
                        lableReprintRes.push(element);
                    });
                    this.grid = new Grid();
                    this.grid.EditVisible = true;
                    this.grid.ItemsPerPage = this.appConfig.reprintLable.griditemsPerPage;
                    this.lableReprintList = this.appService.onGenerateJson(lableReprintRes, this.grid);
                }
            }
        });
    }

    getPrintersForLable() {
        this.printNameOptions = [];
        const requestObj = {
            ClientData: this.clientData, UIData: this.uiData, AdhocDocumentPrint: this.lableReprintConfig
        };
        const getLabelsUrl = String.Join('/', this.apiConfigService.getPrintersForLable);
        this.commonService.commonApiCall(getLabelsUrl, requestObj, (res) => {
            this.spinner.hide();
            if (!this.appService.checkNullOrUndefined(res.Response) && res.Response['PrinterNamesList'].length) {
                this.printNameOptions = res.Response['PrinterNamesList'];
                if (this.printNameOptions.length == 1) {
                    this.lableReprintConfig.PrinterName = this.printNameOptions[0].Id;
                }
            }
        });
    }

    editLableReprintDetailRow(row) {
        this.reset(false);
        this.filterLableReprintData(row.Label);
        this.lableReprintConfig['EditHighlight'] = true;
        this.getReportDetails();
        this.isPreviewDisabled = false;
        this.getPrintersForLable();
    }

    filterLableReprintData(label) {
        this.lableReprintConfig = new AdhocDocumentPrint();
        const row = this.lableReprintArrayList.find(res => res.Label == label);
        if (!this.appService.checkNullOrUndefined(row)) {
            this.lableReprintConfig = row;
        }
    }

    getReportDetails() {
        const requestObj = {
            ClientData: this.clientData, UIData: this.uiData, AdhocDocumentPrint: this.lableReprintConfig
        };
        const getLabelsUrl = String.Join('/', this.apiConfigService.getReportDetails);
        this.commonService.commonApiCall(getLabelsUrl, requestObj, (res) => {
            this.spinner.hide();
            if (!this.appService.checkNullOrUndefined(res.Response)) {
                if (!this.appService.checkNullOrUndefined(res.Response['ParameterAttributeValues'])
                    && res.Response['ParameterAttributeValues'].length) {
                    this.tempParametersReprintList = JSON.parse(JSON.stringify(res.Response['ParameterAttributeValues']));
                    this.parametersReprintList = JSON.parse(JSON.stringify(res.Response['ParameterAttributeValues']));
                    this.parameterFocus();
                    this.lableReprintConfig = res.Response;
                }
                this.isShowProperty = true;
            }
        });
    }

    parameterFocus() {
        if (this.parametersReprintList.length && this.parametersReprintList[0].hasOwnProperty('ParamterName')) {
            this.appService.setFocus(this.parametersReprintList[0].ParamterName);
        }
    }

    getReportImage() {
        const requestObj = {
            ClientData: this.clientData, UIData: this.uiData, AdhocDocumentPrint: this.lableReprintConfig
        };
        const getReportImageUrl = String.Join('/', this.apiConfigService.getReportImage);
        this.commonService.commonApiCall(getReportImageUrl, requestObj, (res) => {
            this.spinner.hide();
            if (!this.appService.checkNullOrUndefined(res.Response)) {
                if (!this.appService.checkNullOrUndefined(res.Response['Image'])) {
                    this.imageUrl = `data:image/png;base64, ${res.Response['Image']}`;
                    this.dialogRef = this.dialog.open(this.base64Img, {
                        panelClass: 'dialog-width-lg'
                    });
                }
            }
        });
    }

    onPrinterNameChange(event) {
        this.lableReprintConfig.PrinterName = event.value;
    }

    transform() {
        return this.sanitizer.bypassSecurityTrustResourceUrl(this.imageUrl);
    }


    printDocument(canPrint) {
        if (!canPrint) {
            this.spinner.show();
            this.lableReprintConfig.ParameterValues = this.setParameterValues();
            const requestObj = {
                ClientData: this.clientData, UIData: this.uiData, AdhocDocumentPrint: this.lableReprintConfig
            };
            const printDocumentUrl = String.Join('/', this.apiConfigService.printDocument);
            this.apiService.apiPostRequest(printDocumentUrl, requestObj)
                .subscribe(response => {
                    const result = response.body;
                    this.spinner.hide();
                    if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
                        if (!this.appService.checkNullOrUndefined(result.Response)) {
                            this.snackbar.success(result.Response);
                        }
                        this.parametersReprintList = JSON.parse(JSON.stringify(this.tempParametersReprintList));
                    } else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
                        this.snackbar.error(result.ErrorMessage.ErrorDetails);
                    }
                    this.parameterFocus();
                },
                    error => {
                        this.appErrService.handleAppError(error);
                    });
        }
    }

    setParameterValues() {
        const parameterValues = [];
        if (!this.appService.checkNullOrUndefined(this.parametersReprintList) && this.parametersReprintList.length) {
            for (let p = 0; p < this.parametersReprintList.length; p++) {
                const obj = {
                    ParamterName: this.parametersReprintList[p]['ParamterName'],
                    ParamterValue: this.parametersReprintList[p]['DefaultValue']
                };
                parameterValues.push(obj);
            }
        }
        return parameterValues;
    }


    changeInput(value, i) {
        this.parametersReprintList[i].DefaultValue = value;
    }


    reset(flag = true) {
        if (flag) {
            this.getAdhocDocumnet();
        }
        this.lableReprintConfig = new AdhocDocumentPrint();
        this.parametersReprintList = [];
        this.tempParametersReprintList = [];
        this.isShowProperty = false;
        this.imageUrl = null;
        this.isPreviewDisabled = true;
        this.isResetDisabled = true;
    }

    enableReset() {
        this.isResetDisabled = false;
    }

    ngOnDestroy() {
        this.masterPageService.defaultProperties();
        this.emitHideSpinner.unsubscribe();
        if (this.dialogRef) {
            this.dialogRef.close();
        }
    }

}


