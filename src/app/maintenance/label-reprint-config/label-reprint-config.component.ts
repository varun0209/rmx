import { Component, OnInit, OnDestroy, Query, ViewChild } from "@angular/core";
import { AppErrorService } from "../../utilities/rlcutl/app-error.service";
import { MasterPageService } from "../../utilities/rlcutl/master-page.service";
import { ClientData } from "../../models/common/ClientData";
import { UiData } from "../../models/common/UiData";
import { CommonEnum } from "../../enums/common.enum";
import { ApiConfigService } from "../../utilities/rlcutl/api-config.service";
import { ApiService } from "../../utilities/rlcutl/api.service";
import { NgxSpinnerService } from "ngx-spinner";
import { String } from "typescript-string-operations";
import { Grid } from "../../models/common/Grid";
import { AppService } from "../../utilities/rlcutl/app.service";
import { dropdown } from "../../models/common/Dropdown";
import { StatusCodes } from "../../enums/status.enum";
import {
    AdhocLabel,
    Parameter,
    AdhocPrintConfig
} from "../../models/maintenance/adhoc-label-config/adhocLabel";
import { Subscription } from "rxjs";
import { CommonService } from '../../services/common.service';
import { LabelReprint } from '../../enums/labelReprintConfig.enums';
import { StorageData } from '../../enums/storage.enum';
import { DeleteConfirmationDialogComponent } from "../../framework/frmctl/delete-confirmation-dialog/delete-confirmation-dialog.component";
import { XpoSnackBar } from "@xpo/ngx-core/snack-bar";

@Component({
    selector: "app-label-reprint-config",
    templateUrl: "./label-reprint-config.component.html",
    styleUrls: ["./label-reprint-config.component.css"]
})
export class LabelReprintConfigComponent implements OnInit, OnDestroy {
    // config
    clientData = new ClientData();
    uiData = new UiData();
    laberReprintBtnName = CommonEnum.add;
    commonButton = CommonEnum;
    grid: Grid;

    adhocLabelDoc = new AdhocLabel();
    tempAdhocLabelDoc = new AdhocLabel();

    @ViewChild('deleteModal') deleteModal;

    isResetBtnDisabled = true;
    isClearBtnDisabled = true;
    isDeleteParameterDisabled = false;
    isAddParameterDisabled = false;

    isNameDisabled = false;
    isFileNameDisabled = false;
    isDescriptionDisabled = false;
    isDocTypeDisabled = false;
    isCategoryDisabled = false;
    isDocFormatDisabled = false;
    isTriggerDisabled = false;
    isAllowedUserDisabled = false;
    isImageNameDisabled = false;
    isNotesDisabled = false;
    isHeaderQueryDisabled = false;
    isQueryIdDisabled = false;
    isParameterNameDisabled = false;
    isParameterTypeDisabled = false;
    isDefaultValueDisabled = false;
    isLookupQueryDisabled = false;
    textBoxPattern: any;
    isValidateDisabled = true;
    isSearchIconLabelBtnDisabled = false;

    dockTypesList = [];
    categoryList = [];
    dockFormatList = [];
    triggerList = [];
    allowedUserList = [];

    laberReprintList: any;
    tempLaberReprintList: any[] = [];

    //multi-select dropdown settings
    dropdownSettings = {
        singleSelection: false,
        enableCheckAll: false,
        idField: "Id",
        textField: "Text",
        itemsShowLimit: 1,
        allowSearchFilter: true,
        closeDropDownOnSelection: false
    };

    parameterIndex: number = 0;
    isValidateAddBtnFlag = true;
    emitHideSpinner: Subscription;
    isEditMode = false;
    editParameterIndex: any;
    editAdhocLabelDocIndex: any;
    editParameterMode = false;
    remainingParameters: any;
    deleteAdhocLabelRecord: any;


    // print config
    adhocPrintConfigBtnName = CommonEnum.add;

    // model
    adhocPrintConfig = new AdhocPrintConfig();
    tempAdhocPrintConfig = new AdhocPrintConfig();

    // dropdown list
    labelNameOptions = [];
    printerTypeList = [];
    adhocPrintConfigList: any;

    // disabled
    isLabelNameDisabled = false;
    isPrintResetDisabled = true;
    isPrinterNameDisabled = false;
    isPrinterTypeDisbled = false;

    labelReprint = LabelReprint;
    selectedTab = LabelReprint.labelConfig;

    constructor(
        public appErrService: AppErrorService,
        public masterPageService: MasterPageService,
        private apiConfigService: ApiConfigService,
        public apiService: ApiService,
        private spinner: NgxSpinnerService,
        public appService: AppService,
        private snackbar: XpoSnackBar,
        private commonService: CommonService
    ) {

        const pattern = JSON.parse(localStorage.getItem(StorageData.patternList));
        if (!this.appService.checkNullOrUndefined(pattern)) {
                this.textBoxPattern = new RegExp(pattern.namePattern);
        }
        this.emitHideSpinner = this.masterPageService.emitHideSpinner.subscribe(
            spinnerFlag => {
                if (!this.appService.checkNullOrUndefined(spinnerFlag) && spinnerFlag) {
                    this.getDockTypesList();
                }
            }
        );
    }

    ngOnInit() {
        let operationObj = this.masterPageService.getRouteOperation();
        if (operationObj) {
            this.uiData.OperationId = operationObj.OperationId;
            this.uiData.OperCategory = operationObj.Category;
            this.masterPageService.hideSpinner = true;
            this.clientData = JSON.parse(localStorage.getItem("clientData"));
            this.masterPageService.setTitle(operationObj.Title);
            this.masterPageService.setModule(operationObj.Module);
            this.appErrService.appMessage();
        }
        this.nameFocus();
        this.adhocLabelDoc.ParameterAttributeValues.push(new Parameter());
    }

    //getDockTypesList
    getDockTypesList() {
        this.spinner.show();
        let requestObj = { ClientData: this.clientData, UIData: this.uiData };
        const url = String.Join("/", this.apiConfigService.getDockTypesList);
        this.apiService.apiPostRequest(url, requestObj).subscribe(
            response => {
                let result = response.body;
                if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
                    if (
                        !this.appService.checkNullOrUndefined(result.Response) &&
                        result.Response.DockTypes &&
                        result.Response.DockTypes.length
                    ) {
                        this.dockTypesList = [];
                        result.Response.DockTypes.forEach(element => {
                            let dd: dropdown = new dropdown();
                            dd.Id = element.ID;
                            dd.Text = element.TEXT;
                            this.dockTypesList.push(dd);
                        });
                    }
                    this.getCategoryList();
                } else if (
                    !this.appService.checkNullOrUndefined(result) &&
                    result.Status === StatusCodes.fail
                ) {
                    this.spinner.hide();
                    this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
                }
            },
            error => {
                this.appErrService.handleAppError(error);
            }
        );
    }

    //getcategoryList
    getCategoryList() {
        this.spinner.show();
        let requestObj = { ClientData: this.clientData, UIData: this.uiData };
        const url = String.Join("/", this.apiConfigService.getCategoryList);
        this.apiService.apiPostRequest(url, requestObj).subscribe(
            response => {
                let result = response.body;
                if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
                    if (
                        !this.appService.checkNullOrUndefined(result.Response) &&
                        result.Response.Categorys &&
                        result.Response.Categorys.length
                    ) {
                        this.categoryList = [];
                        result.Response.Categorys.forEach(element => {
                            let dd: dropdown = new dropdown();
                            dd.Id = element.ID;
                            dd.Text = element.TEXT;
                            this.categoryList.push(dd);
                        });
                    }
                    this.getDockFormatList();
                } else if (
                    !this.appService.checkNullOrUndefined(result) &&
                    result.Status === StatusCodes.fail
                ) {
                    this.spinner.hide();
                    this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
                }
            },
            error => {
                this.appErrService.handleAppError(error);
            }
        );
    }

    //getdockFormatList
    getDockFormatList() {
        this.spinner.show();
        let requestObj = { ClientData: this.clientData, UIData: this.uiData };
        const url = String.Join("/", this.apiConfigService.getDockFormatList);
        this.apiService.apiPostRequest(url, requestObj).subscribe(
            response => {
                let result = response.body;
                if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
                    if (
                        !this.appService.checkNullOrUndefined(result.Response) &&
                        result.Response.DockFormat &&
                        result.Response.DockFormat.length
                    ) {
                        this.dockFormatList = [];
                        result.Response.DockFormat.forEach(element => {
                            let dd: dropdown = new dropdown();
                            dd.Id = element.ID;
                            dd.Text = element.TEXT;
                            this.dockFormatList.push(dd);
                        });
                    }
                    this.getTriggerList();
                } else if (
                    !this.appService.checkNullOrUndefined(result) &&
                    result.Status === StatusCodes.fail
                ) {
                    this.spinner.hide();
                    this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
                }
            },
            error => {
                this.appErrService.handleAppError(error);
            }
        );
    }

    //gettriggerList
    getTriggerList() {
        this.spinner.show();
        let requestObj = { ClientData: this.clientData, UIData: this.uiData };
        const url = String.Join("/", this.apiConfigService.getTriggerList);
        this.apiService.apiPostRequest(url, requestObj).subscribe(
            response => {
                let result = response.body;
                if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
                    if (
                        !this.appService.checkNullOrUndefined(result.Response) &&
                        result.Response.TriggerList &&
                        result.Response.TriggerList.length
                    ) {
                        this.triggerList = [];
                        result.Response.TriggerList.forEach(element => {
                            let dd: dropdown = new dropdown();
                            dd.Id = element.ID;
                            dd.Text = element.TEXT;
                            this.triggerList.push(dd);
                        });
                    }
                    this.getRoles();
                } else if (
                    !this.appService.checkNullOrUndefined(result) &&
                    result.Status === StatusCodes.fail
                ) {
                    this.spinner.hide();
                    this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
                }
            },
            error => {
                this.appErrService.handleAppError(error);
            }
        );
    }

    //getRoles
    getRoles() {
        this.spinner.show();
        let requestObj = { ClientData: this.clientData, UIData: this.uiData };
        const url = String.Join("/", this.apiConfigService.getRoles);
        this.apiService.apiPostRequest(url, requestObj).subscribe(
            response => {
                let result = response.body;
                this.spinner.hide();
                if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
                    if (
                        !this.appService.checkNullOrUndefined(result.Response) &&
                        result.Response.RolesList &&
                        result.Response.RolesList.length
                    ) {
                        this.allowedUserList = [];
                        result.Response.RolesList.forEach(element => {
                            let dd: dropdown = new dropdown();
                            dd.Id = element.ID;
                            dd.Text = element.TEXT;
                            this.allowedUserList.push(dd);
                        });
                    }
                } else if (
                    !this.appService.checkNullOrUndefined(result) &&
                    result.Status === StatusCodes.fail
                ) {
                    this.spinner.hide();
                    this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
                }
            },
            error => {
                this.appErrService.handleAppError(error);
            }
        );
    }

    //nameFocus
    nameFocus() {
        this.appService.setFocus("name");
    }
    //docTypeFocus
    docTypeFocus() {
        this.appService.setFocus("docType");
    }
    //caegoryFocus
    categoryFocus() {
        this.appService.setFocus("category");
    }
    //docFormatFocus
    docFormatFocus() {
        this.appService.setFocus("dockFormat");
    }
    //printerTypeFocus
    printerTypeFocus() {
        this.appService.setFocus("printerType");
    }
    //triggerFocus
    triggerFocus() {
        this.appService.setFocus("trigger");
    }
    //allowedUserFocus
    allowedUserFocus() {
        this.appService.setFocus("allowedUser");
    }

    validateHeaderQuery() {
        this.appErrService.clearAlert();
        this.spinner.show();
        let requestObj = {
            ClientData: this.clientData,
            UIData: this.uiData,
            AdhocDocumentPrint: { HeaderQuery: this.adhocLabelDoc.HeaderQuery }
        };
        const url = String.Join("/", this.apiConfigService.validateQuery);
        this.apiService.apiPostRequest(url, requestObj).subscribe(
            response => {
                let result = response.body;
                this.spinner.hide();
                if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
                    this.snackbar.success(result.StatusMessage);
                    this.isHeaderQueryDisabled = true;
                    this.isValidateDisabled = true;
                    this.isValidateAddBtnFlag = false;
                } else if (
                    !this.appService.checkNullOrUndefined(result) &&
                    result.Status === StatusCodes.fail
                ) {
                    this.isHeaderQueryDisabled = false;
                    this.isValidateDisabled = false;
                    this.isValidateAddBtnFlag = true;
                    this.spinner.hide();
                    this.appErrService.setAlert(result.StatusMessage, true);
                }
            },
            error => {
                this.appErrService.handleAppError(error);
            }
        );
    }

    searchadhocLabelName() {
        this.spinner.show();
        this.appErrService.clearAlert();
        let requestObj = {
            ClientData: this.clientData,
            UIData: this.uiData
        };
        const url = String.Join("/", this.apiConfigService.getAdhocLabelConfigs, this.adhocLabelDoc.Label);
        this.apiService.apiPostRequest(url, requestObj).subscribe(
            response => {
                let result = response.body;
                this.spinner.hide();
                if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
                    if (
                        !this.appService.checkNullOrUndefined(result.Response) &&
                        result.Response.length
                    ) {
                        this.onProcessAdhocJSONGrid(result.Response);
                        this.grid = new Grid();
                        this.grid.EditVisible = true;
                        this.grid.DeleteVisible = true;
                        this.laberReprintList = this.appService.onGenerateJson(
                            this.tempLaberReprintList,
                            this.grid
                        );
                    }
                } else if (
                    !this.appService.checkNullOrUndefined(result) &&
                    result.Status === StatusCodes.fail
                ) {
                    this.spinner.hide();
                    this.laberReprintList = null;
                    this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
                }
            },
            error => {
                this.appErrService.handleAppError(error);
            }
        );
    }

    onProcessAdhocJSONGrid(Response) {
        if (!this.appService.checkNullOrUndefined(Response)) {
            this.tempLaberReprintList = [];
            Response.forEach(res => {
                delete res.ParameterAttribute;
                res.ChildElements = this.processChildElements(
                    res.ParameterAttributeValues
                );
                delete res.ParameterAttributeValues;
                res.EditVisible = 'true';
                this.tempLaberReprintList.push(res);
            });
        }
    }

    customTrackBy(index: number, obj: any): any {
        return index;
    }

    processChildElements(Response) {
        if (!this.appService.checkNullOrUndefined(Response)) {
            let paramterAttribues = [];
            Response.forEach(res => {
                paramterAttribues.push(res);
            });
            return paramterAttribues;
        }
    }

    addOrUpdatelaberReprintInfo() {
        this.appErrService.clearAlert();
        this.spinner.show();
        let url;
        if (this.laberReprintBtnName == this.commonButton.add) {
            url = String.Join("/", this.apiConfigService.insertAdhocLabelConfig);
        } else if (this.laberReprintBtnName == this.commonButton.save) {
            if (
                this.appService.IsObjectsMatch(
                    this.adhocLabelDoc,
                    this.tempAdhocLabelDoc
                )
            ) {
                this.snackbar.info(this.appService.getErrorText("2660043"));
                this.spinner.hide();
                return;
            }
            url = String.Join("/", this.apiConfigService.updateAdhocLabelConfig);
            this.appendAllParameters();
        }
        this.isValidateAddBtnFlag = true;
        const requestObj = {
            ClientData: this.clientData,
            UIData: this.uiData,
            AdhocLabelConfig: this.adhocLabelDoc
        };
        this.apiService.apiPostRequest(url, requestObj).subscribe(
            response => {
                let result = response.body;
                this.spinner.hide();
                if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
                    if (!this.appService.checkNullOrUndefined(result.Response)) {
                        this.onProcessAdhocJSONGrid(result.Response);
                        this.grid = new Grid();
                        this.grid.EditVisible = true;
                        this.grid.DeleteVisible = true;
                        this.laberReprintList = this.appService.onGenerateJson(
                            this.tempLaberReprintList,
                            this.grid
                        );
                        this.isEditMode = false;
                        this.editParameterMode = false;
                        this.clearadhocLabelDoc();
                    }
                    if (!this.appService.checkNullOrUndefined(result.StatusMessage)) {
                        this.snackbar.success(result.StatusMessage);
                    }
                } else if (
                    !this.appService.checkNullOrUndefined(result) &&
                    result.Status === StatusCodes.fail
                ) {
                    this.isValidateAddBtnFlag = false;
                    this.laberReprintList = null;
                    this.spinner.hide();
                    this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
                }
            },
            error => {
                this.appErrService.handleAppError(error);
            }
        );
    }

    appendAllParameters() {
        if (this.editParameterMode) {
            this.remainingParameters[this.editParameterIndex] = this.adhocLabelDoc.ParameterAttributeValues[0];
            this.adhocLabelDoc.ParameterAttributeValues = [...this.remainingParameters];
        }
    }

    editAdhocLabelDoc(event) {
        this.editModeConfig();
        this.adhocLabelDoc = Object.assign(this.adhocLabelDoc, event);
        this.tempAdhocLabelDoc = Object.assign(this.tempAdhocLabelDoc, event);
        this.adhocLabelDoc.ParameterAttributeValues = [...event.ChildElements];
        this.tempAdhocLabelDoc.ParameterAttributeValues = [...event.ChildElements];
        this.editAdhocLabelDocIndex = this.laberReprintList['Elements'].findIndex(f => f === event);
        this.parameterIndex = this.adhocLabelDoc.ParameterAttributeValues.length;
        this.adhocLabelDoc.ParameterAttributeValues.push(new Parameter());
        this.editParameterMode = false;
    }

    private editModeConfig() {
        this.adhocLabelDoc = new AdhocLabel();
        this.tempAdhocLabelDoc = new AdhocLabel();
        this.laberReprintBtnName = this.commonButton.save;
        this.isValidateAddBtnFlag = false;
        this.isClearBtnDisabled = false;
        this.isEditMode = true;
        this.isNameDisabled = true;
        this.isSearchIconLabelBtnDisabled = true;
    }

    editParameters(event) {
        this.editModeConfig();
        this.remainingParameters = [];
        this.adhocLabelDoc.ParameterAttributeValues = [];
        this.adhocLabelDoc = Object.assign(this.adhocLabelDoc, event.parentRow);
        this.tempAdhocLabelDoc = Object.assign(this.tempAdhocLabelDoc, event.parentRow);
        this.adhocLabelDoc.ParameterAttributeValues.push({ ...event.childRow });
        this.tempAdhocLabelDoc.ParameterAttributeValues.push({ ...event.childRow });
        this.editParameterIndex = event.childRow.Index;
        this.remainingParameters = [...event.parentRow.ChildElements];
        this.editAdhocLabelDocIndex = this.laberReprintList['Elements'].findIndex(f => f == event.parentRow);
        this.laberReprintList['Elements'][this.editAdhocLabelDocIndex]['EditHighlight'] = true;
        this.editParameterMode = true;
        this.parameterIndex = 0;
    }
    deleteAdhocLabelRow(event) {
        this.deleteAdhocLabelRecord = event;
        this.masterPageService.openModelPopup(DeleteConfirmationDialogComponent);
        this.masterPageService.dialogRef.componentInstance.emitConfirmation.subscribe(($e) => {
          this.deleteRecord();
        });
    }

    deleteAdhocLabelDoc() {
        this.spinner.show();
        const deleteAdhocLabelIndex = this.laberReprintList['Elements'].findIndex(f => f === this.deleteAdhocLabelRecord);
        const requestObj = { ClientData: this.clientData, UIData: this.uiData };
        const url = String.Join('/', this.apiConfigService.deleteAdhocLabelConfig, this.deleteAdhocLabelRecord.Label);
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                const result = response.body;
                this.spinner.hide();
                if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
                    if (!this.appService.checkNullOrUndefined(result.Response)) {
                        this.snackbar.success(result.Response);
                        this.laberReprintList['Elements'].splice(deleteAdhocLabelIndex, 1);
                        this.masterPageService.hideDialog();
                        if (!this.laberReprintList['Elements'].length) {
                            this.laberReprintList = null;
                        }
                        this.clearadhocLabelDoc();
                    }
                }
                else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
                    this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
                    this.masterPageService.hideDialog();
                }
            },
                error => {
                    this.appErrService.handleAppError(error);
                });
    }

    clearadhocLabelDoc() {
        this.adhocLabelDoc = new AdhocLabel();
        this.tempAdhocLabelDoc = new AdhocLabel();
        this.isClearBtnDisabled = true;
        this.isValidateAddBtnFlag = true;
        this.isValidateDisabled = true;
        this.appErrService.clearAlert();
        this.isHeaderQueryDisabled = false;
        this.parameterIndex = 0;
        this.isNameDisabled = false;
        this.isSearchIconLabelBtnDisabled = false;
        this.laberReprintBtnName = this.commonButton.add;
        this.adhocLabelDoc.ParameterAttributeValues.push(new Parameter());
        this.remainingParameters = [];
        if (this.isEditMode && !this.appService.checkNullOrUndefined(this.laberReprintList)) {
            this.laberReprintList['EditHighlight'] = false;
        }
        if (this.editParameterMode && !this.appService.checkNullOrUndefined(this.laberReprintList['Elements'])) {
            this.laberReprintList['Elements'][this.editAdhocLabelDocIndex]['EditHighlight'] = false;
        }
        this.isEditMode = false;
        this.editParameterMode = false;
    }
    resetadhocLabelDoc() {
        this.clearadhocLabelDoc();
        this.isResetBtnDisabled = true;
        if (!this.appService.checkNullOrUndefined(this.laberReprintList)) {
            this.laberReprintList = null;
        }
        if (!this.appService.checkNullOrUndefined(this.tempLaberReprintList)) {
            this.tempLaberReprintList = [];
        }
        this.laberReprintBtnName = this.commonButton.add;
    }
    onLabelChange() {
        this.enableButtons();
    }

    enableButtons() {
        this.isClearBtnDisabled = false;
        this.isResetBtnDisabled = false;
    }

    onFileChange() {
        this.enableButtons();
    }

    onDescriptionChange() {
        this.enableButtons();
    }

    onDockTypeChange(val) {
        this.adhocLabelDoc.DockType = val;
        this.enableButtons();
        this.categoryFocus();
    }
    onCategoryChange(val) {
        this.adhocLabelDoc.DockCategory = val;
        this.enableButtons();
        this.docFormatFocus();
    }
    onDockFormatChange(val) {
        this.adhocLabelDoc.DockFormat = val;
        this.enableButtons();
        this.printerTypeFocus();
    }
    onTriggerChange(val) {
        this.adhocLabelDoc.Trigger = val;
        this.enableButtons();
        this.allowedUserFocus();
    }
    onAllowedUserChange() {
        this.enableButtons();
    }
    onSelectRole(event) {
        this.adhocLabelDoc.AllowedUsers.push(event.Id);
    }

    onDeSelectRole(event) {
        this.adhocLabelDoc.AllowedUsers = this.adhocLabelDoc.AllowedUsers.filter(
            elem => elem !== event.Id
        );
    }

    onImageNameChange() {
        this.enableButtons();
    }
    onNotesChange() {
        this.enableButtons();
    }


    onHeaderQueryChange() {
        this.enableButtons();
        this.isValidateDisabled = false;
        if (this.isEditMode) {
            this.isValidateAddBtnFlag = true;
        }
    }

    onParameterTypeChange() {
        this.enableButtons();
    }
    onParameterNameChange() {
        this.enableButtons();
    }
    onDefaultValueChange() {
        this.enableButtons();
    }
    onLookupQueryChange() {
        this.enableButtons();
    }

    addParamterInfo() {
        this.parameterIndex++;
        this.adhocLabelDoc.ParameterAttributeValues.push(new Parameter());
    }
    deleteParamterInfo(index) {
        this.parameterIndex--;
        this.adhocLabelDoc.ParameterAttributeValues.splice(index, 1);
    }


    // print config

    selectedConfigTab(value) {
        this.selectedTab = value;
        if (this.selectedTab == LabelReprint.labelConfig) {
            this.nameFocus();
        } else if (this.selectedTab == LabelReprint.printConfig) {
            this.resetPrintConfig();
            this.labelNameFoucs();
            this.getLabelNameList();
        }
    }

    deleteRecord() {
        if (this.selectedTab == LabelReprint.labelConfig) {
            this.deleteAdhocLabelDoc();
        } else if (this.selectedTab == LabelReprint.printConfig) {
            this.deleteAdhocPrinterConfig();
        }
    }

    getLabelNameList() {
        this.labelNameOptions = [];
        const requestObj = { ClientData: this.clientData, UIData: this.uiData };
        const url = String.Join('/', this.apiConfigService.getAdhocLabelNames);
        this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
            if (statusFlag) {
                if (!this.appService.checkNullOrUndefined(res.Response)) {
                    res.Response.forEach((element) => {
                        const dd: dropdown = new dropdown();
                        dd.Id = element;
                        dd.Text = element;
                        this.labelNameOptions.push(dd);
                    });
                }
            }
            this.getPrinterTypesList();
        });
    }

    // getprinterTypeList
    getPrinterTypesList() {
        this.spinner.show();
        const requestObj = { ClientData: this.clientData, UIData: this.uiData };
        const url = String.Join('/', this.apiConfigService.getPrinterTypesList);
        this.apiService.apiPostRequest(url, requestObj).subscribe(
            response => {
                const result = response.body;
                this.spinner.hide();
                if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
                    if (
                        !this.appService.checkNullOrUndefined(result.Response) &&
                        result.Response.PrinterTypes &&
                        result.Response.PrinterTypes.length
                    ) {
                        this.printerTypeList = [];
                        result.Response.PrinterTypes.forEach(element => {
                            let dd: dropdown = new dropdown();
                            dd.Id = element.ID;
                            dd.Text = element.TEXT;
                            this.printerTypeList.push(dd);
                        });
                    }
                } else if (
                    !this.appService.checkNullOrUndefined(result) &&
                    result.Status === StatusCodes.fail
                ) {
                    this.spinner.hide();
                    this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
                }
            },
            error => {
                this.appErrService.handleAppError(error);
            }
        );
    }

    getPrinterNameList() {
        const requestObj = { ClientData: this.clientData, UIData: this.uiData };
        const url = String.Join('/', this.apiConfigService.getAdhocPrinterConfigs, this.adhocPrintConfig.Label);
        this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
            this.spinner.hide();
            if (statusFlag) {
                if (!this.appService.checkNullOrUndefined(res.Response) && res.Response.length) {
                    this.showPrintConfigGrid(res.Response);
                }
            } else {
                this.adhocPrintConfigList = null;
            }
        });
    }

    onPrinterTypeChange(val) {
        this.adhocPrintConfig.PrinterType = val;
    }


    onLabelNameSelect(event) {
        this.adhocPrintConfig = new AdhocPrintConfig();
        this.adhocPrintConfig.Label = event.value;
        this.getPrinterNameList();
    }

    changePrintConfig() {
        this.appErrService.clearAlert();
        this.isPrintResetDisabled = false;
    }

    labelNameFoucs() {
        this.appService.setFocus('labelName');
    }

    editAdhocPrintConfig(data) {
        this.appErrService.clearAlert();
        this.adhocPrintConfig = new AdhocPrintConfig();
        this.tempAdhocPrintConfig = new AdhocPrintConfig();
        this.adhocPrintConfig = Object.assign(this.adhocPrintConfig, data);
        this.tempAdhocPrintConfig = Object.assign(this.tempAdhocPrintConfig, data);
        this.isLabelNameDisabled = true;
        this.isPrinterNameDisabled = true;
        this.isPrintResetDisabled = false;
        this.adhocPrintConfigBtnName = CommonEnum.save;
        this.adhocPrintConfigList['EditHighlight'] = true;
    }

    deleteAdhocPrintConfigRow(event) {
        this.adhocPrintConfig = event;
        // this.masterPageService.openModelPopup(this.deleteModal);
        this.masterPageService.openModelPopup(DeleteConfirmationDialogComponent);
        this.masterPageService.dialogRef.componentInstance.emitConfirmation.subscribe(($e) => {
          this.deleteRecord();
        });
    }

    addOrUpdatePrintConfig() {
        let url;
        if (this.adhocPrintConfigBtnName == CommonEnum.add) {
            url = String.Join('/', this.apiConfigService.insertAdhocPrinterConfig);
        } else if (this.adhocPrintConfigBtnName == CommonEnum.save) {
            if (this.appService.IsObjectsMatch(this.adhocPrintConfig, this.tempAdhocPrintConfig)) {
                this.snackbar.info(this.appService.getErrorText('2660043'));
                return;
            }
            url = String.Join('/', this.apiConfigService.updateAdhocPrinterConfig);
        }

        const requestObj = { ClientData: this.clientData, UIData: this.uiData, AdhocPrinterConfig: this.adhocPrintConfig };
        this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
            this.spinner.hide();
            if (statusFlag) {
                if (!this.appService.checkNullOrUndefined(res.Response) && res.Response) {
                    if (res.Response.length) {
                        this.showPrintConfigGrid(res.Response);
                        this.snackbar.success(res.StatusMessage);
                        this.resetPrintConfig(true);
                    }
                }
            }
        });
    }

    deleteAdhocPrinterConfig() {
        const requestObj = { ClientData: this.clientData, UIData: this.uiData, AdhocPrinterConfig: this.adhocPrintConfig };
        const url = String.Join('/', this.apiConfigService.deleteAdhocPrinterConfig);
        this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
            this.masterPageService.hideDialog();
            if (statusFlag) {
                if (!this.appService.checkNullOrUndefined(res.Response)) {
                    this.snackbar.success(res.Response);
                    this.resetPrintConfig(true);
                    this.getPrinterNameList();
                }
            }
        });
    }

    showPrintConfigGrid(gridData) {
        this.adhocPrintConfigList = [];
        this.grid = new Grid();
        this.grid.EditVisible = true;
        this.grid.DeleteVisible = true;
        this.adhocPrintConfigList = this.appService.onGenerateJson(gridData, this.grid);
    }

    resetPrintConfig(isGridRequried?) {
        this.appErrService.clearAlert();
        this.isPrintResetDisabled = true;
        this.isLabelNameDisabled = false;
        this.isPrinterNameDisabled = false;
        const label = this.adhocPrintConfig.Label;
        this.adhocPrintConfigBtnName = CommonEnum.add;
        this.adhocPrintConfig = new AdhocPrintConfig();
        this.tempAdhocPrintConfig = new AdhocPrintConfig();
        if (!isGridRequried) {
            this.adhocPrintConfigList = null;
        } else {
            this.isPrintResetDisabled = false;
            this.adhocPrintConfig.Label = label;
        }
    }

    ngOnDestroy() {
        this.emitHideSpinner.unsubscribe();
        this.masterPageService.defaultProperties();
    }
}
