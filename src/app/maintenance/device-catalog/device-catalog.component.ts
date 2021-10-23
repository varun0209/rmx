import {
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { NgForm } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { String } from "typescript-string-operations";
import { NgxSpinnerService } from "ngx-spinner";
import { MasterPageService } from "../../utilities/rlcutl/master-page.service";
import { CommonEnum } from "../../enums/common.enum";
import { AppErrorService } from "../../utilities/rlcutl/app-error.service";
import { Grid } from "../../models/common/Grid";
import { ClientData } from "../../models/common/ClientData";
import { UiData } from "../../models/common/UiData";
import { StorageData } from "../../enums/storage.enum";
import { ApiConfigService } from "../../utilities/rlcutl/api-config.service";
import { CommonService } from "../../services/common.service";
import { AppService } from "../../utilities/rlcutl/app.service";
import { dropdown } from "../../models/common/Dropdown";
import { deviceCatalog } from "../../models/maintenance/device-catalog/deviceCatalog";
import { TextCase } from "../../enums/textcase.enum";
import { DropDownSettings } from "../../models/common/dropDown.config";
import { RmngtypeaheadComponent } from "../../framework/frmctl/rmngtypeahead/rmngtypeahead.component";
import { XpoSnackBar } from "@xpo/ngx-core/snack-bar";

@Component({
  selector: "app-device-catalog",
  templateUrl: "./device-catalog.component.html",
  styleUrls: ["./device-catalog.component.css"],
})
export class DeviceCatalogComponent implements OnInit, OnDestroy {
  @ViewChild("deviceCatalogForm") deviceCatalogForm: NgForm;
  @ViewChild(RmngtypeaheadComponent)
  actualSKUCtrl: RmngtypeaheadComponent;
  @ViewChild(RmngtypeaheadComponent)
  resultantSKUCtrl: RmngtypeaheadComponent;
  //#region  variables

  sysConfig: any;
  grid: Grid;
  operationObj: any;
  appConfig: any;
  controlConfig: any;
  configData: any;
  itemId: number;
  itemIDPattern: any;
  deviceCatalogDescPattern: any;
  itemTypeList = [];
  carrierCodeList = [];
  oemList = [];
  modelOptions = [];
  selectedModelOptions = [];
  modelOptionsKeys = [];
  catalogTypeList = [];
  dataCatalogList: any;
  deviceCatalogResponse: any;

  clearActualSKUTypeAhead = false;
  editActualSKUTypeAhead: any;
  clearResultantSKUTypeAhead = false;
  editResultantSKUTypeAhead: any;
  isActualSKUSelected = false;
  isResultantSKUSelected = false;
  isItemIdDisabled = false;
  iscarrierCodeDisabled = false;
  isoemCodeDisabled = false;
  isModelDisabled = false;
  isCatalogTypeDisabled = false;
  isColorDisabled = false;
  isModelOptionsDisabled = false;
  isSizeDisabled = false;
  isEditMode = false;
  //#endregion variabled

  //#region objects
  clientData = new ClientData();
  uiData = new UiData();
  deviceCatalog = new deviceCatalog();
  tempDeviceCatalog = new deviceCatalog();
  storageData = StorageData;
  commonEnum = CommonEnum;
  textCase = TextCase;
  btnName = this.commonEnum.add;
  msddSettings: DropDownSettings;
  catalogSizePattern: RegExp;
  catalogColorPattern: RegExp;
  catalogBMPattern: RegExp;
  deviceCatalogModelPattern: RegExp;
  //#endregion objects

  constructor(
    private apiConfigService: ApiConfigService,
    private commonService: CommonService,
    public appErrService: AppErrorService,
    public masterPageService: MasterPageService,
    private spinner: NgxSpinnerService,
    private snackbar: XpoSnackBar,
    public appService: AppService
  ) {
    const pattern = JSON.parse(localStorage.getItem(StorageData.patternList));
    if (!this.appService.checkNullOrUndefined(pattern)) {
      this.itemIDPattern = new RegExp(pattern.ItemIDPattern);
      this.deviceCatalogDescPattern = new RegExp(pattern.deviceCatalogDescPattern);
      this.deviceCatalogModelPattern = new RegExp(pattern.deviceCatalogModelPattern);
      this.catalogSizePattern = new RegExp(pattern.catalogSizePattern);
      this.catalogColorPattern = new RegExp(pattern.catalogColorPattern);
      this.catalogBMPattern = new RegExp(pattern.catalogBMPattern);
    }
  }

  ngOnInit() {
    this.operationObj = this.masterPageService.getRouteOperation();
    if (this.operationObj) {
      this.uiData.OperationId = this.operationObj.OperationId;
      this.uiData.OperCategory = this.operationObj.Category;
      this.clientData = JSON.parse(
        localStorage.getItem(this.storageData.clientData)
      );
      this.masterPageService.setTitle(this.operationObj.Title);
      this.masterPageService.setModule(this.operationObj.Module);
      this.appConfig = JSON.parse(
        localStorage.getItem(this.storageData.appConfig)
      );
      this.controlConfig = JSON.parse(
        localStorage.getItem(this.storageData.controlConfig)
      );
      this.msddSettings = new DropDownSettings();
      this.msddSettings.idField = "Id";
      this.msddSettings.textField = "Text";
      this.msddSettings.closeDropDownOnSelection = false;
      this.getItemTypes();
      this.getOEMCodeLists();
      this.getCarrierCodeLists();
      this.getModelOptions();
      this.getCatalogTypes();
      this.onItemIdFocus();
      this.configData = {
        uiData: this.uiData,
        url: this.apiConfigService.getSKUsUrl,
      };
    }
  }

  //#region populate data

  //Item Types
  getItemTypes() {
    this.itemTypeList = [];
    const url = String.Join(
      "/",
      this.apiConfigService.loadControlData,
      CommonEnum.deviceCatalogAttr,
      CommonEnum.itemType
    );
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag && !this.appService.checkNullOrUndefined(res.Response)) {
        res.Response.forEach((element) => {
          const dd: dropdown = new dropdown();
          dd.Id = element.Id;
          dd.Text = element.Text;
          this.itemTypeList.push(dd);
        });
      } else {
      }
    });
  }

  // OEM codes
  getOEMCodeLists() {
    this.oemList = [];
    const url = String.Join(
      "/",
      this.apiConfigService.loadControlData,
      CommonEnum.deviceCatalogAttr,
      CommonEnum.oem
    );
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag && !this.appService.checkNullOrUndefined(res.Response)) {
        res.Response.forEach((element) => {
          const dd: dropdown = new dropdown();
          dd.Id = element.Id;
          dd.Text = element.Text;
          this.oemList.push(dd);
        });
      } else {
      }
    });
  }

  // Carrier codes
  getCarrierCodeLists() {
    this.carrierCodeList = [];
    const url = String.Join(
      "/",
      this.apiConfigService.loadControlData,
      CommonEnum.deviceCatalogAttr,
      CommonEnum.carrierCode
    );
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag && !this.appService.checkNullOrUndefined(res.Response)) {
        res.Response.forEach((element) => {
          const dd: dropdown = new dropdown();
          dd.Id = element.Id;
          dd.Text = element.Text;
          this.carrierCodeList.push(dd);
        });
      } else {
      }
    });
  }

  // modeloptions
  getModelOptions() {
    this.modelOptions = [];
    const url = String.Join(
      "/",
      this.apiConfigService.loadControlData,
      CommonEnum.deviceCatalogAttr,
      CommonEnum.modelOptions
    );
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag && !this.appService.checkNullOrUndefined(res.Response)) {
        this.modelOptions = res.Response;
      } else {
      }
    });
  }

  // modeloptions
  getCatalogTypes() {
    this.catalogTypeList = [];
    const url = String.Join(
      "/",
      this.apiConfigService.loadControlData,
      CommonEnum.deviceCatalogAttr,
      CommonEnum.catalogType
    );
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag && !this.appService.checkNullOrUndefined(res.Response)) {
        res.Response.forEach((element) => {
          const dd: dropdown = new dropdown();
          dd.Id = element.Id;
          dd.Text = element.Text;
          this.catalogTypeList.push(dd);
        });
      } else {
      }
    });
  }

  //#endregion populate data

  //#region dropdowns

  changecarrierCode(event) {
    this.appErrService.clearAlert();
    this.deviceCatalog.CARRIER_CODE = event.value;
    this.appService.setFocus('oem');
  }

  changeOEMCode(event) {
    this.appErrService.clearAlert();
    this.deviceCatalog.OEM_CD = event.value;
    this.appService.setFocus('model');
  }

  changeItemType(event) {
    this.appErrService.clearAlert();
    this.deviceCatalog.ITEM_TYPE = event.value;
    let itemtype = <HTMLInputElement>document.getElementById('itemtype');
    if (itemtype) {
      itemtype.blur();
    }
  }

  changeModelOptions(event) {
    if (this.isEditMode) {
      // on edit mode updateing  model master parser string
      if (!this.appService.checkNullOrUndefined(this.deviceCatalog.SUSR2)) {
        const modelOprionsOutput: any[] = this.deviceCatalog.SUSR2.split(",");
        if (event.Id !== "") {
          if (modelOprionsOutput.indexOf(event.Id) === -1) {
            modelOprionsOutput.push(event.Id);
          }
        }
        const emptyRemove: any[] = modelOprionsOutput.filter(val => val != "");
        this.deviceCatalog.SUSR2 = emptyRemove.sort().join();
      } else {
        this.checkModelOptionsKeys(event);
      }
    } else {
      this.checkModelOptionsKeys(event);
    }
    this.appErrService.clearAlert();
  }

  private checkModelOptionsKeys(event: any) {
    if (this.modelOptionsKeys.indexOf(event.Id) === -1) {
      this.modelOptionsKeys.push(event.Id);
    }
    this.deviceCatalog.SUSR2 = this.modelOptionsKeys.sort().join();
  }

  modelOptionsDeSelect(event) {
    if (this.isEditMode) {
      // on edit mode updateing  model master parser string
      if (!this.appService.checkNullOrUndefined(this.deviceCatalog.SUSR2)) {
        const parserOutput: any[] = this.deviceCatalog.SUSR2.split(",");
        const deEmptyRemove: any[] = parserOutput.filter(val => val != "");
        const result: any[] = deEmptyRemove.filter((ele) => ele !== event.Id);
        this.deviceCatalog.SUSR2 = result.sort().join();
      }
    } else {
      const index = this.modelOptionsKeys.indexOf(event.Id);
      if (index > -1) {
        this.modelOptionsKeys.splice(index, 1);
      }
      this.deviceCatalog.SUSR2 = this.modelOptionsKeys.sort().join();
    }
    this.appErrService.clearAlert();
  }

  changeCatalogType(event) {
    this.appErrService.clearAlert();
    this.deviceCatalog.SUSR5 = event.value;
  }

  onActiveChange(val) {
    this.deviceCatalog.ACTIVE = val ? "Y" : "N";
  }

  typeaheadActualSKUResponse(event) {
    this.clearActualSKUTypeAhead = false;
    if (!this.appService.checkNullOrUndefined(event)) {
      this.deviceCatalog.ACTUAL_SKU = event.Sku;
      this.isActualSKUSelected = true;
    } else {
      this.deviceCatalog.ACTUAL_SKU = null;
      this.isActualSKUSelected = false;
    }
  }

  typeaheadResultantSKUResponse(event) {
    this.clearResultantSKUTypeAhead = false;
    if (!this.appService.checkNullOrUndefined(event)) {
      this.deviceCatalog.RESULTANT_SKU = event.Sku;
      this.isResultantSKUSelected = true;
    } else {
      this.deviceCatalog.RESULTANT_SKU = null;
      this.isResultantSKUSelected = false;
    }
  }

  //#endregion dropdowns

  ////#region save and update
  saveandUpdateDeviceCatalog() {
    if (this.btnName === CommonEnum.save) {
      if (this.appService.IsObjectsMatch(this.deviceCatalog, this.tempDeviceCatalog)) {
        this.snackbar.info(this.appService.getErrorText('2660043'));
        return;
      }
    }
    this.spinner.show();
    const requestObj = {
      ClientData: this.clientData,
      UIData: this.uiData,
      RX_DEVICE_CATALOG: this.deviceCatalog,
    };
    this.dataCatalogList = null;
    this.commonService.commonApiCall(
      this.apiConfigService.saveDeviceCatalogUrl,
      requestObj,
      (res, statusFlag) => {
        this.spinner.hide();
        if (statusFlag && !this.appService.checkNullOrUndefined(res.Response)) {
          if (!this.appService.checkNullOrUndefined(res.StatusMessage)) {
            if (res.Response.hasOwnProperty(['DeviceCatalog'])) {
              const saveResponse = res.Response.DeviceCatalog;
              this.deviceCatalogResponse = [];
              this.deviceCatalogResponse.push(saveResponse);
              this.gridForm();
              this.snackbar.success(res.StatusMessage);
            }
          }
          this.clearForm();
        }
      }
    );
  }
  private gridForm() {
    this.grid = new Grid();
    this.grid.EditVisible = true;
    this.grid.ItemsPerPage = this.appConfig.deviceCatalog.griditemsPerPage;
    this.dataCatalogList = this.appService.onGenerateJson(
      this.deviceCatalogResponse,
      this.grid
    );
  }

  //#endregion

  //#reoion  search
  getDeviceCatalogRecords() {
    this.spinner.show();
    const requestObj = {
      ClientData: this.clientData,
      UIData: this.uiData,
      RX_DEVICE_CATALOG: this.deviceCatalog,
    };
    this.dataCatalogList = null;
    this.commonService.commonApiCall(
      this.apiConfigService.getDeviceCatalogRecordsUrl,
      requestObj,
      (res, statusFlag) => {
        this.spinner.hide();
        if (statusFlag && !this.appService.checkNullOrUndefined(res.Response)) {
          this.deviceCatalogResponse = res.Response.DeviceCatalogRecords;
          this.gridForm();
        }
      }
    );
  }

  ////#endregion search

  //# region edit
  editDeviceCatalogList(event) {
    this.tempDeviceCatalog = new deviceCatalog();
    this.deviceCatalog = new deviceCatalog();
    this.tempDeviceCatalog = Object.assign(this.tempDeviceCatalog, event);
    this.clearActualSKUTypeAhead = false;
    this.clearResultantSKUTypeAhead = false;
    this.isEditMode = true;
    this.btnName = CommonEnum.save;
    this.deviceCatalog = Object.assign(this.deviceCatalog, event);
    if (!this.appService.checkNullOrUndefined(this.deviceCatalog.SUSR2)) {
      const modelOptionsOutput: any[] = this.deviceCatalog.SUSR2.split(",");
      this.getSelectedParserItems(modelOptionsOutput);
    } else {
      this.selectedModelOptions = [];
    }
    this.editActualSKUTypeAhead = event.ACTUAL_SKU;
    if (this.editActualSKUTypeAhead) {
      this.isActualSKUSelected = true;
    }
    this.editResultantSKUTypeAhead = event.RESULTANT_SKU;
    if (this.editResultantSKUTypeAhead) {
      this.isResultantSKUSelected = true;
    }

  }

  // on edit binding selected parser items
  getSelectedParserItems(modelOptionsOutput) {
    this.selectedModelOptions = modelOptionsOutput.sort();
  }

  //#endregion edit

  changeInput() {
    this.appErrService.clearAlert();
  }

  clearForm() {
    if (!this.appService.checkNullOrUndefined(this.actualSKUCtrl)) {
    }
    this.btnName = CommonEnum.add;
    this.isItemIdDisabled = false;
    this.iscarrierCodeDisabled = false;
    this.isoemCodeDisabled = false;
    this.isModelDisabled = false;
    this.isCatalogTypeDisabled = false;
    this.isColorDisabled = false;
    this.isModelOptionsDisabled = false;
    this.isSizeDisabled = false;
    this.isEditMode = false;
    this.modelOptionsKeys = [];
    this.clearActualSKUTypeAhead = true;
    this.clearResultantSKUTypeAhead = true;
    this.editActualSKUTypeAhead = null;
    this.editResultantSKUTypeAhead = null;
    this.deviceCatalogForm.reset();
    this.deviceCatalog = new deviceCatalog();
    this.tempDeviceCatalog = new deviceCatalog();
    this.isActualSKUSelected = false;
    this.isResultantSKUSelected = false;
    this.appErrService.clearAlert();
    this.onItemIdFocus();
  }

  clearGrid() {
    this.dataCatalogList = null;
  }

  onItemIdFocus() {
    this.appService.setFocus('itemID');
  }

  ngOnDestroy() {
    this.masterPageService.defaultProperties();
  }
}
