export class OperationByModule {
    OPERATIONID: string;
    DESCRIPTION: string;
    CATEGORY: string;
    ACTIVE: string;
    ROUTE_ELIGIBLE: string;
    APPENABLED: string;
    FORCEMOVEELIGIBLE: string;
    ISPARSEREXISTS: string;
    ISSURVERYEXISTS: string;
    MODULE: string;
}

export class OperationData {
    OPERATIONID: string;
    OPERATIONNAME: string;
    DESCRIPTION: string;
    ACTIVE: string;
    MODULE: string;
    CATEGORY: string;
    ADDWHO: string;
    EDITWHO: string;
    FORCEMOVEELIGIBLE: string;
    SITEID: string;
    ROUTE: string;
    PARENTNAME: string;
    ADDDATE: string;
    EDITDATE: string;
    RANK: string;
    ORIGINATION: string;
    MAXCONTAINERS: string;
    APPENABLED: string;
    CLIENTID: string;
    OperationConfigs: OperationConfigs;
    ParserHeader: ParserHeader;
    IsParserExists: string;
    IsSurveryExists: string;
    IsModify = false;
}

export class OperationConfigs {

    SITEID: string;
    OPERATIONID: string;
    CATEGORY: string;
    FORCEMOVEELIGIBLE: string;
    ROUTE: string;
    PARENTNAME: string;
    RANK: string;
    MAXCONTAINERS: string;
    APPENABLED: string;
    ACTIVE: string;
    EDITWHO: string;
    EDITTS: string;
    ADDWHO: string;
    ADDTS: string;
    CLIENTID: string;
    ROUTE_ELIGIBLE: string;
    IsModify = false;
}

export class ParserHeader {
    SEQID = 0;
    PARSER: string;
    DESCRIPTION: string;
    TYPE: string;
    ADDDATE: string;
    ADDWHO: string;
    EDITDATE: string;
    EDITWHO: string;
    AUTO_PROCESS: string;
    SITEID: string;
    CLIENTID: string;
    PARSER_GROUP: string;
    RX_PARSER_DETAILs: ParserDetail[];
    IsModify = false;
}

export class ParserDetail {
    SEQID = 0;
    PARSER = '';
    PARSER_DETAIL  = '';
    ADDWHO = '';
    EDITWHO = '';
    SITEID = '';
    ADDDATE = '';
    EDITDATE = '';
    CLIENTID = '';
    FILE_FORMAT = '';
    ELEMENT_DETAILS = '';
    PARSER_TYPE = '';
    RX_PARSER_SERVICE_CONFIGs: ParserServiceConfig;
    IsModify = false;
}

export class ParserServiceConfig {
    SEQID = 0;
    PARSER: string;
    FILE_DIR: string;
    ARCHIVE_DIR: string;
    FILE_FORMAT: string;
    POLL_INTERVAL: string;
    ACTIVE: string;
    ADDWHO: string;
    EDITWHO: string;
    SITEID: string;
    ADDDATE: string;
    EDITDATE: string;
    CLIENTID: string;
    PARSER_TYPE = '';
    IsModify = false;
}

export class OperationJsonData {
    key: string;
    value: string;
    IsEditing = false;
    original_value: string;
  }
