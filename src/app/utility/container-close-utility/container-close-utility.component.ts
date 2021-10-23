import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppErrorService } from './../../utilities/rlcutl/app-error.service';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';

@Component({
  selector: 'app-container-close-utility',
  templateUrl: './container-close-utility.component.html',
  styleUrls: ['./container-close-utility.component.css']
})
export class ContainerCloseUtilityComponent implements OnInit, OnDestroy {

  constructor(private appErrService: AppErrorService, private masterPageService: MasterPageService) { }

  ngOnInit() {
     this.masterPageService.setModule(null);    
  }

  ngOnDestroy(){
    this.masterPageService.moduleName.next(null);
    this.masterPageService.hideModal();
  }

}
