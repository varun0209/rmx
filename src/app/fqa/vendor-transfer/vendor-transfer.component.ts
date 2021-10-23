import { FqaDevice } from './../../models/fqa/FqaDevice';
import { LottableTrans } from './../../models/common/LottableTrans';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { AppService } from '../../utilities/rlcutl/app.service';
import { ApiService } from '../../utilities/rlcutl/api.service';
import { ApiConfigService } from '../../utilities/rlcutl/api-config.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';
import { TransactionService } from '../../services/transaction.service';
import { StorageData } from '../../enums/storage.enum';
import { StatusCodes } from '../../enums/status.enum';
import { CommonEnum } from '../../enums/common.enum';
import { Subscription } from 'rxjs';
import { dropdown } from '../../models/common/Dropdown';
import { String } from 'typescript-string-operations';
import { ClientData } from '../../models/common/ClientData';
import { UiData } from './../../models/common/UiData';
import { Grid } from '../../models/common/Grid';
import { ContainerSummaryComponent } from '../../framework/busctl/container-summary/container-summary.component';
import { DeleteConfirmationDialogComponent } from '../../framework/frmctl/delete-confirmation-dialog/delete-confirmation-dialog.component';


@Component({
  selector: 'app-vendor-transfer',
  templateUrl: './vendor-transfer.component.html',
  styleUrls: ['./vendor-transfer.component.css']
})
export class VendorTransferComponent implements OnInit, OnDestroy {

  @ViewChild(ContainerSummaryComponent) contsummaryParent: ContainerSummaryComponent;
  
  isProcessDisabled = true;
  isClearDisabled = true;
  isVendorIDDisabled = true;
  isNewBatchDisabled = true;
  isbatchIdDisabled = true;
  operationObj: any;
  uiData = new UiData();
  batchId: string;
  containerID: string;
  shipToInfo = [];
  batchDetails = [];
  batchData = [];
  vendorTypes = [];
  selectedMode: Subscription;
  controlConfig: any;
  storageData: any;
  isShowControls: boolean;
  clientData = new ClientData();
  transferType: any;
  vendorID = '';
  isVendorTypeExist = false;
  batchDetailsObj: any;
  shipToInfoObj: any;
  isShowGenerateNewBatch = true;
  contSummaryHideResetSection = true;
  grid: Grid;
  multipleContainerList = [];
  canAllowNextContainerStatus: any;
  inbContainerResponse: any;
  containerListGrid: any;
  ContainersCount = 0;
  serialNumberCount = 0;
  deleteContainerId: any;
  inbContainerDisabled = true;
  emitHideSpinner: Subscription;
  lottableTrans: LottableTrans;
  deviceList: FqaDevice[] = [];
  isNewBatchCreated = false;
  operationId: string;

  constructor(
    public appService: AppService,
    private apiService: ApiService,
    private apiConfigService: ApiConfigService,
    private spinner: NgxSpinnerService,
    private snackbar: XpoSnackBar,
    public appErrService: AppErrorService,
    public masterPageService: MasterPageService,
    public transactionService: TransactionService,
  ) {
    this.selectedMode = this.masterPageService.selectedOptionMode.subscribe(mode => {
      if (!this.appService.checkNullOrUndefined(mode)) {
        this.onChangeTransferType(mode);
      }
    });
    //emitting hide spinner
    this.emitHideSpinner = this.masterPageService.emitHideSpinner.subscribe(spinnerFlag => {
      if (!this.appService.checkNullOrUndefined(spinnerFlag) && spinnerFlag) {
        this.getVendorTransferTypes();
        this.appService.setFocus('opCategorydropdown');
        this.isShowControls = false;
        this.controlConfig = JSON.parse(localStorage.getItem(StorageData.controlConfig));
        if (!this.appService.checkNullOrUndefined(this.controlConfig.ribbondropdown) && this.controlConfig.ribbondropdown.Show) {
          this.masterPageService.showRibbondropdown = this.controlConfig.ribbondropdown.Show;
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
      this.masterPageService.module = this.operationObj.Module;
      this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
      localStorage.setItem(StorageData.module, this.operationObj.Module);
      this.masterPageService.setCardHeader(CommonEnum.batchDetails);
      this.masterPageService.operationObj = this.operationObj;
      this.masterPageService.hideSpinner = true;
    }
  }

  //operationId
  setCurrentOperationId(operationId) {
    this.uiData.OperationId = operationId;
  }

  // getVendorTransferTypes
  getVendorTransferTypes() {
    this.spinner.show();
    this.masterPageService.options = [];
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const getVendorTransferTypes = String.Join('/', this.apiConfigService.getVendorTransferTypes);
    this.apiService.apiPostRequest(getVendorTransferTypes, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          if (!this.appService.checkNullOrUndefined(res.Response)) {
            res.Response.forEach((element) => {
              const dd: dropdown = new dropdown();
              dd.Id = element.Id;
              dd.Text = element.Text;
              this.masterPageService.options.push(dd);
            });
            this.spinner.hide();
            this.inbContainerDisabled = true;
          }
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          this.spinner.hide();
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }

  // on Change of TransferTypes
  onChangeTransferType(transferType) {
    this.isShowControls = true;
    this.transferType = transferType;
    if (this.masterPageService.hideControls && this.masterPageService.hideControls.controlProperties) {
      if (this.masterPageService.hideControls.controlProperties.vendorId && this.masterPageService.hideControls.controlProperties.vendorId.Hidden) {
        this.isVendorTypeExist = false;
        this.getTransferTypeConfig();
      } else {
        this.isVendorTypeExist = true;
        this.getTransTypeVendors();
      }
    }
    this.reset();
  }
  // depends upon vendor Control existing we are deciding the flow from below
  private vendorTypeCheck() {
    if (this.isVendorTypeExist) {
      this.vendorEnableConfig();
    } else {
      this.isNewBatchDisabled = false;
      this.isbatchIdDisabled = false;
      this.inbContainerDisabled = false;
      this.batchIdFocus();
    }
  }

  vendorEnableConfig() {
    if (this.vendorTypes.length === 1) {
      this.vendorID = this.vendorTypes[0].Id;
      this.batchDetailsObj.SelectedVendorId = this.vendorID;
      this.isNewBatchDisabled = false;
      this.isbatchIdDisabled = false;
      this.inbContainerDisabled = false;
      this.isClearDisabled = false;
      this.batchIdFocus();
    } else {
      this.isVendorIDDisabled = false;
      this.isNewBatchDisabled = true;
      this.isbatchIdDisabled = true;
      this.inbContainerDisabled = true;
      this.vendorIdFocus();
    }
  }

  // on vendor change
  onVendorChange(event) {
    this.vendorID = event;
    this.batchDetailsObj.SelectedVendorId = event;
    this.clear();
    this.isNewBatchDisabled = false;
    this.isbatchIdDisabled = false;
    this.inbContainerDisabled = false;
    this.isClearDisabled = false;
    this.batchIdFocus();
  }

  // getTransTypeVendors
  getTransTypeVendors() {
    this.spinner.show();
    this.vendorTypes = [];
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const getTransTypeVendors = String.Join('/', this.apiConfigService.getTransTypeVendors, this.transferType);
    this.apiService.apiPostRequest(getTransTypeVendors, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          if (!this.appService.checkNullOrUndefined(res.Response)) {
            res.Response.forEach((element) => {
              const dd: dropdown = new dropdown();
              dd.Id = element.Id;
              dd.Text = element.Text;
              this.vendorTypes.push(dd);
            });
            this.getTransferTypeConfig();
          }
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }

  // for generating Batch
  createVendorTransferBatchId() {
    this.spinner.show();
    this.appErrService.clearAlert();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const createVendorTransferBatchId = String.Join('/', this.apiConfigService.createVendorTransferBatchId, this.transferType, this.vendorID);
    this.apiService.apiPostRequest(createVendorTransferBatchId, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          this.batchId = res.Response.BatchId;
          this.isbatchIdDisabled = true;
          this.isNewBatchDisabled = true;
          this.isNewBatchCreated = true;
          this.masterPageService.inboundContainerFocus();
          this.getCMBatchInfo();
          this.isClearDisabled = false;
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });

  }

  // get batchInfo
  getCMBatchInfo() {
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const getCMBatchInfo = String.Join('/', this.apiConfigService.getCMBatchInfo, this.batchId);
    this.apiService.apiPostRequest(getCMBatchInfo, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          if (!this.appService.checkNullOrUndefined(res.Response)) {
            this.shipToInfo = Object.keys(res.Response);
            this.shipToInfoObj = res.Response;
            this.isbatchIdDisabled = true;
            this.isNewBatchDisabled = true;
            this.getCMBatchContainers();
          }
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          this.spinner.hide();
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }

  // getTransferTypeConfig
  getTransferTypeConfig() {
    this.spinner.show();
    this.batchDetails = [];
    this.batchDetailsObj = null;
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const getTransferTypeConfig = String.Join('/', this.apiConfigService.getTransferTypeConfig, this.transferType);
    this.apiService.apiPostRequest(getTransferTypeConfig, requestObj)
      .subscribe(response => {
        const res = response.body;
        this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          if (!this.appService.checkNullOrUndefined(res.Response)) {
            this.batchDetails = Object.keys(res.Response);
            this.batchDetailsObj = res.Response;
            if (this.isVendorTypeExist) {
              this.vendorEnableConfig();
            }
          }
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }

  // getCMBatchContainers
  getCMBatchContainers() {
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const getCMBatchContainers = String.Join('/', this.apiConfigService.getCMBatchContainers, this.batchId);
    this.apiService.apiPostRequest(getCMBatchContainers, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          this.batchConfig(res);
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }

  // getCMBatchInfoByContainer
  getCMBatchInfoByContainer() {
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const getCMBatchInfoByContainer = String.Join('/', this.apiConfigService.getCMBatchInfoByContainer, this.containerID);
    this.apiService.apiPostRequest(getCMBatchInfoByContainer, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          if (!this.appService.checkNullOrUndefined(res.Response) && !this.appService.checkNullOrUndefined(res.Response.BatchId)) {
            this.batchId = res.Response.BatchId;
            this.isbatchIdDisabled = true;
            this.isNewBatchDisabled = true;
            this.isClearDisabled = false;
            this.getCMBatchInfo();
          }
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.updateContSummaryContainersList();
          if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
            this.contsummaryParent.rmtextchild.value = '';
            this.contsummaryParent.inbContainerDisabled = false;
          }
          this.spinner.hide();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }

  // getCMBatchSerialNumbers
  getCMBatchSerialNumbers() {
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const getCMBatchSerialNumbers = String.Join('/', this.apiConfigService.getCMBatchSerialNumbers, this.batchId);
    this.apiService.apiPostRequest(getCMBatchSerialNumbers, requestObj)
      .subscribe(response => {
        const res = response.body;
        this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          if (!this.appService.checkNullOrUndefined(res.Response)) {
            this.batchData = res.Response.CMBatchSNS;
            this.deviceList = res.Response.Devices;
            this.grid = new Grid();
            this.masterPageService.tempQueList = this.appService.onGenerateJson(res.Response.CMBatchSNS, this.grid);
          }
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.noResult) {
          if (!this.appService.checkNullOrUndefined(res.Response)) {
            this.snackbar.info(res.Response);
          }
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }


  onBatchIdChange() {
    this.isClearDisabled = false;
    this.appErrService.clearAlert();
  }

  addContainerToBatch() {
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, Containers: this.multipleContainerList };
    const addContainerToBatch = String.Join('/', this.apiConfigService.addContainerToBatch, this.batchId, this.containerID);
    this.apiService.apiPostRequest(addContainerToBatch, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          this.batchConfig(res);
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.updateContSummaryContainersList();
          this.checkContainerStatus();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          this.spinner.hide();
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }

  private batchConfig({ Response }) {
    if (!this.appService.checkNullOrUndefined(Response)) {
      this.canAllowNextContainerStatus = Response.CanAllowNextContainer;
      this.multipleContainerList = Response.Containers;
      this.serialNumberCount = Response.SerialNumberCount;
      this.ContainersCount = Response.ContainersCount;
      this.checkContainerStatus();
      if (!this.isNewBatchCreated) {
        this.getCMBatchSerialNumbers();
      } else {
        this.spinner.hide();
      }
      this.isNewBatchCreated = false;
      this.vendorTransferGridConfig();
    }
  }

  removePopup(event) {
    this.deleteContainerId = event.ContainerID;
    this.masterPageService.openModelPopup(DeleteConfirmationDialogComponent);
    this.masterPageService.dialogRef.componentInstance.emitConfirmation.subscribe(($e) => {
      this.removeContainerFromBatch();
    });
  }
  
  removeContainerFromBatch() {
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, Containers: this.multipleContainerList };
    const removeContainerFromBatch = String.Join('/', this.apiConfigService.removeContainerFromBatch, this.batchId, this.deleteContainerId);
    this.apiService.apiPostRequest(removeContainerFromBatch, requestObj)
    .subscribe(response => {
      const res = response.body;
      if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
        this.batchConfig(res);
        this.updateContSummaryContainersList();
        this.masterPageService.hideDialog();
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          this.spinner.hide();
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }

  private updateContSummaryContainersList() {
    if (this.contsummaryParent.containersList && this.contsummaryParent.containersList.length) {
      const containerId = this.deleteContainerId ? this.deleteContainerId : this.containerID;
      const containerIndex = this.contsummaryParent.containersList.findIndex(c => c.ContainerID === containerId);
      if (!this.appService.checkNullOrUndefined(containerIndex)) {
        this.contsummaryParent.containersList.splice(containerIndex, 1);
      }
    }
  }

  checkContainerStatus() {
    if (!this.appService.checkNullOrUndefined(this.canAllowNextContainerStatus) && this.canAllowNextContainerStatus === CommonEnum.yes) {
      this.contsummaryParent.rmtextchild.value = '';
      this.contsummaryParent.inbContainerDisabled = false;
      this.masterPageService.inboundContainerFocus();
    }
    if (!this.appService.checkNullOrUndefined(this.canAllowNextContainerStatus) && this.canAllowNextContainerStatus === CommonEnum.no) {
      if (this.multipleContainerList.length >= 1) {
        this.contsummaryParent.rmtextchild.value = '';
        this.contsummaryParent.inbContainerDisabled = true;
        const inputElement = <HTMLInputElement>document.getElementById('inboundcontainer');
        if (inputElement) {
          inputElement.blur();
        }
      }
    }
    if (!this.multipleContainerList.length) {
      this.masterPageService.tempQueList = null;
      this.batchData = [];
      this.isProcessDisabled = true;
    } else {
      this.isProcessDisabled = false;
    }
  }

  setSaveValue(val) {
    this.isProcessDisabled = val;
  }

  // updateLottables
  updateLottables() {
    this.setSaveValue(true);
    this.spinner.show();
    this.lottableTrans = new LottableTrans();
    const requestObj = {
      ClientData: this.clientData,
      UIData: this.uiData,
      Devices: this.deviceList,
      LottableTrans: this.lottableTrans,
      TransferTypeConfig: this.batchDetailsObj
    };
    this.apiService.apiPostRequest(this.apiConfigService.updateLottables, requestObj).subscribe(
      (response) => {
        const res = response.body;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          this.processCMBatch();
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.spinner.hide();
          this.setSaveValue(false);
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      },
      (erro) => {
        this.appErrService.handleAppError(erro);
      }
    );
  }



  processCMBatch() {
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, TransferTypeConfig: this.batchDetailsObj };
    const processCMBatch = String.Join('/', this.apiConfigService.processCMBatch, this.batchId);
    this.apiService.apiPostRequest(processCMBatch, requestObj)
      .subscribe(response => {
        const res = response.body;
        this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          this.snackbar.success(res.Response);
          this.reset();
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.setSaveValue(false);
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }

  // inbContainerID
  getinbContainerID(inbcontid) {
    this.containerID = inbcontid;
  }

  // vendor Id focus
  vendorIdFocus() {
    this.appService.setFocus('vendorID');
  }

  // batch Id Focus
  batchIdFocus() {
    this.appService.setFocus('batchId');
  }


  private vendorTransferGridConfig() {
    this.grid = new Grid();
    this.grid.SearchVisible = false;
    this.grid.DeleteVisible = true;
    this.containerListGrid = this.appService.onGenerateJson(this.containerListConfig([...this.multipleContainerList]), this.grid);
  }

  private containerListConfig(Response) {
    if (!this.appService.checkNullOrUndefined(Response)) {
      const processData = [];
      Response.forEach(res => {
        const element: any = {};
        element.ContainerID = res.ContainerID;
        element.CategoryName = res.CategoryName;
        element.ContainerCycle = res.ContainerCycle;
        element.Quantity = res.Quantity;
        processData.push(element);
      });
      return processData;
    }
  }

  // auto populate serial number
  getAutoPopulatedSerailNum() {
    this.isClearDisabled = false;
    if (!this.batchId) {
      this.getCMBatchInfoByContainer();
    } else {
      this.addContainerToBatch();
    }
  }

  // reset
  reset() {
    this.clear();
    this.vendorID = '';
    this.vendorTypeCheck();
    this.isClearDisabled = true;
  }

  private clear() {
    this.batchId = '';
    this.containerID = '';
    this.appErrService.clearAlert();
    this.isNewBatchCreated = false;
    this.isProcessDisabled = true;
    this.shipToInfo = [];
    this.batchData = [];
    this.multipleContainerList = [];
    this.serialNumberCount = 0;
    this.ContainersCount = 0;
    this.masterPageService.tempQueList = null;
    if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
      this.contsummaryParent.clearContainerSummary();
      this.contsummaryParent.clearProperties();
    }
    this.uiData.OperationId = this.operationId;
  }

  ngOnDestroy() {
    this.selectedMode.unsubscribe();
    this.emitHideSpinner.unsubscribe();
    this.masterPageService.showUtilityIcon = false;
    this.masterPageService.showRibbondropdown = false;
    this.masterPageService.selectedOptionMode.next(null);
    this.masterPageService.tempQueList = null;
    this.contSummaryHideResetSection = false;
    this.isVendorTypeExist = false;
    this.batchDetailsObj = null;
    this.masterPageService.defaultProperties();
    if (this.contsummaryParent) {
      if (this.contsummaryParent.dialogRef) {
        this.contsummaryParent.dialogRef.close();
      }
      this.contsummaryParent.containersList = [];
      this.contsummaryParent.deviceList = [];
    }
    this.masterPageService.options = [];
    this.masterPageService.operationObj = null;
  }
}
