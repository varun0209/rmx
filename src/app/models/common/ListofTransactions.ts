export class Tran {
    OperationId: string;
    TransId: string;
    Description: string;
    IVCCode: string;
    Rule: string;
    Clientid: string;
    Result: string;
    MSN:string;
    TestMode:string;
}

export class Transactions {
    Trans: Tran[];
}

export class ListofTransactions {
  Trans: Transactions;
}



