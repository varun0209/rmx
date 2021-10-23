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
import { checkNullorUndefined } from '../../../enums/nullorundefined';

@Component({
  selector: 'rmauto-extender',
  templateUrl: './rmauto-extender.component.html',
  styleUrls: ['./rmauto-extender.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RmautoExtenderComponent),
      multi: true
    }]
})
export class RmautoExtenderComponent implements OnInit, ControlValueAccessor {

  @ViewChild('skuInput') SKUInput: ElementRef;
  @Input() skuDisabled = false;
  @Input() formStyle: string;
  @Input() lblClass: string;
  @Input() waitTime:string;
  @Input() id: string;
  @Input() uiData: UiData;

  @Output() inputEvent = new EventEmitter();
  @Output() typeaheadResponse = new EventEmitter();

  typeaheadOptionsLimit: number;
  skuList: SKU[] = [];
  selectedSKU: string;

  changeCallback = (data: any) => { };
  touchCallback = () => { };
  content: any;
  message: string;

  IsSpecialChar: boolean = false;
  @Input() transactionId = "";
  @Input() disabled: boolean;

  @Input()
  set fieldArrayInput(fieldArray: any) {
    if (fieldArray == undefined || fieldArray == "") {
      this.fieldArray = [{
        'sku': '',
        'selectedSKUModel': '',
        'quantity': null
      }];
    } else {
      this.fieldArray = JSON.parse(fieldArray);
    }

  }
  get fieldArrayInput() {
    return this.fieldArray;
  }

  @Input() fieldArray: any[] = [{}];

  // @Input() fieldArrayInput: any[]

  newAttribute: any = {'sku': '',
  'selectedSKUModel': '',
  'quantity': null};
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
      let field = this.fieldArray.find(e => Object.keys(e).length === 0 || e.sku == "" || e.quantity == null || e.selectedSKUModel == "");
    if (checkNullorUndefined(field)) {      
      this.fieldArray.push(this.newAttribute);
      this.newAttribute = {'sku': '',
      'selectedSKUModel': '',
      'quantity': null};
    }
    else{
      this.verifyautoExtendValues(item, skuId, qtyId);
    }
   
  }

  verifyautoExtendValues(item, skuId, qtyId){
    if((item.sku == '' || item.selectedSKUModel== '') && item.quantity == null){
      this.applyRequired(true, skuId);
      this.applyRequired(true, qtyId);
    }
    else if(item.sku == '' || item.selectedSKUModel== ''){
      this.applyRequired(true, skuId);
    }
    else if(item.quantity == null){
      this.applyRequired(true, qtyId);
    }
  }

  addData(index,item, skuId, qtyId) {
      let field = this.fieldArray.find(e => Object.keys(e).length === 0 || e.sku == "" || e.quantity == null || e.selectedSKUModel == "");
    if (checkNullorUndefined(field)) {
      this.typeaheadResponse.emit(this.fieldArray);
    } else if ((!checkNullorUndefined(field) && this.fieldArray.length > 1)) {
      this.fieldArray.splice(index, 1);
      this.appErrService.clearAlert();
      this.typeaheadResponse.emit(this.fieldArray);
    }else{
      this.verifyautoExtendValues(item, skuId, qtyId)
    }
  }

  getEligibleSKUs(event) {
    let skuValue = event.value.trim().toUpperCase();
    if (skuValue.length >= 3) {
      let requestObj = { ClientData: this.clientData, UIData:this.uiData};
      const url = String.Join("/", this.apiConfigService.getEligibleSKUsUrl, encodeURIComponent(encodeURIComponent(skuValue)));
      this.apiservice.apiPostRequest(url, requestObj)
        .subscribe(response => {
          let res = response.body;
          if (!checkNullorUndefined(res) && res.Status === this.statusCode.pass) {
            this.skuList = res.Response;
            this.typeaheadOptionsLimit = this.skuList.length;
            this.appErrService.setAlert('', false);
            this.applyRequired(false, event.target.id);
          } else if (!checkNullorUndefined(res) && res.Status === this.statusCode.fail) {
            this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
            this.applyRequired(true, event.target.id);
          }
        }, erro => {
          this.appErrService.handleAppError(erro);
        });
    }
    else {
      this.appErrService.clearAlert();
      this.skuList = [];
    }
  }

  typeaheadOnSelect(e: TypeaheadMatch, index): void {
    this.fieldArray.forEach((elemet, i) => {
      if (i == index) {
        elemet.sku = e.item.Sku;
        elemet.selectedSKUModel = e.item.Model;
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
        if (element.sku == input.value) {
          element.sku = "";
          element.selectedSKUModel = "";
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
  clearClass(id){    
    let elem: HTMLElement = document.getElementById(id);
    return elem.removeAttribute('style');
  }
}
