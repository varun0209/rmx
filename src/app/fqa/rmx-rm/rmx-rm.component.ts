import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';
import { ClientData } from '../../models/common/ClientData';
import { UiData } from '../../models/common/UiData';
import { StorageData } from '../../enums/storage.enum';
import { CommonEnum } from '../../enums/common.enum';
import { AppService } from '../../utilities/rlcutl/app.service';
import { ContainerSummaryComponent } from '../../framework/busctl/container-summary/container-summary.component';
import { ContainerSuggestionComponent } from '../../framework/busctl/container-suggestion/container-suggestion.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiConfigService } from '../../utilities/rlcutl/api-config.service';
import { String } from 'typescript-string-operations';
import { CommonService } from '../../services/common.service';
import { Observable, Subscription, interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { ApiService } from '../../utilities/rlcutl/api.service';
import { StatusCodes } from '../../enums/status.enum';
import { Grid } from '../../models/common/Grid';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { FqaDevice } from '../../models/fqa/FqaDevice';
import { RmtextboxComponent } from '../../framework/frmctl/rmtextbox/rmtextbox.component';
import { MessagingService } from '../../utilities/rlcutl/messaging.service';
import { Message } from '../../models/common/Message';
import { MessageType } from '../../enums/message.enum';
import { Container } from '../../models/common/Container';

@Component({
  selector: 'app-rmx-rm',
  templateUrl: './rmx-rm.component.html',
  styleUrls: ['./rmx-rm.component.css']
})
export class RmxRmComponent implements OnInit, OnDestroy {

  @ViewChild(RmtextboxComponent) rmtextchild: RmtextboxComponent;
  @ViewChild('serialNumberInput') serialNumberInput: RmtextboxComponent;
  @ViewChild(ContainerSummaryComponent) contsummaryParent: ContainerSummaryComponent;
  @ViewChild(ContainerSuggestionComponent) childContainer: ContainerSuggestionComponent;

  // subscribes props
  fqaOnChangeMode: Subscription;
  emitReadOnlyDeviceResponseForContainer: Subscription;
  originationOperation: Subscription;
  deviceOrigination: string;

  subscription: Subscription;

  // client props
  operationObj: any;
  clientData = new ClientData();
  uiData = new UiData();
  controlConfig: any;
  appConfig: any;


  containerObj = new Container();
  fqaDevice: FqaDevice = new FqaDevice();

  // process queue props
  clear: any;
  pollingData: any;

  // grid props
  grid: Grid;

  // show select mode div
  isShowControls = false;

  // selected mode
  selectedFQAMode: string;

  // container properties
  headingsobj = [];
  inboundProperties: any;
  multipleContainerList = [];
  inboundContainer = null;

  // device data props
  totalCount = 0;
  fqaDeviceList = [];
  fqaDeviceListData: any;
  caseCntEnable = CommonEnum.no;

  // serial number
  serialNumber = '';

  // countcase props
  isCountCaseDisabled = true;

  countCase = null;
  batchId = '';
  processEnable = '';

  isClearDisabled = true;
  isProcessDisabled = true;
  operationId: string;



  constructor(
    private apiService: ApiService,
    private apiConfigService: ApiConfigService,
    private spinner: NgxSpinnerService,
    private snackbar: XpoSnackBar,
    public appErrService: AppErrorService,
    public masterPageService: MasterPageService,
    private messagingService: MessagingService,
    public appService: AppService,
    private commonService: CommonService
  ) {

    this.fqaOnChangeMode = this.masterPageService.selectedOptionMode.subscribe(mode => {
      if (!this.appService.checkNullOrUndefined(mode)) {
        this.changeFQAMode(mode);
      }
    });

    // emitting readOnlyDevice response
    this.emitReadOnlyDeviceResponseForContainer = this.commonService.emitReadOnlyDeviceResponseForContainer.subscribe(res => {
      if (!this.appService.checkNullOrUndefined(res)) {
        if (!this.appService.checkNullOrUndefined(res.Status) && res.Status === StatusCodes.pass) {
          this.validatecountCaseSuccess();
        } else if (!this.appService.checkNullOrUndefined(res.Status) && res.Status === StatusCodes.fail) {
          this.clearSerialNo();
        }
      }
    });
  }

  ngOnInit() {
    this.operationObj = this.masterPageService.getRouteOperation();
    if (this.operationObj) {
      this.uiData.OperationId = this.operationObj.OperationId;
      this.uiData.OperCategory = this.operationObj.Category;
      this.operationId = this.operationObj.OperationId;
      this.masterPageService.setTitle(this.operationObj.Title);
      this.masterPageService.setModule(this.operationObj.Module);
      this.masterPageService.setCardHeader(CommonEnum.processQueue);
      this.masterPageService.module = this.operationObj.Module;
      this.controlConfig = JSON.parse(localStorage.getItem(StorageData.controlConfig));
      // localStorage.setItem(this.storageData.module, this.operationObj.Module);
      this.appErrService.appMessage();
      this.appConfig = JSON.parse(localStorage.getItem(StorageData.appConfig));
      this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
      this.masterPageService.operationObj = this.operationObj;
      if (!this.appService.checkNullOrUndefined(this.controlConfig.ribbondropdown) && this.controlConfig.ribbondropdown.Show) {
        this.masterPageService.showRibbondropdown = this.controlConfig.ribbondropdown.Show;
        this.appService.setFocus('opCategorydropdown');
        this.getModes();
      }
      this.getProcessQueue();
      this.originationOperation = this.masterPageService.originationOperation.subscribe(val => {
        this.deviceOrigination = val;
      });
    }
  }

  //operationId
  setCurrentOperationId(operationId) {
    this.uiData.OperationId = operationId;
  }
  // get process que
  getProcessQueue() {
    const timeinterval: number = this.appConfig.fqa.queueInterval;
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getBatchQueueUrl);
    this.clear = document.getElementById('stopProcessQueue');
    // const stop$ = Observable.fromEvent(this.clear, 'click');
    this.pollingData = interval(timeinterval).pipe(
      startWith(0),
      switchMap(() => this.apiService.apiPostRequest(url, requestObj)))
      .subscribe(response => {
        const res = response.body;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          this.grid = new Grid();
          this.grid.SearchVisible = false;
          this.masterPageService.tempQueList = this.appService.onGenerateJson(this.onProcessQueGenerateJsonGrid(res.Response), this.grid);
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.masterPageService.tempQueList = null;
          this.pollingData.unsubscribe();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }

  onProcessQueGenerateJsonGrid(Response) {
    if (!this.appService.checkNullOrUndefined(Response)) {
      const processQueData = [];
      Response.forEach(res => {
        const element: any = {};
        element.BatchId = res.BatchId;
        element.Container = res.ContainerId;
        element.Status = res.Status;
        element.Remarks = res.Remarks;
        element.WTContainerId = res.WTContainerId;
        element.WTReceiptKey = res.WTReceiptKey;
        processQueData.push(element);
      });
      return processQueData;
    }
  }

  getModes() {
    const requestObj = { ClientData: this.clientData };
    const url = String.Join('/', this.apiConfigService.getRMXRMMode);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag && !this.appService.checkNullOrUndefined(res.Response) && !this.appService.checkNullOrUndefined(res.Response.Modes)) {
        if (res.Response.Modes.length) {
          this.masterPageService.options = res.Response.Modes;
          if (this.masterPageService.options.length === 1) {
            this.masterPageService.option = this.masterPageService.options[0].Id;
            this.isShowControls = true;
            this.masterPageService.inboundContainerFocus();
          }
        }
      }
    });
  }

  changeFQAMode(selectedFQAMode) {
    this.selectedFQAMode = selectedFQAMode;
    this.isShowControls = true;
    this.reset();
  }

  // containerSummaryProperties
  containerSummaryProperties(event: any) {
    this.headingsobj = [];
    this.headingsobj = Object.keys(event);
    this.inboundProperties = event;
  }

  getContainerList(event) {
    this.multipleContainerList = event;
  }

  // Emit inbContainerID
  validateFQASerialNumbers(obj, flag = false) {
    this.inboundContainer = obj.InboundContainer;
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.validateRMxRMSerialNumbers, this.inboundContainer);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        this.totalCount = res.Response.TotalCount;
        this.fqaDeviceList = res.Response.FqaVerifyDevices;
        this.caseCntEnable = res.Response.CaseCntEnable;
        this.masterPageService.disabledSerialNumber = false;
        this.serialNumberFocus();
        if (res.Response.hasOwnProperty('CaseCntEnable') && res.Response.CaseCntEnable === CommonEnum.yes) {
          this.isCountCaseDisabled = false;
        }

        // confim
        res.Response.FqaVerifyDevices.forEach((element) => {
          const index = this.fqaDeviceList.findIndex(ele => ele.SerialNumber === element.SerialNumber);
          if (index === -1) {
            if (!this.appService.checkNullOrUndefined(this.deviceOrigination) && this.deviceOrigination != '') {
              element.Origination = this.deviceOrigination;
            }
            this.fqaDeviceList.push(element);
          }
        });

        if (!this.appService.checkNullOrUndefined(this.fqaDeviceListData) && flag) {
          this.fqaDeviceListData['Elements'].forEach(element => {
            this.fqaDeviceList.map(resp => (resp.SerialNumber === element.SerialNumber) ? resp.Verify = element.Verify : null);
          });
          this.refreshContainer();
        }

        this.grid = new Grid();
        this.grid.PaginationId = 'serialNumberRemarks';
        this.fqaDeviceListData = this.appService.onGenerateJson(this.fqaDeviceGrid(this.fqaDeviceList), this.grid);

      }
    });
  }

  // **processing grid** //
  fqaDeviceGrid(dataGrid) {
    if (!this.appService.checkNullOrUndefined(dataGrid)) {
      const fqaDeviceList = [];
      dataGrid.forEach(res => {
        const element: FqaDevice = new FqaDevice();
        element.SerialNumber = res.SerialNumber;
        // confim
        if (!this.appService.checkNullOrUndefined(res.MSN) && res.MSN !== '') {  // for Verizon
          element.MSN = res.MSN;
        }
        element.Remarks = res.Remarks;
        element.Verify = res.Verify;
        fqaDeviceList.push(element);
      });
      return fqaDeviceList;
    }
  }

  // change input box
  changeInput(inputControl: RmtextboxComponent) {
    inputControl.applyRequired(false);
    this.appErrService.clearAlert();
    this.isClearDisabled = false;
  }

  // serial number verification
  serialNumberVerification(inputControl: RmtextboxComponent) {
    if (!this.isCountCaseDisabled) {
      this.countCase = 0;
    }
    const serial = this.fqaDeviceListData['Elements'].find(x => (x.SerialNumber === this.serialNumber || x.MSN === this.serialNumber));
    if (!this.appService.checkNullOrUndefined(serial)) {
      this.fqaDeviceListData['Elements'].forEach(element => {
        if ((element.SerialNumber === this.serialNumber || element.MSN === this.serialNumber) && element.Remarks === '') {
          if (element.Verify === CommonEnum.no) {
            element.Verify = CommonEnum.yes;
            if (this.countCase < this.totalCount) {
              this.countCase++;
              this.isCountCaseDisabled = true;
              this.serialNumber = '';
              this.serialNumberFocus();
            }
          } else {
            inputControl.applyRequired(true);
            this.appErrService.setAlert(this.appService.getErrorText('3720017'), true);
          }
        } else if ((element.SerialNumber === this.serialNumber || element.MSN === this.serialNumber) && element.Remarks !== '') {
          this.masterPageService.disabledSerialNumber = true;
          this.isCountCaseDisabled = true;
          let userMessage = new Message();
          userMessage = this.messagingService.SendUserMessage('2660044', MessageType.failure);
          this.appErrService.setAlert('Serial number has remark', true);
          this.childContainer.isExceptionCategory = CommonEnum.yes;
          this.childContainer.verifyserialNumber = this.serialNumber;
          this.configContainerProperties();
          this.containerFocus();
        }
      });
      if (this.countCase === this.totalCount) {
        this.validatecountCase();
      }
    } else {
      inputControl.applyRequired(true);
      inputControl.applySelect();
      let userMessage = new Message();
      userMessage = this.messagingService.SendUserMessage('2660044', MessageType.failure);
      this.appErrService.setAlert(userMessage.messageText, true);
    }

  }

  // Validate Count Case
  validatecountCase() {
    const caseCountConatiner = <HTMLInputElement>document.getElementById('caseCount');
    if (!this.appService.checkNullOrUndefined(this.countCase)) {
      if (this.countCase === this.totalCount) {
        this.fqaDeviceListData['Elements'].forEach((element, i) => {
          element.Verify = CommonEnum.yes;
          this.fqaDeviceList.forEach((ele) => {
            if (ele.SerialNumber === element.SerialNumber) {
              ele.Verify = CommonEnum.yes;
            }
          });
        });
      }
      let FqaVerifyDevices: any = {};
      FqaVerifyDevices.FqaVerifyDevice = this.fqaDeviceList;
      const requestObj = { ClientData: this.clientData, FqaVerifyDevices: FqaVerifyDevices, UIData: this.uiData };
      const url = String.Join('/', this.apiConfigService.validateCaseCountUrl, this.countCase.toString());
      this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
        this.spinner.hide();
        if (statusFlag) {
          this.fqaDeviceList = res.Response.FqaVerifyDevices;
          this.batchId = res.Response.BatchId;
          this.processEnable = res.Response.ProcessEnable;
          this.commonService.getReadOnlyDeviceDetailsForContainer(this.contsummaryParent.rmtextchild.value, this.uiData);
        } else {
          this.caseCountBorder(true);
          caseCountConatiner.select();
        }
      });
    }
  }

  // casecount validation error
  caseCountBorder(val: boolean) {
    if (val) {
      const elem: HTMLElement = document.getElementById('caseCount');
      return elem.setAttribute('style', 'border: 1px solid red;');
    } else {
      const elem: HTMLElement = document.getElementById('caseCount');
      return elem.removeAttribute('style');
    }
  }

  validatecountCaseSuccess() {
    if (this.processEnable === CommonEnum.yes) {
      this.isCountCaseDisabled = true;
      this.serialNumber = '';
      this.masterPageService.disabledSerialNumber = true;
      this.childContainer.isExceptionCategory = CommonEnum.no;
      this.childContainer.verifyserialNumber = this.fqaDeviceList[0].SerialNumber;
      this.configContainerProperties();
      this.containerFocus();
      this.isClearDisabled = true;
    }
  }

  // Refresh and getSuggestionContainer(focus)
  // getSuggestContainer sending receive device to child conatiner
  getSuggestContainer(value) {
    if (!this.appService.checkNullOrUndefined(value)) {
      this.clearContainerID();
    }
    this.containerFocus();
    this.configContainerProperties();
    this.childContainer.suggestExceptionContainer();
  }

  // getSuggestExpContainerResponse
  getSuggestExpContainerResponse(response) {
    this.fqaDevice = response.Device;
    this.fqaDevice.ContainerCycle = response.Container.ContainerCycle;
  }

  // validateContainer and sending updated device to child conatiner
  validateContainer(response) {
    if (!this.appService.checkNullOrUndefined(response)) {
      this.fqaDevice.ContainerID = response.Container.ContainerID;
      this.fqaDevice.ContainerCycle = response.Container.ContainerCycle;
      this.childContainer.validateContainer(this.fqaDevice);
    }
  }

  // validate container fail response
  emitValidateContainerFailResponse(response) {
    if (!this.appService.checkNullOrUndefined(response)) {
      this.fqaDevice.ContainerID = response.ContainerID;
      this.fqaDevice.ContainerCycle = response.ContainerCycle;
    }
  }

  // validateContainer Response from child conatiner
  validateContainerResponse(response) {
    if (!this.appService.checkNullOrUndefined(response)) {
      this.containerObj = response;
      this.isProcessDisabled = false;
      this.fqaDevice.ContainerCycle = response.ContainerCycle;
      this.fqaDevice.ContainerID = response.ContainerID;
    } else {
      this.fqaDevice.ContainerID = this.childContainer.ContainerID;
    }
    this.process();
  }

  process() {
    if (this.childContainer.isExceptionCategory === CommonEnum.yes) {
      this.moveSerialNumber();
    } else {
      this.RMXRMProcess();
    }
  }

  // input match
  checkContainer(container) {
    if (!this.appService.checkNullOrUndefined(container)) {
      this.isProcessDisabled = false;
      this.fqaDevice.ContainerID = container.ContainerID;
      this.fqaDevice.ContainerCycle = container.ContainerCycle;
    } else {
      this.isProcessDisabled = true;
    }
  }

  // getSuggestContainerResponse
  getSuggestContainerResponse(response) {
    if (response.ContainerID != null && response.ContainerID !== undefined) {
      this.fqaDevice.ContainerID = response.ContainerID;
      this.fqaDevice.ContainerCycle = response.ContainerCycle;
    }
  }


  // enabling the button and container ID
  configContainerProperties() {
    if (!this.appService.checkNullOrUndefined(this.childContainer)) {
      this.childContainer.isContainerDisabled = false;
      this.childContainer.isClearContainerDisabled = false;
    }
  }

  // move serial number
  moveSerialNumber() {
    const requestObj = { ClientData: this.clientData, Device: this.fqaDevice, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.moveSerialNumberUrl);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        this.clearContainerID();
        this.validateFQASerialNumbers({ InboundContainer: this.inboundContainer }, true);
        this.snackbar.success(res.Response);
      }
    });
  }

  // refreshContainer
  refreshContainer() {
    const requestObj = {
      ClientData: this.clientData, UIData: this.uiData, Containers: this.multipleContainerList,
      Devices: this.contsummaryParent.deviceList
    };
    const url = String.Join('/', this.apiConfigService.refreshContainerUrl, this.contsummaryParent.rmtextchild.value);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        if (res.Response.Quantity === 0) {
          this.reset();
          if (res.StatusMessage) {
            this.snackbar.success(res.StatusMessage); // need to check
          }
        } else {
          this.containerObj.Quantity = res.Response.Quantity;
          this.contsummaryParent.quantity = (this.containerObj.Quantity).toString();
          if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
            this.contsummaryParent.getInboundDetails();
          }
        }
      } else {
        this.clearContainerSummary();
        this.clearContainerSummaryList();
      }
    });
  }

  // rmx to rm process
  validRMXRMTransferContainer() {
    const requestObj = {
      ClientData: this.clientData, UIData: this.uiData, Containers: this.multipleContainerList,
      Devices: this.contsummaryParent.deviceList
    };
    const url = String.Join('/', this.apiConfigService.validateRMXRMTransferContainer, this.childContainer.ContainerID);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.RMXRMProcess();
      }
    });
  }

  // rmx to rm process
  RMXRMProcess() {
    let FqaVerifyDevices:any={};
    FqaVerifyDevices.FqaVerifyDevice =  this.fqaDeviceList;
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, FqaVerifyDevices: FqaVerifyDevices };
    const url = String.Join('/', this.apiConfigService.RMXRMProcess, this.batchId, this.inboundContainer, this.childContainer.ContainerID);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        const postUrl = String.Join('/', this.apiConfigService.postFqaUpdateProcess, this.batchId);
        this.commonService.postUpdateProcess(postUrl, requestObj);
        this.reset();
        this.snackbar.success(res.Response);
      }
    });
  }

  // Clear Container Summary
  clearContainerSummary() {
    if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
      this.contsummaryParent.inbContainerDisabled = false;
      this.contsummaryParent.rmtextchild.value = '';
      this.contsummaryParent.quantity = '';
      this.contsummaryParent.category = '';
      this.contsummaryParent.isClearDisabled = true;
    }
  }

  // clear container summary props
  clearContainerSummaryList() {
    if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
      this.contsummaryParent.deviceList = [];
      this.contsummaryParent.containersList = [];
      this.contsummaryParent.containerSummaryPropertiesList = [];
      this.contsummaryParent.canAllowNextContainerStatus = null;
      this.contsummaryParent.containerSummaryProperties = [];
      this.contsummaryParent.containerActualProp = null;
    }
  }

  // Clear Container Suggestion
  clearContainerID() {
    if (!this.appService.checkNullOrUndefined(this.childContainer)) {
      this.childContainer.ContainerID = '';
      this.childContainer.suggestedContainer = '';
      this.childContainer.categoryName = '';
      this.childContainer.isContainerDisabled = true;
      this.childContainer.iconBtnDisabled = true;
      this.childContainer.isClearContainerDisabled = true;
      this.childContainer.applyRequired(false);
      this.childContainer.containerResponse = null;
      this.childContainer.isExceptionCategory = '';
      this.childContainer.verifyserialNumber = '';
    }
  }

  // clear
  reset() {
    this.clearSerialNo();
    this.headingsobj = [];
    this.inboundProperties = null;
    this.multipleContainerList = null;
    this.inboundContainer = null;
    this.totalCount = 0;
    this.fqaDeviceList = [];
    this.caseCntEnable = CommonEnum.no;
    this.masterPageService.disabledSerialNumber = true;
    this.fqaDeviceListData = null;
    this.isCountCaseDisabled = true;
    this.countCase = null;
    this.clearContainerSummary();
    this.clearContainerSummaryList();
    this.masterPageService.inboundContainerFocus();
    this.selectedFQAMode = '';
    this.uiData.OperationId = this.operationId;
  }

  clearSerialNo() {
    this.appErrService.clearAlert();
    this.masterPageService.disabledSerialNumber = false;
    if (this.caseCntEnable === CommonEnum.yes) {
      this.isCountCaseDisabled = (this.countCase > 0) ? true : false;
    } else {
      this.countCase = null;
    }
    this.containerObj = new Container();
    this.fqaDevice = new FqaDevice();
    this.serialNumber = '';
    this.isClearDisabled = true;
    this.batchId = '';
    this.processEnable = '';
    this.serialNumberFocus();
    this.isProcessDisabled = true;
    this.clearContainerID();
  }

  // Serial Number Focus
  serialNumberFocus() {
    this.appService.setFocus('serialNum');
  }

  // Container Focus
  containerFocus() {
    this.appService.setFocus('containerInputId');
  }

  // Container Focus
  containerResetFocus() {
    this.appService.setFocus('clearContainerSummary');
  }

  processFocus() {
    this.appService.setFocus('Process');
  }

  ngOnDestroy() {
    this.appErrService.clearAlert();
    this.fqaOnChangeMode.unsubscribe();
    this.masterPageService.selectedOptionMode.next(null);
    this.commonService.emitReadOnlyDeviceResponseForContainer.next(null);
    this.emitReadOnlyDeviceResponseForContainer.unsubscribe();
    this.masterPageService.module = '';
    this.masterPageService.moduleName.next(null);
    this.masterPageService.operationObj = null;
    this.masterPageService.showRibbondropdown = false;
    if (!this.appService.checkNullOrUndefined(this.originationOperation) && this.originationOperation) {
      this.originationOperation.unsubscribe();
    }
    if (this.pollingData !== undefined) {
      this.pollingData.unsubscribe();
      this.clear.click();
    }
    this.masterPageService.tempQueList = null;
    this.masterPageService.options = [];
    this.masterPageService.option = [];
    this.masterPageService.disabledSerialNumber = true;
    this.clearContainerID();
    this.clearContainerSummary();
    this.clearContainerSummaryList();
    this.masterPageService.defaultProperties();
  }

}
