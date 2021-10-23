export class AdhocLabel {
  ClientId : number;
  SiteID: string;
  Label: string;
  File: string ;
  Description: string;
  DockType: string;
  DockFormat: string;
  DockCategory: string ;
  Trigger: Date;
  ImageFile: string;
  Notes: string;
  ParameterAttribute: string;
  Parameters: string;
  Key: string;
  HeaderQuery: string='';
  DetailQuery: string;
  NoOfCopies: number;
  MaxLine: string;
  ParameterAttributeValues: Parameter[]=[];
  ParameterValues: string;
  AllowedUsers: any[]=[];
}

export class Parameter{
  ParamterName: string;
  Type: string;
  DefaultValue: string;
  LookupQery: string;
  LookupQeryValues: any[];
  ControlType: string;
}

export class AdhocPrintConfig {
  ClientId: number;
  SiteID: string;
  Label: string;
  PrinterName: string;
  PrinterType: string;
  AddDate: Date;
  AddWho: string;
  EditDate: Date;
  EditWho: string;
}
