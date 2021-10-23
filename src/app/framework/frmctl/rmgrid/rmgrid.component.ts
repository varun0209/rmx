import { Component, Input, Output, EventEmitter, OnInit, ViewChild, OnDestroy, Optional } from '@angular/core';
import { RmchildgridComponent } from './rmchildgrid/rmchildgrid.component';
import { RmgridmodalComponent } from './rmgridmodal/rmgridmodal.component';
import { SerialNumberStatus } from '../../../enums/serialnumberStatus.enum';
import { AppService } from '../../../utilities/rlcutl/app.service';
//import { elementClassNamed } from '@angular/core/src/render3/instructions';
import { RmgridService } from './rmgrid.service';
import { RearrangegridComponent } from './rearrangegrid/rearrangegrid.component';
import { MasterPageService } from '../../../utilities/rlcutl/master-page.service';
import { Grid } from '../../../models/common/Grid';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppErrorService } from '../../../utilities/rlcutl/app-error.service';
import { ClientData } from '../../../models/common/ClientData';
import { UiData } from '../../../models/common/UiData';
import { StorageData } from '../../../enums/storage.enum';
import { ApiConfigService } from '../../../utilities/rlcutl/api-config.service';
import { CommonService } from '../../../services/common.service';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { String } from 'typescript-string-operations';
import { CommonEnum } from '../../../enums/common.enum';
import { checkNullorUndefined } from '../../../enums/nullorundefined';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
//export excel
// import * as FileSaver from 'file-saver';
// import * as XLSX from 'xlsx';

// export pdf
// import * as jsPdf from 'jspdf';
// import 'jspdf-autotable';

// const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
// const EXCEL_EXTENSION = '.xlsx';

@Component({
    selector: 'rmgrid',
    templateUrl: './rmgrid.component.html',
    styleUrls: ['./rmgrid.component.css'],
})
export class RmgridComponent implements OnInit, OnDestroy {

    @ViewChild('exportFiles') exportFiles: any;
    @ViewChild('exportModal') exportModal: any;

    rowSelected: number;
    Isshowchild: boolean;
    columnwidth: number;
    isClear = true;
    showProcessbutton = true;
    @Input() deleteBtnTooltip: string;
    @Input() closeVisibleTooltip: string;
    @Input() resultStatus = true;
    @Input() gridBatchId: string = '';
    @Input() isScroll: boolean = false;
    @Input() isCancelIconShow = true;
    @Input() isHyperLink = false;
    @Input() hideRearrangeIcon = false;
    serialnumberStatus = SerialNumberStatus;
    commonEnum = CommonEnum;
    @Output() emitEditDetails = new EventEmitter();
    @Output() emitChildEditDetails = new EventEmitter();
    @Output() emitDeleteDetails = new EventEmitter();
    @Output() emitCheckboxDetails = new EventEmitter();
    @Output() emitCloseDetails = new EventEmitter();
    @Output() emitColumnValue = new EventEmitter();
    @Output() pageIndex = new EventEmitter();
    selectedRow: any;
    selectedRowArray: any;

    // Export and Import
    clientData = new ClientData();
    uiData = new UiData();
    exportGridList: any;
    fileList = ['Excel', 'CSV'];
    jsonData: any;
    sheetColumns = [];
    selectedSheet: any;
    fileName = '';
    @Input() p = 1;
    dialogRef: MatDialogRef<unknown, any>;
    ngOnInit() {
        this.rowSelected = -1;
        // this.Isshowchild = false;
    }
    gridprop: any;
    @Output() gridpropertiesChange: EventEmitter<any>;
    searchData: any = new Object();
    //Edit Mode Properties
    isChildEdit: boolean = false;
    selectedParent = {}
    selectedChildElement;
    parentEditMode: boolean = false;

    originalColumnGrid = true;
    originalColumns = [];
    isShowRowViewIcon = true;
    statusList: any;
    reArrangeModalRef: any
    rowViewModalRef: any;
    constructor(private app: AppService,
        public masterPageService: MasterPageService,
        private spinner: NgxSpinnerService,
        private appErrService: AppErrorService,
        private apiConfigService: ApiConfigService,
        private commonService: CommonService,
        private appService: AppService,
        private snackbar: XpoSnackBar,
        public dialog: MatDialog,
        public rmgridService: RmgridService) {
        this.gridpropertiesChange = new EventEmitter();
        this.statusList = JSON.parse(localStorage.getItem(StorageData.statusTypesList));
    }
    columns: any[] = [];
    @Input()
    get gridproperties() {
        return this.gridprop;
    }
    set gridproperties(value) {
        this.searchData = {};
        if (value) {
            this.gridprop = value;
            this.gridpropertiesChange.emit(this.gridprop);
            if (this.gridprop) {
                if (this.gridprop.Elements.length > 0) {
                    this.columns = [];
                    let arrageCols = [];
                    for (let column in this.gridprop.Elements[0]) {
                        if (column != 'ChildElements' && column != 'EditVisible' && column != 'DeleteVisible' && this.showColumns(column)) {
                            let col = {
                                name: column,
                                width: this.calculateSize(column, {
                                    font: 'sans-serif',
                                    fontSize: '14px'
                                }).width + 50,
                                display: this.displayName(column)
                            };
                            if (this.arrangeCol(column)) {
                                arrageCols.push(col);
                            } else {
                                this.columns.push(col);
                            }
                        }
                    }
                    if (arrageCols.length) {
                        arrageCols = this.arraySortCols(arrageCols);
                    }
                    this.columns = arrageCols.concat(this.columns);
                    this.gridprop.Elements.forEach(element => {
                        Object.keys(element).map(k => element[k] = typeof element[k] == 'string' ? element[k].trim() : element[k]);
                        for (let i = 0; i < this.columns.length; i++) {
                            let cellvalue = element[this.columns[i].name];
                            if (typeof (cellvalue) == 'string') {
                                let cellvaluelist = []
                                cellvaluelist = cellvalue.split('|');
                                if (cellvaluelist.length > 1) {
                                    for (let i = 0; i <= cellvaluelist.length; i++) {
                                        if (cellvaluelist[i] <= cellvaluelist[i + 1]) {
                                            cellvaluelist[i] = cellvaluelist[i + 1];
                                            cellvalue = cellvaluelist[i];
                                        }
                                    }
                                }
                            }
                            let w = this.calculateSize(cellvalue, {
                                font: 'sans-serif',
                                fontSize: '14px'
                            }).width + 50;
                            if (i == 0) {
                                w += 20;
                            }
                            if (w > this.columns[i].width) {
                                this.columns[i].width = w;
                            }
                        };
                    });
                }
                if (!this.gridprop.PaginationVisible) {
                    this.gridprop.ItemsPerPage = 0;
                }
            }
            this.originalColumnGrid = true;
        }
    }

    key: string = '';
    reverse: boolean = false;

    showColumns(name) {
        const data = this.masterPageService.hideControls;
        if (!this.appService.checkNullOrUndefined(data)) {
            if (data.controlProperties.hasOwnProperty('gridRequiredProp') &&
                !checkNullorUndefined(data.controlProperties.gridRequiredProp) &&
                !checkNullorUndefined(this.gridproperties.RequiredColConfig) && 
                data.controlProperties.gridRequiredProp.hasOwnProperty(this.gridproperties.RequiredColConfig) &&
                !checkNullorUndefined(data.controlProperties.gridRequiredProp[this.gridproperties.RequiredColConfig])
            ) {
                const req = this.gridproperties.RequiredColConfig;
                const filterData = data.controlProperties.gridRequiredProp[req].find(res => res === name);
                return filterData ? true : false;
            } else if (data.controlProperties.hasOwnProperty('gridReqCols')) {
                const filterData = data.controlProperties.gridReqCols.find(res => res === name);
                return filterData ? true : false;
            }
        }
        return true;
    }

    displayName(name) {
        const data = this.masterPageService.hideControls;
        if (!this.appService.checkNullOrUndefined(data) &&
            data.controlProperties.hasOwnProperty('gridDisplayProps')) {
            const filterData = data.controlProperties.gridDisplayProps.find(res => res.name === name);
            return filterData ? filterData.display : name;
        }
        return name;
    }

    arrangeCol(col) {
        const data = this.masterPageService.hideControls;
        if (!this.appService.checkNullOrUndefined(data) &&
            data.controlProperties.hasOwnProperty('gridDataOrder')) {
            return data.controlProperties.gridDataOrder.some(item => { return item == col });
        } else {
            return false;
        }
    }

    arraySortCols(array) {
        const data = this.masterPageService.hideControls;
        if (!this.appService.checkNullOrUndefined(data) &&
            data.controlProperties.hasOwnProperty('gridDataOrder')
        ) {
            const arrageCols = [];
            data.controlProperties.gridDataOrder.forEach(function (key) {
                array.filter(function (item) {
                    if (item.name == key) {
                        arrageCols.push(item);
                    }
                });
            });
            return arrageCols;
        } else {
            return [];
        }
    }

    sort(key) {
        if (!this.gridprop.SortDisabled) {
            this.key = key;
            this.reverse = !this.reverse;
        }
    }
    openCloseRow(idReserva: number) {
        if (this.rowSelected === -1) {
            this.rowSelected = idReserva;
        }
        else {
            if (this.rowSelected == idReserva) {
                this.rowSelected = -1;
            }
            else {
                this.rowSelected = idReserva;
            }
        }
    }
    showListDetails(element) {
        this.Isshowchild = true;
        //highlighting grid changes
        if (!this.isChildEdit) {
            this.selectedChildElement = [];
        }
    }
    editrow(rowtoedit) {
        this.emitEditDetails.emit(rowtoedit);
        //highlighting grid changes
        this.selectedParent = rowtoedit;
        this.isChildEdit = false;
        this.parentEditMode = true;
    }
    deleterow(rowtodelete, i) {
        //this.gridprop.Elements.splice(i, 1);
        this.emitDeleteDetails.emit(rowtodelete);
    }

    checkboxChecked(element, row) {
        this.emitCheckboxDetails.emit({ element: element, row: row });
    }

    checkedAll(element) {
        this.emitCheckboxDetails.emit({ element: element, row: this.commonEnum.checkAll });
    }

    close(rowData, i) {
        this.emitCloseDetails.emit(rowData);
    }

    importFile(event, FileName) {
        this.clearImportExport();
        this.fileName = FileName;
        this.commonService.convertExcelToJSON(event, (json, col) => {
            if (!this.appService.checkNullOrUndefined(json)) {
                this.jsonData = json;
                this.sheetColumns = col;
                this.selectedSheet = this.sheetColumns[0]['Id'];
                this.showGrid();
                this.openPreviewGrid();
            }
        });
    }

    exportFile() {
        this.clearImportExport();
        this.exportGridList = this.app.onGenerateJson(this.gridprop.Elements, new Grid());
        this.exportGridList.ImportVisible = false;
        this.exportGridList.ExportVisible = false;
        if (!this.originalColumnGrid) {
            this.openPreviewGrid();
        } else {
            this.selectFile();
        }
    }

    clearImportExport() {
        this.appErrService.clearAlert();
        this.clientData = new ClientData();
        this.uiData = new UiData();
        this.exportGridList = null;
        this.jsonData = null;
        this.sheetColumns = [];
        this.selectedSheet = '';
        this.fileName = '';
        this.showProcessbutton = true;
    }

    downloadFile(file) {
        this.commonService.exportTo(this.exportGridList.Elements, this.uiData.OperCategory, file);
        this.clearImportExport();
    }

    selectFile() {
        const operationObj = this.masterPageService.getRouteOperation();
        if (operationObj) {
            this.uiData.OperationId = operationObj.OperationId;
            this.uiData.OperCategory = operationObj.Category;
            this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
        }
        if (this.sheetColumns.length) {   // i.e For Import we will get columns length
            const cfileName = this.fileName ? this.fileName : '';
            const fileParam = { FILENAME: cfileName, OPERATIONID: this.uiData.OperationId };
            const requestObj = { ClientData: this.clientData, UIData: this.uiData, FileParameters: fileParam, FileData: this.jsonData[this.selectedSheet] };
            const url = String.Join('/', this.apiConfigService.importFileData);
            this.commonService.commonApiCall(url, requestObj, (res, statsFlag) => {
                this.spinner.hide();
                this.clearImportExport();
                if (!this.appService.checkNullOrUndefined(res.StatusMessage) && statsFlag) {
                    this.snackbar.success(res.StatusMessage);
                } else {
                    if (!this.appService.checkNullOrUndefined(res.Response) && res.Response.length) {
                        this.jsonData = res.Response;
                        this.showGridPreview();
                        this.openPreviewGrid();
                    }
                }
            });
        } else { // i.e For Export
            this.masterPageService.openModelPopup(this.exportFiles);
        }
    }

    pageChanged(event) {
        this.p = event;
        this.pageIndex.emit(event);
    }

    openPreviewGrid() {
        this.masterPageService.openModelPopup(this.exportModal, true, 'dialog-width-lg');
    }

    changeData(data) {
        this.selectedSheet = data.value;
        this.showGrid();
    }

    showGrid() {
        const gridList = this.appService.onGenerateJson(this.jsonData[this.selectedSheet], new Grid());
        gridList.ImportVisible = false;
        gridList.ExportVisible = false;
        this.exportGridList = gridList;

    }

    showGridPreview() {
        const gridList = this.appService.onGenerateJson(this.jsonData, new Grid());
        gridList.ImportVisible = false;
        gridList.ExportVisible = false;
        this.showProcessbutton = false;
        this.exportGridList = gridList;

    }


    childEditDetails(childRow, parentRow, i) {
        let editRow: any = {};
        editRow.childRow = childRow;
        parentRow.Index = i;
        editRow.parentRow = parentRow;
        this.emitChildEditDetails.emit(editRow);
        // //highlighting grid changes
        if (childRow) {
            this.isChildEdit = true;
            this.selectedChildElement = childRow;
        }
        this.parentEditMode = false;
    }

    fileUpload = 'File Upload';
    fileExport = 'File Export';
    openModal(template) {
        this.dialogRef =  this.dialog.open(template, {
            hasBackdrop: true,
          });
    }

    //Convert and Export to PDF
    // convert() {
    //     // let doc = new jsPdf();
    //     let doc = new jsPdf({ orientation: 'l', format: 'a4' });
    //     let col = [];
    //     this.columns.forEach(column => {
    //         col.push(column.name);
    //     });
    //     if (this.gridprop.Elements.length > 0) {

    //         if (this.gridprop.Elements[0].ChildElements.length > 0) {
    //             let paddingLength = Object.keys(this.gridprop.Elements[0].ChildElements[0]).length + 1 - this.columns.length;
    //             for (let i = 0; i < paddingLength; i++) {
    //                 col.push('');
    //             }
    //         }
    //     }
    //     let rows = [];
    //     this.gridprop.Elements.forEach(element => {
    //         let temp = [];
    //         for (let column in element) {
    //             if (column != 'ChildElements' && column != 'EditVisible' && column != 'DeleteVisible') {
    //                 temp.push(element[column]);
    //             }
    //         }
    //         rows.push(temp);
    //         if (element.ChildElements.length > 0) {
    //             let childcolumns = Object.keys(element.ChildElements[0]);
    //             let childcolumnsarray: any[] = [''];
    //             childcolumns.forEach(childcol => childcolumnsarray.push(childcol));
    //             rows.push(childcolumnsarray);
    //             element.ChildElements.forEach(childelement => {
    //                 let childrow = Object.values(childelement);
    //                 let childrowarray: any[] = [''];
    //                 childrow.forEach(childrowele => childrowarray.push(childrowele));
    //                 rows.push(childrowarray);
    //             });
    //         }
    //     });
    //     // doc.autoTable(col, rows);
    //     doc.autoTable(col, rows, { styles: { overflow: 'linebreak', columnWidth: 'auto' } });
    //     doc.save('sample' + '_export_' + new Date().getTime() + '.pdf');
    // }

    //Export to Excel
    // exportAsXLSX() {
    // let exportArray = [];
    // let col = [];
    // this.columns.forEach(column => {
    // col.push(column.name);
    // })
    // exportArray.push(col);
    // this.gridprop.Elements.forEach(element => {
    // let rowsarray = [];
    // for (let column in element) {
    // if (column != 'ChildElements' && column != 'EditVisible' && column != 'DeleteVisible') {
    // rowsarray.push(element[column]);
    // }
    // }
    // exportArray.push(rowsarray);
    // if (element.ChildElements.length > 0) {
    // let childcolumns = Object.keys(element.ChildElements[0]);
    // let childcolumnsarray: any[] = [''];
    // childcolumns.forEach(childcol => childcolumnsarray.push(childcol));
    // exportArray.push(childcolumnsarray);
    // element.ChildElements.forEach(childelement => {
    // let childrow = Object.values(childelement);
    // let childrowarray: any[] = [''];
    // childrow.forEach(childrowele => childrowarray.push(childrowele));
    // exportArray.push(childrowarray);
    // });
    // }
    // });
    // this.exportAsExcelFile(exportArray, 'sample');
    // }
    // exportAsExcelFile(json: any[], excelFileName: string): void {
    // const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json, { skipHeader: true });
    // const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    // const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    // this.saveAsExcelFile(excelBuffer, excelFileName);
    // }
    // saveAsExcelFile(buffer: any, fileName: string): void {
    // const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    // FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
    // }

    //import
    // arrayBuffer: any;
    // jsonStr: any[];
    // index1 = -1;
    // file: File;
    // incomingfile(event) {
    // this.file = event.target.files[0];
    // }
    // uploadXLSX() {
    // try {
    // const fileReader = new FileReader();
    // fileReader.onload = (e) => {
    // this.arrayBuffer = fileReader.result;
    // const data = new Uint8Array(this.arrayBuffer);
    // const arr = new Array();
    // for (let i = 0; i !== data.length; ++i) { arr[i] = String.fromCharCode(data[i]); }
    // const bstr = arr.join('');
    // const workbook = XLSX.read(bstr, { raw: true, type: 'binary', cellDates: true });
    // const first_sheet_name = workbook.SheetNames[0];
    // const worksheet = workbook.Sheets[first_sheet_name];
    // this.jsonStr = XLSX.utils.sheet_to_json(worksheet, { raw: true });
    // let childcolumns = [];
    // this.gridprop.Elements = [];
    // for (let i = 0; i < this.jsonStr.length; i++) {
    // let parentArrayLength = this.gridprop.Elements.length;
    // let currentrowvalues = Object.values(this.jsonStr[i]);
    // if (currentrowvalues[0]) {
    // this.gridprop.Elements.push(this.jsonStr[i]);
    // } else if (i > 0 && Object.values(this.jsonStr[i - 1])[0]) {
    // currentrowvalues.forEach((rowvalue, index) => {
    // if (index > 0) {
    // childcolumns.push(rowvalue);
    // }
    // });
    // this.gridprop.Elements[parentArrayLength - 1].ChildElements = [];
    // this.gridprop.Elements[parentArrayLength - 1].EditVisible = true;
    // this.gridprop.Elements[parentArrayLength - 1].DeleteVisible = true;
    // } else {
    // let childElement = {};
    // currentrowvalues.forEach((rowvalue, index) => {
    // if (index > 0) {
    // childElement[childcolumns[index - 1]] = rowvalue;
    // }
    // });
    // this.gridprop.Elements[parentArrayLength - 1].ChildElements.push(childElement);
    // }
    // }
    // };
    // fileReader.readAsArrayBuffer(this.file);
    // } catch (error) {
    // console.log(error);
    // }
    // }


    createDummyElement(text: string, options: Options): HTMLElement {
        const element = document.createElement('div')
        const textNode = document.createTextNode(text)

        element.appendChild(textNode)

        element.style.fontFamily = options.font
        element.style.fontSize = options.fontSize
        element.style.fontWeight = options.fontWeight
        element.style.lineHeight = options.lineHeight
        element.style.position = 'absolute'
        element.style.visibility = 'hidden'
        element.style.left = '-999px'
        element.style.top = '-999px'
        element.style.width = options.width
        element.style.height = 'auto'
        element.style.wordBreak = options.wordBreak

        document.body.appendChild(element)

        return element
    }

    destroyElement(element: HTMLElement): void {
        element.parentNode.removeChild(element)
    }

    calculateSize(text: string, options: OptionalOptions): Size {

        const cacheKey = JSON.stringify({ text: text, options: options })

        if (cache[cacheKey]) {
            return cache[cacheKey]
        }

        // prepare options
        options.font = options.font || 'sans-serif'
        options.fontSize = options.fontSize || '14px'
        options.fontWeight = options.fontWeight || 'normal'
        options.lineHeight = options.lineHeight || 'normal'
        options.width = options.width || 'auto'
        options.wordBreak = options.wordBreak || 'normal'

        const element = this.createDummyElement(text, options as Options)

        const size = {
            width: element.offsetWidth,
            height: element.offsetHeight,
        }

        this.destroyElement(element)

        cache[cacheKey] = size

        return size
    }
    stopClickEvent(event: any) {
        event.stopPropagation();

    }
    toggleGridColumns() {
        if (this.originalColumnGrid) {
            this.originalColumns = [...this.columns];

            this.reArrangeModalRef = this.dialog.open(RearrangegridComponent, {
                hasBackdrop: true,
                disableClose: true,
                panelClass: 'dialog-width-md',
                data: { inputData: [...this.columns] }
            });
            this.reArrangeModalRef.afterClosed().subscribe(result => {
                if(result) {
                    this.columns = result;
                    this.originalColumnGrid = false;
                }
            });
        } else {
            this.columns = [...this.originalColumns];
            this.originalColumnGrid = true;
        }
    }

    rowView(element, rowViewTemplate) {
        this.selectedRow = element;
        this.selectedRowArray = Object.keys(this.selectedRow).filter(item => item != 'ChildElements' && item != 'EditVisible');
        this.rowViewModalRef = this.dialog.open(rowViewTemplate, {
            hasBackdrop: true,
            disableClose: true,
            panelClass: 'dialog-width-lg'
        });
    }

    getColValue(colValue) {
        if (Array.isArray(colValue)) {
            const arrayElements = [];
            colValue.forEach(ele => {
                if (typeof ele !== 'object') {
                    arrayElements.push(ele);
                }
            });
            return arrayElements.toString();
        }
        return colValue;
    }

    getResultPass(element) {
        for (const column of this.columns) {
            if (this.statusList.SucessList.find(e => e === element[column.name])) {
                return true;
            }
        }
    }

    // result fail
    getResultFail(element) {
        for (const column of this.columns) {
            if (this.statusList.FailList.find(e => e === element[column.name])) {
                return true;
            }
        }
    }

    // to show spinner
    getInprocess(element) {
        for (const column of this.columns) {
            if (this.statusList.InprocessList.find(e => e === element[column.name])) {
                return true;
            }
        }
    }

    isObject(colValue) {
        if (typeof colValue === 'object' && !checkNullorUndefined(colValue)) {
            return true;
        }
    }

    onColValueClick(value) {
        this.emitColumnValue.emit(value);
    }

    ngOnDestroy() {
        if (!checkNullorUndefined(this.reArrangeModalRef)) this.reArrangeModalRef.close();
        if (!checkNullorUndefined(this.rowViewModalRef)) this.rowViewModalRef.close();
    }
}

interface OptionalOptions {
    font?: string
    fontSize?: string
    fontWeight?: string
    lineHeight?: string
    width?: string
    wordBreak?: string
}

interface Options {
    font: string
    fontSize: string
    fontWeight: string
    lineHeight: string
    width: string
    wordBreak: string
}

interface Size {
    width: number
    height: number
}

const cache = {}
