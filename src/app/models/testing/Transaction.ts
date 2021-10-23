export class Transaction {
    OperationId: string;
    TransId: string;
    Description: string;
    IVCCode: string;
    Rule: string;
    Clientid: string;
    Result: string;
    Status: string;
}

export class ServiceTransaction {
    CycleNumber: number;
    ServTransCode: string;
    Result: string;
    Clientid: string;
    Status: string;
    AddWho: string;
}

export class TestTransaction {
    Clientid: string;
    OperationId: string;
    Description: string;
    IVCCode: string;
    Result: string;
    TransId: string;
    Status: string;
    serviceTrans: ServiceTransaction[];
}