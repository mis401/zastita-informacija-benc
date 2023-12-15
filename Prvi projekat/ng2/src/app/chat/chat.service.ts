import { Injectable } from '@angular/core';
import { Subject, zip } from 'rxjs';
import {io} from 'socket.io-client';
import { Message } from '../models/message.dto';
import { Store } from '@ngrx/store';
import { User } from '../models/user.model';
import { UserState } from '../store/user.state';
import { selectEncryptionType, selectId, selectUsername } from '../store/user.selector';
import { RC4 } from '../encryption/RC4';
import { XTEA } from '../encryption/XTEA';
import { EncryptionType } from '../models/algorithms';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  rc4 = new RC4();
  xtea = new XTEA();
  userinfo$ = zip(this.store.select(selectUsername), this.store.select(selectId));
  socket = io(import.meta.env.NG_APP_API_URL);
  messageStream: Subject<Message> = new Subject<Message>();
  constructor(private store: Store<UserState>) { 
    this.userinfo$.subscribe(([username, id]) => {
      this.username = username;
      this.id = id;
    });
    this.socket.on('messageRec', (crypto) => {
      this.store.select(selectEncryptionType).subscribe((encryptionType) => {
        if (encryptionType === EncryptionType.None)
          return;
        else if (encryptionType === EncryptionType.RC4) {
          const message = this.decryptMessage(crypto, encryptionType);
          this.messageStream.next(message);
        }
        else if (encryptionType === EncryptionType.XTEA) {
          const message = this.decryptMessage(crypto, encryptionType);
        }
      })
    });
  }
  username: string | null = null;
  id: string | null = null;


  connect(){
    this.socket.connect();
  }
  disconnect(){
    this.socket.disconnect();
  }
  sendMessage(message: string, encryptionType: EncryptionType){
    console.log(this.username);
    console.log(this.id);
    message = message.trim();
    const crypto = this.encryptMessage(message, encryptionType)
    const messageObject : Message = {text:message, crypto:crypto, owner: true, senderName: this.username!, senderId: this.id!} 
    this.messageStream.next({...messageObject});
    messageObject.text = null;
    this.socket.emit('message', messageObject);
  }
  encryptMessage(message: string, encryptionType: EncryptionType): string{
    if (encryptionType === EncryptionType.None)
      return message;
    else if (encryptionType === EncryptionType.RC4)
      return this.rc4.Encrypt(message);
    else if (encryptionType === EncryptionType.XTEA)
      return this.xtea.Encrypt(message);
    else
      return message;
  }
  decryptMessage(cryptoMsg: Message, encryptionType: EncryptionType): Message {
    let text = "";
    if (encryptionType === EncryptionType.None)
      return cryptoMsg;
    else if (encryptionType === EncryptionType.RC4)
      text = this.rc4.Decrypt(cryptoMsg.crypto);
    else if (encryptionType === EncryptionType.XTEA)
      text = this.xtea.Decrypt(cryptoMsg.crypto);
    const msg: Message = {text:text, crypto:cryptoMsg.crypto, owner: cryptoMsg.senderId === this.id, senderName: cryptoMsg.senderName, senderId: cryptoMsg.senderId};
    return msg;
  }
}
