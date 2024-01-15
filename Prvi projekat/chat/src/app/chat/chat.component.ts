import { AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ChatService } from './chat.service';
import { Message } from '../models/message.dto';
import { EncryptionType } from '../models/algorithms';
import { Store } from '@ngrx/store';
import { User } from '../models/user.model';
import { UserState } from '../store/user.state';
import { ChangeEncryptionType } from '../store/user.actions';
import { TigerHash } from '../hash/TigerHash';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked{
  constructor(private service: ChatService, private store: Store<UserState>) {
    window.onbeforeunload = () => this.ngOnDestroy();
    
  }
  @ViewChild('scrollable') private myScrollContainer: ElementRef = new ElementRef('scrollable');
  @ViewChild('messageText') private messageTextElement: ElementRef = new ElementRef('messageText');

  messages: Message[] = [];
  file: File | null = null;
  toggleEncryption: boolean = false;
  encryptionType: EncryptionType = EncryptionType.RC4;
  messages$ = this.service.messageStream.subscribe((message) => {
    console.log(message);
    if (message.file){
      const file = new File([message.fileContent!], '', {type: message.text!});
      message.fileContent = file;
      message.text = file.name;
    }
    this.messages.push(message);
  });
  messageText : string = '';
  ngOnInit(){
    this.service.connect();
    
  }
  
  ngOnDestroy(): void {
    console.log(`Destroy pozvan`);
    this.service.disconnect();
  }
  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  onFileSelected(event: any) {
    this.file = event.target.files[0];
    
  }

  switchEncryption(){
    if (this.encryptionType === EncryptionType.RC4) {
      this.encryptionType = EncryptionType.XTEA;
      this.store.dispatch(ChangeEncryptionType({encryptionType: EncryptionType.XTEA}));
    }
    else {
      this.encryptionType = EncryptionType.RC4;
      this.store.dispatch(ChangeEncryptionType({encryptionType: EncryptionType.RC4}));
    }
  }
  scrollToBottom():void {
    try {
        this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch(err) { }                 
  }

  sendMessage(){
    if(!this.file && !this.messageText)
      return;
    if (this.file){
      this.service.sendFile(this.file, this.encryptionType);
      this.file = null;
      return;
    }
    this.service.sendMessage(this.messageText, this.encryptionType);
    this.messageText = '';
  }
}
