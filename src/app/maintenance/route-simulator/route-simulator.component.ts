import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { String } from 'typescript-string-operations';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { StorageData } from '../../enums/storage.enum';
import { ClientData } from '../../models/common/ClientData';
import { UiData } from '../../models/common/UiData';
import { CommonService } from '../../services/common.service';
import { ApiConfigService } from '../../utilities/rlcutl/api-config.service';
import { AppErrorService } from '../../utilities/rlcutl/app-error.service';
import { AppService } from '../../utilities/rlcutl/app.service';
import { MasterPageService } from '../../utilities/rlcutl/master-page.service';
import { CommonEnum } from '../../enums/common.enum';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { deepMerge } from './deep-Merge';
import { dropdown } from '../../models/common/Dropdown';

@Component({
  selector: 'app-route-simulator',
  templateUrl: './route-simulator.component.html',
  styleUrls: ['./route-simulator.component.css']
})
export class RouteSimulatorComponent implements OnInit, OnDestroy {

  constructor(public appErrService: AppErrorService,
    public masterPageService: MasterPageService,
    public appService: AppService,
    private spinner: NgxSpinnerService,
    private apiConfigService: ApiConfigService,
    public commonService: CommonService,
    private snackbar: XpoSnackBar
  ) {
  }

  emitHideSpinner: Subscription;
  operationObj: any;
  storageData = StorageData;
  clientData = new ClientData();
  uiData = new UiData();

  eligableOperations: dropdown[] = [];
  rxRouteList: dropdown[] = [];

  formulaArray: string[] = []

  attributeList: any[] = [];
  selectedAttribute: any;
  valueList: dropdown[] = [];
  selectedValue: string;
  selectedControlType: string = CommonEnum.controlType;
  editingIndex: number = -1;

  //#region The Squares

  @ViewChild("routeFlow", { read: ElementRef }) public routeFlow: ElementRef<any>;
  rxRoute: any = [];
  operationCodes: any[] = [];
  rxRule: string = '';

  //#endregion

  cacheControlNValue: any[] = [];
  currentStep: string = '2100';
  currentStepText: string = "Current-Step"
  private currentStepAttributeId: number = -888;
  private currentRouteText: string = "Current-Route"
  private currentRouteAttributeId: number = -999;

  ngOnInit(): void {
    this.operationObj = this.masterPageService.getRouteOperation();
    if (this.operationObj) {
      // Load proper error service messages
      localStorage.setItem(this.storageData.module, this.operationObj.Module);
      this.appErrService.appMessage();

      // set uiData appropriately
      this.uiData.OperationId = this.operationObj.OperationId;
      this.uiData.OperCategory = this.operationObj.Category;

      // capture local instance of clientData
      this.clientData = JSON.parse(localStorage.getItem(StorageData.clientData));

      //setting value to hidespinner (based on this value we are emiting emithidespinner method)
      this.masterPageService.hideSpinner = true;
      this.masterPageService.setTitle(this.operationObj.Title);
      this.masterPageService.setModule(this.operationObj.Module);

      this.emitHideSpinner = this.masterPageService.emitHideSpinner.subscribe(spinnerFlag => {
        if (!this.appService.checkNullOrUndefined(spinnerFlag) && spinnerFlag) {
          //use use your method here and hide spinner after getting response
          this.onResetSimulator();
        }
      });
    }
  }

  onResetSimulator() {
    this.formulaArray = [];
    this.operationCodes = [];
    this.rxRoute = null;

    this.selectedValue = null;
    this.selectedAttribute = null;
    this.selectedControlType = "DROPDOWN";

    this.getDefaultStep()
  }

  getRxRouteList() {
    this.spinner.show()
    this.rxRouteList = [];

    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getResultRoutes_Filtered, this.currentStep); 
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();

      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response) &&
          (!this.appService.checkNullOrUndefined(res.Response.RouteList))) {

          res.Response.RouteList.forEach(item => {
            const dd = new dropdown();
            dd.Id = item.Id;
            dd.Text = item.Text;
            this.rxRouteList.push(dd);
          });

          this.rxRouteList.sort((a, b) => (a.Text || b.Text) ? (!a.Text ? -1 : !b.Text ? 1 : a.Text.localeCompare(b.Text)) : 0); // Handles undefined better
        }
      }
    });
  }

  getDefaultStep() {
    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    let url = String.Join('/', this.apiConfigService.get_DefaultStep);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response) && res.Response.DefaultStep) {

          this.currentStep = res.Response.DefaultStep
          
          this.getEligibleOperationsList();
        }
      }
    });
  }

  getEligibleOperationsList() {
    this.eligableOperations = [];

    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    let url = String.Join('/', this.apiConfigService.getRouteEligibleOpearationsList);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response) && res.Response.OperationCodesList && res.Response.OperationCodesList.length) {

          res.Response.OperationCodesList.forEach(element => {
            const dd = new dropdown();
            dd.Id = element.ID;
            dd.Text = `${element.ID} - ${element.TEXT}`;
            this.eligableOperations.push(dd);
          });

          this.eligableOperations.sort((a, b) => (a.Text || b.Text) ? (!a.Text ? -1 : !b.Text ? 1 : a.Text.localeCompare(b.Text)) : 0); // Handles undefined better

          this.getAttributeNameList();
        }
      }
    });
  }

  getAttributeNameList() {
    this.attributeList = [];

    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    const url = String.Join('/', this.apiConfigService.getAttributeMasterList_Filtered);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();

      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response) &&
          !this.appService.checkNullOrUndefined(res.Response.AttributeMasterList_Filtered) &&
          res.Response.AttributeMasterList_Filtered.length > 0) {

          const hold = [];

          hold.push({
            ID: this.currentRouteAttributeId,
            TEXT: this.currentRouteText,
            TYPE: "DROPDOWN"
          });

          hold.push({
            ID: this.currentStepAttributeId,
            TEXT: this.currentStepText,
            TYPE: "DROPDOWN"
          });

          res.Response.AttributeMasterList_Filtered.forEach(element => {
            const item = {
              ID: element.ATTRIBUTEID.trim(),
              TEXT: element.ATTR_PROPERTY.trim(),
              TYPE: element.ATTR_TYPE.trim()
            }
            hold.push(item);
          });

          this.attributeList = hold;

          // Auto Create: Current-Step = "2100" criteria.
          const formula = `${this.currentStepText} = "${this.currentStep}"`;
          this.formulaArray.push(formula)

          this.getRxRouteList()

          // Generate Route
          this.getRouteFromAPI()
        }
      }
    });
  }

  getAttributeControlNValue() {
    this.valueList = [];
    this.appErrService.clearAlert();

    // Special case. if selectedAttribute.ID === currentStepAttributeId (A specially added Attribute)
    // We need to set this.ValueList to the eligableOperations.
    if (this.selectedAttribute.ID === this.currentStepAttributeId) {
      this.valueList = this.eligableOperations;
      this.selectedControlType = 'DROPDOWN';
      this.spinner.hide();
      return;
    }

    // Special case. if selectedAttribute.ID === currentRouteAttributeId (A specially added Attribute)
    // We need to set this.ValueList to the eligibleRoutes.
    if (this.selectedAttribute.ID === this.currentRouteAttributeId) {
      this.valueList = this.rxRouteList;
      this.selectedControlType = 'DROPDOWN';
      this.spinner.hide();
      return;
    }

    // If we have cached this valueList previously, re-load it, otherwise, perform the API call.
    const cache = this.cacheControlNValue.find(x => x.key == this.selectedAttribute.ID);
    if (cache) {
      this.valueList = cache.data;
      this.selectedControlType = cache.type;
      this.spinner.hide();
      return;
    }

    const attribute = { [CommonEnum.attributeID]: this.selectedAttribute.ID };
    const requestObj = { ClientData: this.clientData, UIData: this.uiData, RX_ATTRIBUTE_MASTER: attribute };
    const url = String.Join('/', this.apiConfigService.getAttributeControlNValue);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response)) {
          if (!this.appService.checkNullOrUndefined(res.Response.Value) && res.Response.Value.length > 0) {
            this.valueList = res.Response.Value;
          }
          if (!this.appService.checkNullOrUndefined(res.Response.ControlType)) {
            this.selectedControlType = res.Response.ControlType;
          }

          // Cache the ValueList
          if (this.selectedControlType === 'DROPDOWN' && this.valueList && this.valueList.length > 0) {
            this.cacheControlNValue.push({
              key: this.selectedAttribute.ID,
              type: this.selectedControlType,
              data: this.valueList
            })
          } else if (this.selectedControlType === 'TEXTBOX') {
            this.cacheControlNValue.push({
              key: this.selectedAttribute.ID,
              type: this.selectedControlType,
              data: null
            })
          }
        }
      }
    });

  }

  onAttributeChange() {
    this.selectedValue = null;
    this.getAttributeControlNValue()
  }

  onApplyFormula() {

    if (!this.selectedAttribute) return;
    if (!this.selectedValue) return;

    const found = this.formulaArray.findIndex(x => x.startsWith(this.selectedAttribute.TEXT));
    if (found > -1 && found != this.editingIndex) {
      this.snackbar.error("Duplicate Attributes not allowed.")
      return;
    }

    const formula = `${this.selectedAttribute.TEXT} = "${this.selectedValue}"`;
    if (this.editingIndex === -1) {
      this.formulaArray.push(formula);
    } else {
      this.formulaArray[this.editingIndex] = formula;
    }

    this.formulaArray.sort((a, b) => (a || b) ? (!a ? -1 : !b ? 1 : a.localeCompare(b)) : 0); // Handles undefined better

    // Did the currentStep change? save the selected step.
    if (this.selectedAttribute.TEXT === this.currentStepText) {
      if (this.currentStep !== this.selectedValue) {
        this.currentStep = this.selectedValue;
      
        // If currentRoute is in formula, remove it, since it is based on Step, which just changed
        const idx = this.formulaArray.findIndex(x => x.startsWith(this.currentRouteText));
        if (idx > -1 ) {
          this.formulaArray.splice(idx, 1)
        }

        // Refresh the Route list
        this.getRxRouteList()
      }
    }

    this.getRouteFromAPI();

    this.selectedValue = null;
    this.selectedAttribute = null;

    // reset the editingIndex
    this.editingIndex = -1;
  }

  onRemoveFormula(idx: number) {
    if (this.formulaArray[idx].startsWith(this.currentStepText) && idx != this.editingIndex) {
      this.snackbar.error("Current-Step is required. Cannot remove.")
      return;
    }

    this.formulaArray.splice(idx, 1);
    this.editingIndex = -1;

    this.getRouteFromAPI();
  }

  onEditFormula(idx: number) {

    if (this.editingIndex === idx) {
      this.editingIndex = -1;

      this.selectedValue = null;
      this.selectedAttribute = null;
      this.selectedControlType = "DROPDOWN";
      return;
    }
    const formula = this.formulaArray[idx];

    // Split data on ' = ' (Case insensitive)
    const reg = new RegExp(' = ', 'i');
    const splitData = formula.split(reg).filter(Boolean);
    this.selectedAttribute = this.attributeList.find(x => x.TEXT.localeCompare(splitData[0]) === 0)
    if (!this.selectedAttribute) {
      this.snackbar.warn("Cannot Edit. Attribute not found.")
    }
    this.onAttributeChange();

    if (this.selectedAttribute) {
      this.selectedValue = splitData[1].substring(1, splitData[1].length - 1)
    }

    this.editingIndex = idx;
  }

  onSaveChanges() {
    throw new Error('onSaveChanges not implemented.');
  }

  scrollRight(): void {
    if (!this.appService.checkNullOrUndefined(this.routeFlow.nativeElement) && this.routeFlow.nativeElement) {
      this.routeFlow.nativeElement.scrollTo({ left: (this.routeFlow.nativeElement.scrollLeft + 150), behavior: 'smooth' });
    }
  }

  scrollLeft(): void {
    if (!this.appService.checkNullOrUndefined(this.routeFlow.nativeElement) && this.routeFlow.nativeElement) {
      this.routeFlow.nativeElement.scrollTo({ left: (this.routeFlow.nativeElement.scrollLeft - 150), behavior: 'smooth' });
    }
  }

  //#region Convert Formula to Objects

  private jsonStr: string = "";

  private formulaToJsonString(formula: string): string {
    const firstDotIdx = formula.indexOf(".");
    if (firstDotIdx < 0) {
      // No more dots found, this is probably the property = value part
      const parts = formula.split(" = ")
      const left = parts[0].replace(/"/g, '\\"') // escapes the dbl quotes
      const right = parts[1]
      return `"${left}": ${right}`;
    }

    const obj = formula.substring(0, firstDotIdx);
    const fmla = formula.substring(firstDotIdx + 1);
    const output = `"${obj}": {${this.formulaToJsonString(fmla)}}`;

    return output;
  }

  private getFormulaAsJsonString(formulas: string[]) {
    this.jsonStr = "";
    for (let i = 0; i <= formulas.length - 1; i++) {
      if (this.jsonStr !== "") {
        this.jsonStr += ",\n";
      }

      this.jsonStr += "{" + this.formulaToJsonString(formulas[i]) + "}";
    }
    this.jsonStr = `[\n${this.jsonStr}\n]`;
  }

  mergeJsonStringAsObjects(obj) {
    const list = JSON.parse(this.jsonStr)
    for (let i = 0; i < list.length; i++) {
      deepMerge(obj, list[i])
    }
  }

  //#endregion

  getRouteFromAPI() {
    // Clone the formulaArray
    let localArray = Array.from(this.formulaArray);

    // Default to 2100
    let operationId = '2100';
    // If found, split the formula to get the value
    // then remove the formula from the array.
    const currentStepIdx = localArray.findIndex(x => x.startsWith(this.currentStepText));
    if (currentStepIdx >= 0) {
      operationId = localArray[currentStepIdx].split(" = ")[1];
      operationId = operationId.substring(1, operationId.length - 1);
      localArray.splice(currentStepIdx, 1);
    }
    let routeId = "";
    // If found, split the formula to get the value
    // then remove the formula from the array.
    const currentRouteIdx = localArray.findIndex(x => x.startsWith(this.currentRouteText));
    if (currentRouteIdx >= 0) {
      routeId = localArray[currentRouteIdx].split(" = ")[1];
      routeId = routeId.substring(1, routeId.length - 1);
      localArray.splice(currentRouteIdx, 1);
    }

    const requestObj = { ClientData: this.clientData, UIData: this.uiData };
    // If we have valid formulas, Length  would be > 0.  Merge them with requestObj.
    if (localArray.length > 0) {
      this.getFormulaAsJsonString(localArray)
      this.mergeJsonStringAsObjects(requestObj)
    } else { // No formulas were in the localArray. 
      // Get a distinct list of the attributeList substring to the first period.
      // These are the available objects. 
      const objs = this.attributeList
        .map(x => x.TEXT.substring(0, x.TEXT.indexOf('.')))
        .filter(Boolean) // filter(boolean) removes blank ('') entries
        .filter((attr, i, arr) => arr.findIndex(t => t === attr) === i) // distinct list

      // Add these as empty objects to requestObj so we have objects to work with in the API
      objs.forEach(obj => {
        requestObj[obj] = {};
      });
    }



    let url = String.Join('/', this.apiConfigService.routeSimulator_GetRoute, operationId, routeId);
    this.commonService.commonApiCall(url, requestObj, (res, statusFlag) => {
      this.spinner.hide();

      this.rxRoute = null;
      this.operationCodes = [];
      this.rxRule = '';
      if (statusFlag) {
        if (!this.appService.checkNullOrUndefined(res.Response) && res.Response.RxRoute) {
          this.rxRoute = res.Response.RxRoute;
          this.operationCodes = res.Response.OperationCodes;
          this.rxRule = res.Response.RxRule;
        }
      }
    });
  }

  ngOnDestroy() {
    this.masterPageService.defaultProperties();
    this.emitHideSpinner.unsubscribe();
  }
  
}
