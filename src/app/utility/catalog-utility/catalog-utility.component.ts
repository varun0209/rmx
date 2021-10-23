import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { String } from "typescript-string-operations";

import { CommonEnum } from '../../enums/common.enum';
import { StorageData } from '../../enums/storage.enum';
import { checkNullorUndefined } from '../../enums/nullorundefined';
import { dropdown } from '../../models/common/Dropdown';
import { ClientData } from '../../models/common/ClientData';
import { Grid } from '../../models/common/Grid';
import { UiData } from '../../models/common/UiData';
import { CatalogUtil } from '../../models/utility/catalog-utility';
import { AppService } from '../../utilities/rlcutl/app.service';
import { ApiConfigService } from '../../utilities/rlcutl/api-config.service';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';
import { CommonService } from '../../services/common.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-catalog-utility',
  templateUrl: './catalog-utility.component.html',
  styleUrls: ['./catalog-utility.component.css']
})
export class CatalogUtilityComponent implements OnInit {

  @Output() emitCatalog = new EventEmitter();
  popupCatalog = new CatalogUtil();
  storageData = StorageData;
  clientData: ClientData;
  uiData: UiData;
  carrierCodeList = [];
  oemList = [];

  catalogValues: any;
  deviceCatalogResponse: any;
  appConfig: any;
  isModelDisabled = true;
  grid: Grid;
  catalogList: any;
  catalogModelPattern: RegExp;

  constructor(
    private apiConfigService: ApiConfigService,
    private commonService: CommonService,
    private spinner: NgxSpinnerService,
    private appService: AppService,
    public appErrService: AppErrorService,
    public masterPageService: MasterPageService,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
    const pattern = JSON.parse(localStorage.getItem(StorageData.patternList));
    if (!this.appService.checkNullOrUndefined(pattern)) {
      this.catalogModelPattern = new RegExp(pattern.catalogModelPattern);
    }
    this.appConfig = JSON.parse(localStorage.getItem(this.storageData.appConfig));
  }

  ngOnInit(): void {
    this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
    if (this.data) {
      this.clientData = this.data.clientData;
      this.uiData = this.data.uiData;
      this.deviceCatalogResponse = this.data.catalogValues;
    }
    if (!checkNullorUndefined(this.deviceCatalogResponse)) {
      this.gridForm();
    }
    this.getcarrierCode();
    this.getOEMData();
    this.onCarrierCodeFocus();
  }

  //Carrier Dropdown Data
  getcarrierCode() {
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
      }
    });
  }

  //OEM Dropdown Data
  getOEMData() {
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
      }
    });
  }

  //Search Data
  getDeviceCatalogList() {
    this.spinner.show();
    const requestObj = {
      ClientData: this.clientData,
      UIData: this.uiData,
      DeviceCatalog: this.popupCatalog
    };
    this.catalogList = null;
    this.commonService.commonApiCall(
      this.apiConfigService.searchDeviceCatalogUrl,
      requestObj,
      (res, statusFlag) => {
        this.spinner.hide();
        if (statusFlag && !checkNullorUndefined(res.Response)) {
          this.deviceCatalogResponse = res.Response;
          this.gridForm();
        }
      }
    );
  }

  private gridForm() {
    this.grid = new Grid();
    this.grid.EditVisible = true;
    this.grid.ItemsPerPage = this.appConfig.deviceCatalog.griditemsPerPage;
    this.catalogList = this.appService.onGenerateJson(
      this.deviceCatalogResponse,
      this.grid
    );
  }

  //Popup close
  closePopup() {
    this.masterPageService.hideModal();
    this.appService.setFocus('carrier');
  }

  changeInput() {
    this.appErrService.clearAlert();
  }

  //Carrier code change
  changecarrierCode(event) {
    this.appErrService.clearAlert();
    this.popupCatalog.Carrier = event.value;
    this.onOEMFocus();
    this.changedropdown();
  }

  //OEM code change
  changeOEMCode(event) {
    this.appErrService.clearAlert();
    this.popupCatalog.OEM = event.value;
    this.onModelFocus()
    this.changedropdown();
  }

  //Dropdown change
  changedropdown() {
    if (this.popupCatalog.Carrier !== undefined && this.popupCatalog.OEM !== undefined) {
      this.isModelDisabled = false;
    }
  }

  //Edit Catalog List
  editCatalogList(event) {
    this.emitCatalog.emit(event);
    this.masterPageService.hideDialog();
  }

  //Clearing Data
  clearData() {
    this.popupCatalog = new CatalogUtil();
    this.catalogList = null;
    this.isModelDisabled = true;
    this.onCarrierCodeFocus();
    this.appErrService.clearAlert();
  }

  //Carrier code Focus
  onCarrierCodeFocus() {
    this.appService.setFocus('catCarrierCode');
  }

  //OEM Focus
  onOEMFocus() {
    this.appService.setFocus('catOEM');
  }

  //Model Focus
  onModelFocus() {
    this.appService.setFocus('catModel');
  }

}
