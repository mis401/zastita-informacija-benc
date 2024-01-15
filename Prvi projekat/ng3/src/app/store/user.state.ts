import { EncryptionType } from "../models/algorithms";

export interface UserState {
    username: string | null;
    id: string | null;
    encryptionType: EncryptionType;
}

export const initialUserState: UserState = {
    username: null,
    id: null,
    encryptionType: EncryptionType.RC4
}