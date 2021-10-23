export class MasterConfig {
  ClientId: string;
  SiteId: string;
  TableName: string;
  KeyValue1: string;
  KeyValue2: string;
  MainModule: string;
  SubModule: string;
  CustomDescription: string;
  ControlType: string;
  Delimiter: string;
  Mandatory: string;
  Editable: string;
  EditableRole: string;
  Format_Type: string;
  Min_Length: number;
  Max_Length: number;
  Left_Pad_Value: string;
  Config_SeqId: string;
  Config_Value: string;
  // non-data fields below
  EditDisabled: boolean; // If true, disables the Edit Button (with Pencil icon)
  IsEditing: boolean = false; // If true, TEXT or RADIO can be edited
  original_config_value: string;
}

export class AppSysConfig {
  TableName: string;
  SeqId: string;
  GroupName: string;
  Key: string;
  Value: string;
}

export class ListData {
  value: string;
  IsEditing: boolean = false;
  original_value: string;
}

export class JsonData {
  key: string;
  value: string;
  IsEditing: boolean = false;
  original_value: string;
}
