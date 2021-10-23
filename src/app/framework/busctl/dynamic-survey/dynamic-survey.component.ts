import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { String } from 'typescript-string-operations';
import { AppService } from './../../../utilities/rlcutl/app.service';
import { SurveyService } from './../../../services/survey.service';
import { CommonEnum } from './../../../enums/common.enum';

@Component({
  selector: 'app-dynamic-survey',
  templateUrl: './dynamic-survey.component.html',
  styleUrls: ['./dynamic-survey.component.css']
})
export class DynamicSurveyComponent implements OnInit {

  @Input() dynamicFormClass = '';
  @Input() cleanOnChange = true;
  @Input() surveyResponse;
  @Output() emitSurveyResponse: EventEmitter<any>;
  @Output() emitCompletedSurvey: EventEmitter<any>;
  @Output() emitResSurvey: EventEmitter<any>;


  commonEnum = CommonEnum;

  constructor(
    private appService: AppService,
    public surveyService: SurveyService
  ) {
    this.emitSurveyResponse = new EventEmitter();
    this.emitCompletedSurvey = new EventEmitter();
    this.emitResSurvey = new EventEmitter();
  }


  ngOnInit() {
  }

  getElementId(element, index) {
    const elementId = String.Join('_', element, index);
    return elementId;
  }

  changeDropDown(questionControl, event, attrname) {
    let text: any;
    const selectedAttrId = questionControl.AttributeValues.find(res => res.Id === +attrname.value);
    if (!this.appService.checkNullOrUndefined(selectedAttrId) && Object.keys(selectedAttrId).length) {
      text = (selectedAttrId.hasOwnProperty('Description') && selectedAttrId.Description !== '') ? selectedAttrId.Text : (!this.appService.checkNullOrUndefined(event.source.selected.viewValue) && event.source.selected.selected) ? event.source.selected.viewValue : '';
    } else {
      text = (!this.appService.checkNullOrUndefined(event.source.selected.viewValue) && event.source.selected.selected) ? event.source.selected.viewValue : '';
    }
    questionControl.SelectedAttributeValue = {
      Id: event.value,
      Text: text.trim(),
      name: event.source.id
    };
    questionControl.SelectedValue =  text.trim();   
    this.emitSurveyResponse.emit({ SurveyResponse: this.surveyResponse, SelectedAttributeValue: questionControl.SelectedAttributeValue });
  }

  //#region multiselect dropdown
  // selecting options in multiselect dropdown
  getSelectedList(questionControl, event) {
    if (event.Text !== 'N/A') {
      questionControl.SelectedAttributeValues.push(event);
      questionControl.SelectedAttributeValues = questionControl.SelectedAttributeValues.filter(ele => ele.Text !== 'N/A');
    } else {
      questionControl.SelectedAttributeValues = [];
      questionControl.SelectedAttributeValues.push(event);
    }
  }

  // deselecting options in multiselect dropdown
  onDeSelectItem(questionControl, event) {
    questionControl.SelectedAttributeValues = questionControl.SelectedAttributeValues.filter(ele => ele.Text !== event.Text);
    if (questionControl.SelectedAttributeValues.length === 0) {
      let defaultNAId: any;
      questionControl.AttributeValues.forEach(element => {
        if (element.Text === 'N/A') {
          defaultNAId = element.Id;
        }
      });
      const defaultOption = [{ Id: defaultNAId, Text: 'N/A' }];
      questionControl.SelectedAttributeValues = defaultOption;
    }
  }

  // sending selected options from multiselect dropdown
  multiSelectInput(cardelement, id) {
    if (cardelement.SelectedAttributeValues.length > 0) {
      const values = {
        SelectedAttributeValues: cardelement.SelectedAttributeValues,
        name: String.Join('_', cardelement.Property.controlId, id)
      };
      this.emitSurveyResponse.emit({ SurveyResponse: this.surveyResponse, SelectedAttributeValue: values });
    }
  }

  //#endregion
  // input change
  changeInput(questionControl, textBoxRef) {
    questionControl.SelectedAttributeValue = {
      Text: questionControl.SelectedValue,
      name: textBoxRef.id,
      Id: (!this.appService.checkNullOrUndefined(questionControl.AttributeValues) && questionControl.AttributeValues.length) ? questionControl.AttributeValues[0].Id : 0,
    };
  }

  enterInput(questionControl, event, textBoxRef) {
    questionControl.SelectedValue = event;
    questionControl.SelectedAttributeValue = {
      Text: event,
      name: textBoxRef.id,
      Id: (!this.appService.checkNullOrUndefined(questionControl.AttributeValues) && questionControl.AttributeValues.length) ? questionControl.AttributeValues[0].Id : 0,
    };
    this.emitSurveyResponse.emit({ SurveyResponse: this.surveyResponse, SelectedAttributeValue: questionControl.SelectedAttributeValue });
  }

  changeCheckBox(questionControl, checkboxvalue) {
    // questionControl.controlvalue = checkboxvalue === true ? 'True' : 'False';
    questionControl.SelectedValue = checkboxvalue === true ? 'True' : 'False';
    this.emitSurveyResponse.emit({ SurveyResponse: this.surveyResponse, SelectedAttributeValue: questionControl.SelectedAttributeValue });
  }

  //#region radio button
  changeRadioBtn(questionControl, attributeValue) {
    questionControl.SelectedValue = attributeValue.Text;
    questionControl.SelectedAttributeValue = {
      Id: attributeValue.Id,
      Text: attributeValue.Text,
      name: questionControl.AttributeName
    };
    this.emitSurveyResponse.emit({ SurveyResponse: this.surveyResponse, SelectedAttributeValue: questionControl.SelectedAttributeValue });
  }

  //#endregion radio button

  doneSurvey() {
    this.emitCompletedSurvey.emit(this.surveyResponse);
  }

  reSurvey() {
    this.emitResSurvey.emit();
  }

  trackItem(index: number, item) {
    return item.SurveyId;
  }

}
