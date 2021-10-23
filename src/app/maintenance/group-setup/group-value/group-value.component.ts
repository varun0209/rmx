import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { AppErrorService } from '../../../utilities/rlcutl/app-error.service';
import { MasterPageService } from '../../../utilities/rlcutl/master-page.service';
import { ClientData } from '../../../models/common/ClientData';
import { UiData } from '../../../models/common/UiData';
import { CommonEnum } from '../../../enums/common.enum';
import { ApiConfigService } from '../../../utilities/rlcutl/api-config.service';
import { ApiService } from '../../../utilities/rlcutl/api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { String } from 'typescript-string-operations';
import { Grid } from '../../../models/common/Grid';
import { AppService } from '../../../utilities/rlcutl/app.service';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { GroupSetup } from '../../../models/maintenance/group-setup/group-setup';
import { CommonService } from '../../../services/common.service';
import { StorageData } from '../../../enums/storage.enum';
import { StatusCodes } from '../../../enums/status.enum';
import { dropdown } from '../../../models/common/Dropdown';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-group-value',
  templateUrl: './group-value.component.html',
  styleUrls: ['./group-value.component.css']
})
export class GroupValueComponent implements OnInit, OnDestroy {
  // model
  groupSetup = new GroupSetup();
  tempgroupSetup = new GroupSetup();

  // common
  @Input() clientData = new ClientData();
  @Input() uiData = new UiData();
  @Input() set groupType(value) {
    this.groupSetup.TYPE = value;
  }
  groupValueSetupBtnName = CommonEnum.save;
  commonEnum = CommonEnum;
  textBoxPattern: any;
  isClearBtnDisabled = true;
  appConfig: any;
  groupTypeOptions = [];

  @Output() newGroupValueEmit = new EventEmitter();
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
    this.appConfig = JSON.parse(localStorage.getItem(StorageData.appConfig));
    if (!this.appService.checkNullOrUndefined(pattern)) {
      this.textBoxPattern = new RegExp(pattern.namePattern);
    }
  }

  ngOnInit() {
    this.getGroupConfigTypes();
    this.appService.setFocus('Groupid');
  }

  //getGroupConfigTypes
  getGroupConfigTypes() {
    this.groupTypeOptions = [];
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    this.commonService.commonApiCall(this.apiConfigService.getGroupConfigTypes, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        if (res.Response['GroupConfigTypes'].length) {
          res.Response['GroupConfigTypes'].forEach((element) => {
            const dd: dropdown = new dropdown();
            dd.Id = element.VALUE;
            dd.Text = element.VALUE;
            this.groupTypeOptions.push(dd);
          });
        }
      }
    });
  }

  //ongrouptypeSelect
  onGroupTypeSelect(value) {
    this.groupSetup.TYPE = value;
  }

  // add Group Type
  addGroupType() {
    let url;
    if (this.groupValueSetupBtnName === CommonEnum.save) {
      url = String.Join('/', this.apiConfigService.addGroupType);
    } else if (this.groupValueSetupBtnName === CommonEnum.add) {
      if (this.appService.IsObjectsMatch(this.groupSetup, this.tempgroupSetup)) {
        this.snackbar.info(this.appService.getErrorText('2660043'));
        return;
      }
    }
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_GROUP_TYPE: this.groupSetup };
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          if (res.Response['GroupTypeData'].length) {
            this.snackbar.success(res.StatusMessage);
            this.newGroupValueEmit.emit();
            this.clear();
          }
        }
      }
    });
  }

  // enable Clear
  changeInput() {
    this.isClearBtnDisabled = false;
  }

  // clear Group Value
  clear() {
    this.appErrService.clearAlert();
    this.isClearBtnDisabled = true;
    this.groupSetup = new GroupSetup();
    this.tempgroupSetup = new GroupSetup();
    this.appService.setFocus('Groupid');
  }

  ngOnDestroy() {
  }

}