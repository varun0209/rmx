import { Subscription } from 'rxjs';
import { DeleteConfirmationDialogComponent } from './../../framework/frmctl/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { NgForm } from '@angular/forms';
import { String } from 'typescript-string-operations';
import { VendorCIStateConfig } from './../../models/maintenance/vendor-cistate-config/vendor-cistate-config';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { CommonService } from './../../services/common.service';
import { AppService } from './../../utilities/rlcutl/app.service';
import { ApiConfigService } from './../../utilities/rlcutl/api-config.service';
import { MasterPageService } from './../../utilities/rlcutl/master-page.service';
import { AppErrorService } from './../../utilities/rlcutl/app-error.service';
import { Grid } from './../../models/common/Grid';
import { UiData } from './../../models/common/UiData';
import { ClientData } from './../../models/common/ClientData';
import { CommonEnum } from './../../enums/common.enum';
import { StorageData } from './../../enums/storage.enum';
import { tick } from '@angular/core/testing';


@Component({
  selector: 'app-trusted-vendor',
  templateUrl: './trusted-vendor.component.html',
  styleUrls: ['./trusted-vendor.component.css']
})
export class TrustedVendorComponent implements OnInit, OnDestroy {

  @ViewChild('trustedVendorForm') trustedVendorForm: NgForm;
  isSearchBtnDisabled = false;
  isClearBtnDisabled = true;
  isVendorIDDisabled = false;
  isDispositionDisabled = false;
  isReceiptTypeDisabled = false;
  vendorLsit = [];
  selectedVendor = [];
  dispositionList = [];
  selectedDisposition = [];
  receiptTypeList = [];
  selectedReceiptType = [];
  vendorCIStateCnfigsList: any;
  controlConfig: any;

  dropdownSettings = {
    singleSelection: true,
    enableCheckAll: false,
    idField: 'Id',
    textField: 'Text',
    allowSearchFilter: true,
    closeDropDownOnSelection: true
  };


  // common
  clientData = new ClientData();
  uiData = new UiData();
  vendorCIStateConfig = new VendorCIStateConfig();
  tempVendorCIStateConfig = new VendorCIStateConfig();
  modalRef: any;
  grid: Grid;
  commonEnum = CommonEnum;
  btnName = CommonEnum.add;

  // RXjs observables
  emitHideSpinner: Subscription;


  constructor(
    public masterPageService: MasterPageService,
    private apiConfigService: ApiConfigService,
    private appService: AppService,
    public appErrService: AppErrorService,
    private cmnService: CommonService,
    private snackbar: XpoSnackBar,    
    private spinner: NgxSpinnerService
  ) {

  }

  ngOnInit() {
    const operationObj = this.masterPageService.getRouteOperation();
    if (operationObj) {
      this.uiData.OperationId = operationObj.OperationId;
      this.uiData.OperCategory = operationObj.Category;
      this.clientData = JSON.parse(localStorage.getItem('clientData'));
      this.masterPageService.hideSpinner = true;
      this.masterPageService.setTitle(operationObj.Title);
      this.masterPageService.setModule(operationObj.Module);
      this.emitHideSpinner = this.masterPageService.emitHideSpinner.subscribe(spinnerFlag => {
        if (!this.appService.checkNullOrUndefined(spinnerFlag) && spinnerFlag) {
          this.getVendors();
        }
      });
    }
  }


  onSelectVedor(event) {
    this.vendorCIStateConfig.VENDOR = event.Id;
    this.appErrService.clearAlert();
  }

  onDeSelectVendor() {
    this.vendorCIStateConfig.VENDOR = null;
    this.selectedVendor = [];
    this.appErrService.clearAlert();
  }

  onSelectDisposition(event) {
    this.vendorCIStateConfig.DISPOSITION = event.Id;
    this.appErrService.clearAlert();

  }

  onDeSelectDisposition() {
    this.vendorCIStateConfig.DISPOSITION = null;
    this.selectedDisposition = [];
    this.appErrService.clearAlert();

  }

  onSelectReceiptType(event) {
    this.vendorCIStateConfig.RECEIPTTYPE = event.Id;
    this.appErrService.clearAlert();

  }

  onDeSelectReceiptType() {
    this.vendorCIStateConfig.RECEIPTTYPE = null;
    this.selectedReceiptType = [];
    this.appErrService.clearAlert();
  }


  getVendors() {
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    this.cmnService.commonApiCall(this.apiConfigService.getVendorsListUrl, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          this.getVendoIdOptions(res.Response.VendorsList);
          this.getDispositions();
        }
      } else {
        this.spinner.hide();
      }
    });
  }

  // to populate vendor list with id and text
  getVendoIdOptions(data) {
    this.vendorLsit = [];
    data.forEach(element => {
      this.vendorLsit.push({ Id: element.Id, Text: String.Join(' - ', element.Id, element.Text) });
    });
  }


  getDispositions() {
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    this.cmnService.commonApiCall(this.apiConfigService.getDispositionsListUrl, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          this.dispositionList = res.Response.DispositionsList;
          this.getReceiptTypeList();
        }
      } else {
        this.spinner.hide();
      }
    });
  }


  getReceiptTypeList() {
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    this.cmnService.commonApiCall(this.apiConfigService.getReceiptTypesUrl, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          this.receiptTypeList = res.Response.ReceiptTypesList;
        }
      }
      this.spinner.hide();
    });
  }

  // search
  getVendorCIStatesList() {
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_VENDOR_CISTATE_CONFIG: this.vendorCIStateConfig };
    this.cmnService.commonApiCall(this.apiConfigService.getVendorCIStatesListUrl, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          this.processGrid(res.Response.VendorCIStateCnfigsList);
        }
      } else {
        this.vendorCIStateCnfigsList = null;
      }
      this.spinner.hide();
    });
  }

  // editing vendor ci state data
  editTrustedVendor(data) {
    this.vendorCIStateConfig = new VendorCIStateConfig();
    this.vendorCIStateConfig = Object.assign(this.vendorCIStateConfig, data);
    this.tempVendorCIStateConfig = Object.assign(this.tempVendorCIStateConfig, data);
    this.selectedVendor = this.vendorLsit.filter(e => e.Id === this.vendorCIStateConfig.VENDOR);
    this.selectedDisposition = this.dispositionList.filter(e => e.Id === this.vendorCIStateConfig.DISPOSITION);
    this.selectedReceiptType = this.receiptTypeList.filter(e => e.Id === this.vendorCIStateConfig.RECEIPTTYPE);
    this.vendorCIStateCnfigsList['EditHighlight'] = true;
    this.btnName = CommonEnum.save;
    this.isVendorIDDisabled = true;
  }

  // adding or updating
  addOrUpdateVendor() {
    let url;
    if (this.btnName !== CommonEnum.add) {
      if (this.appService.IsObjectsMatch(this.vendorCIStateConfig, this.tempVendorCIStateConfig)) {
        this.snackbar.info(this.appService.getErrorText('2660043'));
        return;
      }
      url = this.apiConfigService.updateVendorCIStatesConfigUrl;
    } else {
      url = this.apiConfigService.addVendorCIStatesConfigUrl;
    }
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_VENDOR_CISTATE_CONFIG: this.vendorCIStateConfig };
    this.cmnService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          this.processGrid(res.Response.VendorCIStateConfigList);
          this.snackbar.success(res.StatusMessage);
        }
      }
      this.spinner.hide();
    });
  }

  deletePopup(data) {
    this.masterPageService.openModelPopup(DeleteConfirmationDialogComponent);
    this.masterPageService.dialogRef.componentInstance.emitConfirmation.subscribe(($e) => {
      this.masterPageService.hideDialog();
      this.deleteVendorCIStateConfig(data);
    });
  }

  deleteVendorCIStateConfig(data) {
    this.vendorCIStateConfig = new VendorCIStateConfig();
    this.vendorCIStateConfig = Object.assign(this.vendorCIStateConfig, data);
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_VENDOR_CISTATE_CONFIG: this.vendorCIStateConfig };
    this.cmnService.commonApiCall(this.apiConfigService.deleteVendorCIStatesConfigUrl, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          this.processGrid(res.Response.VendorCIStateConfigList);
          this.snackbar.success(res.StatusMessage);
        }
      }
      this.spinner.hide();
    });

  }

  // common code
  private processGrid(res: any) {
    this.clearOnSearch();
    this.grid = new Grid();
    this.grid.EditVisible = true;
    this.grid.DeleteVisible = true;
    this.vendorCIStateCnfigsList = this.appService.onGenerateJson(res, this.grid);
  }


  clearOnSearch() {
    this.vendorCIStateConfig = new VendorCIStateConfig();
    this.tempVendorCIStateConfig = new VendorCIStateConfig();
    this.btnName = CommonEnum.add;
    this.isVendorIDDisabled = false;
    this.selectedVendor = [];
    this.selectedDisposition = [];
    this.selectedReceiptType = [];
    this.trustedVendorForm.reset();
  }

  clear() {
    this.clearOnSearch();
    this.appErrService.clearAlert();
    this.vendorCIStateCnfigsList = null;
  }

  ngOnDestroy() {
    this.emitHideSpinner.unsubscribe();
    this.masterPageService.defaultProperties();
  }

}
