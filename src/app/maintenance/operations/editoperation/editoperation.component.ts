import { OperationData, OperationJsonData, ParserDetail, ParserHeader, ParserServiceConfig } from './../../../models/maintenance/operations/Operation';
import { Component, Input, OnInit, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { CommonEnum } from '../../../enums/common.enum';
import { StorageData } from '../../../enums/storage.enum';
import { AppService } from '../../../utilities/rlcutl/app.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { AppErrorService } from '../../../utilities/rlcutl/app-error.service';
import { MessageType } from '../../../enums/message.enum';
import { dropdown } from '../../../models/common/Dropdown';
import { TextCase } from '../../../enums/textcase.enum';

@Component({
  selector: 'app-editoperation',
  templateUrl: './editoperation.component.html',
  styleUrls: ['./editoperation.component.css']
})
export class EditoperationComponent implements OnInit, AfterViewInit {

  @ViewChild('jsonPaginator', { read: MatPaginator }) paginatorJSON: MatPaginator;

  @Input() appConfig: any;
  @Input() operationData: OperationData;
  @Output() emitSubmitOperationData = new EventEmitter();

  jsonArray: OperationJsonData[] = [];
  displayedJSONColumns: string[];
  tabIndex = 0;
  commonEnum = CommonEnum;
  newJsonKey = '';
  newJsonValue = '';
  elementDetails: '';
  operationRankPattern: any;
  textBoxPattern: any;
  operationIDPattern: any;
  namePattern: any;
  errMessage: string;
  textCase = TextCase;
  tabArray: any;
  tempFileformat: any[];
  fileFormatOptions = [];
  isAddFileFormatDisable = false;

  newParserDetail = new ParserDetail();
  newparserHeader = new ParserHeader();
  jsonDataSource = new MatTableDataSource(this.jsonArray);

  constructor(public appService: AppService,
    public appErrService: AppErrorService) {
  }

  private loadPatterns() {
    const pattern = JSON.parse(localStorage.getItem(StorageData.patternList));
    if (!this.appService.checkNullOrUndefined(pattern)) {
      this.operationRankPattern = new RegExp(pattern.operationRankPattern);
      this.namePattern = new RegExp(pattern.namePattern);
      this.textBoxPattern = new RegExp(pattern.operationJSONPattern);
      this.operationIDPattern = new RegExp(pattern.operationPattern);
    }
  }

  ngOnInit() {
    this.loadPatterns();
    this.loadParser();
    this.loadFileFormats();
    this.appErrService.appMessage();
    this.errMessage = this.appService.getErrorText(6680194);
    this.displayedJSONColumns = this.appConfig.operation.displayedJsonColumns;
    this.appService.setFocus('rank');
  }

  private loadParser() {
    if (this.operationData.ParserHeader) {
      if (this.operationData.ParserHeader.RX_PARSER_DETAILs) {
        this.tabArray = this.operationData.ParserHeader.RX_PARSER_DETAILs;
        this.isAddFileFormatDisable = this.tabArray.length == this.appConfig.operation.numOfParsers ? true : false;
        this.tabDetailsByTabIndex();
      }
    }
  }

  private loadFileFormats() {
    this.tempFileformat = this.appConfig.operation.fileFormats;
    this.tempFileformat.forEach(element => {
      const dd: dropdown = new dropdown();
      dd.Id = element;
      dd.Text = element;
      this.fileFormatOptions.push(dd);
    });
  }

  ngAfterViewInit() {
    this.resetPaginator();
  }

  private resetPaginator() {
    this.jsonDataSource.paginator = this.paginatorJSON;
  }

  submit(): void {
    this.emitSubmitOperationData.emit(this.operationData);
  }

  onRouteEligibleChange(value) {
    this.operationData.OperationConfigs.ROUTE_ELIGIBLE = value ? CommonEnum.yes : CommonEnum.no;
  }

  onForceMoveEligibleChange(value) {
    this.operationData.OperationConfigs.FORCEMOVEELIGIBLE = value ? CommonEnum.yes : CommonEnum.no;
  }

  onActiveChange(value) {
    this.operationData.OperationConfigs.ACTIVE = value ? CommonEnum.yes : CommonEnum.no;
  }

  onParserChange(value) {
    this.operationData.IsParserExists = value ? CommonEnum.yes : CommonEnum.no;
    if (value && !this.operationData.ParserHeader) {
      this.newparserHeader = new ParserHeader();
      this.newparserHeader.PARSER = this.operationData.OPERATIONID;
      this.newparserHeader.PARSER_GROUP = this.operationData.OPERATIONID;
      //this.newparserHeader.SEQID = 0;
      this.operationData.ParserHeader = this.newparserHeader;

    }
  }

  onSurveyChange(value) {
    this.operationData.IsSurveryExists = value ? CommonEnum.yes : CommonEnum.no;
  }

  onParserAutoProcessChange(value) {
    this.operationData.ParserHeader.AUTO_PROCESS = value ? CommonEnum.yes : CommonEnum.no;
  }

  onActiveParserService(value) {
    this.operationData.ParserHeader.RX_PARSER_DETAILs[this.tabIndex].RX_PARSER_SERVICE_CONFIGs.ACTIVE = value ? CommonEnum.yes : CommonEnum.no;
  }

  onFileFormatChange(event) {
    this.operationData.ParserHeader.RX_PARSER_DETAILs[this.tabIndex].FILE_FORMAT = event.value;
  }

  onEditClick(item: any) {
    this.appErrService.clearAlert();
    item.IsEditing = true;
  }

  onDeleteRowClick(item: any) {
    this.appErrService.clearAlert();
    const obj = item as OperationJsonData;
    const index = this.jsonArray.findIndex(a => a.key === obj.key);
    this.jsonArray.splice(index, 1);
    this.updateParserDetails();
  }

  onSaveJsonItem(item: any) {
    this.appErrService.clearAlert();
    let val;
    if (item.value) {
      val = item.value.trim();
    }
    if (val === '') {
      this.appErrService.setAlert(this.appService.getErrorText(6680197), true, MessageType.warning);
      return;
    }
    if (val === item.original_value) {
      item.IsEditing = false;
      return;
    }
    item.IsEditing = false;
    item.value = val;
    item.original_value = val;
    this.updateParserDetails();
  }

  onCancelClick(item: any) {
    this.appErrService.clearAlert();

    item.IsEditing = false;
    item.value = item.original_value;
  }

  addJsonItem() {
    this.appErrService.clearAlert();

    const key = this.newJsonKey.trim();
    const val = this.newJsonValue.trim();

    if (this.jsonArray.find(a => a.key === key)) {
      this.appErrService.setAlert(this.appConfig.operation.duplicateMessage, true, MessageType.failure);
      return;
    }
    const jsonData = new OperationJsonData();
    jsonData.key = key;
    jsonData.value = val;
    jsonData.original_value = val;
    jsonData.IsEditing = false;
    this.jsonArray.push(jsonData);
    this.updateParserDetails();
    this.newJsonKey = '';
    this.newJsonValue = '';

  }

  tabChanged(event) {
    this.tabIndex = event.index;
    this.tabDetailsByTabIndex();
  }

  tabDetailsByTabIndex() {
    this.newJsonKey = '';
    this.newJsonValue = '';
    this.jsonArray = [];
    if (this.operationData.ParserHeader.RX_PARSER_DETAILs.length > 0
      && !(this.operationData.ParserHeader.RX_PARSER_DETAILs[this.tabIndex].PARSER_DETAIL === '')) {
      const kvp = JSON.parse(this.operationData.ParserHeader.RX_PARSER_DETAILs[this.tabIndex].PARSER_DETAIL);
      const keys = Object.keys(kvp);
      keys.forEach(key => {
        const jsonData = new OperationJsonData();
        jsonData.key = key;
        jsonData.value = kvp[key];
        jsonData.original_value = kvp[key];
        this.jsonArray.push(jsonData);
      });
    }
    this.jsonDataSource = new MatTableDataSource(this.jsonArray);
    this.resetPaginator();
  }

  updateParserDetails() {
    const result = '{' + this.jsonArray
      .filter(a => a.value.trim() !== '')
      .map(a => '"' + a.key + '":"' + a.value + '"').join(',') + '}';

    this.operationData.ParserHeader.RX_PARSER_DETAILs[this.tabIndex].PARSER_DETAIL = result;
    this.jsonDataSource = new MatTableDataSource(this.jsonArray);
    this.resetPaginator();

  }

  addParserDetail() {
    this.jsonArray = [];
    this.jsonDataSource = new MatTableDataSource(this.jsonArray);
    this.resetPaginator();
    this.newParserDetail = new ParserDetail();
    this.newParserDetail.PARSER = this.operationData.OPERATIONID;
    // this.newParserDetail.PARSER_DETAIL = '';
    // this.newParserDetail.ADDWHO = '';
    // this.newParserDetail.EDITWHO = '';
    // this.newParserDetail.SITEID = '';
    // this.newParserDetail.ADDDATE = '';
    // this.newParserDetail.EDITDATE = '';
    // this.newParserDetail.CLIENTID = '';
    // this.newParserDetail.FILE_FORMAT = '';
    // this.newParserDetail.ELEMENT_DETAILS = '';
    this.newParserDetail.RX_PARSER_SERVICE_CONFIGs = new ParserServiceConfig();
    this.newParserDetail.IsModify = true;
    if (!this.operationData.ParserHeader.hasOwnProperty('RX_PARSER_DETAILs')) {
      this.operationData.ParserHeader.RX_PARSER_DETAILs = [];
    }
    this.operationData.ParserHeader.RX_PARSER_DETAILs.push(this.newParserDetail);

    this.tabIndex = this.operationData.ParserHeader.RX_PARSER_DETAILs.length - 1;
    this.tabArray = this.operationData.ParserHeader.RX_PARSER_DETAILs;
    this.isAddFileFormatDisable = this.tabArray.length == this.appConfig.operation.numOfParsers ? true : false;

  }

}
