import { Component, OnInit, ViewChild, TemplateRef, OnDestroy, ElementRef } from '@angular/core';
import { ApiService } from '../../utilities/rlcutl/api.service';
import { FormGroup, FormBuilder, NgForm, NgModelGroup } from '@angular/forms';
import { Receipt, ReceiptDetail, Receipttrans } from '../../models/receiving/Receipt';
import { SKU } from '../../models/receiving/ReceivingSKU';
import { ApiConfigService } from '../../utilities/rlcutl/api-config.service';
import { RmtextboxComponent } from '../../framework/frmctl/rmtextbox/rmtextbox.component';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { ReceivingDevice, ReceivingESNMaster } from '../../models/receiving/ReceivingDevice';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';
import { ListofTransactions } from '../../models/common/ListofTransactions';
import { String } from 'typescript-string-operations';
import { MessageType } from '../../enums/message.enum';
import { MessagingService } from '../../utilities/rlcutl/messaging.service';
import { Grid } from './../../models/common/Grid';
import { NgxSpinnerService } from 'ngx-spinner';
import { Authorization } from '../../models/receiving/Authorization';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';
import { ContainerSuggestionComponent } from '../../framework/busctl/container-suggestion/container-suggestion.component';
import { Container } from '../../models/common/Container';
import { RmtypeaheadComponent } from '../../framework/frmctl/rmtypeahead/rmtypeahead.component';
import { AppService } from '../../utilities/rlcutl/app.service';
import { Router } from '@angular/router';
import { ReceivingService } from '../../services/receiving.service';
import { ClientData } from '../../models/common/ClientData';
import { DatePipe } from '@angular/common';
import { BsDatepickerConfig } from 'ngx-bootstrap';
import { BsDatepickerViewMode } from 'ngx-bootstrap/datepicker/models';
import { UiData } from '../../models/common/UiData';
import { LottableTrans } from '../../models/common/LottableTrans';
import { EngineResult } from '../../models/common/EngineResult';
import { TraceTypes } from '../../enums/traceType.enum';
import { CommonService } from '../../services/common.service';
import { FindTraceHoldComponent } from '../../framework/busctl/find-trace-hold/find-trace-hold.component';
import { StorageData } from '../../enums/storage.enum';
import { StatusCodes } from '../../enums/status.enum';
import { CommonEnum } from '../../enums/common.enum';
import { Subject, Subscription, timer } from 'rxjs';
import { switchMap, takeUntil, startWith } from 'rxjs/operators';
import { VendorDevice } from '../../models/receiving/VendorDevice';
import { SurveyService } from '../../services/survey.service';
import { PageUrl } from '../../enums/page-url.enum';
import { dropdown } from '../../models/common/Dropdown';
import { MatStepper } from '@angular/material/stepper';
import { RmddbtnComponent } from '../../framework/frmctl/rmddbtn/rmddbtn.component';
import { CatalogUtilityComponent } from '../../utility/catalog-utility/catalog-utility.component';
import { CatalogSkuUtilityComponent } from '../../utility/catalog-sku-utility/catalog-sku-utility.component';
import { OperationEnum } from '../../enums/operation.enum';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-receiving-automation',
  templateUrl: './receiving-automation.component.html',
  styleUrls: ['./receiving-automation.component.css']
})
export class ReceivingAutomationComponent implements OnInit, OnDestroy {

  @ViewChild('inputSerial') inputSerial: RmtextboxComponent;
  @ViewChild(RmtypeaheadComponent) rmtypeaheadChild: RmtypeaheadComponent;
  @ViewChild(RmtextboxComponent) rmtextboxChild: RmtextboxComponent;
  @ViewChild(ContainerSuggestionComponent) childContainer: ContainerSuggestionComponent;
  @ViewChild('parentDdBtn') parentDdBtn: RmddbtnComponent;
  @ViewChild('deviceDdBtn') deviceDdBtn: RmddbtnComponent;
  @ViewChild('stepper') stepper: MatStepper;
  @ViewChild('rf') rf: NgForm;
  @ViewChild('attributesCtrl') attributesCtrl: NgModelGroup;


  // Form
  receivingform: FormGroup;

  //  Modal popup
  modeltitle: string;
  utilityTitle: string;
  isModalOpen = false;
  isTimedOutDevice = false;
  showAutoOrManual = false;
  isAutoOrManual = false;
  hideEditReceiptlbl = false;
  parentId: string;
  deviceId: string;
  automationPortId: string;
  oldportId: string;
  isNextDisabled = true;
  isDeviceIdDisabled = true;
  isSearchDeviceIdDisabled = true;
  isGenerateUIdDisabled = false;
  isGenerateUIdBtn = true;
  isSearchUIdBtn = false;
  isPortIdDisabled = false;
  diveiceIdPrint = true;
  isCompleteDisabled = true;
  private largeModalSize = true;
  // Tracking Number
  trackingNumber: string;

  carrier: string;
  carrierId: string;
  carrierOptions = [];
  isCarrierDisabled = false;

  oemCode: string;
  oemId: string;
  OEMCodeOptions = [];
  isOemDisabled = false;

  color: string;
  colorId: string;
  colorOptions = [];
  isColorDisableded = false;

  // ddBtn at parent and device level
  isParentEnableDynamicBtn = true;
  isParentDdBtnDisabed = true;
  isDeviceDdBtnDisabled = true;
  isDeviceEnableDynamicBtn = true;
  parentSecDdBtnOptions = ['Start', 'Manual'];
  deviceSecDdBtnOptions = ['Retry', 'Clear'];
  isDeviceDetected: boolean;
  // survey properties
  surveyResponse: any;

  // stepper
  isDeviceProcesStepDone = false;
  isSruveyStepDone = false;
  isDeviceAndSurveyDone = false;

  // Serial Number
  serialNumber = '';
  isSerNumDisable = false;
  // addSerialNumDisabled: boolean = true;
  // externLineNo: string;
  selectedExternLineNo = '';
  conditionCode = '';
  conditionCodeId = '';
  isConditionCodeDisabled = false;
  conditionCodeOptions = [];
  receivedQuantity = '';
  // Authorization key
  authorization: Authorization = new Authorization();
  authorizationkey: string;
  isAuthorizationDisable = true;

  // SKU
  SKU: string;
  skuList: SKU[] = [];
  skuDisabled = true;
  selectedSKUModel: string;
  selectedSKU: string;
  // showing controlls progressivly
  showauthorizationkey = false;
  showSku = false;
  showEsn = false;
  showSuggestedContainer = false;
  showAdd = false;
  editSerialNumber = false;
  editauthorizationkey = false;
  isContainerValid = false;
  // ESN Reprint
  ESNReprint: boolean;
  ESNReprintDisabled = true;

  // Receiving Device
  skuObj = new SKU();
  receivingDevice = new ReceivingDevice();
  receivingESNMaster = new ReceivingESNMaster();

  // ReceiptTrans and Receipt
  grid: Grid;
  ReceiptTransResult: any;
  receiptNotes = '';
  receipt: Receipt;
  receiptDetail = new ReceiptDetail();
  receieptTrans = new Receipttrans();
  receiptkey: string;

  // Container
  container = new Container();

  // App message
  messageNum: string;
  messagesCategory: string;
  messageType: string;

  // AddSerialNumber
  listofTransactions: ListofTransactions = new ListofTransactions();
  isAddDisabled = true;
  isClearDisabled = true;

  // Flashing Background
  onErroralert = false;
  onInfoalert = false;

  // suggestion Container
  isContainerDisabled = true;
  isClearContainerDisabled = true;

  // DeskTop
  // ReCeipt
  isReceiptSection = false;
  isParentSection = true;
  isReceiptKey = true;
  isExtReceiptKey = true;
  isReceiptType = true;
  isClientId = true;
  isReceiptDate = true;
  isCarrierReference = true;
  isReceiptSource = true;
  isStatus = true;
  isCSC = true;
  isShiptDate = true;
  // CustomerINfo
  isCustomerName = true;
  isAddress1 = true;
  isAddress2 = true;
  isAddress3 = true;
  isAddress4 = true;
  isCity = true;
  isState = true;
  isZipCode = true;
  isCountry = true;
  isPhone = true;
  // *others Tab*//
  isWHSEID = true;
  isPlaceOfLoading = true;
  isPlaceOfDelivery = true;
  isReceiptGroup = true;
  isCarrierKey = true;
  isCarrierName = true;
  isreceivedQuantity = false;
  isSNPrintDisabled = true;
  islpnContainerPrintDisabled = true;

  // Attributes
  attribute1 = '';
  attribute2 = '';
  attribute3 = '';

  attribute5: any;

  SnAttributes: any = {};

  // onLoad Focus
  focusId = '';
  //  showContainerPrint = false;
  // showSerialNumberPrint = false;
  ReadyForProcess = '';
  receiptDetailResponse = [];

  // get controlConfig
  controlConfig: any;
  // unexpected
  unexpectedFlag = false;
  clientData = new ClientData();
  uiData = new UiData();

  receiptKeyObj: any;
  screen: any;
  appConfig: any;

  minDate: Date;
  maxDate: Date;
  currentTime: Date;

  minMode: BsDatepickerViewMode = 'month';
  bsConfig: Partial<BsDatepickerConfig>;
  @ViewChild('snAtt1') inputtext: any;
  mfgDateCheck = false;

  // lottable object
  lottableTrans: LottableTrans;
  // originaiton operation
  originationOperation: Subscription;
  deviceOrigination: string;
  validSerialNumberResponse: any;
  traceTypes = TraceTypes;
  createReceiptSuccessResponse: any;
  storageData = StorageData;
  statusCode = StatusCodes;
  operationEnum = OperationEnum;
  processQueData: any[];
  queueRecords = [];  // autopolling queue records
  response = [];

  vendorDevice = new VendorDevice();
  // private automationQueue$: Observable<any>;
  private stopPolling = new Subject();
  private deviceStopPolling = new Subject();

  emitDoneSurveyResponse: Subscription;
  emitSurveyResult: Subscription;
  authorizationObj: any;
  largeSkuModalSize = true;
  dialogRef: any;

  constructor(
    public apiservice: ApiService,
    public form: FormBuilder,
    private apiConfigService: ApiConfigService,
    private snackbar: XpoSnackBar,
    public appErrService: AppErrorService,
    private spinner: NgxSpinnerService,
    public masterPageService: MasterPageService,
    public appService: AppService,
    public receivingService: ReceivingService,
    private router: Router,
    public datepipe: DatePipe,
    public surveyService: SurveyService,
    private commonService: CommonService,
    private dialog: MatDialog
  ) {
    this.masterPageService.receiveingConfiguration.subscribe(hideControls => {
      if (!this.appService.checkNullOrUndefined(hideControls)) {
        //  this.showContainerPrint = hideControls.containerPrint.Show;
        // this.showSerialNumberPrint = hideControls.serialNumberPrint.Show;
        if (hideControls.focus && hideControls.focus.Id) {
          this.focusId = hideControls.focus.Id;
          // this.appService.setFocus(this.focusId);
        }
      }
    });


    // emited survey result on serialnumber scan
    this.emitSurveyResult = this.surveyService.surveyResult.subscribe(surveyResponse => {
      if (!this.appService.checkNullOrUndefined(surveyResponse)) {
        this.getSurveyResponse(surveyResponse);
      }
    });


    // emitDoneManualTransaction response
    this.emitDoneSurveyResponse = this.surveyService.doneSurveyResponse.subscribe(doneResponse => {
      if (!this.appService.checkNullOrUndefined(doneResponse)) {
        this.getCompletedSurveyResponse(doneResponse);
      }
    });
  }

  ngOnInit() {
    this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
    this.setReceiveOperationObj();

    if (this.router.url === PageUrl.automationReceiving) {
      this.getVendorDevice();
      this.isGenerateUIdBtn = false;
      this.showAutoOrManual = true;
      this.isAutoOrManual = true;
      this.isParentSection = false;
      this.hideEditReceiptlbl = true;
      this.isPortIdDisabled = true;
    } else if (this.router.url === PageUrl.rsAutomationReceiving) {
      this.isDeviceDetected = false;
      this.receiptKeyObj = JSON.parse(localStorage.getItem(this.storageData.receiptSearchObj));
      if (!this.appService.checkNullOrUndefined(this.receiptKeyObj)) {
        this.receiptkey = this.receiptKeyObj.receiptKey;
      }
      const auth_key = localStorage.getItem(this.storageData.authKey);
      if (!this.appService.checkNullOrUndefined(this.receiptkey) && this.receiptkey !== '') {
        this.authorizationkey = this.receiptKeyObj.ExternReceiptkey;
        this.loadReceiptSearch();
      } else if (!this.appService.checkNullOrUndefined(auth_key) && auth_key !== '') {
        this.authorizationkey = auth_key;
        if (localStorage.getItem(StorageData.authObj)) {
          this.authorizationObj = JSON.parse(localStorage.getItem(StorageData.authObj));
        }
        this.createReceipt();
      } else {
        this.gotoReceiveSearch();
      }
      this.getParentID();
      this.generateUidFocus();
    }
    this.conditionCodeData();
    this.dateConfig();
    this.GetColorCarrierOEMCodes();
    this.getQueueRecords();
  }


  setReceiveOperationObj() {
    const operationObj = this.masterPageService.getRouteOperation('/receiving-automation'); // need to change to receiving-automation
    if (operationObj) {
      if (this.router.url === PageUrl.rsAutomationReceiving) {
        this.masterPageService.setTitle(this.operationEnum.inbound);
      } else {
        this.masterPageService.setTitle(operationObj.Title);
      }
      this.masterPageService.setModule(operationObj.Module);
      this.uiData.OperationId = operationObj.OperationId;
      this.uiData.OperCategory = operationObj.Category;
      this.masterPageService.operationObj = operationObj;
      this.appConfig = JSON.parse(localStorage.getItem(this.storageData.appConfig));
      this.controlConfig = JSON.parse(localStorage.getItem(this.storageData.controlConfig));
      this.appErrService.appMessage();
      this.masterPageService.setCardHeader(CommonEnum.automationQueue);
      this.originationOperation = this.masterPageService.originationOperation.subscribe(val => {
        this.deviceOrigination = val;
      });
    }
  }

  // defaulting condition code to USD
  conditionCodeData() {
    this.conditionCodeOptions = [
      { Id: '1', Text: 'USD' }
    ];
    if (this.conditionCodeOptions.length === 1) {
      this.conditionCodeId = this.conditionCodeOptions[0].Id;
      this.conditionCode = this.conditionCodeOptions[0].Text;
    }

    return this.conditionCodeOptions;
  }

  // date configurations
  private dateConfig() {
    this.currentTime = new Date();
    this.minDate = new Date(2000, 0, 1);
    this.maxDate = new Date(this.currentTime.getFullYear(), this.currentTime.getMonth() + 1, 0);
    this.bsConfig = Object.assign({}, {
      minMode: this.minMode,
      dateInputFormat: 'MM/YY',
      containerClass: 'theme-dark-blue'
    });
  }

  // Esn Reprint toggle
  changeESNReprint(val: boolean) {
    this.ESNReprint = val;
  }

  // Change input box
  changeInput(inputControl?: RmtextboxComponent) {
    if (inputControl) {
      inputControl.applyRequired(false);
    }
    this.isClearDisabled = false;
    this.appErrService.clearAlert();
    this.onErroralert = false;
    this.onInfoalert = false;
    if (!this.appService.checkNullOrUndefined(this.rf) && this.rf.valid && this.mfgDateCheck) {
      this.isAddDisabled = false;
    }
  }

  // Input change
  onControllerChange(inputControl) {
    inputControl.applyRequired(false);
    this.appErrService.clearAlert();
    this.onErroralert = false;
    this.onInfoalert = false;
  }

  // Goto Previous Page
  gotoReceiveSearch() {
    // this.location.back();
    this.isCompleteDisabled = true;
    this.router.navigate(['receive-search']);
  }
  gotoReceiptSearch() {
    // this.location.back();
    this.router.navigate(['receipt-search']);
  }

  goBackToSearch() {
    if (!this.appService.checkNullOrUndefined(this.receiptKeyObj)) {
      this.gotoReceiptSearch();
    } else {
      this.gotoReceiveSearch();
    }
  }


  //  loadReceipt from receive-search

  loadReceiptSearch(event?) {
    if (!this.appService.checkNullOrUndefined(this.receiptkey) && this.receiptkey !== '') {
      this.spinner.show();
      this.selectedSKU = '';
      this.unexpectedFlag = false;
      const requestObj = { ClientData: this.clientData, UIData: this.uiData };
      const url = String.Join('/', this.apiConfigService.loadReceiptApi, this.receiptkey.trim());
      this.apiservice.apiPostRequest(url, requestObj)
        .subscribe(response => {
          const res = response.body;
          this.spinner.hide();
          if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
            //  this.receiving.Receipt = new Receipt();
            this.receipt = new Receipt();
            //  this.GetReceiptDetail.Receipt = new Receipt();
            //  this.receiving.Receipt = res.Response;
            this.receipt = res.Response;
            this.receiptkey = res.Response.Receiptkey;
            //  this.GetReceiptDetail.Receipt = this.receiving.Receipt;
            this.receivingService.updatedReceipt = res.Response;
            this.grid = new Grid();
            this.grid.ItemsPerPage = this.appConfig.receiving.griditemsPerPage.receiptDetail;
            this.grid.EditVisible = true;
            this.grid.SearchVisible = this.appConfig.receiving.gridSearchVisible;
            this.receivingService.onDetailPopupJsonGrid(res.Response.ReceiptDetail);
            this.receivingService.ReceiptDetails = this.appService.onGenerateJson(this.receivingService.ReceiptDetailResponse, this.grid);
            const receiptTransGrid = new Grid();
            receiptTransGrid.ItemsPerPage = this.appConfig.receiving.griditemsPerPage.receiptTrans;
            this.receivingService.onReceiptTransGenerateJsonGrid(res.Response.Receipttrans);
            this.receivingService.ReceiptTrans = this.appService.onGenerateJson(this.receivingService.ReceiptTransResponse, receiptTransGrid);
            if (this.appService.checkDevice()) {
              if (!this.unexpectedFlag) {
                this.validateSerialNumber();
              } else {
                this.getReceiptDetail((data) => {
                  if (!this.appService.checkNullOrUndefined(data) && data.Status === this.statusCode.pass) {
                    if (data.Response.ReadyForProcess === CommonEnum.yes) {
                      if (data.StatusMessage !== '') {
                        this.appErrService.setAlert(data.StatusMessage, true, MessageType.info);
                      }
                      this.loadReceivingvalues();
                    }
                    if (!this.appService.checkNullOrUndefined(data.Response.ReceiptDetail.SKU) && data.Response.ReceiptDetail.SKU !== '') {
                      this.selectedSKU = data.Response.ReceiptDetail.SKU;
                      this.getDetermineSKUs();
                    } else {
                      if (data.StatusMessage !== '') {
                        this.appErrService.setAlert(data.StatusMessage, true, MessageType.info);
                      }
                      this.getManufacturerSKU();
                    }
                  } else if (!this.appService.checkNullOrUndefined(data) && data.Status === this.statusCode.fail) {
                    this.appErrService.setAlert(data.ErrorMessage.ErrorDetails, true);
                  }
                });
              }
            }
          } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
            this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
            if (!this.appService.checkDevice()) {
              this.gotoReceiptSearch();
            }
          }
        }, erro => {
          this.appErrService.handleAppError(erro);
        });
    }
  }

  // Search Based Key mobile
  searchInputKey() {
    if (!(this.appService.checkNullOrUndefined(this.serialNumber)) && this.serialNumber !== '') {
      this.spinner.show();
      this.authorizationkey = '';
      // let storerkey = localStorage.getItem('StorerKey');
      const requestObj = { ClientData: this.clientData, UIData: this.uiData };
      const url = String.Join('/', this.apiConfigService.searchKeyUrl, this.serialNumber.trim());
      this.apiservice.apiPostRequest(url, requestObj)
        .subscribe(response => {
          const res = response.body;
          this.spinner.hide();
          if (!this.appService.checkNullOrUndefined(res) && res.Status !== this.statusCode.fail) {
            this.authorizationkey = res.Response[0].Auth_Key;
            if (this.appService.checkNullOrUndefined(this.authorizationkey)) {
              this.editauthorizationkey = false;
            }
            if (!this.appService.checkNullOrUndefined(this.authorizationkey) && this.authorizationkey !== '') {
              this.createReceipt();
            } else {
              this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true, MessageType.info);
              this.validateSerialNumber();
            }
          } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
            this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          }
        }, erro => {
          this.appErrService.handleAppError(erro);
        });
    }
  }

  // To create Receipt object
  createReceipt(event?) {
    if (!this.appService.checkNullOrUndefined(this.authorizationkey) && this.authorizationkey !== '') {
      this.spinner.show();
      this.selectedSKU = '';
      this.unexpectedFlag = false;
      const requestObj = { ClientData: this.clientData, UIData: this.uiData, Authorization: this.authorizationObj };
      const url = String.Join('/', this.apiConfigService.createReceiptUrl, this.authorizationkey.trim());
      this.apiservice.apiPostRequest(url, requestObj)
        .subscribe(response => {
          const res = response.body;
          this.spinner.hide();
          if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
            this.createReceiptSuccessResponse = res;
            const traceData = { traceType: this.traceTypes.rmaNumber, traceValue: this.authorizationkey, uiData: this.uiData };
            const traceResult = this.commonService.findTraceHold(traceData, this.uiData);
            traceResult.subscribe(result => {
              if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.pass) {
                if (this.appService.checkNullOrUndefined(result.Response)) {
                  this.createReceiptSuccess();
                } else {
                  this.canProceed(result, this.traceTypes.rmaNumber);
                }
                this.spinner.hide();
              } else if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.fail) {
                this.spinner.hide();
                this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
              }
            });
          } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
            this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
            if (!this.appService.checkDevice()) {
              this.gotoReceiveSearch();
            }
          }
        }, erro => {
          this.appErrService.handleAppError(erro);
        });
    }
  }



  private createReceiptSuccess(res = this.createReceiptSuccessResponse) {
    //  this.receiving.Receipt = new Receipt();
    this.receipt = new Receipt();
    //  this.GetReceiptDetail.Receipt = new Receipt();
    //  this.receiving.Receipt = res.Response;
    this.receipt = res.Response;
    this.receiptkey = res.Response.Receiptkey;
    //  this.GetReceiptDetail.Receipt = this.receiving.Receipt;
    this.receivingService.updatedReceipt = res.Response;
    this.grid = new Grid();
    this.grid.ItemsPerPage = this.appConfig.receiving.griditemsPerPage.receiptDetail;
    this.grid.EditVisible = true;
    this.grid.SearchVisible = this.appConfig.receiving.gridSearchVisible;
    this.receivingService.onDetailPopupJsonGrid(res.Response.ReceiptDetail);
    this.receivingService.ReceiptDetails = this.appService.onGenerateJson(this.receivingService.ReceiptDetailResponse, this.grid);
    this.receivingService.onReceiptTransGenerateJsonGrid(res.Response.Receipttrans);
    const receiptTransGrid = new Grid();
    receiptTransGrid.ItemsPerPage = this.appConfig.receiving.griditemsPerPage.receiptTrans;
    this.receivingService.ReceiptTrans = this.appService.onGenerateJson(this.receivingService.ReceiptTransResponse, receiptTransGrid);
    if (this.appService.checkDevice()) {
      if (!this.unexpectedFlag) {
        this.validateSerialNumber();
      } else {
        this.getReceiptDetail((data) => {
          if (!this.appService.checkNullOrUndefined(data) && data.Status === this.statusCode.pass) {
            if (data.Response.ReadyForProcess === CommonEnum.yes) {
              if (data.StatusMessage !== '') {
                this.appErrService.setAlert(data.StatusMessage, true, MessageType.info);
              }
              this.loadReceivingvalues();
            }
            if (!this.appService.checkNullOrUndefined(data.Response.ReceiptDetail.SKU) && data.Response.ReceiptDetail.SKU !== '') {
              this.selectedSKU = data.Response.ReceiptDetail.SKU;
              this.getDetermineSKUs();
            } else {
              if (data.StatusMessage !== '') {
                this.appErrService.setAlert(data.StatusMessage, true, MessageType.info);
              }
              this.getManufacturerSKU();
            }
          } else if (!this.appService.checkNullOrUndefined(data) && data.Status === this.statusCode.fail) {
            this.appErrService.setAlert(data.ErrorMessage.ErrorDetails, true);
          }
        });
      }
    }
    this.createReceiptSuccessResponse = null;
  }



  // Serial number logic starts*/

  // Validating Serial Number
  validateSerialNumber() {
    this.unexpectedFlag = false;
    if (!(this.appService.checkNullOrUndefined(this.serialNumber)) && this.serialNumber !== '') {
      this.spinner.show();
      //  this.receiving = new Receiving();
      this.receivingESNMaster = new ReceivingESNMaster();
      //  this.receivingDevice = new ReceivingDevice();
      this.isClearDisabled = false;
      const requestObj = { ClientData: this.clientData, UIData: this.uiData, SKU: this.skuObj, Receipt: this.receipt };
      const url = String.Join('/', this.apiConfigService.validateSerialNumber, this.serialNumber.trim());
      this.apiservice.apiPostRequest(url, requestObj)
        .subscribe(response => {
          const res = response.body;
          if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
            this.validSerialNumberResponse = response.body;
            this.traceFindSerialNumber(this.serialNumber);
          } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
            this.spinner.hide();
            this.onErroralert = true;
            this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
            this.inputSerial.applySelect();
            this.inputSerial.applyRequired(true);
          }
        }, erro => {
          this.inputSerial.applyRequired(true);
        });
    }
  }

  validSerialNumber(res = this.validSerialNumberResponse) {
    if (res) {
      this.skuDisabled = false;
      this.editSerialNumber = true;
      //  this.receiving.ReceivingDevice = res.Response.ReceivingDevice;
      this.receivingDevice = new ReceivingDevice();
      this.receivingDevice = res.Response.ReceivingDevice;
      //  this.receiving.ReceivingDevice.DeviceSKU = this.selectedSKU;
      this.receivingDevice.DeviceSKU = this.selectedSKU;
      this.receivingDevice.ReceiptKey = this.receivingService.updatedReceipt.Receiptkey;
      //  this.receivingDeviceESNMaster.ReceivingDevice= res.Response.ReceivingDevice;
      //  this.GetReceiptDetail.ReceivingDevice  =  res.Response.ReceivingDevice;
      this.receivingESNMaster = res.Response.ReceivingESNMaster;
      this.receivingDevice.SerialNumber = res.Response.ReceivingDevice.SerialNumber;
      this.receivingDevice.CycleNumber = res.Response.ReceivingDevice.CycleNumber;
      if (this.conditionCode) {
        this.receivingDevice.ConditionCode = this.conditionCode;
      }
      if (!this.appService.checkNullOrUndefined(this.deviceOrigination) && this.deviceOrigination !== '') {
        this.receivingDevice.Origination = this.deviceOrigination;
      }
      this.isSerNumDisable = true;
      this.ESNReprintDisabled = false;
      this.isClearDisabled = false;
      if (!this.appService.checkNullOrUndefined(this.inputSerial)) {
        this.inputSerial.disabled = true;
        this.inputSerial.applyRequired(false);
      }
      this.carrierFocus();
      this.getSkuSerialNumber();
      this.validSerialNumberResponse = null;
    }
  }

  private getSkuSerialNumber() {
    const requestObj = { ClientData: this.clientData, ReceivingESNMaster: this.receivingESNMaster, ReceivingDevice: this.receivingDevice, UIData: this.uiData };
    let url = String.Join('/', this.apiConfigService.getSKUBySerialNumberUrl);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          // when type is item lookup (device catlog screen)
          if (res.Response.hasOwnProperty('IsItemLookUpReq') && (res.Response.hasOwnProperty('IsSKULookUpReq'))) {
            if (res.Response.IsItemLookUpReq) {
              if (res.Response.hasOwnProperty(['DeviceCatalogValues']) &&
                !this.appService.checkNullOrUndefined(res.Response.DeviceCatalogValues)) {
                const response = res.Response.DeviceCatalogValues;
                this.masterPageService.openModelPopup(CatalogUtilityComponent, this.largeModalSize, 'dialog-width-xl', {
                  data: {
                    "clientData": this.clientData,
                    "uiData": this.uiData,
                    "catalogValues": response
                  }
                });
                this.masterPageService.dialogRef.componentInstance.emitCatalog.subscribe((value) => {
                  this.masterPageService.hideDialog();
                  this.bindItemLookupData(value);
                });
              }
            }

            // when type is sku lookup
            else if (res.Response.hasOwnProperty('IsSKULookUpReq')) {
              if (res.Response.IsSKULookUpReq) {
                if (res.Response.hasOwnProperty('SKUs') &&
                  !this.appService.checkNullOrUndefined(res.Response.SKUs)) {
                  const response = res.Response.SKUs;
                  if (response.length) {
                    this.masterPageService.openModelPopup(CatalogSkuUtilityComponent, this.largeSkuModalSize, 'dialog-width-xl', {
                      data: {
                        "clientData": this.clientData,
                        "uiData": this.uiData,
                        "catalogValues": response
                      }
                    });
                    this.masterPageService.dialogRef.componentInstance.emitSkuCatalog.subscribe((value) => {
                      this.masterPageService.hideDialog();
                      this.bindSkuLookupData(value);
                    });
                  }
                }
              }
            }
          }
        }
      } else {
        this.spinner.hide();
      }
    });
  }

  // Binding data for item lookup
  bindItemLookupData(value) {
    if (value.hasOwnProperty(['ItemId']) &&
      !this.appService.checkNullOrUndefined(value.ItemId) && value.ItemId !== "") {
      this.receivingDevice['ItemId'] = value.ItemId;
    }
    if (value.hasOwnProperty(['Carrier']) &&
      !this.appService.checkNullOrUndefined(value.Carrier) && value.Carrier !== "") {
      this.carrierId = value.Carrier;
      this.carrier = value.Carrier;
      this.receivingDevice.Carrier = this.carrier;
    }
    if (value.hasOwnProperty(['OEM']) &&
      !this.appService.checkNullOrUndefined(value.OEM) && value.OEM !== "") {
      this.oemId = value.OEM;
      this.oemCode = value.OEM;
      this.receivingDevice.OEM_CD = this.oemCode;
    }
    if (value.hasOwnProperty(['SUSR4']) &&
      !this.appService.checkNullOrUndefined(value.SUSR4) && value.SUSR4 !== "") {
      this.colorId = value.SUSR4;
      this.color = value.SUSR4;
      this.receivingDevice.ColorName = this.color;
    }
    if (value.hasOwnProperty(['ResultantSKU']) &&
      !this.appService.checkNullOrUndefined(value.ResultantSKU) && value.ResultantSKU !== "") {
      this.selectedSKU = value.ResultantSKU;
      this.selectedSKUModel = value.Model;
      this.skuDisabled = true;
      this.skuList = [];
      this.getDetermineSKUs();
    }
    this.bindItemLookupFocus(value);
  }

  // Binding data for sku lookup
  bindSkuLookupData(value) {
    if (value.hasOwnProperty(['Carrier']) &&
      !this.appService.checkNullOrUndefined(value.Carrier) && value.Carrier !== "") {
      this.carrierId = value.Carrier;
      this.carrier = value.Carrier;
      this.receivingDevice.Carrier = this.carrier;
    }
    if (value.hasOwnProperty(['OEM']) &&
      !this.appService.checkNullOrUndefined(value.OEM) && value.OEM !== "") {
      this.oemId = value.OEM;
      this.oemCode = value.OEM;
      this.receivingDevice.OEM_CD = this.oemCode;
    }
    if (value.hasOwnProperty(['SUSR4']) &&
      !this.appService.checkNullOrUndefined(value.SUSR4) && value.SUSR4 !== "") {
      this.colorId = value.SUSR4;
      this.color = value.SUSR4;
      this.receivingDevice.ColorName = this.color;
    }
    if (value.hasOwnProperty(['Sku']) &&
      !this.appService.checkNullOrUndefined(value.Sku) && value.Sku !== "") {
      this.selectedSKUModel = value.Model;
      this.selectedSKU = value.Sku;
      this.skuDisabled = true;
      this.skuList = [];
      this.getDetermineSKUs();
    }
    this.bindSkuLookupFocus(value);
  }

  // Focus on empty value controls
  bindItemLookupFocus(value) {
    if (!value.hasOwnProperty(['Carrier']) ||
      this.appService.checkNullOrUndefined(value.Carrier) || value.Carrier == "") {
      this.carrierFocus();
    } else if (!value.hasOwnProperty(['OEM']) ||
      this.appService.checkNullOrUndefined(value.OEM) || value.OEM == "") {
      this.OEMFocus();
    } else if (!value.hasOwnProperty(['SUSR4']) ||
      this.appService.checkNullOrUndefined(value.SUSR4) || value.SUSR4 == "") {
      this.onColorFocus();
    } else if (!value.hasOwnProperty(['ResultantSKU']) ||
      this.appService.checkNullOrUndefined(value.ResultantSKU) || value.ResultantSKU == "") {
      this.skuFocus();
    } else this.onNotesFocus();
  }

  // Focus on empty value controls
  bindSkuLookupFocus(value) {
    if (!value.hasOwnProperty(['Carrier']) ||
      this.appService.checkNullOrUndefined(value.Carrier) || value.Carrier == "") {
      this.carrierFocus();
    } else if (!value.hasOwnProperty(['OEM']) ||
      this.appService.checkNullOrUndefined(value.OEM) || value.OEM == "") {
      this.OEMFocus();
    } else if (!value.hasOwnProperty(['SUSR4']) ||
      this.appService.checkNullOrUndefined(value.SUSR4) || value.SUSR4 == "") {
      this.onColorFocus();
    } else if (!value.hasOwnProperty(['Sku']) ||
      this.appService.checkNullOrUndefined(value.Sku) || value.Sku == "") {
      this.skuFocus();
    } else this.onNotesFocus();
  }

  private traceFindSerialNumber(serialNumber: any) {
    const traceData = { traceType: this.traceTypes.serialNumber, traceValue: serialNumber, uiData: this.uiData };
    const traceResult = this.commonService.findTraceHold(traceData, this.uiData);
    traceResult.subscribe(result => {
      if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.pass) {
        this.spinner.hide();
        if (this.appService.checkNullOrUndefined(result.Response)) {
          this.validSerialNumber();
        } else {
          this.canProceed(result, this.traceTypes.serialNumber);
        }
      } else if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.fail) {
        this.spinner.hide();
        this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
      }
    });
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
            if (type === this.traceTypes.rmaNumber) {
              this.createReceiptSuccess();
            }
            if (type === this.traceTypes.serialNumber) {
              this.validSerialNumber();
            }
          } else if (returnedData.Response.canProceed === CommonEnum.no) {
            if (type === this.traceTypes.rmaNumber) {
              this.authFocus();
            }
            this.appErrService.setAlert(returnedData.StatusMessage, true);
          }
        }
      });
    }
  }


  getManufacturerSKU() {
    const requestObj = { ClientData: this.clientData, ReceivingDevice: this.receivingDevice, ReceivingESNMaster: this.receivingESNMaster, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getManufacturerSKUUrl);
    this.apiservice.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const res = response.body;
        this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
          // this.receiving.ReceivingDevice = new ReceivingDevice();
          //  this.receiving.ReceivingDevice = res.Response;
          this.receivingDevice = res.Response;
          if (!this.appService.checkNullOrUndefined(res.Response.DeviceSKU) && res.Response.DeviceSKU !== '') {
            this.selectedSKU = res.Response.DeviceSKU;
            this.getDetermineSKUs();
          } else {
            this.editSerialNumber = true;
            this.editauthorizationkey = true;
            this.showSku = true;
            this.skuClear();
            this.skuReset();
            this.skuFocus();
          }
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
          this.editSerialNumber = false;
          this.isSerNumDisable = false;
          this.serialNumberFocus();
          this.clearObjects();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      },
        erro => {
          // this.handleAppError(erro);
          this.appErrService.handleAppError(erro);
        });
  }

  /*Sku logic start */
  // Get Determine skus
  getDetermineSKUs(event?) {
    if (!this.appService.checkNullOrUndefined(this.deviceOrigination) && this.deviceOrigination !== '') {
      this.receivingDevice.Origination = this.deviceOrigination;
    }
    this.onErroralert = false;
    if (!this.appService.checkNullOrUndefined(event)) {
      this.selectedSKU = event.value.toUpperCase().trim();
    }
    if (!this.appService.checkNullOrUndefined(this.selectedSKU) && this.selectedSKU !== '') {
      this.spinner.show();
      const requestObj = { ClientData: this.clientData, ReceivingESNMaster: this.receivingESNMaster, ReceivingDevice: this.receivingDevice, UIData: this.uiData };
      const url = String.Join('/', this.apiConfigService.getDetermineSKUsUrl, encodeURIComponent(encodeURIComponent(this.selectedSKU)));
      this.apiservice.apiPostRequest(url, requestObj)
        .subscribe(response => {
          const res = response.body;
          this.spinner.hide();
          if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
            this.skuList = res.Response.SKUs;
            if (!this.appService.checkNullOrUndefined(this.receivingDevice)) {
              this.receivingDevice.DeviceSKU = this.selectedSKU;
            }
            this.skuObj = res.Response.SKUs[0];
            this.onErroralert = false;
            if (this.skuList.length === 1) {
              this.showSku = false;
              this.SKU = this.skuList[0].Sku;
              this.selectedSKU = this.skuList[0].Sku;
              this.selectedSKUModel = this.skuList[0].Model;
              if (!this.appService.checkNullOrUndefined(this.rmtypeaheadChild)) {
                this.rmtypeaheadChild.skuDisabled = true;
              }
              this.receivingDevice.SKU = this.skuObj;
              this.skuDisabled = true;
              this.getReceiptDetail((data) => {
                if (!this.appService.checkNullOrUndefined(data) && data.Status === this.statusCode.pass) {
                  this.checkReceivingObj(data);
                  if (data.Response.ReceiptDetail) {
                    this.receiptDetail = data.Response.ReceiptDetail;
                  } else {
                    this.receiptDetail = new ReceiptDetail();
                  }
                  if (!this.appService.checkNullOrUndefined(data.Response.ReceiptDetail)) {
                    this.selectedExternLineNo = data.Response.ReceiptDetail.ExternLineno;
                  }
                  this.receivedQuantity = data.Response.ReceivingQuantity;
                  this.isreceivedQuantity = true;
                  // if (data.Response.ReadyForProcess === CommonEnum.yes) {
                  //   if (data.StatusMessage !== '') {
                  //     this.appErrService.setAlert(data.StatusMessage, true, MessageType.info);
                  //   }
                  //   this.loadReceivingvalues();
                  // } else if (data.Response.ReadyForProcess === CommonEnum.no) {
                  //   if (data.StatusMessage !== '') {
                  //     this.appErrService.setAlert(data.StatusMessage, true, MessageType.info);
                  //   }
                  //   // this.serialNumberFocus();
                  // }
                }
                if (!this.appService.checkNullOrUndefined(data) && data.Status === this.statusCode.fail) {
                  this.skuDisabled = false;
                  if (!this.appService.checkNullOrUndefined(this.rmtypeaheadChild)) {
                    this.rmtypeaheadChild.skuDisabled = false;
                    this.rmtypeaheadChild.applySelect();
                  }
                  this.appErrService.setAlert(data.ErrorMessage.ErrorDetails, true);
                }
              });
            } else {
              this.showSku = true;
              this.selectedExternLineNo = '';
              this.skuReset();
              this.skuClear();
              this.skuFocus();
              this.onInfoalert = true;
              if (res.StatusMessage !== '') {
                this.appErrService.setAlert(res.StatusMessage, true);
              }
            }
          }
          if (!this.appService.checkNullOrUndefined(res) && res.Response === true && res.Status === this.statusCode.fail) {
            this.showSku = true;
            this.skuDisabled = false;
            if (!this.appService.checkNullOrUndefined(this.rmtypeaheadChild)) {
              this.rmtypeaheadChild.skuDisabled = false;
              this.rmtypeaheadChild.applySelect();
            }
            this.skuFocus();
            this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true, MessageType.info);
            this.onInfoalert = true;
            if (this.showAutoOrManual) {
              this.isDeviceDdBtnDisabled = false;// to retry or clear
            }
          }
          if (!this.appService.checkNullOrUndefined(res) && res.Response === false && res.Status === this.statusCode.fail) {
            this.editSerialNumber = true;
            this.editauthorizationkey = true;
            this.showSku = true;
            this.skuDisabled = false;
            this.showauthorizationkey = false;
            this.selectedSKUModel = '';
            this.selectedSKU = '';
            this.skuFocus();
            this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          }

        }, erro => {
          //  this.handleAppError(erro);
          this.appErrService.handleAppError(erro);
        });
    } else {
      this.rmtypeaheadChild.applyRequired(true);
    }
  }
  // Get Eligible skus
  getEligibleSKUs(value) {
    if (!this.appService.checkNullOrUndefined(value)) {
      this.onInfoalert = false;
      const skuValue = value.trim().toUpperCase();
      this.selectedSKUModel = '';
      if (value.length >= 3) {
        const requestObj = { ClientData: this.clientData, UIData: this.uiData };
        const url = String.Join('/', this.apiConfigService.getEligibleSKUsUrl, encodeURIComponent(encodeURIComponent(skuValue)));
        this.apiservice.apiPostRequest(url, requestObj)
          .subscribe(response => {
            const res = response.body;
            if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
              this.skuList = res.Response;
              if (!this.appService.checkNullOrUndefined(this.rmtypeaheadChild)) {
                this.rmtypeaheadChild.typeaheadOptionsLimit = this.skuList.length;
              }
              this.onErroralert = false;
              this.appErrService.setAlert('', false);
            } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
              this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
              this.onErroralert = true;
            }
          }, erro => {
            // this.handleAppError(erro);
            this.appErrService.handleAppError(erro);
          });
      } else {
        this.skuList = [];
      }
    } else {
      this.skuList = [];
    }
  }

  // getReceiptDetail
  getReceiptDetail(callback: (data) => void, fromValidSerialNumber = false) {
    this.spinner.show();
    //  this.GetReceiptDetail.ClientData = this.clientData;
    const requestObj = { ClientData: this.clientData, Receipt: this.receipt, ReceivingDevice: this.receivingDevice, ReceiptDetail: this.receiptDetail, SKU: this.skuObj, UIData: this.uiData };
    return this.apiservice.apiPostRequest(this.apiConfigService.getReceiptDetailUrl, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (!fromValidSerialNumber) {
          this.spinner.hide();
        }
        callback(res);
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }

  // coming from receipt detail popup
  editReceiptDetails(event) {
    this.clearReceiptLine();
    // this.GetReceiptDetail.ReceiptDetail = event;
    this.receiptDetail = event;
    this.selectedExternLineNo = event.ExternLineno;
    this.SKU = event.SKU;
    this.selectedSKU = event.SKU;
    if (!this.appService.checkNullOrUndefined(this.rmtypeaheadChild)) {
      this.rmtypeaheadChild.SKU = event.SKU;
      this.rmtypeaheadChild.selectedSKU = event.SKU;
    }
    // this.setConditionCode(event.ConditionCode);
    this.isreceivedQuantity = true;
    this.getDetermineSKUs();
    this.dialogRef.close();
    this.appErrService.clearAlert();
  }

  // Emiting from rmtypehead after selecting option
  typeaheadResponse(event) {
    this.selectedSKUModel = event.item.Model;
    this.selectedSKU = event.item.Sku;
    this.skuDisabled = true;
    this.skuList = [];
    this.getDetermineSKUs();
  }

  setAttributeValues() {
    if (!this.appService.checkNullOrUndefined(this.attributesCtrl)) {
      Object.keys(this.attributesCtrl.control.controls).forEach(element => {
        if (this.attributesCtrl.control.controls[element].value instanceof Date) {
          this.SnAttributes[element] = this.datepipe.transform(this.attributesCtrl.control.controls[element].value, 'MM/yy');
        } else {
          this.SnAttributes[element] = this.attributesCtrl.control.controls[element].value;
        }
      });
      this.receivingDevice.SnAttributes = this.SnAttributes;
    }
  }


  // SKU reset
  skuReset() {
    this.skuDisabled = false;
    this.skuFocus();
    this.skuList = [];
    this.selectedSKUModel = '';
    this.selectedSKU = '';
    this.receivedQuantity = '';
    this.isreceivedQuantity = false;
  }

  // SKU control clear
  skuClear() {
    if (!this.appService.checkNullOrUndefined(this.rmtypeaheadChild)) {
      this.rmtypeaheadChild.SKU = '';
      this.rmtypeaheadChild.selectedSKU = '';
      this.rmtypeaheadChild.skuDisabled = true;
      this.rmtypeaheadChild.selectedSKUModel = '';
      this.SKU = '';
      this.selectedSKU = '';
      this.skuDisabled = true;
      this.selectedSKUModel = '';
    }
  }
  /*SKU logic end*/

  /*Calling loadreceivingvalues,processDevice,loadReceivingProgramValues,getRoute,getTransactions logic start */

  // Load receiving values
  loadReceivingvalues() {
    this.spinner.show();
    this.receivingDevice.DeviceSKU = (!this.appService.checkNullOrUndefined(this.SKU) && this.SKU !== '') ? this.SKU : this.selectedSKU;
    this.receivingDevice.ModelName = this.selectedSKUModel;
    this.receivingDevice.Clientid = localStorage.getItem(this.storageData.clientId);
    this.receivingDevice.Location = localStorage.getItem(this.storageData.location);
    this.receivingDevice.Step = this.masterPageService.operation;
    const requestObj = { ClientData: this.clientData, ReceivingDevice: this.receivingDevice, ReceivingESNMaster: this.receivingESNMaster, UIData: this.uiData, ReceiptDetail: this.receiptDetail, Receipt: this.receipt };
    const url = String.Join('/', this.apiConfigService.loadReceivingvalues);
    this.apiservice.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
          this.receivingDevice = res.Response;
          this.processDevice();
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          this.onErroralert = true;
        }
      }, erro => {
        // this.handleAppError(erro);
        this.appErrService.handleAppError(erro);
      });
  }

  // Process device
  processDevice() {
    this.receivingService.updatedReceipt.ExternReceiptkey = this.authorizationkey;
    //  this.receiving.Receipt = this.receivingService.updatedReceipt;
    this.receipt = this.receivingService.updatedReceipt;
    //  this.receiving.ClientData = this.clientData;
    const requestObj = { ClientData: this.clientData, ReceivingDevice: this.receivingDevice, Receipt: this.receipt, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.processDeviceUrl);
    this.apiservice.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
          this.receipt = res.Response.Receipt;
          this.receivingDevice = res.Response.ReceivingDevice;
          if (res.Response.ReceivingDevice.ProgramName !== '') {
            this.loadReceivingProgramValues();
          } else {
            this.getRoute();
          }
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          this.onErroralert = true;
        }
      }, erro => {
        // this.handleAppError(erro);
        this.appErrService.handleAppError(erro);
      });
  }

  // Load program values
  loadReceivingProgramValues() {
    const requestObj = { ClientData: this.clientData, ReceivingDevice: this.receivingDevice, Receipt: this.receipt, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.loadReceivingProgramValuesUrl, this.receivingDevice.ProgramName, this.masterPageService.operation);
    //  this.apiservice.apiPostRequest(url, this.receiving)
    this.apiservice.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
          this.receipt = res.Response.Receipt;
          this.receivingDevice = res.Response.ReceivingDevice;
          this.getRoute();
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          this.onErroralert = true;
        }
      }, erro => {
        //  this.handleAppError(erro);
        this.appErrService.handleAppError(erro);
      });
  }

  // Getroute
  getRoute() {
    //  let requestObj = { ClientData: this.clientData, Device: this.receiving.ReceivingDevice };
    const requestObj = { ClientData: this.clientData, Device: this.receivingDevice, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getRouteUrl);
    this.apiservice.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
          //  this.receiving.ReceivingDevice = res.Response;
          this.receivingDevice = res.Response;
          this.getTransactions();
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          this.onErroralert = true;
        }
      }, erro => {
        // this.handleAppError(erro);
        this.appErrService.handleAppError(erro);
      });
  }

  // Get transactions
  getTransactions() {
    //  let requestObj = { ClientData: this.clientData, Device: this.receiving.ReceivingDevice };
    const requestObj = { ClientData: this.clientData, Device: this.receivingDevice, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getTransaction);
    this.apiservice.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const res = response.body;
        this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
          res.Response.Trans.map((val) => val.Result = 'PASS');
          this.showEsn = true;
          this.showSuggestedContainer = true;
          this.listofTransactions = res.Response;
          this.isContainerDisabled = false;
          this.isSNPrintDisabled = false;
          this.isClearContainerDisabled = false;
          this.configContainerProperties();
          this.containerFocus();
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
          this.showSku = true;
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          this.onErroralert = true;
        }
      }, erro => {
        // this.handleAppError(erro);
        this.appErrService.handleAppError(erro);
      });
  }
  /*Calling loadreceivingvalues,processDevice,loadReceivingProgramValues,getRoute,getTransactions logic end*/

  /*Container suggestion business control emiting methods start*/

  // GetSuggestContainer sending receive device to child conatiner
  getSuggestContainer(value) {
    this.containerFocus();
    if (this.appService.checkNullOrUndefined(value)) {
      this.isContainerDisabled = false;
      this.configContainerProperties();
      //  this.childContainer.getSuggestContainer(this.receiving.ReceivingDevice);
      this.childContainer.getSuggestContainer(this.receivingDevice);
    } else {
      this.clearContainerID();
      this.configContainerProperties();
      // this.childContainer.getSuggestContainer(this.receiving.ReceivingDevice);
      this.childContainer.getSuggestContainer(this.receivingDevice);
    }
  }

  // GetSuggestContainer Response
  getSuggestContainerResponse(response) {
    this.showAdd = false;
    this.container = response;
    if (!this.appService.checkNullOrUndefined(response.ContainerID) && response.ContainerID !== '') {
      this.islpnContainerPrintDisabled = false;
      //  let requestObj = { ClientData: this.clientData, Device: this.receivingDevice, Container: this.container };
      //  this.createLabel(requestObj);
    }
    this.receivingDevice.ContainerCycle = response.ContainerCycle;
  }

  // ValidateContainer and sending updated device to child validateContainer
  validateContainer(response) {
    this.receivingDevice.ContainerID = response.ContainerID;
    this.receivingDevice.ContainerCycle = response.ContainerCycle;
    this.childContainer.validateContainer(this.receivingDevice);
  }

  // Validate container response
  validateContainerResponse(response) {
    if (!this.appService.checkNullOrUndefined(response)) {
      this.container = response;
      this.isContainerValid = true;
      this.showAdd = true;
      this.receivingDevice.ContainerCycle = response.ContainerCycle;
      this.receivingDevice.ContainerID = response.ContainerID;
      if (!this.appService.checkNullOrUndefined(this.rf) && this.rf.valid) {
        this.mfgDateCheck = true;
      }
      if (this.appService.checkDevice()) {
        //  this.printLabel();
        this.isAddDisabled = false;
        // this.addSerialNumber();  // need to remove after discussion
        this.addAutoSerialNumber();
      }
      if (!this.appService.checkNullOrUndefined(this.rf) && this.rf.valid) {
        //  this.printLabel();
        this.isAddDisabled = false;
        //  this.addSerialNumber();  // lpn not suggested  // need to remove after discussion
        this.addAutoSerialNumber();
      }
    } else {
      if (this.appService.checkDevice()) {
        // this.printLabel();
        // this.addSerialNumber(); // need to remove after discussion
        this.addAutoSerialNumber();
      }
      if (!this.appService.checkNullOrUndefined(this.rf) && this.rf.valid) {
        // this.printLabel();
        //  this.addSerialNumber();  // need to remove after discussion
        this.addAutoSerialNumber();
      }
    }
  }

  // input match
  checkContainer(container) {
    if (!this.appService.checkNullOrUndefined(container)) {
      this.showAdd = true;
      this.isAddDisabled = false;
      this.mfgDateCheck = true;
      this.receivingDevice.ContainerID = container.ContainerID;
      this.receivingDevice.ContainerCycle = container.ContainerCycle;
      if (!this.appService.checkNullOrUndefined(this.deviceOrigination) && this.deviceOrigination !== '') {
        this.receivingDevice.Origination = this.deviceOrigination;
      }
    } else {
      this.isAddDisabled = true;
      this.mfgDateCheck = false;
    }
  }
  // Configure the child container properties
  configContainerProperties() {
    if (!this.appService.checkNullOrUndefined(this.childContainer)) {
      this.childContainer.isContainerDisabled = false;
      this.childContainer.isClearContainerDisabled = false;
    }
  }

  // Clear container ID
  clearContainerID() {
    this.mfgDateCheck = false;
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
  /*Container suggestion business control emiting methods end*/

  //  printLabel() {
  //    if (!this.isAddDisabled && !this.appService.checkNullOrUndefined(this.rf)  && this.rf.valid ) {
  //      this.setAttributeValues();
  //      this.receiveSerialNumbder();
  //    }
  //    else if(this.appService.checkDevice() && this.isAddDisabled ){
  //      this.receiveSerialNumbder();
  //    }
  //  }

  //  receiveSerialNumbder(){
  //    let requestObj = { ClientData: this.clientData, ReceivingDevice: this.receivingDevice, Container: this.container };
  //      this.createLabel(requestObj);
  //      this.addSerialNumber();
  //  }


  /* Add serial number logic start */

  // Add SerialNumber
  addSerialNumber() {
    if (this.isAddDisabled === false) {
      this.spinner.show();
      this.receivingDevice.ReprintLabel = this.ESNReprint === true ? CommonEnum.yes : CommonEnum.no;
      const isMobile = this.appService.checkDevice();
      this.setAttributeValues();
      const requestObj = { ClientData: this.clientData, ReceivingDevice: this.receivingDevice, Receipt: this.receipt, Container: this.container, UIData: this.uiData };
      const url = String.Join('/', this.apiConfigService.addSerialNumberUrl, isMobile.toString(), this.selectedExternLineNo);

      this.apiservice.apiPostRequest(url, requestObj)
        .subscribe(response => {
          const res = response.body;
          if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
            this.snackbar.success(res.StatusMessage);
            this.receipt = new Receipt();
            this.receipt = res.Response.Receipt;
            this.receivingService.updatedReceipt = res.Response.Receipt;
            this.receivingDevice = res.Response.ReceivingDevice;
            this.receivingService.onDetailPopupJsonGrid(res.Response.Receipt.ReceiptDetail);
            this.receivingService.ReceiptDetails = this.appService.onGenerateJson(this.receivingService.ReceiptDetailResponse, this.grid);
            this.ESNReprint = false;
            // this.authorizationkey = '';
            this.saveTransaction();
            this.updateLottables();
            this.Clear();
          } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
            this.spinner.hide();
            this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
            this.onErroralert = true;
          }
        }, erro => {
          // this.handleAppError(erro);
          this.appErrService.handleAppError(erro);
        });
    }

  }
  updateLottables() {
    this.spinner.show();
    this.lottableTrans = new LottableTrans();
    const headerobj = Object.keys(this.lottableTrans);
    headerobj.forEach(res => {
      if (res) {
        this.lottableTrans[res] = this.receiptDetail[res];
      }
    });
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, Device: this.receivingDevice, LottableTrans: this.lottableTrans };
    this.apiservice.apiPostRequest(this.apiConfigService.updateLottables, requestObj)
      .subscribe(response => {
        const res = response.body;
        this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
          if (res.Response.Receipts && res.Response.Receipts.Receipttrans) {
            const transGrid = new Grid();
            transGrid.ItemsPerPage = this.appConfig.receiving.griditemsPerPage.receiptTrans;
            this.receivingService.onReceiptTransGenerateJsonGrid(res.Response.Receipts.Receipttrans);
            this.receivingService.ReceiptTrans = this.appService.onGenerateJson(this.receivingService.ReceiptTransResponse, transGrid);
          }
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        //  this.handleAppError(erro);
        this.appErrService.handleAppError(erro);
      });

  }
  // Post Receipt
  postReceipt() {
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, Receipt: this.receipt, UIData: this.uiData };
    this.apiservice.apiPostRequest(this.apiConfigService.receiptPostUrl, requestObj)
      .subscribe(response => {
        const res = response.body;
        this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
          const postUrl = String.Join('/', this.apiConfigService.postRecUpdateProcess);
          this.commonService.postUpdateProcess(postUrl, requestObj);
          this.snackbar.success(res.Response);
          this.receipt = new Receipt();
          this.gotoReceiveSearch();
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        //  this.handleAppError(erro);
        this.appErrService.handleAppError(erro);
      });
  }




  // Receipt clear
  receiptClear() {
    if (!this.appService.checkNullOrUndefined(this.receiptkey) && this.receiptkey !== '') {
      this.spinner.show();
      const requestObj = { ClientData: this.clientData, UIData: this.uiData };
      const url = String.Join('/', this.apiConfigService.receiptClearUrl, this.receiptkey);
      this.apiservice.apiPostRequest(url, requestObj)
        .subscribe(response => {
          const res = response.body;
          this.spinner.hide();
          if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
            this.receipt = new Receipt();
            this.dialogRef.close();
            this.snackbar.success(res.Response);
            this.gotoReceiveSearch();
          } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
            this.dialogRef.close();
            this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          }
        }, erro => {
          // this.handleAppError(erro);
          this.appErrService.handleAppError(erro);
        }
        );
    }
  }

  // Save transactions after add serial number
  saveTransaction() {
    const requestObj = { ClientData: this.clientData, Transactions: this.listofTransactions, UIData: this.uiData, Device: this.receivingDevice, TestResultDetails: {} };
    const url = String.Join('/', this.apiConfigService.saveTransaction);
    this.apiservice.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const res = response.body;
        this.clearObjects();
        if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          this.onErroralert = true;
        }
      }, erro => {
        // this.handleAppError(erro);
        this.appErrService.handleAppError(erro);
      });
  }
  /* Add serial number logic start */


  /* Focus on controls*/

  // Serial number focus
  serialNumberFocus() {
    this.appService.setFocus('serialNumber');
  }

  // Authorization focus
  authFocus() {
    this.appService.setFocus('inputAuthorization');
  }

  // SKU focus
  skuFocus() {
    if (!this.skuDisabled) {
      this.appService.setFocus('skuInputid');
    }
  }
  // Container suggestion focus
  containerFocus() {
    this.appService.setFocus('containerInputId');
  }

  portIdFocus() {
    this.appService.setFocus('automationPortId');
  }

  attributeFocus() {
    this.appService.setFocus(this.controlConfig.attribute1.Id);
  }

  /* Focus on controls ends*/

  /* Clearing the controls */
  Clear() {
    this.onErroralert = false;
    this.onInfoalert = false;
    this.appErrService.setAlert('', false);
    this.clearReceiptLine();
    this.ESNReprint = false;
    this.isSerNumDisable = false;
    this.isClearDisabled = true;
    this.isContainerDisabled = true;
    this.isSNPrintDisabled = true;
    this.islpnContainerPrintDisabled = true;
    this.isreceivedQuantity = false;
    this.isAddDisabled = true;
    this.skuClear();
    this.clearContainerID();
    this.clearConditionCode();
    this.ESNReprintDisabled = true;
    this.isAuthorizationDisable = true;
    this.attribute1 = '';
    this.attribute2 = '';
    this.attribute3 = '';
    // this.attribute5 = '';
    this.selectedExternLineNo = '';
    this.isDeviceProcesStepDone = false;
    this.isSruveyStepDone = false;
    this.clearEditmode();
    if (!this.appService.checkDevice()) {
      //  this.appService.setFocus(this.focusId);
    } else {
      this.authorizationkey = '';
      this.serialNumberFocus();
    }
    this.surveyResponse = null;
    this.surveyService.surveyResponse = null;
    this.clearObjects();
    if (!this.appService.checkNullOrUndefined(this.attributesCtrl) && Object.keys(this.attributesCtrl.control.controls).length) {
      this.appService.applyRequired(false, 'attribute1');
    }
  }

  // From Badges to TextBox Controlls
  clearEditmode() {
    this.showauthorizationkey = false;
    this.showSku = false;
    this.showEsn = false;
    this.showSuggestedContainer = false;
    this.showAdd = false;
    this.editSerialNumber = false;
    this.editauthorizationkey = false;
  }
  // Receive Desktop



  changeConditionCode(event: any) {
    this.conditionCodeId = event.value;
    this.conditionCode = event.source.selected.viewValue;
    this.receivingDevice.ConditionCode = this.conditionCode;
    this.skuFocus();
  }

  clearConditionCode() {
    if (this.conditionCodeOptions && this.conditionCodeOptions.length > 1) {
      this.conditionCodeId = this.conditionCodeOptions[-1];
      this.conditionCode = '';
      this.receivingDevice.ConditionCode = this.conditionCode;
    }
  }

  clearReceiptLine() {
    this.serialNumber = '';
    if (!this.appService.checkNullOrUndefined(this.inputSerial)) {
      this.inputSerial.disabled = false;
    }
    this.SKU = '';
    this.selectedSKUModel = '';
    this.receivedQuantity = '';
    this.carrier = '';
    this.carrierId = '';
    this.oemCode = '';
    this.oemId = '';
    this.color = '';
    this.receiptNotes = '';
    this.colorId = '';
    this.isDeviceEnableDynamicBtn = true;
    this.isDeviceDdBtnDisabled = true;
    this.isDeviceAndSurveyDone = false;
    this.disableReciptLine(false);
    this.stepper.selectedIndex = 0;
    if (!this.appService.checkNullOrUndefined(this.deviceDdBtn)) {
      this.deviceDdBtn.selectedBtnOption = '';
    }
    this.receivingDevice = new ReceivingDevice();
    this.clearContainerID();
  }

  setConditionCode(val) {
    if (val !== '') {
      const condtionCodeResult = this.conditionCodeOptions.find((code, i) => {
        if (code.Text === val) {
          return code;
        }
      });
      this.conditionCodeId = condtionCodeResult.Id;
      this.conditionCode = condtionCodeResult.Text;
    } else {
      this.conditionCode = val;
    }
  }

  //  Modal Popup
  openModal(template: TemplateRef<any>, status: any, modalclass: any) {
    this.dialogRef = this.dialog.open(template, { hasBackdrop: true, disableClose: true, panelClass: modalclass })
    this.utilityTitle = status;
    if (this.utilityTitle === 'receiptdetails') {
      this.modeltitle = 'Receipt Details';
    }
    if (this.utilityTitle === 'serialnumberrecover') {
      this.modeltitle = 'Recover Serial Number';
    }
    if (this.utilityTitle === 'confirmDelete') {
      this.modeltitle = 'Confirm Delete';
    }
  }

  serialNumberPrint() {
    this.receivingDevice.ReprintLabel = CommonEnum.yes;
    const requestObj = { ClientData: this.clientData, ReceivingDevice: this.receivingDevice, UIData: this.uiData };
    this.createLabel(requestObj);
  }

  lpnContainerPrint() {
    this.setAttributeValues();
    const requestObj = { ClientData: this.clientData, ReceivingDevice: this.receivingDevice, Container: this.container, UIData: this.uiData };
    this.createLabel(requestObj);
  }

  // CreateLabel
  createLabel(requestObj) {
    this.spinner.show();
    // let operation = this.receivingDevice.Step;
    const url = String.Join('/', this.apiConfigService.receivecreateLabelUrl, this.masterPageService.operation);
    this.apiservice.apiPostRequest(url, requestObj)
      .subscribe(res => {
        this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }

  //#region getParentId
  onAutoOrManualChange() {
    this.isAutoOrManual = !this.isAutoOrManual;
    this.parentId = '';
    this.isNextDisabled = true;
    this.Clear();
    this.setFieldsProperties(this.isAutoOrManual);
    this.clearAutomationForm();
  }

  // set controls and properties on auto/manula toggle change
  setFieldsProperties(isAutoOrManual) {
    this.isParentSection = !isAutoOrManual;
    if (isAutoOrManual) {
      this.getVendorDevice();
    } else {
      this.isDeviceDetected = false;
      if (this.deviceStopPolling) {
        this.deviceStopPolling.next(null);
      }
    }
  }

  // enabling next button if both deviceid and portid
  changePortIdInput() {
    if (this.showAutoOrManual) {
      if (this.deviceId && this.isAutoOrManual) {
        this.isNextDisabled = false;
      }
    } else {
      if (this.deviceId) {
        this.isNextDisabled = false;
      }
    }
  }

  // carrier dropdown on change event
  changeCarrier(event) {
    this.carrier = event.value;
    this.carrierId = event.value;
    this.receivingDevice.Carrier = this.carrier;
    this.appErrService.clearAlert();
    this.OEMFocus();
  }

  OEMFocus() {
    this.appService.setFocus('oem');
  }

  // OEM code drodown on change event
  changeOEMCode(event) {
    this.oemCode = event.value;
    this.oemId = event.value;
    this.receivingDevice.OEM_CD = this.oemCode;
    this.appErrService.clearAlert();
    this.onQtyFocus();
  }

  onQtyFocus() {
    this.appService.setFocus('receivedQuantity');
  }

  onColorFocus() {
    this.appService.setFocus('color');
  }

  onNotesFocus() {
    this.appService.setFocus('recNotes');
  }

  // color dropdown on change event
  changeColor(event) {
    this.color = event.value;
    this.colorId = event.value;
    this.receivingDevice.ColorName = this.color;
    this.appErrService.clearAlert();
    if (this.conditionCode) {
      this.skuFocus();
    } else {
      this.conditionCodeFocus();
    }
  }

  conditionCodeFocus() {
    this.appService.setFocus('conditionCode');
  }

  changeDeviceInput() {
    if (this.deviceId) {
      this.isSearchDeviceIdDisabled = false;
    } else {
      this.isSearchDeviceIdDisabled = true;
    }
  }

  parentDdBtnResponse(event) {
    this.isParentEnableDynamicBtn = false;
    if (event == CommonEnum.start) {
      this.isPortIdDisabled = false;
    } else {
      this.isPortIdDisabled = true;
      if (this.oldportId) {
        this.automationPortId = this.oldportId;
      }
    }
  }

  deviceDdBtnResponse() {
    this.isDeviceEnableDynamicBtn = false;
  }

  // device level dynamic button
  parentDynamic(event) {
    this.isTimedOutDevice = false;
    if (event === CommonEnum.start) {
      this.startDetection(event);
    } else {
      this.unAssignPort(event === CommonEnum.manual ? 'Y' : 'N');
    }
  }

  // device level dynamic button
  deviceDynamic(event) {
    if (event === CommonEnum.retry) {
      this.getDetermineSKUs();
    }
    if (event === CommonEnum.autoClear) {
      this.unAssignPort();
      this.getVendorDevice();
    }
  }

  getParentID() {
    const containerObj = JSON.parse(localStorage.getItem('a-containerObj'));
    const trknbrObj = JSON.parse(localStorage.getItem('a-trackingNubmerObj'));
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, Container: containerObj, TrackingNumber: trknbrObj };
    const url = String.Join('/', this.apiConfigService.getParentIdUrl, this.authorizationkey.trim());
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          this.parentId = res.Response.ContainerID;
        }
      }
    });
  }

  //#region parent section api's
  //on start
  startDetection(start?) {
    if (this.deviceId && this.automationPortId && this.parentId) {
      this.spinner.show();
      const requestObj = { ClientData: this.clientData, UIData: this.uiData };
      const url = String.Join(
        '/',
        this.apiConfigService.startDetectionUrl,
        this.deviceId,
        this.automationPortId,
        this.parentId
      );
      this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
        if (statusFlag) {
          this.spinner.hide();
          if (!this.appService.checkNullOrUndefined(res.Response)) {
            this.clearAutomationForm();
            if (!start) {
              this.isCompleteDisabled = false;
            }
            if (this.queueRecords.length === 0) {
              this.getQueueRecords();
            }
          }
        }
      });
    }
  }

  //turnoff LED on clear
  turnOffPortLED() {
    if (this.deviceId && this.showAutoOrManual && !this.isAutoOrManual) {
      this.spinner.show();
      const requestObj = { ClientData: this.clientData, UIData: this.uiData };
      const url = String.Join(
        '/',
        this.apiConfigService.turnOffPortLEDUrl,
        this.deviceId
      );
      this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
        if (statusFlag) {
          this.spinner.hide();
          if (!this.appService.checkNullOrUndefined(res.Response)) {
          }
        }
      });
    }
  }
  //#endregion

  // after scanning all the devices
  completePortIdValidation() {
    if (this.parentId) {
      this.isCompleteDisabled = true;
      this.spinner.show();
      const requestObj = { ClientData: this.clientData, UIData: this.uiData };
      const url = String.Join('/', this.apiConfigService.completePortIdValidationUrl, this.parentId);
      this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
        if (statusFlag) {
          this.spinner.hide();
          if (!this.appService.checkNullOrUndefined(res.Response)) {
            this.gotoReceiveSearch();
          }
        } else {
          this.isCompleteDisabled = false;
        }
      });
    }
  }

  // unassignPort
  unAssignPort(isManual?) {
    if (this.deviceId && this.automationPortId) {
      this.spinner.show();
      this.isParentEnableDynamicBtn = true;
      const requestObj = { ClientData: this.clientData, UIData: this.uiData };
      const url = String.Join(
        '/',
        this.apiConfigService.unAssignPortUrl,
        this.deviceId,
        this.automationPortId,
        isManual
      );
      this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
        this.spinner.hide();
        if (statusFlag) {
          if (!this.appService.checkNullOrUndefined(res.Response)) {
            this.snackbar.success(res.Response);
            this.clearAutomationForm();
          }
        } else {
          this.isParentEnableDynamicBtn = false;
        }
      });
    }
  }

  // generating uid
  generateUID() {
    this.isGenerateUIdDisabled = true;
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    this.commonService.commonApiCall(this.apiConfigService.generateUIDUrl, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          this.deviceId = res.Response;
          this.portIdFocus();
        }
      } else {
        this.isGenerateUIdDisabled = false;
      }
    });
  }

  // polling
  getQueueRecords() {
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    timer(1, 3000).pipe(
      startWith(0),
      switchMap(() => this.apiservice.apiPostRequest(this.apiConfigService.getQueueRecordsUrl, requestObj)),
      takeUntil(this.stopPolling)
    ).subscribe(res => {
      const result = res.body;
      if (!this.appService.checkNullOrUndefined(result.Response) && result.Status === this.statusCode.pass) {
        if (result.Response.hasOwnProperty('QueueRecords') && result.Response.QueueRecords.length > 0) {
          this.grid = new Grid();
          this.grid.ItemsPerPage = this.appConfig.receiving.griditemsPerPage.automation;
          this.grid.EditVisible = false;
          this.grid.SearchVisible = false;
          this.queueRecords = result.Response.QueueRecords;
          this.masterPageService.tempQueList = this.appService.onGenerateJson(result.Response.QueueRecords, this.grid);
        }
      } else if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.fail) {
        this.spinner.hide();
        this.stopPolling.next(null);
      }
    }, error => {
      this.appErrService.handleAppError(error);
    });
  }

  // getVendorDevice
  getVendorDevice() {
    this.spinner.show();
    this.isDeviceDetected = true;
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    timer(1, 3000).pipe(
      startWith(0),
      switchMap(() => this.apiservice.apiPostRequest(this.apiConfigService.getVendorDeviceUrl, requestObj)),
      takeUntil(this.deviceStopPolling)
    ).subscribe(res => {

      const result = res.body;
      this.spinner.hide();
      if (!this.appService.checkNullOrUndefined(result.Response) && result.Status === this.statusCode.pass) {
        const objKeys = Object.keys(result.Response);
        if (objKeys.length > 0) {
          this.deviceStopPolling.next(null);
          this.vendorDevice = new VendorDevice();
          this.receipt = new Receipt();
          this.receivingDevice = new ReceivingDevice();
          this.isDeviceDetected = false;
          this.receivingDevice = result.Response.ReceivingDevice;
          this.receipt = result.Response.Receipt;
          this.receivingService.updatedReceipt = result.Response.Receipt;
          this.vendorDevice = result.Response.VendorDevice;
          this.deviceId = this.vendorDevice.UID;
          this.automationPortId = this.vendorDevice.PortId;
          this.traceFindSerialNumber(this.vendorDevice.SerialNumber);
          this.serialNumber = this.vendorDevice.SerialNumber;
          this.parentId = result.Response.VendorDevice.ParentId;
          this.isSerNumDisable = true;
          this.isGenerateUIdBtn = false;
          this.isPortIdDisabled = true;
          this.getPopulatedSku(this.vendorDevice.SKUs);
          this.getConditionCodes(this.vendorDevice.Conditions);
          this.receivedQuantity = this.vendorDevice.Size;
          this.populateColorOptions(this.vendorDevice.Colors);
          this.poplateCarriers(this.vendorDevice.Carriers);
          this.poplateOEMCodes(this.vendorDevice.OEMS);
        }
      } else if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.fail) {

        this.parentId = '';
        this.receipt = new Receipt();
        this.receivingService.updatedReceipt = new Receipt();
        // this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
      }
    }, error => {
      this.appErrService.handleAppError(error);
    });
  }

  // Get Color Carrier OEMCodes
  GetColorCarrierOEMCodes() {
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    this.commonService.commonApiCall(this.apiConfigService.getColorCarrierOEMCodesUrl, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          this.populateColorOptions(res.Response.Colors);
          this.poplateCarriers(res.Response.Carriers);
          this.poplateOEMCodes(res.Response.OEMCodes);
        }
      }
    });
  }

  // populate sku
  getPopulatedSku(skuList) {
    this.skuList = skuList;
    this.skuObj = new SKU();
    if (!this.appService.checkNullOrUndefined(skuList) && skuList.length === 1) {
      this.skuDisabled = true;
      this.skuObj = skuList[0];
      this.selectedSKU = skuList[0].Sku;
      this.SKU = skuList[0].Sku;
      this.selectedSKUModel = skuList[0].Model;
      if (!this.appService.checkNullOrUndefined(this.rmtypeaheadChild)) {
        this.rmtypeaheadChild.skuDisabled = true;
      }
      this.getReceiptDetail((data) => {
        if (!this.appService.checkNullOrUndefined(data) && data.Status === this.statusCode.pass) {
          this.checkReceivingObj(data);
          if (data.Response.ReceiptDetail) {
            this.receiptDetail = data.Response.ReceiptDetail;
          } else {
            this.receiptDetail = new ReceiptDetail();
          }
          if (!this.appService.checkNullOrUndefined(data.Response.ReceiptDetail)) {
            this.selectedExternLineNo = data.Response.ReceiptDetail.ExternLineno;
          }
          this.receivedQuantity = data.Response.ReceivingQuantity;
          this.isreceivedQuantity = true;
        }
        if (!this.appService.checkNullOrUndefined(data) && data.Status === this.statusCode.fail) {
          this.skuDisabled = false;
          if (!this.appService.checkNullOrUndefined(this.rmtypeaheadChild)) {
            this.rmtypeaheadChild.skuDisabled = false;
            this.rmtypeaheadChild.applySelect();
          }
          this.appErrService.setAlert(data.ErrorMessage.ErrorDetails, true);
        }
      });
    }
    this.spinner.hide();
  }

  private checkReceivingObj(data) {
    if (data.Response.hasOwnProperty('ReceivingDevice') && data.Response.ReceivingDevice) {
      this.receivingDevice = data.Response.ReceivingDevice
    }
  }
  // populate conditions for automation mode
  getConditionCodes(conditions) {
    this.conditionCodeOptions = [];
    if (!this.appService.checkNullOrUndefined(conditions) && conditions.length) {
      conditions.forEach(element => {
        const dd: dropdown = new dropdown();
        dd.Id = element;
        dd.Text = element;
        this.conditionCodeOptions.push(dd);
      });
      if (conditions.length === 1) {
        this.conditionCodeId = conditions[0];
        this.conditionCode = conditions[0];
      }
    }
  }

  // populate Color dropddown
  populateColorOptions(colorOptions) {
    this.colorOptions = [];
    if (!this.appService.checkNullOrUndefined(colorOptions) && colorOptions.length) {
      colorOptions.forEach(element => {
        const dd: dropdown = new dropdown();
        dd.Id = element;
        dd.Text = element;
        this.colorOptions.push(dd);
      });
      if (colorOptions.length === 1) {
        this.colorId = colorOptions[0];
        this.color = colorOptions[0];
      }
    }
  }

  // populate carrier
  poplateCarriers(carrierOptions) {
    this.carrierOptions = [];
    if (!this.appService.checkNullOrUndefined(carrierOptions) && carrierOptions.length) {
      carrierOptions.forEach(element => {
        const dd: dropdown = new dropdown();
        dd.Id = element;
        dd.Text = element;
        this.carrierOptions.push(dd);
      });
      if (carrierOptions.length === 1) {
        this.carrier = carrierOptions[0];
        this.carrierId = carrierOptions[0];
      }
    }
  }

  // populate OEM codes
  poplateOEMCodes(OEMCodes) {
    this.OEMCodeOptions = [];
    if (!this.appService.checkNullOrUndefined(OEMCodes) && OEMCodes.length) {
      OEMCodes.forEach(element => {
        const dd: dropdown = new dropdown();
        dd.Id = element;
        dd.Text = element;
        this.OEMCodeOptions.push(dd);
      });
      if (OEMCodes.length === 1) {
        this.oemCode = OEMCodes[0];
        this.oemId = OEMCodes[0];
      }
    }
  }

  // building vendor device object after selecting the value or populating
  vendorDeviceObj() {
    this.vendorDevice.Color = this.color;
    this.vendorDevice.OEM = this.oemCode;
    this.vendorDevice.Carrier = this.carrier;
    this.vendorDevice.Condition = this.conditionCode;
    this.vendorDevice.Sku = this.skuObj;
  }

  receivingDeviceObj() {
    this.receivingDevice.ColorName = this.color;
    this.receivingDevice.OEM_CD = this.oemCode;
    this.receivingDevice.Carrier = this.carrier;
    this.receivingDevice.ConditionCode = this.conditionCode;
    this.receivingDevice.SKU = this.skuObj;
  }

  gotoSurvey() {
    this.isDeviceProcesStepDone = true;
    this.receivingDeviceObj();
    this.vendorDeviceObj();
    this.stepper.next();
    if (!this.isDeviceAndSurveyDone && this.showAutoOrManual && this.isAutoOrManual) {
      this.getDevice();
    }
    if (!this.isDeviceAndSurveyDone && !this.isAutoOrManual) {
      const surveyrequestObj = { ClientData: this.clientData, Device: this.receivingDevice, UIData: this.uiData };
      this.surveyService.getSurvey(surveyrequestObj);
    }
  }

  // disabling color, carrier, oem, condition code
  disableReciptLine(value) {
    this.isConditionCodeDisabled = value;
    this.isCarrierDisabled = value;
    this.isOemDisabled = value;
    this.isColorDisableded = value;
  }

  // getDevice
  getDevice() {
    this.spinner.show();
    const requestObj = {
      ClientData: this.clientData,
      UIData: this.uiData,
      VendorDevice: this.vendorDevice,
      Receipt: this.receipt,
      ReceivingDevice: this.receivingDevice,
    };
    this.commonService.commonApiCall(
      this.apiConfigService.getDeviceUrl,
      requestObj,
      (res, statusFlag) => {
        if (statusFlag) {
          this.spinner.hide();
          if (!this.appService.checkNullOrUndefined(res.Response)) {
            this.receivingDevice = new ReceivingDevice();
            this.receivingDevice = res.Response.ReceivingDevice;
            this.receivingDevice.ProgramName = this.vendorDevice.ProgramName;
            this.receivingDevice.Location = this.clientData.Location;
            this.receivingDevice.Step = this.uiData.OperationId;
            this.receivingDevice.NextStep = this.uiData.OperationId;
            this.stepper.next();
            this.isDeviceAndSurveyDone = true;
            this.disableReciptLine(true);
            const surveyrequestObj = { ClientData: this.clientData, Device: this.receivingDevice, UIData: this.uiData };
            this.surveyService.getSurvey(surveyrequestObj);
          }
        } else {
          this.isDeviceProcesStepDone = false;
        }
      });
  }

  // To retrieve the port info (portId and parentId) for
  // a plugged in device using its deviceId (UID) that timedout by FD during detection.
  getTimedOutPortInfo() {
    this.spinner.show();
    this.isDeviceIdDisabled = true;
    this.isSearchDeviceIdDisabled = true;
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getTimedOutPortInfoUrl, this.deviceId);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          this.receipt = new Receipt();
          this.receivingService.updatedReceipt = new Receipt();
          this.parentId = res.Response.ParentId;
          this.automationPortId = res.Response.PortId;
          this.oldportId = res.Response.PortId;
          this.receipt = res.Response.Receipt;
          this.receivingService.updatedReceipt = res.Response.Receipt;
          this.isParentDdBtnDisabed = false;
          this.isTimedOutDevice = true;
        }
      } else {
        this.isDeviceIdDisabled = false;
        this.isSearchDeviceIdDisabled = false;
      }
    });
  }

  //#region  survey

  // emitted survey response on serial number scan
  getSurveyResponse(response) {
    if (!this.appService.checkNullOrUndefined(response)) {
      this.isSruveyStepDone = true;
      if (!this.isAutoOrManual) {
        this.stepper.next();
        this.isDeviceAndSurveyDone = true;
        this.disableReciptLine(true);
      }
      if (response.Status === StatusCodes.pass) {
        this.receivingDevice = response.Response.Device;
        this.surveyResponse = response.Response.SurveyTransactions;
        if (this.surveyResponse.SurveyTrans.length > 0) {
          this.surveyService.showSurvey = true;
        }
      } else if (response.Status === StatusCodes.fail) {
        this.sendTestProfile();
      }
    }
  }

  // on updated questions with and
  getRefreshedSurvey(event) {
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, SurveyTransactions: event.SurveyResponse, UIData: this.uiData, Device: this.receivingDevice };
    this.surveyService.getRefreshedSurvey(requestObj);
  }

  // on survey completion
  doneSurvey(event) {
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, SurveyTransactions: event, UIData: this.uiData, Device: this.receivingDevice };
    this.surveyService.sendSurveyInfo(requestObj);
  }

  // after done survey response
  getCompletedSurveyResponse(response) {
    if (!this.appService.checkNullOrUndefined(response)) {
      this.receivingDevice = response.Device;
      this.surveyResponse = response.SurveyTransactions;
      this.sendTestProfile();
    }
  }

  // on resurvey event
  reSurvey() {
    this.spinner.show();
    if (this.masterPageService.hideControls.controlProperties.containerSuggestion === undefined) {
      this.clearContainerID();
    }
    this.isAddDisabled = true;
    const requestObj = { ClientData: this.clientData, Device: this.receivingDevice, UIData: this.uiData };
    this.surveyService.getReSurvey(requestObj);
  }

  //#endregion  survey

  // not calling this api incase of manual process
  sendTestProfile() {
    if (this.showAutoOrManual && this.isAutoOrManual) {
      this.spinner.show();
      const requestObj = { ClientData: this.clientData, UIData: this.uiData, VendorDevice: this.vendorDevice, ReceivingDevice: this.receivingDevice, SurveyTransactions: this.surveyResponse };
      this.commonService.commonApiCall(this.apiConfigService.sendTestProfileUrl, requestObj, (res, statusFlag) => {
        if (statusFlag) {
          if (!this.appService.checkNullOrUndefined(res.Response)) {
            this.receivingDevice = res.Response.ReceivingDevice;
            this.surveyResponse = res.Response.SurveyTransactions;
          }
        }
        this.preAddProcessForDevice();
      });
    } else {
      this.preAddProcessForDevice();
    }
  }

  deviceIdPrint() {
    this.diveiceIdPrint = !this.diveiceIdPrint;
  }

  //#endregion

  // re assign the port reassignPortUrl
  reassignPort() {
    if (this.deviceId && this.automationPortId && this.parentId) {
      this.spinner.show();
      this.isParentEnableDynamicBtn = true;
      const requestObj = { ClientData: this.clientData, UIData: this.uiData };
      const url = String.Join('/', this.apiConfigService.reassignPortUrl, this.deviceId, this.automationPortId, this.parentId);
      this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
        if (statusFlag) {
          this.spinner.hide();
          if (!this.appService.checkNullOrUndefined(res.Response)) {
            this.snackbar.success(res.Response);
          }
        } else {
          this.isParentEnableDynamicBtn = false;
        }
      });
    }
  }

  // to get ghost container after getting the profile
  preAddProcessForDevice() {
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, ReceivingDevice: this.receivingDevice, ReceiptDetail: this.receiptDetail };
    this.commonService.commonApiCall(this.apiConfigService.preAddProcessForDeviceUrl, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          this.container = new Container();
          this.container = res.Response.Container;
          this.receivingDevice = res.Response.ReceivingDevice;
          if (!this.appService.checkNullOrUndefined(this.childContainer)) {
            const container = this.childContainer;
            container.blinkStyle = false;
            container.suggestedContainer = this.container.ContainerID;
            container.categoryName = this.container.CategoryName;
            this.receivingDevice.ContainerID = this.container.ContainerID;
            this.receivingDevice.ContainerCycle = this.container.ContainerCycle;
            if (this.container.ContainerID) {
              container.ContainerID = this.container.ContainerID;
              this.isAddDisabled = false;
            } else {
              this.isContainerDisabled = false;
              this.configContainerProperties();
              this.containerFocus();
            }
          }
        }
      }
    });
  }


  // add serials numbers to queue
  addAutoSerialNumber() {
    if (this.isAddDisabled === false) {
      this.spinner.show();
      const isMobile = this.appService.checkDevice();
      this.lottableTrans = new LottableTrans();
      const headerobj = Object.keys(this.lottableTrans);
      headerobj.forEach(res => {
        if (res) {
          this.lottableTrans[res] = this.receiptDetail[res];
        }
      });
      this.setAttributeValues();
      const requestObj = {
        ClientData: this.clientData,
        UIData: this.uiData,
        ReceivingDevice: this.receivingDevice,
        Receipt: this.receipt,
        ReceiptDetail: this.receiptDetail,
        LottableTrans: this.lottableTrans,
        VendorDevice: this.vendorDevice,
        SurveyTransactions: this.surveyResponse
      };
      const url = String.Join('/', this.apiConfigService.addAutoSerialNumberUrl, isMobile.toString(), this.selectedExternLineNo);
      this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
        if (statusFlag) {
          this.spinner.hide();
          if (!this.appService.checkNullOrUndefined(res.Response)) {
            this.snackbar.success(res.StatusMessage);
            if (res.Response.Receipts && res.Response.Receipts.Receipttrans) {
              const transGrid = new Grid();
              transGrid.ItemsPerPage = this.appConfig.receiving.griditemsPerPage.receiptTrans;
              this.receivingService.onReceiptTransGenerateJsonGrid(res.Response.Receipts.Receipttrans);
              this.receivingService.ReceiptTrans = this.appService.onGenerateJson(this.receivingService.ReceiptTransResponse, transGrid);
            }
            this.Clear();
            if (this.showAutoOrManual && this.isAutoOrManual) {
              this.getVendorDevice();
            }
          }
        }
      });
    }
  }



  clearObjects() {
    this.receivingDevice = new ReceivingDevice();
    this.receivingESNMaster = new ReceivingESNMaster();
    this.skuObj = new SKU();
    this.container = new Container();
    this.receiptDetail = new ReceiptDetail();
    //  this.printLabel = new PrintLabel();
    if (this.appService.checkDevice()) {
      this.receipt = new Receipt();
    }
  }
  // error Emit for container suggestion
  errorEmit(val) {
    this.onErroralert = val;
    if (val === false) {
      this.showAdd = false;
    }
    this.isAddDisabled = true;
  }

  mfgValueChange(value) {
    if (!this.appService.checkNullOrUndefined(value) && value !== '') {
      this.isAddDisabled = true;
      const maxDate = this.datepipe.transform(this.maxDate, 'MM/yy');
      let maxDateMonthYear = [];
      let inputMonthYear = [];
      inputMonthYear = value.split('/');
      maxDateMonthYear = maxDate.split('/');
      const maxMonth = maxDateMonthYear[0];
      const maxYear = maxDateMonthYear[1];
      const inputMonth = inputMonthYear[0];
      const inputYear = inputMonthYear[1];
      if (maxYear >= inputYear) {
        if (maxMonth >= inputMonth || maxYear !== inputYear) {
          this.attribute1 = value;
          this.appErrService.clearAlert();
          if (!this.appService.checkNullOrUndefined(this.rf) && this.rf.valid && this.mfgDateCheck) {
            this.isAddDisabled = false;
          }
        } else {
          this.appService.applySelect('attribute1');
          this.appService.applyRequired(true, 'attribute1');
          this.appErrService.setAlert('Invalid Date', true);
        }
      } else {
        this.appService.applySelect('attribute1');
        this.appService.applyRequired(true, 'attribute1');
        this.appErrService.setAlert('Invalid Date', true);
      }
    }
  }

  mfgDateChange(value) {
    if (value) {
      this.appService.applyRequired(false, 'attribute1');
      this.appErrService.clearAlert();
      if (!this.appService.checkNullOrUndefined(this.rf) && this.rf.valid && this.mfgDateCheck) {
        this.isAddDisabled = false;
      }
    }
  }

  mfgInputChange($event, dp1: any) {
    dp1.hide();
    if ($event.value === '') {
      const inputSerialNumber = <HTMLInputElement>document.getElementById('attribute1');
      if (inputSerialNumber) {
        inputSerialNumber.blur();
      }
      this.appService.applyRequired(false, 'attribute1');
      this.appErrService.clearAlert();
    }
  }



  expandReceiptPanel() {
    this.isReceiptSection = !this.isReceiptSection;
  }

  expandParentPanel() {
    this.isParentSection = !this.isParentSection;
  }

  onProcessQueGenerateJsonGrid(Response) {
    if (!this.appService.checkNullOrUndefined(Response)) {
      this.processQueData = [];
      Response.forEach(res => {
        const element: any = {};
        element.UID = res.UID;
        element.PortId = res.PortId;
        element.SerialNumber = res.SerialNumber;
        element.Status = res.Status;
        element.ParentId = res.ParentId;
        this.processQueData.push(element);
      });
    }
  }

  clearAutomationForm() {
    if (this.isTimedOutDevice) {
      this.turnOffPortLED();
    }
    this.isTimedOutDevice = false;
    this.oldportId = null;
    this.deviceId = null;
    this.automationPortId = null;
    this.diveiceIdPrint = true;
    if (this.showAutoOrManual) {  // if atuo poll
      if (this.isAutoOrManual) {
        this.isDeviceIdDisabled = true;
        this.isSearchUIdBtn = false;
      } else {
        this.isDeviceIdDisabled = false;
        this.isSearchUIdBtn = true;
        this.isSearchDeviceIdDisabled = true;
      }
      this.isParentEnableDynamicBtn = true;
      this.isParentDdBtnDisabed = true;
      if (!this.appService.checkNullOrUndefined(this.parentDdBtn)) {
        this.parentDdBtn.selectedBtnOption = '';
      }
      this.isGenerateUIdBtn = false;
      this.isPortIdDisabled = true;
      this.parentId = '';
      this.receipt = new Receipt();
      this.receivingService.updatedReceipt = new Receipt();
    } else {
      this.isGenerateUIdDisabled = false;
      this.generateUidFocus();
    }
    this.appErrService.clearAlert();
  }

  generateUidFocus() {
    this.appService.setFocus('generateUId');
  }

  carrierFocus() {
    this.appService.setFocus('carrier');
  }


  ngOnDestroy() {
    localStorage.removeItem(this.storageData.receiptSearchObj);
    localStorage.removeItem(this.storageData.authKey);
    localStorage.removeItem(this.storageData.receivingObj);
    this.receipt = new Receipt();
    this.masterPageService.categoryName = null;
    this.appErrService.clearAlert();
    this.masterPageService.operationList = [];
    this.masterPageService.operationsdropdown = [];
    this.masterPageService.operCategoryTests = [];
    this.masterPageService.setDropDown(false);
    this.masterPageService.clearModule();
    this.selectedExternLineNo = '';
    this.receivingService.ReceiptTrans = null;
    this.receivingService.ReceiptTransResponse = [];
    this.receiptkey = '';
    this.receivingService.updatedReceipt = new Receipt();
    if (this.dialogRef) {
      this.dialogRef.close();
    }
    this.masterPageService.moduleName.next(null);
    this.masterPageService.callerUrl = '';
    this.masterPageService.showUtilityIcon = false;
    if (!this.appService.checkNullOrUndefined(this.originationOperation) && this.originationOperation) {
      this.originationOperation.unsubscribe();
    }
    this.masterPageService.clearOriginationSubscription();
    if (this.masterPageService.hideControls.controlProperties) {
      this.masterPageService.hideControls.controlProperties = new EngineResult();
    }
    this.masterPageService.hideModal();
    if (this.stopPolling) {
      this.stopPolling.next(null);
      this.masterPageService.tempQueList = null;
    }
    if (this.deviceStopPolling) {
      this.deviceStopPolling.next(null);
    }
    this.emitSurveyResult.unsubscribe();
    this.emitDoneSurveyResponse.unsubscribe();
    this.surveyService.surveyResult.next(null);
    this.surveyService.doneSurveyResponse.next(null);
  }
}
