import { NgxSpinnerService } from 'ngx-spinner';
import { TestingDevice } from './../../../models/testing/TestingDevice';
import { CommonService } from './../../../services/common.service';
import { ApiConfigService } from './../../../utilities/rlcutl/api-config.service';
import { UiData } from './../../../models/common/UiData';
import { AppService } from './../../../utilities/rlcutl/app.service';
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { StorageData } from '../../../enums/storage.enum';

@Component({
  selector: 'app-software-update',
  templateUrl: './software-update.component.html',
  styleUrls: ['./software-update.component.css']
})
export class SoftwareUpdateComponent implements OnInit {

  @Input() isDisabledSoftwareVersion = false;
  @Input() isProcessDisabled = true;
  @Input() uiData: UiData;
  @Input() deviceMgmt: TestingDevice;
  @Input() dmDevice: TestingDevice;
  @Input() controlConfig: any;
  @Output() clearSoftwareVersion = new EventEmitter();
  @Output() emitDevice = new EventEmitter();

  softwareVersion = '';
  isClearDisabled = false;
  clientData = JSON.parse(localStorage.getItem(StorageData.clientData));

  constructor(public appService: AppService,
    private apiConfigService: ApiConfigService,
    private commonService: CommonService,
    private spinner: NgxSpinnerService) { }

  ngOnInit() {

  }

  validateSoftwareVersion() {
    if (this.softwareVersion) {
      this.deviceMgmt.SoftwareVersion = this.softwareVersion;
      const requestObj = { ClientData: this.clientData, UIData: this.uiData, Device: this.deviceMgmt };
      this.commonService.commonApiCall(this.apiConfigService.validateSoftwareVersion, requestObj, (res, statusFlag) => {
        this.spinner.hide();
        if (statusFlag) {
          this.isProcessDisabled = false;
          this.isDisabledSoftwareVersion = true;
          this.processFocus();
        }
      });
    }
  }

  process() {
    const devices: any = {};
    devices.Device = this.deviceMgmt;
    devices.DMDevice = this.dmDevice;
    this.isProcessDisabled = true;
    this.emitDevice.emit(devices);
  }

  processFocus() {
    this.appService.setFocus('routeProcess');
  }


  softwareVersionClear() {
    this.softwareVersion = '';
    this.clearSoftwareVersion.emit();
    this.isClearDisabled = true;
    this.isProcessDisabled = true;
    this.isDisabledSoftwareVersion = true;
  }
}
