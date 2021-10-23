export class TestingDevice {
  SerialNumber: string;
  CycleNumber: number;
  Clientid: string;
  Step: string;
  NextStep: string;
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
  ProgramName: string;
  FMI_Lock: string;
  MSN: string;
  TestResult: string;
  IsGreenTModel: boolean;
  Grade: string;
  Lost_Stolen_Flg: string;
  ProgramIndicator: string;
  KillSwitchIndicator: string;
  Model: Model;
  SKU: SKU;
  IVC: IVC;
  IsKSLabEligible: boolean;
  Origination: string;
  ReceiptKey: string;
  SamplingBatchId: string;
  Receiptline: string;
  AQLFailStep: string;
  HoldFlag: boolean;
  HoldReasonCode: number;
  Comments: string;
  LastSAPSku: string;
  AutoFail  : any;
  DaysToExpire :number;
  ReasonCode :number;
  SoftwareVersion:string;
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
