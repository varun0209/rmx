import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { String } from 'typescript-string-operations';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from '../../../services/common.service';
import { ApiConfigService } from '../../../utilities/rlcutl/api-config.service';
import { AppErrorService } from '../../../utilities/rlcutl/app-error.service';
import { AppService } from '../../../utilities/rlcutl/app.service';
import { MasterPageService } from '../../../utilities/rlcutl/master-page.service';
import { CommonEnum } from '../../../enums/common.enum';
import { ClientData } from '../../../models/common/ClientData';
import { UiData } from '../../../models/common/UiData';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { AttributeData, RowData } from '../../../models/maintenance/rule-master/rule-master-classes';

@Component({
  selector: 'app-rule-master',
  templateUrl: './rule-master.component.html',
  styleUrls: ['./rule-master.component.css']
})
export class RuleMasterComponent implements OnInit {

  @Input() clientData: ClientData;
  @Input() uiData: UiData;
  @Input() title: string;
  @Input() previewOnTop: boolean = false
  @Input() showPreview: boolean = true;
  @Input() excludeOr: boolean = false;
  @Input() showValidateButton: boolean = true;

  @Output() onFormulaChange = new EventEmitter();
  @Output() onFormulaRowsChange = new EventEmitter();

  // Lists
  attributeList: AttributeData[] = [];
  rowDataList: RowData[] = [];

  // Caching
  cacheAttributes: AttributeData[] = [];
  cacheOperator: any[] = [];
  cacheControlNValue: any[] = [];

  ruleCondition: string = "";
  finalFormula: string = "";

  constructor(
    private appService: AppService,
    public appErrService: AppErrorService,
    public masterPageService: MasterPageService,
    private spinner: NgxSpinnerService,
    private apiConfigService: ApiConfigService,
    private commonService: CommonService,
    private snackbar: XpoSnackBar
  ) { }

  ngOnInit(): void {
    this.getAttributeNameList()

    if (this.rowDataList.length === 0) {
          this.resetFormula();
    }
  }

  getAttributeNameList() {
    // Check the Cache for the Attributes
    const cache = this.cacheAttributes;
    if (cache && cache.length > 0) {
      this.attributeList = cache;
      return;
    }

    this.attributeList = [];
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getAttributeMasterList_Filtered);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) =>{
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response) &&
            !this.appService.checkNullOrUndefined(res.Response.AttributeMasterList_Filtered) &&
            res.Response.AttributeMasterList_Filtered.length > 0) {

            const hold=[];
            res.Response.AttributeMasterList_Filtered.forEach(element => {
              const item = new AttributeData();
              item.ID = element.ATTRIBUTEID;
              item.TEXT = element.ATTR_PROPERTY;
              item.TYPE = element.ATTR_TYPE;
              hold.push(item);
            });
            this.attributeList = hold;

            // Cache the Attributes
            if (this.attributeList && this.attributeList.length > 0) {
              this.cacheAttributes= hold;
            }
        }
      }
    });
  }

  getOperatorsByAttributeType(data: RowData) {

    // Check the Cache for the Operators
    const cache = this.cacheOperator.find(x => x.key == data.selectedAttribute.ID);
    if (cache) {
      data.operatorList = cache.operatorList;
      this.getAttributeControlNValue(data)
      return;
    }

    data.operatorList = [];
    const attribute = { [CommonEnum.attributeType]: data.selectedAttribute.TYPE };
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_ATTRIBUTE_MASTER: attribute };
    const url = String.Join('/', this.apiConfigService.getOperatorsByAttributeType);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          data.operatorList = res.Response;

          // Cache the Operators
          if (data.operatorList && data.operatorList.length > 0) {
            this.cacheOperator.push({
              key: data.selectedAttribute.ID,
              operatorList: data.operatorList
            })
          }

          this.getAttributeControlNValue(data);
        }
      }
    });
  }

  getAttributeControlNValue(data: RowData) {
    data.valueList = [];
    this.appErrService.clearAlert();

    // Check the cache for ValueList
    const cache = this.cacheControlNValue.find(x => x.key == data.selectedAttribute.ID);
    if (cache) {
      data.valueList = cache.data; 
      data.selectedControlType = 'DROPDOWN';
      this.spinner.hide();
      return;
    }

    const attribute = { [CommonEnum.attributeID]: data.selectedAttribute.ID };
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_ATTRIBUTE_MASTER: attribute };
    const url = String.Join('/', this.apiConfigService.getAttributeControlNValue);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          if (!this.appService.checkNullOrUndefined(res.Response.Value) && res.Response.Value.length > 0) {
            data.valueList = res.Response.Value;
          }
          if (!this.appService.checkNullOrUndefined(res.Response.ControlType)) {
            data.selectedControlType = res.Response.ControlType;
          }

          // Cache the ValueList
          if (data.selectedControlType === 'DROPDOWN' &&  data.valueList && data.valueList.length > 0) {
            this.cacheControlNValue.push({
              key: data.selectedAttribute.ID,
              data: data.valueList
            })
          }
        }
      }
    });
  }

  onAttributeChange(data: RowData) {
    data.selectedOperator = null;
    data.selectedValue = null;
    this.getOperatorsByAttributeType(data);
    this.computeFinalFormula();
  }

  onOperatorChange(data:RowData) {
    data.selectedValue = null;
    data.multiSelectValue = (data.selectedOperator === CommonEnum.in); // Multiselect becomes True 
    this.computeFinalFormula();
  }

  onValuecomboChange(data) {
    this.computeFinalFormula();
  }

  onValueTextBoxChange(data:RowData) {
    this.computeFinalFormula();
  }

  addLine() {
    const row = new RowData();
    this.rowDataList.push(row);
  }

  delLine(index: number) {
    // Confirm deletion
    this.rowDataList.splice(index, 1)
    if (this.rowDataList.length === 0)
      this.addLine();
      this.computeFinalFormula();
  }

  validateFormula() {
    // API Call to validate parens, and, or, combinations.
  }

  private processFormula(data)
  {
    this.rowDataList = [];
    
    // Split data on ' AND ' (Case insensitive)
    const reg = new RegExp(' and ', 'i');
    const splitData = data.split(reg).filter(Boolean);

    // Loop through each Formula
    splitData.forEach(d => {

      let leftSide = '';
      let operator = '';
      let rightSide = '';

      const regContains = new RegExp('\.Contains', 'i')
      const regStartsWith = new RegExp('\.StartsWith', 'i')
      const regEndsWith = new RegExp('\.EndsWith', 'i')
      const regGetValue = new RegExp('\(([^)]+)\)');
      
      if (regContains.test(d)) {
        // do something to get the value 
        const matches =regGetValue.exec(d);
        leftSide = d.split('.')[0];
        operator = '.Contains'
        rightSide = matches[1];
      } else if (regStartsWith.test(d)) {
        // do something to get the value 
        const matches =regGetValue.exec(d);
        leftSide = d.split('.')[0];
        operator = '.StartsWith'
        rightSide = matches[1];
      } else if (regEndsWith.test(d)) {
        // do something to get the value 
        const matches =regGetValue.exec(d);
        leftSide = d.split('.')[0];
        operator = '.EndsWith'
        rightSide = matches[1];
      } else { // normal operator: =, !=, <=, >=, <, >, etc 
        const regOperator = new RegExp('( != | <> | <= | >= | = | > | < )')
        const splitFormula = d.split(regOperator);
        leftSide = splitFormula[0];
        operator = splitFormula[1];
        rightSide = splitFormula[2];
      }

      // Now create RowData objects and populate RowDataList
      // Make sure we "wait" on any API calls
      const rowData = new RowData();
      rowData.selectedAttribute = this.attributeList.find(x => x.TEXT === leftSide)
      rowData.selectedOperator = operator;

      if (this.appService.checkNullOrUndefined(rowData.selectedValue)) {
        rowData.selectedValue = [];
      }
      if (rightSide.indexOf(',') === -1) {
        rightSide = rightSide.substring(1, rightSide.length-1)
        rowData.selectedValue.push(rightSide);
      } else {
        const valArr = rightSide.split(',');
        valArr.forEach(val => {
          val = val.substring(1, val.length-12)
          rowData.selectedValue.push(val);
        });
      }

      this.rowDataList.push(rowData);
      this.computeFinalFormula();
    });
  }

  resetFormula() {
    this.rowDataList = [];
    this.addLine();
  }

  loadFormula(data: string) {

    if (this.appService.checkNullOrUndefined(data) || data === "") {
      this.resetFormula();
      return;
    }

    if (this.excludeOr === false) {
      this.snackbar.error("Formula's with 'OR' are not supported at this time.")
    }

    // Check the Cache for the Attributes
    const cache = this.cacheAttributes;
    if (cache && cache.length > 0) {
      this.attributeList = cache;
      this.processFormula(data);
      return;
    }

    this.attributeList = [];
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getAttributeMasterList_Filtered);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) =>{
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response) &&
            !this.appService.checkNullOrUndefined(res.Response.AttributeMasterList_Filtered) &&
            res.Response.AttributeMasterList_Filtered.length > 0) {
  
            const hold=[];
            res.Response.AttributeMasterList_Filtered.forEach(element => {
              const item = new AttributeData();
              item.ID = element.ATTRIBUTEID;
              item.TEXT = element.ATTR_PROPERTY;
              item.TYPE = element.ATTR_TYPE;
              hold.push(item);
            });
            this.attributeList = hold;

            // Cache the Attributes
            if (this.attributeList && this.attributeList.length > 0) {
              this.cacheAttributes= hold;
            }
  
            this.processFormula(data);
        }
      }
    });

  }

  computeFinalFormula() {
    const tempArr = this.rowDataList.slice().sort((a, b) => (a.formula || b.formula) ? (!a.formula ? -1 : !b.formula ? 1 : a.formula.localeCompare(b.formula)) : 0 ); // Handles undefined better

    let temp = "";
    if (this.excludeOr) {
      tempArr.forEach(item => {
        if (item.formula === undefined)
          return;

        if (temp.length > 0) {
          temp += " AND ";
        }
        if (item.formula) {
          temp += item.formula;
        }
      });

      this.finalFormula = temp;
      this.onFormulaChange.emit(temp) 
      this.onFormulaRowsChange.emit(this.rowDataList.map<string>(x => x.formula));
      return;
    }

    // Until we get the Antlr Lexer/Parser working, just use AND
    tempArr.forEach(item => {
      if (item.formula === undefined)
        return;

      if (temp.length > 0) {
        temp += " AND ";
      }
      if (item.formula) {
        temp += item.formula;
      }
    });

    this.finalFormula = temp;
    this.onFormulaChange.emit(temp) 
    this.onFormulaRowsChange.emit(this.rowDataList.map<string>(x => x.formula));
  }
}
