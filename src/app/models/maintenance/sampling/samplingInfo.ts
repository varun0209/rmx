export class SamplingRule {
    SEQID: number = null;
    SITEID: string;
    CLIENTID: string;
    RULEID: string;
    RULEDESCRIPTION: string;
    ACTIVE = 'Y';
    ADDTS: string;
    ADDWHO: string;
    EDITTS: string;
    EDITWHO: string;
    IsModify = false;
    SamplingMatrixs: Array<any> = [] = [];
}

export class SamplingConfig {
    SEQID: number = null;
    SITEID: string;
    CLIENTID: string;
    RULEID: string;
    ROUTEID: string;
    OPERATIONID: string;
    VENDOR: string;
    OEMMODEL: string;
    ACTIVE = 'Y';
    ADDTS: string;
    ADDWHO: string;
    EDITTS: string;
    EDITWHO: string;
    ISMODIFY = false;
}

export class SamplingMatrix {
    SEQID: number = null;
    SITEID: string;
    CLIENTID: string;
    RULEID: string;
    LOTSIZEMIN: number;
    LOTSIZEMAX: number;
    REGULARSAMPLESIZE: number;
    REGULARACCEPTQTY: number;
    REGULARREJECTQTY: number;
    REGULARPERCENTAGEYN = 'Y';
    TIGHTENEDSAMPLESIZE: number;
    TIGHTENEDACCEPTQTY: number;
    TIGHTENEDREJECTQTY: number;
    TIGHTENEDPERCENTAGEYN = 'Y';
    ACTIVE = 'Y';
    ADDTS: string;
    ADDWHO: string;
    EDITTS: string;
    EDITWHO: string;
    IsModify = false;
    RX_SAMPLING_RULE: string;
}