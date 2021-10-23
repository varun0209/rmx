import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { String } from 'typescript-string-operations';
import { UiData } from '../../../models/common/UiData';
import { AppService } from '../../../utilities/rlcutl/app.service';
import { StorageData } from '../../../enums/storage.enum';
import { checkNullorUndefined } from '../../../enums/nullorundefined';
import { CommonEnum } from '../../../enums/common.enum';


@Component({
    selector: 'dynamicpanel',
    templateUrl: './dynamic-panel.component.html',
    styleUrls: ['./dynamic-panel.component.css']
})
export class DynamicPanelComponent implements OnInit {

    @Input() cards: any;
    @Output() cardlistChange: EventEmitter<any>;
    @Output() cardListAdd: EventEmitter<any>;
    selectedValue = "";
    @Input() setDynamicPanelBorder = "";
    @Input() dynamicFormClass = "";
    @Input() setDynamicpanelDescMaxwith = "";
    @Input() title: string;
    @Input() setContainer: string = "";
    /*set row padding for testing screen*/
    @Input() setrowPadding: string = "";
    @Input() questionwidth: string = "";
    @Input() disabled = false;
    @Input() skuWaitTime: string;
    @Input() uiData: UiData;
    @Input() partsList = [];
    @Input() autoExtenderOneAddDisable: boolean;
    @Input() autoExtenderOneDoneDisable: boolean;
    @Input() autoExtenderOneIsQtyDesiabled: boolean;

    textBoxPattern: any;
    elementId: string;
    constructor(private appService: AppService) {
        this.cardlistChange = new EventEmitter();
        this.cardListAdd = new EventEmitter();
        const pattern = JSON.parse(localStorage.getItem(StorageData.patternList));
        if (!this.appService.checkNullOrUndefined(pattern)) {
            this.textBoxPattern = new RegExp(pattern.namePattern);
        }
    }
    skus = [{
        'sku': '',
        'selectedSKUModel': '',
        'quantity': ''
    }];
    @Input()
    get cardlist() {
        return this.cards;
    }
    set cardlist(value) {
        this.cards = value;
        this.cardlistChange.emit(this.cards);
    }
    ngOnInit() {
    }

    getElementId(element, index) {
        let elementId = String.Join("_", element, index);
        return elementId;
    }

    getFieldData(element, index) {

        if (element.SelectedValue == "" || element.SelectedValue == undefined) {
            return this.skus;
        }

        let newvalue = JSON.parse(element.SelectedValue);
        this.skus = newvalue;
        return this.skus;
    }

    changeDropDown(cardelement, event, attrname) {
        // cardelement.SelectedValue = event.value;
        let text: any;
        const selectedAttrId = cardelement.AttributeValues.find(res => res.Id == +attrname.value);
        if (!checkNullorUndefined(selectedAttrId) && Object.keys(selectedAttrId).length) {
            text = (selectedAttrId.hasOwnProperty('Description') && selectedAttrId.Description != '') ? selectedAttrId.Text : (!checkNullorUndefined(event.source.selected.viewValue) && event.source.selected.selected) ? event.source.selected.viewValue : ''
        } else {
            text = (!checkNullorUndefined(event.source.selected.viewValue) && event.source.selected.selected) ? event.source.selected.viewValue : ''
        }

        cardelement.SelectedAttributeValue = {
            Id: event.value,
            Text: text.trim(),
            name: event.source.id
        }
        //let name = event.target.id;
        // this.cards.selectedevent = event;
        this.cardlistChange.emit(cardelement.SelectedAttributeValue);
    }

    //selecting options in multiselect dropdown
    getSelectedList(cardelement, event) {
        if (event.Text != 'N/A') {
            cardelement.SelectedAttributeValues.push(event);
            cardelement.SelectedAttributeValues = cardelement.SelectedAttributeValues.filter(ele => ele.Text !== 'N/A');
        }
        else {
            cardelement.SelectedAttributeValues = [];
            cardelement.SelectedAttributeValues.push(event);
        }
    }

    //deselecting options in multiselect dropdown
    onDeSelectItem(cardelement, event) {
        cardelement.SelectedAttributeValues = cardelement.SelectedAttributeValues.filter(ele => ele.Text !== event.Text);
        if (cardelement.SelectedAttributeValues.length == 0) {
            let defaultNAId: any;
            cardelement.AttributeValues.forEach(element => {
                if (element.Text == 'N/A') {
                    defaultNAId = element.Id;
                }
            });
            let defaultOption = [{ Id: defaultNAId, Text: 'N/A' }];
            cardelement.SelectedAttributeValues = defaultOption;
        }
    }

    //sending selected options from multiselect dropdown
    multiSelectInput(cardelement, id) {
        if (cardelement.SelectedAttributeValues.length > 0) {
            let values = {
                SelectedAttributeValues: cardelement.SelectedAttributeValues,
                name: String.Join('_', cardelement.Property.controlId, id)
            }
            this.cardlistChange.emit(values);
        }
    }

    //#region radio button
    changeRadioBtn(cardelement, event, attributeValue) {
        cardelement.SelectedAttributeValue = {
            Id: attributeValue.Id,
            Text: attributeValue.Text,
            name: event.target.id
        };
        this.cardlistChange.emit(cardelement.SelectedAttributeValue);
    }

    changeInput(cardelement, inputvalue) {
        cardelement.controlvalue = inputvalue;
        this.cardlistChange.emit(this.cards);
    }

    enterInput(cardelement, inputvalue, textBoxRef) {
        cardelement.SelectedAttributeValue = {
            Text: inputvalue,
            name: textBoxRef.id,
            Id: (!checkNullorUndefined(cardelement.AttributeValues) && cardelement.AttributeValues.length) ? cardelement.AttributeValues[0].Id : '',
        }
        this.cardlistChange.emit(cardelement.SelectedAttributeValue);
    }

    changeToggle(cardelement, event, attr) {
        let value = event == true ? CommonEnum.yes :CommonEnum.no;
        let selectedAttr = cardelement.AttributeValues.find(c => c.Text == value);
        cardelement.SelectedAttributeValue = {
            Id: selectedAttr.Id,
            Text: selectedAttr.Text,
            name: attr.id
        };
        cardelement.SelectedValue = value;
        cardelement.controlvalue = value;
        this.cardlistChange.emit(cardelement.SelectedAttributeValue);
    }
    
    changeCheckBox(cardelement, checkboxvalue) {
        cardelement.controlvalue = checkboxvalue == true ? "True" : "False";
        this.cardlistChange.emit(this.cards);
    }


    typeaheadResponse(cardelement, event, extender) {
        cardelement.SelectedAttributeValue = {
            Text: JSON.stringify(event),
            name: extender.id,
            Id: (!checkNullorUndefined(cardelement.AttributeValues) && cardelement.AttributeValues.length) ? cardelement.AttributeValues[0].Id : '',
        }
        this.cardlistChange.emit(cardelement.SelectedAttributeValue);
    }
}