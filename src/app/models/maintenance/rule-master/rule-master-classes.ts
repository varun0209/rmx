import { CommonEnum } from "../../../enums/common.enum";

export class AttributeData {
    ID: string;
    TEXT: string;
    TYPE: string;
}

export class RowData {
    selectedAttribute: AttributeData = null;
    selectedOperator: string = null;
    selectedValue: string[] = [];
    multiSelectValue: boolean = false;
    selectedControlType: string = CommonEnum.controlType;

    operatorList = [];
    valueList = [];

    public get formula(): string {
        let temp = "";
        if (!this.selectedAttribute) return;
        if (!this.selectedOperator) return;
        if (this.selectedOperator === '!') {
            temp = `${this.selectedOperator}${this.selectedAttribute.TEXT}`;
            return temp.trim();
        }
        if (!this.selectedValue) return;

        switch (this.selectedOperator.toLowerCase()) {
            case "in": {
                temp = `${this.selectedAttribute.TEXT} ${this.selectedOperator} `;

                return temp + `{${this.toCSV(this.selectedValue)}}`;
            }
            case ".contains":
            case ".startswith":
            case ".endswith": {
                temp = `${this.selectedAttribute.TEXT}${this.selectedOperator}("${this.selectedValue}")`;
                return temp;
            }
            default: {
                return `${this.selectedAttribute.TEXT} ${this.selectedOperator} "${this.selectedValue}"`;
            }
        }
    }

    private toCSV(arr: string[]) {
        let hold = "";
        const tempArr = this.selectedValue = this.selectedValue.sort((a, b) => a.localeCompare(b));
        tempArr.forEach(item => {
            if (hold.length > 0)
                hold += ", ";
            hold += `"${item}"`
        });

        return hold;
    }
}