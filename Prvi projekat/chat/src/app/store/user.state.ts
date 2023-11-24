export interface UserState {
    username: string | null;
    id: string | null;
}

export const initialUserState: UserState = {
    username: null,
    id: null
}