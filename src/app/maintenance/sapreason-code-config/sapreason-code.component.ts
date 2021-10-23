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
import { Sapreasoncodesetup } from '../../models/maintenance/sapreason-code-config/sapreason-code-config';
import { CommonService } from '../../services/common.service';
import { StorageData } from '../../enums/storage.enum';
import { StatusCodes } from '../../enums/status.enum';
import { dropdown } from '../../models/common/Dropdown';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-sapreason-code',
  templateUrl: './sapreason-code.component.html',
  styleUrls: ['./sapreason-code.component.css']
})
export class sapreasoncodesetupComponent implements OnInit, OnDestroy {

  // model
  sapCodeConfig = new Sapreasoncodesetup();
  tempsapCodeConfig = new Sapreasoncodesetup();

  // common
  clientData = new ClientData();
  uiData = new UiData();
  sapList: any[];
  grid: Grid;
  sapReasonBtnName = CommonEnum.add;
  commonEnum = CommonEnum;

  
  textBoxPattern: any;

  // disabled
  isFromLocDisabled = false;
  isClearBtnDisabled = true;
  isCarrierSearchBtnDisabled = false;
  isGroupDisabled = false;
  appConfig: any;


  reasoncodeOptionsOrg = [];
  reasoncodeOptions = [];

  groupNameOptions = [];

  constructor(
    public appErrService: AppErrorService,
    public masterPageService: MasterPageService,
    private apiConfigService: ApiConfigService,
    public apiservice: ApiService,
    private spinner: NgxSpinnerService,
    public appService: AppService,
    private snackbar: XpoSnackBar,
    private commonService: CommonService,
    private http: HttpClient
  ) {
    const pattern = JSON.parse(localStorage.getItem(StorageData.patternList));
    if (!this.appService.checkNullOrUndefined(pattern)) {
      this.textBoxPattern = new RegExp(pattern.namePattern);
    }
  }

  ngOnInit() {
    const operationObj = this.masterPageService.getRouteOperation();
    if (operationObj) {
      this.uiData.OperationId = operationObj.OperationId;
      this.uiData.OperCategory = operationObj.Category;
      this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
      this.masterPageService.setTitle(operationObj.Title);
      this.masterPageService.setModule(operationObj.Module);
      this.sapCodeConfig.ACTIVE = CommonEnum.yes;
      this.getSapreasonCodeConfig();
      this.appConfig = JSON.parse(localStorage.getItem(StorageData.appConfig));
    }
    this.getGroupNames();
    this.appService.setFocus('groupName');
  }

  //getSapreasonCodeConfig
  getSapreasonCodeConfig() {
    this.sapList = null;
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    let url = String.Join("/", this.apiConfigService.getSAPReasonCodeConfig, this.sapCodeConfig.GROUP_NAME);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        if (res.Response) {
          this.showGrid(res.Response['Sapreasoncodeconfig']);
        }
      }
    });
  }

  //getGroupNames
  getGroupNames() {
    this.spinner.show();
    this.http.get('./assets/sapreason.json').subscribe((res: any) => {
      this.groupNameOptions = res;
      this.getReasoncodes();
    },
      (error: HttpErrorResponse) => {
        this.snackbar.error('Failed to load group reason data');
      });
  }

  onGroupNameSelect(value) {
    this.clear();
    this.sapCodeConfig.GROUP_NAME = value;
    this.checkGroupName(value);
  }


  private checkGroupName(value: any) {
    if (value === CommonEnum.remove || value === CommonEnum.revive) {
      this.isFromLocDisabled = true;
      this.appService.setFocus('ReasonCode');
    }
    else {
      this.isFromLocDisabled = false;
      this.appService.setFocus('fromValue');
    }
  }

  //getReasoncodes
  getReasoncodes() {
    this.reasoncodeOptions = [];
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    this.commonService.commonApiCall(this.apiConfigService.getSAPReasonCode, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        if (res.Response['Sapreasoncode'].length) {
          this.reasoncodeOptionsOrg = res.Response['Sapreasoncode'];
          res.Response['Sapreasoncode'].forEach((element) => {
            const dd: dropdown = new dropdown();
            dd.Id = element.REASONCODE;
            dd.Text = element.REASONCODE + '-' + element.DESCRIPTION;
            this.reasoncodeOptions.push(dd);
          });
        }
      }
    });
  }

  //onReasoncodeSelect
  onReasoncodeSelect(value) {
    this.sapCodeConfig.REASONCODE = value;
    //this.filterINVAcc(value);
  }

  //filterINVAcc
  // filterINVAcc(value) {
  //   this.reasoncodeOptionsOrg.filter(res => res.Id == value).forEach((element) => {
  //     const dd: dropdown = new dropdown();
  //     dd.Id = element.Text;
  //     dd.Text = element.Text;
  //   });
  // }

  // Grid List
  showGrid(gridData) {
    this.sapList = [];
    this.grid = new Grid();
    this.grid.EditVisible = true;
    this.sapList = this.appService.onGenerateJson(gridData, this.grid);
  }


  // add or update SAP Code
  addOrUpdateSAPCode() {
    let url;
    if (this.sapReasonBtnName === CommonEnum.add) {
      url = String.Join('/', this.apiConfigService.addSAPReason);
    } else if (this.sapReasonBtnName === CommonEnum.save) {
      if (this.appService.IsObjectsMatch(this.sapCodeConfig, this.tempsapCodeConfig)) {
        this.snackbar.info(this.appService.getErrorText('2660043'));
        return;
      }
      url = String.Join('/', this.apiConfigService.updateSAPReason);
    }
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_VZW_SAP_REASON_CODE_CONFIG: this.sapCodeConfig };
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          if (res.Response['SAPreasonData'].length) {
            this.showGrid(res.Response['SAPreasonData']);
            this.snackbar.success(res.StatusMessage);
            this.clear();
          }
        }
      }
    });
  }

  // On Edit Grid Data
  editSAPCodeRow(data) {
    this.sapCodeConfig = new Sapreasoncodesetup();
    this.tempsapCodeConfig = new Sapreasoncodesetup();
    this.sapCodeConfig = Object.assign(this.sapCodeConfig, data);
    this.tempsapCodeConfig = Object.assign(this.tempsapCodeConfig, data);
    this.sapReasonBtnName = CommonEnum.save;
    this.isCarrierSearchBtnDisabled = true;
    this.isClearBtnDisabled = false;
    this.isGroupDisabled = true;
    this.checkGroupName(data.GROUP_NAME);
    this.appErrService.clearAlert();
  }

  // On Toggle Active
  onActiveChange(value) {
    this.sapCodeConfig.ACTIVE = value ? CommonEnum.yes : CommonEnum.no;
    this.isClearBtnDisabled = false;
  }

  // enable Clear
  changeInput() {
    this.isClearBtnDisabled = false;
  }

  // clear Carrier Code
  clear() {
    this.appErrService.clearAlert();
    this.isClearBtnDisabled = true;
    this.sapReasonBtnName = CommonEnum.add;
    this.isFromLocDisabled = false;
    this.isCarrierSearchBtnDisabled = false;
    this.isGroupDisabled = false;
    this.sapCodeConfig = new Sapreasoncodesetup();
    this.tempsapCodeConfig = new Sapreasoncodesetup();
    this.sapCodeConfig.ACTIVE = CommonEnum.yes;
    this.isClearBtnDisabled = true;
    this.appService.setFocus('groupName');
  }

  ngOnDestroy() {
    this.masterPageService.defaultProperties();
  }

}