import { Component, OnInit, ViewChild, OnDestroy, Input, ElementRef, TemplateRef } from '@angular/core';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';
import { ApiConfigService } from '../../utilities/rlcutl/api-config.service';
import { ApiService } from '../../utilities/rlcutl/api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';
import { AppService } from '../../utilities/rlcutl/app.service';
import { ClientData } from '../../models/common/ClientData';
import { UiData } from '../../models/common/UiData';
import { Grid } from '../../models/common/Grid';
import { String, StringBuilder } from 'typescript-string-operations';
import { interval, Observable, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { dropdown } from '../../models/common/Dropdown';
import { AuditResults } from '../../models/maintenance/recordaudit/RecordAuditInfo';
import { AuditPoints } from '../../models/maintenance/audit/AuditInfo';
import { EngineResult } from '../../models/common/EngineResult';
import { LoginService } from '../../services/login.service';
import { TraceTypes } from '../../enums/traceType.enum';
import { CommonService } from '../../services/common.service';
import { FindTraceHoldComponent } from '../../framework/busctl/find-trace-hold/find-trace-hold.component';
import { MessageType } from '../../enums/message.enum';
import { StorageData } from '../../enums/storage.enum';
import { StatusCodes } from '../../enums/status.enum';
import { RmtextboxComponent } from '../../framework/frmctl/rmtextbox/rmtextbox.component';
import { CommonEnum } from '../../enums/common.enum';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-record-audit',
  templateUrl: './record-audit.component.html',
  styleUrls: ['./record-audit.component.css']
})
export class RecordAuditComponent implements OnInit, OnDestroy {

  // Client Control Labels
  clientData = new ClientData();
  uiData = new UiData();
  operationObj: any;
  numberPattern: any;
  // grid
  grid: Grid;
  gridData: any;
  processQueData = [];
  clear: any;
  pollingData: any;


  appConfig: any;
  recordAuditList: any;

  auditResult = new AuditResults();
  auditPoint = new AuditPoints();

  isCompleteDisabled = true;

  isClearDisabled = true;
  isResetDisabled = true;
  isSerialnumberDisabled = true;
  isCycleDisabled = false;
  isAuditCheckDisabled = false;
  isAddtionalDetailsDisabled = true;
  isCycleNumberDisabled = true;
  isValidateDisabled = true;
  auditList = [];
  auditCheckList = [];
  recordAuditDesc: string;
  addtionalAuditDetails: string;
  seletedAuditCheck: any;
  cyleNumber: any;
  isAdditionalAuditDetailDisabled = true;
  tempProcessAuditRecordList = [];
  editAuditRecordIndex: any;
  serialAuditResultsList = [];
  detailType: any;
  auditDetailValues = [];
  isAddAuditCheckDisabled = false;
  detailValues = '';
  validateseletedAuditCheck: any;
  emitHideSpinner: Subscription;
  deleteAuditRecordIndex: any;
  modeltitle: string;
  selectedDeleteElement: any;
  auditResultsData: any;
  validSerialResponse: any;
  traceTypes = TraceTypes;
  storageData = StorageData;
  statusCode = StatusCodes;
  controlConfig: any;
  dialogRef: any;

  constructor(
    private apiService: ApiService,
    private apiConfigService: ApiConfigService,
    private spinner: NgxSpinnerService,
    private snackbar: XpoSnackBar,
    public appErrService: AppErrorService,
    public masterPageService: MasterPageService,
    public appService: AppService,
    public loginService: LoginService,
    private commonService: CommonService,
    private dialog: MatDialog

  ) {

    const pattern = JSON.parse(localStorage.getItem(StorageData.patternList));
    if (!this.appService.checkNullOrUndefined(pattern)) {
      this.numberPattern = new RegExp(pattern.cyclePattern);
    }

    // emitting hide spinner
    this.emitHideSpinner = this.masterPageService.emitHideSpinner.subscribe(spinnerFlag => {
      if (!this.appService.checkNullOrUndefined(spinnerFlag) && spinnerFlag) {
        this.loadAudits();
        this.getProcessQueue();
        this.loginService.getRoleCapabilities(this.uiData);
      }
    });
  }

  ngOnInit() {
    this.operationObj = this.masterPageService.getRouteOperation();
    if (this.operationObj) {
      this.uiData.OperationId = this.operationObj.OperationId;
      this.uiData.OperCategory = this.operationObj.Category;
      this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
      this.controlConfig = JSON.parse(localStorage.getItem(this.storageData.controlConfig));
      // setting value to hidespinner (based on this value we are emiting emithidespinner method)
      this.masterPageService.hideSpinner = true;
      this.masterPageService.setTitle(this.operationObj.Title);
      this.masterPageService.setModule(this.operationObj.Module);
      this.appConfig = JSON.parse(localStorage.getItem(this.storageData.appConfig));
      this.masterPageService.setCardHeader('Audit Results');
      localStorage.setItem(this.storageData.module, this.operationObj.Module);
      this.appErrService.appMessage();
      this.appService.setFocus('audit');
    }
  }




  // get process que
  getProcessQueue() {
    const timeinterval: number = this.appConfig.audit.queueInterval;
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getAuditQueueDataUrl);
    this.clear = document.getElementById('stopProcessQueue');
    // const stop$ = Observable.fromEvent(this.clear, 'click');
    this.pollingData = interval(timeinterval).pipe(
      startWith(0),
      switchMap(() => this.apiService.apiPostRequest(url, requestObj)))
      .subscribe(response => {
        const res = response.body;
        if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
          this.onProcessQueGenerateJsonGrid(res.Response);
          this.grid = new Grid();
          this.grid.SearchVisible = false;
          this.masterPageService.tempQueList = this.appService.onGenerateJson(this.processQueData, this.grid);
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
          this.spinner.hide();
          this.masterPageService.tempQueList = null;
          // this.pollingData.unsubscribe();
          // this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          // this.snackbar.error(res.ErrorMessage.ErrorDetails);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }

  // onProcessQueGenerateJsonGrid
  onProcessQueGenerateJsonGrid(response) {
    if (!this.appService.checkNullOrUndefined(response)) {
      this.processQueData = [];
      response.forEach(res => {
        const element: any = {};
        element.SerialNumber = res.SerialNumber;
        element.CycleNumber = res.CycleNumber;
        element.CheckCode = res.CheckCode;
        element.Audit_Id = res.Audit_Id;
        element.AuditDetail = res.AuditDetail;
        element.Auditor = res.Auditor;
        element.Completed = res.Completed_YN;
        element.AuditDateTime = res.AuditDateTime;
        this.processQueData.push(element);
      });
    }
  }

  // load audits
  loadAudits() {
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.LoadAduitsUrl);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const result = response.body;
        this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.pass) {
          if (!this.appService.checkNullOrUndefined(result.Response) && result.Response.length > 0) {
            this.auditList = [];
            result.Response.forEach((element) => {
              const dd: dropdown = new dropdown();
              dd.Id = element.Id;
              dd.Text = element.Text;
              this.auditList.push(dd);
            });
          }
        } else if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }


  // onAuditChange
  onAuditChange(event) {
    this.appErrService.clearAlert();
    this.spinner.show();
    this.auditPoint.Audit_Id = event.value;
    this.auditPoint.AuditCode = event.source.selected.viewValue;
    this.clearOnAuditPointChange();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.LoadAduitsChecksUrl, this.auditPoint.Audit_Id.toString());
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const result = response.body;
        this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.pass) {
          this.auditPoint = result.Response;
          if (this.auditPoint.AuditPointChecks.length) {
            this.auditCheckList = [];
            this.auditPoint.AuditPointChecks.forEach((element) => {
              const dd: dropdown = new dropdown();
              dd.Id = element.Check_Id.toString();
              dd.Text = element.CheckCode;
              this.auditCheckList.push(dd);
            });
            this.settingDefaultAuditCheck();
          } else {
            this.auditPoint.AuditPointChecks = [];
            this.auditCheckList = [];
            this.recordAuditDesc = '';
            this.addtionalAuditDetails = '';
            this.isValidateDisabled = true;
          }
        } else if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.fail) {
          this.isSerialnumberDisabled = true;
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }


  // settingDefaultAuditCheck
  settingDefaultAuditCheck() {
    if (this.auditPoint.AuditPointChecks.length == 1) {
      this.setRecordAudit(this.auditPoint.AuditPointChecks[0].Check_Id, this.auditPoint.AuditPointChecks[0].CheckDesc, this.auditPoint.AuditPointChecks[0].DetailRequired, this.auditPoint.AuditPointChecks[0].DetailType, this.auditPoint.AuditPointChecks[0].DetailValues);
    } else if (this.auditPoint.AuditPointChecks.length > 1) {
      const checkDefaultAuditCheck = this.auditPoint.AuditPointChecks.find(a => a.Default_YN == CommonEnum.yes);
      if (!this.appService.checkNullOrUndefined(checkDefaultAuditCheck)) {
        this.setRecordAudit(checkDefaultAuditCheck.Check_Id, checkDefaultAuditCheck.CheckDesc, checkDefaultAuditCheck.DetailRequired, checkDefaultAuditCheck.DetailType, checkDefaultAuditCheck.DetailValues);
        return;
      } else {
        const positionList = [];
        this.auditPoint.AuditPointChecks.forEach((element) => {
          positionList.push(element.Position);
        });
        const firstPostion = Math.min.apply(null, positionList);
        const checkPostionForAuditCheck = this.auditPoint.AuditPointChecks.find(a => a.Position == firstPostion);
        this.setRecordAudit(checkPostionForAuditCheck.Check_Id, checkPostionForAuditCheck.CheckDesc, checkPostionForAuditCheck.DetailRequired, checkPostionForAuditCheck.DetailType, checkPostionForAuditCheck.DetailValues);
        return;
      }
    }
  }


  // onChangeAuditCheck
  onChangeAuditCheck(data) {
    this.appErrService.clearAlert();
    const seletedAuditCheck = this.auditPoint.AuditPointChecks.find(c => c.Check_Id == data.Id);
    seletedAuditCheck.DetailRequired = '';
    this.setRecordAudit(seletedAuditCheck.Check_Id, seletedAuditCheck.CheckDesc, seletedAuditCheck.DetailRequired, seletedAuditCheck.DetailType, seletedAuditCheck.DetailValues);
  }
  // setRecordAudit
  setRecordAudit(Check_Id, CheckDesc, DetailRequired, DetailType, DetailValues) {
    this.recordAuditDesc = '';
    this.addtionalAuditDetails = '';
    this.detailValues = '';
    this.detailType = '';
    this.recordAuditDesc = CheckDesc;
    DetailRequired = '';
    this.seletedAuditCheck = this.auditCheckList.find(a => a.Id == Check_Id);
    this.detailType = DetailType;
    if (this.detailType == 'LIST') {
      this.loadDropdownAddtionalDetial(DetailValues);
      this.isAddAuditCheckDisabled = false;
    } else if (this.detailType == 'REGEXP') {
      this.isAddtionalDetailsDisabled = false;
      this.isValidateDisabled = true;
      this.isAddAuditCheckDisabled = true;

    } else if (this.detailType == 'NULL') {
      this.isAddtionalDetailsDisabled = true;
      this.isValidateDisabled = true;
      this.isAddAuditCheckDisabled = false;
    }
    this.validateseletedAuditCheck = this.auditPoint.AuditPointChecks.find(c => c.Check_Id == Check_Id);
    this.validateseletedAuditCheck.DetailRequired = DetailRequired;
  }


  // set dropdown detail type LIST
  loadDropdownAddtionalDetial(detailvalues) {
    if (detailvalues.length > 0) {
      this.auditDetailValues = [];
      detailvalues.forEach((element) => {
        const dd: dropdown = new dropdown();
        dd.Id = element;
        dd.Text = element;
        this.auditDetailValues.push(dd);
      });
    }
  }

  // set Dropdown Change
  auditValidateChange(event) {
    this.appErrService.clearAlert();
    this.validateseletedAuditCheck.DetailRequired = event;
    if (this.validateseletedAuditCheck.DetailRequired != '') {
      this.isValidateDisabled = false;
      this.isAddAuditCheckDisabled = true;
    } else {
      this.isValidateDisabled = true;
      this.isAddAuditCheckDisabled = true;
    }
  }

  // onAddtionalDetailsValues dropdown change
  onAddtionalDetailsChange(val) {
    this.appErrService.clearAlert();
    this.detailValues = val;
    this.isAddAuditCheckDisabled = false;

  }
  // valiate Reg expression
  validateRegExpression() {
    this.appErrService.clearAlert();
    if (!this.isValidateDisabled) {
      this.spinner.show();
      const requestObj = { ClientData: this.clientData, UIData: this.uiData, AuditCheckPoint: this.validateseletedAuditCheck };
      const url = String.Join('/', this.apiConfigService.validateAuditDetailValueUrl);
      this.apiService.apiPostRequest(url, requestObj)
        .subscribe(response => {
          const result = response.body;
          this.spinner.hide();
          if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.pass) {
            this.isValidateDisabled = true;
            this.isAddtionalDetailsDisabled = true;
            this.isAddAuditCheckDisabled = false;
            this.isClearDisabled = false;
          } else if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.fail) {
            this.spinner.hide();
            this.appErrService.setAlert(result.Response, true);
            this.isAddtionalDetailsDisabled = false;
          }
        },
          error => {
            this.appErrService.handleAppError(error);
          });
    }

  }

  // validateSerialnumber
  validateSerialnumber(serialNumber, inputControl: RmtextboxComponent) {
    this.spinner.show();
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, AuditPoint: this.auditPoint };
    const url = String.Join('/', this.apiConfigService.validateSerialNumberUrl, serialNumber);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const result = response.body;
        this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.pass) {
          this.validSerialResponse = response.body;
          const traceData = { traceType: this.traceTypes.serialNumber, traceValue: serialNumber, uiData: this.uiData }
          const traceResult = this.commonService.findTraceHold(traceData, this.uiData);
          traceResult.subscribe(result => {
            if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.pass) {
              if (this.appService.checkNullOrUndefined(result.Response)) {
                this.validSerialNumber();
              } else {
                this.canProceed(result, this.traceTypes.serialNumber);
              }
              this.spinner.hide();
            } else if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.fail) {
              this.spinner.hide();
              this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
            }
          });
        } else if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.fail) {
          this.spinner.hide();
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
          inputControl.applyRequired(true);
          inputControl.applySelect();
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }

  canProceed(traceResponse, type) {
    if (traceResponse.Response.canProceed == CommonEnum.yes) {
      this.appErrService.setAlert(traceResponse.StatusMessage, true, MessageType.info);
    }
    if (!this.appService.checkNullOrUndefined(traceResponse.Response.TraceHold)) {
      const uiObj = { uiData: this.uiData }
      traceResponse = Object.assign(traceResponse, uiObj);
      this.dialogRef = this.dialog.open(FindTraceHoldComponent, { hasBackdrop: true, disableClose: true, panelClass: 'dialog-width-sm', data: { modalData: traceResponse } });
      this.dialogRef.afterClosed().subscribe((returnedData) => {
        if (returnedData) {
          if (returnedData.Response.canProceed == CommonEnum.yes) {
            if (type == this.traceTypes.serialNumber) {
              this.validSerialNumber();
            }
          } else if (returnedData.Response.canProceed == CommonEnum.no) {
            this.appErrService.setAlert(returnedData.StatusMessage, true);
          }
        }
      });
    }
  }


  validSerialNumber(result = this.validSerialResponse) {
    this.isResetDisabled = false;
    this.auditResult.CycleNumber = result.Response.Device.CycleNumber;
    if (!this.appService.checkNullOrUndefined(result.Response.AuditResults) && result.Response.AuditResults.length) {
      result.Response.AuditResults.forEach(res => {
        const element: any = {};
        element.SeqId = res.SeqId;
        element.SerialNumber = res.SerialNumber;
        element.CycleNumber = res.CycleNumber;
        element.CheckCode = res.CheckCode;
        element.Audit_Id = res.Audit_Id;
        element.AuditDetail = res.AuditDetail;
        element.Completed = res.Completed_YN;
        element.isUpdated = res.isUpdated;
        element.Check_Id = res.Check_Id;
        this.tempProcessAuditRecordList.push(element);
      });
      this.grid = new Grid();
      this.configGridProps();
      this.grid.PaginationId = 'auditRecordList';
      this.recordAuditList = this.appService.onGenerateJson(this.tempProcessAuditRecordList, this.grid);
      this.serialAuditResultsList = this.recordAuditList;
    }
    this.isSerialnumberDisabled = true;
    this.isClearDisabled = false;
    this.validSerialResponse = null;

  }

  // addAuditRecord -- on add btn click  adding data to grid
  addAuditRecord() {
    if (!this.appService.checkNullOrUndefined(this.recordAuditList)) {
      if (!this.appService.checkNullOrUndefined(this.editAuditRecordIndex)) {
        const editAuditRecord = this.recordAuditList['Elements'][this.editAuditRecordIndex];
        editAuditRecord.SerialNumber = this.auditResult.SerialNumber;
        editAuditRecord.CycleNumber = this.auditResult.CycleNumber;
        editAuditRecord.CheckCode = this.seletedAuditCheck.Text;
        const currentCheckObj = this.auditPoint.AuditPointChecks.find(c => c.Check_Id == this.seletedAuditCheck.Id);
        editAuditRecord.Check_Id = currentCheckObj.Check_Id;
        if (this.detailType == 'LIST') {
          editAuditRecord.AuditDetail = this.detailValues;
        } else if (this.detailType == 'REGEXP' || this.detailType == 'NULL') {
          editAuditRecord.AuditDetail = this.addtionalAuditDetails;
        }
        editAuditRecord.Completed_YN = '';
        editAuditRecord['isUpdated'] = CommonEnum.yes;
        this.isAddAuditCheckDisabled = true;
      } else {
        if (this.auditPoint.AuditPointChecks.length > 0) {
          this.AddNewAuditRecord();
        }
      }
    } else {
      if (this.auditPoint.AuditPointChecks.length > 0) {
        this.AddNewAuditRecord();
      }
    }
    this.isClearDisabled = false;
    this.isAuditCheckDisabled = false;
    this.isCompleteDisabled = false;
    this.editAuditRecordIndex = null;
    if (!this.appService.checkNullOrUndefined(this.recordAuditList)) {
      this.auditResultsData = this.recordAuditList['Elements'];
      this.auditResultsData.forEach((element) => {
        delete element['isEdit'];
      });
    }
  }


  private AddNewAuditRecord() {
    this.tempProcessAuditRecordList = [];
    if (!this.appService.checkNullOrUndefined(this.recordAuditList)) {
      this.tempProcessAuditRecordList = this.tempProcessAuditRecordList.concat(this.recordAuditList['Elements']);
    }
    const element: any = {};
    element.SerialNumber = this.auditResult.SerialNumber;
    element.CycleNumber = this.auditResult.CycleNumber;
    element.CheckCode = this.seletedAuditCheck.Text;
    const currentCheckObj = this.auditPoint.AuditPointChecks.find(c => c.Check_Id == this.seletedAuditCheck.Id);
    element.Check_Id = currentCheckObj.Check_Id;
    element.DetailType = this.detailType;
    if (this.addtionalAuditDetails) {
      element.AuditDetail = this.addtionalAuditDetails;
    } else {
      element.AuditDetail = this.detailValues;
    }
    element.Completed = '';
    element['isUpdated'] = CommonEnum.yes;



    this.tempProcessAuditRecordList.push(element);
    this.grid = new Grid();
    this.configGridProps();
    this.grid.PaginationId = 'auditRecordList';
    this.recordAuditList = this.appService.onGenerateJson(this.tempProcessAuditRecordList, this.grid);
    this.isAddAuditCheckDisabled = true;
  }


  private configGridProps() {
    if (!this.appService.checkNullOrUndefined(this.loginService.roleCapabilities)) {
      if (Object.keys(this.loginService.roleCapabilities).length > 0) {
        this.grid.EditVisible = this.loginService.roleCapabilities.editAuditResult == CommonEnum.yes ? true : false;
        this.grid.DeleteVisible = true
      } else {
        this.grid.EditVisible = true;
        this.grid.DeleteVisible = true;
      }
    }
  }
  // editAuditRecordDetailRow
  editAuditRecordDetailRow(event) {
    this.recordAuditList['Elements'].forEach(element => {
      element['isEdit'] = false;
    });
    event['isEdit'] = true;
    this.auditResult = new AuditResults();
    this.auditResult = Object.assign(this.auditResult, event);
    if (event.Completed == CommonEnum.yes) {
      const currentAuditCheck = this.auditPoint.AuditPointChecks.find(c => c.Check_Id == event.Check_Id);
      this.setRecordAudit(currentAuditCheck.Check_Id, currentAuditCheck.CheckDesc, currentAuditCheck.DetailRequired, currentAuditCheck.DetailType, currentAuditCheck.DetailValues);
    } else {
      this.detailType = event.DetailType;
    }

    if (this.detailType == 'LIST') {
      this.detailValues = event.AuditDetail;
    } else if (this.detailType == 'REGEXP' || this.detailType == 'NULL') {
      this.addtionalAuditDetails = event.AuditDetail;
      if (this.detailType == 'REGEXP') {
        this.isAddtionalDetailsDisabled = false;
      } else {
        this.isAddtionalDetailsDisabled = true;
      }
    }
    this.editAuditRecordIndex = this.recordAuditList['Elements'].findIndex(f => f.isEdit == true);
    this.seletedAuditCheck = this.auditCheckList.find(a => a.Id == event.Check_Id);
    this.isAuditCheckDisabled = true;
    this.isValidateDisabled = true;
  }

  // deleteAuditRecordDetailRow
  deleteAuditRecordDetailRow(event, deleteModal) {
    this.recordAuditList['Elements'].forEach(element => {
      element['isDelete'] = false;
    });
    event['isDelete'] = true;
    this.deleteAuditRecordIndex = this.recordAuditList['Elements'].findIndex(f => f.isDelete == true);
    this.openModal(deleteModal, 'dialog-width-sm');
  }

  deleteAudit() {
    this.selectedDeleteElement = this.recordAuditList['Elements'][this.deleteAuditRecordIndex];
    if (this.selectedDeleteElement.SeqId) {
      this.deleteAuditResults(this.selectedDeleteElement);
    } else {
      this.recordAuditList['Elements'].splice(this.deleteAuditRecordIndex, 1);
      this.dialogRef.close();
      if (this.recordAuditList['Elements'].length == 0) {
        this.isCompleteDisabled = true;
        this.isAddAuditCheckDisabled = false;
        this.recordAuditList = null;
      }
    }
  }

  openModal(template: TemplateRef<any>, modalclass: any) {
    // this.modalRef = this.modalService.show(template, { backdrop: 'static', keyboard: false, class: modalclass });
    this.dialogRef = this.dialog.open(template, {
      hasBackdrop: true,
      disableClose: true,
      panelClass: modalclass
    });
    // this.utilityTitle = status;
    this.modeltitle = 'Confirm Delete';
  }

  deleteAuditResults(deletedAudit) {
    this.spinner.show();
    const auditResultsData = this.recordAuditList['Elements'];
    if (!this.appService.checkNullOrUndefined(auditResultsData)) {
      auditResultsData.forEach((element) => {
        delete element['isDelete'];
      });
    }
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, AuditResults: deletedAudit };
    const url = String.Join('/', this.apiConfigService.deleteAuditResult);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const result = response.body;
        this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.pass) {
          if (!this.appService.checkNullOrUndefined(result.Response)) {
            this.snackbar.success(result.Response);
            this.recordAuditList['Elements'].splice(this.deleteAuditRecordIndex, 1);
            this.dialogRef.close();
            if (this.recordAuditList['Elements'].length == 0) {
              this.isCompleteDisabled = true;
              this.isAddAuditCheckDisabled = false;
              this.recordAuditList = null;
            }
          }
        } else if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.fail) {
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
          this.dialogRef.close();
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }

  // saveAuditResults
  saveAuditResults() {
    this.spinner.show();
    const auditResultsData = this.recordAuditList['Elements'];
    if (!this.appService.checkNullOrUndefined(auditResultsData)) {
      auditResultsData.forEach((element) => {
        delete element['isEdit'];
      });
    }
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, AuditResultsData: auditResultsData, AuditPoint: this.auditPoint };
    const url = String.Join('/', this.apiConfigService.saveAuditResultsrUrl);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        const result = response.body;
        this.spinner.hide();
        if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.pass) {
          if (!this.appService.checkNullOrUndefined(result.Response)) {
            this.snackbar.success(result.Response);
          }
          this.clearOnAuditPointChange();
        } else if (!this.appService.checkNullOrUndefined(result) && result.Status === this.statusCode.fail) {
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }

  // serialNumberClear
  serialNumberClear() {
    this.appService.setFocus('serialnumber');
    this.isSerialnumberDisabled = false;
    this.auditResult.CycleNumber = null;
    this.isCycleDisabled = true;
    this.auditResult.SerialNumber = '';
    this.serialAuditResultsList = [];
  }

  // clearOnAuditPointChange
  clearOnAuditPointChange() {
    this.isResetDisabled = true;
    this.serialNumberClear();
    this.clearAuditRecords();
  }


  // clearAuditRecords
  clearAuditRecords() {
    if (this.recordAuditList) {
      this.recordAuditList = null;
      if (!this.appService.checkNullOrUndefined(this.serialAuditResultsList['Elements'] && this.serialAuditResultsList['Elements'].length))
        this.recordAuditList = this.serialAuditResultsList;
    }
    this.editAuditRecordIndex = null;
    this.tempProcessAuditRecordList = [];
    this.isAuditCheckDisabled = false;
    this.isClearDisabled = true;
    this.isCompleteDisabled = true;
    this.isValidateDisabled = false;

    this.recordAuditDesc = '';
    this.addtionalAuditDetails = '';
    this.settingDefaultAuditCheck();
  }

  // resetAuditRecords
  resetAuditRecords() {
    this.isResetDisabled = true;
    this.isAddAuditCheckDisabled = true;
    this.isValidateDisabled = false;
    this.serialNumberClear();
    this.clearAuditRecords();
  }

  ngOnDestroy() {
    this.masterPageService.hideSpinner = false;
    this.emitHideSpinner.unsubscribe();
    this.masterPageService.emitHideSpinner.next(null);
    if (this.pollingData != undefined) {
      this.pollingData.unsubscribe();
      this.clear.click();
      this.masterPageService.tempQueList = null;
    }
    this.masterPageService.clearModule();
    this.appErrService.clearAlert();
    if (this.masterPageService.hideControls.controlProperties) {
      this.masterPageService.hideControls.controlProperties = new EngineResult();
    }
    if (this.dialogRef) {
      this.dialogRef.close();
    }
    this.masterPageService.hideDialog();
  }


}
