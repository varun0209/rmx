export class TestTransaction {
    Trans: TestTrans[];   
}

export class TestTrans {
    Clientid: string;
    OperationId: string;
    TransId: string;
    Description: string;
    TransControls: TransControl[];
}

export class TransControl {
    ControlId: string;
    Property: ControlProperty;
    Rank: number;
    AttributeName: string;
    AttributeValues: TransAttributeValues[];
    SelectedValue: string;
}

export class ControlProperty{
    controlId: string;
    controlType: string;
    placeHolder: string;
    controlVisible: string;
}

export class TransAttributeValues {
    ID: number;
    Value: string;
}

export class TestTransValues {
    TransAttrValues: TransAttributeValues[];
}

export class Test {
    Clientid: string;
    OperationId: string;
    Description: string;
    IVCCode: string;
    Result: string;
    Status: string;
}