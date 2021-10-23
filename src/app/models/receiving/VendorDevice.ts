import { SKU } from './ReceivingSKU';

export class VendorDevice {
  UID: string;
  SerialNumber: string;
  PortId: string;
  Carriers: Array<any>;
  Carrier: string;
  OEMS: Array<any>;
  OEM: string;
  Model: string;
  Size: string;
  Colors: Array<any>;
  Color: string;
  Conditions: Array<any>;
  Condition: string;
  SKUs: Array<SKU>;
  Sku: any;
  SiteId: string;
  ClientId: string;
  ProgramName: string;
}
