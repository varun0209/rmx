import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
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
import { UiData } from '../../models/common/UiData';
import { StorageData } from '../../enums/storage.enum';
import { StatusCodes } from '../../enums/status.enum';
import { dropdown } from '../../models/common/Dropdown';
import { CommonEnum } from '../../enums/common.enum';
import { RuleSetupComponent } from '../../framework/busctl/rule-setup/rule-setup.component';
import { CommonService } from '../../services/common.service';
import { CalProcessingConfig } from '../../models/maintenance/call-processing-config/callProcessingConfig';
import { checkNullorUndefined } from '../../enums/nullorundefined';

@Component({
  selector: 'app-call-processing-config',
  templateUrl: './call-processing-config.component.html',
  styleUrls: ['./call-processing-config.component.css']
})
export class CallProcessingConfigComponent implements OnInit {
  @ViewChild(RuleSetupComponent) ruleSetupChild: RuleSetupComponent;
  commonButton = CommonEnum;

  operationObj: any;
  // Call Processing config properties
  isProcessNameDisabled = false;
  isOemModelsDisabled = false;
  isOemCodeDisabled = false;
  isInitialCallDisabled = false;
  isPostInitialScheduledDaysDisabled = false;
  isMaxDaysToCallDisabled = false;
  oemCodesList: any[] = [];
  oemModels: any[] = [];
  processNamesList: any[] = [];
  isExitOnlyCalToggleActive = false;
  isActiveToggle = false;
  isResetBtnDisabled = true;
  isSearchBtnDisabled = true;
  isValidateAddBtnFlag = true;
  btnName = this.commonButton.add;
  calProcessingConfigList: any;
  tempCalProcessingConfigList: any;
  initialCallNumberPattern: any;
  postInitialScheduledDaysNumberPattern: any;
  maxDaysToCallNumberPattern: any;

  ruleSetupObject: any;
  editruleSetup: any;
  attributeRouteConfig: any;

  clientData = new ClientData();
  uiData = new UiData();
  grid: Grid;
  calProcessingConfig = new CalProcessingConfig();
  tempCalProcessingConfig = new CalProcessingConfig();

  constructor(private apiService: ApiService,
    private apiConfigService: ApiConfigService,
    private spinner: NgxSpinnerService,
    private http: HttpClient,
    private snackbar: XpoSnackBar,
    public appErrService: AppErrorService,
    public masterPageService: MasterPageService,
    public appService: AppService,
    private commonService: CommonService) {
    const pattern = JSON.parse(localStorage.getItem(StorageData.patternList));
    if (!this.appService.checkNullOrUndefined(pattern)) {
      this.initialCallNumberPattern = new RegExp(pattern.initialCallPattern);
      this.maxDaysToCallNumberPattern = new RegExp(pattern.maxDaysToCallPattern);
      this.postInitialScheduledDaysNumberPattern = new RegExp(pattern.postInitialScheduledDaysPattern);
    }
  }

  ngOnInit() {
    this.operationObj = this.masterPageService.getRouteOperation();
    if (this.operationObj) {
      this.uiData.OperationId = this.operationObj.OperationId;
      this.uiData.OperCategory = this.operationObj.Category;
      this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
      this.masterPageService.setTitle(this.operationObj.Title);
      this.masterPageService.setModule(this.operationObj.Module);
      localStorage.setItem(StorageData.module, this.operationObj.Module);
      this.processNameFocus();
      this.getProcessName();
      this.getOemCodes();
      this.getProcessingConfig();
    }
  }

  /*Call Processing config Methods */
  // getProcessName
  getProcessName() {
    this.spinner.show();
    this.processNamesList = [];
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getProcessnames);
    this.commonService.commonApiCall(url, requestObj, (result, statusFlag) => {
      this.spinner.hide();
      if (statusFlag && !this.appService.checkNullOrUndefined(result.Response) &&
        result.Response.hasOwnProperty('Processnames') &&
        !this.appService.checkNullOrUndefined(result.Response.Processnames)) {
        result.Response.Processnames.forEach((element) => {
          const dd: dropdown = new dropdown();
          dd.Id = element.VALUE;
          dd.Text = element.VALUE;
          this.processNamesList.push(dd);
        });
        if (this.processNamesList.length == 1) {
          this.calProcessingConfig.PROCESS_NAME = this.processNamesList[0].Text;
          this.oemFocus();
        }
      }
    });
  }

  // getAttributeRouteConfig
  getProcessingConfig() {
    this.ruleSetupObject = null;
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

  // get oem codes
  getOemCodes() {
    this.oemCodesList = [];
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getGetOEMcodesUrl);
    this.commonService.commonApiCall(url, requestObj, (result, statusFlag) => {
      this.spinner.hide();
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

  // on search Call Processing config data
  getCallprocessingConfig() {
    this.spinner.show();
    this.appErrService.clearAlert();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_VZW_CALL_PROCESSING_CNFG: this.calProcessingConfig };
    const url = String.Join('/', this.apiConfigService.getCallprocessingConfig);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const result = response.body;
        this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
          if (!this.appService.checkNullOrUndefined(result.Response) && result.Response.CPCList.length > 0) {
            this.onProcessCalProcessingConfigJsonGrid(result.Response.CPCList);
            this.isResetBtnDisabled = false;
          }
        } else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
          this.spinner.hide();
          this.calProcessingConfigList = null;
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }

  // for adding or updating disposition engine config
  addOrUpdateCalProcessingConfig() {
    this.appErrService.clearAlert();
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_VZW_CALL_PROCESSING_CNFG: this.calProcessingConfig };
    let url;
    if (this.btnName === this.commonButton.add) {
      url = String.Join('/', this.apiConfigService.getAddCallprocessingConfig);
    } else if (this.btnName === this.commonButton.save) {
      if (this.appService.IsObjectsMatch(this.calProcessingConfig, this.tempCalProcessingConfig)) {
        this.snackbar.info(this.appService.getErrorText('2660043'));
        this.spinner.hide();
        return;
      }
      url = String.Join('/', this.apiConfigService.getUpdateCallprocessingConfig);
    }
    this.isValidateAddBtnFlag = true;
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const result = response.body;
        this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
          if (!this.appService.checkNullOrUndefined(result.Response) && result.Response.hasOwnProperty('lstCPCData') &&
            !this.appService.checkNullOrUndefined(result.Response.lstCPCData)) {
            this.clearCalProcessingConfig();
            this.onProcessCalProcessingConfigJsonGrid(result.Response.lstCPCData);
            this.isResetBtnDisabled = false;
          }
          if (!this.appService.checkNullOrUndefined(result.StatusMessage)) {
            this.snackbar.success(result.StatusMessage);
          }
        } else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
          this.isValidateAddBtnFlag = false;
          this.calProcessingConfigList = null;
          this.spinner.hide();
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
    // this.isValidateAddBtnFlag = true;
  }

  // on change process name dropdown
  changeProcessName(val) {
    this.appErrService.clearAlert();
    this.calProcessingConfig.PROCESS_NAME = val;
    // this.isResetBtnDisabled = false;
    this.isSearchBtnDisabled = false;
    this.oemFocus();
  }

  onOEMDropdownChange(event) {
    this.calProcessingConfig.MODEL = null;
    this.calProcessingConfig.OEM_CD = event;
    this.getOemModels(event);
    this.ruleSetupChild.resetRuleSetupFromParent();
    this.ruleSetupChild.enableAttribute(true);
    this.isResetBtnDisabled = false;
    this.appService.setFocus('oemModels');
  }

  changeOemModel(event) {
    this.appErrService.clearAlert();
    this.calProcessingConfig.MODEL = event;
    this.isResetBtnDisabled = false;
    this.appService.setFocus('initialCall');
  }

  // on Initial Call Change Val
  onInitialCallChangeVal(val) {
    this.appErrService.clearAlert();
    this.calProcessingConfig.INITIAL_CALL = parseInt(val); 
    this.isResetBtnDisabled = false;
  }

  // on Post Initial Schedule Days Change Val
  onPostInitialScheduledDaysChangeVal(val) {
    this.appErrService.clearAlert();
    this.calProcessingConfig.SCHED_CALL = parseInt(val);
    this.isResetBtnDisabled = false;
  }

  // on Post Initial Schedule Days Change Val
  onMaxDaysToCallChangeVal(val) {
    this.appErrService.clearAlert();
    this.calProcessingConfig.MAX_CALL_DAYS = parseInt(val);
    this.isResetBtnDisabled = false;
  }

  // on change active toggle
  onActiveChange(val) {
    this.calProcessingConfig.ACTIVE = val ? 'Y' : 'N';
    this.isResetBtnDisabled = false;
  }




  // onProcessCalProcessingConfigJsonGrid
  onProcessCalProcessingConfigJsonGrid(Response) {
    this.grid = new Grid();
    this.grid.EditVisible = true;
    this.calProcessingConfigList = this.appService.onGenerateJson(Response, this.grid);
  }

  // rule setup emit event to enable or disable add button and to assign rule
  emitEnableAddOrSave(event) {
    if (this.appService.checkNullOrUndefined(event)) {
      this.editruleSetup = null;
      this.isValidateAddBtnFlag = true;
    } else {
      this.calProcessingConfig.RULE = event.Formula;
      if (event.ValidatedFormula) {
        this.isSearchBtnDisabled = true;
        this.isValidateAddBtnFlag = false;
      } else {
        this.isValidateAddBtnFlag = true;
      }
    }
  }

  // on click edit buttton
  editCalProcessingConfig(event) {
    this.appErrService.clearAlert();
    this.calProcessingConfig = new CalProcessingConfig();
    this.tempCalProcessingConfig = new CalProcessingConfig();
    if(event.hasOwnProperty('OEM_CD') && !checkNullorUndefined(event.OEM_CD)){
      this.getOemModels(event.OEM_CD);
    }
    this.calProcessingConfig = Object.assign(this.calProcessingConfig, event);
    this.tempCalProcessingConfig = Object.assign(this.tempCalProcessingConfig, event);
    this.editruleSetup = event.RULE;
    this.btnName = this.commonButton.save;
    this.isSearchBtnDisabled = true;
    this.setCalProcessingConfigLableProperties(true);
    this.isValidateAddBtnFlag = false;
    this.isInitialCallDisabled = false;
    this.isPostInitialScheduledDaysDisabled = false;
    this.isMaxDaysToCallDisabled = false;
  }


  gridClear() {
    this.calProcessingConfigList = null;
  }

  // clearing all disposition engine config
  clearCalProcessingConfig() {
    this.tempCalProcessingConfigList = null;
    this.btnName = this.commonButton.add;
    this.isSearchBtnDisabled = true;
    this.isResetBtnDisabled = true;
    this.isValidateAddBtnFlag = true;
    this.setCalProcessingConfigLableProperties(false);
    this.appErrService.clearAlert();
    this.ruleSetupChild.resetRuleSetupFromParent();
    this.processNameFocus();
    this.editruleSetup = null;
    this.oemModels = []
    this.calProcessingConfig = new CalProcessingConfig();
    this.tempCalProcessingConfig = new CalProcessingConfig();
    if (this.processNamesList.length == 1) {
      this.calProcessingConfig.PROCESS_NAME = this.processNamesList[0].Text;
      this.oemFocus();
    }
  }

  // set CalProcessingConfig properties
  setCalProcessingConfigLableProperties(val) {
    this.isOemModelsDisabled = val;
    this.isOemCodeDisabled = val;
    this.isProcessNameDisabled = val;
    this.isInitialCallDisabled = val;
    this.isPostInitialScheduledDaysDisabled = val;
    this.isMaxDaysToCallDisabled = val;
  }

  // process Name Focus
  processNameFocus() {
    this.appService.setFocus('processName');
  }

  // oem Focus
  oemFocus() {
    this.appService.setFocus('oemCode');
  }

  ngOnDestroy() {
    this.masterPageService.defaultProperties();
  }
}
