import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonService } from '../../services/common.service';
import { String } from 'typescript-string-operations';
import { MessageType } from '../../enums/message.enum';
import { StatusCodes } from '../../enums/status.enum';
import { StorageData } from '../../enums/storage.enum';
import { ClientData } from '../../models/common/ClientData';
import { UiData } from '../../models/common/UiData';
import { AppSysConfig, MasterConfig } from '../../models/maintenance/master-configuration/MasterConfigClasses';
import { ApiConfigService } from '../../utilities/rlcutl/api-config.service';
import { ApiService } from '../../utilities/rlcutl/api.service';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';
import { AppService } from '../../utilities/rlcutl/app.service';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';
import { MasterConfigurationDialogComponent } from './master-configuration-dialog/master-configuration-dialog.component';
import { TextCase } from '../../enums/textcase.enum';
import { Subscription } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonEnum } from '../../enums/common.enum';
import { MasterConfigControlType } from '../../enums/master-configs.enum';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-master-configuration',
  templateUrl: './master-configuration.component.html',
  styleUrls: ['./master-configuration.component.css']
})
export class MasterConfigurationComponent implements OnInit, OnDestroy {
  textCase = TextCase;
  masterConfigControlType = MasterConfigControlType;

  clientData = new ClientData();
  uiData = new UiData();
  masterConfigList: MasterConfig[];
  operationObj: any;
  emitHideSpinner: Subscription;
  appConfig: any;

  // What columns are displayed, and the Order of them.
  displayedColumns: string[];

  configPattern: RegExp; // Not these characters.
  errMessage: string;
  storageData = StorageData;

  constructor(public appErrService: AppErrorService,
    public masterPageService: MasterPageService,
    public commonService: CommonService,
    private apiConfigService: ApiConfigService,
    public apiService: ApiService,
    private spinner: NgxSpinnerService,
    public appService: AppService,
    private dialog: MatDialog
    ) { }

  ngOnInit() {
    this.operationObj = this.masterPageService.getRouteOperation();
    if (this.operationObj) {
      localStorage.setItem(this.storageData.module, this.operationObj.Module);
      this.appErrService.appMessage();

      this.errMessage = this.appService.getErrorText(6680194);

      this.uiData.OperationId = this.operationObj.OperationId;
      this.uiData.OperCategory = this.operationObj.Category;
      this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
      this.appConfig = JSON.parse(localStorage.getItem(StorageData.appConfig));

      //setting value to hidespinner (based on this value we are emiting emithidespinner method)
      this.masterPageService.hideSpinner = true;
      this.masterPageService.setTitle(this.operationObj.Title);
      this.masterPageService.setModule(this.operationObj.Module);

      const pattern = JSON.parse(localStorage.getItem(StorageData.patternList));
      if (!this.appService.checkNullOrUndefined(pattern)) {
         this.configPattern = new RegExp(pattern.mastercConfigPattern);
      }

      this.displayedColumns = this.appConfig.masterConfigs.displayedMainColumns;

      this.emitHideSpinner = this.masterPageService.emitHideSpinner.subscribe(spinnerFlag => {
        if (!this.appService.checkNullOrUndefined(spinnerFlag) && spinnerFlag) {
           //use use your method here and hide spinner after getting response
           this.getMasterConfigs();
        }
      });
    }
  }

  ngOnDestroy() {
    this.masterPageService.hideSpinner = false;
    this.masterPageService.moduleName.next(null);
    this.emitHideSpinner.unsubscribe();
    this.masterPageService.emitHideSpinner.next(null);
    this.masterPageService.clearModule();
    this.appErrService.clearAlert();
    this.masterPageService.hideModal();
  }

  private userCanEdit(config: MasterConfig): boolean {
    if (config.Editable.toUpperCase() !== CommonEnum.yes)
      return false;

    // Editable must be Y
    if (this.appService.checkNullOrUndefined(config.EditableRole) || config.EditableRole === "")
      return true;

    // if Role is not found, disable, else enable
    return this.clientData.Roles.includes(config.EditableRole)
  }

  private getMasterConfigs() {
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getMasterConfigUrl);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {

      this.spinner.hide();
      this.masterConfigList = [];

      if (statusFlag){

            if (!this.appService.checkNullOrUndefined(res.Response) && res.Response.MasterConfigs && res.Response.MasterConfigs.length) {
              this.masterConfigList = res.Response.MasterConfigs;
              this.masterConfigList
                  .forEach(config => {
                    config.EditDisabled = !this.userCanEdit(config);
                    config.IsEditing= false;
                    config.original_config_value = config.Config_Value;
                  });
            }
      }
    });

  }

  getDistinctMainModule() {
    if (this.appService.checkNullOrUndefined(this.masterConfigList)) {
      return []
    }
    const result = [];
    const map = new Map();
    for (const item of this.masterConfigList) {
        if(!map.has(item.MainModule)){
            map.set(item.MainModule, true);    // set any value to Map
            result.push(item.MainModule);
        }
    }
    return result;
  }

  getDistinctSubModule(mainModule: string) {
    if (this.appService.checkNullOrUndefined(this.masterConfigList)) {
      return []
    }
    const result = [];
    const map = new Map();
    for (const item of this.masterConfigList) {
      // we only want mainModule items
      if (item.MainModule.toUpperCase() === mainModule.toUpperCase()) {
        if(!map.has(item.SubModule)){
            map.set(item.SubModule, true);    // set any value to Map
            result.push(item.SubModule);
        }
      }
    }
    return result;
  }

  getDistinctGroupName(mainModule: string, subModule: string) {
    if (this.appService.checkNullOrUndefined(this.masterConfigList)) {
      return []
    }
    const result = [];
    const map = new Map();
    for (const item of this.masterConfigList) {
      // we only want mainModule/subModule items
      if (item.MainModule.toUpperCase() === mainModule.toUpperCase()
          && item.SubModule.toUpperCase() === subModule.toUpperCase()) {
        if(!map.has(item.KeyValue1)){
          map.set(item.KeyValue1, true);    // set any value to Map
          result.push(item.KeyValue1);
        }
      }
    }
    return result;
  }

  getConfigs(mainModule: string, subModule: string, groupName: string) {
    if (this.appService.checkNullOrUndefined(this.masterConfigList)) {
      return []
    }
    const result = [];
    const map = new Map();
    for (const item of this.masterConfigList) {
      // we only want mainModule/subModule/groupName items
      if (item.MainModule.toUpperCase() === mainModule.toUpperCase()
          && item.SubModule.toUpperCase() === subModule.toUpperCase()
          && item.KeyValue1.toUpperCase() === groupName.toUpperCase()) {
        result.push(item);
      }
    }
    return result;
  }

  onTabChange() {
    this.appErrService.clearAlert();
  }

  onExpansionChanged() {
    this.appErrService.clearAlert();
  }

  onToggleChange(value, config: any) {
    config.Config_Value = value ? CommonEnum.yes : CommonEnum.no;
  }

  onCancelClick(config: MasterConfig) {
    this.appErrService.clearAlert();

    config.IsEditing = false;
    config.Config_Value = config.original_config_value;
  }

  onEditClick(config: MasterConfig) {
    this.appErrService.clearAlert();

    switch(config.ControlType) {
      case MasterConfigControlType.text:
      case MasterConfigControlType.radio:
        config.IsEditing = true;
        break;
      default:
        this.masterPageService.openModelPopup(MasterConfigurationDialogComponent, null, null, { data: config});
        this.masterPageService.dialogRef.componentInstance.emitConfirmation.subscribe((value) => {
          this.dialog.closeAll();

          if (value === "") {
            return;
          }
          config.Config_Value = value;

          this.saveConfig(config);
        });

        break;
    }
  }

  saveConfig(config:  MasterConfig) {
    this.appErrService.clearAlert();

    const val = config.Config_Value.trim();
    if (config.Mandatory.toLocaleUpperCase() === CommonEnum.yes && val === "") {
      // {0} is a Mandatory config. You cannot save a blank value.'
      this.appErrService.setAlert(this.appService.getErrorText(6680200).replace('{0}', config.KeyValue2), true, MessageType.warning);
      return;
    }

    if (val === config.original_config_value) {
      config.Config_Value = val;
      config.IsEditing = false;
      return;
    }

    const saveConfigData = new AppSysConfig();
    saveConfigData.TableName = config.TableName;
    saveConfigData.GroupName = config.KeyValue1;
    saveConfigData.Key = config.KeyValue2;
    saveConfigData.SeqId = config.Config_SeqId;
    saveConfigData.Value = val;

    let seqId = saveConfigData.SeqId;

    const requestObj = { ClientData: this.clientData, UIData: this.uiData, AppSysConfig: saveConfigData };
    const url = String.Join('/', this.apiConfigService.saveConfigItem);
    this.apiService.apiPostRequest(url, requestObj)
    .subscribe(response => {
        const result = response.body;

        if (!this.appService.checkNullOrUndefined(result)) {
          if (result.Status === StatusCodes.pass) {
              if (!this.appService.checkNullOrUndefined(result.Response) && result.Response.SeqId) {
                seqId = result.Response.SeqId;

                // In the event of inserts this is the new Config_SeqId
                if (config.Config_SeqId !== seqId){
                  config.Config_SeqId = seqId;
                }
                // update Config with the new value
                config.Config_Value;
                config.original_config_value = config.Config_Value;

                // turn of IsEditing after saving
                config.IsEditing = false;

                // Config Saved Successfully
                this.appErrService.setAlert(this.appService.getErrorText(6680196), false, MessageType.success)
              }
          }
          else if (result.Status === StatusCodes.fail) {
              this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
          }
        }
    },
    error => {
      this.appErrService.handleAppError(error);
    });
  }
}
