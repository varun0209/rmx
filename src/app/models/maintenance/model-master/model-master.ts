export class RxModel {
  MODEL: string;
  OEM_CD: string;
  ACTIVE: string;
  WARRANTY_PERIOD: number;
  WARRANTY_OFFSET: number;
  CONTAINER_CAPACITY: number;
  INTERNAL_BATTERY: string;
  CLIENT_MODEL: string;
  PARSER_ELIGIBILITY: string;
  KILL_SWITCH_FLAG: string;
  ADDWHO: string;
  EDITWHO: string;
  AUTO_REPRINT_LABEL: string;
  SECOND_CI_FLAG: string;
  SITEID: string;
  ADDDATE: string;
  EDITDATE: string;
  CONSTRAINEDYN: string;
  CLIENTID: string;
  MSN_ENABLED: string;
  FLASH_ELIGIBILE: string;
  DATAR_ELIGIBLE: string;
  FACTORY_RESET_ELIGIBLE: string;
  FUNCTION_TEST_ELIGIBLE: string;
  LAUNCH_DATE: string = null;
  OS_TYPE: string;
  TIER: string;
  OBSOLETE_FLAG: string;
  MODEL_CLASS: string;
  MARKET_MODEL: string;
  PARENT_MODEL: string;
  ENDOFLIFE_IND: string;
  AUTOMATED_CLEANING:string;
  AUTOMATED_GRADING:string;
  AUTOMATED_PREPROC:string;
  AUTOMATED_POSTPROC:string;
  AUTOMATED_TESTING:string;
  RECEIPT_SORT_GROUP:string;
  AUTOMATED_FLOW_CAPABLE:string;
  rX_MODEL_ATTRIBUTEs: RxModelAttributes[];
  rX_SOFTWARE_VERSIONs: RxSoftwareVersions[];
}

export class RxModelAttributes {
  SEQID: number;
  MODEL: string;
  TYPE_CD: string;
  ACTIVE: string;
  CRITERIA1: string = null;
  CRITERIA2: string = null;
  CRITERIA3: string = null;
  CRITERIA4: string = null;
  CRITERIA5: string = null;
  CRITERIA6: string = null;
  CRITERIA7: string = null;
  CRITERIA8: string = null;
  CRITERIA9: string = null;
  CRITERIA10: string = null;
  VALUE1: string = null;
  VALUE2: string = null;
  VALUE3: string = null;
  VALUE4: string = null;
  VALUE5: string = null;
  ADDWHO: string;
  EDITWHO: string;
  SITEID: string;
  ADDDATE: string;
  EDITDATE: string;
  CLIENTID: string;
  OEM_CD: string;
}

export class RxSoftwareVersions {
  SEQID: number;
  SITEID: string;
  OEM_CD: string;
  OEM_MODEL: string;
  SOFTWARE_VERSION: string;
  START_DT: string = null;
  END_DT: string = null;
  LATEST_SOFTWARE: string = null;
  ADDDATE: string;
  ADDWHO: string;
  EDITDATE: string;
  EDITWHO: string;
  CLIENTID: string;
}

export class MasterDropdown {
  Key: string;
  Value: string;
}

export class ModelSearchObj {
  MODEL: string;
  OEM_CD: string;
}
