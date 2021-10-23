import { CommonService } from './../../services/common.service';
import { RmgridComponent } from './../../framework/frmctl/rmgrid/rmgrid.component';
import { Container } from './../../models/common/Container';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { UiData } from '../../models/common/UiData';
import { ClientData } from '../../models/common/ClientData';
import { Grid } from '../../models/common/Grid';
import { Subscription } from 'rxjs';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { ApiConfigService } from '../../utilities/rlcutl/api-config.service';
import { ApiService } from '../../utilities/rlcutl/api.service';
import { AppService } from '../../utilities/rlcutl/app.service';
import { StorageData } from '../../enums/storage.enum';
import { StatusCodes } from '../../enums/status.enum';
import { String } from 'typescript-string-operations';
import { RmtextboxComponent } from '../../framework/frmctl/rmtextbox/rmtextbox.component';
import { TestingDevice } from '../../models/testing/TestingDevice';
import { CommonEnum } from '../../enums/common.enum';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'jit-hold-removal',
  templateUrl: './jit-hold-removal.component.html',
  styleUrls: ['./jit-hold-removal.component.css']
})
export class JitHoldRemovalComponent implements OnInit, OnDestroy {

  @ViewChild(RmgridComponent) rmGrid: RmgridComponent;

  uiData = new UiData();
  operationObj: any;
  clientData = new ClientData();
  grid: Grid;
  emitHideSpinner: Subscription;

  // device list
  deviceList = new TestingDevice();

  // color code
  isTransferHold = CommonEnum.no;
  colorCodeDetails = { ColorCode: '', Color: '' };


  isContainerDisabled = false;
  isRemoveFromHoldBtnDisabled = true;
  isResetBtnDisabled = true;
  isLocationShow = false;
  isLocationDisabled = true;
  jitHoldListGrid: any;
  jitHoldList = [];
  locationId: any;
  containerId: any;
  locationObj = {};
  containerObj = new Container();
  containerProperties = [];
  selectedContainerProperties = [];
  exportGridList: any;
  exportList = [];
  hideGridRearrangeIcon = true;
  pageIndex = 1;
  dialogRef: any;

  constructor(public masterPageService: MasterPageService,
    public appErrService: AppErrorService,
    private spinner: NgxSpinnerService,
    private snackbar: XpoSnackBar,
    private commonService: CommonService,
    private apiConfigService: ApiConfigService,
    private apiService: ApiService,
    private appService: AppService,
    private dialog: MatDialog) {
    this.emitHideSpinner = this.masterPageService.emitHideSpinner.subscribe(spinnerFlag => {
      if (!this.appService.checkNullOrUndefined(spinnerFlag) && spinnerFlag) {
        this.containerFocus();
        this.getJITReplnInvs();
      }
    });
  }

  ngOnInit() {
    this.operationObj = this.masterPageService.getRouteOperation();
    if (this.operationObj) {
      this.uiData.OperationId = this.operationObj.OperationId;
      this.uiData.OperCategory = this.operationObj.Category;
      this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
      // setting value to hidespinner (based on this value we are emiting emithidespinner method)
      this.masterPageService.hideSpinner = true;
      this.masterPageService.setTitle(this.operationObj.Title);
      this.masterPageService.setModule(this.operationObj.Module);
    }
  }

  // container focus
  containerFocus() {
    this.appService.setFocus('jitContainerId');
  }
  // location focus
  locationFocus() {
    this.appService.setFocus('locationId');
  }

  // remove from hold btn focus
  removeFromHoldBtnFocus() {
    this.appService.setFocus('removeFromHold');
  }

  // print focus
  printFocus() {
    this.appService.setFocus('print');
  }

  // reset focus
  resetFocus() {
    this.appService.setFocus('reset');
  }

  // getJITReplnInvs
  getJITReplnInvs() {
    this.spinner.show();
    this.jitHoldList=[];
    this.jitHoldListGrid =null;
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const getJITReplnInvs = String.Join('/', this.apiConfigService.getJITReplnInvs, this.pageIndex.toString());
    this.apiService.apiPostRequest(getJITReplnInvs, requestObj)
      .subscribe(response => {
        const res = response.body;
        this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          if (!this.appService.checkNullOrUndefined(res.Response)) {
            this.jitHoldList = res.Response.JITReplnInvs;
            this.grid = new Grid();
            this.grid.TotalRecods = res.Response.RecordCount;
            const filteredJitHoldList = this.jitHoldGridConfig([...res.Response.JITReplnInvs]);
            this.jitHoldListGrid = this.appService.onGenerateJson(filteredJitHoldList, this.grid);
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

  pageChanged(event) {
    this.pageIndex = event;
    this.getJITReplnInvs();
  }

  // getting required properties to show it in grid
  private jitHoldGridConfig(Response) {
    if (!this.appService.checkNullOrUndefined(Response)) {
      const jitHoldList = [];
      Response.forEach(res => {
        const element: any = {};
        element.SKU = res.SKU;
        element.GSX_NonGSX = res.GSX_NonGSX;
        element.LOC = res.Loc;
        element.QTY = res.Qty;
        element.QTY_TO_PICK = res.QtyToPick;
        element.NextStep = res.NextStep;
        jitHoldList.push(element);
      });
      return jitHoldList;
    }
  }

  // validateJITHoldContainer
  validateJITHoldContainer(inputcontrol: RmtextboxComponent) {
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.validateJITHoldContainer, this.containerId);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          if (!this.appService.checkNullOrUndefined(res.Response)) {
            if (res.Response.hasOwnProperty('Devices')) {
              this.deviceList = res.Response.Devices;
            }
            if (res.Response.hasOwnProperty('IsTransferHold')) {
              this.isTransferHold = res.Response.IsTransferHold;
            }
            // if (!this.appService.checkNullOrUndefined(res.Response.JITReplnInvs) && res.Response.JITReplnInvs.length) {
            //   this.jitHoldList = res.Response.JITReplnInvs;
            //   this.grid = new Grid();
            //   const selectedIndex = this.jitHoldList.findIndex(f => f.IsEligibleReplnInv === true);
            //   const filteredJitHoldList = this.jitHoldGridConfig([...res.Response.JITReplnInvs]);
            //   const selectedRow = filteredJitHoldList[selectedIndex];
            //   this.jitHoldListGrid = this.appService.onGenerateJson(filteredJitHoldList, this.grid);
            //   this.rmGrid.editrow(selectedRow);
            // }
            if (!this.appService.checkNullOrUndefined(res.Response.Container)) {
              this.containerProperties = [];
              this.containerProperties = Object.keys(res.Response.Container);
              const displayProperties = this.masterPageService.hideControls.controlProperties.displayProperties;
              this.selectedContainerProperties = this.containerProperties.filter(el => displayProperties.includes(el));
              this.containerObj = res.Response.Container;
            }
            this.isContainerDisabled = true;
            if (this.isTransferHold === CommonEnum.yes) {
              this.isRemoveFromHoldBtnDisabled = false;
              this.removeFromHoldBtnFocus();
            } else {
              this.isLocationShow = true;
              this.isLocationDisabled = false;
              this.locationFocus();
            }
            this.spinner.hide();
          }
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          inputcontrol.applyRequired(true);
          inputcontrol.applySelect();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          this.spinner.hide();
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }
  // removeFromJITHold
  removeFromJITHold() {
    this.isRemoveFromHoldBtnDisabled=true;
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, Devices: this.deviceList, Container: this.containerObj, Location: this.locationObj };
    const url = String.Join('/', this.apiConfigService.removeFromJITHold, this.isTransferHold);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          if (!this.appService.checkNullOrUndefined(res.Response)) {
            this.snackbar.success(res.Response);
          }
          (this.isTransferHold === CommonEnum.yes) ? this.getReceiptColorCode() : this.reset();
          this.getJITReplnInvs();
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.spinner.hide();
          this.isRemoveFromHoldBtnDisabled=false;
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }

  // get color code api
  getReceiptColorCode() {
    this.spinner.show();
    this.isRemoveFromHoldBtnDisabled = true;
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, Devices: this.deviceList };
    this.commonService.commonApiCall(this.apiConfigService.getReceiptColorCodeUrl, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.spinner.hide();
        this.colorCodeDetails = res.Response;
        this.resetFocus();
      }
    });
  }

  // on change cntainer input
  changeContainerInput() {
    this.isResetBtnDisabled = false;
    this.appErrService.clearAlert();
  }

  // on change location
  changeLocation() {
    this.isResetBtnDisabled = false;
    this.appErrService.clearAlert();
  }

  // Location Validation
  validateJITHoldToLoc(inputcontrol: RmtextboxComponent, locationId) {
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.validateJITHoldToLoc, locationId);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const res = response.body;
        this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          if (!this.appService.checkNullOrUndefined(res.StatusMessage)) {
            this.snackbar.success(res.StatusMessage);
          }
          if (!this.appService.checkNullOrUndefined(res.Response)) {
            this.locationObj = res.Response;
          }
          this.isRemoveFromHoldBtnDisabled = false;
          this.isLocationDisabled = true;
          this.removeFromHoldBtnFocus();
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          inputcontrol.applyRequired(true);
          inputcontrol.applySelect();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro, false);
      });
  }

  // to print xl report
  printReport(exportTemplate) {
    this.exportList = [...this.jitHoldList]
    this.exportList.forEach(el => delete el['IsEligibleReplnInv']);
    this.grid = new Grid();
    this.exportGridList = this.appService.onGenerateJson(this.exportList, this.grid);
    this.dialogRef = this.dialog.open(exportTemplate, { hasBackdrop: true, disableClose: true, panelClass:'dialog-width-lg' })
    this.printFocus();
  }

  exportData() {
    this.commonService.printReport(this.exportList, this.uiData.OperCategory);
    this.dialogRef.close();
  }

  reset() {
    this.appErrService.clearAlert();
    this.isContainerDisabled = false;
    this.containerFocus();
    this.isRemoveFromHoldBtnDisabled = true;
    this.isLocationShow = false;
    this.isResetBtnDisabled = true;
    this.isLocationDisabled = true;
    if (!this.appService.checkNullOrUndefined(this.rmGrid)) {
      this.rmGrid.editrow(null);
    }
    this.locationId = '';
    this.containerId = '';
    this.locationObj = {};
    this.containerProperties = [];
    this.selectedContainerProperties = [];
    this.colorCodeDetails = { ColorCode: '', Color: '' };
    this.containerObj = new Container();
  }

  ngOnDestroy() {
    this.jitHoldListGrid = null;
    this.exportGridList = null;
    this.masterPageService.defaultProperties();
    this.emitHideSpinner.unsubscribe();
    if (!this.appService.checkNullOrUndefined(this.rmGrid)) {
      this.rmGrid.editrow(null);
    }
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
}
