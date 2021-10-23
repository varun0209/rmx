import { Component, OnInit, ViewChild, TemplateRef, OnDestroy, Optional } from '@angular/core';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { ApiConfigService } from '../../utilities/rlcutl/api-config.service';
import { ApiService } from '../../utilities/rlcutl/api.service';
import { AppService } from '../../utilities/rlcutl/app.service';
import { CommonService } from './../../services/common.service';
import { UiData } from '../../models/common/UiData';
import { ClientData } from '../../../app/models/common/ClientData';
import { Grid } from '../../models/common/Grid';
import { CodeListSetup } from '../../models/maintenance/code-list-setup/CodeListSetup';
import { dropdown } from '../../models/common/Dropdown';
import { String } from 'typescript-string-operations';
import { StorageData } from '../../enums/storage.enum';
import { StatusCodes } from '../../enums/status.enum';
import { CommonEnum } from './../../enums/common.enum';
import { DeleteConfirmationDialogComponent } from '../../framework/frmctl/delete-confirmation-dialog/delete-confirmation-dialog.component';

@Component({
  selector: 'app-code-list-setup',
  templateUrl: './code-list-setup.component.html',
  styleUrls: ['./code-list-setup.component.css']
})
export class CodeListSetupComponent implements OnInit, OnDestroy {

  // @ViewChild('delteConfirmation')  private delteConfirmationModal: TemplateRef<any>;

  // disabled button
  isEnableTextBox = true;
  isCodelistClearDisabled = true;
  isDisableGroupButton = false;
  isDisableGroupMultiselect = false;
  isDisableGroupTextbox = false;
  isKeyDisable = false;
  isValueDisable = false;
  isActiveDisable = false;
  isAddSaveDisable = true;
  groupNamePattern: any;
  codeListValuePattern: any;
  truncateUnderScorePattern: any;
  truncateCommaPattern: any;

  // client config model
  codeListSetup = new CodeListSetup();
  tempCodeListSetup = new CodeListSetup();
  clientData = new ClientData();
  uiData = new UiData();

  // drowdown variable
  groupListData: dropdown[];

  //multi-select dropdown settings
  dropdownSettings = {
    singleSelection: true,
    idField: 'Id',
    textField: 'Text',
    itemsShowLimit: 1,
    allowSearchFilter: true,
    closeDropDownOnSelection: true
  };

  // button names
  codeListBtnName = CommonEnum.add;

  // grid list
  sysConfig: any;
  codeListGrid: any;
  grid: Grid;
  operationObj: any;
  appConfig: any;

  groupListSelectedItem = [];
  selectedGroupName = '';
  storageData = StorageData;
  statusCode = StatusCodes;

  constructor(public masterPageService: MasterPageService,
    public appErrService: AppErrorService,
    private spinner: NgxSpinnerService,
    private snackbar: XpoSnackBar,
    private apiConfigService: ApiConfigService,
    private apiService: ApiService,
    private appService: AppService,
    private cmnService: CommonService
  ) {
    const pattern = JSON.parse(localStorage.getItem(StorageData.patternList));
    if (!this.appService.checkNullOrUndefined(pattern)) {
       this.groupNamePattern = new RegExp(pattern.groupNamePattern);
       this.codeListValuePattern = new RegExp(pattern.codeListValuePattern);
       this.truncateUnderScorePattern = new RegExp(pattern.truncateUnderScorePattern);
       this.truncateCommaPattern = new RegExp(pattern.truncateCommaPattern);
    }
   }

  ngOnInit() {
    this.operationObj = this.masterPageService.getRouteOperation();
    if (this.operationObj) {
      this.uiData.OperationId = this.operationObj.OperationId;
      this.uiData.OperCategory = this.operationObj.Category;
      this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
      this.masterPageService.setTitle(this.operationObj.Title);
      this.masterPageService.setModule(this.operationObj.Module);
      this.codeListSetup.ACTIVE = CommonEnum.yes;
      this.appConfig = JSON.parse(localStorage.getItem(this.storageData.appConfig));
      this.getCodelistGroupNames();
    }
  }

  // getCodelistGroupNames for Dropdown
  getCodelistGroupNames() {
    this.spinner.show();
    this.appErrService.clearAlert();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getSysConfigGroups);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
          if (!this.appService.checkNullOrUndefined((res.Response) && (res.Response.GroupNames.length > 0))) {
            this.groupListData = res.Response.GroupNames;
            this.spinner.hide();
          }
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }


  // get grid to selected groupname
  getSelectedGroupnameList(value) {
    this.spinner.show();
    this.appErrService.clearAlert();
    this.selectedGroupName = value.Id;
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getSysConfig, this.selectedGroupName);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
          if (!this.appService.checkNullOrUndefined(res.Response)) {
            this.codeListGrid = [];
            this.grid = new Grid();
            this.allowToEditGrid(res.Response);
            this.codeListGrid = this.appService.onGenerateJson(res.Response.SysConfigs, this.grid);
            this.spinner.hide();
          }
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }

  addOrUpdateCodeList() {
    this.codeListSetup.GROUP_NAME = this.truncateUnderScore(this.selectedGroupName, this.truncateUnderScorePattern);
    const truncateCodeListObj = this.cmnService.getTruncateObj(this.codeListSetup, this.truncateCommaPattern);
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_SYS_CONFIG: truncateCodeListObj };
    let url;
    if (this.codeListBtnName === CommonEnum.add) {
      url = String.Join('/', this.apiConfigService.addSysConfig);
    } else if (this.codeListBtnName === CommonEnum.save) {
      if (this.appService.IsObjectsMatch(truncateCodeListObj, this.tempCodeListSetup)) {
        this.snackbar.info(this.appService.getErrorText('2660043'));
        return;
      }
      url = String.Join('/', this.apiConfigService.updateSysConfig);
    }
    this.spinner.show();
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const result = response.body;
        if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.pass) {
          if (!this.appService.checkNullOrUndefined(result.Response)) {
            this.codeListGrid = [];
            this.grid = new Grid();
            this.allowToEditGrid(result.Response);
            this.codeListGrid = this.appService.onGenerateJson(result.Response.SysConfigs, this.grid);
            if (!this.appService.checkNullOrUndefined(result.Response.SysConfigs) && result.Response.SysConfigs.length) {
              this.groupListSelectedItem = [{ 'Id': result.Response.SysConfigs[0].GROUP_NAME, 'Text': result.Response.SysConfigs[0].GROUP_NAME }];
            }
            this.snackbar.success(result.StatusMessage);
            this.isEnableTextBox = true;
            this.clearCodelistSetup();
            this.spinner.hide();
          }
        } else if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }

  allowToEditGrid(res) {
    if (!this.appService.checkNullOrUndefined(res.CanEditable) && res.CanEditable === CommonEnum.yes) {
      this.grid.EditVisible = true;
      this.grid.DeleteVisible = true;
      this.isKeyDisable = false;
      this.isValueDisable = false;
      this.isActiveDisable = false;
    } else {
      this.grid.EditVisible = false;
      this.isKeyDisable = true;
      this.isValueDisable = true;
      this.isActiveDisable = true;
    }
  }

  // add groupname to dropdown temp
  addToGroupList(value) {
    this.spinner.show();
    this.appErrService.clearAlert();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const groupName = this.truncateUnderScore(value, this.truncateUnderScorePattern);
    const url = String.Join('/', this.apiConfigService.addSysConfigGroup, groupName);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
          if (!this.appService.checkNullOrUndefined((res.Response) && (res.Response.GroupNames.length > 0))) {
            this.groupListData = res.Response.GroupNames;
            this.isDisableGroupButton = true;
            this.isDisableGroupTextbox = true;
            this.isKeyDisable = false;
            this.isValueDisable = false;
            this.isActiveDisable = false;
            this.selectedGroupName = groupName;
            this.setKeyFocus();
            this.spinner.hide();
          }
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }



  onGroupButtonClick() {
    this.isEnableTextBox = !this.isEnableTextBox;
    this.clearCodelistSetup();
  }

  // edit codelist grid
  editCodeListGrid(data) {
    this.codeListSetup = new CodeListSetup();
    this.codeListSetup = Object.assign(this.codeListSetup, data);
    this.tempCodeListSetup = Object.assign(this.tempCodeListSetup, data);
    this.isDisableGroupButton = true;
    this.isDisableGroupMultiselect = true;
    this.isCodelistClearDisabled = false;
    this.isKeyDisable = true;
    this.codeListBtnName = CommonEnum.save;
    this.codeListGrid['EditHighlight'] = true;
  }

  deletePopup(event) {
    this.sysConfig = event;
    this.masterPageService.openModelPopup(DeleteConfirmationDialogComponent);
    this.masterPageService.dialogRef.componentInstance.emitConfirmation.subscribe(($e) => {
      this.deleteSysConfig();
    });
  }

  // delete group name codelist grid
  deleteSysConfig() {
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_SYS_CONFIG: this.sysConfig };
    const url = String.Join('/', this.apiConfigService.deleteSysConfig);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
          if (!this.appService.checkNullOrUndefined(res.Response)) {
            this.masterPageService.hideDialog();
            this.codeListGrid = [];
            this.grid = new Grid();
            this.allowToEditGrid(res.Response);
            this.codeListGrid = this.appService.onGenerateJson(res.Response.SysConfigs, this.grid);
            this.snackbar.success(res.StatusMessage);
            this.isKeyDisable = false;
            this.defaultCodeListConfig();
            if (res.Response.SysConfigs.length) {
              this.spinner.hide();
            } else {
              this.onDeleteReset();
            }
          }
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });

  }

  private defaultCodeListConfig() {
    this.codeListSetup = new CodeListSetup();
    this.isDisableGroupMultiselect = false;
    this.codeListSetup.ACTIVE = CommonEnum.yes;
    this.codeListBtnName = CommonEnum.add;
  }

  // on delete
  onDeleteReset() {
    this.groupListSelectedItem = [];
    this.isValueDisable = false;
    this.isDisableGroupButton = false;
    this.isActiveDisable = false;
    this.getCodelistGroupNames();
  }

  clearCodelistSetup() {
    this.tempCodeListSetup = new CodeListSetup();
    this.sysConfig = null;
    this.defaultCodeListConfig();
    this.isCodelistClearDisabled = true;
    this.isDisableGroupButton = false;
    this.isDisableGroupTextbox = false;
    if (!this.appService.checkNullOrUndefined(this.codeListGrid)) {
      this.codeListGrid['EditHighlight'] = false;
    }
    if (!this.isEnableTextBox) {
      this.isKeyDisable = true;
      this.isValueDisable = true;
      this.isActiveDisable = true;
      this.selectedGroupName = '';
      this.groupListSelectedItem = [];
      this.codeListGrid = null;
      this.getCodelistGroupNames();
    } else {
      this.isKeyDisable = false;
      this.isValueDisable = false;
      this.isActiveDisable = false;
    }
    this.appErrService.clearAlert();
  }

  truncateUnderScore(value, pattern) {
    return value.replace(pattern, '');
  }
  onDeSelectItem() {
    this.groupListSelectedItem = [];
    this.codeListGrid = null;
    this.selectedGroupName = '';
  }

  setKeyFocus() {
    this.appService.setFocus('key');
  }

  onCodeListActiveChange(value) {
    this.codeListSetup.ACTIVE = value ? CommonEnum.yes : CommonEnum.no;
    this.isCodelistClearDisabled = false;
  }

  enableClear() {
    this.isCodelistClearDisabled = false;
  }

  ngOnDestroy() {
    this.masterPageService.defaultProperties();
  }

}
