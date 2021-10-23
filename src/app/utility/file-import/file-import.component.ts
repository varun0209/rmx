import { Component, OnDestroy, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import { ClientData } from '../../models/common/ClientData';
import { UiData } from '../../models/common/UiData';
import { StorageData } from '../../enums/storage.enum';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiConfigService } from '../../utilities/rlcutl/api-config.service';
import { String } from 'typescript-string-operations';
import { ApiService } from '../../utilities/rlcutl/api.service';
import { StatusCodes } from '../../enums/status.enum';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { Grid } from '../../models/common/Grid';
import { AppService } from '../../utilities/rlcutl/app.service';
import { CommonService } from '../../services/common.service';
import { dropdown } from '../../models/common/Dropdown';
import { RuntimeConfigService } from '../../utilities/rlcutl/runtime-config.service';
import { DatePipe } from '@angular/common';
import { FileManagement } from '../../enums/FileManagement';

@Component({
    selector: 'app-file-import',
    templateUrl: './file-import.component.html',
    styleUrls: ['./file-import.component.css']
})
export class FileImportComponent implements OnInit, OnDestroy {

    file: any;
    jsonData = [];
    columns = [];
    importTypesList: any;
    exportTypesList: any;
    actualuploadTypesList: any;
    selectedSheet: any;
    selectedUploadType: any;
    isUploadDisabled = true;
    isProcessDisabled = true;
    isClearDisabled = true;

    selectedExportType: any;
    isExportTypeDisabled = false;
    isExportClearDisabled = true;
    exportInputParametersList = [];
    gridExportData: any;

    operationObj: any;
    clientData = new ClientData();
    uiData = new UiData();
    storageData = StorageData;
    statusCode = StatusCodes;

    grid: Grid;
    gridData: any;
    vendorList: any[];
    isExportProcessDisabled = true;
    dataFormat = 'MM/dd/yyyy h:mm:ss a';
    bsConfig = {
        dateInputFormat: 'MM/DD/YYYY h:mm:ss a',
        containerClass: 'theme-dark-blue',
        showWeekNumbers: false
    };

    constructor(
        public masterPageService: MasterPageService,
        public appErrService: AppErrorService,
        private spinner: NgxSpinnerService,
        private apiConfigService: ApiConfigService,
        public apiservice: ApiService,
        private snackbar: XpoSnackBar,
        private appService: AppService,
        private commonService: CommonService,
        private runtimeConfigService: RuntimeConfigService,
        public datepipe: DatePipe
    ) { }

    ngOnInit() {
        this.operationObj = this.masterPageService.getRouteOperation();
        if (this.operationObj) {
            this.uiData.OperationId = this.operationObj.OperationId;
            this.uiData.OperCategory = this.operationObj.Category;
            this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
            this.masterPageService.setTitle(this.operationObj.Title);
            localStorage.setItem(this.storageData.module, this.operationObj.Module);
            this.appErrService.appMessage();
            this.getUploadDockTypes();
        }
    }

    getUploadDockTypes() {
        const requestObj = { ClientData: this.clientData, UIData: this.uiData };
        const url = String.Join('/', this.apiConfigService.getUploadFileNames);
        this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
            if (statusFlag) {
                if (res.Response && res.Response.length) {
                    this.actualuploadTypesList = res.Response;
                    this.importTypesList = [];
                    this.exportTypesList = [];
                    res.Response.forEach((element) => {
                        const dd: dropdown = new dropdown();
                        dd.Id = element.Key;
                        dd.Text = element.Value;
                        if (element.PROCESSTYPE == FileManagement.Import) {
                            this.importTypesList.push(dd);
                        } else if (element.PROCESSTYPE == FileManagement.Export) {
                            this.exportTypesList.push(dd);
                        } else if (element.PROCESSTYPE == FileManagement.ImportExport) {
                            this.importTypesList.push(dd);
                            this.exportTypesList.push(dd);
                        }
                    });
                }
            }
            this.spinner.hide();
        });
    }

    // ************************************* Import  *****************************
    clearUploadedFile() {
        this.appErrService.clearAlert();
        this.file = null;
        this.gridData = null;
        this.isUploadDisabled = true;
        this.selectedUploadType = null;
        this.selectedSheet = null;
        this.isClearDisabled = true;
        this.isProcessDisabled = true;
    }

    onFileChange(event) {
        this.appErrService.clearAlert();
        this.clearUploadedFile();
        this.file = event[0];
        this.commonService.convertExcelToJSON(event, (json, col) => {
            if (!this.appService.checkNullOrUndefined(json)) {
                this.jsonData = json;
                this.columns = col;
                this.selectedSheet = this.columns[0]['Id'];
                this.isUploadDisabled = false;
                this.isClearDisabled = false;
                this.showGrid();
            } else {
                this.clearUploadedFile();
            }
        });
    }

    processFile() {
        const fileParam = { FILENAME: this.selectedUploadType, OPERATIONID: this.uiData.OperationId };
        const requestObj = { ClientData: this.clientData, UIData: this.uiData, FileParameters: fileParam, FileData: this.jsonData[this.selectedSheet] };
        const url = String.Join('/', this.apiConfigService.importFileData);
        this.commonService.commonApiCall(url, requestObj, (res, statsFlag) => {
            if (!this.appService.checkNullOrUndefined(res.StatusMessage) && statsFlag) {
                this.snackbar.success(res.StatusMessage);
                this.clearUploadedFile();
            }
            this.spinner.hide();
        });
    }

    uploadTypeSelect(val) {
        this.appErrService.clearAlert();
        this.isProcessDisabled = true;
        this.selectedUploadType = val.value;
        const table = this.actualuploadTypesList.filter(res => (res.Key == this.selectedUploadType));
        if (table.length) {
            const fileExt = this.file.name.split('.').pop();
            if (!table[0].FILEEXTN.includes(fileExt)) {
                this.snackbar.error(fileExt + ' ' + this.appService.getErrorText('8850086'));
                return;
            }
            this.isProcessDisabled = false;
        }
    }


    showGrid() {
        this.grid = new Grid();
        this.gridData = this.appService.onGenerateJson(this.jsonData[this.selectedSheet], this.grid);
    }

    changeData(data) {
        this.selectedSheet = data.value;
        this.showGrid();
    }

    // ************************************* Export  *****************************

    exportTypeSelect(val) {
        this.clearExportFile();
        this.selectedExportType = val.value;
        if (this.selectedExportType == FileManagement.QCFReport) {
            this.getVendors();
        } else {
            this.getInputParameters();
        }
    }

    getInputParameters() {
        this.spinner.show();
        this.runtimeConfigService.exportInputParameter().then(res => {
            this.spinner.hide();
            this.exportInputParametersList = res[this.selectedExportType];
            if (!this.appService.checkNullOrUndefined(this.exportInputParametersList)) {
                if (this.exportInputParametersList.length) {
                    this.exportInputParametersList = this.exportInputParametersList.map(res => {
                        if (res.PropertyName == 'vendorId' && res.ControlType == 'dropdown') {
                            res.Options = this.vendorList;
                        }
                        return res;
                    });
                }
            }
            this.isExportProcessDisabled = false;
            this.isExportClearDisabled = false;
        });
    }

    // getVendors
    getVendors() {
        this.spinner.show();
        this.vendorList = [];
        const requestObj = { ClientData: this.clientData, UIData: this.uiData };
        this.apiservice.apiPostRequest(this.apiConfigService.getVendorsUrl, requestObj)
            .subscribe(response => {
                this.spinner.hide();
                const res = response.body;
                if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
                    if (!this.appService.checkNullOrUndefined(res.Response)) {
                        res.Response.forEach(element => {
                            const dd: dropdown = new dropdown();
                            dd.Id = element.VendorId;
                            dd.Text = element.VendorName;
                            this.vendorList.push(dd);
                        });
                        this.vendorList.unshift({ Id: 'All', Text: 'All' });
                    }
                } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                }
                this.getInputParameters();
            }, erro => {
                this.appErrService.handleAppError(erro);
            });
    }

    processExportFile() {
        this.gridExportData = null;
        const fileParams = {
            FileName: this.selectedExportType,
            OperationId: this.uiData.OperationId,
            OutParams: '',
            InParams: this.inputParams()
        };
        const requestObj = { ClientData: this.clientData, UIData: this.uiData, FileParameters: fileParams };
        const url = String.Join('/', this.apiConfigService.exportFileData);
        this.commonService.commonApiCall(url, requestObj, (res, statsFlag) => {
            this.spinner.hide();
            if (!this.appService.checkNullOrUndefined(res.Response) && statsFlag) {
                if (res.Response.length) {
                    this.showExportGrid(res.Response);
                }
            }
        });
    }

    inputParams() {
        if (!this.appService.checkNullOrUndefined(this.exportInputParametersList)) {
            const inputList = {};
            for (let e = 0; e < this.exportInputParametersList.length; e++) {
                inputList[this.exportInputParametersList[e]['PropertyName']] = this.exportInputParametersList[e]['value'];
            }
            return inputList;
        } else {
            return '';
        }
    }

    showExportGrid(data) {
        this.grid = new Grid();
        this.grid.ExportVisible = true;
        this.gridExportData = this.appService.onGenerateJson(data, this.grid);
    }

    changeInput(value, i) {
        this.exportInputParametersList[i].value = value;
    }

    changeDatePicker(value, i) {
        let convertedTime: any;
        if (!this.appService.checkNullOrUndefined(value)) {
            if (this.exportInputParametersList[i].PropertyName === FileManagement.StartDate) {
                convertedTime = FileManagement.startTime;
            } else if (this.exportInputParametersList[i].PropertyName === FileManagement.EndDate) {
                convertedTime = FileManagement.endTime;
            } else {
                convertedTime = new Date(value).toLocaleTimeString();
            }
            const convertDate = new Date(value).toLocaleDateString();
            const datetimeConv = convertDate + ' ' + convertedTime;
            if (!datetimeConv.includes(FileManagement.InvalidDate)) {
                this.exportInputParametersList[i].value = this.datepipe.transform(datetimeConv, this.dataFormat);
            }

            // logic end date should be always greater than start date
            if (this.exportInputParametersList[i].PropertyName === FileManagement.StartDate) {
                this.exportInputParametersList.map(list => {
                    if (list.PropertyName === FileManagement.EndDate) {
                        list.minDate = new Date(this.exportInputParametersList[i].value);
                        if (list.value < this.exportInputParametersList[i].value) {
                            const date = convertDate + ' '  + FileManagement.endTime;
                            list.value = this.datepipe.transform(date, this.dataFormat);
                        }
                    }
                });
            }

        }
    }


    enableReset() {
        this.isExportClearDisabled = false;
    }

    clearExportFile() {
        this.appErrService.clearAlert();
        this.selectedExportType = '';
        this.exportInputParametersList = [];
        this.isExportProcessDisabled = true;
        this.isExportClearDisabled = true;
        this.gridExportData = null;
    }

    ngOnDestroy() {
        this.masterPageService.defaultProperties();
    }


}
