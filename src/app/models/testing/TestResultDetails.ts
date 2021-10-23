
export class TestResultDetails {
    lstTransResults: lstTransResults[];   
}

export class lstTransResults {
        SeqId: number;
        SerialNumber: string;
        CycleNumber: number;
        OperationId: string;
        TransId: string;
        Result:string;
        IVCCode: string;
        Disposition: string;
        Grade: string;
        AttrValues:AttrValues;
        Attributes:String;
}

export class AttrValues{
    TRANSID: string;
    DESCRIPTION:string;
    RESULT:string;
    TESTTYPE: string;
}