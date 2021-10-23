import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';
import { ClientData } from '../../models/common/ClientData';
import { UiData } from '../../models/common/UiData';
import { StorageData } from '../../enums/storage.enum';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppService } from '../../utilities/rlcutl/app.service';
import { ApiConfigService } from '../../utilities/rlcutl/api-config.service';
import { CommonService } from '../../services/common.service';
import { DropDownSettings } from '../../models/common/dropDown.config';
import { Grid } from '../../models/common/Grid';
import { IVCCode, RX_IVC_CODE } from '../../models/maintenance/ivc-code-setup/ivc-code';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { CommonEnum } from '../../enums/common.enum';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ivc-setup',
  templateUrl: './ivc-setup.component.html',
  styleUrls: ['./ivc-setup.component.css']
})
export class IVCSetupComponent implements OnInit, OnDestroy {

  isEditMode = false;
  isSearchDisabled = true;
  isIVCCodeDisable = false;
  searchedIVCCOde: string;
  searchedCategory: string;
  operationObj: any;
  appConfig: any;
  controlConfig: any;

  categoryOptions = [];
  selectedCategory = [];

  clientCategoryOptions = [];
  selectedClientCategory = [];

  clientGroupSubcatOptions = [];
  selectedClientGroupSubcat = [];

  clnrProcessExcludeOptions = [];
  selectedCLNRProcessExclude = [];

  failureOptions = [];
  selectedFailure = [];

  repairBounceEligibleOptions = [];
  selectedrepairBounceEligible = [];

  repairQARQAXEligibleOptions = [];
  selectedRepairQARQAXEligible = [];

  IVCCodeList: any;
  isReportIVCCodeDisabled = false;

  // RXjs observables
  emitHideSpinner: Subscription;

  dropdownSettings: DropDownSettings;
  grid: Grid;
  clientData = new ClientData();
  uiData = new UiData();
  IVCCode = new IVCCode();
  tempIVCCode = new IVCCode();
  rxIVCCode = new RX_IVC_CODE();

  constructor(
    public appErrService: AppErrorService,
    public masterPageService: MasterPageService,
    public appService: AppService,
    private apiConfigService: ApiConfigService,
    private commonService: CommonService,
    private snackbar: XpoSnackBar,
    public spinner: NgxSpinnerService,
  ) { }

  ngOnInit() {
    this.operationObj = this.masterPageService.getRouteOperation();
    if (this.operationObj) {
      this.uiData.OperationId = this.operationObj.OperationId;
      this.uiData.OperCategory = this.operationObj.Category;
      this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
      this.masterPageService.setTitle(this.operationObj.Title);
      this.masterPageService.setModule(this.operationObj.Module);
      this.appConfig = JSON.parse(localStorage.getItem(StorageData.appConfig));
      this.controlConfig = JSON.parse(localStorage.getItem(StorageData.controlConfig));
      this.masterPageService.hideSpinner = true;
      this.emitHideSpinner = this.masterPageService.emitHideSpinner.subscribe(spinnerFlag => {
        if (!this.appService.checkNullOrUndefined(spinnerFlag) && spinnerFlag) {
          this.getIVCCodeFields();
        }
      });
      this.dropdownSettings = new DropDownSettings();
      this.dropdownSettings.idField = 'Key';
      this.dropdownSettings.textField = 'Value';
      this.dropdownSettings.singleSelection = true;
      this.ivcCodeFocus();
    }
  }

  changeInput(inputValue) {
    this.searchedIVCCOde = inputValue.value;
    this.isSearchDisabled = false;
  }

  isIVCCodeEmpty() {
    this.searchedIVCCOde = null;
    if (!this.IVCCode.CATEGORY) {
      this.isSearchDisabled = true;
    }
  }

  categoryChange(event) {
    this.isSearchDisabled = false;
    this.IVCCode.CATEGORY = event.Key;
    this.searchedCategory = event.Key;
    this.appErrService.clearAlert();
  }

  categoryDeSelect() {
    this.IVCCode.CATEGORY = null;
    this.searchedCategory = null;
    this.selectedCategory = [];
    if (!this.IVCCode.IVCCODE) {
      this.isSearchDisabled = true;
    }
  }

  clientCategoryChange(event) {
    this.IVCCode.CLIENT_CATEGORY = event.Key;
    this.appErrService.clearAlert();
  }

  clientCategoryDeSelect() {
    this.IVCCode.CLIENT_CATEGORY = null;
    this.selectedClientCategory = [];
  }

  clientGroupSubcatChange(event) {
    this.IVCCode.CLIENT_GROUP_SUBCAT = event.Key;
    this.appErrService.clearAlert();
  }

  clientGroupSubcatDeSelect() {
    this.IVCCode.CLIENT_GROUP_SUBCAT = null;
    this.selectedClientGroupSubcat = [];
  }

  failureChange(event) {
    this.IVCCode.FAILURE_YN = event.Key;
    this.appErrService.clearAlert();
  }

  failureDeSelect() {
    this.IVCCode.FAILURE_YN = null;
    this.selectedFailure = [];
  }

  clnrProcessExcludeChange(event) {
    this.IVCCode.CLNR_PROCESS_EXCLUDE_YN = event.Key;
    this.appErrService.clearAlert();
  }

  clnrProcessExcludeDeSelect() {
    this.IVCCode.CLNR_PROCESS_EXCLUDE_YN = null;
    this.selectedCLNRProcessExclude = [];
  }

  repairQARQAXEligibleChange(event) {
    this.IVCCode.REPAIR_QARQAX_ELIGIBLE_YN = event.Key;
    this.appErrService.clearAlert();
  }

  repairQARQAXEligibleDeSelect() {
    this.IVCCode.REPAIR_QARQAX_ELIGIBLE_YN = null;
    this.selectedRepairQARQAXEligible = [];
  }

  repairBounceEligibleChange(event) {
    this.IVCCode.REPAIR_BOUNCE_ELIGIBLE_YN = event.Key;
    this.appErrService.clearAlert();
  }

  repairBounceEligibleDeSelect() {
    this.IVCCode.REPAIR_BOUNCE_ELIGIBLE_YN = null;
    this.selectedrepairBounceEligible = [];
  }

  editIVCCode(event) {
    this.isEditMode = true;
    this.isIVCCodeDisable = true;
    this.appErrService.clearAlert();
    this.IVCCode = new IVCCode();
    this.tempIVCCode = new IVCCode();
    this.IVCCode = Object.assign(this.IVCCode, event);
    this.tempIVCCode = Object.assign(this.tempIVCCode, event);
    this.selectedCategory = this.categoryOptions.filter(e => e.Key === this.IVCCode.CATEGORY);
    this.selectedClientCategory = this.clientCategoryOptions.filter(e => e.Key === this.IVCCode.CLIENT_CATEGORY);
    this.selectedClientGroupSubcat = this.clientGroupSubcatOptions.filter(e => e.Key === this.IVCCode.CLIENT_GROUP_SUBCAT);
    this.selectedFailure = this.failureOptions.filter(e => e.Key === this.IVCCode.FAILURE_YN);
    this.selectedCLNRProcessExclude = this.clnrProcessExcludeOptions.filter(e => e.Key === this.IVCCode.CLNR_PROCESS_EXCLUDE_YN);
    this.selectedRepairQARQAXEligible = this.repairQARQAXEligibleOptions.filter(e => e.Key === this.IVCCode.REPAIR_QARQAX_ELIGIBLE_YN);
    this.selectedrepairBounceEligible = this.repairBounceEligibleOptions.filter(e => e.Key === this.IVCCode.REPAIR_BOUNCE_ELIGIBLE_YN);
  }

  getIVCCodeFields() {
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, UiData: this.uiData };
    this.commonService.commonApiCall(this.apiConfigService.getIVCCodeFieldslUrl, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          this.categoryOptions = res.Response.CATEGORY;
          this.clientCategoryOptions = res.Response.CLIENT_CATEGORY;
          this.clientGroupSubcatOptions = res.Response.CLIENT_GROUP_SUBCAT;
          this.clnrProcessExcludeOptions = res.Response.CLNR_PROCESS_EXCLUDE_YN;
          this.failureOptions = res.Response.FAILURE_YN;
          this.repairBounceEligibleOptions = res.Response.REPAIR_BOUNCE_ELIGIBLE_YN;
          this.repairQARQAXEligibleOptions = res.Response.REPAIR_QARQAX_ELIGIBLE_YN;
        }
        this.spinner.hide();
      }
    });
  }

  // search ivc with ivc code and category
  getIVCCodeList() {
    this.spinner.show();
    this.rxIVCCode = new RX_IVC_CODE();
    this.rxIVCCode = {
      IVCCODE: this.searchedIVCCOde,
      CATEGORY: this.searchedCategory
    };
    const requestObj = { ClientData: this.clientData, UiData: this.uiData, RX_IVC_CODE: this.rxIVCCode };
    this.commonService.commonApiCall(this.apiConfigService.getIVCCodeListUrl, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.ivcCodeFocus();
        if (res.Response.IVCCodeList.length) {
          this.grid = new Grid();
          this.grid.EditVisible = true;
          this.IVCCodeList = this.appService.onGenerateJson(res.Response.IVCCodeList, this.grid);
        }
        this.spinner.hide();
      } else {
        this.IVCCodeList = null;
      }
    });
  }

  saveOrUpdateIVCCode() {
    this.spinner.show();
    this.IVCCode.ACTIVE = CommonEnum.yes;
    const requestObj = { ClientData: this.clientData, UiData: this.uiData, RX_IVC_CODE: this.IVCCode };
    let url = '';
    if (this.isEditMode) {
      if (this.appService.IsObjectsMatch(this.IVCCode, this.tempIVCCode)) {
        this.snackbar.info(this.appService.getErrorText('2660043'));
        this.spinner.hide();
        return;
      }
      url = this.apiConfigService.updateIVCCodeUrl;
    } else {
      url = this.apiConfigService.addIVCCodeUrl;
    }
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.snackbar.success(res.StatusMessage);
        this.Clear();
        this.grid = new Grid();
        this.grid.EditVisible = true;
        this.IVCCodeList = this.appService.onGenerateJson(res.Response, this.grid);
        this.spinner.hide();
      }
    });
  }

  ivcCodeFocus() {
    this.appService.setFocus('ivcCode');
  }

  getBtnName() {
    if (this.isEditMode) {
      return CommonEnum.update;
    } else {
      return CommonEnum.save;
    }
  }


  Clear() {
    this.isIVCCodeDisable = false;
    this.isEditMode = false;
    this.isSearchDisabled = true;
    this.IVCCodeList = null;
    this.searchedIVCCOde = '';
    this.searchedCategory = '';
    this.selectedCategory = [];
    this.selectedClientCategory = [];
    this.selectedClientGroupSubcat = [];
    this.selectedFailure = [];
    this.selectedCLNRProcessExclude = [];
    this.selectedRepairQARQAXEligible = [];
    this.selectedrepairBounceEligible = [];
    this.ivcCodeFocus();
    this.appErrService.clearAlert();
    this.IVCCode = new IVCCode();
  }

  ngOnDestroy() {
    this.emitHideSpinner.unsubscribe();
    this.masterPageService.defaultProperties();
  }
}
