import { Component, OnInit } from '@angular/core';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';

@Component({
  selector: 'app-serialnumber-move',
  templateUrl: './serialnumber-move.component.html',
  styleUrls: ['./serialnumber-move.component.css']
})
export class SerialnumberMoveComponent implements OnInit {

  constructor(
     private masterPageService: MasterPageService) { }

  ngOnInit() {
    this.masterPageService.setModule(null);  
  }
}
