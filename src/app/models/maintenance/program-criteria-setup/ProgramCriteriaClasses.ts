import { dropdown } from "../../common/Dropdown"

export class RxData {
  attributeMasterList: RxAttributeMasterData[]
  rankList: dropdown[]
  operationList: dropdown[]
  programRuleList: RxProgramRuleData[]
  programNameList: RxNameGroupData[]
  programGroupList: RxNameGroupData[]
  programNameList_All: RxNameGroupData[]
  programGroupList_All: RxNameGroupData[]

  addEditRule: RxProgramRuleData
  cached: any[] = []
}

export class RxProgramRuleData {
  ProgramRuleId: number
  ProgramId: number
  Program_Name: string
  ProgramRuleGroupId: number
  Program_Group: string
  OperationId: string
  OperationName: string
  ProgramRule: string
  Rank: number
  Description: string
  Assign_Values: string
  Active: string
}

export class RxAttributeMasterData {
  ATTRIBUTEID: string
  ATTR_OBJECT: string
  ATTR_PROPERTY: string
  ATTR_TYPE: string
  Id: string
  Text: string
}

export class ValuePair {
  property: string
  value: string
}

export class RxRankWithin {
  ProgramId: number
  ProgramRuleGroupId: number
  OperationId: string
}

export class RxNameGroupData {
  IsGroup: boolean = false
  Id: number
  Text: string
  Active: string
}