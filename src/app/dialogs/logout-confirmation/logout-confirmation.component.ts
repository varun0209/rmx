import { Component, OnInit } from '@angular/core';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';

@Component({
  selector: 'app-logout-confirmation',
  templateUrl: './logout-confirmation.component.html',
  styleUrls: ['./logout-confirmation.component.css']
})
export class LogoutConfirmationComponent implements OnInit {

  constructor(private masterPageService: MasterPageService) { }

  ngOnInit(): void {
  }

  logout() {
    this.masterPageService.hideDialog();
    this.masterPageService.logout();
  }

}
