import { DropDownSettings } from './../../models/common/dropDown.config';
import { AutoFailConfig } from './../../models/maintenance/auto-fail-config/autoFailConfig';
import { MasterPageService } from './../../utilities/rlcutl/master-page.service';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ApiConfigService } from '../../utilities/rlcutl/api-config.service';
import { ApiService } from '../../utilities/rlcutl/api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';
import { AppService } from '../../utilities/rlcutl/app.service';
import { CommonEnum } from '../../enums/common.enum';
import { UiData } from '../../models/common/UiData';
import { ClientData } from '../../models/common/ClientData';
import { StorageData } from '../../enums/storage.enum';
import { String } from 'typescript-string-operations';
import { StatusCodes } from '../../enums/status.enum';
import { dropdown } from '../../models/common/Dropdown';
import { CommonService } from '../../services/common.service';
import { Grid } from '../../models/common/Grid';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { RuleSetupComponent } from '../../framework/busctl/rule-setup/rule-setup.component';
import { Subscription } from 'rxjs-compat';


@Component({
  selector: 'app-auto-fail-config',
  templateUrl: './auto-fail-config.component.html',
  styleUrls: ['./auto-fail-config.component.css']
})
export class AutoFailConfigComponent implements OnInit, OnDestroy {

  @ViewChild(RuleSetupComponent) ruleSetupChild: RuleSetupComponent;

  // common props
  uiData = new UiData();
  clientData = new ClientData();
  commonButton = CommonEnum;

  grid: Grid;

  // serach props
  isSearchBtnDisabled = true;

  // reset props
  isResetBtnDisabled = false;

  // add props
  isValidateAddBtnFlag = true;
  btnName = CommonEnum.add;

  // model props
  autoFailConfig = new AutoFailConfig();  
  tempAutoFailConfig = new AutoFailConfig();

  autoFailList: any;
  tempAutoFailList: AutoFailConfig[] = [];

  // PROGRAM NAME PROPS
  programNamesList: any[] = [];
  isProgramNameDisabled = false;
  programIndicatorsList: any[] = [];
  conditionCodesList: any[] = [];
  oemCodesList: any[] = [];
  oemModels: any[] = [];
  triggerLevels: any[] = [];
  loadIvcCodes: any[] = [];
  triggerAttr: any[] = [];
  ivcCategory: any[] = [];
  transId: any[] = [];
  rankNumberPattern: any;
  rankPattern:any;

  ruleSetupObject: any;
  editruleSetup: any;
  attributeRouteConfig: any;

  isTransIDDisable = true;
  dropdownSettings = new DropDownSettings();

  categoryPropertySelectedItem: any = []; 
  emitHideSpinner: Subscription; 

  constructor(
    public masterPageService: MasterPageService,
    private apiService: ApiService,
    private apiConfigService: ApiConfigService,
    private spinner: NgxSpinnerService,
    private snackbar: XpoSnackBar,
    public appErrService: AppErrorService,
    public appService: AppService,
    private http: HttpClient,
    private commonService: CommonService
  ) {
    const pattern = JSON.parse(localStorage.getItem(StorageData.patternList));
    if (!this.appService.checkNullOrUndefined(pattern)) {
      this.rankPattern = new RegExp(pattern.rankPattern9999);
    }

    // emitting hide spinner
    this.emitHideSpinner = this.masterPageService.emitHideSpinner.subscribe(spinnerFlag => {
      if (!this.appService.checkNullOrUndefined(spinnerFlag) && spinnerFlag) {
        this.getOemCodes();
      }
    });

   }

  ngOnInit() {
    const operationObj = this.masterPageService.getRouteOperation();
    if (operationObj) {
      this.uiData.OperationId = operationObj.OperationId;
      this.uiData.OperCategory = operationObj.Category;
      this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
      // setting value to hidespinner (based on this value we are emiting emithidespinner method)
      this.getAttributeRouteConfig();
      this.masterPageService.hideSpinner = true;
      this.masterPageService.setTitle(operationObj.Title);
      this.masterPageService.setModule(operationObj.Module);                              
      this.dropdownSettings = new DropDownSettings();
      this.dropdownSettings.idField = CommonEnum.Id;
      this.dropdownSettings.textField = CommonEnum.Text;
      this.autoFailConfig.ACTIVE = CommonEnum.yes;
      this.appService.setFocus('oemCode');
    }
  }

  // getProgramName
  getProgramNames() {
    this.programNamesList = [];
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getProgramNames);
    this.commonService.commonApiCall(url, requestObj, (result, statusFlag) => {
      this.getProgramIndicators();
      if (statusFlag && !this.appService.checkNullOrUndefined(result.Response) && result.Response.ProgramNameList && result.Response.ProgramNameList.length) {
        result.Response.ProgramNameList.forEach((element) => {
          const dd: dropdown = new dropdown();
          dd.Id = element.Text;
          dd.Text = element.Text;
          this.programNamesList.push(dd);
        });
      }
    });
  }

  // get program indicators
  getProgramIndicators() {
    this.programIndicatorsList = [];
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.loadControlData, CommonEnum.autoFailLater,
      CommonEnum.programIndicator);
    this.commonService.commonApiCall(url, requestObj, (result, statusFlag) => {
      this.getConditionCodes();
      if (statusFlag && !this.appService.checkNullOrUndefined(result.Response) && result.Response.length) {
        result.Response.forEach((element) => {
          const dd: dropdown = new dropdown();
          dd.Id = element.Id;
          dd.Text = element.Text;
          this.programIndicatorsList.push(dd);
        });
      }
    });
  }

  // get condition codes
  getConditionCodes() {
    this.conditionCodesList = [];
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.loadControlData, CommonEnum.autoFailLater,
      CommonEnum.conditionCode);
    this.commonService.commonApiCall(url, requestObj, (result, statusFlag) => {
      this.getTriggerLevels();      
      if (statusFlag && !this.appService.checkNullOrUndefined(result.Response) && result.Response.length) {
        result.Response.forEach((element) => {
          const dd: dropdown = new dropdown();
          dd.Id = element.Id;
          dd.Text = element.Text;
          this.conditionCodesList.push(dd);
        });
      }
    });
  }

  // get oem codes
  getOemCodes() {
    this.oemCodesList = [];
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getGetOEMcodesUrl);
    this.commonService.commonApiCall(url, requestObj, (result, statusFlag) => {
      this.getProgramNames();      
      if (statusFlag && !this.appService.checkNullOrUndefined(result.Response) && result.Response.length) {
        result.Response.forEach((element) => {
          const dd: dropdown = new dropdown();
          dd.Id = element.Id;
          dd.Text = element.Text;
          this.oemCodesList.push(dd);
        });
      }
    });    
  }


  //get oem codes
  getOemModels(event) {
    this.oemModels = [];
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getGetOEMModelsUrl, event);
    this.commonService.commonApiCall(url, requestObj, (result, statusFlag) => {
      this.spinner.hide();
      if (statusFlag && !this.appService.checkNullOrUndefined(result.Response) && result.Response.length) {
        result.Response.forEach((element) => {
          const dd: dropdown = new dropdown();
          dd.Id = element.Id;
          dd.Text = element.Text;
          this.oemModels.push(dd);
        });
      }
    });
  }

  // get Trigger Levels
  getTriggerLevels() {
    this.triggerLevels = [];
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getTriggerLevelsUrl);
    this.commonService.commonApiCall(url, requestObj, (result, statusFlag) => {
      this.getLoadIvcCodes();     
      if (statusFlag && !this.appService.checkNullOrUndefined(result.Response) && result.Response.length) {
        result.Response.forEach((element) => {
          const dd: dropdown = new dropdown();
          dd.Id = element.Id;
          dd.Text = element.Text;
          this.triggerLevels.push(dd);
        });
      }
    });
  }

  // get Trans Td
  getTransId(event) {
    this.transId = [];
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getTransIdUrl, event);
    this.commonService.commonApiCall(url, requestObj, (result, statusFlag) => {
      this.spinner.hide();
      if (statusFlag && !this.appService.checkNullOrUndefined(result.Response) && result.Response.length) {
        result.Response.forEach((element) => {
          const dd: dropdown = new dropdown();
          dd.Id = element.Id;
          dd.Text = element.Id + '-' + element.Text;
          this.transId.push(dd);
        });
      }
    });
  }

  // get Trigger Levels
  getIvcCategory() {
    this.ivcCategory = [];
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getLoadIVCCategory);
    this.commonService.commonApiCall(url, requestObj, (result, statusFlag) => {
      this.spinner.hide();
      if (statusFlag && !this.appService.checkNullOrUndefined(result.Response) && result.Response.length) {
        this.ivcCategory = result.Response;
      }
    });
  }

  // get oem codes
  getLoadIvcCodes() {
    this.loadIvcCodes = [];
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getLoadIvcCodesUrl);
    this.commonService.commonApiCall(url, requestObj, (result, statusFlag) => {
      this.spinner.hide();
      //this.getIvcCategory();      
      if (statusFlag && !this.appService.checkNullOrUndefined(result.Response) && result.Response.length) {
        result.Response.forEach((element) => {
          const dd: dropdown = new dropdown();
          dd.Id = element.Id;
          dd.Text = element.Text;
          this.loadIvcCodes.push(dd);
        });
      }
    });
  }

  // get Trigger Attr
  getTriggerAttr(event) {
    this.triggerAttr = [];
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getTriggerAttrUrl, event);
    this.commonService.commonApiCall(url, requestObj, (result, statusFlag) => {
      this.spinner.hide();
      if (statusFlag && !this.appService.checkNullOrUndefined(result.Response) && result.Response.length) {
        if (event == "1" || event == "5") {
          result.Response.forEach((element) => {
            const dd: dropdown = new dropdown();
            dd.Id = element.Id;
            dd.Text = element.Text;
            this.triggerAttr.push(dd);
          });
        }
        else {
          result.Response.forEach((element) => {
            const dd: dropdown = new dropdown();
            dd.Id = element.Id;
            dd.Text = element.Id + '-' + element.Text;
            this.triggerAttr.push(dd);
          });
        }
      }
    });
  }



  // clear auto fail config
  clearAutofail() {        
    this.categoryPropertySelectedItem = [];
    this.transId = [];
    this.autoFailList = null;
    //this.tempAutoFailList = null;
    this.isTransIDDisable = true;
    this.btnName = this.commonButton.add;
    this.isSearchBtnDisabled = true;
    this.isResetBtnDisabled = true;
    this.isValidateAddBtnFlag = true;
    this.ivcCategory = [];
    this.appErrService.clearAlert();
    this.ruleSetupChild.resetRuleSetupFromParent();    
    this.editruleSetup = null;
    this.autoFailConfig = new AutoFailConfig();  
    this.tempAutoFailConfig = new AutoFailConfig();
    this.appService.setFocus('oemCode');
  };


  // on change program indicator drowpdown
  changeProgramIndicator(event) {
    this.appErrService.clearAlert();
    this.autoFailConfig.PROGRAM_INDICATOR = event;
  }

  // on change condition code dropdown
  changeConditionCode(event) {
    this.appErrService.clearAlert();
    this.autoFailConfig.CONDITION_CD = event;
  }

  // on change oem code dropdown
  changeOemCode(event) {
    this.appErrService.clearAlert();
  }

  // on change oem code dropdown
  changeOemModels(event) {
    this.appErrService.clearAlert();
  }



  // on change Trigger Attr dropdown
  changeLoadIvcCodes(event) {
    this.appErrService.clearAlert();
    this.autoFailConfig.IVCCODE = event;
  }

  // on change Trigger Attr dropdown
  changeTriggerAttr(event) {
    this.appErrService.clearAlert();
    this.autoFailConfig.TRIGGER_ATTR = event;
  }

  // on change Ivc Category dropdown
  changeIvcCategoryOverride(event) {
    this.appErrService.clearAlert();
    this.autoFailConfig.IVC_CATEGORY_OVERRIDE = event;
  }

  // on change Trans ID dropdown
  changeTransId(event) {
    this.appErrService.clearAlert();
    this.autoFailConfig.AUTOFAIL_TRANSID = event;
  }

  // on change active toggle
  onActiveChange(val) {
    this.autoFailConfig.ACTIVE = val ? 'Y' : 'N';
  }

  onPropertyDropdownChange(event) {
    this.autoFailConfig.OEM_CD = event;
    this.getOemModels(event);
    this.ruleSetupChild.resetRuleSetupFromParent();
    this.ruleSetupChild.enableAttribute(true);

  }
  changeProgramName(event) {
    this.autoFailConfig.PROGRAM_NAME = event;
  }
  changeOemModel(event) {
    this.appErrService.clearAlert();
    this.autoFailConfig.MODEL = event;
  }

  changeTriggerLevels(event) {
    this.autoFailConfig.TRIGGER_LEVEL = event;
    this.isTransIDDisable = true;
    this.getTriggerAttr(event);
    this.transId = [];
    this.categoryPropertySelectedItem = [];
    if (event == "1" || event == "5") {
      this.isTransIDDisable = false;
      this.getIvcCategory(); 
      this.autoFailConfig.IVC_CATEGORY_OVERRIDE = null;
      this.getTransId(event);
    }
  }


  getAutoFailList() {
    this.autoFailList = null;
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_VZW_SN_AUTO_FAIL: this.autoFailConfig };
    const url = String.Join('/', this.apiConfigService.getAutoFailList);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        this.grid = new Grid();
        this.grid.EditVisible = true;
        this.tempAutoFailList = [];
        this.tempAutoFailList = res.Response.AutoFailRecords;
        this.autoFailList = this.appService.onGenerateJson(res.Response.AutoFailRecords, this.grid);
      } 
    });
  }

  // on click edit buttton
  editAutoFail(event) {
    this.appErrService.clearAlert();
    this.setAutoFailProperties(event);
    this.autoFailConfig = new AutoFailConfig();
    this.autoFailConfig = Object.assign(this.autoFailConfig, this.tempAutoFailConfig);
    this.editruleSetup = event.FORMULA;
    this.categoryPropertySelectedItem = (event.hasOwnProperty("IVC_CATEGORY_OVERRIDE") && event.IVC_CATEGORY_OVERRIDE !== null) 
    ? event.IVC_CATEGORY_OVERRIDE.split(',') : null;
    this.btnName = this.commonButton.save;
    this.isSearchBtnDisabled = true;
    this.isValidateAddBtnFlag = false;
  }

  // create temp object bind data to grid
  setAutoFailProperties(event) {
    if (!this.appService.checkNullOrUndefined(event)) {
      this.changeTriggerLevels(event.TRIGGER_LEVEL);
      this.tempAutoFailConfig = new AutoFailConfig();
      this.tempAutoFailConfig.OEM_CD = event.OEM_CD;
      this.tempAutoFailConfig.MODEL = event.MODEL;
      this.tempAutoFailConfig.PROGRAM_NAME = event.PROGRAM_NAME;
      this.tempAutoFailConfig.PROGRAM_INDICATOR = event.PROGRAM_INDICATOR;
      this.tempAutoFailConfig.CONDITION_CD = event.CONDITION_CD;
      this.tempAutoFailConfig.TRIGGER_LEVEL = event.TRIGGER_LEVEL;
      this.tempAutoFailConfig.TRIGGER_ATTR = event.TRIGGER_ATTR;
      this.tempAutoFailConfig.ACTIVE = event.ACTIVE;
      this.tempAutoFailConfig.RANK = event.RANK;
      this.tempAutoFailConfig.AUTOFAIL_TRANSID = event.AUTOFAIL_TRANSID;
      this.tempAutoFailConfig.IVCCODE = event.IVCCODE;
      this.tempAutoFailConfig.IVC_CATEGORY_OVERRIDE = event.IVC_CATEGORY_OVERRIDE;
      this.tempAutoFailConfig.ADDWHO = event.ADDWHO;
      this.tempAutoFailConfig.EDITTS = event.EDITTS;
      this.tempAutoFailConfig.EDITTS = event.EDITTS;
      this.tempAutoFailConfig.SITEID = event.SITEID;
      this.tempAutoFailConfig.CLIENTID = event.CLIENTID;
      this.tempAutoFailConfig.SEQID = event.SEQID;
    }
  }

  // for adding or updating Auto Fail
  addOrUpdateAutoFail() {    
    this.autoFailConfig.IVC_CATEGORY_OVERRIDE = this.getCategoryValues().toString();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_VZW_SN_AUTO_FAIL: this.autoFailConfig };
    let url;    
    if (this.btnName === this.commonButton.add) {

      url = String.Join('/', this.apiConfigService.addOrUpdateAutoFail);
    } else if (this.btnName === this.commonButton.save) {
      if (this.appService.IsObjectsMatch(this.autoFailConfig, this.tempAutoFailConfig)) {
        this.snackbar.info(this.appService.getErrorText('2660043'));
        this.spinner.hide();
        return;
      }
      url = String.Join('/', this.apiConfigService.addOrUpdateAutoFail);
    }
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {              
        this.spinner.hide();
        if (statusFlag) {
          this.clearAutofail();         

            if (this.btnName === this.commonButton.save) {
              const index = this.tempAutoFailList.findIndex(x => x.SEQID === res.Response.SNAutoFail.SEQID);
              this.tempAutoFailList.splice(index, 1);

            }            
            this.tempAutoFailList.push(res.Response.SNAutoFail);
            this.grid = new Grid();
            this.grid.EditVisible = true;
            this.autoFailList = this.appService.onGenerateJson(this.tempAutoFailList, this.grid);            
            this.isResetBtnDisabled = false;          
          if (!this.appService.checkNullOrUndefined(res.StatusMessage)) {
            this.snackbar.success(res.StatusMessage);
          }
        }
      });
    this.isValidateAddBtnFlag = true;      
  }

  // getAttributeRouteConfig
  getAttributeRouteConfig() {
    this.http.get('./assets/attributeRouteConfig.json').subscribe((res) => {
      this.attributeRouteConfig = res;
      this.ruleSetupObject = {
        clientData: this.clientData,
        uiData: this.uiData,
        attributeRoutingJson: this.attributeRouteConfig
      };
    },
      (error: HttpErrorResponse) => {
        this.snackbar.error('Failed to load Attribute Config data');
      });
  }

  // rule setup emit event to enable or disable add button and to assign rule
  emitEnableAddOrSave(event) {
    if (this.appService.checkNullOrUndefined(event)) {
      this.editruleSetup = null;
      this.isValidateAddBtnFlag = true;
    } else {
      this.autoFailConfig.FORMULA = event.Formula;
      if (event.ValidatedFormula) {        
        this.isValidateAddBtnFlag = false;
      } else {
        this.isValidateAddBtnFlag = true;
      }
    }
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

  ngOnDestroy() {
    this.masterPageService.defaultProperties();
    this.emitHideSpinner.unsubscribe();
  }

}
