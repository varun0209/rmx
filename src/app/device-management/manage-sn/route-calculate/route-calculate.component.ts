import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-route-calculate',
  templateUrl: './route-calculate.component.html',
  styleUrls: ['./route-calculate.component.css']
})
export class RouteCalculateComponent implements OnInit {

  @Output() emitClearRouteCal = new EventEmitter();
  @Output() emitProcessRoute = new EventEmitter();
  @Input() isProcessRouteDisabled = true;

  constructor() { }

  ngOnInit() {
  }

  clearRouteCal() {
    this.emitClearRouteCal.emit();
  }

  process() {
    this.emitProcessRoute.emit();
  }

}
