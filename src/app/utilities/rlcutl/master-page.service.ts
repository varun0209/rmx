import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { CommonEnum } from './../../enums/common.enum';
import { dropdown } from './../../models/common/Dropdown';
import { ApiConfigService } from './api-config.service';
import { ApiService } from './api.service';
import { EventEmitter, Injectable, Output, Renderer2, RendererFactory2 } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { String } from 'typescript-string-operations';
import { Operation } from './../../models/common/Operation';
import { NgxSpinnerService } from 'ngx-spinner';
import { EngineResult } from './../../models/common/EngineResult';
import { AppErrorService } from './../../utilities/rlcutl/app-error.service';
import { RmtextboxComponent } from '../../framework/frmctl/rmtextbox/rmtextbox.component';
import { ClientData } from '../../models/common/ClientData';
import { Router } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { StorageData } from '../../enums/storage.enum';
import { StatusCodes } from '../../enums/status.enum';
import { UserIdleService } from 'angular-user-idle';
import { TranslateService } from '@ngx-translate/core';
// import * as data from '../../../assets/app-lang-config.json';
import { AppService } from './app.service';
import { dataLanguage } from '../../enums/language';
import { checkNullorUndefined } from '../../enums/nullorundefined';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DeleteConfirmationDialogComponent } from '../../framework/frmctl/delete-confirmation-dialog/delete-confirmation-dialog.component';

@Injectable()
export class MasterPageService {
  // maintaining timmer count
  timmerCount: number;

  disabledContainer = true;
  disabledSerialNumber = true;
  categoryName: string;
  maserialNumberBatch: string;
  operCategoryTests = [];
  operationsdropdown: dropdown[] = [];
  operation: string;
  operationList = [];
  operationDisabled: boolean;
  operationName: string;
  selectedCategory = false;
  tempQueList: any;
  samplingBatchDeatil: any;
  gridContainerDetails: any;
  batchSerialNumberList: any;
  // setting module
  module: string;
  options = [];
  option: any;
  hideControls: EngineResult = new EngineResult();


  // messages
  text: string;
  messageNum: string;
  messagesCategory: string;
  messageType: string;
  disabledBatchSerialNumber: boolean;
  showRibbondropdown: boolean;
  showRibbonModesDropdown: boolean;
  modeOptionSelected = false;  // disabling not selected options
  // required fields
  requiredFields: any;
  gridBatchId = '';

  location = '';
  siteId = '';

  // assigning operationobj from caller screen
  operationObj: any;

  showUtilityIcon = false;
  navbarPageStatus = false;
  showtogglePageWise = true;
  // if it is true(setting from caller screen) we are emiting emitHideSpinner method(getControlConfig)
  hideSpinner = false;

  // settting modes in receiving
  modes = [];
  selectedModeIndex: number;

  //hold release route tab
  routeOperationList = []
  nextRoutesList = [];
  isNextRoutesDisabled = true;
  RouteId: string;
  serialNumberProperties: any;
  enableDynamicSelector = false;

  // observable string source
  public title = new BehaviorSubject<string>(null);
  public cardHeader = new BehaviorSubject<string>(null);
  public fqaCardHeader = new BehaviorSubject<string>(null);
  public samplingInfoHeader = new BehaviorSubject<string>(null);
  public routeInfoHeader = new BehaviorSubject<string>(null);
  public deviceCardHeader = new BehaviorSubject<string>(null);
  public containerDetailsInfoHeader = new BehaviorSubject<string>(null);
  public moduleName = new BehaviorSubject<string>(null);
  public emitUiData = new BehaviorSubject<string>(null);
  private clearAll = new Subject<boolean>();
  public navbarPageToggle = new BehaviorSubject<boolean>(false);
  public removeHeaderMarginTop = new BehaviorSubject<boolean>(false);
  public selectedOptionMode = new BehaviorSubject<any>(null);

  public receiveingConfiguration = new BehaviorSubject<any>(null);
  public emitHideConfiguration = new BehaviorSubject<any>(null);
  public selectedRecevingMode = new BehaviorSubject<any>(null);
  public originationOperation = new BehaviorSubject<any>(null);

  public emitHideSpinner = new BehaviorSubject<any>(null);

  // observable string streams
  clearAll$ = this.clearAll.asObservable();
  clientData = new ClientData();
  callerUrl: string;
  renderer: Renderer2;
  // Modal popup
  modalRef: BsModalRef;
  hideSearchBox = false;
  storageData = StorageData;
  statusCode = StatusCodes;
  mediaStream: any;
  routeCategory: string;
  uiData: string;
  langData = { selected: '', selectedLanguage: '', list: dataLanguage };
  setActiveTabValue = CommonEnum.containerDetails;
  // to track focus in application
  focusId: string;
  emitConfigRequired = false;

  constructor(
    private apiService: ApiService,
    private apiConfigService: ApiConfigService,
    private spinner: NgxSpinnerService,
    private appErrService: AppErrorService,
    private router: Router,
    private rendererFactory: RendererFactory2,
    private modalService: BsModalService,
    private userIdle: UserIdleService,
    public translate: TranslateService,
    private snackbar: XpoSnackBar,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<any>
  ) {
    this.disabledBatchSerialNumber = false;
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  defaultProperties() {
    if (this.hideControls.controlProperties) {
      this.hideControls.controlProperties = new EngineResult();
    }
    this.hideSpinner = false;
    this.emitHideSpinner.next(null);
    this.hideModal();
    this.clearModule();
    this.hideDialog();
    this.appErrService.clearAlert();
  }

  setCardHeader(cardHeader) {
    this.cardHeader.next(cardHeader);
  }


  setFqaCardHeader(FqaCardHeade) {
    this.fqaCardHeader.next(FqaCardHeade);
  }

  setSamplingCardHeader(samplingInfoHeader) {
    this.samplingInfoHeader.next(samplingInfoHeader);
  }

  setRouteCardHeader(header) {
    this.routeInfoHeader.next(header);
  }

  setDeviceCardHeader(header) {
    this.deviceCardHeader.next(header);
  }

  containerDetailsHeader(containerDetailsInfoHeader) {
    this.containerDetailsInfoHeader.next(containerDetailsInfoHeader);
  }

  setTitle(title) {
    this.title.next(title);
  }


  setModule(mname) {
    this.moduleName.next(mname);
  }
  setUiData(uiData) {
    this.emitUiData.next(uiData);
  }

  clearModule() {
    this.moduleName.next(null);
  }

  setCategoryName(cname) {
    this.categoryName = cname;
  }


  setDropDown(val) {
    this.selectedCategory = val;
  }

  setNavBarToggle(navbar) {
    this.navbarPageToggle.next(navbar);
  }

  removeMarginTop(value) {
    this.removeHeaderMarginTop.next(value);
  }

  setOptions(event) {
    this.selectedOptionMode.next(event.source.selected.viewValue);
  }

  selectedMode(value, index) {
    this.selectedModeIndex = index;
    this.selectedRecevingMode.next(value);
  }

  openModelPopup(template, lgModalSize = false, cusClass?, data?) {
    const modalSize = lgModalSize ? 'modal-lg' : 'modal-md';
    const dialogSize = cusClass ? cusClass : 'dialog-width-sm';
   this.dialogRef =  this.dialog.open(template, {
     hasBackdrop: true,
     panelClass: dialogSize,
     data: data?.data,
     disableClose: true,
     autoFocus: false,
    });
    return this.dialogRef
  }

  hideDialog() { 
    const inputElement = <HTMLInputElement>document.getElementById(this.focusId);
    if (inputElement) {
      inputElement.focus();
    }
    if (this.dialog) {
      this.appErrService.alertFlag = false;
      this.dialog.closeAll();
    }
  }

  setActiveTab(tab) {
    this.setActiveTabValue = tab;
  }

  // stop streaming
  stopStreaming() {
    if (this.mediaStream) {
      this.mediaStream.getVideoTracks().forEach(track => {
        track.stop();
      });
    }
  }

  hideModal() {
    if (this.modalRef) {
      this.modalRef.hide();
    }
    const inputElement = <HTMLInputElement>document.getElementById(this.focusId);
    if (inputElement) {
      inputElement.focus();
    }
  }

  // BatchSerial Number Focus
  batchSerialFocus() {
    this.focusId = 'batch';
    window.setTimeout(function () {
      const inputSerialNumber = <HTMLInputElement>document.getElementById('batch');
      if (inputSerialNumber) {
        inputSerialNumber.focus();
      }
    }, 300);
  }

  // change input box
  changeInput(inputControl: RmtextboxComponent) {
    inputControl.applyRequired(false);
    this.appErrService.clearAlert();
  }

  inboundContainerFocus() {
    if (this.hideControls.controlProperties.inboundContainer) {
      if (this.hideControls.controlProperties.inboundContainer.Hidden == undefined) {
        this.inboundFocus();
      } else {
        this.disabledSerialNumber = false;
        this.focusId = 'serialNumber';
        window.setTimeout(function () {
          const inputSerial = <HTMLInputElement>document.getElementById('serialNumber');
          if (inputSerial) {
            inputSerial.focus();
          }
        }, 0);
      }
    } else {
      this.inboundFocus();
    }
  }

  inboundFocus() {
    this.focusId = 'inboundcontainer';
    window.setTimeout(function () {
      const inputContainer = <HTMLInputElement>document.getElementById('inboundcontainer');
      if (inputContainer) {
        inputContainer.focus();
      }
    }, 0);
  }

  // Operation Category Focus
  opCategoryFocus() {
    this.focusId = 'opCategorydropdown';
    const opCategory = <HTMLInputElement>document.getElementById('opCategorydropdown');
    if (opCategory) {
      opCategory.focus();
    }
  }

  getCategoryTest() {
    this.operCategoryTests = this.operationList.filter(x => x.Category == this.categoryName);
  }

  // get Operations
  getOperations(mname) {
    this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
    if (mname != null && mname != undefined) {
      this.spinner.show();
      const operations = new Operation();
      operations.Module = mname;
      const requestObj = { ClientData: this.clientData, UIData: this.uiData };
      const url = String.Join('/', this.apiConfigService.getOperationsUrl, operations.Module);
      this.apiService.apiPostRequest(url, requestObj)
        .subscribe(response => {
          const res = response.body;
          if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
            this.operationList = res.Response;
            this.opCategoryFocus();
            if (this.operationList.length == 1) {
              this.originationOperation.next(res.Response[0].Origination);
              this.operationSelect();
              this.operation = res.Response[0].OperationId;
              this.operationName = res.Response[0].OperationName;
              this.operationDisabled = true;
              this.disabledContainer = false;
              this.setCategoryName(res.Response[0].Category);
              localStorage.setItem(this.storageData.operation, this.operationName);
              this.operCategoryTests = this.operationList;
              this.appErrService.setAlert('', false);
              this.getControlConfig(mname, this.operation);
              this.routeCategory = '';
            } else if (this.operationList.length > 1) {
              this.operationSelect();
              this.appErrService.setAlert('', false);
              this.populateDropdown();
            }
          } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
            this.spinner.hide();
            this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          }
        }, erro => {
          this.appErrService.handleAppError(erro);
        });
    }
    // else {
    //   this.operationList = [];
    //   this.operationsdropdown = [];
    // }
  }

  // for changing label names and id's based on client
  getControlConfig(moduleName, operationId) {
    this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
    this.spinner.show();
    const operations = new Operation();
    operations.Module = moduleName;
    operations.OperationId = operationId;
    const requestObj = { ClientData: this.clientData, ControlConfig: operations };
    const url = String.Join('/', this.apiConfigService.getControlConfigUrl);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
          if (res.Response != '' && !checkNullorUndefined(res.Response)) {
            this.hideControls.controlProperties = this.apiService.convertToObject(res.Response);
            if (this.hideControls.controlProperties.utilityIcon != undefined) {
              this.showUtilityIcon = this.hideControls.controlProperties.utilityIcon.Show;
            }
          }
          if (moduleName == 'RCV') {
            this.receiveingConfiguration.next(this.hideControls.controlProperties);
            if (this.hideControls.controlProperties.inboundContainer) {
              if (this.hideControls.controlProperties.inboundContainer.Hidden == undefined) {
                this.inboundContainerFocus();
              }
            }
          } else {
            if (this.hideControls.controlProperties) {
              if (this.hideControls.controlProperties.ribbondropdown == undefined) {
                this.inboundContainerFocus();
              }
              if (this.emitConfigRequired == true) {
                this.emitHideConfiguration.next(this.hideControls.controlProperties);
              }
            }
          }

          this.appErrService.setAlert('', false);
          // hidespinner value is setting from caller screen (docrec,transconfig etc)
          if (this.hideSpinner) {
            this.emitHideSpinner.next(true);
          } else {
            this.spinner.hide();
          }
        } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          this.spinner.hide();
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }


  getControlConfigForUtility(moduleName, operationId) {
    this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
    const operations = new Operation();
    operations.Module = moduleName;
    operations.OperationId = operationId;
    const requestObj = { ClientData: this.clientData, ControlConfig: operations };
    const url = String.Join('/', this.apiConfigService.getControlConfigUrl);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
          if (res.Response !== '' && !checkNullorUndefined(res.Response)) {
            const utilityHideControls = new EngineResult();
            utilityHideControls.controlProperties = this.apiService.convertToObject(res.Response);
            if (this.emitConfigRequired == true) {
              this.emitHideConfiguration.next(utilityHideControls.controlProperties);
            }
          }
        } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
          this.snackbar.error(res.ErrorMessage.ErrorDetails);
          this.spinner.hide();
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }
  // For Required field properties
  getControlProperties(operationId) {
    const requestObj = { ClientData: this.clientData };
    const url = String.Join('/', this.apiConfigService.getControlPropertiesUrl, operationId);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const res = response.body;
        this.spinner.hide();
        if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
          if (res.Response) {
            this.requiredFields = res.Response.RequiredControls;
          }
        } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }

      }, erro => {
        this.appErrService.handleAppError(erro);
      });

  }

  // pushing data into dropdown
  operationSelect() {
    this.operationList.forEach(element => {
      const operCatFound = this.operationsdropdown.findIndex(x => x.Text == element.Category);
      if (operCatFound == -1) {
        const dd: dropdown = new dropdown();
        dd.Id = element.OperationId;
        dd.Text = element.Category;
        this.operationsdropdown.push(dd);
      }
    });
    if (this.operationsdropdown.length == 1) {
      this.setDropDown(true);
    }

  }

  publishClearAll(clear: boolean) {
    this.clearAll.next(clear);
  }

  populateDropdown() {
    let getOperationObj: any;
    if (!this.callerUrl) {
      getOperationObj = this.getRouteOperation();
    } else {
      this.routeCategory = '';
      getOperationObj = this.getRouteOperation(this.callerUrl);
    }
    if (!checkNullorUndefined(getOperationObj)) {
      const operations = new Operation();
      // this.publishClearAll(true);
      operations.Module = getOperationObj.Module;
      operations.OperationId = getOperationObj.OperationId;
      this.operation = operations.OperationId;
      this.getControlConfig(operations.Module, operations.OperationId);
      const categoryName = (this.operationList.find(x => x.OperationId == getOperationObj.OperationId));
      this.originationOperation.next(categoryName.Origination);
      if (!checkNullorUndefined(categoryName)) {
        this.setCategoryName(categoryName.Category);
      }
      if (this.categoryName != null) {
        this.setDropDown(true);
      }
      this.disabledContainer = false;
      this.getCategoryTest();
    } else {
      this.spinner.hide();
    }
    this.routeCategory = '';
  }


  getRouteUrl() {
    this.router.events.subscribe((res) => {
    });
    return this.router.url;
  }

  getRouteOperation(url?) {
    let selectedMenu: any;
    this.callerUrl = url;
    const currentUrl = !checkNullorUndefined(url) ? url : this.getRouteUrl();
    const menuObj = JSON.parse(localStorage.getItem(this.storageData.menu));
    menuObj.forEach(element => {
      if (element.HasSubMenu == true) {
        const subMenuItem = element.SubMenu.filter(item => item.RouterLink == currentUrl);
        if (subMenuItem.length > 0) {
          const temSubMenus = subMenuItem.filter(item => item.RouterLink == currentUrl);
          if (temSubMenus.length) {
            if (!checkNullorUndefined(this.routeCategory) && this.routeCategory !== '') {
              selectedMenu = temSubMenus.find(item => item.RouterLink == currentUrl && item.Category == this.routeCategory);
            } else {
              selectedMenu = temSubMenus.find(item => item.RouterLink == currentUrl);
            }
          } else {
            selectedMenu = subMenuItem.find(item => item.RouterLink == currentUrl);
          }
        }
      } else if (element.RouterLink == currentUrl) {
        selectedMenu = element;
      }
    }
    );
    return selectedMenu;
  }

  getOperationForPopUp(title): any {
    const menuObj = JSON.parse(localStorage.getItem(this.storageData.menu));
    let submenuObj: any;
    menuObj.forEach(element => {
      if (element.HasSubMenu == true) {
        if (checkNullorUndefined(submenuObj)) {
          submenuObj = element.SubMenu.find(item => item.Title == title);
        } else {
          return submenuObj;
        }
      }
    }
    );
    return submenuObj;
  }

  clearOriginationSubscription() {
    if (this.originationOperation) {
      this.originationOperation.next(null);
    }
  }

  languageVariables() {
    if (localStorage.getItem(StorageData.defaultLang)) {
      this.translate.use(localStorage.getItem(StorageData.defaultLang));
    } else {
      const browserLang = this.translate.getBrowserLang();
      const lang = browserLang.match(/en|es|it|de|fr/) ? browserLang : 'en';
      this.translate.use(lang);
      localStorage.setItem(StorageData.defaultLang, lang);
    }
    const langSelected = dataLanguage.find(res => res.value === localStorage.getItem(StorageData.defaultLang));
    if (!checkNullorUndefined(langSelected)) {
      this.langData.selected = langSelected.value;
      this.langData.selectedLanguage = langSelected.name;
    }
  }

  logout() {
    localStorage.setItem(this.storageData.logoutData, 'true');
    for (let i = 0; i < document.body.childNodes.length; i++) {
      if (!checkNullorUndefined(document.body.childNodes[i]['className'])) {
        if (document.body.childNodes[i]['className'] === 'modal-backdrop') {
          this.renderer.addClass(document.body.childNodes[i], 'cdk-overlay-container');
        }
        this.renderer.removeClass(document.body.childNodes[i], 'modal-backdrop');
      }
    }
    this.stopStreaming();
    this.moduleName.next(null);
    this.userIdle.stopWatching();
    localStorage.clear();
    sessionStorage.clear();
    this.languageVariables();
    this.router.navigate(['login']);
  }

}
