import { Component, OnInit, Input, ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
import { Rule, FormulaObj } from '../../../models/dev-maintenance/transaction-config';
import { ApiService } from '../../../utilities/rlcutl/api.service';
import { AppService } from '../../../utilities/rlcutl/app.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppErrorService } from '../../../utilities/rlcutl/app-error.service';
import { String } from 'typescript-string-operations';
import { MasterPageService } from '../../../utilities/rlcutl/master-page.service';
import { ClientData } from '../../../models/common/ClientData';
import { UiData } from '../../../models/common/UiData';
import { ApiConfigService } from '../../../utilities/rlcutl/api-config.service';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { MaintenanceService } from '../../../services/maintenance.service';
import { dropdown } from '../../../models/common/Dropdown';
import { DropDownSettings } from '../../../models/common/dropDown.config';
import { CommonEnum } from '../../../enums/common.enum';
import { CommonService } from '../../../services/common.service';

@Component({
  selector: 'app-rule-setup',
  templateUrl: './rule-setup.component.html',
  styleUrls: ['./rule-setup.component.css']
})
export class RuleSetupComponent implements OnInit {

  @Output() emitEnableAddOrSave = new EventEmitter();

  clientData = new ClientData();
  uiData = new UiData();


  // attribute
  attributeList = [];
  attributeDropdownSettings: DropDownSettings;
  selectedAttribute = [];
  selectedAttributeText: any;
  isAttributeDisabled = true;

  // operator
  operatorList = [];
  operatorDropdownSettings: DropDownSettings;
  selectedOperator = [];
  isOperatorDisabled = true;

  // VALUE
  valueList = [];
  valueDropdownSettings: DropDownSettings;
  selectedValue = [];
  isValueDisabled = true;
  attributeValue = '';

  // logical op
  isLogicalOperatorDisabled = true;
  logicaloperatorOptions = [];
  selectedLogicalOperator: string;
  isLogicalOperatorRequired = false;

  // table
  formulaList = [];
  highLightindex: any;
  newFormulaObject = new FormulaObj();
  oldRule: any;
  indexTrack = 0;
  groupList = [];

  finalFormula: string;
  isRuleAddDisabled = true;
  isResetDisabled = true;
  isValidateDisabled = true;
  configJson: any;
  selectedControlType = CommonEnum.controlType;

  @Input()
  set ruleSetupObject(data) {
    if (!this.appService.checkNullOrUndefined(data)) {
      this.clientData = data.clientData;
      this.uiData = data.uiData;
      this.configJson = data.attributeRoutingJson;
      this.getAttributeNameList();
    }
  }

  @Input()
  set editruleSetup(data) {
    if (!this.appService.checkNullOrUndefined(data)) {
      this.formulaList = [];
      if (data != '') {
        this.newFormulaObject['formula'] = data;
        this.addFieldValue();
      } else if (data == '') {
        this.isLogicalOperatorDisabled = true;
      }
      this.isValidateDisabled = false;
      this.highLightindex = undefined;
    }
  }


  constructor(
    private appService: AppService,
    public appErrService: AppErrorService,
    public masterPageService: MasterPageService,
    private spinner: NgxSpinnerService,
    private apiConfigService: ApiConfigService,
    private commonService: CommonService,
    private snackbar: XpoSnackBar
  ) {
    this.attributeSettings();
    this.operatorSettings();
    this.valueSettings(true);
  }

  ngOnInit() {
  }

  // calling to enable attribute control
  enableAttribute(flag?) {
    this.isAttributeDisabled = !flag;
    if (!flag) {
      this.attributeFocus();
    }
  }

  attributeSettings() {
    this.attributeDropdownSettings = new DropDownSettings();
    this.attributeDropdownSettings.idField = CommonEnum.ID;
    this.attributeDropdownSettings.textField = CommonEnum.TEXT;
    this.attributeDropdownSettings.singleSelection = true;
  }

  // setting operator DropdownSettings
  operatorSettings() {
    this.operatorDropdownSettings = new DropDownSettings();
    this.operatorDropdownSettings.singleSelection = true;
  }

  // setting value DropdownSettings
  valueSettings(val) {
    this.valueDropdownSettings = new DropDownSettings();
    this.valueDropdownSettings.idField = CommonEnum.Text;
    this.valueDropdownSettings.textField = CommonEnum.Text;
    this.valueDropdownSettings.closeDropDownOnSelection = val;
    this.valueDropdownSettings.singleSelection = val;
  }

  // GetAttributeNameList
  getAttributeNameList() {
    this.attributeList = [];
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getAttributeNames);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response) &&
          !this.appService.checkNullOrUndefined(res.Response.AttributeNamesList) &&
          res.Response.AttributeNamesList.length > 0) {
          this.attributeList = res.Response.AttributeNamesList;
        }
        this.getLogicalOperators();
      }
    });
  }

  // getLogicalOperators
  getLogicalOperators() {
    this.logicaloperatorOptions = [];
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getAttributeRouteLogicalOperators);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          res.Response.forEach((element) => {
            const dd: dropdown = new dropdown();
            dd.Id = element;
            dd.Text = element;
            this.logicaloperatorOptions.push(dd);
          });
        }
      }
    });
  }

  // getOperatorsByAttributeType
  getOperatorsByAttributeType(AttrText) {
    this.operatorList = [];
    const selectedAttribute = this.attributeList.find(el => el.TEXT === AttrText);
    const attribute = { [CommonEnum.attributeType]: selectedAttribute.TYPE };
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_ATTRIBUTE_MASTER: attribute };
    const url = String.Join('/', this.apiConfigService.getOperatorsByAttributeType);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          this.operatorList = res.Response;
          this.getAttributeControlNValue(AttrText);
        }
      }
    });
  }

  // getAttributeControlNValue
  getAttributeControlNValue(AttrText) {
    this.valueList = [];
    this.appErrService.clearAlert();
    const selectedAttribute = this.attributeList.find(el => el.TEXT === AttrText);
    const attribute = { [CommonEnum.attributeID]: selectedAttribute.ID };
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_ATTRIBUTE_MASTER: attribute };
    const url = String.Join('/', this.apiConfigService.getAttributeControlNValue);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          if (!this.appService.checkNullOrUndefined(res.Response.Value) && res.Response.Value.length > 0) {
            this.valueList = res.Response.Value;
          }
          if (!this.appService.checkNullOrUndefined(res.Response.ControlType)) {
            this.selectedControlType = res.Response.ControlType;
          }
        }
      }
    });
  }

  setFormula(val, flag?) {
    if (flag) {
      this.newFormulaObject['formula'] = String.Join('', val, this.newFormulaObject['formula']);
    } else {
      this.newFormulaObject['formula'] = String.Join(' ', this.newFormulaObject['formula'], val);
    }
    this.oldRule = this.newFormulaObject['formula'];
  }


  checkAttributeProperties(value) {
    const attribute = this.attributeList.find(el => el.TEXT === value);
    if (!this.appService.checkNullOrUndefined(attribute) && !this.appService.checkNullOrUndefined(attribute.TYPE) && attribute.TYPE === CommonEnum.boolean) {
      return true;
    }
  }

  onAttributeChange(event) {
    this.setFormula(event.TEXT);
    this.selectedAttributeText = event.TEXT;
    this.isResetDisabled = false;
    this.getOperatorsByAttributeType(event.TEXT);
    this.isAttributeDisabled = true;
    this.isOperatorDisabled = false;
    this.operatorDropdownFocus();
    this.isRuleAddDisabled = this.checkAttributeProperties(event.TEXT) ? false : true;
  }

  onOperatorChange(event) {
    if (event === CommonEnum.notOperator) {
      this.isRuleAddDisabled = false;
      this.setFormula(event, true);
    } else {
      this.setFormula(event);
      this.isRuleAddDisabled = true;
    }
    this.isValueDisabled = false;
    (event === CommonEnum.in) ? this.valueSettings(false) : this.valueSettings(true);
    this.isOperatorDisabled = true;
    this.ruleValueFocus();
  }


  onValueChange(event) {
    this.newFormulaObject['formula'] = this.oldRule;
    this.newFormulaObject['formula'] = String.Join(' ', this.newFormulaObject['formula'],
      `${this.configJson['Attributes']['default'].startOperator}${event}${this.configJson['Attributes']['default'].endOperator}`);
    this.isRuleAddDisabled = (event == '') ? true : false;
  }

  // calling on selcting value dropdown
  onValueChangeDropdown(event) {
    this.isValueDisabled = this.valueDropdownSettings.singleSelection;
    let value;
    if (!this.valueDropdownSettings.singleSelection) {
      const selectedString = JSON.stringify([...this.selectedValue]);
      const temp = selectedString.replace(selectedString[0], this.configJson['Operators']['in'].startOperator);
      const finalsString = temp.replace(selectedString[selectedString.length - 1], this.configJson['Operators']['in'].endOperator);
      value = String.Join(' ', finalsString);
    } else {
      const attribute = this.attributeList.find(el => el.TEXT === this.selectedAttributeText);
      if (attribute.TYPE === CommonEnum.boolean) {
        value = `${this.configJson['Attributes']['boolean'].startOperator}${event}${this.configJson['Attributes']['boolean'].endOperator}`;
      } else {
        value = `${this.configJson['Attributes']['default'].startOperator}${event}${this.configJson['Attributes']['default'].endOperator}`;
      }
    }
    this.newFormulaObject['formula'] = this.oldRule;
    this.newFormulaObject['formula'] = String.Join(' ', this.newFormulaObject['formula'], value);
    this.isRuleAddDisabled = this.selectedValue.length ? false : true;
  }

  // on logical operator dropdown change
  onLogicalOperatorChange(event) {
    if (this.appService.checkNullOrUndefined(this.selectedLogicalOperator)) {
      this.isAttributeDisabled = false;
    }
    this.selectedLogicalOperator = event;
    this.newFormulaObject['appendWith'] = event;
    this.isResetDisabled = false;
    this.emitEnableAddOrSave.emit(null);
    this.attributeFocus();
    this.isValidateDisabled = true;
  }

  addRule() {
    this.addFieldValue();
    this.isLogicalOperatorDisabled = false;
    this.isLogicalOperatorRequired = true;
    this.isRuleAddDisabled = true;
  }

  // grouping rules
  groupFeilds() {
    let newStr = '';
    let appWith = '';
    this.groupList.sort();
    this.groupList.forEach(idx => {
      const appendWith = (this.formulaList[idx].appendWith !== '') ? this.formulaList[idx].appendWith : '';
      if (appWith === '') {
        appWith = (appendWith == '') ? ' ' : appendWith;
        newStr = String.Join(' ', newStr, this.formulaList[idx].formula);
      } else {
        newStr = String.Join(' ', newStr, appendWith, this.formulaList[idx].formula);
      }
    });
    this.formulaList = this.removeFromArray(this.formulaList, this.groupList);
    const newFor = new FormulaObj();
    newFor.appendWith = appWith;
    newFor.formula = this.configJson['group'].startOperator + newStr + this.configJson['group'].endOperator;
    this.formulaList.splice(this.groupList[0], 0, newFor);
    this.groupList = [];
    this.concatFormula();
  }

  removeFromArray(original, remove) {
    return original.filter((value, index) => !remove.includes(index));
  }

  groupRow(i) {
    this.isResetDisabled = false;
    if (this.groupList.length) {
      if (this.groupList.length === 1) {
        if (((this.groupList[0] - 1) === i || (this.groupList[0] + 1) === i) ? false : true) {
          this.groupList = [i];
          return;
        }
      } else if (this.groupList.length > 1) {
        if (((this.groupList[0] - 1) === i || (this.groupList[0] + 1) === i) ? false : true
          && ((this.groupList[this.groupList.length - 1] - 1) === i ||
            (this.groupList[this.groupList.length - 1] + 1) === i) ? false : true) {
          this.groupList = [i];
          return;
        }
      }
    }
    this.groupList.push(i);
  }

  highlightRow(i) {
    return this.groupList.filter(res => res == i).length ? true : false;
  }
  // end grouping

  addFieldValue() {
    this.formulaList.push(this.newFormulaObject);
    this.newFormulaObject = new FormulaObj();
    this.concatFormula();
    this.resetRuleSetup();
    this.isValidateDisabled = false;
  }

  // calling on deleteing a formula
  deleteFieldValue(index) {
    this.appErrService.clearAlert();
    this.formulaList.splice(index, 1);
    if (this.formulaList.length > 0) {
      this.formulaList[0]['appendWith'] = '';
      this.resetRuleSetup();
    } else if (this.formulaList.length == 0) {
      this.isLogicalOperatorDisabled = true;
      this.resetRuleSetup(true);
    }
    if (index == this.highLightindex) {
      this.highLightindex = undefined;
    } else if (index < this.highLightindex) {
      this.highLightindex--;
    }
  }

  // resetRuleSetup on reset click
  resetRuleSetup(flag = false) {
    this.oldRule = null;
    this.newFormulaObject = new FormulaObj();
    this.isResetDisabled = true;
    this.clearRuleSetup();
    this.isRuleAddDisabled = true;
    this.concatFormula();
    this.isValidateDisabled = flag;
    if (this.finalFormula) {
      this.emitEnableAddOrSave.emit({ Formula: this.finalFormula, ValidatedFormula: false });
    } else {
      this.emitEnableAddOrSave.emit(null);
    }
  }

  // clearRuleSetup -- on validaterule / after creating rule we are calling
  clearRuleSetup() {
    if (!this.appService.checkNullOrUndefined(this.formulaList)) {
      if (this.formulaList.length) {
        this.isLogicalOperatorDisabled = false;
        this.isAttributeDisabled = true;
      } else {
        this.isLogicalOperatorDisabled = true;
        this.isAttributeDisabled = false;
      }
    }
    this.ruleSectionObjectChangeClear();
  }

  ruleSectionObjectChangeClear() {
    this.attributeFocus();
    this.logicaloperatorFocus();
    this.selectedAttribute = [];
    this.selectedOperator = [];
    this.isOperatorDisabled = true;
    this.isValueDisabled = true;
    this.selectedValue = null;
    this.selectedLogicalOperator = null;
    this.attributeValue = null;
    this.groupList = [];
  }

  // for joining all the formulas in list of formulas into finalformula
  concatFormula() {
    this.finalFormula = '';
    if (this.formulaList.length) {
      this.formulaList.forEach(res => this.finalFormula = String.Join(' ', this.finalFormula, String.Join(' ', res.appendWith, res.formula)));
    }
    this.finalFormula = String.Join(' ', this.finalFormula, String.Join(' ', this.newFormulaObject.appendWith, this.newFormulaObject.formula));
  }

  // validateRule
  validateRule() {
    this.highLightindex = undefined;
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, mRule: { [CommonEnum.ruleSetup]: this.formulaList[this.indexTrack].formula } };
    const url = String.Join('/', this.apiConfigService.validateAttributeRouteRule);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          this.indexTrack++;
          if (this.indexTrack < this.formulaList.length) {
            this.validateRule();
          } else {
            this.indexTrack = 0;
            this.emitEnableAddOrSave.emit({ Formula: this.finalFormula, ValidatedFormula: true });
            this.snackbar.success(res.Response);
            // this.resetRuleSetup();
          }
        }
      } else {
        this.emitEnableAddOrSave.emit(null);
        this.highLightindex = this.indexTrack;
        this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        this.indexTrack = 0;
        this.resetRuleSetup();
      }
    });
  }


  // operatorDropdownFocus
  operatorDropdownFocus() {
    this.appService.setFocus('operatorDropdown');
  }

  // ruleValueFocus
  ruleValueFocus() {
    this.appService.setFocus('attributeValue');
  }

  // logicaloperatorFocus
  logicaloperatorFocus() {
    this.appService.setFocus('logicaloperator');
  }

  // logicaloperatorFocus
  attributeFocus() {
    this.appService.setFocus('attribute');
  }

  resetRuleSetupFromParent() {
    this.resetRuleSetup(true);
    this.formulaList = [];
    this.finalFormula = null;
    this.indexTrack = 0;
    this.highLightindex = undefined;
    this.isLogicalOperatorDisabled = true;
    this.isAttributeDisabled = true;
  }

}
