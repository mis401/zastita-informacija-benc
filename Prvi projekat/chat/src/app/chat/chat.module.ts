import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatComponent } from './chat.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { Features } from '../Features';
import { userReducer } from '../store/user.reducer';


@NgModule({
  declarations: [
    ChatComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    StoreModule.forFeature(Features.User, userReducer),
  ],
  exports:[ChatComponent]
})
export class ChatModule { }
