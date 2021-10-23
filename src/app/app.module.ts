import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { routing } from './app.routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';

import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { LoginComponent } from './login-layout/login/login.component';
import { ForgotPasswordComponent } from './login-layout/forgot-password/forgot-password.component';
import { LoginLayoutComponent } from './login-layout/login-layout.component';
import { UserIdleModule } from 'angular-user-idle';
//Framework components
import { RmaccordianComponent } from './framework/frmctl/rmaccordian/rmaccordian.component';
import { RmalertComponent } from './framework/frmctl/rmalert/rmalert.component';
import { RmbadgeComponent } from './framework/frmctl/rmbadge/rmbadge.component';
import { RmbuttonComponent } from './framework/frmctl/rmbutton/rmbutton.component';
import { RmcardComponent } from './framework/frmctl/rmcard/rmcard.component';
import { RmcarouselComponent } from './framework/frmctl/rmcarousel/rmcarousel.component';
import { RmcheckboxComponent } from './framework/frmctl/rmcheckbox/rmcheckbox.component';
import { RmcollapseComponent } from './framework/frmctl/rmcollapse/rmcollapse.component';
import { RmdatepickerComponent } from './framework/frmctl/rmdatepicker/rmdatepicker.component';
import { RmdropdownComponent } from './framework/frmctl/rmdropdown/rmdropdown.component';
import { RmmulticoldropdownComponent } from './framework/frmctl/rmmulticoldropdown/rmmulticoldropdown.component';
import { RmfilebrowserComponent } from './framework/frmctl/rmfilebrowser/rmfilebrowser.component';
import { RmlabelComponent } from './framework/frmctl/rmlabel/rmlabel.component';
import { RmlistboxComponent } from './framework/frmctl/rmlistbox/rmlistbox.component';
import { RmlistgroupComponent } from './framework/frmctl/rmlistgroup/rmlistgroup.component';
import { RmmodalComponent } from './framework/frmctl/rmmodal/rmmodal.component';
import { RmmultiselectComponent } from './framework/frmctl/rmmultiselect/rmmultiselect.component';
import { RmnavbarComponent } from './framework/frmctl/rmnavbar/rmnavbar.component';
import { RmnavtabsComponent } from './framework/frmctl/rmnavtabs/rmnavtabs.component';
import { RmpasswordComponent } from './framework/frmctl/rmpassword/rmpassword.component';
import { RmpopoversComponent } from './framework/frmctl/rmpopovers/rmpopovers.component';
import { RmprogressComponent } from './framework/frmctl/rmprogress/rmprogress.component';
import { RmradiobuttonComponent } from './framework/frmctl/rmradiobutton/rmradiobutton.component';
import { RmscrollspyComponent } from './framework/frmctl/rmscrollspy/rmscrollspy.component';
import { RmtextareaComponent } from './framework/frmctl/rmtextarea/rmtextarea.component';
import { RmtextboxComponent } from './framework/frmctl/rmtextbox/rmtextbox.component';
import { RmtoggleComponent } from './framework/frmctl/rmtoggle/rmtoggle.component';
import { RmtooltipComponent } from './framework/frmctl/rmtooltip/rmtooltip.component';
import { RmnavigationmenuComponent } from './framework/frmctl/rmnavigationmenu/rmnavigationmenu.component';
import { RmgridComponent } from './framework/frmctl/rmgrid/rmgrid.component';
import { RmmobilebadgeComponent } from './framework/frmctl/rmmobilebadge/rmmobilebadge.component';
import { RmautoExtenderComponent } from './framework/frmctl/rmauto-extender/rmauto-extender.component';
import { RmcontrolDisplayComponent } from './framework/frmctl/rmcontrol-display/rmcontrol-display.component';
import { RmlockComponent } from './framework/frmctl/rmlock/rmlock.component';

import { TraceHoldComponent } from './utility/trace-hold/trace-hold.component';
import { FindTraceHoldComponent } from './framework/busctl/find-trace-hold/find-trace-hold.component';
//Business components
import { ContainerSummaryComponent } from './framework/busctl/container-summary/container-summary.component';
import { ContainerCloseComponent } from './framework/busctl/container-close/container-close.component';
import { ContainerMoveComponent } from './framework/busctl/container-move/container-move.component';

//Date picker
import { BsDatepickerModule, TypeaheadModule, ModalModule, TooltipModule, BsDropdownModule, TabsModule } from 'ngx-bootstrap';

//Popover
import { PopoverModule } from 'ngx-bootstrap/popover';

//Data table
//import  {DataTableModule} from "angular2-datatable";

//Multiselect Dropdown
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

//services
import { ApiService } from './utilities/rlcutl/api.service';
import { ReceivingService } from './services/receiving.service';
import { MessagingService } from './utilities/rlcutl/messaging.service';
import { ApiConfigService } from './utilities/rlcutl/api-config.service';
import { AppErrorService } from './utilities/rlcutl/app-error.service';
import { DynamicPanelService } from './utilities/rlcutl/dynamic-panel.service';
import { MasterPageService } from './utilities/rlcutl/master-page.service';
import { SurveyService } from './services/survey.service';

//angular material
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTreeModule } from '@angular/material/tree';
import { DashboardComponent } from './dashboard/dashboard.component';

//responsive design
import { ResponsiveModule } from 'ngx-responsive';

// pipes
import { NgxPaginationModule } from 'ngx-pagination';
import { SearchFilterPipe } from './pipes/search-filter.pipe';
import { CustomOrderByPipe } from './pipes/custom-order-by.pipe';
import { Ng2SearchPipeModule } from 'ng2-search-filter';

//ngx toaster
import { ToastrModule } from 'ngx-toastr';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

//Application Modules
import { AppLayoutComponent } from './app-layout/app-layout.component';
import { MasterPageComponent } from './master-page/master-page.component';
import { ReceiveComponent } from './receiving/receive/receive.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { TestingComponent } from './testing/testing/testing.component';
import { DynamicPanelComponent } from './framework/busctl/dynamic-panel/dynamic-panel.component';
import { ContainerCloseUtilityComponent } from './utility/container-close-utility/container-close-utility.component';
import { ContainerMoveUtilityComponent } from './utility/container-move-utility/container-move-utility.component';

//directives
import { NumberOnlyDirective } from './directives/number.directive';
import { DragDropDirective } from './directives/drag-drop.directive';

//Spinner
import { NgxSpinnerModule } from 'ngx-spinner';
import { ContainerSuggestionComponent } from './framework/busctl/container-suggestion/container-suggestion.component';
import { FqaComponent } from './fqa/fqa.component';
import { RmtypeaheadComponent } from './framework/frmctl/rmtypeahead/rmtypeahead.component';
import { AppService } from './utilities/rlcutl/app.service';
import { SerialnumberMoveComponent } from './utility/serialnumber-move/serialnumber-move.component';
import { RmchildgridComponent } from './framework/frmctl/rmgrid/rmchildgrid/rmchildgrid.component';
import { RmgridmodalComponent } from './framework/frmctl/rmgrid/rmgridmodal/rmgridmodal.component';
import { RmgridService } from './framework/frmctl/rmgrid/rmgrid.service';
import { SerialNumberMoveComponent } from './framework/busctl/serial-number-move/serial-number-move.component';
import { BatchDetailComponent } from './fqa/batch-detail/batch-detail.component';
import { SerialnumberRecoverComponent } from './receiving/serialnumber-recover/serialnumber-recover.component';
import { SupervisorOverrideComponent } from './utility/supervisor-override/supervisor-override.component';
import { RollbackUtilityComponent } from './utility/rollback-utility/rollback-utility.component';
import { SerialnumberManagementComponent } from './utility/serialnumber-management/serialnumber-management.component';
import { ReceiveSearchComponent } from './receiving/receive-search/receive-search.component';
import { GradingComponent } from './grading/grading.component';
import { RepairComponent } from './repair/repair.component';
import { DockReceiveComponent } from './receiving/dock-receive/dock-receive.component';
import { NciComponent } from './receiving/nci/nci.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { ProfileGuard } from './profile.guard';
import { MasterSetupComponent } from './utility/master-setup/master-setup.component';
import { DatePipe } from '@angular/common';
import { TransactionService } from './services/transaction.service';
import { RequiredIfDirective } from './directives/required-if.directive';
import { RecordAuditComponent } from './utility/record-audit/record-audit.component';

//runtime configuration
import { APP_INITIALIZER } from '@angular/core';
import { RuntimeConfigService } from './utilities/rlcutl/runtime-config.service';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ReceiptSearchComponent } from './receiving/receipt-search/receipt-search.component';
import { PrewtComponent } from './prewt/prewt.component';
import { BatchReprocessComponent } from './fqa/batch-reprocess/batch-reprocess.component';
import { ReceiptInjectionComponent } from './utility/receipt-injection/receipt-injection.component';
import { ReprintLabelComponent } from './utility/reprint-label/reprint-label.component';
import { LoginService } from './services/login.service';
import { AuditComponent } from './maintenance/audit/audit.component';
import { TransactionConfigComponent } from './dev-maintenance/transaction-config/transaction-config.component';
import { SortGroupSetupComponent } from './maintenance/sort-group-setup/sort-group-setup.component';
import { CodeListSetupComponent } from './maintenance/code-list-setup/code-list-setup.component';
import { ReceiveMobileComponent } from './receiving/receive-mobile/receive-mobile.component';

// dm
import { WmxRmxComponent } from './device-management/wmx-rmx/wmx-rmx.component';
import { WmxSkuComponent } from './device-management/wmx-sku/wmx-sku.component';
import { ManageSnComponent } from './device-management/manage-sn/manage-sn.component';
import { AttributeUpdatesComponent } from './device-management/manage-sn/attribute-updates/attribute-updates.component';
import { EsnSwapComponent } from './device-management/manage-sn/esn-swap/esn-swap.component';
import { RouteCalculateComponent } from './device-management/manage-sn/route-calculate/route-calculate.component';
import { RollbackComponent } from './device-management/shared/rollback/rollback.component';
import { SkuTransferComponent } from './device-management/shared/sku-transfer/sku-transfer.component';


import { SupplementalSetupComponent } from './maintenance/supplemental-setup/supplemental-setup.component';
import { SupplementalTransactionComponent } from './utility/supplemental-transaction/supplemental-transaction.component';
import { GenericReleaseComponent } from './utility/generic-release/generic-release.component';

//tracking numbermove
import { TrackingnumberMoveComponent } from './utility/trackingnumber-move/trackingnumber-move.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './token-interceptor';
import { CommonService } from './services/common.service';
import { TreeViewComponent } from './framework/frmctl/tree-view/tree-view.component';
import { LocationSetupComponent } from './maintenance/location-setup/location-setup.component';
import { ContainerInformationComponent } from './utility/container-information/container-information.component';
import { RmtimmeroutComponent } from './framework/frmctl/rmtimmerout/rmtimmerout.component';
import { InventoryMoveComponent } from './framework/busctl/container-move/inventory-move/inventory-move.component';
import { SamplingBatchDetailsComponent } from './testing/sampling-batch-details/sampling-batch-details.component';
import { ContainerProcessComponent } from './utility/container-process/container-process.component';
import { SamplingComponent } from './maintenance/sampling/sampling.component';
import { AqlbypassComponent } from './utility/aql-bypass/aql-bypass.component';
import { AttributeSetupComponent } from './maintenance/attribute-setup/attribute-setup.component';
import { AttributeRouteConfigComponent } from './maintenance/attribute-route-config/attribute-route-config.component';
import { TypeaheadComponent } from './framework/frmctl/typeahead/typeahead.component';
import { VendortabComponent } from './receiving/nci/vendortab.component';
import { VerificationComponent } from './verification/verification.component';
import { FileImportComponent } from './utility/file-import/file-import.component';

import { RearrangegridComponent } from './framework/frmctl/rmgrid/rearrangegrid/rearrangegrid.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { SerialInventoryMoveComponent } from './framework/busctl/serial-number-move/serial-inventory-move/serial-inventory-move.component';
import { LabelReprintConfigComponent } from './maintenance/label-reprint-config/label-reprint-config.component';
import { ContainerManagementComponent } from './maintenance/container-management/container-management.component';
import { CaptureIMEIComponent } from './framework/busctl/capture-imei/capture-imei.component';
import { CaptureImeiUtilityComponent } from './utility/capture-imei-utility/capture-imei-utility.component';
import { CarrierComponent } from './maintenance/carrier/carrier.component';
import { sapreasoncodesetupComponent } from './maintenance/sapreason-code-config/sapreason-code.component';
import { groupSetupComponent } from './maintenance/group-setup/group-setup.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { RmngtypeaheadComponent } from './framework/frmctl/rmngtypeahead/rmngtypeahead.component';
import { ShredComponent } from './fqa/shred/shred.component';
import { DispositionCofigComponent } from './maintenance/disposition-engine-cofig/disposition-enigne-cofig.component';
import { MoveBatchFailedSerialnumbersComponent } from './framework/busctl/move-batch-failed-serialnumbers/move-batch-failed-serialnumbers.component';
import { MoveBatchFailedSerialnumbersUtilityComponent } from './utility/move-batch-failed-serialnumbers-utility/move-batch-failed-serialnumbers-utility.component';
import { SpecialReceivingComponent } from './receiving/special-receiving/special-receiving.component';
import { VendorSetupComponent } from './maintenance/vendor-setup/vendor-setup.component';
import { RmaCaptureComponent } from './prewt/rma-capture/rma-capture.component';
import { ModelMasterComponent } from './maintenance/model-master/model-master.component';
import { QcfConsolidationComponent } from './verification/qcf-consolidation/qcf-consolidation.component';
import { VendorTransferComponent } from './fqa/vendor-transfer/vendor-transfer.component';
import { JitHoldRemovalComponent } from './utility/jit-hold-removal/jit-hold-removal.component';
import { TrustedVendorComponent } from './maintenance/trusted-vendor/trusted-vendor.component';
import { DeleteConfirmationDialogComponent } from './framework/frmctl/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { EsnRemoveReviveComponent } from './device-management/manage-sn/esn-remove-revive/esn-remove-revive.component';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableAutoScrollDirective } from './directives/mat-table-auto-scroll.directive';
import { DynamicSurveyComponent } from './framework/busctl/dynamic-survey/dynamic-survey.component';
import { QualificationComponent } from './testing/qualification/qualification.component';
import { RuleSetupComponent } from './framework/busctl/rule-setup/rule-setup.component';
import { ImageProcessComponent } from './framework/frmctl/image-process/image-process.component';
import { NkInboundComponent } from './receiving/nk-inbound/nk-inbound.component';
import { ImageCaptureComponent } from './image-capture/image-capture.component';
import { IVCSetupComponent } from './maintenance/ivc-setup/ivc-setup.component';
import { MasterConfigurationComponent } from './maintenance/master-configuration/master-configuration.component';
import { MasterConfigurationDialogComponent } from './maintenance/master-configuration/master-configuration-dialog/master-configuration-dialog.component';
import { RouteDetailsComponent } from './utility/generic-release/route-details/route-details.component';
import { CloseReceiptComponent } from './receiving/close-receipt/close-receipt.component';
import { ReceivingAutomationComponent } from './receiving/receiving-automation/receiving-automation.component';
import { RmddbtnComponent } from './framework/frmctl/rmddbtn/rmddbtn.component';
import { SkuAttributeComponent } from './maintenance/sku-attribute/sku-attribute.component';
import { OperationsComponent } from './maintenance/operations/operations.component';
import { EditoperationComponent } from './maintenance/operations/editoperation/editoperation.component';
import { AddoperationComponent } from './maintenance/operations/addoperation/addoperation.component';
import { ManualOverrideRouteComponent } from './utility/manual-override-route/manual-override-route.component';
import { RouteSetupComponent } from './framework/busctl/route-setup/route-setup.component';
import { RmxRmComponent } from './fqa/rmx-rm/rmx-rm.component';
import { ProgramCriteriaSetupComponent } from  './dev-maintenance/program-criteria-setup/program-criteria-setup.component';
import { ProgramCriteriaDialogComponent } from './dev-maintenance/program-criteria-setup/program-criteria-dialog/program-criteria-dialog.component';
import { RuleSetupEditorComponent } from './framework/busctl/rule-setup-editor/rule-setup-editor.component';
import { GroupValueComponent } from './maintenance/group-setup/group-value/group-value.component';
import { RuleMasterComponent } from './framework/busctl/rule-master/rule-master.component';
import { RouteSimulatorComponent } from './maintenance/route-simulator/route-simulator.component';
import { DynTypeaheadComponent } from './framework/frmctl/dyn-typeahead/dyn-typeahead.component';
import { SerialRouteSearchComponent } from './maintenance/serial-route-search/serial-route-search.component';
import { HarvestComponent } from './harvest/harvest.component';
import { RmautoExtenderOneComponent } from './framework/frmctl/rmauto-extender-one/rmauto-extender-one.component';
import { AccessoryWarehouseTransferComponent } from './fqa/accessory-warehouse-transfer/accessory-warehouse-transfer.component';
import { SapCriteriaComponent } from './maintenance/sap-criteria/sap-criteria.component';
import { AddsapCriteriaComponent } from './maintenance/sap-criteria/addsap-criteria/addsap-criteria.component';
import { FeildsaddsapCriteriaComponent } from './maintenance/sap-criteria/feildsaddsap-criteria/feildsaddsap-criteria.component';
import { AddruleDialogComponent } from './maintenance/sap-criteria/addrule-dialog/addrule-dialog.component';

import { AutoFailConfigComponent } from './maintenance/auto-fail-config/auto-fail-config.component';
import { SoftwareUpdateComponent } from './device-management/manage-sn/software-update/software-update.component';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule, MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { ApiLogViewerComponent } from './utility/api-log-viewer/api-log-viewer.component';
import { DeviceCatalogComponent } from './maintenance/device-catalog/device-catalog.component';
import { ActionRequiredComponent } from './receiving/receiving-automation/action-required/action-required.component';
import { DeviceSerialMapComponent } from './maintenance/device-serial-mapping/device-serial-mapping';
import { CatalogUtilityComponent } from './utility/catalog-utility/catalog-utility.component';
import { CatalogSkuUtilityComponent } from './utility/catalog-sku-utility/catalog-sku-utility.component';
import { JrdashboardComponent } from './jr/jrdashboard/jrdashboard.component';
import { ChartsModule } from 'ng2-charts';
import { CallProcessingConfigComponent } from './maintenance/call-processing-config/call-processing-config.component';
import { RmxShellComponent, RmxShellRibbon, RmxShellSidebarActions } from './framework/frmctl/rmx-shell/rmx-shell.component';
import { XpoModule } from './xpo.module';
import { LogoutConfirmationComponent } from './dialogs/logout-confirmation/logout-confirmation.component';
import { UtilityModalComponent } from './dialogs/utility-modal/utility-modal.component';
import { ContainerSummaryDialogComponent } from './dialogs/container-summary-dialog/container-summary-dialog.component';
import { ContainerProcessConfirmationComponent } from './dialogs/container-process-confirmation/container-process-confirmation.component';
import { SupplementalSetupPopupComponent } from './dialogs/supplemental-setup-popup/supplemental-setup-popup.component';
import { EditOperationDialogComponent } from './dialogs/edit-operation-dialog/edit-operation-dialog.component';
import { AddOperationDialogComponent } from './dialogs/add-operation-dialog/add-operation-dialog.component';
import { ProgramCriterialAddEditComponent } from './dialogs/program-criterial-add-edit/program-criterial-add-edit.component';


// AoT requires an exported function for factories
export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient);
}

@NgModule({
  declarations: [
    AppComponent,
    RmaccordianComponent,
    RuleSetupComponent,
    RmalertComponent,
    RmbadgeComponent,
    RmbuttonComponent,
    RmcardComponent,
    RmcarouselComponent,
    RmcheckboxComponent,
    RmcollapseComponent,
    RmdatepickerComponent,
    RmdropdownComponent,
    RmmulticoldropdownComponent,
    RmfilebrowserComponent,
    RmlabelComponent,
    RmlistboxComponent,
    RmlistgroupComponent,
    RmmodalComponent,
    RmmultiselectComponent,
    RmnavbarComponent,
    RmnavtabsComponent,
    RmpasswordComponent,
    RmpopoversComponent,
    RmprogressComponent,
    RmradiobuttonComponent,
    RmscrollspyComponent,
    RmtextareaComponent,
    RmtextboxComponent,
    RmtoggleComponent,
    RmtooltipComponent,
    RmnavigationmenuComponent,
    RmgridComponent,
    RmmobilebadgeComponent,
    DashboardComponent,
    ReceiveComponent,
    LoginComponent,
    AppLayoutComponent,
    SearchFilterPipe,
    CustomOrderByPipe,
    PageNotFoundComponent,
    SupervisorOverrideComponent,
    MasterPageComponent,
    TestingComponent,
    ContainerSummaryComponent,
    DynamicPanelComponent,
    ContainerSuggestionComponent,
    FqaComponent,
    RmtypeaheadComponent,
    SerialnumberMoveComponent,
    RmchildgridComponent,
    RmgridmodalComponent,
    ContainerCloseComponent,
    SerialNumberMoveComponent,
    NumberOnlyDirective,
    DragDropDirective,
    ContainerCloseUtilityComponent,
    ContainerMoveUtilityComponent,
    ContainerMoveComponent,
    SerialnumberRecoverComponent,
    BatchDetailComponent,
    RollbackUtilityComponent,
    SerialnumberManagementComponent,
    ReceiveSearchComponent,
    GradingComponent,
    RepairComponent,
    DockReceiveComponent,
    UserProfileComponent,
    MasterSetupComponent,
    RequiredIfDirective,
    ReceiptSearchComponent,
    PrewtComponent,
    RmautoExtenderComponent,
    BatchReprocessComponent,
    ReceiptInjectionComponent,
    RollbackComponent,
    EsnSwapComponent,
    SkuTransferComponent,
    WmxSkuComponent,
    AttributeUpdatesComponent,
    ReprintLabelComponent,
    TransactionConfigComponent,
    AuditComponent,
    NciComponent,
    VendortabComponent,
    RecordAuditComponent,
    SortGroupSetupComponent,
    CodeListSetupComponent,
    RmcontrolDisplayComponent,
    ReceiveMobileComponent,
    RmlockComponent,
    TraceHoldComponent,
    FindTraceHoldComponent,
    SupplementalSetupComponent,
    SupplementalTransactionComponent,
    TrackingnumberMoveComponent,
    TreeViewComponent,
    LocationSetupComponent,
    ContainerInformationComponent,
    RmtimmeroutComponent,
    GenericReleaseComponent,
    InventoryMoveComponent,
    SamplingBatchDetailsComponent,
    ContainerProcessComponent,
    AqlbypassComponent,
    SamplingComponent,
    AttributeRouteConfigComponent,
    AttributeSetupComponent,
    TypeaheadComponent,
    VerificationComponent,
    FileImportComponent,
    RearrangegridComponent,
    SerialInventoryMoveComponent,
    LabelReprintConfigComponent,
    ContainerManagementComponent,
    CaptureIMEIComponent,
    CaptureImeiUtilityComponent,
    CarrierComponent,
    sapreasoncodesetupComponent,
    groupSetupComponent,
    RmngtypeaheadComponent,
    ShredComponent,
    DispositionCofigComponent,
    MoveBatchFailedSerialnumbersComponent,
    MoveBatchFailedSerialnumbersUtilityComponent,
    SpecialReceivingComponent,
    VendorSetupComponent,
    WmxRmxComponent,
    RouteCalculateComponent,
    RmaCaptureComponent,
    ModelMasterComponent,
    ManageSnComponent,
    QcfConsolidationComponent,
    VendorTransferComponent,
    ForgotPasswordComponent,
    LoginLayoutComponent,
    JitHoldRemovalComponent,
    TrustedVendorComponent,
    DeleteConfirmationDialogComponent,
    EsnRemoveReviveComponent,
    MatTableAutoScrollDirective,
    DynamicSurveyComponent,
    QualificationComponent,
    ImageProcessComponent,
    NkInboundComponent,
    ImageCaptureComponent,
    IVCSetupComponent,
    MasterConfigurationComponent,
    MasterConfigurationDialogComponent,
    OperationsComponent,
    EditoperationComponent,
    RouteDetailsComponent,
    CloseReceiptComponent,
    AddoperationComponent,
    ReceivingAutomationComponent,
    RmddbtnComponent,
    SkuAttributeComponent,
    ManualOverrideRouteComponent,
    RouteSetupComponent,
    RmxRmComponent,
    ProgramCriteriaSetupComponent,
    ProgramCriteriaDialogComponent,
    RuleSetupEditorComponent,
    GroupValueComponent,
    RuleMasterComponent,
    RouteSimulatorComponent,
    DynTypeaheadComponent,
    SerialRouteSearchComponent,
    HarvestComponent,
    RmautoExtenderOneComponent,
    AccessoryWarehouseTransferComponent,
    SapCriteriaComponent,
    AddsapCriteriaComponent,
    FeildsaddsapCriteriaComponent,
    AddruleDialogComponent,
    AutoFailConfigComponent,
    SoftwareUpdateComponent,
    ApiLogViewerComponent,
    DeviceCatalogComponent,
    ActionRequiredComponent,
    CatalogUtilityComponent,
    DeviceSerialMapComponent,
    CatalogSkuUtilityComponent,
    JrdashboardComponent,
    CallProcessingConfigComponent,
    RmxShellComponent,
    RmxShellRibbon,
    RmxShellSidebarActions,
    LogoutConfirmationComponent,
    UtilityModalComponent,
    ContainerSummaryDialogComponent,
    ContainerProcessConfirmationComponent,
    SupplementalSetupPopupComponent,
    EditOperationDialogComponent,
    AddOperationDialogComponent,
    ProgramCriterialAddEditComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    routing,
    HttpClientModule,
    // DataTableModule,
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
    PopoverModule.forRoot(),
    NgMultiSelectDropDownModule.forRoot(),
    BrowserAnimationsModule,
    MatDialogModule,
    MatPaginatorModule,
    MatTabsModule,
    MatInputModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    //pipes
    Ng2SearchPipeModule,
    NgxPaginationModule,
    ResponsiveModule.forRoot(),
    TypeaheadModule.forRoot(),
    //toaster
    ToastrModule.forRoot({
      timeOut: 2000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
    NgxSpinnerModule,
    UserIdleModule,
    TooltipModule.forRoot(),
    BsDropdownModule.forRoot(),
    TabsModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    // XpoAppSwitcherPopoverModule,
    MatFormFieldModule,
    MatInputModule,
    MatTreeModule,
    DragDropModule,
    NgSelectModule,
    NgOptionHighlightModule,
    MatTableModule,
    MatStepperModule,
    ChartsModule,
    XpoModule,
  ],
  providers: [
    RuntimeConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: (environment: RuntimeConfigService) => () => environment.loadRuntimeConfig(),
      multi: true,
      deps: [RuntimeConfigService, HttpClientModule]
    },
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { floatLabel: 'always' } },
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} },
    ApiService,
    AuthService,
    AuthGuard,
    ProfileGuard,
    ReceivingService,
    MessagingService,
    ApiConfigService,
    AppErrorService,
    MasterPageService,
    DynamicPanelService,
    AppService,
    RmgridService,
    DatePipe,
    TransactionService,
    CommonService,
    LoginService,
    SurveyService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  entryComponents: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
