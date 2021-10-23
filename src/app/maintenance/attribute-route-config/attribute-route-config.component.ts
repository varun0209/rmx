import { RuleSetupComponent } from './../../framework/busctl/rule-setup/rule-setup.component';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { DropDownSettings } from './../../models/common/dropDown.config';
import { Component, OnInit, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';
import { ApiConfigService } from '../../utilities/rlcutl/api-config.service';
import { ApiService } from '../../utilities/rlcutl/api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';
import { AppService } from '../../utilities/rlcutl/app.service';
import { String } from 'typescript-string-operations';
import { ClientData } from '../../models/common/ClientData';
import { Grid } from '../../models/common/Grid';
import { Subscription } from 'rxjs';
import { UiData } from '../../models/common/UiData';
import { StorageData } from '../../enums/storage.enum';
import { StatusCodes } from '../../enums/status.enum';
import { EngineResult } from '../../models/common/EngineResult';
import { AttributeRoute } from '../../models/maintenance/attribute-route-config/attributeRoute';
import { Route } from '../../models/maintenance/attribute-route-config/route';
import { dropdown } from '../../models/common/Dropdown';
import { CommonEnum } from '../../enums/common.enum';
import { MessageType } from '../../enums/message.enum';
import { TypeaheadComponent } from '../../framework/frmctl/typeahead/typeahead.component';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { MatTable } from '@angular/material/table';
import { BsModalService } from 'ngx-bootstrap/modal';
import {DomSanitizer} from '@angular/platform-browser';
import {MatIconRegistry} from '@angular/material/icon';


@Component({
  selector: 'app-attribute-route-config',
  templateUrl: './attribute-route-config.component.html',
  styleUrls: ['./attribute-route-config.component.css']
})
export class AttributeRouteConfigComponent implements OnInit {

  @ViewChild(TypeaheadComponent) typeaheadChild: TypeaheadComponent;
  @ViewChild("routeFlow", { read: ElementRef }) public routeFlow: ElementRef<any>;
  @ViewChild('table', { static: true}) table: MatTable<AttributeRoute>;
  @ViewChild(RuleSetupComponent) ruleSetupChild: RuleSetupComponent;
  displayedColumns: string[] ;
  finalDisplayedColumns: string[];

  //client and common Control properties
  clientData = new ClientData();
  uiData = new UiData();
  operationObj: any;
  appConfig: any;
  emitHideSpinner: Subscription;
  commonButton = CommonEnum;
  grid: Grid;


  //attribute route properties
  isOperationIDDisabled: boolean = false;
  isResultRouteDisabled: boolean = false;
  isAttributeNameDisabled: boolean = false;
  isLogicalOperatorDisabled: boolean = true;
  isAttributeRouteRuleDisabled: boolean = true;
  isAttributeRouteToggleActive: boolean = false;
  isAttributeRouteResetBtnDisabled: boolean = true;
  isAttributeRouteSearchBtnDisabled: boolean = false;
  isValidateAttributeRouteAddBtnFlag: boolean = true;
  attributeRouteBtnName = this.commonButton.add;
  attributeRoute = new AttributeRoute();
  tempAttributeRoute = new AttributeRoute();
  attributeRouteOperationIDList: any[] = [];
  resultRoutesList: any[] = [];
  logicaloperatorOptions: any[] = [];
  attributeRouteList: any;
  tempAttributeRouteList: any;
  isEditAttributeRouteMode: boolean = false;
  isOperationIDSelected: boolean = false;
  isResultRouteSelected: boolean = false;
  isRankSelected: boolean = false;
  isAttributeRouteRankDisabled: boolean = false;


  resultRouteDropdownSettings: DropDownSettings;
  selectedResultRoute = [];
  attributeRouteConfig: any;
  index : number;
  devReviewEnable = CommonEnum.no;
  reOrderList = [];
  confirmRankList = [];
  operationText: any;
  originalReOrderList = [];
  isAttributeRouteRefreshBtnDisabled = true;
  isAttributeRouteReviewdDisable = true;
  isStepperNextDisabled = false;
  isStepperPreviosDisabled = true;
  modalRef: any;
  selectedAttributeRoute: any;
  selectedAttribueRouteIndex: any;
  isAttributeRouteMoveUpDisabled = true;
  isAttributeRouteMoveDownDisabled = true;
  previousRecordRank = 0;
  ruleSetupObject: any;
  editruleSetup: any;

  //route properties
  selectedRoute = new Route();
  tempSelectedRoute = new Route();
  routeAllOperationCodes: any[] = [];
  eligibleRoutes: any[] = [];
  routeTypeList: any[] = [];
  routeBtnName = this.commonButton.add;
  isRouteIdDisabled: boolean = false;
  isRouteTypeDisabled: boolean = false;
  isRouteIdSelected: boolean = false;
  isInActiveRouteSelected: boolean = false;
  isRoutetoggleActive: boolean = false;
  isValidateAddBtnFlag: boolean = true;
  isRouteResetBtnDisabled: boolean = true;
  isGenerateRouteIdBtnDisabled: boolean = false;
  isMoveRightDisabled: boolean = true;
  isRouteDescriptionDisabled = false;


  //lists Route inserting and rearranging control properties
  selectedRouteMainItem: any;
  selectedRouteTempItem: any;
  selectedRouteMainIndex: number;
  isRouteMainSelected: boolean;
  selectedRouteTempIndex: any;
  isRouteTempSelected: boolean;

  @ViewChild('searchInput') searchInput: ElementRef;

  constructor(private apiService: ApiService,
    private apiConfigService: ApiConfigService,
    private spinner: NgxSpinnerService,
    private snackbar: XpoSnackBar,
    private http: HttpClient,
    public appErrService: AppErrorService,
    public masterPageService: MasterPageService,
    private modalService: BsModalService,
    public appService: AppService) {
    //emitting hide spinner
    this.emitHideSpinner = this.masterPageService.emitHideSpinner.subscribe(spinnerFlag => {
      if (!this.appService.checkNullOrUndefined(spinnerFlag) && spinnerFlag) {
        this.getOperationList();
        this.getAQLTypesList();
      }
    });
  }


  ngOnInit() {
    this.operationObj = this.masterPageService.getRouteOperation();
    if (this.operationObj) {
      this.uiData.OperationId = this.operationObj.OperationId;
      this.uiData.OperCategory = this.operationObj.Category;
      this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
      //setting value to hidespinner (based on this value we are emiting emithidespinner method)
      this.masterPageService.hideSpinner = true;
      this.masterPageService.setTitle(this.operationObj.Title);
      this.masterPageService.setModule(this.operationObj.Module);
      this.appConfig = JSON.parse(localStorage.getItem(StorageData.appConfig));
      localStorage.setItem(StorageData.module, this.operationObj.Module);
      this.appErrService.appMessage();
      this.operationIDFocus();
      this.resultRouteSettings();
      this.getAttributeRouteConfig();
    }


  }

  // rule setup emit event to enable or disable add button and to assign rule
  emitEnableAddOrSave(event) {
    if (this.appService.checkNullOrUndefined(event)) {
      this.editruleSetup = null;
      this.isValidateAttributeRouteAddBtnFlag = true;
    } else {
      this.attributeRoute.RULE = event.Formula;
      if(event.ValidatedFormula){
        this.onValidationSuccess();
      } else{
        this.isValidateAttributeRouteAddBtnFlag = true;
      }
    }
  }

  // setting resultRoute DropdownSettings
  private resultRouteSettings() {
    this.resultRouteDropdownSettings = new DropDownSettings();
    this.resultRouteDropdownSettings.idField = CommonEnum.ID;
    this.resultRouteDropdownSettings.textField = CommonEnum.TEXT;
    this.resultRouteDropdownSettings.singleSelection = true;
  }

  // getAttributeRouteConfig
  getAttributeRouteConfig(){
    this.http.get('./assets/attributeRouteConfig.json').subscribe((res) => {
        this.attributeRouteConfig = res;
        this.index = this.attributeRouteConfig.rank.startingRank;
        this.displayedColumns = this.attributeRouteConfig.displayColumns;
        this.finalDisplayedColumns = this.attributeRouteConfig.finalDisplayColumns;
        this.ruleSetupObject = {
          clientData: this.clientData,
          uiData: this.uiData,
          attributeRoutingJson: this.attributeRouteConfig
        };
     },
      (error: HttpErrorResponse) => {
          this.snackbar.error('Failed to load Attribute Config data');
      });
  }

  //onSelect Attribute Route Tab
  onAttributeRouteSelectTab() {
    this.appErrService.clearAlert();
    this.operationIDFocus();
    this.getResultRoutes(true);
  }


  //onSelect Route Tab
  onRouteSelectTab() {
    this.appErrService.clearAlert();
    this.routeIDFocus();
  }

  /*Attribute Route Methods */
  //getOperations
  getOperationList() {
    this.spinner.show();
    this.attributeRouteOperationIDList = [];
    this.routeAllOperationCodes = [];
    let requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getRouteEligibleOpearationsList);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let result = response.body;

        if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
          if (!this.appService.checkNullOrUndefined(result.Response) && !this.appService.checkNullOrUndefined(result.Response.OperationCodesList) && result.Response.OperationCodesList.length) {
            this.routeAllOperationCodes = result.Response.OperationCodesList;
            result.Response.OperationCodesList.forEach((element) => {
              let dd: dropdown = new dropdown();
              dd.Id = element.ID;
              dd.Text = element.TEXT;
              this.attributeRouteOperationIDList.push(dd);
            });
          }
          this.getResultRoutes();
        }
        else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });

  }

  //getResultRoutes
  getResultRoutes(isTabChange = false) {
    this.resultRoutesList = [];
    let requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getResultRoutes);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let result = response.body;
        if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
          if (!this.appService.checkNullOrUndefined(result.Response) && !this.appService.checkNullOrUndefined(result.Response.ResultRoutesList) && result.Response.ResultRoutesList.length) {
            this.resultRoutesList = result.Response.ResultRoutesList;
          }
          if(!isTabChange){
            this.spinner.hide();
          }
        }
        else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });

  }

  //operationIDFocus
  operationIDFocus() {
    this.appService.setFocus('operationID');
  }

  //resultRouteFocus
  resultRouteFocus() {
    this.appService.setFocus('resultRoute');
  }

  //rankFocus
  rankFocus() {
    this.appService.setFocus('rank');
  }

  // on changing operationId
  changeOperationID(event) {
    this.appErrService.clearAlert();
    this.attributeRoute.OPERATIONID = event.value;
    const operation = this.attributeRouteOperationIDList.find( el => el.Id === this.attributeRoute.OPERATIONID);
    this.operationText  = operation.Text;
    this.isAttributeRouteResetBtnDisabled = false;
    this.isOperationIDSelected = true;
    if (this.isResultRouteSelected) {
      this.isAttributeRouteRankDisabled = false;
      this.rankFocus();
    } else {
      this.resultRouteFocus();
    }
    if (!this.isEditAttributeRouteMode) {
      this.isAttributeRouteSearchBtnDisabled = false;
    }
    if (this.isResultRouteSelected) {
      this.ruleSetupChild.resetRuleSetupFromParent();
      this.ruleSetupChild.enableAttribute(true);
      this.isValidateAttributeRouteAddBtnFlag = true;
    }
  }

  // on changing resultRoute
  changeResultRoute(event) {
    this.attributeRoute.RESULT_ROUTE = event.ID;
    this.isAttributeRouteSearchBtnDisabled = false;
    this.isAttributeRouteResetBtnDisabled = false;
    this.isResultRouteSelected = true;
    if (this.isOperationIDSelected) {
      this.isAttributeRouteRankDisabled = false;
      this.rankFocus();
    } else {
      this.operationIDFocus();
    }
    if (!this.isEditAttributeRouteMode) {
      this.isAttributeRouteSearchBtnDisabled = false;
    }
    if (this.isOperationIDSelected) {
      this.ruleSetupChild.resetRuleSetupFromParent();
      this.ruleSetupChild.enableAttribute(true);
      this.isValidateAttributeRouteAddBtnFlag = true;
    }
  }

  // on deselecting result route
  resultRouteDeselect() {
    this.selectedResultRoute = [];
    this.attributeRoute.RESULT_ROUTE = '';
    this.isResultRouteSelected = false;
    this.isValidateAttributeRouteAddBtnFlag = true;
    this.ruleSetupChild.resetRuleSetupFromParent();
    this.ruleSetupChild.enableAttribute(false);
  }

  // on Review change
  onReviewedChange(value) {
    this.attributeRoute.REVIEWED = value ? CommonEnum.yes : CommonEnum.no;
  }

  //search Attribute Route
  getAttributeRouteList(data?, template?) {
    this.isValidateAttributeRouteAddBtnFlag = true;
    this.spinner.show();
    this.appErrService.clearAlert();
    this.reOrderList = [];
    this.originalReOrderList = [];
    let searchObject = { OPERATIONID: this.attributeRoute.OPERATIONID, RESULT_ROUTE: this.attributeRoute.RESULT_ROUTE, ACTIVE : this.attributeRoute.ACTIVE };
    const search = data ? { OPERATIONID: data } : searchObject;
    let requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_ATTRIBUTE_ROUTE: search };
    const url = String.Join('/', this.apiConfigService.getAttributeRouteList);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let result = response.body;
        this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
          if (!this.appService.checkNullOrUndefined(result.Response)) {
            if (!this.appService.checkNullOrUndefined(result.Response.AttributeRouteList) && result.Response.AttributeRouteList.length > 0) {
              if (!data) {
                this.onProcessAttributeRouteJsonGrid(result.Response.AttributeRouteList);
                this.isAttributeRouteResetBtnDisabled = false;
                this.ruleSetupChild.resetRuleSetupFromParent();
                if(this.isOperationIDSelected && this.isResultRouteSelected) {
                  this.ruleSetupChild.enableAttribute(true);
                }
              } else {
                this.priorityChanges(result, template);
              }
            }
            if (!this.appService.checkNullOrUndefined(result.Response.roleCapabilities)) {
              if (!this.appService.checkNullOrUndefined(result.Response.roleCapabilities.devReviewEnable)) {
                this.devReviewEnable = result.Response.roleCapabilities.devReviewEnable;
              }
            }
          }
        }
        else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
          this.isValidateAttributeRouteAddBtnFlag = false;
          this.spinner.hide();
          this.attributeRouteList = null;
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }

  private priorityChanges(result: any, template: any) {
    this.index = this.attributeRouteConfig.rank.startingRank;
    this.reOrderList = result.Response.AttributeRouteList;
    this.reviwedToNo();
    if (this.isEditAttributeRouteMode) {
      const selectedAttributeRouteIndex = this.reOrderList.findIndex(el => el.SEQID == this.tempAttributeRoute.SEQID);
      this.reOrderList.splice(selectedAttributeRouteIndex, 1, this.attributeRoute);
    } else {
      this.reOrderList.push(this.attributeRoute);
    }
    const index = this.reOrderList.findIndex(el => el === this.attributeRoute);
    this.reAssignPriority();
    this.isAttributeRouteRefreshBtnDisabled = true;
    this.originalReOrderList = [...this.reOrderList];
    this.modalRef = this.modalService.show(template, { backdrop: 'static', keyboard: false,
    class: `full-width-modal modal-dialog-centered` });
    this.scrollIntoNewOrUpdatedRecord(index);
  }

  private scrollIntoNewOrUpdatedRecord(index: number) {
    if (this.isEditAttributeRouteMode) {
      index--;
    }
    window.setTimeout(function () {
      const element = document.getElementById(`tableScroll${index}`);
      if (element) {
        element.scrollIntoView();
      }
    }, 0);
  }

increment(currentRank) {
  if (!this.appService.checkNullOrUndefined(this.previousRecordRank) && currentRank === this.previousRecordRank) {
    return this.index;
  } else {
    this.index = this.index + this.attributeRouteConfig.rank.incrementGap;
    return this.index;
  }
}

  //onProcessAttributeRouteJsonGrid
  onProcessAttributeRouteJsonGrid(Response: AttributeRoute[]) {
    if (!this.appService.checkNullOrUndefined(Response)) {
      this.tempAttributeRouteList = [];
      let headingsArray = Object.keys(Response[0]);
      Response.forEach(res => {
        let element: AttributeRoute = new AttributeRoute();
        headingsArray.forEach(singleAttributeInfo => {
          element[singleAttributeInfo] = res[singleAttributeInfo];
        })
        this.tempAttributeRouteList.push(element);
      });
    }
    this.grid = new Grid();
    this.grid.EditVisible = true;
    this.attributeRouteList = this.appService.onGenerateJson(this.tempAttributeRouteList, this.grid);
  }

  //for editing attribute route
  editAttributeRoute(event) {
    this.appErrService.clearAlert();
    this.attributeRoute = new AttributeRoute();
    this.tempAttributeRoute = new AttributeRoute();
    this.attributeRoute = Object.assign(this.attributeRoute, event);
    this.tempAttributeRoute = Object.assign(this.tempAttributeRoute, event);
    this.editruleSetup = event.RULE;
    this.attributeRouteBtnName = this.commonButton.save;
    this.isAttributeRouteSearchBtnDisabled = true;
    this.isOperationIDDisabled = true;
    this.isResultRouteDisabled = true;
    this.isOperationIDSelected = true;
    this.isResultRouteSelected = true;
    this.isRankSelected = true;
    this.isValidateAttributeRouteAddBtnFlag = true;
    this.isAttributeRouteRankDisabled = false;
    this.isAttributeRouteSearchBtnDisabled = true;
    this.isEditAttributeRouteMode = true;
    this.selectedResultRoute = this.resultRoutesList.filter(e => e.ID === this.attributeRoute.RESULT_ROUTE);
    this.enableOrDisableDevReviewFlag();
  }

  private enableOrDisableDevReviewFlag() {
    if (this.devReviewEnable === CommonEnum.yes) {
      this.isAttributeRouteReviewdDisable = false;
    } else if (this.devReviewEnable === CommonEnum.no) {
      this.isAttributeRouteReviewdDisable = true;
    }
  }


  //validateRuleSuccessFrom RuleSetup
  onValidationSuccess() {
    this.isAttributeRouteSearchBtnDisabled = true;
    this.isValidateAttributeRouteAddBtnFlag = false;
    this.reviwedToNo();
  }

  // for adding or updating attribute route
  addOrUpdateAttributeRoute() {
    let attributeRouteList ;
  if (this.attributeRoute.REVIEWED === CommonEnum.yes && this.devReviewEnable === CommonEnum.yes) {
    attributeRouteList = [this.attributeRoute];
  } else {
    this.confirmRankList.forEach(element => {
      if (element.RANK !== element.PRIORITY) {
        element.RANK = element.PRIORITY;
      }
      delete element.POSITION;
      delete element.PRIORITY;
    });
    attributeRouteList = [...this.confirmRankList];
  }
    this.appErrService.clearAlert();
    this.spinner.show();
    if (this.modalRef) {
      this.modalRef.hide();
    }
    if (!this.appService.checkNullOrUndefined(attributeRouteList)) {
      this.isValidateAttributeRouteAddBtnFlag = true;
      const requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_ATTRIBUTE_ROUTES: attributeRouteList };
      this.apiService.apiPostRequest(this.apiConfigService.AddUpdateAttributeRule, requestObj)
        .subscribe(response => {
          const result = response.body;
          this.spinner.hide();
          if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
            if (!this.appService.checkNullOrUndefined(result.Response)) {
              if (!this.appService.checkNullOrUndefined(result.Response.AttributeRouteList)) {
                this.onProcessAttributeRouteJsonGrid(result.Response.AttributeRouteList);
                this.isEditAttributeRouteMode = false;
                this.clearAttributeRoute();
                this.isAttributeRouteResetBtnDisabled = false;
              }
              if (!this.appService.checkNullOrUndefined(result.StatusMessage)) {
                this.snackbar.success(result.StatusMessage);
              }
              if (!this.appService.checkNullOrUndefined(result.Response.roleCapabilities)) {
                if (!this.appService.checkNullOrUndefined(result.Response.roleCapabilities.devReviewEnable)) {
                  this.devReviewEnable = result.Response.roleCapabilities.devReviewEnable;
                }
              }
            }
          }
          else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
            this.isValidateAttributeRouteAddBtnFlag = false;
            this.attributeRouteList = null;
            this.spinner.hide();
            this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
          }
        },
          error => {
            this.appErrService.handleAppError(error);
          });
      this.isValidateAttributeRouteAddBtnFlag = true;
    }
  }

  // making reviwed to N for any change in record in edit mode
  private reviwedToNo() {
    if (this.isEditAttributeRouteMode) {
      if (!this.appService.IsObjectsMatch(this.attributeRoute, this.tempAttributeRoute)) {
        this.attributeRoute.REVIEWED = CommonEnum.no;
      }
    }
  }

  // reOrder
  reOrder(template) {
    this.selectedAttribueRouteIndex = undefined;
    this.isAttributeRouteMoveDownDisabled = true;
    this.isAttributeRouteMoveUpDisabled = true;
    if (this.attributeRoute.REVIEWED === CommonEnum.yes && this.devReviewEnable === CommonEnum.yes) {
      this.addOrUpdateAttributeRoute();
    } else {
      this.getAttributeRouteList(this.attributeRoute.OPERATIONID, template);
    }

  }

  // calling on selecting row
  onRowSelect(index) {
    this.selectedAttribueRouteIndex = index;
    this.selectedAttributeRoute = this.reOrderList[index];
    this.isAttributeRouteMoveUpDisabled = false;
    this.isAttributeRouteMoveDownDisabled = false;
  }

  //for moving list item upside
  moveUpAttribute() {
    if (!this.appService.checkNullOrUndefined(this.selectedAttribueRouteIndex)) {
      if (this.selectedAttribueRouteIndex > 0) {
        const movedItems = this.reOrderList.splice(this.selectedAttribueRouteIndex, 1)[0];
        this.reOrderList.splice(this.selectedAttribueRouteIndex - 1, 0, movedItems);
        this.selectedAttribueRouteIndex = this.reOrderList.findIndex((item) => item === movedItems);
        this.reAssignPriority();
      }
    }
  }

  // for moving list item downside
  moveDownAttribute() {
    if (!this.appService.checkNullOrUndefined(this.selectedAttribueRouteIndex)) {
      if (this.selectedAttribueRouteIndex < this.reOrderList.length - 1) {
        const movedItems = this.reOrderList.splice(this.selectedAttribueRouteIndex, 1)[0];
        this.reOrderList.splice(this.selectedAttribueRouteIndex + 1, 0, movedItems);
        this.selectedAttribueRouteIndex = this.reOrderList.findIndex((item) => item === movedItems);
        this.reAssignPriority();
      }
    }
  }

  // drop event on items
  dropTable(event: CdkDragDrop<any[]>) {
    const prevIndex = this.reOrderList.findIndex((d) => d === event.item.data);
    moveItemInArray(this.reOrderList, prevIndex, event.currentIndex);
    this.reAssignPriority();
  }

  // for Resassining priority for any up and down or drag change in table
  private reAssignPriority() {
    this.index = this.attributeRouteConfig.rank.startingRank;
    this.previousRecordRank = 0;
    for (const iterator of this.reOrderList) {
      iterator.PRIORITY = this.increment(iterator.RANK);
      iterator.POSITION = '';
      this.previousRecordRank = iterator.RANK;
    }
    this.isAttributeRouteRefreshBtnDisabled = false;
  }

  // resetReOrderList
  resetReOrderList() {
    this.reOrderList = [...this.originalReOrderList];
    this.reAssignPriority();
    this.isAttributeRouteRefreshBtnDisabled = true;
    this.selectedAttribueRouteIndex = undefined;
    this.isAttributeRouteMoveDownDisabled = true;
    this.isAttributeRouteMoveUpDisabled = true;
  }

  confirmList() {
    const tempList = [];
    this.confirmRankList = [];
    // on confrimation we are making to REVIWED to 'N' if Existing Rank and Current Rank are Not matched
    this.reOrderList.forEach(element => {
      if (element.RANK !== element.PRIORITY) {
       // element.REVIEWED = CommonEnum.no;
        tempList.push(element);
      }
    });
    this.confirmRankList = [...tempList];
    this.isStepperPreviosDisabled = false;
  }

  //clearing Attribute Route
  clearAttributeRoute() {
    this.attributeRoute = new AttributeRoute();
    this.tempAttributeRoute = new AttributeRoute();
    this.isAttributeRouteSearchBtnDisabled = false;
    this.isValidateAttributeRouteAddBtnFlag = true;
    this.isOperationIDDisabled = false;
    this.isResultRouteDisabled = false;
    this.isOperationIDSelected = false;
    this.isResultRouteSelected = false;
    this.isRankSelected = false;
    this.isAttributeRouteRankDisabled = false;
    this.isEditAttributeRouteMode = false;
    this.ruleSetupChild.resetRuleSetupFromParent();
    this.selectedResultRoute = [];
    this.appErrService.clearAlert();
    this.index = this.attributeRouteConfig.rank.startingRank;
    this.reOrderList = [];
    this.originalReOrderList = [];
    this.operationText = '';
    this.isAttributeRouteRefreshBtnDisabled = true;
    this.devReviewEnable = CommonEnum.no;
    this.isAttributeRouteReviewdDisable = true;
    this.selectedAttribueRouteIndex = undefined;
    this.isAttributeRouteMoveUpDisabled = true;
    this.isAttributeRouteMoveDownDisabled = true;
    this.confirmRankList = [];
  }


  //reset Attribute Route
  resetAttributeRoute() {
    this.attributeRoute = new AttributeRoute();
    this.attributeRouteList = null;
    this.tempAttributeRouteList = null;
    this.isOperationIDDisabled = false;
    this.isResultRouteDisabled = false;
    this.isOperationIDSelected = false;
    this.isResultRouteSelected = false;
    this.isRankSelected = false;
    this.attributeRouteBtnName = this.commonButton.add;
    this.isAttributeRouteResetBtnDisabled = true;
    this.clearAttributeRoute();
    this.operationIDFocus();
    this.editruleSetup = null;
  }

  /* Route Setup Methods */
  //getAQLTypesList
  getAQLTypesList() {
    this.spinner.show();
    this.routeTypeList = [];
    let requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getAQLTypesList);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let result = response.body;
        this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
          if (!this.appService.checkNullOrUndefined(result.Response) && !this.appService.checkNullOrUndefined(result.Response.SamplingTypes) && result.Response.SamplingTypes.length > 0) {
            result.Response.SamplingTypes.forEach((element) => {
              let dd: dropdown = new dropdown();
              dd.Id = element.ID;
              dd.Text = element.TEXT;
              this.routeTypeList.push(dd);
            });
          }
        }
        else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });

  }

  //on change route Type
  changeRouteType(val) {
    this.selectedRoute.RouteType = val;
    this.isRouteResetBtnDisabled = false;
  }


  //routeIDFocus
  routeIDFocus() {
    this.appService.setFocus('routeId');
  }

  onAttributeRouteActiveChange(value) {
    this.attributeRoute.ACTIVE = value ? CommonEnum.yes : CommonEnum.no;
    this.reviwedToNo();
  }

  //getting leftside list item
  getMainItem(index) {
    if (this.isRouteIdSelected && !this.isInActiveRouteSelected) {
      this.selectedRouteMainItem = this.routeAllOperationCodes[index];
      this.isMoveRightDisabled = false;
      this.selectedRouteMainIndex = index;
      this.isRouteMainSelected = true;
      this.isRouteTempSelected = false;
      this.isRouteResetBtnDisabled = false;
    }
  }

  //getting rightside list item
  getTempItem(index) {
    if(!this.isInActiveRouteSelected) {
      this.selectedRoute.OperationCodes.forEach(element => {
        element['isRouteMainSelected'] = false;
      });
      this.selectedRouteTempIndex = index;
      this.selectedRoute.OperationCodes[index].isRouteMainSelected = true;;
      this.isRouteTempSelected = true;
      this.isRouteMainSelected = false;
      this.selectedRouteMainIndex = null;
    }
  }

  //for moving list item from left to right
  moveRight() {
    if (!this.appService.checkNullOrUndefined(this.selectedRouteMainIndex)) {
      if (!this.appService.checkNullOrUndefined(this.selectedRoute.OperationCodes)) {
        this.selectedRoute.OperationCodes.push(JSON.parse(JSON.stringify(this.selectedRouteMainItem)));
        this.checkOperationCodesExist();
        this.isMoveRightDisabled = true;
      }
    }
  }



  //for deleting list item
  deleteItem(item, index) {
    if (!this.isInActiveRouteSelected) {
      this.selectedRoute.OperationCodes.splice(index, 1);
      this.checkOperationCodesExist();
    }
  }

  //for moving list item upside
  moveUp() {
    if (!this.isInActiveRouteSelected) {
      if (!this.appService.checkNullOrUndefined(this.selectedRouteTempIndex)) {
        if (this.selectedRouteTempIndex > 0) {
          let movedItems = this.selectedRoute.OperationCodes.splice(this.selectedRouteTempIndex, 1)[0];
          this.selectedRoute.OperationCodes.splice(this.selectedRouteTempIndex - 1, 0, movedItems);
          this.selectedRouteTempIndex = this.selectedRoute.OperationCodes.findIndex((item) => item == movedItems);
        }
      }
    }
  }

  //for moving list item downside
  moveDown() {
    if (!this.isInActiveRouteSelected) {
      if (!this.appService.checkNullOrUndefined(this.selectedRouteTempIndex)) {
        if (this.selectedRouteTempIndex < this.selectedRoute.OperationCodes.length - 1) {
          let movedItems = this.selectedRoute.OperationCodes.splice(this.selectedRouteTempIndex, 1)[0];
          this.selectedRoute.OperationCodes.splice(this.selectedRouteTempIndex + 1, 0, movedItems);
          this.selectedRouteTempIndex = this.selectedRoute.OperationCodes.findIndex((item) => item == movedItems);
        }
      }
    }
  }


  //on input of routeId immmediately
  onRouteIDChangeVal(value) {
    this.isRouteResetBtnDisabled = false;
    if (!this.appService.checkNullOrUndefined(value)) {
      this.selectedRoute.ROUTEID = value.toUpperCase().trim();
    } else {
      this.selectedRoute.ROUTEID = null;
    }
    this.routeBtnName = this.commonButton.add;
    this.appErrService.clearAlert();
    this.isValidateAddBtnFlag = true;
    this.getEligibleRoutes(this.selectedRoute.ROUTEID)
  }

  //getting Eligible Routes
  getEligibleRoutes(value) {
    if (!this.appService.checkNullOrUndefined(value) && value.length) {
      this.spinner.show();
      this.eligibleRoutes = [];
      let requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_ROUTE: this.selectedRoute };
      const url = String.Join('/', this.apiConfigService.getEligibleRoutes);
      this.apiService.apiPostRequest(url, requestObj)
        .subscribe(response => {
          let result = response.body;
          this.spinner.hide();
          if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
            if (!this.appService.checkNullOrUndefined(result.Response) && !this.appService.checkNullOrUndefined(result.Response.EligibleRoutesList) && result.Response.EligibleRoutesList.length > 0) {
              this.eligibleRoutes = result.Response.EligibleRoutesList;
              this.eligibleRoutes.map( el => el.TEXT = String.Join('-', el.TEXT, el.ID));
              if (!this.appService.checkNullOrUndefined(this.typeaheadChild)) {
                this.typeaheadChild.typeaheadOptionsLimit = this.eligibleRoutes.length;
              }
            }
          }
          else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
            if (!this.appService.checkNullOrUndefined(result.Response)) {
              this.spinner.hide();
              this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
            }
          }
        },
          error => {
            this.appErrService.handleAppError(error);
          });
    }
  }

  //Generate Route Id
  generateRouteID() {
    this.spinner.show();
    this.appErrService.clearAlert();
    this.selectedRoute.ROUTEID = '';
    let requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.generateRouteID);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let result = response.body;
        this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
          if (!this.appService.checkNullOrUndefined(result.Response) && !this.appService.checkNullOrUndefined(result.Response.routeID)) {
            this.selectedRoute.ROUTEID = result.Response.routeID;
            this.selectedRoute.OperationCodes = [];
            this.isRouteResetBtnDisabled = false;
            this.isRouteIdDisabled = true;
            this.isRouteIdSelected = true;
            this.isGenerateRouteIdBtnDisabled = true;
          }
        }
        else if (!this.appService.checkNullOrUndefined(result) && result.Status == StatusCodes.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }

  // calling immediately after selecting typeahead option
  typeaheadResponse(event) {
    this.selectedRoute.ROUTEID = event.item.ID;
    this.isRouteResetBtnDisabled = false;
    this.isGenerateRouteIdBtnDisabled = true;
    this.eligibleRoutes = [];
    this.getRouteList();
  }

  //getting Selected Route Information
  getRouteList(event?) {
    this.routeBtnName = this.commonButton.save;
    if (!this.appService.checkNullOrUndefined(this.selectedRoute.ROUTEID) && this.selectedRoute.ROUTEID != "") {
      this.spinner.show();
      this.appErrService.clearAlert();
      let requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_ROUTE: { ROUTEID: encodeURIComponent(encodeURIComponent(this.selectedRoute.ROUTEID)) } };
      const url = String.Join('/', this.apiConfigService.getRouteList);
      this.apiService.apiPostRequest(url, requestObj)
        .subscribe(response => {
          let result = response.body;
          this.spinner.hide();
          if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
            if (!this.appService.checkNullOrUndefined(result.Response) && !this.appService.checkNullOrUndefined(result.Response.RouteList)) {
              this.selectedRoute = new Route();
              this.selectedRoute = result.Response.RouteList;
              this.tempSelectedRoute = JSON.parse(JSON.stringify(this.selectedRoute));
              this.selectedRoute.OperationCodes = this.selectedRoute.OperationCodes;
              this.isRouteIdDisabled = true;
              this.isGenerateRouteIdBtnDisabled = true;
              this.isRouteIdSelected = true;
              this.checkOperationCodesExist();
              this.disableAllForInActiveRoute();
            }
          }
          else if (!this.appService.checkNullOrUndefined(result) && result.Status == StatusCodes.fail) {
            this.selectedRoute = new Route();
            this.spinner.hide();
            this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
          }
        },
          error => {
            this.appErrService.handleAppError(error);
          });
    }
  }

  // for Disabling All Controls for InActive Routes
  disableAllForInActiveRoute(){
    if (this.selectedRoute.ACTIVE === CommonEnum.no) {
      this.isRouteTypeDisabled = true;
      this.isRouteDescriptionDisabled = true;
      this.isRoutetoggleActive = true;
      this.isInActiveRouteSelected = true;
      this.isMoveRightDisabled = true;
      this.isValidateAddBtnFlag = true;
    }
  }

  onRouteActiveChange(value) {
    this.selectedRoute.ACTIVE = value ? CommonEnum.yes : CommonEnum.no;
  }



  //to check if operatoin codes are there
  checkOperationCodesExist() {
    if (!this.appService.checkNullOrUndefined(this.selectedRoute.OperationCodes)) {
      if (this.selectedRoute.OperationCodes.length >= 1) {
        this.isValidateAddBtnFlag = false;
        this.isRouteResetBtnDisabled = false;
      } else {
        this.isValidateAddBtnFlag = true;
      }
    }
  }

  //add or Update Route Information
  addOrUpdateRoute() {
    this.appErrService.clearAlert();
    if (!this.appService.checkNullOrUndefined(this.selectedRoute.OperationCodes)) {
      this.selectedRoute.OperationCodes.forEach((element, index) => {
        element['Rank'] = index + 1;
        delete element['isRouteMainSelected'];
      });
      this.spinner.show();
      let requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_ROUTE: this.selectedRoute };
      let url;
      if (this.routeBtnName == this.commonButton.add) {
        url = String.Join('/', this.apiConfigService.AddRoute);
      } else if (this.routeBtnName == this.commonButton.save) {
        if (this.appService.IsObjectsMatch(this.selectedRoute, this.tempSelectedRoute)) {
          this.snackbar.info(this.appService.getErrorText('2660043'));
          this.spinner.hide();
          return;
        }
        url = String.Join('/', this.apiConfigService.UpdateRoute);
      }
      this.isValidateAddBtnFlag = true;
      this.apiService.apiPostRequest(url, requestObj)
        .subscribe(response => {
          let result = response.body;
          this.spinner.hide();
          if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.pass) {
            this.resetRoute();
            this.appErrService.setAlert(result.StatusMessage, true, MessageType.success);
            if (!this.appService.checkNullOrUndefined(result.StatusMessage)) {
              this.snackbar.success(result.StatusMessage);
            }
          }
          else if (!this.appService.checkNullOrUndefined(result) && result.Status === StatusCodes.fail) {
            this.isValidateAddBtnFlag = false;
            this.spinner.hide();
            this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
          }
        },
          error => {
            this.appErrService.handleAppError(error);
          });
    }
  }

  // on change of description
  onDescriptionChange() {
    this.isRouteResetBtnDisabled = false;
  }


  scrollRight(): void {
    if (!this.appService.checkNullOrUndefined(this.routeFlow.nativeElement) && this.routeFlow.nativeElement) {
      this.routeFlow.nativeElement.scrollTo({ left: (this.routeFlow.nativeElement.scrollLeft + 150), behavior: 'smooth' });
    }
  }

  scrollLeft(): void {
    if (!this.appService.checkNullOrUndefined(this.routeFlow.nativeElement) && this.routeFlow.nativeElement) {
      this.routeFlow.nativeElement.scrollTo({ left: (this.routeFlow.nativeElement.scrollLeft - 150), behavior: 'smooth' });
    }
  }

  //clearing route list properties
  clearRouteListProperties() {
    this.isRouteTempSelected = false;
    this.selectedRouteMainItem = null;
    this.selectedRouteTempItem = null;
    this.selectedRouteMainIndex = null;
    this.selectedRouteTempIndex = null;
    this.isRouteMainSelected = false;
  }

  //reset the route
  resetRoute() {
    this.selectedRoute = new Route();
    this.tempSelectedRoute = new Route();
    this.isRouteIdSelected = false;
    this.appErrService.clearAlert();
    this.clearRouteListProperties();
    this.isRouteIdDisabled = false;
    this.routeAllOperationCodes = [];
    this.isValidateAddBtnFlag = true;
    this.routeBtnName = this.commonButton.add;
    this.isMoveRightDisabled = true;
    this.isGenerateRouteIdBtnDisabled = false;
    this.isRouteResetBtnDisabled = true;
    this.isRouteTypeDisabled = false;
    this.isRouteDescriptionDisabled = false;
    this.isRoutetoggleActive = false;
    this.isInActiveRouteSelected = false;
    this.getOperationList();
    this.routeIDFocus();
  }

  ngOnDestroy() {
    this.emitHideSpinner.unsubscribe();
    this.masterPageService.defaultProperties();
    if (this.modalRef) {
      this.modalRef.hide();
    }
  }

}
