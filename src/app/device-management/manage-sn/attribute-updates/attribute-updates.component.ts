import { Component, OnInit, Input, OnChanges, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { MasterPageService } from '../../../utilities/rlcutl/master-page.service';
import { AppErrorService } from '../../../utilities/rlcutl/app-error.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiConfigService } from '../../../utilities/rlcutl/api-config.service';
import { ApiService } from '../../../utilities/rlcutl/api.service';
import { UiData } from '../../../models/common/UiData';
import { ClientData } from '../../../../app/models/common/ClientData';
import { String } from 'typescript-string-operations';
import { TestingDevice } from '../../../models/testing/TestingDevice';
import { AppService } from '../../../utilities/rlcutl/app.service';
import { StorageData } from '../../../enums/storage.enum';
import { StatusCodes } from '../../../enums/status.enum';
import { CommonService } from '../../../services/common.service';
import { DeviceModes } from '../../../enums/deviceManagment.enum';
import { CommonEnum } from '../../../enums/common.enum';
import { checkNullorUndefined } from '../../../enums/nullorundefined';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
@Component({
  selector: 'app-attribute-updates',
  templateUrl: './attribute-updates.component.html',
  styleUrls: ['./attribute-updates.component.css']
})
export class AttributeUpdatesComponent implements OnInit, OnChanges {

  @Input() attrDeviceMgmt = new TestingDevice();

  editDeviceData = [];
  isEnableDataElements = false;
  isDisableControls: boolean;

  @Input() uiData = new UiData();
  @Input() clientData = new ClientData();
  @Output() emitAttrDevice = new EventEmitter();
  @Output() clearAttribute = new EventEmitter();
  storageData = StorageData;
  statusCode = StatusCodes;

  constructor(
    public masterPageService: MasterPageService,
    public appErrService: AppErrorService,
    public commonService: CommonService,
    private spinner: NgxSpinnerService,
    private snackbar: XpoSnackBar,
    private apiConfigService: ApiConfigService,
    private apiService: ApiService,
    private appService: AppService

  ) {
    this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (Object.keys(this.attrDeviceMgmt).length) {
      this.getDataElements();
    }
  }

  changeInput(value, i, lableName?) {
    this.editDeviceData[i].newValue = value;
    if (lableName === DeviceModes.disposition || lableName === DeviceModes.IVCCode) {
      this.getIvcCodes(lableName, value);
    }
  }

  // getIvcCodes
  getIvcCodes(lableName, value) {
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getFilteredDataElementsVal, lableName, value);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        if (lableName === DeviceModes.disposition) {
          this.updateIvcList(res.Response);
        } else if (lableName === DeviceModes.IVCCode) {
          this.showCusCntl(res.Response);
        }
      } else {
        if (lableName === DeviceModes.disposition) {
          this.updateIvcList();
        } else if (lableName === DeviceModes.IVCCode) {
          this.showCusCntl();
        }
      }
    });
  }

  showCusCntl(res?) {
      this.editDeviceData.map(resp => {
        if (resp.hasOwnProperty('DependOn') && resp.DependOn === DeviceModes.IVCCode) {
          resp.ShowDefault = res && res.length ? true : false;
          resp.newValue = '';
        }
      });
  }

  updateIvcList(res?) {
    this.showCusCntl();
    this.editDeviceData.map(resp => {
      if (resp.lableName === DeviceModes.IVCCode) {
        resp.Values = res ? res : [];
        resp.newValue = resp.Values.find(ele => ele.Id === resp.DefaultValue) ? resp.DefaultValue : '';
      }
    });
  }

  onToggleChange(value, i) {
    this.editDeviceData[i].newValue = value ? CommonEnum.yes : CommonEnum.no;
  }

  onSaveDeviceData() {
    for (let a = 0; a < this.editDeviceData.length; a++) {
      for (const key in this.attrDeviceMgmt) {
        if (key === this.editDeviceData[a].PropertyName) {
          if (this.attrDeviceMgmt[key] instanceof Object) {
            this.attrDeviceMgmt[key][this.editDeviceData[a].SubPropertyName] = this.editDeviceData[a].newValue;
          } else if (!checkNullorUndefined(this.editDeviceData[a].newValue)) {
            this.attrDeviceMgmt[key] = this.editDeviceData[a].newValue;
          }
        }
      }
    }
    let devices: any = {};
    devices.Device = this.attrDeviceMgmt;
    this.emitAttrDevice.emit(devices);
  }

  //geOptions
  getDataElements() {
    this.spinner.show();
    let requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const getOptionsUrl = String.Join("/", this.apiConfigService.getDataElements, this.attrDeviceMgmt.SerialNumber);
    this.apiService.apiPostRequest(getOptionsUrl, requestObj)
      .subscribe(response => {
        let res = response.body;
        if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
          if (!checkNullorUndefined(res.Response)) {
            this.editDeviceData = res.Response;
            for (let a = 0; a < this.editDeviceData.length; a++) {
              for (let key in this.attrDeviceMgmt) {
                if (key === this.editDeviceData[a].PropertyName) {
                  if (this.attrDeviceMgmt[key] instanceof Object) {
                    this.editDeviceData[a].oldValue = this.attrDeviceMgmt[key][this.editDeviceData[a].SubPropertyName];
                    this.editDeviceData[a].lableName = this.editDeviceData[a].SubPropertyName;
                  } else {
                    this.editDeviceData[a].oldValue = this.attrDeviceMgmt[key];
                    this.editDeviceData[a].lableName = this.editDeviceData[a].PropertyName;
                  }
                  this.editDeviceData[a].newValue = this.editDeviceData[a].DefaultValue ? this.editDeviceData[a].DefaultValue : null;
                }
              }
            }
            this.isEnableDataElements = true;
            this.spinner.hide();
          }
        } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          this.spinner.hide();
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }

  //Serial Number Focus
  serialNumberFocus() {
    this.appService.setFocus('serialNumber');
  }


  attrClear() {
    this.editDeviceData = [];
    this.isEnableDataElements = false;
    this.isDisableControls = false;
    this.clearAttribute.emit();
  }

}