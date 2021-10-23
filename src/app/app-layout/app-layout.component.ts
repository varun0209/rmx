import { Component, OnInit, RendererFactory2, Renderer2, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UserIdleService } from 'angular-user-idle';
import { Router } from '@angular/router';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { MasterPageService } from '../utilities/rlcutl/master-page.service';
import { Title } from '@angular/platform-browser';
import { AppService } from '../utilities/rlcutl/app.service';
import { StorageData } from '../enums/storage.enum';
import { checkNullorUndefined } from '../enums/nullorundefined';


@Component({
  selector: 'app-app-layout',
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.css']
})
export class AppLayoutComponent implements OnInit {
  message: string;
  tabTitle: string = "";
  renderer: Renderer2;
    // browser close
  isBrowserClose = false;
  isremovePageMargin= false;
  storageData = StorageData;
  constructor(
    private userIdle: UserIdleService,
    private router: Router,
    private snackbar: XpoSnackBar,
    public translate: TranslateService,
    public  masterPageService: MasterPageService,
    private titleService: Title,
    private app: AppService,
    private rendererFactory: RendererFactory2
  ) { 
      this.renderer = rendererFactory.createRenderer(null, null);

      // auto logout and session close
      window.addEventListener("storage", (event) => {
          if (!this.isBrowserClose && localStorage.length != 0 && event.key == this.storageData.sessionClose) {
              localStorage.setItem(this.storageData.sessionClose, 'false');
          } else if (localStorage.getItem(this.storageData.logoutData) == 'true') {
              this.masterPageService.logout();
          }
          // reloading the tab when  user changes the profile
          if (localStorage.getItem(this.storageData.userProfileChanged) == 'true') {
              window.location.reload();
          }
      });
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    for (let i = 0; i < document.body.childNodes.length; i++) {
      if (!checkNullorUndefined(document.body.childNodes[i]['className'])) {
        if (document.body.childNodes[i]['className'] = 'modal-backdrop drop') {
          this.renderer.removeClass(document.body.childNodes[i], 'modal-backdrop')
        }
      }
    }
  }

    // called when tab or browser close
  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHander(event) {
      localStorage.setItem(this.storageData.sessionClose, "true");
    sessionStorage.setItem(this.storageData.sessionStorageClose, 'true');
    this.isBrowserClose = true;
  }

  // storing localtime on mouse move
  @HostListener('window:mousemove', ['$event'])
  @HostListener('window:keyup', ['$event'])
  onmousemove(event) {
      localStorage.setItem(this.storageData.timmerCount, Math.floor(new Date().getTime()).toString());
      sessionStorage.setItem(this.storageData.timmerCount, Math.floor(new Date().getTime()).toString());
  }

  // storing localtime on mouse move
  @HostListener('window:copy', ['$event'])
  @HostListener('window:paste', ['$event'])
  @HostListener('window:drag', ['$event'])
  @HostListener('window:drop', ['$event'])
  @HostListener('window:cut', ['$event'])
  oncopy(event) {
    const data = JSON.parse(localStorage.getItem(this.storageData.controlConfig));
    if (!this.app.checkNullOrUndefined(data) && data.hasOwnProperty('apprestriction')) {
      return data.apprestriction.some(res => res === event.type) ? false : true;
    }
    return true;
  }


  ngOnInit() {
    this.masterPageService.title.subscribe(title => {
      this.tabTitle = title;
      this.titleService.setTitle(this.tabTitle);
      this.message = this.app.getErrorText('2660037');
      localStorage.setItem(this.storageData.userProfileChanged, 'false');
    });

    this.masterPageService.navbarPageToggle.subscribe(nav => {
      this.masterPageService.navbarPageStatus = nav;
    });
    this.masterPageService.removeHeaderMarginTop.subscribe(val => {
      this.isremovePageMargin = val;
    });

  }

  // allowCopyPaste(key) {
  //   const data = JSON.parse(localStorage.getItem(this.storageData.controlConfig));
  //   if (!this.app.checkNullOrUndefined(data) && data.hasOwnProperty('apprestriction')) {
  //     return data.apprestriction.some(res => res === key) ? false : true;
  //   }
  //   return true;
  // }

}
