import { Component, OnInit, OnDestroy, Input, TemplateRef, Renderer2, OnChanges, ChangeDetectorRef, AfterViewChecked, ViewChild } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Operation } from './../models/common/Operation';
import { AppErrorService } from '../utilities/rlcutl/app-error.service';
import { MasterPageService } from '../utilities/rlcutl/master-page.service';
import { AppService } from '../utilities/rlcutl/app.service';
import { RuntimeConfigService } from '../utilities/rlcutl/runtime-config.service';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { XpoMessagingPopoverMessage } from '@xpo/ngx-core/messaging-popover';
import { ThemePalette } from '@angular/material/core';
import { TooltipPosition } from '@angular/material/tooltip';
import { HorizontalConnectionPos, VerticalConnectionPos } from '@angular/cdk/overlay';
import { StorageData } from '../enums/storage.enum';
import { CommonService } from '../services/common.service';
import { CommonEnum } from './../enums/common.enum';
import { OperationEnum } from './../enums/operation.enum';
import { checkNullorUndefined } from '../enums/nullorundefined';
import { LogoutConfirmationComponent } from '../dialogs/logout-confirmation/logout-confirmation.component';
import { UtilityModalComponent } from '../dialogs/utility-modal/utility-modal.component';

@Component({
  selector: 'master-page',
  templateUrl: './master-page.component.html',
  styleUrls: ['./master-page.component.css']
})
export class MasterPageComponent implements OnInit, OnDestroy {

  title = '';
  // apps: XpoAppSwitcherApplication[] = [
  //   {
  //     'url': '/',
  //     'name': 'IOS'
  //   },
  //   {
  //     'url': '/',
  //     'name': 'BAX'
  //   }
  // ];
  messageData: XpoMessagingPopoverMessage[] = [];
  cardHeader: string;
  fqaCardHeader: string;
  modulename: string;
  location: string;
  release: string;
  env: string;
  loggedInUser: string;
  isExapand = true;
  dropdownDisabled: boolean;
  modeltitle: string;
  utilityTitle: string;

  // messages
  text: string;
  messageNum: string;
  messagesCategory: string;
  messageType: string;
  dropdownRef: any;
  @Input() ngnavcolor: string;
  clientImage = '';
  emitModuleResponse: Subscription;

  isShowSections = true;
  hideCloseButton = false;
  position: TooltipPosition = 'below';
  caretPosition: HorizontalConnectionPos | VerticalConnectionPos = 'end';
  color: ThemePalette = 'primary';
  userProfileClose = true;
  renderer: Renderer2;
  hideSearchBox = false;
  storageData = StorageData;
  samplingCardHeader: string;
  containerDetailsTabHeader: string;
  routeCardHeader: string;
  deviceCardHeader: string;
  commonEnum = CommonEnum;
  operation = OperationEnum;

  // time
  realTime = new Date();
  clockTimer;
  timeZoneName;
  appRoutes = [];

  constructor(
    public appErrService: AppErrorService,
    public masterPageService: MasterPageService,
    private router: Router,
    public dialog: MatDialog,
    public appService: AppService,
    public commonService: CommonService,
    private environment: RuntimeConfigService,
    public translate: TranslateService,
    private changeRef: ChangeDetectorRef
  ) {
    localStorage.setItem(this.storageData.logoutData, 'false');
    localStorage.setItem(this.storageData.sessionClose, 'false');
    localStorage.setItem(this.storageData.userProfileChanged, 'false');
    localStorage.setItem(this.storageData.timmerCount, Math.floor(new Date().getTime()).toString());
    sessionStorage.setItem(this.storageData.timmerCount, Math.floor(new Date().getTime()).toString());
  }

  ngOnInit() {
    // this.timeZoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // this.clockTimer = setInterval(() => {
    //   this.realTime = new Date();
    // }, 1000);

    this.env = this.environment.runtimeConfig.env;
    this.appService.hideControls = JSON.parse(localStorage.getItem(this.storageData.controlConfig));
    if (this.appService.securityKey && localStorage.getItem(this.storageData.addWho)) {
      this.loggedInUser = this.appService.decrypt(this.appService.securityKey, localStorage.getItem(this.storageData.addWho));
    }
    this.release = localStorage.getItem(this.storageData.release);
    this.masterPageService.location = localStorage.getItem(this.storageData.location);
    const clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
    if (!checkNullorUndefined(clientData) && clientData.SiteId !== 'LOGIN') {
      this.masterPageService.siteId = clientData.SiteId;
    }
    this.appService.release = localStorage.getItem(this.storageData.release);
    this.appService.sideMenuObj(JSON.parse(localStorage.getItem(this.storageData.menu)));
    this.appService.clientImage = localStorage.getItem(this.storageData.clientImage);
    this.appService.imageAltText = localStorage.getItem(this.storageData.imageAltText);
    this.masterPageService.title.subscribe(title => {
      setTimeout(() => {
        this.title = title;
      }, 0);
    });
    this.masterPageService.setActiveTab(CommonEnum.containerDetails);
    this.masterPageService.cardHeader.subscribe(cardHeader => {
      this.cardHeader = cardHeader;
    });
    this.masterPageService.fqaCardHeader.subscribe(fqaCardHeader => {
      this.fqaCardHeader = fqaCardHeader;
    });
    this.masterPageService.samplingInfoHeader.subscribe(samplingcardHeader => {
      this.samplingCardHeader = samplingcardHeader;
    });
    this.masterPageService.routeInfoHeader.subscribe(routeCardHeader => {
      this.routeCardHeader = routeCardHeader;
    });
    this.masterPageService.deviceCardHeader.subscribe(deviceCardHeader => {
      this.deviceCardHeader = deviceCardHeader;
    });

    this.masterPageService.containerDetailsInfoHeader.subscribe(containerDetailsTabHeader => {
      this.containerDetailsTabHeader = containerDetailsTabHeader;
    });
    this.masterPageService.emitUiData.subscribe(uiData => {
      if (uiData) {
        this.masterPageService.uiData = uiData;
      }
    });
    this.emitModuleResponse = this.masterPageService.moduleName.subscribe(mname => {
      if (mname) {
        this.masterPageService.getOperations(mname);
      }
    });
    this.appService.timeOutConfig();
  }


  ngOnDestroy() {
    this.masterPageService.categoryName = null;
    this.masterPageService.disabledContainer = true;
    this.masterPageService.disabledSerialNumber = true;
    this.masterPageService.moduleName.next(null);
    this.masterPageService.hideDialog();
    this.emitModuleResponse.unsubscribe();
    // clearInterval(this.clockTimer);
  }


  // Category Dropdown
  changeOperation(event) {
    const operations = new Operation();
    this.masterPageService.publishClearAll(true);
    operations.Module = this.modulename;
    operations.OperationId = event.value;
    this.masterPageService.getControlConfig(operations.Module, operations.OperationId);
    this.masterPageService.setCategoryName(event.target.options[event.target.selectedIndex].text);
    if (this.modulename === 'TST' && this.masterPageService.categoryName != null) {
      this.masterPageService.setDropDown(true);
    }
    this.masterPageService.disabledContainer = false;
    this.masterPageService.getCategoryTest();
  }

  changeMode(event) {
    this.masterPageService.setOptions(event.target.options[event.target.selectedIndex].text);
  }

  userLogout() {
    this.masterPageService.hideDialog();
    this.masterPageService.logout();
  }

  // Modal Popup
  openModal(template: TemplateRef<any>, status?: any) {
    this.utilityTitle = status;
    let lgModalSize = false;
    if (!this.appService.checkNullOrUndefined(this.dropdownRef)) {
      this.dropdownRef.hide();
    }
    if (this.utilityTitle == this.operation.closecontainerRef) {
      this.modeltitle = this.operation.closeContainer;
    } else if (this.utilityTitle == this.operation.serialnumberrecoverRef) {
      this.modeltitle = this.operation.recoverSerialNumber;
    } else if (this.utilityTitle == this.operation.containermoveRef) {
      this.modeltitle = this.operation.containerMove;
    } else if (this.utilityTitle == this.operation.containerinformationRef) {
      this.modeltitle = this.operation.containerInformation;
      lgModalSize = true;
    } else if (this.utilityTitle == this.operation.serialnumbermoveRef) {
      this.modeltitle = this.operation.serialNumberMove;
    }
    this.masterPageService.openModelPopup(UtilityModalComponent, lgModalSize, 'dialog-width-sm',{
      data: {
        "utilityTitle": this.utilityTitle,
        "modeltitle": this.modeltitle
      }
    }
    )
  }

  openLogoutModal() {
    if (!this.appService.checkNullOrUndefined(this.dropdownRef)) {
      this.dropdownRef.hide();
    }
    this.masterPageService.openModelPopup(LogoutConfirmationComponent);
  }

  // close the modal
  hideDialog() {
    this.dialog.closeAll();
  }

  actionTab() {
    this.appService.setFocus('deviceId')
  }


  navigateToMain() {
    this.appErrService.clearAlert();
    this.router.navigate(['dashboard']);
  }

  showApps(dropdown: any) {
    this.dropdownRef = dropdown;
  }

  hideApps() {
    if (!checkNullorUndefined(this.dropdownRef)) {
      this.dropdownRef.hide();
    }
  }

  processQueuePanel() {
    if ((!checkNullorUndefined(this.masterPageService.tempQueList) && this.masterPageService.tempQueList.Elements.length > 0)
      || this.showContainerDetails() || this.showRouteDetails()) {
      return true;
    }
  }

  showContainerDetails() {
    if (!checkNullorUndefined(this.masterPageService.hideControls.controlProperties.containerDetailsTab)) {
      if (this.masterPageService.hideControls.controlProperties.containerDetailsTab.Show) {
        return (!checkNullorUndefined(this.masterPageService.gridContainerDetails) && this.masterPageService.gridContainerDetails.Elements.length > 0) ? true : false;
      }
    }
    return false;
  }

  showRouteDetails() {
    if (!checkNullorUndefined(this.masterPageService.hideControls.controlProperties.routeDeatilsTab)) {
      if (this.masterPageService.hideControls.controlProperties.routeDeatilsTab.Show) {
        return (this.masterPageService.routeOperationList.length || this.masterPageService.nextRoutesList.length) ? true : false;
      }
    }
    return false;
  }


  // Toggle Header and Footer on Mobile
  showSections() {
    if (this.appService.checkDevice()) {
      this.isShowSections = !this.isShowSections;
      this.masterPageService.removeMarginTop(!this.isShowSections);
    } else {
      this.isShowSections = true;
    }
  }
  userProfile() {
    this.router.navigate(['user-profile']);
  }
  slideSearch(event) {
    if (this.masterPageService.hideSearchBox) {
      this.masterPageService.hideSearchBox = false;
    } else {
      this.masterPageService.hideSearchBox = true;
    }
    event.stopPropagation();
  }
}

