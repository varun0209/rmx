export class Receipt{
    ExternReceiptkey: string;
    CategoryName: string;
    Clientid: string;
    Receiptkey: string;
    ReceiptDate: string;
    ShipDate: string;
    Client_System_Cd: string;
    CustomerName: string;
    Address1: string;
    Address2: string;
    Address3: string;
    Address4: string;
    City: string;
    State: string;
    Zip: string;
    Country: string;
    Phone: string;
    CarrierReference: string;
    ShipmentReferenceNumber: string;
    Route: string;
    LabelName: string;
    PlaceofDelivery: string;
    PlaceofLoading: string;
    Status: string;
    Processed_yn: string;
    Closed_yn: string;
    Closed_Date: string;
    ReceiptType: string;
    ReceiptGroup: string;
    ReceiptSource: string;
    ReceiptChannel: string;
    Program_Ind: string;
    Attr1: string;
    Attr2: string;
    Attr3: string;
    Attr4: string;
    Attr5: string;
    ProgramName: string;
   AddDate: string;
    AddWho: string;
    EditDate: string;
    EditWho: string;
    Qty: string;
    ReceiptDetail: ReceiptDetail[];
    Receipttrans: Receipttrans[];
}
export class ReceiptDetail {
    Receiptkey: string;
    ReceiptLineNumber: string;
    ExternReceiptkey: string;
    ExternLineno: string;
    Clientid: string;
    POkey: string;
    SKU: string;
    Status: string;
    AddDate: string;
    AddWho: string;
    EditDate: string;
    EditWho: string;
    SerialNumber: string;
    QtyExpected: number;
    QtyAdjusted: number;
    QtyReceived: number;
    ConditionCode: string;
    LotAdt1: string;
    LotAdt2: string;
    LotAdt3: string;
    LotAdt4: string;
    LotAtr1: string;
    LotAtr2: string;
    LotAtr3: string;
    LotAtr4: string;
    LotAtr5: string;
    LotAtr6: string;
    LotAtr7: string;
    LotAtr8: string;
    AltSerialNumber :string;
    SUSR1:string;
    SUSR2:string;
    SUSR5:string;
}

export class Receipttrans{
    Receiptkey: string;
    Clientid: string;
    ReceiptLineNumber:string;
    ExternReceiptkey: string;
    ExternLineno: string;
    SKU: string;
    ConditionCode: string;
    SerialNumber: string;
    Status: string;
    AddDate: string;
    AddWho: string;
    EditDate: string;
    EditWho: string;
}
export class Receivegrid{
    ExternLineno: string;
    ConditionCode: string;    
    SKU: string;
    Qty: string;    
}

export class ReceivingESNDetails{
    SKU: string;
    ConditionCode: string;
    SerialNumber: string;
    ExternLineno: string;
    ReceiptLineNumber: string;
}