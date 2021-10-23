import { MasterPageService } from '../../utilities/rlcutl/master-page.service';
import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ApiService } from '../../utilities/rlcutl/api.service';
import { ApiConfigService } from '../../utilities/rlcutl/api-config.service';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';
import { MessagingService } from '../../utilities/rlcutl/messaging.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppService } from '../../utilities/rlcutl/app.service';
import { Grid } from '../../models/common/Grid';
import { RmtextboxComponent } from '../../framework/frmctl/rmtextbox/rmtextbox.component';
import { String } from 'typescript-string-operations';
import { MessageType } from '../../enums/message.enum';
import { Message } from '../../models/common/Message';
import { DockInfo } from '../../models/receiving/dockreceiving/DockInfo';
import { RmdatepickerComponent } from '../../framework/frmctl/rmdatepicker/rmdatepicker.component';
import { DatePipe } from '@angular/common';
import { ClientData } from '../../models/common/ClientData';
import { dropdown } from '../../models/common/Dropdown';
import { RmtextareaComponent } from '../../framework/frmctl/rmtextarea/rmtextarea.component';


@Component({
  selector: 'app-serialnumber-management',
  templateUrl: './serialnumber-management.component.html',
  styleUrls: ['./serialnumber-management.component.css']
})
export class SerialnumberManagementComponent implements OnInit {

  // Current Serial Number
  serialnum ="";
  iscurrentSerialnoDisabled:boolean =false;

  // New Serial Number
  newSerailNo ="";
  isNewSerialNoDisabled:boolean =false;
 
  dropdownList :any =[];

  rollback:any;
  isRollbackDisabled:boolean = false;
  isResoanDisabled:boolean = false;
  isCheckboxDisabled:boolean = false;
  reason:any;

  isAddDisabled:boolean;
  isClearDisabled:boolean;

  constructor( private masterPageService:MasterPageService, public appErrService: AppErrorService) { }
  @ViewChild(RmtextareaComponent) RmtextareaComponent: RmtextareaComponent;
  ngOnInit() {
    this.masterPageService.setTitle("Serial Number Management");
    this.masterPageService.setModule(null);
    this.getDropdown();
  }

  //getCarrier
  getDropdown() {
    let dropdown_list = [{Id: '1', text :'Rollback'},
                         {Id: '2', text :'ESNSwap'},
                         {Id: '3', text :'SKUTransfer'} 
    ]
        dropdown_list.forEach(element => {
        let dd: dropdown = new dropdown();
        dd.Id = element.Id;
        dd.Text = element.text;
        this.dropdownList.push(dd);
        });
  } 

  getReason(reason, inpcontrol: RmtextareaComponent) {
    
   this.reason = reason;
     
  }

  // Clear Data
  Clear(){
    this.serialnum ="";
    this.newSerailNo ="";
  }
  
}
