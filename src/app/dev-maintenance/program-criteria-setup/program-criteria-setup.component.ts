import { Component, OnDestroy, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core'
import { String } from 'typescript-string-operations'
import { NgxSpinnerService } from 'ngx-spinner'
import { Subscription } from 'rxjs'
import { StorageData } from '../../enums/storage.enum'
import { ClientData } from '../../models/common/ClientData'
import { UiData } from '../../models/common/UiData'
import { CommonService } from '../../services/common.service'
import { ApiConfigService } from '../../utilities/rlcutl/api-config.service'
import { AppErrorService } from '../../utilities/rlcutl/app-error.service'
import { AppService } from '../../utilities/rlcutl/app.service'
import { MasterPageService } from '../../utilities/rlcutl/master-page.service'
import { RxAttributeMasterData, RxData, RxNameGroupData, RxProgramRuleData } from '../../models/maintenance/program-criteria-setup/ProgramCriteriaClasses'
import { Grid } from '../../models/common/Grid'
import { DeleteConfirmationDialogComponent } from '../../framework/frmctl/delete-confirmation-dialog/delete-confirmation-dialog.component'
import { ProgramCriteriaDialogComponent } from './program-criteria-dialog/program-criteria-dialog.component'
import { dropdown } from '../../models/common/Dropdown'
import { CommonEnum } from '../../enums/common.enum'
import { MatDialog, MatDialogRef } from '@angular/material/dialog'

@Component({
  selector: 'app-program-criteria-setup',
  templateUrl: './program-criteria-setup.component.html',
  styleUrls: ['./program-criteria-setup.component.css']
})
export class ProgramCriteriaSetupComponent implements OnInit, OnDestroy {
  emitHideSpinner: Subscription
  operationObj: any
  storageData = StorageData
  clientData = new ClientData()
  uiData = new UiData()
  appConfig: any
  textboxPattern: any;

  private api1Loaded: boolean = false
  private api2Loaded: boolean = false
  private api4Loaded: boolean = false
  private api5Loaded: boolean = false
  private api6Loaded: boolean = false
  private api7Loaded: boolean = false

  private largeModalSize: boolean = true


  rxData = new RxData()

  gridProgramRule: Grid
  gridProgramName_All: Grid
  gridProgramGroup_All: Grid

  rmGrid_ProgramRuleData: any
  rmGrid_ProgramNameData: any
  rmGrid_ProgramGroupData: any

  DialogData: RxNameGroupData
  modalRef: any

  constructor(public appErrService: AppErrorService,
    public masterPageService: MasterPageService,
    public appService: AppService,
    private spinner: NgxSpinnerService,
    private apiConfigService: ApiConfigService,
    public commonService: CommonService,
    public dialog: MatDialog,
  ) {
  }

  ngOnInit(): void {
    const pattern = JSON.parse(localStorage.getItem(StorageData.patternList));
    if (!this.appService.checkNullOrUndefined(pattern)) {
      this.textboxPattern = new RegExp(pattern.textboxPattern);
    }

    this.appConfig = JSON.parse(localStorage.getItem(StorageData.appConfig))

    this.gridProgramRule = new Grid()
    this.gridProgramRule.EditVisible = true
    //this.gridProgramRule.DeleteVisible = true
    this.gridProgramRule.PaginationId = "programRuleList"

    this.gridProgramName_All = new Grid()
    this.gridProgramName_All.EditVisible = true
    //this.gridProgramName.DeleteVisible = true
    this.gridProgramName_All.PaginationId = "programNameList"

    this.gridProgramGroup_All = new Grid()
    this.gridProgramGroup_All.EditVisible = true
    //this.gridProgramGroup.DeleteVisible = true
    this.gridProgramGroup_All.PaginationId = "programGroupList"

    this.operationObj = this.masterPageService.getRouteOperation()
    if (this.operationObj) {
      // Load proper error service messages
      localStorage.setItem(this.storageData.module, this.operationObj.Module)
      this.appErrService.appMessage()

      // set uiData appropriately
      this.uiData.OperationId = this.operationObj.OperationId
      this.uiData.OperCategory = this.operationObj.Category

      // capture local instance of clientData
      this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData))

      //setting value to hidespinner (based on this value we are emiting emithidespinner method)
      this.masterPageService.hideSpinner = true
      this.masterPageService.setTitle(this.operationObj.Title)
      this.masterPageService.setModule(this.operationObj.Module)

      this.emitHideSpinner = this.masterPageService.emitHideSpinner.subscribe(spinnerFlag => {
        if (!this.appService.checkNullOrUndefined(spinnerFlag) && spinnerFlag) {
          //use use your method here and hide spinner after getting response
          this.loadData()
        }
      })
    }
  }

  ngOnDestroy() {
    this.masterPageService.hideSpinner = false
    this.masterPageService.moduleName.next(null)
    this.emitHideSpinner.unsubscribe()
    this.masterPageService.emitHideSpinner.next(null)
    this.masterPageService.clearModule()
    this.appErrService.clearAlert()
    this.masterPageService.hideModal()
  }

  allApiLoaded(): boolean {
    return this.api1Loaded && this.api2Loaded && this.api4Loaded && this.api5Loaded && this.api6Loaded && this.api7Loaded
  }

  loadData() {
    this.spinner.show()
    this.rxData.attributeMasterList = []
    this.rxData.rankList = []
    this.rxData.operationList = []
    this.rxData.programRuleList = []
    this.rxData.programNameList = []
    this.rxData.programGroupList = []

    this.rxData.programNameList_All = []
    this.rxData.programGroupList_All = []

    const requestObj = { ClientData: this.clientData, UIData: this.uiData }
    let url = String.Join('/', this.apiConfigService.getAttributeMasterList_Filtered)
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.api1Loaded = true
      if (this.allApiLoaded()) {
        this.spinner.hide()
      }

      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response) && res.Response.AttributeMasterList_Filtered && res.Response.AttributeMasterList_Filtered.length) {

          res.Response.AttributeMasterList_Filtered.forEach(element => {
            const item = new RxAttributeMasterData()
            item.ATTRIBUTEID = element.ATTRIBUTEID
            item.ATTR_OBJECT = element.ATTR_OBJECT
            item.ATTR_PROPERTY = element.ATTR_PROPERTY
            item.ATTR_TYPE = element.ATTR_TYPE
            item.Id = item.ATTRIBUTEID
            item.Text = item.ATTR_PROPERTY
            this.rxData.attributeMasterList.push(item)
          })
        }
      }
    })

    url = String.Join('/', this.apiConfigService.getRankList, "rxProgramAttribute")
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.api2Loaded = true
      if (this.allApiLoaded()) {
        this.spinner.hide()
      }

      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response) && res.Response.Ranks && res.Response.Ranks.length) {
          res.Response.Ranks.forEach(element => {
            const dd = new dropdown()
            dd.Id = element
            dd.Text = element
            this.rxData.rankList.push(dd)
          })
        }
      }
    })

    url = String.Join('/', this.apiConfigService.getOperationList)
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.api4Loaded = true
      if (this.allApiLoaded()) {
        this.spinner.hide()
      }
      this.rxData.operationList = []
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response) && res.Response.OperationCodesList && res.Response.OperationCodesList.length) {
          // this.rxData.operationList = res.Response.OperationCodesList
          res.Response.OperationCodesList.forEach(element => {
            const dd = new dropdown()
            dd.Id = element.Id
            dd.Text = dd.Id + ' - ' + element.Text
            this.rxData.operationList.push(dd)
          })
          this.rxData.operationList = this.rxData.operationList.sort((a, b) => a.Text.localeCompare(b.Text))
        }
      }
    })

    url = String.Join('/', this.apiConfigService.getProgramRuleList)
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.api5Loaded = true
      if (this.allApiLoaded()) {
        this.spinner.hide()
      }

      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response) && res.Response.ProgramRuleList && res.Response.ProgramRuleList.length) {
          res.Response.ProgramRuleList.forEach(x => {
            this.rxData.programRuleList.push(Object.assign(new RxProgramRuleData(), x))
          })

          this.rmGrid_ProgramRuleData = this.appService.onGenerateJson(this.rxData.programRuleList, this.gridProgramRule)
        }
      }
    })

    url = String.Join('/', this.apiConfigService.getProgramNameList)
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.api6Loaded = true
      if (this.allApiLoaded()) {
        this.spinner.hide()
      }

      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response) && res.Response.ProgramNameList && res.Response.ProgramNameList.length) {
          //this.rxData.programNameList = res.Response.ProgramNameList // Id, Text, Active
          res.Response.ProgramNameList.forEach(element => {
            const dd = Object.assign(new RxNameGroupData(), element)
            dd.IsGroup = false

            this.rxData.programNameList_All.push(dd) // This is for Program Name grid
            if (dd.Active === 'Y') {
              this.rxData.programNameList.push(dd) // Tis is for Program Rule Add/Edit
            }
          })

          this.rmGrid_ProgramNameData = this.appService.onGenerateJson(this.rxData.programNameList_All, this.gridProgramName_All)
        }
      }
    })

    url = String.Join('/', this.apiConfigService.getProgramGroupList)
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.api7Loaded = true
      if (this.allApiLoaded()) {
        this.spinner.hide()
      }

      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response) && res.Response.ProgramGroupList && res.Response.ProgramGroupList.length) {
          //this.rxData.programGroupList = res.Response.ProgramGroupList // Id, Text, Active
          res.Response.ProgramGroupList.forEach(element => {
            const dd = Object.assign(new RxNameGroupData(), element)
            dd.IsGroup = true

            this.rxData.programGroupList_All.push(dd) // This is for Program Name grid
            if (dd.Active === 'Y') {
              this.rxData.programGroupList.push(dd) // Tis is for Program Rule Add/Edit
            }
          })

          this.rmGrid_ProgramGroupData = this.appService.onGenerateJson(this.rxData.programGroupList_All, this.gridProgramGroup_All)
        }
      }
    })
  }

  // This functionality has been disabled at the RMGRID config
  deleteProgramRuleDetails(data) {
    this.appErrService.clearAlert()
    this.masterPageService.openModelPopup(DeleteConfirmationDialogComponent);
    this.masterPageService.dialogRef.componentInstance.emitConfirmation.subscribe(($e) => {
      const index = this.rxData.programRuleList.findIndex(a => a.ProgramRuleId === data.ProgramRuleId)
      this.rxData.programRuleList.splice(index, 1)
      this.rmGrid_ProgramRuleData = this.appService.onGenerateJson(this.rxData.programRuleList, this.gridProgramRule)
      this.masterPageService.hideDialog();
    });
  }

  onNewProgramRuleClick() {
    this.spinner.show()

    const data = new RxProgramRuleData()
    data.ProgramRuleId = -1
    data.Active = 'Y'
    data.Assign_Values = ''
    data.Description = ''
    data.OperationId = ''
    data.ProgramId = -1
    data.Program_Name = ''
    const hold = this.rxData.programGroupList.find((x) => x.Text === "CORE")
    if (hold) {
      data.Program_Group = hold.Text
      data.ProgramRuleGroupId = hold.Id
    }
    data.Rank = null
    data.ProgramRule = ''

    this.addEditProgramRuleDetails(data)

  }

  addEditProgramRuleDetails(data: RxProgramRuleData) {
    this.rxData.addEditRule = Object.assign({}, data)

    const dialogRef = this.masterPageService.openModelPopup(ProgramCriteriaDialogComponent, this.largeModalSize, 'dialog-width-xl', {
      data: {
        "rxData": this.rxData,
        "clientData": this.clientData,
        "uiData": this.uiData
      }
    })
    this.masterPageService.dialogRef.componentInstance.emitConfirmation.subscribe((value) => {
      dialogRef.close();
      if (value) {
        if (value.ProgramRule.ProgramRuleId === -1) { // inserted new Rule
          value.ProgramRule.ProgramRuleId = value.ProgramRuleId;
          this.rxData.programRuleList.push(value.ProgramRule)
        }
        else { // edited existing Rule
          const index = this.rxData.programRuleList.findIndex(a => a.ProgramRuleId === value.ProgramRule.ProgramRuleId)
          this.rxData.programRuleList[index] = value.ProgramRule
        }

        // Refresh the grid data with the changes
        this.rmGrid_ProgramRuleData = this.appService.onGenerateJson(this.rxData.programRuleList, this.gridProgramRule)
      }

      // reset the AddEditRule
      this.rxData.addEditRule = new RxProgramRuleData()
    });
  }

  onTabChange() {
    this.appErrService.clearAlert()
  }

  //#region Name/Group dialog

  onNewProgramNameClick(addEditDialog) {
    const data = new RxNameGroupData()
    data.IsGroup = false
    data.Id = -1
    data.Active = 'Y'
    data.Text = ''

    this.addEditNameGroupDetails(data, addEditDialog)
  }

  onNewProgramGroupClick(addEditDialog) {
    const data = new RxNameGroupData()
    data.IsGroup = true
    data.Id = -1
    data.Active = 'Y'
    data.Text = ''

    this.addEditNameGroupDetails(data, addEditDialog)
  }

  addEditNameGroupDetails(data: RxNameGroupData, addEditDialog) {
    this.DialogData = Object.assign(new RxNameGroupData(), data) // shallow copy
    this.modalRef = this.dialog.open(addEditDialog, { hasBackdrop: true, disableClose: true, panelClass: 'dialog-width-sm' })
  }

  saveNameGroup() {
    this.modalRef.close()
    this.spinner.show()
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, RxNameGroupData: this.DialogData }
    let url = String.Join('/', this.apiConfigService.saveProgramNameOrGroup)
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide()

      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response) && res.Response.Id) {

          // Is this a Group Name
          if (this.DialogData.IsGroup === true) {

            // Inserted?
            if (this.DialogData.Id === -1) {
              this.DialogData.Id = res.Response.Id
              this.rxData.programGroupList_All.push(this.DialogData)
              this.rxData.programGroupList.push(this.DialogData)
            }
            // Edited
            else {
              //let x = this.rxData.programGroupList.find(z => z.Id.toString() === res.Response.Id.toString())
              let index = this.rxData.programGroupList_All.findIndex(a => a.Id === this.DialogData.Id)
              if (index >= 0) {

                this.rxData.programGroupList_All[index] = this.DialogData
              }
              index = this.rxData.programGroupList.findIndex(a => a.Id === this.DialogData.Id)
              if (index >= 0) {
                this.rxData.programGroupList[index] = this.DialogData;

                // Update each Program Rule Group Name with edited value.
                this.rxData.programRuleList.forEach(element => {
                  if (element.ProgramRuleGroupId == this.DialogData.Id) {
                    element.Program_Group = this.DialogData.Text
                  }
                })

                // Update the program rule grid
                this.rmGrid_ProgramRuleData = this.appService.onGenerateJson(this.rxData.programRuleList, this.gridProgramRule)
              }
            }
            this.rxData.programGroupList = this.rxData.programGroupList.sort((a, b) => a.Text.localeCompare(b.Text))
            this.rxData.programGroupList_All = this.rxData.programGroupList_All.sort((a, b) => a.Text.localeCompare(b.Text))

            // Refresh the program group grid
            this.rmGrid_ProgramGroupData = this.appService.onGenerateJson(this.rxData.programGroupList, this.gridProgramGroup_All)

          }
          // This is Program Name
          else {

            // Inserted?
            if (this.DialogData.Id === -1) {
              this.DialogData.Id = res.Response.Id
              this.rxData.programNameList.push(this.DialogData)
              this.rxData.programNameList_All.push(this.DialogData)
            }
            // Edited
            else {
              let index = this.rxData.programNameList_All.findIndex(a => a.Id === this.DialogData.Id)
              if (index >= 0) {

                this.rxData.programNameList_All[index] = this.DialogData
              }
              index = this.rxData.programNameList_All.findIndex(a => a.Id === this.DialogData.Id)
              if (index >= 0) {
                this.rxData.programNameList[index] = this.DialogData;

                // Update each Program Rule Group Name with edited value.
                this.rxData.programRuleList.forEach(element => {
                  if (element.ProgramId == this.DialogData.Id) {
                    element.Program_Name = this.DialogData.Text
                  }
                })

                // Update the program rule grid
                this.rmGrid_ProgramRuleData = this.appService.onGenerateJson(this.rxData.programRuleList, this.gridProgramRule)
              }

              this.rxData.programNameList = this.rxData.programNameList.sort((a, b) => a.Text.localeCompare(b.Text))
              this.rxData.programNameList_All = this.rxData.programNameList_All.sort((a, b) => a.Text.localeCompare(b.Text))

              // refresh the program name grid
              this.rmGrid_ProgramNameData = this.appService.onGenerateJson(this.rxData.programNameList, this.gridProgramName_All)
            }

          }
          return
        }
      }
    })

  }

  changedName() {
    this.appErrService.clearAlert()
  }

  onToggleChange(val) {
    this.appErrService.clearAlert()
    this.DialogData.Active = val ? CommonEnum.yes : CommonEnum.no
  }

  //#endregion
}
