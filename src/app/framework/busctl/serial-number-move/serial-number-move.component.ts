import { ContainerSuggestionComponent } from './../container-suggestion/container-suggestion.component';
import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, TemplateRef, Input, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MasterPageService } from '../../../utilities/rlcutl/master-page.service';
import { RmtextboxComponent } from '../../../framework/frmctl/rmtextbox/rmtextbox.component';
import { AppErrorService } from '../../../utilities/rlcutl/app-error.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { String, StringBuilder } from 'typescript-string-operations';
import { ApiConfigService } from '../../../utilities/rlcutl/api-config.service';
import { ApiService } from '../../../utilities/rlcutl/api.service';
import { Message } from '../../../models/common/Message';
import { MessagingService } from '../../../utilities/rlcutl/messaging.service';
import { MessageType } from '../../../enums/message.enum';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { ClientData } from '../../../models/common/ClientData';
import { AppService } from '../../../utilities/rlcutl/app.service';
import { UiData } from '../../../models/common/UiData';
import { TraceTypes } from '../../../enums/traceType.enum';
import { CommonService } from '../../../services/common.service';
import { FindTraceHoldComponent } from '../../../framework/busctl/find-trace-hold/find-trace-hold.component';
import { StorageData } from '../../../enums/storage.enum';
import { StatusCodes } from '../../../enums/status.enum';
import { AudioType } from './../../../enums/audioType.enum';
import { CommonEnum } from '../../../enums/common.enum';
import { InvMove } from '../../../models/common/InvMove';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'serial-number-move',
  templateUrl: './serial-number-move.component.html',
  styleUrls: ['./serial-number-move.component.css']
})
export class SerialNumberMoveComponent implements OnInit, OnDestroy {

  @ViewChild('movecontainerId') containerInput: ElementRef;
  @ViewChild(RmtextboxComponent) rmtextchild: RmtextboxComponent;
  @ViewChild(ContainerSuggestionComponent) childContainer: ContainerSuggestionComponent;

  @Output() emitModalClose = new EventEmitter();
  @Input() serialNumbers: any;
  @Input() flag = true;
  @Input() isModalOpen: string;
  @Input() tittle: string;
  @Input() isOutBoundContainerRequired = false;
  controlConfig: any;

  //Form
  serialnumberForm: FormGroup;
  serialNumber = '';
  containerId = '';
  bardgeContainerId = '';
  isClearDisabled = true;
  isContainerDisabled = true;
  isMoveDisabled = true;
  isSerialNumDisabled = false;
  verifiedSerialNumber: string;
  serialNumberMoveDevice: any;
  text: string;
  showAlert = false;
  suggestedContainerId: string;
  //messages
  messageNum: string;
  messageType: string;
  clientData = new ClientData();
  uiData = new UiData();

  operationObj: any;
  traceTypes = TraceTypes;
  validMoveSerialNumberResponse: any;
  appConfig: any;

  // toggle prop
  toggleValue = CommonEnum.no;
  istoggleDisabled = true;
  commonEnum = CommonEnum;
  invMoveObject = new InvMove();
  dialogRef: any;

  constructor(private masterPageService: MasterPageService,
    private form: FormBuilder,
    public appErrService: AppErrorService,
    private spinner: NgxSpinnerService,
    private apiConfigService: ApiConfigService,
    public apiservice: ApiService,
    private snackbar: XpoSnackBar,
    private messagingService: MessagingService,
    private appService: AppService,
    private commonService: CommonService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    if (this.tittle) {
      // this.operationObj = this.masterPageService.getOperationForPopUp(this.tittle);
      this.appConfig = JSON.parse(localStorage.getItem(StorageData.appConfig));
      this.operationObj = this.appConfig.modelPopupConfig.UIData;
    } else {
      this.operationObj = this.masterPageService.getRouteOperation();
      this.masterPageService.setTitle(this.operationObj.Title);
    }
    if (this.operationObj) {
      this.uiData.OperationId = this.operationObj.OperationId;
      this.uiData.OperCategory = this.operationObj.Category;
    }
    this.buildForm();
    this.showAlert = false;
    this.text = '';
    this.serialNumberFocus();
    this.clearAlert();
    this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
    if (!this.tittle) {
      this.getRoleCapabilities();
    }
    this.masterPageService.showtogglePageWise = false;
    this.controlConfig = JSON.parse(localStorage.getItem(StorageData.controlConfig));
  }

  ngOnDestroy() {
    this.serialNumbers = null;
    this.serialNumberMoveDevice = null;
    this.serialNumber = '';
    this.containerId = '';
    this.bardgeContainerId = '';
    this.isClearDisabled = true;
    this.isContainerDisabled = true;
    this.isMoveDisabled = true;
    this.text = '';
    this.showAlert = false;
    this.isSerialNumDisabled = false;
    this.appErrService.alertMsg = '';
    this.clearAlert();
    this.masterPageService.showtogglePageWise = true;
    if (this.dialogRef) {
      this.dialogRef.close();
    }
    this.masterPageService.hideModal();
  }


  buildForm() {
    return this.serialnumberForm = this.form.group({
      SerialNum: [],
      containerID: []
    });
  }

  //Serial Number Focus
  serialNumberFocus() {
    setTimeout(() => {
      const inputSerialNumber = <HTMLInputElement>document.getElementById('serialNmbr');
      if (!this.appService.checkNullOrUndefined(inputSerialNumber)) {
        inputSerialNumber.focus();
      }
    }, 0);
  }

  //container focus
  containerFocus() {
    const inputContainer = <HTMLInputElement>document.getElementById('containerId');
    if (!this.appService.checkNullOrUndefined(inputContainer)) {
      inputContainer.focus();
    }
  }

  //move button foucs
  moveFocus() {
    setTimeout(() => {
      const btnMove = <HTMLInputElement>document.getElementById('moveSerialNumber');
      if (!this.appService.checkNullOrUndefined(btnMove)) {
        btnMove.focus();
      }
    }, 0);

  }


  //change input box
  changeInput(inputControl: RmtextboxComponent) {
    this.isClearDisabled = false;
    inputControl.applyRequired(false);
    this.showAlert = false;
    this.appErrService.clearAlert();
  }

  enableMoveSerialNo() {
    this.appErrService.clearAlert();
    this.isMoveDisabled = false;
  }

  emitEmptyChange() {
    this.appErrService.clearAlert();
    this.isMoveDisabled = true;
  }

  onControllerChange(inputControl) {
    inputControl.applyRequired(false);
    this.showAlert = false;
    //this.appErrService.clearAlert();
  }

  getRoleCapabilities() {
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    this.commonService.commonApiCall(this.apiConfigService.getRoleCapabilitiesUrl, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag && res.Response && res.Response.hasOwnProperty('canPerformInvMove')) {
        this.istoggleDisabled = res.Response.canPerformInvMove === CommonEnum.yes ? false : true;
      }
    });
  }


  onToggleChange(val) {
    this.appErrService.clearAlert();
    this.toggleValue = val ? CommonEnum.yes : CommonEnum.no;
    this.serialNumberFocus();
    this.Clear();
  }

  //validate move serial number
  validateMoveSerialNumber(inputcontrol: RmtextboxComponent, serialNumber) {
    if (!this.appService.checkNullOrUndefined(this.serialNumber) && this.serialNumber !== '') {
      let verificationSerialNumber: any = {};
      if (this.serialNumbers) {
        verificationSerialNumber = this.serialNumbers.Elements.find(c => {
          if (c.SerialNumber === this.serialNumber) {
            return c.SerialNumber;
          }
        });
      } else {
        verificationSerialNumber.SerialNumber = this.serialNumber;
      }
      if (!this.appService.checkNullOrUndefined(verificationSerialNumber) && !this.appService.checkNullOrUndefined(verificationSerialNumber.SerialNumber) && verificationSerialNumber.SerialNumber !== '') {
        this.spinner.show();
        const requestObj = { ClientData: this.clientData, UIData: this.uiData, MoveType: this.invMoveObject };
        const url = String.Join('/', this.apiConfigService.validateMoveSerialNumberUrl, this.serialNumber);
        this.apiservice.apiPostRequest(url, requestObj)
          .subscribe(response => {
            const res = response.body;
            this.spinner.hide();
            if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
              this.validMoveSerialNumberResponse = res;
              if (this.validMoveSerialNumberResponse
                && this.validMoveSerialNumberResponse.Response &&
                this.validMoveSerialNumberResponse.Response.Device) {
                const traceData = { traceType: this.traceTypes.serialNumber, traceValue: this.validMoveSerialNumberResponse.Response.Device.SerialNumber, uiData: this.uiData };
                const traceResult = this.commonService.findTraceHold(traceData, this.uiData);
                traceResult.subscribe(result => {
                  if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
                    if (this.appService.checkNullOrUndefined(result.Response)) {
                      this.validMoveSerialNumber(inputcontrol);
                    } else {
                      this.canProceed(result, this.traceTypes.serialNumber, inputcontrol);
                    }
                    this.spinner.hide();
                  } else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
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
              this.spinner.hide();
              this.showAlert = true;
              this.text = res.ErrorMessage.ErrorDetails;
              this.appErrService.alertSound(AudioType.error);
              inputcontrol.applyRequired(true);
              inputcontrol.applySelect();
              //this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
            }
          },
            error => {
              inputcontrol.applyRequired(true);
              inputcontrol.applySelect();
              this.appErrService.handleAppError(error, false);
              this.showAlert = true;
              this.text = this.appErrService.emiterrorvalue;

            });
      } else {
        this.showAlert = true;
        let userMessage = new Message();
        this.messageNum = '2660044';
        this.messageType = MessageType.failure;
        userMessage = this.messagingService.SendUserMessage(this.messageNum, this.messageType);
        this.text = userMessage.messageText;
      }

    }
  }
  validMoveSerialNumber(inputcontrol: RmtextboxComponent, res = this.validMoveSerialNumberResponse) {
    this.showAlert = false;
    this.text = '';
    this.appErrService.alertSound(AudioType.success);
    this.serialNumberMoveDevice = res.Response.Device;
    this.bardgeContainerId = this.serialNumberMoveDevice.ContainerID;
    inputcontrol.applyRequired(false);
    this.isSerialNumDisabled = true;
    if (this.isOutBoundContainerRequired) {
      this.configContainerProperties();
      this.childContainer.suggestedContainerFocus();
    } else {
      this.containerFocus();
      this.isContainerDisabled = false;
    }

    this.validMoveSerialNumberResponse = null;
  }


  canProceed(traceResponse, type, inbContainer) {
    if (traceResponse.Response.canProceed === 'Y') {
      this.snackbar.info(traceResponse.StatusMessage);
    }
    if (!this.appService.checkNullOrUndefined(traceResponse.Response.TraceHold)) {
      const uiObj = { uiData: this.uiData };
      traceResponse = Object.assign(traceResponse, uiObj);
      // this.modalRef = this.modalService.show(FindTraceHoldComponent, { initialState: { modalData: traceResponse }, backdrop: 'static', keyboard: false, class: 'modal-md modal-dialog-centered' });
      this.dialogRef = this.dialog.open(FindTraceHoldComponent, {
        hasBackdrop: true,
        disableClose: true,
        panelClass: 'dialog-width-sm',
        data: {
          modalData: traceResponse
        }
      });
      this.dialogRef.afterClosed().subscribe((returnedData) => {
        if (returnedData) {
          if (returnedData.Response.canProceed === 'Y') {
            if (type === this.traceTypes.serialNumber) {
              this.validMoveSerialNumber(inbContainer);
            }
          } else if (returnedData.Response.canProceed === 'N') {
            if (type === this.traceTypes.serialNumber) {
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

  //validate move container
  validateMoveContainer(inputcontrol?: RmtextboxComponent) {
    if (this.isContainerDisabled === false) {
      this.isMoveDisabled = true;
      this.spinner.show();
      const requestObj = { ClientData: this.clientData, Device: this.serialNumberMoveDevice, UIData: this.uiData, MoveType: this.invMoveObject };
      const url = String.Join('/', this.apiConfigService.validateMoveContainer, this.containerId);
      this.apiservice.apiPostRequest(url, requestObj)
        .subscribe(response => {
          const res = response.body;
          if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
            this.showAlert = false;
            this.text = '';
            this.serialNumberMoveDevice.ContainerCycle = res.Response.ContainerCycle;
            this.serialNumberMoveDevice.ContainerID = res.Response.ContainerID;
            if (inputcontrol) {
              inputcontrol.applyRequired(false);
            }
            this.isContainerDisabled = true;
            this.appErrService.alertSound(AudioType.success);
            this.moveSerialNumber();
          } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
            this.isMoveDisabled = false;
            this.spinner.hide();
            this.showAlert = true;
            this.appErrService.alertSound(AudioType.error);
            this.text = res.ErrorMessage.ErrorDetails;
            if (inputcontrol) {
              inputcontrol.applyRequired(true);
              inputcontrol.applySelect();
            }
          }
        },
          error => {
            this.appErrService.handleAppError(error, false);
            this.showAlert = true;
            this.text = this.appErrService.emiterrorvalue;
          });
    }
  }

  checkScanedContainer() {
    if (this.isOutBoundContainerRequired) {
      this.moveSerialNumber();
    } else {
      this.validateMoveContainer();
    }
  }

  //move serial number 
  moveSerialNumber() {
    if (!this.appService.checkNullOrUndefined(this.serialNumberMoveDevice) && this.serialNumberMoveDevice !== '') {
      this.isMoveDisabled = true;
      this.spinner.show();
      const requestObj = { ClientData: this.clientData, Device: this.serialNumberMoveDevice, UIData: this.uiData, MoveType: this.invMoveObject };
      const url = String.Join('/', this.apiConfigService.moveSerialNumberUrl);
      this.apiservice.apiPostRequest(url, requestObj)
        .subscribe(response => {
          const res = response.body;
          this.spinner.hide();
          if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
            const postUrl = String.Join('/', this.apiConfigService.postCommonUpdateProcess);
            const reqObj = {
              ClientData: this.clientData, Device: this.serialNumberMoveDevice,
              UIData: this.uiData
            };
            this.commonService.postUpdateProcess(postUrl, reqObj);
            if (this.serialNumbers) {
              if (this.serialNumbers.Elements.length > 0) {
                this.serialNumbers.Elements.forEach((element, i) => {
                  if (element.SerialNumber === this.serialNumberMoveDevice.SerialNumber) {
                    this.serialNumbers.Elements.splice(i, 1);
                  }
                });
                if (this.serialNumbers.Elements.length === 0) {
                  this.emitModalClose.emit();
                }
              }
            } else {
              this.isMoveDisabled = true;
            }
            this.Clear();
            this.snackbar.success(res.Response);
          } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
            this.isMoveDisabled = false;
            this.spinner.hide();
            this.showAlert = true;
            this.appErrService.alertSound(AudioType.error);
            this.text = res.ErrorMessage.ErrorDetails;
            this.isContainerDisabled = false;
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

  //outbound container id

  // getContainerId
  getContainerId(containerid) {
    this.suggestedContainerId = containerid;
  }

  // Refresh and getSuggestionContainer(focus)
  // getSuggestContainer sending receive device to child conatiner
  getSuggestContainer(value) {
    this.childContainer.suggestedContainerFocus();
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

  //clearEmit
  clearEmit(value) {
    this.isClearDisabled = value;
  }
  Clear() {
    this.isSerialNumDisabled = false;
    this.serialNumber = '';
    this.isContainerDisabled = true;
    this.containerId = '';
    this.bardgeContainerId = '';
    this.isClearDisabled = true;
    this.isMoveDisabled = true;
    this.suggestedContainerId = '';
    this.clearAlert();
    this.serialNumberFocus();
    this.appErrService.clearAlert();
    this.clearContainerID();
  }
  clearAlert() {
    this.showAlert = false;
    this.text = '';
    this.appErrService.specialCharErrMsg = '';
  }
}
