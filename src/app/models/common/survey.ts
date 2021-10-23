export class Survey {
  ClientId: string;
  SiteId: string;
  SurveyId: string;
  Title: string;
  Description: string;
  Result: string;
  Rule: string;
  Active: boolean;
  ControlValues: any;
  SurveyQuestions: Array<SurveyQuestion>;
}
export class SurveyQuestion {
  ClientId: string;
  SiteId: string;
  QuestionId: string;
  Text: string;
  TransId: string;
  Active: boolean;
  AddDate: Date;
  AddWho: string;
  EditDate: Date;
  EditWho: string;
  QuestionControls: Array<QuestionControl>;
  Optional: boolean;
}

export class QuestionControl {
  ControlId: string;
  Property: any;
  Rank: number;
  AttributeName: string;
  AttributeValues: Array<SurveyTransAttributeValues>;
  SelectedAttributeValue: SurveyTransAttributeValues;
  SelectedValue: string;
  SelectedAttributeValues: Array<SurveyTransAttributeValues>;
  SelectedValues: Array<String>;
  Mapping: string;
  Focus: boolean;
  Disable: boolean;
}

export class SurveyTransAttributeValues {
  Id: number;
  Text: string;
  Rule: string;
  Default_YN: string;
  AttributeName: string;
}

export class SurveyTrans {
  ClientId: string;
  OperationId: string;
  TransId: number;
  Description: string;
  TransControls: Array<QuestionControl>;
  Result: string;
  ControlValues: any;
}


export class TransDetails {
  TransId: string;
  TransCriteria: any;
}

export class SurveyTransactions {
  DoneEnable: string;
  Trans: Array<SurveyTrans>;
}

export class TransAttributeMapping {
  AttributeName: string;
  Mapping: string;
}

export class SurveyTransValues {
  TransAttrValues: Array<SurveyTransAttributeValues>;
}

export class ServiceTransactions {
  // Trans: Array<ServiceTransaction>;
}

