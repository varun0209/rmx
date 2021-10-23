import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { AppErrorService } from '../../../utilities/rlcutl/app-error.service';
import { MasterPageService } from '../../../utilities/rlcutl/master-page.service';
import { UiData } from '../../../models/common/UiData';
import { ClientData } from '../../../models/common/ClientData';
import { StorageData } from '../../../enums/storage.enum';
import { AppService } from '../../../utilities/rlcutl/app.service';
import { ApiConfigService } from '../../../utilities/rlcutl/api-config.service';
import { String } from 'typescript-string-operations';
import { NgxSpinnerService } from 'ngx-spinner';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { ApiService } from '../../../utilities/rlcutl/api.service';
import { StatusCodes } from '../../../enums/status.enum';
import { RmtextareaComponent } from '../../../framework/frmctl/rmtextarea/rmtextarea.component';

@Component({
  selector: 'app-capture-imei',
  templateUrl: './capture-imei.component.html',
  styleUrls: ['./capture-imei.component.css']
})
export class CaptureIMEIComponent implements OnInit, OnDestroy {

  @Input() tittle: string;

  showAlert = false;
  text = '';
  isClearDisabled = true;
  isSaveDisabled = true;
  operationObj: any;
  clientData = new ClientData();
  uiData = new UiData();
  scanSerialNoPattern: any;
  barCode: any;

  constructor(
    public appErrService: AppErrorService,
    public masterPageService: MasterPageService,
    private appService: AppService,
    private apiConfigService: ApiConfigService,
    private spinner: NgxSpinnerService,
    private snackbar: XpoSnackBar,
    private apiService: ApiService
  ) {
    const pattern = JSON.parse(localStorage.getItem(StorageData.patternList));
    if (!this.appService.checkNullOrUndefined(pattern)) {
      this.scanSerialNoPattern = new RegExp(pattern.scanSerialNoPattern);
    }
  }

  ngOnInit() {
    if (this.tittle) {
      this.operationObj = this.masterPageService.getOperationForPopUp(this.tittle);
    } else {
      this.operationObj = this.masterPageService.getRouteOperation();
      this.masterPageService.setTitle(this.operationObj.Title);
    }
    if (this.operationObj) {
      this.uiData.OperationId = this.operationObj.OperationId;
      this.uiData.OperCategory = this.operationObj.Category;
      this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
      this.masterPageService.setTitle(this.operationObj.Title);
      this.masterPageService.setModule(this.operationObj.Module);
    }
  }

  // change on serial number
  scanSerialNumber(event) {
    this.clearAlert();
    if (!this.appService.checkNullOrUndefined(event) && event != '') {
      this.isSaveDisabled = false;
    } else {
      this.isSaveDisabled = true;
    }
    this.isClearDisabled = this.isSaveDisabled ? true : false;
  }

  // clear serial number
  clear(inputcontrol?: RmtextareaComponent) {
    this.appService.setFocus('scanSerialNo');
    this.clearAlert();
    this.isSaveDisabled = true;
    this.isClearDisabled = true;
    this.barCode = '';
    if (!this.appService.checkNullOrUndefined(inputcontrol)) {
      inputcontrol.applyRequired(false);
    }
  }

  // save serial number
  save(inputcontrol?: RmtextareaComponent) {
    this.isSaveDisabled = true;
    this.spinner.show();
    this.clearAlert();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, TwoDBarcode: { Barcode: this.barCode } };
    const getReportImageUrl = String.Join('/', this.apiConfigService.insertESNMasterSN);
    this.apiService.apiPostRequest(getReportImageUrl, requestObj)
      .subscribe(response => {
        const res = response.body;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          this.snackbar.success(res.Response);
          this.clear();
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.isSaveDisabled = false;
          this.showAlert = true;
          this.text = res.StatusMessage;
          this.snackbar.error(res.StatusMessage);
          if (!this.appService.checkNullOrUndefined(inputcontrol)) {
            inputcontrol.applyRequired(true);
            inputcontrol.applySelect();
          }
        }
        this.spinner.hide();
      },
        error => {
          this.appErrService.handleAppError(error, false);
          this.showAlert = true;
          this.text = this.appErrService.emiterrorvalue;
          inputcontrol.applyRequired(true);
          inputcontrol.applySelect();
        });
  }

  // clear Alert
  clearAlert() {
    this.showAlert = false;
    this.text = '';
    this.appErrService.specialCharErrMsg = '';
  }

  ngOnDestroy() {
    this.masterPageService.defaultProperties();
  }

}
