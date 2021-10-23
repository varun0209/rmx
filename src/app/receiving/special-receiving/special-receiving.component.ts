
import { Component, OnInit, TemplateRef, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from './../../services/common.service';
import { ApiConfigService } from './../../utilities/rlcutl/api-config.service';
import { ApiService } from './../../utilities/rlcutl/api.service';
import { AppService } from './../../utilities/rlcutl/app.service';
import { MasterPageService } from './../../utilities/rlcutl/master-page.service';
import { AppErrorService } from './../../utilities/rlcutl/app-error.service';
import { SpclReceving } from './../../models/receiving/Authorization';
import { FindTraceHoldComponent } from './../../framework/busctl/find-trace-hold/find-trace-hold.component';
import { UiData } from './../../models/common/UiData';
import { ClientData } from './../../models/common/ClientData';
import { dropdown } from './../../models/common/Dropdown';
import { SKU } from './../../models/receiving/ReceivingSKU';
import { String } from 'typescript-string-operations';
import { StorageData } from './../../enums/storage.enum';
import { StatusCodes } from './../../enums/status.enum';
import { TraceTypes } from './../../enums/traceType.enum';
import { MessageType } from './../../enums/message.enum';
import { Grid } from './../../models/common/Grid';
import { ReceivingMode } from './../../models/receiving/ReceivingMode';
import { SoftwareVersion } from './../../models/receiving/SoftwareVersion';
import { ReceivingDevice, ReceivingESNMaster } from './../../models/receiving/ReceivingDevice';
import { Receipt, ReceiptDetail } from './../../models/receiving/Receipt';
import { OperationEnum } from './../../enums/operation.enum';
import { LottableTrans } from './../../models/common/LottableTrans';
import { ListofTransactions } from './../../models/common/ListofTransactions';
import { Container } from './../../models/common/Container';
import { ContainerSuggestionComponent } from './../../framework/busctl/container-suggestion/container-suggestion.component';
import { AudioType } from './../../enums/audioType.enum';
import { CommonEnum } from './../../enums/common.enum';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-special-receiving',
  templateUrl: './special-receiving.component.html',
  styleUrls: ['./special-receiving.component.css']
})
export class SpecialReceivingComponent implements OnInit, OnDestroy {
  @ViewChild('swVersionCheck') swVersionCheck: TemplateRef<any>;
  @ViewChild(ContainerSuggestionComponent) childContainer: ContainerSuggestionComponent;

  isMsnImeiSection = true;
  isSearchText = true;
  isSearchTextReadonly = false;
  searchText: string;
  controlConfig: any;
  appConfig: any;
  authObj: any;


  attributes: any;
  msn: string;
  trackingNumber: string;
  asnnumber: string;
  vendorId: string;
  externKey: string;
  authKey: string;

  isSkuSection = false;
  skuList = [];
  tempSkuList = [];
  selectedSKU: string;
  selectedSKUModel: string;
  disposition: string;
  isSkuReadOnly = false;
  selectedExternLineNo: string;
  allowUnExpSKU = CommonEnum.no;

  isConditionCode = false;
  isConditionCodeReadOnly = false;
  conditionCode: string;
  conditionCodeId: string;
  conditionCodeOptions = [];

  isQty = false;
  expectedQty: number;
  isQtyReadOnly = false;

  softwareVersion: string;
  swVersionMessage: string;
  isSwVersionSection = false;
  showSoftwareSection = false;
  isSwVersionReadOnly = false;

  serialNumber: string;
  showSerialNumber = false;
  receivingDevicesList = [];
  receivingESNMasterList = [];
  validSerialNumberResponse: any;
  receivedQty: number;

  islpnContainerPrintDisabled = true;
  isContainerInputId = false;
  isContainerDisabled = true;
  isClearContainerDisabled = true;
  isContainerIdReadonly = false;
  containerReadonlyValue = '';
  categoryName = '';
  isPostDisabled = true;

  // msn
  showMSNValue = false;

  locationContainerList: any;
  isSerialNumberSection = false;
  isColorCodeSection = false;
  colorCode: string;
  colorText: string;
  isContainerCloseAllow = true;
  asnValidationResponse: any;

  // trace properties
  isTraceExist = false;

  // Modal popup
  modeltitle: string;
  isModalOpen = false;

  // originaiton operation
  originationOperation: Subscription;
  emitHideSpinner: Subscription;
  deviceOrigination: string;

  // Object Declarations
  clientData = new ClientData();
  uiData = new UiData();
  grid: Grid;
  spclReceving = new SpclReceving();
  receiptObj = new Receipt();
  swVersion = new SoftwareVersion();
  skuObj = new SKU();
  receivingDevice = new ReceivingDevice();
  receiptDetail = new ReceiptDetail();
  receivingMode = new ReceivingMode();
  receivingESNMaster = new ReceivingESNMaster();
  listofTransactions = new ListofTransactions();
  container = new Container();
  lottableTrans = new LottableTrans();
  dialogRef: any;


  constructor(
    public masterPageService: MasterPageService,
    public appService: AppService,
    public apiService: ApiService,
    private apiConfigService: ApiConfigService,
    private snackbar: XpoSnackBar,
    public appErrService: AppErrorService,
    private commonService: CommonService,
    private spinner: NgxSpinnerService,
    private dialog: MatDialog

  ) { }

  ngOnInit() {
    const operationObj = this.masterPageService.getRouteOperation();
    if (operationObj) {
      this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
      this.masterPageService.hideSpinner = true;
      this.masterPageService.setTitle(operationObj.Title);
      this.masterPageService.setModule(operationObj.Module);
      this.appConfig = JSON.parse(localStorage.getItem(StorageData.appConfig));
      this.controlConfig = JSON.parse(localStorage.getItem(StorageData.controlConfig));
      this.uiData.OperationId = operationObj.OperationId;
      this.uiData.OperCategory = operationObj.Category;
      // localStorage.setItem(StorageData.module, operationObj.Module);
      // this.appErrService.appMessage();
      this.receivingMode = { Id: 'ASN', Text: 'ASN', SearchValue: '' };
      this.appService.setFocus('searchtext');
      this.originationOperation = this.masterPageService.originationOperation.subscribe(val => {
        this.deviceOrigination = val;
      });
      this.emitHideSpinner = this.masterPageService.emitHideSpinner.subscribe(spinnerFlag => {
        if (!this.appService.checkNullOrUndefined(spinnerFlag) && spinnerFlag) {
          this.getLocationContainers();
        }
      });
    }
  }

  typeaheadResponse(event) {
    this.selectedSKU = event.item.Sku;
    this.selectedSKUModel = event.item.Model;
    this.isSkuReadOnly = true;
    this.isConditionCode = true;
    this.skuObj = event.item;
    this.getConditionCode();
  }

  changeConditionCode(event) {
    this.conditionCodeId = event.value;
    this.conditionCode = event.source.selected.viewValue;
    this.isConditionCode = false;
    this.isConditionCodeReadOnly = true;
    this.getReceiptDetail();
  }


  asnSNValidation() {
    this.msnClear();
    this.receivingMode.SearchValue = this.searchText;
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, ReceivingMode: this.receivingMode };
    const url = String.Join('/', this.apiConfigService.asnSNValidationUrl, this.searchText);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.asnValidationResponse = res.Response;
        this.spclReceving = res.Response['SpclReceving'];
        this.attributes = this.spclReceving.Attributes;
        this.authObj = this.spclReceving.DataCollection;
        this.getCommonSectionsDetails(); // common section details
        const traceData = { traceType: TraceTypes.authKey, traceValue: this.authObj.AUTHKEY, uiData: this.uiData };
        const traceResult = this.commonService.findTraceHold(traceData, this.uiData);
        traceResult.subscribe(result => {
          this.spinner.hide();
          if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
            if (this.appService.checkNullOrUndefined(result.Response)) {
              this.traceNotFound(); // continuing when trace not found
            } else {
              this.canProceed(result, TraceTypes.authKey);
            }
          } else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
            this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
          }
        });

      }
    });
  }

  // vendor , trackingnumber, msn
  getCommonSectionsDetails() {
    this.msn = this.attributes.MSN;
    this.vendorId = this.authObj.VENDORID;
    this.authKey = this.authObj.AUTHKEY;
    this.externKey = this.authObj.EXTERNKEY;
    this.trackingNumber = this.attributes.CARRIERREFERENCE;
  }

  // hiding the seactions
  hideseactions() {
    this.isMsnImeiSection = false;
    this.isSearchText = false;
    this.isSearchTextReadonly = true;
    this.isSkuSection = false;
    this.isSkuReadOnly = true;
    this.isConditionCode = false;
    this.isConditionCodeReadOnly = true;
    this.isSwVersionSection = false;
    this.isSwVersionReadOnly = true;
    this.showSerialNumber = false;
    this.isSerialNumberSection = true;
    this.isContainerCloseAllow = false;
  }

  // continuing when trace not found
  traceNotFound() {
    this.receiptObj = this.asnValidationResponse['Receipt'];
    this.receiptDetail = this.asnValidationResponse['ReceiptDetail'];
    this.selectedExternLineNo = this.receiptDetail.ExternLineno;
    // sku
    this.skuObj = this.asnValidationResponse['SKUs'][0];
    this.selectedSKU = this.skuObj.Sku;
    this.selectedSKUModel = this.skuObj.Model;
    // condition code
    this.conditionCodeOptions = this.commonService.dropdownList(this.asnValidationResponse['Conditions']);
    this.conditionCodeId = this.conditionCodeOptions[0].Id;
    this.conditionCode = this.conditionCodeOptions[0].Text;
    this.expectedQty = this.receiptDetail.QtyExpected;
    this.receivedQty = this.asnValidationResponse['QuantityReceived'];
    this.showSoftwareSection = this.asnValidationResponse['RequiredSWVersion'];
    this.listofTransactions = this.asnValidationResponse.Transactions;
    this.container = this.asnValidationResponse['Container'];
    this.receivingDevicesList = this.asnValidationResponse['ReceivingDevices'];
    this.hideseactions();
    this.appErrService.alertSound(AudioType.success);

    // msn check
    this.checkMSNExist();
  }

  checkMSNExist() {
    if (this.receivingDevicesList.length === 1 && !this.appService.checkNullOrUndefined(this.receivingDevicesList[0]) && !this.appService.checkNullOrUndefined(this.receivingDevicesList[0].Model)) {
      this.showMSNValue = this.receivingDevicesList[0].Model.hasOwnProperty('IsMSNEnabled') && this.receivingDevicesList[0].hasOwnProperty('MSN')
        && !this.receivingDevicesList[0].MSN ? this.receivingDevicesList[0].Model.IsMSNEnabled : false;
    }
    if (this.showMSNValue) {
      this.msn = '';
      this.appErrService.alertSound(AudioType.success);
      this.appService.setFocus('msn');
    } else {
      this.containerCheck();
    }
  }

  // validate MSN Value
  validateMSNValue() {
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, ReceivingDevice: this.receivingDevicesList[0] };
    const url = String.Join('/', this.apiConfigService.validateMSNValueUrl, this.msn);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag && !this.appService.checkNullOrUndefined(res.Response)) {
        this.receivingDevicesList.forEach(ele => {
          if (ele.SerialNumber === res.Response.SerialNumber) {
            ele.MSN = res.Response.MSN;
          }
        });
        this.showMSNValue = false;
        this.containerCheck();
      } else {
        this.spinner.hide();
      }
    });
  }

  containerCheck() {
    this.isContainerInputId = true;
    this.isClearContainerDisabled = false;
    this.isContainerDisabled = false;
    this.appService.setFocus('containerInputId');
  }

  // generic search in ASN
  searchValue() {
    if (this.searchText) {
      this.spinner.show();
      this.msnClear();
      this.receivingMode.SearchValue = this.searchText;
      const requestObj = { ClientData: this.clientData, UIData: this.uiData, ReceivingMode: this.receivingMode };
      this.apiService.apiPostRequest(String.Join('/', this.apiConfigService.receviceSearchUrl, this.searchText), requestObj)
        .subscribe(response => {
          const res = response.body;
          if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
            if (!this.appService.checkNullOrUndefined(res.Response)) {
              this.spclReceving.Attributes = res.Response.Attributes;
              this.attributes = res.Response.Attributes;
              this.authObj = res.Response.DataCollection;
              const traceData = { traceType: TraceTypes.authKey, traceValue: this.authObj.AUTHKEY, uiData: this.uiData };
              const traceResult = this.commonService.findTraceHold(traceData, this.uiData);
              traceResult.subscribe(result => {
                if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
                  if (this.appService.checkNullOrUndefined(result.Response)) {
                    this.validSearchKey();
                  } else {
                    this.canProceed(result, TraceTypes.authKey);
                  }
                } else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
                  this.spinner.hide();
                  this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
                }
              });
            }
          } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
            this.spinner.hide();
            this.appService.applyRequired(true, 'searchtext');
            this.appService.applySelect('searchtext');
            this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          }
        }, erro => {
          this.appErrService.handleAppError(erro);
        });
    }
  }

  // Trace response
  validSearchKey() {
    this.getCommonSectionsDetails();
    this.createReceipt();
  }

  createReceipt() {
    const requestObj = {
      ClientData: this.clientData,
      UIData: this.uiData,
      ReceivingMode: this.receivingMode,
      SpclReceving: this.spclReceving
    };
    const url = String.Join('/', this.apiConfigService.createReceiptUrl, this.authKey);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          this.receiptObj = res.Response;
          this.getExpectedSKUs();
        }
      } else {
        this.spinner.hide();
        this.isSearchTextReadonly = false;
        this.appService.applySelect('searchtext');
        this.appService.applyRequired(true, 'searchtext');
      }
    });
  }

  // Get Expected SKU's
  getExpectedSKUs() {
    const requestObj = {
      ClientData: this.clientData,
      UIData: this.uiData,
      Receipt: this.receiptObj,
      ReceivingMode: this.receivingMode,
      SpclReceving: this.spclReceving
    };
    this.commonService.commonApiCall(this.apiConfigService.getExpectedSKUsUrl, requestObj, (res, statusFlag) => {

      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          this.allowUnExpSKU = res.Response.hasOwnProperty('AllowUnExpSKU') ? res.Response.AllowUnExpSKU : CommonEnum.no;
          this.skuList = res.Response.hasOwnProperty('ResultantSKUs') ? res.Response.ResultantSKUs : [];
          this.tempSkuList = res.Response.hasOwnProperty('ResultantSKUs') ? res.Response.ResultantSKUs : [];
          this.isSkuSection = true;
          this.isMsnImeiSection = false;
          this.isSearchText = false;
          this.isSearchTextReadonly = true;
          this.isContainerCloseAllow = false;
          this.getLocationContainers();
          if (this.allowUnExpSKU === CommonEnum.no && res.Response.hasOwnProperty('ResultantSKUs') && res.Response.ResultantSKUs.length && res.Response.ResultantSKUs.length === 1) {
            this.skuObj = res.Response.ResultantSKUs[0];
            this.selectedSKU = this.skuObj.Sku;
            this.selectedSKUModel = this.skuObj.Model;
            this.isSkuReadOnly = true;
            this.getConditionCode();
          } else {
            this.spinner.hide();
            this.isSkuReadOnly = false;
            this.appErrService.alertSound(AudioType.success);
            this.appService.setFocus('skuInput');
          }
        }
      } else {
        this.appService.applyRequired(true, 'searchtext');
        this.appService.applySelect('searchtext');
      }
    });
  }

  // Get Eligible skus
  getEligibleSKUs(value) {
    if (value.length >= this.appConfig.default.skuLength && this.allowUnExpSKU === CommonEnum.yes) {
      const url = String.Join('/', this.apiConfigService.getEligibleSKUsUrl, encodeURIComponent(encodeURIComponent(value.trim().toUpperCase())));
      const requestObj = { ClientData: this.clientData, UIData: this.uiData };
      this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
        this.spinner.hide();
        if (statusFlag && !this.appService.checkNullOrUndefined(res.Response)) {
          this.skuList = res.Response;
        } else {
          this.skuList = [];
        }
      });
    } else {
      this.skuList = this.tempSkuList;
    }
  }


  getConditionCode() {
    const requestObj = {
      ClientData: this.clientData,
      UIData: this.uiData,
      SKU: this.skuObj,
      ReceivingMode: this.receivingMode,
      SpclReceving: this.spclReceving,
      Receipt: this.receiptObj
    };
    this.commonService.commonApiCall(this.apiConfigService.getConditionUrl, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.conditionCodeOptions = [];
        res.Response.Conditions.forEach(element => {
          const dd: dropdown = new dropdown();
          dd.Id = element.Id;
          dd.Text = element.Text;
          this.conditionCodeOptions.push(dd);
        });
        if (!this.appService.checkNullOrUndefined(res.Response.DefaultCondition)) {
          this.conditionCodeId = res.Response.DefaultCondition.Id;
          this.conditionCode = res.Response.DefaultCondition.Text;
        }
        if (res.Response.Conditions.length > 0 && res.Response.Conditions.length === 1) {
          this.conditionCodeId = res.Response.Conditions[0].Id;
          this.conditionCode = res.Response.Conditions[0].Text;
          this.isConditionCode = false;
          this.isConditionCodeReadOnly = true;
          this.getReceiptDetail();
        } else {
          this.spinner.hide();
          this.isConditionCode = true;
          this.appErrService.alertSound(AudioType.success);
          this.appService.setFocus('conditionType');
        }
      }
    });
  }

  // get receipt details
  getReceiptDetail() {
    this.receiptDetail = new ReceiptDetail();
    const requestObj = {
      ClientData: this.clientData,
      UIData: this.uiData,
      SKU: this.skuObj,
      Receipt: this.receiptObj,
      ReceiptDetail: this.receiptDetail,
      ReceivingDevice: this.receivingDevice,
      ReceivingMode: this.receivingMode,
      SpclReceving: this.spclReceving
    };
    this.commonService.commonApiCall(this.apiConfigService.getReceiptDetailUrl, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.isConditionCode = false;
        this.isConditionCodeReadOnly = true;
        // this.showSoftwareSection = res.Response.RequiredSWVersion;
        if (!this.appService.checkNullOrUndefined(res.Response.ReceiptDetail)) {
          this.receiptDetail = res.Response.ReceiptDetail;
          this.selectedExternLineNo = this.receiptDetail.ExternLineno;
          this.getDetermineSKU();
        } else if (this.allowUnExpSKU === CommonEnum.yes) {
          this.getDetermineSKU();
        } else {
          this.spinner.hide();
        }
      } else {
        this.spinner.hide();
        this.isConditionCode = false;
        this.isConditionCodeReadOnly = false;
        this.isSkuReadOnly = false;
        this.appService.setFocus('skuInput');
        this.appService.applySelect('skuInput');
      }
    }
    );
  }

  getDetermineSKU() {
    const requestObj = {
      ClientData: this.clientData,
      UIData: this.uiData,
      SKU: this.skuObj,
      Receipt: this.receiptObj,
      ReceiptDetail: this.receiptDetail,
      ReceivingESNMaster: this.receivingESNMaster,
      ReceivingMode: this.receivingMode,
      SpclReceving: this.spclReceving
    };
    const url = String.Join('/', this.apiConfigService.getDetermineSKUsUrl, encodeURIComponent(encodeURIComponent(this.selectedSKU)), this.conditionCodeId);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          this.showSoftwareSection = res.Response.RequiredSWVersion;
          this.skuObj = res.Response.SKUs[0];
          if (this.skuObj.IsSerialized !== true) {
            this.spinner.hide();
            this.expectedQty = this.receiptDetail.QtyExpected;
          } else {
            this.isSkuSection = false;
            if (this.showSoftwareSection) {
              this.spinner.hide();
              this.isSwVersionSection = true;
              this.appErrService.alertSound(AudioType.success);
              this.appService.setFocus('softwareVersion');
            } else {
              this.serialNumber = this.spclReceving.Attributes.SERIAL1;
              this.validateSerialNumber();
            }
          }
        }
      }
    });

  }


  canProceed(traceResponse, type) {
    this.spinner.hide();
    if (traceResponse.Response.canProceed === 'Y') {
      this.appErrService.setAlert(traceResponse.StatusMessage, true, MessageType.info);
    }
    if (!this.appService.checkNullOrUndefined(traceResponse.Response.TraceHold)) {
      const uiObj = { uiData: this.uiData };
      traceResponse = Object.assign(traceResponse, uiObj);
      this.dialogRef = this.dialog.open(FindTraceHoldComponent, { hasBackdrop: true, disableClose: true, panelClass: 'dialog-width-sm', data: { modalData: traceResponse } });
      this.dialogRef.afterClosed().subscribe((returnedData) => {
        if (returnedData) {
        if (returnedData.Response.canProceed === 'Y') {
          if (type === TraceTypes.authKey) {
            this.traceNotFound();
          }
        } else if (returnedData.Response.canProceed === 'N') {
          this.appErrService.setAlert(returnedData.StatusMessage, true);
        }
      }
      });
    }
  }


  validateSoftwareVersion() {
    if (this.softwareVersion) {
      this.swVersionClear();
      this.swVersion.SWVersion = this.softwareVersion;
      const requestObj = {
        ClientData: this.clientData,
        UIData: this.uiData,
        SoftwareVersion: this.swVersion,
        SKU: this.skuObj,
        ReceivingMode: this.receivingMode,
        SpclReceving: this.spclReceving
      };
      this.commonService.commonApiCall(this.apiConfigService.checkSoftwareVersionUrl, requestObj, (res, statusFlag) => {
        if (statusFlag) {
          if (!this.appService.checkNullOrUndefined(res) && res.StatusMessage === '') {
            this.swVersionConfirmation();
          } else if (!this.appService.checkNullOrUndefined(res) && res.StatusMessage !== '') {
            this.spinner.hide();
            this.swVersionMessage = res.StatusMessage;
            this.openModal(this.swVersionCheck);

          }
        } else {
          this.spinner.hide();
          this.isSwVersionSection = true;
          this.isSwVersionReadOnly = false;
          this.appService.setFocus('softwareVersion');
          this.appService.applySelect('softwareVersion');
        }

      });
    }
  }

  swVersionConfirmation() {
    this.isSwVersionReadOnly = true;
    this.isSwVersionSection = false;
    this.isSerialNumberSection = true;
    this.serialNumber = this.spclReceving.Attributes.SERIAL1;
    this.validateSerialNumber();
  }

  // Modal Popup
  openModal(template: TemplateRef<any>) {
    this.masterPageService.openModelPopup(template);
    this.modeltitle = OperationEnum.softwareVersion;
  }

  closeSWVersionConfirmation() {
    this.masterPageService.hideDialog();
    this.swVersionConfirmation();
  }

  // validate Serial Number
  validateSerialNumber() {
    if (this.serialNumber) {
      this.spinner.show();
      const requestObj = {
        ClientData: this.clientData,
        UIData: this.uiData,
        ReceivingDevices: this.receivingDevicesList,
        ReceivingESNMasters: this.receivingESNMasterList,
        ReceiptDetail: this.receiptDetail,
        SoftwareVersion: this.swVersion,
        ReceivingMode: this.receivingMode,
        SpclReceving: this.spclReceving,
        SKU: this.skuObj,
        Receipt: this.receiptObj
      };
      const url = String.Join('/', this.apiConfigService.validateSerialNumber, this.serialNumber);
      this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
        if (statusFlag) {
          if (!this.appService.checkNullOrUndefined(res.Response)) {
            this.validSerialNumberResponse = res.Response;
            if (this.validSerialNumberResponse.ReceivingDevices.length > 0) {
              this.serialNumber = this.validSerialNumberResponse.ReceivingDevices[0].SerialNumber;
              this.validSerialNumber();
            } else {
              this.spinner.hide();
            }
          }
        } else {
          this.spinner.hide();
          this.isSerialNumberSection = false;
          this.isMsnImeiSection = true;
          this.isSearchText = true;
          this.isSearchTextReadonly = false;
          this.appService.applySelect('searchtext');
        }
      });
    }
  }

  validSerialNumber(res = this.validSerialNumberResponse) {
    if (!this.appService.checkNullOrUndefined(res)) {
      this.isSerialNumberSection = true;
      this.expectedQty = this.receiptDetail.QtyExpected;
      this.receivedQty = res.QuantityReceived;
      this.receivingDevicesList = res.ReceivingDevices;
      this.receivingESNMasterList = res.ReceivingESNMasters;
      this.showSerialNumber = false;
      this.loadReceivingvalues();
    }
  }




  //#region device process api's
  loadReceivingvalues() {
    this.appErrService.clearAlert();
    this.receivingDevicesList.forEach(ele => {
      ele.DeviceSKU = this.selectedSKU;
      ele.ModelName = this.selectedSKUModel;
      ele.Clientid = this.clientData.ClientId;
      ele.Location = this.clientData.Location;
      ele.Step = this.masterPageService.operation;
      ele.Origination = this.deviceOrigination;
    });
    const requestObj = {
      ClientData: this.clientData,
      UIData: this.uiData,
      ReceivingDevices: this.receivingDevicesList,
      ReceivingESNMasters: this.receivingESNMasterList,
      ReceiptDetail: this.receiptDetail,
      ReceivingMode: this.receivingMode,
      SpclReceving: this.spclReceving
    };
    this.commonService.commonApiCall(this.apiConfigService.loadReceivingvalues, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          this.receivingDevicesList = res.Response;
          this.receiptObj.ExternReceiptkey = this.authKey;
          this.getProgram();
        }

      }
    });
  }

  // getProgram
  getProgram() {
    const requestObj = {
      ClientData: this.clientData,
      UIData: this.uiData,
      ReceivingDevices: this.receivingDevicesList,
      Receipt: this.receiptObj,
      ReceivingMode: this.receivingMode,
      SpclReceving: this.spclReceving
    };
    this.commonService.commonApiCall(this.apiConfigService.processDeviceUrl, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          this.receiptObj = res.Response.Receipt;
          this.receivingDevicesList = res.Response.ReceivingDevices;
          if (res.Response.ReceivingDevices[0].ProgramName !== '') {
            this.loadReceivingProgramValues(this.clientData, this.uiData, this.receivingDevicesList, this.receiptObj, res.Response.ReceivingDevices[0].ProgramName, this.masterPageService.operation);
          } else {
            this.getRoute(this.clientData, this.uiData, this.receivingDevicesList, this.receiptObj);
          }
        }

      }
    });

  }

  // load receiving program values
  loadReceivingProgramValues(clientData, uiData, listOfReceivingDevices, receipt, programName, operation) {
    const requestObj = {
      ClientData: clientData,
      UIData: uiData,
      ReceivingDevices: listOfReceivingDevices,
      Receipt: receipt,
      ReceivingMode: this.receivingMode,
      SpclReceving: this.spclReceving
    };
    const url = String.Join('/', this.apiConfigService.loadReceivingProgramValuesUrl, programName, operation);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          this.receiptObj = res.Response.Receipt;
          this.receivingDevicesList = res.Response.ReceivingDevices;
          this.getRoute(clientData, uiData, this.receivingDevicesList, this.receiptObj);
        }
      }
    });
  }


  // get Route
  getRoute(clientData, uiData, receivingDevicesList, receiptObj) {
    const requestObj = {
      ClientData: clientData,
      UIData: uiData,
      Devices: receivingDevicesList,
      Receipt: receiptObj,
      ReceivingMode: this.receivingMode,
      SpclReceving: this.spclReceving
    };
    this.commonService.commonApiCall(this.apiConfigService.recGetRouteUrl, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          this.receivingDevicesList = res.Response.devices;
          this.getTransactions(clientData, uiData, this.receivingDevicesList);
        }
      }
    });
  }

  getTransactions(clientData, uiData, receivingDevices) {
    const requestObj = {
      ClientData: clientData,
      UIData: uiData,
      Devices: receivingDevices,
      ReceivingMode: this.receivingMode,
      SpclReceving: this.spclReceving
    };
    this.commonService.commonApiCall(this.apiConfigService.recGetTransactionUrl, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          res.Response.Trans.map((val) => val.Result = 'PASS');
          this.listofTransactions = res.Response;
          this.isContainerInputId = true;
          this.isContainerDisabled = false;
          this.isClearContainerDisabled = false;
          this.appErrService.alertSound(AudioType.success);
          this.appService.setFocus('containerInputId');
        }
      }
    });
  }


  //#endregion device process api's


  //#region container

  // Configure the child container properties
  configContainerProperties() {
    if (!this.appService.checkNullOrUndefined(this.childContainer)) {
      this.childContainer.isContainerDisabled = false;
      this.childContainer.isClearContainerDisabled = false;
    }
  }


  getSuggestContainer(value) {
    this.containerFocus();
    const attributeKeys = Object.keys(this.attributes);
    if (attributeKeys.length > 0) {
      attributeKeys.forEach(ele => {
        this.receivingDevicesList[0].DataCollection[ele] = this.attributes[ele];
      });
    }
    if (this.appService.checkNullOrUndefined(value)) {
      this.isContainerDisabled = false;
      this.configContainerProperties();
      this.childContainer.getSuggestContainer(this.receivingDevicesList[0]);
    } else {
      this.clearContainerID();
      this.configContainerProperties();
      this.childContainer.getSuggestContainer(this.receivingDevicesList[0]);
    }
  }

  getSuggestContainerResponse(response) {
    this.container = response;
    this.categoryName = this.container.CategoryName;
    if (this.locationContainerList && this.locationContainerList.Elements.length === 1
      && this.locationContainerList.Elements[0].hasOwnProperty('ContainerID') &&
      this.locationContainerList.Elements[0].ContainerID === this.container.ContainerID) {
      this.populateContainerID(this.container);
    } else {
      if (!this.appService.checkNullOrUndefined(response.ContainerID) && response.ContainerID !== '') {
        this.islpnContainerPrintDisabled = false;
      }
    }
    this.updateDeviceObj(response);
  }

  // assign container details to device
  updateDeviceObj(response) {
    this.receivingDevicesList.forEach(ele => {
      ele.ContainerID = response.ContainerID;
      ele.ContainerCycle = response.ContainerCycle;
    });
  }

  validateContainer(response) {
    this.updateDeviceObj(response);
    this.childContainer.validateContainer(this.receivingDevicesList[0]);
  }

  validateContainerResponse(response) {
    if (!this.appService.checkNullOrUndefined(response)) {
      this.container = response;
      this.populateContainerID(this.container);
      this.updateDeviceObj(response);
    }
    this.spinner.hide();
  }

  private populateContainerID(container) {
    this.isContainerIdReadonly = true;
    this.isContainerInputId = false;
    this.containerReadonlyValue = container.ContainerID;
    this.categoryName = container.CategoryName;
    this.isClearContainerDisabled = true;
    this.isPostDisabled = false;
    this.appErrService.alertSound(AudioType.success);
    this.appService.setFocus('post');
  }

  // validate container fail response
  emitValidateContainerFailResponse(response) {
    if (!this.appService.checkNullOrUndefined(response)) {
      this.updateDeviceObj(response);
    }
  }

  errorEmit(val) {
    if (val === false) {
      this.isPostDisabled = true;
    }
  }



  checkContainer(container) {
    if (!this.appService.checkNullOrUndefined(container)) {
      this.updateDeviceObj(container);
      this.isPostDisabled = false;
      this.isClearContainerDisabled = true;
      this.isContainerIdReadonly = true;
      this.isContainerInputId = false;
      this.containerReadonlyValue = container.ContainerID;
      this.appErrService.alertSound(AudioType.success);
      this.appService.setFocus('post');
    }
  }

  addSerailNumber() {
    // const isMobile = this.appService.checkDevice();
    const requestObj = {
      ClientData: this.clientData,
      UIData: this.uiData,
      ReceivingDevices: this.receivingDevicesList,
      Receipt: this.receiptObj,
      Container: this.container,
      ReceivingMode: this.receivingMode,
      SpclReceving: this.spclReceving,
      Transactions: this.listofTransactions
    };
    const url = String.Join('/', this.apiConfigService.asnSerialNumberAddUrl, this.selectedExternLineNo);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          this.receiptObj = res.Response.Receipt;
        }
        if (!this.appService.checkNullOrUndefined(res.StatusMessage) && res.StatusMessage !== '') {
          this.snackbar.success(res.StatusMessage);
        }
        this.isContainerCloseAllow = true;
        let IsGetColorCodeAPICallRequired;
        if (res.Response.hasOwnProperty('IsGetColorCodeAPICallRequired') && res.Response.IsGetColorCodeAPICallRequired === CommonEnum.yes) {
          IsGetColorCodeAPICallRequired = res.Response.IsGetColorCodeAPICallRequired;
        }
        if (IsGetColorCodeAPICallRequired === CommonEnum.yes) {
          this.getReceiptColorCode();
          this.getLocationContainers();
        } else {
          this.clear();
        }
      }
    });
  }

  insertSamplingBatch() {
    this.spinner.show();
    const requestObj = {
      ClientData: this.clientData,
      UIData: this.uiData,
      ReceivingDevices: this.receivingDevicesList,
      Receipt: this.receiptObj,
      Container: this.container,
      SoftwareVersion: this.swVersion,
      ReceivingMode: this.receivingMode,
      SpclReceving: this.spclReceving
    };
    this.apiService.apiPostRequest(this.apiConfigService.insertSamplingBatch, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }

  // Save transactions after add serial number
  saveTransaction() {
    const requestObj = {
      ClientData: this.clientData,
      UIData: this.uiData,
      Devices: this.receivingDevicesList,
      Transactions: this.listofTransactions,
      TestResultDetails: {},
      ReceivingMode: this.receivingMode,
      SpclReceving: this.spclReceving
    };
    this.commonService.commonApiCall(this.apiConfigService.recSaveTransactionUrl, requestObj, (res, statusFlag) => {
      const response = res;
      if (!statusFlag) {
        if (!this.appService.checkNullOrUndefined(res)) {
          this.spinner.hide();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }
    });
  }

  updateLottables(IsGetColorCodeAPICallRequired?) {
    this.spinner.show();
    this.lottableTrans = new LottableTrans();
    const headerobj = Object.keys(this.lottableTrans);
    headerobj.forEach(res => {
      if (res) {
        this.lottableTrans[res] = this.receiptObj.ReceiptDetail[res];
      }
    });
    const requestObj = {
      ClientData: this.clientData,
      UIData: this.uiData,
      Devices: this.receivingDevicesList,
      LottableTrans: this.lottableTrans,
      ReceivingMode: this.receivingMode,
      SpclReceving: this.spclReceving
    };
    this.commonService.commonApiCall(this.apiConfigService.updateLottables, requestObj, (res, statusFlag) => {
      const response = res;
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res)) {
          this.postReceipt(IsGetColorCodeAPICallRequired);
        }
      }
    });
  }

  getReceiptColorCode() {
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, Receipt: this.receiptObj };
    this.commonService.commonApiCall(this.apiConfigService.getReceiptColorCodeUrl, requestObj, (res, statusFlag) => {
      const response = res;
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res)) {
          this.receiptObj = new Receipt();
          this.isColorCodeSection = true;
          this.isSerialNumberSection = false;
          this.colorCode = res.Response.ColorCode;
          this.colorText = res.Response.Color;
          this.appErrService.alertSound(AudioType.success);
        }
      }
    });
  }

  // Post Receipt
  postReceipt(IsGetColorCodeAPICallRequired = CommonEnum.no) {
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, Receipt: this.receiptObj, UIData: this.uiData, ReceivingMode: this.receivingMode, SpclReceving: this.spclReceving };
    this.apiService.apiPostRequest(this.apiConfigService.receiptPostUrl, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          if (IsGetColorCodeAPICallRequired === CommonEnum.yes) {
            this.getReceiptColorCode();
          } else {
            this.clear();
          }
          this.isContainerCloseAllow = true;
          this.getLocationContainers();
          this.commonService.postUpdateProcess(this.apiConfigService.postRecUpdateProcess, requestObj);
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }


  // get LocationContainers
  getLocationContainers() {
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    this.commonService.commonApiCall(this.apiConfigService.getLocationContainersUrl, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.spinner.hide();
        this.locationContainerList = null;
        if (!this.appService.checkNullOrUndefined(res.Response) && res.Response.length) {
          this.grid = new Grid();
          this.grid.CloseVisible = this.isContainerCloseAllow ? true : false;
          this.grid.ItemsPerPage = this.appConfig.splInbound.griditemsPerPage;
          this.locationContainerList = this.appService.onGenerateJson(res.Response, this.grid);
        }
      }
    });
  }

  // container close confirmation dialog
  closeContainerConfirm(event, template: TemplateRef<any>) {
    this.container = new Container();
    this.container = event;
    this.dialogRef = this.dialog.open(template, {
      hasBackdrop: true,
      disableClose: true,
      panelClass: 'dialog-width-sm'
  });
  }

  // close container
  closeContainer() {
    this.dialogRef.close();
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, Container: this.container };
    this.commonService.commonApiCall(this.apiConfigService.asnCloseContainerUrl, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          this.isSerialNumberSection = false;
          this.isMsnImeiSection = false;
          this.isSwVersionSection = false;
          this.isSkuSection = false;
          this.isColorCodeSection = true;
          this.colorCode = res.Response.ColorCode;
          this.colorText = res.Response.Color;
          this.appErrService.alertSound(AudioType.success);
          this.getLocationContainers();
        }
      }
    });
  }


  // Clear container ID
  clearContainerID() {
    if (!this.appService.checkNullOrUndefined(this.childContainer)) {
      const container = this.childContainer;
      container.ContainerID = '';
      container.suggestedContainer = '';
      container.categoryName = '';
      container.isContainerDisabled = true;
      container.isClearContainerDisabled = true;
      container.applyRequired(false);
    }
  }

  //#endregion suggested container functopnality




  showSkuSection() {
    this.isSkuSection = true;
    this.isMsnImeiSection = false;
  }

  msnImeiSectionNextBtn() {
    if (this.isSearchTextReadonly === true) {
      return false;
    } else {
      return true;
    }
  }

  showMsnImeiSection() {
    this.isSkuSection = false;
    this.isMsnImeiSection = true;
  }

  skuSectionNextBtn() {
    if (this.isConditionCodeReadOnly === true && this.isSkuReadOnly === true && this.isQty !== true) {
      return false;
    } else {
      return true;
    }
  }

  skuSectiontoswVersion() {
    if (this.showSoftwareSection) {
      this.isSwVersionSection = true;
    } else {
      this.isSerialNumberSection = true;
    }
    this.isSkuSection = false;
  }


  // swVersionToSKUSection
  swVersionToSKUSection() {
    this.isSwVersionSection = false;
    this.isSkuSection = true;
  }

  serialNumberToSWVersion() {
    if (this.showSoftwareSection) {
      this.isSwVersionSection = true;
    } else {
      this.isSkuSection = true;
    }
    this.isSerialNumberSection = false;
  }

  swVersionToContainerSection() {
    this.isSerialNumberSection = true;
    this.isSwVersionSection = false;
    if (!this.isContainerIdReadonly) {
      this.containerFocus();
    }
  }

  chkValue(value) {
    if (!this.appService.checkNullOrUndefined(value) && value !== '') {
      return true;
    } else {
      return false;
    }
  }

  // Container suggestion focus
  containerFocus() {
    this.appService.setFocus('containerInputId');
  }

  editMSN() {
    this.isSearchTextReadonly = false;
    this.isSearchText = true;
    this.appService.applySelect('searchtext');
  }

  editSWVersion() {
    this.isSwVersionReadOnly = false;
    this.appService.applySelect('softwareVersion');
  }

  // clear on msn
  msnClear() {
    this.selectedSKU = '';
    this.selectedSKUModel = '';
    this.conditionCode = '';
    this.conditionCodeId = '';
    this.softwareVersion = '';
    this.isSkuSection = false;
    this.isConditionCodeReadOnly = false;
    this.isSkuReadOnly = false;
    this.isSwVersionReadOnly = false;
    this.isSwVersionSection = false;
    this.msn = '';
    this.showMSNValue = false;
    this.trackingNumber = '';
    this.vendorId = '';
    this.externKey = '';
    this.authKey = '';
    this.authObj = null;
    this.attributes = null;
    this.swVersionClear();
    this.spclReceving = new SpclReceving();
    this.receiptObj = new Receipt();
    this.receiptDetail = new ReceiptDetail();
    this.skuObj = new SKU();
  }

  // clear on software scan
  swVersionClear() {
    this.isSerialNumberSection = false;
    this.serialNumber = '';
    this.isPostDisabled = true;
    this.receivingDevicesList = [];
    this.receivingESNMasterList = [];
    this.isContainerInputId = false;
    this.isContainerDisabled = true;
    this.isClearContainerDisabled = true;
    this.containerReadonlyValue = '';
    this.categoryName = '';
    this.isContainerIdReadonly = false;
    this.clearContainerID();
    this.swVersion = new SoftwareVersion();
    this.receivingDevice = new ReceivingDevice();
    this.receivingESNMaster = new ReceivingESNMaster();
    this.listofTransactions = new ListofTransactions();
    this.container = new Container();
    this.lottableTrans = new LottableTrans();
  }

  // clearing values and objects on mode change
  clear() {
    this.searchText = '';
    this.isSearchText = true;
    this.isColorCodeSection = false;
    this.isMsnImeiSection = true;
    this.isSearchTextReadonly = false;
    this.asnValidationResponse = null;
    this.msnClear();
    this.appService.setFocus('searchtext');
    this.appErrService.clearAlert();
    this.isContainerCloseAllow = true;
    this.getLocationContainers();
  }

  doneReceiving() {
    this.clear();
  }

  ngOnDestroy() {
    this.emitHideSpinner.unsubscribe();
    this.masterPageService.defaultProperties();
    if (!this.appService.checkNullOrUndefined(this.originationOperation) && this.originationOperation) {
      this.originationOperation.unsubscribe();
    }
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

}
