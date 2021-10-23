import { RouteSetupComponent } from './../../framework/busctl/route-setup/route-setup.component';
import { CommonEnum } from './../../enums/common.enum';
import { ContainerSummaryComponent } from './../../framework/busctl/container-summary/container-summary.component';
import { ApiConfigService } from './../../utilities/rlcutl/api-config.service';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { CommonService } from './../../services/common.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppService } from './../../utilities/rlcutl/app.service';
import { AppErrorService } from './../../utilities/rlcutl/app-error.service';
import { MasterPageService } from './../../utilities/rlcutl/master-page.service';
import { UiData } from './../../models/common/UiData';
import { ClientData } from './../../models/common/ClientData';
import { Component, OnInit, ViewChild } from '@angular/core';
import { String } from 'typescript-string-operations';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-manual-override-route',
  templateUrl: './manual-override-route.component.html',
  styleUrls: ['./manual-override-route.component.css']
})
export class ManualOverrideRouteComponent implements OnInit {
  @ViewChild(ContainerSummaryComponent, { static: false }) contsummaryParent: ContainerSummaryComponent;
  @ViewChild('holdPopTemplate', { static: false }) holdPopTemplate: any;  // inbound properties

  operationObj: any;
  clientData = new ClientData();
  uiData = new UiData();

  // inbound properties
  inbContainerID = '';
  headingsobj = [];
  inboundProperties: any;
  multipleContainerList: any;

  isProcessDisabled = true;

  // route prop
  overRideRouteId: any;
  deviceHoldMessage: any;
  operationId: string;
  dialogRef: any;

  constructor(public masterPageService: MasterPageService,
    public appErrService: AppErrorService,
    public appService: AppService,
    private commonService: CommonService,
    private spinner: NgxSpinnerService,
    private snackbar: XpoSnackBar,
    private apiConfigService: ApiConfigService,
    private dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.operationObj = this.masterPageService.getRouteOperation();
    if (this.operationObj) {
      this.uiData.OperationId = this.operationObj.OperationId;
      this.uiData.OperCategory = this.operationObj.Category;
      this.operationId = this.operationObj.OperationId;
      this.clientData = JSON.parse(localStorage.getItem('clientData'));
      this.masterPageService.setTitle(this.operationObj.Title);
      this.masterPageService.setModule(this.operationObj.Module);
      this.masterPageService.setRouteCardHeader(CommonEnum.routeDetails);
      this.masterPageService.containerDetailsHeader(CommonEnum.containerDetails);
      this.masterPageService.setActiveTabValue = CommonEnum.containerDetails;
    }
  }
  //operationId
  setCurrentOperationId(operationId) {
    this.uiData.OperationId = operationId;
  }

  // checkOperationList
  checkOperationList() {
    return (this.masterPageService.routeOperationList.length || this.masterPageService.nextRoutesList.length || this.masterPageService.gridContainerDetails);
  }


  // containerSummaryProperties
  containerSummaryProperties(event: any) {
    this.headingsobj = [];
    this.headingsobj = Object.keys(event);
    this.inboundProperties = event;
  }


  // inbContainerID
  getinbContainerID(inbcontid) {
    this.inbContainerID = inbcontid;
  }

  //getAutoPopulatedSerailNum
  getAutoPopulatedSerailNum(event: any) {
    this.chkContRouteOverrideEligibility();
    this.commonService.getQueuedTestSerialNumbers(this.clientData, this.uiData, this.inbContainerID);
  }

  //getContainerList
  getContainerList(event) {
    this.multipleContainerList = event;
  }


  //newRouteModel
  newRouteModel() {
    const routeConfig = {
      uiData: this.uiData,
      clientData: this.clientData,
      defaultOprtationSelect: true,
      defaultOperationRouteType: CommonEnum.override
    }
    this.dialogRef = this.dialog.open(RouteSetupComponent, { hasBackdrop: true, disableClose: true, autoFocus: false, panelClass: 'dialog-width-xl', data: { modalData: routeConfig } });
    this.dialogRef.afterClosed().subscribe((returnedData) => {
      if (returnedData) {
        if (this.inbContainerID) {
          this.getEligibleRouteInfo();
        }
      }
    });
  }

  // chkContRouteOverrideEligibility
  chkContRouteOverrideEligibility() {
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, Containers: this.multipleContainerList, Device: this.contsummaryParent.deviceList[0] };
    const url = String.Join('/', this.apiConfigService.chkContRouteOverrideEligibilityUrl);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.getEligibleRouteInfo();
      }
    });
  }

  // getEligibleRouteInfo
  getEligibleRouteInfo() {
    const requestObj = { ClientData: this.clientData, Device: this.contsummaryParent.deviceList[0], UIData: this.uiData };
    this.commonService.commonApiCall(this.apiConfigService.getEligibleRouteInfoUrl, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag && !this.appService.checkNullOrUndefined(res.Response)) {
        if (!this.appService.checkNullOrUndefined(res.Response['NextRoutes'])) {
          this.masterPageService.nextRoutesList = res.Response['NextRoutes'];
        }
        if (!this.appService.checkNullOrUndefined(res.Response['Operations'])) {
          this.masterPageService.routeOperationList = this.routeFlowList(res.Response['Operations']);
        }
        if (!this.appService.checkNullOrUndefined(res.Response['RouteId'])) {
          this.masterPageService.RouteId = res.Response['RouteId'];
        }
        if (this.masterPageService.routeOperationList.length || this.masterPageService.nextRoutesList.length) {
          this.masterPageService.setActiveTabValue = CommonEnum.routeDetails;
          this.masterPageService.isNextRoutesDisabled = false;
          this.overRideOptionFocus();
        }
      }
    });
  }


  checkContainerDeviceHold() {
    this.deviceHoldMessage = "";
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.checkContainerDeviceHold, this.inbContainerID);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        if (res && res.Response && res.Response.IsContainerDeviceHavingHold == CommonEnum.yes) {
          this.spinner.hide();
          this.deviceHoldMessage = res.StatusMessage;
          this.openModal();
          return;
        }
        this.processManualRouteOverride();
      }
    });
  }


  openModal() {
    this.dialogRef = this.dialog.open(this.holdPopTemplate, {
      hasBackdrop: true,
      disableClose: true,
      panelClass: 'dialog-width-sm'
    });
  }

  //processManualRouteOverride
  processManualRouteOverride(removeHold = CommonEnum.no) {
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, Containers: this.multipleContainerList, Device: this.contsummaryParent.deviceList[0] };
    const url = String.Join('/', this.apiConfigService.processManualRouteOverrideUrl, this.overRideRouteId, removeHold);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        this.resetClear();
        this.snackbar.success(res.StatusMessage);
        if (this.dialogRef) {
          this.dialogRef.close();
        }
      }
    });
  }


  //onNextRoutersChange
  onNextRoutersChange(event) {
    this.overRideRouteId = event.value;
    this.isProcessDisabled = false;
    this.processFocus();
  }

  //routeFlowList
  routeFlowList(item) {
    let flag = false;
    item.map(res => {
      if (this.contsummaryParent.deviceList[0].NextStep == res.Id) {
        flag = true;
        res.color = 'activeOps';
      } else if (!flag) {
        res.color = 'completedOps';
      }
    });
    return item;
  }


  // resetClear
  resetClear() {
    this.appErrService.clearAlert();
    this.masterPageService.inboundContainerFocus();
    this.clearContainerSummary();
    this.clearRouteDetails();
    this.headingsobj = [];
    this.overRideRouteId = '';
    this.inboundProperties = null;
    this.isProcessDisabled = true;
    this.masterPageService.disabledContainer = false;
    this.masterPageService.gridContainerDetails = null;
    this.uiData.OperationId = this.operationId;
  }

  // clearContainerSummary
  private clearContainerSummary() {
    if (!this.appService.checkNullOrUndefined(this.contsummaryParent)) {
      this.contsummaryParent.inbContainerDisabled = false;
      this.contsummaryParent.rmtextchild.value = '';
      this.contsummaryParent.quantity = '';
      this.contsummaryParent.category = '';
      this.contsummaryParent.isClearDisabled = true;
      this.contsummaryParent.containersList = [];
      this.contsummaryParent.deviceList = [];
      this.contsummaryParent.containerSummaryPropertiesList = [];
      this.contsummaryParent.canAllowNextContainerStatus = null;
      this.contsummaryParent.containerSummaryProperties = [];
      this.contsummaryParent.containerActualProp = null;
    }
  }

  //clearRouteDetails
  clearRouteDetails() {
    this.masterPageService.nextRoutesList = [];
    this.masterPageService.isNextRoutesDisabled = true;
    this.masterPageService.routeOperationList = [];
    this.masterPageService.RouteId = '';
    this.masterPageService.setActiveTabValue = CommonEnum.containerDetails;
  }

  // processFocus
  processFocus() {
    this.appService.setUtilityFocus('process');
  }

  // processFocus
  overRideOptionFocus() {
    this.appService.setUtilityFocus('nextRoutes');
  }



  ngOnDestroy() {
    this.masterPageService.disabledContainer = true;
    this.resetClear()
    if (this.contsummaryParent) {
      if (this.contsummaryParent.dialogRef) {
        this.contsummaryParent.dialogRef.close();
      }
    }
    this.masterPageService.setRouteCardHeader(null);
    this.masterPageService.defaultProperties();
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }


}
