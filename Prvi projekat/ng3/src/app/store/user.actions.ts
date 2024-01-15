import { createAction, props } from "@ngrx/store";
import { EncryptionType } from "../models/algorithms";

export const AddUsername = createAction(`[User] Add Username`, props<{username: string}>());

export const ChangeEncryptionType = createAction(`[User] Change Encryption Type`, props<{encryptionType: EncryptionType}>());