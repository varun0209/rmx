import { Authorization } from './../../models/receiving/Authorization';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from './../../utilities/rlcutl/app.service';
import { MasterPageService } from './../../utilities/rlcutl/master-page.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppErrorService } from './../../utilities/rlcutl/app-error.service';
import { ApiConfigService } from './../../utilities/rlcutl/api-config.service';
import { ApiService } from './../../utilities/rlcutl/api.service';
import { Grid } from './../../models/common/Grid';
import { String } from 'typescript-string-operations';
import { RmtextboxComponent } from '../../framework/frmctl/rmtextbox/rmtextbox.component';
import { ClientData } from '../../models/common/ClientData';
import { UiData } from '../../models/common/UiData';
import { TraceTypes } from '../../enums/traceType.enum';
import { CommonService } from '../../services/common.service';
import { MessageType } from '../../enums/message.enum';
import { FindTraceHoldComponent } from '../../framework/busctl/find-trace-hold/find-trace-hold.component';
import { StorageData } from '../../enums/storage.enum';
import { StatusCodes } from '../../enums/status.enum';
import { EngineResult } from '../../models/common/EngineResult';
import { Subscription } from 'rxjs';
import { TrackingNum } from '../../models/receiving/TrackingNum';
import { AudioType } from '../../enums/audioType.enum';
import { CommonEnum } from '../../enums/common.enum';
import { Container } from '../../models/common/Container';
import { MatDialog } from '@angular/material/dialog';
import { checkNullorUndefined } from '../../enums/nullorundefined';


@Component({
  selector: 'receive-search',
  templateUrl: './receive-search.component.html',
  styleUrls: ['./receive-search.component.css']
})
export class ReceiveSearchComponent implements OnInit, OnDestroy {

  @ViewChild(RmtextboxComponent) searchKeyInput: RmtextboxComponent;

  //Search Key
  searchInput: string;
  containreId: string;
  trackingNumber: string;
  externReceiptKey: string;
  receiptKey: string;
  issearchKeyDisabled = true;
  isPalletIdDisabled = false;
  isTrackingNoDisabled = true;
  isResetDisabled = true;

  //Authorization
  authList = [];
  authListResponse = [];
  authListDetails: any;
  editAuthRow: any;

  traceTypes = TraceTypes;
  authorization: Authorization;
  grid: Grid;
  clientData = new ClientData();
  uiData = new UiData();
  trackingNubmerObj = new TrackingNum();
  container = new Container();
  loadPallet = false;

  operationObj: any;
  appConfig: any;
  // get controlConfig
  controlConfig: any;

  editAuthDetailRowResponse: any;
  storageData = StorageData;
  statusCode = StatusCodes;

  emitHideControls: Subscription;

  constructor(public apiservice: ApiService,
    private apiConfigService: ApiConfigService,
    public appErrService: AppErrorService,
    private spinner: NgxSpinnerService,
    public masterPageService: MasterPageService,
    private appService: AppService,
    private router: Router,
    private commonService: CommonService,
    public dialog: MatDialog) {

    this.emitHideControls = this.masterPageService.receiveingConfiguration.subscribe(hideControls => {
      if (!this.appService.checkNullOrUndefined(hideControls)) {
        if (hideControls.automationContainerId !== undefined && hideControls.automationContainerId.Hidden) {
          this.spinner.hide();
          this.setFocusOnLoad();
        } else {
          this.loadPallet = true;
          this.getLocPallet();
        }
      }
    });
  }

  ngOnInit() {
    this.operationObj = this.masterPageService.getRouteOperation();
    if (this.operationObj) {
      this.uiData.OperationId = this.operationObj.OperationId;
      this.uiData.OperCategory = this.operationObj.Category;
      this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
      this.masterPageService.setTitle(this.operationObj.Title);
      this.masterPageService.setModule(this.operationObj.Module);
      this.masterPageService.hideSpinner = true;
      this.appConfig = JSON.parse(localStorage.getItem(this.storageData.appConfig));
      this.controlConfig = JSON.parse(localStorage.getItem(this.storageData.controlConfig));
      // if (this.appService.checkDevice()) {
      //   this.router.navigate(['receive']);
      //   // this.router.navigate(['pagenotfound']);
      // }
    }
  }

  //Search Based Key
  searchInputKey() {
    if (!(this.appService.checkNullOrUndefined(this.searchInput)) && this.searchInput !== '') {
      this.authListDetails = null;
      const requestObj = { ClientData: this.clientData, UIData: this.uiData };
      this.spinner.show();
      const url = String.Join('/', this.apiConfigService.searchKeyUrl, this.searchInput.trim());
      this.apiservice.apiPostRequest(url, requestObj)
        .subscribe(response => {
          const res = response.body;
          this.spinner.hide();
          if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
            this.authList = res.Response;
            this.onAuthListGenerateJsonGrid(res.Response);
            this.grid = new Grid();
            this.grid.ItemsPerPage = this.appConfig.default.griditemsPerPage;
            this.grid.EditVisible = true;
            this.authListDetails = this.appService.onGenerateJson(this.authListResponse, this.grid);
          } else if (!this.appService.checkNullOrUndefined(res) && res.Status !== this.statusCode.pass) {
            this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
            this.searchKeyInput.applyRequired(true);
          }
        }, erro => {
          this.appErrService.handleAppError(erro);
        });
    }
  }

  //Change input box
  changeInput(inputControl: RmtextboxComponent) {
    this.authListDetails = null;
    inputControl.applyRequired(false);
    this.appErrService.clearAlert();
    this.isResetDisabled = false;

  }

  onAuthListGenerateJsonGrid(Response: Authorization[]) {
    if (!this.appService.checkNullOrUndefined(Response)) {
      this.authListResponse = [];
      const headingsobj = Object.keys(Response[0]);
      Response.forEach(res => {
        const element: Authorization = new Authorization();
        headingsobj.forEach(singleheader => {
          element[singleheader] = res[singleheader];
        });
        this.authListResponse.push(element);
      });
    }
  }

  editAuthDetailRow(response) {
    this.editAuthDetailRowResponse = response;
    const traceData = { traceType: this.traceTypes.authKey, traceValue: response.Auth_Key, uiData: this.uiData };
    const traceResult = this.commonService.findTraceHold(traceData, this.uiData);
    traceResult.subscribe(result => {
      if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.pass) {
        if (this.appService.checkNullOrUndefined(result.Response)) {
          this.findTraceExternKey();
        } else {
          this.canProceed(result, this.traceTypes.authKey);
        }
        this.spinner.hide();
      } else if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.fail) {
        this.spinner.hide();
        this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
      }
    });
  }

  private findTraceExternKey() {
    const traceData = { traceType: this.traceTypes.externKey, traceValue: this.editAuthDetailRowResponse.ExternKey, uiData: this.uiData };
    const traceResult = this.commonService.findTraceHold(traceData, this.uiData);
    traceResult.subscribe(result => {
      if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.pass) {
        if (this.appService.checkNullOrUndefined(result.Response)) {
          this.editAuthDetailRowCode();
        } else {
          this.canProceed(result, this.traceTypes.externKey);
        }
        this.spinner.hide();
      } else if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.fail) {
        this.spinner.hide();
        this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
      }
    });
  }

  private editAuthDetailRowCode(response = this.editAuthDetailRowResponse) {
    localStorage.removeItem(this.storageData.authKey);
    this.editAuthRow = this.authList.find(c => {
      if (c.Auth_Key === response.Auth_Key) {
        return c;
      }
    });
    this.editAuthRow.TrackingNumber = this.trackingNumber;
    localStorage.setItem(this.storageData.authKey, this.editAuthRow.Auth_Key);
    localStorage.setItem(this.storageData.authObj, JSON.stringify(this.editAuthRow));
    localStorage.setItem(this.storageData.receivingObj, JSON.stringify(this.operationObj));
    if (this.masterPageService.hideControls.controlProperties && this.masterPageService.hideControls.controlProperties.receivingAutomation) {
      this.router.navigate(['rcv/receiving-automation']);
    } else {
      this.router.navigate(['receive']);
    }
    this.editAuthDetailRowResponse = null;
  }

  canProceed(traceResponse, type) {
    if (traceResponse.Response.canProceed === CommonEnum.yes) {
      this.appErrService.setAlert(traceResponse.StatusMessage, true, MessageType.info);
    }
    if (!this.appService.checkNullOrUndefined(traceResponse.Response.TraceHold)) {
      const uiObj = { uiData: this.uiData };
      traceResponse = Object.assign(traceResponse, uiObj);
      let dialogRef = this.dialog.open(FindTraceHoldComponent, 
        { hasBackdrop: true, disableClose: true, panelClass: 'dialog-width-sm', data: { modalData: traceResponse } });
      dialogRef.afterClosed().subscribe(returnedData => {
        if (returnedData) {
        if (returnedData.Response.canProceed === CommonEnum.yes) {
          if (type === this.traceTypes.authKey) {
            this.findTraceExternKey();
          } else if (type === this.traceTypes.externKey) {
            this.editAuthDetailRowCode();
          } else if (type === this.traceTypes.trackingNumber) {
            this.validTrackingNumber();
          }
        } else if (returnedData.Response.canProceed === CommonEnum.no) {
          if (type === this.traceTypes.trackingNumber) {
            this.appService.setFocus('trackingNum');
          } else if (type === this.traceTypes.authKey) {
            this.appService.setFocus('searchKey');
          }
          this.appErrService.setAlert(returnedData.StatusMessage, true);
        }
        }
      });

    }
  }

  // get available pallet id for that location and populate in textbox
  getLocPallet() {
    if (Object.keys(this.uiData).length > 0) {
      this.spinner.show();
      localStorage.removeItem('a-containerObj');
      this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
      const requestObj = { ClientData: this.clientData, UIData: this.uiData };
      this.commonService.commonApiCall(this.apiConfigService.getLocPalletUrl, requestObj, (res, statusFlag) => {
        this.spinner.hide();
        if (statusFlag) {
          if (!this.appService.checkNullOrUndefined(res.Response)) {
            this.isPalletIdDisabled = true;
            this.container = res.Response;
            localStorage.setItem('a-containerObj', JSON.stringify(this.container));
            this.containreId = res.Response.ContainerID;
            this.isTrackingNoDisabled = false;
            this.trackingNumFocus();
          }
        } else {
          this.isPalletIdDisabled = false;
        }
      });
    }
  }

  // validate pallet or container
  validatePalletOrContainer() {
    if (this.containreId) {
      this.isPalletIdDisabled = true;
      this.spinner.show();
      localStorage.removeItem('a-containerObj');
      const requestObj = { ClientData: this.clientData, UIData: this.uiData };
      const url = String.Join('/', this.apiConfigService.checkPalletUrl, this.containreId);
      this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
        this.spinner.hide();
        if (statusFlag) {
          if (!this.appService.checkNullOrUndefined(res.Response)) {
            this.container = res.Response;
            localStorage.setItem('a-containerObj', JSON.stringify(this.container));
            this.containreId = res.Response.ContainerID;
            this.isTrackingNoDisabled = false;
            this.trackingNumFocus();
          }
        } else {
          this.isPalletIdDisabled = false;
          this.containerIdFocus();
        }
      });
    }
  }

  validateTrackingNumber() {
    if (this.containreId && this.trackingNumber) {
      this.isTrackingNoDisabled = true;
      this.spinner.show();
      this.trackingNubmerObj = new TrackingNum();
      localStorage.removeItem('a-trackingNubmerObj');
      const requestObj = { ClientData: this.clientData, UIData: this.uiData };
      const url = String.Join('/', this.apiConfigService.checkTrknbrUrl, this.containreId, this.trackingNumber);
      this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
        this.spinner.hide();
        if (statusFlag) {
          if (!this.appService.checkNullOrUndefined(res.Response)) {
            this.trackingNubmerObj = res.Response;
            if(res.Response.hasOwnProperty('TrackingNum') && !checkNullorUndefined(res.Response.TrackingNum)){
              this.trackingNumber  = res.Response.TrackingNum;
            }
            localStorage.setItem('a-trackingNubmerObj', JSON.stringify(this.trackingNubmerObj));
            const traceData = { traceType: this.traceTypes.trackingNumber, traceValue: this.trackingNubmerObj.TrackingNum, uiData: this.uiData };
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

          }
        } else {
          this.isTrackingNoDisabled = false;
        }
      });
    }
  }

  validTrackingNumber() {
    this.appErrService.alertSound(AudioType.success);
    this.issearchKeyDisabled = false;
    this.searchKeyFocus();
  }

  setFocusOnLoad() {
    const hideCtrlObj = this.masterPageService.hideControls.controlProperties;
    if (hideCtrlObj.automationContainerId === undefined && this.isPalletIdDisabled === false) {
      this.isTrackingNoDisabled = true;
      this.issearchKeyDisabled = true;
      this.containerIdFocus();
    } else if (hideCtrlObj.automationTrackingNum === undefined && !this.isPalletIdDisabled === false) {
      this.isTrackingNoDisabled = false;
      this.trackingNumFocus();
    } else {
      this.issearchKeyDisabled = false;
      this.searchKeyFocus();
    }
  }

  containerIdFocus() {
    this.appService.setFocus('containerId');
  }

  trackingNumFocus() {
    this.appService.setFocus('trackingNo');
  }

  searchKeyFocus() {
    this.appService.setFocus('searchKey');
  }

  clear() {
    this.isResetDisabled = true;
    this.isPalletIdDisabled = false;
    this.setFocusOnLoad();
    this.containreId = null;
    this.trackingNumber = null;
    this.searchInput = null;
    this.authListDetails=null;
    if (this.loadPallet) {
      this.getLocPallet();
    }
    this.appErrService.clearAlert();
  }

  ngOnDestroy() {
    this.masterPageService.categoryName = null;
    this.masterPageService.moduleName.next(null);
    this.masterPageService.receiveingConfiguration.next(null);
    this.masterPageService.emitHideSpinner.next(null);
    this.emitHideControls.unsubscribe();
    this.appErrService.clearAlert();
    this.masterPageService.clearModule();
    this.masterPageService.hideSpinner = false;
    this.masterPageService.showUtilityIcon = false;
    this.masterPageService.hideDialog();
    if (this.masterPageService.hideControls.controlProperties) {
      this.masterPageService.hideControls.controlProperties = new EngineResult();
    }
  }
}
