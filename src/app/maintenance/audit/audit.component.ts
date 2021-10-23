import { Component, OnInit, ViewChild, OnDestroy, Input, ElementRef } from '@angular/core';
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
import { UiData } from '../../models/common/UiData';
import { dropdown } from '../../models/common/Dropdown';
import { AuditCheck, AuditPoints, AuditPointChecks, AuditDetail } from '../../models/maintenance/audit/AuditInfo';
import { EngineResult } from '../../models/common/EngineResult';
import { Subscription } from 'rxjs';
import { RmgridService } from '../../framework/frmctl/rmgrid/rmgrid.service';
import { RmgridComponent } from '../../framework/frmctl/rmgrid/rmgrid.component';
import { StorageData } from '../../enums/storage.enum';
import { StatusCodes } from '../../enums/status.enum';
import { checkNullorUndefined } from '../../enums/nullorundefined';

@Component({
    selector: 'app-audit',
    templateUrl: './audit.component.html',
    styleUrls: ['./audit.component.css']
})
export class AuditComponent implements OnInit, OnDestroy {

    //client Control Labels
    controlConfig: any;
    clientData = new ClientData();
    uiData = new UiData();
    operationObj: any;
    isSearchDisabled: boolean;

    items = [];
    dropdownList = [];
    selectedItems = [];
    dropdownSettings = {};

    checkPointActive = false;
    checkPointPrint: boolean = true;

    AuditPrintDisabled: boolean = false;
    AuditLabelPrint: any;
    AuditPrint: boolean = true;

    AllowDupResultsPrint: boolean = true;
    AllowDupResults: any;
    AllowDupResultsDisabled: boolean = false;

    //grid
    grid: Grid;

    //AuditCheck
    auditCheck = new AuditCheck();
    auditList: AuditCheck[];
    tempProcessAuditList: AuditCheck[] = [];
    auditActiveCheckList = [];

    searchTempAuditCheck = new AuditCheck();
    isAuditCheckClearDisabled = true;
    //Audit Points setup

    auditPoint = new AuditPoints();
    searchTempAuditPoint = new AuditPoints();
    auditPointChecks = new AuditPointChecks();
    tempProcessAuditPointsList: AuditPoints[] = [];

    auditPointList: AuditPoints[];
    auditActiveCheck: string;
    auditPointBtnName: string;
    //App message
    messageNum: string;
    messageType: string;
    appConfig: any;
    message: string;
    isSaveDisabled = true;
    editAuditPointChildIndex: any;
    editAuditPointParentIndex: any;
    isAuditPointClearDisabled = true;
    isChecksDisabled = false;
    isResetAuditCheckDisabled = true;
    isResetAuditPointDisabled = true;
    isAuditDetailTypeDisabled = false;
    isAuditDetailRequiredDisabled = false;
    isValidateDisabled = true;
    isAuditPointCodeDisabled = false;
    isAuditPointDescDisabled = false
    isAuditPointDisabled = false;
    isAuditPointtoggleActive = false;
    isAuditPointtoggleAllowDupResults = false;
    isAuditPointtoggleRefserail = false;
    isAuditPointtoggleAllowUupResults = false;
    auditDetailTypeList = [];
    validateRegularExpressionFlag = true;
    isDisabledSearchIcon = false;
    isEditAuditHeader = false;
    emitHideSpinner: Subscription;
    tempAuditPoint: AuditPoints;
    tempAuditPointCheck: AuditPointChecks;
    auditPointChildElementsLength: any;
    isUpdatedAuditPoint = false;
    allActiveChecks;
    @ViewChild(RmgridComponent) rmGrid: RmgridComponent;
    selectedAuditCode: string = '';
    lockMode: boolean = false;
    isShowRmLock: boolean = false;
    storageData = StorageData;
    statusCode = StatusCodes;
    textBoxPattern: RegExp;

    constructor(
        private apiService: ApiService,
        private apiConfigService: ApiConfigService,
        private spinner: NgxSpinnerService,
        private snackbar: XpoSnackBar,
        public appErrService: AppErrorService,
        public masterPageService: MasterPageService,
        public appService: AppService,
        public rmgridService: RmgridService
    ) {
        //emitting hide spinner
        this.emitHideSpinner = this.masterPageService.emitHideSpinner.subscribe(spinnerFlag => {
            if (!checkNullorUndefined(spinnerFlag) && spinnerFlag) {
                this.getActiveChecks();
                this.getAuditChecksDetailTypes();
            }
        });
    }

    ngOnInit() {
        this.operationObj = this.masterPageService.getRouteOperation();
        if (this.operationObj) {
            this.uiData.OperationId = this.operationObj.OperationId;
            this.uiData.OperCategory = this.operationObj.Category;
            this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
            //setting value to hidespinner (based on this value we are emiting emithidespinner method)
            this.masterPageService.hideSpinner = true;
            this.masterPageService.setTitle(this.operationObj.Title);
            this.masterPageService.setModule(this.operationObj.Module);
            this.appConfig = JSON.parse(localStorage.getItem(this.storageData.appConfig));
            this.controlConfig = JSON.parse(localStorage.getItem(this.storageData.controlConfig));
            localStorage.setItem(this.storageData.module, this.operationObj.Module);
            this.appErrService.appMessage();
            const pattern = JSON.parse(localStorage.getItem(StorageData.patternList));
            if (!this.appService.checkNullOrUndefined(pattern)) {
               this.textBoxPattern = new RegExp(pattern.namePattern);
            }
        }
    }

    toggleControl(lockMode) {
        if (lockMode && this.auditPoint.AuditCode) {
            this.lockMode = true;
            this.selectedAuditCode = this.auditPoint.AuditCode;
        } else {
            this.selectedAuditCode = null;
            this.lockMode = false;
        }
    }

    /********searchAuditCheck********/
    searchAuditCheck() {
        this.spinner.show();
        this.appErrService.clearAlert();
        this.searchTempAuditCheck = new AuditCheck();
        this.searchTempAuditCheck.CheckCode = this.auditCheck.CheckCode;
        const requestObj = { ClientData: this.clientData, UIData: this.uiData, AuditCheck: this.searchTempAuditCheck };
        const url = String.Join("/", this.apiConfigService.searchAuditCheckUrl);
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                let result = response.body;
                this.spinner.hide();
                if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) {
                    if (!checkNullorUndefined(result.Response) && result.Response.length > 0) {
                        this.isResetAuditCheckDisabled = false;
                        this.auditCheck = new AuditCheck();
                        this.onProcessAuditCheckJsonGrid(result.Response);
                        this.grid = new Grid();
                        this.grid.EditVisible = true;
                        this.auditList = this.appService.onGenerateJson(this.tempProcessAuditList, this.grid);
                    }
                }
                else if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) {
                    this.spinner.hide();
                    this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
                }

                else if (!checkNullorUndefined(result) && result.Status === this.statusCode.noResult) {
                    this.spinner.hide();
                    if (this.auditList) {
                        this.auditList = null;
                    }
                    this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
                }
            },
                error => {
                    this.appErrService.handleAppError(error);
                });
    }

    /*********onProcessAuditCheckJsonGrid*********/
    onProcessAuditCheckJsonGrid(Response: AuditCheck[]) {
        if (!checkNullorUndefined(Response)) {
            this.tempProcessAuditList = [];
            let headingsobj = Object.keys(Response[0]);
            Response.forEach(res => {
                let element: AuditCheck = new AuditCheck();
                headingsobj.forEach(singleaudit => {
                    element[singleaudit] = res[singleaudit];
                })
                this.tempProcessAuditList.push(element);
            });
        }
    }

    //Onchange edit
    editAuditDetailRow(event: AuditCheck, id: string) {
        this.isResetAuditCheckDisabled = false;
        this.isAuditCheckClearDisabled = false;
        this.auditCheck = Object.assign(this.auditCheck, event);
        this.auditList['EditHighlight'] = true;
    }

    /************Save Audit Check***************/
    saveAuditCheck() {
        this.spinner.show();
        let requestObj = { ClientData: this.clientData, UIData: this.uiData, AuditCheck: this.auditCheck };
        const url = String.Join("/", this.apiConfigService.saveAuditCheckUrl);
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                let result = response.body;
                this.spinner.hide();
                if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) {
                    if (!checkNullorUndefined(result.StatusMessage)) {
                        this.snackbar.success(result.StatusMessage);
                        this.clearAuditCheck();
                        this.searchAuditCheck();
                        //getActiveChecks we are calling because after saving the audit checks we need to updated check list in auditpoint setup
                        this.getActiveChecks();
                    }
                }
                else if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) {
                    this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
                }
            },
                error => {
                    this.appErrService.handleAppError(error);
                });
    }

    /******onAuditCheckToggleChange**********/
    onAuditCheckToggleChange(value) {
        this.isAuditCheckClearDisabled = false;
        this.isResetAuditCheckDisabled = false;
        this.auditCheck.Active = value ? 'Y' : 'N';
    }
    /******onAuditisPass_YNToggleChange**********/
    onAuditCheckisPassToggleChange(value) {
        this.isAuditCheckClearDisabled = false;
        this.isResetAuditCheckDisabled = false;
        this.auditCheck.IsPass_YN = value ? 'Y' : 'N';
    }

    /**Clear Audit Check**/
    clearAuditCheck() {
        this.auditCheck = new AuditCheck();
        this.isAuditCheckClearDisabled = true;
        this.appErrService.clearAlert();
        if (!checkNullorUndefined(this.auditList)) {
            this.auditList['EditHighlight'] = false;
        }
    }
    /***changeAuditCheckInput***/
    changeAuditCheckInput() {
        this.isAuditCheckClearDisabled = false;
        this.isResetAuditCheckDisabled = false;
        this.appErrService.clearAlert();
    }

    changeAuditCheckDescription() {
        this.isAuditCheckClearDisabled = false;
        this.isResetAuditCheckDisabled = false;
        this.appErrService.clearAlert();
    }


    /********searchAuditPoints -- it will give auditpoints along with associated checks ********/
    searchAuditPoints() {
        this.spinner.show();
        this.appErrService.clearAlert();
        if (this.lockMode) {
            this.auditPoint.AuditCode = this.selectedAuditCode;
        }
        this.searchTempAuditPoint = new AuditPoints();
        this.searchTempAuditPoint.AuditCode = this.auditPoint.AuditCode;
        let requestObj = { ClientData: this.clientData, UIData: this.uiData, AuditPoint: this.searchTempAuditPoint };
        const url = String.Join("/", this.apiConfigService.searchAuditPontsUrl);
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                let result = response.body;
                this.spinner.hide();
                if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) {
                    if (!checkNullorUndefined(result.Response) && result.Response.length > 0) {
                        this.isResetAuditPointDisabled = false;
                        this.auditPoint = new AuditPoints();
                        this.onProcessAuditPointsJsonGrid(result.Response);
                        this.grid = new Grid();
                        this.grid.EditVisible = true;
                        this.auditPointList = this.appService.onGenerateJson(this.tempProcessAuditPointsList, this.grid);
                        if (this.lockMode) {
                            this.auditPoint.AuditCode = this.selectedAuditCode;
                            this.isAuditPointCodeDisabled = true;
                        } else {
                            this.auditPoint.AuditCode = null;
                            this.isAuditPointCodeDisabled = false;
                        }

                    }
                }
                else if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) {
                    this.spinner.hide();
                    this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
                }
                else if (!checkNullorUndefined(result) && result.Status === this.statusCode.noResult) {
                    this.spinner.hide();
                    if (this.auditPointList) {
                        this.auditPointList = null;
                    }
                    this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
                }
            },
                error => {
                    this.appErrService.handleAppError(error);
                });
    }

    onProcessAuditPointsJsonGrid(Response) {
        if (!checkNullorUndefined(Response)) {
            this.tempProcessAuditPointsList = [];
            Response.forEach(res => {
                let element: any = {};
                element.Audit_Id = res.Audit_Id;
                element.AuditCode = res.AuditCode;
                element.AuditDescription = res.AuditDescription;
                element.Active_YN = res.Active_YN;
                element.AllowDupResults_YN = res.AllowDupResults_YN;
                element.AllowUpdResults_YN = res.AllowUpdResults_YN;
                element.ReferSerialNo_YN = res.ReferSerialNo_YN;
                element.ChildElements = this.processChildElements(res.AuditPointChecks);
                element.EditVisible = "true";
                this.tempProcessAuditPointsList.push(element);
            });
        }
    }

    processChildElements(Response) {

        let chidAuditChecks = []
        Response.forEach(res => {
            let element: any = {};
            element.Check_Id = res.Check_Id;
            element.CheckCode = res.CheckCode;
            element.CheckDesc = res.CheckDesc;
            element.IsPass_YN = res.IsPass_YN;
            element.DetailType = res.DetailType;
            element.DetailRequired = res.DetailRequired;
            element.Position = res.Position;
            element.Default_YN = res.Default_YN;
            element.MultiChkElgbl_YN = res.MultiChkElgbl_YN;
            chidAuditChecks.push(element);
        });
        return chidAuditChecks;
    }

    //getActiveChecks
    getActiveChecks() {
        this.spinner.show();
        let requestObj = { ClientData: this.clientData, UIData: this.uiData };
        const url = String.Join("/", this.apiConfigService.getActiveChecksUrl);
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                let result = response.body;
                this.spinner.hide();
                this.auditActiveCheckList = [];
                if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) {
                    if (!checkNullorUndefined(result.Response) && result.Response.length > 0) {
                        this.allActiveChecks = result.Response;
                        result.Response.forEach((element) => {
                            let dd: dropdown = new dropdown();
                            dd.Id = element.Check_Id;
                            dd.Text = element.CheckCode;
                            this.auditActiveCheckList.push(dd);
                        });
                    }
                }
                else if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) {
                    this.spinner.hide();
                    this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
                }
            },
                error => {
                    this.appErrService.handleAppError(error);
                });
    }

    getAuditChecksDetailTypes() {
        this.spinner.show();
        let requestObj = { ClientData: this.clientData, UIData: this.uiData };
        const url = String.Join("/", this.apiConfigService.getAuditChecksDetailsUrl);
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                let result = response.body;
                this.spinner.hide();
                if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) {
                    if (!checkNullorUndefined(result.Response) && result.Response.DetailTypesList.length > 0) {
                        this.auditDetailTypeList = [];
                        result.Response.DetailTypesList.forEach((element) => {
                            let dd: dropdown = new dropdown();
                            dd.Id = element;
                            dd.Text = element;
                            this.auditDetailTypeList.push(dd);
                        });
                    }
                }
                else if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) {
                    this.spinner.hide();
                    this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
                }
            },
                error => {
                    this.appErrService.handleAppError(error);
                });
    }

    //addContolID -- on add btn click  adding data to grid in control section
    addAuditPointCheck() {
        if (!checkNullorUndefined(this.auditPointList)) {
            if (!checkNullorUndefined(this.editAuditPointParentIndex) && checkNullorUndefined(this.editAuditPointChildIndex)) {
                let errMsg = this.validateAuditPointData();
                if (errMsg) {
                    this.snackbar.error(errMsg);
                    return;
                }
                if (this.appService.IsObjectsMatch(this.auditPoint, this.tempAuditPoint) && this.appService.IsObjectsMatch(this.auditPointChecks, this.tempAuditPointCheck)) {
                    this.snackbar.info(this.appService.getErrorText('2660043'));
                    return;
                } else {
                    let editAuditPoint = this.auditPointList['Elements'][this.editAuditPointParentIndex];
                    editAuditPoint.Audit_Id = this.auditPoint.Audit_Id;
                    editAuditPoint.AuditCode = this.auditPoint.AuditCode;
                    editAuditPoint.AuditDescription = this.auditPoint.AuditDescription;
                    editAuditPoint.Active_YN = this.auditPoint.Active_YN;
                    editAuditPoint.AllowDupResults_YN = this.auditPoint.AllowDupResults_YN;
                    editAuditPoint.AllowUpdResults_YN = this.auditPoint.AllowUpdResults_YN;
                    editAuditPoint.ReferSerialNo_YN = this.auditPoint.ReferSerialNo_YN;
                    let currentAuditPointCheck = this.allActiveChecks.find(f => f.CheckCode == this.auditPointChecks.CheckCode);
                    this.auditPointChecks.CheckDesc = currentAuditPointCheck.CheckDesc;
                    editAuditPoint.ChildElements = editAuditPoint.ChildElements.concat(this.auditPointChecks);
                    this.isUpdatedAuditPoint = true;
                }
            }
            else if (!checkNullorUndefined(this.editAuditPointParentIndex) && !checkNullorUndefined(this.editAuditPointChildIndex)) {
                let errMsg = this.validateAuditPointData();
                if (errMsg) {
                    this.snackbar.error(errMsg);
                    return;
                }
                if (this.appService.IsObjectsMatch(this.auditPoint, this.tempAuditPoint) && this.appService.IsObjectsMatch(this.auditPointChecks, this.tempAuditPointCheck)) {
                    this.snackbar.info(this.appService.getErrorText('2660043'));
                    return;
                } else {
                    let editAuditPoint = this.updateParentAuditPoint();
                    this.updateChilAuditRecord(editAuditPoint, this.editAuditPointChildIndex);
                }
            }
            else {
                let isExistAuditPoint = this.auditPointList['Elements'].find(a => a.AuditCode == this.auditPoint.AuditCode);
                if (this.isAuditPointCodeDisabled) {
                    this.editAuditPointParentIndex = this.auditPointList['Elements'].findIndex(a => a.AuditCode == this.auditPoint.AuditCode);
                    let errMsg = this.validateAuditPointData();
                    if (errMsg) {
                        this.snackbar.error(errMsg);
                        return;
                    }
                    let editAuditPoint = this.auditPointList['Elements'][this.editAuditPointParentIndex];
                    editAuditPoint.Audit_Id = this.auditPoint.Audit_Id;
                    editAuditPoint.AuditCode = this.auditPoint.AuditCode;
                    editAuditPoint.AuditDescription = this.auditPoint.AuditDescription;
                    editAuditPoint.Active_YN = this.auditPoint.Active_YN;
                    editAuditPoint.AllowDupResults_YN = this.auditPoint.AllowDupResults_YN;
                    editAuditPoint.AllowUpdResults_YN = this.auditPoint.AllowUpdResults_YN;
                    editAuditPoint.ReferSerialNo_YN = this.auditPoint.ReferSerialNo_YN;
                    let currentAuditPointCheck = this.allActiveChecks.find(f => f.CheckCode == this.auditPointChecks.CheckCode);
                    this.auditPointChecks.CheckDesc = currentAuditPointCheck.CheckDesc;
                    editAuditPoint.ChildElements = editAuditPoint.ChildElements.concat(this.auditPointChecks);
                    this.clearAuditPoints();
                    return;
                }
                if (!checkNullorUndefined(isExistAuditPoint)) {
                    return this.snackbar.error(this.appService.getErrorText('6680001'));
                }
                this.AddNewAudit();
            }
        }
        else {
            this.AddNewAudit();
        }
        this.isSaveDisabled = false;
        this.clearAuditPoints();
    }

    private AddNewAudit() {
        this.tempProcessAuditPointsList = [];
        if (!checkNullorUndefined(this.auditPointList)) {
            this.tempProcessAuditPointsList = this.tempProcessAuditPointsList.concat(this.auditPointList['Elements']);
        }
        let auditPointChecks = [];
        let currentAuditPointCheck = this.allActiveChecks.find(f => f.CheckCode == this.auditPointChecks.CheckCode);
        this.auditPointChecks.CheckDesc = currentAuditPointCheck.CheckDesc;
        auditPointChecks.push(this.auditPointChecks);
        let element: any = {};
        element.Audit_Id = this.auditPoint.Audit_Id;
        element.AuditCode = this.auditPoint.AuditCode;
        element.AuditDescription = this.auditPoint.AuditDescription;
        element.Active_YN = this.auditPoint.Active_YN;
        element.AllowDupResults_YN = this.auditPoint.AllowDupResults_YN;
        element.AllowUpdResults_YN = this.auditPoint.AllowUpdResults_YN;
        element.ReferSerialNo_YN = this.auditPoint.ReferSerialNo_YN;
        element.ChildElements = auditPointChecks;
        element.EditVisible = "true";
        this.tempProcessAuditPointsList.push(element);
        this.grid = new Grid();
        this.grid.EditVisible = true;
        this.grid.PaginationId = "auditPointsList";
        this.auditPointList = this.appService.onGenerateJson(this.tempProcessAuditPointsList, this.grid);
        this.isEditAuditHeader = false;
        this.isSaveDisabled = false;
        //disable parent header record
        this.setAuditPointProperties(true);
    }

    private validateAuditPointData(): any {
        let errMsg: string = '';
        let isSameAuditDataExist;
        isSameAuditDataExist = this.auditPointList['Elements'][this.editAuditPointParentIndex].ChildElements.find(c => c.Check_Id == this.auditPointChecks.Check_Id);
        if (!checkNullorUndefined(isSameAuditDataExist)) {
            if (!checkNullorUndefined(this.editAuditPointChildIndex) && isSameAuditDataExist.Index == this.editAuditPointChildIndex) {
            }
            else {
                errMsg = this.appService.getErrorText('6680002');
                return errMsg;
            }
        }
        if (this.auditPointChecks.Default_YN == 'Y') {
            isSameAuditDataExist = this.auditPointList['Elements'][this.editAuditPointParentIndex].ChildElements.find(c => c.Default_YN == this.auditPointChecks.Default_YN);
            if (!checkNullorUndefined(isSameAuditDataExist)) {
                if (!checkNullorUndefined(this.editAuditPointChildIndex) && isSameAuditDataExist.Index == this.editAuditPointChildIndex) {
                } else {
                    errMsg = this.appService.getErrorText('6680003');
                    return errMsg;
                }
            }
        }

        isSameAuditDataExist = this.auditPointList['Elements'][this.editAuditPointParentIndex].ChildElements.find(c => c.Position == this.auditPointChecks.Position);
        if (!checkNullorUndefined(isSameAuditDataExist)) {
            if (!checkNullorUndefined(this.editAuditPointChildIndex) && isSameAuditDataExist.Index == this.editAuditPointChildIndex) {
            } else {
                errMsg = this.appService.getErrorText('6680004');
                return errMsg;
            }
        }
        return errMsg;
    }

    private updateParentAuditPoint() {
        let editAuditPoint = this.auditPointList['Elements'][this.editAuditPointParentIndex];
        editAuditPoint.Audit_Id = this.auditPoint.Audit_Id;
        editAuditPoint.AuditCode = this.auditPoint.AuditCode;
        editAuditPoint.AuditDescription = this.auditPoint.AuditDescription;
        editAuditPoint.Active_YN = this.auditPoint.Active_YN;
        editAuditPoint.AllowDupResults_YN = this.auditPoint.AllowDupResults_YN;
        editAuditPoint.AllowUpdResults_YN = this.auditPoint.AllowUpdResults_YN;
        editAuditPoint.ReferSerialNo_YN = this.auditPoint.ReferSerialNo_YN;
        return editAuditPoint;
    }

    private updateChilAuditRecord(editAuditPoint: any, index: any) {
        editAuditPoint.ChildElements[index].Check_Id = this.auditPointChecks.Check_Id;
        editAuditPoint.ChildElements[index].Position = this.auditPointChecks.Position;
        editAuditPoint.ChildElements[index].Default_YN = this.auditPointChecks.Default_YN;
        editAuditPoint.ChildElements[index].MultiChkElgbl_YN = this.auditPointChecks.MultiChkElgbl_YN;
        editAuditPoint.ChildElements[index].DetailRequired = this.auditPointChecks.DetailRequired;
        editAuditPoint.ChildElements[index].DetailType = this.auditPointChecks.DetailType;
        editAuditPoint.ChildElements[index].isUpdated = "Y";
    }

    //enableParentheaderFileds
    setAuditPointProperties(val) {
        this.isAuditPointCodeDisabled = val;
        this.isDisabledSearchIcon = val;
        this.isAuditPointDescDisabled = val;
        this.isAuditPointtoggleActive = val;
        this.isAuditPointtoggleAllowDupResults = val;
        this.isAuditPointtoggleRefserail = val;
        this.isAuditPointtoggleAllowUupResults = val;
    }

    //editAuditPointsDetailRow
    editAuditPointsDetailRow(event) {
        this.setAuditPointProperties(false);
        this.auditPoint = new AuditPoints();
        this.auditPointChecks = new AuditPointChecks();
        this.auditPoint = Object.assign(this.auditPoint, event);
        this.tempAuditPoint = new AuditPoints();
        this.tempAuditPointCheck = new AuditPointChecks();
        this.tempAuditPoint = Object.assign(this.tempAuditPoint, this.auditPoint);
        this.editAuditPointParentIndex = this.auditPointList['Elements'].findIndex(f => f.AuditCode == event.AuditCode);
        this.isAuditPointClearDisabled = true;
        this.isResetAuditPointDisabled = false;
        this.isChecksDisabled = false;
        this.isSaveDisabled = false;
        this.isAuditPointCodeDisabled = true;
        this.isDisabledSearchIcon = true;

        //based on this flag we are updating auditpoint on save auditpoint api
        this.isEditAuditHeader = true;
        this.auditPointChildElementsLength = this.auditPointList['Elements'][this.editAuditPointParentIndex].ChildElements.length;
        this.auditPointList['EditHighlight'] = true;
        this.lockMode = true;
        this.selectedAuditCode = this.auditPoint.AuditCode;
        this.isShowRmLock = true;
    }

    //editChildAuditPointsEditDetails
    emitChildAuditPointsEditDetails(editAuditPointsData) {
        this.auditPoint = new AuditPoints();
        this.auditPointChecks = new AuditPointChecks();
        this.tempAuditPoint = new AuditPoints();
        this.tempAuditPointCheck = new AuditPointChecks();

        this.auditPoint = Object.assign(this.auditPoint, editAuditPointsData.parentRow);
        this.auditPointChecks = Object.assign(this.auditPointChecks, editAuditPointsData.childRow);
        if (this.auditPointChecks.DetailType == 'NULL') {
            this.isAuditDetailRequiredDisabled = true;
            this.validateRegularExpressionFlag = false;
        } else {
            this.validateRegularExpressionFlag = false;
            this.isAuditDetailRequiredDisabled = false;
        }
        this.editAuditPointChildIndex = editAuditPointsData.childRow.Index;
        this.editAuditPointParentIndex = this.auditPointList['Elements'].findIndex(f => f.AuditCode == editAuditPointsData.parentRow.AuditCode);

        this.isChecksDisabled = true;
        this.isAuditPointClearDisabled = false;
        this.isResetAuditPointDisabled = false;
        this.setAuditPointProperties(true);
        this.isSaveDisabled = true;
        this.isEditAuditHeader = false;
        this.tempAuditPoint = Object.assign(this.tempAuditPoint, this.auditPoint);
        this.tempAuditPointCheck = Object.assign(this.tempAuditPointCheck, this.auditPointChecks);
        this.auditPointList['Elements'][this.editAuditPointParentIndex]['EditHighlight'] = true;
        this.lockMode = true;
        this.selectedAuditCode = this.auditPoint.AuditCode;
        this.isShowRmLock = true;
    }

    /************Save Audit Check Point***************/
    saveAuditCheckPoint() {
        this.appErrService.clearAlert();
        if (this.isEditAuditHeader) {
            if (!this.isUpdatedAuditPoint) {
                if ((this.appService.IsObjectsMatch(this.auditPoint, this.tempAuditPoint)) && this.auditPointChildElementsLength == this.auditPointList['Elements'][this.editAuditPointParentIndex].ChildElements.length) {
                    this.snackbar.info("No Changes To Save");
                    return;
                }
            }
            this.updateParentAuditPoint();
        }
        this.spinner.show();
        this.isSaveDisabled = true;
        this.auditPoint = this.auditPointList['Elements'];
        if (!checkNullorUndefined(this.auditPointList['Elements'])) {
            this.auditPointList['Elements'].forEach((element, i = 0) => {
                element.ChildElements.forEach((childElement) => {
                    if (checkNullorUndefined(childElement.isUpdated)) {
                        childElement.isUpdated = "N";
                    } else {
                        childElement.isUpdated = "Y";
                    }
                });
                this.auditPoint[i].AuditPointChecks = element.ChildElements;
                i++;
            });
        }
        let requestObj = { ClientData: this.clientData, UIData: this.uiData, AuditPoints: this.auditPoint };
        const url = String.Join("/", this.apiConfigService.saveAuditCheckPointUrl);
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                let result = response.body;
                this.spinner.hide();
                if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) {
                    if (result.StatusMessage) {
                        this.snackbar.success(result.StatusMessage);
                    }
                    this.auditPointList = null;
                    this.isEditAuditHeader = false;
                    // this.isSaveDisabled = true;
                    this.clearAuditPoints();
                    this.searchAuditPoints();
                    this.setAuditPointProperties(false);
                    this.isUpdatedAuditPoint = false;
                }
                else if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) {
                    this.isSaveDisabled = false;
                    this.spinner.hide();
                    this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
                }
            },
                error => {
                    this.appErrService.handleAppError(error);
                });
    }

    //validateRegularExpression
    validateRegularExpression() {
        this.appErrService.clearAlert();
        this.spinner.show();
        let auditDetail = new AuditDetail();
        auditDetail.DetailType = this.auditPointChecks.DetailType;
        auditDetail.DetailValue = this.auditPointChecks.DetailRequired;

        let requestObj = { ClientData: this.clientData, UIData: this.uiData, AuditDetail: auditDetail };

        const url = String.Join("/", this.apiConfigService.validateDetailRequiredUrl);
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                let result = response.body;
                this.spinner.hide();
                if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) {
                    this.validateRegularExpressionFlag = false;
                    this.isAuditDetailRequiredDisabled = true;
                    this.isValidateDisabled = true;
                }
                else if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) {
                    this.spinner.hide();
                    this.appErrService.setAlert(result.Response, true);
                    this.isAuditDetailRequiredDisabled = false;
                    this.isValidateDisabled = false;
                }
            },
                error => {
                    this.appErrService.handleAppError(error);
                });
    }

    //clearAuditPoints
    clearAuditPoints() {
        this.appErrService.clearAlert();
        this.auditPointChecks = new AuditPointChecks();
        this.tempAuditPointCheck = new AuditPointChecks();
        this.auditPoint.AuditPointChecks = [];
        this.editAuditPointChildIndex = null;
        this.isChecksDisabled = false;
        this.tempProcessAuditPointsList = [];
        this.isAuditPointClearDisabled = true;
        this.isAuditDetailRequiredDisabled = false;
        this.isValidateDisabled = true;
        this.isResetAuditPointDisabled = false;

        // to highlight rmgrid row on clear button
        if (this.auditPointList) {
            if (!checkNullorUndefined(this.auditPointList['Elements'])) {
                let checkAuditPoint = this.auditPointList['Elements'].find(f => f.AuditCode == this.auditPoint.AuditCode);
                if (!checkNullorUndefined(checkAuditPoint)) {
                    if (!checkNullorUndefined(checkAuditPoint.AuditCode)) {
                        if (this.rmGrid && this.rmGrid.selectedParent) {
                            checkAuditPoint['EditHighlight'] = false;
                            this.rmGrid.selectedParent = checkAuditPoint;
                            this.rmGrid.isChildEdit = false;
                        }
                    }
                }
            }
        }
    }

    resetAuditPoints() {
        this.appErrService.clearAlert();
        this.isResetAuditPointDisabled = true;
        this.isSaveDisabled = true;
        this.auditPointList = null;
        this.auditPoint = new AuditPoints();
        this.isChecksDisabled = false;
        this.tempAuditPoint = new AuditPoints();
        this.setAuditPointProperties(false);
        this.editAuditPointParentIndex = null;
        this.clearAuditPoints();
        this.lockMode = false;
        this.selectedAuditCode = null;
        this.isShowRmLock = false;
    }

    changeAuditPointDescription() {
        this.isAuditPointClearDisabled = false;
        this.isResetAuditPointDisabled = false;
        this.appErrService.clearAlert();
    }

    auditPointPostionChange() {

        this.isAuditPointClearDisabled = false;
        this.isResetAuditPointDisabled = false;
        this.appErrService.clearAlert();
    }

    changeAuditPointsInput() {
        this.isAuditPointClearDisabled = false;
        this.isResetAuditPointDisabled = false;
        this.appErrService.clearAlert();
    }
    changeAuditPositionInput() {
        this.isAuditPointClearDisabled = false;
        this.isResetAuditPointDisabled = false;
        this.appErrService.clearAlert();
    }
    changeAuditPointDetailRequired() {
        this.isAuditPointClearDisabled = false;
        this.isResetAuditPointDisabled = false;
        this.appErrService.clearAlert()
    }

    //onAuditActiveChange
    onAuditActiveChange(value) {
        this.auditPoint.Active_YN = value ? 'Y' : 'N';
        this.isAuditPointClearDisabled = false;
        this.isResetAuditPointDisabled = false;
    }

    //onAuditAllowDupResultsChange
    onAuditAllowDupResultsChange(value) {
        this.auditPoint.AllowDupResults_YN = value ? 'Y' : 'N';
        this.isAuditPointClearDisabled = false;
        this.isResetAuditPointDisabled = false;
    }

    //onAuditAllowUpdResultsChange
    onAuditAllowUpdResultsChange(value) {
        this.auditPoint.AllowUpdResults_YN = value ? 'Y' : 'N';
        this.isAuditPointClearDisabled = false;
        this.isResetAuditPointDisabled = false;
    }

    //onAuditReferSerialNoChange
    onAuditReferSerialNoChange(value) {
        this.auditPoint.ReferSerialNo_YN = value ? 'Y' : 'N';
        this.isAuditPointClearDisabled = false;
        this.isResetAuditPointDisabled = false;
    }
    //onCheckChange
    onCheckChange(event) {
        this.auditPointChecks.Check_Id = event.value;
        this.auditPointChecks.CheckCode = event.source.selected.viewValue;
        this.isAuditPointClearDisabled = false;
        this.isResetAuditPointDisabled = false;
    }
    //changeDefaultAuditPoint
    changeDefaultAuditPoint(value) {
        this.auditPointChecks.Default_YN = value ? 'Y' : 'N';
        this.isAuditPointClearDisabled = false;
        this.isResetAuditPointDisabled = false;
    }
    //changeAuditPointMultiChkEligible
    changeAuditPointMultiChkEligible(value) {
        this.auditPointChecks.MultiChkElgbl_YN = value ? 'Y' : 'N';
        this.isAuditPointClearDisabled = false;
        this.isResetAuditPointDisabled = false;
    }

    changeAuditPointDetailtype(event) {
        this.appErrService.clearAlert();
        this.auditPointChecks.DetailType = event.value;
        this.auditPointChecks.DetailRequired = '';
        if (this.auditPointChecks.DetailType == "NULL") {
            this.isAuditDetailRequiredDisabled = true;
            this.auditPointChecks.DetailRequired = '';
            this.isValidateDisabled = true;
            this.isAuditPointClearDisabled = false;
            this.isResetAuditCheckDisabled = false;
            this.validateRegularExpressionFlag = false;
        } else {
            this.isValidateDisabled = true;
            this.isAuditDetailRequiredDisabled = false;
            this.validateRegularExpressionFlag = true;
            this.isAuditPointClearDisabled = false;
            this.isResetAuditPointDisabled = false;

        }
    }

    checkValidateBtn(event) {
        this.appErrService.clearAlert();
        this.auditPointChecks.DetailRequired = event;
        if (this.auditPointChecks.DetailRequired != "" && this.auditPointChecks.DetailType != "") {
            this.isValidateDisabled = false;
            this.validateRegularExpressionFlag = true;
        }
        if (this.auditPointChecks.DetailRequired == "") {
            this.isValidateDisabled = true;
            this.validateRegularExpressionFlag = true;
        }

    }
    ngOnDestroy() {
        this.masterPageService.hideSpinner = false;
        this.emitHideSpinner.unsubscribe();
        this.masterPageService.emitHideSpinner.next(null);
        this.masterPageService.moduleName.next(null);
        this.masterPageService.clearModule();
        this.appErrService.clearAlert();
        if (this.masterPageService.hideControls.controlProperties) {
            this.masterPageService.hideControls.controlProperties = new EngineResult();
        }
        this.masterPageService.hideModal();
    }
}


