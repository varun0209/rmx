import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { CommonService } from '../../../services/common.service';
import { ApiConfigService } from '../../../utilities/rlcutl/api-config.service';
import { ApiService } from '../../../utilities/rlcutl/api.service';
import { AppErrorService } from '../../../utilities/rlcutl/app-error.service';
import { AppService } from '../../../utilities/rlcutl/app.service';
import { MasterPageService } from '../../../utilities/rlcutl/master-page.service';
import { NewSapCriteriaData, NewSapCriteriaFeildsData } from '../../../models/maintenance/sap-criteria-config/sap-criteria-config';
import { CommonEnum } from '../../../enums/common.enum';
import { ClientData } from '../../../models/common/ClientData';
import { UiData } from '../../../models/common/UiData';
import { StatusCodes } from '../../../enums/status.enum';
import { String } from 'typescript-string-operations';
import { StorageData } from '../../../enums/storage.enum';
import { HttpClient } from '@angular/common/http';
import { MessageType } from '../../../enums/message.enum';
import { RuleSetupComponent } from '../../../framework/busctl/rule-setup/rule-setup.component';
import { RuleSetupEditorComponent } from '../../../framework/busctl/rule-setup-editor/rule-setup-editor.component';
import { AddruleDialogComponent } from '../addrule-dialog/addrule-dialog.component';


@Component({
  selector: 'app-addsap-criteria',
  templateUrl: './addsap-criteria.component.html',
  styleUrls: ['./addsap-criteria.component.css']
})
export class AddsapCriteriaComponent implements OnInit {

  @Output() emitSubmitSapCriteria = new EventEmitter();
  @Input() set drowdownList(value) {
    this.operationidsList = value.operationidsList;
    this.sapChangeTypeList = value.sapChangeTypeList;
    this.sapChangeLevelList = value.sapChangeLevelList;
  }
  @ViewChild('editRuleModel') editRuleModel: TemplateRef<any>;
  @ViewChild(RuleSetupEditorComponent) ruleSetupChild: RuleSetupEditorComponent;

  isDisableSaveFlag_Rule = true;
  isModalRuleOpen: boolean = false;
  isNewActive : boolean = true;
  isSaveBtnDisabled = true;

  newSapCriteriaData = new NewSapCriteriaData();
  newSapCriteriaFeildsData = new NewSapCriteriaFeildsData();
  commonEnum = CommonEnum;
  clientData = new ClientData();
  uiData = new UiData(); 
  statusCode = StatusCodes;
  operationidsList = [];
  sapChangeTypeList = [];
  sapChangeLevelList = [];
  namePattern: any;
  rankPattern:any;
  quantityPattern:any;
  ruleSetupObject: any;
  editruleSetup: any;


  constructor(
    public appErrService: AppErrorService,
    public masterPageService: MasterPageService,
    private apiConfigService: ApiConfigService,
    public apiService: ApiService,
    private spinner: NgxSpinnerService,
    public appService: AppService,
    private snackbar: XpoSnackBar,
    private commonService: CommonService,
    private http: HttpClient,
  ) {
    const pattern = JSON.parse(localStorage.getItem(StorageData.patternList));
    if (!this.appService.checkNullOrUndefined(pattern)) {
      this.namePattern = new RegExp(pattern.namePattern);
      this.rankPattern = new RegExp(pattern.operationRankPattern); 
      this.quantityPattern = new RegExp(pattern.quantityPattern); 
    }
    this.newSapCriteriaData.ACTIVE = this.isNewActive ? CommonEnum.yes : CommonEnum.no;
  }

  ngOnInit() {
    const operationObj = this.masterPageService.getRouteOperation();
    this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
    this.uiData.OperationId = operationObj.OperationId;
    this.uiData.OperCategory = operationObj.Category;
  }
  onOperationChange(event) {
    this.newSapCriteriaData.OPERATIONID = event.value; 
  }

  onChangeLevelChange(event) {
    this.newSapCriteriaData.CHANGE_LEVEL = event.value; 
  }

  onChangeTypeChange(event) {
    this.newSapCriteriaData.SAP_CHANGE_TYPE = event.value; 
  }
  onToggleChange(val) {
    this.newSapCriteriaData.ACTIVE = val ? CommonEnum.yes : CommonEnum.no;
  }
  addnewsave() {
    this.appErrService.clearAlert();     
    let url;
    let requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_SAP_TRANS_CRITERIA: this.newSapCriteriaData, RX_SAP_EXPORT_QUEUE: this.newSapCriteriaFeildsData };
    url = String.Join('/', this.apiConfigService.addNewSAPCriteria);
    this.spinner.show();
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          if (res.Response.length) {
            this.masterPageService.hideModal();
            this.snackbar.success(res.StatusMessage);
          }
        }
      }
      else { }
    });
  }
  cancel() {
    this.masterPageService.hideModal();
    this.newSapCriteriaData = new NewSapCriteriaData();
    this.newSapCriteriaFeildsData = new NewSapCriteriaFeildsData();
    this.isNewActive = false;
  }
  clear() {
    this.newSapCriteriaData = new NewSapCriteriaData();
     this.newSapCriteriaFeildsData = new NewSapCriteriaFeildsData();
    this.isNewActive = true;
    this.newSapCriteriaData.ACTIVE = this.isNewActive ? CommonEnum.yes : CommonEnum.no;
    this.isSaveBtnDisabled = true; 
  }
  editRule(editRuleModel) {


    const dialogRef = this.masterPageService.openModelPopup(AddruleDialogComponent, false, 'dialog-width-xl', {
      data: {
        "data": this.newSapCriteriaData.RULE
      }
    })
    this.masterPageService.dialogRef.componentInstance.emitConfirmation.subscribe((value) => {
      dialogRef.close();
        if (value === "") {
          return;
        }      
        this.newSapCriteriaData.RULE = value;
        if(this.newSapCriteriaData.RULE )  {
          this.isSaveBtnDisabled = false;
        } else {
          this.isSaveBtnDisabled = true;
        }        
      })
    //original
    // this.masterPageService.openModelPopup(AddruleDialogComponent, false, 'extra-large-modal custom-modal', {data:this.newSapCriteriaData.RULE})
    // const dlgRef = this.masterPageService.modalRef;
    // dlgRef.content.emitConfirmation.subscribe((value) => {

    //   dlgRef.hide();
    //   if (value === "") {
    //     return;
    //   }      
    //   this.newSapCriteriaData.RULE = value;
    // })    
  }
}
