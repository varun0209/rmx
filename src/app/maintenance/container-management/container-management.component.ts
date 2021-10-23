import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NgModelGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { String } from 'typescript-string-operations';
import { MaintenanceService } from './../../services/maintenance.service';
import { AppService } from './../../utilities/rlcutl/app.service';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { MasterPageService } from './../../utilities/rlcutl/master-page.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiConfigService } from './../../utilities/rlcutl/api-config.service';
import { ApiService } from './../../utilities/rlcutl/api.service';
import { AppErrorService } from './../../utilities/rlcutl/app-error.service';
import { UiData } from './../../models/common/UiData';
import { Grid } from './../../models/common/Grid';
import { ClientData } from './../../models/common/ClientData';
import { CommonEnum } from './../../enums/common.enum';
import { FormulaObj, Rule } from './../../models/dev-maintenance/transaction-config';
import { dropdown } from './../../models/common/Dropdown';
import { ContainerCategoryRule } from './../../models/maintenance/container-management/container-category-rule';
import { ContainerCategoryType } from './../../models/maintenance/container-management/container-category-type';
import { StorageData } from './../../enums/storage.enum';
import { StatusCodes } from './../../enums/status.enum';
import { GenContainerParams } from './../../models/common/GenContainerParams';


@Component({
  selector: 'rm-container-management',
  templateUrl: './container-management.component.html',
  styleUrls: ['./container-management.component.css']
})
export class ContainerManagementComponent implements OnInit, OnDestroy {

  @ViewChild('categoryTypeForm') categoryTypeForm: NgModelGroup;
  @ViewChild('ruleSetupCtrl') ruleSetupCtrl: NgModelGroup;
  @ViewChild('categoryRuleForm') categoryRuleForm: NgModelGroup;
  @ViewChild('crRuleSetupCtrl') crRuleSetupCtrl: NgModelGroup;


  // Variable declration
  appConfig: any;
  containerCategoryTypes: any;
  selectedcontainerType: string;

  selectedObject: string;
  selectedProperty: string;
  selectedLogicalOperator: string;
  selectedOperator: string;
  selectedcategoryName: string;
  ruleValue: string;
  description: string;
  objectOptions = [];
  rulePropertyOptions = [];
  propertyOptions = [];
  logicalOperatorOptions = [];
  operatorOptions = [];

  isCateygoryTypeDisabled = false;
  isCateygoryTypeRuleIdDisabled = true;
  isCateygoryTypeRankDisabled = true;

  Rules = [];
  dropdownSettings = {};
  capacity: number;
  isCapacityDisabled = false;
  rankPattern: any;
  quantityPattern: any;
  quantityExp: number;

  isPropertyDisabled = true;
  isOperatorDisabled = true;
  isRuleValueDisabled = true;
  isRuleAddDisabled = true;
  isCTResetDisabled = true;
  isCTClearDisabled = true;
  isValidateDisabled = true;
  isCRValidateDisabled = true;
  isObjectDisabled = true;
  isLogicalOperatorRequired = false;
  isLogicalOperatorDisabled = true;
  isEnableAddOrUpdate = true;
  isEditCategoryTypeMode = false;

  // rule Setup
  newFormula = [];
  oldRule: any;
  indexTrack = 0;
  highLightindex: any;


  // Second Tab Category Rules
  crCategoryNmae: string;
  crRuleId: string;
  crRank: number;
  selectedCRLogicalOperator: string;
  selectedCRObject: string;
  selectedCRProperty: string;
  selectedCROperator: string;
  crRuleValue: string;
  categoryTypeOptions = [];
  containerCategoryRules: any;
  selectedcategoryRuleType: string;
  criteriaCapacity: any;
  categoryPropertySelectedItem: any = [];
  isCRCategoryNameDisabled = true;
  isCRRankDisabled = true;
  isCRClearDisabled = true;
  isCRLogicalOperatorDisabled = true;
  isCRLogicalOperatorRequired = false;
  isCRObjectDisabled = true;
  isCRPropertyDisabled = true;
  isCROperatorDisabled = true;
  isCRRuleValueDisabled = true;
  isCategoryRuleBtnDisabled = true;
  isCREnableAddOrUpdate = true;
  isEditCategoryRuleMode = false;
  isCRRuleAddDisabled = true;
  isParentContainerClearDisabled = true;
  ruleCRPropertyOptions = [];
  // rule Setup
  crNewFormula = [];
  crOldRule: any;
  crIndexTrack = 0;
  crHighLightindex: any;


  // third tab
  isExcute = true;
  containerId: string;
  parentContainer: string;
  containerTypes = [];
  containerTypesOptions = [];
  categoryNameOptions = [];
  categoryNames = [];
  isCHCategoryName = true;
  selectedCHCategoryName: string;
  selectedCHContainerType: string;
  containerHeaderPrint = false;
  cHPrintDisabled = false;
  isRangeDisabled = true;
  isCHClearDisabled = true;
  isCategoryObjectDisabled = true;
  isCategoryPropertyDisabled = true;
  containersRange: number;




  // Object declaration
  grid: Grid;
  clientData = new ClientData();
  uiData = new UiData();
  containerCategoryType = new ContainerCategoryType();
  tempContainerCategoryType = new ContainerCategoryType();
  containerCategoryRule = new ContainerCategoryRule();
  tempContainerCategoryRule = new ContainerCategoryRule();
  genContainerParams = new GenContainerParams();
  newFormulaObject = new FormulaObj();
  crNewFormulaObject = new FormulaObj();
  rule = new Rule();

  // enum declaration
  commonEnum = CommonEnum;

  // button names
  cmBtnName = this.commonEnum.add;
  crBtnName = this.commonEnum.add;
  ccBtnName = this.commonEnum.add;
  selectedCategoryObject = this.commonEnum.device;


  // RXjs observables
  emitHideSpinner: Subscription;


  constructor(
    public appErrService: AppErrorService,
    private apiService: ApiService,
    private apiConfigService: ApiConfigService,
    private spinner: NgxSpinnerService,
    private snackbar: XpoSnackBar,
    public masterPageService: MasterPageService,
    public appService: AppService,
    private cdr: ChangeDetectorRef,
    private maintenanceServeice: MaintenanceService
  ) {
    const pattern = JSON.parse(localStorage.getItem(StorageData.patternList));
    if (!this.appService.checkNullOrUndefined(pattern)) {
      this.quantityPattern = new RegExp(pattern.defaultNumberPattern);
      this.rankPattern = new RegExp(pattern.rankPattern);
    }
  }

  ngOnInit() {
    const operationObj = this.masterPageService.getRouteOperation();
    if (operationObj) {
      this.uiData.OperationId = operationObj.OperationId;
      this.uiData.OperCategory = operationObj.Category;
      this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
      this.appConfig = JSON.parse(localStorage.getItem(StorageData.appConfig));
      // setting value to hidespinner (based on this value we are emiting emithidespinner method)
      this.masterPageService.hideSpinner = true;
      this.masterPageService.setTitle(operationObj.Title);
      this.masterPageService.setModule(operationObj.Module);
      localStorage.setItem(StorageData.module, operationObj.Module);
      this.appErrService.appMessage();
      this.categoryTypeFoucs();
      this.dropdownSettings = {
        singleSelection: false,
        idField: 'Id',
        textField: 'Text',
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All'
      };
      // emitting hide spinner
      this.emitHideSpinner = this.masterPageService.emitHideSpinner.subscribe(spinnerFlag => {
        if (!this.appService.checkNullOrUndefined(spinnerFlag) && spinnerFlag) {
          this.getContainerCategoryTypes();
          this.getLogicalOperators();
          this.getOperators();
          this.getContainerTypes();
          this.getCategoryTypes();
        }
      });

    }
  }

  // #region category type
  onCategoryType(event) {
    this.categoryTypeFoucs();
  }

  categoryTypeFoucs() {
    this.appService.setFocus('categoryType');
  }

  // get container category types
  getContainerCategoryTypes() {
    this.spinner.show();
    this.maintenanceServeice.getContainerCategoryTypes(this.clientData, this.uiData)
      .subscribe(response => {
        this.spinner.hide();
        const res = response;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          this.grid = new Grid();
          this.grid.EditVisible = true;
          this.grid.ItemsPerPage = this.appConfig.containermanagement.griditemsPerPage;
          this.containerCategoryTypes = this.appService.onGenerateJson(res.Response, this.grid);

        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }


  // add or update category types
  addOrUpdateCategoryType() {
    this.containerCategoryType.Rule = '';
    for (let f = 0; f < this.newFormula.length; f++) {
      const newRuleFormula = this.newFormula[f]['formula'];
      if (this.containerCategoryType.Rule === '') {
        this.containerCategoryType.Rule = newRuleFormula;
      } else {
        if (this.newFormula[f]['appendWith'] !== '') {
          this.containerCategoryType.Rule = this.containerCategoryType.Rule.concat(' ', this.newFormula[f]['appendWith'], ' ', newRuleFormula);
        }
      }
    }
    this.appErrService.clearAlert();
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, ContainerCategoryType: this.containerCategoryType };
    let url;
    if (this.cmBtnName === this.commonEnum.add) {
      url = this.apiConfigService.insertContainerCategoryTypeUrl;
    } else if (this.cmBtnName === this.commonEnum.update) {
      if (this.appService.IsObjectsMatch(this.containerCategoryType, this.tempContainerCategoryType)) {
        this.snackbar.info(this.appService.getErrorText('2660043'));
        this.spinner.hide();
        return;
      }
      url = this.apiConfigService.updateContainerCategoryTypeUrl;
    }
    this.isEnableAddOrUpdate = true;
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const result = response.body;
        this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
          if (!this.appService.checkNullOrUndefined(result.Response)) {
            this.grid = new Grid();
            this.grid.EditVisible = true;
            this.containerCategoryTypes = this.appService.onGenerateJson(result.Response, this.grid);
            this.isEditCategoryTypeMode = false;
            this.resetCategoryType();
          }
          if (!this.appService.checkNullOrUndefined(result.StatusMessage) && result.StatusMessage !== '') {
            this.snackbar.success(result.StatusMessage);
          }
          this.getCategoryTypes();
        } else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
          this.isEnableAddOrUpdate = false;
          this.spinner.hide();
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }



  // edit category type
  editCategoryType(event) {
    this.appErrService.clearAlert();
    this.containerCategoryType = new ContainerCategoryType();
    this.tempContainerCategoryType = new ContainerCategoryType();
    this.containerCategoryType = Object.assign(this.containerCategoryType, event);
    this.tempContainerCategoryType = Object.assign(this.tempContainerCategoryType, event);
    this.isCateygoryTypeDisabled = true;
    this.isCateygoryTypeRuleIdDisabled = true;
    this.isCateygoryTypeRankDisabled = false;
    this.isEditCategoryTypeMode = true;
    this.newFormula = [];
    this.cmBtnName = this.commonEnum.update;
    this.isEnableAddOrUpdate = false;
    this.isCTResetDisabled = false;
    if (event.Rule !== '') {
      this.newFormulaObject['formula'] = event.Rule;
      this.addFieldValue();
    } else if (event.Rule === '') {
      this.isLogicalOperatorDisabled = true;
      this.isObjectDisabled = false;
      this.appService.setFocus('object');
    }
    this.isValidateDisabled = true;
    this.highLightindex = undefined;
  }

  changeCategoryTypeInput() {
    this.isCTResetDisabled = false;
    this.isCateygoryTypeRankDisabled = false;
  }

  changeCTRank() {
    if (this.newFormula.length > 0) {
      this.isLogicalOperatorDisabled = false;
    } else {
      this.isObjectDisabled = false;
    }
  }

  onLogicalOperatorChange(event) {
    this.selectedLogicalOperator = event.value;
    this.newFormulaObject['appendWith'] = event.value;
    this.isCTClearDisabled = false;
    if (!this.selectedObject) {
      this.isObjectDisabled = false;
    }
    this.isEnableAddOrUpdate = true;
    this.appService.setFocus('object');
    this.isValidateDisabled = true;
  }

  onObjectChange(event) {
    this.ruleSectionObjectChangeClear();
    this.newFormulaObject['formula'] = this.newFormulaObject['formula'].concat(event.value);
    this.oldRule = this.newFormulaObject['formula'];
    this.selectedObject = event.value;
    this.isObjectDisabled = true;
    this.isPropertyDisabled = false;
    this.isCTClearDisabled = false;
    this.appService.setFocus('property');
    this.getProperties(event.value);
    this.cdr.detectChanges();
  }

  ruleSectionObjectChangeClear() {
    this.selectedOperator = '';
    this.isOperatorDisabled = true;
    this.ruleValue = '';
    this.rulePropertyOptions = [];
    this.selectedProperty = '';
    this.isPropertyDisabled = true;
  }

  onPropertyChange(event) {
    this.newFormulaObject['formula'] = String.Join('.', this.newFormulaObject['formula'], event.value);
    this.oldRule = this.newFormulaObject['formula'];
    this.isPropertyDisabled = true;
    this.isOperatorDisabled = false;
    this.selectedProperty = event.value;
    this.appService.setFocus('operator');
  }

  // on operator change dropdown
  onOperatorChange(event) {
    this.selectedOperator = event.value;
    this.newFormulaObject['formula'] = this.newFormulaObject['formula'].concat(event.value);
    this.oldRule = this.newFormulaObject['formula'];
    this.isRuleValueDisabled = false;
    this.isOperatorDisabled = true;
    this.appService.setFocus('ruleValue');
  }

  // on input of rule
  ruleInput(value) {
    this.newFormulaObject['formula'] = this.oldRule;
    this.newFormulaObject['formula'] = this.newFormulaObject['formula'].concat(value);
    this.isRuleAddDisabled = false;
    if (value === '') {
      this.isRuleAddDisabled = true;
    }
  }

  // deleting rule formula
  deleteFieldValue(index) {
    this.appErrService.clearAlert();
    this.newFormula.splice(index, 1);
    if (this.newFormula.length > 0) {
      this.newFormula[0]['appendWith'] = '';
    } else if (this.newFormula.length === 0) {
      this.isLogicalOperatorDisabled = true;
      this.isObjectDisabled = false;
      this.isValidateDisabled = true;
      this.isEnableAddOrUpdate = true;
    }
    if (index === this.highLightindex) {
      this.highLightindex = undefined;
    } else if (index < this.highLightindex) {
      this.highLightindex--;
    }
    this.resetRuleSetup();
  }

  // adding new formula
  addRule(valid) {
    if (this.ruleValue !== '') {
      this.isRuleValueDisabled = true;
    }
    if (valid) {
      this.addFieldValue();
      this.isLogicalOperatorDisabled = false;
      this.isLogicalOperatorRequired = true;
    }
    this.isRuleAddDisabled = true;
    this.appService.setFocus('logicaloperator');
  }

  // resetRuleSetup on reset click
  resetRuleSetup() {
    this.oldRule = null;
    this.newFormulaObject = new FormulaObj();
    this.isCTClearDisabled = true;
    this.clearRuleSetup();
    this.isRuleAddDisabled = true;
  }

  // clearRuleSetup -- on validaterule / after creating rule we are calling
  clearRuleSetup() {
    this.selectedObject = '';
    this.selectedLogicalOperator = '';
    this.isRuleValueDisabled = true;
    if (!this.appService.checkNullOrUndefined(this.newFormula) && !this.appService.checkNullOrUndefined(this.newFormula.length)) {
      if (this.newFormula.length > 0) {
        this.isLogicalOperatorDisabled = false;
        this.isObjectDisabled = true;
        this.appService.setFocus('logicaloperator');
      } else if (this.newFormula.length === 0) {
        this.isLogicalOperatorDisabled = true;
        this.isObjectDisabled = false;
        this.appService.setFocus('object');
      }
    }
    this.ruleSectionObjectChangeClear();
  }

  addFieldValue() {
    this.newFormula.push(this.newFormulaObject);
    this.resetRuleSetup();
    this.isValidateDisabled = false;
  }

  // validateRule
  validateRule() {
    this.highLightindex = undefined;
    this.spinner.show();
    this.rule.RuleSetUp = this.newFormula[this.indexTrack].formula;
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, Rule: this.rule };
    this.apiService.apiPostRequest(this.apiConfigService.validateRuleUrl, requestObj)
      .subscribe(response => {
        const res = response.body;
        this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          if (!this.appService.checkNullOrUndefined(res.Response)) {
            this.indexTrack++;
            if (this.indexTrack < this.newFormula.length) {
              this.validateRule();

            } else {
              this.indexTrack = 0;
              this.isEnableAddOrUpdate = false;
              this.snackbar.success(res.Response);
              this.resetRuleSetup();
            }
          }
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.isEnableAddOrUpdate = true;
          this.highLightindex = this.indexTrack;
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          this.indexTrack = 0;
          this.resetRuleSetup();
        }
      }, error => {
        this.appErrService.handleAppError(error);
      });
  }

  // clearing CategoryType
  clearCategoryType() {
    this.containerCategoryType = new ContainerCategoryType();
    this.tempContainerCategoryType = new ContainerCategoryType();
    this.newFormula = [];
    this.isValidateDisabled = true;
    this.isObjectDisabled = true;
    this.isLogicalOperatorDisabled = true;
    this.isEnableAddOrUpdate = true;
    this.ruleSetupCtrl.reset();
    this.appErrService.clearAlert();
  }

  resetCategoryType() {
    this.cmBtnName = this.commonEnum.add;
    this.isCTResetDisabled = true;
    this.isCateygoryTypeDisabled = false;
    this.isCateygoryTypeRankDisabled = true;
    this.isCateygoryTypeRuleIdDisabled = true;
    this.categoryTypeForm.reset();
    this.resetRuleSetup();
    this.clearCategoryType();
    this.appService.setFocus('categoryType');
  }
  // #endregion category type

  // #region category rule

  onCategoryRule() {
    this.appErrService.clearAlert();
    this.categoryRuleFoucs();
  }
  categoryRuleFoucs() {
    this.appService.setFocus('categoryRuleType');
  }

  onCRCategoryNameChange($event) {
    this.isCRRankDisabled = false;
  }

  onCRRankChange(event) {
    if (this.crNewFormula.length > 0) {
      this.isCRLogicalOperatorDisabled = false;
    } else {
      this.isCRObjectDisabled = false;
    }
  }

  onCRLogicalOperatorChange(event) {
    this.selectedCRLogicalOperator = event.value;
    this.crNewFormulaObject['appendWith'] = event.value;
    this.isCRClearDisabled = false;
    if (!this.selectedCRObject) {
      this.isCRObjectDisabled = false;
    }
    this.isCREnableAddOrUpdate = true;
    this.appService.setFocus('crObject');
    this.isCRValidateDisabled = true;

  }

  onCRObjectChange(event) {
    this.ruleCRSectionObjectChangeClear();
    this.crNewFormulaObject['formula'] = this.crNewFormulaObject['formula'].concat(event.value);
    this.crOldRule = this.crNewFormulaObject['formula'];
    this.selectedCRObject = event.value;
    this.isCRClearDisabled = false;
    this.isCRObjectDisabled = true;
    this.isCRPropertyDisabled = false;
    this.appService.setFocus('crProperty');
    this.getProperties(event.value);
    this.cdr.detectChanges();
  }

  ruleCRSectionObjectChangeClear() {
    this.selectedOperator = '';
    this.isCROperatorDisabled = true;
    this.crRuleValue = '';
    this.ruleCRPropertyOptions = [];
    this.selectedCRProperty = '';
    this.isCRPropertyDisabled = true;
  }

  onCRPropertyChange(event) {
    this.crNewFormulaObject['formula'] = String.Join('.', this.crNewFormulaObject['formula'], event.value);
    this.crOldRule = this.crNewFormulaObject['formula'];
    this.isCRPropertyDisabled = true;
    this.isCROperatorDisabled = false;
    this.selectedCRProperty = event.value;
    this.appService.setFocus('crOperator');
  }

  onCROperatorChange(event) {
    this.crNewFormulaObject['formula'] = this.crNewFormulaObject['formula'].concat(event.value);
    this.crOldRule = this.crNewFormulaObject['formula'];
    this.selectedCROperator = event.value;
    this.isCROperatorDisabled = true;
    this.isCRRuleValueDisabled = false;
    this.appService.setFocus('crRuleValue');
  }

  // on input of rule
  onCRRuleInput(value) {
    this.crNewFormulaObject['formula'] = this.crOldRule;
    this.crNewFormulaObject['formula'] = this.crNewFormulaObject['formula'].concat(value);
    this.isCRRuleAddDisabled = false;
    if (value === '') {
      this.isCRRuleAddDisabled = true;
    }
  }

  deleteCRFieldValue(index) {
    this.appErrService.clearAlert();
    this.crNewFormula.splice(index, 1);
    if (this.crNewFormula.length > 0) {
      this.crNewFormula[0]['appendWith'] = '';
    } else if (this.crNewFormula.length === 0) {
      this.isCRLogicalOperatorDisabled = true;
      this.isCRObjectDisabled = false;
      this.isCRValidateDisabled = true;
      this.isCREnableAddOrUpdate = true;
    }
    if (index === this.crHighLightindex) {
      this.crHighLightindex = undefined;
    } else if (index < this.crHighLightindex) {
      this.crHighLightindex--;
    }
    this.resetCRRuleSetup();
  }

  addCRRule(valid) {
    if (this.crRuleValue !== '') {
      this.isCRRuleValueDisabled = true;
    }
    if (valid) {
      this.addCRFieldValue();
      this.isCRLogicalOperatorDisabled = false;
      this.isCRLogicalOperatorRequired = true;
    }
    this.isCRRuleAddDisabled = true;
    this.appService.setFocus('crLogicaloperator');
  }

  addCRFieldValue() {
    this.crNewFormula.push(this.crNewFormulaObject);
    this.resetCRRuleSetup();
    this.isCRValidateDisabled = false;
  }


  // resetRuleSetup on reset click
  resetCRRuleSetup() {
    this.crOldRule = null;
    this.crNewFormulaObject = new FormulaObj();
    this.isCRClearDisabled = true;
    this.clearCRRuleSetup();
    this.isCRRuleAddDisabled = true;
  }

  // category rule formula validation
  crVaidateRule() {
    this.crHighLightindex = undefined;
    this.spinner.show();
    this.rule.RuleSetUp = this.crNewFormula[this.crIndexTrack].formula;
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, Rule: this.rule };
    this.apiService.apiPostRequest(this.apiConfigService.validateRuleUrl, requestObj)
      .subscribe(response => {
        const res = response.body;
        this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          if (!this.appService.checkNullOrUndefined(res.Response)) {
            this.crIndexTrack++;
            if (this.crIndexTrack < this.crNewFormula.length) {
              this.crVaidateRule();
            } else {
              this.crIndexTrack = 0;
              console.log(this.categoryRuleForm.valid);
              this.isCREnableAddOrUpdate = false;
              this.snackbar.success(res.Response);
              this.resetCRRuleSetup();
            }
          }
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.isCREnableAddOrUpdate = true;
          this.crHighLightindex = this.crIndexTrack;
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          this.crIndexTrack = 0;
          this.resetCRRuleSetup();
        }
      }, error => {
        this.appErrService.handleAppError(error);
      });
  }

  getCategoryTypes() {
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    this.apiService.apiPostRequest(this.apiConfigService.getCategoryTypesUrl, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          this.categoryTypeOptions = [];
          res.Response.forEach((element) => {
            if (element !== '' && !this.appService.checkNullOrUndefined(element)) {
              const dd: dropdown = new dropdown();
              dd.Id = element;
              dd.Text = element;
              this.categoryTypeOptions.push(dd);
            }
          });
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });

  }

  onCategoryTypeChange(event) {
    this.resetCategoryRule();
    this.selectedcategoryRuleType = event.value;
    this.containerCategoryRule.CategoryType = this.selectedcategoryRuleType;
    this.isCategoryRuleBtnDisabled = false;
    this.containerCategoryRules = null;
    this.appErrService.clearAlert();
    this.isCategoryPropertyDisabled = false;
    this.getProperties(this.selectedCategoryObject);
    this.getContainerCategoryRules();
    this.isCRCategoryNameDisabled = false;
    this.appService.setFocus('crCategoryNmae');
  }

  getContainerCategoryRules() {
    if (this.selectedcategoryRuleType) {
      this.spinner.show();
      const requestObj = { ClientData: this.clientData, UIData: this.uiData };
      const url = String.Join('/', this.apiConfigService.getContainerCategoryRulesUrl, this.selectedcategoryRuleType);
      this.apiService.apiPostRequest(url, requestObj)
        .subscribe(response => {
          this.spinner.hide();
          const res = response.body;
          if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
            this.containerCategoryRules = this.appService.onGenerateJson(res.Response, this.grid);
          } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
            this.spinner.hide();
            this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          }
        }, erro => {
          this.appErrService.handleAppError(erro);
        });
    }
  }

  editCategoryRule(event) {
    this.containerCategoryRule = new ContainerCategoryRule();
    this.tempContainerCategoryRule = new ContainerCategoryRule();
    this.containerCategoryRule = Object.assign(this.containerCategoryRule, event);
    this.tempContainerCategoryRule = Object.assign(this.tempContainerCategoryRule, event);
    this.containerCategoryRule.Rank = event.Rank;
    this.categoryPropertySelectedItem = event.CategoryProperty;
    this.criteriaCapacity = event.CriteriaCapacity ? JSON.stringify(event.CriteriaCapacity) : null;
    this.isEditCategoryRuleMode = true;
    this.crBtnName = this.commonEnum.update;
    this.isCRRankDisabled = false;
    this.isCRCategoryNameDisabled = true;
    this.isCREnableAddOrUpdate = false;
    this.isCategoryPropertyDisabled = false;
    this.appErrService.clearAlert();
    this.crNewFormula = [];
    if (event.Rule !== '') {
      this.crNewFormulaObject['formula'] = event.Rule;
      this.addCRFieldValue();
    } else if (event.Rule === '') {
      this.isCRLogicalOperatorDisabled = true;
      this.isCRObjectDisabled = false;
      this.appService.setFocus('crObject');
    }
    this.isCRValidateDisabled = true;
    this.highLightindex = undefined;
  }

  getCategoryValues() {
    const categoryPropertyList = [];
    this.categoryPropertySelectedItem.forEach(element => {
      if (categoryPropertyList.indexOf(element.Text) === -1) {
        categoryPropertyList.push(element.Text);
      }
    });
    return categoryPropertyList;
  }

  // add or update category rule
  addOrUpdateCategoryRule() {
    this.containerCategoryRule.CategoryProperty = this.getCategoryValues();
    this.containerCategoryRule.CriteriaCapacity = this.criteriaCapacity ? JSON.parse(this.criteriaCapacity) : null;
    this.containerCategoryRule.Rule = '';
    for (let f = 0; f < this.crNewFormula.length; f++) {
      const crNewRuleFormula = this.crNewFormula[f]['formula'];
      if (this.containerCategoryRule.Rule === '') {
        this.containerCategoryRule.Rule = crNewRuleFormula;
      } else {
        if (this.crNewFormula[f]['appendWith'] !== '') {
          this.containerCategoryRule.Rule = this.containerCategoryRule.Rule.concat(' ', this.crNewFormula[f]['appendWith'], ' ', crNewRuleFormula);
        }
      }
    }
    this.appErrService.clearAlert();
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, ContainerCategoryRule: this.containerCategoryRule };
    let url;
    if (this.crBtnName === this.commonEnum.add) {
      url = this.apiConfigService.insertContainerCategoryRuleUrl;
    } else if (this.crBtnName === this.commonEnum.update) {
      if (this.appService.IsObjectsMatch(this.containerCategoryRule, this.tempContainerCategoryRule)) {
        this.snackbar.info(this.appService.getErrorText('2660043'));
        this.spinner.hide();
        return;
      }
      url = this.apiConfigService.updateContainerCategoryRuleUrl;
    }
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const result = response.body;
        this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
          if (!this.appService.checkNullOrUndefined(result.Response)) {
            this.snackbar.success(result.Response);
            this.isEditCategoryRuleMode = false;
            this.resetCategoryRule();
          }
          if (!this.appService.checkNullOrUndefined(result.StatusMessage) && result.StatusMessage !== '') {
            this.snackbar.success(result.StatusMessage);
          }
        } else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
          // this.containerCategoryTypes = null;  //need to check
          this.spinner.hide();
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }


  // clearing CategoryType
  clearCategoryRule() {
    this.containerCategoryRule = new ContainerCategoryRule();
    this.tempContainerCategoryRule = new ContainerCategoryRule();
    this.crNewFormula = [];
    this.isCRValidateDisabled = true;
    this.isCRObjectDisabled = true;
    this.isCRLogicalOperatorDisabled = true;
    this.isCREnableAddOrUpdate = true;
    this.crRuleSetupCtrl.reset();
    this.appErrService.clearAlert();
  }

  // clearRuleSetup -- on validaterule / after creating rule we are calling
  clearCRRuleSetup() {
    this.selectedCRObject = '';
    this.selectedCRLogicalOperator = '';
    this.selectedCROperator = '';
    this.isCRRuleValueDisabled = true;
    if (!this.appService.checkNullOrUndefined(this.crNewFormula) && !this.appService.checkNullOrUndefined(this.crNewFormula.length)) {
      if (this.crNewFormula.length > 0) {
        this.isCRLogicalOperatorDisabled = false;
        this.isCRObjectDisabled = true;
        this.appService.setFocus('crLogicaloperator');
      } else if (this.crNewFormula.length === 0) {
        this.isCRLogicalOperatorDisabled = true;
        this.isCRObjectDisabled = false;
        this.appService.setFocus('crObject');
      }
    }
    this.ruleCRSectionObjectChangeClear();
    // this.crRuleSetupCtrl.reset();
  }

  onCategoryObjectChange(event) {
    this.selectedCategoryObject = event.value;
    this.getProperties(event.value);
  }

  resetCategoryRule() {
    this.crBtnName = this.commonEnum.add;
    this.isCategoryRuleBtnDisabled = true;
    this.containerCategoryRules = null;
    this.isCRRankDisabled = true;
    this.isCRCategoryNameDisabled = true;
    this.selectedcategoryRuleType = '';
    this.clearCRRuleSetup();
    this.clearCategoryRule();
    this.categoryRuleForm.reset();
    this.selectedCategoryObject = this.commonEnum.device;
    this.categoryPropertySelectedItem = [];
    this.categoryRuleFoucs();
  }


  // #endregion category rule

  //#region Category

  ccategoryNameFocus() {
    this.appService.setFocus('ccategoryName');
  }

  //#endregion


  //#region conntainer header
  onContainerHeader() {
    this.appService.setFocus('chContainerType');
  }

  //clearParentContianerHeader
  clearParentContianerHeader() {
    this.appErrService.clearAlert();
    this.parentContainer = '';
    this.isParentContainerClearDisabled = true;
  }
  //changeParentContainerInput
  changeParentContainerInput() {
    this.appErrService.clearAlert();
    this.isParentContainerClearDisabled = false;
  }
  //convertToParentContainer
  convertToParentContainer(parentContaineInput) {
    if (this.parentContainer) {
      this.spinner.show();
      const requestObj = { ClientData: this.clientData, UIData: this.uiData };
      const url = String.Join('/', this.apiConfigService.convertToParentContainerUrl, this.parentContainer);
      this.apiService.apiPostRequest(url, requestObj)
        .subscribe(response => {
          const res = response.body;
          this.spinner.hide();
          if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
            this.clearParentContianerHeader();
            this.snackbar.success(res.StatusMessage);
          } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
            parentContaineInput.applyRequired(true);
            parentContaineInput.applySelect();
            this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          }
        }, erro => {
          this.appErrService.handleAppError(erro);
        });
    }
  }

  getContainerTypes() {
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    this.apiService.apiPostRequest(this.apiConfigService.getContainerTypesUrl, requestObj)
      .subscribe(response => {
        const res = response.body;
        this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          this.containerTypes = res.Response;
          this.containerTypesOptions = [];
          this.containerTypes.forEach((element) => {
            if (element !== '' && !this.appService.checkNullOrUndefined(element)) {
              const dd: dropdown = new dropdown();
              dd.Id = element;
              dd.Text = element;
              this.containerTypesOptions.push(dd);
            }
          });
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }

  getContainerCategoryNames() {
    this.spinner.show();
    this.categoryNameOptions = [];
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    if (!this.appService.checkNullOrUndefined(this.selectedCHContainerType)) {
      const requestUrl = String.Join('/', this.apiConfigService.getContainerCategoryNamesUrl, this.selectedCHContainerType)
      this.apiService.apiPostRequest(requestUrl, requestObj)
        .subscribe(response => {
          const res = response.body;
          this.spinner.hide();
          if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
            this.categoryNames = res.Response;
            this.categoryNames.forEach((element) => {
              if (element !== '' && !this.appService.checkNullOrUndefined(element)) {
                const dd: dropdown = new dropdown();
                dd.Id = element;
                dd.Text = element;
                this.categoryNameOptions.push(dd);
              }
            });
          } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
            this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          }
        }, erro => {
          this.appErrService.handleAppError(erro);
        });
    }
  }
  getContainerId() {
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getContainerIdUrl, this.selectedCHContainerType,this.selectedCHCategoryName);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const res = response.body;
        this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          this.containerId = res.Response;
          this.isRangeDisabled = false;
          this.appService.setFocus('range');
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }

  generateContainers() {
    if (this.selectedCHContainerType && this.containersRange && this.containerId) {
      this.spinner.show();
      this.genContainerParams = {
        ContainerId: this.containerId,
        Quantity: this.containersRange,
        CategoryName: this.selectedCHCategoryName,
        IsPrintEnabled: this.containerHeaderPrint,
        ContainerType: this.selectedCHContainerType
      };
      const requestObj = { ClientData: this.clientData, UIData: this.uiData, GenContainerParams: this.genContainerParams };
      this.apiService.apiPostRequest(this.apiConfigService.generateContainersUrl, requestObj)
        .subscribe(response => {
          const res = response.body;
          this.spinner.hide();
          if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
            this.clearContianerHeader();
            if (!this.appService.checkNullOrUndefined(res.StatusMessage) && res.StatusMessage !== '') {
              this.snackbar.success(res.StatusMessage);
            }
          } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
            this.spinner.hide();
            this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
            this.clearContianerHeader();
          }
        }, erro => {
          this.appErrService.handleAppError(erro);
        });
    }
  }

  isPrint() {
    this.containerHeaderPrint = !this.containerHeaderPrint;
  }
  clearContianerHeader() {
    this.selectedCHContainerType = '';
    this.selectedCHCategoryName = '';
    this.containersRange = null;
    this.containerId = '';
    this.isCHCategoryName = true;
    this.isRangeDisabled = true;
    this.isCHClearDisabled = true;
    this.onContainerHeader();
  }

  onCHContainerTypeChange(event) {
    this.containerId = '';
    this.selectedCHCategoryName = '';
    this.containersRange = null;
    this.isCHClearDisabled = false;
    this.selectedCHContainerType = event.value;
    this.isCHCategoryName = false;
    this.appService.setFocus('chCategoryName');
    // this.getContainerId();
    this.getContainerCategoryNames();
  }

  onCHCategoryNameChange(event) {
    this.selectedCHCategoryName = event.value;
    this.getContainerId();
  }

  //#endregion


  //#region common methods

  getObjects() {
    this.spinner.show();
    this.maintenanceServeice.getObjects(this.clientData, this.uiData)
      .subscribe(response => {
        this.spinner.hide();
        const res = response;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          if (!this.appService.checkNullOrUndefined(res.Response)) {
            this.objectOptions = [];
            res.Response.forEach((element) => {
              const dd: dropdown = new dropdown();
              dd.Id = element;
              dd.Text = element;
              this.objectOptions.push(dd);
            });
          }

        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }

  getProperties(selectedObject) {
    this.spinner.show();
    this.maintenanceServeice.getProperties(this.clientData, this.uiData, selectedObject)
      .subscribe(response => {
        this.spinner.hide();
        const res = response;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          if (!this.appService.checkNullOrUndefined(res.Response)) {
            if (this.selectedCategoryObject === selectedObject) {
              this.propertyOptions = [];
              res.Response.forEach((element) => {
                const dd: dropdown = new dropdown();
                dd.Id = element;
                dd.Text = element;
                this.propertyOptions.push(dd);
              });
            }
            if (this.selectedObject === selectedObject) {
              this.rulePropertyOptions = [];
              res.Response.forEach((element) => {
                const dd: dropdown = new dropdown();
                dd.Id = element;
                dd.Text = element;
                this.rulePropertyOptions.push(dd);
              });
            }
            if (this.selectedCRObject === selectedObject) {
              this.ruleCRPropertyOptions = [];
              res.Response.forEach((element) => {
                const dd: dropdown = new dropdown();
                dd.Id = element;
                dd.Text = element;
                this.ruleCRPropertyOptions.push(dd);
              });
            }
          }
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }

  getLogicalOperators() {
    this.spinner.show();
    this.maintenanceServeice.getLogicalOperators(this.clientData, this.uiData)
      .subscribe(response => {
        this.spinner.hide();
        const res = response;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          if (!this.appService.checkNullOrUndefined(res.Response)) {
            this.logicalOperatorOptions = [];
            res.Response.forEach((element) => {
              const dd: dropdown = new dropdown();
              dd.Id = element;
              dd.Text = element;
              this.logicalOperatorOptions.push(dd);
            });
            this.getObjects();
          }
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }

  // getOperators
  getOperators() {
    this.spinner.show();
    this.maintenanceServeice.getOperators(this.clientData, this.uiData)
      .subscribe(response => {
        const res = response;
        this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          if (!this.appService.checkNullOrUndefined(res.Response)) {
            this.operatorOptions = [];
            res.Response.forEach((element) => {
              const dd: dropdown = new dropdown();
              dd.Id = element;
              dd.Text = element;
              this.operatorOptions.push(dd);
            });
          }
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, error => {
        this.appErrService.handleAppError(error);
      });
  }
  //#endregion common methods






  ngOnDestroy() {
    this.propertyOptions = [];
    this.resetCategoryRule();
    this.clearContianerHeader();
    this.resetCategoryType();
    this.emitHideSpinner.unsubscribe();
    this.appErrService.clearAlert();
    this.masterPageService.defaultProperties();
  }

}
