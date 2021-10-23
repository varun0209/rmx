import { Container } from './../../models/common/Container';
import { ListofTransactions } from './../../models/common/ListofTransactions';
import { Component, OnInit, ViewChild, OnDestroy, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, NgForm, NgModelGroup } from '@angular/forms';
import { String } from 'typescript-string-operations';
import { ApiConfigService } from './../../utilities/rlcutl/api-config.service';
import { ApiService } from './../../utilities/rlcutl/api.service';
import { ReceivingDevice, ReceivingESNMaster } from './../../models/receiving/ReceivingDevice';
import { dropdown } from './../../models/common/Dropdown';
import { Subscription } from 'rxjs';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppService } from './../../utilities/rlcutl/app.service';
import { MasterPageService } from './../../utilities/rlcutl/master-page.service';
import { AppErrorService } from './../../utilities/rlcutl/app-error.service';
import { ReceivingService } from './../../services/receiving.service';
import { ClientData } from './../../models/common/ClientData';
import { UiData } from './../../models/common/UiData';
import { SKU } from './../../models/receiving/ReceivingSKU';
import { Receipt, ReceiptDetail } from './../../models/receiving/Receipt';
import { Authorization } from './../../models/receiving/Authorization';
import { TwoDBarcode } from './../../models/receiving/TwoDBarcode';
import { TrackingNum } from './../../models/receiving/TrackingNum';
import { SoftwareVersion } from './../../models/receiving/SoftwareVersion';
import { AudioType } from '../../enums/audioType.enum';
import { MessageType } from '../../enums/message.enum';
import { MessagingService } from './../../utilities/rlcutl/messaging.service';
import { Message } from './../../models/common/Message';
import { ReceivingMode } from './../../models/receiving/ReceivingMode';
import { FindTraceHoldComponent } from '../../framework/busctl/find-trace-hold/find-trace-hold.component';
import { TraceTypes } from '../../enums/traceType.enum';
import { CommonService } from '../../services/common.service';
import { StorageData } from '../../enums/storage.enum';
import { StatusCodes } from '../../enums/status.enum';
import { ReceivingModes } from '../../enums/receivingModes.enum';
import { CommonEnum } from './../../enums/common.enum';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-receive-mobile',
  templateUrl: './receive-mobile.component.html',
  styleUrls: ['./receive-mobile.component.css']
})
export class ReceiveMobileComponent implements OnInit, OnDestroy {

  @ViewChild('swVersionCheck') swVersionCheck: TemplateRef<any>;

  // Variable Declarations
  trackingNumber: string;
  authkeyOrExternKey: string;
  selectedMode: string;
  barCode: string;
  barCodeReadOnlyValue: string;
  poOrrmaValue: string;
  externKey: string;
  skuList: SKU[] = [];
  tempSkuList: SKU[] = [];
  selectedSKU: string;
  selectedSKUModel: string;
  disposition: string;
  conditionCodeOptions = [];
  conditionCode: string;
  conditionCodeId = '';
  softwareVersion = '';
  expectedQty: number;
  receivedQty: number;
  nonSerializedQuantity: number;
  serialNumber: string;
  msnValue: string;
  isClearSerialNumber = false;
  isPostDisabled = true;
  // authorizationKey:string;
  selectedExternLineNo: string;
  colorCode: string;
  colorText: string;
  swVersionMessage: string;
  appConfig: any;

  // list of object variables
  receivingDevicesList = [];
  receivingESNMasterList = [];

  controlConfig: any;

  // hide controls
  isTrackingNumberEditMode = false;
  isTrackingNumbertoKeep = false;
  ispoOrrmaValuetoKeep = false;
  isModeSelected = false;
  isTrackingNumber = true;
  isTrackingNumberReadOnly = false;
  isTwoDBarcode = false;
  isTwoDBarcodeReadOnly = false;
  isPoOrRma = false;
  isPoOrRmaReadOnly = false;
  isSku = false;
  isSkuReadOnly = false;
  isConditionCode = false;
  isConditionCodeReadOnly = false;
  isOpenQty = false;
  isOpenQtyReadOnly = false;
  isQuantity = false;
  isQuantityReadOnly = false;
  isSKUSectionDoneBtn = true;
  isSwVersionReadOnly = false;
  showSoftwareSection = false;
  isColorCodeSection = false;
  showSerialNumber = true;
  isSerialnumberDisabled = false;
  showMSNValue = false;
  isClearDisabled = true;
  isSNsectionDoneBtn = false;
  allowUnExpSKU = CommonEnum.no;
  // hideSections
  isTrackingSection = true;
  isTrackingReadonlySection = false;
  isSwVersionSection = false;
  isSkuSection = false;
  isSerialNumberSection = false;
  validTrackingNumberResponse: any;
  validSerialNumberResponse: any;
  validSearchKeyResponse: any;

  // Modal popup
  modeltitle: string;
  utilityTitle: string;
  isModalOpen = false;

  // Object Declarations
  clientData = new ClientData();
  uiData = new UiData();
  receiptObj = new Receipt();
  trackingNubmerObj = new TrackingNum();
  twoDBarcodeObj = new TwoDBarcode();
  authorization = new Authorization();
  swVersion = new SoftwareVersion();
  skuObj = new SKU();
  receivingDevice = new ReceivingDevice();
  currentReceivedDevice = new ReceivingDevice();
  receiptDetail = new ReceiptDetail();
  receivingESNMaster = new ReceivingESNMaster();
  listofTransactions = new ListofTransactions();
  // Container
  container = new Container();
  receivingMode = new ReceivingMode();

  // enums
  receivingModes = ReceivingModes;
  storageData = StorageData;
  statusCode = StatusCodes;
  traceTypes = TraceTypes;

  // subjects
  ReceivingOnChangeMode: Subscription;
  emitGetTrasactionResponse: Subscription;

  // originaiton operation
  originationOperation: Subscription;
  deviceOrigination: string;
  isMSNvalidated = false;
  canAllowNext = CommonEnum.no;
  dialogRef: any;

  constructor(private receivingService: ReceivingService,
    public masterPageService: MasterPageService,
    public appService: AppService,
    public apiservice: ApiService,
    private apiConfigService: ApiConfigService,
    private snackbar: XpoSnackBar,
    public appErrService: AppErrorService,
    private spinner: NgxSpinnerService,
    private messagingService: MessagingService,
    private commonService: CommonService,
    private dialog: MatDialog
  ) {
    this.ReceivingOnChangeMode = this.masterPageService.selectedRecevingMode.subscribe(mode => {
      if (!this.appService.checkNullOrUndefined(mode)) {
        this.changeReceivingMode(mode);
      }
    });
    // emitting transactions
    this.emitGetTrasactionResponse = this.receivingService.emitGetTransactions.subscribe(res => {
      if (!this.appService.checkNullOrUndefined(res)) {
        this.getTransactions(res);
      }
    });
  }

  ngOnInit() {
    const operationObj = this.masterPageService.getRouteOperation();
    if (operationObj) {
      this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
      this.masterPageService.setTitle(operationObj.Title);
      this.masterPageService.setModule(operationObj.Module);
      this.controlConfig = JSON.parse(localStorage.getItem(this.storageData.controlConfig));
      this.uiData.OperationId = operationObj.OperationId;
      this.uiData.OperCategory = operationObj.Category;
      localStorage.setItem(this.storageData.module, operationObj.Module);
      this.appErrService.appMessage();
      if (!this.appService.checkNullOrUndefined(this.controlConfig.ribbonModesDropdown) && this.controlConfig.ribbonModesDropdown.Show) {
        this.masterPageService.showRibbonModesDropdown = this.controlConfig.ribbonModesDropdown.Show;
        this.receivingService.getReceivingModes(this.clientData, this.uiData);

      }
      this.originationOperation = this.masterPageService.originationOperation.subscribe(val => {
        this.deviceOrigination = val;
      });
      this.appConfig = JSON.parse(localStorage.getItem(this.storageData.appConfig));
    }

  }

  onInputChange() {
    this.isClearDisabled = false;
  }

  tackingNumberLock() {
    this.isTrackingNumbertoKeep = !this.isTrackingNumbertoKeep;
  }
  poRMALock() {
    this.ispoOrrmaValuetoKeep = !this.ispoOrrmaValuetoKeep;
  }
  validateTrackingNumber() {
    if (this.trackingNumber) {
      this.trackingNubmerObj = new TrackingNum();
      this.trackingNubmerObj.TrackingNum = this.trackingNumber;
      const trackingResult = this.receivingService.validateTrackingNumber(this.clientData, this.uiData, this.trackingNubmerObj);
      trackingResult.subscribe(res => {
        this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
          this.isTrackingNumberEditMode = false;
          this.validTrackingNumberResponse = res;
          this.masterPageService.modeOptionSelected = true;
          const traceData = { traceType: this.traceTypes.trackingNumber, traceValue: this.validTrackingNumberResponse.Response.TrackingNum, uiData: this.uiData };
          const traceResult = this.commonService.findTraceHold(traceData, this.uiData);
          traceResult.subscribe(result => {
            if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.pass) {
              if (this.appService.checkNullOrUndefined(result.Response)) {
                this.validTrackingNumber();
              } else {
                this.canProceed(result, this.traceTypes.trackingNumber);
              }
              this.spinner.hide();
            } else if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.fail) {
              this.spinner.hide();
              this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
            }
          });
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          this.appService.applyRequired(true, 'trackingNum');
          this.appService.setFocus('trackingNum');
          this.appService.applySelect('trackingNum');

        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
    }
  }

  validTrackingNumber(res = this.validTrackingNumberResponse) {
    this.trackingNubmerObj = res.Response;
    this.isTrackingReadonlySection = true;
    this.isTrackingNumber = false;
    this.isTrackingNumberReadOnly = true;  // -- showing read only control
    this.appErrService.alertSound(AudioType.success);
    if (this.selectedMode === this.receivingModes.twoDbarcode) {
      this.isTwoDBarcode = true;
      if (this.barCode) { this.appService.applySelect('scanESN'); }
      this.appService.setFocus('scanESN');
    } else {
      this.isPoOrRma = true;
      if (this.poOrrmaValue) { this.appService.applySelect('PoOrRma'); }
      this.appService.setFocus('PoOrRma');
    }
    this.validTrackingNumberResponse = null;
  }

  canProceed(traceResponse, type) {
    if (traceResponse.Response.canProceed === CommonEnum.yes) {
      this.appErrService.setAlert(traceResponse.StatusMessage, true, MessageType.info);
    }
    if (!this.appService.checkNullOrUndefined(traceResponse.Response.TraceHold)) {
      const uiObj = { uiData: this.uiData };
      traceResponse = Object.assign(traceResponse, uiObj);
      this.dialogRef = this.dialog.open(FindTraceHoldComponent, { hasBackdrop: true, disableClose: true, panelClass: 'dialog-width-sm', data: { modalData: traceResponse } });
      this.dialogRef.afterClosed().subscribe((returnedData) => {
        if (returnedData) {
        if (returnedData.Response.canProceed === CommonEnum.yes) {
          if (type === this.traceTypes.trackingNumber) {
            this.validTrackingNumber();
          } else if (type === this.traceTypes.rmaNumber) {
            this.validSearchKey();
          }
        } else if (returnedData.Response.canProceed === CommonEnum.no) {
          if (type === this.traceTypes.trackingNumber) {
            this.appService.setFocus('trackingNum');
          } else if (type === this.traceTypes.rmaNumber) {
            this.appService.setFocus('PoOrRma');
          }
          this.appErrService.setAlert(returnedData.StatusMessage, true);
        }
      }
      });
    }
    this.spinner.hide();
  }

  validate2DBarcode() {
    if (this.barCode) {
      this.spinner.show();
      this.clearValuesOnBarcode(); // clearing values and objects
      this.twoDBarcodeObj.Barcode = this.barCode;
      const result = this.receivingService.validate2DBarcode(this.clientData, this.uiData, this.twoDBarcodeObj);
      result.subscribe(res => {
        if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
          this.twoDBarcodeObj = res.Response;
          this.isTwoDBarcode = false;
          this.isTwoDBarcodeReadOnly = true;   // -- showing read only control
          if (this.twoDBarcodeObj.SoftwareVersion !== '') {
            this.softwareVersion = this.twoDBarcodeObj.SoftwareVersion;
            this.isSwVersionReadOnly = true;
          }
          if (!this.appService.checkNullOrUndefined(this.twoDBarcodeObj.RMA) && this.twoDBarcodeObj.RMA !== '') {
            this.isPoOrRmaReadOnly = true;
            this.authkeyOrExternKey = this.twoDBarcodeObj.RMA;
            this.searchKey();
            this.isTrackingSection = false;
            this.isSkuSection = true;
            this.selectedSKU = this.twoDBarcodeObj.Sku;
            if (!this.appService.checkNullOrUndefined(this.selectedSKU)) {
              this.skuObj.Sku = this.selectedSKU;
            }
          } else {
            this.spinner.hide();
            this.isPoOrRma = true;
            this.appService.setFocus('PoOrRma');
            let userMessage = new Message();
            this.appErrService.alertSound(AudioType.warning);
            userMessage = this.messagingService.SendUserMessage('7280091', MessageType.warning);
            this.appErrService.setAlert(userMessage.messageText, true, userMessage.messageType);
          }
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          this.appService.applySelect('scanESN');
          this.appService.applyRequired(true, 'scanESN');
          const elem: HTMLElement = document.getElementById('scanESN');
          if (elem) {
            elem.style.height = (elem.scrollHeight) + 'px';
          }
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
    }
  }

  // PO/RMA
  searchKey() {
    if (this.authkeyOrExternKey) {
      this.receivingMode.SearchValue = '';
      const response = this.receivingService.searchInputKey(this.clientData, this.uiData, this.receivingMode, this.authkeyOrExternKey);
      response.subscribe(res => {
        //  this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
          if (!this.appService.checkNullOrUndefined(res.Response)) {
            this.validSearchKeyResponse = res;
            const traceData = { traceType: this.traceTypes.rmaNumber, traceValue: this.authkeyOrExternKey, uiData: this.uiData };
            const traceResult = this.commonService.findTraceHold(traceData, this.uiData);
            traceResult.subscribe(result => {
              if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.pass) {
                if (this.appService.checkNullOrUndefined(result.Response)) {
                  this.validSearchKey();
                } else {
                  this.canProceed(result, this.traceTypes.rmaNumber);
                }
                // this.spinner.hide();
              } else if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.fail) {
                this.spinner.hide();
                this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
              }
            });
          }
        }
        if (!this.appService.checkNullOrUndefined(res) && res.Status !== this.statusCode.pass) {
          this.spinner.hide();
          this.isTrackingSection = true;
          this.isPoOrRma = true;
          this.isPoOrRmaReadOnly = false;
          this.isSkuSection = false;
          this.appService.setFocus('PoOrRma');
          this.appService.applySelect('PoOrRma');
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
    }
  }

  validSearchKey(res = this.validSearchKeyResponse) {
    this.authorization = res.Response[0];
    this.poOrrmaValue = this.authorization.Auth_Key;
    this.externKey = this.authorization.ExternKey;
    this.authorization.TrackingNumber = this.trackingNumber;
    this.isPoOrRma = false;
    this.isPoOrRmaReadOnly = true;
    this.createReceipt(this.clientData, this.uiData, this.authorization, this.poOrrmaValue);
    this.validSearchKeyResponse = null;
  }

  // Create Receipt
  createReceipt(clientData, uiData, authorizationObj, authorizationKey) {
    const result = this.receivingService.createReceipt(clientData, uiData, authorizationObj, authorizationKey);
    result.subscribe(res => {
      // this.spinner.hide();
      if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
        this.receiptObj = res.Response;
        this.receivingService.updatedReceipt = this.receiptObj;
        this.getExpectedSKUs(clientData, uiData, this.receiptObj, this.twoDBarcodeObj);
      } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
        this.spinner.hide();
        this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
      }
    }, erro => {
      this.appErrService.handleAppError(erro);
    });
  }

  // Get Expected SKU's
  getExpectedSKUs(clientData, uiData, receipt, twoDBarcode) {
    let searchTxt = '';
    searchTxt = this.searchValue();
    this.receivingMode.SearchValue = searchTxt;
    const result = this.receivingService.getExpectedSKUs(clientData, uiData, receipt, twoDBarcode, this.receivingMode);
    result.subscribe(res => {
      if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
        this.clearNonSerializeItems();
        this.isSkuSection = true;
        this.isTrackingSection = false;
        this.allowUnExpSKU = res.Response.hasOwnProperty('AllowUnExpSKU') ? res.Response.AllowUnExpSKU : CommonEnum.no;
        this.skuList = res.Response.hasOwnProperty('ResultantSKUs') ? res.Response.ResultantSKUs : [];
        this.tempSkuList = res.Response.hasOwnProperty('ResultantSKUs') ? res.Response.ResultantSKUs : [];
        if (res.Response.hasOwnProperty('ResultantSKUs') && res.Response.ResultantSKUs.length && res.Response.ResultantSKUs.length === 1) {
          this.skuObj = res.Response.ResultantSKUs[0];
          this.selectedSKU = this.skuObj.Sku;
          this.selectedSKUModel = this.skuObj.Model;
          this.isSkuReadOnly = true;
          this.appService.applySelect('skuInput');
          if (this.allowUnExpSKU === CommonEnum.no) {
            this.getConditionCode(clientData, uiData, this.skuObj, twoDBarcode, this.receiptObj);
          }
        }
        if ((this.allowUnExpSKU === CommonEnum.yes) || (this.allowUnExpSKU === CommonEnum.no && res.Response.hasOwnProperty('ResultantSKUs') && res.Response.ResultantSKUs.length && res.Response.ResultantSKUs.length > 1)) {
          this.spinner.hide();
          this.isSku = true;
          this.appErrService.alertSound(AudioType.success);
          this.appService.setFocus('skuInput');
        }
      } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
        this.spinner.hide();
        this.isSku = false;
        this.isSkuReadOnly = true;
        this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
      }
    }, erro => {
      this.appErrService.handleAppError(erro);
    });
  }

  // Get Eligible skus
  getEligibleSKUs(value) {
    if (value && value.length >= this.appConfig.default.skuLength && this.allowUnExpSKU === CommonEnum.yes) {
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


  // Emiting from rmtypehead after selecting option
  typeaheadResponse(event) {
    this.selectedSKU = event.item.Sku;
    this.selectedSKUModel = event.item.Model;
    // this.skuObj = new SKU();
    this.isSku = false;
    this.isSkuReadOnly = true;
    this.isConditionCode = true;
    this.skuObj = event.item;
    this.getConditionCode(this.clientData, this.uiData, this.skuObj, this.twoDBarcodeObj, this.receiptObj);
  }


  onSkuEnter(event) {
    this.appErrService.clearAlert();
    if (!(event || event.value)) {
      return;
    }
    const skuObj = this.skuList.find(res => res.Sku === event.value);
    if (skuObj) {
      this.selectedSKU = skuObj.Sku;
      this.selectedSKUModel = skuObj.Model;
      this.isSku = false;
      this.isSkuReadOnly = true;
      this.isConditionCode = true;
      this.skuObj = skuObj;
      this.getConditionCode(this.clientData, this.uiData, this.skuObj, this.twoDBarcodeObj, this.receiptObj)
    } else {
      this.appErrService.setAlert(this.appService.getErrorText(2660078), false, MessageType.failure);
    }
  }

  // get Condition code
  getConditionCode(clientData, uiData, SKU, twoDBarcode, receiptObj) {
    const result = this.receivingService.getCondition(clientData, uiData, SKU, twoDBarcode, receiptObj);
    result.subscribe(res => {
      // this.spinner.hide();
      if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
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
          this.isSKUSectionDoneBtn = false;
        }
        if (res.Response.Conditions.length > 0 && res.Response.Conditions.length === 1) {
          this.conditionCodeId = res.Response.Conditions[0].Id;
          this.conditionCode = res.Response.Conditions[0].Text;
          this.isConditionCode = false;
          this.isConditionCodeReadOnly = true;
          this.getReceiptDetail();
        } else {
          this.spinner.hide();
          this.appErrService.alertSound(AudioType.success);
          this.isConditionCode = true;
          this.appService.setFocus('conditionType');
        }
      } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
        this.spinner.hide();
        this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
      }
    }, erro => {
      this.appErrService.handleAppError(erro);
    });
  }

  changeConditionCode(event: any) {
    this.conditionCodeId = event.value;
    this.conditionCode = event.source.selected.viewValue;
    this.isSKUSectionDoneBtn = false;
    this.appErrService.alertSound(AudioType.success);
    this.appService.setFocus('SKUSectionDone');
  }

  //  on sku done button
  doneOnSku() {
    if (this.isOpenQty) {
      this.addAccessory();  // calling non-serialized api
    } else {
      this.getReceiptDetail();
    }
  }

  enableSkuDoneBtn() {
    this.nonSerializedQuantity ? this.isSKUSectionDoneBtn = false : this.isSKUSectionDoneBtn = true;
    this.receiptDetail.QtyExpected = this.nonSerializedQuantity;
  }

  addAccessory() {
    const isMobile = this.appService.checkDevice();
    const result = this.receivingService.addAccessory(this.clientData, this.uiData, this.receiptObj,
      this.receivingDevice, this.receiptDetail, this.skuObj,
      this.twoDBarcodeObj, isMobile.toString(), this.selectedExternLineNo);
    result.subscribe(res => {
      if (!this.appService.checkNullOrUndefined(res.Response) && res.Status === this.statusCode.pass) {
        this.spinner.hide();
        this.doneReceiving();
        this.snackbar.success(res.StatusMessage);
      } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
        this.spinner.hide();
        this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
      }
    }, erro => {
      this.appErrService.handleAppError(erro);
    });
  }

  // get receipt details
  getReceiptDetail() {
    this.receiptDetail = new ReceiptDetail();
    this.receivingService.getReceiptDetail(this.clientData, this.uiData, this.receiptObj, this.receivingDevice, this.receiptDetail, this.skuObj, this.twoDBarcodeObj, this.receivingMode, (data) => {
      if (!this.appService.checkNullOrUndefined(data.Response) && data.Status === this.statusCode.pass) {
        this.isSKUSectionDoneBtn = true;
        this.isConditionCode = false;
        this.isConditionCodeReadOnly = true;
        // this.showSoftwareSection = data.Response.RequiredSWVersion;
        if (!this.appService.checkNullOrUndefined(data.Response.ReceiptDetail)) {
          this.receiptDetail = data.Response.ReceiptDetail;
          this.selectedExternLineNo = this.receiptDetail.ExternLineno;
          this.getDetermineSKU();
        } else if (this.allowUnExpSKU === CommonEnum.yes) {
          this.getDetermineSKU();
        } else {
          this.spinner.hide();
        }
      } else if (!this.appService.checkNullOrUndefined(data.Response) && data.Status === this.statusCode.fail) {
        this.spinner.hide();
        if (this.selectedMode === this.receivingModes.twoDbarcode) {
          this.isTwoDBarcode = true;
          this.isTrackingSection = true;
          this.isPoOrRmaReadOnly = false;
          this.isTwoDBarcodeReadOnly = false;
          this.isSkuSection = false;
          this.appService.setFocus('scanESN');
          this.appService.applySelect('scanESN');
        } else {
          this.isConditionCode = false;
          this.isConditionCodeReadOnly = false;
          this.isSkuReadOnly = false;
          this.isSku = true;
          this.isSKUSectionDoneBtn = true;
          this.appService.setFocus('skuInput');
          this.appService.applySelect('skuInput');
        }
        this.spinner.hide();
        this.appErrService.setAlert(data.ErrorMessage.ErrorDetails, true);
      }
    });
  }

  getDetermineSKU() {
    const result = this.receivingService.getDetermineSKU(this.clientData, this.uiData, this.receiptObj, this.receiptDetail, this.receivingDevice, this.receivingESNMaster, this.twoDBarcodeObj, this.selectedSKU, this.conditionCodeId);
    result.subscribe(res => {
      if (!this.appService.checkNullOrUndefined(res.Response) && res.Status === this.statusCode.pass) {
        this.showSoftwareSection = res.Response.RequiredSWVersion;
        this.skuObj = res.Response.SKUs[0];
        this.disposition = this.skuObj.Dispsotion;
        this.selectedSKU = this.skuObj.Sku;
        if (this.skuObj.IsSerialized !== true) {
          this.expectedQty = this.receiptDetail.QtyExpected;
          this.isOpenQty = true;
          this.isQuantity = true;
          this.spinner.hide();
        } else {
          this.appErrService.alertSound(AudioType.success);
          this.isSkuSection = false;
          if (!this.appService.checkNullOrUndefined(this.twoDBarcodeObj.Barcode) && this.twoDBarcodeObj.Barcode !== '' && this.softwareVersion !== '') {
            this.validateSoftwareVersion();
          } else if (!this.appService.checkNullOrUndefined(this.twoDBarcodeObj.Barcode) && this.twoDBarcodeObj.Barcode !== '' && this.showSoftwareSection === false) {
            // this.validateSerialNumber();
            this.validateAndReceiveSerialNumbers();
          } else if (this.showSoftwareSection) { // no barcode present scenario
            this.spinner.hide();
            this.isSwVersionSection = true;
            this.appService.setFocus('softwareVersion');
          } else {   // skipping software version
            if (this.selectedMode === this.receivingModes.msn) {
              this.serialNumber = this.receivingMode.SearchValue;
              this.validateSerialNumber();
            } else {
              this.spinner.hide();
              this.isSerialNumberSection = true;
              this.appService.setFocus('serialNumber');
            }
          }
        }
        // this.spinner.hide();
      } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
        this.spinner.hide();
        this.isSkuReadOnly = false;
        this.isSku = true;
        this.appService.setFocus('skuInput');
        this.appService.applySelect('skuInput');
        this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
      }
    }, erro => {
      this.appErrService.handleAppError(erro);
    });
  }

  // validate Serial Number
  validateSerialNumber() {
    const result = this.receivingService.validateSerialNumber(this.serialNumber, this.clientData, this.uiData, this.twoDBarcodeObj, this.receivingDevicesList, this.receivingESNMasterList, this.receiptDetail, this.swVersion, this.skuObj, this.receiptObj);
    result.subscribe(res => {
      if (!this.appService.checkNullOrUndefined(res.Response) && res.Status === this.statusCode.pass) {
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          this.validSerialNumberResponse = res;
          this.validSerialNumber();
        }
      } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
        this.spinner.hide();
        this.isSerialNumberSection = true;
        this.appService.setFocus('serialNumber');
        this.appService.applySelect('serialNumber');
        this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
      }
    }, erro => {
      this.appErrService.handleAppError(erro);
    });
  }

  // private traceFindSerialNumber(serialNumber: any) {
  //   const traceData = { traceType: this.traceTypes.serialNumber, traceValue: serialNumber, uiData: this.uiData };
  //   const traceResult = this.commonService.findTraceHold(traceData, this.uiData);
  //   traceResult.subscribe(result => {
  //     if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.pass) {
  //       if (this.appService.checkNullOrUndefined(result.Response)) {
  //         this.validSerialNumber();
  //       } else {
  //         this.canProceed(result, this.traceTypes.serialNumber);
  //       }
  //     } else if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.fail) {
  //       this.spinner.hide();
  //       this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
  //     }
  //   });
  // }


  validSerialNumber(res = this.validSerialNumberResponse) {
    this.canAllowNext = CommonEnum.no;
    if (!this.appService.checkNullOrUndefined(res)) {
      this.expectedQty = this.receiptDetail.QtyExpected;
      this.receivedQty = res.Response.QuantityReceived;
      this.receivingDevicesList = res.Response.ReceivingDevices;
      this.receivingESNMasterList = res.Response.ReceivingESNMasters;
      if (this.selectedMode === this.receivingModes.twoDbarcode) {
        this.isSerialNumberSection = false;
        this.processDevices();
      } else {
        this.currentReceivedDevice = this.receivingDevicesList.find(ele => ele.SerialNumber === this.serialNumber);
        this.appErrService.alertSound(AudioType.success);
        this.isSerialNumberSection = true;
        if (!this.appService.checkNullOrUndefined(this.currentReceivedDevice) && !this.appService.checkNullOrUndefined(this.currentReceivedDevice.Model)) {
          this.showMSNValue = this.currentReceivedDevice.Model.IsMSNEnabled;
        }
        if (res.Response.DoneEnable === CommonEnum.yes) {
          this.isSNsectionDoneBtn = true;
        }
        this.canAllowNext = res.Response.AllowNext;
        if (res.Response.AllowNext === CommonEnum.yes) {
          if (this.showMSNValue) {
            this.showSerialNumber = false;
            this.msnValue = '';
            this.isPostDisabled = true;
            this.appErrService.alertSound(AudioType.success);
            this.appService.setFocus('msn');
          } else {
            if (this.isSNsectionDoneBtn) {
              this.isPostDisabled = false;
            }
            this.serialNumber = '';
            this.showSerialNumber = true;
            this.appService.setFocus('serialNumber');
          }
        } else {
          this.dontAllowNext();
        }
        this.spinner.hide();
      }
      this.validSerialNumberResponse = null;

    }
  }



  private dontAllowNext() {
    if (this.isSNsectionDoneBtn && !this.showMSNValue) {
      this.isPostDisabled = false;
      this.appService.setFocus('post');
    }
    this.isClearSerialNumber = true;
    this.serialNumber = '';
    this.showSerialNumber = false;
  }

  // 2d barcode mode validateAndReceiveSerialNumbers
  validateAndReceiveSerialNumbers() {
    const requestObj = {
      ClientData: this.clientData,
      UIData: this.uiData,
      TwoDBarcode: this.twoDBarcodeObj,
      ReceivingDevices: this.receivingDevicesList,
      ReceivingESNMasters: this.receivingESNMasterList,
      ReceiptDetail: this.receiptDetail,
      SoftwareVersion: this.swVersion,
      SKU: this.skuObj,
      Receipt: this.receiptObj,
      ReceivingMode: this.receivingMode
    };
    this.commonService.commonApiCall(this.apiConfigService.validateAndReceiveSerialNumbersUrl, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.spinner.hide();
        this.isColorCodeSection = true;
        this.isSerialNumberSection = false;
        this.colorCode = res.Response.ColorCode;
        this.colorText = res.Response.Color;
        this.container = res.Response.Container;
        this.receiptObj = res.Response.Receipt;
        this.receivingDevicesList = res.Response.Devices;
      } else {
        this.isTrackingSection = true;
        this.isSerialNumberSection = false;
        this.isTwoDBarcodeReadOnly = false;
        this.appService.setFocus('scanESN');
        this.appService.applySelect('scanESN');
      }
    });
  }

  // validate MSN Value
  validateMSNValue() {
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, ReceivingDevice: this.currentReceivedDevice };
    const url = String.Join('/', this.apiConfigService.validateMSNValueUrl, this.msnValue);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.spinner.hide();
        this.isMSNvalidated = true;
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          this.receivingDevicesList.forEach(ele => {
            if (ele.SerialNumber === res.Response.SerialNumber) {
              ele.MSN = res.Response.MSN;
            }
          });
          if (this.isSNsectionDoneBtn) {
            this.isPostDisabled = false;
          }
          this.showMSNValue = false;
          this.msnValue = '';
          if (this.canAllowNext == CommonEnum.yes) {
            this.serialNumber = '';
            this.showSerialNumber = true;
            this.appErrService.alertSound(AudioType.success);
            this.appService.setFocus('serialNumber');
          } else {
            this.dontAllowNext();
          }
          this.canAllowNext = CommonEnum.no;
        }
      }
    });
  }

  validateSoftwareVersion() {
    if (this.softwareVersion) {
      this.swVersion.SWVersion = this.softwareVersion;
      const requestObj = { ClientData: this.clientData, UIData: this.uiData, SoftwareVersion: this.swVersion, SKU: this.skuObj };
      this.apiservice.apiPostRequest(this.apiConfigService.checkSoftwareVersionUrl, requestObj)
        .subscribe(response => {
          const res = response.body;
          if (!this.appService.checkNullOrUndefined(res) && res.StatusMessage === '' && res.Status === this.statusCode.pass) {
            this.swVersionConfirmation();
          } else if (!this.appService.checkNullOrUndefined(res) && res.StatusMessage !== '' && res.Status === this.statusCode.pass) {
            this.spinner.hide();
            this.swVersionMessage = res.StatusMessage;
            this.openModal(this.swVersionCheck, 'swVersionConfirmation', 'modal-md modal-dialog-centered');

          } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
            this.spinner.hide();
            this.isSwVersionSection = true;
            this.isSwVersionReadOnly = false;
            this.appService.setFocus('softwareVersion');
            this.appService.applySelect('softwareVersion');
            this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          }
        }, erro => {
          this.appErrService.handleAppError(erro);
        });
    }

  }

  swVersionConfirmation() {
    this.isSwVersionReadOnly = true;
    this.isSwVersionSection = false;
    if (Object.entries(this.twoDBarcodeObj).length !== 0 && this.twoDBarcodeObj.ESNs.length > 0) {
      // this.validateSerialNumber();
      this.validateAndReceiveSerialNumbers();
    } else if (this.selectedMode === this.receivingModes.msn) {
      this.serialNumber = this.receivingMode.SearchValue;
      this.validateSerialNumber();
    } else {
      this.spinner.hide();
      this.isSerialNumberSection = true;
      this.appErrService.alertSound(AudioType.success);
      this.appService.setFocus('serialNumber');
    }
  }
  // Modal Popup
  openModal(template: TemplateRef<any>, status: any, modalclass: any) {
    this.dialogRef = this.dialog.open(template, { hasBackdrop: true, disableClose: true, panelClass:'dialod-width-sm' })
    this.utilityTitle = status;
    if (this.utilityTitle === 'swVersionConfirmation') {
      this.modeltitle = 'Software Version';
    }
  }

  closeSWVersionConfirmation() {
    this.dialogRef.close();
    this.swVersionConfirmation();
  }

  processDevices() {
    this.isSNsectionDoneBtn = false;
    this.appErrService.clearAlert();
    this.receivingDevicesList.forEach(ele => {
      ele.DeviceSKU = this.selectedSKU;
      ele.ModelName = this.selectedSKUModel;
      ele.Clientid = this.clientData.ClientId;
      ele.Location = this.clientData.Location;
      ele.Step = this.masterPageService.operation;
      ele.Origination = this.deviceOrigination;
    });
    this.receivingService.loadReceivingvalues(this.clientData, this.uiData, this.receivingDevicesList, this.receivingESNMasterList, this.receiptDetail);
  }

  // Get transactions
  getTransactions(res) {
    res.subscribe(response => {
      if (!this.appService.checkNullOrUndefined(response) && response.Status === this.statusCode.pass) {
        response.Response.Trans.map((val) => val.Result = 'PASS');
        this.listofTransactions = response.Response;
        this.getSuggestContainer();
      } else if (!this.appService.checkNullOrUndefined(response) && response.Status === this.statusCode.fail) {
        this.spinner.hide();
        this.appErrService.setAlert(response.ErrorMessage.ErrorDetails, true);
      }
    }, erro => {
      this.appErrService.handleAppError(erro);
    });
  }

  // suggested Container
  getSuggestContainer() {
    const result = this.receivingService.getSuggestContainer(this.clientData, this.uiData, this.receivingService.receivingDevicesList);
    result.subscribe(res => {
      if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
        this.container = res.Response;
        this.addSerailNumber();
      } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
        this.spinner.hide();
        this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
      }
    }, erro => {
      this.appErrService.handleAppError(erro);
    });
  }

  // add serial Number
  addSerailNumber() {
    const isMobile = this.appService.checkDevice();
    this.receivingService.receivingDevicesList.forEach(ele => {
      ele.ContainerID = this.container.ContainerID;
      ele.ContainerCycle = this.container.ContainerCycle;
    });
    const result = this.receivingService.addSerialNumber(this.clientData, this.uiData, this.receivingService.receivingDevicesList, this.receivingService.updatedReceipt, this.container, isMobile.toString(), this.selectedExternLineNo);
    result.subscribe(res => {
      if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
        this.receivingDevicesList = res.Response.ReceivingDevices;
        this.receiptObj = res.Response.Receipt;
        if (!this.appService.checkNullOrUndefined(res.Response.StatusMessage) && res.Response.StatusMessage !== '') {
          this.snackbar.success(res.Response.StatusMessage);
        }
        this.saveTransaction();
        this.updateLottables();
        this.insertSamplingBatch();
      } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
        this.spinner.hide();
        this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
      }
    }, erro => {
      this.appErrService.handleAppError(erro);
    });
  }

  insertSamplingBatch() {
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, ReceivingDevices: this.receivingService.receivingDevicesList, Receipt: this.receiptObj, Container: this.container, SoftwareVersion: this.swVersion };
    this.apiservice.apiPostRequest(this.apiConfigService.insertSamplingBatch, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
          // console.log(res);
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }

  // Save transactions after add serial number
  saveTransaction() {
    const result = this.receivingService.SaveTransaction(this.clientData, this.uiData, this.listofTransactions, this.receivingDevicesList);
    result.subscribe(response => {
      const res = response;
      if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
        this.spinner.hide();
        this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
      }
    }, erro => {
      this.appErrService.handleAppError(erro);
    });
  }

  updateLottables() {
    this.spinner.show();
    const result = this.receivingService.updateLottables(this.clientData, this.uiData, this.receivingDevicesList, this.receiptObj.ReceiptDetail);
    result.subscribe(response => {
      const res = response;
      if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
        this.postReceipt();
        this.closeContainer();
        this.getReceiptColorCode();
      } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
        this.spinner.hide();
        this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
      }
    }, erro => {
      this.appErrService.handleAppError(erro);
    });
  }

  getReceiptColorCode() {
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, Receipt: this.receiptObj };
    this.apiservice.apiPostRequest(this.apiConfigService.getReceiptColorCodeUrl, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
          this.spinner.hide();
          this.appErrService.alertSound(AudioType.success);
          this.isColorCodeSection = true;
          this.isSerialNumberSection = false;
          this.colorCode = res.Response.ColorCode;
          this.colorText = res.Response.Color;
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }

  closeContainer() {
    const requestObj = { ClientData: this.clientData, Container: this.container, UIData: this.uiData };
    this.apiservice.apiPostRequest(this.apiConfigService.closeContainerUrl, requestObj)
      .subscribe(response => {
        const res = response.body;
        this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
          // this.snackbar.success(res.StatusMessage);
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro, false);
      });
  }

  // Post Receipt
  postReceipt() {
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, Receipt: this.receiptObj, UIData: this.uiData };
    this.apiservice.apiPostRequest(this.apiConfigService.receiptPostUrl, requestObj)
      .subscribe(response => {
        const res = response.body;
        this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
          // this.snackbar.success(res.StatusMessage);
          this.commonService.postUpdateProcess(this.apiConfigService.postRecUpdateProcess, requestObj);
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }
  // reset whole screen
  reset() {
    this.isTrackingNumbertoKeep = false;
    this.doneReceiving();
  }
  // color coding screen
  doneReceiving() {
    this.isClearDisabled = true;
    this.appErrService.clearAlert();
    this.clearValuesOnDone();
    this.clearObjectsOnDone();
    this.isTrackingSection = true;
    this.isSNsectionDoneBtn = false;
    if (this.isTrackingNumbertoKeep) {
      this.isTrackingReadonlySection = true;
      this.isTrackingNumberReadOnly = true;
      this.isClearDisabled = false;
      if (this.selectedMode === this.receivingModes.twoDbarcode) {
        this.authkeyOrExternKey = '';
        // this.poOrrmaValue = '';
        // this.externKey = '';
        this.isPoOrRma = false;
        this.isPoOrRmaReadOnly = false;
        this.isTwoDBarcode = true;
        this.appService.setFocus('scanESN');
      } else {
        this.onPORMALock();
      }
    } else {
      this.trackingNubmerObj = new TrackingNum();
      this.trackingNumber = '';
      this.ispoOrrmaValuetoKeep = false;
      this.authkeyOrExternKey = '';
      // this.poOrrmaValue = '';
      this.isPoOrRma = false;
      this.isTrackingNumber = true;
      this.isTrackingReadonlySection = false;
      this.isTrackingNumberReadOnly = false;
      this.isPoOrRmaReadOnly = false;
      this.appService.setFocus('trackingNum');
    }
  }

  onPORMALock() {
    if (this.ispoOrrmaValuetoKeep && this.isTrackingNumbertoKeep) {
      this.clearValuesOnPORMA();
      this.clearObjectsOnPORMA();
      this.searchKey();
    } else {
      this.authkeyOrExternKey = '';
      // this.poOrrmaValue = '';
      // this.externKey = '';
      this.isPoOrRma = true;
      this.isPoOrRmaReadOnly = false;
      this.appService.setFocus('PoOrRma');
    }
  }
  // to fix alignment, providing space after Comma and binding barcode, used only in readonly control
  getBarcode() {
    this.barCodeReadOnlyValue = this.barCode;
    return this.barCodeReadOnlyValue.replace(/,(?=[^\s])/g, ', ');

  }

  checkTrackingSectionValues() {
    if (this.isTwoDBarcodeReadOnly === false && this.isPoOrRmaReadOnly === false) {
      return true;
    } else {
      return false;
    }
  }

  // clear Tracking Section
  clearTrackingSection() {
    this.trackingNumber = '';
    this.isTrackingNumber = true;
    this.isTrackingReadonlySection = false;
    this.isTrackingNumbertoKeep = false;
    this.poOrrmaValue = '';
    this.isPoOrRma = false;
    this.isPoOrRmaReadOnly = false;
    this.isTrackingSection = true;
    this.appService.setFocus('trackingNum');
    this.appErrService.clearAlert();
    this.trackingNubmerObj = new TrackingNum();
    this.clearValuesOnDone();
    this.clearObjectsOnDone();
  }

  // clear non-serialized details
  clearNonSerializeItems() {
    this.isOpenQty = false;
    this.isQuantity = false;
    this.nonSerializedQuantity = null;
  }
  // clear Tracking Section
  clearSKUSection() {
    this.selectedSKU = '';
    this.conditionCode = '';
    this.conditionCodeId = '';
    this.isConditionCode = false;
    this.receivedQty = null;
    this.expectedQty = null;
    this.isSkuReadOnly = false;
    this.isConditionCodeReadOnly = false;
    this.isOpenQtyReadOnly = false;
    this.isQuantityReadOnly = false;
    this.isSku = true;
    this.isSKUSectionDoneBtn = true;
    this.selectedExternLineNo = '';
    this.clearNonSerializeItems();
    this.clearSWversionValues();
    this.clearSerialNumberValues();
    this.clearObjectsOnSku();
    this.appErrService.clearAlert();
    this.appService.setFocus('skuInput');
    this.skuObj = new SKU();
  }

  clearSWVersionSection() {
    this.clearSWversionValues();
    this.clearSerialNumberValues();
    this.appErrService.clearAlert();
    this.appService.setFocus('softwareVersion');
  }

  clearSWversionValues() {
    this.softwareVersion = '';
    this.isSwVersionReadOnly = false;
    this.swVersion = new SoftwareVersion();
  }

  clearSerialNumberValues() {
    this.serialNumber = '';
    this.receivingDevicesList = [];
    this.receivingESNMasterList = [];
    this.receivingService.receivingDevicesList = [];
    this.expectedQty = null;
    this.receivedQty = null;
    this.isPostDisabled = true;
    this.showMSNValue = false;
    this.msnValue = '';
  }

  clearSerialNumberSection() {
    this.clearSerialNumberValues();
    this.appErrService.clearAlert();
    this.showSerialNumber = true;
    this.appService.setFocus('serialNumber');
  }

  showTrackingSection() {
    this.isSkuSection = false;
    this.isTrackingSection = true;
  }

  trackingSectionNextBtn() {
    if (this.isTrackingNumberReadOnly === true && this.isPoOrRmaReadOnly === true) {
      return false;
    } else {
      return true;
    }
  }

  skuSectionNextBtn() {
    if (this.isConditionCodeReadOnly === true && this.isSkuReadOnly === true && this.isOpenQty !== true) {
      return false;
    } else {
      return true;
    }
  }

  showSkuSection() {
    this.isSkuSection = true;
    this.isTrackingSection = false;
  }
  skuSectiontoswVersion() {
    if (this.showSoftwareSection) {
      this.isSwVersionSection = true;
    } else {
      this.isSerialNumberSection = true;
    }
    this.isSkuSection = false;
  }
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

  swVersionToSerialNumber() {
    this.isSerialNumberSection = true;
    this.isSwVersionSection = false;
  }

  editTracking() {
    this.isTrackingNumberEditMode = true;
    this.masterPageService.modeOptionSelected = false;
    this.isTrackingNumber = true;
    this.isTrackingNumberReadOnly = false;
    if (this.isTrackingNumberEditMode) {
      this.isTrackingReadonlySection = true;
      if (this.selectedMode === ReceivingModes.twoDbarcode) {
        this.isTwoDBarcode = false;
        this.isTwoDBarcodeReadOnly = false;
        this.appService.applySelect('scanESN');
        this.appService.setFocus('scanESN');
      } else {
        this.isPoOrRma = false;
        this.isPoOrRmaReadOnly = false;
        this.appService.applySelect('PoOrRma');
        this.appService.setFocus('PoOrRma');
      }
      this.clearObjectsOnDone();
      this.clearValuesOnPORMA();
    } else {
      this.isTrackingReadonlySection = false;
    }
    this.appService.setFocus('trackingNum');
  }

  editAuthkeyOrExternKey() {
    this.isPoOrRmaReadOnly = false;
    this.isPoOrRma = true;
    this.appService.applySelect('PoOrRma');
    this.appService.setFocus('PoOrRma');
    this.clearValuesOnPORMA();
    this.clearObjectsOnPORMA();
  }

  editCondtionType() {
    this.isConditionCodeReadOnly = false;
    this.isConditionCode = true;
    this.clearObjectsOnSku();
    this.showSoftwareSection = false;
    this.clearSWversionValues();
    this.clearSerialNumberValues();
    if (this.conditionCodeOptions.length > 1) {
      this.isSKUSectionDoneBtn = true;
    } else {
      this.isSKUSectionDoneBtn = false;
    }
  }

  editSWVersion() {
    this.isSwVersionReadOnly = false;
  }
  
  // setting placeholder based on mode selection
  getPlaceHolder() {
    if (this.selectedMode === this.receivingModes.msn) {
      return 'M_RECEIVING.MSN';
    }else if (this.selectedMode === this.receivingModes.rma) {
      return 'M_RECEIVING.SERIALNUMBER_MAC';
    } else {
      return 'M_RECEIVING.SERIALNUMBER';
    }
  }


  getPoRMAOrMsnPlaceHolder() {
    if (this.selectedMode === this.receivingModes.msn) {
      return 'M_RECEIVING.MSN';
    } else {
      return 'M_RECEIVING.PO_RMA';
    }
  }

  changeReceivingMode(selectedMode) {
    if (selectedMode && !this.masterPageService.modeOptionSelected) {
      this.clear();
      this.receivingMode = new ReceivingMode();
      this.receivingMode = selectedMode;
      this.selectedMode = selectedMode.Text;
      this.isModeSelected = true;
    }
  }

  // set value searchValue based on mode
  searchValue() {
    if (this.selectedMode === this.receivingModes.twoDbarcode) {
      return this.barCode;
    } else if (this.selectedMode === this.receivingModes.rma) {
      return this.poOrrmaValue;
    } else {
      return this.authkeyOrExternKey;
    }
  }
  // clearing values and objects on mode change
  clear() {
    this.clearTrackingSection();
    this.clearValuesOnDone();
    this.clearObjectsOnDone();
    this.appErrService.clearAlert();
  }

  // clear values related barcode on fail
  clearValuesOnBarcode() {
    this.poOrrmaValue = '';
    this.barCodeReadOnlyValue = '';
    this.twoDBarcodeObj = new TwoDBarcode();
    this.clearObjectsOnPORMA();
    this.clearValuesOnPORMA();
  }

  clearValuesOnDone() {
    this.isTrackingNumberEditMode = false;
    this.masterPageService.modeOptionSelected = false;
    this.poOrrmaValue = '';
    this.externKey = '';
    this.barCode = '';
    this.barCodeReadOnlyValue = '';
    this.softwareVersion = '';
    this.isTwoDBarcode = false;
    this.isTwoDBarcodeReadOnly = false;
    this.selectedSKU = '';
    this.selectedSKUModel = '';
    this.disposition = '';
    this.conditionCode = '';
    this.conditionCodeId = '';
    this.receivedQty = null;
    this.expectedQty = null;
    this.isSkuReadOnly = false;
    this.isConditionCode = false;
    this.isConditionCodeReadOnly = false;
    this.isOpenQtyReadOnly = false;
    this.clearNonSerializeItems();
    this.isQuantityReadOnly = false;
    this.isSku = false;
    this.serialNumber = '';
    this.showMSNValue = false;
    this.msnValue = '';
    this.showSerialNumber = true;
    this.isClearSerialNumber = false;
    this.isSwVersionSection = false;
    this.showSoftwareSection = false;
    this.isSkuSection = false;
    this.isSKUSectionDoneBtn = true;
    this.isSwVersionReadOnly = false;
    this.isSerialNumberSection = false;
    this.isPostDisabled = true;
    this.isColorCodeSection = false;
    this.skuList = [];
    this.receivingDevicesList = [];
    this.receivingESNMasterList = [];
    this.receivingService.receivingDevicesList = [];
    this.receivingService.updatedReceipt = null;
    this.selectedExternLineNo = '';
    this.receivingMode.SearchValue = '';
    this.conditionCodeOptions = [];
    this.isMSNvalidated = false;
  }

  clearObjectsOnDone() {
    this.twoDBarcodeObj = new TwoDBarcode();
    this.clearObjectsOnPORMA();
    this.container = new Container();
  }

  // clearing values and objects on search key scan
  clearValuesOnPORMA() {
    this.externKey = '';
    this.selectedSKU = '';
    this.selectedSKUModel = '';
    this.conditionCode = '';
    this.conditionCodeId = '';
    this.receivedQty = null;
    this.expectedQty = null;
    this.isPoOrRmaReadOnly = false;
    this.isSkuReadOnly = false;
    this.isSku = false;
    this.isConditionCode = false;
    this.isConditionCodeReadOnly = false;
    this.isSkuSection = false;
    this.isSKUSectionDoneBtn = true;
    this.isOpenQtyReadOnly = false;
    this.isQuantityReadOnly = false;
    this.receivingService.updatedReceipt = null;
    this.clearNonSerializeItems();
    this.clearSWversionValues();
    this.clearSerialNumberValues();
  }

  clearObjectsOnPORMA() {
    this.authorization = new Authorization();
    this.skuObj = new SKU();
    this.receiptObj = new Receipt();
    this.receiptDetail = new ReceiptDetail();
    this.clearObjectsOnSku();
  }

  clearObjectsOnSku() {
    this.swVersion = new SoftwareVersion();
    this.receivingDevice = new ReceivingDevice();
    this.currentReceivedDevice = new ReceivingDevice();
    this.receivingESNMaster = new ReceivingESNMaster();
  }

  ngOnDestroy() {
    this.clear();
    this.receivingMode = new ReceivingMode();
    this.selectedMode = '';
    this.isModeSelected = false;
    this.isTrackingNumbertoKeep = false;
    this.masterPageService.selectedModeIndex = null;
    this.masterPageService.modes = null;
    this.masterPageService.showRibbonModesDropdown = false;
    this.masterPageService.showUtilityIcon = false;
    this.receivingService.clearSubscription();
    this.ReceivingOnChangeMode.unsubscribe();
    this.emitGetTrasactionResponse.unsubscribe();
    this.masterPageService.moduleName.next(null);
    this.masterPageService.selectedRecevingMode.next(null);
    if (this.dialogRef) {
      this.dialogRef.close();
    }
    this.masterPageService.hideDialog();
    if (!this.appService.checkNullOrUndefined(this.originationOperation) && this.originationOperation) {
      this.originationOperation.unsubscribe();
    }
  }
}
