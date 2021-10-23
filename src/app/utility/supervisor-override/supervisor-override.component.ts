import { Component, OnInit } from '@angular/core';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';

@Component({
  selector: 'app-supervisor-override',
  templateUrl: './supervisor-override.component.html',
  styleUrls: ['./supervisor-override.component.css']
})
export class SupervisorOverrideComponent implements OnInit {
  isCodeDisable :boolean;
  code:any;
  constructor(private masterPageService: MasterPageService) { }

  ngOnInit() {
    this.masterPageService.setTitle("Supervisor Override");
    this.masterPageService.setModule(null);
  }
  ngOnDestroy() {
    this.masterPageService.categoryName = null;
    this.masterPageService.moduleName.next(null);
    this.masterPageService.hideModal();
  }

  changeInput(inputCode){
  }

  onControllerChange(inputCode){
  }

  validateCode(inputCode, event:any){
    
  }

}
