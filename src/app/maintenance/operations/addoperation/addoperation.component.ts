import { OperationData, OperationConfigs } from './../../../models/maintenance/operations/Operation';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonEnum } from '../../../enums/common.enum';
import { AppService } from '../../../utilities/rlcutl/app.service';
import { MasterPageService } from '../../../utilities/rlcutl/master-page.service';
import { StorageData } from '../../../enums/storage.enum';
import { TextCase } from '../../../enums/textcase.enum';

@Component({
  selector: 'app-addoperation',
  templateUrl: './addoperation.component.html',
  styleUrls: ['./addoperation.component.css']
})
export class AddoperationComponent implements OnInit {

  @Output() emitSubmitNewOperation = new EventEmitter();
  @Input() appConfig: any;

  commonEnum = CommonEnum;

  newOperationData = new OperationData();

  operationIDPattern: any;
  namePattern: any;
  rankPattern: any;
  textCase = TextCase;

  constructor(public appService: AppService,
    public masterPageService: MasterPageService) {
  }


  ngOnInit() {
    this.loadPatterns();
    this.newOperationData.OperationConfigs = new OperationConfigs();
    this.appService.setFocus('addoperationid');
  }

  private loadPatterns() {
    const pattern = JSON.parse(localStorage.getItem(StorageData.patternList));
    if (!this.appService.checkNullOrUndefined(pattern)) {
      this.operationIDPattern = new RegExp(pattern.operationPattern);
      this.namePattern = new RegExp(pattern.namePattern);
      this.rankPattern = new RegExp(pattern.operationRankPattern);
    }
  }

  onAppEnableChange(value) {
    this.newOperationData.APPENABLED = value ? CommonEnum.yes : CommonEnum.no;
  }

  onRouteEligibleChange(value) {
    this.newOperationData.OperationConfigs.ROUTE_ELIGIBLE = value ? CommonEnum.yes : CommonEnum.no;
  }


  onForceMoveEligibleChange(value) {
    this.newOperationData.OperationConfigs.FORCEMOVEELIGIBLE = value ? CommonEnum.yes : CommonEnum.no;
  }

  onActiveChange(value) {
    this.newOperationData.OperationConfigs.ACTIVE = value ? CommonEnum.yes : CommonEnum.no;
  }

  submit(): void {
    this.newOperationData.IsModify = true;
    this.newOperationData.OperationConfigs.IsModify = true;
    this.emitSubmitNewOperation.emit(this.newOperationData);
  }
}
