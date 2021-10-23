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
import { AppService } from '../../utilities/rlcutl/app.service';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { CommonService } from '../../services/common.service';
import { DropDownSettings } from '../../models/common/dropDown.config';
import { StorageData } from '../../enums/storage.enum';
import { Parameter, RxSkuAttrModel } from '../../models/maintenance/sku-attribute/sku-attribute';
import { Subscription } from 'rxjs';
import { checkNullorUndefined } from '../../enums/nullorundefined';

@Component({
  selector: 'app-sku-attribute',
  templateUrl: './sku-attribute.component.html',
  styleUrls: ['./sku-attribute.component.css']
})

export class SkuAttributeComponent implements OnInit, OnDestroy {

  clientData = new ClientData();
  uiData = new UiData();
  commonEnum = CommonEnum;
  textBoxPattern: any;
  emitHideSpinner: Subscription;

  // clear
  isClearBtnDisabled = true;

  // save or update
  isSaveOrUpdateDisabled = true;
  skuAttrBtnName = CommonEnum.add;

  // sku control
  attrSkuList = [];
  attrSkuValue: any;
  isAttrSkuDisabled = false;
  dropdownSettings: DropDownSettings;

  // attribute sku contrls
  attrJsonObj = [];
  parameterNameList = [];
  tagList = [];
  selectedParameterName = '';

  rxSkuAttrModel = new RxSkuAttrModel();
  tempRxSkuAttrModel = new RxSkuAttrModel();

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
    this.emitHideSpinner = this.masterPageService.emitHideSpinner.subscribe(spinnerFlag => {
      if (!this.appService.checkNullOrUndefined(spinnerFlag) && spinnerFlag) {
        this.getSKUList();
      }
    });
  }

  ngOnInit() {
    const operationObj = this.masterPageService.getRouteOperation();
    if (operationObj) {
      this.uiData.OperationId = operationObj.OperationId;
      this.uiData.OperCategory = operationObj.Category;
      this.clientData = JSON.parse(localStorage.getItem('clientData'));
      this.masterPageService.setTitle(operationObj.Title);
      this.masterPageService.setModule(operationObj.Module);
      localStorage.setItem(StorageData.module, operationObj.Module);
      this.appErrService.appMessage();
      // setting value to hidespinner (based on this value we are emiting emithidespinner method)
      this.masterPageService.hideSpinner = true;
      this.dropdownSettings = new DropDownSettings();
      this.dropdownSettings.idField = 'Id';
      this.dropdownSettings.textField = 'Text';
      this.dropdownSettings.singleSelection = true;
      this.appService.setFocus('attrSku');
    }
    const pattern = JSON.parse(localStorage.getItem(StorageData.patternList));
    if (!this.appService.checkNullOrUndefined(pattern)) {
      this.textBoxPattern = new RegExp(pattern.namePattern);
    }
  }

  getSKUList() {
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getSKUList);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag && res.Response.hasOwnProperty('SKULIST') && res.Response.SKULIST.length) {
        this.attrSkuList = res.Response['SKULIST'];
        this.getJSONTagList();
      } else {
        this.spinner.hide();
      }
    });
  }

  getJSONTagList() {
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getJSONTagList);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag && res.Response.hasOwnProperty('TAGLIST') && res.Response.TAGLIST.length) {
        this.parameterNameList = res.Response['TAGLIST'];
        this.tagList = res.Response['TAGLIST'];
      }
    });
  }

  // getRuleList
  getRuleList(event) {
    this.attrSKUClear();
    this.isClearBtnDisabled = false;
    this.attrSkuValue = [{ 'Id': event.Id, 'Text': event.Text }];
    this.rxSkuAttrModel.SKU = event.Id;
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_SKU_ATTR: this.rxSkuAttrModel };
    const url = String.Join('/', this.apiConfigService.getSkuAttrs);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag && res.Response.hasOwnProperty('SKUATTRLIST')) {
        this.rxSkuAttrModel = Object.assign(this.rxSkuAttrModel, res.Response['SKUATTRLIST']);
        this.tempRxSkuAttrModel = Object.assign(this.tempRxSkuAttrModel, res.Response['SKUATTRLIST']);
        if (!checkNullorUndefined(res.Response['SKUATTRLIST']) && res.Response['SKUATTRLIST'].hasOwnProperty(['AttrJson'])) {
          if (!checkNullorUndefined(res.Response.SKUATTRLIST.AttrJson)) {
            if (Object.keys(res.Response.SKUATTRLIST.AttrJson).length) {
              Object.keys(res.Response.SKUATTRLIST.AttrJson).forEach(resp => {
                this.parameterNameList = this.parameterNameList.filter(ele => ele.Id !== resp);
              });
            }
            this.attrJsonObj = Object.keys(res.Response.SKUATTRLIST.AttrJson).length ? this.processChildElements(res.Response['SKUATTRLIST'].AttrJson) : [];
          }
        }
        this.skuAttrBtnName = CommonEnum.update;
      } else {
        this.skuAttrBtnName = CommonEnum.add;
      }
      this.attrJsonObj.push(new Parameter());
    });
  }

  processChildElements(resp) {
    const childList = [];
    // tslint:disable-next-line:forin
    for (const key in resp) {
      const obj = new Parameter();
      obj.TagName = key;
      obj.TagValue = resp[key];
      childList.push(obj);
    }
    return childList;
  }

  onParameterNameChange(event, key, idx) {
    this.appErrService.clearAlert();
    this.isSaveOrUpdateDisabled = false;
    this.selectedParameterName = event.value;
    this.attrJsonObj[idx][key] = event.value;
  }

  onParameterChange(event, key, idx) {
    this.appErrService.clearAlert();
    if (this.attrJsonObj[idx].TagName) {
      this.isSaveOrUpdateDisabled = false;
    }
    this.attrJsonObj[idx][key] = event;
  }

  deleteParamterInfo(idx) {
    this.appErrService.clearAlert();
    this.isSaveOrUpdateDisabled = false;
    this.parameterNameList.push(this.tagList.find(res => res.Id === this.attrJsonObj[idx].TagName));
    this.attrJsonObj.splice(idx, 1);
  }

  addParamterInfo() {
    this.appErrService.clearAlert();
    this.parameterNameList = this.parameterNameList.filter(res => res.Id !== this.selectedParameterName);
    this.isSaveOrUpdateDisabled = false;
    this.attrJsonObj.push(new Parameter());
    if (!this.parameterNameList.length) {
      this.snackbar.info(this.appService.getErrorText('6680202'));
    }
  }

  customTrackBy(index: number, obj: any): any {
    return index;
  }

  createObj() {
    const obj = {};
    this.attrJsonObj.map(res => (Object.keys(res).length && res.TagName) ? obj[res.TagName] = (res.TagValue ? res.TagValue : '') : null);
    return obj;
  }


  addOrUpdateSkuAttr() {
    this.rxSkuAttrModel.AttrJson = this.createObj();
    if (this.appService.IsObjectsMatch(this.rxSkuAttrModel.AttrJson, this.tempRxSkuAttrModel.AttrJson)) {
      this.snackbar.info(this.appService.getErrorText('2660043'));
      return;
    }
    this.isSaveOrUpdateDisabled = true;
    let url;
    if (this.skuAttrBtnName === CommonEnum.add) {
      url = String.Join('/', this.apiConfigService.addSkuAttrs);
    } else if (this.skuAttrBtnName === CommonEnum.update) {
      url = String.Join('/', this.apiConfigService.updateSkuAttrs);
    }
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_SKU_ATTR: this.rxSkuAttrModel };
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.snackbar.success(res.StatusMessage);
        this.getRuleList(this.attrSkuValue[0]);
      }
    });
  }


  attrSKUClear() {
    this.appErrService.clearAlert();
    this.attrSkuValue = [];
    this.attrJsonObj = [];
    this.isAttrSkuDisabled = false;
    this.skuAttrBtnName = CommonEnum.add;
    this.isClearBtnDisabled = true;
    this.isSaveOrUpdateDisabled = true;
    this.selectedParameterName = '';
    this.parameterNameList = this.tagList;
    this.rxSkuAttrModel = new RxSkuAttrModel();
    this.tempRxSkuAttrModel = new RxSkuAttrModel();
  }

  ngOnDestroy() {
    this.masterPageService.defaultProperties();
    this.emitHideSpinner.unsubscribe();
  }

}