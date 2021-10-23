export class SerialNumberPathHistory {
    SEQID = 0;
    SERIALNUMBER: string;
    CYCLE_NUM = 0;
    STEP: string;
    ROUTE: string;
    LOC: string;
    SKU: string;
    WARRANTY_CD: string;
    IVCCODE: string;
    CONTAINERID: string;
    CONTAINER_CYCLE = 0;
    ADDWHO: string;
    EDITWHO: string;
    ROUTE_DETAIL: string;
    FUNCTION_CD: string;
    DISPOSITION: string;
    GRADE: string;
    KS_INDICATOR: string;
    SITEID: string;
    ADDDATE: string;
    EDITDATE: string;
    CLIENTID: string;
    ATTR_ROUTE_SEQID: string;
    ROUTE_RULE: string;
}

export class SerialNumber {
    SERIALNUMBER: string;
    CYCLE_NUM = 0;
    STEP: string;
    ROUTE: string;
    LOC: string;
    OEM_CD: string;
    MODEL: string;
    SKU: string;
    RECEIPTKEY: string;
    RECEIPTLINENUMBER: string;
    WARRANTY_START_DT: string;
    WARRANTY_CD: string;
    IVCCODE: string;
    CONTAINERID: string;
    CONTAINER_CYCLE = 0;
    DISPOSITION: string;
    CONDITION_CD: string;
    PROGRAM_NAME: string;
    MSN: string;
    ADDWHO: string;
    EDITWHO: string;
    GRADE: string;
    KS_INDICATOR: string;
    FUNCTION_CD: string;
    WIP_LOC: string;
    AUTO_PROCESSING: string;
    BATCHID: string;
    EXPECTED: string;
    NEXTSTEP: string;
    SITEID: string;
    ADDDATE: string;
    EDITDATE: string;
    ORIGINATION: string;
    HOLDFLG: string;
    HOLDREASONCD: string;
    COSMETIC_CD: string;
    RECEIVEDSKU: string;
    WAREHOUSETRANSFER_TS: string;
    CLIENTID: string;
    COMMENTS: string;
    RECEIVING_CHANNEL: string;
    WT_TS: string;
}

export class RoutesOperationCodes {
    RouteId: string;
    ID: string;
    TEXT: string;
    Rank = 0;
}

export class SerialRouteWithOperation {
    ROUTEID: string;
    ROUTE: string;
    ACTIVE: string;
    ADDWHO: string;
    EDITWHO: string;
    SITEID: string;
    ADDDATE: string;
    EDITDATE: string;
    CLIENTID: string;
    DESCRIPTION: string;
    OperationCodes: RoutesOperationCodes[];
    ROUTETYPE: string;
    ELIGIBLE_ROLES: string;
}

export class OperationDeviatedRoutes {
    SEQID = 0;
    ACTIVE: string;
    OPERATIONID: string;
    RULE: string;
    RESULT_ROUTE: string;
    RANK = 0;
    ADDWHO: string;
    EDITWHO: string;
    SITEID: string;
    ADDDATE: string;
    EDITDATE: string;
    CLIENTID: string;
    REVIEWED: string;
    EXPRESSION: string;
    rX_ROUTE: SerialRouteWithOperation;
}