import { DropDownSettings } from './../../models/common/dropDown.config';
import { CommonEnum } from './../../enums/common.enum';
import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NgModelGroup } from '@angular/forms';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from './../../services/common.service';
import { ApiConfigService } from './../../utilities/rlcutl/api-config.service';
import { AppService } from './../../utilities/rlcutl/app.service';
import { AppErrorService } from './../../utilities/rlcutl/app-error.service';
import { MasterPageService } from './../../utilities/rlcutl/master-page.service';
import { ClientData } from './../../models/common/ClientData';
import { String } from 'typescript-string-operations';
import { UiData } from './../../models/common/UiData';
import { StorageData } from './../../enums/storage.enum';
import { Grid } from './../../models/common/Grid';
import { RxModel, RxModelAttributes, RxSoftwareVersions, MasterDropdown, ModelSearchObj } from './../../models/maintenance/model-master/model-master';
import { DatePipe } from '@angular/common';
import { checkNullorUndefined } from '../../enums/nullorundefined';



@Component({
  selector: 'app-model-master',
  templateUrl: './model-master.component.html',
  styleUrls: ['./model-master.component.css']
})
export class ModelMasterComponent implements OnInit, OnDestroy {

  @ViewChild('staticTabs') staticTabs;
  @ViewChild('swVersionCtrls') swVersionCtrls: NgModelGroup;

  // variable declaration
  isSaveDisabled = true;
  searchedOEMCode: string;
  searchedModel: string;
  isSearchBtnDisabled = true;
  isOEMCodeDisabled = false;
  isModelDisabled = true;
  isClearDisabled = true;
  operationObj: any;
  selectedModel: string; // setting on grid edit
  modelMasterList: any;
  modelMasterResponse = [];
  attributeList: any;
  softwareVersionDetails: any;
  oemCodeList = [];
  activeList = [];
  secondCIFlagList = [];
  constrainedList = [];
  typeCodesResponse: any;
  typeCodeList = [];
  typeCodeObj: any;
  criteriaList: any;
  selectedParserItems = [];
  parserEligibilityOptions = [];
  parserSelectedKeys = [];
  killSwitchFlagList = [];
  msnOptionList = [];
  selectedMSNOption = [];
  internalBatteryList = [];
  selectedIBOption = [];
  autoPrintOptionList = [];
  selectedautoPrintOption = [];
  flashEligibleList = [];
  selectedFlashOption = [];
  dataRList = [];
  selectedDataROption = [];
  factoryResetList = [];
  factoryTestList = [];
  selectedFactoryResetOption = [];
  selectedFactoryTestOption = [];
  selectedOemCode: any;
  selectedsecondCIFlag = [];
  selectedConstrained = [];
  selectedkillSwitch = [];
  selectedTypeCode = [];
  tempAttributeList = [];
  tesmpSoftwareVersionList = [];
  startDate: string;
  endDate: string;
  isEndDateDisabled = true;
  dateRange: string;
  minDate: Date;
  endMinDate: Date;
  warrantyPattern: any;
  criteriaPattern: any;
  truncateCommaPattern: any;
  modelPattern: any;
  namePattern: any;
  isSearch = false;
  isEditMode = false;
  isAttributeEdit = false;
  isTypeCodeDisabled = false;
  tempAttributeResResponse: any;
  tempSoftwareVersionResponse: any;
  hideSWVersionAdd = false;

  isSecondaryCIFlagDisabled = true;
  isConstrainedDisabled = true;
  isMSNEnabledDisabled = true;
  isInternalBatterDisabled = true;
  isAutoPrintDisabled = true;
  isWarrantyPatternDsiabled = true;
  isWarrantyOffsetDisabled = true;
  isContainerCapacityDisabled = true;
  isParserEligibilityDisabled = true;
  isKillSwitchDisabled = true;
  isFlashEligibleDisabled = true;
  isDataRDisbaled = true;
  isFactoryResetDisabled = true;
  isFactoryTestDisabled = true;


  isCriteria1Disabled = false;
  isCriteria2Disabled = false;
  isCriteria3Disabled = false;
  isCriteria4Disabled = false;
  isCriteria5Disabled = false;
  isCriteria6Disabled = false;
  isCriteria7Disabled = false;
  isCriteria8Disabled = false;
  isCriteria9Disabled = false;
  isCriteria10Disabled = false;
  isValue1Disabled = true;
  isValue2Disabled = true;
  isValue3Disabled = true;
  isValue4Disabled = true;
  isValue5Disabled = true;


  controlConfig: any;
  controlConfigData: any;

  // object declaration
  clientData = new ClientData();
  uiData = new UiData();
  grid: Grid;
  modelMaster = new RxModel();
  modelSearchObj: ModelSearchObj;
  rxModelAttribute = new RxModelAttributes();
  rxSoftwareVersions = new RxSoftwareVersions();
  bsConfig = {
    dateInputFormat: 'MM/DD/YYYY h:mm:ss a',
    containerClass: 'theme-dark-blue',
    showWeekNumbers: false
  };

  textBoxPattern: any;
  dropdownSettings: DropDownSettings;
  msddSettings: DropDownSettings;

  // RXjs observables
  emitHideSpinner: Subscription;

  // launch date
  isLaunchDateDisabled = true;

  // OS type
  osTypeList = [];
  selectedOsTypeOption = [];
  isOsTypeDisabled = true;

  // tire
  tireList = [];
  selectedTireOption = [];
  isTireDisabled = true;

  // Obsolute Flag
  obsoluteFlagList = [];
  selectedObsoluteFlagOption = [];
  isObsoluteFlagDisabled = true;

  // Obsolute Flag
  modelClassList = [];
  selectedModelClassOption = [];
  isModelClassDisabled = true;

  // End of Life Flag
  endOfLifeIndList = [];
  selectedEndOfLifeIndOption = [];
  isEndOfLifeIndDisabled = true;

  // automated Cleaning flag
  automatedCleaningList = [];
  selectedAutomatedCleaningOption = [];
  isAutomatedCleaningDisabled = true;

  // automated Grading flag
  automatedGradingList = [];
  selectedAutomatedGradingOption = [];
  isAutomatedGradingDisabled = true;

  // automated PreProcessing flag
  automatedPreProcessingList = [];
  selectedAutomatedPreProcessingOption = [];
  isAutomatedPreProcessingDisabled = true

  // automated PostProcessing flag
  automatedPostProcessingList = [];
  selectedAutomatedPostProcessingOption = [];
  isAutomatedPostProcessingDisabled = true

  // automated Testing flag
  automatedTestingList = [];
  selectedAutomatedTestingOption = [];
  isAutomatedTestingDisabled = true

  // Receipt Sort Group flag
  receiptSortGroupList = [];
  selectedReceiptSortGroupOption = [];
  isReceiptSortGroupDisabled = true

  // automated Flow Capable flag
  AutomatedFlowCapableList = [];
  selectedAutomatedFlowCapableOption = [];
  isAutomatedFlowCapableDisabled = true

  // Model Master
  isMarketModelDisabled = true;

  // Parent Master
  isParentMasterDisabled = true;
  appConfig: any;

  constructor(
    public appErrService: AppErrorService,
    public masterPageService: MasterPageService,
    public appService: AppService,
    private apiConfigService: ApiConfigService,
    private commonService: CommonService,
    private spinner: NgxSpinnerService,
    public datepipe: DatePipe,
    private snackbar: XpoSnackBar
  ) {

    const pattern = JSON.parse(localStorage.getItem(StorageData.patternList));
    if (!this.appService.checkNullOrUndefined(pattern)) {
      this.warrantyPattern = new RegExp(pattern.warrantyPattern);
      this.criteriaPattern = new RegExp(pattern.commaSeparatedPattern);
      this.truncateCommaPattern = new RegExp(pattern.truncateCommaPattern);
      this.modelPattern = new RegExp(pattern.modelPattern);
      this.namePattern = new RegExp(pattern.namePattern);
      this.textBoxPattern = new RegExp(pattern.namePattern);
    }
    this.emitHideSpinner = this.masterPageService.emitHideSpinner.subscribe(spinnerFlag => {
      if (!this.appService.checkNullOrUndefined(spinnerFlag) && spinnerFlag) {
        this.getOEMCode();
        this.controlConfig = this.masterPageService.hideControls.controlProperties;
        if (this.controlConfig.hasOwnProperty('startDT')) {
          this.minDate = new Date(this.datepipe.transform(this.controlConfig.startDT, this.controlConfig.dateFomat));
        }
      }
    });
  }

  ngOnInit() {
    this.operationObj = this.masterPageService.getRouteOperation();
    if (this.operationObj) {
      this.uiData.OperationId = this.operationObj.OperationId;
      this.uiData.OperCategory = this.operationObj.Category;
      this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
      this.controlConfigData = JSON.parse(localStorage.getItem(StorageData.controlConfig));
      this.masterPageService.hideSpinner = true;
      this.masterPageService.setTitle(this.operationObj.Title);
      this.masterPageService.setModule(this.operationObj.Module);
      localStorage.setItem(StorageData.module, this.operationObj.Module);
      this.appErrService.appMessage();

      this.dropdownSettings = new DropDownSettings();
      this.dropdownSettings.idField = 'Key';
      this.dropdownSettings.textField = 'Value';
      this.dropdownSettings.singleSelection = true;
      this.msddSettings = new DropDownSettings();
      this.msddSettings.idField = 'Key';
      this.msddSettings.textField = 'Value';
      this.msddSettings.closeDropDownOnSelection = false;
      this.appConfig = JSON.parse(localStorage.getItem(StorageData.appConfig));
    }
  }

  // on oem code
  oemCodeChange(event) {
    this.modelMaster.OEM_CD = event;
    this.searchedOEMCode = event;
    this.searchedModel = null;
    this.isOEMCodeDisabled = true;
    this.isModelDisabled = false;
    this.appService.setFocus('model');
    this.isSearchBtnDisabled = false;
    this.enableOrDisableMasterFields(false);
    this.appErrService.clearAlert();
  }

  oemCodeDeSelect() {
    this.selectedOemCode = [];
    this.searchedOEMCode = null;
    this.searchedModel = null;
    this.modelMaster.OEM_CD = null;
  }

  changeInput(event) {
    if (event.value) {
      this.searchedModel = event.value;
    } else { this.searchedModel = null; }
    this.isSearchBtnDisabled = false;
  }

  msnChange(event: MasterDropdown) {
    this.modelMaster.MSN_ENABLED = event.Key;
    this.appErrService.clearAlert();
  }

  msnDeselect() {
    this.modelMaster.MSN_ENABLED = null;
    this.selectedMSNOption = [];
  }

  internalBatteryChange(event: MasterDropdown) {
    this.modelMaster.INTERNAL_BATTERY = event.Key;
    this.appErrService.clearAlert();
  }

  internalBatteryDeSelect() {
    this.modelMaster.INTERNAL_BATTERY = null;
    this.selectedIBOption = [];
    this.appErrService.clearAlert();
  }

  autoPrintChange(event: MasterDropdown) {
    this.modelMaster.AUTO_REPRINT_LABEL = event.Key;
    this.appErrService.clearAlert();
  }

  autoPrintDeSelect() {
    this.modelMaster.AUTO_REPRINT_LABEL = null;
    this.selectedautoPrintOption = [];
    this.appErrService.clearAlert();
  }

  flashChange(event: MasterDropdown) {
    this.modelMaster.FLASH_ELIGIBILE = event.Key;
    this.appErrService.clearAlert();
  }

  flashDeselect() {
    this.modelMaster.FLASH_ELIGIBILE = null;
    this.selectedFlashOption = [];
    this.appErrService.clearAlert();
  }

  dataRChange(event: MasterDropdown) {
    this.modelMaster.DATAR_ELIGIBLE = event.Key;
    this.appErrService.clearAlert();
  }

  dataRDeselect() {
    this.modelMaster.DATAR_ELIGIBLE = null;
    this.selectedDataROption = [];
    this.appErrService.clearAlert();
  }

  factoryResetChange(event: MasterDropdown) {
    this.modelMaster.FACTORY_RESET_ELIGIBLE = event.Key;
    this.appErrService.clearAlert();
  }

  factoryResetDeselect() {
    this.modelMaster.FACTORY_RESET_ELIGIBLE = null;
    this.selectedFactoryResetOption = [];
    this.appErrService.clearAlert();
  }

  factoryTestChange(event: MasterDropdown) {
    this.modelMaster.FUNCTION_TEST_ELIGIBLE = event.Key;
    this.appErrService.clearAlert();
  }

  factoryTestDeselect() {
    this.modelMaster.FUNCTION_TEST_ELIGIBLE = null;
    this.selectedFactoryTestOption = [];
    this.appErrService.clearAlert();
  }

  osTypeChange(event: MasterDropdown) {
    this.modelMaster.OS_TYPE = event.Key;
    this.appErrService.clearAlert();
  }

  osTypeDeselect() {
    this.modelMaster.OS_TYPE = null;
    this.selectedOsTypeOption = [];
    this.appErrService.clearAlert();
  }


  tireChange(event: MasterDropdown) {
    this.modelMaster.TIER = event.Key;
    this.appErrService.clearAlert();
  }

  tireDeselect() {
    this.modelMaster.TIER = null;
    this.selectedTireOption = [];
    this.appErrService.clearAlert();
  }

  obsoluteFlagChange(event: MasterDropdown) {
    this.modelMaster.OBSOLETE_FLAG = event.Key;
    this.appErrService.clearAlert();
  }

  obsoluteFlagDeselect() {
    this.modelMaster.OBSOLETE_FLAG = null;
    this.selectedObsoluteFlagOption = [];
    this.appErrService.clearAlert();
  }

  modelClassChange(event: MasterDropdown) {
    this.modelMaster.MODEL_CLASS = event.Key;
    this.appErrService.clearAlert();
  }

  modelClassDeselect() {
    this.modelMaster.MODEL_CLASS = null;
    this.selectedModelClassOption = [];
    this.appErrService.clearAlert();
  }

  endOfLifeIndChange(event: MasterDropdown) {
    this.modelMaster.ENDOFLIFE_IND = event.Key;
    this.appErrService.clearAlert();
  }

  endOfLifeIndDeselect() {
    this.modelMaster.ENDOFLIFE_IND = null;
    this.selectedEndOfLifeIndOption = [];
    this.appErrService.clearAlert();
  }

  secondaryCIFlagChange(event: MasterDropdown) {
    this.modelMaster.SECOND_CI_FLAG = event.Key;
    this.appErrService.clearAlert();
  }

  secondaryCIDeSelect() {
    this.selectedsecondCIFlag = [];
    this.modelMaster.SECOND_CI_FLAG = null;
    this.appErrService.clearAlert();
  }

  constrainedChange(event: MasterDropdown) {
    this.modelMaster.CONSTRAINEDYN = event.Key;
    this.appErrService.clearAlert();
  }

  constrainedDeSelect() {
    this.selectedConstrained = [];
    this.modelMaster.CONSTRAINEDYN = null;
    this.appErrService.clearAlert();
  }

  automatedCleaningChange(event: MasterDropdown) {
    this.modelMaster.AUTOMATED_CLEANING = event.Key;
    this.appErrService.clearAlert();
  }

  automatedCleaningDeselect() {
    this.modelMaster.AUTOMATED_CLEANING = null;
    this.selectedAutomatedCleaningOption = [];
    this.appErrService.clearAlert();
  }
  automatedGradingChange(event: MasterDropdown) {
    this.modelMaster.AUTOMATED_GRADING = event.Key;
    this.appErrService.clearAlert();
  }

  automatedGradingDeselect() {
    this.modelMaster.AUTOMATED_GRADING = null;
    this.selectedAutomatedGradingOption = [];
    this.appErrService.clearAlert();
  }
  automatedPreProcessingChange(event: MasterDropdown) {
    this.modelMaster.AUTOMATED_PREPROC = event.Key;
    this.appErrService.clearAlert();
  }

  automatedPreProcessingDeselect() {
    this.modelMaster.AUTOMATED_PREPROC = null;
    this.selectedAutomatedPreProcessingOption = [];
    this.appErrService.clearAlert();
  }
  automatedPostProcessingChange(event: MasterDropdown) {
    this.modelMaster.AUTOMATED_POSTPROC = event.Key;
    this.appErrService.clearAlert();
  }

  automatedPostProcessingDeselect() {
    this.modelMaster.AUTOMATED_POSTPROC = null;
    this.selectedAutomatedPostProcessingOption = [];
    this.appErrService.clearAlert();
  }
  automatedTestingChange(event: MasterDropdown) {
    this.modelMaster.AUTOMATED_TESTING = event.Key;
    this.appErrService.clearAlert();
  }

  automatedTestingDeselect() {
    this.modelMaster.AUTOMATED_TESTING = null;
    this.selectedAutomatedTestingOption = [];
    this.appErrService.clearAlert();
  }

  automatedFlowCapableChange(event: MasterDropdown) {
    this.modelMaster.AUTOMATED_FLOW_CAPABLE = event.Key;
    this.appErrService.clearAlert();
  }

  automatedFlowCapableDeselect() {
    this.modelMaster.AUTOMATED_FLOW_CAPABLE = null;
    this.selectedAutomatedFlowCapableOption = [];
    this.appErrService.clearAlert();
  }
  receiptSortGroupChange(event: MasterDropdown) {
    this.modelMaster.RECEIPT_SORT_GROUP = event.Key;
    this.appErrService.clearAlert();
  }

  receiptSortGroupDeselect() {
    this.modelMaster.RECEIPT_SORT_GROUP = null;
    this.selectedReceiptSortGroupOption = [];
    this.appErrService.clearAlert();
  }

  parserChange(event) {
    if (this.isEditMode) {
      // on edit mode updateing  model master parser string
      if (!this.appService.checkNullOrUndefined(this.modelMaster.PARSER_ELIGIBILITY)) {
        const parserOutput: any[] = this.modelMaster.PARSER_ELIGIBILITY.split('');
        if (parserOutput.indexOf(event.Key) === -1) {
          parserOutput.push(event.Key);
        }
        this.modelMaster.PARSER_ELIGIBILITY = (parserOutput.toString()).split(',').join('');
      } else {
        this.checkParserEligibleKeys(event);
      }
    } else {
      this.checkParserEligibleKeys(event);
    }
    this.appErrService.clearAlert();
  }

  private checkParserEligibleKeys(event: any) {
    if (this.parserSelectedKeys.indexOf(event.Key) === -1) {
      this.parserSelectedKeys.push(event.Key);
    }
    this.modelMaster.PARSER_ELIGIBILITY = (this.parserSelectedKeys.toString()).split(',').join('');
  }

  parserDeSelect(event) {
    if (this.isEditMode) {
      // on edit mode updateing  model master parser string
      if (!this.appService.checkNullOrUndefined(this.modelMaster.PARSER_ELIGIBILITY)) {
        const parserOutput: any[] = this.modelMaster.PARSER_ELIGIBILITY.split('');
        const result: any[] = parserOutput.filter(ele => ele !== event.Key);
        this.modelMaster.PARSER_ELIGIBILITY = (result.toString()).split(',').join('');
      }
    } else {
      const parserItems: any[] = this.parserSelectedKeys.filter(ele => ele !== event.Key);
      this.modelMaster.PARSER_ELIGIBILITY = (parserItems.toString()).split(',').join('');
    }
    this.appErrService.clearAlert();
  }

  killSwitchChange(event) {
    this.modelMaster.KILL_SWITCH_FLAG = event.Key;
    this.appErrService.clearAlert();
  }

  killSwitchDeSelect() {
    this.selectedkillSwitch = null;
    this.modelMaster.KILL_SWITCH_FLAG = null;
  }






  // software version Start date change
  onStartDateChange(event) {
    if (!this.appService.checkNullOrUndefined(event)) {
      this.rxSoftwareVersions.START_DT = this.getDateTime(event);
      this.isEndDateDisabled = false;
      this.endMinDate = new Date(this.rxSoftwareVersions.START_DT);
      this.endMinDate.setDate(+this.datepipe.transform(this.rxSoftwareVersions.START_DT, 'dd'));
      if (!this.appService.checkNullOrUndefined(this.rxSoftwareVersions.END_DT)) {
        if (new Date(this.rxSoftwareVersions.END_DT) < new Date(this.rxSoftwareVersions.START_DT)) {
          this.appErrService.setAlert(this.appService.getErrorText('2660074'), true);
          this.rxSoftwareVersions.END_DT = null;
        } else {
          this.appErrService.clearAlert();
        }
      }
    }
  }

  // software version end date change
  onEndDateChange(event) {
    if (!this.appService.checkNullOrUndefined(event)) {
      this.rxSoftwareVersions.END_DT = this.getDateTime(event);
      this.appErrService.clearAlert();
    }
  }

  // lanch Data
  onLaunchDateChange(event) {
    if (!this.appService.checkNullOrUndefined(event)) {
      this.modelMaster.LAUNCH_DATE = this.getDateTime(event);
      this.appErrService.clearAlert();
    }
  }

  // on model row selection master tab grid
  editModelMaster(event: RxModel) {
    if (!this.isEditMode) {
      this.isEditMode = true;
    }
    this.isOEMCodeDisabled = true;
    this.isModelDisabled = true;
    this.enableOrDisableMasterFields(false);
    this.modelMaster = Object.assign(this.modelMaster, event);
    if (!this.appService.checkNullOrUndefined(this.modelMaster.PARSER_ELIGIBILITY)) {
      const parserOutput: any[] = this.modelMaster.PARSER_ELIGIBILITY.split('');
      this.getSelectedParserItems(parserOutput);
    } else {
      this.selectedParserItems = [];
    }
    this.selectedOemCode = this.oemCodeList.filter(e => e === this.modelMaster.OEM_CD);
    this.selectedsecondCIFlag = this.secondCIFlagList.filter(e => e.Key === this.modelMaster.SECOND_CI_FLAG);
    this.selectedConstrained = this.constrainedList.filter(e => e.Key === this.modelMaster.CONSTRAINEDYN);
    this.selectedkillSwitch = this.killSwitchFlagList.filter(e => e.Key === this.modelMaster.KILL_SWITCH_FLAG);
    this.selectedMSNOption = this.msnOptionList.filter(e => e.Key === this.modelMaster.MSN_ENABLED);
    this.selectedFactoryResetOption = this.factoryResetList.filter(e => e.Key === this.modelMaster.FACTORY_RESET_ELIGIBLE);
    this.selectedFactoryTestOption = this.factoryTestList.filter(e => e.Key === this.modelMaster.FUNCTION_TEST_ELIGIBLE);
    this.selectedOsTypeOption = this.osTypeList.filter(e => e.Key === this.modelMaster.OS_TYPE);
    this.selectedTireOption = this.tireList.filter(e => e.Key === this.modelMaster.TIER);
    this.selectedObsoluteFlagOption = this.obsoluteFlagList.filter(e => e.Key === this.modelMaster.OBSOLETE_FLAG);
    this.selectedModelClassOption = this.modelClassList.filter(e => e.Key === this.modelMaster.MODEL_CLASS);
    this.selectedEndOfLifeIndOption = this.endOfLifeIndList.filter(e => e.Key === this.modelMaster.ENDOFLIFE_IND);
    if (!this.appService.checkNullOrUndefined(event.LAUNCH_DATE)) {
      this.modelMaster.LAUNCH_DATE = this.datepipe.transform(event.LAUNCH_DATE, this.controlConfig.dateFomat);
    }
    this.selectedFlashOption = this.flashEligibleList.filter(e => e.Key === this.modelMaster.FLASH_ELIGIBILE);
    this.selectedDataROption = this.dataRList.filter(e => e.Key === this.modelMaster.DATAR_ELIGIBLE);
    this.selectedIBOption = this.internalBatteryList.filter(e => e.Key === this.modelMaster.INTERNAL_BATTERY);
    this.selectedautoPrintOption = this.autoPrintOptionList.filter(e => e.Key === this.modelMaster.AUTO_REPRINT_LABEL);
    this.selectedAutomatedCleaningOption = this.automatedCleaningList.filter(e => e.Key === this.modelMaster.AUTOMATED_CLEANING);
    this.selectedAutomatedGradingOption = this.automatedGradingList.filter(e => e.Key === this.modelMaster.AUTOMATED_GRADING);
    this.selectedAutomatedPreProcessingOption = this.automatedPreProcessingList.filter(e => e.Key === this.modelMaster.AUTOMATED_PREPROC);
    this.selectedAutomatedPostProcessingOption = this.automatedPostProcessingList.filter(e => e.Key === this.modelMaster.AUTOMATED_POSTPROC);
    this.selectedAutomatedTestingOption = this.automatedTestingList.filter(e => e.Key === this.modelMaster.AUTOMATED_TESTING);
    this.selectedReceiptSortGroupOption = this.receiptSortGroupList.filter(e => e.Key === this.modelMaster.RECEIPT_SORT_GROUP);
    this.selectedAutomatedFlowCapableOption = this.AutomatedFlowCapableList.filter(e => e.Key === this.modelMaster.AUTOMATED_FLOW_CAPABLE);
    this.getModelMaster(this.modelMaster);
  }

  // on edit binding selected parser items
  getSelectedParserItems(selectedParserItems) {
    this.selectedParserItems = this.parserEligibilityOptions.filter(e => selectedParserItems.includes(e.Key));
  }
  // on edit binding selected parser items
  getSelectedAutoCleningItems(selectedAutomatedCleaningOption) {
    this.selectedAutomatedCleaningOption = this.automatedCleaningList.filter(e => selectedAutomatedCleaningOption.includes(e.Key));
  }

  // sw version row selection in attribute tab grid
  editModelSoftwareDtl(event) {
    if (!this.isEditMode) {
      this.isEditMode = true;
    }
    this.hideSWVersionAdd = true;
    this.tesmpSoftwareVersionList = [];
    this.tempSoftwareVersionResponse = null;
    this.rxSoftwareVersions = Object.assign(this.rxSoftwareVersions, event);
    if (!this.appService.checkNullOrUndefined(event.START_DT)) {
      this.rxSoftwareVersions.START_DT = this.datepipe.transform(event.START_DT, this.controlConfig.dateFomat);
    }
    if (!this.appService.checkNullOrUndefined(event.END_DT)) {
      this.rxSoftwareVersions.END_DT = this.datepipe.transform(event.END_DT, this.controlConfig.dateFomat);
    }
  }

  // get OEM code
  getOEMCode() {
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    this.commonService.commonApiCall(this.apiConfigService.getOEMCodeUrl, requestObj, (res, statusFlag) => {
      this.getModelMasterFields();
      this.getTypeCode();
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          if (res.Response.length) {
            this.oemCodeList = res.Response;
          }
        }
      }
    });
  }

  // get model master fields
  getModelMasterFields() {
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    this.commonService.commonApiCall(this.apiConfigService.getModelMasterFieldsUrl, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          if (res.Response.hasOwnProperty('ACTIVE') && !checkNullorUndefined(res.Response.ACTIVE)) {
            this.activeList = res.Response.ACTIVE;
          }
          if (res.Response.hasOwnProperty('SecondCIFlag') && !checkNullorUndefined(res.Response.SecondCIFlag)) {
            this.secondCIFlagList = res.Response.SecondCIFlag;
          }
          if (res.Response.hasOwnProperty('KILL_SWITCH_FLAG') && !checkNullorUndefined(res.Response.KILL_SWITCH_FLAG)) {
            this.killSwitchFlagList = res.Response.KILL_SWITCH_FLAG;
          }
          if (res.Response.hasOwnProperty('PARSER_ELIGIBILITY') && !checkNullorUndefined(res.Response.PARSER_ELIGIBILITY)) {
            this.parserEligibilityOptions = this.getParserEligilityItems(res.Response.PARSER_ELIGIBILITY);
          }
          if (res.Response.hasOwnProperty('CONSTRAINEDYN') && !checkNullorUndefined(res.Response.CONSTRAINEDYN)) {
            this.constrainedList = res.Response.CONSTRAINEDYN;
          }
          if (res.Response.hasOwnProperty('MSN_ENABLED') && !checkNullorUndefined(res.Response.MSN_ENABLED)) {
            this.msnOptionList = res.Response.MSN_ENABLED;
          }
          if (res.Response.hasOwnProperty('FLASH_ELIGIBILE') && !checkNullorUndefined(res.Response.FLASH_ELIGIBILE)) {
            this.flashEligibleList = res.Response.FLASH_ELIGIBILE;
          }
          if (res.Response.hasOwnProperty('DATAR_ELIGIBLE') && !checkNullorUndefined(res.Response.DATAR_ELIGIBLE)) {
            this.dataRList = res.Response.DATAR_ELIGIBLE;
          }
          if (res.Response.hasOwnProperty('FACTORY_RESET_ELIGIBLE') && !checkNullorUndefined(res.Response.FACTORY_RESET_ELIGIBLE)) {
            this.factoryResetList = res.Response.FACTORY_RESET_ELIGIBLE;
          }
          if (res.Response.hasOwnProperty('FUNCTION_TEST_ELIGIBLE') && !checkNullorUndefined(res.Response.FUNCTION_TEST_ELIGIBLE)) {
            this.factoryTestList = res.Response.FUNCTION_TEST_ELIGIBLE;
            this.selectedFactoryTestOption = this.factoryTestList.filter(e => e.Key === CommonEnum.yes);
            this.modelMaster.FUNCTION_TEST_ELIGIBLE = CommonEnum.yes;
          }
          if (res.Response.hasOwnProperty('TIER') && !checkNullorUndefined(res.Response.TIER)) {
            this.tireList = res.Response.TIER;
          }
          if (res.Response.hasOwnProperty('OBSOLETE_FLAG') && !checkNullorUndefined(res.Response.OBSOLETE_FLAG)) {
            this.obsoluteFlagList = res.Response.OBSOLETE_FLAG;
          }
          if (res.Response.hasOwnProperty('MODEL_CLASS') && !checkNullorUndefined(res.Response.MODEL_CLASS)) {
            this.modelClassList = res.Response.MODEL_CLASS;
          }
          if (res.Response.hasOwnProperty('ENDOFLIFE_IND') && !checkNullorUndefined(res.Response.ENDOFLIFE_IND)) {
            this.endOfLifeIndList = res.Response.ENDOFLIFE_IND;
          }
          if (res.Response.hasOwnProperty('OS_TYPE') && !checkNullorUndefined(res.Response.OS_TYPE)) {
            this.osTypeList = res.Response.OS_TYPE;
          }
          if (res.Response.hasOwnProperty('INTERNAL_BATTERY') && !checkNullorUndefined(res.Response.INTERNAL_BATTERY)) {
            this.internalBatteryList = res.Response.INTERNAL_BATTERY;
          }
          if (res.Response.hasOwnProperty('AUTO_REPRINT') && !checkNullorUndefined(res.Response.AUTO_REPRINT)) {
            this.autoPrintOptionList = res.Response.AUTO_REPRINT;
          }
          if (res.Response.hasOwnProperty('AUTOMATED_CLEANING') && !checkNullorUndefined(res.Response.AUTOMATED_CLEANING)) {
            this.automatedCleaningList = res.Response.AUTOMATED_CLEANING;
          }
          if (res.Response.hasOwnProperty('AUTOMATED_GRADING') && !checkNullorUndefined(res.Response.AUTOMATED_GRADING)) {
            this.automatedGradingList = res.Response.AUTOMATED_GRADING;
          }
          if (res.Response.hasOwnProperty('AUTOMATED_PREPROC') && !checkNullorUndefined(res.Response.AUTOMATED_PREPROC)) {
            this.automatedPreProcessingList = res.Response.AUTOMATED_PREPROC;
          }
          if (res.Response.hasOwnProperty('AUTOMATED_POSTPROC') && !checkNullorUndefined(res.Response.AUTOMATED_POSTPROC)) {
            this.automatedPostProcessingList = res.Response.AUTOMATED_POSTPROC;
          }
          if (res.Response.hasOwnProperty('AUTOMATED_TESTING') && !checkNullorUndefined(res.Response.AUTOMATED_TESTING)) {
            this.automatedTestingList = res.Response.AUTOMATED_TESTING;
          }
          if (res.Response.hasOwnProperty('RECEIPT_SORT_GROUP') && !checkNullorUndefined(res.Response.RECEIPT_SORT_GROUP)) {
            this.receiptSortGroupList = res.Response.RECEIPT_SORT_GROUP;
          }
          if (res.Response.hasOwnProperty('AUTOMATED_FLOW_CAPABLE') && !checkNullorUndefined(res.Response.AUTOMATED_FLOW_CAPABLE)) {
            this.AutomatedFlowCapableList = res.Response.AUTOMATED_FLOW_CAPABLE;
          }
        }
      }
    });
  }

  // showing drop down values with key-value
  getParserEligilityItems(response) {
    const parserList = [];
    if (response.length) {
      response.forEach(element => {
        parserList.push({ Key: element.Key, Value: (String.Join('-', element.Key, element.Value)) });
      });
      return parserList;
    } else { return parserList; }
  }

  // get list of models on search
  getModelMasterList() {
    this.tabReseting();
    this.spinner.show();
    this.isSearchBtnDisabled = true;
    // this.searchedModel = this.modelMaster.MODEL;
    this.modelSearchObj = {
      OEM_CD: this.searchedOEMCode,
      MODEL: this.searchedModel
    };
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_MODEL: this.modelSearchObj };
    const url = String.Join('/', this.apiConfigService.getModelMasterListUrl);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          if (res.Response.ModelList.length) {
            this.clearOnSearch();
            this.isSearch = true;
            this.grid = new Grid();
            this.grid.EditVisible = true;
            if (this.appConfig.hasOwnProperty('fileName') && this.appConfig.fileName.hasOwnProperty('ModelMaster')) {
              this.grid.FileName = this.appConfig.fileName.ModelMaster;
            }
            this.modelMasterResponse = res.Response.ModelList;
            const response = this.onProcessModelMasterJSONGrid(res.Response.ModelList);
            this.modelMasterList = this.appService.onGenerateJson(response, this.grid);
          }
        }
      }
    });
  }

  // get model master
  getModelMaster(modelMaster: RxModel) {
    this.tabReseting();
    this.spinner.show();
    const editModeMasterObj = {
      OEM_CD: modelMaster.OEM_CD,
      MODEL: modelMaster.MODEL
    };
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_MODEL: editModeMasterObj };
    const url = String.Join('/', this.apiConfigService.getModelMasterUrl);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          if (res.Response.length) {
            this.modelMasterResponse = res.Response;
            const tempAtttributes = this.modelMasterResponse.find(ele => ele.MODEL === this.modelMaster.MODEL);
            if (tempAtttributes.rX_SOFTWARE_VERSIONs.length) {
              const swvGrid = new Grid();
              swvGrid.EditVisible = true;
              this.softwareVersionDetails = this.appService.onGenerateJson(tempAtttributes.rX_SOFTWARE_VERSIONs, swvGrid);
              this.softwareVersionDetails.ImportVisible = false;
            }
            setTimeout(() => {
              if (tempAtttributes.rX_MODEL_ATTRIBUTEs.length) {
                const attributeGrid = new Grid();
                // attributeGrid.EditVisible = true;
                attributeGrid.ItemsPerPage = 5;
                this.attributeList = this.appService.onGenerateJson(tempAtttributes.rX_MODEL_ATTRIBUTEs, attributeGrid);
                // this.attributeList.ImportVisible = false;               
                if (this.appConfig.hasOwnProperty('fileName') && this.appConfig.fileName.hasOwnProperty('ModelAttribute')) {
                  this.attributeList.FileName = this.appConfig.fileName.ModelAttribute;
                }

              }
            }, 1000);
          }
        }
      }
    });
  }

  //#region Attribute section
  // type code selection
  typeCodeChange(event) {
    if (!this.isAttributeEdit) {
      this.rxModelAttribute = new RxModelAttributes();
    }
    this.rxModelAttribute.TYPE_CD = event.Key;
    this.typeCodeObj = this.typeCodesResponse.find(ele => ele.typecode === event.Key);
    this.appErrService.clearAlert();
    this.getCriteriaLbl();
    this.enableOrDisableAttributeValues(false);
  }

  typeCodeDeSelect() {
    this.rxModelAttribute = new RxModelAttributes();
    this.rxModelAttribute.TYPE_CD = null;
    this.typeCodeObj = null;
    this.getCriteriaLbl();
    this.enableOrDisableAttributeValues(true);
  }

  // set criteria label names based on type code selection
  getCriteriaLbl(val?) {
    if (this.typeCodeObj && this.typeCodeObj.CriteriaList.length) {
      const tempCriteria = this.typeCodeObj.CriteriaList.find(ele => ele.CRITERIA === val);
      if (tempCriteria && tempCriteria.FIELDNAME) {
        return tempCriteria.FIELDNAME;
      }
    }
  }

  // attribute row selection in attribute tab grid

  editModelAttribute(event) {
    if (!this.isEditMode) {
      this.isEditMode = true;
    }
    this.isAttributeEdit = true;
    this.isTypeCodeDisabled = true;
    this.enableOrDisableCriteria(true);
    this.enableOrDisableAttributeValues(false);
    this.selectedTypeCode = this.typeCodeList.filter(e => e.Key === event.TYPE_CD);
    if (this.selectedTypeCode.length) {
      this.rxModelAttribute = Object.assign(this.rxModelAttribute, event);
      this.typeCodeChange(this.selectedTypeCode[0]);
    }
  }
  // get type code
  getTypeCode() {
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    this.commonService.commonApiCall(this.apiConfigService.getTypeCodeUrl, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          if (res.Response.length) {
            this.typeCodesResponse = res.Response;
            this.getTypeCodeList(res.Response);
          }
        }
      }
    });
  }

  // populating typecodes in the dropdown
  getTypeCodeList(res) {
    const tcList = [];
    res.forEach(element => {
      if (tcList.indexOf(element.typecode) === -1) {
        tcList.push({ Key: element.typecode, Value: element.typecode });
      }
    });
    this.typeCodeList = tcList;
  }

  // allowuing to add multiple Attributes to model
  addAttributes() {
    if (this.isEditMode) {
      if (this.attributeList && this.attributeList.Elements.length) {
        const tempAttrObj = this.getTruncateObj(this.rxModelAttribute, this.truncateCommaPattern);
        this.rxModelAttribute = tempAttrObj;
        const checkAttribute = this.attributeList.Elements.find(e => (e.TYPE_CD === this.rxModelAttribute.TYPE_CD
          && e.CRITERIA1 === this.rxModelAttribute.CRITERIA1
          && e.CRITERIA2 === this.rxModelAttribute.CRITERIA2
          && e.VALUE1 === this.rxModelAttribute.VALUE1));
        if (!checkAttribute) {
          this.checkNewAttribute();
        } else {
          this.snackbar.error(this.appService.getErrorText('6680139'));
        }
      } else {
        this.checkNewAttribute();
      }
    } else {
      this.checkNewAttribute();
    }
    this.typeCodeDeSelect();
    this.selectedTypeCode = [];
    const tempAttributeGrid = new Grid();
    tempAttributeGrid.DeleteVisible = true;
    tempAttributeGrid.ItemsPerPage = 5;
    if (this.appConfig.hasOwnProperty('fileName') && this.appConfig.fileName.hasOwnProperty('ModelAttribute')) {
      this.grid.FileName = this.appConfig.fileName.ModelAttribute;
    }
    this.tempAttributeResResponse = this.appService.onGenerateJson(this.tempAttributeList, tempAttributeGrid);
    this.tempAttributeResResponse.ImportVisible = false;
    //if(this.appConfig.hasOwnProperty('fileName') && this.appConfig.fileName.hasOwnProperty('ModelAttribute'))
    //{
    //  this.tempAttributeResResponse.FileName = this.appConfig.fileName.ModelAttribute;
    //}

  }

  checkNewAttribute() {
    const tempAttrObj = this.getTruncateObj(this.rxModelAttribute, this.truncateCommaPattern);
    this.rxModelAttribute = tempAttrObj;
    const checkTempAttribute = this.tempAttributeList.find(e => (e.TYPE_CD === this.rxModelAttribute.TYPE_CD
      && (e.CRITERIA1 === this.rxModelAttribute.CRITERIA1)
      && e.CRITERIA2 === this.rxModelAttribute.CRITERIA2)
      && e.VALUE1 === this.rxModelAttribute.VALUE1 || this.rxModelAttribute.VALUE1 === '');
    if (!checkTempAttribute) {
      this.tempAttributeList.push(this.rxModelAttribute);
    } else {
      this.snackbar.error(this.appService.getErrorText('6680140'));
    }
  }

  deleteTempAttributeRow(attribute) {
    if (this.tempAttributeResResponse && this.tempAttributeResResponse['Elements'].length) {
      const deleteAttributeIndex = this.tempAttributeResResponse['Elements'].findIndex(c => c.TYPE_CD === attribute.TYPE_CD
        && c.CRITERIA1 === attribute.CRITERIA1
        && c.CRITERIA2 === attribute.CRITERIA2
        && c.VALUE1 === attribute.VALUE1);
      this.tempAttributeResResponse['Elements'].splice(deleteAttributeIndex, 1);
      this.tempAttributeList = this.tempAttributeResResponse['Elements'];
      if (this.tempAttributeResResponse['Elements'].length === 0) {
        this.tempAttributeResResponse['Elements'] = null;
      }
    }
  }
  //#endregion
  //#region  software Version
  addSoftwareVersion() {
    if (this.isEditMode) {
      if (this.softwareVersionDetails && this.softwareVersionDetails.Elements.length) {
        const checkSWVersion = this.softwareVersionDetails.Elements.find(e => e.SOFTWARE_VERSION === this.rxSoftwareVersions.SOFTWARE_VERSION);
        if (!checkSWVersion) {
          this.checkNewVersion();
        } else {
          this.snackbar.error(this.appService.getErrorText('6680141'));
        }
      } else {
        this.checkNewVersion();
      }

    } else {
      this.checkNewVersion();
    }
    this.rxSoftwareVersions = new RxSoftwareVersions();
    const tempSWVersionGrid = new Grid();
    tempSWVersionGrid.DeleteVisible = true;
    tempSWVersionGrid.ItemsPerPage = 5;
    this.tempSoftwareVersionResponse = this.appService.onGenerateJson(this.tesmpSoftwareVersionList, tempSWVersionGrid);
    this.tempSoftwareVersionResponse.ImportVisible = false;
  }

  checkNewVersion() {
    const checkTempSWVersion = this.tesmpSoftwareVersionList.find(e => e.SOFTWARE_VERSION === this.rxSoftwareVersions.SOFTWARE_VERSION);
    if (!checkTempSWVersion) {
      this.tesmpSoftwareVersionList.push(this.rxSoftwareVersions);
    } else {
      this.snackbar.error(this.appService.getErrorText('6680142'));
    }
  }



  deleteTempSWVersionRow(SWVersion) {
    const deleteSoftwareVersionIndex = this.tempSoftwareVersionResponse['Elements'].findIndex(c => c.SOFTWARE_VERSION === SWVersion.SOFTWARE_VERSION);
    this.tempSoftwareVersionResponse['Elements'].splice(deleteSoftwareVersionIndex, 1);
    this.tesmpSoftwareVersionList = this.tempSoftwareVersionResponse['Elements'];
    if (this.tempSoftwareVersionResponse['Elements'].length === 0) {
      this.tempSoftwareVersionResponse = null;
    }
  }
  //#endregion  software Version
  // assign model attributes and software dsetails to model objec
  assignToModel() {
    if (this.tempAttributeList.length) {
      this.modelMaster.rX_MODEL_ATTRIBUTEs = this.tempAttributeList;
    } else {
      this.modelMaster.rX_MODEL_ATTRIBUTEs = [];
    }
    if (this.hideSWVersionAdd) {
      const softwareVersionDtls = [];
      if (Object.keys(this.rxSoftwareVersions).length) {
        this.rxSoftwareVersions.OEM_CD = this.modelMaster.OEM_CD;
        this.rxSoftwareVersions.OEM_MODEL = this.modelMaster.MODEL;
        softwareVersionDtls.push(this.rxSoftwareVersions);
        this.modelMaster.rX_SOFTWARE_VERSIONs = softwareVersionDtls;
      }
    } else {
      if (this.tesmpSoftwareVersionList.length) {
        this.modelMaster.rX_SOFTWARE_VERSIONs = this.tesmpSoftwareVersionList;
      } else {
        this.modelMaster.rX_SOFTWARE_VERSIONs = [];
      }
    }
  }

  // add model master
  addOrUpdateModelMaster() {
    this.spinner.show();
    let url = '';
    this.assignToModel();
    this.modelMaster.ACTIVE = CommonEnum.yes;
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_MODEL: this.modelMaster };
    if (!this.isEditMode) {
      url = this.apiConfigService.addModelMasterUrl;
    } else {
      url = String.Join('/', this.apiConfigService.updateModelMasterUrl, this.modelMaster.MODEL, this.modelMaster.OEM_CD);
    }
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        this.clear();
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          if (res.Response.length) {
            this.getModelMasterList();
          }
        }
        if (res.StatusMessage !== '') {
          this.snackbar.success(res.StatusMessage);
        }
      }
    });
  }

  //  building master grid obj
  onProcessModelMasterJSONGrid(Response) {
    if (!this.appService.checkNullOrUndefined(Response)) {
      const modelMasterList = [];
      const headingsobj = Object.keys(Response[0]);
      Response.forEach(res => {
        const element: RxModel = new RxModel();
        headingsobj.forEach(singleheader => {
          if (!Array.isArray(res[singleheader])) {
            if (singleheader !== 'rX_MODEL_ATTRIBUTEs' && singleheader !== 'rX_SOFTWARE_VERSIONs') {
              element[singleheader] = res[singleheader];
            }
          }
        });
        modelMasterList.push(element);
      });
      return modelMasterList;
    }
  }

  // removing comma from start and end
  getTruncateObj(obj, pattern) {
    if (!this.appService.checkNullOrUndefined(obj)) {
      Object.keys(obj).forEach(element => {
        if (!this.appService.checkNullOrUndefined(obj[element])) {
          obj[element] = obj[element].replace(pattern, '');
        }
      });
      return obj;
    }
  }
  tabReseting() {
    this.staticTabs.tabs.map(tab => {
      if (tab.id === 'tab-master') {
        tab.active = true;
      } else {
        tab.active = false;
      }
    });
  }
  // current date and time
  getDateTime(date) {
    const convertedTime = new Date().toLocaleTimeString();
    const convertDate = new Date(date).toLocaleDateString();
    const datetimeConv = convertDate + ' ' + convertedTime;
    return this.datepipe.transform(datetimeConv, this.controlConfig.dateFomat);
  }

  enableOrDisableMasterFields(val) {
    this.isSecondaryCIFlagDisabled = val;
    this.isConstrainedDisabled = val;
    this.isMSNEnabledDisabled = val;
    this.isInternalBatterDisabled = val;
    this.isAutoPrintDisabled = val;
    this.isWarrantyPatternDsiabled = val;
    this.isWarrantyOffsetDisabled = val;
    this.isContainerCapacityDisabled = val;
    this.isParserEligibilityDisabled = val;
    this.isKillSwitchDisabled = val;
    this.isFlashEligibleDisabled = val;
    this.isDataRDisbaled = val;
    this.isFactoryResetDisabled = val;
    this.isFactoryTestDisabled = val;
    this.isOsTypeDisabled = val;
    this.isModelClassDisabled = val;
    this.isEndOfLifeIndDisabled = val;
    this.isTireDisabled = val;
    this.isObsoluteFlagDisabled = val;
    this.isMarketModelDisabled = val;
    this.isParentMasterDisabled = val;
    this.isLaunchDateDisabled = val;
    this.isAutomatedCleaningDisabled = val;
    this.isAutomatedGradingDisabled = val;
    this.isAutomatedPreProcessingDisabled = val;
    this.isAutomatedPostProcessingDisabled = val;
    this.isAutomatedTestingDisabled = val;
    this.isAutomatedFlowCapableDisabled = val;
    this.isReceiptSortGroupDisabled = val;
  }

  // on typecode change enabeling  the textboxes
  enableOrDisableCriteria(val) {
    this.isCriteria1Disabled = val;
    this.isCriteria2Disabled = val;
    this.isCriteria3Disabled = val;
    this.isCriteria4Disabled = val;
    this.isCriteria5Disabled = val;
    this.isCriteria6Disabled = val;
    this.isCriteria7Disabled = val;
    this.isCriteria8Disabled = val;
    this.isCriteria9Disabled = val;
    this.isCriteria10Disabled = val;

  }

  enableOrDisableAttributeValues(val) {
    this.isValue1Disabled = val;
    this.isValue2Disabled = val;
    this.isValue3Disabled = val;
    this.isValue4Disabled = val;
    this.isValue5Disabled = val;
  }
  clearObjects() {
    this.modelMaster = new RxModel();
    this.rxModelAttribute = new RxModelAttributes();
    this.rxSoftwareVersions = new RxSoftwareVersions();
  }

  // clear on search also
  clearOnSearch() {
    this.clearObjects();
    this.clearDropdowns();
    this.isOEMCodeDisabled = false;
    this.isModelDisabled = true;
    this.modelMasterList = null;
    this.modelMasterResponse = null;
    this.attributeList = null;
    this.softwareVersionDetails = null;
    this.typeCodeObj = null;
    this.hideSWVersionAdd = false;
    this.tempAttributeList = [];
    this.tesmpSoftwareVersionList = [];
    this.tempAttributeResResponse = null;
    this.tempSoftwareVersionResponse = null;
    this.enableOrDisableMasterFields(true);
    this.enableOrDisableCriteria(false);
    this.enableOrDisableAttributeValues(true);
    this.appErrService.clearAlert();
  }

  // cleartring Attribute form
  clearAttributeForm() {
    this.selectedTypeCode = [];
    this.isTypeCodeDisabled = false;
    this.isAttributeEdit = false;
    this.rxModelAttribute = new RxModelAttributes();
    this.typeCodeObj = null;
    this.isCriteria1Disabled = false;
    this.enableOrDisableCriteria(false);
    this.enableOrDisableAttributeValues(true);
  }

  // clearing software version form
  clearSWVersionForm() {
    this.hideSWVersionAdd = false;
    this.rxSoftwareVersions = new RxSoftwareVersions();
    this.swVersionCtrls.reset();
    this.appErrService.clearAlert();
  }

  // total form
  clear() {
    this.isSearchBtnDisabled = true;
    this.isClearDisabled = true;
    this.isTypeCodeDisabled = false;
    this.isSearch = false;
    this.isEditMode = false;
    this.isAttributeEdit = false;
    this.clearOnSearch();
    this.tabReseting();
  }

  private clearDropdowns() {
    this.selectedOemCode = [];
    this.selectedParserItems = [];
    this.selectedTypeCode = [];
    this.parserSelectedKeys = [];
    this.selectedsecondCIFlag = [];
    this.selectedConstrained = [];
    this.selectedMSNOption = [];
    this.selectedIBOption = [];
    this.selectedautoPrintOption = [];
    this.selectedFlashOption = [];
    this.selectedDataROption = [];
    this.selectedFactoryResetOption = [];
    this.selectedFactoryTestOption = [];
    this.selectedOsTypeOption = [];
    this.selectedModelClassOption = [];
    this.selectedEndOfLifeIndOption = [];
    this.selectedTireOption = [];
    this.selectedObsoluteFlagOption = [];
    this.selectedkillSwitch = [];
    this.selectedAutomatedCleaningOption = [];
    this.selectedAutomatedGradingOption = [];
    this.selectedAutomatedPreProcessingOption = [];
    this.selectedAutomatedPostProcessingOption = [];
    this.selectedAutomatedTestingOption = [];
    this.selectedReceiptSortGroupOption = [];
    this.selectedAutomatedFlowCapableOption = [];
  }

  ngOnDestroy() {
    this.modelSearchObj = new ModelSearchObj();
    this.emitHideSpinner.unsubscribe();
    this.masterPageService.defaultProperties();
  }

}
