import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';
import { ApiConfigService } from '../../utilities/rlcutl/api-config.service';
import { StorageData } from '../../enums/storage.enum';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';
import { DropDownSettings } from '../../models/common/dropDown.config';
import { ClientData } from '../../models/common/ClientData';
import { UiData } from '../../models/common/UiData';
import { String } from 'typescript-string-operations';
import { ApiService } from '../../utilities/rlcutl/api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { StatusCodes } from '../../enums/status.enum';
import { Subscription } from 'rxjs';
import { CommonService } from '../../services/common.service';
import { dropdown } from '../../models/common/Dropdown';
import { CommonEnum } from '../../enums/common.enum';
import { SamplingRule, SamplingConfig, SamplingMatrix } from '../../models/maintenance/sampling/samplingInfo';
import { Grid } from '../../models/common/Grid';
import { AppService } from '../../utilities/rlcutl/app.service';
import { RmgridComponent } from '../../framework/frmctl/rmgrid/rmgrid.component';
import { checkNullorUndefined } from '../../enums/nullorundefined';
@Component({
  selector: 'app-sampling',
  templateUrl: './sampling.component.html',
  styleUrls: ['./sampling.component.css']
})
export class SamplingComponent implements OnInit, OnDestroy {

  operationObj: any;
  clientData = new ClientData();
  uiData = new UiData();
  emitHideSpinner: Subscription;
  grid: Grid;
  appConfig: any;

  editSamplingMatrixParentIndex: any;
  editSamplingMatrixChildIndex: any;
  samplingMatrixChildElementsLength: any;
  @ViewChild(RmgridComponent) rmGrid: RmgridComponent;

  dropdownSettings: DropDownSettings;
  samplingRuleId: any;
  samplingConfigRuleId: any;
  selectedOEMModels = [];

  // to identify that rule is generated
  ruleGenerated = false;

  // disbaled
  isSaveDisabled = true;
  isClearDisabled = true;
  isResetDisabled = true;
  isRuleIdDisabled = false;
  isDescriptionDisable = false;
  isRuleToggleDisable = false;
  matrixUpdated = false;
  isDisableAddSearchIcon = false;
  isEnableTextBox = true;

  // models
  samplingRule = new SamplingRule();
  tempsamplingRule = new SamplingRule();
  tempProcessSamplingMatrixList: SamplingRule[] = [];
  samplingMatrix = new SamplingMatrix();
  tempsamplingMatrix = new SamplingMatrix();

  samplingMatrixList: SamplingRule[];

  samplingMatrixBtnName = CommonEnum.add;

  ruleList = [];

  lotMinMaxPattern: any;
  quantityPattern: any;

  // ********************* Config *********************************

  commonEnum = CommonEnum;

  // models
  samplingConfig = new SamplingConfig();
  tempsamplingConfig = new SamplingConfig();

  // disabled
  isSamplingConfigResetDisabled = true;
  isConfigRuleIdDisabled = false;
  isRouteDisabled = false;
  isOperationDisabled = false;
  isSearchConfigRuleIdDisabled = false;
  isSearchConfigRouteIdDisabled = false;
  isSearchConfigOperationIdDisabled = false;
  isSearchConfigOEMModelIdDisabled = false;

  samplingConfigBtnName = CommonEnum.add;

  ruleIdOptionsList = [];
  configRouteIdOptions = [];
  configOperationIdOptions = [];
  configOEMModelIdOptions = [];

  // grid list
  samplingConfigList: any;

  constructor(
    public masterPageService: MasterPageService,
    public appErrService: AppErrorService,
    private apiConfigService: ApiConfigService,
    public apiService: ApiService,
    private spinner: NgxSpinnerService,
    private snackbar: XpoSnackBar,
    private commonService: CommonService,
    public appService: AppService
  ) {

    const pattern = JSON.parse(localStorage.getItem(StorageData.patternList));
    if (!this.appService.checkNullOrUndefined(pattern)) {
      this.lotMinMaxPattern = new RegExp(pattern.lotMinMaxPattern);
      this.quantityPattern = new RegExp(pattern.samplingQuantityPattern);
    }

    this.emitHideSpinner = this.masterPageService.emitHideSpinner.subscribe(spinnerFlag => {
      if (!checkNullorUndefined(spinnerFlag) && spinnerFlag) {
        this.getResultRoutes();
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
      this.appConfig = JSON.parse(localStorage.getItem(StorageData.appConfig));
      this.appErrService.appMessage();
      this.dropdownSettings = new DropDownSettings();
      this.dropdownSettings.idField = 'ID';
      this.dropdownSettings.textField = 'TEXT';
      this.dropdownSettings.singleSelection = true;
    }
  }

  // method is to toggle control from add to serach
  onAddSearchClick() {
    this.reset();
    this.isEnableTextBox = !this.isEnableTextBox;
    if (this.isEnableTextBox) {
      this.ruleGenerated = false;
      this.samplingMatrixBtnName = CommonEnum.save;
    } else {
      this.ruleGenerated = true;
      this.samplingMatrixBtnName = CommonEnum.add;
    }
  }

  // getResultRoutes
  getResultRoutes() {
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getResultRoutes);
    this.commonService.commonApiCall(url, requestObj, (res) => {
      if (!checkNullorUndefined(res.Response) && !checkNullorUndefined(res.Response['ResultRoutesList'])) {
        this.getOpearationList();
        if (res.Response['ResultRoutesList'].length) {
          res.Response['ResultRoutesList'].forEach(element => {
            const dd: dropdown = new dropdown();
            dd.Id = element.ID;
            dd.Text = element.TEXT;
            this.configRouteIdOptions.push(dd);
          });
        }
      }
    });
  }

  // getConfigRuleId
  getOpearationList() {
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getRouteEligibleOpearationsList);
    this.commonService.commonApiCall(url, requestObj, (res) => {
      if (!checkNullorUndefined(res.Response) && res.Response['OperationCodesList']) {
        this.getOEMModelList();
        if (res.Response['OperationCodesList'].length) {
          res.Response['OperationCodesList'].forEach(element => {
            const dd: dropdown = new dropdown();
            dd.Id = element.ID;
            dd.Text = element.TEXT;
            // Added space for spliting the operationId and operationText( - )
            dd.Text = String.Join(' - ', dd.Id, dd.Text);
            this.configOperationIdOptions.push(dd);
          });
        }
      }
    });
  }

  // getConfigRuleId
  getOEMModelList() {
    this.getSamplingRuleIDsList();
    this.configOEMModelIdOptions = [];
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getOEMModelList);
    this.commonService.commonApiCall(url, requestObj, (res) => {
      if (!checkNullorUndefined(res.Response) && res.Response['OEMModelList']) {
        if (res.Response['OEMModelList'].length) {
          this.configOEMModelIdOptions = res.Response['OEMModelList'];
        }
      }
    });
  }

  getSamplingRuleIDsList(activeFlag?) {
    this.ruleIdOptionsList = [];
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getSamplingRuleIDsList, activeFlag);
    this.commonService.commonApiCall(url, requestObj, (res) => {
      this.spinner.hide();
      if (!checkNullorUndefined(res.Response) && res.Response['SamplingRuleIDsList']) {
        if (res.Response['SamplingRuleIDsList'].length) {
          if (activeFlag == CommonEnum.yes) {
            this.ruleIdOptionsList = res.Response['SamplingRuleIDsList'];
          } else {
            this.ruleList = res.Response['SamplingRuleIDsList'];
          }
        }
      }
    });
  }

  enableRule() {
    if (!checkNullorUndefined(this.samplingRule.RULEDESCRIPTION) && this.samplingRule.RULEDESCRIPTION != '' && this.checkRuleId()) {
      return false;
    } else {
      return true;
    }
  }

  checkRuleId() {
    return this.isEnableTextBox ? ((!checkNullorUndefined(this.samplingRule.RULEID) && this.samplingRule.RULEID != '') ? true : false) : true;
  }

  enableRuleReset() {
    this.isResetDisabled = false;
    this.appErrService.clearAlert();
  }

  enableMatrixClear() {
    this.isClearDisabled = false;
    this.appErrService.clearAlert();
  }

  // getRuleList
  getRuleList() {
    this.samplingRule.RULEID = (!checkNullorUndefined(this.samplingRuleId)) ? this.samplingRuleId[0].ID : '';
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_SAMPLING_RULE: this.samplingRule };
    const url = String.Join('/', this.apiConfigService.getSamplingMatrixList);
    this.commonService.commonApiCall(url, requestObj, (res) => {
      this.spinner.hide();
      if (!checkNullorUndefined(res.Response) && res.Response['SamplingRules']) {
        if (res.Response['SamplingRules'].length) {
          this.reset();
          this.onProcessSamplingMatrixJsonGrid(res.Response['SamplingRules']);
          this.gridData();
          this.samplingMatrixBtnName = CommonEnum.save;
          this.enableRuleReset();
          this.setSamplingRuleProps(false);
          this.getSamplingRuleIDsList();
        }
      }
    });
  }

  gridData() {
    this.grid = new Grid();
    this.grid.EditVisible = true;
    this.samplingMatrixList = this.appService.onGenerateJson(this.tempProcessSamplingMatrixList, this.grid);
  }

  onProcessSamplingMatrixJsonGrid(Response) {
    if (!checkNullorUndefined(Response)) {
      this.tempProcessSamplingMatrixList = [];
      Response.forEach(res => {
        res.IsModify = false;
        res.ChildElements = this.processChildElements(res.SamplingMatrixs);
        res.EditVisible = 'true';
        this.samplingMatrix.RULEID = res.RULEID;
        delete res.SamplingMatrixs;
        this.tempProcessSamplingMatrixList.push(res);
      });
    }
  }

  processChildElements(Response) {
    const childSamplingChecks = [];
    Response.forEach(res => {
      res.IsModify = false;
      childSamplingChecks.push(res);
    });
    return childSamplingChecks;
  }

  onRuleToggleChange(value) {
    this.samplingRule.ACTIVE = value ? 'Y' : 'N';
  }

  onRegularPercentAgeYNToggleChange(value) {
    this.samplingMatrix.REGULARPERCENTAGEYN = value ? 'Y' : 'N';
  }

  onTightendPercentAgeYNToggleChange(value) {
    this.samplingMatrix.TIGHTENEDPERCENTAGEYN = value ? 'Y' : 'N';
  }

  onMatrixToggleChange(value) {
    this.samplingMatrix.ACTIVE = value ? 'Y' : 'N';
  }

  validRangeForSamplingMatrixs(sampRule, callBack) {
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_SAMPLING_RULE: sampRule };
    const url = String.Join('/', this.apiConfigService.validRangeForSamplingMatrix);
    this.commonService.commonApiCall(url, requestObj, (res) => {
      this.spinner.hide();
      if (!checkNullorUndefined(res.Response) && res.Response['IsValid']) {
        if (res.Response['IsValid']) {
          callBack();
        }
      }
    });
  }

  // addContolID -- on add btn click  adding data to grid in control section
  addToGrid() {
    if (this.appService.IsObjectsMatch(this.samplingMatrix, this.tempsamplingMatrix)) {
      this.snackbar.info(this.appService.getErrorText('2660043'));
      return;
    }
    this.matrixUpdated = true;
    if (!checkNullorUndefined(this.samplingMatrixList)) {
      if (!checkNullorUndefined(this.editSamplingMatrixParentIndex) && checkNullorUndefined(this.editSamplingMatrixChildIndex)) {
        let editSamplingRule = this.samplingMatrixList['Elements'][this.editSamplingMatrixParentIndex];
        editSamplingRule = this.samplingRule;
        editSamplingRule.SamplingMatrixs = editSamplingRule.ChildElements.concat(this.samplingMatrix);
        this.validRangeForSamplingMatrixs(editSamplingRule, (res) => {
          editSamplingRule.ChildElements = editSamplingRule.ChildElements.concat(this.samplingMatrix);
          this.commonTableData(editSamplingRule);
          this.commonRule();
        });
      } else if (!checkNullorUndefined(this.editSamplingMatrixParentIndex) && !checkNullorUndefined(this.editSamplingMatrixChildIndex)) {
        const editSampling = this.updateParentSampling();
        editSampling.SamplingMatrixs = editSampling.ChildElements.slice(0);
        editSampling.SamplingMatrixs[this.editSamplingMatrixChildIndex] = this.samplingMatrix;
        this.validRangeForSamplingMatrixs(editSampling, (res) => {
          this.updateChildSampling(editSampling, this.editSamplingMatrixChildIndex);
          this.commonTableData(editSampling);
          this.commonRule();
        });
      } else {
        if (this.isRuleIdDisabled) {
          this.editSamplingMatrixParentIndex = this.samplingMatrixList['Elements'].findIndex(a => a.RULEID == this.samplingRule.RULEID);
          let editSampling = this.samplingMatrixList['Elements'][this.editSamplingMatrixParentIndex];
          editSampling = this.samplingRule;
          editSampling.SamplingMatrixs = editSampling.ChildElements.concat(this.samplingMatrix);
          this.validRangeForSamplingMatrixs(editSampling, (res) => {
            editSampling.ChildElements = editSampling.ChildElements.concat(this.samplingMatrix);
            this.commonTableData(editSampling);
            return;
          });
        }
      }
    } else {
      this.AddNewSamplingMatrix();
    }
  }

  commonRule() {
    this.isSaveDisabled = false;
    this.clear();
  }

  commonTableData(editSampling) {
    delete editSampling.SamplingMatrixs;
    this.tempProcessSamplingMatrixList = [editSampling];
    this.gridData();
  }

  private AddNewSamplingMatrix() {
    this.tempProcessSamplingMatrixList = [];
    let element: any = {};
    element = this.samplingRule;
    element.SamplingMatrixs = [this.samplingMatrix];
    element.EditVisible = 'true';
    this.validRangeForSamplingMatrixs(element, (res) => {
      element.ChildElements = [this.samplingMatrix];
      this.commonTableData(element);
      this.editSamplingMatrixParentIndex = this.samplingMatrixList['Elements'].findIndex(a => a.RULEID == this.samplingRule.RULEID);
      // disable parent header record
      this.setSamplingRuleProps(true);
      this.commonRule();
    });
  }

  saveSamplingMatrix() {
    this.appErrService.clearAlert();
    let url;
    if (this.samplingMatrixBtnName == CommonEnum.add) {
      url = String.Join('/', this.apiConfigService.addSamplingMatrix);
    } else if (this.samplingMatrixBtnName == CommonEnum.save) {
      if (!this.matrixUpdated) {
        if (this.appService.IsObjectsMatch(this.samplingRule, this.tempsamplingRule)) {
          this.snackbar.info(this.appService.getErrorText('2660043'));
          return;
        }
      }
      url = String.Join('/', this.apiConfigService.updateSamplingMatrix);
    }
    this.isSaveDisabled = true;
    if (!this.appService.IsObjectsMatch(this.samplingRule, this.tempsamplingRule)) {
      this.samplingRule.IsModify = true;
    }
    if (this.ruleGenerated) {
      this.samplingRule.SamplingMatrixs = this.samplingMatrixList['Elements'][0].ChildElements;
    } else {
      this.samplingRule.SamplingMatrixs = this.samplingMatrixList['Elements'][this.editSamplingMatrixParentIndex].ChildElements;
    }
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_SAMPLING_RULE: this.samplingRule };
    
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        if (res.StatusMessage) {
          this.snackbar.success(res.StatusMessage);
        }
        if (this.ruleGenerated) {
          this.reset(true);
          this.getSamplingRuleIDsList();
        } else {
          this.getRuleList();
        }
        this.ruleGenerated = false;
        // this.isSaveDisabled = true;
      } else {
        this.isSaveDisabled = false;
        this.spinner.hide();
      }
    });
  }

  private updateParentSampling() {
    let editSampling = this.samplingMatrixList['Elements'][this.editSamplingMatrixParentIndex];
    editSampling = this.samplingRule;
    return editSampling;
  }

  private updateChildSampling(editSamplingMatrix: any, index: any) {
    editSamplingMatrix.ChildElements[index] = this.samplingMatrix;
    if (!checkNullorUndefined(this.samplingMatrix.SEQID)) {
      editSamplingMatrix.ChildElements[index].IsModify = true;
    } else {
      editSamplingMatrix.ChildElements[index].IsModify = false;
    }
  }

  setSamplingRuleProps(val) {
    this.isRuleIdDisabled = val;
    this.isDescriptionDisable = val;
    this.isRuleToggleDisable = val;
  }

  // parent Matrix
  editSamplingMatrixDetailRow(data) {
    this.isEnableTextBox = false;
    this.isDisableAddSearchIcon = true;
    this.setSamplingRuleProps(false);
    this.samplingRule = new SamplingRule();
    this.tempsamplingRule = new SamplingRule();
    this.samplingMatrix = new SamplingMatrix();
    this.tempsamplingMatrix = new SamplingMatrix();
    this.samplingRuleId = this.ruleList.filter(res => res.ID == data.RULEID);
    this.samplingMatrix.RULEID = data.RULEID;
    this.samplingRule = Object.assign(this.samplingRule, data);
    this.tempsamplingRule = Object.assign(this.tempsamplingRule, data);
    this.editSamplingMatrixParentIndex = this.samplingMatrixList['Elements'].findIndex(f => f.RULEID == data.RULEID);
    this.isClearDisabled = true;
    this.isResetDisabled = false;
    this.isSaveDisabled = false;
    this.isRuleIdDisabled = true;
    // based on this flag we are updating auditpoint on save auditpoint api
    this.samplingMatrixChildElementsLength = this.samplingMatrixList['Elements'][this.editSamplingMatrixParentIndex].ChildElements.length;
    this.samplingMatrixList['EditHighlight'] = true;

    if (!this.ruleGenerated) {
      this.samplingMatrixBtnName = CommonEnum.save;
    }
    this.editSamplingMatrixChildIndex = null;
  }
  emitChildSamplingMatrixDetails(data) {
    this.isDisableAddSearchIcon = true;
    this.samplingMatrix = new SamplingMatrix();
    this.tempsamplingMatrix = new SamplingMatrix();
    if (!this.ruleGenerated) {
      this.samplingRule = new SamplingRule();
      this.tempsamplingRule = new SamplingRule();
      this.samplingRule = Object.assign(this.samplingRule, data.parentRow);
      this.tempsamplingRule = Object.assign(this.tempsamplingRule, data.parentRow);
      this.samplingMatrixBtnName = CommonEnum.save;
      this.isEnableTextBox = true;
    } else {
      this.isEnableTextBox = false;
    }
    this.samplingMatrix = Object.assign(this.samplingMatrix, data.childRow);
    this.tempsamplingMatrix = Object.assign(this.tempsamplingMatrix, data.childRow);
    this.samplingRuleId = this.ruleList.filter(res => res.ID == this.samplingRule.RULEID);
    this.editSamplingMatrixChildIndex = data.childRow.Index;
    this.editSamplingMatrixParentIndex = this.samplingMatrixList['Elements'].findIndex(f => f.RULEID == data.parentRow.RULEID);
    this.isClearDisabled = false;
    this.isResetDisabled = false;
    this.setSamplingRuleProps(true);
    this.isSaveDisabled = true;
    this.samplingMatrixList['Elements'][this.editSamplingMatrixParentIndex]['EditHighlight'] = true;
  }

  reset(flag?) {
    this.clear();
    this.samplingRuleId = null;
    this.isSaveDisabled = true;
    if (flag) {
      this.isEnableTextBox = true;
      this.ruleGenerated = false;
    }
    this.isDisableAddSearchIcon = false;
    this.samplingMatrixList = null;
    this.samplingRule = new SamplingRule();
    this.tempsamplingRule = new SamplingRule();
    this.samplingMatrix = new SamplingMatrix();
    this.setSamplingRuleProps(false);
    this.editSamplingMatrixParentIndex = null;
    this.samplingMatrixBtnName = CommonEnum.add;
    this.isResetDisabled = true;
    this.matrixUpdated = false;
  }

  // clear Sampling Matrix
  clear() {
    this.appErrService.clearAlert();
    this.samplingMatrix = new SamplingMatrix();
    this.tempsamplingMatrix = new SamplingMatrix();
    this.samplingMatrix.RULEID = this.samplingRule.RULEID;
    this.editSamplingMatrixChildIndex = null;
    this.tempProcessSamplingMatrixList = [];
    this.isClearDisabled = true;
    this.isResetDisabled = false;
    if (!checkNullorUndefined(this.samplingMatrixList)) {
      this.isSaveDisabled = false;
    }
    if (this.samplingMatrixList) {
      if (!checkNullorUndefined(this.samplingMatrixList['Elements'])) {
        let checkSamplingRule = this.samplingMatrixList['Elements'].find(f => f.RULEID == this.samplingRule.RULEID);
        if (!checkNullorUndefined(checkSamplingRule)) {
          if (!checkNullorUndefined(checkSamplingRule.RULEID)) {
            if (this.rmGrid && this.rmGrid.selectedParent) {
              checkSamplingRule['EditHighlight'] = false;
              this.rmGrid.selectedParent = checkSamplingRule;
              this.rmGrid.isChildEdit = false;
            }
          }
        }
      }
    }
  }


  // --------------------------------------- Sampling Config ---------------------------------------------------------



  enableConfigReset() {
    this.isSamplingConfigResetDisabled = false;
    this.appErrService.clearAlert();
  }


  // getConfigList
  getConfigList(key?, value?) {
    this.samplingConfig = new SamplingConfig();
    this.selectedOEMModels = [];
    if (value instanceof Object) {
      this.samplingConfig[key] = value.ID;
    } else {
      this.samplingConfig[key] = value;
      this.samplingConfigRuleId = [];
    }
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_SAMPLING_CONFIG: { [key]: this.samplingConfig[key] } };
    const url = String.Join('/', this.apiConfigService.getSamplingConfigList);
    this.commonService.commonApiCall(url, requestObj, (res) => {
      if (res.Status === StatusCodes.fail) {
        this.samplingConfigList = null;
      } else if (!checkNullorUndefined(res) && res.Status === StatusCodes.pass) {
        if (!checkNullorUndefined(res.Response) && res.Response['SamplingConfigList']) {
          if (res.Response['SamplingConfigList'].length) {
            this.showConfigGrid(res.Response['SamplingConfigList']);
          }
        }
      }
      this.spinner.hide();
    });
  }

  showConfigGrid(gridData) {
    this.samplingConfigList = [];
    this.grid = new Grid();
    this.grid.EditVisible = true;
    this.samplingConfigList = this.appService.onGenerateJson(gridData, this.grid);
  }

  changeConfigRouteId(event) {
    this.samplingConfig.ROUTEID = event.value;
  }

  changeConfigOperationId(event) {
    this.samplingConfig.OPERATIONID = event.value;
  }

  changeConfigOEMModelId(event) {
    this.selectedOEMModels = this.configOEMModelIdOptions.filter(res => res.ID == event.ID);
    this.samplingConfig.OEMMODEL = event.ID;
  }

  onConfigToggleChange(value) {
    this.samplingConfig.ACTIVE = value ? 'Y' : 'N';
  }

  changeConfigRuleId(event) {
    this.samplingConfig.RULEID = event.value;
    this.resetSamplingConfig(true);
  }

  addOrUpdateSamplingConfigInfo() {
    let url;
    if (this.samplingConfigBtnName == CommonEnum.add) {
      url = String.Join('/', this.apiConfigService.addSamplingConfig);
    } else if (this.samplingConfigBtnName == CommonEnum.save) {
      if (this.appService.IsObjectsMatch(this.samplingConfig, this.tempsamplingConfig)) {
        this.snackbar.info(this.appService.getErrorText('2660043'));
        return;
      }
      url = String.Join('/', this.apiConfigService.updateSamplingConfig);
    }

    const requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_SAMPLING_CONFIG: this.samplingConfig };
    this.commonService.commonApiCall(url, requestObj, (res) => {
      if (!checkNullorUndefined(res.Response) && res.Response['SamplingConfigList']) {
        if (res.Response['SamplingConfigList'].length) {
          this.showConfigGrid(res.Response['SamplingConfigList']);
          this.snackbar.success(res.StatusMessage);
          this.resetSamplingConfig(true);
        }
      }
      this.spinner.hide();
    });
  }

  editSamplingConfigDetailRow(data) {
    this.samplingConfig = new SamplingConfig();
    this.tempsamplingConfig = new SamplingConfig();
    this.samplingConfigRuleId = this.ruleIdOptionsList.filter(res => res.ID == data.RULEID);
    this.selectedOEMModels = this.configOEMModelIdOptions.filter(res => res.ID == data.OEMMODEL);
    this.samplingConfig = Object.assign(this.samplingConfig, data);
    this.tempsamplingConfig = Object.assign(this.tempsamplingConfig, data);
    this.isConfigRuleIdDisabled = true;
    this.disableSearchControls(true);
    this.isRouteDisabled = true;
    this.isOperationDisabled = true;
    this.samplingConfigBtnName = CommonEnum.save;
    this.isSamplingConfigResetDisabled = false;
    this.samplingConfigList['EditHighlight'] = true;
  }

  disableSearchControls(val) {
    this.isSearchConfigRouteIdDisabled = val;
    this.isSearchConfigOperationIdDisabled = val;
    this.isSearchConfigOEMModelIdDisabled = val;
    this.isSearchConfigRuleIdDisabled = val;
  }

  resetSamplingConfig(isGridRequried?) {
    this.appErrService.clearAlert();
    this.isSamplingConfigResetDisabled = true;
    this.isConfigRuleIdDisabled = false;
    this.isRouteDisabled = false;
    this.isOperationDisabled = false;
    this.samplingConfigRuleId = [];
    this.selectedOEMModels = [];
    this.samplingConfigBtnName = CommonEnum.add;
    const rule = this.samplingConfig.RULEID;
    this.disableSearchControls(false);
    this.samplingConfig = new SamplingConfig();
    this.tempsamplingConfig = new SamplingConfig();
    if (!checkNullorUndefined(this.samplingConfigList)) {
      this.samplingConfigList['EditHighlight'] = false;
    }
    this.samplingConfig.ACTIVE = CommonEnum.yes;
    if (!isGridRequried) {
      this.samplingConfigList = null;
    } else {
      this.isSamplingConfigResetDisabled = false;
      this.samplingConfig.RULEID = rule;
    }
  }

  ngOnDestroy() {
    this.masterPageService.defaultProperties();
    this.emitHideSpinner.unsubscribe();
  }

}
