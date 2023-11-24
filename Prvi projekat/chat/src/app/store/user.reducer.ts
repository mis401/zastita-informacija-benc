import { createReducer, on } from "@ngrx/store";
import { initialUserState } from "./user.state";
import { AddUsername } from "./user.actions";
import { v4 as uuid } from 'uuid';

export const userReducer = createReducer(
    initialUserState,
    on(AddUsername, (state, { username }) => ({ ...state, username: username, id: uuid() })
));