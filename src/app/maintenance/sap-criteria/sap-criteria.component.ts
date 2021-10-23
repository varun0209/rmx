import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { dropdown } from '../../models/common/Dropdown';
import { StorageData } from '../../enums/storage.enum';
import { ClientData } from '../../models/common/ClientData';
import { UiData } from '../../models/common/UiData';
import { CommonService } from '../../services/common.service';
import { ApiConfigService } from '../../utilities/rlcutl/api-config.service';
import { ApiService } from '../../utilities/rlcutl/api.service';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';
import { AppService } from '../../utilities/rlcutl/app.service';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';
import { String } from 'typescript-string-operations';
import { SAPSearchObj, SapTransCriteria, SapMissedFields, SapFields } from '../../models/maintenance/sap-criteria-config/sap-criteria-config';
import { CommonEnum } from '../../enums/common.enum';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { MessageType } from '../../enums/message.enum';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { checkNullorUndefined } from '../../enums/nullorundefined';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-sap-criteria',
  templateUrl: './sap-criteria.component.html',
  styleUrls: ['./sap-criteria.component.css']
})
export class SapCriteriaComponent implements OnInit {
  @ViewChild('addSapCriteriaModel') addSapCriteriaModel: TemplateRef<any>;

  @ViewChild('feildsaddSapCriteriaModel') feildsaddSapCriteriaModel: TemplateRef<any>;
  
  @ViewChild('updateConfirmation') updateConfirmation: ElementRef;
  //model
  searchData = new SAPSearchObj();
  sapTransCriteria = new SapTransCriteria(); 
  sapChangeTypeFields = new SapFields();
  tempSapChangeTypeFields:SapFields;
  selectedSapTransCriteria: SapTransCriteria;
  tempSelectedSapTransCriteria: SapTransCriteria;
  sapChangeTypeMissedFields :SapMissedFields ; 
  

  clientData = new ClientData();
  uiData = new UiData();
  commonEnum = CommonEnum;

  searchArrey: any;
  isEditEnable = false;
  isEditFeildsEnable = false;
  isShowFeilds = false; 
  isClearBtnDisabled = true;
  isSearchBtnDisabled = false;
  isActiveToggaleEnable = false;
  searchedOperationid: string;
  searchedSAPChangeLevel: string;
  searchedSAPChangeType: string;
  operationidsList = [];
  sapChangeTypeList = [];
  sapChangeLevelList = [];
  updateSAPCriteria: any; 
  textBoxPattern: any;
  activestatus: any;
  resetrule:any;

  drowdownList: any;
  containerPopupMessage: any;

  ruleSetupObject: any;
  editruleSetup: any;

  @ViewChild('editRuleModel') editRuleModel: TemplateRef<any>;
  isDisableSaveFlag_Rule = true;
  isModalRuleOpen: boolean = false;
  emitHideSpinner: Subscription;
  modalRuleRef: any;

  constructor(public masterPageService: MasterPageService,
    public appErrService: AppErrorService,
    public apiService: ApiService,
    public appService: AppService,
    private apiConfigService: ApiConfigService,
    private commonService: CommonService,
    private snackbar: XpoSnackBar,
    private modalService: BsModalService,
    private spinner: NgxSpinnerService,
    private http: HttpClient,
    private dialog: MatDialog) {
    const pattern = JSON.parse(localStorage.getItem(StorageData.patternList));
    if (!this.appService.checkNullOrUndefined(pattern)) {
       this.textBoxPattern = new RegExp(pattern.namePattern);
      }

    this.emitHideSpinner = this.masterPageService.emitHideSpinner.subscribe(spinnerFlag => {
      if (!checkNullorUndefined(spinnerFlag) && spinnerFlag) {
        this.getOperationids();
      }
    });
     }

  ngOnInit() {
    this.masterPageService.hideSpinner = true;
    const operationObj = this.masterPageService.getRouteOperation();
    if (operationObj) { 
      this.uiData.OperationId = operationObj.OperationId;
      this.uiData.OperCategory = operationObj.Category;
      this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
      this.masterPageService.setTitle(operationObj.Title);
      this.masterPageService.setModule(operationObj.Module); 
      // this.getOperationids();
      // this.getSAPChnageTypeLevel();  
      //this.isClearBtnDisabled = true;    
    }        
  }

  // Add new criteria  
  addNewSapCriteria() {
    this.masterPageService.openModelPopup(this.addSapCriteriaModel, false, 'extra-large-modal') 
  }
  //missed fields popup
  addfeildsSapCriteria(){ 
    this.masterPageService.openModelPopup(this.feildsaddSapCriteriaModel, true, 'extra-large-modal')
    if (!this.masterPageService.hideModal) { 
      this.sapChangeTypeMissedFields = new SapMissedFields(); 
    } 
  }   

  getOperationids() {
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getOperationIDslist);
    this.commonService.commonApiCall(this.apiConfigService.getOperationIDslist, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        if (res.Response.OperationIDs.length) {
          res.Response.OperationIDs.forEach((element) => {
            let dd: dropdown = new dropdown();
            dd.Id = element.Id;
            dd.Text = element.Text;
            this.operationidsList.push(dd);            
          });
        }
        this.getSAPChnageTypeLevel();  
        this.spinner.hide(); 
      }
    });
  }

  getSAPChnageTypeLevel() {
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getLoadSAPFeildsData);
    this.commonService.commonApiCall(this.apiConfigService.getLoadSAPFeildsData, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        if (res.Response.SapChangeTypeList.length) {
          res.Response.SapChangeTypeList.forEach((element) => {
            let dd: dropdown = new dropdown();
            dd.Id = element;
            dd.Text = element;
            this.sapChangeTypeList.push(dd);
          });
        }
        if (res.Response.SapChangeLevelList.length) {
          res.Response.SapChangeLevelList.forEach((element) => {
            let dd: dropdown = new dropdown();
            dd.Id = element;
            dd.Text = element;
            this.sapChangeLevelList.push(dd);
          });
        }
        this.drowdownList = {
          operationidsList : this.operationidsList,
          sapChangeTypeList: this.sapChangeTypeList,
          sapChangeLevelList: this.sapChangeLevelList
        }        
      }
    });
  }

  feildsaddSapCriteriaData(event) {
    this.sapChangeTypeMissedFields = new SapMissedFields(); 
    const requestObj = { ClientData: this.clientData, UIData: this.uiData};
    const url = String.Join('/', this.apiConfigService.getSAPChaneTypeFeildsRule,this.selectedSapTransCriteria.SAP_CHANGE_TYPE);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();      
      if (statusFlag) {
        if (res.Response.TestResult) {
          this.sapChangeTypeFields = res.Response.TestResult;
          this.sapChangeTypeMissedFields = res.Response.MissedFeilds; 
          this.tempSapChangeTypeFields = JSON.parse(JSON.stringify(this.sapChangeTypeFields)); 
        }        
      }
    });  
  }

  onOperationChange(event) {    
    this.searchData.OPERATIONID = event.value;
    this.isClearBtnDisabled = false;
  }

  onChangeLevelChange(event) {    
    this.searchData.SAPCHANGELEVEL = event.value;
    this.isClearBtnDisabled = false;
  }

  onChangeTypeChange(event) {    
    this.searchData.SAPCHANGETYPE = event.value;
    this.isClearBtnDisabled = false;
  }

  getSearchData(){  
    this.isClearBtnDisabled = false;  
    this.isEditEnable = false;
    this.isEditFeildsEnable = false;
    this.sapTransCriteria = new SapTransCriteria();      
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, SAPCriteria: this.searchData };
    const url = String.Join('/', this.apiConfigService.getLoadSAPSearchData);
    this.commonService.commonApiCall(this.apiConfigService.getLoadSAPSearchData, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        if (res.Response.SapTransCriteria.length) {
          this.sapTransCriteria = res.Response.SapTransCriteria;
          this.searchArrey = res.Response.SapTransCriteria; 
        }        
      }
      else{
        this.isSearchBtnDisabled = false; 
        this.isClearBtnDisabled = false;
        this.searchData = new SAPSearchObj();
        this.searchArrey  = null;
        this.sapTransCriteria = new SapTransCriteria();  
      }
    });    
  }

  onToggleChange(val) { 
    this.selectedSapTransCriteria.ACTIVE = val ? CommonEnum.yes : CommonEnum.no;
  }
  onExpandClick(event){      
    this.isEditEnable = true;
    this.isShowFeilds = false;  
    this.isActiveToggaleEnable = false;  
    this.selectedSapTransCriteria = event;
    this.tempSelectedSapTransCriteria = JSON.parse(JSON.stringify(this.selectedSapTransCriteria));
    this.activestatus = event.ACTIVE;
    this.resetrule = event.RULE;
    this.sapChangeTypeMissedFields = new SapMissedFields();     
    const requestObj = { ClientData: this.clientData, UIData: this.uiData};
    const url = String.Join('/', this.apiConfigService.getSAPChaneTypeFeildsRule,event.SAP_CHANGE_TYPE);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => { 
      this.spinner.hide();
      if (statusFlag) {
        if (res.Response.TestResult) {
          this.sapChangeTypeFields = Object.assign(new SapFields(), res.Response.TestResult);
          this.sapChangeTypeMissedFields = res.Response.MissedFeilds;
          this.tempSapChangeTypeFields = JSON.parse(JSON.stringify(this.sapChangeTypeFields));
        }        
      }
      else{ 
        this.searchData = new SAPSearchObj();
        this.searchArrey  = null;        
      }
    }); 
  }
  onEditClick(event){
    this.isEditFeildsEnable = true;
    this.isShowFeilds = true;     
    this.isActiveToggaleEnable = true;
  }
  reset(event){
    this.sapChangeTypeMissedFields = new SapMissedFields(); 
    this.selectedSapTransCriteria.ACTIVE = this.activestatus;
    this.selectedSapTransCriteria.RULE = this.resetrule; 
    this.tempSelectedSapTransCriteria = JSON.parse(JSON.stringify(this.selectedSapTransCriteria));
    const requestObj = { ClientData: this.clientData, UIData: this.uiData};
    const url = String.Join('/', this.apiConfigService.getSAPChaneTypeFeildsRule,event.SAP_CHANGE_TYPE);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        if (res.Response.TestResult) {
          this.sapChangeTypeFields = res.Response.TestResult;
          this.sapChangeTypeMissedFields = res.Response.MissedFeilds; 
          this.tempSapChangeTypeFields = JSON.parse(JSON.stringify(this.sapChangeTypeFields));
        }        
      }
    }); 
  }
  onCancelClick(event){
    this.appErrService.clearAlert();
    this.isEditEnable = false;
    this.isEditFeildsEnable = false;
    this.isActiveToggaleEnable = false;
    this.selectedSapTransCriteria.ACTIVE = this.activestatus;
    this.selectedSapTransCriteria.RULE = this.resetrule; 
  }

  update(event){
    this.masterPageService.openModelPopup(this.updateConfirmation);
    }

  clear() { 
    this.appErrService.clearAlert();
    this.isClearBtnDisabled = true;
    this.isEditEnable = false; 
    this.searchData = new SAPSearchObj();
    this.searchArrey  = null;
    this.isActiveToggaleEnable = false;
  }

  editRule(editRuleModel) {    
    this.getAttributeRouteConfig(editRuleModel);  

  }

  getAttributeRouteConfig(editRuleModel) {   
    this.http.get('./assets/attributeRouteConfig.json').subscribe((res) => {
      this.ruleSetupObject = {
        clientData: this.clientData,
        uiData: this.uiData,
        attributeRoutingJson: res
      };
      this.editruleSetup = this.selectedSapTransCriteria.RULE;
      this.modalRuleRef = this.dialog.open(editRuleModel, { hasBackdrop: true, disableClose: true, panelClass:'modal-lg' })
      this.isModalRuleOpen = true;
      this.clientData = this.clientData;
    },
      () => {
        // 'Failed to load Attribute Config data'
        this.appErrService.setAlert(this.appService.getErrorText(3620001), false, MessageType.warning);
      });
  }

  // rule setup emit event to enable or disable add button and to assign rule
  emitEnableAddOrSave(event) {
    if (this.appService.checkNullOrUndefined(event)) { 
      this.isDisableSaveFlag_Rule = true;
    } else {
      this.selectedSapTransCriteria.RULE = event.Formula;
      if (event.ValidatedFormula) {
        this.isDisableSaveFlag_Rule = false;
        this.modalRuleRef.close();
      } else {
        this.isDisableSaveFlag_Rule = true;
      }
    }
  }

  hideRuleModal() {
    this.selectedSapTransCriteria.RULE = this.resetrule; 
    this.appErrService.clearAlert();  
    this.modalRuleRef.close();
  }

  confirmation(event) {
    if (this.appService.IsObjectsMatch(this.sapChangeTypeFields, this.tempSapChangeTypeFields) &&
        this.appService.IsObjectsMatch(this.selectedSapTransCriteria, this.tempSelectedSapTransCriteria)) {
      this.snackbar.info(this.appService.getErrorText('2660043'));
      this.masterPageService.hideModal();
      return;
    }
    const tempFields = new SapFields();
    tempFields.Fields = this.sapChangeTypeFields.Fields.filter(x => x.VALUE !== ''); 
    let url;
    let requestObj = { ClientData: this.clientData, UIData: this.uiData, SapFields:tempFields, RX_SAP_TRANS_CRITERIA:this.selectedSapTransCriteria };
    url = String.Join('/', this.apiConfigService.fieldsUpdate);
    this.spinner.show();    
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          if (res.Response.length) {
            this.masterPageService.hideModal();
            this.activestatus = this.selectedSapTransCriteria.ACTIVE;
            this.resetrule = this.selectedSapTransCriteria.RULE;

            //RESET FOR UPDATE STRINGS
            const requestObj = { ClientData: this.clientData, UIData: this.uiData};
            const url = String.Join('/', this.apiConfigService.getSAPChaneTypeFeildsRule,this.selectedSapTransCriteria.SAP_CHANGE_TYPE);
            this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
            this.spinner.hide();
            if (statusFlag) {
              if (res.Response.TestResult) {
                this.sapChangeTypeFields = res.Response.TestResult;
                this.sapChangeTypeMissedFields = res.Response.MissedFeilds; 
                this.tempSapChangeTypeFields = JSON.parse(JSON.stringify(this.sapChangeTypeFields));
              }        
            }
          }); 
            this.tempSelectedSapTransCriteria = JSON.parse(JSON.stringify(this.selectedSapTransCriteria));
            this.snackbar.success(res.StatusMessage);
          }
        }
      }
      else{}
    });
  }

  ngOnDestroy() {
    this.masterPageService.defaultProperties();
    this.emitHideSpinner.unsubscribe();
  }
}
