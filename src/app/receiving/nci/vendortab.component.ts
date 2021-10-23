import { Component, Input, EventEmitter, Output } from "@angular/core";
import { ControlContainer, NgForm } from "@angular/forms";
import { MasterPageService } from "./../../utilities/rlcutl/master-page.service";
import { NciInfo } from "../../models/receiving/nci/NciInfo";

@Component({
  selector: "vendortab",
  templateUrl: "./vendortab.component.html",
  viewProviders: [{ provide: ControlContainer, useExisting: NgForm }]
})
export class VendortabComponent {
  @Input() NciInfo: NciInfo;
  @Input() vendorList: [];
  @Input() carrierOptions: [];
  @Input() isVendorDisabled: boolean;
  @Input() carrierSettings: {};
  @Input() carrierSelectedItem: [];
  @Input() carrierDisabled: boolean;
  @Input() isCarrierRefDisabled: boolean;

  @Output() onChangeVal = new EventEmitter();
  @Output() onSelect = new EventEmitter();
  @Output() onDeSelect = new EventEmitter();
  @Output() searchEventEmit = new EventEmitter();
  @Output() enter = new EventEmitter();

  constructor(public masterPageService: MasterPageService) {}

  changeVendor(event) {
    this.onChangeVal.emit(event);
  }

  changeCarrierType(event) {
    this.onSelect.emit(event);
  }

  carrierDeselect() {
    this.onDeSelect.emit();
  }

  getCarrierByRef(){
    this.enter.emit();
    this.searchEventEmit.emit();
  }
}
