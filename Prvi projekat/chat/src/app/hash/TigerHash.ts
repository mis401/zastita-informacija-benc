import { IHash } from "./IHash";
import { SBox } from "./tiger-s-boxes";

export class TigerHash implements IHash {
    padding(data: Uint8Array): Uint8Array {
        //padding
        const dataLength = data.length;
        const paddingLength = (56 - (dataLength % 56) === 0) ? 56 : 56 - (dataLength % 56);
        const padding = new Uint8Array(paddingLength).fill(0x00);
        padding[0] = 0x01;
        const littleEndianLength = new Uint8Array(8).fill(0x00);
        console.log(dataLength)
        let dataLengthPrep = dataLength
        for (let i = 0; i < 8; i++) {
            littleEndianLength[i] = dataLengthPrep % 256;
            //potrebno je celobrojno deljenje ali typescript :(
            dataLengthPrep = dataLengthPrep >>> 8;
        }
        const paddedData = new Uint8Array([...data, ...padding, ...littleEndianLength]);

        return paddedData;
    }

    
    hash(data: Uint8Array): Uint8Array {
        let h0 = 0x0123456789ABCDEFn
        let h1 = 0xFEDCBA9876543210n
        let h2 = 0xF096A5B4C3D2E187n

        data = this.padding(data);
        for (let block = 0; block < data.length; block += 64) {
            let a = h0;
            let b = h1;
            let c = h2;

            const segment = data.slice(block, block + 64);
            const w = new BigUint64Array(8);
            for (let i = 0; i < 8; i++) {
                w[i] = segment.slice(i*8, i*8+8).reduce((acc, curr, index) => acc + BigInt(curr) * (256n ** BigInt(index)), 0n);
            }


            for (let pass = 0; pass < 3; pass++) {
                for (let round = 0; round < 7; round++) {
                    c = c ^ w[round];
                    let c_copy = c;
                    const c_array = new Uint8Array(8).fill(0);
                    for (let i = 0; i < 8; i++) {
                        c_array[i] = Number(c_copy % 256n);
                        c_copy = c_copy >> 8n;
                    }
                    a = a - SBox[c_array[0]] ^ SBox[256+c_array[2]] ^ SBox[512+c_array[4]] ^ SBox[768+c_array[6]];
                    b = b + SBox[768+c_array[1]] ^ SBox[512+c_array[3]] ^ SBox[256+c_array[5]] ^ SBox[c_array[7]];
                    b = b*BigInt(round+1)
                }

                if (pass === 0) {
                    w[0] = w[0] - (w[7] ^ 0xA5A5A5A5A5A5A5A5n)
                    w[1] = w[1] ^ w[0]
                    w[2] = w[2] + w[1]
                    w[3] = w[3] - (w[2] ^ ((-w[1]) << BigInt(19)))
                    w[4] = w[4] ^ w[3]
                    w[5] = w[5] + w[4]
                    w[6] = w[6] - (w[5] ^ ((-w[4]) >> BigInt(23)))
                    w[7] = w[7] ^ w[6]
                }
                if (pass === 1){
                    w[0] = w[0] + w[7]
                    w[1] = w[1] - (w[0] ^ ((-w[0]) << BigInt(19)))
                    w[2] = w[2] ^ w[1]
                    w[3] = w[3] + w[2]
                    w[4] = w[4] - (w[3] ^ ((-w[2]) >> BigInt(23)))
                    w[5] = w[5] ^ w[4]
                    w[6] = w[6] + w[5]
                    w[7] = w[7] - (w[6] ^ 0x0123456789ABCDEFn)
                }
            }
            h0 = (h0 + a) % 2n**64n;
            h1 = (h1 + b) % 2n**64n;
            h2 = (h2 + c) % 2n**64n;
        }
        const result = new Uint8Array(192);
        const h0Array = new Uint8Array(8);
        const h1Array = new Uint8Array(8);
        const h2Array = new Uint8Array(8);
        for (let i = 0; i < 8; i++) {
            h0Array[i] = Number(h0 % 256n);
            h1Array[i] = Number(h1 % 256n);
            h2Array[i] = Number(h2 % 256n);
            h0 = h0 >> 8n;
            h1 = h1 >> 8n;
            h2 = h2 >> 8n;
        }
        return new Uint8Array([...h0Array, ...h1Array, ...h2Array]);
        //return hash.reduce((acc, curr) => acc + String.fromCharCode(curr), '');
    }
}