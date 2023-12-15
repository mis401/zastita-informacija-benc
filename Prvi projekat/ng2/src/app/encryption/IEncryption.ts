export interface IEncryption {
    Encrypt(message: string): string;
    Decrypt(message: string): string;
}