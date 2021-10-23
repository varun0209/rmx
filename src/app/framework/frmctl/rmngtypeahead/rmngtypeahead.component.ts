import { Component, OnInit, Input, Output, EventEmitter, ViewChild, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { map, debounceTime, switchMap } from 'rxjs/operators';
import { StatusCodes } from '../../../enums/status.enum';
import { AppService } from '../../../utilities/rlcutl/app.service';
import { AppErrorService } from '../../..//utilities/rlcutl/app-error.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from '../../../utilities/rlcutl/api.service';
import { String } from 'typescript-string-operations';
import { StorageData } from '../../../enums/storage.enum';
import { ClientData } from '../../../models/common/ClientData';
import { CommonService } from '../../../services/common.service';

@Component({
  selector: 'rmngtypeahead',
  templateUrl: './rmngtypeahead.component.html',
  styleUrls: ['./rmngtypeahead.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RmngtypeaheadComponent),
      multi: true
    }
  ]
})
export class RmngtypeaheadComponent implements OnInit {

  @ViewChild('typeAhead') typeAhead;

  @Output() emitTypeAheadValue = new EventEmitter();

  @Input() label: string;
  @Input() value: string;
  @Input() id: string;
  @Input() placeholder: string;
  @Input() bufferSize: number;
  @Input() bufferDataToDisplay: number;
  @Input() typeaheadPattern: any;
  @Input() errorMessage: any;
  @Input() skuLength: any;
  @Input() name: string; 
  @Input() disabled = false;

  @Input()
  set configData(value) {
    if (!this.appService.checkNullOrUndefined(value)) {
      this.dataConfig = value;
    }
  }

  writeValue(value: any) { }

  registerOnChange(fn: any) { }

  registerOnTouched() { }

  @Input()
  set clearTypeAhead(value) {
    if (value) {
      setTimeout(() => {
        this.typeAhead['searchInput']['nativeElement'].value = '';
      }, 0)
      this.skuArray();
    }
  }

  @Input()
  set editTypeAhead(value) {
    if (!this.appService.checkNullOrUndefined(value)) {
      setTimeout(() => {
        this.typeAhead['searchInput']['nativeElement'].value = value;
      }, 0)
    }
    this.skuArray();
  }


  clientData = new ClientData();
  bufferSKU = [];
  skus = [];
  dataConfig: any;
  appConfig: any;
  search = new Subject<string>();

  constructor(
    private appService: AppService,
    public appErrService: AppErrorService,
    private spinner: NgxSpinnerService,
    public apiservice: ApiService,
    private commonService: CommonService
  ) {
    this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
    this.appConfig = JSON.parse(localStorage.getItem(StorageData.appConfig));
    this.skuLength = this.appConfig.default.skuLength;
    this.searchData();
  }

  searchData() {
    this.searchApiCall(this.search)
      .subscribe(response => {
        const res = response.body;
        this.spinner.hide();
        this.skuArray();
        if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.pass) {
          this.skus = res.Response;
          this.bufferSKU = this.skus.slice(0, this.bufferSize);
          this.typeAhead.open();
        } else if (!this.appService.checkNullOrUndefined(res) && res.Status === StatusCodes.fail) {
          this.typeAhead.close();
          this.appErrService.setAlert(res.ErrorMessage.ErrorDetails, true);
          this.typeAhead.element.firstChild.classList.add('required-red');
        }
      });
  }

  searchApiCall(terms: Observable<string>) {
    return terms.pipe(debounceTime(400),
      switchMap(value => {
        this.emitTypeAheadValue.emit(null);
        this.appErrService.clearAlert();
        this.typeAhead.element.firstChild.classList.remove('required-red');
        this.typeAhead.close();
        if (this.commonService.checkPattern(null, this.typeaheadPattern, this.errorMessage, value)) {
          if (value.length > this.skuLength) {
            if (!this.appService.checkNullOrUndefined(value)) {
              const skuValue = value.trim().toUpperCase();
              this.spinner.show();
              const requestObj = { ClientData: this.clientData, UIData: this.dataConfig.uiData };
              const url = String.Join('/', this.dataConfig.url, encodeURIComponent(encodeURIComponent(skuValue)));
              return this.apiservice.apiPostRequest(url, requestObj)
                .pipe(map(response => response));
            }
          }
        } else {
          this.typeAhead['searchInput']['nativeElement'].value = '';
          this.typeAhead.element.firstChild.classList.add('required-red');
        }
        this.skuArray();
        this.spinner.hide();
        return [];
      }));
  }

  skuArray() {
    this.bufferSKU = [];
    this.skus = [];
  }

  ngOnInit() {
  }

  onChange(value) {
    this.emitTypeAheadValue.emit(value);
    this.skuArray();
    this.typeAhead.element.firstChild.classList.remove('required-red');
  }

  onScroll({ end }) {
    if (this.skus.length <= this.bufferSKU.length) {
      return;
    }

    if (end + this.bufferDataToDisplay >= this.bufferSKU.length) {
      this.fetchMore();
    }
  }


  onScrollToEnd() {
    this.fetchMore();
  }

  private fetchMore() {
    if (this.bufferSKU.length < this.skus.length) {
      const len = this.bufferSKU.length;
      const more = this.skus.slice(len, this.bufferSize + len);
      this.bufferSKU = this.bufferSKU.concat(more);
    }
  }

  clear() {
    this.skuArray();
    this.typeAhead.element.firstChild.classList.remove('required-red');
  }
}
