export class SAPSearchObj {
    OPERATIONID: string;
    SAPCHANGELEVEL: string;
    SAPCHANGETYPE: string;
  }
export class SapChangeTypeData{
  SAP_CHANGE_TYPE: string;
}
  export class SapTransCriteria{
    ACTIVE: string;
    OPERATIONID: string;
    RULE: string;
    SAP_CHANGE_TYPE: string;
    FROM_LOC: string;
    TO_LOC: string;
    ADDWHO: string;
    EDITWHO: string;
    SITEID: string;
    ADDDATE: string;
    EDITDATE: string;
    CLIENTID: string;
    CHANGE_LEVEL: string;
    RULE_RANK: number;
  }

  export class SapChangeTypeKeyvalue{
    KEY: string;
    VALUE: string;
    FieldDisabled = false;
  }
  export class SapChangeTypeMissedKeyvalue{
    KEY: string;
    VALUE: string;
  }

  export class SapMissedFields {
    Fields: SapChangeTypeMissedKeyvalue[] = []
  }
  export class SapFields {
    Fields: SapChangeTypeKeyvalue[] = []
  }

  export class SapChangeTypeFields{
    OPERATION: string;
    KEY1: string;
    KEY2: string;
    KEY3: string;
    SKU_FROM: string;
    SKU_TO: string;
    ESN_CYCLE_FROM: string;
    ESN_CYCLE_TO: string;
    SAP_CHANGE_TYPE: string;
    SAP_ESN_FROM: string;
    SAP_ESN_TO: string;
    SAP_ARTICLE_FROM: string;
    SAP_ARTICLE_TO: string;
    SAP_DISP_FROM: string;
    SAP_DISP_TO: string;
    SAP_STATUS_FROM: string;
    SAP_STATUS_TO: string;
    SAP_LOC_FROM: string;
    SAP_LOC_TO: string;
    SAP_REASON_CODE_FROM: string;
    SAP_REASON_CODE_TO: string;
    SAP_COMMENTS_FROM: string;
    SAP_COMMENTS_TO: string;
    SECTIONKEY_FROM: string;
    SECTIONKEY_TO: string;
    VALUE_FROM: string;
    VALUE_TO: string;
    WKSTN: string;
    REFERENCEKEY: string;
    REFCHAR1: string;
    REFCHAR2: string;
    REFCHAR3: string;
    TRANSMIT_STATUS: string;
    SAP_SITE_FROM: string;
    SAP_QTY: string;
    SAP_SITE_TO: string;
  }
  export class NewSapCriteriaData{
    ACTIVE: string;
    OPERATIONID: string;
    RULE: string;
    SAP_CHANGE_TYPE: string;
    FROM_LOC: string;
    TO_LOC: string;
    ADDWHO: string;
    EDITWHO: string;
    SITEID: string;
    ADDDATE: string;
    EDITDATE: string;
    CLIENTID: string;
    CHANGE_LEVEL: string;
    RULE_RANK: number;  
  }
  export class NewSapCriteriaFeildsData{
    OPERATION: string;
    KEY1: string;
    KEY2: string;
    KEY3: string;
    SKU_FROM: string;
    SKU_TO: string;
    ESN_CYCLE_FROM: string;
    ESN_CYCLE_TO: string;
    SAP_CHANGE_TYPE: string;
    SAP_ESN_FROM: string;
    SAP_ESN_TO: string;
    SAP_ARTICLE_FROM: string;
    SAP_ARTICLE_TO: string;
    SAP_DISP_FROM: string;
    SAP_DISP_TO: string;
    SAP_STATUS_FROM: string;
    SAP_STATUS_TO: string;
    SAP_LOC_FROM: string;
    SAP_LOC_TO: string;
    SAP_REASON_CODE_FROM: string;
    SAP_REASON_CODE_TO: string;
    SAP_COMMENTS_FROM: string;
    SAP_COMMENTS_TO: string;
    SECTIONKEY_FROM: string;
    SECTIONKEY_TO: string;
    VALUE_FROM: string;
    VALUE_TO: string;
    WKSTN: string;
    REFERENCEKEY: string;
    REFCHAR1: string;
    REFCHAR2: string;
    REFCHAR3: string;
    TRANSMIT_STATUS: string;
    SAP_SITE_FROM: string;
    SAP_QTY: string;
    SAP_SITE_TO: string;
  }
    
        