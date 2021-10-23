import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { AudioType } from '../../enums/audioType.enum';
import { Subscription } from 'rxjs';
import { CommonService } from './../../services/common.service';
import { Component, OnInit, OnDestroy, Input, TemplateRef } from '@angular/core';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';
import { ApiConfigService } from '../../utilities/rlcutl/api-config.service';
import { ApiService } from '../../utilities/rlcutl/api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';
import { AppService } from '../../utilities/rlcutl/app.service';
import { ClientData } from '../../models/common/ClientData';
import { UiData } from '../../models/common/UiData';
import { Grid } from '../../models/common/Grid';
import { String } from 'typescript-string-operations';
import { Container } from '../../models/common/Container';
import { ContainerType } from '../../enums/containerType.enum';
import { EngineResult } from '../../models/common/EngineResult';
import { StatusCodes } from '../../enums/status.enum';
import { StorageData } from '../../enums/storage.enum';
import { CommonEnum } from '../../enums/common.enum';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-container-information',
  templateUrl: './container-information.component.html',
  styleUrls: ['./container-information.component.css']
})
export class ContainerInformationComponent implements OnInit, OnDestroy {
  @Input() tittle: string;

  clientData = new ClientData();
  uiData = new UiData();
  grid: Grid;
  operationObj: any;

  isResetDisabled = true;
  containerId: any;
  containerInfo = new Container();
  // commonInfo: any;
  mobileData: any;
  tempDetailInfoList: any[];
  detailInfoList: any;

  containerType = ContainerType;
  mobileDataList = [];
  statusCode = StatusCodes;
  storageData = StorageData;
  isHyperLinkRequired = false;
  controlConfig: any;
  // controlConfigData: any;
  emitHideConfiguration: Subscription;
  isCloseDisabled = true;
  showAlert = false;
  text: string;
  flag = false;
  isContainerDisabled = false;
  isContainerEmptyButtonDisable = true;
  dialogRef: any;

  constructor(
    private apiService: ApiService,
    private apiConfigService: ApiConfigService,
    private spinner: NgxSpinnerService,
    public appErrService: AppErrorService,
    public masterPageService: MasterPageService,
    public appService: AppService,
    public commonService: CommonService,
    private snackbar: XpoSnackBar,
    private dialog: MatDialog
  ) {
    this.emitHideConfiguration = this.masterPageService.emitHideConfiguration.subscribe(dbControlConfig => {
      if (!this.appService.checkNullOrUndefined(dbControlConfig)) {
        this.controlConfig = dbControlConfig;
        this.containerFocus();
        this.spinner.hide();
      }
    });
  }

  ngOnInit() {
    this.masterPageService.emitConfigRequired = true;
    if (this.tittle) {
      this.operationObj = this.masterPageService.getOperationForPopUp(this.tittle);
      this.flag = true;
      this.masterPageService.getControlConfigForUtility(this.operationObj.Module, this.operationObj.OperationId);
    } else {
      this.operationObj = this.masterPageService.getRouteOperation();
      this.masterPageService.setModule(this.operationObj.Module);
      this.masterPageService.setTitle(this.operationObj.Title);
      localStorage.setItem(this.storageData.module, this.operationObj.Module);
      this.appErrService.appMessage();
      this.flag = false;
    }
    if (this.operationObj) {
      this.uiData.OperationId = this.operationObj.OperationId;
      this.uiData.OperCategory = this.operationObj.Category;
      this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
    }
  }

  // checking container empty or not
  isContainerEmpty() {
    return Object.keys(this.containerInfo).length === 0;
  }

  // based on this method we are enabling reset button
  isInputValueEmpty() {
    if (this.mobileDataList.length || this.detailInfoList || !this.isContainerEmpty()) {
      this.isResetDisabled = false;
    } else {
      this.isResetDisabled = true;
    }
    this.appErrService.clearAlert();
  }

  // container Focus
  containerFocus() {
    this.appService.setUtilityFocus('containerId');
  }

  changeContainerInput() {
    this.isResetDisabled = false;
    this.clearAlert();
  }

  // getting Container Information
  getContainerInfo(containerId) {
    this.reset();
    this.isResetDisabled = false;
    if (!this.appService.checkNullOrUndefined(containerId) && containerId) {
      this.containerId = containerId;
      this.spinner.show();
      this.clearAlert();
      const requestObj = { ClientData: this.clientData, UIData: this.uiData };
      const url = String.Join('/', this.apiConfigService.getContainerInfo, containerId);
      this.apiService.apiPostRequest(url, requestObj)
        .subscribe(response => {
          const result = response.body;
          this.spinner.hide();
          if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.pass) {
            if (!this.appService.checkNullOrUndefined(result.Response)) {
              this.isContainerEmptyButtonDisable = false;
              this.detailInfoList = null;
              this.mobileData = null;
              this.mobileDataList = [];
              this.isHyperLinkRequired = false;
              this.isContainerDisabled = true;
              // for displaying common properties for both mobile and desktop
              if (!this.appService.checkNullOrUndefined(result.Response.Container)) {
                this.containerInfo = new Container();
                this.containerInfo = result.Response.Container;
              }
              if (result.Response.hasOwnProperty('IsCloseEligible')) {
                this.isCloseDisabled = result.Response.IsCloseEligible === CommonEnum.yes ? false : true;
              }
              if (!this.appService.checkNullOrUndefined(result.Response.Container.ContainerType)) {
                if (!this.appService.checkNullOrUndefined(result.Response.Containers) && result.Response.Containers.length > 0) {
                  const parentContainerList = [];
                  if (this.controlConfig.hasOwnProperty('parentContainerDisplayProps') &&
                    this.controlConfig.parentContainerDisplayProps.length) {
                    result.Response.Containers.forEach(res => {
                      const element: any = {};
                      this.controlConfig.parentContainerDisplayProps.forEach(singleInfo => {
                        element[singleInfo] = res[singleInfo];
                      });
                      parentContainerList.push(element);
                    });
                    this.isHyperLinkRequired = true;
                    this.onProcessContainerInfoJsonGrid(parentContainerList);
                  }
                } else if (!this.appService.checkNullOrUndefined(result.Response.TrackingNumbers) && result.Response.TrackingNumbers.length > 0) {
                  const palletList = [];
                  if (this.controlConfig.hasOwnProperty('trackingNoDisplayProps') &&
                    this.controlConfig.trackingNoDisplayProps.length) {
                    result.Response.TrackingNumbers.forEach(res => {
                      const element: any = {};
                      this.controlConfig.trackingNoDisplayProps.forEach(singleInfo => {
                        element[singleInfo] = res[singleInfo];
                      });
                      palletList.push(element);
                    });
                    this.onProcessContainerInfoJsonGrid(palletList);
                  }
                } else if (!this.appService.checkNullOrUndefined(result.Response.Devices) && result.Response.Devices.length > 0) {
                  const containerList = [];
                  if (this.controlConfig.hasOwnProperty('deviceDisplayProps') &&
                    this.controlConfig.deviceDisplayProps.length) {
                    result.Response.Devices.forEach(res => {
                      const element: any = {};
                      for (const key in res) {
                        if (this.controlConfig.deviceDisplayProps.find(resp => resp === key)) {
                          element[key] = res[key];
                        } else {
                          if (res[key] instanceof Object) {
                            for (const key1 in res[key]) {
                              if (this.controlConfig.deviceDisplayProps.find(resp => resp === key1)) {
                                element[key1] = res[key][key1];
                              }
                            }
                          }
                        }
                      }
                      containerList.push(element);
                    });
                    this.onProcessContainerInfoJsonGrid(containerList);
                  }
                }
              }
              if (!this.appService.checkNullOrUndefined(result.Response.MobileData)) {
                this.mobileData = result.Response.MobileData;
                this.mobileDataList = Object.keys(this.mobileData);
              }
            }
          } else if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.fail) {
            this.spinner.hide();
            this.mobileData = null;
            this.mobileDataList = [];
            this.containerInfo = new Container();
            this.detailInfoList = null;
            this.clearError(result);
            this.containerFocus();
          }
        },
          error => {
            if (this.tittle) {
              this.showAlert = true;
              this.text = this.appErrService.emiterrorvalue;
            } else {
              this.showAlert = false;
              this.text = '';
              this.appErrService.handleAppError(error);
            }
            this.appErrService.alertSound(AudioType.error);
          });
    }
  }

  validateCloseContainer(template) {
    this.isCloseDisabled = true;
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.validateCloseContainerUrl, this.containerInfo.ContainerID);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.isCloseDisabled = false;
        if (res.Response.hasOwnProperty('IsInboundContainer') && res.Response.IsInboundContainer) {
          this.openModal(template);
          this.spinner.hide();
        } else {
          this.closeContainer();
        }
      }
    })
  }

  openModal(template: TemplateRef<any>) {
    this.dialogRef = this.dialog.open(template, {
      hasBackdrop: true,
      disableClose: true,
      panelClass: 'dialog-width-sm'
  });
  }

  emptyContainerPopup(template: TemplateRef<any>) {
    this.clearAlert();
    this.openModal(template);
  }

  // Container empty confirmation
  emptyContainerConfirmation() {
    this.clearAlert();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.markContainerAsEmpty, this.containerId);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        this.reset();
        if (this.dialogRef) {
          this.dialogRef.close();
        }
        this.snackbar.success(res.Response);
      }
    });
  }

  closeContainer() {
    const requestObj = { ClientData: this.clientData, Container: this.containerInfo, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.closeContainerUrl);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        this.snackbar.success(res.StatusMessage);
        this.reset();
        if (this.dialogRef) {
          this.dialogRef.close();
        }
        this.masterPageService.hideModal();
      }
    });
  }

  private clearError(result: any) {
    if (this.tittle) {
      this.showAlert = true;
      this.text = result.ErrorMessage.ErrorDetails;
    } else {
      this.showAlert = false;
      this.text = '';
      this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
    }
  }

  clearAlert() {
    this.showAlert = false;
    this.text = '';
    this.appErrService.clearAlert();
  }

  onProcessContainerInfoJsonGrid(Response: any[]) {
    if (!this.appService.checkNullOrUndefined(Response)) {
      this.tempDetailInfoList = [];
      const headingsArray = Object.keys(Response[0]);
      Response.forEach(res => {
        const element: any = {};
        headingsArray.forEach(singleInfo => {
          element[singleInfo] = res[singleInfo];
        });
        this.tempDetailInfoList.push(element);
      });
    }
    this.grid = new Grid();
    this.detailInfoList = this.appService.onGenerateJson(this.tempDetailInfoList, this.grid);
  }

  reset() {
    this.containerId = null;
    this.containerInfo = new Container();
    this.detailInfoList = null;
    this.tempDetailInfoList = [];
    this.mobileData = null;
    this.mobileDataList = [];
    this.isResetDisabled = true;
    this.clearAlert();
    this.containerFocus();
    this.isCloseDisabled = true;
    this.isContainerDisabled = false;
    this.isContainerEmptyButtonDisable = true;
  }

  ngOnDestroy() {
    if (this.appService.checkNullOrUndefined(this.tittle)) {
      this.masterPageService.showUtilityIcon = false;
      this.masterPageService.clearModule();
    }
    this.appErrService.clearAlert();
    if (this.controlConfig) {
      this.controlConfig = new EngineResult();
    }
    this.masterPageService.emitHideConfiguration.next(null);
    this.emitHideConfiguration.unsubscribe();
    this.masterPageService.emitConfigRequired = false;
    if (this.dialogRef) {
      this.dialogRef.close();
    }
    this.masterPageService.hideModal();
  }

}
