import { MasterConfigurationComponent } from './maintenance/master-configuration/master-configuration.component';
import { OperationsComponent } from './maintenance/operations/operations.component';
import { JitHoldRemovalComponent } from './utility/jit-hold-removal/jit-hold-removal.component';
import { QcfConsolidationComponent } from './verification/qcf-consolidation/qcf-consolidation.component';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';

//receiving module
import { ReceivingAutomationComponent } from './receiving/receiving-automation/receiving-automation.component';
import { ReceiveSearchComponent } from './receiving/receive-search/receive-search.component';
import { ReceiveComponent } from './receiving/receive/receive.component';
import { NciComponent } from './receiving/nci/nci.component';
import { ReceiveMobileComponent } from './receiving/receive-mobile/receive-mobile.component';
import { SpecialReceivingComponent } from './receiving/special-receiving/special-receiving.component';
import { CloseReceiptComponent } from './receiving/close-receipt/close-receipt.component';
//Testing
import { TestingComponent } from './testing/testing/testing.component';
//login
import { LoginLayoutComponent } from './login-layout/login-layout.component';
import { LoginComponent } from './login-layout/login/login.component';
import { ForgotPasswordComponent } from './login-layout/forgot-password/forgot-password.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { AppLayoutComponent } from './app-layout/app-layout.component';

//FQA
import { FqaComponent } from './fqa/fqa.component';

//Utility
import { ApiLogViewerComponent } from './utility/api-log-viewer/api-log-viewer.component';
import { SerialnumberMoveComponent } from './utility/serialnumber-move/serialnumber-move.component';
import { ContainerCloseUtilityComponent } from './utility/container-close-utility/container-close-utility.component';
import { ContainerMoveUtilityComponent } from './utility/container-move-utility/container-move-utility.component';
import { SupervisorOverrideComponent } from './utility/supervisor-override/supervisor-override.component';
import { RollbackUtilityComponent } from './utility/rollback-utility/rollback-utility.component';
import { SerialnumberManagementComponent } from './utility/serialnumber-management/serialnumber-management.component';
import { RepairComponent } from './repair/repair.component';
import { DockReceiveComponent } from './receiving/dock-receive/dock-receive.component';
import { GradingComponent } from './grading/grading.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { ProfileGuard } from './profile.guard';
import { MasterSetupComponent } from './utility/master-setup/master-setup.component';
import { ReceiptSearchComponent } from './receiving/receipt-search/receipt-search.component';
import { PrewtComponent } from './prewt/prewt.component';
import { BatchReprocessComponent } from './fqa/batch-reprocess/batch-reprocess.component';
import { ReceiptInjectionComponent } from './utility/receipt-injection/receipt-injection.component';
import { ReprintLabelComponent } from './utility/reprint-label/reprint-label.component';
import { TransactionConfigComponent } from './dev-maintenance/transaction-config/transaction-config.component';
import { AuditComponent } from './maintenance/audit/audit.component';
import { RecordAuditComponent } from './utility/record-audit/record-audit.component';
import { SortGroupSetupComponent } from './maintenance/sort-group-setup/sort-group-setup.component';
import { CodeListSetupComponent } from './maintenance/code-list-setup/code-list-setup.component';
import { TrackingnumberMoveComponent } from './utility/trackingnumber-move/trackingnumber-move.component';
import { TraceHoldComponent } from './utility/trace-hold/trace-hold.component';
import { SupplementalTransactionComponent } from './utility/supplemental-transaction/supplemental-transaction.component';
import { SupplementalSetupComponent } from './maintenance/supplemental-setup/supplemental-setup.component';
import { ContainerInformationComponent } from './utility/container-information/container-information.component';
import { LocationSetupComponent } from './maintenance/location-setup/location-setup.component';
import { GenericReleaseComponent } from './utility/generic-release/generic-release.component';
import { ContainerProcessComponent } from './utility/container-process/container-process.component';
import { SamplingComponent } from './maintenance/sampling/sampling.component';
import { AqlbypassComponent } from './utility/aql-bypass/aql-bypass.component';
import { AttributeRouteConfigComponent } from './maintenance/attribute-route-config/attribute-route-config.component';
import { AttributeSetupComponent } from './maintenance/attribute-setup/attribute-setup.component';
import { VerificationComponent } from './verification/verification.component';
import { FileImportComponent } from './utility/file-import/file-import.component';
import { LabelReprintConfigComponent } from './maintenance/label-reprint-config/label-reprint-config.component';
import { ContainerManagementComponent } from './maintenance/container-management/container-management.component';
import { CaptureImeiUtilityComponent } from './utility/capture-imei-utility/capture-imei-utility.component';
import { CarrierComponent } from './maintenance/carrier/carrier.component';
import { sapreasoncodesetupComponent } from './maintenance/sapreason-code-config/sapreason-code.component';
import { groupSetupComponent } from './maintenance/group-setup/group-setup.component';
import { ShredComponent } from './fqa/shred/shred.component';
import { DispositionCofigComponent } from './maintenance/disposition-engine-cofig/disposition-enigne-cofig.component';
import { MoveBatchFailedSerialnumbersUtilityComponent } from './utility/move-batch-failed-serialnumbers-utility/move-batch-failed-serialnumbers-utility.component';
import { VendorSetupComponent } from './maintenance/vendor-setup/vendor-setup.component';
import { RmaCaptureComponent } from './prewt/rma-capture/rma-capture.component';
import { ModelMasterComponent } from './maintenance/model-master/model-master.component';
import { TrustedVendorComponent } from './maintenance/trusted-vendor/trusted-vendor.component';
import { DeviceCatalogComponent } from './maintenance/device-catalog/device-catalog.component';


// DM
import { ManageSnComponent } from './device-management/manage-sn/manage-sn.component';
import { WmxRmxComponent } from './device-management/wmx-rmx/wmx-rmx.component';
import { WmxSkuComponent } from './device-management/wmx-sku/wmx-sku.component';

import { VendorTransferComponent } from './fqa/vendor-transfer/vendor-transfer.component';

// Qualification
import { QualificationComponent } from './testing/qualification/qualification.component';
import { NkInboundComponent } from './receiving/nk-inbound/nk-inbound.component';
import { ImageCaptureComponent } from './image-capture/image-capture.component';
import { IVCSetupComponent } from './maintenance/ivc-setup/ivc-setup.component';
import { SkuAttributeComponent } from './maintenance/sku-attribute/sku-attribute.component';
import { ManualOverrideRouteComponent } from './utility/manual-override-route/manual-override-route.component';
import { RmxRmComponent } from './fqa/rmx-rm/rmx-rm.component';
import { ProgramCriteriaSetupComponent } from './dev-maintenance/program-criteria-setup/program-criteria-setup.component';
import { RouteSimulatorComponent } from './maintenance/route-simulator/route-simulator.component';
import { SerialRouteSearchComponent } from './maintenance/serial-route-search/serial-route-search.component';
import { HarvestComponent } from './harvest/harvest.component';
import { AccessoryWarehouseTransferComponent } from './fqa/accessory-warehouse-transfer/accessory-warehouse-transfer.component';
import { SapCriteriaComponent } from './maintenance/sap-criteria/sap-criteria.component';
import { AutoFailConfigComponent } from './maintenance/auto-fail-config/auto-fail-config.component';
import { DeviceSerialMapComponent } from './maintenance/device-serial-mapping/device-serial-mapping';
import { JrdashboardComponent } from './jr/jrdashboard/jrdashboard.component';
import { CallProcessingConfigComponent } from './maintenance/call-processing-config/call-processing-config.component';


const appRoutes: Routes = [
  {
    path: '', component: LoginLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent }
    ]
  },
  {
    path: '', component: AppLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
      { path: 'receive-search', component: ReceiveSearchComponent, canActivate: [AuthGuard] },
      { path: 'receipt-search', component: ReceiptSearchComponent, canActivate: [AuthGuard] },
      { path: 'receiving-automation', component: ReceivingAutomationComponent, canActivate: [AuthGuard] },
      { path: 'rcv/receiving-automation', component: ReceivingAutomationComponent, canActivate: [AuthGuard] },
      { path: 'receive', component: ReceiveComponent, canActivate: [AuthGuard] },
      { path: 'dockreceive', component: DockReceiveComponent, canActivate: [AuthGuard] },
      { path: 'nci', component: NciComponent, canActivate: [AuthGuard] },
      { path: 'testing', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'ciclear', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'ciclear-sec', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'killswitch', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'killswitch-lab', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'supervisor-override', component: SupervisorOverrideComponent, canActivate: [AuthGuard] },
      { path: 'fqa', component: FqaComponent, canActivate: [AuthGuard] },
      { path: 'accessory-warehouse-transfer', component: AccessoryWarehouseTransferComponent, canActivate: [AuthGuard] },
      { path: 'serial-number-move', component: SerialnumberMoveComponent, canActivate: [AuthGuard] },
      { path: 'container-close', component: ContainerCloseUtilityComponent, canActivate: [AuthGuard] },
      { path: 'container-move', component: ContainerMoveUtilityComponent, canActivate: [AuthGuard] },
      { path: 'serialnum-management', component: SerialnumberManagementComponent, canActivate: [AuthGuard] },
      { path: 'rollback', component: RollbackUtilityComponent, canActivate: [AuthGuard] },
      { path: 'trans-config', component: TransactionConfigComponent, canActivate: [AuthGuard] },
      { path: 'grading', component: GradingComponent, canActivate: [AuthGuard] },
      { path: 'repair', component: RepairComponent, canActivate: [AuthGuard] },
      { path: 'dock-receive', component: DockReceiveComponent, canActivate: [AuthGuard] },
      { path: 'user-profile', component: UserProfileComponent, canActivate: [ProfileGuard] },
      { path: 'master-setup', component: MasterSetupComponent, canActivate: [AuthGuard] },
      { path: 'clean', component: PrewtComponent, canActivate: [AuthGuard] },
      { path: 'repackage', component: PrewtComponent, canActivate: [AuthGuard] },
      { path: 'salvage', component: PrewtComponent, canActivate: [AuthGuard] },
      { path: 'rma-capture', component: RmaCaptureComponent, canActivate: [AuthGuard] },
      { path: 'batch-reprocess', component: BatchReprocessComponent, canActivate: [AuthGuard] },
      { path: 'receipt-injection', component: ReceiptInjectionComponent, canActivate: [AuthGuard] },
      { path: 'reprint-label', component: ReprintLabelComponent, canActivate: [AuthGuard] },
      { path: 'audit-setup', component: AuditComponent, canActivate: [AuthGuard] },
      { path: 'quality-audit', component: RecordAuditComponent, canActivate: [AuthGuard] },
      { path: 'trace', component: TraceHoldComponent, canActivate: [AuthGuard] },
      { path: 'sortgroup-setup', component: SortGroupSetupComponent, canActivate: [AuthGuard] },
      { path: 'codelist-setup', component: CodeListSetupComponent, canActivate: [AuthGuard] },
      { path: 'receive-m', component: ReceiveMobileComponent, canActivate: [AuthGuard] },
      { path: 'splreceive-m', component: SpecialReceivingComponent, canActivate: [AuthGuard] },
      { path: 'close-receipt', component: CloseReceiptComponent, canActivate: [AuthGuard] },
      { path: 'trknbr-move', component: TrackingnumberMoveComponent, canActivate: [AuthGuard] },
      { path: 'supplemental-trans', component: SupplementalTransactionComponent, canActivate: [AuthGuard] },
      { path: 'supplemental-setup', component: SupplementalSetupComponent, canActivate: [AuthGuard] },
      { path: 'container-info', component: ContainerInformationComponent, canActivate: [AuthGuard] },
      { path: 'mvdtest', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'qualification', component: QualificationComponent, canActivate: [AuthGuard] },
      { path: 'sapreasoncode-setup', component: sapreasoncodesetupComponent, canActivate: [AuthGuard] },
      { path: 'group-setup', component: groupSetupComponent, canActivate: [AuthGuard] },

      // AQL
      { path: 'aql/cosmetic', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'aql/function', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'aql/flash', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'aql/datar', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'aql/manualci', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'aql/manualci-second', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'aql/factory-reset', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'aql/mvdtest', component: TestingComponent, canActivate: [AuthGuard] },

      // JIT
      { path: 'jit/cosmetic', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'jit/function', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'jit/flash', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'jit/datar', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'jit/manualci', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'jit/manualci-second', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'jit/factory-reset', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'jit/mvdtest', component: TestingComponent, canActivate: [AuthGuard] },

      // applenongsx
      { path: 'applenongsx', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'applenongsx/cosmetic', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'applenongsx/flash', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'applenongsx/mvdtest', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'applenongsx/datav', component: TestingComponent, canActivate: [AuthGuard] },

      // prekitting
      { path: 'prekitting/flash', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'dekitting', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'factory-reset', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'flash', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'datar', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'appleboxinspect', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'appleshrink', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'embedsim', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'greent', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'reflash', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'sammisspelled', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'battck', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'cartonlabel', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'ddstrapreplment', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'esnverify', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'nkboxinspect', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'precharge', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'sledprogram', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'softwareupdate', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'tamperreseal', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'toteinspection', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'tsflash', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'appflashgt', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'datav', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'custinfo', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'lgflash', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'pcdflash', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'samsclear', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'flashbattchk', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'removesim', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'ddstrapreplment', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'deepclean', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'cleaning', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'auto-device-proc', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'ciclear-govt', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'ratapretest', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'rataposttest', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'pretest', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'coregrading', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'fdr', component: TestingComponent, canActivate: [AuthGuard] },
      { path: 'bbl', component: TestingComponent, canActivate: [AuthGuard] },

      // verification
      { path: 'qcf', component: VerificationComponent, canActivate: [AuthGuard] },
      { path: 'vendor', component: VerificationComponent, canActivate: [AuthGuard] },
      { path: 'lab', component: VerificationComponent, canActivate: [AuthGuard] },
      { path: 'qcf-consolidation', component: QcfConsolidationComponent, canActivate: [AuthGuard] },
      { path: 'location-setup', component: LocationSetupComponent, canActivate: [AuthGuard] },
      { path: 'operation-setup', component: OperationsComponent, canActivate: [AuthGuard] },
      { path: 'holdrelease', component: GenericReleaseComponent, canActivate: [AuthGuard] },
      { path: 'container-process', component: ContainerProcessComponent, canActivate: [AuthGuard] },
      { path: 'sampling-setup', component: SamplingComponent, canActivate: [AuthGuard] },
      { path: 'aqlby-pass', component: AqlbypassComponent, canActivate: [AuthGuard] },
      { path: 'attribute-routing-setup', component: AttributeRouteConfigComponent, canActivate: [AuthGuard] },
      { path: 'attribute-setup', component: AttributeSetupComponent, canActivate: [AuthGuard] },
      { path: 'fileimport', component: FileImportComponent, canActivate: [AuthGuard] },
      { path: 'adhocklable-setup', component: LabelReprintConfigComponent, canActivate: [AuthGuard] },
      { path: 'container-management', component: ContainerManagementComponent, canActivate: [AuthGuard] },
      { path: 'capture-imei', component: CaptureImeiUtilityComponent, canActivate: [AuthGuard] },
      { path: 'carrier', component: CarrierComponent, canActivate: [AuthGuard] },    
      { path: 'shred', component: ShredComponent, canActivate: [AuthGuard] },
      { path: 'disposition-engine-config', component: DispositionCofigComponent, canActivate: [AuthGuard] },
      { path: 'close-batch', component: MoveBatchFailedSerialnumbersUtilityComponent, canActivate: [AuthGuard] },
      { path: 'vendor-setup', component: VendorSetupComponent, canActivate: [AuthGuard] },
      { path: 'model', component: ModelMasterComponent, canActivate: [AuthGuard] },
      { path: 'manage-sn', component: ManageSnComponent, canActivate: [AuthGuard] },
      { path: 'wmx-rmx', component: WmxRmxComponent, canActivate: [AuthGuard] },
      { path: 'wmx-sku', component: WmxSkuComponent, canActivate: [AuthGuard] },
      { path: 'vendortransfer', component: VendorTransferComponent, canActivate: [AuthGuard] },
      { path: 'jitholdremoval', component: JitHoldRemovalComponent, canActivate: [AuthGuard] },
      { path: 'trustedvendor-setup', component: TrustedVendorComponent, canActivate: [AuthGuard] },
      { path: 'new-kit-inbound', component: NkInboundComponent, canActivate: [AuthGuard] },
      { path: 'imagecapture', component: ImageCaptureComponent, canActivate: [AuthGuard] },
      { path: 'ivccode', component: IVCSetupComponent, canActivate: [AuthGuard] },
      { path: 'master-configs', component: MasterConfigurationComponent, canActivate: [AuthGuard]},
      { path: 'mnt-skuattr', component: SkuAttributeComponent, canActivate: [AuthGuard] },
      { path: 'manual-route-override', component: ManualOverrideRouteComponent, canActivate: [AuthGuard] },
      { path: 'rmxrmtransfer', component: RmxRmComponent, canActivate: [AuthGuard] },
      { path: 'program-criteria', component: ProgramCriteriaSetupComponent, canActivate: [AuthGuard]},
      { path: 'route-simulator', component: RouteSimulatorComponent, canActivate: [AuthGuard]},
      { path: 'snroute-setup', component: SerialRouteSearchComponent, canActivate: [AuthGuard]},
      { path: 'auto-fail-config', component: AutoFailConfigComponent, canActivate: [AuthGuard]},
      { path: 'harvest', component: HarvestComponent, canActivate: [AuthGuard]},
      { path: 'api-log-viewer', component: ApiLogViewerComponent, canActivate: [AuthGuard]},
      { path: 'device-catalog', component: DeviceCatalogComponent, canActivate: [AuthGuard]},
      { path: 'device-serialMapping', component: DeviceSerialMapComponent, canActivate: [AuthGuard]},
      // SAP criteria
      { path: 'sap-criteria', component: SapCriteriaComponent, canActivate: [AuthGuard]},
      { path: 'jr-dashboard', component: JrdashboardComponent, canActivate: [AuthGuard] },
      { path: 'callprocessing-config', component: CallProcessingConfigComponent, canActivate: [AuthGuard] },

    ]
  },
  /*{
    path: '',
    redirectTo: '/app',
    pathMatch: 'full'
  },  */
  { path: '**', component: PageNotFoundComponent }
];

export const routing = RouterModule.forRoot(appRoutes, {
  useHash: true
});
