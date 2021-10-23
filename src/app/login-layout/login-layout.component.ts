import { TranslateService } from '@ngx-translate/core';
import { AppService } from './../utilities/rlcutl/app.service';
import { Component, OnInit } from '@angular/core';
import { appRelease } from './../../assets/app-release-config';
import { StorageData } from './../enums/storage.enum';
import { MasterPageService } from '../utilities/rlcutl/master-page.service';
import { RuntimeConfigService } from '../utilities/rlcutl/runtime-config.service';

@Component({
  selector: 'app-login-layout',
  templateUrl: './login-layout.component.html',
  styleUrls: ['./login-layout.component.css']
})
export class LoginLayoutComponent implements OnInit {

  release: string;
  env:string;
  constructor(
    public appService: AppService,
    public translate: TranslateService,
    public masterPageService: MasterPageService,
    private environment: RuntimeConfigService,
  ) {
    this.release = appRelease.version;    
    localStorage.setItem(StorageData.release, this.release);
    this.env = this.environment.runtimeConfig.env;
    localStorage.setItem(StorageData.env, this.release);
    masterPageService.languageVariables();
  }

  ngOnInit() { }
  setLang(event) {
    localStorage.setItem(StorageData.defaultLang, event.value);
    this.translate.use(event.value);
    this.masterPageService.languageVariables();
  }


  // copy right year
  copyRightYear() {
    const year = new Date();
    return year.getFullYear();
  }



}
