import { Component, OnInit, OnDestroy, AfterViewChecked } from '@angular/core';
import { MasterPageService } from '../utilities/rlcutl/master-page.service';
import { AppService } from './../utilities/rlcutl/app.service';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { Router } from "@angular/router";
import { StorageData } from './../enums/storage.enum';


@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewChecked {
  tabTitle: string = '';
  dashBoardicons: any;
  rightClicked: any;

  // Modal popup
  modalRef: BsModalRef;
  storageData = StorageData;
  searchKey:string = '';
  constructor(public masterPageService: MasterPageService,
    private appService: AppService,
    private router: Router) { }

  ngOnInit() {
    this.masterPageService.setTitle("Dashboard");
    this.masterPageService.setModule(null);
    if (localStorage.getItem(this.storageData.appConfig) === null) {
      this.appService.getAppConfig();
    }
    this.dashBoardicons = JSON.parse(localStorage.getItem(this.storageData.menu));
    this.masterPageService.showtogglePageWise = true;

  }

  ngAfterViewChecked() {
    setTimeout(() => {
        if (document.body && document.body.classList && document.body.classList.length == 0){
        this.searchKey = '';
      }
    }, 0);
  }

  // removing rightclick for all icons Except 'UTL'
  // removeRightClick() {
    // this.dashBoardicons.forEach(element => {
      // if (element.HasSubMenu == true) {
        // element.SubMenu.forEach(element => {
          // if (element.Module !== 'UTL') {
            // document.getElementById(element.OperationId).removeAttribute('href');
          // }
        // });
      // }
      // else if (element.Module !== 'UTL') {
        // document.getElementById(element.OperationId).removeAttribute('href');
      // }
    // }
    // );
  // }




  ngOnDestroy() {
    this.masterPageService.categoryName = null;
    this.masterPageService.operationList = [];
    this.masterPageService.operationsdropdown = [];
    this.masterPageService.showtogglePageWise = true;
    this.masterPageService.hideModal();
  }

  routNavigate(route: string) {
    this.modalRef.hide();
    if (route == 'closecontainer') {
      this.router.navigate(['container-close']);
    }
    else if (route == 'serialnumbermove') {
      this.router.navigate(['serial-number-move']);
    }
    else if (route == 'containermove') {
      this.router.navigate(['container-move']);
    }
  }

  mainMenu(item) {
    if (item.Module == 'BAX') {
      window.open(item.RouterLink, '_blank');
    }
    else {
      this.router.navigate([item.RouterLink]);
    }
  }

  subMneuClicked(routeLink, item) {
    this.masterPageService.routeCategory=item.Category;
    this.router.navigate([routeLink]);
  }
  imageErrorHandler(item, event) {
      event.target.src =  `assets/images/dashboard/default-images/${item}.png`;
  }

  onRightClicked(item) {
    // localStorage.setItem(item.Title, JSON.stringify(item));
    this.rightClicked = item.RouterLink;
  }
}
