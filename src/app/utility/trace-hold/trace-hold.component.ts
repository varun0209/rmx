import { Component, OnInit, OnDestroy } from '@angular/core';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { ApiConfigService } from '../../utilities/rlcutl/api-config.service';
import { ApiService } from '../../utilities/rlcutl/api.service';
import { AppService } from '../../utilities/rlcutl/app.service';
import { UiData } from '../../models/common/UiData';
import { ClientData } from '../../../app/models/common/ClientData';
import { Grid } from '../../models/common/Grid';
import { Subscription } from 'rxjs';
import { String } from 'typescript-string-operations';
import { dropdown } from '../../models/common/Dropdown';
import { RxTraceInfo } from '../../models/utility/trace-hold';
import { EngineResult } from '../../models/common/EngineResult';
import { TraceTypes } from '../../enums/traceType.enum';
import { ValidTraceSerialNum } from '../../enums/validTraceSerialNum.enum';
import { CommonEnum } from '../../enums/common.enum';
import { TraceStatus } from '../../enums/traceStatus.enum';
import { StorageData } from '../../enums/storage.enum';
import { StatusCodes } from '../../enums/status.enum';
import { checkNullorUndefined } from '../../enums/nullorundefined';


@Component({
  selector: 'app-trace-hold',
  templateUrl: './trace-hold.component.html',
  styleUrls: ['./trace-hold.component.css']
})
export class TraceHoldComponent implements OnInit, OnDestroy {

  uiData = new UiData();
  operationObj: any;
  clientData = new ClientData();
  grid: Grid;
  emitHideSpinner: Subscription;

  traceTypesList: any[];
  traceStatusesList: any[];
  holdReasonsList: any[];
  rxTraceInfo: RxTraceInfo = new RxTraceInfo();
  tempRxTraceInfo: RxTraceInfo;
  rxTraceInfoList: any;
  tempRxTraceInfoList: any[];

  traceTypes = TraceTypes;
  validTraceSerialNum = ValidTraceSerialNum;
  commonButton = CommonEnum;
  traceStatus = TraceStatus;

  isClearBtnDisabled: boolean = true;
  isResetBtnDisabled: boolean = true;
  isValidateAddBtnFlag: boolean = true;
  isSearchBtnDisabled: boolean = true;

  isTraceTypeDisabled: boolean = false;
  isTraceValueDisabled: boolean = true;
  isTraceStatusDisabled: boolean = true;
  isInstructionsDisabled: boolean = true;
  isHoldReasonsDisabled: boolean = true;

  isValidTraceSerialNum: string;
  storedTraceValue: any;
  isEditTraceMode: boolean;
  temp;

  traceInstructionsLockMode: boolean = false;
  traceHoldReasonLockMode: boolean = false;
  traceStatusLockMode: boolean = false;
  traceTypeLockMode: boolean = false;
  selectedTraceType: string;
  selectedTraceStatus: string;
  selectedTraceHoldReason: String;
  selectedInstructions: string;
  selectedTraceReasonCode: string;
  traceBtnName: any;
  storageData = StorageData;
  statusCode = StatusCodes;
  allTraceStatusesList: any[] = [];

  constructor(public masterPageService: MasterPageService,
    public appErrService: AppErrorService,
    private spinner: NgxSpinnerService,
    private snackbar: XpoSnackBar,
    private apiConfigService: ApiConfigService,
    private apiService: ApiService,
    private appService: AppService
  ) {
    this.emitHideSpinner = this.masterPageService.emitHideSpinner.subscribe(spinnerFlag => {
      if (!checkNullorUndefined(spinnerFlag) && spinnerFlag) {
        this.getTraceTypes();
        this.getTraceStatuses();
        this.getHoldReasons();
      }
    });
  }

  ngOnInit() {
    this.operationObj = this.masterPageService.getRouteOperation();
    if (this.operationObj) {
      this.uiData.OperationId = this.operationObj.OperationId;
      this.uiData.OperCategory = this.operationObj.Category;
      this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
      //setting value to hidespinner (based on this value we are emiting emithidespinner method)
      this.masterPageService.hideSpinner = true;
      this.masterPageService.setTitle(this.operationObj.Title);
      this.masterPageService.setModule(this.operationObj.Module);
      localStorage.setItem(this.storageData.module, this.operationObj.Module);
      this.appErrService.appMessage();
      this.traceTypeFocus();
      this.traceBtnName = this.commonButton.add;
    }
  }

  //getTraceTypes
  getTraceTypes() {
    this.spinner.show();
    let requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join("/", this.apiConfigService.getTraceTypes);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let result = response.body;
        this.spinner.hide();
        if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) {
          if (!checkNullorUndefined(result.Response) && result.Response.TraceTypes && result.Response.TraceTypes.length > 0) {
            this.traceTypesList = [];
            result.Response.TraceTypes.forEach((element) => {
              let dd: dropdown = new dropdown();
              dd.Id = element.Id;
              dd.Text = element.Text;
              this.traceTypesList.push(dd);
            });
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

  //getTraceStatuses
  getTraceStatuses() {
    this.spinner.show();
    let requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join("/", this.apiConfigService.getTraceStatuses);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let result = response.body;
        this.spinner.hide();
        if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) {
          if (!checkNullorUndefined(result.Response) && result.Response.TraceStatuses && result.Response.TraceStatuses.length > 0) {
            this.traceStatusesList = [];
            result.Response.TraceStatuses.forEach((element) => {
              let dd: dropdown = new dropdown();
              dd.Id = element.Id;
              dd.Text = element.Text;
              this.traceStatusesList.push(dd);
            });
            this.allTraceStatusesList = [...this.traceStatusesList];
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

  // getHoldReasons
  getHoldReasons() {
    this.spinner.show();
    let requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join("/", this.apiConfigService.getHoldReasons);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let result = response.body;
        this.spinner.hide();
        if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) {
          if (!checkNullorUndefined(result.Response) && result.Response.HoldReasons && result.Response.HoldReasons.length > 0) {
            this.holdReasonsList = [];
            result.Response.HoldReasons.forEach((element) => {
              let dd: dropdown = new dropdown();
              dd.Id = element.Id;
              dd.Text = element.Text;
              this.holdReasonsList.push(dd);
            });
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

  //onChangeTraceType
  onChangeTraceType(val) {
    this.isClearBtnDisabled = false;
    this.isResetBtnDisabled = false;
    this.rxTraceInfo.TRACETYPE = val;
    this.isTraceValueDisabled = false;
    this.traceValueFocus();
    this.rxTraceInfo.TRACEVALUE = null;
    this.rxTraceInfo.STATUS = '';
  }

  //changeStatus
  changeStatus(val) {
    this.rxTraceInfo.STATUS = val;
    this.isClearBtnDisabled = false;
    this.isResetBtnDisabled = false;
    if (this.isValidTraceSerialNum == this.validTraceSerialNum.yes) {
      if (!this.traceHoldReasonLockMode) {
        this.isHoldReasonsDisabled = false;
        this.holdReasonFocus();
      }
    } else if (this.isValidTraceSerialNum == this.validTraceSerialNum.no) {
      if (!this.traceInstructionsLockMode) {
        this.isInstructionsDisabled = false;
        this.instructionsFocus();
      }
      if (this.rxTraceInfo.TRACETYPE === TraceTypes.containerID) {
        this.isHoldReasonsDisabled = false;
      }
    }
    if (!this.isEditTraceMode) {
      if (this.isValidTraceSerialNum != '' && this.isValidTraceSerialNum) {
        if (this.rxTraceInfo.STATUS == this.traceStatus.active) {
          this.isValidateAddBtnFlag = false;
        } else if (this.rxTraceInfo.STATUS == this.traceStatus.found || this.rxTraceInfo.STATUS == this.traceStatus.inActive) {
          this.isValidateAddBtnFlag = true;
        }
      }
    }
  }

  //traceTypeFocus
  traceTypeFocus() {
    this.appService.setFocus('traceType');
  }
  //traceValueFocus
  traceValueFocus() {
    this.appService.setFocus('traceValue');
  }
  //statusFocus
  statusFocus() {
    this.appService.setFocus('status');
  }

  //holdReasonFocus
  holdReasonFocus() {
    this.appService.setFocus('holdReason');
  }

  //instructionsFocus
  instructionsFocus() {
    this.appService.setFocus('instructions');
  }

  //changeInstructionsInput
  changeInstructionsInput(value) {
    this.isClearBtnDisabled = false;
    this.isResetBtnDisabled = false;
  }

  //changeHoldReason
  changeHoldReason(event) {
    this.isClearBtnDisabled = false;
    this.isResetBtnDisabled = false;
    this.rxTraceInfo.REASONCODE = event.value;
    this.rxTraceInfo.HOLDREASON = this.holdReasonsList.find(f => f.Id == this.rxTraceInfo.REASONCODE).Text;
    if (!this.traceInstructionsLockMode) {
      this.isInstructionsDisabled = false;
      this.instructionsFocus();
    }
  }

  //Validating Trace Value
  validateTraceValue(traceValue, validForm) {
    this.appErrService.clearAlert();
    this.spinner.show();
    let requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join("/", this.apiConfigService.validateTraceValue, this.rxTraceInfo.TRACETYPE, traceValue);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let result = response.body;
        this.spinner.hide();
        if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) {
          if (result.Response.hasOwnProperty('RX_TRACE_HOLDS') && result.Response.RX_TRACE_HOLDS.length) {
            if (result.StatusMessage !== '') {
              this.snackbar.info(result.StatusMessage);
            }
            this.onProcessTraceInfoJsonGrid(result.Response.RX_TRACE_HOLDS);
          } else {
            if (!checkNullorUndefined(result.Response.IsValidTraceSerialNum)) {
              this.traceActiveStatusOnly();
              if (!(this.rxTraceInfo.TRACETYPE === TraceTypes.containerID)) {
                this.isValidTraceSerialNum = result.Response.IsValidTraceSerialNum;
                this.isValidateAddBtnFlag = false;
              } else {
                this.isHoldReasonsDisabled = false;
                this.isValidTraceSerialNum = this.validTraceSerialNum.no;
              }
              // this.isValidTraceSerialNum = result.Response.IsValidTraceSerialNum;
              // this.isValidateAddBtnFlag = false;
              if (!this.checkAllAreLocked()) {
                this.setTraceFocus();
              } else {
                if (validForm) {
                  this.appService.setFocus('add');
                }
              }
              this.isTraceValueDisabled = true;
              this.isTraceTypeDisabled = true;
              if (!checkNullorUndefined(this.rxTraceInfo.STATUS)) {
                if (this.rxTraceInfo.STATUS == this.traceStatus.active) {
                  this.isValidateAddBtnFlag = false;
                } else if (this.rxTraceInfo.STATUS == this.traceStatus.found || this.rxTraceInfo.STATUS == this.traceStatus.inActive) {
                  this.isValidateAddBtnFlag = true;
                }
              }
            }
          }
        }
        else if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) {
          this.storedTraceValue = this.rxTraceInfo.TRACEVALUE;
          this.isValidateAddBtnFlag = true;
          this.spinner.hide();
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }

  private setTraceFocus() {
    if (this.isValidTraceSerialNum == this.validTraceSerialNum.yes) {
      if (this.rxTraceInfo.STATUS) {
        if (!this.traceHoldReasonLockMode) {
          this.isHoldReasonsDisabled = false;
          this.holdReasonFocus();
        }
        else {
          if (!this.traceInstructionsLockMode) {
            this.isInstructionsDisabled = false;
            this.instructionsFocus();
          }
          else {
            this.appService.setFocus('add');
          }
        }
      }
      else {
        this.statusFocus();
      }
    } else if (this.isValidTraceSerialNum == this.validTraceSerialNum.no) {
      if (this.rxTraceInfo.STATUS) {
        if (!this.traceInstructionsLockMode) {
          this.isInstructionsDisabled = false;
          this.instructionsFocus();
        } else {
          this.isInstructionsDisabled = true;
        }
      } else {
        this.statusFocus();
      }
    }
  }

  traceActiveStatusOnly() {
    this.traceStatusesList = this.traceStatusesList.filter(status => status.Id === this.traceStatus.active);
    if (this.traceStatusesList.length === 1) {
      this.rxTraceInfo.STATUS = this.traceStatusesList[0].Id;
    }
  }

  checkAllAreLocked() {
    if (this.isValidTraceSerialNum === this.validTraceSerialNum.yes) {
      if (this.traceTypeLockMode && this.traceStatusLockMode
        && this.traceInstructionsLockMode && this.traceHoldReasonLockMode) {
        return true;
      } else {
        return false;
      }
    } else if (this.isValidTraceSerialNum === this.validTraceSerialNum.no) {
      if (this.traceTypeLockMode && this.traceStatusLockMode
        && this.traceInstructionsLockMode) {
        return true;
      } else {
        return false;
      }
    }
  }


  //searchTraceInfo
  searchTraceInfo() {
    this.spinner.show();
    this.appErrService.clearAlert();
    let searchObject = { TRACETYPE: this.rxTraceInfo.TRACETYPE, TRACEVALUE: this.rxTraceInfo.TRACEVALUE, STATUS: this.rxTraceInfo.STATUS }
    let requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_TRACE_HOLD: searchObject };
    const url = String.Join("/", this.apiConfigService.searchTraceInfo);
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let result = response.body;
        this.spinner.hide();
        if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) {
          if (!checkNullorUndefined(result.Response) && result.Response.length > 0) {
            this.onProcessTraceInfoJsonGrid(result.Response);
            this.isResetBtnDisabled = false;
          }
        }
        else if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) {
          this.spinner.hide();
          this.rxTraceInfoList = null;
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });
  }

  //onProcessTraceInfoJsonGrid
  onProcessTraceInfoJsonGrid(Response: RxTraceInfo[]) {
    if (!checkNullorUndefined(Response)) {
      this.tempRxTraceInfoList = [];
      let headingsArray = Object.keys(Response[0]);
      Response.forEach(res => {
        let element: RxTraceInfo = new RxTraceInfo();
        headingsArray.forEach(singleTraceInfo => {
          element[singleTraceInfo] = res[singleTraceInfo];
        })
        this.tempRxTraceInfoList.push(element);
      });
    }
    this.grid = new Grid();
    this.grid.EditVisible = true;
    this.rxTraceInfoList = this.appService.onGenerateJson(this.tempRxTraceInfoList, this.grid);
  }

  //changeTraceValueInput
  changeTraceValueInput() {
    this.isClearBtnDisabled = false;
    this.isSearchBtnDisabled = false;
    if (!this.traceStatusLockMode) {
      this.isTraceStatusDisabled = false;
    }
  }

  //checkingTraceValueEmptyOrNot
  isInputValueEmpty() {
    if (this.rxTraceInfo.TRACEVALUE == '') {
      this.isSearchBtnDisabled = true;
    } else {
      this.isSearchBtnDisabled = false;
    }

    if (this.isEditTraceMode) {
      this.isSearchBtnDisabled = true;
    }
  }

  //lock or unlock Trace Type
  lockTraceType(lockMode) {
    this.isClearBtnDisabled = false;
    if (lockMode && this.rxTraceInfo.TRACETYPE) {
      this.traceTypeLockMode = true;
      this.isTraceTypeDisabled = true;
      this.selectedTraceType = this.rxTraceInfo.TRACETYPE;
      this.isResetBtnDisabled = false;
    } else {
      this.selectedTraceType = null;
      this.isTraceTypeDisabled = false;
      this.traceTypeLockMode = false;
    }
    if (this.isEditTraceMode) {
      this.isTraceTypeDisabled = true;
    }
  }

  //lock or unlock Trace Status
  lockTraceStatus(lockMode) {
    this.isClearBtnDisabled = false;
    if (lockMode && this.rxTraceInfo.STATUS) {
      this.traceStatusLockMode = true;
      this.isTraceStatusDisabled = true;
      this.selectedTraceStatus = this.rxTraceInfo.STATUS;
      this.isResetBtnDisabled = false;
    } else {
      this.selectedTraceStatus = null;
      this.isTraceStatusDisabled = false;
      this.traceStatusLockMode = false;
    }
  }

  //lock or unlock Trace Hold Reason
  lockTraceHoldReason(lockMode) {
    this.isClearBtnDisabled = false;
    if (lockMode && this.rxTraceInfo.REASONCODE) {
      this.traceHoldReasonLockMode = true;
      this.isHoldReasonsDisabled = true;
      this.selectedTraceReasonCode = this.rxTraceInfo.REASONCODE;
      this.isResetBtnDisabled = false;
    } else {
      this.selectedTraceReasonCode = null;
      this.isHoldReasonsDisabled = false;
      this.traceHoldReasonLockMode = false;
    }
  }

  //lock or unlock Trace Instructions
  lockTraceInstructions(lockMode) {
    this.isClearBtnDisabled = false;
    if (lockMode && this.rxTraceInfo.INSTRUCTIONS) {
      this.traceInstructionsLockMode = true;
      this.isInstructionsDisabled = true;
      this.selectedInstructions = this.rxTraceInfo.INSTRUCTIONS;
      this.isResetBtnDisabled = false;
    } else {
      this.traceInstructionsLockMode = false;
      this.isInstructionsDisabled = false;
      this.selectedInstructions = null;
    }
  }

  // Adding or Updating Trace Info
  addOrUpdateTraceInfo() {
    this.appErrService.clearAlert();
    this.spinner.show();
    let requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_TRACE_HOLD: this.rxTraceInfo };
    let url;
    if (this.traceBtnName == this.commonButton.add) {
      url = String.Join("/", this.apiConfigService.addTraceInfo);
    } else if (this.traceBtnName == this.commonButton.save) {
      if (this.appService.IsObjectsMatch(this.rxTraceInfo, this.tempRxTraceInfo)) {
        this.snackbar.info(this.appService.getErrorText('2660043'));
        this.spinner.hide();
        return;
      }
      url = String.Join("/", this.apiConfigService.updateTraceInfo);
    }

    this.isValidateAddBtnFlag = true;
    this.apiService.apiPostRequest(url, requestObj)
      .subscribe(response => {
        let result = response.body;
        this.spinner.hide();
        if (!checkNullorUndefined(result) && result.Status === this.statusCode.pass) {
          if (result.StatusMessage) {
            this.snackbar.success(result.StatusMessage);
          }
          let traceResponseList = [];
          traceResponseList.push(result.Response.TraceHold);
          this.onProcessTraceInfoJsonGrid(traceResponseList);
          this.isEditTraceMode = false;
          this.clearTraceInfo();
          this.isResetBtnDisabled = false;
        }
        else if (!checkNullorUndefined(result) && result.Status === this.statusCode.fail) {
          this.isValidateAddBtnFlag = false;
          this.rxTraceInfoList = null;
          this.spinner.hide();
          this.appErrService.setAlert(result.ErrorMessage.ErrorDetails, true);
        }
      },
        error => {
          this.appErrService.handleAppError(error);
        });

    // this.isValidateAddBtnFlag = true;
  }

  //Editing Trace Info
  editTraceInfo(event) {
    this.rxTraceInfo = new RxTraceInfo();
    this.tempRxTraceInfo = new RxTraceInfo();
    this.rxTraceInfo = Object.assign(this.rxTraceInfo, event);
    this.tempRxTraceInfo = Object.assign(this.tempRxTraceInfo, event);
    this.traceBtnName = 'Save';
    this.isValidateAddBtnFlag = false;
    this.isTraceTypeDisabled = true;
    this.isTraceValueDisabled = true;
    this.isTraceStatusDisabled = false;
    this.isInstructionsDisabled = false;
    let reasonCode = this.rxTraceInfo.REASONCODE;
    if (this.rxTraceInfo.TRACETYPE == this.traceTypes.serialNumber && !checkNullorUndefined(reasonCode) && reasonCode != '') {
      this.isHoldReasonsDisabled = false;
      this.isValidTraceSerialNum = this.validTraceSerialNum.yes;
    } else if (this.rxTraceInfo.TRACETYPE === this.traceTypes.containerID) {
      this.isHoldReasonsDisabled = false;
      this.isValidTraceSerialNum = this.validTraceSerialNum.no;
    } else {
      this.isHoldReasonsDisabled = true;
      this.isValidTraceSerialNum = this.validTraceSerialNum.no;
    }
    this.isSearchBtnDisabled = true;
    this.isClearBtnDisabled = false;
    this.isEditTraceMode = true;
  }

  // Clearing Trace Info
  clearTraceInfo() {
    if (!this.isEditTraceMode) {
      this.isValidateAddBtnFlag = true;
      this.traceBtnName = this.commonButton.add;
      this.rxTraceInfo = new RxTraceInfo();
      this.tempRxTraceInfo = new RxTraceInfo();
    }
    if (this.isEditTraceMode) {
      this.isTraceTypeDisabled = true;
      this.isTraceValueDisabled = true;
      this.isTraceStatusDisabled = false;
      this.isInstructionsDisabled = false;
      this.isHoldReasonsDisabled = false;
    } else {
      if (this.traceTypeLockMode) {
        this.isTraceTypeDisabled = true;
        this.rxTraceInfo.TRACETYPE = this.selectedTraceType;
        this.isTraceValueDisabled = false;
      } else {
        this.isTraceTypeDisabled = false;
        this.rxTraceInfo.TRACETYPE = null;
        this.isTraceValueDisabled = true;
      }
      this.rxTraceInfo.TRACEVALUE = null;
      this.isTraceStatusDisabled = true;
      this.isInstructionsDisabled = true;
      this.isValidTraceSerialNum = '';
    }

    if (this.traceStatusLockMode) {
      this.rxTraceInfo.STATUS = this.selectedTraceStatus;
    } else {
      this.rxTraceInfo.STATUS = null;
    }

    if (this.traceHoldReasonLockMode) {
      this.isHoldReasonsDisabled = true;
      this.rxTraceInfo.REASONCODE = this.selectedTraceReasonCode;
    } else {
      this.isHoldReasonsDisabled = false;
      this.rxTraceInfo.REASONCODE = null;
    }
    if (this.traceInstructionsLockMode) {
      this.rxTraceInfo.INSTRUCTIONS = this.selectedInstructions;
    } else {
      this.rxTraceInfo.INSTRUCTIONS = null;
    }
    this.isHoldReasonsDisabled = true;
    this.isSearchBtnDisabled = true;
    this.isClearBtnDisabled = true;
    this.traceStatusesList = [...this.allTraceStatusesList];
    this.appErrService.clearAlert();
  }

  changeNotesInput() {
    this.isClearBtnDisabled = false;
    this.isResetBtnDisabled = false;
  }

  //Reset the Trace Info
  resetTraceInfo() {
    this.isEditTraceMode = false;
    this.traceBtnName = this.commonButton.add;
    this.isValidateAddBtnFlag = true;

    this.traceInstructionsLockMode = false;
    this.traceHoldReasonLockMode = false;
    this.traceStatusLockMode = false;
    this.traceTypeLockMode = false;

    if (!checkNullorUndefined(this.rxTraceInfoList)) {
      this.rxTraceInfoList = null;
    }
    let test = this.rxTraceInfoList;
    if (!checkNullorUndefined(this.tempRxTraceInfoList)) {
      this.tempRxTraceInfoList = [];
    }
    this.isTraceTypeDisabled = false;
    this.rxTraceInfo = new RxTraceInfo();
    this.tempRxTraceInfo = new RxTraceInfo();
    this.clearTraceInfo();
    this.isResetBtnDisabled = true;
    this.traceTypeFocus();
  }

  ngOnDestroy() {
    this.masterPageService.hideSpinner = false;
    this.emitHideSpinner.unsubscribe();
    this.masterPageService.emitHideSpinner.next(null);

    this.masterPageService.clearModule();
    this.appErrService.clearAlert();
    if (this.masterPageService.hideControls.controlProperties) {
      this.masterPageService.hideControls.controlProperties = new EngineResult();
    }
  }

}
