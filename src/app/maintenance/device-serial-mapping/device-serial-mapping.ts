import { Component, ElementRef, OnDestroy, OnInit, Optional, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { String } from 'typescript-string-operations';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';

import { Grid } from '../../models/common/Grid';
import { DropDownSettings } from '../../models/common/dropDown.config';
import { UiData } from '../../models/common/UiData';
import { dropdown } from '../../models/common/Dropdown';
import { ClientData } from '../../models/common/ClientData';
import { DeviceSerial } from '../../models/maintenance/device-serial-mapping/deviceSerialMap';
import { checkNullorUndefined } from '../../enums/nullorundefined';
import { CommonEnum } from '../../enums/common.enum';
import { StorageData } from '../../enums/storage.enum';
import { CommonService } from '../../services/common.service';
import { ApiConfigService } from '../../utilities/rlcutl/api-config.service';
import { AppService } from '../../utilities/rlcutl/app.service';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';
import { DeleteConfirmationDialogComponent } from '../../framework/frmctl/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-device-serial-mapping',
  templateUrl: './device-serial-mapping.html',
  styleUrls: ['./device-serial-mapping.css']
})
export class DeviceSerialMapComponent implements OnInit, OnDestroy {

  //Config
  deviceSerialConfig = new DeviceSerial();
  tempDeviceSerialConfig = new DeviceSerial()
  deleteRecordConfig = new DeviceSerial();
  clientData = new ClientData();
  uiData = new UiData();
  appConfig: any;
  commonEnum = CommonEnum;
  btnName = CommonEnum.add;
  storageData = StorageData;

  //DropDown Settings
  programDDSettings: DropDownSettings;
  programIndDDSettings: DropDownSettings;
  lookupRefDDSettings: DropDownSettings;
  programNameList = [];
  programIndicatorList = [];
  lookupTypeOptions = [];
  lookupRefList = [];

  //Disabled
  isLookupRefDisabled = true;
  isClearBtnDisabled = true;
  isSaveAddBtnDisabled = true;
  isDDRefShow = true;

  deviceSerialList: any;
  grid: Grid;
  clearActualSKUTypeAhead = false;
  controlConfig: any;
  configData: { uiData: UiData; url: string; };
  isEditMode = false;
  multiSelectControl: string;
  modelOptionsKeys = [];
  selectedModelOptions: any[];
  selectedInModelOptions: any[];
  modelOptionsKeysIn = [];
  lookupRef: any[];
  selectedControlValues: string;
  selectedControlVal = "";
  deviceSerialResponse: any[];
  selectedCategory = [];
  editActualSKUTypeAhead: any;
  disableProgramList = [];
  disableIndicatorList = [];

  constructor(
    public appErrService: AppErrorService,
    public masterPageService: MasterPageService,
    public appService: AppService,
    private apiConfigService: ApiConfigService,
    private commonService: CommonService,
    private spinner: NgxSpinnerService,
    private snackbar: XpoSnackBar,
    public dialog: MatDialog,
    @Optional() public dialogRef: MatDialogRef<DeleteConfirmationDialogComponent> 
  ) {
    this.masterPageService.emitHideSpinner.subscribe(spinnerFlag => {
      if (!this.appService.checkNullOrUndefined(spinnerFlag) && spinnerFlag) {
        this.disableProgramList = [];
        this.disableIndicatorList = []
        const controlConfig = this.masterPageService.hideControls.controlProperties;
        if (controlConfig && controlConfig.hasOwnProperty('disableProgramList') && controlConfig.disableProgramList.length) {
          this.disableProgramList = controlConfig.disableProgramList;
        }
        if (controlConfig && controlConfig.hasOwnProperty('disableIndicatorList') && controlConfig.disableIndicatorList.length) {
          this.disableIndicatorList = controlConfig.disableIndicatorList;
        }
      }
    });
    this.programDDStngs();
    this.programIndDDStngs();
    this.lookupDDSettings();
  }

  ngOnInit(): void {
    let operationObj = this.masterPageService.getRouteOperation();
    if (operationObj) {
      this.masterPageService.hideSpinner = true;
      this.uiData.OperationId = operationObj.OperationId;
      this.uiData.OperCategory = operationObj.Category;
      this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
      this.masterPageService.setTitle(operationObj.Title);
      this.masterPageService.setModule(operationObj.Module);
      this.deviceSerialConfig.ACTIVE = CommonEnum.yes
      this.controlConfig = JSON.parse(
        localStorage.getItem(this.storageData.controlConfig)
      );
      this.configData = {
        uiData: this.uiData,
        url: this.apiConfigService.getSKUsUrl,
      };
      this.appConfig = JSON.parse(localStorage.getItem(StorageData.appConfig));
      this.manufacturerIdFocus();
      this.getProgramNames();
      this.getProgramIndicators();
      this.getLookupType();
      this.getLookupRefList();
    }
  }

  // Get Program Names
  getProgramNames() {
    this.programNameList = [];
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.loadControlData, CommonEnum.dispositionEngineAttribute,
      CommonEnum.programName);
    this.commonService.commonApiCall(url, requestObj, (result, statusFlag) => {
      if (statusFlag && !this.appService.checkNullOrUndefined(result.Response) && result.Response.length) {
        this.spinner.hide();
        this.programNameList = result.Response;
      }
    });
  }

  // Get program indicators
  getProgramIndicators() {
    this.programIndicatorList = [];
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.loadControlData, CommonEnum.dispositionEngineAttribute,
      CommonEnum.programIndicator);
    this.commonService.commonApiCall(url, requestObj, (result, statusFlag) => {
      if (statusFlag && !this.appService.checkNullOrUndefined(result.Response) && result.Response.length) {
        this.spinner.hide();
        this.programIndicatorList = result.Response;
      }
    });
  }

  // Get Lookup Type
  getLookupType() {
    this.lookupTypeOptions = [];
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.loadControlData,
      CommonEnum.skuLookupAttr,
      CommonEnum.lookypType)
    this.commonService.commonApiCall(url, requestObj, (result, statusFlag) => {
      if (statusFlag && !this.appService.checkNullOrUndefined(result.Response) && result.Response.length) {
        this.spinner.hide();
        result.Response.forEach((element) => {
          const dd: dropdown = new dropdown();
          dd.Id = element.Id;
          dd.Text = element.Text;
          this.lookupTypeOptions.push(dd);
        });
      }
    });
  }

  // Search Results
  getSkuSerialList() {
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, "RX_VZW_DEVICE_CAT_SN_XREF": this.deviceSerialConfig };
    const url = String.Join('/', this.apiConfigService.GetDeviceCatXrefDataUrl)
    this.deviceSerialList = null;
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.spinner.hide();
        if (res.Response.hasOwnProperty('DeviceCatXrefRecords')) {
          if (!checkNullorUndefined(res.Response.DeviceCatXrefRecords))
            this.deviceSerialResponse = res.Response.DeviceCatXrefRecords;
          this.gridForm();
        }
      }
    });
    this.clearForm();
  }

  // Add or Update the Record
  addOrUpdateRecord() {
    if (this.btnName === CommonEnum.save) {
      if (this.appService.IsObjectsMatch(this.deviceSerialConfig, this.tempDeviceSerialConfig)) {
        this.snackbar.info(this.appService.getErrorText('2660043'));
        return;
      }
    }
    this.spinner.show();
    const requestObj = {
      ClientData: this.clientData,
      UIData: this.uiData,
      RX_VZW_DEVICE_CAT_SN_XREF: this.deviceSerialConfig,
    };
    this.deviceSerialList = null;
    this.commonService.commonApiCall(
      this.apiConfigService.saveDeviceCatXrefRecordUrl,
      requestObj,
      (res, statusFlag) => {
        this.spinner.hide();
        if (statusFlag && !this.appService.checkNullOrUndefined(res.Response)) {
          if (!this.appService.checkNullOrUndefined(res.StatusMessage)) {
            if (res.Response.hasOwnProperty(['DeviceCatXref'])) {
              const saveResponse = res.Response.DeviceCatXref;
              this.deviceSerialResponse = [];
              this.deviceSerialResponse.push(saveResponse);
              this.gridForm();
              this.snackbar.success(res.StatusMessage);
            }
          }
          this.clearForm();
        }
      }
    );
  }

  // Populate grid
  private gridForm() {
    this.grid = new Grid();
    this.grid.EditVisible = true;
    this.grid.DeleteVisible = true;
    this.grid.ItemsPerPage = this.appConfig.deviceCatalog.griditemsPerPage;
    this.deviceSerialList = this.appService.onGenerateJson(
      this.deviceSerialResponse,
      this.grid
    );
  }

  // Lookup Reference Deselect
  lookupRefDeSelect() {
    this.deviceSerialConfig.LOOKUP_REF = null;
    this.selectedCategory = [];
  }

  // Program Name & Indicator dropdown settings
  programDDStngs() {
    this.programDDSettings = new DropDownSettings();
    this.programDDSettings.idField = 'Id';
    this.programDDSettings.textField = 'Text';
  }

  programIndDDStngs() {
    this.programIndDDSettings = new DropDownSettings();
    this.programIndDDSettings.idField = 'Id';
    this.programIndDDSettings.textField = 'Text';
  }

  // Lookup Reference dropdown settings
  lookupDDSettings() {
    this.lookupRefDDSettings = new DropDownSettings();
    this.lookupRefDDSettings.idField = 'Id';
    this.lookupRefDDSettings.textField = 'Text';
    this.lookupRefDDSettings.singleSelection = true;
  }

  // Emitted Sku Result
  typeaheadSKUResponse(event) {
    this.clearActualSKUTypeAhead = false;
    if (!this.appService.checkNullOrUndefined(event)) {
      this.deviceSerialConfig.LOOKUP_REF = event.Sku;
    } else {
      this.deviceSerialConfig.LOOKUP_REF = null;
    }
  }

  getSelectedParserItemsIn(modelOptionsOutput) {
    let intersection;
    if (!checkNullorUndefined(this.disableIndicatorList) && this.disableIndicatorList.length) {
      intersection = modelOptionsOutput.filter(element => this.disableIndicatorList.includes(element));
      if (!checkNullorUndefined(intersection) && intersection.length) {
        this.selectedInModelOptions = [];
        this.programIndDDSettings = Object.assign({}, this.programIndDDSettings, { limitSelection: 1 });
        this.selectedInModelOptions.push(intersection[0]);
      }
      else {
        this.programIndDDSettings = Object.assign({}, this.programIndDDSettings, { limitSelection: this.programIndicatorList.length });
        this.selectedInModelOptions = modelOptionsOutput.sort();
      }
    } else {
      this.selectedInModelOptions = modelOptionsOutput.sort();
    }
  }

  // on edit binding selected parser items
  getSelectedParserItems(modelOptionsOutput) {
    let intersection;
    if (!checkNullorUndefined(this.disableProgramList) && this.disableProgramList.length) {
      intersection = modelOptionsOutput.filter(element => this.disableProgramList.includes(element));
      if (intersection && intersection.length) {
        this.selectedModelOptions = [];
        this.programDDSettings = Object.assign({}, this.programDDSettings, { limitSelection: 1 });
        this.selectedModelOptions.push(intersection[0]);
      }
      else {
        this.programDDSettings = Object.assign({}, this.programDDSettings, { limitSelection: this.programNameList.length });
        this.selectedModelOptions = modelOptionsOutput.sort();
      }
    } else {
      this.selectedModelOptions = modelOptionsOutput.sort();
    }
  }


  itemDisable(event) {
    if (this.disableProgramList.includes(event.Id)) {
      this.modelOptionsKeys = [];
      this.selectedModelOptions = [];
      this.deviceSerialConfig.PROGRAM_NAME = event.Id;
      this.programDDSettings = Object.assign({}, this.programDDSettings, { limitSelection: 1 });
      this.selectedModelOptions.push(event);
      this.modelOptionsKeys.push(event.Id);
    }
    else {
      this.programDDSettings = Object.assign({}, this.programDDSettings, { limitSelection: this.programNameList.length });
      let result;
      result = this.selectedModelOptions.filter(element => !this.disableProgramList.includes(element))
      this.selectedModelOptions = result;
      if (this.modelOptionsKeys.indexOf(event.Id) === -1) {
        this.modelOptionsKeys.push(event.Id);
        this.modelOptionsKeys.filter(element => !this.disableProgramList.includes(element))
      }
    }
  }

  // Program Name change
  onProgramNameChange(event) {
    if (!checkNullorUndefined(this.disableProgramList) && this.disableProgramList.length) {
      this.itemDisable(event);
    }
    if (this.isEditMode) {
      if (!this.appService.checkNullOrUndefined(this.deviceSerialConfig.PROGRAM_NAME)) {
        const modelOprionsOutput: any[] = this.deviceSerialConfig.PROGRAM_NAME.split(",");
        if (event.Id !== "") {
          if (modelOprionsOutput.indexOf(event.Id) === -1) {
            modelOprionsOutput.push(event.Id);
          }
        }
        const emptyRemove: any[] = modelOprionsOutput.filter(val => val != "");
        this.deviceSerialConfig.PROGRAM_NAME = emptyRemove.sort().join();
      } else {
        this.checkModelOptionsKeys(event);
      }
    } else {
      this.checkModelOptionsKeys(event);
    }
    this.appErrService.clearAlert();
  }

  private checkModelOptionsKeys(event: any) {
    if (checkNullorUndefined(this.disableProgramList) && !this.disableProgramList.length) {
      if (this.modelOptionsKeys.indexOf(event.Id) === -1) {
        this.modelOptionsKeys.push(event.Id);
      }
    }
    this.deviceSerialConfig.PROGRAM_NAME = this.modelOptionsKeys.sort().join();
  }

  itemInDisable(event) {
    if (this.disableIndicatorList.includes(event.Id)) {
      this.modelOptionsKeysIn = [];
      this.selectedInModelOptions = [];
      this.deviceSerialConfig.PROGRAM_INDICATOR = event.Id;
      this.programIndDDSettings = Object.assign({}, this.programIndDDSettings, { limitSelection: 1 });
      this.selectedInModelOptions.push(event);
      this.modelOptionsKeysIn.push(event.Id);
    }
    else {
      this.programIndDDSettings = Object.assign({}, this.programIndDDSettings, { limitSelection: this.programIndicatorList.length });
      let result;
      result = this.selectedInModelOptions.filter(element => !this.disableIndicatorList.includes(element))
      this.selectedInModelOptions = result;
      if (this.modelOptionsKeysIn.indexOf(event.Id) === -1) {
        this.modelOptionsKeysIn.push(event.Id);
        this.modelOptionsKeysIn.filter(element => !this.disableIndicatorList.includes(element))
      }
    }
  }

  // On Program Name DeSelect
  onProgramNameDeSelect(event) {
    if (this.isEditMode) {
      if (!this.appService.checkNullOrUndefined(this.deviceSerialConfig.PROGRAM_NAME)) {
        const parserOutput: any[] = this.deviceSerialConfig.PROGRAM_NAME.split(",");
        const deEmptyRemove: any[] = parserOutput.filter(val => val != "");
        const result: any[] = deEmptyRemove.filter((ele) => ele !== event.Id);
        this.deviceSerialConfig.PROGRAM_NAME = result.sort().join();
      }
    } else {
      const index = this.modelOptionsKeys.indexOf(event.Id);
      if (index > -1) {
        this.modelOptionsKeys.splice(index, 1);
      }
      this.deviceSerialConfig.PROGRAM_NAME = this.modelOptionsKeys.sort().join();
    }
    this.appErrService.clearAlert();
  }

  // Program Indicator Select
  onIndicatorChange(event) {
    if (!checkNullorUndefined(this.disableIndicatorList) && this.disableIndicatorList.length) {
      this.itemInDisable(event)
    }
    if (this.isEditMode) {
      // on edit mode updateing  model master parser string
      if (!this.appService.checkNullOrUndefined(this.deviceSerialConfig.PROGRAM_INDICATOR)) {
        const modelOprionsOutput: any[] = this.deviceSerialConfig.PROGRAM_INDICATOR.split(",");
        if (event.Id !== "") {
          if (modelOprionsOutput.indexOf(event.Id) === -1) {
            modelOprionsOutput.push(event.Id);
          }
        }
        const emptyRemove: any[] = modelOprionsOutput.filter(val => val != "");
        this.deviceSerialConfig.PROGRAM_INDICATOR = emptyRemove.sort().join();
      } else {
        this.checkModelOptionsKeysIn(event);
      }
    } else {
      this.checkModelOptionsKeysIn(event);
    }
    this.appErrService.clearAlert();
  }

  private checkModelOptionsKeysIn(event: any) {
    if (checkNullorUndefined(this.disableIndicatorList) && !this.disableIndicatorList.length) {
      if (this.modelOptionsKeysIn.indexOf(event.Id) === -1) {
        this.modelOptionsKeysIn.push(event.Id);
      }
    }
    this.deviceSerialConfig.PROGRAM_INDICATOR = this.modelOptionsKeysIn.sort().join();
  }

  // Program Indicator Deselect
  onIndicatorDeSelect(event) {
    if (this.isEditMode) {
      // on edit mode updateing  model master parser string
      if (!this.appService.checkNullOrUndefined(this.deviceSerialConfig.PROGRAM_INDICATOR)) {
        const parserOutput: any[] = this.deviceSerialConfig.PROGRAM_INDICATOR.split(",");
        const deEmptyRemove: any[] = parserOutput.filter(val => val != "");
        const result: any[] = deEmptyRemove.filter((ele) => ele !== event.Id);
        this.deviceSerialConfig.PROGRAM_INDICATOR = result.sort().join();
      }
    } else {
      const index = this.modelOptionsKeysIn.indexOf(event.Id);
      if (index > -1) {
        this.modelOptionsKeysIn.splice(index, 1);
      }
      this.deviceSerialConfig.PROGRAM_INDICATOR = this.modelOptionsKeysIn.sort().join();
    }
    this.appErrService.clearAlert();
  }

  // Lookup type selection
  onLookupTypeSelect(value) {
    this.isClearBtnDisabled = false;
    this.appErrService.clearAlert();
    this.isLookupRefDisabled = false;
    this.deviceSerialConfig.LOOKUP_TYPE = value;
    this.deviceSerialConfig.LOOKUP_REF = null;
    if (value == CommonEnum.Item) {
      this.isDDRefShow = true;
      this.appService.setFocus('lookupRefDDList');
    }
    if (value == CommonEnum.SKU) {
      this.isDDRefShow = false;
      this.appService.setFocus('skuLookupRef');
    }
    let LookupType = <HTMLInputElement>document.getElementById('skuLookupType');
    if (LookupType) {
      LookupType.blur();
    }
  }

  //Lookup Ref List for Lookup type == Item Id
  getLookupRefList() {
    this.deviceSerialConfig.LOOKUP_REF = "";
    this.lookupRefList = [];
    const url = String.Join("/", this.apiConfigService.GetItemIdsRefUrl);
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag && !this.appService.checkNullOrUndefined(res.Response)) {
        this.lookupRefList = res.Response;
      }
    });
  }

  lookupRefSelect(value) {
    this.deviceSerialConfig.LOOKUP_REF = value.Id;
    this.appErrService.clearAlert();
    // this.selectedControlValues = value;
    // this.selectedModelOptionsRef = value;
  }

  // On Toggle Change
  onActiveChange(value) {
    this.deviceSerialConfig.ACTIVE = value ? 'Y' : 'N';
    this.isClearBtnDisabled = false;
  }

  // On Input Change
  changeInput() {
    this.isClearBtnDisabled = false;
  }

  // On Grid Row Edit
  editSKUSerialNumberList(event) {
    this.tempDeviceSerialConfig = new DeviceSerial();
    this.deviceSerialConfig = new DeviceSerial();
    this.tempDeviceSerialConfig = Object.assign(this.tempDeviceSerialConfig, event);
    this.clearActualSKUTypeAhead = false;
    this.isEditMode = true;
    this.btnName = CommonEnum.save;
    this.deviceSerialConfig = Object.assign(this.deviceSerialConfig, event);
    if (event.LOOKUP_REF != undefined) {
      // this.editActualSKUTypeAhead = event;
      this.editActualSKUTypeAhead = event.LOOKUP_REF;
    }
    if (event.LOOKUP_TYPE == CommonEnum.Item) {
      this.isDDRefShow = true;
      this.isLookupRefDisabled = false;
      this.editActualSKUTypeAhead = null;
      this.selectedCategory = this.lookupRefList.filter(e => e.Id === this.deviceSerialConfig.LOOKUP_REF);
    } if (event.LOOKUP_TYPE == CommonEnum.SKU) {
      this.deviceSerialConfig.LOOKUP_REF = event.LOOKUP_REF;
      this.isDDRefShow = false;
      this.isLookupRefDisabled = false;
    }
    if (!this.appService.checkNullOrUndefined(this.deviceSerialConfig.PROGRAM_NAME)) {
      const modelOptionsOutput: any[] = this.deviceSerialConfig.PROGRAM_NAME.split(",");
      this.getSelectedParserItems(modelOptionsOutput);
    } else {
      this.selectedModelOptions = [];
    }
    if (!this.appService.checkNullOrUndefined(this.deviceSerialConfig.PROGRAM_INDICATOR)) {
      const modelOptionsOutput: any[] = this.deviceSerialConfig.PROGRAM_INDICATOR.split(",");
      this.getSelectedParserItemsIn(modelOptionsOutput);
    } else {
      this.selectedInModelOptions = [];
    }
  }

  // On Delete Icon Click
  deleteRecordPop(event) {
    this.deleteRecordConfig = event;
    this.masterPageService.openModelPopup(DeleteConfirmationDialogComponent, false, 'dialog-width-sm')
    this.masterPageService.dialogRef.componentInstance.emitConfirmation.subscribe((value) => {
      this.dialog.closeAll();
    this.spinner.show();
    const requestObj = {
      ClientData: this.clientData,
      UIData: this.uiData,
      RX_VZW_DEVICE_CAT_SN_XREF: this.deleteRecordConfig,
    };
    this.deviceSerialList = null;
    this.commonService.commonApiCall(
      this.apiConfigService.deleteDeviceCatXrefDataUrl,
      requestObj,
      (res, statusFlag) => {
        this.spinner.hide();
        if (statusFlag && !this.appService.checkNullOrUndefined(res.Response)) {
          if (!this.appService.checkNullOrUndefined(res.StatusMessage)) {
            if (res.Response.hasOwnProperty(['DeviceCatXrefRecords'])) {
              this.deviceSerialResponse = [];
              this.deviceSerialResponse = res.Response.DeviceCatXrefRecords;
              this.gridForm();
              this.snackbar.success(res.StatusMessage);
            }
          }
          this.clearForm();
        }
      }
    );
    });
  }


  // Form clear
  clearForm() {
    this.btnName = CommonEnum.add;
    this.editActualSKUTypeAhead = null;
    this.selectedCategory = [];
    this.manufacturerIdFocus();
    this.selectedControlVal = "";
    this.isEditMode = false;
    this.clearActualSKUTypeAhead = true;
    this.appErrService.clearAlert();
    this.isLookupRefDisabled = true;
    this.isClearBtnDisabled = true;
    this.modelOptionsKeys = [];
    this.modelOptionsKeysIn = [];
    this.selectedModelOptions = [];
    this.selectedInModelOptions = [];
    this.selectedControlValues = "";
    this.deviceSerialConfig = new DeviceSerial();
    this.deviceSerialConfig.ACTIVE = CommonEnum.yes;
  }

  // Grid Clear
  clearGrid() {
    this.deviceSerialList = null;
  }

  // Manufacturer Id Focus
  manufacturerIdFocus() {
    this.appService.setFocus('skuManufacturerId');
  }

  ngOnDestroy() {
    this.masterPageService.defaultProperties();
  }
}