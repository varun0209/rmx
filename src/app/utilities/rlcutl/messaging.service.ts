import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
// Messaging
import { MessageType } from '../../enums/message.enum';
import { Message } from '../../models/common/Message';
import { String, StringBuilder } from 'typescript-string-operations';
import { StorageData } from '../../enums/storage.enum';

@Injectable()
export class MessagingService {
    storageData = StorageData;

    constructor() { }

    // Messaging Method
     public SendUserMessage(messageNum: string, messageType: string, params?: string[]): any {
       const messageObj: Message = new Message();
       let text: string;
       let alertColor: string;

       let localData = JSON.parse(localStorage.getItem(this.storageData.messages));

       if (localData) {

         //searching for the message number in local storage
         let datafill = localData.filter(x => x.MessageNumber == messageNum);

         // Checking & Appending Parameters to message
         if (params != null && params.length > 0) {
           datafill.forEach(x => { text = messageNum + ":" + String.Format(x.Message, params[0], params[1]) });
         }
         else {
           datafill.forEach(x => text = messageNum + ":" + x.Message);
         }

         // Applying Color Coding for message display
         if (messageType == MessageType.failure) {
           alertColor = MessageType.failure;
         }
         if (messageType == MessageType.warning) {
           alertColor = MessageType.warning;

         }
       }
       messageObj.messageNum = messageNum;
       messageObj.messageType = messageType;
       messageObj.alertColor = alertColor;
       messageObj.messageText = text;

       return messageObj;
     }

}

