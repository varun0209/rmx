export class FqaDevice{
    SerialNumber: string;
    CycleNumber: number;
    Clientid: string;
    SiteId:string;
    Step: string;
    Route: string;
    Location: string;
    OEM_CD: string;
    ModelName: string;
    DeviceSKU: string;
    FunctionTest: string;
    CosmeticTest: string;
    Warranty: string;
    WarrantyStartDate: string;
    IVCCode: string;
    ContainerID: string;
    ContainerCycle: number;
    Disposition: string;
    ConditionCode: string;
    AddWho: string;
    AddDate:string;
    EditWho:string;
    ProgramName: string;
    FMI_Lock: string;
    MSN: string;
    TestResult: string;
    Grade: string;
    Lost_Stolen_Flg: string;
    ProgramIndicator: string;
    KillSwitchIndicator: string;
    Model: Model;
    SKU: SKU;
    IVC: IVC;
    DataCollection:any;
    IsKSLabEligible: boolean;
    InProcess:string;
    FMM:string;
    FRP:string;
    IsExpected:boolean;
    ProcessingType:string;
    ParserType:string;
    CIState:string;
    NextStep:string;
    ReceiptKey:string;
    Receiptline:string;    
    SnAttributes:any;
    FinalSku:string;
    FQAReceiptKey:string;
    FQAReceiptLineNo:string;
    IsKillSwitchProcessed:boolean;
    IsCiClearProcessed:boolean;
    IsGradingProcessed:boolean;
    IsWebSrvQueueCleared:boolean;
    ISValidFqaStep:boolean;
    Origination:string;   
    Remarks:string;
    Verify:string;
    ReasonCode: string;
    ReasonCodeDesc: string;
}

export class Model {
    Clientid: string;
    Active: string;
    Model: string;
    OEM_CD: string;
    WarrantyPeriod: number;
    WarrantyOffset: number;
    ContainerCapacity: number;
    InternalBattery: string;
    ClientModel: string;
    ParserEligibility: string;
    KillSwitchFlag: string;
    SecondCIFlag: string;
    AutoReprint: boolean;
    IsGreenTModel: boolean;
    IsSecondCIModel: boolean;
}

export class SKU {
    Sku: string;
    ClientId: string;
    Description: string;
    Model: string;
    Active: string;
    SKUGroup: string;
    Article: string;
    Dispsotion: string;
}

export class IVC {
    IVC: string;
    ClientId: string;
    Description: string;
    Active: string;
    IsFailIVC: boolean;
}

export class FqaDeviceList{
    SerialNumber: string;
    Remarks: string;
    Verify: string;
}


