import { Injectable } from '@angular/core';
import { ApiService } from './utilities/rlcutl/api.service';
import { ApiConfigService } from './utilities/rlcutl/api-config.service';
import { StorageData } from './enums/storage.enum';


@Injectable()
export class AuthService {

  storageData = StorageData;
  
  constructor( private apiService :ApiService, private apiConfigService:ApiConfigService) { 
   
  }

  loginUser(user){
   return  this.apiService.apiPostRequest(this.apiConfigService.authenticateUrl, user);
  }

  loggedIn() {
      return !!(localStorage.getItem(this.storageData.clientId) && localStorage.getItem(this.storageData.addWho) && localStorage.getItem(this.storageData.token) &&  localStorage.getItem(this.storageData.menu));

  }

  checkLoggedIn() {
    if (localStorage.getItem(this.storageData.sessionClose) == 'true' && sessionStorage.getItem(this.storageData.sessionStorageClose) != 'true') {
      return true;
    } else {
      return false;
    }
  }

  loggedProfile(){
    return !!(localStorage.getItem(this.storageData.addWho) && localStorage.getItem(this.storageData.token));
  }
  
}
