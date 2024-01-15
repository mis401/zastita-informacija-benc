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
import { TigerHash } from '../hash/TigerHash';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  rc4 = new RC4();
  xtea = new XTEA();
  tigerHash = new TigerHash();
  userinfo$ = zip(this.store.select(selectUsername), this.store.select(selectId));
  socket = io(import.meta.env.NG_APP_API_URL);
  messageStream: Subject<Message> = new Subject<Message>();
  constructor(private store: Store<UserState>) { 
    this.userinfo$.subscribe(([username, id]) => {
      this.username = username;
      this.id = id;
    });
    this.socket.on('messageRec', (crypto) => {
      let message = null;
      if (crypto.file)
        message = this.receiveFile(crypto);
      else
        message = this.decryptMessage(crypto);
      this.messageStream.next(message!);
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
    const messageObject : Message = {algorithm: encryptionType, text:message, crypto:crypto, owner: true, senderName: this.username!, senderId: this.id!, file: false, fileContent: null} 
    this.messageStream.next({...messageObject});
    messageObject.text = null;
    this.socket.emit('message', messageObject);
  }
  sendFile(file: File, encryptionType: EncryptionType){
    
    const readerURL = new FileReader();
    let dataURL = '';
    readerURL.readAsDataURL(file);
    readerURL.onload = () => {
      dataURL = readerURL.result as string;
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = () => {
        const typedArray = new Uint8Array(reader.result as ArrayBuffer);
        let crypto = this.encryptMessage(typedArray.reduce((acc, curr) => acc + String.fromCharCode(curr), ''), encryptionType);
        let hash = this.tigerHash.hash(Uint8Array.from(crypto.split(``).map((char) => char.charCodeAt(0))));
        console.log(hash);
        const encryptedbytes = new Uint8Array(crypto.split(``).map((char) => char.charCodeAt(0)));
        const bytes = new Uint8Array([...encryptedbytes, ...hash]);
        const encryptedFile = new File([crypto], file.name, {type: file.type});
        const messageObject : Message = {algorithm: encryptionType, text:file.type, crypto: '', owner: true, senderName: this.username!, senderId: this.id!, file: true, fileContent: bytes} 
        this.socket.emit('message', messageObject);
        console.log(messageObject.fileContent)
        messageObject.crypto = dataURL;
        this.messageStream.next({...messageObject});
      }
    }
  }

  receiveFile(message: Message){
    console.log(message);
    const file = this.decryptFile(message);
    if (file === null)
      return null;
    const msg = {
        algorithm: message.algorithm,
        text: message.text,
        crypto: URL.createObjectURL(new Blob([file], {type: message.text!})),
        owner: message.senderId === this.id,
        senderName: message.senderName,
        senderId: message.senderId,
        file: true,
        fileContent: file
      }
      console.log(msg)
    return msg;
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
  decryptMessage(cryptoMsg: Message): Message {
    let text = "";
    if (cryptoMsg.algorithm === EncryptionType.None)
      return cryptoMsg;
    else if (cryptoMsg.algorithm === EncryptionType.RC4)
      text = this.rc4.Decrypt(cryptoMsg.crypto);
    else if (cryptoMsg.algorithm === EncryptionType.XTEA)
      text = this.xtea.Decrypt(cryptoMsg.crypto);
    const msg: Message = {algorithm: cryptoMsg.algorithm, text:text, crypto:cryptoMsg.crypto, owner: cryptoMsg.senderId === this.id, senderName: cryptoMsg.senderName, senderId: cryptoMsg.senderId, file: false, fileContent: null};
    return msg;
  }

  decryptFile(cryptoMsg: Message): Uint8Array | null {
    let file: File | null = null;
    cryptoMsg.fileContent = new Uint8Array(cryptoMsg.fileContent! as Uint8Array);
    // const fileReader = new FileReader();
    // console.log(cryptoMsg.fileContent);
    // const blob = new Blob([cryptoMsg.fileContent!], {type: cryptoMsg.text!})
    // console.log(blob);
    // fileReader.readAsArrayBuffer(cryptoMsg.fileContent!);
    // fileReader.onload = () => {
    //   const hash = fileReader.result?.slice(-24);
    //   const crypto = fileReader.result?.slice(0, -24);
    //   const hashCheck = this.tigerHash.hash(new Uint8Array(fileReader.result as ArrayBuffer));
    //   if (hashCheck !== hash) {
    //     console.log(hash);
    //     console.log(hashCheck);
    //     console.log(`Hash se ne poklapa`);
    //     return null;
    //   }
    //   const fullMsg = this.decryptMessage({...cryptoMsg, crypto: fileReader.result as string});
    //   file = new File([fullMsg.text!], `dekriptovan fajl`, {type: cryptoMsg.text!});
    //   return file;
    // }
    const hash = (cryptoMsg.fileContent as Uint8Array)!.slice(cryptoMsg.fileContent!.length - 24);
    const crypto = (cryptoMsg.fileContent as Uint8Array)!.slice(0, cryptoMsg.fileContent!.length - 24);
    console.log(crypto);
    const hashCheck = this.tigerHash.hash(new Uint8Array(crypto));
    if (JSON.stringify(hash) !== JSON.stringify(hashCheck)) {
      console.log(hash);
      console.log(hashCheck);
      console.log(`Hash se ne poklapa`);
      return null;
    }
    const fullMsg = this.decryptMessage({...cryptoMsg, crypto: crypto.reduce((acc, curr) => acc + String.fromCharCode(curr), '')});
    const bytes = new Uint8Array(fullMsg.text!.split(``).map((char) => char.charCodeAt(0)));
    file = new File([bytes], `dekriptovan fajl`, {type: cryptoMsg.text!})
    return bytes;
  }
}
