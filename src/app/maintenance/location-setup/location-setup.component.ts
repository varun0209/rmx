import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';
import { ClientData } from '../../models/common/ClientData';
import { UiData } from '../../models/common/UiData';
import { CommonEnum } from '../../enums/common.enum';
import { ApiConfigService } from '../../utilities/rlcutl/api-config.service';
import { ApiService } from '../../utilities/rlcutl/api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { String } from 'typescript-string-operations';
import { Grid } from '../../models/common/Grid';
import { AppService } from '../../utilities/rlcutl/app.service';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';

import { LocationSetupConfig } from '../../models/maintenance/location-setup/LocationSetup';
import { MessageType } from '../../enums/message.enum';
import { StatusCodes } from '../../enums/status.enum';
import { dropdown } from '../../models/common/Dropdown';
import { CommonService } from '../../services/common.service';
import { StorageData } from '../../enums/storage.enum';
import { checkNullorUndefined } from '../../enums/nullorundefined';

@Component({
  selector: 'app-location-setup',
  templateUrl: './location-setup.component.html',
  styleUrls: ['./location-setup.component.css']
})
export class LocationSetupComponent implements OnInit, OnDestroy {

  // config 
  locationSetupConfig = new LocationSetupConfig();
  tempLocationSetupConfig = new LocationSetupConfig();
  clientData = new ClientData();
  uiData = new UiData();
  locationBtnName = CommonEnum.add;
  commonEnum = CommonEnum;
  configData: any;
  appConfig: any;

  // disabled
  isLocDisabled = false;
  isLocSearchBtnDisabled = false;
  isClearBtnDisabled = true;

  // Dropdown List
  sectionKeyOptionsOrg = [];
  sectionKeyOptions = [];
  INVAccountOptions = [];
  moveTrackingReasonOptions = [];

  locationList: any[];
  grid: Grid;
  moveTrackingReason = [];
  editTypeAhead: any;
  clearTypeAhead = false;

  dropdownSettings = {
    singleSelection: true,
    idField: 'Id',
    textField: 'Text',
    itemsShowLimit: 3,
    allowSearchFilter: true,
    closeDropDownOnSelection: true
  };


  constructor(
    public appErrService: AppErrorService,
    public masterPageService: MasterPageService,
    private apiConfigService: ApiConfigService,
    private commonService: CommonService,
    public apiservice: ApiService,
    private spinner: NgxSpinnerService,
    public appService: AppService,
    private snackbar: XpoSnackBar,
  ) {
  }

  ngOnInit() {
    let operationObj = this.masterPageService.getRouteOperation();
    if (operationObj) {
      this.uiData.OperationId = operationObj.OperationId;
      this.uiData.OperCategory = operationObj.Category;
      this.clientData = JSON.parse(localStorage.getItem("clientData"));
      this.masterPageService.setTitle(operationObj.Title);
      this.masterPageService.setModule(operationObj.Module);
      this.locationSetupConfig.ACTIVE = CommonEnum.yes;
      this.masterPageService.hideSpinner = true;
      this.getSectionKeys();
      this.appConfig = JSON.parse(localStorage.getItem(StorageData.appConfig));
      this.appService.setFocus('location');
      this.configData = {
        uiData: this.uiData,
        url: this.apiConfigService.getParentLocations,
        requestObj: { ClientData: this.clientData, UIData: this.uiData },
        listName: 'ParentLocations'
      };
    }
  }


  //getLocation
  getLocation() {
    this.locationList = null;
    this.appErrService.clearAlert();
    this.spinner.show();
    let requestObj = { ClientData: this.clientData, UIData: this.uiData };
    let url = String.Join("/", this.apiConfigService.getLocation, this.locationSetupConfig.LOC);
    this.apiservice.apiPostRequest(url, requestObj)
      .subscribe(response => {
        this.spinner.hide();
        let res = response.body;
        if (res.Status === "PASS" && !checkNullorUndefined(res)) {
          if (!checkNullorUndefined(res.Response)) {
            this.showGrid(res.Response['Locations']);
          }
        } else if (res.Status === "FAIL") {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, error => {
        this.appErrService.handleAppError(error);
      });
  }

  // getLocation
  getMoveTrackingReasonValues() {
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getMoveTrackingReasonValues);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      // this.getLocationParents();
      this.spinner.hide();
      if (statusFlag && res.Response.hasOwnProperty('MoveTrackingReasonValues') && res.Response['MoveTrackingReasonValues'].length) {
        this.moveTrackingReasonOptions = res.Response['MoveTrackingReasonValues'];
      }
    });
  }

  // getSectionKeys
  getSectionKeys() {
    this.spinner.show();
    this.sectionKeyOptions = [];
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const getSectionKeysUrl = String.Join("/", this.apiConfigService.getSectionKeys);
    this.apiservice.apiPostRequest(getSectionKeysUrl, requestObj)
      .subscribe(response => {
        const res = response.body;
        this.getMoveTrackingReasonValues();
        if (!checkNullorUndefined(res) && res.Status === StatusCodes.pass) {
          if (!checkNullorUndefined(res.Response) && res.Response['SectionKeys'].length) {
            this.sectionKeyOptionsOrg = res.Response['SectionKeys'];
            res.Response['SectionKeys'].forEach((element) => {
              const dd: dropdown = new dropdown();
              dd.Id = element.Id;
              dd.Text = element.Id;
              this.sectionKeyOptions.push(dd);
            });
          }
        } else if (!checkNullorUndefined(res) && res.Status === StatusCodes.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, error => {
        this.appErrService.handleAppError(error);
      });
  }

  //getOperators
  addOrUpdateLocationInfo() {
    let url;
    if (this.locationBtnName == CommonEnum.add) {
      url = String.Join("/", this.apiConfigService.addLocation);
      this.addOrUpdateLoc(url);
    } else if (this.locationBtnName == CommonEnum.save) {
      if (this.appService.IsObjectsMatch(this.locationSetupConfig, this.tempLocationSetupConfig)) {
        this.snackbar.info(this.appService.getErrorText('2660043'));
        return;
      }
      url = String.Join("/", this.apiConfigService.updateLocation);
      this.validateInvData(url);
    }

  }

  addOrUpdateLoc(url) {
    this.spinner.show();
    this.appErrService.clearAlert();
    let requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_LOC: this.locationSetupConfig };
    this.apiservice.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let res = response.body;
        if (res.Status === "PASS" && !checkNullorUndefined(res)) {
          this.showGrid(res.Response['Locations']);
          this.snackbar.success(res.StatusMessage);
          this.clearLocationInfo(true);
        } else if (res.Status === "FAIL") {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
        this.spinner.hide();
      }, error => {
        this.appErrService.handleAppError(error);
      });
  }

  // validateInvData
  validateInvData(updateUrl) {
    this.appErrService.clearAlert();
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_LOC: this.locationSetupConfig };
    const url = String.Join('/', this.apiConfigService.validateInvData);
    this.apiservice.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (res.Status === 'PASS' && !checkNullorUndefined(res)) {
          if (!checkNullorUndefined(res.Response['CanUpdate']) && res.Response['CanUpdate']) {
            this.addOrUpdateLoc(updateUrl);
          }
        } else if (res.Status === 'FAIL') {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          this.spinner.hide();
        }
      }, error => {
        this.appErrService.handleAppError(error);
      });
  }

  showGrid(gridData) {
    this.locationList = [];
    this.grid = new Grid();
    this.grid.EditVisible = true;
    this.locationList = this.appService.onGenerateJson(gridData, this.grid);
  }


  editLocationRow(data) {
    this.clearTypeAhead = false;
    if (!checkNullorUndefined(data.SECTIONKEY) && data.SECTIONKEY != '') {
      this.filterINVAcc(data.SECTIONKEY);
    }
    this.moveTrackingReason = null;
    this.locationSetupConfig = new LocationSetupConfig();
    this.tempLocationSetupConfig = new LocationSetupConfig();
    this.locationSetupConfig = Object.assign(this.locationSetupConfig, data);
    this.tempLocationSetupConfig = Object.assign(this.tempLocationSetupConfig, data);
    this.locationBtnName = CommonEnum.save;
    this.isLocDisabled = true;
    this.isLocSearchBtnDisabled = true;
    if (!checkNullorUndefined(data.PARENT)) {
      this.editTypeAhead = data.PARENT;
    }
    if (!checkNullorUndefined(data.MOVE_TRACKING_REASON)) {
      this.moveTrackingReason = [{ Id: data.MOVE_TRACKING_REASON, Text: data.MOVE_TRACKING_REASON }];
    }
    this.isClearBtnDisabled = false;
    this.locationList['EditHighlight'] = true;
  }

  // Emiting from rmtypehead after selecting option 
  typeaheadResponse(event) {
    this.clearTypeAhead = false;
    this.editTypeAhead = null;
    this.changeInput();
    if (!this.appService.checkNullOrUndefined(event)) {
      this.locationSetupConfig.PARENT = event.Id;
    } else {
      this.locationSetupConfig.PARENT = null;
    }
  }

  onSelectMoveTracReason(value) {
    this.moveTrackingReason = [value];
    this.locationSetupConfig.MOVE_TRACKING_REASON = value.Id;
  }

  onINVAcoountSelect(value) {
    this.locationSetupConfig.INV_ACCOUNT = value;
  }

  onSectionKeySelect(value) {
    this.locationSetupConfig.SECTIONKEY = value;
    this.filterINVAcc(value);
    if (this.INVAccountOptions.length == 1) {
      this.locationSetupConfig.INV_ACCOUNT = this.INVAccountOptions[0].Id;
    } else {
      this.locationSetupConfig.INV_ACCOUNT = '';
    }
  }

  filterINVAcc(value) {
    this.INVAccountOptions = [];
    this.sectionKeyOptionsOrg.filter(res => res.Id == value).forEach((element) => {
      const dd: dropdown = new dropdown();
      dd.Id = element.Text;
      dd.Text = element.Text;
      this.INVAccountOptions.push(dd);
    });
  }

  onDeSelectMoveTracReason() {
    this.moveTrackingReason = null;
    this.locationSetupConfig.MOVE_TRACKING_REASON = null;
  }

  onActiveChange(value) {
    this.locationSetupConfig.ACTIVE = value ? 'Y' : 'N';
    this.isClearBtnDisabled = false;
  }

  changeInput() {
    this.isClearBtnDisabled = false;
  }

  clearLocationInfo(isGridRequried?) {
    this.appErrService.clearAlert();
    this.isClearBtnDisabled = true;
    this.locationBtnName = CommonEnum.add;
    this.isLocDisabled = false;
    this.isLocSearchBtnDisabled = false;
    if (!checkNullorUndefined(this.locationList)) {
      this.locationList['EditHighlight'] = false;
    }
    this.editTypeAhead = null;
    this.clearTypeAhead = true;
    this.moveTrackingReason = [];
    this.locationSetupConfig = new LocationSetupConfig();
    this.tempLocationSetupConfig = new LocationSetupConfig();
    this.locationSetupConfig.ACTIVE = CommonEnum.yes;
    if (!isGridRequried) {
      this.locationList = null;
    } else {
      this.isClearBtnDisabled = false;
    }
    this.appService.setFocus('location');
  }

  ngOnDestroy() {
    this.masterPageService.moduleName.next(null);
    this.masterPageService.clearModule();
    this.appErrService.clearAlert();
    this.masterPageService.hideModal();
  }

}
