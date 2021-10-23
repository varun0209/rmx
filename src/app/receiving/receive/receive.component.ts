import { Component, OnInit, ViewChild, TemplateRef, OnDestroy, ElementRef } from '@angular/core';
import { ApiService } from '../../utilities/rlcutl/api.service';
import { FormGroup, FormBuilder, NgForm, NgModelGroup } from '@angular/forms';
import { Pallet } from '../../models/receiving/Pallet';
import { TrackingNum } from '../../models/receiving/TrackingNum';
import { Receipt, ReceiptDetail, Receipttrans } from '../../models/receiving/Receipt';
import { SKU } from '../../models/receiving/ReceivingSKU';
import { ApiConfigService } from '../../utilities/rlcutl/api-config.service';
import { RmtextboxComponent } from '../../framework/frmctl/rmtextbox/rmtextbox.component';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { ReceivingDevice, ReceivingESNMaster } from '../../models/receiving/ReceivingDevice';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';
import { ListofTransactions } from '../../models/common/ListofTransactions';
//import { Receiving, ReceivingDeviceESNMaster, GetReceiptDetail } from '../../models/receiving/Receiving';
import { String } from 'typescript-string-operations';
import { MessageType } from '../../enums/message.enum';
import { MessagingService } from '../../utilities/rlcutl/messaging.service';
import { Message } from '../../models/common/Message';
import { Grid } from './../../models/common/Grid';
import { NgxSpinnerService } from 'ngx-spinner';
import { Authorization } from '../../models/receiving/Authorization';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';
import { ContainerSuggestionComponent } from '../../framework/busctl/container-suggestion/container-suggestion.component';
import { Container } from '../../models/common/Container';
import { RmtypeaheadComponent } from '../../framework/frmctl/rmtypeahead/rmtypeahead.component';
import { AppService } from '../../utilities/rlcutl/app.service';
//import { PrintLabel } from './../../models/receiving/Receiving';
import { Router } from '@angular/router';
import { ReceivingService } from '../../services/receiving.service';
import { ClientData } from '../../models/common/ClientData';
import { DatePipe } from '@angular/common';
import {  BsDatepickerConfig } from 'ngx-bootstrap';
import { BsDatepickerViewMode } from 'ngx-bootstrap/datepicker/models';
import { UiData } from '../../models/common/UiData';
import { LottableTrans } from '../../models/common/LottableTrans';
import { Subscription } from 'rxjs';
import { EngineResult } from '../../models/common/EngineResult';
import { TraceTypes } from '../../enums/traceType.enum';
import { CommonService } from '../../services/common.service';
import { FindTraceHoldComponent } from '../../framework/busctl/find-trace-hold/find-trace-hold.component';
import { StorageData } from '../../enums/storage.enum';
import { StatusCodes } from '../../enums/status.enum';
import { checkNullorUndefined } from '../../enums/nullorundefined';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-receive',
    templateUrl: './receive.component.html',
    styleUrls: ['./receive.component.css'],
})
export class ReceiveComponent implements OnInit, OnDestroy {

    //Declaring Child Components
    @ViewChild('inputSerial') inputSerial: RmtextboxComponent;
    @ViewChild(RmtypeaheadComponent) rmtypeaheadChild: RmtypeaheadComponent;
    @ViewChild(RmtextboxComponent) rmtextboxChild: RmtextboxComponent;
    @ViewChild(ContainerSuggestionComponent) childContainer: ContainerSuggestionComponent;
    @ViewChild('rf') rf: NgForm;
    @ViewChild('attributesCtrl') attributesCtrl: NgModelGroup;



    //Form
    receivingform: FormGroup;

    // Modal popup
    modeltitle: string;
    utilityTitle: string;
    isModalOpen: boolean = false;

    //Pallet
    pallet = new Pallet();
    isPalletDisable: boolean = true;

    //Tracking Number
    trackingNumber: string;

    //Serial Number
    serialNumber = "";
    isSerNumDisable = false;
    //addSerialNumDisabled: boolean = true;
    //externLineNo: string;
    selectedExternLineNo: string = "";
    conditionCode = "";
    conditionCodeId = "";
    isConditionCodeDisabled: boolean = false;
    conditionCodeOptions = [];
    receivedQuantity = "";
    //Authorization key
    authorization: Authorization = new Authorization();
    authorizationkey: string;
    isAuthorizationDisable = true;

    //SKU
    SKU: string;
    skus: SKU[] = [];
    skuDisabled = false;
    selectedSKUModel: string;
    selectedSKU: string;
    //showing controlls progressivly
    showauthorizationkey: boolean = false;
    showSku: boolean = false;
    showEsn: boolean = false;
    showSuggestedContainer: boolean = false;
    showAdd: boolean = false;
    editSerialNumber: boolean = false;
    editauthorizationkey: boolean = false;
    isContainerValid: boolean = false;
    //validatedContainer = "";

    //Receiving Device
    sku = new SKU();
    receivingDevice = new ReceivingDevice();
    // receiving = new Receiving(); // wrapper class
    //receivingESNMaster : ReceivingESNMaster;
    receivingESNMaster = new ReceivingESNMaster();
    // receivingDeviceESNMaster = new ReceivingDeviceESNMaster();
    // GetReceiptDetail = new GetReceiptDetail();


    //ReceiptTrans and Receipt
    grid: Grid;
    ReceiptTransResult: any;
    receiptNotes = "";
    receipt: Receipt;
    receiptDetail = new ReceiptDetail();
    receieptTrans = new Receipttrans();
    receiptkey: string;
    // printLabel: PrintLabel;


    //ESN Reprint
    ESNReprint: boolean;
    ESNReprintDisabled = true;


    //Container
    container = new Container();

    //App message
    messageNum: string;
    messagesCategory: string;
    messageType: string;

    //AddSerialNumber
    listofTransactions: ListofTransactions = new ListofTransactions();
    isAddDisabled = true;
    isClearDisabled = true;

    //Flashing Background
    onErroralert = false;
    onInfoalert = false;

    //suggestion Container
    isContainerDisabled: boolean = true;
    isClearContainerDisabled = true;

    //client Control Labels
    //clientControls: any[] = [];

    //DeskTop
    //ReCeipt
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
    //CustomerINfo
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
    //*others Tab*//
    isWHSEID = true;
    isPlaceOfLoading = true;
    isPlaceOfDelivery = true;
    isReceiptGroup = true;
    isCarrierKey = true;
    isCarrierName = true;
    isreceivedQuantity = false;
    isSNPrintDisabled = true;
    islpnContainerPrintDisabled = true;

    //Attributes
    attribute1: string = "";
    attribute2: string = "";
    attribute3: string = "";
    //attribute5:string = "";
    SnAttributes: any = {};

    //onLoad Focus
    focusId = "";
    // showContainerPrint = false;
    //showSerialNumberPrint = false;
    ReadyForProcess: string = "";
    receiptDetailResponse = [];

    //get controlConfig
    controlConfig: any;
    //unexpected
    unexpectedFlag: boolean = false;
    clientData = new ClientData();
    uiData = new UiData();
    receiptKey: any;
    receiptKeyObj: any;
    receipt_Key: any;
    screen: any;
    appConfig: any;

    minDate: Date;
    maxDate: Date;
    currentTime: Date;

    minMode: BsDatepickerViewMode = 'month';
    bsConfig: Partial<BsDatepickerConfig>;
    @ViewChild('snAtt1') inputtext: any;
    mfgDateCheck: boolean = false;

    //lottable object
    lottableTrans: LottableTrans;
    //originaiton operation
    originationOperation: Subscription;
    deviceOrigination: string;
    validSerialNumberResponse: any;
    traceTypes = TraceTypes;
    createReceiptSuccessResponse: any;
    storageData = StorageData;
    statusCode = StatusCodes;
    dialogRef: any;

    constructor(
        public apiservice: ApiService,
        public form: FormBuilder,
        private apiConfigService: ApiConfigService,
        private snackbar: XpoSnackBar,
        public appErrService: AppErrorService,
        private messagingService: MessagingService,
        private spinner: NgxSpinnerService,
        public masterPageService: MasterPageService,
        public appService: AppService,
        public receivingService: ReceivingService,
        private router: Router,
        public datepipe: DatePipe,
        private commonService: CommonService,
        private dialog: MatDialog
    ) {
        this.masterPageService.receiveingConfiguration.subscribe(hideControls => {
            if (!checkNullorUndefined(hideControls)) {
                if (hideControls.pallet !== undefined && !hideControls.pallet.Hidden) {
                    this.loadPallet();
                }
                // this.showContainerPrint = hideControls.containerPrint.Show;
                //this.showSerialNumberPrint = hideControls.serialNumberPrint.Show;
                if (hideControls.focus && hideControls.focus.Id) {
                    this.focusId = hideControls.focus.Id;
                    this.appService.setFocus(this.focusId);
                }
            }
        });
    }

    ngOnInit() {
        this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
        if (!this.appService.checkDevice()) {
            // this is coming from receive search or receipt search
            let getOperationObj = JSON.parse(localStorage.getItem(this.storageData.receivingObj));
            if (checkNullorUndefined(getOperationObj)) {
                this.gotoReceiveSearch();
            }
            else {
                //setting title and module from receive-search object.
                this.getReceiveOperationObj();
            }
            this.receiptKeyObj = JSON.parse(localStorage.getItem(this.storageData.receiptSearchObj));
            if (!checkNullorUndefined(this.receiptKeyObj)) {
                this.receipt_Key = this.receiptKeyObj.receiptKey
            }
            let auth_key = localStorage.getItem(this.storageData.authKey);

            // if (!this.appService.checkDevice()) {
            if (!checkNullorUndefined(this.receipt_Key) && this.receipt_Key != "") {
                {
                    this.receiptKey = this.receipt_Key
                    this.authorizationkey = this.receiptKeyObj.ExternReceiptkey;
                    this.loadReceiptSearch();
                }
            }
            else {
                if (!checkNullorUndefined(auth_key) && auth_key != "") {
                    this.authorizationkey = auth_key;
                    this.createReceipt();
                }
                else {
                    this.gotoReceiveSearch();
                }
            }
        } else {
            this.getReceiveOperationObj();
        }
        this.buildForm();
        this.appErrService.appMessage();
        this.conditionCodeData();
        this.appConfig = JSON.parse(localStorage.getItem(this.storageData.appConfig));
        this.controlConfig = JSON.parse(localStorage.getItem(this.storageData.controlConfig));
        this.currentTime = new Date();
        this.minDate = new Date(2000, 0, 1);
        this.maxDate = new Date(this.currentTime.getFullYear(), this.currentTime.getMonth() + 1, 0);
        this.bsConfig = Object.assign({}, {
            minMode: this.minMode,
            dateInputFormat: 'MM/YY',
            containerClass: 'theme-dark-blue'
        });

    }



    getReceiveOperationObj() {
        let operationObj = this.masterPageService.getRouteOperation("/receive-search");
        if (operationObj) {
            this.masterPageService.setTitle(operationObj.Title);
            this.masterPageService.setModule(operationObj.Module);
            this.uiData.OperationId = operationObj.OperationId;
            this.uiData.OperCategory = operationObj.Category;
            this.masterPageService.operationObj = operationObj;
            this.originationOperation = this.masterPageService.originationOperation.subscribe(val => {
                this.deviceOrigination = val;
            });
        }
    }


    //Intialize the form controls
    buildForm() {
        return this.receivingform = this.form.group({
            SearchKey: [],
            PalletId: [],
            Quantity: [],
            TrackingNum: [],
            SerialNum: [],
            sku: [],
            containerId: [],
            ESNReprint: [],
            authorization: []
        });
    }

    //Esn Reprint toggle
    changeESNReprint(val: boolean) {
        this.ESNReprint = val;
    }

    //Change input box
    changeInput(inputControl?: RmtextboxComponent) {
        if (inputControl) {
            inputControl.applyRequired(false);
        }
        this.isClearDisabled = false;
        this.appErrService.clearAlert();
        this.onErroralert = false;
        this.onInfoalert = false;
        if (!checkNullorUndefined(this.rf) && this.rf.valid && this.mfgDateCheck) {
            this.isAddDisabled = false;
        }
    }

    //Input change
    onControllerChange(inputControl) {
        inputControl.applyRequired(false);
        this.appErrService.clearAlert();
        this.onErroralert = false;
        this.onInfoalert = false;
    }

    //Goto Previous Page
    gotoReceiveSearch() {
        //this.location.back();
        this.router.navigate(['receive-search']);
    }
    gotoReceiptSearch() {
        //this.location.back();
        this.router.navigate(['receipt-search']);
    }

    goBackToSearch() {
        if (!checkNullorUndefined(this.receiptKeyObj)) {
            this.gotoReceiptSearch();
        }
        else {
            this.gotoReceiveSearch();
        }
    }


    // loadReceipt from receive-search

    loadReceiptSearch(event?) {
        if (!checkNullorUndefined(this.receiptKey) && this.receiptKey != "") {
            this.spinner.show();
            this.selectedSKU = "";
            this.unexpectedFlag = false;
            let requestObj = { ClientData: this.clientData, UIData: this.uiData };
            const url = String.Join('/', this.apiConfigService.loadReceiptApi, this.receiptKey.trim());
            this.apiservice.apiPostRequest(url, requestObj)
                .subscribe(response => {
                    let res = response.body;
                    this.spinner.hide();
                    if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                        // this.receiving.Receipt = new Receipt();
                        this.receipt = new Receipt();
                        // this.GetReceiptDetail.Receipt = new Receipt();
                        // this.receiving.Receipt = res.Response;
                        this.receipt = res.Response;
                        this.receiptkey = res.Response.Receiptkey;
                        // this.GetReceiptDetail.Receipt = this.receiving.Receipt;
                        this.receivingService.updatedReceipt = res.Response;
                        this.grid = new Grid();
                        this.grid.ItemsPerPage = this.appConfig.receiving.griditemsPerPage;
                        this.grid.EditVisible = true;
                        this.grid.SearchVisible = this.appConfig.receiving.gridSearchVisible;
                        this.receivingService.onDetailPopupJsonGrid(res.Response.ReceiptDetail);
                        this.receivingService.ReceiptDetails = this.appService.onGenerateJson(this.receivingService.ReceiptDetailResponse, this.grid);
                        const receiptTransGrid = new Grid();
                        receiptTransGrid.ItemsPerPage = this.appConfig.receiving.griditemsPerPage;
                        this.receivingService.onReceiptTransGenerateJsonGrid(res.Response.Receipttrans);
                        this.receivingService.ReceiptTrans = this.appService.onGenerateJson(this.receivingService.ReceiptTransResponse, receiptTransGrid);
                        if (this.appService.checkDevice()) {
                            if (!this.unexpectedFlag) {
                                this.validateSerialNumber();
                            } else {
                                this.getReceiptDetail((data) => {
                                    if (!checkNullorUndefined(data) && data.Status == this.statusCode.pass) {
                                        if (data.Response.ReadyForProcess == "Y") {
                                            if (data.StatusMessage != "") {
                                                this.appErrService.setAlert(data.StatusMessage, true, MessageType.info);
                                            }
                                            this.loadReceivingvalues();
                                        }
                                        if (!checkNullorUndefined(data.Response.ReceiptDetail.SKU) && data.Response.ReceiptDetail.SKU != "") {
                                            this.selectedSKU = data.Response.ReceiptDetail.SKU;
                                            this.getDetermineSKUs();
                                        }
                                        else {
                                            if (data.StatusMessage != "") {
                                                this.appErrService.setAlert(data.StatusMessage, true, MessageType.info);
                                            }
                                            this.getManufacturerSKU();
                                        }
                                    }
                                    else if (!checkNullorUndefined(data) && data.Status == this.statusCode.fail) {
                                        this.appErrService.setAlert(data.ErrorMessage.ErrorDetails, true);
                                    }
                                });
                            }
                        }
                    }
                    else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
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


    /*Pallet business logic start*/

    //Load pallet
    loadPallet() {
        this.pallet.Location = localStorage.getItem(this.storageData.location);
        this.pallet.ClientId = localStorage.getItem(this.storageData.clientId);

        let requestObj = { ClientData: this.clientData, Pallet: this.pallet, UIData: this.uiData };
        const url = String.Join("/", this.apiConfigService.loadPalletUrl);
        this.apiservice.apiPostRequest(url, requestObj)
            .subscribe(response => {
                let res = response.body;
                this.pallet.PalletId = res.Response.PalletId;
                this.pallet.Quantity = res.Response.Quantity;
                this.receivingform.patchValue({
                    PalletId: res.Response.PalletId,
                    Quantity: this.pallet.Quantity
                });
                if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                    this.isPalletDisable = false;
                }
                this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
            }, erro => {
                this.appErrService.handleAppError(erro);
            });
    }

    //Empty pallet
    emptyPalletId() {
        this.isPalletDisable = false;
        let requestObj = { ClientData: this.clientData, Pallet: this.pallet, UIData: this.uiData };
        const url = String.Join("/", this.apiConfigService.emptyPalletUrl);
        this.apiservice.apiPostRequest(url, requestObj)
            .subscribe(response => {
                let res = response.body;
                if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                    this.pallet.PalletId = res.Response.PalletId;
                    this.pallet.Quantity = res.Response.Quantity;
                    this.receivingform.patchValue({
                        PalletId: this.pallet.PalletId,
                        Quantity: this.pallet.Quantity
                    });
                } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                }
            }, erro => {
                this.appErrService.handleAppError(erro);
            });
    }

    //Get pallet
    getPallet() {
        this.pallet.PalletId = this.receivingform.value.PalletId;
        let requestObj = { ClientData: this.clientData, Pallet: this.pallet, UIData: this.uiData };
        const url = String.Join("/", this.apiConfigService.getPalletUrl);
        this.apiservice.apiPostRequest(url, requestObj)
            .subscribe(response => {
                let res = response.body;
                if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                    this.pallet.Quantity = res.Response.Quantity;
                    this.receivingform.patchValue({
                        palletId: res.Response.PalletId,
                        Quantity: res.Response.Quantity
                    });
                }
                else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                }
            },
                erro => {
                    this.appErrService.handleAppError(erro);
                });
    }

    /*Pallet logic end*/


    /*Tracking number logic start*/
    //Get tracking No
    getTrackingNo(inpcontrol: RmtextboxComponent) {
        let trackingNumer = new TrackingNum();
        trackingNumer.Location = localStorage.getItem(this.storageData.location);
        trackingNumer.ClientId = localStorage.getItem(this.storageData.clientId);
        trackingNumer.TrackingNum = this.receivingform.value.TrackingNum;
        let requestObj = { ClientData: this.clientData, TrackingNum: trackingNumer, UIData: this.uiData };
        const url = String.Join("/", this.apiConfigService.trackingNoUrl);
        this.apiservice.apiPostRequest(url, requestObj)
            .subscribe(response => {
                let res = response.body;
                if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                    this.trackingNumber = res.Response.TrackingNum;
                    this.receivingform.patchValue({
                        TrackingNum: this.trackingNumber,
                    });
                    inpcontrol.applyRequired(false);
                }
                else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                    inpcontrol.applyRequired(true);
                }
            }, erro => {
                this.appErrService.handleAppError(erro);
            });
    }
    /*Tracking number  logic end*/

    //Search Based Key mobile
    searchInputKey() {
        if (!(checkNullorUndefined(this.serialNumber)) && this.serialNumber !== "") {
            this.spinner.show();
            this.authorizationkey = "";
            //let storerkey = localStorage.getItem('StorerKey');
            let requestObj = { ClientData: this.clientData, UIData: this.uiData };
            const url = String.Join('/', this.apiConfigService.searchKeyUrl, this.serialNumber.trim())
            this.apiservice.apiPostRequest(url, requestObj)
                .subscribe(response => {
                    let res = response.body;
                    this.spinner.hide();
                    if (!checkNullorUndefined(res) && res.Status != this.statusCode.fail) {
                        this.authorizationkey = res.Response[0].Auth_Key;
                        if (checkNullorUndefined(this.authorizationkey)) {
                            this.editauthorizationkey = false;
                        }
                        if (!checkNullorUndefined(this.authorizationkey) && this.authorizationkey != "") {
                            this.createReceipt()
                        }
                        else {
                            this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true, MessageType.info);
                            this.validateSerialNumber();
                        }
                    }
                    else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                        this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);

                    }

                }, erro => {
                    this.appErrService.handleAppError(erro);
                });
        }
    }

    //To create Receipt object
    createReceipt(event?) {
        if (!checkNullorUndefined(this.authorizationkey) && this.authorizationkey != "") {
            this.spinner.show();
            this.selectedSKU = "";
            this.unexpectedFlag = false;
            let requestObj = { ClientData: this.clientData, UIData: this.uiData };
            const url = String.Join('/', this.apiConfigService.createReceiptUrl, this.authorizationkey.trim());
            this.apiservice.apiPostRequest(url, requestObj)
                .subscribe(response => {
                    let res = response.body;
                    this.spinner.hide();
                    if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                        this.createReceiptSuccessResponse = res;
                        let traceData = { traceType: this.traceTypes.rmaNumber, traceValue: this.authorizationkey, uiData: this.uiData }
                        let traceResult = this.commonService.findTraceHold(traceData, this.uiData);
                        traceResult.subscribe(result => {
                            if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) {
                                if (checkNullorUndefined(result.Response)) {
                                    this.createReceiptSuccess();
                                } else {
                                    this.canProceed(result, this.traceTypes.rmaNumber);
                                }
                                this.spinner.hide();
                            } else if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) {
                                this.spinner.hide();
                                this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
                            }
                        });
                    }
                    else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
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
        // this.receiving.Receipt = new Receipt();
        this.receipt = new Receipt();
        // this.GetReceiptDetail.Receipt = new Receipt();
        // this.receiving.Receipt = res.Response;
        this.receipt = res.Response;
        this.receiptkey = res.Response.Receiptkey;
        // this.GetReceiptDetail.Receipt = this.receiving.Receipt;
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
                    if (!checkNullorUndefined(data) && data.Status == this.statusCode.pass) {
                        if (data.Response.ReadyForProcess == "Y") {
                            if (data.StatusMessage != "") {
                                this.appErrService.setAlert(data.StatusMessage, true, MessageType.info);
                            }
                            this.loadReceivingvalues();
                        }
                        if (!checkNullorUndefined(data.Response.ReceiptDetail.SKU) && data.Response.ReceiptDetail.SKU != "") {
                            this.selectedSKU = data.Response.ReceiptDetail.SKU;
                            this.getDetermineSKUs();
                        }
                        else {
                            if (data.StatusMessage != "") {
                                this.appErrService.setAlert(data.StatusMessage, true, MessageType.info);
                            }
                            this.getManufacturerSKU();
                        }
                    }
                    else if (!checkNullorUndefined(data) && data.Status == this.statusCode.fail) {
                        this.appErrService.setAlert(data.ErrorMessage.ErrorDetails, true);
                    }
                });
            }
        }
        this.createReceiptSuccessResponse = null;
    }



    //Serial number logic starts*/

    //Validating Serial Number
    validateSerialNumber() {
        this.unexpectedFlag = false;
        if (!(checkNullorUndefined(this.serialNumber)) && this.serialNumber !== "") {
            this.spinner.show();
            // this.receiving = new Receiving();
            this.receivingESNMaster = new ReceivingESNMaster();
            // this.receivingDevice = new ReceivingDevice();
            this.isClearDisabled = false;
            let requestObj = { ClientData: this.clientData, UIData: this.uiData, SKU: this.sku };

            const url = String.Join("/", this.apiConfigService.validateSerialNumber, this.serialNumber.trim());
            this.apiservice.apiPostRequest(url, requestObj)
                .subscribe(response => {
                    let res = response.body;
                    if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                        this.validSerialNumberResponse = response.body;
                        this.validSerialNumber();
                    }
                    else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
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
        this.editSerialNumber = true;
        // this.receiving.ReceivingDevice = res.Response.ReceivingDevice;
        this.receivingDevice = new ReceivingDevice();
        this.receivingDevice = res.Response.ReceivingDevice;
        // this.receiving.ReceivingDevice.DeviceSKU = this.selectedSKU;
        this.receivingDevice.DeviceSKU = this.selectedSKU;
        this.receivingDevice.ReceiptKey = this.receivingService.updatedReceipt.Receiptkey;
        // this.receivingDeviceESNMaster.ReceivingDevice= res.Response.ReceivingDevice;
        // this.GetReceiptDetail.ReceivingDevice  =  res.Response.ReceivingDevice;
        this.receivingESNMaster = res.Response.ReceivingESNMaster;
        this.receivingDevice.SerialNumber = res.Response.ReceivingDevice.SerialNumber;
        this.receivingDevice.CycleNumber = res.Response.ReceivingDevice.CycleNumber;
        if (!checkNullorUndefined(this.deviceOrigination) && this.deviceOrigination != '') {
            this.receivingDevice.Origination = this.deviceOrigination;
        }
        if (checkNullorUndefined(this.authorizationkey)) {
            this.showauthorizationkey = true;
            this.onInfoalert = true;
            this.unexpectedFlag = true;
            this.isAuthorizationDisable = false;
            this.authFocus();
            this.spinner.hide();
            return
        }
        else {
            this.editauthorizationkey = true;
        }
        this.isSerNumDisable = true;
        this.ESNReprintDisabled = false;
        this.isClearDisabled = false;
        if (!checkNullorUndefined(this.inputSerial)) {
            this.inputSerial.disabled = true;
            this.inputSerial.applyRequired(false);
        }
        this.getReceiptDetail((data) => {
            if (!checkNullorUndefined(data) && data.Status == this.statusCode.pass) {
                //this.GetReceiptDetail.ReceiptDetail = data.Response.ReceiptDetail;
                if (data.Response.ReceiptDetail) {
                    this.receiptDetail = data.Response.ReceiptDetail;
                }
                else {
                    this.receiptDetail = new ReceiptDetail();
                }
                if (!checkNullorUndefined(data.Response.ReceiptDetail)) {
                    this.selectedExternLineNo = data.Response.ReceiptDetail.ExternLineno;
                }
                if (data.Response.ReadyForProcess == "Y") {
                    if (data.StatusMessage != "") {
                        this.appErrService.setAlert(data.StatusMessage, true, MessageType.info);
                    }
                    this.loadReceivingvalues();
                }
                else if (data.Response.ReadyForProcess == "N") {
                    if (!checkNullorUndefined(data.Response.ReceiptDetail) && !checkNullorUndefined(data.Response.ReceiptDetail.SKU) && data.Response.ReceiptDetail.SKU != "") {
                        this.selectedSKU = data.Response.ReceiptDetail.SKU;
                        this.getDetermineSKUs();
                    }
                    else {
                        if (data.StatusMessage != "") {
                            this.appErrService.setAlert(data.StatusMessage, true, MessageType.info);
                        }
                        this.getManufacturerSKU();
                    }
                }

            }
            else if (!checkNullorUndefined(data) && data.Status == this.statusCode.fail) {
                this.appErrService.setAlert(data.ErrorMessage.ErrorDetails, true);
                this.isSerNumDisable = false;
                if (!checkNullorUndefined(this.inputSerial)) {
                    this.inputSerial.applySelect();
                    this.inputSerial.applyRequired(true);
                }

            }
        }, true);
        this.validSerialNumberResponse = null;
    }

    canProceed(traceResponse, type) {
        if (traceResponse.Response.canProceed == 'Y') {
            this.appErrService.setAlert(traceResponse.StatusMessage, true, MessageType.info);
        }
        if (!checkNullorUndefined(traceResponse.Response.TraceHold)) {
            let uiObj = { uiData: this.uiData }
            traceResponse = Object.assign(traceResponse, uiObj);
            this.dialogRef = this.dialog.open(FindTraceHoldComponent, { hasBackdrop: true, disableClose: true, panelClass: 'dialog-width-sm', data: { modalData: traceResponse } });
            this.dialogRef.afterClosed().subscribe((returnedData) => {
              if (returnedData) {
                if (returnedData.Response.canProceed == 'Y') {
                    if (type == this.traceTypes.rmaNumber) {
                        this.createReceiptSuccess();
                    }
                } else if (returnedData.Response.canProceed == 'N') {
                    if (type == this.traceTypes.rmaNumber) {
                        this.authFocus();
                    }
                    this.appErrService.setAlert(returnedData.StatusMessage, true);
                }
            }
            });
        }
    }


    getManufacturerSKU() {
        let requestObj = { ClientData: this.clientData, ReceivingDevice: this.receivingDevice, ReceivingESNMaster: this.receivingESNMaster, UIData: this.uiData };
        const url = String.Join('/', this.apiConfigService.getManufacturerSKUUrl);
        this.apiservice.apiPostRequest(url, requestObj)
            .subscribe(response => {
                let res = response.body;
                this.spinner.hide();
                if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                    //this.receiving.ReceivingDevice = new ReceivingDevice();
                    // this.receiving.ReceivingDevice = res.Response;
                    this.receivingDevice = res.Response;
                    if (!checkNullorUndefined(res.Response.DeviceSKU) && res.Response.DeviceSKU != "") {
                        this.selectedSKU = res.Response.DeviceSKU;
                        this.getDetermineSKUs();
                    }
                    else {
                        this.editSerialNumber = true;
                        this.editauthorizationkey = true;
                        this.showSku = true;
                        this.skuClear();
                        this.skuReset();
                        this.skuFocus();
                    }

                }
                else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                    this.editSerialNumber = false;
                    this.isSerNumDisable = false;
                    this.serialNumberFocus();
                    this.clearObjects();
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                }
            },
                erro => {
                    this.handleAppError(erro);
                });
    }

    /*Sku logic start */
    //Get Determine skus
    getDetermineSKUs(event?) {
        if (!checkNullorUndefined(this.deviceOrigination) && this.deviceOrigination != '') {
            this.receivingDevice.Origination = this.deviceOrigination;
        }
        this.onErroralert = false;
        if (!checkNullorUndefined(event)) {
            this.selectedSKU = event.value.toUpperCase().trim();
        }
        if (!checkNullorUndefined(this.selectedSKU) && this.selectedSKU != "") {
            this.spinner.show();
            // this.receivingDeviceESNMaster.Receipt = this.receivingService.updatedReceipt;
            // this.receipt = this.receivingService.updatedReceipt;
            //this.receivingDeviceESNMaster.ReceivingESNMaster = this.receivingESNMaster;
            let requestObj = { ClientData: this.clientData, ReceivingESNMaster: this.receivingESNMaster, ReceivingDevice: this.receivingDevice, UIData: this.uiData };
            const url = String.Join("/", this.apiConfigService.getDetermineSKUsUrl, encodeURIComponent(encodeURIComponent(this.selectedSKU)));
            this.apiservice.apiPostRequest(url, requestObj)
                .subscribe(response => {
                    let res = response.body;
                    this.spinner.hide();
                    if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                        this.skus = res.Response.SKUs;
                        if (!checkNullorUndefined(this.receivingDevice)) {
                            this.receivingDevice.DeviceSKU = this.selectedSKU;
                        }

                        this.sku = res.Response.SKUs[0];
                        this.onErroralert = false;
                        if (this.skus.length == 1) {
                            this.showSku = false;
                            this.SKU = this.skus[0].Sku;
                            this.selectedSKU = this.skus[0].Sku;
                            this.selectedSKUModel = this.skus[0].Model;
                            if (!checkNullorUndefined(this.rmtypeaheadChild)) {
                                this.rmtypeaheadChild.skuDisabled = true;
                            }
                            this.skuDisabled = true;
                            this.getReceiptDetail((data) => {
                                if (!checkNullorUndefined(data) && data.Status == this.statusCode.pass) {
                                    // this.GetReceiptDetail.ReceiptDetail = data.Response.ReceiptDetail;
                                    if (data.Response.ReceiptDetail) {
                                        this.receiptDetail = data.Response.ReceiptDetail;
                                    } else {
                                        this.receiptDetail = new ReceiptDetail();
                                    }
                                    if (!checkNullorUndefined(data.Response.ReceiptDetail)) {
                                        this.selectedExternLineNo = data.Response.ReceiptDetail.ExternLineno;
                                    }
                                    this.receivedQuantity = data.Response.ReceivingQuantity;
                                    this.isreceivedQuantity = true;
                                    if (data.Response.ReadyForProcess == "Y") {
                                        if (data.StatusMessage != "") {
                                            this.appErrService.setAlert(data.StatusMessage, true, MessageType.info);
                                        }
                                        this.loadReceivingvalues();
                                    }
                                    else if (data.Response.ReadyForProcess == "N") {
                                        if (data.StatusMessage != "") {
                                            this.appErrService.setAlert(data.StatusMessage, true, MessageType.info);
                                        }
                                        this.serialNumberFocus();
                                    }
                                }
                                if (!checkNullorUndefined(data) && data.Status == this.statusCode.fail) {
                                    this.skuDisabled = false;
                                    if (!checkNullorUndefined(this.rmtypeaheadChild)) {
                                        this.rmtypeaheadChild.skuDisabled = false;
                                        this.rmtypeaheadChild.applySelect();
                                    }
                                    this.appErrService.setAlert(data.ErrorMessage.ErrorDetails, true);
                                }
                            });
                        }
                        else {
                            this.showSku = true;
                            this.selectedExternLineNo = "";
                            this.skuReset();
                            this.skuClear()
                            this.skuFocus();
                            this.onInfoalert = true;
                            if (res.StatusMessage != "") {
                                this.appErrService.setAlert(res.StatusMessage, true);
                            }

                        }
                    }
                    if (!checkNullorUndefined(res) && res.Response == true && res.Status === this.statusCode.fail) {
                        this.showSku = true;
                        this.skuDisabled = false;
                        if (!checkNullorUndefined(this.rmtypeaheadChild)) {
                            this.rmtypeaheadChild.skuDisabled = false;
                            this.rmtypeaheadChild.applySelect();
                        }
                        this.skuFocus();
                        this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true, MessageType.info);
                        this.onInfoalert = true;
                    }
                    if (!checkNullorUndefined(res) && res.Response == false && res.Status === this.statusCode.fail) {
                        this.editSerialNumber = true;
                        this.editauthorizationkey = true;
                        this.showSku = true;
                        this.skuDisabled = false;
                        this.showauthorizationkey = false;
                        this.selectedSKUModel = "";
                        this.skuFocus();
                        this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                    }

                }, erro => {
                    this.handleAppError(erro);
                });
        }
        else {
            this.rmtypeaheadChild.applyRequired(true);
        }
    }
    //Get Eligible skus
    getEligibleSKUs(value) {
        if (!checkNullorUndefined(value)) {
            this.onInfoalert = false;
            let skuValue = value.trim().toUpperCase();
            this.selectedSKUModel = "";
            if (value.length >= 3) {
                let requestObj = { ClientData: this.clientData, UIData: this.uiData };
                const url = String.Join("/", this.apiConfigService.getEligibleSKUsUrl, encodeURIComponent(encodeURIComponent(skuValue)));
                this.apiservice.apiPostRequest(url, requestObj)
                    .subscribe(response => {
                        let res = response.body;
                        if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                            this.skus = res.Response;
                            if (!checkNullorUndefined(this.rmtypeaheadChild)) {
                                this.rmtypeaheadChild.typeaheadOptionsLimit = this.skus.length;
                            }
                            this.onErroralert = false;
                            this.appErrService.setAlert('', false);
                        } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                            this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                            this.onErroralert = true;
                        }
                    }, erro => {
                        this.handleAppError(erro);
                    });
            } else {
                this.skus = [];
            }
        } else {
            this.skus = [];
        }
    }

    //getReceiptDetail
    getReceiptDetail(callback: (data) => void, fromValidSerialNumber = false) {
        this.spinner.show();
        // this.GetReceiptDetail.ClientData = this.clientData;
        let requestObj = { ClientData: this.clientData, Receipt: this.receipt, ReceivingDevice: this.receivingDevice, ReceiptDetail: this.receiptDetail, SKU: this.sku, UIData: this.uiData }
        const url = String.Join('/', this.apiConfigService.getReceiptDetailUrl);
        return this.apiservice.apiPostRequest(url, requestObj)
            .subscribe(response => {
                let res = response.body;
                if (!fromValidSerialNumber) this.spinner.hide();
                callback(res);
            }, erro => {
                this.appErrService.handleAppError(erro);
            });
    }

    //coming from receipt detail popup
    editReceiptDetails(event) {
        this.clearReceiptLine();
        //this.GetReceiptDetail.ReceiptDetail = event;
        this.receiptDetail = event;
        this.selectedExternLineNo = event.ExternLineno;
        this.SKU = event.SKU;
        this.selectedSKU = event.SKU;
        if (!checkNullorUndefined(this.rmtypeaheadChild)) {
            this.rmtypeaheadChild.SKU = event.SKU;
            this.rmtypeaheadChild.selectedSKU = event.SKU;
        }
        //this.setConditionCode(event.ConditionCode);
        this.isreceivedQuantity = true;
        this.getDetermineSKUs();
        this.dialogRef.close();
        this.appErrService.clearAlert();
    }

    //Emiting from rmtypehead after selecting option
    typeaheadResponse(event) {
        this.selectedSKUModel = event.item.Model;
        this.selectedSKU = event.item.Sku;
        this.skuDisabled = true;
        this.skus = [];
        this.getDetermineSKUs();
    }

    setAttributeValues() {
        if (!checkNullorUndefined(this.attributesCtrl)) {
            Object.keys(this.attributesCtrl.control.controls).forEach(element => {
                if (this.attributesCtrl.control.controls[element].value instanceof Date) {
                    this.SnAttributes[element] = this.datepipe.transform(this.attributesCtrl.control.controls[element].value, 'MM/yy');
                } else {
                    this.SnAttributes[element] = this.attributesCtrl.control.controls[element].value;
                }
            })
            this.receivingDevice.SnAttributes = this.SnAttributes;
        }
    }


    //SKU reset
    skuReset() {
        this.skuDisabled = false;
        this.skuFocus();
        this.skus = [];
        this.selectedSKUModel = "";
        this.selectedSKU = "";
        this.receivedQuantity = "";
        this.isreceivedQuantity = false;
    }

    //SKU control clear
    skuClear() {
        if (!checkNullorUndefined(this.rmtypeaheadChild)) {
            this.rmtypeaheadChild.SKU = "";
            this.rmtypeaheadChild.selectedSKU = "";
            this.rmtypeaheadChild.skuDisabled = false;
            this.rmtypeaheadChild.selectedSKUModel = "";
        }
    }
    /*SKU logic end*/

    /*Calling loadreceivingvalues,processDevice,loadReceivingProgramValues,getRoute,getTransactions logic start */

    //Load receiving values
    loadReceivingvalues() {
        this.spinner.show();
        this.receivingDevice.DeviceSKU = (!checkNullorUndefined(this.SKU) && this.SKU !== "") ? this.SKU : this.selectedSKU;
        this.receivingDevice.ModelName = this.selectedSKUModel;
        this.receivingDevice.Clientid = localStorage.getItem(this.storageData.clientId);
        this.receivingDevice.Location = localStorage.getItem(this.storageData.location);
        this.receivingDevice.Step = this.masterPageService.operation;
        let requestObj = { ClientData: this.clientData, ReceivingDevice: this.receivingDevice, ReceivingESNMaster: this.receivingESNMaster, UIData: this.uiData, ReceiptDetail: this.receiptDetail, Receipt: this.receipt };
        const url = String.Join("/", this.apiConfigService.loadReceivingvalues);
        this.apiservice.apiPostRequest(url, requestObj)
            .subscribe(response => {
                let res = response.body;
                if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                    this.receivingDevice = res.Response;
                    this.processDevice();
                } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                    this.spinner.hide();
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                    this.onErroralert = true;
                }
            }, erro => {
                this.handleAppError(erro);
            });
    }

    //Process device
    processDevice() {
        this.receivingService.updatedReceipt.ExternReceiptkey = this.authorizationkey;
        // this.receiving.Receipt = this.receivingService.updatedReceipt;
        this.receipt = this.receivingService.updatedReceipt;
        // this.receiving.ClientData = this.clientData;
        let requestObj = { ClientData: this.clientData, ReceivingDevice: this.receivingDevice, Receipt: this.receipt, UIData: this.uiData };
        const url = String.Join("/", this.apiConfigService.processDeviceUrl);
        this.apiservice.apiPostRequest(url, requestObj)
            .subscribe(response => {
                let res = response.body;
                if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                    this.receipt = res.Response.Receipt;
                    this.receivingDevice = res.Response.ReceivingDevice;
                    if (res.Response.ReceivingDevice.ProgramName != "") {
                        this.loadReceivingProgramValues();
                    }
                    else {
                        this.getRoute();
                    }
                } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                    this.spinner.hide();
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                    this.onErroralert = true;
                }
            }, erro => {
                this.handleAppError(erro);
            });
    }

    //Load program values
    loadReceivingProgramValues() {
        let requestObj = { ClientData: this.clientData, ReceivingDevice: this.receivingDevice, Receipt: this.receipt, UIData: this.uiData };
        const url = String.Join("/", this.apiConfigService.loadReceivingProgramValuesUrl, this.receivingDevice.ProgramName, this.masterPageService.operation);
        // this.apiservice.apiPostRequest(url, this.receiving)
        this.apiservice.apiPostRequest(url, requestObj)
            .subscribe(response => {
                let res = response.body;
                if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                    this.receipt = res.Response.Receipt;
                    this.receivingDevice = res.Response.ReceivingDevice;
                    this.getRoute();
                } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                    this.spinner.hide();
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                    this.onErroralert = true;
                }
            }, erro => {
                this.handleAppError(erro);
            });
    }

    //Getroute
    getRoute() {
        // let requestObj = { ClientData: this.clientData, Device: this.receiving.ReceivingDevice };
        let requestObj = { ClientData: this.clientData, Device: this.receivingDevice, UIData: this.uiData };
        const url = String.Join("/", this.apiConfigService.getRouteUrl);
        this.apiservice.apiPostRequest(url, requestObj)
            .subscribe(response => {
                let res = response.body;
                if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                    // this.receiving.ReceivingDevice = res.Response;
                    this.receivingDevice = res.Response;
                    this.getTransactions();
                } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                    this.spinner.hide();
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                    this.onErroralert = true;
                }
            }, erro => {
                this.handleAppError(erro);
            });
    }

    //Get transactions
    getTransactions() {
        // let requestObj = { ClientData: this.clientData, Device: this.receiving.ReceivingDevice };
        let requestObj = { ClientData: this.clientData, Device: this.receivingDevice, UIData: this.uiData };
        const url = String.Join("/", this.apiConfigService.getTransaction);
        this.apiservice.apiPostRequest(url, requestObj)
            .subscribe(response => {
                let res = response.body;
                this.spinner.hide();
                if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                    res.Response.Trans.map((val) => val.Result = 'PASS');
                    this.showEsn = true;
                    this.showSuggestedContainer = true;
                    this.listofTransactions = res.Response;
                    this.isContainerDisabled = false;
                    this.isSNPrintDisabled = false;
                    this.isClearContainerDisabled = false;
                    this.configContainerProperties();
                    this.containerFocus();
                } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                    this.showSku = true;
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                    this.onErroralert = true;
                }
            }, erro => {
                this.handleAppError(erro);
            });
    }
    /*Calling loadreceivingvalues,processDevice,loadReceivingProgramValues,getRoute,getTransactions logic end*/

    /*Container suggestion business control emiting methods start*/

    //GetSuggestContainer sending receive device to child conatiner
    getSuggestContainer(value) {
        this.containerFocus();
        if (checkNullorUndefined(value)) {
            this.isContainerDisabled = false;
            this.configContainerProperties();
            // this.childContainer.getSuggestContainer(this.receiving.ReceivingDevice);
            this.childContainer.getSuggestContainer(this.receivingDevice);
        } else {
            this.clearContainerID();
            this.configContainerProperties();
            //this.childContainer.getSuggestContainer(this.receiving.ReceivingDevice);
            this.childContainer.getSuggestContainer(this.receivingDevice);
        }
    }

    //GetSuggestContainer Response
    getSuggestContainerResponse(response) {
        this.showAdd = false;
        this.container = response;
        if (!checkNullorUndefined(response.ContainerID) && response.ContainerID != "") {
            this.islpnContainerPrintDisabled = false;
            // let requestObj = { ClientData: this.clientData, Device: this.receivingDevice, Container: this.container };
            // this.createLabel(requestObj);
        }
        this.receivingDevice.ContainerCycle = response.ContainerCycle;
    }

    //ValidateContainer and sending updated device to child validateContainer
    validateContainer(response) {
        this.receivingDevice.ContainerID = response.ContainerID;
        this.receivingDevice.ContainerCycle = response.ContainerCycle;
        this.childContainer.validateContainer(this.receivingDevice);
    }

    //Validate container response
    validateContainerResponse(response) {
        if (!checkNullorUndefined(response)) {
            this.container = response;
            this.isContainerValid = true;
            this.showAdd = true;
            this.receivingDevice.ContainerCycle = response.ContainerCycle;
            this.receivingDevice.ContainerID = response.ContainerID;
            if (!checkNullorUndefined(this.rf) && this.rf.valid) {
                this.mfgDateCheck = true;
            }
            if (this.appService.checkDevice()) {
                // this.printLabel();
                this.isAddDisabled = false;
                this.addSerialNumber();

            }
            if (!checkNullorUndefined(this.rf) && this.rf.valid) {
                // this.printLabel();
                this.isAddDisabled = false;
                this.addSerialNumber();  //lpn not suggested
            }
        }
        else {
            if (this.appService.checkDevice()) {
                //this.printLabel();
                this.addSerialNumber();
            }
            if (!checkNullorUndefined(this.rf) && this.rf.valid) {
                //this.printLabel();
                this.addSerialNumber();
            } else {
                this.spinner.hide();
            }
        }
    }

    //input match
    checkContainer(container) {
        if (!checkNullorUndefined(container)) {
            this.showAdd = true;
            this.isAddDisabled = false;
            this.mfgDateCheck = true;
            this.receivingDevice.ContainerID = container.ContainerID;
            this.receivingDevice.ContainerCycle = container.ContainerCycle;
            if (!checkNullorUndefined(this.deviceOrigination) && this.deviceOrigination != '') {
                this.receivingDevice.Origination = this.deviceOrigination;
            }
        }
        else {
            this.isAddDisabled = true;
            this.mfgDateCheck = false;
        }
    }
    //Configure the child container properties
    configContainerProperties() {
        if (!checkNullorUndefined(this.childContainer)) {
            this.childContainer.isContainerDisabled = false;
            this.childContainer.isClearContainerDisabled = false;
        }
    }

    //Clear container ID
    clearContainerID() {
        this.mfgDateCheck = false;
        if (!checkNullorUndefined(this.childContainer)) {
            let container = this.childContainer;
            container.ContainerID = "";
            container.suggestedContainer = "";
            container.categoryName = "";
            container.isContainerDisabled = true;
            container.isClearContainerDisabled = true;
            container.applyRequired(false);
        }
    }
    /*Container suggestion business control emiting methods end*/

    // printLabel() {
    //   if (!this.isAddDisabled && !checkNullorUndefined(this.rf)  && this.rf.valid ) {
    //     this.setAttributeValues();
    //     this.receiveSerialNumbder();
    //   }
    //   else if(this.appService.checkDevice() && this.isAddDisabled ){
    //     this.receiveSerialNumbder();
    //   }
    // }

    // receiveSerialNumbder(){
    //   let requestObj = { ClientData: this.clientData, ReceivingDevice: this.receivingDevice, Container: this.container };
    //     this.createLabel(requestObj);
    //     this.addSerialNumber();
    // }


    /* Add serial number logic start */

    //Add SerialNumber
    addSerialNumber() {
        if (this.isAddDisabled == false) {
            this.spinner.show();
            this.receivingDevice.ReprintLabel = this.ESNReprint == true ? "Y" : "N";
            let isMobile = this.appService.checkDevice();
            this.setAttributeValues();
            let requestObj = { ClientData: this.clientData, ReceivingDevice: this.receivingDevice, Receipt: this.receipt, Container: this.container, UIData: this.uiData };
            const url = String.Join("/", this.apiConfigService.addSerialNumberUrl, isMobile.toString(), this.selectedExternLineNo);

            this.apiservice.apiPostRequest(url, requestObj)
                .subscribe(response => {
                    let res = response.body;
                    if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                        this.snackbar.success(res.StatusMessage);
                        this.receipt = new Receipt();
                        this.receipt = res.Response.Receipt;
                        this.receivingService.updatedReceipt = res.Response.Receipt;
                        this.receivingDevice = res.Response.ReceivingDevice;
                        this.receivingService.onDetailPopupJsonGrid(res.Response.Receipt.ReceiptDetail);
                        this.receivingService.ReceiptDetails = this.appService.onGenerateJson(this.receivingService.ReceiptDetailResponse, this.grid);
                        this.ESNReprint = false;
                        //this.authorizationkey = "";
                        this.saveTransaction();
                        this.updateLottables();
                        this.Clear();
                    } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                        this.spinner.hide();
                        this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                        this.onErroralert = true;
                    }
                }, erro => {
                    this.handleAppError(erro);
                });
        }

    }
    updateLottables() {
        this.spinner.show();
        this.lottableTrans = new LottableTrans();
        let headerobj = Object.keys(this.lottableTrans);
        headerobj.forEach(res => {
            if (res) {
                this.lottableTrans[res] = this.receiptDetail[res];
            }
        })
        let requestObj = { ClientData: this.clientData, UIData: this.uiData, Device: this.receivingDevice, LottableTrans: this.lottableTrans };
        this.apiservice.apiPostRequest(this.apiConfigService.updateLottables, requestObj)
            .subscribe(response => {
                let res = response.body;
                this.spinner.hide();
                if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                    if (res.Response.Receipts && res.Response.Receipts.Receipttrans) {
                        const transGrid = new Grid();
                        transGrid.ItemsPerPage = this.appConfig.receiving.griditemsPerPage.receiptTrans;
                        this.receivingService.onReceiptTransGenerateJsonGrid(res.Response.Receipts.Receipttrans);
                        this.receivingService.ReceiptTrans = this.appService.onGenerateJson(this.receivingService.ReceiptTransResponse, transGrid);
                    }
                }
                else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                }
            }, erro => {
                this.handleAppError(erro);
            });

    }
    //Post Receipt
    postReceipt() {
        this.spinner.show();
        let requestObj = { ClientData: this.clientData, Receipt: this.receipt, UIData: this.uiData };
        const url = String.Join('/', this.apiConfigService.receiptPostUrl)
        this.apiservice.apiPostRequest(url, requestObj)
            .subscribe(response => {
                let res = response.body;
                this.spinner.hide();
                if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                    const postUrl = String.Join('/', this.apiConfigService.postRecUpdateProcess);
                    this.commonService.postUpdateProcess(postUrl, requestObj);
                    this.snackbar.success(res.Response);
                    this.receipt = new Receipt();
                    this.gotoReceiveSearch();
                } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                }
            }, erro => {
                this.handleAppError(erro);
            });
    }




    //Receipt clear
    receiptClear() {
        if (!checkNullorUndefined(this.receiptkey) && this.receiptkey != "") {
            this.spinner.show();
            let requestObj = { ClientData: this.clientData, UIData: this.uiData };
            const url = String.Join("/", this.apiConfigService.receiptClearUrl, this.receiptkey);
            this.apiservice.apiPostRequest(url, requestObj)
                .subscribe(response => {
                    let res = response.body;
                    this.spinner.hide();
                    if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
                        this.receipt = new Receipt();
                        this.dialogRef.close();
                        this.snackbar.success(res.Response);
                        this.gotoReceiveSearch();
                    } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                        this.dialogRef.close();
                        this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true)
                    }
                }, erro => {
                    this.handleAppError(erro);
                }
                );
        }
    }

    //Save transactions after add serial number
    saveTransaction() {
        let requestObj = { ClientData: this.clientData, Transactions: this.listofTransactions, UIData: this.uiData, Device: this.receivingDevice, TestResultDetails: {} };
        const url = String.Join("/", this.apiConfigService.saveTransaction);
        this.apiservice.apiPostRequest(url, requestObj)
            .subscribe(response => {
                let res = response.body;
                this.clearObjects();
                if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                    this.onErroralert = true;
                }
            }, erro => {
                this.handleAppError(erro);
            });
    }
    /* Add serial number logic start */


    /* Focus on controls*/

    //Serial number focus
    serialNumberFocus() {
        this.appService.setFocus('serialNumber');
    }

    //Authorization focus
    authFocus() {
        this.appService.setFocus('inputAuthorization');
    }

    //SKU focus
    skuFocus() {
        this.appService.setFocus('skuInputid');
    }
    //Container suggestion focus
    containerFocus() {
        this.appService.setFocus('containerInputId');
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
        this.attribute1 = "";
        this.attribute2 = "";
        this.attribute3 = "";
        //this.attribute5 = "";
        this.selectedExternLineNo = "";
        this.clearEditmode();
        if (!this.appService.checkDevice()) {
            this.appService.setFocus(this.focusId);
        }
        else {
            this.authorizationkey = "";
            this.serialNumberFocus();
        }
        this.clearObjects();
        if (!checkNullorUndefined(this.attributesCtrl)) {
            this.appService.applyRequired(false, 'attribute1');
        }
    }

    //From Badges to TextBox Controlls
    clearEditmode() {
        this.showauthorizationkey = false;
        this.showSku = false;
        this.showEsn = false;
        this.showSuggestedContainer = false;
        this.showAdd = false;
        this.editSerialNumber = false;
        this.editauthorizationkey = false;
    }
    //Receive Desktop

    conditionCodeData() {
        this.conditionCodeOptions = [
            { Id: "1", Text: 'USD' }
        ];
        return this.conditionCodeOptions;
    }

    changeConditionCode(event: any) {
        this.conditionCodeId = event.value;
        this.conditionCode = event.source.selected.viewValue;
        this.receivingDevice.ConditionCode = this.conditionCode;

    }
    clearConditionCode() {
        this.conditionCodeId = this.conditionCodeOptions[-1]
        this.conditionCode = "";
        this.receivingDevice.ConditionCode = this.conditionCode;
    }

    clearReceiptLine() {
        this.serialNumber = "";
        if (!checkNullorUndefined(this.inputSerial)) {
            this.inputSerial.disabled = false;
        }
        this.SKU = "";
        this.selectedSKUModel = "";
        this.receivedQuantity = "";
        this.receivingDevice = new ReceivingDevice();
        this.clearContainerID();
    }

    setConditionCode(val) {
        if (val != "") {
            let condtionCodeResult = this.conditionCodeOptions.find((code, i) => {
                if (code.Text == val) {
                    return code;
                }
            });
            this.conditionCodeId = condtionCodeResult.Id
            this.conditionCode = condtionCodeResult.Text;
        } else {
            this.conditionCode = val;
        }
    }

    // Modal Popup
    openModal(template: TemplateRef<any>, status: any, modalclass: any) {
        this.dialogRef = this.dialog.open(template, { hasBackdrop: true, disableClose: true, panelClass: modalclass })
        this.utilityTitle = status;
        if (this.utilityTitle == 'receiptdetails') {
            this.modeltitle = "Receipt Details";
        }
        if (this.utilityTitle == 'serialnumberrecover') {
            this.modeltitle = "Recover Serial Number";
        }
        if (this.utilityTitle == 'confirmDelete') {
            this.modeltitle = "Confirm Delete";
        }

    }

    serialNumberPrint() {
        this.receivingDevice.ReprintLabel = "Y";
        let requestObj = { ClientData: this.clientData, ReceivingDevice: this.receivingDevice, UIData: this.uiData };
        this.createLabel(requestObj);
    }

    lpnContainerPrint() {
        this.setAttributeValues();
        let requestObj = { ClientData: this.clientData, ReceivingDevice: this.receivingDevice, Container: this.container, UIData: this.uiData };
        this.createLabel(requestObj);
    }

    //CreateLabel
    createLabel(requestObj) {
        this.spinner.show();
        //let operation = this.receivingDevice.Step;
        const url = String.Join('/', this.apiConfigService.receivecreateLabelUrl, this.masterPageService.operation);
        this.apiservice.apiPostRequest(url, requestObj)
            .subscribe(res => {
                this.spinner.hide();
                if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
                    this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
                }

            }, erro => {
                this.appErrService.handleAppError(erro);
            });
    }

    clearObjects() {
        this.receivingDevice = new ReceivingDevice();
        this.receivingESNMaster = new ReceivingESNMaster();
        this.sku = new SKU();
        this.container = new Container();
        this.receiptDetail = new ReceiptDetail();
        // this.printLabel = new PrintLabel();
        if (this.appService.checkDevice()) {
            this.receipt = new Receipt();
        }
    }
    //error Emit for container suggestion
    errorEmit(val) {
        this.onErroralert = val;
        if (val == false)
            this.showAdd = false;
        this.isAddDisabled = true;
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
        this.selectedExternLineNo = "";
        this.receivingService.ReceiptTransResponse = [];
        this.receiptkey = "";
        this.receivingService.updatedReceipt = new Receipt();
        if (this.dialogRef) {
            this.dialogRef.close();
        }
        this.masterPageService.moduleName.next(null);
        this.masterPageService.callerUrl = "";
        this.masterPageService.showUtilityIcon = false;
        if (!checkNullorUndefined(this.originationOperation) && this.originationOperation) {
            this.originationOperation.unsubscribe();
        }
        this.masterPageService.clearOriginationSubscription();
        if (this.masterPageService.hideControls.controlProperties) {
            this.masterPageService.hideControls.controlProperties = new EngineResult();
        }
        this.masterPageService.hideModal();
    }

    handleAppError(erro) {
        let userMessage = new Message();
        if (erro.status == 0) {
            this.messageNum = "2660039";
            this.messageType = MessageType.failure;
            userMessage = this.messagingService.SendUserMessage(this.messageNum, this.messageType);
            this.onErroralert = true;
            this.appErrService.setAlert(userMessage.messageText, true);
            this.appErrService.applicationError(erro, userMessage.messageText);
        }
        else {
            this.appErrService.setAlert(erro.statusText, true);
            this.onErroralert = true;
            this.appErrService.applicationError(erro);
        }

    }

    mfgValueChange(value) {
        if (!checkNullorUndefined(value) && value != '') {
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
                    if (!checkNullorUndefined(this.rf) && this.rf.valid && this.mfgDateCheck) {
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
            if (!checkNullorUndefined(this.rf) && this.rf.valid && this.mfgDateCheck) {
                this.isAddDisabled = false;
            }
        }
    }

    mfgInputChange($event, dp1: any) {
        dp1.hide();
        if ($event.value == '') {
            let inputSerialNumber = <HTMLInputElement>document.getElementById('attribute1');
            if (inputSerialNumber) {
                inputSerialNumber.blur();
            }
            this.appService.applyRequired(false, 'attribute1');
            this.appErrService.clearAlert();
        }
    }

}
