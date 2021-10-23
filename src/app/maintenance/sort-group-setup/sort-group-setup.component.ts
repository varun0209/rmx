import { NgForm } from '@angular/forms';
import { Component, OnInit, ViewChild, OnDestroy, TemplateRef } from '@angular/core';
import { ApiService } from '../../utilities/rlcutl/api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';
import { AppService } from '../../utilities/rlcutl/app.service';
import { ClientData } from '../../models/common/ClientData';
import { Grid } from '../../models/common/Grid';
import { MasterPageService } from './../../utilities/rlcutl/master-page.service';
import { ApiConfigService } from './../../utilities/rlcutl/api-config.service';
import { UiData } from '../../models/common/UiData';
import { EngineResult } from '../../models/common/EngineResult';
import { String } from 'typescript-string-operations';
import { dropdown } from '../../models/common/Dropdown';
import { RxCatFormula } from '../../models/maintenance/sort-group-setup/RxCatFormula';
import { RxTrknbrCat } from '../../models/maintenance/sort-group-setup/RxTrknbrCat';
import { RmgridService } from '../../framework/frmctl/rmgrid/rmgrid.service';
import { StorageData } from '../../enums/storage.enum';
import { StatusCodes } from '../../enums/status.enum';
import { checkNullorUndefined } from '../../enums/nullorundefined';

@Component({
  selector: 'app-sort-group-setup',
  templateUrl: './sort-group-setup.component.html',
  styleUrls: ['./sort-group-setup.component.css']
})
export class SortGroupSetupComponent implements OnInit {

  daytokeeppattern: any;

  operationObj: any;
  //client Control Labels
  controlConfig: any;
  clientData = new ClientData();
  uiData = new UiData();
  grid: Grid;

  catFormulaList: any;
  catDockList: any;
  //Disabling Controls
  isFormulaNameDisabled = false;
  isFormulaDisabled = false;
  isCategoryIdDisabled = false;
  isCategoryAddDisabled = false;
  isCategoryNameDisabled = false;
  isBoxSizeDisabled = false;
  isSortGroupDisabled = false;
  isChannelDisabled = false;
  isDaysTokeepDisabled = false;
  formulaNames = [];
  sortGroups = [];
  boxSizes= [];
  channels= [];
  appConfig: any;
  isFormulaSearchDisabled = false;
  rxCatFormula: RxCatFormula = new RxCatFormula();

  tempCatFormula: RxCatFormula;
  dockInfo: any = {};
  optionsList = [];
  catBtnName: string = 'Add';
  isCatClearDisabled = true;


  rxTrknbrCat: RxTrknbrCat = new RxTrknbrCat();
  tempTrknbrCatFormula: RxTrknbrCat;
  tkbrBtnName: string = 'Add';
  catTknbrList: any;
  isTrknbrDisabled = true;
  isTknbrCatSearchDisabled = false;
  isCategoryRankDisabled = false;
  isCategoryFormulaNameDisabled = false;
  isTrknbrClearDisabled = true;

  dropdownSettings = {
    singleSelection: true,
    idField: 'Id',
    textField: 'Text',
    itemsShowLimit: 1,
    allowSearchFilter: true,
    closeDropDownOnSelection: true
  };
  storageData = StorageData;
  statusCode = StatusCodes;

  constructor(public apiService: ApiService,
    private apiConfigService: ApiConfigService,
    private spinner: NgxSpinnerService,
    private snackbar: XpoSnackBar,
    public appErrService: AppErrorService,
    public masterPageService: MasterPageService,
    public appService: AppService,
    public rmgridService : RmgridService
  ) { 
    const pattern = JSON.parse(localStorage.getItem(StorageData.patternList));
    if (!this.appService.checkNullOrUndefined(pattern)) {
            this.daytokeeppattern = new RegExp(pattern.daytokeeppattern);
    }
  }

  ngOnInit() {
    this.operationObj = this.masterPageService.getRouteOperation();
    if (this.operationObj) {
      this.uiData.OperationId = this.operationObj.OperationId;
      this.uiData.OperCategory = this.operationObj.Category;
      this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
      this.masterPageService.setTitle(this.operationObj.Title);
      this.masterPageService.setModule(this.operationObj.Module);
      this.rxCatFormula.ACTIVE = 'Y';
      this.rxCatFormula.ISXPATH = 'Y';
      this.rxTrknbrCat.ACTIVE = 'Y';
      this.getActiveCatHashFormula();
      this.getSortGroups();
      this.getBoxSizes();
      this.getChannels();
      this.appConfig = JSON.parse(localStorage.getItem(this.storageData.appConfig));
    }
  }


  //add and update CatFormula
  addOrUpdateCatFormula() {
    let requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_CAT_FORMULA: this.rxCatFormula };
    let url;
    if (this.catBtnName == 'Add') {
      url = String.Join("/", this.apiConfigService.addCatFormulaUrl);
    } else if (this.catBtnName == 'Save') {
      if (this.appService.IsObjectsMatch(this.rxCatFormula, this.tempCatFormula)) {
        this.snackbar.info(this.appService.getErrorText('2660043'));
        return;
      }
      url = String.Join("/", this.apiConfigService.updateCatFormula);
    }
    this.spinner.show();
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let result = response.body;
        if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) { 
          if (!checkNullorUndefined(result.Response)) {
            this.catFormulaList = [];
            this.grid = new Grid();
            this.grid.EditVisible = true;
            this.catFormulaList = this.appService.onGenerateJson(result.Response, this.grid);
            this.getActiveCatHashFormula();
            this.snackbar.success(result.StatusMessage);
            this.clearCatFormula();
            this.spinner.hide();            
          }
        }
        else  if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) { 
          this.spinner.hide();
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
      error => {
        this.appErrService.handleAppError(error);
      });
  }

  //getCategoryID
  getCategoryID() {
    this.spinner.show();
    this.appErrService.clearAlert();
    let requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join("/", this.apiConfigService.getCategoryID);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let result = response.body;
       if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) { 
          this.rxTrknbrCat = result.Response;
          if (this.rxTrknbrCat.ACTIVE == null) {
            this.rxTrknbrCat.ACTIVE = 'Y'
          }
          this.isCategoryAddDisabled = true;
          this.isTknbrCatSearchDisabled = true;
          this.spinner.hide();          
        }
        else  if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) { 
          this.spinner.hide();
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
      error => {
        this.appErrService.handleAppError(error);
      });
  }


  //addOrUpdateTrkNbrCat
  addOrUpdateTrkNbrCat() {
    let requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_TRKNBR_CAT: this.rxTrknbrCat };
    let url;
    if (this.tkbrBtnName == 'Add') {
      url = String.Join("/", this.apiConfigService.addTrkNbrCat);
    } else if (this.tkbrBtnName == 'Save') {
      if (this.appService.IsObjectsMatch(this.rxTrknbrCat, this.tempTrknbrCatFormula)) {
        this.snackbar.info(this.appService.getErrorText('2660043'));
        return;
      }
      url = String.Join("/", this.apiConfigService.updateTrkNbrCat);
    }
    this.spinner.show();
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let result = response.body;
        if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) { 
          if (!checkNullorUndefined(result.Response)) {
            this.catTknbrList = [];
            this.grid = new Grid();
            this.grid.EditVisible = true;
            this.catTknbrList = this.appService.onGenerateJson(result.Response, this.grid);
            this.snackbar.success(result.StatusMessage);
            this.clearTkrnbrFormula();
            this.spinner.hide();            
          }
        }
        else if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) { 
          this.spinner.hide();
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
      error => {
        this.appErrService.handleAppError(error);
      });
  }

  // getTrkNbrcat grid on search button click 
  getTrkNbrcat() {
    this.spinner.show();
    this.appErrService.clearAlert();
    let requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_TRKNBR_CAT: this.rxTrknbrCat };
    const url = String.Join("/", this.apiConfigService.getTrkNbrcat);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let result = response.body;
        if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) { 
          if (!checkNullorUndefined(result.Response) && result.Response.length > 0) {
            this.catTknbrList = [];
            this.grid = new Grid();
            this.grid.EditVisible = true;
            this.catTknbrList = this.appService.onGenerateJson(result.Response, this.grid);
            this.spinner.hide();            
          }
        }
        else  if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) { 
          this.spinner.hide();
          if (this.catFormulaList) {
            this.catFormulaList = null;
          }
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
      error => {
        this.appErrService.handleAppError(error);
      });
  }



  //getCatFormula grid on search button click 
  getCatFormula() {
    this.spinner.show();
    this.appErrService.clearAlert();
    let requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_CAT_FORMULA: this.rxCatFormula };
    const url = String.Join("/", this.apiConfigService.getCatFormulaUrl);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let result = response.body;
        if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) { 
          if (!checkNullorUndefined(result.Response) && result.Response.length > 0) {
            this.catFormulaList = [];
            this.grid = new Grid();
            this.grid.EditVisible = true;
            this.catFormulaList = this.appService.onGenerateJson(result.Response, this.grid);
            this.spinner.hide();            
          }
        }
        else if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) { 
          this.spinner.hide();
          if (this.catFormulaList) {
            this.catFormulaList = null;
          }
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
      error => {
        this.appErrService.handleAppError(error);
      });
  }

  //getCatFormulaNames for dropdown
  getActiveCatHashFormula() {
    this.spinner.show();
    this.appErrService.clearAlert();
    let requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join("/", this.apiConfigService.getActiveCatHashFormulaUrl);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let result = response.body;
        if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) { 
          if (!checkNullorUndefined(result.Response) && result.Response.ActiveCatHashFormulas.length > 0) {
            this.formulaNames = [];
            result.Response.ActiveCatHashFormulas.forEach(element => {
              let dd: dropdown = new dropdown();
              dd.Id = element.Id;
              dd.Text = element.Text;
              this.formulaNames.push(dd);
            });
            this.spinner.hide();            
          }
        }
        else  if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) { 
          this.spinner.hide();
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
      error => {
        this.appErrService.handleAppError(error);
      });
  }

  //getSortGroups for dropdown
  getSortGroups() {
    this.spinner.show();
    this.appErrService.clearAlert();
    let requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join("/", this.apiConfigService.getSortGroups);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let result = response.body;
        if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) { 
          if (!checkNullorUndefined(result.Response) && result.Response.SortGroups.length > 0) {
            this.sortGroups = [];
            result.Response.SortGroups.forEach(element => {
              let dd: dropdown = new dropdown();
              dd.Id = element.Id;
              dd.Text = element.Text;
              this.sortGroups.push(dd);
            });
            this.spinner.hide();            
          }
        }
        else  if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) { 
          this.spinner.hide();
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
      error => {
        this.appErrService.handleAppError(error);
      } );
  }

  getBoxSizes() {
    this.spinner.show();
    this.appErrService.clearAlert();
    let requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join("/", this.apiConfigService.getBoxSizes);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let result = response.body;
        if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) { 
          if (!checkNullorUndefined(result.Response) && result.Response.BoxSizes.length > 0) {
            this.boxSizes = [];
            result.Response.BoxSizes.forEach(element => {
              let dd: dropdown = new dropdown();
              dd.Id = element.Id;
              dd.Text = element.Text;
              this.boxSizes.push(dd);
            });
            this.spinner.hide();            
          }
        }
        else  if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) { 
          this.spinner.hide();
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
      error => {
        this.appErrService.handleAppError(error);
      } );
  }

  getChannels() {
    this.spinner.show();
    this.appErrService.clearAlert();
    let requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join("/", this.apiConfigService.getChannels);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let result = response.body;
        if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) { 
          if (!checkNullorUndefined(result.Response) && result.Response.Channels.length > 0) {
            this.channels = [];
            result.Response.Channels.forEach(element => {
              let dd: dropdown = new dropdown();
              dd.Id = element.Id;
              dd.Text = element.Text;
              this.channels.push(dd);
            });
            this.spinner.hide();            
          }
        }
        else if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) { 
          this.spinner.hide();
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
      error => {
        this.appErrService.handleAppError(error);
      } );
  }

  editCatFormulaListRow(data) {
    this.rxCatFormula = new RxCatFormula();
    this.tempCatFormula = new RxCatFormula();
    this.rxCatFormula = Object.assign(this.rxCatFormula, data);
    this.tempCatFormula = Object.assign(this.tempCatFormula, data);
    this.isFormulaNameDisabled = true;
    this.isFormulaSearchDisabled = true;
    this.isCatClearDisabled = false;
    this.catBtnName = 'Save';
    this.catFormulaList['EditHighlight'] = true;
  }

  onActiveChange(value) {
    this.rxCatFormula.ACTIVE = value ? 'Y' : 'N';
    this.isCatClearDisabled = false;
  }
  onTrkActiveChange(value) {
    this.rxTrknbrCat.ACTIVE = value ? 'Y' : 'N';
    this.isTrknbrClearDisabled = false;
  }
  onXpathChange(value) {
    this.rxCatFormula.ISXPATH = value ? 'Y' : 'N';
    this.isCatClearDisabled = false;
  }

  changeInput() {
    this.isCatClearDisabled = false;
  }

  clearCatFormula() {
    this.catBtnName = 'Add';
    this.isCatClearDisabled = true;
    this.isFormulaNameDisabled = false;
    this.isFormulaSearchDisabled = false;
    this.rxCatFormula = new RxCatFormula();
    this.tempCatFormula = new RxCatFormula();
    this.rxCatFormula.ACTIVE = 'Y';
    this.rxCatFormula.ISXPATH = 'Y';
    if(!checkNullorUndefined(this.catFormulaList)){
      this.catFormulaList['EditHighlight'] = false;
    }
    this.appErrService.clearAlert();
  }


  changeCatFormulaName(val) {
    this.rxTrknbrCat.FORMULANAME = val;
    this.isTrknbrClearDisabled = false;
  }

  changeBoxSize(val){
    this.rxTrknbrCat.BOX_SIZE = val;
    this.isTrknbrClearDisabled = false;
  }

  changeChannel(val){
    this.rxTrknbrCat.CHANNEL = val;
    this.isTrknbrClearDisabled = false;
  }

  changeSortGroup(val){
    this.rxTrknbrCat.SORT_GROUP = val.Id;
    this.isTrknbrClearDisabled = false;
  }
 

  onDeSelectItem() {
    this.rxTrknbrCat.SORT_GROUP = null;
  }


  changeTrackingInput() {
    this.isTrknbrClearDisabled = false;
  }

  editTknbrFormulaListRow(data) {
    this.rxTrknbrCat = new RxTrknbrCat();
    this.tempTrknbrCatFormula = new RxTrknbrCat();
    this.rxTrknbrCat = Object.assign(this.rxTrknbrCat, data);
    this.tempTrknbrCatFormula = Object.assign(this.tempTrknbrCatFormula, data);
    this.isTrknbrClearDisabled = false;
    this.isCategoryNameDisabled = true;
    this.isTknbrCatSearchDisabled = true;
    this.tkbrBtnName = 'Save';
    this.isCategoryAddDisabled = true;
    this.catTknbrList['EditHighlight'] = true;
  }


  clearTkrnbrFormula() {
    this.tkbrBtnName = 'Add';
    this.isTrknbrClearDisabled = true;
    this.isCategoryAddDisabled = false;
    this.isCategoryNameDisabled = false;
    this.isTknbrCatSearchDisabled = false;
    this.rxTrknbrCat = new RxTrknbrCat();
    this.tempTrknbrCatFormula = new RxTrknbrCat();
    this.rxTrknbrCat.ACTIVE = 'Y';
    if(!checkNullorUndefined(this.catTknbrList)){
      this.catTknbrList['EditHighlight'] = false;
    }
    this.appErrService.clearAlert();
  }


  ngOnDestroy() {
    this.masterPageService.moduleName.next(null);
    this.appErrService.clearAlert();
    this.masterPageService.clearModule();
    this.masterPageService.hideModal();
  }

}
