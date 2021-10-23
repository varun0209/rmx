import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppErrorService } from '../../../utilities/rlcutl/app-error.service';
import { MasterPageService } from '../../../utilities/rlcutl/master-page.service';
import { ApiConfigService } from '../../../utilities/rlcutl/api-config.service';
import { ApiService } from '../../../utilities/rlcutl/api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppService } from '../../../utilities/rlcutl/app.service';
import { CommonService } from '../../../services/common.service';
import { StorageData } from '../../../enums/storage.enum';
import { ClientData } from '../../../models/common/ClientData';
import { UiData } from '../../../models/common/UiData';
import { RuleSetupEditorComponent } from '../../../framework/busctl/rule-setup-editor/rule-setup-editor.component';
import { MessageType } from '../../../enums/message.enum';
import { ThrowStmt } from '@angular/compiler';

@Component({
  selector: 'app-addrule-dialog',
  templateUrl: './addrule-dialog.component.html',
  styleUrls: ['./addrule-dialog.component.css']
})
export class AddruleDialogComponent implements OnInit {
  @Output() emitConfirmation = new EventEmitter();
  @ViewChild(RuleSetupEditorComponent) ruleSetupChild: RuleSetupEditorComponent;
  data: string;
  rule: string;
  ruleSetupObject: any; 
  editruleSetup: any;
  clientData = new ClientData();
  uiData = new UiData();
  isDisableSaveFlag_Rule = true;
  isModalRuleOpen: boolean = false;
  constructor(
    public appErrService: AppErrorService,
    public masterPageService: MasterPageService,
    private apiConfigService: ApiConfigService,
    public apiService: ApiService,
    private spinner: NgxSpinnerService,
    public appService: AppService,
    private commonService: CommonService,
    private http: HttpClient
  ) { }

  ngOnInit() {
    const operationObj = this.masterPageService.getRouteOperation();
    this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
    this.uiData.OperationId = operationObj.OperationId;
    this.uiData.OperCategory = operationObj.Category;
    if (this.data) {
      this.rule = this.data;
    }
    this.getAttributeRouteConfig();
  }

  getAttributeRouteConfig() {
    this.http.get('./assets/attributeRouteConfig.json').subscribe((res) => {
      this.ruleSetupObject = {
        clientData: this.clientData,
        uiData: this.uiData,
        attributeRoutingJson: res
      };

      if (this.appService.checkNullOrUndefined(this.rule) === false && this.rule !== '') {
        this.ruleSetupChild.editruleSetup = this.rule; 
      } else {
        this.ruleSetupChild.resetRuleSetupFromParent();
        this.ruleSetupChild.enableAttribute(true);
      }
    },
      () => {
        // 'Failed to load Attribute Config data'
        this.appErrService.setAlert(this.appService.getErrorText(3620001), false, MessageType.warning);
      });
  }
  emitEnableAddOrSave(event) {
    if (this.appService.checkNullOrUndefined(event)) { 
    } else { 
      this.rule = event.Formula;
      if (event.ValidatedFormula) { 
        this.emitConfirmation.emit(event.Formula); 
      } else { 
      }
    }
  }

}
