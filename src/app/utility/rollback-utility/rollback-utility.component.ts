import { Component, OnInit } from '@angular/core';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';

@Component({
  selector: 'app-rollback-utility',
  templateUrl: './rollback-utility.component.html',
  styleUrls: ['./rollback-utility.component.css']
})
export class RollbackUtilityComponent implements OnInit {

  // Inbound Container
  inboundContainer = "";
  isinboundcontainerDisabled:boolean =false;
  //Serial Number
  newSerailNo = "";
  isNewSerialNoDisabled:boolean =false;
  // Rollback Dropdown
  rollbackdropdown ="";
  isdropdownDisabled:boolean =false;
  //Outbound Container
  outboundContainer ="";
  isoutboundContainerDisabled:boolean =false;
  isClearDisabled:boolean;
  isAddDisabled: boolean;

  constructor(private masterPageService:MasterPageService, 
    private appErrService: AppErrorService) { }

  ngOnInit() {
    this.masterPageService.setTitle("Rollback");
    this.masterPageService.setModule(null);
  }

  changeInput(){
    this.appErrService.clearAlert();

  }



//  Clear Data 
Clear(){
  this.inboundContainer ="";
  this.newSerailNo ="";
  this.rollbackdropdown ="";
  this.outboundContainer ="";
} 
}
