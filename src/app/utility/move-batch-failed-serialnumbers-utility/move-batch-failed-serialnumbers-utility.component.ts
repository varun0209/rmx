import { Component, OnInit } from '@angular/core';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';


@Component({
  selector: 'app-move-batch-failed-serialnumbers-utility',
  templateUrl: './move-batch-failed-serialnumbers-utility.component.html',
  styleUrls: ['./move-batch-failed-serialnumbers-utility.component.css']
})
export class MoveBatchFailedSerialnumbersUtilityComponent implements OnInit {

  constructor(
    private masterPageService: MasterPageService) { }

  ngOnInit() {
    this.masterPageService.setModule(null);
  }


}
