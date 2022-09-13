import { _SC_crypto } from "../utilities/crypto_class.mjs";
const _crypto = new _SC_crypto()
export async function generateKeypair(sarcatConfig){
    _crypto.keyPairGeneration()
}

generateKeypair()