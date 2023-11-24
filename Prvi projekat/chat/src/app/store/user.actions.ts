import { createAction, props } from "@ngrx/store";

export const AddUsername = createAction(`[User] Add Username`, props<{username: string}>());