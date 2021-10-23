import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { MasterPageService } from './utilities/rlcutl/master-page.service';

@Injectable()
export class ProfileGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router, private masterPageService: MasterPageService) { }

  canActivate(): boolean {
    if (this.authService.checkLoggedIn()) {
      this.masterPageService.logout();
    } else {
      if (this.authService.loggedProfile()) {
        return true;
      } else {
        this.router.navigate(['/login']);
        return false;
      }
    }
  }
}
