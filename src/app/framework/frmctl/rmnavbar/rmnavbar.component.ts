import { Component, OnInit, forwardRef, Input, Output, ElementRef, HostListener,OnDestroy, TemplateRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { AppService } from '../../../utilities/rlcutl/app.service';
import { AppErrorService } from '../../../utilities/rlcutl/app-error.service';
import { ApiConfigService } from '../../../utilities/rlcutl/api-config.service';
import { String } from 'typescript-string-operations';
import { ApiService } from '../../../utilities/rlcutl/api.service';
import { ClientData } from '../../../models/common/ClientData';
import { RolesList } from '../../../models/login/Login';
import { MasterPageService } from '../../../utilities/rlcutl/master-page.service';
import { StorageData } from '../../../enums/storage.enum';
import { checkNullorUndefined } from '../../../enums/nullorundefined';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';

@Component({
  selector: 'rmnavbar',
  templateUrl: './rmnavbar.component.html',
  styleUrls: ['./rmnavbar.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RmnavbarComponent),
      multi: true
    }]
})
export class RmnavbarComponent implements OnInit, ControlValueAccessor,OnDestroy {
  mySidenav: boolean = false;

  @Input() label: string;
  @Input() ngnavcolor: string;
  public isShowNav: boolean;
  loggedInUser: string;
  location: string;
  newMenuItems: any;
  clientData = new ClientData();
  rolesList = new RolesList();
  modulename: string;
  rightClicked: any;
  copyrightYear= new Date();
  storageData = StorageData;

  constructor(private router: Router, public masterPageService: MasterPageService, private snackbar: XpoSnackBar, private eRef: ElementRef, private appService: AppService, private appErrService: AppErrorService, private apiConfigService: ApiConfigService, private apiService: ApiService
  ) {
    this.isShowNav = false;
  }

  ngOnInit() {
      if (this.appService.securityKey && localStorage.getItem(this.storageData.addWho)) {
          this.loggedInUser = this.appService.decrypt(this.appService.securityKey, localStorage.getItem(this.storageData.addWho));
      }
    this.appService.clientImage = localStorage.getItem(this.storageData.clientImage);
    this.appService.imageAltText = localStorage.getItem(this.storageData.imageAltText);
    this.appService.menu = JSON.parse(localStorage.getItem(this.storageData.menu));
  }

  writeValue(value: any) { }

  registerOnChange(fn: any) { }

  registerOnTouched() { }

   @HostListener('document:click', ['$event'])
  clickout(event) {
    if (!this.eRef.nativeElement.contains(event.target)) {   
      this.isShowNav = false;
      this.masterPageService.navbarPageStatus = false;
      this.masterPageService.hideSearchBox = false;
      this.resetcaret();
    }
  }



  caretToggle(menuTitle) {
    if (!checkNullorUndefined(this.appService.menu)) {
      this.appService.menu.forEach(element => {
        if (element.Title !== menuTitle) {
          element.isExpandable = false;
        }
      });
    }
  }

  resetCaretRotation() {
    this.isShowNav = !this.isShowNav;
     if(this.masterPageService.showtogglePageWise){
      this.masterPageService.setNavBarToggle(this.isShowNav);
    }
    this.resetcaret();
  }

  resetcaret() {
    if (!checkNullorUndefined(this.appService.menu)) {
      this.appService.menu.forEach(element => {
        element.isExpandable = false;
      });
    }
  }

  mainMenu(item) {
    if (item.Module == 'BAX') {
      window.open(item.RouterLink, '_blank');
    }
    else {
      this.resetCaretRotation();
      this.router.navigate([item.RouterLink]);
    }
  }
  imageErrorHandler(item, event) {
    event.target.src =  `assets/images/navbaricons/${item}.png`;
  }
  navigatetoPage(routeLink, item) {
      this.resetcaret();
      this.masterPageService.routeCategory = item.Category;
      this.router.navigate([routeLink]);
  }

  onRightClicked(item) {
    // if (item.Module == "UTL")
     // document.getElementById(item.Title).setAttribute('href', "#" + item.RouterLink);
    // localStorage.setItem(item.Title, JSON.stringify(item));
  }

  // Modal Popup
  openModal(template: TemplateRef<any>) {
    this.masterPageService.openModelPopup(template);
  }

  userLogout() {
    this.masterPageService.hideModal();
    this.masterPageService.logout();
  }

  ngOnDestroy() {
      this.masterPageService.hideSearchBox = false;
      this.masterPageService.hideModal();
    }
}