import { Injectable } from "@angular/core";
import { createFeatureSelector, createSelector } from "@ngrx/store";
import { User } from "../models/user.model";
import { Features } from "../Features";

export const userSelector = createFeatureSelector<User>(Features.User);

export const selectUsername = createSelector(userSelector, (state: User) => state.username);
export const selectId = createSelector(userSelector, (state: User) => state.id);