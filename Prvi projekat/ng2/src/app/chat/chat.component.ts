import { AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ChatService } from './chat.service';
import { Message } from '../models/message.dto';
import { EncryptionType } from '../models/algorithms';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked{
  @ViewChild('scrollable') private myScrollContainer: ElementRef = new ElementRef('scrollable');
  messages: Message[] = [];
  toggleEncryption: boolean = false;
  encryptionType: EncryptionType = EncryptionType.RC4;
  messages$ = this.service.messageStream.subscribe((message) => {
    console.log(message);
    this.messages.push(message);
  });
  messageText : string = '';
  constructor(private service: ChatService) {
    window.onbeforeunload = () => this.ngOnDestroy();
   }
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

  switchEncryption(){
    if (this.encryptionType === EncryptionType.RC4)
      this.encryptionType = EncryptionType.XTEA;
    else
      this.encryptionType = EncryptionType.RC4;
  }
  scrollToBottom():void {
    try {
        this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch(err) { }                 
  }

  sendMessage(){
    this.service.sendMessage(this.messageText, this.encryptionType);
    this.messageText = '';
  }
}
