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
import { Carrier } from '../../models/maintenance/carrier/Carrier';
import { CommonService } from '../../services/common.service';
import { StorageData } from '../../enums/storage.enum';

@Component({
  selector: 'app-carrier',
  templateUrl: './carrier.component.html',
  styleUrls: ['./carrier.component.css']
})
export class CarrierComponent implements OnInit, OnDestroy {

  // model
  carrierCodeConfig = new Carrier();
  tempCarrierCodeConfig = new Carrier();

  // common
  clientData = new ClientData();
  uiData = new UiData();
  grid: Grid;
  carrierBtnName = CommonEnum.add;
  commonEnum = CommonEnum;
  textBoxPattern: any;
  appConfig: any;

  // disabled
  isCodeDisabled = false;
  isClearBtnDisabled = true;
  isCarrierSearchBtnDisabled = false;

  carrierCodeList: any[];


  constructor(
    public appErrService: AppErrorService,
    public masterPageService: MasterPageService,
    private apiConfigService: ApiConfigService,
    public apiservice: ApiService,
    private spinner: NgxSpinnerService,
    public appService: AppService,
    private snackbar: XpoSnackBar,
    private commonService: CommonService
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
      this.appConfig = JSON.parse(localStorage.getItem(StorageData.appConfig));
      this.masterPageService.setTitle(operationObj.Title);
      this.masterPageService.setModule(operationObj.Module);
      this.carrierCodeConfig.Active = CommonEnum.yes;
      this.setCarrierFocus();
    }
  }


  // Carrier code Search
  getCarriers() {
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getCarriersUrl, this.carrierCodeConfig.CarrierCode);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          if (res.Response.length) {
            this.showGrid(res.Response);
          }
        }
      } else {
        this.carrierCodeList = null;
      }
    });
  }

  // Grid List
  showGrid(gridData) {
    this.carrierCodeList = [];
    this.grid = new Grid();
    this.grid.EditVisible = true;
    this.carrierCodeList = this.appService.onGenerateJson(gridData, this.grid);
  }

  // add or update Carrier Code
  addOrUpdateCarrierCode() {
    let url;
    if (this.carrierBtnName === CommonEnum.add) {
      url = String.Join('/', this.apiConfigService.insertCarrierUrl);
    } else if (this.carrierBtnName === CommonEnum.save) {
      if (this.appService.IsObjectsMatch(this.carrierCodeConfig, this.tempCarrierCodeConfig)) {
        this.snackbar.info(this.appService.getErrorText('2660043'));
        return;
      }
      url = String.Join('/', this.apiConfigService.updateCarrierUrl);
    }
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, Carrier: this.carrierCodeConfig };
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          if (res.Response.length) {
            this.showGrid(res.Response);
            this.snackbar.success(res.StatusMessage);
            this.clear(true);
          }
        }
      }
    });
  }

  // On Edit Grid Data
  editCarrierCodeRow(data) {
    this.carrierCodeConfig = new Carrier();
    this.tempCarrierCodeConfig = new Carrier();
    this.carrierCodeConfig = Object.assign(this.carrierCodeConfig, data);
    this.tempCarrierCodeConfig = Object.assign(this.tempCarrierCodeConfig, data);
    this.carrierBtnName = CommonEnum.save;
    this.isCodeDisabled = true;
    this.isCarrierSearchBtnDisabled = true;
    this.isClearBtnDisabled = false;
    this.carrierCodeList['EditHighlight'] = true;
  }

  // On Toggle Active
  onActiveChange(value) {
    this.carrierCodeConfig.Active = value ? 'Y' : 'N';
    this.isClearBtnDisabled = false;
  }

  // enable Clear
  changeInput() {
    this.isClearBtnDisabled = false;
  }

  // clear Carrier Code
  clear(isGridRequried?) {
    this.appErrService.clearAlert();
    this.isClearBtnDisabled = true;
    this.carrierBtnName = CommonEnum.add;
    this.isCodeDisabled = false;
    this.isCarrierSearchBtnDisabled = false;
    if (!this.appService.checkNullOrUndefined(this.carrierCodeList)) {
      this.carrierCodeList['EditHighlight'] = false;
    }
    this.carrierCodeConfig = new Carrier();
    this.tempCarrierCodeConfig = new Carrier();
    this.carrierCodeConfig.Active = CommonEnum.yes;
    if (!isGridRequried) {
      this.carrierCodeList = null;
    } else {
      this.isClearBtnDisabled = false;
    }
    this.setCarrierFocus();
  }

  setCarrierFocus() {
    this.appService.setFocus('carrierCode');
  }

  ngOnDestroy() {
    this.masterPageService.defaultProperties();
  }

}

