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
import { DispositionEngineConfig } from '../../models/maintenance/disposition-engine-config/dispositionEngineConfig';
import { dropdown } from '../../models/common/Dropdown';
import { CommonEnum } from '../../enums/common.enum';
import { RuleSetupComponent } from '../../framework/busctl/rule-setup/rule-setup.component';


@Component({
  selector: 'app-disposition-cofig',
  templateUrl: './disposition-engine-cofig.component.html',
  styleUrls: ['./disposition-engine-cofig.component.css']
})
export class DispositionCofigComponent implements OnInit, OnDestroy {

  @ViewChild(RuleSetupComponent) ruleSetupChild: RuleSetupComponent;

  commonButton = CommonEnum;

  operationObj: any;
  // disposition engine config properties
  isProgramNameDisabled = false;
  isProgramIndicatorDisabled = false;
  isConditionCodeDisabled = false;
  isRankDisabled = false;
  isDispositionsDisabled = false;
  programNamesList: any[] = [];
  programIndicatorsList: any[] = [];
  conditionCodesList: any[] = [];
  dispositionsList: any[] = [];
  isExitOnlyCalToggleActive = false;
  isActiveToggle = false;
  isResetBtnDisabled = true;
  isSearchBtnDisabled = true;
  isValidateAddBtnFlag = true;
  btnName = this.commonButton.add;
  disPosEngineConfigList: any;
  tempDisposEngineConfigList: any;
  rankNumberPattern: any;


  ruleSetupObject: any;
  editruleSetup: any;
  attributeRouteConfig: any;

  clientData = new ClientData();
  uiData = new UiData();
  grid: Grid;
  dispositionEngineConfig = new DispositionEngineConfig();
  tempDispositionEngineConfig = new DispositionEngineConfig();

  emitHideSpinner: Subscription;

  constructor(private apiService: ApiService,
    private apiConfigService: ApiConfigService,
    private spinner: NgxSpinnerService,
    private http: HttpClient,
    private snackbar: XpoSnackBar,
    public appErrService: AppErrorService,
    public masterPageService: MasterPageService,
    public appService: AppService) {

    const pattern = JSON.parse(localStorage.getItem(StorageData.patternList));
    if (!this.appService.checkNullOrUndefined(pattern)) {
      this.rankNumberPattern = new RegExp(pattern.rankPattern);
    }
    // emitting hide spinner
    this.emitHideSpinner = this.masterPageService.emitHideSpinner.subscribe(spinnerFlag => {
      if (!this.appService.checkNullOrUndefined(spinnerFlag) && spinnerFlag) {
        this.getProgramNames();
      }
    });
  }


  ngOnInit() {
    this.operationObj = this.masterPageService.getRouteOperation();
    if (this.operationObj) {
      this.uiData.OperationId = this.operationObj.OperationId;
      this.uiData.OperCategory = this.operationObj.Category;
      this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
      // setting value to hidespinner (based on this value we are emiting emithidespinner method)
      this.masterPageService.hideSpinner = true;
      this.masterPageService.setTitle(this.operationObj.Title);
      this.masterPageService.setModule(this.operationObj.Module);
      localStorage.setItem(StorageData.module, this.operationObj.Module);
      this.appErrService.appMessage();
    }
  }

  /*dispositions engine config Methods */
  // getProgramName
  getProgramNames() {
    this.spinner.show();
    this.programNamesList = [];
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.loadControlData, CommonEnum.dispositionEngineAttribute,
      CommonEnum.programName);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const result = response.body;
        if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
          if (!this.appService.checkNullOrUndefined(result.Response) && result.Response.length) {
            result.Response.forEach((element) => {
              const dd: dropdown = new dropdown();
              dd.Id = element.Id;
              dd.Text = element.Text;
              this.programNamesList.push(dd);
            });
          }
          this.programNameFocus();
          this.getProgramIndicators();
        } else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });

  }
  // get program indicators
  getProgramIndicators() {
    this.programIndicatorsList = [];
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.loadControlData, CommonEnum.dispositionEngineAttribute,
      CommonEnum.programIndicator);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const result = response.body;
        if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
          if (!this.appService.checkNullOrUndefined(result.Response) && result.Response.length) {
            result.Response.forEach((element) => {
              const dd: dropdown = new dropdown();
              dd.Id = element.Id;
              dd.Text = element.Text;
              this.programIndicatorsList.push(dd);
            });
            this.getConditionCodes();
          }
        } else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }

  // get condition codes
  getConditionCodes() {
    this.conditionCodesList = [];
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.loadControlData, CommonEnum.dispositionEngineAttribute,
      CommonEnum.conditionCode);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const result = response.body;
        if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
          if (!this.appService.checkNullOrUndefined(result.Response) && result.Response.length) {
            result.Response.forEach((element) => {
              const dd: dropdown = new dropdown();
              dd.Id = element.Id;
              dd.Text = element.Text;
              this.conditionCodesList.push(dd);
            });
            this.getDispositions();
          }
        } else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }

  // get dispositions
  getDispositions() {
    this.dispositionsList = [];
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    this.apiService.apiPostRequest(this.apiConfigService.getDispositions, requestObj)
      .subscribe(response => {
        const result = response.body;
        if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
          if (!this.appService.checkNullOrUndefined(result.Response) && result.Response.length) {
            result.Response.forEach((element) => {
              const dd: dropdown = new dropdown();
              dd.Id = element.Id;
              dd.Text = element.Text;
              this.dispositionsList.push(dd);
            });
          }
          this.getAttributeRouteConfig();
        } else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
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


  // programe Name Focus
  programNameFocus() {
    this.appService.setFocus('programName');
  }

  // programe Indicator Focus
  programIndicatorFocus() {
    this.appService.setFocus('programIndicator');
  }
  // condition code Focus
  conditionCodeFocus() {
    this.appService.setFocus('conditionCode');
  }

  // rank Focus
  rankFocus() {
    this.appService.setFocus('rank');
  }




  // on change program name dropdown
  changeProgramName(event) {
    this.appErrService.clearAlert();
    this.dispositionEngineConfig.ATTR1 = event.value;
    this.isResetBtnDisabled = false;
    this.isSearchBtnDisabled = false;
    this.programIndicatorFocus();
  }

  // on change program indicator drowpdown
  changeProgramIndicator(event) {
    this.appErrService.clearAlert();
    this.dispositionEngineConfig.ATTR2 = event.value;
    this.isResetBtnDisabled = false;
    this.isSearchBtnDisabled = false;
    this.conditionCodeFocus();
  }

  // on change condition code dropdown
  changeConditionCode(event) {
    this.appErrService.clearAlert();
    this.dispositionEngineConfig.ATTR3 = event.value;
    this.isResetBtnDisabled = false;
    this.isSearchBtnDisabled = false;
    this.rankFocus();
  }

  // on change disposition dropdown
  changeDisposition(event) {
    this.appErrService.clearAlert();
    this.dispositionEngineConfig.DISPOSITION = event.value;
    this.isResetBtnDisabled = false;
    this.isSearchBtnDisabled = false;
    this.ruleSetupChild.resetRuleSetupFromParent();
    this.ruleSetupChild.enableAttribute(true);
  }

  // on Rank Change Val
  onRankChangeVal(val) {
    this.appErrService.clearAlert();
    this.dispositionEngineConfig.RANK = val;
    this.isResetBtnDisabled = false;
  }

  // on change exit only calculation toggle
  onExitOnlyCalActiveChange(val) {
    this.dispositionEngineConfig.EXITONLYCALCULATION = val ? 'Y' : 'N';
    this.isResetBtnDisabled = false;
  }

  // on change active toggle
  onActiveChange(val) {
    this.dispositionEngineConfig.ACTIVE = val ? 'Y' : 'N';
    this.isResetBtnDisabled = false;
  }


  // on search disposition engine config data
  getDisposEngineConfigList() {
    this.spinner.show();
    this.appErrService.clearAlert();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_DISPOSITIONENGINE_CONFIG: this.dispositionEngineConfig };
    const url = String.Join('/', this.apiConfigService.getDisposEngineConfigList);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const result = response.body;
        this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
          if (!this.appService.checkNullOrUndefined(result.Response) && result.Response.length > 0) {
            this.onProcessDisposEngineConfigJsonGrid(result.Response);
            this.isResetBtnDisabled = false;
          }
        } else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
          this.spinner.hide();
          this.disPosEngineConfigList = null;
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }


  // onProcessDisposEngineConfigJsonGrid
  onProcessDisposEngineConfigJsonGrid(Response) {
    if (!this.appService.checkNullOrUndefined(Response)) {
      this.tempDisposEngineConfigList = [];
      Response.forEach(res => {
        const element: any = {};
        element.ProgamName = res.ATTR1;
        element.ProgramIndicator = res.ATTR2;
        element.ConditionCode = res.ATTR3;
        element.Rank = res.RANK;
        element.Disposition = res.DISPOSITION;
        element.ExitOnlyCalculation = res.EXITONLYCALCULATION;
        element.Active = res.ACTIVE;
        element.Formula = res.FORMULA;
        element.AddDate = res.ADDTS;
        element.AddWho = res.ADDWHO;
        element.EditWho = res.EDITWHO;
        element.EditDate = res.EDITTS;
        element.SiteID = res.SITEID;
        element.ClientID = res.CLIENTID;
        this.tempDisposEngineConfigList.push(element);
      });
    }
    this.grid = new Grid();
    this.grid.EditVisible = true;
    this.disPosEngineConfigList = this.appService.onGenerateJson(this.tempDisposEngineConfigList, this.grid);
  }


  // rule setup emit event to enable or disable add button and to assign rule
  emitEnableAddOrSave(event) {
    if (this.appService.checkNullOrUndefined(event)) {
      this.editruleSetup = null;
      this.isValidateAddBtnFlag = true;
    } else {
      this.dispositionEngineConfig.FORMULA = event.Formula;
      if(event.ValidatedFormula){
        this.isSearchBtnDisabled = true;
          this.isValidateAddBtnFlag = false;
      } else {
          this.isValidateAddBtnFlag = true;
  }
  }
  }

  // for adding or updating disposition engine config
  addOrUpdateDisposEngineConfig() {
    this.appErrService.clearAlert();
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_DISPOSITIONENGINE_CONFIG: this.dispositionEngineConfig };
    let url;
    if (this.btnName === this.commonButton.add) {
      url = String.Join('/', this.apiConfigService.addDisposEngineConfig);
    } else if (this.btnName === this.commonButton.save) {
      if (this.appService.IsObjectsMatch(this.dispositionEngineConfig, this.tempDispositionEngineConfig)) {
        this.snackbar.info(this.appService.getErrorText('2660043'));
        this.spinner.hide();
        return;
      }
      url = String.Join('/', this.apiConfigService.updateDisposEngineConfig);
    }
    this.isValidateAddBtnFlag = true;
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const result = response.body;
        this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
          if (!this.appService.checkNullOrUndefined(result.Response)) {
            this.onProcessDisposEngineConfigJsonGrid(result.Response);
            this.clearDisposEngineConfig();
            this.isResetBtnDisabled = false;
          }
          if (!this.appService.checkNullOrUndefined(result.StatusMessage)) {
            this.snackbar.success(result.StatusMessage);
          }
        } else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
          this.isValidateAddBtnFlag = false;
          this.disPosEngineConfigList = null;
          this.spinner.hide();
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
    // this.isValidateAddBtnFlag = true;
  }


  // on click edit buttton
  editDisposEngineConfig(event) {
    this.appErrService.clearAlert();
    this.setDisposConfigProperties(event);
    this.dispositionEngineConfig = new DispositionEngineConfig();
    this.dispositionEngineConfig = Object.assign(this.dispositionEngineConfig, this.tempDispositionEngineConfig);
    this.editruleSetup = event.Formula;
    this.btnName = this.commonButton.save;
    this.isSearchBtnDisabled = true;
    this.setDisposEngineConfigLableProperties(true);
    this.isValidateAddBtnFlag = false;
    this.isRankDisabled = false;
  }

  // create temp object bind data to grid
  setDisposConfigProperties(event) {
    if (!this.appService.checkNullOrUndefined(event)) {
      this.tempDispositionEngineConfig = new DispositionEngineConfig();
      this.tempDispositionEngineConfig.ATTR1 = event.ProgamName;
      this.tempDispositionEngineConfig.ATTR2 = event.ProgramIndicator;
      this.tempDispositionEngineConfig.ATTR3 = event.ConditionCode;
      this.tempDispositionEngineConfig.RANK = event.Rank;
      this.tempDispositionEngineConfig.DISPOSITION = event.Disposition;
      this.tempDispositionEngineConfig.EXITONLYCALCULATION = event.ExitOnlyCalculation;
      this.tempDispositionEngineConfig.ACTIVE = event.Active;
      this.tempDispositionEngineConfig.FORMULA = event.Formula;
      this.tempDispositionEngineConfig.ADDTS = event.AddDate;
      this.tempDispositionEngineConfig.ADDWHO = event.AddWho;
      this.tempDispositionEngineConfig.EDITWHO = event.EditWho;
      this.tempDispositionEngineConfig.EDITTS = event.EditDate;
      this.tempDispositionEngineConfig.SITEID = event.SiteID;
      this.tempDispositionEngineConfig.CLIENTID = event.ClientID;
    }
  }

  // clearing all disposition engine config
  clearDisposEngineConfig() {
    this.disPosEngineConfigList = null;
    this.tempDisposEngineConfigList = null;
    this.btnName = this.commonButton.add;
    this.isSearchBtnDisabled = true;
    this.isResetBtnDisabled = true;
    this.isValidateAddBtnFlag = true;
    this.setDisposEngineConfigLableProperties(false);
    this.appErrService.clearAlert();
    this.ruleSetupChild.resetRuleSetupFromParent();
    this.programNameFocus();
    this.editruleSetup = null;
    this.dispositionEngineConfig = new DispositionEngineConfig();
    this.tempDispositionEngineConfig = new DispositionEngineConfig();
  }

  // set dispositon eninge config properties
  setDisposEngineConfigLableProperties(val) {
    this.isProgramNameDisabled = val;
    this.isProgramIndicatorDisabled = val;
    this.isConditionCodeDisabled = val;
    this.isRankDisabled = val;
    this.isDispositionsDisabled = val;
  }

  // ng destroy
  ngOnDestroy() {
    this.emitHideSpinner.unsubscribe();
    this.masterPageService.defaultProperties();
  }
}
