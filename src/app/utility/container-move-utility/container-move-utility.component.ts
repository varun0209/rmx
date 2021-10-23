import { MasterPageService } from './../../utilities/rlcutl/master-page.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppService } from '../../utilities/rlcutl/app.service';

@Component({
  selector: 'app-container-move-utility',
  templateUrl: './container-move-utility.component.html',
  styleUrls: ['./container-move-utility.component.css']
})
export class ContainerMoveUtilityComponent implements OnInit, OnDestroy {
  operationObj: any;

  constructor(private masterPageService: MasterPageService,
    private appService: AppService
  ) { }

  ngOnInit() {
    this.masterPageService.setModule(null);    
  }

  ngOnDestroy() {
    this.masterPageService.moduleName.next(null);
    this.masterPageService.hideModal();
      // localStorage.removeItem("operationObj");
  }

}
