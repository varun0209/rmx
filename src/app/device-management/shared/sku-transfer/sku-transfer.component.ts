import { CommonService } from './../../../services/common.service';
import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { ApiService } from '../../../utilities/rlcutl/api.service';
import { ApiConfigService } from '../../../utilities/rlcutl/api-config.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { AppErrorService } from '../../../utilities/rlcutl/app-error.service';
import { MasterPageService } from '../../../utilities/rlcutl/master-page.service';
import { AppService } from '../../../utilities/rlcutl/app.service';
import { ClientData } from '../../../models/common/ClientData';
import { String } from 'typescript-string-operations';
import { RmtypeaheadComponent } from '../../../framework/frmctl/rmtypeahead/rmtypeahead.component';
import { SKU } from '../../../models/receiving/ReceivingSKU';
import { TestingDevice } from '../../../models/testing/TestingDevice';
import { ReceivingService } from '../../../services/receiving.service';
import { StorageData } from '../../../enums/storage.enum';
import { StatusCodes } from '../../../enums/status.enum';
import { DeviceModes } from '../../../enums/deviceManagment.enum';

@Component({
  selector: 'app-sku-transfer',
  templateUrl: './sku-transfer.component.html',
  styleUrls: ['./sku-transfer.component.css']
})
export class SkuTransferComponent implements OnInit {

  isClearDisabled = false;
  @Input() skuDisabled = false;
  selectedSKUModel: string;
  appConfig: any;
  clientData: ClientData;
  deviceModes = DeviceModes;
  @ViewChild(RmtypeaheadComponent) rmtypeaheadChild: RmtypeaheadComponent;
  @Input() skuObject: any;
  @Input() originalSku = [];
  @Input() buttonName = [];
  @Input() skuLength: any;

  // SKU
  SKU: string;
  skus: SKU[] = [];
  selectedSKU: string;
  selectedSkuData: any;

  @Input() deviceMgmtDevice: TestingDevice;
  @Input() dmDevice: TestingDevice;
  @Input() disableSkuTransfer = true;
  @Output() emitDevice = new EventEmitter();
  @Output() clearSerialNumber = new EventEmitter();
  storageData = StorageData;
  statusCode = StatusCodes;
  controlConfig: any;
  constructor(
    public apiservice: ApiService,
    private apiConfigService: ApiConfigService,
    private spinner: NgxSpinnerService,
    private snackbar: XpoSnackBar,
    public appErrService: AppErrorService,
    public masterPageService: MasterPageService,
    public appService: AppService,
    public receivingService: ReceivingService,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
    this.appConfig = JSON.parse(localStorage.getItem(this.storageData.appConfig));
    this.skuLength = this.appConfig.default.skuLength;
    this.controlConfig = JSON.parse(localStorage.getItem(this.storageData.controlConfig));
  }

  // Get Eligible skus
  getEligibleSKUs(value) {
    this.selectedSkuData = null;
    if (!this.appService.checkNullOrUndefined(this.skuObject.getEligSKu) && this.skuObject.getEligSKu.enable) {
      this.selectedSKUModel = '';
      this.disableSkuTransfer = true;
      if (!this.appService.checkNullOrUndefined(value)) {
        if (value.length >= this.skuLength) {
          const url = String.Join('/', this.skuObject.getEligSKu.url, encodeURIComponent(encodeURIComponent(value.trim().toUpperCase())));
          this.apiservice.apiPostRequest(url, this.skuObject.getEligSKu.requestObj)
            .subscribe(response => {
              const res = response.body;
              if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
                if (!this.appService.checkNullOrUndefined(res.Response)) {
                  this.skus = res.Response;
                  if (!this.appService.checkNullOrUndefined(this.rmtypeaheadChild)) {
                    this.rmtypeaheadChild.typeaheadOptionsLimit = this.skus.length;
                  }
                  this.appErrService.setAlert('', false);
                }
              } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
                this.disableSkuTransfer = true;
                this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
              }
            }, error => {
              this.disableSkuTransfer = true;
              this.appErrService.handleAppError(error);
            });
        } else {
          this.disableSkuTransfer = true;
          this.appErrService.clearAlert();
          this.skus = [];
        }
      } else {
        this.disableSkuTransfer = true;
        this.appErrService.clearAlert();
        this.skus = [];
      }
    }
  }


  // Emiting from rmtypehead after selecting option
  typeaheadResponse(event) {
    this.selectedSKU = event.item.Sku;
    this.selectedSkuData = event.item;
    this.skus = [];
    // if (!this.appService.checkNullOrUndefined(this.skuObject.getDetSku)) {
    //   this.getDetermineSKUs();
    // } else 
    if (this.checkSKu()) {
      this.deviceMgmtDevice.ConditionCode = event.item.ConditionCode;
      this.deviceMgmtDevice.Disposition = event.item.Dispsotion;
      this.deviceMgmtDevice.ModelName = event.item.Model;
      this.deviceMgmtDevice.DeviceSKU = event.item.Sku;
      this.disableSkuTransfer = false;
      this.transferFocus();
    } else {
      this.appErrService.setAlert(this.appService.getErrorText('3640001'), true);
    }
  }

  checkSKu() {
    if (this.originalSku[0].listItemDetails.trim() === this.selectedSkuData.Sku.trim() && this.originalSku[1].listItemDetails.trim() === this.selectedSkuData.Model.trim()
      && this.originalSku[2].listItemDetails.trim() === this.selectedSkuData.Dispsotion.trim() && this.originalSku[3].listItemDetails.trim() === this.selectedSkuData.ConditionCode.trim()) {
      return false;
    }
    return true;
  }


  validateSku(event) {
    let data=this.masterPageService.hideControls;
    if (event && data && data.controlProperties && data.controlProperties.hasOwnProperty('validateSku')&& data.controlProperties.validateSku) {
      const url = String.Join('/', this.apiConfigService.validateSku, encodeURIComponent(encodeURIComponent(event.value.trim().toUpperCase())));
      this.commonService.commonApiCall(url, this.skuObject.getEligSKu.requestObj, (res, statusFlag) => {
        this.spinner.hide();
        if (statusFlag) {
          if (!this.appService.checkNullOrUndefined(res.Response)) {
            this.selectedSKU = res.Response.Sku;
            this.selectedSkuData = res.Response;
            this.skus = [];
            if (this.checkSKu()) {
              this.deviceMgmtDevice.ConditionCode = res.Response.ConditionCode;
              this.deviceMgmtDevice.Disposition = res.Response.Dispsotion;
              this.deviceMgmtDevice.ModelName = res.Response.Model;
              this.deviceMgmtDevice.DeviceSKU = res.Response.Sku;
              this.disableSkuTransfer = false;
              this.transferFocus();
            } else {
              this.appErrService.setAlert(this.appService.getErrorText('3640001'), true);
            }
          }
        }
      });
    }
  }


  // Get Determine skus
  getDetermineSKUs(event?) {
    this.appErrService.clearAlert();
    if (!this.appService.checkNullOrUndefined(this.skuObject.getDetSku)) {
      if (!this.appService.checkNullOrUndefined(event)) {
        this.selectedSKU = event.value.toUpperCase().trim();
      }
      if (!this.appService.checkNullOrUndefined(this.selectedSKU) && this.selectedSKU != '') {
        if (this.originalSku[0].listItemDetails != this.selectedSKU) {
          this.spinner.show();
          if (!this.appService.checkNullOrUndefined(this.skuObject.getDetSku.requestObj.ReceivingDevice)) {
            this.skuObject.getDetSku.requestObj.ReceivingDevice = this.deviceMgmtDevice;
          }
          if (!this.appService.checkNullOrUndefined(this.skuObject.getDetSku.requestObj.DMDevice)) {
            this.skuObject.getDetSku.requestObj.ReceivingDevice = this.dmDevice;
          }
          const url = String.Join('/', this.skuObject.getDetSku.url, encodeURIComponent(encodeURIComponent(this.selectedSKU)));
          this.apiservice.apiPostRequest(url, this.skuObject.getDetSku.requestObj)
            .subscribe(response => {
              const res = response.body;
              if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
                this.skus = res.Response;
                if (this.skus.length == 1) {
                  this.SKU = this.skus[0].Sku;
                  this.selectedSKU = this.skus[0].Sku;
                  this.selectedSKUModel = this.skus[0].Model;
                  this.disableSkuTransfer = false;
                  this.skuDisabled = true;
                }
                if (!this.appService.checkNullOrUndefined(this.deviceMgmtDevice)) {
                  this.deviceMgmtDevice.DeviceSKU = this.selectedSKU;
                  this.deviceMgmtDevice.ModelName = this.selectedSKUModel;
                  if (this.skus.length) {
                    this.deviceMgmtDevice.Disposition = this.skus[0].Dispsotion;
                  }
                  if (this.skuObject.type === DeviceModes.wmxToSku) {
                    this.deviceMgmtDevice.ConditionCode = this.skus[0].ConditionCode;
                  }
                }
                this.transferFocus();
              } else if (!this.appService.checkNullOrUndefined(res) && res.Response == true && res.Status === this.statusCode.fail) {
                this.skuDisabled = false;
                if (!this.appService.checkNullOrUndefined(this.rmtypeaheadChild)) {
                  this.rmtypeaheadChild.applySelect();
                }
                this.skuFocus();
                this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
              } else if (!this.appService.checkNullOrUndefined(res) && res.Response == false && res.Status === this.statusCode.fail) {
                this.skuDisabled = false;
                this.selectedSKUModel = '';
                this.skuFocus();
                this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
              } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
                this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
              }
              this.spinner.hide();
            }, error => {
              this.appErrService.handleAppError(error);
            });

        } else {
          this.appErrService.setAlert(this.appService.getErrorText('3640001'), true);
          this.spinner.hide();
        }
      } else {
        this.rmtypeaheadChild.applyRequired(true);
      }
    }
  }

  skuTransfer() {
    const devices: any = {};
    devices.Device = this.deviceMgmtDevice;
    devices.DMDevice = this.dmDevice;
    this.emitDevice.emit(devices);
  }

  // SKU focus
  skuFocus() {
    this.appService.setFocus('skuInputid');
  }

  transferFocus() {
    this.appService.setFocus('transfer');
  }

  // Serial Number Focus
  serialNumberFocus() {
    this.appService.setFocus('serialNumber');
  }

  // SKU control clear
  skuClear() {
    this.clearSerialNumber.emit();
    if (!this.appService.checkNullOrUndefined(this.rmtypeaheadChild)) {
      this.rmtypeaheadChild.SKU = '';
      this.rmtypeaheadChild.selectedSKU = '';
      this.rmtypeaheadChild.selectedSKUModel = '';
    }
    this.skus = [];
    this.disableSkuTransfer = true;
    this.skuDisabled = false;
    this.selectedSkuData = null;
    // this.isClearDisabled = true;
  }

}
