import { Component } from '@angular/core';
import { MasterPageService } from './utilities/rlcutl/master-page.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(
    masterPageService: MasterPageService,
  ) {
    masterPageService.languageVariables();
  }
}
