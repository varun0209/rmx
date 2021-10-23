import { Component, OnInit } from '@angular/core';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';
import { ClientData } from '../../models/common/ClientData';
import { UiData } from '../../models/common/UiData';
import { SupplementalSetupConfig } from '../../models/maintenance/supplemental-setup/supplemental-setup-config';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from '../../utilities/rlcutl/api.service';
import { ApiConfigService } from '../../utilities/rlcutl/api-config.service';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';
import { dropdown } from '../../models/common/Dropdown';
import { String } from 'typescript-string-operations';
import { Subscription } from 'rxjs';
import { Rule } from '../../models/dev-maintenance/transaction-config';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { CommonEnum } from '../../enums/common.enum';
import { StorageData } from '../../enums/storage.enum';
import { StatusCodes } from '../../enums/status.enum';
import { DropDownSettings } from '../../models/common/dropDown.config';
import { Grid } from '../../models/common/Grid';
import { AppService } from '../../utilities/rlcutl/app.service';
import { checkNullorUndefined } from '../../enums/nullorundefined';
import { SupplementalSetupPopupComponent } from '../../dialogs/supplemental-setup-popup/supplemental-setup-popup.component';

@Component({
  selector: 'app-supplemental-setup',
  templateUrl: './supplemental-setup.component.html',
  styleUrls: ['./supplemental-setup.component.css']
})
export class SupplementalSetupComponent implements OnInit {

  clientData = new ClientData();
  uiData = new UiData();
  transactionIDOptions = [];
  commonButton = CommonEnum;

  // config
  supplementalSetupConfig = new SupplementalSetupConfig();
  tempSupplementalSetupConfig = new SupplementalSetupConfig();

  objectOptions = [];
  selectedTransID = [];
  dropdownSettings: DropDownSettings;

  objectSelected: string;
  isObjectDisabled = true;

  propertyOptions = [];
  propertySelected: string;
  isPropertydisabled = true;

  operatorOptions = [];
  selectedOperator: string;
  isOperatorDisabled: boolean = true;

  /**Rules Section**/
  isTransCodeDisabled = true;
  rulesDescriptionDisabled = true;
  isRuleValueDisabled = true;
  isGenerateTransCodeDisabled = true;
  ruleValue: string;
  existingRule: string;


  emitHideSpinner: Subscription;

  // disbale section
  isDescriptionDisabled = false;
  isValidateDisabled = true;
  isSaveDisabled = true;
  isFormulaDisabled = false;
  isClearDisabled = true;
  isResetDisabled = true;
  isTransationDisabled = false;
  isSearchDisabled = false;
  isDisabledAdd = true;

  logicaloperatorOptions = [];
  selectedLogicalOperator: string;

  // grid list
  supplementalSetupConfigList: any;

  grid: Grid;
  rule = new Rule();
  addOrUpdateSuppSetup = CommonEnum.add;
  storageData = StorageData;
  statusCode = StatusCodes;
  notesChecked = false;

  constructor(
    public masterPageService: MasterPageService,
    public form: FormBuilder,
    private spinner: NgxSpinnerService,
    public apiservice: ApiService,
    private apiConfigService: ApiConfigService,
    public appErrService: AppErrorService,
    private snackbar: XpoSnackBar,
    private appService: AppService
  ) {
    this.emitHideSpinner = this.masterPageService.emitHideSpinner.subscribe(spinnerFlag => {
      if (!checkNullorUndefined(spinnerFlag) && spinnerFlag) {
        this.getSuplTransactionIDS();
        this.getObjects();
        this.getOperators();
        this.getLogicalOperators();
      }
    });
  }


  ngOnInit() {
    let operationObj = this.masterPageService.getRouteOperation();
    if (operationObj) {
      this.uiData.OperationId = operationObj.OperationId;
      this.uiData.OperCategory = operationObj.Category;
      this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
      //setting value to hidespinner (based on this value we are emiting emithidespinner method)
      this.masterPageService.hideSpinner = true;
      this.masterPageService.setTitle(operationObj.Title);
      this.masterPageService.setModule(operationObj.Module);
      this.supplementalSetupConfig.ACTIVE = this.commonButton.yes;
      this.supplementalSetupConfig.ALLOWDUPS = this.commonButton.no;
      this.dropdownSettings = new DropDownSettings();
      this.dropdownSettings.idField = 'ID';
      this.dropdownSettings.textField = 'TEXT';
      this.dropdownSettings.singleSelection = true;
    }
  }

  //getOperators
  getOperators() {
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

  //getLogicalOperators
  getLogicalOperators() {
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


  getSuplTransactionIDS() {
    this.spinner.show();
    let requestObj = { ClientData: this.clientData, UIData: this.uiData };
    this.apiservice.apiPostRequest(this.apiConfigService.getSuplTransactionIDS, requestObj)
      .subscribe(response => {
        let res = response.body;
        if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
          if (!checkNullorUndefined(res.Response)) {
            this.transactionIDOptions = res.Response['SuplTransactions'];
          }
          this.spinner.hide();
        } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }

  onTransIDChange(event) {
    this.onClear();
    this.supplementalSetupConfig.TRANSID = event.ID;
    this.enableControls();
  }


  searchSuplTransConfigs() {
    this.supplementalSetupConfigList = null;
    this.spinner.show();
    let requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_SUPPLEMENTAL_TRANS_CFNG: this.supplementalSetupConfig };
    this.apiservice.apiPostRequest(this.apiConfigService.searchSuplTransConfigs, requestObj)
      .subscribe(response => {
        this.spinner.hide();
        let res = response.body;
        if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
          if (!checkNullorUndefined(res.Response)) {
            if (res.Response['SuplTransactionsList'].length) {
              this.reset();
              this.showConfigGrid(res['Response']['SuplTransactionsList']);
            }
          }
        } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }

  showConfigGrid(gridData) {
    this.supplementalSetupConfigList = null;
    this.grid = new Grid();
    this.grid.EditVisible = true;
    this.supplementalSetupConfigList = this.appService.onGenerateJson(gridData, this.grid);
  }

  editSuppConfigDetailRow(data) {
    this.checkNotes(true);
    this.supplementalSetupConfig = new SupplementalSetupConfig();
    this.tempSupplementalSetupConfig = new SupplementalSetupConfig();
    this.selectedTransID = this.transactionIDOptions.filter(res => res.ID == data.TRANSID);
    this.supplementalSetupConfig = Object.assign(this.supplementalSetupConfig, data);
    this.tempSupplementalSetupConfig = Object.assign(this.tempSupplementalSetupConfig, data);
    this.addOrUpdateSuppSetup = this.commonButton.update;
    this.existingRule = this.supplementalSetupConfig.STRULE;
    this.isTransationDisabled = true;
    this.isSearchDisabled = true;
    if (this.notesChecked) {
      this.isObjectDisabled = false;
    }
    this.enableReset();
    this.supplementalSetupConfigList['EditHighlight'] = true;
  }

  enableReset() {
    this.isResetDisabled = false;
    this.appErrService.clearAlert();
  }

  enableControls() {
    if (this.supplementalSetupConfig.TRANSID != '' && !checkNullorUndefined(this.supplementalSetupConfig.TRANSID)) {
      if (this.notesChecked) {
        this.disableOrEnableCont(false);
      } else {
        this.disableOrEnableCont(true);
      }
    } else {
      this.disableOrEnableCont(true);
    }
  }

  disableOrEnableCont(flag) {
    this.isObjectDisabled = flag;
    this.isRuleValueDisabled = flag;
    this.isDisabledAdd = flag;
  }

  enableAdd(value) {
    if (this.notesChecked) {
      return value;
    } else {
      return true;
    }
  }

  checkNotes( flag?) {
    this.notesChecked = true;
    this.enableControls();
    this.disableOrEnableCont(false);
    if (!flag) {
      this.masterPageService.openModelPopup(SupplementalSetupPopupComponent, true);
    }
  }

  onActiveChange(value) {
    this.supplementalSetupConfig.ACTIVE = value ? this.commonButton.yes : this.commonButton.no;
    this.saveCheck();
  }

  saveCheck() {
    if (!checkNullorUndefined(this.existingRule) && this.isValidateDisabled && this.supplementalSetupConfig.TRANSID != '' && this.supplementalSetupConfig.DESCRIPTION) {
      this.isSaveDisabled = false;
    } else {
      this.isSaveDisabled = true;
    }
  }

  onAllowDupsChange(value) {
    this.supplementalSetupConfig.ALLOWDUPS = value ? this.commonButton.yes : this.commonButton.no;
    this.saveCheck();
  }

  //getObjects
  getObjects() {
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
    this.objectChangeClear();
    this.objectSelected = event;
    this.getProperties();
  }

  //getProperties
  getProperties() {
    this.spinner.show();
    let requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const getPropertiesUrl = String.Join("/", this.apiConfigService.getPropertiesUrl, this.objectSelected);
    this.apiservice.apiPostRequest(getPropertiesUrl, requestObj)
      .subscribe(response => {
        let res = response.body;
        if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
          if (!checkNullorUndefined(res.Response)) {
            this.propertyOptions = [];
            this.isPropertydisabled = false;
            this.isClearDisabled = false;
            res.Response.forEach((element) => {
              let dd: dropdown = new dropdown();
              dd.Id = element;
              dd.Text = element;
              this.propertyOptions.push(dd);
            });
          }
          this.spinner.hide();
        } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
          this.spinner.hide();
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

  //on operator change dropdown
  onOperatorChange(event) {
    this.selectedOperator = event;
  }

  // enabling the append dropdown
  enableElement() {
    if (!checkNullorUndefined(this.supplementalSetupConfig.STRULE) && this.supplementalSetupConfig.STRULE !== "") {
      return false;
    }
    else {
      return true;
    }
  }

  //on logical operator dropdown change
  onLogicalOperatorChange(event) {
    this.selectedLogicalOperator = event;
    this.isClearDisabled = false;
  }

  enableValidate() {
    if (!checkNullorUndefined(this.supplementalSetupConfig.STRULE) && this.supplementalSetupConfig.STRULE != '') {
      this.isValidateDisabled = false;
      this.isSaveDisabled = true;
    } else {
      this.isValidateDisabled = true;
    }
  }

  //createRule
  createRule() {
    let ruleString = "";
    let newRuleFormula = String.Join('.', this.objectSelected, ruleString.concat(this.propertySelected, this.selectedOperator, this.ruleValue));
    if (checkNullorUndefined(this.supplementalSetupConfig.STRULE)) {
      this.supplementalSetupConfig.STRULE = newRuleFormula;
    }
    else {
      if (!checkNullorUndefined(this.selectedLogicalOperator)) {
        this.supplementalSetupConfig.STRULE = this.supplementalSetupConfig.STRULE.concat(" ", this.selectedLogicalOperator, " ", newRuleFormula);
      }
    }
    this.clearFormulaControls();
    this.isValidateDisabled = false;
    this.isSaveDisabled = true;
  }

  //validateRule
  validateFormula() {
    this.appErrService.clearAlert();
    this.spinner.show();
    this.rule.RuleSetUp = this.supplementalSetupConfig.STRULE;
    let requestObj = { ClientData: this.clientData, UIData: this.uiData, Rule: this.rule };
    this.apiservice.apiPostRequest(this.apiConfigService.validateRuleUrl, requestObj)
      .subscribe(response => {
        let res = response.body;
        if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
          this.isValidateDisabled = true;
          this.existingRule = this.supplementalSetupConfig.STRULE;
          if (!checkNullorUndefined(res.Response)) {
            this.saveCheck();
            this.snackbar.success(res.Response);
          }
          this.clearFormulaControls();
          this.spinner.hide();
        } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, error => {
        this.appErrService.handleAppError(error);
      });
  }

  saveFormula() {
    this.isSaveDisabled = true;
    this.appErrService.clearAlert();
    let url;
    this.spinner.show();
    this.supplementalSetupConfig.STRULE = this.existingRule;
    if (this.addOrUpdateSuppSetup == this.commonButton.update) {
      url = this.apiConfigService.updateSupplementaltTransConfig;
    } else if (this.addOrUpdateSuppSetup == this.commonButton.add) {
      url = this.apiConfigService.addSupplementalTransConfig;
    }
    let requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_SUPPLEMENTAL_TRANS_CFNG: this.supplementalSetupConfig };
    this.apiservice.apiPostRequest(url, requestObj)
      .subscribe(response => {
        this.spinner.hide();
        let res = response.body;
        if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
          if (!checkNullorUndefined(res.Response)) {
            this.reset();
            if (res.Response['SUPPLEMENTALTRANSCFNGLIST'].length) {
              this.showConfigGrid(res['Response']['SUPPLEMENTALTRANSCFNGLIST']);
              this.isResetDisabled = false;
            }
            this.snackbar.success(res.StatusMessage);
          }
        } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
          this.isSaveDisabled = false;
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, error => {
        this.appErrService.handleAppError(error);
      });
  }

  ruleChange() {
    this.isClearDisabled = false;
  }


  onClear() {
    this.clearFormulaControls();
    this.enableControls();
    this.supplementalSetupConfig.STRULE = this.existingRule;
    this.isObjectDisabled = false;
    this.isRuleValueDisabled = false;
    this.isSaveDisabled = true;
    this.isClearDisabled = true;
  }

  reset() {
    this.onClear();
    this.supplementalSetupConfig = new SupplementalSetupConfig();
    this.supplementalSetupConfig.ACTIVE = this.commonButton.yes;
    this.supplementalSetupConfig.ALLOWDUPS = this.commonButton.no;
    this.addOrUpdateSuppSetup = CommonEnum.add;
    this.isResetDisabled = true;
    this.isObjectDisabled = true;
    this.isRuleValueDisabled = true;
    this.existingRule = null;
    this.isFormulaDisabled = false;
    this.selectedTransID = [];
    this.isTransationDisabled = false;
    this.isSearchDisabled = false;
    this.supplementalSetupConfigList = null;
    this.isDisabledAdd = true;
  }

  clearFormulaControls() {
    this.objectSelected = "";
    this.selectedLogicalOperator = "";
    this.isValidateDisabled = true;
    this.objectChangeClear();
  }

  objectChangeClear() {
    this.appErrService.clearAlert();
    this.selectedOperator = "";
    this.isOperatorDisabled = true;
    this.ruleValue = "";
    this.propertyOptions = [];
    this.propertySelected = "";
    this.isPropertydisabled = true;
  }

  ngOnDestroy() {
    this.masterPageService.defaultProperties();
    this.emitHideSpinner.unsubscribe();

  }

}
