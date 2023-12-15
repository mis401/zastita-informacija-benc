import { EncryptionType } from "./algorithms";

export interface User {
    username: string | null;
    id: string | null;
    encryptionType: EncryptionType | null;
}