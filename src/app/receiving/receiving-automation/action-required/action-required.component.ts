import { AppService } from './../../../utilities/rlcutl/app.service';
import { CommonService } from './../../../services/common.service';
import { UiData } from './../../../models/common/UiData';
import { MasterPageService } from './../../../utilities/rlcutl/master-page.service';
import { ApiConfigService } from './../../../utilities/rlcutl/api-config.service';
import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { ClientData } from '../../../models/common/ClientData';
import { StorageData } from '../../../../app/enums/storage.enum';
import { checkNullorUndefined } from '../../../enums/nullorundefined';
import { String } from 'typescript-string-operations';

@Component({
  selector: 'receiving-action-required',
  templateUrl: './action-required.component.html',
  styleUrls: ['./action-required.component.css']
})
export class ActionRequiredComponent implements OnInit {
  //client Control Labels
  clientData = new ClientData();
  uiData = new UiData();
  deviceId: string = '';


  constructor(private commonService: CommonService,
    private apiConfigService: ApiConfigService,
    private spinner: NgxSpinnerService,
    private snackbar: XpoSnackBar,
    private appService: AppService,
    public masterPageService: MasterPageService) {
  }

  ngOnInit(): void {
    if (this.masterPageService.operationObj) {
      this.uiData.OperationId = this.masterPageService.operationObj.OperationId;
      this.uiData.OperCategory = this.masterPageService.operationObj.Category;
      this.deviceFocus();
      this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
    }
  }




  // update inbound detailes api
  actionComplete() {
    if (this.deviceId) {
      const requestObj = { ClientData: this.clientData, UIData: this.uiData };
      const url = String.Join('/', this.apiConfigService.actionComplete, this.deviceId);
      this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
        if (statusFlag) {
          this.spinner.hide();
          if (!checkNullorUndefined(res.Response)) {
            this.clear();
            this.snackbar.success(res.Response)
          }
        }
      });
    }
  }
  clear() {
    this.deviceId = '';
    this.deviceFocus();
  }

  deviceFocus() {
    this.appService.setFocus('deviceId');
  }
  actionFoucs() {
    this.appService.setFocus('action');
  }
}
