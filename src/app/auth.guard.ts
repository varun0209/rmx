import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { MasterPageService } from './utilities/rlcutl/master-page.service';
import { StorageData } from '../app/enums/storage.enum';
import { AppService } from './utilities/rlcutl/app.service';
import { checkNullorUndefined } from './enums/nullorundefined';

@Injectable()
export class AuthGuard implements CanActivate {
  storageData = StorageData;
  constructor(private authService: AuthService, private router: Router, private masterPageService: MasterPageService,private appService:AppService
  ) { }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
     if (!checkNullorUndefined(this.appService.dialogRef)) {
       this.appService.dialogRef.close();
     }
    if (this.authService.checkLoggedIn()) {
      this.masterPageService.logout();
    } else {
      if (this.authService.loggedIn()) {
        if (this.getStatus(state)) {
          return true;
        } else {
          this.router.navigate(['/pagenotfound']);
          return false;
        }
      } else {
        this.router.navigate(['/user-profile']);
        return false;
      }
    }

  }

  getStatus(state) {
    const menuList = JSON.parse(localStorage.getItem(this.storageData.menu));
    if (state.url === '/dashboard' || state.url === '/receive' || state.url === '/rcv/receiving-automation') {
      return true;
    } else {
      for (let i = 0; i < menuList.length; i++) {
        if (!checkNullorUndefined(menuList[i].SubMenu) && menuList[i].SubMenu.length > 0) {
          for (let j = 0; j < menuList[i].SubMenu.length; j++) {
            if (menuList[i].SubMenu[j].RouterLink === state.url) {
              return true;
            }
          }
        } else {
          if (menuList[i].RouterLink === state.url) {
            return true;
          }
        }
      }

    }
  }
}
