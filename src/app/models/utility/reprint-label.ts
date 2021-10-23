export class AdhocDocumentPrint {
  ClientId: string;
  SiteID: string;
  Label: string;
  File: string;
  Description: string;
  DockType: string;
  Category: string;
  DockFormat: string;
  DockCategory: string;
  PrinterName: string;
  PrinterType: string;
  Trigger: string;
  ImageFile: string;
  Notes: string;
  ParameterAttribute: string;
  Parameters: string;
  Key: string;
  HeaderQuery: string;
  DetailQuery: string;
  NoOfCopies: string;
  MaxLine: string;
  ParameterAttributeValues: ParameterAttributeValues[];
  ParameterValues: any[];
  AllowedUsers: string;
}

export class ParameterAttributeValues {
  ParamterName: string;
  Type: string;
  DefaultValue: string;
  LookupQery: string;
  LookupQeryValues: string;
}