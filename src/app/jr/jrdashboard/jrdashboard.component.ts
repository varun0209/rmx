import { CommonEnum } from './../../enums/common.enum';
import { MasterPageService } from './../../utilities/rlcutl/master-page.service';
import { CommonService } from './../../services/common.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChartDataSets, ChartType } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { ApiConfigService } from '../../utilities/rlcutl/api-config.service';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';
import { AppService } from '../../utilities/rlcutl/app.service';
import { ClientData } from '../../models/common/ClientData';
import { UiData } from '../../models/common/UiData';
import { StorageData } from '../../enums/storage.enum';
import { String } from 'typescript-string-operations';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-jrdashboard',
  templateUrl: './jrdashboard.component.html',
  styleUrls: ['./jrdashboard.component.css']
})
export class JrdashboardComponent implements OnInit, OnDestroy {

  // Configs
  clientData = new ClientData();
  uiData = new UiData();
  barData: [];
  locationBarGraphData = [];
  appConfig: any;

  // location Bar Properties
  locationBarChartLabels: Label[] = [];
  locationBarChartData: ChartDataSets[] = [];
  locationBarChartType: ChartType;
  locationBarChartLegend: boolean;
  locationBarChartColor: Color[];
  locationBarChartOptions: any;

  // TestingResults Bar Properties
  testingResultsbarChartOptions: any;
  testingResultsbarChartLabels: Label[];
  testingResultsbarChartType: ChartType;
  testingResultsbarChartLegend: boolean;
  testingResultsbarChartData: ChartDataSets[] = [];
  testingResultsbarChartColor: Color[];


  constructor(
    private apiConfigService: ApiConfigService,
    private appService: AppService,
    public appErrService: AppErrorService,
    private commonService: CommonService,
    private masterPageService: MasterPageService,
    private spinner: NgxSpinnerService,
  ) {
    this.masterPageService.emitHideSpinner.subscribe(spinnerFlag => {
      if (!this.appService.checkNullOrUndefined(spinnerFlag) && spinnerFlag) {
        const controlConfig = this.masterPageService.hideControls.controlProperties;
        this.spinner.hide()
        if (controlConfig && controlConfig.hasOwnProperty('locationBarChartType') && controlConfig.hasOwnProperty('locationBarChartLegend')
          && controlConfig.hasOwnProperty('locationBarChartColor') && controlConfig.hasOwnProperty('locationBarChartOptions')) {
          this.locationBarChartType = controlConfig.locationBarChartType;
          this.locationBarChartLegend = controlConfig.locationBarChartLegend;
          this.locationBarChartColor = controlConfig.locationBarChartColor;
          this.locationBarChartOptions = controlConfig.locationBarChartOptions;
          this.getlocationBarGraphData();
        }
        if (controlConfig && controlConfig.hasOwnProperty('testingResultsbarChartType') && controlConfig.hasOwnProperty('testingResultsbarChartLegend')
          && controlConfig.hasOwnProperty('testingResultsbarChartColor') && controlConfig.hasOwnProperty('testingResultsbarChartOptions')
        ) {
          this.testingResultsbarChartType = controlConfig.testingResultsbarChartType;
          this.testingResultsbarChartLegend = controlConfig.testingResultsbarChartLegend;
          this.testingResultsbarChartColor = controlConfig.testingResultsbarChartColor;
          this.testingResultsbarChartOptions = controlConfig.testingResultsbarChartOptions;
          this.getTestingResultsBarGraphData();
        }
      }
    });

  }

  ngOnInit() {
    let operationObj = this.masterPageService.getRouteOperation();
    if (operationObj) {
      this.uiData.OperationId = operationObj.OperationId;
      this.uiData.OperCategory = operationObj.Category;
      this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
      this.masterPageService.setTitle(operationObj.Title);
      this.masterPageService.setModule(operationObj.Module);
      this.appConfig = JSON.parse(localStorage.getItem(StorageData.appConfig));
      this.masterPageService.hideSpinner = true;
    }
  }

  // TestingResults Bar Data
  getTestingResultsBarGraphData() {
    this.testingResultsbarChartLabels = [];
    this.testingResultsbarChartData = [];
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getLocationByCntDtls);
    const totalCnt = []
    const inProcess = [];
    const failureCnt = [];
    this.commonService.commonApiCall(url, requestObj, (result, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(result.Response)) {
          if (result.Response.hasOwnProperty('LocWiseCntDetails') &&
            !this.appService.checkNullOrUndefined(result.Response.LocWiseCntDetails)
            && result.Response.LocWiseCntDetails.length) {
            const parent = result.Response.LocWiseCntDetails;
            parent.forEach(element => {
              if (element.hasOwnProperty('TOTALCOUNT') && element.hasOwnProperty('INPROCESSCOUNT')
                && element.hasOwnProperty('FAILURECOUNT') && element.hasOwnProperty('PARENTLOC')) {
                totalCnt.push(element["TOTALCOUNT"]);
                inProcess.push(element["INPROCESSCOUNT"]);
                failureCnt.push(element["FAILURECOUNT"]);
                this.testingResultsbarChartLabels.push(element["PARENTLOC"]);
              }
            });
            this.testingResultsbarChartData = [
              { data: totalCnt, label: CommonEnum.TotalCount },
              { data: inProcess, label: CommonEnum.InProgress },
              { data: failureCnt, label: CommonEnum.Failed }
            ];
          }
        }
      }
    });
  }


  // Location Bar Properties Data
  getlocationBarGraphData() {
    this.locationBarChartLabels = [];
    this.locationBarChartData = [];
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getParentLocationByCntDtls);
    this.commonService.commonApiCall(url, requestObj, (result, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(result.Response)) {
          if (result.Response.hasOwnProperty('ParentLocWiseCntDetails') &&
            !this.appService.checkNullOrUndefined(result.Response.ParentLocWiseCntDetails)
            && result.Response.ParentLocWiseCntDetails.length) {
            const parent = result.Response.ParentLocWiseCntDetails;
            parent.forEach(element => {
              if (element.hasOwnProperty('LOCATION') && element.hasOwnProperty('TOTALCOUNT')) {
                this.locationBarChartLabels.push(element["LOCATION"]);
                this.locationBarGraphData.push(element["TOTALCOUNT"]);
              }
            });
            this.locationBarChartData = [
              { data: this.locationBarGraphData, label: CommonEnum.DeviceCount }
            ];
          }
        }
      }
    });
  }

  ngOnDestroy() {
    this.masterPageService.defaultProperties();
  }
}

