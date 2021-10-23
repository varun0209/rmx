import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { AppErrorService } from '../../../../utilities/rlcutl/app-error.service';
import { RmtextboxComponent } from '../../../frmctl/rmtextbox/rmtextbox.component';
import { AppService } from '../../../../utilities/rlcutl/app.service';
import { MasterPageService } from '../../../../utilities/rlcutl/master-page.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ClientData } from '../../../../models/common/ClientData';
import { UiData } from '../../../../models/common/UiData';
import { StorageData } from '../../../../enums/storage.enum';
import { ApiConfigService } from '../../../../utilities/rlcutl/api-config.service';
import { String } from 'typescript-string-operations';
import { ApiService } from './../../../../utilities/rlcutl/api.service';
import { StatusCodes } from '../../../../enums/status.enum';
import { CommonService } from '../../../../services/common.service';
import { TraceTypes } from '../../../../enums/traceType.enum';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { FindTraceHoldComponent } from '../../find-trace-hold/find-trace-hold.component';
import { ContainerSuggestionComponent } from '../../../../framework/busctl/container-suggestion/container-suggestion.component';
import { Container } from './../../../../models/common/Container';
import { ListofTransactions } from '../../../../models/common/ListofTransactions';
import { AudioType } from './../../../../enums/audioType.enum';
import { InvMove } from '../../../../models/common/InvMove';
import { DropDownSettings } from '../../../../models/common/dropDown.config';
import { CommonEnum } from '../../../../enums/common.enum';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-serial-inventory-move',
  templateUrl: './serial-inventory-move.component.html',
  styleUrls: ['./serial-inventory-move.component.css']
})
export class SerialInventoryMoveComponent implements OnInit, OnDestroy {

  @ViewChild(ContainerSuggestionComponent) childContainer: ContainerSuggestionComponent;
  @ViewChild(RmtextboxComponent) rmtextchild: RmtextboxComponent;

  @Input() clientData = new ClientData();
  @Input() uiData = new UiData();
  invMoveObject = new InvMove();

  showAlert = false;
  serialNumber = '';
  locationId = '';
  suggestedContainerID = '';
  isSerialNumDisabled = false;
  isLocationDisabled = true;
  isClearDisabled = true;
  text: string;
  isMoveDisabled = true;
  validMoveSerialNumberResponse: any;
  serialNumberMoveDevice: any;
  controlConfig: any;
  inBoundcontainer = new Container();
  locationObj: any = {};
  inbContainerId: string;
  containerInvAccount = '';
  locationInvAccount = '';
  listofTransactions: ListofTransactions;

  // reason code
  isReasonCodeDisabled = true;
  reasonCodeOptions = [];
  dropdownSettings: DropDownSettings;
  reasonCode = [];
  reasonCodeList = [];
  reasonCodeObj: any = {};
  dialogRef: any;

  constructor(
    public appErrService: AppErrorService,
    public appService: AppService,
    public masterPageService: MasterPageService,
    private spinner: NgxSpinnerService,
    private apiConfigService: ApiConfigService,
    public apiService: ApiService,
    private commonService: CommonService,
    private snackbar: XpoSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.serialNumberFocus();
    this.clearAlert();
    this.controlConfig = JSON.parse(localStorage.getItem(StorageData.controlConfig));
    this.masterPageService.showtogglePageWise = false;
    this.invMoveObject.IsInvMove = true;
    this.dropdownSettings = new DropDownSettings();
    this.dropdownSettings.idField = 'ReasonCd';
    this.dropdownSettings.textField = 'Description';
    this.dropdownSettings.singleSelection = true;
  }

  // validate move serial number
  validateMoveSerialNumber(inputcontrol: RmtextboxComponent) {
    if (!this.appService.checkNullOrUndefined(this.serialNumber)) {
      this.clearAlert();
      this.spinner.show();
      const requestObj = { ClientData: this.clientData, UIData: this.uiData, MoveType: this.invMoveObject };
      const url = String.Join('/', this.apiConfigService.validateMoveSerialNumberUrl, this.serialNumber);
      this.apiService.apiPostRequest(url, requestObj)
        .subscribe(response => {
          const res = response.body;
          this.spinner.hide();
          if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
            this.validMoveSerialNumberResponse = res;
            if (this.validMoveSerialNumberResponse
              && this.validMoveSerialNumberResponse.Response &&
              this.validMoveSerialNumberResponse.Response.Device) {
              const traceData = {
                traceType: TraceTypes.serialNumber,
                traceValue: this.validMoveSerialNumberResponse.Response.Device.SerialNumber, uiData: this.uiData
              };
              const traceResult = this.commonService.findTraceHold(traceData, this.uiData);
              traceResult.subscribe(result => {
                if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
                  if (this.appService.checkNullOrUndefined(result.Response)) {
                    this.validMoveSerialNumber(inputcontrol);
                  } else {
                    this.canProceed(result, TraceTypes.serialNumber, inputcontrol);
                  }
                  this.spinner.hide();
                } else if (!this.appService.checkNullOrUndefined(result) && result.Status == StatusCodes.fail) {
                  this.spinner.hide();
                  this.showAlert = true;
                  this.appErrService.alertSound(AudioType.error);
                  this.text = result.ErrorMessage.ErrorDetails;
                  this.snackbar.error(this.text);
                }
              });
            } else {
              inputcontrol.applyRequired(true);
              inputcontrol.applySelect();
            }
          } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
            this.showAlert = true;
            this.appErrService.alertSound(AudioType.error);
            this.text = res.ErrorMessage.ErrorDetails;
            inputcontrol.applyRequired(true);
            inputcontrol.applySelect();
          }
        },
          error => {
            inputcontrol.applyRequired(true);
            inputcontrol.applySelect();
            this.appErrService.handleAppError(error, false);
            this.showAlert = true;
            this.text = this.appErrService.emiterrorvalue;
          });
    }
  }
  validMoveSerialNumber(inputcontrol: RmtextboxComponent, res = this.validMoveSerialNumberResponse) {
    this.appErrService.alertSound(AudioType.success);
    this.locationFocus();
    this.isLocationDisabled = false;
    this.isSerialNumDisabled = true;
    this.serialNumberMoveDevice = res.Response.Device;
    this.inbContainerId = res.Response.Device.ContainerID;
    this.inBoundcontainer = res.Response.Container;
    this.containerInvAccount = res.Response.Container.InvAccount;
    inputcontrol.applyRequired(false);
    this.validMoveSerialNumberResponse = null;
  }


  // Location Validation
  validateLocation(inputcontrol: RmtextboxComponent, locationId) {
    this.clearAlert();
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, Container: this.inBoundcontainer, MoveType: this.invMoveObject };
    const url = String.Join('/', this.apiConfigService.validateContainerLocationUrl, locationId);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          if (!this.appService.checkNullOrUndefined(res.Response.Location)) {
            this.isLocationDisabled = true;
            this.locationObj = res.Response.Location;
            this.serialNumberMoveDevice.Location = locationId;
            this.locationInvAccount = res.Response.Location.InvAccount;
            this.getTransactions();
            this.getReasonCodes();
            this.appErrService.alertSound(AudioType.success);
          }
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.spinner.hide();
          inputcontrol.applyRequired(true);
          inputcontrol.applySelect();
          this.showAlert = true;
          this.appErrService.alertSound(AudioType.error);
          this.text = res.ErrorMessage.ErrorDetails;
          this.snackbar.error(this.text);
        }
      }, erro => {
        this.appErrService.handleAppError(erro, false);
        this.showAlert = true;
        this.text = this.appErrService.emiterrorvalue;
      });
  }


  // getReasonCodes
  getReasonCodes() {
    this.spinner.show();
    this.clearReason();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, Location: this.locationObj, MoveType: this.invMoveObject };
    this.apiService.apiPostRequest(this.apiConfigService.getReasonCodesUrl, requestObj)
      .subscribe(response => {
        this.spinner.hide();
        const res = response.body;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          if (!this.appService.checkNullOrUndefined(res.Response.ReasonCodes)) {
            this.reasonCodeList = res.Response.ReasonCodes;
            this.reasonCodeOptions = res.Response.ReasonCodes;
            this.reasonCodeOptions.map(resp => resp.Description = String.Join(' - ', resp.ReasonCd, resp.Description));
            const obj = this.reasonCodeList.find(r => r.Deafult_YN === CommonEnum.yes);
            if (obj) {
              this.reasonCodeObj = obj;
              this.reasonCode = [{
                Description: String.Join(' - ', obj.ReasonCd, obj.Description),
                ReasonCd: obj.ReasonCd
              }];
              this.configContainerProperties();
              this.childContainer.suggestedContainerFocus();
            } else {
              this.reasonCodeFocus();
            }
            this.isReasonCodeDisabled = false;
          }
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.noResult) {
          this.isReasonCodeDisabled = true;
          this.configContainerProperties();
          this.childContainer.suggestedContainerFocus();
          this.snackbar.info(res.StatusMessage);
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.showAlert = true;
          this.appErrService.alertSound(AudioType.error);
          this.text = res.ErrorMessage.ErrorDetails;
          this.snackbar.error(this.text);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }



  // Get transactions
  getTransactions() {
    const requestObj = { ClientData: this.clientData, Device: this.serialNumberMoveDevice, UIData: this.uiData, MoveType: this.invMoveObject };
    const url = String.Join('/', this.apiConfigService.getTransaction, this.uiData.OperationId);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          this.listofTransactions = new ListofTransactions();
          this.listofTransactions = res.Response;
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.showAlert = true;
          this.appErrService.alertSound(AudioType.error);
          this.snackbar.error(res.ErrorMessage.ErrorDetails);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }

  // move serial number 
  moveSerialNumber() {
    this.clearAlert();
    if (!this.appService.checkNullOrUndefined(this.serialNumberMoveDevice) && this.serialNumberMoveDevice !== '') {
      this.isMoveDisabled = true;
      this.spinner.show();
      const requestObj = {
        ClientData: this.clientData, Device: this.serialNumberMoveDevice, UIData: this.uiData,
        Container: this.inBoundcontainer, Location: this.locationObj, MoveType: this.invMoveObject, ReasonCode: this.reasonCodeObj
      };
      const url = String.Join('/', this.apiConfigService.moveSerialnumberInv);
      this.apiService.apiPostRequest(url, requestObj)
        .subscribe(response => {
          const res = response.body;
          this.spinner.hide();
          if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
            this.isMoveDisabled = true;
            const postUrl = String.Join('/', this.apiConfigService.postCommonUpdateProcess);
            const reqObj = {
              ClientData: this.clientData, Device: this.serialNumberMoveDevice,
              UIData: this.uiData
            };
            this.commonService.postUpdateProcess(postUrl, reqObj);
            this.saveTransaction();
            this.Clear();
            this.snackbar.success(res.StatusMessage);
          } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
            this.isMoveDisabled = false;
            this.spinner.hide();
            this.showAlert = true;
            this.appErrService.alertSound(AudioType.error);
            this.text = res.ErrorMessage.ErrorDetails;
            this.rmtextchild.applySelect();
          }
        },
          error => {
            this.appErrService.handleAppError(error, false);
            this.showAlert = true;
            this.text = this.appErrService.emiterrorvalue;
          });
    }
  }

  // save transaction
  saveTransaction() {
    const requestObj = {
      ClientData: this.clientData, Transactions: this.listofTransactions,
      UIData: this.uiData, Device: this.serialNumberMoveDevice, TestResultDetails: {}, MoveType: this.invMoveObject
    };
    const url = String.Join('/', this.apiConfigService.saveTransaction);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.showAlert = true;
          this.appErrService.alertSound(AudioType.error);
          this.snackbar.error(res.ErrorMessage.ErrorDetails);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }


  canProceed(traceResponse, type, inbContainer) {
    if (traceResponse.Response.canProceed === 'Y') {
      this.snackbar.info(traceResponse.StatusMessage);
    }
    if (!this.appService.checkNullOrUndefined(traceResponse.Response.TraceHold)) {
      const uiObj = { uiData: this.uiData };
      traceResponse = Object.assign(traceResponse, uiObj);
      this.dialogRef = this.dialog.open(FindTraceHoldComponent, { hasBackdrop: true, disableClose: true, panelClass: 'dialog-width-sm', data: { modalData: traceResponse } });
      this.dialogRef.afterClosed().subscribe((returnedData) => {
        if (returnedData) {
          if (returnedData.Response.canProceed === 'Y') {
            if (type === TraceTypes.serialNumber) {
              this.validMoveSerialNumber(inbContainer);
            }
          } else if (returnedData.Response.canProceed === 'N') {
            if (type === TraceTypes.serialNumber) {
              this.serialNumberFocus();
            }
            this.showAlert = true;
            this.appErrService.alertSound(AudioType.error);
            this.text = returnedData.StatusMessage;
            this.snackbar.error(this.text);
          }
        }
      });
    }
  }


  // getContainerId
  getContainerId(containerid) {
    this.suggestedContainerID = containerid;
  }

  // Refresh and getSuggestionContainer(focus)
  // getSuggestContainer sending receive device to child conatiner
  getSuggestContainer(value) {
    this.containerFocus();
    if (this.appService.checkNullOrUndefined(value)) {
      this.configContainerProperties();
      this.childContainer.getSuggestContainer(this.serialNumberMoveDevice);
    } else {
      this.clearContainerID();
      this.configContainerProperties();
      this.childContainer.getSuggestContainer(this.serialNumberMoveDevice);
    }
  }

  // validateContainer and sending updated device to child conatiner
  validateContainer(response) {
    if (response.ContainerID != null && response.ContainerID !== undefined) {
      this.serialNumberMoveDevice.ContainerID = response.ContainerID;
      this.serialNumberMoveDevice.ContainerCycle = response.ContainerCycle;
    }
    this.childContainer.validateContainer(this.serialNumberMoveDevice);

  }

  // validate container fail response
  emitValidateContainerFailResponse(response) {
    if (!this.appService.checkNullOrUndefined(response)) {
      this.serialNumberMoveDevice.ContainerID = response.ContainerID;
      this.serialNumberMoveDevice.ContainerCycle = response.ContainerCycle;
    }
  }


  // validateConta iner Response from child conatiner
  validateContainerResponse(response) {
    if (!this.appService.checkNullOrUndefined(response)) {
      this.isMoveDisabled = true;
      this.serialNumberMoveDevice.ContainerCycle = response.ContainerCycle;
      this.serialNumberMoveDevice.ContainerID = response.ContainerID;
      this.moveSerialNumber();
    } else {
      this.moveSerialNumber();
    }
  }


  // input match 
  checkContainer(container) {
    if (!this.appService.checkNullOrUndefined(container)) {
      this.isMoveDisabled = false;
      this.serialNumberMoveDevice.ContainerID = container.ContainerID;
      this.serialNumberMoveDevice.ContainerCycle = container.ContainerCycle;
    } else {
      this.isMoveDisabled = true;
    }
  }

  // enabling the button and container ID
  configContainerProperties() {
    this.childContainer.isContainerDisabled = false;
    this.childContainer.isClearContainerDisabled = false;
  }


  // clear container suggestion
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

  // change serial number input
  changeSerialNumber(inputControl: RmtextboxComponent) {
    inputControl.applyRequired(false);
    this.changeInput();
  }

  // changeLocation
  changeLocation(inputControl: RmtextboxComponent) {
    inputControl.applyRequired(false);
    this.reasonCode = [];
    this.changeInput();
  }

  // changeReasonCode
  changeReasonCode(val) {
    this.reasonCodeObj = this.reasonCodeList.find(r => r.ReasonCd === val.ReasonCd);
    this.configContainerProperties();
    this.childContainer.suggestedContainerFocus();
    this.clearAlert();
  }

  reasonCodeDeselect() {
    this.reasonCodeObj = {};
    this.reasonCode = [];
    this.isMoveDisabled = true;
    this.clearContainerID();
  }

  // clearEmit
  clearEmit(value) {
    this.isClearDisabled = value;
  }

  // serial number focus
  serialNumberFocus() {
    this.appService.setFocus('serialNumberRef');
  }
  // locationFocus
  locationFocus() {
    this.appService.setFocus('locationId');
  }
  // conatiner focus
  containerFocus() {
    this.appService.setFocus('containerInputId');
  }
  // reasonCodeFocus
  reasonCodeFocus() {
    this.appService.setFocus('reasonCode');
  }

  changeInput() {
    this.isClearDisabled = false;
    this.clearAlert();
    this.appErrService.clearAlert();
  }

  clearAlert() {
    this.showAlert = false;
    this.text = '';
    this.appErrService.specialCharErrMsg = '';
  }

  clearReason() {
    this.reasonCodeOptions = [];
    this.reasonCodeList = [];
    this.reasonCodeObj = {};
    this.reasonCode = [];
  }

  // clear
  Clear() {
    this.serialNumber = '';
    this.locationId = '';
    this.inbContainerId = '';
    this.containerInvAccount = '';
    this.locationInvAccount = '';
    this.isSerialNumDisabled = false;
    this.isLocationDisabled = true;
    this.isMoveDisabled = true;
    this.isClearDisabled = true;
    this.clearReason();
    this.isReasonCodeDisabled = true;
    this.inBoundcontainer = new Container();
    this.listofTransactions = new ListofTransactions();
    this.serialNumberMoveDevice = null;
    this.clearAlert();
    this.serialNumberFocus();
    this.appErrService.clearAlert();
    this.clearContainerID();
  }

  ngOnDestroy() {
    this.clearAlert();
    if (this.dialogRef) {
      this.dialogRef.close();
    }
    this.masterPageService.hideDialog();
    this.masterPageService.showtogglePageWise = true;
  }

}
