import { Injectable } from '@angular/core';
import { RuntimeConfigService } from './runtime-config.service';

@Injectable()
export class ApiConfigService {
  Type = 'E';
  constructor(private environment: RuntimeConfigService) { }

  public get serverConfig() {
    return this.environment.runtimeConfig;
  }

  public comurl = this.environment.runtimeConfig.comUrl;
  public utlurl = this.environment.runtimeConfig.utlUrl;
  public securl = this.environment.runtimeConfig.secUrl;
  public recurl = this.environment.runtimeConfig.recUrl;
  public tsturl = this.environment.runtimeConfig.tstUrl;
  public wturl = this.environment.runtimeConfig.wtUrl;
  public rmcurl = this.environment.runtimeConfig.rmcUrl;
  public conurl = this.environment.runtimeConfig.conUrl;
  public mnturl = this.environment.runtimeConfig.mntUrl;
  public asurl = this.environment.runtimeConfig.asUrl;
  public siteIdErrMsg = this.environment.runtimeConfig.errorMsg;
  public invalidUserErrMsg = this.environment.runtimeConfig.invalidUser;

  public CommonApiUrl = this.comurl + 'api/';
  public Utilities = this.utlurl + 'api/';
  public AuthUrl = this.securl + 'Authenticate/';
  public LoginApiUrl = this.securl + 'LogIn/';
  public receivingApiUrl = this.recurl + 'api/receiving/';
  public splReceivingApiUrl = this.recurl + 'api/spclReceiving/';
  public TestingApiUrl = this.tsturl + 'api/';
  public FQAApiUrl = this.wturl + 'api/';
  public RMClientApiUrl = this.rmcurl + 'api/';
  public nciApiUrl = this.recurl + 'api/nci/';
  public ConfigurationApiUrl = this.conurl + 'api/';
  public MaintenanceApiUrl = this.mnturl + 'api/maintenance/';

  public AutomationApiUrl = this.asurl +'api/Automation/';

  // Receiving APIs
  public getLocPalletUrl = this.receivingApiUrl + 'getLocPallet';
  public checkPalletUrl = this.receivingApiUrl + 'checkPallet';
  public checkTrknbrUrl = this.receivingApiUrl + 'checkTrknbr';
  public getParentIdUrl = this.receivingApiUrl + 'getParentId';
  public startDetectionUrl = this.receivingApiUrl + 'startDetection';
  public turnOffPortLEDUrl = this.receivingApiUrl + 'turnOffPortLED';
  public validatePortIdAvailabilityUrl = this.receivingApiUrl + 'validatePortIdAvailability';
  public completePortIdValidationUrl = this.receivingApiUrl + 'completePortIdValidation';
  public getQueueRecordsUrl = this.receivingApiUrl + 'getQueueRecords';
  public generateUIDUrl = this.receivingApiUrl + 'generateUID';
  public getVendorDeviceUrl = this.receivingApiUrl + 'getVendorDevice';
  public getDeviceUrl = this.receivingApiUrl + 'getDevice';
  public getColorCarrierOEMCodesUrl = this.receivingApiUrl + 'GetColorCarrierOEMCodes';
  public sendTestProfileUrl = this.receivingApiUrl + 'sendTestProfile';
  public getTimedOutPortInfoUrl = this.receivingApiUrl + 'getTimedOutPortInfo';
  public unAssignPortUrl = this.receivingApiUrl + 'unassignPort';
  public preAddProcessForDeviceUrl = this.receivingApiUrl + 'preAddProcessForDevice';
  public addAutoSerialNumberUrl = this.receivingApiUrl + 'addAutoSerialNumber';
  public reassignPortUrl = this.receivingApiUrl + 'changePort';
  public loadPalletUrl = this.receivingApiUrl + 'loadpallet';
  public emptyPalletUrl = this.receivingApiUrl + 'emptypallet';
  public getPalletUrl = this.receivingApiUrl + 'getpallet';
  public trackingNoUrl = this.receivingApiUrl + 'trackingnumber';
  public receiptUrl = this.receivingApiUrl + 'searchauthorizationkey';
  public validateSerialNumber = this.receivingApiUrl + 'validateSerialNumber';
  public getDetermineSKUsUrl = this.receivingApiUrl + 'determineSKU';
  public getEligibleSKUsUrl = this.receivingApiUrl + 'getEligibleSKUs';
  public processDeviceUrl = this.receivingApiUrl + 'getProgram';
  public addSerialNumberUrl = this.receivingApiUrl + 'addSerialNumber';
  public deleteSerialNumberUrl = this.receivingApiUrl + 'deleteSerialNumber';
  public receiptPostUrl = this.receivingApiUrl + 'receiptPost';
  public receiptClearUrl = this.receivingApiUrl + 'receiptClear';
  public loadReceivingvalues = this.receivingApiUrl + 'loadReceivingvalues';
  public loadReceivingProgramValuesUrl = this.receivingApiUrl + 'loadReceivingProgramValues';
  public validateAuthorizationKey = this.receivingApiUrl + 'validateAuthorizationKey';
  public validateDeleteSerialNumber = this.receivingApiUrl + 'validateDeleteSerialNumber';
  public searchKeyUrl = this.receivingApiUrl + 'searchKey';
  public searchAuthorizationKeyUrl = this.receivingApiUrl + 'searchAuthorizationKey';
  public createReceiptUrl = this.receivingApiUrl + 'createReceipt';
  public getReceiptDetailUrl = this.receivingApiUrl + 'getReceiptDetail';
  public getManufacturerSKUUrl = this.receivingApiUrl + 'getManufacturerSKU';
  public getLottableFieldsUrl = this.receivingApiUrl + 'getLottableFields';
  public canReceiveUrl = this.receivingApiUrl + 'canReceive';
  public receivecreateLabelUrl = this.receivingApiUrl + 'createLabel';
  public searchReceiptAPI = this.receivingApiUrl + 'searchReceipt';
  public loadReceiptApi = this.receivingApiUrl + 'loadReceipt';
  public getReceivingModesUrl = this.receivingApiUrl + 'getReceivingModes';
  public validate2DBarcodeUrl = this.receivingApiUrl + 'validate2DBarcode';
  public getExpectedSKUsUrl = this.receivingApiUrl + 'getExpectedSKUs';
  public getConditionUrl = this.receivingApiUrl + 'getConditions';
  public recGetRouteUrl = this.receivingApiUrl + 'getroute';
  public recGetTransactionUrl = this.receivingApiUrl + 'getTranscation';
  public recSuggestContainerUrl = this.receivingApiUrl + 'suggestcontainer';
  public checkSoftwareVersionUrl = this.receivingApiUrl + 'checkSoftwareVersion';
  public recSaveTransactionUrl = this.receivingApiUrl + 'saveTransaction';
  public getReceiptColorCodeUrl = this.receivingApiUrl + 'getReceiptColorCode';
  public insertSamplingBatch = this.receivingApiUrl + 'insertSamplingBatch';
  public addAccessoryUrl = this.receivingApiUrl + 'addAccessory';
  public actionComplete = this.receivingApiUrl + 'actionComplete';
  public getSKUBySerialNumberUrl = this.receivingApiUrl + 'getSKUBySerialNumber';
  public searchDeviceCatalogUrl = this.receivingApiUrl + 'searchDeviceCatalog';


  public postRecUpdateProcess = this.receivingApiUrl + 'postUpdateProcess';
  public validateMSNValueUrl = this.receivingApiUrl + 'validateMSNValue';
  public validateNKInboundContainer = this.receivingApiUrl + 'validateNKInboundContainer';
  public updateNKInboundDevices = this.receivingApiUrl + 'updateNKInboundDevices';
  public validateAndReceiveSerialNumbersUrl = this.receivingApiUrl + 'validateAndReceiveSerialNumbers';
  public asnCloseContainerUrl = this.receivingApiUrl + 'asnCloseContainer';
  public asnSNValidationUrl = this.receivingApiUrl + 'asnSNValidation';
  public asnSerialNumberAddUrl = this.receivingApiUrl + 'ASNSerialNumberAdd';
  // Special receving
  public receviceSearchUrl = this.splReceivingApiUrl + 'rcvSearch';
  // Dock Receiving APIS
  public getTrackingNumberUrl = this.receivingApiUrl + 'getTrackingNumber';
  public generateTrackingNumber = this.receivingApiUrl + 'generateTrackingNumber';
  public getDockInfoUrl = this.receivingApiUrl + 'getDockInfo';
  public getDockDetailsUrl = this.receivingApiUrl + 'getDockDetails';
  public generateDockReceiptUrl = this.receivingApiUrl + 'generateDockReceipt';
  public saveDockDataUrl = this.receivingApiUrl + 'saveDockData';
  public deleteDockDetailsUrl = this.receivingApiUrl + 'deleteDockDetails';

  public updateDockInfoUrl = this.receivingApiUrl + 'updateDockInfo';
  public validateContainerIdUrl = this.receivingApiUrl + 'validateContainerId';
  public getCarrierUrl = this.receivingApiUrl + 'getCarrier';
  public validateTrackingNumberUrl = this.receivingApiUrl + 'validateTrackingNumber';
  public saveTrackingNumberUrl = this.receivingApiUrl + 'saveTrackingNumber';
  public getDockTypesUrl = this.receivingApiUrl + 'getDockTypes';
  public getShipmentTypesUrl = this.receivingApiUrl + 'getShipmentTypes';
  public validateDockUrl = this.receivingApiUrl + 'validateDock';

  // Close receipt
  public getReceiptsForSearchkey = this.receivingApiUrl + 'GetReceiptsForSearchkey';
  public cancelReceipts = this.receivingApiUrl + 'CancelReceipts';
  public getSerialNumbersForReceipt = this.receivingApiUrl + 'GetSerialNumbersForReceipt';


  // NCI APIs
  public getReasonsUrl = this.nciApiUrl + 'getReasons';
  public getRoutesUrl = this.nciApiUrl + 'getroutes';
  public getExpectedQtyUrl = this.nciApiUrl + 'getExpectedQty';
  public insertNciUrl = this.nciApiUrl + 'insertNci';
  public updateNciUrl = this.nciApiUrl + 'updateNci';
  public getNciUrl = this.nciApiUrl + 'getNci';
  public getSKUsUrl = this.nciApiUrl + 'getSKUs';
  public getNciId = this.nciApiUrl + 'getNciId';
  public getNciDockTypesUrl = this.nciApiUrl + 'getDockTypes';
  public getCarrierByRefUrl = this.nciApiUrl + 'getcarrierbyref';
  public getVendorsUrl = this.nciApiUrl + 'getVendors';

  // Common APIs
  public appErrorUrl = this.CommonApiUrl + 'common/ApplicationError';
  public getOperationsUrl = this.CommonApiUrl + 'common/getOperations';
  public getControlConfigUrl = this.CommonApiUrl + 'common/getControlConfig';
  public getRouteUrl = this.CommonApiUrl + 'common/getroute';
  public suggestContainerUrl = this.CommonApiUrl + 'common/suggestcontainer';
  public validateContainerUrl = this.CommonApiUrl + 'common/validateContainer';
  public getMessagesForCategoryUrl = this.CommonApiUrl + 'common/getMessagesForCategory';
  public getTransaction = this.CommonApiUrl + 'common/getTranscation';
  public saveTransaction = this.CommonApiUrl + 'common/saveTransaction';
  public validateLocation = this.CommonApiUrl + 'common/validateLocation';
  public validateInboundContainerUrl = this.CommonApiUrl + 'common/validateInboundContainer';
  public validateContainerSerialNumbersUrl = this.CommonApiUrl + 'common/validateContainerSerialNumbers';
  public getInboundDetailsUrl = this.CommonApiUrl + 'common/getInboundDetails';
  public loadProgramValuesurl = this.CommonApiUrl + 'common/loadProgramValues';
  public updateDeviceUrl = this.CommonApiUrl + 'common/updateDevice';
  public addSerialNumberSnapUrl = this.CommonApiUrl + 'common/addSerialNumberSnap';
  public validateCloseContainerUrl = this.CommonApiUrl + 'common/validateCloseContainer';
  public closeContainerUrl = this.CommonApiUrl + 'common/closeContainer';
  public refreshContainerUrl = this.CommonApiUrl + 'common/refreshContainer';
  public suggestExceptionContainerUrl = this.CommonApiUrl + 'common/suggestExceptionContainer';
  public validateMoveSerialNumberUrl = this.CommonApiUrl + 'common/validateMoveSerialNumber';
  public validateMoveContainer = this.CommonApiUrl + 'common/validateMoveContainer';
  public moveSerialNumberUrl = this.CommonApiUrl + 'common/moveSerialNumber';
  public validateContainerLocationMoveUrl = this.CommonApiUrl + 'common/validateContainerLocationMove';
  public moveSerialnumberInv = this.CommonApiUrl + 'common/moveSerialnumberInv';
  public validateContainerLocationUrl = this.CommonApiUrl + 'common/validateContainerLocation';
  public moveContainerUrl = this.CommonApiUrl + 'common/moveContainer';
  public validatemoveContainerUrl = this.CommonApiUrl + 'common/validateToContainer';
  // public clientControlsUrl = this.CommonApiUrl + 'common/getClientControls';
  public createLabelUrl = this.CommonApiUrl + 'common/createLabel';
  public getStatuses = this.CommonApiUrl + 'common/getStatuses';
  public getControlPropertiesUrl = this.CommonApiUrl + 'common/getControlProperties';
  public saveAccTransResult = this.CommonApiUrl + 'common/saveAccTransResult';
  public getValidateSerialnumberCommonUrl = this.CommonApiUrl + 'common/validateSerialNumber';
  public updateLottables = this.CommonApiUrl + 'common/updateLottables';
  public getRoleCapabilities = this.CommonApiUrl + 'common/getRoleCapabilities';
  public getReadOnlyDeviceDetails = this.CommonApiUrl + 'common/getReadOnlyDeviceDetails';
  public getReadOnlyDeviceDetailsForContainer = this.CommonApiUrl + 'common/getReadOnlyDeviceDetailsForContainer';
  public validateReadOnlyDeviceDetails = this.CommonApiUrl + 'common/validateReadOnlyDeviceDetails';
  public validateReadOnlyDeviceDetailsForContainer = this.CommonApiUrl + 'common/validateReadOnlyDeviceDetailsForContainer';
  public getLocationContainersUrl = this.CommonApiUrl + 'common/getLocationContainers';
  public validateAndUpdateDevice = this.CommonApiUrl + 'common/validateAndUpdateDevice';
  public getContainersDeviceInfoUrl = this.CommonApiUrl + 'common/GetContainersDeviceInfo';
  public performPortClearUrl = this.CommonApiUrl + 'common/PerformPortClear';
  public retryTestProfileUrl = this.CommonApiUrl + 'common/RetryTestProfile';
  public commonValidate2DBarcodeUrl = this.CommonApiUrl + 'common/validate2DBarcode';
  // Login APIs
  public authenticateUrl = this.AuthUrl + 'Authenticate';
  public forgotPasswordUrl = this.LoginApiUrl + 'ForgotPassword';
  public getRolesSideIdsUrl = this.LoginApiUrl + 'GetRolesSiteIds';
  public getStorerUrl = this.LoginApiUrl + 'getStorer';
  public getUserProfileUrl = this.LoginApiUrl + 'getUserProfile';
  public saveUserProfileUrl = this.LoginApiUrl + 'saveUserProfile';
  public navbarMenuAPI = this.LoginApiUrl + 'getMenu';
  public getsiteIdUrl = this.LoginApiUrl + 'getSites';
  public getdeviceIdUrl = this.LoginApiUrl + 'getDeviceId';

  // Testing APIs
  public getAutoVirtualContainerUrl = this.TestingApiUrl + 'testing/GetAutoVirtualContainer';
  public getQueuedSerialNumbersUrl = this.TestingApiUrl + 'testing/getQueuedSerialNumbers';
  public getTestUrl = this.TestingApiUrl + 'testing/getTest';
  public validateTestSerialNumberUrl = this.TestingApiUrl + 'testing/validateTestSerialNumber';
  public getTransactionUrl = this.TestingApiUrl + 'testing/getTransaction';
  public addTestQueueDataUrl = this.TestingApiUrl + 'testing/addTestQueueData';
  public getTransAttributeValuesUrl = this.TestingApiUrl + 'testing/getTransAttributeValues';
  public manualProcessTestUrl = this.TestingApiUrl + 'testing/manualProcessTest';
  public manualTestUrl = this.TestingApiUrl + 'testing/ManualTest';
  public getTestRouteUrl = this.TestingApiUrl + 'testing/getroute';
  public saveTransResultUrl = this.TestingApiUrl + 'testing/saveTransResult';
  public saveSerialNumberTestResultUrl = this.TestingApiUrl + 'testing/saveSerialNumberTestResult';
  public showTransResultsUrl = this.TestingApiUrl + 'testing/showTransResults';
  public getBatchStatus = this.TestingApiUrl + 'testing/getBatchStatus';
  public updateBatchDetailsTrans = this.TestingApiUrl + 'testing/updateBatchDetailsTrans';
  public moveBatch = this.TestingApiUrl + 'testing/moveBatch';
  public getBatchDetailTrans = this.TestingApiUrl + 'testing/getBatchDetailTrans';
  public getRouteOperationsUrl = this.TestingApiUrl + 'testing/getOperations';
  public getQueuedTestSerialNumbers = this.TestingApiUrl + 'testing/getQueuedTestSerialNumbers';
  public updateBatchTaskResult = this.TestingApiUrl + 'testing/UpdateBatchTaskResult';
  public processCaptureUrl = this.TestingApiUrl + 'testing/processCapture';
  public consolidateProcess = this.TestingApiUrl + 'testing/consolidateProcess';

  // Verification APIs
  public getContainersDevices = this.TestingApiUrl + 'testing/getContainersDevices';
  public getVerificationStatus = this.TestingApiUrl + 'testing/getQCFVerificationStatus';
  public moveQCFDevices = this.TestingApiUrl + 'testing/moveQCFDevices';


  // FQA APIS
  public validateFQASerialNumbersUrl = this.FQAApiUrl + 'fqa/validateFQASerialNumbers';
  public validateCaseCountUrl = this.FQAApiUrl + 'fqa/validateCaseCount';
  public getBatchQueueUrl = this.FQAApiUrl + 'fqa/getBatchQueue';
  public fqaProcessUrl = this.FQAApiUrl + 'fqa/Process';
  public refreshFQASerialNumbers = this.FQAApiUrl + 'fqa/refreshFQASerialNumbers';
  public getBatchDetails = this.FQAApiUrl + 'fqa/getBatchDetails';
  public getReprocessBatchDetails = this.FQAApiUrl + 'fqa/getReprocessBatchDetails';
  public reprocessBatch = this.FQAApiUrl + 'fqa/batchReprocess';
  public getModes = this.FQAApiUrl + 'fqa/getMode';
  public varifyFQASerialNumbersUrl = this.FQAApiUrl + 'fqa/verifyFQASerialNumber';
  public postFqaUpdateProcess = this.FQAApiUrl + 'fqa/postUpdateProcess';


  // Utility-ConfigurationAPI
  public getCategoryUrl = this.ConfigurationApiUrl + 'configuration/getCategory';
  public getTransCodeUrl = this.ConfigurationApiUrl + 'configuration/getTransCode';
  public getObjectsUrl = this.ConfigurationApiUrl + 'configuration/getObjects';
  public getOperatorsUrl = this.ConfigurationApiUrl + 'configuration/getOperators';
  public getPropertiesUrl = this.ConfigurationApiUrl + 'configuration/getProperties';
  public getTransactionsUrl = this.ConfigurationApiUrl + 'configuration/getTransactions';
  public getConfigTransactionUrl = this.ConfigurationApiUrl + 'configuration/getTransaction';
  public insertTransConfigUrl = this.ConfigurationApiUrl + 'configuration/insertTransConfig';
  public getLogicalOperatorsUrl = this.ConfigurationApiUrl + 'configuration/getLogicalOperators';
  public getControlIdsUrl = this.ConfigurationApiUrl + 'configuration/getControlIds';
  public getControlTypesUrl = this.ConfigurationApiUrl + 'configuration/getControlTypes';
  public getControlValuesUrl = this.ConfigurationApiUrl + 'configuration/getControlValues';
  public generateTransCodeUrl = this.ConfigurationApiUrl + 'configuration/generateTransCode';
  public validateRuleUrl = this.ConfigurationApiUrl + 'configuration/validateRule';
  public getSelControlIds = this.ConfigurationApiUrl + 'configuration/getSelControlIds';
  public getMasterConfigUrl = this.ConfigurationApiUrl + 'configuration/getmasterconfiglist';
  public saveConfigItem = this.ConfigurationApiUrl + 'configuration/saveconfigitem';

  // Utility-Device Management API's
  public getOptionsUrl = this.Utilities + 'utilities/getDeviceManagementOptions';
  public getReasons = this.Utilities + 'utilities/getReasons';
  public getValidateSerialnumberUrl = this.Utilities + 'utilities/validateSerialNumber';
  public getPerformedOptionsUrl = this.Utilities + 'utilities/';
  public processUrl = this.Utilities + 'utilities/dmprocess';
  public updateDeviceUtilityUrl = this.Utilities + 'utilities/updateDevice';
  public createTransfer = this.Utilities + 'utilities/createTransfer';
  public validateSwapSerialNumberUrl = this.Utilities + 'utilities/validateSwapSerialNumber';
  public swapSerialNumberUrl = this.Utilities + 'utilities/swapSerialNumber';
  public getDataElements = this.Utilities + 'utilities/getDataElements';
  public getFilteredDataElementsVal = this.Utilities + 'utilities/getFilteredDataElementsVal';
  public getDetermineSKUsUtilityUrl = this.Utilities + 'utilities/determineSKU';
  public dmProcessAllEigible = this.Utilities + 'utilities/dmProcessAllEigible';
  public dmSaveAll = this.Utilities + 'utilities/dmSaveAll';
  public dmProcessAll = this.Utilities + 'utilities/dmProcessAll';
  public getRemoveDaysToExpire = this.Utilities + 'utilities/getRemoveDaysToExpire';
  public validateSoftwareVersion = this.Utilities + 'utilities/validateSoftwareVersion';
  public validateSku = this.Utilities + 'utilities/validateSku';

  // Utility  Reprint Label
  public getAdhocDocumnet = this.Utilities + 'utilities/GetAdhocDocumnet';
  public getReportDetails = this.Utilities + 'utilities/GetReportDetails';
  public getReportImage = this.Utilities + 'utilities/GetReportImage';
  public printDocument = this.Utilities + 'utilities/PrintDocument';
  public getPrintersForLable = this.Utilities + 'utilities/GetPrintersForLable';


  // RMClientAPI-ReceiptInjection
  public validateRMInboundContainerUrl = this.FQAApiUrl + 'fqa/validateRMInboundContainer';
  public getInboundDetails = this.FQAApiUrl + 'fqa/getInboundDetails';
  public validateRMInboundDevicesUrl = this.FQAApiUrl + 'fqa/validateRMInboundDevices';
  public transferProcess = this.FQAApiUrl + 'fqa/injectionProcess';

  // Audit-setup
  public searchAuditCheckUrl = this.Utilities + 'utilities/searchCheck';
  public saveAuditCheckUrl = this.Utilities + 'utilities/saveAuditCheck';
  public searchAuditPontsUrl = this.Utilities + 'utilities/searchAuditPoints';
  public getActiveChecksUrl = this.Utilities + 'utilities/getActiveChecks';
  public saveAuditCheckPointUrl = this.Utilities + 'utilities/saveAuditCheckPoint';
  public getAuditChecksDetailsUrl = this.Utilities + 'utilities/loadChecksDetailTypes';
  public validateDetailRequiredUrl = this.Utilities + 'utilities/ValidateDetailRequired';

  // Audit-Inspect Screen
  public LoadAduitsUrl = this.Utilities + 'utilities/loadAudits';
  public LoadAduitsChecksUrl = this.Utilities + 'utilities/loadAuditChecks';

  public validateSerialNumberUrl = this.Utilities + 'utilities/ValidateSerialNumber';
  public getAuditQueueDataUrl = this.Utilities + 'utilities/getAuditQueueData';
  public saveAuditResultsrUrl = this.Utilities + 'utilities/SaveAuditResults';
  public validateAuditDetailValueUrl = this.Utilities + 'utilities/ValidateAuditDetailValue';
  public deleteAuditResult = this.Utilities + 'utilities/deleteAuidtResult';

  // Sort GroupSetUp
  public getCatFormulaUrl = this.MaintenanceApiUrl + 'GetCatFormula';
  public addCatFormulaUrl = this.MaintenanceApiUrl + 'AddCatFormula';
  public updateCatFormula = this.MaintenanceApiUrl + 'UpdateCatFormula';
  public getCategoryID = this.MaintenanceApiUrl + 'GetCategoryID';
  public getTrkNbrcat = this.MaintenanceApiUrl + 'GettrkNbrcat';
  public addTrkNbrCat = this.MaintenanceApiUrl + 'AddTrkNbrCat';
  public updateTrkNbrCat = this.MaintenanceApiUrl + 'UpdateTrkNbrCat';
  public getActiveCatHashFormulaUrl = this.MaintenanceApiUrl + 'GetActiveCatHashFormula';
  public getSortGroups = this.MaintenanceApiUrl + 'GetSortGroups';
  public getBoxSizes = this.MaintenanceApiUrl + 'GetBoxSizes';
  public getChannels = this.MaintenanceApiUrl + 'GetChannels';

  // Code List Setup
  public getSysConfigGroups = this.MaintenanceApiUrl + 'GetSysConfigGroups';
  public addSysConfigGroup = this.MaintenanceApiUrl + 'AddSysConfigGroup';
  public getSysConfig = this.MaintenanceApiUrl + 'GetSysConfig';
  public addSysConfig = this.MaintenanceApiUrl + 'AddSysConfig';
  public updateSysConfig = this.MaintenanceApiUrl + 'UpdateSysConfig';
  public deleteSysConfig = this.MaintenanceApiUrl + 'DeleteSysConfig';

  //Operation Setup
  public getDistModules = this.MaintenanceApiUrl + 'GetDistOperationsModule';
  public getOperationbyModule = this.MaintenanceApiUrl + 'GetOperationbyModule';
  public getOperationbyCategory = this.MaintenanceApiUrl + 'GetOperationByCategory';
  public updateOperationByCategory = this.MaintenanceApiUrl + 'UpdateOperationByCategory';
  public addOperation = this.MaintenanceApiUrl + 'AddOperation';
  public getOperation = this.MaintenanceApiUrl + 'GetOperationID';

  // Serial Number or Route Search
  public loadSerialRouteInfo = this.MaintenanceApiUrl + 'LoadSerialRouteInfo';
  public getOperationDeviatedRoutes = this.MaintenanceApiUrl + 'GetOperationDeviatedRoutes';

  // SUPPLEMENTAL TRANSACTION SETUP
  public getSuplTransactionIDS = this.MaintenanceApiUrl + 'GetSuplTransactionIDS';
  public getSupplementalConfigList = this.MaintenanceApiUrl + 'GetSupplementalConfigList';
  public updateSupplementaltTransConfig = this.MaintenanceApiUrl + 'UpdateSupplementaltTransConfig';
  public addSupplementalTransConfig = this.MaintenanceApiUrl + 'AddSupplementalTransConfig';
  public searchSuplTransConfigs = this.MaintenanceApiUrl + 'SearchSuplTransConfigs';

  // DISPOISTION ENGINE CONFIG
  public getDispositions = this.MaintenanceApiUrl + 'getDispositions';
  public getDisposEngineConfigList = this.MaintenanceApiUrl + 'getDispEngineConfigs';
  public getAllAttributeNameList = this.MaintenanceApiUrl + 'GetAttributeNameList';
  public addDisposEngineConfig = this.MaintenanceApiUrl + 'addDispEngineConfig';
  public updateDisposEngineConfig = this.MaintenanceApiUrl + 'updDispEngineConfig';

  // trackingnumbermove
  public validateMoveTrackingNumberUrl = this.Utilities + 'utilities/validateMoveTrackingNumber';
  public validateToContainerUrl = this.Utilities + 'utilities/validateToContainer';
  public moveTrackingNumberUrl = this.Utilities + 'utilities/moveTrackingNumber';

  // Trace Hold Setup
  public getTraceTypes = this.MaintenanceApiUrl + 'tracehold/getTraceTypes';
  public getTraceStatuses = this.MaintenanceApiUrl + 'tracehold/getTraceStatuses';
  public getHoldReasons = this.MaintenanceApiUrl + 'tracehold/getHoldReasons';
  public searchTraceInfo = this.MaintenanceApiUrl + 'tracehold/searchTraceInfo';
  public addTraceInfo = this.MaintenanceApiUrl + 'tracehold/addTraceInfo';
  public updateTraceInfo = this.MaintenanceApiUrl + 'tracehold/updateTraceInfo';
  public validateTraceValue = this.MaintenanceApiUrl + 'tracehold/validateTraceValue';

  //SAP CRITERIA
  public getOperationIDslist = this.MaintenanceApiUrl + 'GetOperationIDslist';
  public getLoadSAPFeildsData = this.MaintenanceApiUrl + 'GetLoadSAPFeildsData';
  public getLoadSAPSearchData = this.MaintenanceApiUrl + 'GetLoadSAPSearchData';
  public getSAPChaneTypeFeildsRule = this.MaintenanceApiUrl + 'GetSAPChangeTypeFeildsRule';
  public addNewSAPCriteria = this.MaintenanceApiUrl + 'AddNewSAPCriteria';
  public addMisedFeildsUpdate = this.MaintenanceApiUrl + 'AddMisedFeildsUpdate';
  public fieldsUpdate = this.MaintenanceApiUrl + 'FieldsUpdate';

  public findTraceHold = this.CommonApiUrl + 'common/findTraceHold';
  public updateTraceNotes = this.CommonApiUrl + 'common/updateTraceNotes';

  public postCommonUpdateProcess = this.CommonApiUrl + 'common/postUpdateProcess';
  public postContainerUpdateProcess = this.CommonApiUrl + 'common/postContainerUpdateProcess';

  // Container Information
  public getContainerInfo = this.Utilities + 'utilities/getContainerInfo';
  public markContainerAsEmpty = this.CommonApiUrl + 'common/MarkContainerAsEmpty';

  //SAP Reason Code Setup
  public getSAPReasonCodeConfig = this.MaintenanceApiUrl + 'GetSAPReasonCodeConfig';
  public getSAPReasonCode = this.MaintenanceApiUrl + 'GetSAPReasonCode';
  public addSAPReason = this.MaintenanceApiUrl + 'AddSAPReason';
  public updateSAPReason = this.MaintenanceApiUrl + 'UpdateSAPReason';

  //Group Setup
  public getGroupConfigTypes = this.MaintenanceApiUrl + 'GetGroupConfigTypes';
  public addGroupType = this.MaintenanceApiUrl + 'AddGroupType';
  public addGroupValue = this.MaintenanceApiUrl + 'AddGroupValue';
  public updateGroupValue = this.MaintenanceApiUrl + 'UpdateGroupValue';
  public deleteGroupValue = this.MaintenanceApiUrl + 'DeleteGroupValue';
  public getAttributeValue = this.MaintenanceApiUrl + 'GetAttributeValue';
  public getGroupIDsbyTypes = this.MaintenanceApiUrl + 'GetGroupIDsbyTypes';
  public getGroupValuesByType = this.MaintenanceApiUrl + 'GetGroupValuesByType';


  // location setup
  public getLocation = this.MaintenanceApiUrl + 'getLocation';
  public addLocation = this.MaintenanceApiUrl + 'addLocation';
  public updateLocation = this.MaintenanceApiUrl + 'updateLocation';
  public getParentLocations = this.MaintenanceApiUrl + 'GetParentLocations';
  public validateInvData = this.MaintenanceApiUrl + 'validateInvData';
  public getSectionKeys = this.MaintenanceApiUrl + 'getSectionKeys';
  public getMoveTrackingReasonValues = this.MaintenanceApiUrl + 'GetMoveTrackingReasonValues';

  // GENERIC RELEASE
  public getReleaseTypes = this.Utilities + 'utilities/getReleaseTypes';
  public getReleaseType = this.Utilities + 'utilities/getReleaseType';
  public getReleaseOptions = this.Utilities + 'utilities/getReleaseOptions';
  public dinamicURL = this.Utilities + 'utilities';
  public checkContainerModeEligibilityUrl = this.Utilities + 'utilities/checkContainerModeEligibility';
  public saveAllReleasedDevicesUrl = this.Utilities + 'utilities/saveAllReleasedDevices';
  public checkContainerDeviceHold = this.Utilities + 'utilities/CheckContainerDeviceHold';


  // Manual over ride
  chkContRouteOverrideEligibilityUrl = this.Utilities + 'utilities/ChkContRouteOverrideEligibility';
  getEligibleRouteInfoUrl = this.Utilities + 'utilities/getEligibleRouteInfo';
  processManualRouteOverrideUrl = this.Utilities + 'utilities/processManualRouteOverride';

  // inventory move
  public getReasonCodesUrl = this.CommonApiUrl + 'common/getReasonCodes';
  public getTranscationsForContainerUrl = this.CommonApiUrl + 'common/getTranscationsForContainer';
  public saveServiceTransactionUrl = this.CommonApiUrl + 'common/saveServiceTransaction';
  // container Transcation
  public getContainerTransactions = this.Utilities + 'utilities/getContainerTransactions';
  public checkContainerTransaction = this.Utilities + 'utilities/checkContainerTransaction';
  public recordContainerTransaction = this.Utilities + 'utilities/recordContainerTransaction';
  // route -setup
  public getEligibleRoutes = this.MaintenanceApiUrl + 'GetEligibleRoutes';
  public getRouteList = this.MaintenanceApiUrl + 'GetRouteList';
  public AddRoute = this.MaintenanceApiUrl + 'AddRoute';
  public UpdateRoute = this.MaintenanceApiUrl + 'UpdateRoute';
  public generateRouteID = this.MaintenanceApiUrl + 'GenereateRouteID';
  public getAQLTypesList = this.MaintenanceApiUrl + 'GetAQLTypesList';
  // sampling
  public getResultRoutes = this.MaintenanceApiUrl + 'GetResultRoutes';
  public getOEMModelList = this.MaintenanceApiUrl + 'GetOEMModelList';
  public getSamplingMatrixList = this.MaintenanceApiUrl + 'GetSamplingMatrixList';
  public addSamplingMatrix = this.MaintenanceApiUrl + 'AddSamplingMatrix';
  public updateSamplingMatrix = this.MaintenanceApiUrl + 'UpdateSamplingMatrix';
  public getSamplingConfigList = this.MaintenanceApiUrl + 'GetSamplingConfigList';
  public addSamplingConfig = this.MaintenanceApiUrl + 'AddSamplingConfig';
  public updateSamplingConfig = this.MaintenanceApiUrl + 'UpdateSamplingConfig';
  public getSamplingRulesList = this.MaintenanceApiUrl + 'GetSamplingRulesList';
  public getSamplingRuleIDsList = this.MaintenanceApiUrl + 'GetSamplingRuleIDsList';
  public validRangeForSamplingMatrix = this.MaintenanceApiUrl + 'IsValidRangeForSamplingMatrix';
  // attribute-route setup
  public getAttributeNames = this.MaintenanceApiUrl + 'GetAttributeNames';
  public getAttributeControlNValue = this.MaintenanceApiUrl + 'GetAttributeControleNValue';
  public getOperatorsByAttributeType = this.MaintenanceApiUrl + 'maintUtility/GetOperatorsByAttributeType';
  public getRouteEligibleOpearationsList = this.MaintenanceApiUrl + 'GetRouteEligibleOpearationsList';
  public getAttributeRouteList = this.MaintenanceApiUrl + 'GetAttributeRouteList';
  public validateAttributeRouteRule = this.MaintenanceApiUrl + 'maintUtility/validateRule';
  public AddUpdateAttributeRule = this.MaintenanceApiUrl + 'AddUpdateAttributeRule';
  public getAttributeRouteLogicalOperators = this.MaintenanceApiUrl + 'maintUtility/getLogicalOperators';
  public getAttributeRouteOperators = this.MaintenanceApiUrl + 'maintUtility/getOperators';

  // attribute-setup
  public loadControlData = this.MaintenanceApiUrl + 'loadControlData';
  public getAttributeList = this.MaintenanceApiUrl + 'GetAttributeList';
  public addAttribute = this.MaintenanceApiUrl + 'AddAttribute';
  public updateAttribute = this.MaintenanceApiUrl + 'UpdateAttribute';
  public generateAttributeID = this.MaintenanceApiUrl + 'GenerateAttributeID';
  public getProgramNames = this.MaintenanceApiUrl + 'GetProgramNameList';

  // model master
  public getModelMasterListUrl = this.MaintenanceApiUrl + 'GetModelMasterList';
  public getModelMasterUrl = this.MaintenanceApiUrl + 'GetModelMaster';
  public addModelMasterUrl = this.MaintenanceApiUrl + 'AddModelMaster';
  public updateModelMasterUrl = this.MaintenanceApiUrl + 'UpdateModelMaster';
  public getOEMCodeUrl = this.MaintenanceApiUrl + 'getOEMCode';
  public getModelMasterFieldsUrl = this.MaintenanceApiUrl + 'GetModelMasterFields';
  public getTypeCodeUrl = this.MaintenanceApiUrl + 'GetTypeCode';

  // Trusted Vendor
  public getDispositionsListUrl = this.MaintenanceApiUrl + 'GetDispositionsList';
  public getReceiptTypesUrl = this.MaintenanceApiUrl + 'GetReceiptTypes';
  public getVendorCIStatesListUrl = this.MaintenanceApiUrl + 'GetVendorCIStatesList';
  public getVendorsListUrl = this.MaintenanceApiUrl + 'GetVendorsList';
  public addVendorCIStatesConfigUrl = this.MaintenanceApiUrl + 'AddVendorCIStatesConfig';
  public updateVendorCIStatesConfigUrl = this.MaintenanceApiUrl + 'UpdateVendorCIStatesConfig';
  public deleteVendorCIStatesConfigUrl = this.MaintenanceApiUrl + 'DeleteVendorCIStatesConfig';

  // Program Criteria Setup
  public getAttributeMasterList_Filtered = this.MaintenanceApiUrl + 'GetAttributeMasterList_Filtered';
  public getRankList = this.MaintenanceApiUrl + 'GetRankList';
  public getOperationList = this.MaintenanceApiUrl + 'GetOpearationList'; // Note Route is misspelled in API
  public getProgramRuleList = this.MaintenanceApiUrl + 'GetProgramRuleList';
  public getProgramNameList = this.MaintenanceApiUrl + 'GetProgramNameList';
  public getProgramGroupList = this.MaintenanceApiUrl + 'GetProgramGroupList';
  public saveProgramRule = this.MaintenanceApiUrl + 'SaveProgramRule';
  public getMaxProgramRuleRank = this.MaintenanceApiUrl + 'GetMaxProgramRuleRank';
  public saveProgramNameOrGroup = this.MaintenanceApiUrl + 'SaveProgramNameOrGroup';

  // Route Simulator
  public routeSimulator_GetRoute = this.MaintenanceApiUrl + 'RouteSimulator_GetRoute';
  public getResultRoutes_Filtered = this.MaintenanceApiUrl + 'GetResultRoutes_Filtered';
  public get_DefaultStep = this.MaintenanceApiUrl + 'Get_DefaultStep';

  //Auto Fail
  public getGetOEMcodesUrl = this.MaintenanceApiUrl + 'GetOEMcodes';
  public getGetOEMModelsUrl = this.MaintenanceApiUrl + 'GetOEMModels';
  public getTriggerLevelsUrl = this.MaintenanceApiUrl + 'loadControlData/TRIGGERLEVELS';
  public getLoadIvcCodesUrl = this.MaintenanceApiUrl + 'loadIVCCodes';
  public getTriggerAttrUrl = this.MaintenanceApiUrl + 'GetTriggerAttributes';
  public getTransIdUrl = this.MaintenanceApiUrl + 'GetAutoFailTrasid';
  public getLoadIVCCategory = this.MaintenanceApiUrl + 'LoadIVCCategory';
  public getAutoFailList = this.MaintenanceApiUrl + 'GetAutoFailRecords';
  public addOrUpdateAutoFail = this.MaintenanceApiUrl + 'SaveSNAutoFail';

  //  Call Processing Config
 public getCallprocessingConfig = this.MaintenanceApiUrl + 'GetCallprocessingConfig';
 public getProcessnames = this.MaintenanceApiUrl + 'GetProcessnames';
 public getAddCallprocessingConfig = this.MaintenanceApiUrl + 'AddCallprocessingConfig';
 public getUpdateCallprocessingConfig = this.MaintenanceApiUrl + 'UpdateCallprocessingConfig';

  // Aql By Pass
  public getReceiptList = this.Utilities + 'utilities/SearchReceipt';
  public getAqlTypes = this.Utilities + 'utilities/AQLTypes';
  public saveAqlBypassUrl = this.Utilities + 'utilities/ByPassAQLProcess';

  // FILE Import
  public importFileData = this.Utilities + 'utilities/ImportFileData';
  public exportFileData = this.Utilities + 'utilities/ExportFileData';
  public getUploadFileNames = this.Utilities + 'utilities/GetUploadFileNames';

  // Label Reprint Config
  public getAdhocLabelConfigs = this.Utilities + 'utilities/getAdhocLabelConfigs';
  public getDockTypesList = this.Utilities + 'utilities/GetDockTypesList';
  public getDockFormatList = this.Utilities + 'utilities/GetDockFormatList';
  public getPrinterTypesList = this.Utilities + 'utilities/getPrinterTypesList';
  public getCategoryList = this.Utilities + 'utilities/GetCategoryList';
  public getTriggerList = this.Utilities + 'utilities/GetTriggerList';
  public validateQuery = this.Utilities + 'utilities/ValidateQuery';
  public insertAdhocLabelConfig = this.Utilities + 'utilities/insertAdhocLabelConfig';
  public updateAdhocLabelConfig = this.Utilities + 'utilities/updateAdhocLabelConfig';
  public deleteAdhocLabelConfig = this.Utilities + 'utilities/deleteAdhocLabelConfig';
  public getRoles = this.Utilities + 'utilities/GetRoles';

  // lable Print URLS
  public getAdhocLabelNames = this.Utilities + 'utilities/getAdhocLabelNames';
  public getAdhocPrinterConfigs = this.Utilities + 'utilities/getAdhocPrinterConfigs';
  public insertAdhocPrinterConfig = this.Utilities + 'utilities/insertAdhocPrinterConfig';
  public updateAdhocPrinterConfig = this.Utilities + 'utilities/updateAdhocPrinterConfig';
  public deleteAdhocPrinterConfig = this.Utilities + 'utilities/deleteAdhocPrinterConfig';

  // Container Management
  //#region category type
  public getContainerCategoryTypesUrl = this.Utilities + 'utilities/getContainerCategoryTypes';
  public insertContainerCategoryTypeUrl = this.Utilities + 'utilities/insertContainerCategoryType';
  public updateContainerCategoryTypeUrl = this.Utilities + 'utilities/updateContainerCategoryType';
  //#endregion category type

  //#region category rule
  public getContainerCategoryRulesUrl = this.Utilities + 'utilities/getContainerCategoryRules';
  public insertContainerCategoryRuleUrl = this.Utilities + 'utilities/insertContainerCategoryRule';
  public updateContainerCategoryRuleUrl = this.Utilities + 'utilities/updateContainerCategoryRule';
  public getCategoryTypesUrl = this.Utilities + 'utilities/getCategoryTypes';
  //#endregion category type

  //#region container header
  public getContainerTypesUrl = this.Utilities + 'utilities/getContainerTypes';
  public getContainerIdUrl = this.Utilities + 'utilities/getContainerId';
  public generateContainersUrl = this.Utilities + 'utilities/generateContainers';
  public getContainerCategoryNamesUrl = this.Utilities + 'utilities/getContainerCategoryNames';
  public convertToParentContainerUrl = this.Utilities + 'utilities/convertToParentContainer';
  //#endregion container header

  // capture IMEI
  insertESNMasterSN = this.Utilities + 'utilities/insertESNMasterSN';

  // Carrier
  public getCarriersUrl = this.Utilities + 'utilities/getCarriers';
  public insertCarrierUrl = this.Utilities + 'utilities/insertCarrier';
  public updateCarrierUrl = this.Utilities + 'utilities/updateCarrier';

  // shred Screen
  public getGaylordId = this.FQAApiUrl + 'fqa/GetGayLordId';
  public createGayLordId = this.FQAApiUrl + 'fqa/CreateGayLordId';
  public closeGayLordId = this.FQAApiUrl + 'fqa/CloseGayLordId';
  public validateShredSerialNumber = this.FQAApiUrl + 'fqa/validateShredSerialNumber';
  public shredProcess = this.FQAApiUrl + 'fqa/shredProcess';

  // move batch failed serialnumbers
  public getAQLFailedDevices = this.TestingApiUrl + 'testing/getAQLFailedDevices';
  public closeSamplingBatch = this.TestingApiUrl + 'testing/closeSamplingBatch';

  // Vendor-setup
  public getVendors = this.Utilities + 'utilities/getVendors';
  public insertVendor = this.Utilities + 'utilities/insertVendor';
  public updateVendor = this.Utilities + 'utilities/updateVendor';

  // Utility - API Log Viewer
  public getRxApiTestResults = this.Utilities + 'utilities/GetRxApiTestResults';
  public getParserList = this.Utilities + 'utilities/GetParserList';

  // wmx to rmx
  public validateTransferSerialnumbersUrl = this.Utilities + 'utilities/ValidateTransferSerialnumbers';
  public validateTransferSerialnumberUrl = this.Utilities + 'utilities/ValidateTransferSerialnumber';
  public getTransferedDetailsUrl = this.Utilities + 'utilities/getTransferedDetails';
  public transferUrl = this.Utilities + 'utilities/Transfer';
  public getUpdatedDeviceSnap = this.Utilities + 'utilities/GetSelectedDeviceSnap';
  public rollbackContainerDevicesUrl = this.Utilities + 'utilities/RollbackContainerDevices';
  public rollbackSerialNumberUrl = this.Utilities + 'utilities/rollbackSerialNumber';
  public getTransferedDetailUrl = this.Utilities + 'utilities/getTransferedDetail';
  public getProcessUrl = this.Utilities + 'utilities/process';
  public validateInboundContainerUtilityUrl = this.Utilities + 'utilities/validateInboundContainer';

  // Sku Transfer
  public validateSkuTransferSerialnumbersUrl = this.Utilities + 'utilities/validateSkuTransferSerialnumbers';
  public validateSkuTransferSerialnumberUrl = this.Utilities + 'utilities/validateSkuTransferSerialnumber';
  public getEligibleSKUsUtlUrl = this.Utilities + 'utilities/getEligibleSKUs';
  public rollbackSKUContainerDevicesUrl = this.Utilities + 'utilities/RollbackSKUContainerDevices';
  public rollbackSkuSerialNumberUrl = this.Utilities + 'utilities/rollbackSkuSerialNumber';
  public transferSKUUrl = this.Utilities + 'utilities/TransferSKU';
  public processWTUrl = this.Utilities + 'utilities/processWT';

  // vendor transfer
  public getVendorTransferTypes = this.FQAApiUrl + 'fqa/getVendorTransferTypes';
  public getTransTypeVendors = this.FQAApiUrl + 'fqa/getTransTypeVendors';
  public createVendorTransferBatchId = this.FQAApiUrl + 'fqa/createVendorTransferBatchId';
  public getTransferTypeConfig = this.FQAApiUrl + 'fqa/getTransferTypeConfig';
  public getCMBatchInfo = this.FQAApiUrl + 'fqa/getCMBatchInfo';
  public getCMBatchSerialNumbers = this.FQAApiUrl + 'fqa/getCMBatchSerialNumbers';
  public addContainerToBatch = this.FQAApiUrl + 'fqa/addContainerToBatch';
  public removeContainerFromBatch = this.FQAApiUrl + 'fqa/removeContainerFromBatch';
  public processCMBatch = this.FQAApiUrl + 'fqa/processCMBatch';
  public getCMBatchContainers = this.FQAApiUrl + 'fqa/getCMBatchContainers';
  public getCMBatchInfoByContainer = this.FQAApiUrl + 'fqa/getCMBatchInfoByContainer';

  // jit hold removal
  public getJITReplnInvs = this.Utilities + 'utilities/getJITReplnInvs';
  public validateJITHoldToLoc = this.Utilities + 'utilities/validateJITHoldToLoc';
  public validateJITHoldContainer = this.Utilities + 'utilities/validateJITHoldContainer';
  public removeFromJITHold = this.Utilities + 'utilities/removeFromJITHold';

  // survey
  public getSurveyUrl = this.CommonApiUrl + 'common/survey/getSurvey';
  public getRefreshedSurveyUrl = this.CommonApiUrl + 'common/survey/GetRefreshedSurvey';
  public submitSurveyUrl = this.CommonApiUrl + 'common/survey/submitSurvey';
  public getReSurveyUrl = this.CommonApiUrl + 'common/survey/getReSurvey';
  public manualProcessSurveyUrl = this.CommonApiUrl + 'common/survey/manualProcessSurvey';
  public saveSurveySerialNumberTestResultUrl = this.CommonApiUrl + 'common/survey/saveSerialNumberTestResult';

  // image capture
  public getDocTrkImagesUrl = this.Utilities + 'utilities/GetDocTrkImages';
  public getNumberofImagestoCaptureUrl = this.Utilities + 'utilities/GetNumberofImagestoCapture';
  public uploadCapImagesUrl = this.Utilities + 'utilities/UploadCapImages';
  public getImgCapDisqualifyReasonUrl = this.Utilities + 'utilities/GetImgCapDisqualifyReason';
  public donotRejectUrl = this.Utilities + 'utilities/DonotReject';

  // IVC code setup
  public getIVCCodeFieldslUrl = this.MaintenanceApiUrl + 'GetIVCCodeFields';
  public getIVCCodeListUrl = this.MaintenanceApiUrl + 'GetIVCCodeList';
  public getIVCCodeUrl = this.MaintenanceApiUrl + 'GetIVCCode';
  public updateIVCCodeUrl = this.MaintenanceApiUrl + 'UpdateIVCCode';
  public addIVCCodeUrl = this.MaintenanceApiUrl + 'AddIVCCode';

  // sku attribute
  public getSKUList = this.MaintenanceApiUrl + 'GetSKUList';
  public getSkuAttrs = this.MaintenanceApiUrl + 'GetSkuAttrs';
  public updateSkuAttrs = this.MaintenanceApiUrl + 'UpdateSkuAttrs';
  public addSkuAttrs = this.MaintenanceApiUrl + 'AddSkuAttrs';
  public getJSONTagList = this.MaintenanceApiUrl + 'GetJSONTagList';

  // RMX to RM
  public getRMXRMMode = this.FQAApiUrl + 'fqa/getRMXRMMode';
  public validateRMxRMSerialNumbers = this.FQAApiUrl + 'fqa/validateRMxRMSerialNumbers';
  public validateRMXRMTransferContainer = this.FQAApiUrl + 'fqa/validateRMXRMTransferContainer';
  public RMXRMProcess = this.FQAApiUrl + 'fqa/RMXRMProcess';

  public validateAccessoryContainerUrl = this.FQAApiUrl + 'fqa/validateAccessoryContainer';
  public validateAccessoryCaseCountUrl = this.FQAApiUrl + 'fqa/validateAccessoryCaseCount';
  public processAccessoryUrl = this.FQAApiUrl + 'fqa/processAccessory';

  public getRoleCapabilitiesUrl = this.CommonApiUrl + 'common/getRoleCapabilities';

  // Harvest
  public getHarvestEligiblePartsUrl = this.TestingApiUrl + 'testing/getHarvestEligibleParts';
  public importAccessoryReceiptUrl = this.receivingApiUrl + 'importAccessoryReceipt';
  public saveAccessoryDetailsUrl = this.receivingApiUrl + 'saveAccessoryDetails';


  //Device Catalog
  public saveDeviceCatalogUrl = this.MaintenanceApiUrl + 'SaveDeviceCatalog';
  public getDeviceCatalogRecordsUrl = this.MaintenanceApiUrl + 'GetDeviceCatalogRecords';

  //Sku Determination
  public GetDeviceCatXrefDataUrl = this.MaintenanceApiUrl + 'GetDeviceCatXrefData';
  public GetItemIdsRefUrl = this.MaintenanceApiUrl + 'loadItemIds';
  public deleteDeviceCatXrefDataUrl = this.MaintenanceApiUrl + 'deleteDeviceCatXrefData';
  public saveDeviceCatXrefRecordUrl = this.MaintenanceApiUrl + 'saveDeviceCatXrefRecord';

  //Automation Service For JR Dashboard
  public getLocationByCntDtls = this.AutomationApiUrl + 'GetLocationByCntDtls';
  public getParentLocationByCntDtls = this.AutomationApiUrl + 'GetParentLocationByCntDtls';


}

