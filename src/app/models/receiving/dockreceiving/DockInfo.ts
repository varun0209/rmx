export class DockInfo {
    CarrierCode: string;
    DockReceiptId: string;
    ShipmentRef: string;
    ShipmentType: string;
    DockType: string;
    DockValue: string;
    DockLoc: string;
    TrailerNumber: string;
    TrailerLoad: string;
    UnloadStart: string;
    UnloadEnd: string;
    TrailerOut: Date;
}

export class DockInfoDetails {

    DockReceiptId: string;
    TrackingNumber: string;
    FullTrackingNumber: string;
    CartonCount?: number;
    Status: number;
    StatusDate: Date
    ContainerId: string;
    ContainerCycle: number;
    ReceiptKey: string;
    ProcessDate: Date;
    SortGroup: string;
    CatId: number;
}


export class DockRcvData {
    ClientId: string;
    CarrierCode: string
    ShipmentRef: string
    ShipmentType:string;
    DockType:string;
    DockValue:string;
    DockReceiptId: string;
    DockLoc:string;
    TrailerNumber:string;
    TrailerLoad:string;
    UnloadStart:string;
    UnloadEnd:string;
    TrackingNumber: string;
    FullTrackingNumber: string;
    CartonCount?: number;
    Status: number;
    StatusDate: Date;
    ContainerId: string;
    ContainerCycle: number;
    ReceiptKey: string;
    ProcessDate: Date
    SortGroup: string;
}
