import { Injectable } from '@angular/core';
import { ApplicationError } from '../../models/common/ApplicationError';
import { ApiService } from './api.service';
import { ApiConfigService } from './api-config.service';
import { String, StringBuilder } from 'typescript-string-operations';
import { NgxSpinnerService } from '../../../../node_modules/ngx-spinner';
import { MessageType } from '../../enums/message.enum';
import { MessagingService } from './messaging.service';
import { Message } from '../../models/common/Message';
import { ClientData } from '../../models/common/ClientData';
import * as CryptoJS from 'crypto-js';
import { StorageData } from '../../enums/storage.enum';
import { StatusCodes } from '../../enums/status.enum';
import { AudioType } from './../../enums/audioType.enum';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';

@Injectable()
export class AppErrorService {
  Type = 'E';
	alertMsg: string;
  alertFlag = false;
	specialCharErrMsg: string;
	alertColor: string;
	//App message  
	messageNum: string;
	messagesCategory: string;
	messageType: string;
	emiterrorvalue: string;
	clientData = new ClientData();
	securityKey='7061737323313233';
	storageData = StorageData;
	statusCode = StatusCodes;

  constructor(
    public apiservice: ApiService,
    private apiConfigService: ApiConfigService,
    private spinner: NgxSpinnerService,    
    private messagingService: MessagingService,
	private snackbar: XpoSnackBar) { }

	applicationError(error, message?) {
		this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
		let MessageDetail;
		if (this.clientData == null) {
			this.clientData = new ClientData();
      this.clientData.Location = 'XYZ';
      this.clientData.LoggedInUser = '';
      this.clientData.SiteId = 'RMX';
      this.clientData.ClientId = '9999';
		}
		this.spinner.hide();
    const appErr = new ApplicationError();
		if(error.error && error.error.ExceptionMessage){
      const errMessage = error.error.ExceptionMessage;
      appErr.message = !this.checkNullOrUndefined(errMessage) ? errMessage : message;
			MessageDetail = error.error.Message;
		}

    if (this.checkNullOrUndefined(appErr.message)) {
			appErr.message = error.statusText;
		}

    MessageDetail = !this.checkNullOrUndefined(MessageDetail) ? MessageDetail : message;
		appErr.type = this.Type;
    appErr.comments = String.Join(':', error.message, MessageDetail);
		appErr.clientId = this.clientData.ClientId;
    appErr.program = String.Join(':', this.clientData.SiteId, localStorage.getItem(this.storageData.operation));
		appErr.user = this.decrypt(this.securityKey,this.clientData.LoggedInUser);
    const requestObj = { ClientData: this.clientData, ApplicationError: appErr };
		this.apiservice.apiPostRequest(this.apiConfigService.appErrorUrl, requestObj)
			.subscribe(response => {
        const res = response.body;
        if (!this.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {

        } else if (!this.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) { }
			},
				erro => { }
			);
	}

	setAlert(msg, boolval, msgType?) {
    if (this.alertFlag !== undefined) {
			this.alertFlag = boolval;
      this.alertMsg = msg;
      if (!this.checkNullOrUndefined(msgType)) {
				this.alertColor = msgType;
      } else {
				this.alertColor = MessageType.failure;
			}
      if (msg !== '' && msg != null) {
				switch (msgType) {
					case MessageType.info:
						this.snackbar.info(msg);
						break;
					case MessageType.warning:
            this.alertSound(AudioType.warning);
						this.snackbar.warn(msg);
						break;
					case MessageType.success:
						this.snackbar.success(msg);
						break;
					default:
            this.alertSound(AudioType.error);
						this.snackbar.error(msg);
				}
			}
		}

	}

	handleAppError(erro, enableSetAlert?) {
    enableSetAlert = !this.checkNullOrUndefined(enableSetAlert) ? enableSetAlert : true;
		let userMessage = new Message();
    if (erro.status === 0) {
      this.messageNum = '2660039';
			this.messageType = MessageType.failure;
			userMessage = this.messagingService.SendUserMessage(this.messageNum, this.messageType);
			this.setAlert(userMessage.messageText, enableSetAlert);
			this.emiterrorvalue = userMessage.messageText;
      const message = String.Join(':', userMessage.messageText, erro.url);
			this.applicationError(erro, message);
    } else {
			this.setAlert(erro.statusText, enableSetAlert);
			this.emiterrorvalue = erro.statusText;
			this.applicationError(erro);
		}
	}

	clearAlert() {
    this.alertMsg = '';
		this.alertFlag = false;
	}

	appMessage() {
		this.messagesCategory = localStorage.getItem(this.storageData.module);
    const existingmessage = JSON.parse(localStorage.getItem(this.storageData.messages));
    if (!this.checkNullOrUndefined(existingmessage) && existingmessage.length > 0) {
      const category = existingmessage.find(m => m.Category === this.messagesCategory);
      if (this.checkNullOrUndefined(category)) {
				this.callAppMessageApi(existingmessage);
			}
    } else {
			this.callAppMessageApi(existingmessage);
		}
	}

	callAppMessageApi(existingmessage) {
		this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
    const requestObj = { ClientData: this.clientData };
    const categoryUrl = String.Join('/', this.apiConfigService.getMessagesForCategoryUrl, this.messagesCategory);
		this.apiservice.apiPostRequest(categoryUrl, requestObj)
			.subscribe(response => {
        const res = response.body;
        if (!this.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
					let updatedMsgList = [];
          if (!this.checkNullOrUndefined(existingmessage) && existingmessage.length > 0) {
						updatedMsgList = updatedMsgList.concat(existingmessage);
					}
					updatedMsgList = updatedMsgList.concat(res.Response);
					localStorage.setItem(this.storageData.messages, JSON.stringify(updatedMsgList));
        } else if (!this.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
					this.setAlert(res.ErrorMessage.ErrorDetails, true);
				}
			},
				error => {
					this.setAlert(error.statusText, true);
					this.applicationError(error);
				});
	}

	//The set method is use for encrypt the value 
encrypt(value:string, securityKey){
	if(value && securityKey){
      const key = CryptoJS.enc.Utf8.parse(securityKey);
      const iv = CryptoJS.enc.Utf8.parse(securityKey);
      const encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(value), key,
            {
                keySize: 128 / 8,
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
            
             return encrypted.toString();
	}
  }

   //The get method is use for decrypt the value.
  decrypt(keys, value){
		if(keys && value){
      const key = CryptoJS.enc.Utf8.parse(keys);
      const iv = CryptoJS.enc.Utf8.parse(keys);
      const decrypted = CryptoJS.AES.decrypt(value, key, {
          keySize: 128 / 8,
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
      }); 
      
        return decrypted.toString(CryptoJS.enc.Utf8);
		}
  }

  alertSound(soundType) {
    const audio = new Audio(soundType);
    audio.play();
  }

  // to check null or undefined
  checkNullOrUndefined(val) {
    if (val === null || val === undefined) {
      return true;
    } else {
      return false;
    }
  }
}
