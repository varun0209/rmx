import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { RmtextboxComponent } from '../../../framework/frmctl/rmtextbox/rmtextbox.component';
import { MasterPageService } from '../../../utilities/rlcutl/master-page.service';
import { AppErrorService } from '../../../utilities/rlcutl/app-error.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { ApiConfigService } from '../../../utilities/rlcutl/api-config.service';
import { ApiService } from '../../../utilities/rlcutl/api.service';
import { AppService } from '../../../utilities/rlcutl/app.service';
import { String } from 'typescript-string-operations';
import { ClientData } from '../../../models/common/ClientData';
import { UiData } from '../../../models/common/UiData';
import { TestingDevice } from '../../../models/testing/TestingDevice';
import { StorageData } from '../../../enums/storage.enum';
import { StatusCodes } from '../../../enums/status.enum';
import { checkNullorUndefined } from '../../../enums/nullorundefined';

@Component({
  selector: 'app-esn-swap',
  templateUrl: './esn-swap.component.html',
  styleUrls: ['./esn-swap.component.css']
})
export class EsnSwapComponent implements OnInit {

  isClearDisabled = false;
  clientData: ClientData;
  toSerialNumber: string;
  isSwapDisabled = true;

  @Input() isDisabledToSerialNumber = false;
  @Input() uiData: UiData;
  @Input() deviceMgmtDevice: TestingDevice;
  @Input() dmDevice: TestingDevice;

  @Output() emitReset = new EventEmitter();
  @Output() emitEsnDevice = new EventEmitter();
  @Output() clearSerialNumber = new EventEmitter();
  storageData = StorageData;
  statusCode = StatusCodes;
  controlConfig: any;

  constructor(
    public masterPageService: MasterPageService,
    public appErrService: AppErrorService,
    private spinner: NgxSpinnerService,
    private snackbar: XpoSnackBar,
    private apiConfigService: ApiConfigService,
    private apiService: ApiService,
    public appService: AppService,
  ) { }

  ngOnInit() {
    this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
    this.controlConfig = JSON.parse(localStorage.getItem(this.storageData.controlConfig));
  }


  // validateSerialNumber
  validateSwapSerialNumber(serialNumber, inpcontrol: RmtextboxComponent) {
    this.appErrService.clearAlert();
    this.spinner.show();
    let requestObj = { ClientData: this.clientData, UIData: this.uiData, Device: this.deviceMgmtDevice, DMDevice: this.dmDevice };
    const url = String.Join("/", this.apiConfigService.validateSwapSerialNumberUrl, serialNumber);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(res => {
        let result = res.body;
        if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) {
          if (!checkNullorUndefined(result.Response)) {
            this.deviceMgmtDevice = result.Response.Device;
            this.dmDevice = result.Response.DMDevice;
            this.isSwapDisabled = false;
            this.isDisabledToSerialNumber = true;
            this.swapFocus();
            this.spinner.hide();
          }
        }
        else  if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) { 
          this.isDisabledToSerialNumber = false;                    
          inpcontrol.applyRequired(true);
          inpcontrol.applySelect();
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
          this.spinner.hide();
        }
      },
      error => {
        this.appErrService.handleAppError(error);
      });
  }

  //swapSerialNumber
  swapSerialNumber() {
    this.appErrService.clearAlert();
    this.spinner.show();
    let requestObj = { ClientData: this.clientData, UIData: this.uiData, Device: this.deviceMgmtDevice, DMDevice: this.dmDevice };
    const url = String.Join("/", this.apiConfigService.swapSerialNumberUrl);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(res => {
        let result = res.body;
        if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) { 
          if (!checkNullorUndefined(result.Response)) {
            this.emitReset.emit();
            this.snackbar.success(result.Response);
            this.spinner.hide();
          }
        }
        else  if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) { 
          this.spinner.hide();
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
      error => {
        this.appErrService.handleAppError(error);
      });
  }

  swapFocus() {
    this.appService.setFocus('Swap');
  }


  esnTransfer() {
    let devices: any = {};
    devices.Device = this.deviceMgmtDevice
    devices.DMDevice = this.dmDevice;
    this.emitEsnDevice.emit(devices);
  }

  //Serial Number Focus
  serialNumberFocus() {
    this.appService.setFocus('serialNumber');
  }

  esnClear() {
    this.toSerialNumber = '';
    this.clearSerialNumber.emit();
    this.isClearDisabled = true;
    this.isSwapDisabled = true;
    this.isDisabledToSerialNumber = true;
  }

}
