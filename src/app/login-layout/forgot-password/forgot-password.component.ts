import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonService } from './../../services/common.service';
import { Login } from './../../models/login/Login';
import { ClientData } from './../../models/common/ClientData';
import { AppErrorService } from './../../utilities/rlcutl/app-error.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Title } from '@angular/platform-browser';
import { AuthService } from './../../auth.service';
import { ApiConfigService } from './../../utilities/rlcutl/api-config.service';
import { Router } from '@angular/router';
import { AppService } from './../../utilities/rlcutl/app.service';
import { RuntimeConfigService } from './../../utilities/rlcutl/runtime-config.service';
import { StatusCodes } from './../../enums/status.enum';
import { PatternEnum } from './../../enums/pattern.enum';


@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {

  responseStatusMsg: string;
  userNamePattern = PatternEnum.userNamePattern;

  user = new Login();
  clientData = new ClientData();

  constructor(
    public appService: AppService,
    public appErrService: AppErrorService,
    private environment: RuntimeConfigService,
    private router: Router,
    private apiConfigService: ApiConfigService,
    private commonService: CommonService,
    private authService: AuthService,
    private titleService: Title,
    private spinner: NgxSpinnerService,

  ) {
    this.clientData.Location = '';
    this.clientData.ClientId = '9999';
    this.clientData.SiteId = 'LOGIN';
  }

  ngOnInit() {
    if (this.authService.loggedIn()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.titleService.setTitle('Forgot Password');
    }
  }


  forgotPwd(value) {
    this.spinner.show();
    const ssInfo = this.environment.runtimeConfig.sharedSecurity;
    this.user.UserName = this.appService.encrypt(value.UserName.toLowerCase(), this.appService.securityKey);
    this.user.Application = ssInfo.Application;
    const requestObj = { ClientData: this.clientData, LogInModel: this.user };
    this.commonService.commonApiCall(this.apiConfigService.forgotPasswordUrl, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          const reposne = res.Response;
          if (reposne.successCode === StatusCodes.fail) {
            this.appErrService.alertMsg = reposne.message;
          }
        }
      }
    });

  }

  changeInput(event) {
    this.appErrService.alertMsg = null;
  }

  backToLogin() {
    this.router.navigate(['/login']);
  }

  ngOnDestroy() {
    this.appErrService.clearAlert();
  }
}
