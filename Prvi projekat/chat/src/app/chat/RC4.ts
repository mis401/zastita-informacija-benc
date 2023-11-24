export class RC4 {
    private S: Uint8Array | null;
    constructor() {
        this.S = null;
    }
    public EncryptDecrypt(message: string){
        this.S = this.KSA(import.meta.env.NG_APP_SECRET);
        console.log(`Pre PRGA S je ${this.S}`);
        const coded = this.PRGA(message);
        return coded;
    }
    private KSA(key: string) {
        console.log(`Radim KSA`);
        let S = new Uint8Array(256);
        for (let i = 0; i < 256; i++) {
            S[i] = i;
        }
        let j = 0;
        for (let i = 0; i < 256; i++) {
            j = (j + S[i] + key.charCodeAt(i % key.length)) % 256;
            let tmp = new Uint8Array(1);
            tmp[0] = S[i]
            S[i] = S[j];
            S[j] = tmp[0];
        }
        console.log(`Na kraju KSA S je: ${S}`);
        return S;
    }
    private PRGA(message: string) {
        let i = 0;
        let j = 0;
        if (!this.S) {
            this.S = this.KSA(import.meta.env.NG_APP_SECRET);
        }
        let cipher = new Uint8Array(message.length);
        let messageArray = message.split('').map((char) => char.charCodeAt(0));
        console.log(messageArray);
        for (let n = 0; n < message.length; n++) {
            i = (i + 1) % 256;
            j = (j + this.S[i]) % 256;
            let tmp = new Uint8Array(1);
            tmp[0] = this.S[i];
            this.S[i] = this.S[j];
            this.S[j] = tmp[0];
            let k = this.S[(this.S[i] + this.S[j]) % 256];
            cipher[n] = messageArray[n] ^ k;
        }

        console.log(`byteMessage ${messageArray}`);
        console.log(`coded ${cipher}`);
        let codedArray: string[] = [];
        for (let i = 0; i < cipher.length; i++) {
            codedArray.push(String.fromCharCode(cipher[i]));
        }
        let coded = codedArray.join('');
        return coded;
    }
}


