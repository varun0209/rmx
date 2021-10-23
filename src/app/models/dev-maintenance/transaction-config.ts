export class Rule {
    RuleSetUp: string;
}

export class TransactionConfig {
    ClientId: string;
    OperationId: string;
    TransDesc: string;
    TransCodeDesc: string;
    TestType: string;
    TransCdRank: string;
    NextTransCrt: string;
    Formula: string;
    TransId: string;
    TransCodeValue: string;
    AddWho: string;
    ControlIDs: Array<ControlAttr>;
}

export class ControlAttr {
    ControlId: string;
    Rank: number;
    ParentControlId:string;
    ParentValue:string;
    Type:string;
    Values:  Array<any>;
}

export class FormulaObj {
    appendWith = '';
    formula = '';
    add = true
}