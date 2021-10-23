import { MasterPageService } from './../../../utilities/rlcutl/master-page.service';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-route-details',
  templateUrl: './route-details.component.html',
  styleUrls: ['./route-details.component.css']
})
export class RouteDetailsComponent implements OnInit {
 // @Input() operationsList = [];
  // @Input() nextRoutesList = [];
  // @Input() isNextRoutesDisabled = true;
  // @Input() RouteId: string;

  constructor(public masterPageService: MasterPageService) { }

  ngOnInit() {
  }

}