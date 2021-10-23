import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
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
import { GroupSetup, GroupSetupSearch } from '../../models/maintenance/group-setup/group-setup';
import { CommonService } from '../../services/common.service';
import { StorageData } from '../../enums/storage.enum';
import { StatusCodes } from '../../enums/status.enum';
import { dropdown } from '../../models/common/Dropdown';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-group-setup',
  templateUrl: './group-setup.component.html',
  styleUrls: ['./group-setup.component.css']
})
export class groupSetupComponent implements OnInit, OnDestroy {

  // model
  groupSetup = new GroupSetup();
  tempgroupSetup = new GroupSetup();

  // common
  clientData = new ClientData();
  uiData = new UiData();
  groupValueList: any[];
  grid: Grid;
  groupTypeBtnName = CommonEnum.add;
  groupSetupBtnName = CommonEnum.gengroupID;
  commonEnum = CommonEnum;
  textBoxPattern: any;

  // disabled
  isClearBtnDisabled = true;
  isValueDisabled = true;
  isGroupIDDisabled = false;
  isTypeDisabled = false;
  isGroupValueDisabled = false;
  isGenGroupIDDisabled = false;
  appConfig: any;
  valueList = [];
  groupTypeOptions = [];
  groupIDs = [];
  parentList = [];
  groupNameOptions = [];
  modeltitle: string;
  selectedGroupType: string;
  dialogRef: any;

  constructor(
    public appErrService: AppErrorService,
    public masterPageService: MasterPageService,
    private apiConfigService: ApiConfigService,
    public apiservice: ApiService,
    private spinner: NgxSpinnerService,
    public appService: AppService,
    private snackbar: XpoSnackBar,
    private commonService: CommonService,
    private http: HttpClient,
    private dialog: MatDialog
  ) {
    const pattern = JSON.parse(localStorage.getItem(StorageData.patternList));
    if (!this.appService.checkNullOrUndefined(pattern)) {
      this.textBoxPattern = new RegExp(pattern.namePattern);
    }

    this.masterPageService.emitHideSpinner.subscribe(spinnerFlag => {
      if (!this.appService.checkNullOrUndefined(spinnerFlag) && spinnerFlag) {
        this.getGroupTypes();
      }
    });
  }

  ngOnInit() {
    const operationObj = this.masterPageService.getRouteOperation();
    if (operationObj) {
      this.uiData.OperationId = operationObj.OperationId;
      this.uiData.OperCategory = operationObj.Category;
      this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
      this.masterPageService.setTitle(operationObj.Title);
      this.masterPageService.setModule(operationObj.Module);
      this.isGroupIDDisabled = true;
      this.isTypeDisabled = false;
      this.isGroupValueDisabled = true;
      this.isGenGroupIDDisabled = true;
      this.appConfig = JSON.parse(localStorage.getItem(StorageData.appConfig));
      this.masterPageService.hideSpinner = true;
    }
    this.appService.setFocus('Type');
  }

  onGroupNameSelect(value) {
    this.appService.setFocus('Value');
    this.groupSetup.GROUPID = value;
    this.groupSetup.VALUE = null;
    this.getGroupValuesByType(value);
  }

  onGroupValueSelect(value) {
    this.groupSetup.VALUE = value;
    this.getGroupValuesByType(value);
  }

  //getGroupTypes
  getGroupTypes() {
    this.groupTypeOptions = [];
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    this.commonService.commonApiCall(this.apiConfigService.getGroupConfigTypes, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        if (res.Response['GroupConfigTypes'].length) {
          res.Response['GroupConfigTypes'].forEach((element) => {
            const dd: dropdown = new dropdown();
            dd.Id = element.ATTR_PROPERTY;
            dd.Text = element.ATTR_PROPERTY;
            this.groupTypeOptions.push(dd);
            this.spinner.hide();
          });
        }
      }
    });
  }

  openGroupValue(template) {
    this.dialogRef = this.dialog.open(template, {
      hasBackdrop: true,
      disableClose: true,
      panelClass: 'dialog-width-md'
  });
  }

  hideModal() {
    this.dialogRef.close();
  }

  //ongrouptypeSelect
  ongrouptypeSelect(value) {
    this.groupSetup.TYPE = value;
    this.selectedGroupType = value;
    this.groupSetup.VALUE = null;
    if (value != CommonEnum.gengroupValue) {
      this.getAttributeValue(value);
    }
    this.groupSetup.GROUPID = null;
    this.groupSetup.VALUE = null;
    this.getGroupValuesByType(value);
    this.getGroupIDsbyTypes(value);
    this.isGroupIDDisabled = false;
    this.isGroupValueDisabled = false;
    this.isGenGroupIDDisabled = false;
    this.appService.setFocus('GroupID');
  }

  //getGroupIDsbyTypes
  getGroupIDsbyTypes(AttrText) {
    this.groupIDs = [];
    this.appErrService.clearAlert();
    this.spinner.show();
    const attribute = { [CommonEnum.groupType]: AttrText };
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_GROUP_TYPE: attribute };
    const url = String.Join('/', this.apiConfigService.getGroupIDsbyTypes);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        if (res.Response['GroupIDsbyTypes'].length) {
          res.Response['GroupIDsbyTypes'].forEach((element) => {
            const dd: dropdown = new dropdown();
            dd.Id = element.GROUPID;
            dd.Text = element.GROUPID;
            this.groupIDs.push(dd);
          });
        }
      }
      this.spinner.hide();
    });

  }

  //getGroupValuesByType
  getGroupValuesByType(AttrText) {
    this.parentList = [];
    const attribute = { GroupSetupSearch: AttrText };
    this.groupValueList = null;
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, GroupSetupSearch: this.groupSetup };
    const url = String.Join('/', this.apiConfigService.getGroupValuesByType);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        if (res.Response) {
          this.parentList = res.Response['GroupValuesByType'];
          this.showGrid(res.Response['GroupValuesByType']);
        }
      }
      this.spinner.hide();
    });
  }

  // Grid List
  showGrid(gridData) {
    this.groupValueList = [];
    this.grid = new Grid();
    this.grid.EditVisible = true;
    this.grid.DeleteVisible = true;
    this.groupValueList = this.appService.onGenerateJson(gridData, this.grid);
  }

  // add or update Group Setup
  addOrUpdateGroupValue() {
    let url;
    if (this.groupTypeBtnName === CommonEnum.add) {
      url = String.Join('/', this.apiConfigService.addGroupValue);
    } else if (this.groupTypeBtnName === CommonEnum.save) {
      if (this.appService.IsObjectsMatch(this.groupSetup, this.tempgroupSetup)) {
        this.snackbar.info(this.appService.getErrorText('2660043'));
        return;
      }
      url = String.Join('/', this.apiConfigService.updateGroupValue);
    }
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_GROUP_VALUE: this.groupSetup };
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          if (res.Response['GroupValueData'].length) {
            this.showGrid(res.Response['GroupValueData']);
            this.snackbar.success(res.StatusMessage);
          }
        }
      }
      this.spinner.hide();
      this.reset();
    });
  }

  //  Modal Popup
  closeContainerConfirm(template: TemplateRef<any>) {
    this.dialogRef = this.dialog.open(template, {
      hasBackdrop: true,
      disableClose: true,
      panelClass: 'dialog-width-sm'
  });
  }

  openModal(template: TemplateRef<any>, modalclass: any) {
    this.dialogRef = this.dialog.open(template, {
      hasBackdrop: true,
      disableClose: true,
      panelClass: modalclass
  });
    this.modeltitle = 'Confirm Delete';
  }

  deleteDockDetailRow(event, deleteModal) {
    this.groupSetup = event;
    this.openModal(deleteModal, 'dialog-width-sm');
  }

  //Delete record
  deleteGroupValue(data) {
    this.groupSetup = Object.assign(this.groupSetup, data);
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_GROUP_VALUE: this.groupSetup };
    this.commonService.commonApiCall(this.apiConfigService.deleteGroupValue, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          this.hideModal()
          this.showGrid(res.Response['GroupValueList']);
          this.snackbar.success(res.StatusMessage);
        }
      }
      this.spinner.hide();
      this.reset();
    });
  }

  // On Edit Grid Data
  editGroupValueRow(data) {
    this.groupSetup = new GroupSetup();
    this.tempgroupSetup = new GroupSetup();
    this.groupSetup = Object.assign(this.groupSetup, data);
    this.tempgroupSetup = Object.assign(this.tempgroupSetup, data);
    this.groupTypeBtnName = CommonEnum.save;
    this.isClearBtnDisabled = false;
    this.isGenGroupIDDisabled = true;
    this.groupSetup.TYPE = this.selectedGroupType;
    this.isGroupIDDisabled = true;
    this.isTypeDisabled = true;
    this.appErrService.clearAlert();
  }

  // On Toggle Active
  onActiveChange(value) {
    this.isClearBtnDisabled = false;
  }

  // enable Clear
  changeInput() {
    this.isClearBtnDisabled = false;
  }

  // clear Carrier Code
  clear() {
    this.appErrService.clearAlert();
    this.groupTypeBtnName = CommonEnum.add;
    this.groupSetup = new GroupSetup();
    this.tempgroupSetup = new GroupSetup();
    this.isClearBtnDisabled = true;
    this.isGroupIDDisabled = true;
    this.isTypeDisabled = false;
    this.parentList = null;
    this.groupSetup.TYPE = null;
    this.groupIDs = [];
    this.groupValueList = null;
    this.isGroupValueDisabled = true;
    this.isGenGroupIDDisabled = true;
    this.appService.setFocus('Type');
  }

  reset() {
    this.appErrService.clearAlert();
    this.groupTypeBtnName = CommonEnum.add;
    this.groupSetup = new GroupSetup();
    this.tempgroupSetup = new GroupSetup();
    this.isClearBtnDisabled = false;
    this.isGroupIDDisabled = false;
    this.isTypeDisabled = false;
    this.parentList = null;
    this.groupSetup.TYPE = null;
    this.groupSetup.GROUPID = null;
    this.isGroupValueDisabled = false;
    this.isGenGroupIDDisabled = false;
    this.appService.setFocus('Type');
    this.groupSetup.TYPE = this.selectedGroupType;
  }

  ngOnDestroy() {
    this.masterPageService.defaultProperties();
  }

  // getAttributeControlNValue
  getAttributeValue(AttrText) {
    this.valueList = [];
    this.spinner.show();
    this.appErrService.clearAlert();
    const attribute = { [CommonEnum.attributeProperty]: AttrText };
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_ATTRIBUTE_MASTER: attribute };
    const url = String.Join('/', this.apiConfigService.getAttributeValue);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response) && res.Response.hasOwnProperty('Value') &&
          !this.appService.checkNullOrUndefined(res.Response.Value)) {
          if (res.Response.hasOwnProperty('ID') &&
            !this.appService.checkNullOrUndefined(res.Response.ID)) {
            for (let i = 0; i < res.Response.ID.length; i++) {
              const dd: dropdown = new dropdown();
              dd.Id = res.Response.ID[i];
              dd.Text = res.Response.Value[i];
              this.valueList.push(dd);
            }
            this.valueList.map(el => el.Text = String.Join(' - ', el.Id, el.Text));
          } else if (res.Response.hasOwnProperty('ID') &&
            this.appService.checkNullOrUndefined(res.Response.ID)) {
            for (let i = 0; i < res.Response.Value.length; i++) {
              const dd: dropdown = new dropdown();
              dd.Id = res.Response.Value[i];
              dd.Text = res.Response.Value[i];
              this.valueList.push(dd);
            }
          }
        }
      }
    });
  }
}