import { Component, OnInit, forwardRef, Input, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import { RmtextboxComponent } from '../rmtextbox/rmtextbox.component';
import { Message } from '../../../models/common/Message';
import { MessageType } from '../../../enums/message.enum';
import { MessagingService } from '../../../utilities/rlcutl/messaging.service';
import { checkNullorUndefined } from '../../../enums/nullorundefined';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
declare var $: any;

@Component({
  selector: 'rmlistgroup',
  templateUrl: './rmlistgroup.component.html',
  styleUrls: ['./rmlistgroup.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RmlistgroupComponent),
      multi: true
    }],
  animations: [
    trigger('listState', [
      state('inactive', style({
        transform: 'translateX(-100%)'
      })),
      state('active', style({
        backgroundColor: '#cfd8dc',
        transform: 'translateX(100%)'
      })),
      transition('inactive => active', animate('100000ms ease-in')),
      transition('active => inactive', animate('100000ms ease-out'))
    ])
  ]
})

export class RmlistgroupComponent implements OnInit, ControlValueAccessor {
  showDetail: boolean = false;
  showGridList = false;
  hideListGroupScroll: boolean = false;

  @Input() listGroupItems: any[] = [];
  @Input() listgr = [];
  @Input() listDetailsHeading: string;
  @Input() isPopOverShown;
  listdata = [];
  listDetailsWrap: any;
  PopoverName: string;
  displayCarret: boolean;
  headingsobj = [];
  listGroupselectedRow = [];
  hideData = true;
  screenWidth: any;
  listDetails = [];
  headingsList = [];
  listDetailsHeadingValue: string;
  deletedData: string;
  ESNList = [];
  @Output() emitHideDetails = new EventEmitter();
  @Output() emitDeleteESNDetails = new EventEmitter();
  //messages
  messageNum: string;
  messageType: string;

  constructor(private snackbar: XpoSnackBar, private messagingService: MessagingService) {

  }

  ngOnInit() {
    localStorage.setItem("screenWidth", "");
    this.screenWidth = ((window.screen.width));
    localStorage.setItem("screenWidth", this.screenWidth);
    this.listGroupItems = this.listgr;
    this.listDetailsWrap = "listDetailsWrapID";
    this.PopoverName = "delete";
  }

  sendChildListGroup(gridData) {
    this.listGroupItems = [];
    this.listGroupItems = gridData;
    if (this.listGroupItems.length > 0) {
      this.headingsobj = [];
      this.headingsobj = Object.keys(this.listGroupItems[0]);
    }
    if (this.listGroupItems.length > 0) {
      this.showGridList = true;
    }
  }

  ESNListDetails(listdata) {
    this.listDetails = [];
    this.listDetails = listdata;
    if (this.listDetails.length > 0) {
      this.headingsList = [];
      this.headingsList = Object.keys(this.listDetails[0]);
    }
  }
  deleteESNItem(data: any, inpcontrol: RmtextboxComponent) {
    if (!checkNullorUndefined(this.deletedData) && this.deletedData.trim() == data.SerialNumber) {
      {
        this.emitDeleteESNDetails.emit(this.deletedData.trim());
        this.deletedData = "";
        this.hidingControls();
      }
    }
    else {
      inpcontrol.applyRequired(true);
      inpcontrol.applySelect();
      let userMessage = new Message();
      this.messageNum = "2660044";
      this.messageType = MessageType.failure;
      userMessage = this.messagingService.SendUserMessage(this.messageNum, this.messageType);

      // this.snackbar.error("Invalid Serial Number");
      this.snackbar.error(userMessage.messageText);
    }
  }

  changeInput(inpcontrol: RmtextboxComponent) {
    inpcontrol.applyRequired(false);
  }

  listDeletePop() {
    this.isPopOverShown = false;
  }

  clearData() {
    this.deletedData = "";
  }
  writeValue(value: any) { }

  registerOnChange(fn: any) { }

  registerOnTouched() { }

  showListDetails(val?: string[]) {
    if (val !== undefined) {
      this.ESNList = this.listDetails.filter(s => s.ExternLineno == val['ExternLineno']);
      this.listDetailsHeadingValue = val[this.listDetailsHeading];
    }
    this.hidingControls();
  }

  //hiding controls
  hidingControls() {
    this.hideData = !this.hideData;
    this.emitHideDetails.emit(this.hideData);
    this.showDetail = !this.showDetail;
  }

}
