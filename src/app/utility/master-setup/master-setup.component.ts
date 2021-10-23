import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';
import { Grid } from '../../models/common/Grid';
import { AppService } from '../../utilities/rlcutl/app.service';
import { masterModel } from '../../models/utility/master-setup';
import { RmgridComponent } from '../../framework/frmctl/rmgrid/rmgrid.component';
import { checkNullorUndefined } from '../../enums/nullorundefined';

@Component({
  selector: 'app-master-setup',
  templateUrl: './master-setup.component.html',
  styleUrls: ['./master-setup.component.css']
})
export class MasterSetupComponent implements OnInit, OnDestroy {
  @ViewChild(RmgridComponent) rmgrid: RmgridComponent;

  title: string;
  
  rowcolumns: any[] = [];
  operationTrans: masterModel[] = [];
  elementtest: masterModel;
  grid: Grid;
  hidegrid: boolean = true;
  hideorshow: boolean = true;
  showadd: boolean = false;
  addStatus: boolean = false;
  rowtoedit: any = {};

  config() {
    this.operationTrans = [
      {
        "ADDDATE": "Data1",
        "ADDWHO": "Data1",
        "AMPSFLAG": "Data1",
        "AUDIT_COUNT": "Data1",
        "AUTOMATED_GRADING_FLG": "Data1",
        "AUTO_QUAL_FLG": "Data1",
        "BDPFLAG": "Data1",
        "BLUETOOTH_CAPABLE_FLAG": "Data1",
        "CLNR_PROCESS_EXCLUDE_YN": "Data1",
        "COMPLETE_TEST": "Data1",
        "COMPLIANCE_MODEL": "Data1",
        "CONSTRAINED_YN": "Data1",
        "CORE_ASURION_FLAG": "Data1",
        "CORE_FLAG": "Data1",
        "DATARCHECK": "Data1",
        "DESCR": "Data1",
        "DIRECT_TEST_CAPABLE": "Data1",

        "EDITDATE": "Data1",
        "EDITWHO": "Data1",
        "EVDO_CAPABLE_FLAG": "Data1",
        "FACTORY_RESET": "Data1",
        "FCC_ID": "Data1",
        "GLPFLAG": "Data1",
        "GPS_CAPABLE_FLAG": "Data1",
        "GSM_CAPABLE_FLAG": "Data1",
        "INTERNAL_BATTERY": "Data1",
        "IS_HTML_MODEL": "Data1",
        "KILL_SWITCH_FLAG": "Data1",
        "LAUNCH_DATE": "Data1",

        "LIKEFORLIKEPERCENTAGE": "Data1",
        "LOOPBACK_CAPABLE_FLAG": "Data1",

      },
      {
        "ADDDATE": "Data2",
        "ADDWHO": "Data2",
        "AMPSFLAG": "Data2",
        "AUDIT_COUNT": "Data2",
        "AUTOMATED_GRADING_FLG": "Data2",
        "AUTO_QUAL_FLG": "Data2",
        "BDPFLAG": "Data2",
        "BLUETOOTH_CAPABLE_FLAG": "Data2",
        "CLNR_PROCESS_EXCLUDE_YN": "Data2",
        "COMPLETE_TEST": "Data2",
        "COMPLIANCE_MODEL": "Data2",
        "CONSTRAINED_YN": "Data2",
        "CORE_ASURION_FLAG": "Data2",
        "CORE_FLAG": "Data2",
        "DATARCHECK": "Data2",
        "DESCR": "Data2",
        "DIRECT_TEST_CAPABLE": "Data2",

        "EDITDATE": "Data2",
        "EDITWHO": "Data2",
        "EVDO_CAPABLE_FLAG": "Data2",
        "FACTORY_RESET": "Data2",
        "FCC_ID": "Data2",
        "GLPFLAG": "Data2",
        "GPS_CAPABLE_FLAG": "Data2",
        "GSM_CAPABLE_FLAG": "Data2",
        "INTERNAL_BATTERY": "Data2",
        "IS_HTML_MODEL": "Data2",
        "KILL_SWITCH_FLAG": "Data2",
        "LAUNCH_DATE": "Data2",
        "LIKEFORLIKEPERCENTAGE": "Data2",
        "LOOPBACK_CAPABLE_FLAG": "Data2",
      }
    ]
    this.processGrid(this.operationTrans);
    this.grid = new Grid();
    this.grid.PaginationId = "operationTrans";
    this.grid.DeleteVisible = true;
    this.grid.EditVisible = true;
    this.operationTrans = this.appService.onGenerateJson(this.operationTrans, this.grid);
  }


  constructor(private masterPageService: MasterPageService, private appService: AppService) { }

  ngOnInit() {
    this.masterPageService.setTitle("Master Setup");
    this.masterPageService.setModule(null);
    this.config();
  }

  search() {
    // this.config();
  }

  processGrid(dataGrid) {
    if (!checkNullorUndefined(dataGrid)) {
      this.operationTrans = [];
      dataGrid.forEach(res => {
        this.elementtest = res;
        this.operationTrans.push(this.elementtest);
      });
    }
  }

  getEditrow(event) {
    this.rowcolumns = event.rowcolumns;
    this.rowtoedit = event.rowtoedit;
    this.hideorshow = false;
    this.showadd = false;
  }

  onGoback() {
    this.hideorshow = true;
    this.showadd = false;
    this.hidegrid = true;
  }

  addNew() {
    this.rowcolumns = this.rmgrid.columns;
    this.showadd = true;
    this.hideorshow = true;
    this.hidegrid = false;
  }

  ngOnDestroy(){
    this.masterPageService.moduleName.next(null);
    this.masterPageService.hideModal();
  }
}

