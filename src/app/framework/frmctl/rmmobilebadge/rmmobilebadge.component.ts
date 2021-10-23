import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'rmmobilebadge',
  templateUrl: './rmmobilebadge.component.html',
  styleUrls: ['./rmmobilebadge.component.css']
})
export class RmmobilebadgeComponent implements OnInit {

  @Input() badgenumber: number;
  @Input() iconStyle: number;

  constructor() { }

  ngOnInit() {
  }

}
