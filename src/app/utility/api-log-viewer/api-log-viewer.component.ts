import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { String } from 'typescript-string-operations'
import { NgxSpinnerService } from 'ngx-spinner'
import { StorageData } from '../../enums/storage.enum';
import { ClientData } from '../../models/common/ClientData';
import { UiData } from '../../models/common/UiData';
import { CommonService } from '../../services/common.service';
import { ApiConfigService } from '../../utilities/rlcutl/api-config.service';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';
import { AppService } from '../../utilities/rlcutl/app.service';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';
import { Grid } from '../../models/common/Grid';
import { dropdown } from '../../models/common/Dropdown';
import { RxAutoTestParameter, RxAutoTestResult } from '../../models/utility/api-log-viewer';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-api-log-viewer',
  templateUrl: './api-log-viewer.component.html',
  styleUrls: ['./api-log-viewer.component.css']
})
export class ApiLogViewerComponent implements OnInit, OnDestroy {

  emitHideSpinner: Subscription
  operationObj: any
  storageData = StorageData
  clientData = new ClientData()
  uiData = new UiData()
  appConfig: any
  textboxPattern: any

  gridApiLogs: Grid
  rmGrid_ApiLogsData: any

  parserList: dropdown[] = []
  apiLogList: RxAutoTestResult[] = []

  serialNumber: string = ''
  selectedParser: string = ''
  selectedRow: RxAutoTestResult;
  dialogRef: any;


  constructor(public appErrService: AppErrorService,
    public masterPageService: MasterPageService,
    public appService: AppService,
    private spinner: NgxSpinnerService,
    private apiConfigService: ApiConfigService,
    public commonService: CommonService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    const pattern = JSON.parse(localStorage.getItem(StorageData.patternList));
    if (!this.appService.checkNullOrUndefined(pattern)) {
      this.textboxPattern = new RegExp(pattern.textboxPattern);
    }

    this.appConfig = JSON.parse(localStorage.getItem(StorageData.appConfig))

    this.gridApiLogs = new Grid()
    this.gridApiLogs.EditVisible = true
    this.gridApiLogs.PaginationId = "ApiLogViewer"

    this.operationObj = this.masterPageService.getRouteOperation()
    if (this.operationObj) {
      // Load proper error service messages
      localStorage.setItem(this.storageData.module, this.operationObj.Module)
      this.appErrService.appMessage()

      // set uiData appropriately
      this.uiData.OperationId = this.operationObj.OperationId
      this.uiData.OperCategory = this.operationObj.Category

      // capture local instance of clientData
      this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData))

      //setting value to hidespinner (based on this value we are emiting emithidespinner method)
      this.masterPageService.hideSpinner = true
      this.masterPageService.setTitle(this.operationObj.Title)
      this.masterPageService.setModule(this.operationObj.Module)

      this.emitHideSpinner = this.masterPageService.emitHideSpinner.subscribe(spinnerFlag => {
        if (!this.appService.checkNullOrUndefined(spinnerFlag) && spinnerFlag) {
          //use use your method here and hide spinner after getting response
          this.loadData()
        }
      })
    }
  }

  ngOnDestroy() {
    this.masterPageService.hideSpinner = false
    this.masterPageService.moduleName.next(null)
    this.emitHideSpinner.unsubscribe()
    this.masterPageService.emitHideSpinner.next(null)
    this.masterPageService.clearModule()
    this.appErrService.clearAlert()
    this.masterPageService.hideDialog()
  }

  public loadData() {
    this.serialNumber = ''
    this.selectedParser = ''
    this.parserList = []
    this.apiLogList = []
    this.rmGrid_ApiLogsData = this.appService.onGenerateJson(this.apiLogList, this.gridApiLogs)

    const requestObj = { ClientData: this.clientData, UIData: this.uiData }
    const url = String.Join('/', this.apiConfigService.getParserList)
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide()

      this.parserList = []
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response) && res.Response.ParserList && res.Response.ParserList.length) {
          res.Response.ParserList.forEach(element => {
            const dd = new dropdown()
            dd.Id = element.Id
            dd.Text = element.Id + ' - ' + element.Text
            this.parserList.push(dd)
          })
          this.parserList = this.parserList.sort((a, b) => a.Text.localeCompare(b.Text))
        }
      }
    })
  }

  changedSerialNumber() {
    this.appErrService.clearAlert();
  }

  changedParser(event) {
    this.appErrService.clearAlert();
    this.selectedParser = event.value;
  }

  @HostListener('document:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    // Ignore any key that is "Unidentified"
    // The TC8000 threw these keys in testing.
    if (event.key === "Unidentified") {
      return false
    }  
  }

  search() {
    if (!this.serialNumber)
      return

    this.apiLogList = []
    this.rmGrid_ApiLogsData = this.appService.onGenerateJson(this.apiLogList, this.gridApiLogs)

    const params = new RxAutoTestParameter();
    params.Parser = this.selectedParser;
    params.SerialNumber = this.serialNumber
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, RxAutoTestParameter: params }
    const url = String.Join('/', this.apiConfigService.getRxApiTestResults)
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide()

      this.apiLogList = []
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response) && res.Response.ApiTestResults && res.Response.ApiTestResults.length) {
          this.apiLogList = res.Response.ApiTestResults
          // this.operationList = this.operationList.sort((a, b) => a.Text.localeCompare(b.Text))
          this.rmGrid_ApiLogsData = this.appService.onGenerateJson(this.apiLogList, this.gridApiLogs)
        }
      }
    })
  }

  showDialog(data: RxAutoTestResult, addEditDialog) {
    this.selectedRow = data;

    this.selectedRow = Object.assign(new RxAutoTestResult(), data) // shallow copy
    this.dialogRef = this.dialog.open(addEditDialog, {
      hasBackdrop: true,
      disableClose: true,
      panelClass: 'dialog-width-xl'
  });
  }
}
