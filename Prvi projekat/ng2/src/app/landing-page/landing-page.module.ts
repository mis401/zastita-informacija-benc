import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingPageComponent } from './landing-page.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { Features } from '../Features';
import { userReducer } from '../store/user.reducer';



@NgModule({
  declarations: [
    LandingPageComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    StoreModule.forFeature(Features.User, userReducer),
  ],
  exports:[LandingPageComponent]
})
export class LandingPageModule { }
