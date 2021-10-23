import { Component, OnInit, OnDestroy} from '@angular/core';
import { RuntimeConfigService } from './../utilities/rlcutl/runtime-config.service';
import { MasterPageService } from '../utilities/rlcutl/master-page.service';
import { AppErrorService } from '../utilities/rlcutl/app-error.service';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiConfigService } from '../utilities/rlcutl/api-config.service';
import { ApiService } from '../utilities/rlcutl/api.service';
import { AppService } from '../utilities/rlcutl/app.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location } from '../models/login/Location';
import { String, StringBuilder } from 'typescript-string-operations';
import { Router } from '@angular/router';
import { userProfile } from '../models/login/userProfile';
import { RmtextboxComponent } from '../framework/frmctl/rmtextbox/rmtextbox.component';
import { MessageType } from '../enums/message.enum';
import { Message } from '../models/common/Message';
import { MessagingService } from '../utilities/rlcutl/messaging.service';
import { ClientData } from '../models/common/ClientData';
import { dropdown } from '../models/common/Dropdown';
import { TranslateService } from '@ngx-translate/core';
import { LoginService } from './../services/login.service';
import { StorageData } from '../enums/storage.enum';
import { StatusCodes } from '../enums/status.enum';
import { checkNullorUndefined } from '../enums/nullorundefined';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit, OnDestroy {
  userForm: FormGroup;
  client = [];
  userName: string;
  locationDisabled = false;
  clientDisabled = true;
  isLocationDisabled = false;
  isClientDisable = false;
  isSiteIdDisabled = false;
  isDeviceIdDisabled = false;
  isLanguagePreferenceIdDisabled=false;
  userRoles = false;
  userRolesCollapsed = false;
  caretRotate = false;
  defaultLocationClients = [];
  // AppMsg
  messageNum: string;
  messageType: string;
  clientData = new ClientData();
  siteIdOptions = [];
  userProfile = new userProfile();
  storageData = StorageData;
  statusCode = StatusCodes;
  constructor(
    private apiService: ApiService,
    private apiConfigService: ApiConfigService,
    private spinner: NgxSpinnerService,
    public snackbar: XpoSnackBar,
    public appErrService: AppErrorService,
    private masterPageService: MasterPageService,
    private appService: AppService,
    private form: FormBuilder,
    private messagingService: MessagingService,
    private router: Router,
    public translate: TranslateService,
    private environment: RuntimeConfigService,
    private loginService: LoginService) {

  }

  ngOnInit() {
    if (localStorage.getItem(this.storageData.appConfig) === null) {
      this.appService.getAppConfig();
    }
    this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
    this.buildForm();
    this.userProfile.DeviceId = this.clientData.DeviceId;
    if (this.userProfile.DeviceId) {
      this.isDeviceIdDisabled = true;
    } else {
      this.isDeviceIdDisabled = false;
    }
    if (!checkNullorUndefined(this.clientData) && this.clientData.LoggedInUser && this.appService.securityKey) {
      this.userName = this.appService.decrypt(this.appService.securityKey, this.clientData.LoggedInUser);
    }
    if (!checkNullorUndefined(this.clientData) && this.clientData.SiteId !== 'LOGIN' && this.clientData.SiteId !== '') {
      this.getStorer(this.clientData.SiteId);
      const currentProfile = JSON.parse(localStorage.getItem(this.storageData.currentProfile));
      if(!checkNullorUndefined(currentProfile)){
        this.userProfile.SiteId = currentProfile.SiteId;
        this.userProfile.ClientId = currentProfile.ClientId;
        this.userProfile.Loc = currentProfile.Loc;       
        this.disableControls(false);
      }
    } else {
      this.disableControls(true);
    }
    this.masterPageService.setTitle('User Profile');
    this.masterPageService.setModule(null);
    this.loadSiteIds();
    this.siteIdFocus();   
    this.masterPageService.showtogglePageWise = false;
  }

  setLang(lang) {
    this.userProfile.LanguagePreference=lang;
  }

  // intializing the form
  buildForm() {
    this.userForm = this.form.group({
      location: ['', Validators.required],
      clientId: ['', Validators.required],
      siteId: ['', Validators.required],
      deviceId: []
    });
  }

  // locationConfig() {
  //   const clients = localStorage.getItem('defaultLocationClients');
  //   if (!checkNullorUndefined(clients)) {
  //     const defaultClients = JSON.parse(clients);
  //     const defaultClient = defaultClients.find(d => d.StorerKey === this.userProfile.StorerKey);
  //     if (!checkNullorUndefined(defaultClient)) {
  //       this.userProfile.Loc = this.clientData.Location;
  //       this.userProfile.StorerKey = defaultClient.StorerKey;
  //       this.clientData.StorerKey = defaultClient.StorerKey;
  //         if(this.userProfile.Loc ==""){
  //           this.locationFocus();
  //         }
  //     } 
  //     else {
  //       if(!checkNullorUndefined(this.userProfile.StorerKey) && this.userProfile.StorerKey !== ""){
  //         this.userProfile.Loc = "";
  //         this.clientData.Location = this.userProfile.Loc;
  //         this.locationFocus();
  //     }
  //   }
  // }
  // }

  loadSiteIds(){
    const siteids: any[] = JSON.parse(localStorage.getItem(this.storageData.siteIds));
    const clientsInfo = this.environment.runtimeConfig.clients;
    clientsInfo.forEach(v => v.siteIds.forEach(c => {
      if (siteids.indexOf(c) > -1) {
        this.siteIdOptions.push({
          siteId: c,
          clientName: v.clientName
      });
    }
    }));
  }

  // change SiteId
  changeSiteId(event) {
    this.appErrService.clearAlert();
    const currentProfile = JSON.parse(localStorage.getItem(this.storageData.currentProfile));
    if (!checkNullorUndefined(currentProfile) && currentProfile.SiteId === event.target.value) {
      this.userProfile.SiteId = currentProfile.SiteId;
      this.userProfile.Loc = currentProfile.Loc;
      this.updateClientDataObj(currentProfile);
    } else {
      this.userProfile.Loc = '';
      this.userProfile.ClientId = '';
      this.userProfile.SiteId = event.target.value;
      this.updateClientDataObj(this.userProfile);
      this.clientFocus();
    }

  }

  // updating Client data object based site selection
  updateClientDataObj(obj) {
    this.clientData.SiteId = obj.SiteId;
    this.clientData.ClientId = obj.ClientId;
    this.clientData.Location = obj.Loc;
    this.getStorer(obj.SiteId);
  }

  //get storer
  getStorer(siteId: string) {
    const requestObj = { ClientData: this.clientData };
    this.spinner.show();
    const getStorerUrl = String.Join('/', this.apiConfigService.getStorerUrl, siteId);
    this.apiService.apiPostRequest(getStorerUrl, requestObj)
      .subscribe(response => {
        const res = response.body;
        this.spinner.hide();
        if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
          this.client = res.Response;
          if (this.client.length === 1) {
            this.userProfile.ClientId = this.client[0].ClientId;
            this.clientData.ClientId = this.userProfile.ClientId;
            if (this.client[0].Loc !== '') {
              this.userProfile.Loc = this.client[0].Loc;
            }
            this.disableControls(false);
            if (checkNullorUndefined(this.userProfile.Loc) || this.userProfile.Loc === '') {
              this.locationFocus();
            }
          } else {
              //multiple clients
           // const currentProfile = JSON.parse(localStorage.getItem(this.storageData.currentProfile));
           // if (currentProfile.SiteId === siteId) {
            //  this.userProfile.StorerKey = currentProfile.StorerKey;
            //  this.clientData.StorerKey = this.userProfile.StorerKey;
           // }
            if(!checkNullorUndefined(this.userProfile.SiteId) && checkNullorUndefined(this.userProfile.ClientId)){
              this.clientFocus();
            }
            this.disableControls(false);
          }
        } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
          this.client = [];
          this.disableControls(true);
          this.spinner.hide();
          this.snackbar.error(res.Response);
        }
      }, erro => {
        this.spinner.hide();
        this.appErrService.handleAppError(erro);
      });
  }


  // focus on pageload

  siteIdFocus() {
    this.appService.setFocus('SiteId');
  }

  clientFocus() {
    this.appService.setFocus('clientId');
  }

  locationFocus() {
    this.appService.applySelect('Location');
  }

  // validatelocation
  validateLocation(value, inputControl: RmtextboxComponent) {
    const currentProfile = JSON.parse(localStorage.getItem(this.storageData.currentProfile));
    if (checkNullorUndefined(currentProfile) || this.userProfile.Loc !== currentProfile.Loc || this.userProfile.ClientId !== currentProfile.ClientId
      || this.userProfile.SiteId !== currentProfile.SiteId) {
      this.spinner.show();
      const loc = new Location();
      loc.Loc = value.location;
      this.clientData.ClientId = value.clientId;
      this.clientData.Location = value.location;
      this.clientData.SiteId = this.userProfile.SiteId;
      const requestObj = { ClientData: this.clientData, Location: loc };
      const url = String.Join('/', this.apiConfigService.validateLocation);
      this.apiService.apiPostRequest(url, requestObj)
        .subscribe(response => {
          const res = response.body;
          if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
            this.saveUserProfile();
          } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
            this.spinner.hide();
            inputControl.applySelect();
            inputControl.applyRequired(true);
            this.appErrService.setAlert(res.StatusMessage, true);
            this.snackbar.error(res.StatusMessage);
          }
        }, erro => {
          this.spinner.hide();
          this.appErrService.handleAppError(erro);
        });
    } else {
      let userMessage = new Message();
      this.messageNum = '2660043';
      this.messageType = MessageType.failure;
      userMessage = this.messagingService.SendUserMessage(this.messageNum, this.messageType);
      this.appErrService.setAlert(userMessage.messageText, true, MessageType.info);
    }
  }

  // save/update profile
  saveUserProfile() {
    this.spinner.show();
    this.userProfile.UserId = this.clientData.LoggedInUser;
    const requestObj = { ClientData: this.clientData, UserProfile: this.userProfile };
    const saveUserProfileUrl = String.Join('/', this.apiConfigService.saveUserProfileUrl);
    this.apiService.apiPostRequest(saveUserProfileUrl, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
          localStorage.setItem(this.storageData.currentProfile, JSON.stringify(this.userProfile));
          localStorage.setItem(this.storageData.location, this.userProfile.Loc);
          localStorage.setItem(this.storageData.clientId, this.userProfile.ClientId);         
          this.clientData.Location = this.userProfile.Loc;
          this.clientData.ClientId = this.userProfile.ClientId;
          this.clientData.SiteId = this.userProfile.SiteId;          
          localStorage.setItem(this.storageData.clientData, JSON.stringify(this.clientData));
          localStorage.setItem(this.storageData.module, 'COM');
          this.appErrService.appMessage();
          this.appService.appImage(this.userProfile.ClientId);
          this.masterPageService.location = this.userProfile.Loc;
          this.masterPageService.siteId = this.userProfile.SiteId;
          this.snackbar.success(res.Response);
         // this.appService.getRelease();
          this.appService.getControlConfig();
           //to get configured timeouts
           this.loginService.getTimeOutConfig(); 
           this.appService.getRolesBySiteId(this.userProfile.SiteId);
        } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(res.Response, true);
          this.snackbar.error(res.Response);
        }
      }, erro => {
        this.spinner.hide();
        this.appErrService.handleAppError(erro);
      });
  }

  reset() {
    localStorage.removeItem(this.storageData.location);
    localStorage.removeItem(this.storageData.clientId);
    this.userProfile.Loc = '';
    this.userProfile.ClientId = '';
    this.clientFocus();
  }

  //changing client dropdown
  onChangeData(event) {
    this.clearAlert();
    this.userProfile.ClientId = event.target.value;
    this.clientData.ClientId =  this.userProfile.ClientId;
    this.locationFocus();
    //this.locationConfig();
  }

  //clearing alert
  clearAlert() {
    this.appErrService.clearAlert();
  }

  //Change input box
  changeInput(inputControl: RmtextboxComponent) {
    this.clearAlert();
  }

  onDeviceIdChange(event) {
    this.clientData.DeviceId = event.value;
  }
  disableControls(flag) {
    this.isClientDisable = flag;
    this.isLocationDisabled = flag;
  }

  collapseMenu(submenu: any) {
    if (submenu === 'userRoles') {
      this.userRolesCollapsed = !this.userRolesCollapsed;
      this.caretRotate = !this.caretRotate;
      this.userRoles = true;
    }
  }

  ngOnDestroy() {
    this.clearAlert();
    this.masterPageService.moduleName.next(null);
    this.masterPageService.showtogglePageWise = true;
    this.masterPageService.hideModal();
  }

}
