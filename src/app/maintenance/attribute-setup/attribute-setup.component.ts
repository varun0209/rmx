import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
import { Subscription } from 'rxjs';
import { EngineResult } from '../../models/common/EngineResult';
import { UiData } from '../../models/common/UiData';
import { StorageData } from '../../enums/storage.enum';
import { StatusCodes } from '../../enums/status.enum';
import { Attribute } from '../../models/maintenance/attribute-route-config/attribute';
import { CommonEnum } from '../../enums/common.enum';
import { Rule,FormulaObj } from '../../models/dev-maintenance/transaction-config';
import { dropdown } from '../../models/common/Dropdown';
import { checkNullorUndefined } from '../../enums/nullorundefined';

@Component({
  selector: 'app-attribute-setup',
  templateUrl: './attribute-setup.component.html',
  styleUrls: ['./attribute-setup.component.css']
})
export class AttributeSetupComponent implements OnInit {

  //client Control Labels
  clientData = new ClientData();
  uiData = new UiData();
  operationObj: any;
  emitHideSpinner: Subscription;
  grid: Grid;
  appConfig: any;
  commonButton = CommonEnum;

  attribute = new Attribute();
  tempAttribute = new Attribute();

  isAttributeTypeDisabled: boolean = false;
  isAttributeIDDisabled: boolean = false;
  isAttributeNameDisabled: boolean = false;
  isDescriptionDisabled: boolean = true;
  isattributeToggleActive: boolean = false;
  isResetBtnDisabled: boolean = true;
  isLogicalOperatorDisabled: boolean = true;
  isLogicalOperatorRequired:boolean = false;
  isAttributeSearchBtnDisabled: boolean = true;
  isAttributeResetBtnDisabled: boolean = true;
  isGenerateAttributeIDBtnDisabled: boolean = false;
  attributeBtnName = this.commonButton.add;
  attributeList: any;
  tempAttributeList: any;
  isEditAttributeMode: boolean = false;
  isAttributeIDGenerated: boolean = false;
  isEnableAddOrSave: boolean = true;


  //rule setup
  logicaloperatorOptions = [];
  selectedLogicalOperator: string;
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
  isRuleValueDisabled = true;
  isValidateDisabled = true;
  isResetDisabled = true;
  newFormula = [];
  oldRule: any;
  indexTrack = 0;
  highLightindex: any;
  newFormulaObject = new FormulaObj();
  existingRule: string;
  rule = new Rule();
  isRuleAddDisabled: boolean =true;
  configValues: any[]= [];


  constructor(private apiService: ApiService,
    private apiConfigService: ApiConfigService,
    private spinner: NgxSpinnerService,
    private snackbar: XpoSnackBar,
    private cdr: ChangeDetectorRef,
    public appErrService: AppErrorService,
    public masterPageService: MasterPageService,
    public appService: AppService) {
    //emitting hide spinner
    this.emitHideSpinner = this.masterPageService.emitHideSpinner.subscribe(spinnerFlag => {
      if (!checkNullorUndefined(spinnerFlag) && spinnerFlag) {
        this.loadControlData();
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
      this.appConfig = JSON.parse(localStorage.getItem(StorageData.appConfig));
      localStorage.setItem(StorageData.module, this.operationObj.Module);
      this.appErrService.appMessage();
    }
  }

  //generate Attribute ID
  generateAttributeID() {
    this.spinner.show();
    this.appErrService.clearAlert();
    this.attribute.ATTRIBUTEID = '';
    let requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join("/", this.apiConfigService.generateAttributeID);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let result = response.body;
        this.spinner.hide();
        if (!checkNullorUndefined(result) && result.Status === StatusCodes.pass) {
          if (!checkNullorUndefined(result.Response) && !checkNullorUndefined(result.Response.attributeID)) {
            this.attribute.ATTRIBUTEID = result.Response.attributeID;
            this.isAttributeResetBtnDisabled = false;
            this.isAttributeIDDisabled = true;
            this.isGenerateAttributeIDBtnDisabled = true;
            this.isAttributeIDGenerated = true;
            this.isDescriptionDisabled = false;
            this.isAttributeSearchBtnDisabled = true;
            this.attribute.ATTRIBUTE_NAME = '';
            this.isObjectDisabled = false;
            this.attributeNameFocus();
          }
        }
        else if (!checkNullorUndefined(result) && result.Status == StatusCodes.fail) {
          this.isAttributeIDGenerated = false;
          this.attribute.ATTRIBUTEID = '';
          this.spinner.hide();
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });

  }

  //on input of Attribute ID
  changeAttributeIDInput() {
    this.isAttributeSearchBtnDisabled = false;
    this.isAttributeResetBtnDisabled = false;
  }

  //on input of Attribute Name
  changeAttributeNameInput() {
    if(!this.isAttributeIDGenerated){
      this.isAttributeSearchBtnDisabled = false;
    }
    this.isAttributeResetBtnDisabled = false;
  }

  //on input change of attribute type
  changeAttributeType(val){
    this.attribute.ATTRIBUTETYPE = val;
    this.isAttributeSearchBtnDisabled = false;
    this.isAttributeResetBtnDisabled = false;
    this.attributeIDFocus();
  }

  //calling when Attribute ID input is Empty
  isAttributeIDInputValueEmpty() {
    if(this.attribute.ATTRIBUTE_NAME == ''){
      this.isAttributeResetBtnDisabled = true;
      this.isAttributeSearchBtnDisabled = true;
    }
  }

  //calling when Attribute Name input is Empty
  isAttributeNameInputValueEmpty() {
    if(this.attribute.ATTRIBUTEID == ''){
      this.isAttributeResetBtnDisabled = true;
      this.isAttributeSearchBtnDisabled = true;
    }
  }

  onAttributeActiveChange(value) {
    this.attribute.ACTIVE = value ? CommonEnum.yes : CommonEnum.no;
  }

  //attributeTypeFocus
  attributeTypeFocus() {
    this.appService.setFocus('attributeType');
  }

  //attributeIDFocus
  attributeIDFocus() {
    this.appService.setFocus('attributeID');
  }

  //attributeNameFocus
  attributeNameFocus() {
    this.appService.setFocus('attributeName');
  }

  //descriptionFocus
  descriptionFocus() {
    this.appService.setFocus('description');
  }

  changeDescriptionInput() {
    this.isAttributeResetBtnDisabled = false;
  }

   //loadControlData
   loadControlData() {
    this.spinner.show();
    this.configValues = [];
    let requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.loadControlData, CommonEnum.attributeTypes, CommonEnum.attributes);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let result = response.body;
        if (!checkNullorUndefined(result) && result.Status === StatusCodes.pass) {
          if (!checkNullorUndefined(result.Response) && result.Response.length) {
            result.Response.forEach((element) => {
              let dd: dropdown = new dropdown();
              dd.Id = element.Id;
              dd.Text = element.Text;
              this.configValues.push(dd);
            });
            if (this.configValues.length == 1) {
              this.attribute.ATTRIBUTETYPE = this.configValues[0].Text;
              this.isAttributeTypeDisabled = true;
              this.attributeIDFocus();
            } else {
              this.attributeTypeFocus();
            }
          }
        this.getLogicalOperators();
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

  //search for Attribute List
  getAttributeList() {
    this.spinner.show();
    this.appErrService.clearAlert();
    let searchObject = { ATTRIBUTEID: this.attribute.ATTRIBUTEID, ATTRIBUTE_NAME: this.attribute.ATTRIBUTE_NAME, ATTRIBUTETYPE: this.attribute.ATTRIBUTETYPE }
    let requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_ATTRIBUTE: searchObject };
    const url = String.Join("/", this.apiConfigService.getAttributeList);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let result = response.body;
        this.spinner.hide();
        if (!checkNullorUndefined(result) && result.Status === StatusCodes.pass) {
          if (!checkNullorUndefined(result.Response)) {
            if (!checkNullorUndefined(result.Response.attributeList) && result.Response.attributeList.length > 0) {
              this.onProcessAttributeJsonGrid(result.Response.attributeList);
              this.isAttributeResetBtnDisabled = false;
            }
          }
        }
        else if (!checkNullorUndefined(result) && result.Status === StatusCodes.fail) {
          this.spinner.hide();
          this.attributeList = null;
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }

  //onProcessAttributeJsonGrid
  onProcessAttributeJsonGrid(Response: Attribute[]) {
    if (!checkNullorUndefined(Response)) {
      this.tempAttributeList = [];
      let headingsArray = Object.keys(Response[0]);
      Response.forEach(res => {
        let element: Attribute = new Attribute();
        headingsArray.forEach(singleAttributeInfo => {
          element[singleAttributeInfo] = res[singleAttributeInfo];
        })
        this.tempAttributeList.push(element);
      });
    }
    this.grid = new Grid();
    this.grid.EditVisible = true;
    this.attributeList = this.appService.onGenerateJson(this.tempAttributeList, this.grid);
  }

  //add or update Attribute
  addOrUpdateAttribute() {
    this.attribute.RULE = '';
    for (let f = 0; f < this.newFormula.length; f++) {
      let newRuleFormula = this.newFormula[f]['formula'];
      if (this.attribute.RULE == "") {
        this.attribute.RULE = newRuleFormula;
      }
      else {
        if (this.newFormula[f]['appendWith'] != "") {
          this.attribute.RULE = this.attribute.RULE.concat(" ", this.newFormula[f]['appendWith'], " ", newRuleFormula);
        }
      }
    }
    this.appErrService.clearAlert();
    this.spinner.show();
    let requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_ATTRIBUTE: this.attribute };
    let url;
    if (this.attributeBtnName == this.commonButton.add) {
      url = String.Join("/", this.apiConfigService.addAttribute);
    } else if (this.attributeBtnName == this.commonButton.save) {
      if (this.appService.IsObjectsMatch(this.attribute, this.tempAttribute)) {
        this.snackbar.info(this.appService.getErrorText('2660043'));
        this.spinner.hide();
        return;
      }
      url = String.Join("/", this.apiConfigService.updateAttribute);
    }
    this.isEnableAddOrSave = true;
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let result = response.body;
        this.spinner.hide();
        if (!checkNullorUndefined(result) && result.Status === StatusCodes.pass) {
          if(!checkNullorUndefined(result.Response)){
            this.onProcessAttributeJsonGrid(result.Response);
            this.isEditAttributeMode = false;
            this.clearAttribute();
            this.isAttributeResetBtnDisabled = false;
          }
          if (!checkNullorUndefined(result.StatusMessage)) {
            this.snackbar.success(result.StatusMessage);
          }
        }
        else if (!checkNullorUndefined(result) && result.Status === StatusCodes.fail) {
          this.isEnableAddOrSave = false;
          this.attributeList = null;
          this.spinner.hide();
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }

  //on edit of attribute
  editAttribute(event) {
    this.appErrService.clearAlert();
    this.attribute = new Attribute();
    this.tempAttribute = new Attribute();
    this.attribute = Object.assign(this.attribute, event);
    this.tempAttribute = Object.assign(this.tempAttribute, event);
    this.isAttributeIDGenerated = true;
    this.attributeBtnName = this.commonButton.save;
    this.isEnableAddOrSave = false;
    this.isAttributeTypeDisabled = true;
    this.isAttributeIDDisabled = true;
    this.isDescriptionDisabled = false;
    this.isGenerateAttributeIDBtnDisabled = true;
    this.isAttributeNameDisabled = true;
    this.isAttributeSearchBtnDisabled = true;
    this.isEditAttributeMode = true;
    this.newFormula= [];
    if(event.RULE != ""){
      this.newFormulaObject['formula'] = event.RULE;
      this.addFieldValue();
    }else if (event.RULE == ''){
      this.isLogicalOperatorDisabled = true;
      this.isObjectDisabled = false;
    }
    this.isValidateDisabled = true;
    this.highLightindex = undefined;
  }

  //clearing attribute
  clearAttribute() {
    this.attribute = new Attribute();
    this.tempAttribute = new Attribute();
    this.newFormula = [];
    this.isValidateDisabled = true;
    this.isAttributeSearchBtnDisabled = true;
    this.isAttributeIDGenerated = false;
    this.isGenerateAttributeIDBtnDisabled = false;
    this.isAttributeNameDisabled = false;
    this.isAttributeTypeDisabled = false;
    this.isAttributeIDDisabled = false;
    this.isDescriptionDisabled= true;
    this.isObjectDisabled = true;
    this.isLogicalOperatorDisabled = true;
    this.isEnableAddOrSave = true;
    this.appErrService.clearAlert();
    if (this.configValues.length == 1) {
      this.attribute.ATTRIBUTETYPE = this.configValues[0].Text;
      this.isAttributeTypeDisabled = true;
      this.attributeIDFocus();
    } else {
      this.attributeTypeFocus();
    }
  }

//reset attribute
  resetAttribute() {
    this.attribute = new Attribute();
    this.attributeList = null;
    this.tempAttributeList = null;
    this.attributeBtnName = this.commonButton.add;
    this.isAttributeResetBtnDisabled = true;
    this.resetRuleSetup();
    this.clearAttribute();
  }

  //RULE SETUP METHODS

  //getOperators
  getOperators() {
    let requestObj = { ClientData: this.clientData, UIData: this.uiData };
    this.apiService.apiPostRequest(this.apiConfigService.getOperatorsUrl, requestObj)
      .subscribe(response => {
        let res = response.body;
        this.spinner.hide();
        if (!checkNullorUndefined(res) && res.Status === StatusCodes.pass) {
          if (!checkNullorUndefined(res.Response)) {
            this.operatorOptions = [];
            res.Response.forEach((element) => {
              let dd: dropdown = new dropdown();
              dd.Id = element;
              dd.Text = element;
              this.operatorOptions.push(dd);
            });
          }
        } else if (!checkNullorUndefined(res) && res.Status === StatusCodes.fail) {
         this.spinner.hide();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, error => {
        this.appErrService.handleAppError(error);
      });
  }

  //getObjects
  getObjects() {
    let requestObj = { ClientData: this.clientData, UIData: this.uiData };
    this.apiService.apiPostRequest(this.apiConfigService.getObjectsUrl, requestObj)
      .subscribe(response => {
        let res = response.body;
        if (!checkNullorUndefined(res) && res.Status === StatusCodes.pass) {
          if (!checkNullorUndefined(res.Response)) {
            this.objectOptions = [];
            res.Response.forEach((element) => {
              let dd: dropdown = new dropdown();
              dd.Id = element;
              dd.Text = element;
              this.objectOptions.push(dd);
            });
          }
          this.getOperators();
        } else if (!checkNullorUndefined(res) && res.Status === StatusCodes.fail) {
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
    this.apiService.apiPostRequest(this.apiConfigService.getLogicalOperatorsUrl, requestObj)
      .subscribe(response => {
        let res = response.body;
        if (!checkNullorUndefined(res) && res.Status === StatusCodes.pass) {
          if (!checkNullorUndefined(res.Response)) {
            this.logicaloperatorOptions = [];
            res.Response.forEach((element) => {
              let dd: dropdown = new dropdown();
              dd.Id = element;
              dd.Text = element;
              this.logicaloperatorOptions.push(dd);
            });
            this.getObjects();
          }
        }
        else if (!checkNullorUndefined(res) && res.Status === StatusCodes.fail) {
          this.spinner.hide();

          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, error => {
        this.appErrService.handleAppError(error);
      });
  }

  //getProperties
  getProperties() {
    this.spinner.show();
    if (this.objectSelected != "") {
      let requestObj = { ClientData: this.clientData, UIData: this.uiData };
      const getPropertiesUrl = String.Join("/", this.apiConfigService.getPropertiesUrl, this.objectSelected);
      this.apiService.apiPostRequest(getPropertiesUrl, requestObj)
        .subscribe(response => {
          let res = response.body;
          this.spinner.hide();
          if (!checkNullorUndefined(res) && res.Status === StatusCodes.pass) {
            if (!checkNullorUndefined(res.Response)) {
              this.propertyOptions = [];
              this.isPropertydisabled = false;
              this.isObjectDisabled = true;
              res.Response.forEach((element) => {
                let dd: dropdown = new dropdown();
                dd.Id = element;
                dd.Text = element;
                this.propertyOptions.push(dd);
              });
              this.propertyDropdownFocus();
            }
          } else if (!checkNullorUndefined(res) && res.Status === StatusCodes.fail) {
            this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          }
        }, error => {
          this.appErrService.handleAppError(error);
        });
    }
  }


  //logicaloperatorFocus
  logicaloperatorFocus() {
    this.appService.setFocus('logicaloperator');
  }

  //objectDropdownFocus
  objectDropdownFocus() {
    this.appService.setFocus('objectDropdown');
  }

  //propertyDropdownFocus
  propertyDropdownFocus() {
    this.appService.setFocus('propertyDropdown');
  }

  //operatorDropdownFocus
  operatorDropdownFocus() {
    this.appService.setFocus('operatorDropdown');
  }

  //ruleValueFocus
  ruleValueFocus() {
    this.appService.setFocus('ruleValue');
  }

  //on logical operator dropdown change
  onLogicalOperatorChange(event) {
    this.selectedLogicalOperator = event;
    this.newFormulaObject['appendWith'] = event;
    this.isResetDisabled = false;
    if(!this.objectSelected){
      this.isObjectDisabled = false;
    }
    this.isEnableAddOrSave = true;
    this.objectDropdownFocus();
    this.isValidateDisabled= true;
  }

  //on change of object dropdown
  onObjectDropdownChange(event) {
    this.ruleSectionObjectChangeClear();
    this.newFormulaObject['formula'] = this.newFormulaObject['formula'].concat(event);
    this.oldRule = this.newFormulaObject['formula'];
    this.objectSelected = event;
    this.isResetDisabled = false;
    this.getProperties();
    this.cdr.detectChanges();
  }

  //onPropertyDropdownChange
  onPropertyDropdownChange(event) {
    this.newFormulaObject['formula'] = String.Join('.', this.newFormulaObject['formula'], event);
    this.oldRule = this.newFormulaObject['formula'];
    this.isPropertydisabled = true;
    this.propertySelected = event;
    this.isOperatorDisabled = false;
    this.operatorDropdownFocus();
  }

  //on operator change dropdown
  onOperatorChange(event) {
    this.selectedOperator = event;
    this.newFormulaObject['formula'] = this.newFormulaObject['formula'].concat(event);
    this.oldRule = this.newFormulaObject['formula']
    this.isRuleValueDisabled = false;
    this.isOperatorDisabled = true;
    this.ruleValueFocus();
  }

  //on input of rule
  ruleInput(value) {
    this.newFormulaObject['formula'] = this.oldRule;
    this.newFormulaObject['formula'] = this.newFormulaObject['formula'].concat(value);
    this.isRuleAddDisabled = false;
    if(value == ''){
      this.isRuleAddDisabled = true;
    }
  }

  addRule(valid) {
    if (this.ruleValue !== "") {
      this.isRuleValueDisabled = true;
    }
    if (valid) {
        this.addFieldValue();
        this.isLogicalOperatorDisabled = false;
        this.isLogicalOperatorRequired = true;
    }
    this.isRuleAddDisabled = true;
    this.logicaloperatorFocus();
  }

  deleteFieldValue(index) {
    this.appErrService.clearAlert();
    this.newFormula.splice(index, 1);
    if (this.newFormula.length > 0) {
      this.newFormula[0]['appendWith'] = '';
    } else if (this.newFormula.length == 0) {
      this.isLogicalOperatorDisabled = true;
      this.isObjectDisabled = false;
      this.isValidateDisabled = true;
      this.isEnableAddOrSave = true;
    }
    if (index == this.highLightindex) {
      this.highLightindex = undefined;
    } else if (index < this.highLightindex) {
      this.highLightindex--;
    }
    this.resetRuleSetup();
  }


  //resetRuleSetup on reset click
  resetRuleSetup() {
    this.oldRule = null;
    this.newFormulaObject = new FormulaObj();
    this.isResetDisabled = true;
    this.clearRuleSetup();
    this.isRuleAddDisabled = true;
  }

  //clearRuleSetup -- on validaterule / after creating rule we are calling
  clearRuleSetup() {
    this.objectSelected = "";
    this.selectedLogicalOperator = "";
    this.isRuleValueDisabled= true;
    if(!checkNullorUndefined(this.newFormula) && !checkNullorUndefined(this.newFormula.length)){
      if (this.newFormula.length > 0) {
        this.isLogicalOperatorDisabled = false;
        this.isObjectDisabled = true;
      } else if (this.newFormula.length == 0) {
        this.isLogicalOperatorDisabled = true;
        this.isObjectDisabled = false;
      }
    }
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

  //validateRule
  validateRule() {
    this.highLightindex = undefined;
    this.spinner.show();
    this.rule.RuleSetUp = this.newFormula[this.indexTrack].formula;
    let requestObj = { ClientData: this.clientData, UIData: this.uiData, Rule: this.rule };
    this.apiService.apiPostRequest(this.apiConfigService.validateRuleUrl, requestObj)
      .subscribe(response => {
        let res = response.body;
        this.spinner.hide();
        if (!checkNullorUndefined(res) && res.Status === StatusCodes.pass) {
          if (!checkNullorUndefined(res.Response)) {
            this.indexTrack++
            if (this.indexTrack < this.newFormula.length) {
              this.validateRule();

            } else {
              this.indexTrack = 0;
              this.isEnableAddOrSave = false;
              this.snackbar.success(res.Response);
              this.resetRuleSetup();
            }
          }
        } else if (!checkNullorUndefined(res) && res.Status === StatusCodes.fail) {
          this.isEnableAddOrSave = true;
          this.highLightindex = this.indexTrack;
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          this.indexTrack = 0;
          this.resetRuleSetup();
        }
      }, error => {
        this.appErrService.handleAppError(error);
      });
  }



  addFieldValue() {
    this.newFormula.push(this.newFormulaObject);
    this.resetRuleSetup();
    this.isValidateDisabled = false;
  }


  ngOnDestroy() {
      this.emitHideSpinner.unsubscribe();
      this.masterPageService.defaultProperties();
  }

}
