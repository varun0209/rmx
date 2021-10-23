import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Grid } from '../../models/common/Grid';
import { AppService } from '../../utilities/rlcutl/app.service';
import { checkNullorUndefined } from '../../enums/nullorundefined';
import { StorageData } from '../../enums/storage.enum';
import { ClientData } from '../../models/common/ClientData';
import { UiData } from '../../models/common/UiData';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';
import { CatalogUtilityComponent } from '../catalog-utility/catalog-utility.component';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-catalog-sku-utility',
  templateUrl: './catalog-sku-utility.component.html',
  styleUrls: ['./catalog-sku-utility.component.css']
})
export class CatalogSkuUtilityComponent implements OnInit {

  @Output() emitSkuCatalog = new EventEmitter();
  storageData = StorageData;
  clientData: ClientData;
  uiData: UiData;
  appConfig: any;
  data: any;
  lookupResponse: any;
  grid: Grid;
  catalogList: any;

  constructor(
    public masterPageService: MasterPageService,
    private appService: AppService) {
    this.appConfig = JSON.parse(localStorage.getItem(this.storageData.appConfig));
  }

  ngOnInit(): void {
    this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));
    if (this.data) {
      this.clientData = this.data.clientData;
      this.uiData = this.data.uiData;
      this.lookupResponse = this.data.catalogValues;
    }
    if (!checkNullorUndefined(this.lookupResponse)) {
      this.gridForm();
    }
  }

  gridForm() {
    this.grid = new Grid();
    this.grid.EditVisible = true;
    this.grid.ItemsPerPage = this.appConfig.catalogSkuLookup.griditemsPerPage;
    this.catalogList = this.appService.onGenerateJson(
      this.lookupResponse,
      this.grid
    );
  }

  //Edit Catalog List
  editCatalogList(event) {
    this.emitSkuCatalog.emit(event);
    this.masterPageService.hideModal();
  }

  //Popup close
  closePopup() {
    this.masterPageService.hideModal();
    this.appService.setFocus('carrier');
  }

}
