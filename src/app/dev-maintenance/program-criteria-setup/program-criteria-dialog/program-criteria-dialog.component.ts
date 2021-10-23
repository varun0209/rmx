import { Component, EventEmitter, Inject, OnInit, Optional, Output, ViewChild } from '@angular/core';
import { String } from 'typescript-string-operations';
import { ClientData } from '../../../models/common/ClientData';
import { UiData } from '../../../models/common/UiData';
import { RxData, RxRankWithin, ValuePair } from '../../../models/maintenance/program-criteria-setup/ProgramCriteriaClasses';
import { ApiConfigService } from '../../../utilities/rlcutl/api-config.service';
import { StorageData } from '../../../enums/storage.enum';
import { AppErrorService } from '../../../utilities/rlcutl/app-error.service';
import { AppService } from '../../../utilities/rlcutl/app.service';
import { MasterPageService } from '../../../utilities/rlcutl/master-page.service';
import { CommonService } from '../../../services/common.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonEnum } from '../../../enums/common.enum';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { Grid } from '../../../models/common/Grid';
import { DeleteConfirmationDialogComponent } from '../../../framework/frmctl/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { MessageType } from '../../../enums/message.enum';
import { TextCase } from '../../../enums/textcase.enum';
import { RuleSetupEditorComponent } from '../../../framework/busctl/rule-setup-editor/rule-setup-editor.component';
import { dropdown } from '../../../models/common/Dropdown';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-program-criteria-dialog',
  templateUrl: './program-criteria-dialog.component.html',
  styleUrls: ['./program-criteria-dialog.component.css']
})
export class ProgramCriteriaDialogComponent implements OnInit {
  @ViewChild('deleteModel') deleteModel; 
  textCase = TextCase;
  textboxPattern: RegExp;

  clientData: ClientData;
  uiData: UiData;
  rxData: RxData;

  appConfig: any;

  newPropertyId: string = '';
  newPropertyVal: string = '';
  newValue: string = '';
  assignValueList: ValuePair[] = [];
  grid: Grid;
  rmGridData: any;

  @ViewChild(RuleSetupEditorComponent) ruleSetupChild: RuleSetupEditorComponent;

  isDisableSaveFlag_Rule = true;
  isDisableSaveFlag = true;
  isEditing = false;

  valueList = [];
  selectedControlType: string = CommonEnum.controlType;

  @Output() emitConfirmation = new EventEmitter();

  constructor(public appService: AppService,
              public masterPageService: MasterPageService,
              public appErrService: AppErrorService,
              private apiConfigService: ApiConfigService,
              public commonService: CommonService,
              private http: HttpClient,
              private snackbar: XpoSnackBar,
              private spinner: NgxSpinnerService,
              // public dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) public data: any,
              ) { }

  ngOnInit(): void {
    this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
    this.appConfig = JSON.parse(localStorage.getItem(StorageData.appConfig));

    const pattern = JSON.parse(localStorage.getItem(StorageData.patternList));
    if (!this.appService.checkNullOrUndefined(pattern)) {
       this.textboxPattern = new RegExp(pattern.textboxPattern)
    }

    if (this.data) {
      this.clientData = this.data.clientData;
      this.uiData = this.data.uiData;
      this.rxData = this.data.rxData;

      const tempList = this.rxData.addEditRule.Assign_Values.split(";").filter(Boolean) // returns a list of property=value...
      this.assignValueList = [];
      tempList.forEach(value =>  { // i.e. property=value
        const pair = value.split("="); // i.e. {property, value}
        const listData = new ValuePair();
        listData.property = pair[0]; // property
        listData.value = pair[1]; // value
        this.assignValueList.push(listData);
      });

      this.grid = new Grid();
      this.grid.DeleteVisible = true;
      this.grid.ItemsPerPage = this.appConfig.programCriteria.assignValuesGrid_pageSize;
      this.grid.PaginationId = "assingValuePair";
      this.assignValueList.sort((a, b) => a.property.localeCompare(b.property) || a.value.localeCompare(b.value));
      this.rmGridData = this.appService.onGenerateJson(this.assignValueList, this.grid);

      this.appErrService.clearAlert();
    }

    this.getAttributeRouteConfig()
    this.getMaxRank()
    this.checkDisableSave();
  }

  getAttributeRouteConfig() {
    this.http.get('./assets/attributeRouteConfig.json').subscribe((res) => {
      this.ruleSetupChild.ruleSetupObject = {
        clientData: this.clientData,
        uiData: this.uiData,
        attributeRoutingJson: res
      };

      this.ruleSetupChild.clientData =this.clientData;
      this.ruleSetupChild.uiData = this.uiData;
      if (this.rxData){
        if (this.rxData.addEditRule.ProgramRuleId > 0) {
          this.ruleSetupChild.editruleSetup = this.rxData.addEditRule.ProgramRule;
          this.ruleSetupChild.validateRule(true);
        } else {
          this.ruleSetupChild.resetRuleSetupFromParent();
          this.ruleSetupChild.enableAttribute(true);
        }
      }
      

    },
      () => {
        // 'Failed to load Attribute Config data'
        this.appErrService.setAlert(this.appService.getErrorText(3620001), false, MessageType.warning);
      });
  }

  private checkDisableSave() {
    if (this.assignValueList.length > 0 &&
      this.rxData.addEditRule.OperationId &&
      this.rxData.addEditRule.Program_Name &&
      this.rxData.addEditRule.Program_Group &&
      this.rxData.addEditRule.Rank) {
        this.isDisableSaveFlag = false;
        return;
    }
    this.isDisableSaveFlag = true;
  }

  onToggleChange(val) {
    this.appErrService.clearAlert();
    this.rxData.addEditRule.Active = val ? CommonEnum.yes : CommonEnum.no;
    this.checkDisableSave()
  }

  getMaxRank() {
    // Don't call getMaxRank if we are editing.
    if (this.rxData.addEditRule.ProgramRuleId > 0) {
      return;
    }

    const rankWithin = new RxRankWithin();
    rankWithin.ProgramId = this.rxData.addEditRule.ProgramId ? this.rxData.addEditRule.ProgramId: -1
    rankWithin.ProgramRuleGroupId = this.rxData.addEditRule.ProgramRuleGroupId ? this.rxData.addEditRule.ProgramRuleGroupId : -1
    rankWithin.OperationId = this.rxData.addEditRule.OperationId ? this.rxData.addEditRule.OperationId : ""
    
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, RxRankWithin: rankWithin };
    var url = String.Join('/', this.apiConfigService.getMaxProgramRuleRank);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      this.rxData.addEditRule.Rank = 1;
      if (statusFlag){
        if (!this.appService.checkNullOrUndefined(res.Response) && res.Response.MaxProgramRuleRank) {
          this.rxData.addEditRule.Rank = res.Response.MaxProgramRuleRank + 1;
        }
      }
    });
  }

  changedProgramName(event) {
    this.appErrService.clearAlert();
    this.rxData.addEditRule.ProgramId = event.value;

    var hold = this.rxData.programNameList.find((x) => x.Id == event.value);
    if (hold) {
      this.rxData.addEditRule.Program_Name = hold.Text;
    }

    this.getMaxRank()
    this.checkDisableSave()
  }

  changedProgramGroup(event) {
    this.appErrService.clearAlert();
    this.rxData.addEditRule.ProgramRuleGroupId = event.value;

    var hold = this.rxData.programNameList.find((x) => x.Id == event.value);
    if (hold) {
      this.rxData.addEditRule.Program_Group = hold.Text;
    }

    this.getMaxRank()
    this.checkDisableSave()
  }

  changedOperationId(event) {
    this.appErrService.clearAlert();
    this.rxData.addEditRule.OperationId = event.value;

    var operation = this.rxData.operationList.find((x) => x.Id == event.value);
    if (operation) {
      this.rxData.addEditRule.OperationName = operation.Text;
    }

    this.getMaxRank()
    this.checkDisableSave()
  }

  changedRank(event) {
    this.appErrService.clearAlert();
    this.rxData.addEditRule.Rank = event.value;
    this.checkDisableSave()
  }
  changedDescription() {
    this.appErrService.clearAlert();
    this.checkDisableSave()
  }

  changedNewProperty(event) {
    this.appErrService.clearAlert();

    const selectedAttribute = this.rxData.attributeMasterList.find(el => el.ATTRIBUTEID === event.value);
    if (!selectedAttribute)
      return;

    this.newPropertyId = selectedAttribute.ATTRIBUTEID;
    this.newPropertyVal = selectedAttribute.ATTR_PROPERTY

    this.valueList = [];
    this.selectedControlType = CommonEnum.controlType;

    const cache = this.rxData.cached.find(x => x.key == this.newPropertyId);
    if (cache) {
      this.valueList = cache.data; // Object.assign({}, cache.data);
      this.selectedControlType = 'DROPDOWN';
      return;
    }

    this.spinner.show();
    // call api to get the Values if not text
    const attribute = { [CommonEnum.attributeID]: selectedAttribute.ATTRIBUTEID };
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_ATTRIBUTE_MASTER: attribute };
    const url = String.Join('/', this.apiConfigService.getAttributeControlNValue);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          if (!this.appService.checkNullOrUndefined(res.Response.Value) && res.Response.Value.length > 0) {
            
            res.Response.Value.forEach(element => {
              const dd = new dropdown();
              dd.Id = element;
              dd.Text = element;
              this.valueList.push(dd);
            });
          }

          if (!this.appService.checkNullOrUndefined(res.Response.ControlType)) {
            this.selectedControlType = res.Response.ControlType;
          }

          if (this.selectedControlType === 'DROPDOWN' &&  this.valueList && this.valueList.length > 0) {
            this.rxData.cached.push({
              key: this.newPropertyId,
              data: this.valueList
            })
          }
        }
      }
    });

  }

  changedNewValue(event) {
    this.appErrService.clearAlert()
    this.newValue = event.value;
  }

  // rule setup emit event to enable or disable add button and to assign rule
  emitEnableAddOrSave_Rule(event) {
    this.appErrService.clearAlert();
    if (this.appService.checkNullOrUndefined(event)) {
      this.ruleSetupChild.editruleSetup = null;
      this.isDisableSaveFlag_Rule = true;
    } else {
      this.rxData.addEditRule.ProgramRule = event.Formula;
      if(event.ValidatedFormula){
        this.isDisableSaveFlag_Rule = false;
      } else {
        this.isDisableSaveFlag_Rule = true;
      }
    }
  }

  setValue() {
    this.appErrService.clearAlert();

    const listData = new ValuePair()
    listData.property = this.newPropertyVal.trim();
    listData.value = this.newValue.trim();

    if (this.isEditing) {
      const pair = this.assignValueList.find(a => a.property === listData.property);
      pair.value = this.newValue;
      this.isEditing = false;
    } else if (this.assignValueList.find(a => a.property === listData.property)) {

      // "Cannot set duplicate properties"
      this.appErrService.setAlert(this.appService.getErrorText(3620002), false, MessageType.warning);
      return;
    } else {
      this.assignValueList.push(listData);
    }

    this.assignValueList.sort((a, b) => a.property.localeCompare(b.property));
    this.rmGridData = this.appService.onGenerateJson(this.assignValueList, this.grid);
    this.newPropertyVal = '';
    this.newPropertyId = '';
    this.newValue = '';
    this.checkDisableSave()
  }
  deleteGridItem(item) {
    this.appErrService.clearAlert();

  const dialogRef = this.masterPageService.openModelPopup(DeleteConfirmationDialogComponent, false, 'dialog-width-sm')
    this.masterPageService.dialogRef.componentInstance.emitConfirmation.subscribe((value) => {
      dialogRef.close();
      const obj = item as ValuePair;
      const index = this.assignValueList.findIndex(a => a.property === obj.property)
      this.assignValueList.splice(index, 1);
      this.assignValueList.sort((a, b) => a.property.localeCompare(b.property));
      this.rmGridData = this.appService.onGenerateJson(this.assignValueList, this.grid);

      this.checkDisableSave();
    });
  }

  onSaveDialog() {
    this.spinner.show();

    let tempVal = "";
    this.assignValueList.forEach( item => {
      if (tempVal !== '')
        tempVal += ';'
      tempVal += item.property + '=' + item.value;
    });
    this.rxData.addEditRule.Assign_Values = tempVal;

    const requestObj = { ClientData: this.clientData, UIData: this.uiData, RxProgramRuleData: this.rxData.addEditRule };
    let url = String.Join('/', this.apiConfigService.saveProgramRule);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();

      if (statusFlag){
        if (!this.appService.checkNullOrUndefined(res.Response) && res.Response.ProgramRuleId) {
          this.emitConfirmation.emit( { "ProgramRule": this.rxData.addEditRule, "ProgramRuleId": res.Response.ProgramRuleId })
        }
        return;
      } 
    });
  }
}
