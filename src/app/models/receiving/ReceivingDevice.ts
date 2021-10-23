export class ReceivingDevice {
    AddWho: string;
    ConditionCode: string;
    ContainerCycle: number;
    ContainerID: string;
    CosmeticTest: string;
    CycleNumber: number;
    Disposition: string;
    FMI_Lock: string;
    FunctionTest: string;
    IVCCode: string;
    Location: string;
    MSN: string;
    ModelName: string;
    Carrier: string;
    OEM_CD: string;
    ColorName: string;
    ProgramName: string;
    Route: string;
    DeviceSKU: string;
    SerialNumber: string;
    Step: string;
    NextStep: string;
    Clientid: string;
    Warranty: string;
    WarrantyStartDate: string;
    ReprintLabel: string;
    Grade: string;
    Lost_Stolen_Flg: string;
    ProgramIndicator: string;
    IsGreenTModel: boolean;
    KillSwitchIndicator: string;
    Model: Model;
    SnAttributes: any;
    SKU: SKU;
    IVC: IVC;
    IsKSLabEligible: boolean;
    ReceiptKey:string;
    Receiptline:string;
    Origination:string;
    IsAQLByPassReq:boolean;
    VendorId:string;
    IsExpected:boolean;
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
  IsMSNEnabled: boolean;
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
    IsSerialized: boolean;
}

export class IVC {
    IVC: string;
    ClientId: string;
    Description: string;
    Active: string;
    IsFailIVC: boolean;
}

export class ReceivingESNMaster {
    ESN: string;
    OEM_SKU: string;
    WarrantyStartDate: string;
    Lost_Stolen_Flg: string;
    ActiveFlag: string;
    ActiveSiteId: string;
}
