import { Component, EventEmitter, OnInit, Output, Injectable, Input } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { CommonService } from '../../../services/common.service';
import { ApiConfigService } from '../../../utilities/rlcutl/api-config.service';
import { ApiService } from '../../../utilities/rlcutl/api.service';
import { AppErrorService } from '../../../utilities/rlcutl/app-error.service';
import { AppService } from '../../../utilities/rlcutl/app.service';
import { MasterPageService } from '../../../utilities/rlcutl/master-page.service';
import { UiData } from '../../../models/common/UiData';
import { String } from 'typescript-string-operations';
import { StorageData } from '../../../enums/storage.enum';
import { SAPSearchObj, SapTransCriteria, SapChangeTypeKeyvalue, SapChangeTypeMissedKeyvalue, SapMissedFields, SapChangeTypeData } from '../../../models/maintenance/sap-criteria-config/sap-criteria-config';
import { ClientData } from '../../../models/common/ClientData';

@Component({
  selector: 'app-feildsaddsap-criteria',
  templateUrl: './feildsaddsap-criteria.component.html',
  styleUrls: ['./feildsaddsap-criteria.component.css']
})
export class FeildsaddsapCriteriaComponent implements OnInit {

  @Output() showEvent = new EventEmitter();
  @Input() sapChangeTypeMissedFields = new SapMissedFields(); 
  @Input() sapTransCriteria = new SapTransCriteria();
  clientData: ClientData = new ClientData();
  uiData: UiData = new UiData();
  sapChnageType = new SapChangeTypeData();
  textBoxPattern: any; 
  isMisFieldsSaveBtnDisabled = true;

  constructor(
    public appErrService: AppErrorService,
    public masterPageService: MasterPageService,
    private apiConfigService: ApiConfigService,
    public apiService: ApiService,
    private spinner: NgxSpinnerService,
    public appService: AppService,
    private snackbar: XpoSnackBar,
    private commonService: CommonService
  ) {
    const pattern = JSON.parse(localStorage.getItem(StorageData.patternList));
    if (!this.appService.checkNullOrUndefined(pattern)) {
       this.textBoxPattern = new RegExp(pattern.namePattern);
      }
  }

  ngOnInit() {
    const operationObj = this.masterPageService.getRouteOperation();
    this.uiData.OperationId = operationObj.OperationId;
    this.uiData.OperCategory = operationObj.Category;
    this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));    
  }
 
  onTextChanged(){
    if (this.sapChangeTypeMissedFields.Fields.filter(x => x.VALUE !== '')){
      this.isMisFieldsSaveBtnDisabled = false;
    }
    else{
      this.isMisFieldsSaveBtnDisabled = true;
    }
      
  }
  
  misfeildssave() {
    const tempMissedFields = new SapMissedFields();
    tempMissedFields.Fields = this.sapChangeTypeMissedFields.Fields.filter(x => x.VALUE !== '');
    if (tempMissedFields.Fields.length == 0){
      this.snackbar.info(this.appService.getErrorText('2660043'));
          this.spinner.hide();
          return;
    }
    this.sapChnageType.SAP_CHANGE_TYPE = this.sapTransCriteria.SAP_CHANGE_TYPE;    
    let url;
    // const tempMissedFields = new SapMissedFields();
    // tempMissedFields.Fields = this.sapChangeTypeMissedFields.Fields.filter(x => x.VALUE !== '');
    let requestObj = { ClientData: this.clientData, UIData: this.uiData, SapMissedFields:tempMissedFields, SapChangeTypeData: this.sapChnageType};
    url = String.Join('/', this.apiConfigService.addMisedFeildsUpdate);
    this.spinner.show();   
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();      
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          this.snackbar.success(res.StatusMessage);
          this.showEvent.emit(true);
        }
        this.masterPageService.hideModal();
      }
      else{}
    });
  }
  clear(event){
    this.isMisFieldsSaveBtnDisabled = true;
    this.sapChangeTypeMissedFields.Fields.forEach(element => {
      element.VALUE = '';
    });
   
  }
}
