import { IEncryption } from "./IEncryption";

export class XTEA implements IEncryption {
    private keyByteArray = Uint8Array.from(import.meta.env.NG_APP_XTEA_KEY.split(' ').map((char) => parseInt(char)));
    private key : number[] = []
    private delta=0x9E3779B9;

    constructor() {
        console.log(this.keyByteArray);
        for (let i = 0; i < 4; i++){
            console.log(parseInt(this.keyByteArray.slice(i*4, i*4+4).join('')))
            const fourBytesArray = Uint32Array.from(this.keyByteArray.slice(i*4, i*4+4));
            const fourBytes = fourBytesArray[0] << 24 | fourBytesArray[1] << 16 | fourBytesArray[2] << 8 | fourBytesArray[3];
            console.log(fourBytes)
            this.key.push(fourBytes);
        }
        console.log(this.key)
    }

    public Encrypt(message: string) : string {
        const blocks = this.Blockify(message);
        let cyphertext = new Uint32Array(blocks.length);
        let iv0 = 0;
        let iv1 = 0;
        for (let i = 0; i < blocks.length / 2; i+=2) {
            const u0 = blocks[i] ^ iv0;
            const u1 = blocks[i + 1] ^ iv1;
            const [v0, v1] = this.encryptBlock(u0 >>> 0, u1 >>> 0, 32);
            cyphertext.set([v0, v1], i);
            iv0 = v0;
            iv1 = v1;
        }
        console.log(cyphertext.join(' '));
        return cyphertext.join(' ');
    }
    public Decrypt(message: string): string {
        const message32Array = Uint32Array.from(message.split(' ').map((char) => parseInt(char)));
        let iv0 = 0;
        let iv1 = 0;
        let u0, u1;
        let plaintextArray = [];
        for (let i = 0; i < message32Array.length / 2; i+=2) {
            [u0, u1] = this.DecryptBlock(message32Array[i], message32Array[i + 1], 32);
            plaintextArray.push(u0 ^ iv0);
            plaintextArray.push(u1 ^ iv1);
            iv0 = message32Array[i];
            iv1 = message32Array[i + 1];
        }
        let byteArray = new Uint8Array(plaintextArray.length * 4);
        for (let i = 0; i < plaintextArray.length; i++) {
            byteArray.set([plaintextArray[i] >>> 24], i*4+0);
            byteArray.set([plaintextArray[i] >>> 16], i*4+1);
            byteArray.set([plaintextArray[i] >>> 8], i*4+2);
            byteArray.set([plaintextArray[i] >>> 0], i*4+3);
        }
        if (byteArray[byteArray.length - 1] < 8) {
            const padding = byteArray[byteArray.length - 1];
            console.log(padding);
            const sliced = byteArray.slice(0, byteArray.length - padding);
            byteArray = sliced;
        }
        console.log(plaintextArray);
        console.log(byteArray)
        const txtDecoder = new TextDecoder();
        const plaintext = txtDecoder.decode(byteArray);
        return plaintext;
    }
    
    private encryptBlock(v0: number, v1: number, rounds: number) {
        let sum = 0;
        for (let i = 0; i < rounds; i++) {
            v0 += (((v1 << 4) ^ (v1 >> 5)) + v1) ^ (sum + this.key[sum & 3]);
            sum += this.delta;
            v1 += (((v0 << 4) ^ (v0 >> 5)) + v0) ^ (sum + this.key[(sum >> 11) & 3]);
        }
        return [v0, v1];
    }
    
    private DecryptBlock(v0: number, v1: number, rounds: number) {
        let sum = this.delta * rounds;
        for (let i = 0; i < rounds; i++) {
            v1 -= (((v0 << 4) ^ (v0 >> 5)) + v0) ^ (sum + this.key[(sum >> 11) & 3]);
            sum -= this.delta;
            v0 -= (((v1 << 4) ^ (v1 >> 5)) + v1) ^ (sum + this.key[sum & 3]);
        }
        return [v0, v1];
    }

    private Blockify(message: string) {
        const txtEncoder = new TextEncoder();
        let messageInBytes = txtEncoder.encode(message);
        let paddedMessage = messageInBytes;
        const paddingRequired = messageInBytes.length % 8;
        console.log(paddingRequired);
        if (paddingRequired){
            const paddingBytes = new Uint8Array(8 - paddingRequired);
            paddingBytes.fill(8 - paddingRequired)
            paddedMessage = new Uint8Array([...messageInBytes, ...paddingBytes]);
        }
        let blocks = [];
        for (let i = 0; i < paddedMessage.length; i += 4) {
            const fourBytesArray = paddedMessage.slice(i, i + 4);
            console.log(fourBytesArray);
            const fourBytes = fourBytesArray[0] << 24 | fourBytesArray[1] << 16 | fourBytesArray[2] << 8 | fourBytesArray[3];
            blocks.push(fourBytes);
            console.log(fourBytes);
        }
        return blocks;
    }


}