import { Component, OnInit, OnDestroy, TemplateRef, ViewChild, Optional, Inject } from '@angular/core';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';
import { ClientData } from '../../models/common/ClientData';
import { UiData } from '../../models/common/UiData';
import { CommonEnum } from '../../enums/common.enum';
import { ApiConfigService } from '../../utilities/rlcutl/api-config.service';
import { ApiService } from '../../utilities/rlcutl/api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { String } from 'typescript-string-operations';
import { Grid } from '../../models/common/Grid';
import { AppService } from '../../utilities/rlcutl/app.service';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { CommonService } from '../../services/common.service';
import { OperationData, OperationConfigs, ParserHeader, ParserDetail, ParserServiceConfig } from '../../models/maintenance/operations/Operation';
import { StorageData } from '../../enums/storage.enum';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { EditOperationDialogComponent } from '../../dialogs/edit-operation-dialog/edit-operation-dialog.component';
import { AddOperationDialogComponent } from '../../dialogs/add-operation-dialog/add-operation-dialog.component';

@Component({
  selector: 'app-operations',
  templateUrl: './operations.component.html',
  styleUrls: ['./operations.component.css']
})
export class OperationsComponent implements OnInit, OnDestroy {
  // config 
  clientData = new ClientData();
  uiData = new UiData();
  commonEnum = CommonEnum;


  grid: Grid;
  distinctModules: any[];
  currentModuleSelected: any;

  operationData: OperationData;
  temOperationDataobj: OperationData;
  tempOperation = new OperationData();
  tempOperationConfig = new OperationConfigs();
  tempParserHeader = new ParserHeader();
  tempParserDetail: ParserDetail[];
  currentModule: string;
  searchOperationID: string;
  isSearchDisabled = true;
  appConfig: any;
  storageData = StorageData;

  emitHideSpinner: Subscription;

  constructor(
    public appErrService: AppErrorService,
    public masterPageService: MasterPageService,
    private apiConfigService: ApiConfigService,
    public apiService: ApiService,
    private spinner: NgxSpinnerService,
    public appService: AppService,
    private snackbar: XpoSnackBar,
    private commonService: CommonService,
    public dialog: MatDialog
  ) {
  }

  ngOnInit() {
    const operationObj = this.masterPageService.getRouteOperation();
    if (operationObj) {
      localStorage.setItem(this.storageData.module, operationObj.Module);
      this.appErrService.appMessage();
      this.uiData.OperationId = operationObj.OperationId;
      this.uiData.OperCategory = operationObj.Category;
      this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
      this.masterPageService.setTitle(operationObj.Title);
      this.masterPageService.setModule(operationObj.Module);
      this.appConfig = JSON.parse(localStorage.getItem(StorageData.appConfig));
      this.masterPageService.hideSpinner = true;
      this.emitHideSpinner = this.masterPageService.emitHideSpinner.subscribe(spinnerFlag => {
        if (!this.appService.checkNullOrUndefined(spinnerFlag) && spinnerFlag) {
          this.getDistintModules();
        }
      });
    }
    this.appService.setFocus('operatioid');
  }

  // To Get Distint Module
  getDistintModules() {
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getDistModules);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();

      this.distinctModules = [];
      if (statusFlag) {
        res.Response.Modules.forEach((element, idx) => {
          this.distinctModules.push({
            Name: element,
            GridId: element + idx,
            GridList: null
          });
        });
      }
    });
  }

  // Open Expansion by Selected Module
  getOperationByModule(module) {
    this.currentModuleSelected = module;
    this.currentModule = module.Name;
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getOperationbyModule, module.Name);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        this.grid = new Grid();
        this.grid.EditVisible = true;
        if (this.appConfig.hasOwnProperty('operation') && this.appConfig.operation.hasOwnProperty('gridPageSize')) {
          this.grid.ItemsPerPage = this.appConfig.operation.gridPageSize;
        }
        this.grid.PaginationId = module.GridId;
        module.GridList = this.appService.onGenerateJson(res.Response.OperationsbyModule, this.grid);
      }
    });
  }

  // Get Operation By Category
  getOperationbyCategory(data) {
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, OperationByModule: data };
    const url = String.Join('/', this.apiConfigService.getOperationbyCategory);
    this.tempParserHeader = new ParserHeader();
    this.tempParserDetail = [];
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          this.operationData = res.Response.Operations;
          this.tempOperation = Object.assign({}, res.Response.Operations);
          this.tempOperationConfig = Object.assign({}, res.Response.Operations.OperationConfigs);
          if (res.Response.Operations.IsParserExists === CommonEnum.yes) {
            this.tempParserHeader = Object.assign({}, res.Response.Operations.ParserHeader);
            this.tempParserDetail = Object.assign({}, res.Response.Operations.ParserHeader.RX_PARSER_DETAILs);
          }
          this.masterPageService.openModelPopup(EditOperationDialogComponent, false, 'dialog-width-xl', {
            data: {
              "operationData": this.operationData,
              "appConfig": this.appConfig,
            }
          });
          this.masterPageService.dialogRef.componentInstance.emitSaveOperationData.subscribe((event) => {
            this.saveOperationData(event);
          });
        }
      }
    });
  }


  // Save Operation Data
  saveOperationData(event) {
    this.spinner.show();
    this.temOperationDataobj = <OperationData>event;
    if (this.temOperationDataobj.DESCRIPTION.toLocaleLowerCase() !== this.tempOperation.DESCRIPTION.toLocaleLowerCase()) {
      this.temOperationDataobj.IsModify = true;
    }
    if (!this.appService.IsObjectsMatch(this.temOperationDataobj.OperationConfigs, this.tempOperationConfig)) {
      this.temOperationDataobj.OperationConfigs.IsModify = true;
    }
    if (this.temOperationDataobj.IsParserExists === CommonEnum.yes) {
      if (!this.appService.IsObjectsMatch(this.temOperationDataobj.ParserHeader, this.tempParserHeader)) {
        if (this.temOperationDataobj.ParserHeader) {
          this.temOperationDataobj.ParserHeader.IsModify = true;
        }
      }
      if (!this.appService.IsObjectsMatch(this.temOperationDataobj.ParserHeader.RX_PARSER_DETAILs, this.tempParserDetail)) {
        if (this.temOperationDataobj.ParserHeader.RX_PARSER_DETAILs) {
          this.temOperationDataobj.ParserHeader.RX_PARSER_DETAILs.forEach(element => {
            element.IsModify = true;
          });
        }
      }
    }
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_OPERATION: this.temOperationDataobj };
    const url = String.Join('/', this.apiConfigService.updateOperationByCategory);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.masterPageService.hideDialog();
        this.getOperationByModule(this.currentModuleSelected);
        this.snackbar.success(res.StatusMessage);
      }
    });
  }

  // Add Operation
  addOperation(status?: any) {
    this.masterPageService.openModelPopup(AddOperationDialogComponent, false, 'dialog-width-xl', {
      data: {
        "appConfig": this.appConfig
      }
    })
    this.masterPageService.dialogRef.componentInstance.emitAddOperationData.subscribe((event) => {
      this.addOperationData(event);
    });
  }

  // Add Operation Data
  addOperationData(event) {
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_OPERATION: event };
    const url = String.Join('/', this.apiConfigService.addOperation);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        this.masterPageService.hideDialog();
      }
    });
  }

  // Operation code Search
  getOperation() {
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getOperation, this.searchOperationID);
    this.spinner.show();
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          this.currentModule = res.Response.OperationByModule.MODULE;
          this.getOperationbyCategory(res.Response.OperationByModule);
          this.searchOperationID = '';
        }
      }
    });
  }

  changeInput() {
    if (this.searchOperationID) {
      this.isSearchDisabled = false;
    } else {
      this.isSearchDisabled = true;
    }
  }

  ngOnDestroy() {
    this.masterPageService.defaultProperties();
    this.emitHideSpinner.unsubscribe();
  }

}
