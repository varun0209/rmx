import { Component, OnInit, OnDestroy } from '@angular/core';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';

@Component({
  selector: 'app-capture-imei-utility',
  templateUrl: './capture-imei-utility.component.html',
  styleUrls: ['./capture-imei-utility.component.css']
})
export class CaptureImeiUtilityComponent implements OnInit, OnDestroy {

  constructor(private masterPageService: MasterPageService) { }

  ngOnInit() {
    this.masterPageService.setModule(null);
  }

  ngOnDestroy() {
    this.masterPageService.moduleName.next(null);
    this.masterPageService.hideModal();
  }

}
