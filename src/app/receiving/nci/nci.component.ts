import { NgForm } from '@angular/forms';
import { Component, OnInit, ViewChild, OnDestroy, TemplateRef } from '@angular/core';
import { ApiService } from '../../utilities/rlcutl/api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';
import { AppService } from '../../utilities/rlcutl/app.service';
import { String } from 'typescript-string-operations';
import { ClientData } from '../../models/common/ClientData';
import { Grid } from '../../models/common/Grid';
import { Message } from '../../models/common/Message';
import { MessageType } from '../../enums/message.enum';
import { MasterPageService } from './../../utilities/rlcutl/master-page.service';
import { ApiConfigService } from './../../utilities/rlcutl/api-config.service';
import { MessagingService } from '../../utilities/rlcutl/messaging.service';
import { UiData } from '../../models/common/UiData';
import { NciInfo } from '../../models/receiving/nci/NciInfo';
import { RmtypeaheadComponent } from '../../framework/frmctl/rmtypeahead/rmtypeahead.component';
import { SKU } from '../../models/receiving/ReceivingSKU';
import { dropdown } from '../../models/common/Dropdown';
import * as moment from 'moment';
import { EngineResult } from '../../models/common/EngineResult';
import { TraceTypes } from '../../enums/traceType.enum';
import { NciReferenceType } from '../../enums/nci.enum';
import { CommonService } from '../../services/common.service';
import { FindTraceHoldComponent } from '../../framework/busctl/find-trace-hold/find-trace-hold.component';
import { StorageData } from '../../enums/storage.enum';
import { StatusCodes } from '../../enums/status.enum';
import { checkNullorUndefined } from '../../enums/nullorundefined';
import { DropDownSettings } from '../../models/common/dropDown.config';
import { CommonEnum } from '../../enums/common.enum';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-nci',
  templateUrl: './nci.component.html',
  styleUrls: ['./nci.component.css']
})
export class NciComponent implements OnInit, OnDestroy {
  @ViewChild(RmtypeaheadComponent) rmtypeaheadChild: RmtypeaheadComponent;
  @ViewChild('nciForm') nciForm: NgForm;
  @ViewChild('popTemplate') nciSearchTemplate: TemplateRef<any>;


  //for button save and update
  showSave = true;
  isAddNciId = false;

  //multi-select dropdown settings
  dropdownSettings = {};
  carrierSettings = {};

  //client Control Labels
  controlConfig: any;
  clientData = new ClientData();
  uiData = new UiData();

  //NciInfo
  nciId: any;
  NciInfo = new NciInfo();
  nciList: any;
  nciListResponse = []; //to bind to the grid

  //grid
  grid: Grid;

  //modal popup
  title: string = "NCI Search";
  flag: boolean = true;

  operationObj: any;

  //App message
  message: string;
  messageNum: string;
  messageType: string;
  appConfig: any;


  //Nci Main Tab
  nciIdDisabled: boolean = true;
  isQantityExpDisabled: boolean = false;
  isQuantityRecpDisabled: boolean = false;
  quantityExp: number;
  quantityRec: number;

  isSerialNumberDisabled: boolean = false


  dispositionOptions = [];
  isDispositionDisabled: boolean = false;
  isDispositionDateDisabled: boolean = true;
  minDate: Date;

  //SKU
  isSKUSelected = false;

  //status
  statusOptions = [];
  isStatusDisabled = false;

  //Reason Section
  isPrimayReasonDisabled: boolean = false;
  isReasoan2Disabled: boolean = true;
  isReasoan3Disabled: boolean = true;
  primayReasonList = [];
  reason2List = [];
  reason3List = [];
  primarySelectedItem = [];
  reason3SelectedItem = [];
  reason2SelectedItem = [];

  //Action  
  isCommentsDisabled: boolean = false;
  isActionTakenDisabled: boolean = true;


  //Routing 
  route1List = [];
  isRoute1Disabled: boolean = false;
  route2List = [];
  isRoute2Disabled: boolean = false;
  route3List = [];
  isRoute3Disabled: boolean = false;


  //Vendor Tab
  vendorList = []
  isVendorDisabled: boolean = false;

  dockTypeOptions = [];
  isDockTypeDisabled: boolean = false;

  dockValue: string;
  isDocValueDisabled: boolean = false;

  //carrier
  carrierSelectedItem = [];
  carrierOptions = [];
  carrierTypeDisabled: boolean = false;
  carrierDisabled: boolean = false;

  carrierRef: string;
  isCarrierRefDisabled: boolean = false;

  isPrintDisabled: boolean = false;
  qantityRecisDisabled: boolean = false;
  isSearchDisabled: boolean = false;

  //print
  nciPrintDisabled: boolean = false;
  isNciPrint: boolean = true;

  nciOrderedQuantityPattern: any;
  nciReceivedQuantityPattern: any;

  traceTypes = TraceTypes
  validReferenceResponse: any;
  validCarrierResponse: any;

  nciReferenceType = NciReferenceType;
  storageData = StorageData;
  statusCode = StatusCodes;

  configData: any;
  clearTypeAhead = false;
  editTypeAhead: any;
  dialogRef: any;
  // nciDropdownSettings: DropDownSettings;

  constructor(public apiservice: ApiService,
    private apiConfigService: ApiConfigService,
    private spinner: NgxSpinnerService,
    private snackbar: XpoSnackBar,
    public appErrService: AppErrorService,
    public masterPageService: MasterPageService,
    public appService: AppService,
    private commonService: CommonService,
    private dialog: MatDialog

  ) {
    const pattern = JSON.parse(localStorage.getItem(StorageData.patternList));
    if (!this.appService.checkNullOrUndefined(pattern)) {
      this.nciOrderedQuantityPattern = new RegExp(pattern.nciOrderedQuantityPattern);
      this.nciReceivedQuantityPattern = new RegExp(pattern.nciReceivedQuantityPattern);
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
      this.message = this.appService.getErrorText('2660048');
      this.appConfig = JSON.parse(localStorage.getItem(this.storageData.appConfig));
      this.controlConfig = JSON.parse(localStorage.getItem(this.storageData.controlConfig));
      this.NciInfo.DispositionDate = "";
      this.minDate = new Date(2000, 0, 1);
      this.dropdownSettings = {
        singleSelection: true,
        itemsShowLimit: 3,
        allowSearchFilter: true,
        closeDropDownOnSelection: true,
        idField: 'Id',
        textField: 'Text',
      };
      this.carrierSettings = {
        singleSelection: true,
        idField: 'CarrierCode',
        textField: 'CarrierName',
        itemsShowLimit: 3,
        allowSearchFilter: true,
        closeDropDownOnSelection: true
      };
      this.getStatus();
      this.getDockType();
      this.getCarrier();
      this.getReasons();
      this.getRoute1();
      this.getRoute2();
      this.getRoute3();
      this.getVendors();
      this.configData = {
        uiData: this.uiData,
        url: this.apiConfigService.getSKUsUrl
      };
    }
  }

  // nciDropDownSettings() {
  //   this.nciDropdownSettings = new DropDownSettings();
  //   this.nciDropdownSettings.idField = CommonEnum.ID;
  //   this.nciDropdownSettings.textField = CommonEnum.TEXT;
  //   this.nciDropdownSettings.singleSelection = true;
  //   this.nciDropdownSettings.itemsShowLimit = 3;
  //   this.nciDropdownSettings.allowSearchFilter = true;
  //   this.nciDropdownSettings.closeDropDownOnSelection = true;

  // }


  //Emiting from rmtypehead after selecting option 
  typeaheadResponse(event) {
    this.clearTypeAhead = false;
    if (!this.appService.checkNullOrUndefined(event)) {
      this.NciInfo.Sku = event.Sku;
      this.isSKUSelected = true;
    } else {
      this.NciInfo.Sku = null;
      this.isSKUSelected = false;
    }
  }

  //on status change
  changStatus(event) {
    this.NciInfo.Status = event.value;
  }

  //on Primary Reason change
  changePrimaryReason(event: any) {
    if (this.NciInfo.PrimaryReason) {
      this.primaryReasonDeselect();
    }
    this.NciInfo.PrimaryReason = event.Text;
    this.NciInfo.PrimaryReasonCd = parseInt(event.Id);
    this.isReasoan2Disabled = false;
    this.isReasoan3Disabled = true;
    let primaryReasons = [];
    this.reason2List = [];
    this.reason3List = [];
    primaryReasons = this.primayReasonList.filter(elemetn => elemetn.Text != event.Text)
    this.reason2List = primaryReasons;
  }

  //on dispostion change
  changeReason2(event) {
    if (this.NciInfo.Reason2) {
      this.reason2Deselect();
    }
    this.NciInfo.Reason2 = event.Text;
    this.NciInfo.ReasonCd2 = parseInt(event.Id);
    this.isReasoan3Disabled = false;
    this.reason3SelectedItem = [];
    let reason2 = [];
    reason2 = this.reason2List.filter(element => element.Text != event.Text)
    this.reason3List = reason2;
  }

  //on dispostion change
  changeReason3(event) {
    this.NciInfo.Reason3 = event.Text;
    this.NciInfo.ReasonCd3 = parseInt(event.Id);
  }

  //on Route1 change
  changeRoute1(event) {
    this.NciInfo.Route1 = event.value;
  }

  //on Route2 change
  changeRoute2(event) {
    this.NciInfo.Route2 = event.value;
  }

  //on Route3 change
  changeRoute3(event) {
    this.NciInfo.Route3 = event.value;
  }

  //changing Vendor
  changeVendor(event){
    this.NciInfo.VendorId = event.value;
   // this.NciInfo.VendorName = event.target.options[event.target.selectedIndex].text;
    this.NciInfo.VendorName = event.source.selected.viewValue;
  }

  // dispositionDateChange
  dispositionDateChange(val) {
    this.NciInfo.DispositionDate = moment(val).format('YYYY-MM-DD');
  }

  //changeCarrierType
  changeCarrierType(event) {
    this.NciInfo.Carrier = event.CarrierName;
    this.NciInfo.CarrierCode = event.CarrierCode;
  }

  //changedockType
  changedockType(event) {    
    this.NciInfo.DockType = event.value;
  }

  //toggle label print
  changeisNciPrint(event) {
    this.isNciPrint = event;
  }

  //statusTypeOptions
  getStatus() {
    this.spinner.show();
    this.statusOptions = [];
    let requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const getCarrierUrl = String.Join("/", this.apiConfigService.getStatuses, 'NCISTATUS');
    this.apiservice.apiPostRequest(getCarrierUrl, requestObj)
      .subscribe(response => {
        let res = response.body;
        this.spinner.hide();
        if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
          if (!checkNullorUndefined(res.Response)) {
            res.Response.forEach(element => {
              let dd: dropdown = new dropdown();
              dd.Id = element.Status_Code;
              dd.Text = element.Status_Code;
              this.statusOptions.push(dd);
            });
            if (this.statusOptions.length > 0) {
              this.NciInfo.Status = this.statusOptions[0].Text;
            }
          }
        } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }


  //Get Dock Type
  getDockType() {
    this.spinner.show();
    this.dockTypeOptions= [];
    let requestObj = { ClientData: this.clientData, UIData: this.uiData };
    this.apiservice.apiPostRequest(this.apiConfigService.getNciDockTypesUrl, requestObj)
      .subscribe(response => {
        let res = response.body;
        this.spinner.hide();
        if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
          if (!checkNullorUndefined(res.Response.NciDockTypes)) {
            res.Response.NciDockTypes.forEach(element => {
              let dd: dropdown = new dropdown();
              dd.Id = element.Id;
              dd.Text = element.Text;
              this.dockTypeOptions.push(dd);
            });
            if (this.dockTypeOptions.length > 0) {
              this.NciInfo.DockType = this.dockTypeOptions[0].Text;
            }
          }
        } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }


  // trace check for serial number
  serialNumberTrace(serialNumber) {
    if (!checkNullorUndefined(serialNumber)) {
      let traceData = { traceType: this.traceTypes.serialNumber, traceValue: serialNumber, uiData: this.uiData }
      let traceResult = this.commonService.findTraceHold(traceData, this.uiData);
      traceResult.subscribe(result => {
        if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) { 
          if (checkNullorUndefined(result.Response)) {
          } else {
            this.canProceed(result, this.traceTypes.serialNumber);
          }
          this.spinner.hide();
        } else if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) { 
          this.spinner.hide();
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      });
    }
  }
  //Get expected Quantity
  getExpectedQuantity() {
    if(!checkNullorUndefined(this.NciInfo.DockValue)){
      this.spinner.show();
      let requestObj = { ClientData: this.clientData, UIData: this.uiData };
      const url = String.Join("/", this.apiConfigService.getExpectedQtyUrl, this.NciInfo.DockValue);
      this.apiservice.apiPostRequest(url, requestObj)
        .subscribe(response => {
          let res = response.body;
          this.spinner.hide();
          if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
          if (!checkNullorUndefined(res.Response)) {
              this.validReferenceResponse = response.body;
              if (this.NciInfo.DockType == this.nciReferenceType.po || this.NciInfo.DockType == this.nciReferenceType.order) {
                let traceData = { traceType: this.NciInfo.DockType, traceValue: this.NciInfo.DockValue, uiData: this.uiData }
                let traceResult = this.commonService.findTraceHold(traceData, this.uiData);
                traceResult.subscribe(result => {
                  if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) { 
                    if (checkNullorUndefined(result.Response)) {
                      this.validReferenceValue();
                    } else {
                      this.canProceed(result, this.NciInfo.DockType);
                    }
                    this.spinner.hide();
                  } else  if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) { 
                    this.spinner.hide();
                    this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
                  }
                });
              } else {
                this.validReferenceValue();
              }
            }
          } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
            this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          }
        }, erro => {
          this.appErrService.handleAppError(erro);
        });
    }    
  }
  validReferenceValue(res = this.validReferenceResponse) {
    this.NciInfo.ExpectedQty = res.Response;
    this.validReferenceResponse = null;
  }
  canProceed(traceResponse, type) {
    if (traceResponse.Response.canProceed == 'Y') {
      this.appErrService.setAlert(traceResponse.StatusMessage, true, MessageType.info);
    }
    if (!checkNullorUndefined(traceResponse.Response.TraceHold)) {
      let uiObj = { uiData: this.uiData }
      traceResponse = Object.assign(traceResponse, uiObj);
      this.dialogRef = this.dialog.open(FindTraceHoldComponent, { hasBackdrop: true, disableClose: true, panelClass: 'dialog-width-sm', data: { modalData: traceResponse } });
      this.dialogRef.afterClosed().subscribe((returnedData) => {
        if (returnedData) {
        if (returnedData.Response.canProceed == 'Y') {
          if (type == this.traceTypes.trackingNumber) {
            this.validateCarrier();
          } else if (type == this.NciInfo.DockType) {
            this.validReferenceValue();
          }
        } else if (returnedData.Response.canProceed == 'N') {
          this.appErrService.setAlert(returnedData.StatusMessage, true);
        }
        }
      });
    }
  }

  //getCarrier
  getCarrier() {
    this.spinner.show();
    this.carrierOptions = [];
    let requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const getCarrierUrl = String.Join("/", this.apiConfigService.getCarrierUrl);
    this.apiservice.apiPostRequest(getCarrierUrl, requestObj)
      .subscribe(response => {
        let res = response.body;
        this.spinner.hide();
        if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
          if (!checkNullorUndefined(res.Response)) {
            this.carrierOptions = res.Response;
          }
        } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }

  //carrierByref
  getCarrierByRef() {
    if(!checkNullorUndefined(this.NciInfo.CarrierReference)){
      this.spinner.show();
      this.carrierSelectedItem = [];
      let requestObj = { ClientData: this.clientData, UIData: this.uiData };
      const url = String.Join("/", this.apiConfigService.getCarrierByRefUrl, this.NciInfo.CarrierReference);
      this.apiservice.apiPostRequest(url, requestObj)
        .subscribe(response => {
          let res = response.body;
          this.spinner.hide();
          if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
            if (!checkNullorUndefined(res.Response)) {
              this.validCarrierResponse = response.body;
              let traceData = { traceType: this.traceTypes.trackingNumber, traceValue: this.NciInfo.CarrierReference, uiData: this.uiData }
              let traceResult = this.commonService.findTraceHold(traceData, this.uiData);
              traceResult.subscribe(result => {
              if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) { 
                  if (checkNullorUndefined(result.Response)) {
                    this.validateCarrier();
                  } else {
                    this.canProceed(result, this.traceTypes.trackingNumber);
                  }
                  this.spinner.hide();
                } else if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) { 
                  this.spinner.hide();
                  this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
                }
              });
            }
          }
          if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
            this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          }
        }, erro => {
          this.appErrService.handleAppError(erro);
        });
    }
  }

  validateCarrier(res = this.validCarrierResponse) {
    const carrier = res.Response;
    this.clearCarrier();
    this.NciInfo.Carrier = carrier.CarrierName;
    this.carrierSelectedItem.push(carrier);
    this.validCarrierResponse = null;
}


  //get Reasons
  getReasons() {
    this.spinner.show();
    this.primayReasonList = [];
    let requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const getReasonsUrl = String.Join("/", this.apiConfigService.getReasonsUrl);
    this.apiservice.apiPostRequest(getReasonsUrl, requestObj)
      .subscribe(response => {
        let res = response.body;
        this.spinner.hide();
        if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
          if (!checkNullorUndefined(res.Response.Reasons)) {
            this.primayReasonList = res.Response.Reasons;
          }
        } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }

  //get Route1
  getRoute1() {
    this.spinner.show();
    this.route1List=[];
    let requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const getRoutesUrl = String.Join("/", this.apiConfigService.getRoutesUrl,'Route1');
    this.apiservice.apiPostRequest(getRoutesUrl, requestObj)
      .subscribe(response => {
        let res = response.body;
        this.spinner.hide();
        if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
          if (!checkNullorUndefined(res.Response.Route1)) {
            res.Response.Route1.forEach(element => {
              let dd: dropdown = new dropdown();
              dd.Id = element.Text;
              dd.Text = element.Text;
              this.route1List.push(dd);
            });
          }
        } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }

  //get Route2
  getRoute2() {
    this.spinner.show();
    this.route2List=[];
    let requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const getRoutesUrl = String.Join("/", this.apiConfigService.getRoutesUrl,'Route2');
    this.apiservice.apiPostRequest(getRoutesUrl, requestObj)
      .subscribe(response => {
        let res = response.body;
        this.spinner.hide();
        if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
          if (!checkNullorUndefined(res.Response.Route2)) {
            res.Response.Route2.forEach(element => {
              let dd: dropdown = new dropdown();
              dd.Id = element.Text;
              dd.Text = element.Text;
              this.route2List.push(dd);
            });
          }
        } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }

  //get Route3
  getRoute3() {
    this.spinner.show();
    this.route3List=[];
    let requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const getRoutesUrl = String.Join("/", this.apiConfigService.getRoutesUrl,'Route3');
    this.apiservice.apiPostRequest(getRoutesUrl, requestObj)
      .subscribe(response => {
        let res = response.body;
        this.spinner.hide();
        if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
          if (!checkNullorUndefined(res.Response.Route3)) {
            res.Response.Route3.forEach(element => {
              let dd: dropdown = new dropdown();
              dd.Id = element.Text;
              dd.Text = element.Text;
              this.route3List.push(dd);
            });
          }
        } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }

  //getVendors
  getVendors(){
    this.spinner.show();
    this.vendorList = [];
    let requestObj = { ClientData: this.clientData, UIData: this.uiData };
    this.apiservice.apiPostRequest(this.apiConfigService.getVendorsUrl, requestObj)
    .subscribe(response => {
      let res = response.body;     
      if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
          if (!checkNullorUndefined(res.Response)) {
            res.Response.forEach(element => {
            let dd: dropdown = new dropdown();
              dd.Id = element.VendorId;
              dd.Text = element.VendorName;
            this.vendorList.push(dd);
          });
        }
         this.spinner.hide();
      } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
       this.spinner.hide();
        this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
      }
    }, erro => {
      this.appErrService.handleAppError(erro);
    });

  }

  getNciId() {
    this.spinner.show();
    // this.Clear();
    let requestObj = { ClientData: this.clientData, UIData: this.uiData };
    this.apiservice.apiPostRequest(this.apiConfigService.getNciId, requestObj)
      .subscribe(response => {
        let res = response.body;
        this.spinner.hide();
        if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
          if (!checkNullorUndefined(res.Response)) {
            this.NciInfo.NCIKey = res.Response;
            this.isAddNciId = true;
          }
        } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }

  //get Nci Data
  getNciData() {
    this.spinner.show();
    this.Clear();
    let requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const getNciUrl = String.Join("/", this.apiConfigService.getNciUrl, this.nciId);
    this.apiservice.apiPostRequest(getNciUrl, requestObj)
      .subscribe(response => {
        let res = response.body;
        this.spinner.hide();
        this.nciId = null;
        if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
          if (!checkNullorUndefined(res.Response)) {           
            if (res.Response.length > 0) {
              this.onNciListGenerateJsonGrid(res.Response);
              this.grid = new Grid();
              this.grid.EditVisible = true;
              this.grid.ItemsPerPage = this.appConfig.nci.griditemsPerPage;
              this.nciList = this.appService.onGenerateJson(this.nciListResponse, this.grid);
            }
          }
          
        } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          this.setFocus('nciIdsearch');
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });

  }

  //insert NCI
  insertNci() {
    this.spinner.show();
    let requestObj = { ClientData: this.clientData, UIData: this.uiData, Nci: this.NciInfo };
    this.apiservice.apiPostRequest(this.apiConfigService.insertNciUrl, requestObj)
      .subscribe(response => {
        let res = response.body;
        this.spinner.hide();
        if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
          if (!checkNullorUndefined(res.Response)) {
            this.snackbar.success(res.Response);
          }
          if (this.isNciPrint) {
            this.createNciLabel();
          }
          this.Clear();
        } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }


  //update Nci
  updateNci() {
    this.spinner.show();
    let requestObj = { ClientData: this.clientData, UIData: this.uiData, Nci: this.NciInfo };
    this.apiservice.apiPostRequest(this.apiConfigService.updateNciUrl, requestObj)
      .subscribe(response => {
        let res = response.body;
        this.spinner.hide();
       if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
          if (!checkNullorUndefined(res.Response)) {
            this.snackbar.success(res.Response);
          }
          if (this.isNciPrint) {
            this.createNciLabel();
          }
          this.showSave = true;
          this.Clear(); 
        } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }

  //on nci grid edit
  editNciDetailRow(event) {
    this.disabledControls();
    this.showSave = false;
    this.NciInfo = event;
    this.NciInfo.VendorId = event.VendorId;
    this.NciInfo.VendorName = event.VendorName;
    this.editTypeAhead = event.Sku;
    this.clearTypeAhead = false;
    this.loadReasonOnEdit();   
    this.clearCarrier();
    if (!checkNullorUndefined(this.NciInfo.Carrier) && this.NciInfo.Carrier != "") {
      this.carrierOptions.forEach(element => {
        if (element.CarrierName == this.NciInfo.Carrier) {
          this.carrierSelectedItem.push(element);
        }
      });     
    }
    else {
      this.carrierSelectedItem;
    }
    if (!checkNullorUndefined(this.NciInfo.DispositionDate) && this.NciInfo.DispositionDate != "") {
      this.NciInfo.DispositionDate = moment(this.NciInfo.DispositionDate).format('YYYY-MM-DD');
    }
    this.hideModal();
  }

  //nci search Model
  openModal() {
    this.dialogRef = this.dialog.open(this.nciSearchTemplate, {
      hasBackdrop: true,
      disableClose: true,
      panelClass: 'dialog-width-lg'
    });
    this.setFocus('nciIdsearch');
  }


  setFocus(id) {
    window.setTimeout(function () {
        let inputElement = <HTMLInputElement>document.getElementById(id);
        if (inputElement) {
            inputElement.focus();
        }
    }, 300);
  }

  //close the modal
  hideModal() {    
    this.dialogRef.close()
    this.appErrService.setAlert("", false);
    this.appErrService.clearAlert();
    this.nciList = null;
    this.nciId = null;
  }

  //Print
  createNciLabel() {
    this.spinner.show();
    let requestObj = { ClientData: this.clientData, UIData: this.uiData, Nci: this.NciInfo };
    const createLabelUrl = String.Join("/", this.apiConfigService.createLabelUrl, this.uiData.OperationId);
    this.apiservice.apiPostRequest(createLabelUrl, requestObj)
      .subscribe(response => {
        let res = response.body;
        this.spinner.hide();
        if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
        }
      }, erro => {
        this.appErrService.handleAppError(erro);
      });
  }

  //checking nci value is there or not
  checkNciId(){
    if(!checkNullorUndefined(this.NciInfo.NCIKey)){
        return true;
    }
    else{
      return false;
    }
  }

  //populating reasons dropdown on edit
  loadReasonOnEdit() {
    this.reason2List = [];
    this.reason3List = [];
    this.clearReasons();
    if (!checkNullorUndefined(this.NciInfo.PrimaryReason) && this.NciInfo.PrimaryReason != "") {
      this.primayReasonList.forEach(element => {
        if (element.Text == this.NciInfo.PrimaryReason) {
          this.primarySelectedItem.push(element);
        }
      }); 
      this.isReasoan2Disabled = false;       
      this.reason2List = this.primayReasonList.filter(elemetn => elemetn.Text != this.NciInfo.PrimaryReason);
    }
    else {
      this.primarySelectedItem;
    }

    //reason2
    if (!checkNullorUndefined(this.NciInfo.Reason2) && this.NciInfo.Reason2 != "") {
      this.reason2List.forEach(element => {
        if (element.Text == this.NciInfo.Reason2) {
          this.reason2SelectedItem.push(element);
        }       
      }); 
      this.isReasoan3Disabled = false;   
      this.reason3List = this.reason2List.filter(elemetn => elemetn.Text != this.NciInfo.Reason2);
    }else {
      this.reason2SelectedItem;
    }
     //reason3
    if (!checkNullorUndefined(this.NciInfo.Reason3) && this.NciInfo.Reason3 != "") {
      this.reason3List.forEach(element => {
        if (element.Text == this.NciInfo.Reason3) {
          this.reason3SelectedItem.push(element);
        }
      });      
    } else {
      this.reason3SelectedItem;
    }
  }

  primaryReasonDeselect() {
    this.isReasoan2Disabled = true;
    this.isReasoan3Disabled = true;
    this.reason2SelectedItem = [];
    this.reason3SelectedItem = [];
    this.NciInfo.PrimaryReason="";
    this.NciInfo.Reason2="";
    this.NciInfo.Reason3="";
    this.NciInfo.PrimaryReasonCd = null;
    this.NciInfo.ReasonCd2 = null;
    this.NciInfo.ReasonCd3 = null;
  }

  reason2Deselect() {
    this.isReasoan3Disabled = true;
    this.reason3SelectedItem = [];
    this.NciInfo.Reason2="";
    this.NciInfo.Reason3="";
    this.NciInfo.ReasonCd2 = null;
    this.NciInfo.ReasonCd3 = null;
  }

  reason3Deselect() {   
    this.NciInfo.Reason3="";
    this.NciInfo.ReasonCd3 = null;
  }

  carrierDeselect(){
    this.NciInfo.Carrier = "";
    this.NciInfo.CarrierCode = "";
  }

  onNciListGenerateJsonGrid(Response) {
    if (!checkNullorUndefined(Response)) {
      this.nciListResponse = [];
      let headingsobj = Object.keys(Response[0]);
      Response.forEach(res => {
        let element: any = {};
        headingsobj.forEach(singleheader => {
          if (!checkNullorUndefined(res[singleheader]) && typeof (res[singleheader]) == "object") {
            Object.keys(res[singleheader]).forEach(data => {
              element[data] = res[singleheader][data];
            });
          }
          else {
          element[singleheader] = res[singleheader];
          }
        })
        this.nciListResponse.push(element);
      });
    }
  }

  //clearing the reason dropdowns
  clearReasons() {
    this.primarySelectedItem = [];
    this.reason2SelectedItem = [];
    this.reason3SelectedItem = [];
  }

  //clearing the carrier dropdown
  clearCarrier() {
    this.carrierSelectedItem = [];
  }

  //disabling on update mode  
  disabledControls() {
    this.isAddNciId = true;
    this.isSKUSelected = true;
    this.isDockTypeDisabled = false;
    this.isDocValueDisabled = false;
    this.isQantityExpDisabled = false;
    this.isQuantityRecpDisabled = false;
    this.isSerialNumberDisabled =false; 
    this.isPrimayReasonDisabled = false;
    this.isCommentsDisabled = false;
    this.isRoute1Disabled = false;
    this.isRoute2Disabled = false;
    this.isRoute3Disabled = false;
    this.isVendorDisabled = false;
    this.carrierDisabled = false;
    this.isCarrierRefDisabled = false;
  }

  //Nci Clear
  Clear() {
    this.clearTypeAhead = true;
    this.editTypeAhead = null;
    this.NciInfo = new NciInfo();
    this.nciForm.reset({
      Status: this.statusOptions.length > 0 ? this.statusOptions[0].Text : '',
      DockType: this.dockTypeOptions.length > 0 ? this.dockTypeOptions[0].Text : ''

    });
    if (!checkNullorUndefined(this.rmtypeaheadChild)) {
      this.rmtypeaheadChild.SKU = '';
    }
    this.clearReasons();
    this.clearCarrier();
    this.NciInfo.DispositionDate = "";
    this.isSKUSelected = false;
    this.showSave = true;
    this.isAddNciId = false;
    this.isNciPrint = true;
    this.isDockTypeDisabled = false;
    this.isDocValueDisabled = false;
    this.isQantityExpDisabled = false;
    this.isQuantityRecpDisabled = false;
    this.isSerialNumberDisabled = false;    
    this.isPrimayReasonDisabled = false;
    this.isReasoan2Disabled = true;
    this.isReasoan3Disabled = true;
    this.isCommentsDisabled = false;
    this.isRoute1Disabled = false;
    this.isRoute2Disabled = false;
    this.isRoute3Disabled = false;
    this.isVendorDisabled = false;
    this.carrierDisabled = false;
    this.isCarrierRefDisabled = false;
    this.appErrService.clearAlert();
  }


  ngOnDestroy() {
    this.Clear();
    this.statusOptions = [];
    this.primayReasonList = [];
    this.reason2List = [];
    this.reason3List = [];
    this.dispositionOptions = [];
    this.dockTypeOptions = [];
    this.route1List = [];
    this.route2List = [];
    this.route3List = [];
    this.carrierOptions = [];
    this.appErrService.clearAlert();
    this.nciId = null;
    if (this.masterPageService.hideControls.controlProperties) {
      this.masterPageService.hideControls.controlProperties = new EngineResult();
    }
    if (this.dialogRef) {
      this.dialogRef.close();
    }
    this.masterPageService.hideDialog();
  }

}
