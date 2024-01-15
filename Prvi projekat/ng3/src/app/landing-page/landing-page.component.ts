import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { User } from '../models/user.model';
import { UserState } from '../store/user.state';
import { AddUsername } from '../store/user.actions';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent {
  constructor(private store: Store<UserState>, private router: Router) {
    console.log(import.meta.env.NG_APP_SECRET);
    console.log(import.meta.env.NG_APP_API_URL);
  }

  username: string = '';

  redirect() {
    this.store.dispatch(AddUsername({ username: this.username }));
    this.router.navigate(['/chat']);
  }
}
