import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter, OnDestroy, Input } from '@angular/core';
import { RmtextboxComponent } from '../../framework/frmctl/rmtextbox/rmtextbox.component';
import { BsModalRef } from 'ngx-bootstrap';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ApiService } from '../../utilities/rlcutl/api.service';
import { ApiConfigService } from '../../utilities/rlcutl/api-config.service';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { Message } from '../../models/common/Message';
import { MessageType } from '../../enums/message.enum';
import { MessagingService } from '../../utilities/rlcutl/messaging.service';
import { String, StringBuilder } from 'typescript-string-operations';
//import { Receiving } from '../../models/receiving/Receiving';
import { AppService } from '../../utilities/rlcutl/app.service';
import { MasterPageService } from './../../utilities/rlcutl/master-page.service';
import { Grid } from './../../models/common/Grid';
import { ReceivingService } from '../../services/receiving.service';
import { ClientData } from '../../models/common/ClientData';
import { ReceivingDevice } from '../../models/receiving/ReceivingDevice';
import { Receipt } from './../../models/receiving/Receipt';
import { UiData } from '../../models/common/UiData';
import { StorageData } from '../../enums/storage.enum';
import { StatusCodes } from '../../enums/status.enum';
import { checkNullorUndefined } from '../../enums/nullorundefined';

@Component({
  selector: 'serialnumber-recover',
  templateUrl: './serialnumber-recover.component.html',
  styleUrls: ['./serialnumber-recover.component.css']
})
export class SerialnumberRecoverComponent implements OnInit, OnDestroy {

  @ViewChild('inputRecoverSerial') inputRecoverSerial: ElementRef;
  @ViewChild(RmtextboxComponent) rmtextchild: RmtextboxComponent;
  @Output() emitModalClose = new EventEmitter();
  @Output() deleteSerialNumberData = new EventEmitter();
  @Input() tittle: string;
  @Input() uiData: UiData;
  @Input() receiptkey: string;
  flag = true;

  // modal popup
  modalRef: BsModalRef;

  //form
  recoverSerialNumberForm: FormGroup;

  //recover serialnumber variables
  recoverSKU: string;
  recoverAuthorizationkey: string;
  isRecoverSerNumDisable: boolean = false;
  isRecoverdeletebtnDisable: boolean = true;
  //recoverDevice: Receiving;
  recoverSerialNumber: string;
  isClearBtnDisable: boolean = true;

  //alert varibale
  text: string;
  showAlert: boolean = false;
  messagesCategory: string;
  messageType: string;
  messageNum: string;
  clientData = new ClientData();


  receivingDevice = new ReceivingDevice();
  receipt = new Receipt();
  operationObj: any;

  //grid
  grid: Grid;
  appConfig: any;
  storageData = StorageData;
  statusCode = StatusCodes;
  controlConfig: any;

  constructor(private form: FormBuilder,
    private apiService: ApiService,
    private apiConfigService: ApiConfigService,
    public appErrService: AppErrorService,
    private spinner: NgxSpinnerService,
    private snackbar: XpoSnackBar,
    private messagingService: MessagingService,
    private masterPageService: MasterPageService,
    private receivingService: ReceivingService,
    public appService: AppService) { }

  ngOnInit() {
    if (this.masterPageService.operationObj) {
      this.uiData = new UiData();
      this.uiData.OperationId = this.masterPageService.operationObj.OperationId;
      this.uiData.OperCategory = this.masterPageService.operationObj.Category;
      this.controlConfig = JSON.parse(localStorage.getItem(StorageData.controlConfig));
    }
    this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
    this.appConfig = JSON.parse(localStorage.getItem(this.storageData.appConfig));
    this.buildForm();
    this.clearAlert();
    this.recoverSerialNumberFocus();
  }

  //configure form
  buildForm() {
    return this.recoverSerialNumberForm = this.form.group({
      recoverSerialNumber: [],
    })
  }

  //validating recover serial number

  validateDeleteSerialNumber(inpcontrol: RmtextboxComponent, serialNumber) {
    if (!checkNullorUndefined(serialNumber) && serialNumber !== "") {
      this.spinner.show();
      let userMessage = new Message();
      let requestObj = { ClientData: this.clientData, UIData: this.uiData }
      const url = String.Join("/", this.apiConfigService.validateDeleteSerialNumber, serialNumber, this.receiptkey);
      this.apiService.apiPostRequest(url, requestObj)
        .subscribe(response => {
          let res = response.body;
          this.spinner.hide();
          if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
            this.receivingDevice = res.Response.ReceivingDevice;
            this.receipt = res.Response.Receipt;
            this.recoverSKU = this.receivingDevice.DeviceSKU;
            this.recoverAuthorizationkey = this.receipt.ExternReceiptkey;
            this.isRecoverSerNumDisable = true;
            this.isRecoverdeletebtnDisable = false;
            this.deleteFocus();
            inpcontrol.applyRequired(false);
          }
          else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
            this.text = res.ErrorMessage.ErrorDetails;
            this.showAlert = true;
            this.snackbar.error(this.text);
            inpcontrol.applySelect();
            inpcontrol.applyRequired(true);
          } else {
            this.showAlert = false;
          }
        }, erro => {
          inpcontrol.applyRequired(true);
          this.appErrService.handleAppError(erro, false);
          this.showAlert = true;
          this.text = this.appErrService.emiterrorvalue;
        });
    } else {
      inpcontrol.applyRequired(true);
    }
  }


  //delete serial number
  deleteSerialNumber() {
    if (this.recoverSerialNumber) {
      this.clearAlert();
      let requestObj = { ClientData: this.clientData, ReceivingDevice: this.receivingDevice, Receipt: this.receipt, UIData: this.uiData };
      const url = String.Join("/", this.apiConfigService.deleteSerialNumberUrl);
      this.apiService.apiPostRequest(url, requestObj)
        .subscribe(response => {
          let res = response.body;
          if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
            this.receivingService.updatedReceipt = res.Response;
            // this.masterPageService.ReceiptDetails =res.Response.ReceiptDetail;
            // this.masterPageService.ReceiptTrans =res.Response.ReceiptTrans;
            this.grid = new Grid();
            this.grid.ItemsPerPage = this.appConfig.default.griditemsPerPage;
            this.grid.EditVisible = true;
            this.receivingService.onDetailPopupJsonGrid(res.Response.ReceiptDetail);
            this.receivingService.ReceiptDetails = this.appService.onGenerateJson(this.receivingService.ReceiptDetailResponse, this.grid);
            const receiptTransGrid = new Grid();
            this.deleteSerialNumberData.emit(this.recoverSerialNumber);
            receiptTransGrid.ItemsPerPage = this.appConfig.receiving.griditemsPerPage;
            this.receivingService.onReceiptTransGenerateJsonGrid(res.Response.Receipttrans);
            this.receivingService.ReceiptTrans = this.appService.onGenerateJson(this.receivingService.ReceiptTransResponse, receiptTransGrid);
            this.snackbar.success(res.StatusMessage);
            this.clearRecoverSerial();
          } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
            this.text = res.ErrorMessage.ErrorDetails;
            this.showAlert = true;
            this.snackbar.error(this.text);
          }
        }, erro => {
          this.appErrService.handleAppError(erro, false);
          this.showAlert = true;
          this.text = this.appErrService.emiterrorvalue;
        });
    }
  }


  //clearEmit
  clearEmit(value) {
    this.isClearBtnDisable = value;
  }

  //change input box
  changeInput(inputControl: RmtextboxComponent) {
    inputControl.applyRequired(false);
    this.isClearBtnDisable = false;
    this.clearAlert();
    this.appErrService.clearAlert();
  }
  //input change 
  onControllerChange(inputControl) {
    inputControl.applyRequired(false);
    this.clearAlert();
    this.appErrService.clearAlert();
  }


  //clear recover serial number
  clearRecoverSerial() {
    this.recoverSKU = "";
    this.recoverSerialNumber = "";
    this.recoverAuthorizationkey = "";
    this.isRecoverSerNumDisable = false;
    this.isRecoverdeletebtnDisable = true;
    this.isClearBtnDisable = true;
    this.clearAlert();
    this.recoverSerialNumberFocus();
  }

  //recover serial number focus
  recoverSerialNumberFocus() {
    this.appService.setFocus('recoverSerialNumber');
  }


  //delete button focus
  deleteFocus() {
    this.appService.setFocus('deleteSerialNumberInput');
  }

  //clearAlert
  clearAlert() {
    this.showAlert = false;
    this.text = "";
    this.appErrService.specialCharErrMsg = "";
    this.appErrService.clearAlert();
  }

  ngOnDestroy() {
    this.clearAlert();
    this.masterPageService.hideModal();
  }

}
