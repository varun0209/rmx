import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { RuntimeConfigService } from './../../utilities/rlcutl/runtime-config.service';
import { Title } from '@angular/platform-browser';
import { ApiService } from './../../utilities/rlcutl/api.service';
import { AppErrorService } from './../../utilities/rlcutl/app-error.service';
import { Router } from '@angular/router';
import { MasterPageService } from './../../utilities/rlcutl/master-page.service';
import { AuthService } from './../../auth.service';
import { LoginService } from './../../services/login.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { ApiConfigService } from './../../utilities/rlcutl/api-config.service';
import { AppService } from './../../utilities/rlcutl/app.service';
import { ClientData } from './../../models/common/ClientData';
import { Login } from './../../models/login/Login';
import { String } from 'typescript-string-operations';
import { StorageData } from './../../enums/storage.enum';
import { StatusCodes } from './../../enums/status.enum';
import { PatternEnum } from './../../enums/pattern.enum';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  @ViewChild('loginForm') loginForm: NgForm;
  // loginForm: FormGroup;
  siteIds: any[] = [];
  isCapLockOn: boolean;
  siteConfigData: any;
  userRolesSiteIds: any;
  userProfile: any;
  env: string;
  responseStatusMsg: string;
  userNamePattern = PatternEnum.userNamePattern;



  user = new Login();
  clientData = new ClientData();

  constructor(
    public appService: AppService,
    private apiConfigService: ApiConfigService,
    private snackbar: XpoSnackBar,
    private spinner: NgxSpinnerService,
    private loginService: LoginService,
    private authService: AuthService,
    public masterPageService: MasterPageService,
    private router: Router,
    public appErrService: AppErrorService,
    public apiservice: ApiService,
    private titleService: Title,
    private environment: RuntimeConfigService,
    public translate: TranslateService
  ) {
    this.clientData.Location = '';
    this.clientData.ClientId = '9999';
    this.clientData.SiteId = 'LOGIN';
  }

  ngOnInit() {
    if (this.authService.loggedIn()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.titleService.setTitle('Login');
      localStorage.setItem(StorageData.clientData, JSON.stringify(this.clientData));
    }
    this.masterPageService.languageVariables();
  }

  validateLogin(value) {
    if (this.loginForm.valid) {
      if (value.UserName && this.appService.securityKey && value.Password) {
        this.user.UserName = this.appService.encrypt(value.UserName.toLowerCase(), this.appService.securityKey);
        this.user.Password = this.appService.encrypt(value.Password, this.appService.securityKey);
      }
      if (!this.appService.checkNullOrUndefined(localStorage.getItem(StorageData.addWho))) {
        if (localStorage.getItem(StorageData.addWho) !== this.user.UserName) {
          this.responseStatusMsg = this.apiConfigService.invalidUserErrMsg;
          // this.snackbar.error(this.apiConfigService.invalidUserErrMsg);
        } else if (localStorage.getItem(StorageData.addWho) === this.user.UserName) {
          this.authenticateUser();
        }
      } else {
        this.authenticateUser();
      }
    }
  }


  authenticateUser() {
    this.spinner.show();
    const user = this.user;
    this.apiservice.apiPostRequest(this.apiConfigService.authenticateUrl, this.user)
      .subscribe(response => {
        const res = response.body;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          this.user = res.Response;
          this.clientData.LoggedInUser = this.user.UserName;
          localStorage.setItem(StorageData.clientData, JSON.stringify(this.clientData));
          localStorage.setItem(StorageData.addWho, this.user.UserName);
          this.getRolesSitedIds(user);
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.spinner.hide();
          localStorage.clear();
          this.appErrService.alertMsg = res.Message;
          // this.snackbar.error(res.Message);
        }
      }, erro => {
        this.spinner.hide();
        localStorage.clear();
        this.appErrService.handleAppError(erro);
      });
  }

  getRolesSitedIds(user) {
    const ssInfo = this.environment.runtimeConfig.sharedSecurity;
    this.user.Password = user.Password;
    this.user.Environment = this.appService.env;
    this.user.DataType = ssInfo.DataType;
    this.user.DataTypeIdList = this.getConfigSiteIds();
    this.user.Application = ssInfo.Application;
    const requestObj = { ClientData: this.clientData, LogInModel: this.user };
    this.apiservice.apiPostRequest(this.apiConfigService.getRolesSideIdsUrl, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (!this.appService.checkNullOrUndefined(res.Response) && res.Status === StatusCodes.pass) {
          if (!this.appService.checkNullOrUndefined(res.Response.rolesList)) {
            this.userRolesSiteIds = res.Response.rolesList;
            localStorage.setItem(StorageData.siteIds, JSON.stringify(Object.keys(this.userRolesSiteIds)));
            if (res.Response.Token) {
              localStorage.setItem(StorageData.token, res.Response.Token);
            }
            localStorage.setItem(StorageData.rolesSiteIds, JSON.stringify(this.userRolesSiteIds));
            this.getUserProfile();
          }
        } else if (!this.appService.checkNullOrUndefined(res.Response) && res.Status === StatusCodes.fail) {
          this.spinner.hide();
          localStorage.clear();
          this.appErrService.alertMsg = res.StatusMessage;
          // this.snackbar.error(res.StatusMessage);
        }
      }, erro => {
        this.spinner.hide();
        localStorage.clear();
        this.appErrService.handleAppError(erro);
      });

  }

  // getting siteids from runtime-config file
  getConfigSiteIds() {
    const clientsInfo = this.environment.runtimeConfig.clients;
    const siteids = [];
    clientsInfo.forEach(v => v.siteIds.forEach(c => {
      if (siteids.indexOf(c) === -1) {
        siteids.push(c);
      }
    }));
    return siteids;
  }

  getUserProfile() {
    const requestObj = { ClientData: this.clientData };
    const getUserProfileUrl = String.Join('/', this.apiConfigService.getUserProfileUrl);
    this.apiservice.apiPostRequest(getUserProfileUrl, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          this.userProfile = res.Response['UserProfile'];
          this.clientData.Location = this.userProfile.Loc;
          this.clientData.ClientId = this.userProfile.ClientId;
          this.clientData.SiteId = this.userProfile.SiteId;
          localStorage.setItem(StorageData.clientData, JSON.stringify(this.clientData));
          localStorage.setItem(StorageData.module, 'COM');
          this.appErrService.appMessage();
          localStorage.setItem(StorageData.currentProfile, JSON.stringify(this.userProfile));
          localStorage.setItem(StorageData.clientId, this.userProfile.ClientId);
          localStorage.setItem(StorageData.location, this.userProfile.Loc);
          this.appService.getRolesBySiteId(this.clientData.SiteId);
          this.appService.appImage(this.userProfile.ClientId);
          this.appService.getControlConfig(res.Response['ShowUserProfile']);
          this.appService.patternList();
          this.appService.statusTypes();
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.spinner.hide();
          this.appService.getDeviceId(this.clientData, true);
          this.appErrService.alertMsg = res.StatusMessage;
        }
        // to get configured timeouts
        this.loginService.getTimeOutConfig();
      }, erro => {
        this.spinner.hide();
        localStorage.clear();
        this.appErrService.handleAppError(erro);
      });
  }

  // CapsLock
  checkCapLock(event) {
    const capsOn = event.getModifierState && event.getModifierState('CapsLock');
    if (capsOn) {
      this.isCapLockOn = true;
    } else {
      this.isCapLockOn = false;
    }
  }

  forgotPassword() {
    this.router.navigate(['/forgot-password']);
  }

  changeInput(event) {
    this.appErrService.alertMsg = null;
  }

  ngOnDestroy() {
    this.appErrService.clearAlert();
    this.siteIds = [];
    this.masterPageService.hideModal();
  }


}
