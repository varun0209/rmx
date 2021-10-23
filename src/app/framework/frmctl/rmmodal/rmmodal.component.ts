import { Component, OnInit, forwardRef, Input, Output, TemplateRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';

@Component({
  selector: 'rmmodal',
  templateUrl: './rmmodal.component.html',
  styleUrls: ['./rmmodal.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RmmodalComponent),
      multi: true
    }]
})
export class RmmodalComponent implements OnInit {
  title: string;
  closeBtnName: string;
 
  constructor(public bsModalRef: BsModalRef) {}
 
  ngOnInit() {
    
  }

}
