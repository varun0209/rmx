import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild, ElementRef, TemplateRef, Input, Inject } from '@angular/core';
import { MasterPageService } from '../../../utilities/rlcutl/master-page.service';
import { ApiConfigService } from '../../../utilities/rlcutl/api-config.service';
import { ApiService } from '../../../utilities/rlcutl/api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { AppErrorService } from '../../../utilities/rlcutl/app-error.service';
import { AppService } from '../../../utilities/rlcutl/app.service';
import { String } from 'typescript-string-operations';
import { ClientData } from '../../../models/common/ClientData';
import { Subscription } from 'rxjs';
import { UiData } from '../../../models/common/UiData';
import { StorageData } from '../../../enums/storage.enum';
import { Route } from '../../../models/maintenance/attribute-route-config/route';
import { dropdown } from '../../../models/common/Dropdown';
import { CommonEnum } from '../../../enums/common.enum';
import { MessageType } from '../../../enums/message.enum';
import { TypeaheadComponent } from '../../frmctl/typeahead/typeahead.component';
import { CommonService } from '../../../services/common.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-route-setup',
  templateUrl: './route-setup.component.html',
  styleUrls: ['./route-setup.component.css']
})
export class RouteSetupComponent implements OnInit {

  @ViewChild(TypeaheadComponent) typeaheadChild: TypeaheadComponent;
  @ViewChild('routeFlow', { read: ElementRef }) public routeFlow: ElementRef<any>;

  // common props
  clientData = new ClientData();
  uiData = new UiData();
  appConfig: any;
  defaultOprtationSelect =false;
  defaultOperationRouteType: string;
  commonEnum = CommonEnum;


  // reset props
  isRouteResetBtnDisabled = true;

  // add or save props
  isValidateAddBtnFlag = true;
  routeBtnName = CommonEnum.add;


  // route props
  selectedRoute = new Route();
  tempSelectedRoute = new Route();
  eligibleRoutes: any[] = [];
  isRouteIdDisabled = false;

  // gen routeid props
  isGenerateRouteIdBtnDisabled = false;

  // route typ props
  routeTypeList: any[] = [];
  isRouteTypeDisabled = false;

  // description props
  isRouteDescriptionDisabled = false;

  // active props
  isRoutetoggleActive = false;

  // routes list props
  routeAllOperationCodes: any[] = [];
  isInActiveRouteSelected = false;
  isRouteMainSelected: boolean;
  selectedRouteMainIndex: number;
  selectedRouteMainItem: any;
  isRouteIdSelected = false;

  // route move props
  isMoveRightDisabled = true;

  // route custome display
  isRouteTempSelected: boolean;
  selectedRouteTempIndex: any;
  selectedRouteTempItem: any;

  constructor(
    private commonService: CommonService,
    private apiConfigService: ApiConfigService,
    private spinner: NgxSpinnerService,
    private snackbar: XpoSnackBar,
    public appErrService: AppErrorService,
    public masterPageService: MasterPageService,
    public appService: AppService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<RouteSetupComponent>,
  ) {  }

  ngOnInit() {
    if (!this.appService.checkNullOrUndefined(this.data)) {
      this.clientData = this.data.modalData.clientData;
      this.uiData = this.data.modalData.uiData;
      this.defaultOprtationSelect = this.data.modalData.hasOwnProperty('defaultOprtationSelect') ? true : false;
      this.defaultOperationRouteType = this.data.modalData.hasOwnProperty('defaultOperationRouteType') ? this.data.modalData.defaultOperationRouteType : '';
      this.getOperationList();
      this.routeIDFocus();
    }
    this.appConfig = JSON.parse(localStorage.getItem(StorageData.appConfig));
  }

  /*Attribute Route Methods */
  // getOperations
  getOperationList() {
    this.routeAllOperationCodes = [];
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getRouteEligibleOpearationsList);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.getAQLTypesList();
        if (!this.appService.checkNullOrUndefined(res.Response) &&
          !this.appService.checkNullOrUndefined(res.Response.OperationCodesList) && res.Response.OperationCodesList.length) {
          this.routeAllOperationCodes = res.Response.OperationCodesList;
        }
      }
    });
  }

  // getAQLTypesList
  getAQLTypesList() {
    this.routeTypeList = [];
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getAQLTypesList);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response) &&
          !this.appService.checkNullOrUndefined(res.Response.SamplingTypes) && res.Response.SamplingTypes.length > 0) {
          res.Response.SamplingTypes.forEach((element) => {
            const dd: dropdown = new dropdown();
            dd.Id = element.ID;
            dd.Text = element.TEXT;
            this.routeTypeList.push(dd);
          });
          this.checkRouteType();
        }
      }
    });
  }

  checkRouteType() {
    const obj = this.routeTypeList.find(resp => resp.Id === this.defaultOperationRouteType);
    if (obj && this.defaultOperationRouteType) {
      this.selectedRoute.RouteType = obj.Id;
      this.isRouteTypeDisabled = true;
    }
  }

  // on input of routeId immmediately
  onRouteIDChangeVal(value) {
    this.isRouteResetBtnDisabled = false;
    if (!this.appService.checkNullOrUndefined(value)) {
      this.selectedRoute.ROUTEID = value.toUpperCase().trim();
    } else {
      this.selectedRoute.ROUTEID = null;
    }
    this.routeBtnName = CommonEnum.add;
    this.appErrService.clearAlert();
    this.isValidateAddBtnFlag = true;
    this.getEligibleRoutes(this.selectedRoute.ROUTEID);
  }

  // getting Eligible Routes
  getEligibleRoutes(value) {
    if (!this.appService.checkNullOrUndefined(value) && value.length) {
      this.eligibleRoutes = [];
      const requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_ROUTE: this.selectedRoute };
      const url = String.Join('/', this.apiConfigService.getEligibleRoutes);
      this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
        this.spinner.hide();
        if (statusFlag) {
          if (!this.appService.checkNullOrUndefined(res.Response) &&
            !this.appService.checkNullOrUndefined(res.Response.EligibleRoutesList) && res.Response.EligibleRoutesList.length > 0) {
            this.eligibleRoutes = res.Response.EligibleRoutesList;
            this.eligibleRoutes.map(el => el.TEXT = String.Join('-', el.TEXT, el.ID));
            if (!this.appService.checkNullOrUndefined(this.typeaheadChild)) {
              this.typeaheadChild.typeaheadOptionsLimit = this.eligibleRoutes.length;
            }
          }
        }
      });
    }
  }

  // getting Selected Route Information
  getRouteList() {
    this.routeBtnName = CommonEnum.save;
    if (!this.appService.checkNullOrUndefined(this.selectedRoute.ROUTEID) && this.selectedRoute.ROUTEID !== '') {
      const requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_ROUTE: { ROUTEID: encodeURIComponent(encodeURIComponent(this.selectedRoute.ROUTEID)) } };
      const url = String.Join('/', this.apiConfigService.getRouteList);
      this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
        this.spinner.hide();
        if (statusFlag) {
          if (!this.appService.checkNullOrUndefined(res.Response) && !this.appService.checkNullOrUndefined(res.Response.RouteList)) {
            this.selectedRoute = new Route();
            this.selectedRoute = res.Response.RouteList;
            this.tempSelectedRoute = JSON.parse(JSON.stringify(this.selectedRoute));
            this.selectedRoute.OperationCodes = this.selectedRoute.OperationCodes;
            this.checkRouteType();
            this.isRouteIdDisabled = true;
            this.isGenerateRouteIdBtnDisabled = true;
            this.isRouteIdSelected = true;
            this.checkOperationCodesExist();
            this.disableAllForInActiveRoute();
          }
        } else {
          this.selectedRoute = new Route();
        }
      });
    }
  }

  // calling immediately after selecting typeahead option
  typeaheadResponse(event) {
    this.selectedRoute.ROUTEID = event.item.ID;
    this.isRouteResetBtnDisabled = false;
    this.isGenerateRouteIdBtnDisabled = true;
    this.eligibleRoutes = [];
    this.getRouteList();
  }

  // Generate Route Id
  generateRouteID() {
    this.selectedRoute.ROUTEID = '';
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.generateRouteID);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response) && !this.appService.checkNullOrUndefined(res.Response.routeID)) {
          this.selectedRoute.ROUTEID = res.Response.routeID;
          this.selectedRoute.OperationCodes = [];
          this.isRouteResetBtnDisabled = false;
          this.isRouteIdDisabled = true;
          this.isRouteIdSelected = true;
          this.isGenerateRouteIdBtnDisabled = true;
          let index;
          this.routeAllOperationCodes.findIndex((ele, idx) => (ele.ID === this.uiData.OperationId) ? index = idx : null);
          if (this.defaultOprtationSelect && index) {
            this.getMainItem(index);
            this.moveRight();
          } else {
            this.defaultOprtationSelect = false;
          }
        }
      }
    });
  }

  // getting leftside list item
  getMainItem(index) {
    if (this.isRouteIdSelected && !this.isInActiveRouteSelected) {
      this.selectedRouteMainItem = this.routeAllOperationCodes[index];
      this.isMoveRightDisabled = false;
      this.selectedRouteMainIndex = index;
      this.isRouteMainSelected = true;
      this.isRouteTempSelected = false;
      this.isRouteResetBtnDisabled = false;
    }
  }

  // for moving list item from left to right
  moveRight() {
    if (!this.appService.checkNullOrUndefined(this.selectedRouteMainIndex)) {
      if (!this.appService.checkNullOrUndefined(this.selectedRoute.OperationCodes)) {
        this.selectedRoute.OperationCodes.push(JSON.parse(JSON.stringify(this.selectedRouteMainItem)));
        this.checkOperationCodesExist();
        this.isMoveRightDisabled = true;
      }
    }
  }

  // on change route Type
  changeRouteType(val) {
    this.selectedRoute.RouteType = val.value;
    this.isRouteResetBtnDisabled = false;
  }

  // on change of description
  onDescriptionChange() {
    this.isRouteResetBtnDisabled = false;
  }

  onRouteActiveChange(value) {
    this.selectedRoute.ACTIVE = value ? CommonEnum.yes : CommonEnum.no;
  }

  // getting rightside list item
  getTempItem(index) {
    if (!this.isInActiveRouteSelected) {
      this.selectedRoute.OperationCodes.forEach(element => {
        element['isRouteMainSelected'] = false;
      });
      this.selectedRouteTempIndex = index;
      this.selectedRoute.OperationCodes[index].isRouteMainSelected = true;
      this.isRouteTempSelected = true;
      this.isRouteMainSelected = false;
      this.selectedRouteMainIndex = null;
    }
  }

  // for deleting list item
  deleteItem(item, index) {
    if (!this.isInActiveRouteSelected) {
      this.selectedRoute.OperationCodes.splice(index, 1);
      this.checkOperationCodesExist();
    }
  }

  // to check if operatoin codes are there
  checkOperationCodesExist() {
    if (!this.appService.checkNullOrUndefined(this.selectedRoute.OperationCodes)) {
      if (this.selectedRoute.OperationCodes.length >= 1) {
        this.isValidateAddBtnFlag = false;
        this.isRouteResetBtnDisabled = false;
      } else {
        this.isValidateAddBtnFlag = true;
      }
    }
  }

  // for Disabling All Controls for InActive Routes
  disableAllForInActiveRoute() {
    if (this.selectedRoute.ACTIVE === CommonEnum.no) {
      this.isRouteTypeDisabled = true;
      this.isRouteDescriptionDisabled = true;
      this.isRoutetoggleActive = true;
      this.isInActiveRouteSelected = true;
      this.isMoveRightDisabled = true;
      this.isValidateAddBtnFlag = true;
    }
  }

  // add or Update Route Information
  addOrUpdateRoute() {
    if (!this.appService.checkNullOrUndefined(this.selectedRoute.OperationCodes)) {
      this.selectedRoute.OperationCodes.forEach((element, index) => {
        element['Rank'] = index + 1;
        delete element['isRouteMainSelected'];
      });
      this.spinner.show();
      const requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_ROUTE: this.selectedRoute };
      let url;
      if (this.routeBtnName === CommonEnum.add) {
        url = String.Join('/', this.apiConfigService.AddRoute);
      } else if (this.routeBtnName === CommonEnum.save) {
        if (this.appService.IsObjectsMatch(this.selectedRoute, this.tempSelectedRoute)) {
          this.snackbar.info(this.appService.getErrorText('2660043'));
          this.spinner.hide();
          return;
        }
        url = String.Join('/', this.apiConfigService.UpdateRoute);
      }
      this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
        this.spinner.hide();
        if (statusFlag) {
          this.resetRoute();
          this.dialogRef.close(true);
          this.appErrService.setAlert(res.StatusMessage, true, MessageType.success);
          if (!this.appService.checkNullOrUndefined(res.StatusMessage)) {
            this.snackbar.success(res.StatusMessage);
          }
        }
      });
    }
  }

  scrollRight(): void {
    if (!this.appService.checkNullOrUndefined(this.routeFlow.nativeElement) && this.routeFlow.nativeElement) {
      this.routeFlow.nativeElement.scrollTo({ left: (this.routeFlow.nativeElement.scrollLeft + 150), behavior: 'smooth' });
    }
  }

  scrollLeft(): void {
    if (!this.appService.checkNullOrUndefined(this.routeFlow.nativeElement) && this.routeFlow.nativeElement) {
      this.routeFlow.nativeElement.scrollTo({ left: (this.routeFlow.nativeElement.scrollLeft - 150), behavior: 'smooth' });
    }
  }

  // for moving list item upside
  moveUp() {
    if (!this.isInActiveRouteSelected) {
      if (!this.appService.checkNullOrUndefined(this.selectedRouteTempIndex)) {
        if (this.selectedRouteTempIndex > 0) {
          const movedItems = this.selectedRoute.OperationCodes.splice(this.selectedRouteTempIndex, 1)[0];
          this.selectedRoute.OperationCodes.splice(this.selectedRouteTempIndex - 1, 0, movedItems);
          this.selectedRouteTempIndex = this.selectedRoute.OperationCodes.findIndex((item) => item === movedItems);
        }
      }
    }
  }

  // for moving list item downside
  moveDown() {
    if (!this.isInActiveRouteSelected) {
      if (!this.appService.checkNullOrUndefined(this.selectedRouteTempIndex)) {
        if (this.selectedRouteTempIndex < this.selectedRoute.OperationCodes.length - 1) {
          const movedItems = this.selectedRoute.OperationCodes.splice(this.selectedRouteTempIndex, 1)[0];
          this.selectedRoute.OperationCodes.splice(this.selectedRouteTempIndex + 1, 0, movedItems);
          this.selectedRouteTempIndex = this.selectedRoute.OperationCodes.findIndex((item) => item === movedItems);
        }
      }
    }
  }

  // routeIDFocus
  routeIDFocus() {
    this.appService.setFocus('routeId');
  }

  // clearing route list properties
  clearRouteListProperties() {
    this.isRouteTempSelected = false;
    this.selectedRouteMainItem = null;
    this.selectedRouteTempItem = null;
    this.selectedRouteMainIndex = null;
    this.selectedRouteTempIndex = null;
    this.isRouteMainSelected = false;
  }


  // reset route
  resetRoute() {
    this.selectedRoute = new Route();
    this.tempSelectedRoute = new Route();
    this.isRouteIdSelected = false;
    this.appErrService.clearAlert();
    this.clearRouteListProperties();
    this.isRouteIdDisabled = false;
    this.routeAllOperationCodes = [];
    this.isValidateAddBtnFlag = true;
    this.routeBtnName = CommonEnum.add;
    this.isMoveRightDisabled = true;
    this.isGenerateRouteIdBtnDisabled = false;
    this.isRouteResetBtnDisabled = true;
    this.isRouteTypeDisabled = false;
    this.isRouteDescriptionDisabled = false;
    this.isRoutetoggleActive = false;
    this.isInActiveRouteSelected = false;
    this.getOperationList();
    this.routeIDFocus();
  }

}
