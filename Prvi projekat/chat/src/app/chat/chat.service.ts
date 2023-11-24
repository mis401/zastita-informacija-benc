import { Injectable } from '@angular/core';
import { Subject, zip } from 'rxjs';
import {io} from 'socket.io-client';
import { Message } from '../models/message.dto';
import { Store } from '@ngrx/store';
import { User } from '../models/user.model';
import { UserState } from '../store/user.state';
import { selectId, selectUsername } from '../store/user.selector';
import { RC4 } from './RC4';
@Injectable({
  providedIn: 'root'
})
export class ChatService {
  rc4 = new RC4();
  userinfo$ = zip(this.store.select(selectUsername), this.store.select(selectId));
  socket = io(import.meta.env.NG_APP_API_URL);
  messageStream: Subject<Message> = new Subject<Message>();
  constructor(private store: Store<UserState>) { 
    this.userinfo$.subscribe(([username, id]) => {
      this.username = username;
      this.id = id;
    });
    this.socket.on('messageRec', (crypto) => {
      const message = this.decryptMessage(crypto);
      this.messageStream.next(message);
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
  sendMessage(message: string){
    console.log(this.username);
    console.log(this.id);
    message = message.trim();
    const crypto = this.encryptMessage(message)
    const messageObject : Message = {text:message, crypto:crypto, owner: true, senderName: this.username!, senderId: this.id!} 
    this.messageStream.next({...messageObject});
    messageObject.text = null;
    this.socket.emit('message', messageObject);
  }
  encryptMessage(message: string): string{
    const crypto = this.rc4.EncryptDecrypt(message);
    return crypto;
  }
  decryptMessage(cryptoMsg: Message): Message {
    const text = this.rc4.EncryptDecrypt(cryptoMsg.crypto);
    const msg: Message = {text:text, crypto:cryptoMsg.crypto, owner: cryptoMsg.senderId === this.id, senderName: cryptoMsg.senderName, senderId: cryptoMsg.senderId};
    return msg;
  }
}
