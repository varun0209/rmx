import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { AppService } from '../../../utilities/rlcutl/app.service';
import { AppErrorService } from '../../..//utilities/rlcutl/app-error.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from '../../../utilities/rlcutl/api.service';
import { String } from 'typescript-string-operations';
import { StorageData } from '../../../enums/storage.enum';
import { ClientData } from '../../../models/common/ClientData';
import { CommonService } from '../../../services/common.service';

@Component({
  selector: 'app-dyn-typeahead',
  templateUrl: './dyn-typeahead.component.html',
  styleUrls: ['./dyn-typeahead.component.css']
})
export class DynTypeaheadComponent implements OnInit {


  @ViewChild('typeAhead') typeAhead;

  @Output() emitTypeAheadValue = new EventEmitter();

  @Input() label: string;
  @Input() value: string;
  @Input() id: string;
  @Input() placeholder: string;
  @Input() bufferSize: number;
  @Input() reqiured = false;
  @Input() bufferDataToDisplay: number;
  @Input() typeaheadPattern: any;
  @Input() errorMessage: any;
  @Input() selectedTypeahead: any;
  @Input() virtualScroll = true;
  @Input() multiple = false;
  @Input() editableSearchTerm = true;

  @Input()
  set configData(value) {
    if (!this.appService.checkNullOrUndefined(value)) {
      this.searchData(value);
    }
  }

  @Input()
  set clearTypeAhead(value) {
    if (value) {
      this.typeAhead['searchInput']['nativeElement'].value = '';
    }
  }

  @Input()
  set editTypeAhead(value) {
    if (!this.appService.checkNullOrUndefined(value)) {
      this.typeAhead['searchInput']['nativeElement'].value = value;
    }
  }


  clientData = new ClientData();
  bufferList = [];
  filterList = [];
  totalList = [];
  appConfig: any;

  constructor(
    private appService: AppService,
    public appErrService: AppErrorService,
    private spinner: NgxSpinnerService,
    public apiservice: ApiService,
    private commonService: CommonService
  ) {
    this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
    this.appConfig = JSON.parse(localStorage.getItem(StorageData.appConfig));
  }

  ngOnInit() { }

  searchData(value) {
    this.clearList();
    this.commonService.commonApiCall(value.url, value.requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        this.totalList = res.Response.ParentLocations;
        this.bufferList = this.totalList.slice(0, this.bufferSize);
      }
    });
  }

  searchInput(value) {
    this.bufferList = [];
    this.selectedTypeahead = [];
    this.appErrService.clearAlert();
    this.typeAhead['searchInput']['nativeElement'].value = value ? value.term : '';
    if (value && value.term) {
      this.filterList = this.totalList.filter(res => res.Text.includes(value.term.toUpperCase()));
      this.bufferList = this.filterList.slice(0, this.bufferSize);
    } else {
      this.filterList = [];
      this.bufferList = this.totalList.slice(0, this.bufferSize);
    }
    this.emitTypeAheadValue.emit();
  }

  clearList() {
    this.bufferList = [];
    this.totalList = [];
  }

  blur() {
    this.filterList = [];
    this.bufferList = this.totalList.slice(0, this.bufferSize);
  }

  onChange(value) {
    this.typeAhead['searchInput']['nativeElement'].value = value ? value.Text : '';
    this.emitTypeAheadValue.emit(value);
    this.addOrRremoveRequiredRed(false);
  }

  onScroll({ end }) {
    const value = this.filterList.length ? 'filterList' : 'totalList';
    if (this[value].length <= this.bufferList.length) {
      return;
    }
    if (end + this.bufferDataToDisplay >= this.bufferList.length) {
      this.fetchMore();
    }
  }

  onScrollToEnd() {
    this.fetchMore();
  }

  private fetchMore() {
    const value = this.filterList.length ? 'filterList' : 'totalList';
    if (this.bufferList.length < this[value].length) {
      const len = this.bufferList.length;
      const more = this[value].slice(len, this.bufferSize + len);
      this.bufferList = this.bufferList.concat(more);
    }
  }

  clear() {
    // this.clearList();
    this.addOrRremoveRequiredRed(true);
  }

  addOrRremoveRequiredRed(flag) {
    if (this.reqiured) {
      if (flag) {
        this.typeAhead.element.firstChild.classList.add('required-red');
      } else {
        this.typeAhead.element.firstChild.classList.remove('required-red');
      }
    }
  }

}
