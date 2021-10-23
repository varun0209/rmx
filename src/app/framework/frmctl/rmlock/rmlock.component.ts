import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'rmlock',
  templateUrl: './rmlock.component.html',
  styleUrls: ['./rmlock.component.css']
})
export class RmlockComponent implements OnInit, OnChanges, ControlValueAccessor {

  // @Input() togglelblClass:string;
  // @Input() togglelblClassLabel:string;

  isLocked: boolean = false;
  @Input() lockMode: boolean = false;
  @Input() isInputValueExist: boolean = false;
  @Input() isShowRmLock: boolean = false;
  @Output() onModeChange = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(){
    if(this.lockMode){
      this.isLocked = true;
    }else{
      this.isLocked = false;
    }
  }
 
  ontoggle() {
    if(this.isInputValueExist){
      this.isLocked = !this.isLocked;
      this.onModeChange.emit(this.isLocked);
    }    
  }
  writeValue(value: any) { }

  registerOnChange(fn: any) { }

  registerOnTouched() { }

}