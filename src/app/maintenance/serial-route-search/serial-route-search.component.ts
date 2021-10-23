import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';
import { CommonEnum } from '../../enums/common.enum';
import { ClientData } from '../../models/common/ClientData';
import { UiData } from '../../models/common/UiData';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';
import { StorageData } from '../../enums/storage.enum';
import { Subscription } from 'rxjs-compat';
import { ApiService } from '../../utilities/rlcutl/api.service';
import { AppService } from '../../utilities/rlcutl/app.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiConfigService } from '../../utilities/rlcutl/api-config.service';
import { String } from 'typescript-string-operations';
import { CommonService } from '../../services/common.service';
import { OperationDeviatedRoutes, SerialNumber, SerialRouteWithOperation } from '../../models/maintenance/serial-route-search/SNROute';
import { ThemePalette } from '@angular/material/core';
import { TooltipPosition } from '@angular/material/tooltip';
import { HorizontalConnectionPos, VerticalConnectionPos } from '@angular/cdk/overlay';

@Component({
  selector: 'app-serial-route-search',
  templateUrl: './serial-route-search.component.html',
  styleUrls: ['./serial-route-search.component.css']
})
export class SerialRouteSearchComponent implements OnInit, OnDestroy {

  @ViewChild("routeFlow", { read: ElementRef }) public routeFlow: ElementRef<any>;

  clientData = new ClientData();
  uiData = new UiData();
  commonEnum = CommonEnum;
  storageData = StorageData;

  //appConfig: any;
  
  serialNumberorRoute: any;
  serialNumberPathHistory: any;
  serialNumber: SerialNumber;
  serialorRouthOperationinfo: SerialRouteWithOperation;
  operationDeviatedRoutes: OperationDeviatedRoutes[];  
  isSerialNumberPathHistoryVisible = false;
  isSerialorRouteSearchSuccess = false;
  textboxPattern: any;
  currentRoute: any;

  currentOperationid: string;
  currentOperationName: string;
  popupVisible = false;

  position: TooltipPosition = 'below';
  caretPosition: HorizontalConnectionPos | VerticalConnectionPos = 'center';
  color: ThemePalette = 'primary';
  controlConfig: any;


  constructor(public masterPageService: MasterPageService,
    public appErrService: AppErrorService,
    public apiService: ApiService,
    public appService: AppService,
    private apiConfigService: ApiConfigService,
    private commonService: CommonService,
    private spinner: NgxSpinnerService) { }

  ngOnInit() {
    const operationObj = this.masterPageService.getRouteOperation();
    if (operationObj) {
      //localStorage.setItem(this.storageData.module, operationObj.Module);
      //this.appErrService.appMessage();
      this.uiData.OperationId = operationObj.OperationId;
      this.uiData.OperCategory = operationObj.Category;
      this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
      this.masterPageService.setTitle(operationObj.Title);
      this.masterPageService.setModule(operationObj.Module);
      this.controlConfig = JSON.parse(localStorage.getItem(this.storageData.controlConfig));
      //this.appConfig = JSON.parse(localStorage.getItem(StorageData.appConfig));
    }
    this.loadPatterns();
    this.appService.setFocus('snorroute');
  }

  private loadPatterns() {
    const pattern = JSON.parse(localStorage.getItem(StorageData.patternList));
    if (!this.appService.checkNullOrUndefined(pattern)) {
      this.textboxPattern = new RegExp(pattern.textboxPattern);
    }
  }

  // Load Serial Number Information
  loadSerialRouteInfo() {
    this.serialNumberPathHistory = null;
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.loadSerialRouteInfo, this.serialNumberorRoute);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {       
        this.serialNumber = res.Response.SerialNumberInfo;
        if (res.Response.SerialNumberSnapInfo.length > 0) {
          this.isSerialNumberPathHistoryVisible = true;                   
          this.serialNumberPathHistory = res.Response.SerialNumberSnapInfo;
        } else {
          this.currentRoute = this.serialNumberorRoute;
        }
        if (res.Response.CurrentRouteInfo)
          this.isSerialorRouteSearchSuccess = true;
        this.serialorRouthOperationinfo = res.Response.CurrentRouteInfo;        
      }
    });

  }

  resetSerialRouteInfo() {
    this.serialNumberorRoute = null;
    this.isSerialNumberPathHistoryVisible = false;
    this.isSerialorRouteSearchSuccess = false;
    this.serialNumberPathHistory = null;
    this.serialNumber = null;
    this.popupVisible = false;
    this.appService.setFocus('snorroute');
  }

  onOperationInfoClick(event) {
    this.operationDeviatedRoutes = null;
    this.currentOperationid = null;
        this.currentOperationName = null;
    const operationid = event.ID;
    this.popupVisible = true;
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getOperationDeviatedRoutes, operationid);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        this.currentOperationid = event.ID;
        this.currentOperationName = event.TEXT;
        this.operationDeviatedRoutes = res.Response.OperationDeviatedRoutes;
      }
    });

  }

  scrollLeft(): void {
    if (!this.appService.checkNullOrUndefined(this.routeFlow.nativeElement) && this.routeFlow.nativeElement) {
      this.routeFlow.nativeElement.scrollTo({ left: (this.routeFlow.nativeElement.scrollLeft - 150), behavior: 'smooth' });
    }
  }

  scrollRight(): void {
    if (!this.appService.checkNullOrUndefined(this.routeFlow.nativeElement) && this.routeFlow.nativeElement) {
      this.routeFlow.nativeElement.scrollTo({ left: (this.routeFlow.nativeElement.scrollLeft + 150), behavior: 'smooth' });
    }
  }

  ngOnDestroy() {
    this.masterPageService.defaultProperties();
  }


}
