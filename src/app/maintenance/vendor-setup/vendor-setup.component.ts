import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { Vendor } from './../../models/maintenance/vendor/vendor';
import { CommonService } from '../../services/common.service';
import { StorageData } from '../../enums/storage.enum';

@Component({
  selector: 'app-vendor-setup',
  templateUrl: './vendor-setup.component.html',
  styleUrls: ['./vendor-setup.component.css']
})
export class VendorSetupComponent implements OnInit, OnDestroy {

  // model
  vendor = new Vendor();
  tempVendor = new Vendor();

  // common
  clientData = new ClientData();
  uiData = new UiData();
  grid: Grid;
  commonEnum = CommonEnum;
  btnName = CommonEnum.add;
  textBoxPattern: any;

  // disabled
  isVendorIDDisabled = false;
  isClearBtnDisabled = true;
  isSearchBtnDisabled = false;

  vendorList: any;
  countries: any;
  states: any;

  // multi-select dropdown settings
  countryDropdownSettings = {
    singleSelection: true,
    enableCheckAll: false,
    idField: 'shortname',
    textField: 'name',
    itemsShowLimit: 1,
    allowSearchFilter: true,
    closeDropDownOnSelection: true
  };

  stateDropdownSettings = {
    singleSelection: true,
    enableCheckAll: false,
    idField: 'shortname',
    textField: 'shortname',
    itemsShowLimit: 1,
    allowSearchFilter: true,
    closeDropDownOnSelection: true
  };

  selectedCountry = [];
  selectedState = [];
  appConfig: any;


  constructor(
    public appErrService: AppErrorService,
    public masterPageService: MasterPageService,
    private apiConfigService: ApiConfigService,
    public apiservice: ApiService,
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
    if (operationObj) {
      this.uiData.OperationId = operationObj.OperationId;
      this.uiData.OperCategory = operationObj.Category;
      this.clientData = JSON.parse(localStorage.getItem('clientData'));
      this.masterPageService.setTitle(operationObj.Title);
      this.masterPageService.setModule(operationObj.Module);
      this.appConfig = JSON.parse(localStorage.getItem(StorageData.appConfig));
      this.vendorIdFocus();
      this.getAllCountries();
    }
  }

  getAllCountries(){
    const result = this.commonService.getAllCountries();
    result.subscribe((res) => {
        this.countries = res.countries.filter(el => el.name === CommonEnum.us);
        //this.selectedCountry = [{ shortname: res.defShortName , name: res.defName }];
        //this.onSelectCountry(this.selectedCountry[0]);
    });
  }

  getAllStates(selectedCountry, data?){
    const result  = this.commonService.getAllStates();
    result.subscribe((res) => {
        this.states = res;
        this.states = this.states.filter( el => el.country_id === selectedCountry.id );
        if (data) {
          this.selectStae(data);
        }
    });
  }

  vendorIdFocus() {
    this.appService.setFocus('vendorId');
  }

  // Vendor Search
  getVendors() {
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getVendors, this.vendor.VendorId);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response) && res.Response.length) {
          this.showGrid(res.Response);
        }
      } else {
        this.vendorList = null;
      }
    });
  }

  // Grid List
  showGrid(gridData) {
    this.vendorList = [];
    this.grid = new Grid();
    this.grid.EditVisible = true;
    this.vendorList = this.appService.onGenerateJson(gridData, this.grid);
  }

  // add or update Vendor
  addOrUpdateVendor() {
    let url;
    if (this.btnName === CommonEnum.add) {
      url = String.Join('/', this.apiConfigService.insertVendor);
    } else if (this.btnName === CommonEnum.save) {
      if (this.appService.IsObjectsMatch(this.vendor, this.tempVendor)) {
        this.snackbar.info(this.appService.getErrorText('2660043'));
        return;
      }
      url = String.Join('/', this.apiConfigService.updateVendor);
    }
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, Vendor: this.vendor };
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response) && res.Response.length ) {
          this.showGrid(res.Response);
          this.snackbar.success(res.StatusMessage);
          this.clear(true);
        }
      }
    });
  }

  // on selecting country
  onSelectCountry(event) {
    this.vendor.Country = event.name;
    const selectedCountry = this.countries.find( el => el.name === event.name);
    this.isClearBtnDisabled = false;
    this.getAllStates(selectedCountry);
  }

  // on deselecting country
  onDeSelectCountry(event) {
    this.vendor.Country = '';
    this.selectedCountry = [];
    this.states = [];
    this.selectedState = [];
    this.vendor.State = '';
  }

  // on selecting state
  onSelectState(event) {
    this.vendor.State = event.shortname;
    this.isClearBtnDisabled = false;
  }

  // on deselecting state
  onDeSelectState(event) {
    this.vendor.State = '';
    this.selectedState = [];
  }

  // On Edit Vendor Data
  editVendor(data) {
    this.vendor = new Vendor();
    this.tempVendor = new Vendor();
    this.selectCountry(data);
    this.vendor = Object.assign(this.vendor, data);
    this.tempVendor = Object.assign(this.tempVendor, data);
    this.btnName = CommonEnum.save;
    this.isVendorIDDisabled = true;
    this.isSearchBtnDisabled = true;
    this.isClearBtnDisabled = false;
  }

  private selectCountry(data: any) {
    if (!this.appService.checkNullOrUndefined(data.Country) && data.Country !== '') {
      const selectedCountry = this.countries.find(el => el.name === data.Country);
      if (selectedCountry) {
        this.selectedCountry = [{ shortname: selectedCountry.shortname, name: data.Country }];
        this.getAllStates(selectedCountry, data);
      }
    } else {
      this.selectedCountry = [];
    }
  }

  private selectStae(data: any) {
    if (!this.appService.checkNullOrUndefined(data.State) && data.State !== '') {
      const selectedState = this.states.filter(el => el.shortname === data.State);
      this.selectedState = [{ shortname: data.State, name: selectedState[0].name }];
    } else {
      this.selectedState = [];
    }
  }

  // enable Clear
  changeInput() {
    this.isClearBtnDisabled = false;
  }

  // clear Vendor
  clear(isGridRequried?) {
    this.appErrService.clearAlert();
    this.isClearBtnDisabled = true;
    this.btnName = CommonEnum.add;
    this.isVendorIDDisabled = false;
    this.isSearchBtnDisabled = false;
    this.vendor = new Vendor();
    this.selectedCountry = [];
    this.selectedState = [];
    this.states = [];
    this.tempVendor = new Vendor();
    if (!isGridRequried) {
      this.vendorList = null;
      this.vendorIdFocus();
    } else {
      this.isClearBtnDisabled = false;
    }
  }

  ngOnDestroy() {
    this.masterPageService.defaultProperties();
  }



}
