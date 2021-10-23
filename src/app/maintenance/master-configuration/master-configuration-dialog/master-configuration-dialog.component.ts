import { AfterViewInit, Component, EventEmitter, Inject, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DeleteConfirmationDialogComponent } from '../../../framework/frmctl/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { MessageType } from '../../../enums/message.enum';
import { JsonData, ListData, MasterConfig } from '../../../models/maintenance/master-configuration/MasterConfigClasses';
import { AppErrorService } from '../../../utilities/rlcutl/app-error.service';
import { MasterPageService } from '../../../utilities/rlcutl/master-page.service';
import { AppService } from '../../../utilities/rlcutl/app.service';
import { StorageData } from '../../../enums/storage.enum';
import { TextCase } from '../../../enums/textcase.enum';
import { CommonEnum } from '../../../enums/common.enum';
import { MasterConfigControlType } from '../../../enums/master-configs.enum';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-master-configuration-dialog',
  templateUrl: './master-configuration-dialog.component.html',
  styleUrls: ['./master-configuration-dialog.component.css']
})
export class MasterConfigurationDialogComponent implements OnInit, AfterViewInit {
  textCase = TextCase;
  masterConfigControlType = MasterConfigControlType;

  listArray: ListData[] = [];
  jsonArray: JsonData[] = [];
  displayedLISTColumns: string[];
  displayedJSONColumns: string[];

  listDataSource = new MatTableDataSource(this.listArray);
  jsonDataSource = new MatTableDataSource(this.jsonArray);

  configPattern: RegExp; // Not these characters.
  errMessage: string = this.appService.getErrorText(6680194);

  newListValue: string = '';
  newJsonKey: string = '';
  newJsonValue: string = '';

  onClose: any;
  appConfig: any;

  @ViewChild('listPaginator', { read: MatPaginator }) paginatorLIST: MatPaginator;
  @ViewChild('jsonPaginator', { read: MatPaginator }) paginatorJSON: MatPaginator;

  @Output() emitConfirmation = new EventEmitter();

  constructor(public appService: AppService, // modalRef needed by HTML to hide self.
              public masterPageService: MasterPageService,
              public appErrService: AppErrorService,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    const pattern = JSON.parse(localStorage.getItem(StorageData.patternList));
    if (!this.appService.checkNullOrUndefined(pattern)) {
       this.configPattern = new RegExp(pattern.mastercConfigPattern);
    }

    this.appConfig = JSON.parse(localStorage.getItem(StorageData.appConfig));

    this.displayedLISTColumns = this.appConfig.masterConfigs.displayedListColumns;
    this.displayedJSONColumns = this.appConfig.masterConfigs.displayedJsonColumns;

    if (this.data.ControlType == MasterConfigControlType.list) {

      const tempList = this.data.Config_Value.split(this.data.Delimiter)
      this.listArray = [];
      tempList.forEach(value => {
        const listData = new ListData();
        listData.value = value;
        listData.original_value = value;
        this.listArray.push(listData);
      });

      this.listDataSource = new MatTableDataSource(this.listArray);

    }
    else if (this.data.ControlType = MasterConfigControlType.json) {

      const kvp = JSON.parse(this.data.Config_Value)
      const keys = Object.keys(kvp);

      this.jsonArray = [];
      keys.forEach(key => {
        const jsonData = new JsonData();
        jsonData.key = key;
        jsonData.value = kvp[key]
        jsonData.original_value = kvp[key];
        this.jsonArray.push(jsonData);
      });

      this.jsonDataSource = new MatTableDataSource(this.jsonArray);

    }
  }

  private resetPaginator() {
    this.listDataSource.paginator = this.paginatorLIST;
    this.jsonDataSource.paginator = this.paginatorJSON;
  }

  ngAfterViewInit() {
    this.resetPaginator()
  }

  onSaveListItem(item: any) {
    this.appErrService.clearAlert();

    const val = item.value.trim();
    if (val === "") {
      // Cannot save blank values
      this.appErrService.setAlert(this.appService.getErrorText(6680197), true, MessageType.warning);
      return;
    }

    if (val === item.original_value) {
      item.IsEditing = false;
      return;
    }

    if (this.listArray.reduce((acc, cur) => cur.value === val ? ++acc : acc, 0) > 1) {
      // Cannot add duplicate values to the {0}
      this.appErrService.setAlert(this.appService.getErrorText(6680199).replace('{0}', this.masterConfigControlType.list), true, MessageType.warning);
      return;
    }

    item.IsEditing = false;
    item.value = val;
    item.original_value = val;
  }

  onSaveJsonItem(item: any) {
    this.appErrService.clearAlert();

    const val = item.value.trim();
    if (val === "") {
      // Cannot save blank values
      this.appErrService.setAlert(this.appService.getErrorText(6680197), true, MessageType.warning);
      return;
    }

    if (val === item.original_value) {
      item.IsEditing = false;
      return;
    }

    if (this.jsonArray.reduce((acc, cur) => cur.value === val ? ++acc : acc, 0) > 1) {
      // Cannot add duplicate values to the {0}
      this.appErrService.setAlert(this.appService.getErrorText(6680199).replace('{0}', this.masterConfigControlType.json), true, MessageType.warning);
      return;
    }

    item.IsEditing = false;
    item.value = val;
    item.original_value = val;
  }

  onCancelClick(item: any) {
    this.appErrService.clearAlert();

    item.IsEditing = false;
    item.value = item.original_value;
  }

  onEditClick(item: any) {
    this.appErrService.clearAlert();

    item.IsEditing = true;
  }

  onDeleteRowClick(item: any) {
    this.appErrService.clearAlert();

    const dialogRef = this.masterPageService.openModelPopup(DeleteConfirmationDialogComponent);
    this.masterPageService.dialogRef.componentInstance.emitConfirmation.subscribe(($e) => {
        dialogRef.close();
      if (this.data.ControlType === MasterConfigControlType.list) {
        const obj = item as ListData;
        const index = this.listArray.findIndex(a => a.value === obj.value)
        this.listArray.splice(index, 1);
        this.listDataSource = new MatTableDataSource(this.listArray)
        this.resetPaginator()
      }
      else if (this.data.ControlType === MasterConfigControlType.json) {
        const obj = item as JsonData;
        const index = this.jsonArray.findIndex(a => a.key == obj.key)
        this.jsonArray.splice(index, 1);
        this.jsonDataSource = new MatTableDataSource(this.jsonArray)
        this.resetPaginator()
      }
    });
  }

  addListItem() {
    this.appErrService.clearAlert();

    const val = this.newListValue.trim();

    if (val === "") {
      return;
    }

    if (this.listArray.find(a => a.value === val)) {
      // Cannot add duplicate values to the {0}
      this.appErrService.setAlert(this.appService.getErrorText(6680199).replace('{0}', this.masterConfigControlType.list), true, MessageType.warning);
      return;
    }

    const listData = new ListData()
    listData.value = val;
    listData.original_value = val;
    this.listArray.push(listData);
    this.listDataSource = new MatTableDataSource(this.listArray);
    this.resetPaginator()
    this.newListValue = "";
  }

  addJsonItem() {
    this.appErrService.clearAlert();

    const key = this.newJsonKey.trim();
    const val = this.newJsonValue.trim();

    if (key === '' && val === '') {
      return;
    }

    if (this.jsonArray.find(a => a.key === key)) {
      // Cannot add duplicate keys to the {0}
      this.appErrService.setAlert(this.appService.getErrorText(6680198).replace('{0}', this.masterConfigControlType.json), true, MessageType.warning);
      return;
    }

    if (this.jsonArray.find(a => a.value === val)) {
      // Cannot add duplicate values to the {0}
      this.appErrService.setAlert(this.appService.getErrorText(6680199).replace('{0}', this.masterConfigControlType.json), true, MessageType.warning);
      return;
    }

    if (val === "") {
      // Cannot save blank values
      this.appErrService.setAlert(this.appService.getErrorText(6680197), true, MessageType.warning);
      return;
    }

    const jsonData =new JsonData();
    jsonData.key = key;
    jsonData.value = val;
    jsonData.original_value = this.newJsonValue;
    this.jsonArray.push(jsonData)
    this.jsonDataSource = new MatTableDataSource(this.jsonArray)
    this.resetPaginator()
    this.newJsonKey = "";
    this.newJsonValue = "";
  }

  onSaveDialog()
  {
    let result = "";
    if (this.data.ControlType === MasterConfigControlType.list) {
      // using the updated list rebuild the CSV
      result = this.listArray
                   .filter(a => a.value.trim() !== "")
                   .map(a => a.value)
                   .join(this.data.Delimiter);
    }
    else if (this.data.ControlType = MasterConfigControlType.json) {
      result = '{' + this.jsonArray
                         .filter(a => a.value.trim() !== "")
                         .map(a => '"' + a.key + '":"' + a.value + '"') .join(',') + '}';
      if (result === "{}") {
        result = "";
      }
    }

    if (this.data.Mandatory.toLocaleUpperCase() === CommonEnum.yes && result.trim() === "") {
      // {0} is a Mandatory config. You cannot save a blank value.'
      this.appErrService.setAlert(this.appService.getErrorText(6680200).replace('{0}', this.data.KeyValue2), true, MessageType.warning);
      return;
    }

    this.emitConfirmation.emit(result);
  }

}
