import { Component, OnInit, forwardRef, Input, Output, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ApiService } from '../../../utilities/rlcutl/api.service';
import { ApiConfigService } from '../../../utilities/rlcutl/api-config.service';
import { AppErrorService } from '../../../utilities/rlcutl/app-error.service';
import { String } from 'typescript-string-operations';
import { ClientData } from '../../../models/common/ClientData';
import { SKU } from '../../../models/receiving/ReceivingSKU';
import { Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { TypeaheadMatch } from 'ngx-bootstrap';
import { UiData } from '../../../models/common/UiData';
import { StorageData } from '../../../enums/storage.enum';
import { StatusCodes } from '../../../enums/status.enum';
import { Testing } from '../../../models/testing/Testing';


@Component({
  selector: 'rmauto-extender-one',
  templateUrl: './rmauto-extender-one.component.html',
  styleUrls: ['./rmauto-extender-one.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RmautoExtenderOneComponent),
      multi: true
    }]
})
export class RmautoExtenderOneComponent implements OnInit, ControlValueAccessor {

  @ViewChild('skuInput') SKUInput: ElementRef;
  @Input() skuDisabled = false;
  @Input() formStyle: string;
  @Input() lblClass: string;
  @Input() waitTime: string;
  @Input() id: string;
  @Input() uiData: UiData;
  @Input() partsList = [];
  @Input() typeaheadOptionField: string;
  @Input() isAdd = true;
  @Input() isDoneDisabled = false
  @Output() inputEvent = new EventEmitter();
  @Output() typeaheadResponse = new EventEmitter();

  typeaheadOptionsLimit: number;

  selectedSKU: string;

  changeCallback = (data: any) => { };
  touchCallback = () => { };
  content: any;
  message: string;

  IsSpecialChar: boolean = false;
  @Input() transactionId = "";
  @Input() disabled: boolean;
  @Input() isQtyDisabled = false;

  @Input()
  set fieldArrayInput(fieldArray: any) {
    if (fieldArray == undefined || fieldArray == "") {
      this.fieldArray = [{
        'Part': '',
        'Model': '',
        'Quantity': '',
        'MaxRPI': '',
        'WmxInvBal': '',
        'Description': '',
        'isPartDisabled': false
      }];
    } else {
      const arry = JSON.parse(fieldArray);
      arry.forEach(element => {
        if (element.Part !== '') {
          element.isPartDisabled = true;
        }
      });
      this.fieldArray = arry;
    }

  }
  get fieldArrayInput() {
    return this.fieldArray;
  }

  @Input() fieldArray: any[] = [{}];
  

  newAttribute: any = {
    'Part': '',
    'Model': '',
    'Quantity': '',
    'MaxRPI': '',
    'WmxInvBal': '',
    'Description': '',
    'isPartDisabled': false
  };

 
  clientData = new ClientData();
  storageData = StorageData;
  statusCode = StatusCodes;

  constructor(private appErrService: AppErrorService,
    private apiservice: ApiService,
    private apiConfigService: ApiConfigService) { }

  ngOnInit() {
    this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
  }

  addFieldValue(item, skuId, qtyId) {
    this.isAdd = true;
    this.isDoneDisabled = false;
    let field = this.fieldArray.find(e => Object.keys(e).length === 0 || e.Part == "" || e.Quantity == null || e.Model == "");
    if (this.appErrService.checkNullOrUndefined(field)) {
      this.fieldArray.push(this.newAttribute);
      this.newAttribute = {
        'Part': '',
        'Model': '',
        'Quantity': '',
        'MaxRPI': '',
        'WmxInvBal': '',
        'Description': '',
        'isPartDisabled': false
      };
    }
    else {
      this.verifyautoExtendValues(item, skuId, qtyId);
    }

  }

  verifyautoExtendValues(item, skuId, qtyId) {
    if ((item.Part == '' || item.Model == '') && item.quantity == null) {
      this.applyRequired(true, skuId);
      this.applyRequired(true, qtyId);
    }
    else if (item.Part == '' || item.Model == '') {
      this.applyRequired(true, skuId);
    }
    else if (item.Quantity == null) {
      this.applyRequired(true, qtyId);
    }
  }

  addData(index, item, skuId, qtyId) {
    let field = this.fieldArray.find(e => Object.keys(e).length === 0 || e.Part == "" || e.Quantity == null || e.Model == "");
    if (this.appErrService.checkNullOrUndefined(field)) {
      this.typeaheadResponse.emit(this.fieldArray);
    } else if ((!this.appErrService.checkNullOrUndefined(field) && this.fieldArray.length > 1)) {
      this.fieldArray.splice(index, 1);
      this.appErrService.clearAlert();
      this.typeaheadResponse.emit(this.fieldArray);
    } else {
      this.verifyautoExtendValues(item, skuId, qtyId)
    }
  }

  typeaheadOnSelect(e: TypeaheadMatch, index): void {
    this.fieldArray.forEach((elemet, i) => {
      if (i == index) {
        elemet.Part = e.item.Part;
        elemet.Model = e.item.Model;
        elemet.MaxRPI = e.item.MaxRPI;
        elemet.WmxInvBal = e.item.WmxInvBal;
        elemet.Description = e.item.Description;
        elemet.Quantity = 1;
      }
    });
  }

  writeValue(obj: any) {

  }

  registerOnChange(fn: any) {
    this.changeCallback = fn;
  }

  registerOnTouched(fn: any) {
    this.touchCallback = fn;
  }

  applyRequired(val: boolean, id) {
    if (val) {
      const input = <HTMLInputElement>document.getElementById(id);
      this.fieldArray.forEach(element => {
        if (element.Part == input.value) {
          element.Part = "";
          element.Model = "";
        }
      })
      return input.setAttribute("style", "border: 1px solid red;");


    }
    else {
      const input = <HTMLInputElement>document.getElementById(id);
      return input.removeAttribute('style');
    }
  }


  omit_special_char(event) {
    var pattern = /[\s]+$/;
    if (event.key.match(pattern)) {
      return false;
    }
  }
  clearClass(id) {
    let elem: HTMLElement = document.getElementById(id);
    return elem.removeAttribute('style');
  }
}

