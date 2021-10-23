import { CommonEnum } from './../enums/common.enum';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from './common.service';
import { AppService } from './../utilities/rlcutl/app.service';
import { ApiConfigService } from './../utilities/rlcutl/api-config.service';
import { Survey } from './../models/common/survey';




@Injectable({
  providedIn: 'root'
})
export class SurveyService {

  survey = new Survey();
  surveyResponse: any;
  surveyTrans = [];
  showSurvey = false;
  showDoneBtn = true;
  showCancelBtn = false;

  public doneSurveyResponse = new BehaviorSubject<any>(null);
  public surveyResult = new BehaviorSubject<any>(null);

  constructor(
    private commonService: CommonService,
    private spinner: NgxSpinnerService,
    private appService: AppService,
    private apiConfigService: ApiConfigService) { }


  getSurvey(requestObj) {
    this.commonService.commonApiCall(this.apiConfigService.getSurveyUrl, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.spinner.hide();
        this.surveyResponse = res.Response.SurveyTransactions;
        this.focusControl(res.Response.SurveyTransactions.SurveyTrans);
        this.focusButtons(res.Response.SurveyTransactions);     
      }
      this.surveyResult.next(res);
    });
  }

  getRefreshedSurvey(requestObj) {
    this.commonService.commonApiCall(this.apiConfigService.getRefreshedSurveyUrl, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.spinner.hide();
        this.surveyResponse = res.Response;
        this.focusControl(this.surveyResponse.SurveyTrans);
        this.focusButtons(res.Response);
      }
    });
  }

  sendSurveyInfo(requestObj) {
    this.commonService.commonApiCall(this.apiConfigService.submitSurveyUrl, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.surveyResponse = res.Response.SurveyTransactions;
        this.doneSurveyResponse.next(res.Response);
      }
    });
  }

  getReSurvey(requestObj) {
    this.commonService.commonApiCall(this.apiConfigService.getReSurveyUrl, requestObj, (res, statusFlag) => {
      if (statusFlag) {
        this.spinner.hide();
        this.surveyResponse = res.Response;
        this.focusControl(this.surveyResponse.SurveyTrans);
      }
    });
  }

  focusButtons(response) {
    if (response.DoneEnable === CommonEnum.yes) {
      this.appService.setFocus('done');
    }
    // if (response.ReSurveyVisible === CommonEnum.yes) {
    //   this.appService.setFocus('resurvey');
    // }
  }

  focusControl(response) {
    if (response.length) {
      response.forEach((surveyTransaction) => {
        surveyTransaction.SurveyQuestions.forEach((surveyQuestion) => {
          surveyQuestion.QuestionControls.forEach(element => {
            let resultControlId = '';
            if (element.Focus === true) {
              if (element.Disable === false) {
                let elementId = '';
                if (element.Property.controlType === 'radiobutton') {
                  if (element.AttributeValues.length) {
                    resultControlId = element.AttributeValues[0].Text;
                    elementId = this.appService.getElementId(resultControlId, surveyQuestion.TransId);
                  }
                } else {
                  resultControlId = element.Property.controlId;
                  elementId = this.appService.getElementId(resultControlId, surveyQuestion.TransId);
                }
                this.appService.setFocus(elementId);
              }
            }
          });
        });
      });
    }
  }

  clearSurvey() {
    this.surveyResponse = null;
    this.showSurvey = false;
  }
}
