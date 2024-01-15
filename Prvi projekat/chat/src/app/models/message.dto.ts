import { EncryptionType } from "./algorithms";

export interface Message{
    algorithm: EncryptionType,
    text: string | null;
    crypto: string;
    owner: boolean;
    senderName: string;
    senderId: string;
    file: boolean;
    fileContent: File | Uint8Array | null;
}