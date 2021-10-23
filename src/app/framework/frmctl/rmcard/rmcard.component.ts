import { Component, OnInit, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'rmcard',
  templateUrl: './rmcard.component.html',
  styleUrls: ['./rmcard.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RmcardComponent),
      multi: true
    }]
})
export class RmcardComponent implements OnInit, ControlValueAccessor {

  @Input() cardHeader: string;
  @Input() cardFooter: string;
  @Input() cardTitle: string;
  @Input() cardBody: string;
  @Input() cardLink: string;
  @Input() cardAnotherLink: string;
  @Input() src: string;
  @Input() alt: string;
  @Input() listGroupItems: any;

  constructor() { }

  ngOnInit() {
  }

  writeValue(value: any) {}

  registerOnChange(fn: any) {}

  registerOnTouched() {}

}
