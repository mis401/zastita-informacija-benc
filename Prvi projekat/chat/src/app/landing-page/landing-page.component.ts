import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { User } from '../models/user.model';
import { UserState } from '../store/user.state';
import { AddUsername } from '../store/user.actions';
import { Router } from '@angular/router';
import { TigerHash } from '../hash/TigerHash';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent {
  constructor(private store: Store<UserState>, private router: Router) {
    console.log(import.meta.env.NG_APP_SECRET);
    console.log(import.meta.env.NG_APP_API_URL);
    const hasher = new TigerHash();
    //4 puta test
    console.log(hasher.hash(Uint8Array.from("Lorem ipsum dolor sit amet, consectetur adipiscing elit. In rutrum ut leo at pharetra. Nullam imperdiet cursus magna. Phasellus efficitur purus at lacus vulputate dignissim. Cras quis libero ut turpis accumsan gravida. Phasellus rhoncus aliquam elit, at luctus mauris porttitor sit amet. Praesent eget est molestie, gravida justo in, mattis justo. Nunc non fermentum enim. Integer magna nisl, eleifend at augue eget, molestie viverra arcu. Integer ac egestas augue. Ut nec dictum metus, in euismod massa. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Vivamus tempus imperdiet ipsum at egestas. Cras pretium vulputate tortor, et varius mauris. Vestibulum felis justo, pellentesque sed semper sed, dignissim id felis. Nunc vulputate ligula id mi".split('').map((char) => char.charCodeAt(0)))));

  }

  username: string = '';

  redirect() {
    this.store.dispatch(AddUsername({ username: this.username }));
    this.router.navigate(['/chat']);
  }
}
