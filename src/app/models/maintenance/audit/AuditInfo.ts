export class AuditInfo {
    CheckCode: string;
    Description: string;
    Active: string;

    checkSetupActive: string;
    auditPoint: any;
    auditDescription: any;
    auditActive: any;
    auditChecks: any;
    allowDupResults: any;
    allowUpdResults: any;
    refSerial: any;
    multiCheckEligible: any;
    detailrequired: any;
}

export class AuditCheck {
    Check_Id: number = null;
    CheckCode: string = "";
    CheckDesc: string = "";
    Active: string = "Y";
    IsPass_YN: string = "Y";
}



export class AuditPoints {
    Audit_Id: number = null;
    AuditCode: string = "";
    AuditDescription: string = "";
    Active_YN: string = "Y";
    AllowDupResults_YN: string = "Y";
    AllowUpdResults_YN: string = "Y";
    ReferSerialNo_YN: string = "Y";
    AuditPointChecks: Array<AuditPointChecks> = [] = [];
}

export class AuditPointChecks {
    Check_Id: number = null;
    CheckCode: string = "";
    CheckDesc: string = "";
    IsPass_YN:string;
    DetailType: string = "";
    DetailRequired: string = "";
    Position: number = null;
    Default_YN: string = "Y";
    MultiChkElgbl_YN: string = "Y";
    DetailValues:any;
    isUpdated:string = "N";
}

export class AuditDetail{
    DetailType:string;
    DetailValue:string;
}


