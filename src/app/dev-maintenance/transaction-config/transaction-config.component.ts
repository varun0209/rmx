import { Component, OnInit, OnDestroy } from '@angular/core';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';
import { Grid } from '../../models/common/Grid';
import { AppService } from '../../utilities/rlcutl/app.service';
import { dropdown } from '../../models/common/Dropdown';
import { ApiService } from '../../utilities/rlcutl/api.service';
import { FormBuilder } from '@angular/forms';
import { ApiConfigService } from '../../utilities/rlcutl/api-config.service';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { String } from 'typescript-string-operations';
import { ClientData } from '../../models/common/ClientData';
import { UiData } from '../../models/common/UiData';
import { Rule, TransactionConfig, ControlAttr } from '../../models/dev-maintenance/transaction-config';
import { TransactionConfigBtn } from '../../enums/transaction-config-btn';
import { Subscription } from 'rxjs';
import { RmgridService } from '../../framework/frmctl/rmgrid/rmgrid.service';
import { StorageData } from '../../enums/storage.enum';
import { StatusCodes } from '../../enums/status.enum';
import { TransControlId } from './../../enums/trans-control-id.enum';
import { checkNullorUndefined } from './../../enums/nullorundefined';

@Component({
    selector: 'app-transaction-config',
    templateUrl: './transaction-config.component.html',
    styleUrls: ['./transaction-config.component.css']
})
export class TransactionConfigComponent implements OnInit, OnDestroy {
    /**category section */
    categoryCodeOptions = [];
    seletedCategory: string;
    operationTrans: any;

    /**Transaction Section**/
    isTestTypeDisabled = true;
    isTransDescriptionDisabled = true;


    /**Rules Section**/
    isTransCodeDisabled = true;
    rulesDescriptionDisabled = true;
    isRuleValueDisabled = true;
    isGenerateTransCodeDisabled = true;

    TransList = [];
    transactionCodeOptions = [];

    rulesTransactionId: string;
    isRuleTransactionIdDisabled = true;

    objectOptions = [];
    objectSelected: string;
    isObjectDisabled = true;

    propertyOptions = [];
    propertySelected: string;
    isPropertydisabled = true;

    operatorOptions = [];
    selectedOperator: string;
    isOperatorDisabled: boolean = true;

    ruleValue: string;

    logicaloperatorOptions = [];
    selectedLogicalOperator: string;

    existingRule: string;

    isValidateDisabled = true;
    isValidated = false;

    //control section
    selectedControlId: string;
    isControlIdDisabled = true;
    controlIdOptions = [];

    selectedControlType: string;
    isTypeDisabled = true;
    controlTypeOptions = []

    controlValue: string;
    isValueDisabled = true;
    isValueRequired = false;

    isRankDisabled = true;
    controlRank: string;
    rankOptions = [];

    controlValues: any[] = [];
    isControlValuesDisabled = true;
    selectedControlValues: string;
    selectedControlVal = "";
    dropdownSettings = {};
    controlIdList = [];

    controlTrans: any;
    tempControlTrans = [];

    parentControlId: string;
    parentControlIdOptions = [];
    isParentControlIdDisabled = true;

    parentValueOptions = [];
    parentControlValue: string;
    isParentValueDisabled = true;
    isAddDisabled = false;

    editTransValData: any;
    controlBtnName: string;
    //App message  
    messageNum: string;
    messagesCategory: string;
    messageType: string;

    //common
    isClearDisabled: boolean;
    isSearchDisabled = true;
    isSaveDisabled = true;
    isDeleteDisabled = true;
    editControlIndex: number;
    isControlClear = true;

    grid: Grid;
    clientData = new ClientData();
    uiData = new UiData();
    rule = new Rule();
    transactionConfig = new TransactionConfig();
    controlAttr = new ControlAttr();

    operationObj: any;
    isResetDisabled = true;
    transactionConfigBtn = TransactionConfigBtn;
    emitHideSpinner: Subscription;
    storageData = StorageData;
    statusCode = StatusCodes;

    constructor(
        public apiservice: ApiService,
        public form: FormBuilder,
        private apiConfigService: ApiConfigService,
        private snackbar: XpoSnackBar,
        public appErrService: AppErrorService,
        private spinner: NgxSpinnerService,
        private masterPageService: MasterPageService,
        private appService: AppService,
        private rmgridService: RmgridService
    ) {
        //emitting hide spinner
        this.emitHideSpinner = this.masterPageService.emitHideSpinner.subscribe(spinnerFlag => {
            if (!checkNullorUndefined(spinnerFlag) && spinnerFlag) {
                this.getCategory();
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
            this.dropdownSettings = {
                singleSelection: false,
                selectAllText: 'Select All',
                unSelectAllText: 'UnSelect All'
            };
            this.controlBtnName = this.transactionConfigBtn.ADD;
        }
    }


    /***Category Section***/

    //get Category
    getCategory() {
        this.spinner.show();
        let requestObj = { ClientData: this.clientData, UIData: this.uiData };
        this.apiservice.apiPostRequest(this.apiConfigService.getCategoryUrl, requestObj)
            .subscribe(response => {
                let res = response.body;
                if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                    if (!checkNullorUndefined(res.Response)) {
                        this.categoryCodeOptions = [];
                        res.Response.forEach((element) => {
                            let dd: dropdown = new dropdown();
                            dd.Id = element.OperationId;
                            dd.Text = element.Category;
                            this.categoryCodeOptions.push(dd);
                        });
                        //calling getObjects ,getOperators and getLogicalOperators
                        this.getObjects();
                        this.getOperators();
                        this.getLogicalOperators();
                        this.spinner.hide();
                    }
                } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                    this.spinner.hide();
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                }
            }, erro => {
                this.appErrService.handleAppError(erro);
            });
    }

    //on change of category
    onCategoryChange(event) {
        this.transactionConfig.OperationId = event.value
        this.seletedCategory = this.categoryCodeOptions.find(f => f.Id == this.transactionConfig.OperationId).Text;
        this.isSearchDisabled = false;
        this.categoryChangeClear();
        this.clearControls();
        //calling getTransaction and getTransCode apis
        this.getTransaction();
        this.getTransCode();
    }

    //On Search
    searchOperation() {
        this.spinner.show();
        let requestObj = { ClientData: this.clientData, UIData: this.uiData };
        const getTransactionsUrl = String.Join("/", this.apiConfigService.getTransactionsUrl, this.seletedCategory);
        this.apiservice.apiPostRequest(getTransactionsUrl, requestObj)
            .subscribe(response => {
                let res = response.body;
                this.spinner.hide();
                if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                    if (!checkNullorUndefined(res.Response)) {
                        this.processCategoryGrid(res.Response);
                        this.grid = new Grid();
                        this.grid.PaginationId = "operationTrans";
                        this.operationTrans = this.appService.onGenerateJson(this.operationTrans, this.grid);
                        this.isSearchDisabled = true;
                    }
                }
                else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                }
            }, erro => {
                this.appErrService.handleAppError(erro);
            });

    }

    //generating grid for category list 
    processCategoryGrid(dataGrid) {
        if (!checkNullorUndefined(dataGrid)) {
            this.operationTrans = [];
            dataGrid.forEach(res => {
                let element: any = {};
                element.OperationId = res.OperationId;
                element.Description = res.Description;
                this.operationTrans.push(element);
            });
        }
    }


    //getTransCode
    getTransCode() {
        this.spinner.show();
        this.transactionCodeOptions = [];
        let requestObj = { ClientData: this.clientData, UIData: this.uiData };
        const getTransCodeUrl = String.Join("/", this.apiConfigService.getTransCodeUrl, this.transactionConfig.OperationId);
        this.apiservice.apiPostRequest(getTransCodeUrl, requestObj)
            .subscribe(response => {
                let res = response.body;
                if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                    this.spinner.hide();
                    if (!checkNullorUndefined(res.Response)) {
                        this.TransList = res.Response;
                        this.TransList.forEach((element) => {
                            let dd: dropdown = new dropdown();
                            dd.Id = element.AttributeId;
                            dd.Text = element.AttributeId;
                            this.transactionCodeOptions.push(dd);
                        });
                    }
                } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                    this.spinner.hide();
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                }
            }, error => {
                this.appErrService.handleAppError(error);
            });
    }

    // on change of transactioncode dropdown
    onTransCodeChange(event) {
        this.onTransCodeChangeClear();
        this.transactionConfig.TransCodeValue = event.value;
        let selectedTrans = this.TransList.find(f => f.AttributeId == event.value);
        this.transactionConfig.TransCodeDesc = selectedTrans.Description;
        this.transactionConfig.Formula = selectedTrans.Rule;
        this.existingRule = this.transactionConfig.Formula
        if (this.transactionConfig.Formula) {
            this.isValidated = true;
        }
        this.rulesTransactionId = (this.transactionConfig.OperationId).concat(event.value);
        //getControlIds api
        this.getControlIds();
    }


    //getObjects
    getObjects() {
        // this.spinner.show();
        let requestObj = { ClientData: this.clientData, UIData: this.uiData };
        this.apiservice.apiPostRequest(this.apiConfigService.getObjectsUrl, requestObj)
            .subscribe(response => {
                let res = response.body;
                if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                    if (!checkNullorUndefined(res.Response)) {
                        this.objectOptions = [];
                        res.Response.forEach((element) => {
                            let dd: dropdown = new dropdown();
                            dd.Id = element;
                            dd.Text = element;
                            this.objectOptions.push(dd);
                        });
                    }
                } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                    this.spinner.hide();
                }
            }, error => {
                this.appErrService.handleAppError(error);
            });
    }

    //on change of object dropdown
    onObjectDropdownChange(event) {
        this.ruleSectionObjectChangeClear();
        this.objectSelected = event;
        this.isResetDisabled = false;
        this.getProperties();
    }

    //getOperators
    getOperators() {
        // this.spinner.show();
        let requestObj = { ClientData: this.clientData, UIData: this.uiData };
        this.apiservice.apiPostRequest(this.apiConfigService.getOperatorsUrl, requestObj)
            .subscribe(response => {
                let res = response.body;
                if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                    if (!checkNullorUndefined(res.Response)) {
                        this.operatorOptions = [];
                        res.Response.forEach((element) => {
                            let dd: dropdown = new dropdown();
                            dd.Id = element;
                            dd.Text = element;
                            this.operatorOptions.push(dd);
                        });
                    }
                } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                    this.spinner.hide();
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                }
            }, error => {
                this.appErrService.handleAppError(error);
            });
    }
    //on operator change dropdown
    onOperatorChange(event) {
        this.selectedOperator = event;
    }

    //on logical operator dropdown change
    onLogicalOperatorChange(event) {
        this.isResetDisabled = false;
        this.selectedLogicalOperator = event;
    }

    //getLogicalOperators
    getLogicalOperators() {
        // this.spinner.show();
        let requestObj = { ClientData: this.clientData, UIData: this.uiData };
        this.apiservice.apiPostRequest(this.apiConfigService.getLogicalOperatorsUrl, requestObj)
            .subscribe(response => {
                let res = response.body;

                if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                    if (!checkNullorUndefined(res.Response)) {
                        this.logicaloperatorOptions = [];
                        res.Response.forEach((element) => {
                            let dd: dropdown = new dropdown();
                            dd.Id = element;
                            dd.Text = element;
                            this.logicaloperatorOptions.push(dd);
                        });

                    }
                }
                else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                    this.spinner.hide();
                }
            }, error => {
                this.appErrService.handleAppError(error);
            });
    }

    //getProperties
    getProperties() {
        this.spinner.show();
        let requestObj = { ClientData: this.clientData, UIData: this.uiData };
        const getPropertiesUrl = String.Join("/", this.apiConfigService.getPropertiesUrl, this.objectSelected);
        this.apiservice.apiPostRequest(getPropertiesUrl, requestObj)
            .subscribe(response => {
                let res = response.body;
                this.spinner.hide();
                if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                    if (!checkNullorUndefined(res.Response)) {
                        this.propertyOptions = [];
                        this.isPropertydisabled = false;
                        res.Response.forEach((element) => {
                            let dd: dropdown = new dropdown();
                            dd.Id = element;
                            dd.Text = element;
                            this.propertyOptions.push(dd);
                        });
                        // this.propertyOptions = res.Response;
                    }
                } else  if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                }
            }, error => {
                this.appErrService.handleAppError(error);
            });
    }

    //onPropertyDropdownChange
    onPropertyDropdownChange(event) {
        this.propertySelected = event;
        this.isOperatorDisabled = false;
    }

    //Generate Transcode
    generateTransCode() {
        if (!checkNullorUndefined(this.transactionConfig.OperationId)) {
            this.spinner.show();
            this.clearRules();
            this.clearControlsSection();
            this.transactionCodeOptions = [];
            let requestObj = { ClientData: this.clientData, UIData: this.uiData };
            const generateTransCodeUrl = String.Join("/", this.apiConfigService.generateTransCodeUrl, this.transactionConfig.OperationId);
            this.apiservice.apiPostRequest(generateTransCodeUrl, requestObj)
                .subscribe(response => {
                    let res = response.body;
                    this.spinner.hide();
                    if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                        if (!checkNullorUndefined(res.Response)) {
                            this.TransList = res.Response;
                            this.TransList.forEach((element) => {
                                let dd: dropdown = new dropdown();
                                dd.Id = element.AttributeId;
                                dd.Text = element.AttributeId;
                                this.transactionCodeOptions.push(dd);
                            });
                            if (this.TransList.length == 1) {
                                this.onTransCodeChangeClear();
                                this.transactionConfig.TransCodeValue = this.TransList[0].AttributeId;
                                this.rulesTransactionId = (this.transactionConfig.OperationId).concat(this.transactionConfig.TransCodeValue);
                                //getControlIds api
                                this.getControlIds();
                            }
                        }
                    } else  if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                        this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                    }
                }, error => {
                    this.appErrService.handleAppError(error);
                });
        }
    }

    //createRule
    createRule() {
        let ruleString = "";
        let newRuleFormula = String.Join('.', this.objectSelected, ruleString.concat(this.propertySelected, this.selectedOperator, this.ruleValue));
        if (checkNullorUndefined(this.transactionConfig.Formula)) {
            this.transactionConfig.Formula = newRuleFormula;
        }
        else {
            if (!checkNullorUndefined(this.selectedLogicalOperator)) {
                this.transactionConfig.Formula = this.transactionConfig.Formula.concat(" ", this.selectedLogicalOperator, " ", newRuleFormula);
            }
        }
        this.clearRuleSetup();
        this.isValidateDisabled = false;
        this.isValidated = false;
    }

    //validateRule
    validateRule() {
        this.spinner.show();
        this.rule.RuleSetUp = this.transactionConfig.Formula;
        let requestObj = { ClientData: this.clientData, UIData: this.uiData, Rule: this.rule };
        this.apiservice.apiPostRequest(this.apiConfigService.validateRuleUrl, requestObj)
            .subscribe(response => {
                let res = response.body;
                this.spinner.hide();
                if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                    if (!checkNullorUndefined(res.Response)) {
                        this.snackbar.success(res.Response);
                    }
                    this.clearRuleSetup();
                    this.isValidateDisabled = true;
                    this.isValidated = true;
                } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                    this.isValidated = false;
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                }
            }, error => {
                this.appErrService.handleAppError(error);
            });
    }

    //getTranasction
    getTransaction() {
        this.spinner.show();
        let requestObj = { ClientData: this.clientData, UIData: this.uiData };
        const getTransactionUrl = String.Join("/", this.apiConfigService.getConfigTransactionUrl, this.seletedCategory, this.transactionConfig.OperationId);
        this.apiservice.apiPostRequest(getTransactionUrl, requestObj)
            .subscribe(response => {
                let res = response.body;
                this.spinner.hide();
                if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                    if (!checkNullorUndefined(res.Response)) {
                        let transaction = res.Response;
                        this.transactionConfig.TransId = transaction.TransId;
                        this.transactionConfig.TestType = transaction.TestType;
                        this.transactionConfig.TransDesc = transaction.Description;
                    }
                }
                else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                }
            }, error => {
                this.appErrService.handleAppError(error);
            });
    }

    //getControlIds
    getControlIds() {
        this.spinner.show();
        let requestObj = { ClientData: this.clientData, UIData: this.uiData };
        const getControlIdsUrl = String.Join("/", this.apiConfigService.getControlIdsUrl, this.rulesTransactionId);
        this.apiservice.apiPostRequest(getControlIdsUrl, requestObj)
            .subscribe(response => {
                let res = response.body;
                this.spinner.hide();
                if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                    if (!checkNullorUndefined(res.Response)) {
                        this.isControlIdDisabled = false;
                        this.controlIdList = res.Response;
                        this.controlIdOptions = [];
                        this.controlIdList.forEach((element) => {
                            let dd: dropdown = new dropdown();
                            dd.Id = element.ctrl.ControlId;
                            dd.Text = element.ctrl.ControlId;
                            this.controlIdOptions.push(dd);
                        });
                        //getSelectedControlIds
                        this.getSelectedControlIds();
                    }
                }
                else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                }
            }, error => {
                this.appErrService.handleAppError(error);
            });
    }


    //getSelControlIds
    getSelectedControlIds() {
        let requestObj = { ClientData: this.clientData, UIData: this.uiData };
        const getSelControlIdsUrl = String.Join("/", this.apiConfigService.getSelControlIds, this.rulesTransactionId);
        this.apiservice.apiPostRequest(getSelControlIdsUrl, requestObj)
            .subscribe(response => {
                let res = response.body;
                this.spinner.hide();
                if (!checkNullorUndefined(res) &&  res.Status === this.statusCode.pass) {
                    if (!checkNullorUndefined(res.Response) && res.Response.length > 0) {
                        this.tempControlTrans = [];
                        this.parentControlIdOptions = [];
                        //this.parentControlId = null;
                        res.Response.forEach(res => {
                            let element: any = {};
                            element.ControlId = res.ControlId;
                            element.Type = res.Property;
                            element.Rank = res.Rank;
                            element.Values = res.Values;
                            element.ParentControlId = res.ParentControlId;
                            element.ParentValue = res.ParentValue;
                            // if (element.ControlId) {
                            //   let dd: dropdown = new dropdown();
                            //   dd.Id = res.ControlId;
                            //   dd.Text = res.ControlId;
                            //   this.parentControlIdOptions.push(dd);
                            // }
                            this.tempControlTrans.push(element);
                        });
                        this.grid = new Grid();
                        this.grid.EditVisible = true;
                        this.grid.DeleteVisible = true;
                        this.grid.PaginationId = "controlTrans";
                        this.controlTrans = this.appService.onGenerateJson(this.tempControlTrans, this.grid);
                    }
                }
                else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                }
            }, error => {
                this.appErrService.handleAppError(error);
            });
    }


    //addContolID -- on add btn click  adding data to grid in control section
    addContolID() {
        if (this.controlBtnName == this.transactionConfigBtn.ADD) {
            this.tempControlTrans = [];
            if (!checkNullorUndefined(this.controlTrans)) {
                this.tempControlTrans = this.tempControlTrans.concat(this.controlTrans['Elements']);
            }

            if (!checkNullorUndefined(this.controlTrans)) {
                let checkControlParentVal = this.controlTrans['Elements'].find(x => x.ControlId == this.selectedControlId && x.ParentControlId == this.parentControlId && x.ParentValue == this.parentControlValue);
                if (!checkNullorUndefined(checkControlParentVal)) {
                    this.parentControlId = "";
                    this.parentControlValue = "";
                    this.snackbar.error("The Parent value is already added for control id and parent control combination.Please check the detail grid.");
                    return;
                }
            }
            let element: any = {};
            element.ControlId = this.selectedControlId;
            element.Type = this.selectedControlType;
            element.Rank = this.controlRank;
            if (this.selectedControlVal) {
                element.Values = this.selectedControlVal;
            } else {
                let val = [];
                val.push(this.controlValue);
                element.Values = val;
            }
            element.ParentControlId = this.parentControlId;
            element.ParentValue = this.parentControlValue;
            // if (element.ControlId) {
            //   let dd: dropdown = new dropdown();
            //   dd.Id = this.selectedControlId;
            //   dd.Text = this.selectedControlId;
            //   this.parentControlIdOptions.push(dd);
            // }
            this.tempControlTrans.push(element);
            this.grid = new Grid();
            this.grid.EditVisible = true;
            this.grid.DeleteVisible = true;
            this.grid.PaginationId = "controlTrans";
            this.controlTrans = this.appService.onGenerateJson(this.tempControlTrans, this.grid);
            this.addControlClear();
        }
        else if (this.controlBtnName == this.transactionConfigBtn.SAVE) {
            if (this.controlTrans['Elements']) {
                let editControl = this.controlTrans['Elements'][this.editControlIndex];
                editControl.ControlId = this.selectedControlId;
                editControl.Type = this.selectedControlType;
                editControl.Rank = this.controlRank;
                if (this.selectedControlVal) {
                    editControl.Values = this.selectedControlVal;
                } else {
                    editControl.Values = this.controlValue;
                }
                editControl.ParentControlId = this.parentControlId;
                editControl.ParentValue = this.parentControlValue;
                this.snackbar.info("Record updated sucessfully");
                this.addControlClear();
            }
        }
    }

    //onRankChange
    onRankChange(event) {
        this.controlRank = event.value;
    }

    //onParentControlIdChange
    onParentControlIdChange(event) {
        this.parentControlId = event;
        this.isParentValueDisabled = false;
        let parentValues = this.controlTrans['Elements'].find(x => x.ControlId == this.parentControlId);
        if (!checkNullorUndefined(parentValues)) {
            this.parentValueOptions = [];
            parentValues.Values.forEach((element) => {
                if (element) {
                    let dd: dropdown = new dropdown();
                    dd.Id = element;
                    dd.Text = element;
                    this.parentValueOptions.push(dd);
                }
            });
            if (!this.parentControlValue) {
                this.parentControlValue = this.parentValueOptions[0]?.Text;
            }
        }
    }

    //onParentValueChange
    onParentValueChange(event) {
        this.parentControlValue = event.value;
    }

    //onControlIdChange
    onControlIdChange(event) {
        this.addControlClear();
        this.isControlClear = false;
        this.selectedControlId = event;
        this.isTypeDisabled = false;
        this.isParentControlIdDisabled = false;
        if (this.controlTrans) {
            this.parentControlIdOptions = [];
            this.controlTrans['Elements'].forEach((element) => {
                if (element.ControlId && element.ControlId != this.selectedControlId) {
                    let dd: dropdown = new dropdown();
                    dd.Id = element.ControlId;
                    dd.Text = element.ControlId;
                    this.parentControlIdOptions.push(dd);
                }
            })
        }
        //calling getControlTypes
        this.getControlTypes();

        //calling getControlValues api
        this.getControlValues();

        //passing controlid
        this.getRanks(event);
    }

    //getControlTypes
    getControlTypes() {
        this.spinner.show();
        let requestObj = { ClientData: this.clientData, UIData: this.uiData };
        const getControlTypesUrl = String.Join("/", this.apiConfigService.getControlTypesUrl, this.selectedControlId);
        this.apiservice.apiPostRequest(getControlTypesUrl, requestObj)
            .subscribe(response => {
                let res = response.body;
                this.spinner.hide();
                if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                    if (!checkNullorUndefined(res.Response)) {
                        let controlTypeResponse = res.Response;
                        this.controlTypeOptions = [];
                        let dd: dropdown = new dropdown();
                        dd.Id = controlTypeResponse;
                        dd.Text = controlTypeResponse;
                        this.controlTypeOptions.push(dd);
                        this.selectedControlType = controlTypeResponse;
                        this.isTypeDisabled = false;
                    }
                }
                else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                }
            }, error => {
                this.appErrService.handleAppError(error);
            });
    }

    //getControlValues
    getControlValues() {
        this.spinner.show();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const getControlIdsUrl = String.Join('/', this.apiConfigService.getControlValuesUrl, this.selectedControlId);
        this.apiservice.apiPostRequest(getControlIdsUrl, requestObj)
            .subscribe(response => {
        const res = response.body;
                this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
          if (!this.appService.checkNullOrUndefined(res.Response) && res.Response.length) {
                        this.controlValues = res.Response;
                        this.isValueDisabled = true;
                        this.isValueRequired = false;
                        this.isControlValuesDisabled = false;
                        if (this.editTransValData) {
                            this.selectedControlVal = this.editTransValData;
                        }
          } else {
                    this.isControlValuesDisabled = true;
                    if (this.editTransValData) {
                        this.controlValue = this.editTransValData;
                    }
            if (this.selectedControlId === TransControlId.contTransid) {
              this.controlValue = this.rulesTransactionId;
            } else {
              this.isValueDisabled = false;
              this.isValueRequired = true;
            }
          }
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                }
            }, error => {
                this.appErrService.handleAppError(error);
            });
    }

    //getRanks(gernerating rank options using controlIdList)
    getRanks(controlId) {
        this.rankOptions = [];
        this.isRankDisabled = false;
        for (let i = 1; i <= this.controlIdList.length; i++) {
            let dd: dropdown = new dropdown();
            dd.Id = i.toString();
            dd.Text = i.toString();
            this.rankOptions.push(dd);
        }
        let val = this.controlIdList.find(c => c.ctrl.ControlId == controlId);
        if (val) {
            this.controlRank = val.ctrl.Rank;
        }
    }

    //insertTransConfig --on save 
    insertTransConfig() {
        this.spinner.show();
        this.transactionConfig.ControlIDs = this.controlTrans['Elements'];
        let requestObj = { ClientData: this.clientData, TransactionConfig: this.transactionConfig, UIData: this.uiData };
        this.apiservice.apiPostRequest(this.apiConfigService.insertTransConfigUrl, requestObj)
            .subscribe(response => {
                let res = response.body;
                this.spinner.hide();
                if (!checkNullorUndefined(res) &&  res.Status === this.statusCode.pass) {
                    if (!checkNullorUndefined(res.Response)) {
                        this.snackbar.success(res.Response);
                    }
                    this.categoryChangeClear();
                } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                }
            }, error => {
                this.appErrService.handleAppError(error);
            });
    }

    // enabling the append dropdown
    enableElement() {
        if (!checkNullorUndefined(this.transactionConfig.Formula) && this.transactionConfig.Formula !== "") {
            return false;
        }
        else {
            return true;
        }
    }

    //grid edit
    editTransConfigDetailRow(transData) {
        this.onControlIdChange(transData.ControlId);
        this.controlBtnName = this.transactionConfigBtn.SAVE;
        this.editControlIndex = this.controlTrans['Elements'].findIndex(c => c.ControlId == transData.ControlId && c.ParentControlId == transData.ParentControlId);
        this.isControlIdDisabled = true;
        this.selectedControlId = transData.ControlId;
        this.selectedControlType = transData.Type;
        this.controlRank = transData.Rank;
        this.parentControlId = transData.ParentControlId;
        this.parentControlValue = transData.ParentValue;
        //binding Values and using in getControlValues  based  getControlValues response
        this.editTransValData = transData.Values;
        //getting parent control values
        this.onParentControlIdChange(transData.ParentControlId);
        this.controlTrans['EditHighlight'] = true;
    }


    //delete grid record
    deleteTransConfigDetailRow(transData) {
        let deleteControl = this.controlTrans['Elements'].find(t => t.ParentControlId === transData.ControlId);
        if (checkNullorUndefined(deleteControl)) {
            let deleteControlIndex = this.controlTrans['Elements'].findIndex(c => c.ControlId == transData.ControlId && c.ParentControlId == transData.ParentControlId);
            this.controlTrans['Elements'].splice(deleteControlIndex, 1);
            let deleteParentControl = this.parentControlIdOptions.findIndex(p => p.Id == transData.ControlId);
            this.parentControlIdOptions.splice(deleteParentControl, 1);
        } else {
            this.snackbar.error("Selected controlId is added as parent.Please delete that entry first");
        }
        this.addControlClear();
        //this.parentControlId = this.parentControlIdOptions.indexOf(-1).toString();
    }

    //onSelectValue
    onSelectValue(event) {
        this.selectedControlValues = event;
    };

    //onTypeChange
    onTypeChange(event) {
        this.selectedControlType = event.value;
    };

    //changeInput
    changeInput(event) {
        this.appErrService.clearAlert();
    };


    onSelectAllvalue(event) {

    };

    //clear trasactionSection and enabling the controls on category change
    clearControls() {
        this.transactionConfig.TransId = "";
        this.transactionConfig.TestType = "";
        this.transactionConfig.TransDesc = "";
        this.isTestTypeDisabled = false;
        this.isTransDescriptionDisabled = false;
        this.isTransCodeDisabled = false;
        this.isGenerateTransCodeDisabled = false;
        this.isObjectDisabled = true;
        this.rulesDescriptionDisabled = true;
        this.isRuleValueDisabled = true;
        this.isControlIdDisabled = true;
    }


    //onTransCodeChangeClear
    onTransCodeChangeClear() {
        this.isObjectDisabled = false;
        this.rulesDescriptionDisabled = false;
        this.isRuleValueDisabled = false;
        this.clearRuleSetup();
        this.clearControlsSection();
    }


    //categoryChangeClear
    categoryChangeClear() {
        this.isResetDisabled = true;
        this.operationTrans = null;
        this.clearRules();
        this.clearControlsSection();
    }


    //clearRules
    clearRules() {
        this.transactionConfig.TransCodeValue = "";
        this.transactionConfig.TransCodeDesc = "";
        this.rulesTransactionId = "";
        this.transactionConfig.Formula = "";
        this.existingRule = "";
        this.propertyOptions = [];
        this.isObjectDisabled = true;
        this.isValidated = false;
        this.clearRuleSetup();
    }


    //resetRuleSetup on reset click
    resetRuleSetup() {
        this.transactionConfig.Formula = this.existingRule;
        if (this.transactionConfig.Formula) {
            this.isValidated = true;
        }
        this.isResetDisabled = true;
        this.clearRuleSetup();
    }

    //clearRuleSetup -- on validaterule / after creating rule we are calling
    clearRuleSetup() {
        this.objectSelected = "";
        this.selectedLogicalOperator = "";
        this.isValidateDisabled = true;
        this.ruleSectionObjectChangeClear();
    }

    ruleSectionObjectChangeClear() {
        this.selectedOperator = "";
        this.isOperatorDisabled = true;
        this.ruleValue = "";
        this.propertyOptions = [];
        this.propertySelected = "";
        this.isPropertydisabled = true;
    }

    //clearControlsSection
    clearControlsSection() {
        this.addControlClear();
        this.selectedControlId = "";
        this.controlIdOptions = [];
        this.isControlIdDisabled = true;
        this.controlTrans = null;
    }



    //addControlClear on add click
    addControlClear() {
        this.isControlClear = true;
        this.isControlIdDisabled = false;

        this.selectedControlId = "";

        this.selectedControlType = "";
        this.isTypeDisabled = true;
        this.controlTypeOptions = [];


        this.controlValue = "";
        this.isValueDisabled = true;

        this.selectedControlVal = "";
        this.isControlValuesDisabled = true;
        this.controlValues = [];


        this.controlRank = "";
        this.isRankDisabled = true;
        this.rankOptions = [];

        this.parentControlId = "";
        this.isParentControlIdDisabled = true;
        this.parentControlIdOptions = [];

        this.parentControlValue = "";
        this.isParentValueDisabled = true;
        this.parentValueOptions = [];

        this.controlBtnName = this.transactionConfigBtn.ADD;
        this.editControlIndex = null;
        this.editTransValData = null;
        if(!checkNullorUndefined(this.controlTrans)){
            this.controlTrans['EditHighlight'] = false;
        }
    }



    ngOnDestroy() {
        this.masterPageService.hideSpinner = false;
        this.masterPageService.moduleName.next(null);
        this.emitHideSpinner.unsubscribe();
        this.masterPageService.emitHideSpinner.next(null);
        this.masterPageService.clearModule();
        this.appErrService.clearAlert();
        this.masterPageService.hideModal();
    }
}
