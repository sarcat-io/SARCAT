import {generateKeyPairSync, createPrivateKey} from 'crypto'
import {MerkleTree} from 'merkletreejs'
import crypto from 'crypto'
import CryptoJS from 'crypto-js'
import SHA256 from 'crypto-js/sha256.js'
import { _SC_utilities } from './index_utilities.mjs'
import { config } from 'process'
import prompt from './promptUser.mjs'
const isObject = new _SC_utilities().isObject
const uuid = new _SC_utilities().uuid

export class _SC_crypto {
    constructor (_SC_classObject){
        for(var main in _SC_classObject){
            this[main] = _SC_classObject[main]
        }
    }
    
    keyPairGeneration = async (password) => {
        if (password){
            var keyPair = generateKeyPairSync('x448', {
                modulusLength: 4096,
                publicKeyEncoding: {
                    type: 'spki',
                    format: 'pem'
                },
                privateKeyEncoding: {
                    type: 'pkcs8',
                    format: 'pem',
                    cipher: 'aes-256-cbc',
                    passphrase: `${password}`
                }
            });
        } else {
            var keyPair = generateKeyPairSync('x448', {
                modulusLength: 4096,
                publicKeyEncoding: {
                    type: 'spki',
                    format: 'pem'
                },
                privateKeyEncoding: {
                    type: 'pkcs8',
                    format: 'pem'
                }
            });
        }
        return keyPair
    }

    decrypt_bundle = async () => {
        
    }
    encrypt_bundle = async () => {
        
    }
    makeHash = async (data) => {
        var hash = CryptoJS.SHA256(data)
        return hash.toString(CryptoJS.enc.Hex)
    }

    signHash = async () => {
        // var cryptoKey_db = await read('cryptoKeys',__datadir)
        if(password){
            var privateKey = createPrivateKey({
                'key': cryptoKey_db[keyUID].privateKey,
                'format': 'pem',
                'type': 'pkcs8',
                'cipher': 'aes-256-cbc',
                'passphrase': password
            });
        } else{
            var privateKey = cryptoKey_db[keyUID].privateKey
        }
        const sign = crypto.createSign('RSA-SHA256');
        sign.update(Buffer.from(txHash))
        return Buffer.from(sign.sign(privateKey)).toString('hex')
    }

    verifyHash = async(txObj, origHash) => {
        return (await simpleHash(txObj) == origHash)
    }

    verifySignHash = async (keyUID, hash, signedHash) => {
        var cryptoKey_db = await read('cryptoKeys',__datadir)
        const verify = crypto.createVerify('RSA-SHA256');
        verify.write(Buffer.from(hash));
        verify.end();
        var verifyOutput = await verify.verify(cryptoKey_db[keyUID].publicKey, signedHash, 'hex')
        return verifyOutput
    }

    seal_bundle = async () => {

    }
    makeMerkle = async (leaves) => {
        //leaves is an array of hashes
        try {
            var wordLeaves = await leaves.map(hash=> CryptoJS.enc.Hex.parse(hash))
            console.log(wordLeaves[1])
            const tree = new MerkleTree(wordLeaves, SHA256)
            return tree.getRoot().toString('hex')
        } catch(err){
            console.log('Make merkle:', err)
        }
    }
    verifyMerkle = async (existingRoot, leaves) =>{
        try {
            var wordLeaves = await leaves.map(hash=> CryptoJS.enc.Hex.parse(hash))
            var wordRoot =  CryptoJS.enc.Hex.parse(existingRoot)
            var tree = new MerkleTree(wordLeaves, SHA256)
            var root = tree.getRoot().toString('hex')
            if(root === existingRoot){
                return true
            } else {
                return false
            } 
        } catch(err){
            console.log('Verify merkle:', err)
            return false
        }
    }
    verifyMerkleProof = async (existingRoot,leafHash, leaves) =>{
        try {
            var wordLeaves = await leaves.map(hash=> CryptoJS.enc.Hex.parse(hash))
            const tree = new MerkleTree(wordLeaves, SHA256)
            const root = tree.getRoot().toString('hex')
            const proof = tree.getProof(CryptoJS.enc.Hex.parse(leafHash))
        
            console.log(tree.verify(proof, leafHash, root))
            if(tree.verify(proof, leafHash, root) && root === existingRoot){
                return true
            } else {
                return false
            } 
        } catch(err){
            console.log('Verify merkle:', err)
            return false
        }
    }

    getKeys = async (role, rmfProgram) => {
        // ned to store public keys for AOs in github
        await this.sarcatConfig.read()
        await this.keyManagement.read()
        if(role='ISSO'){
            var keys = this.keyManagement.data.keyPairs.filter(x=>x.role == role && x.operatorEmail == this.sarcatConfig.data.systemIdentification.operatorEmail)
            if(keys.length > 0){
                var encKeys = await this.loadPrivateKey(keys)
            } else {
                var encKeys = await this.newKeys()
            }
            return encKeys
        } else if(role='AO'){
            var {encKeys} = this.keyManagement.data.keyPairs.filter(x=>x.role == role && x.systemAuthorizingBody == rmfProgram)
            return encKeys.publicKey
        }

    }

    newKeys = async() => {
        var pw = await this.newPassword()
        var signKeys = await this.keyPairGeneration(pw)
        var encKeys = await this.keyPairGeneration(pw)
        this.keyManagement.data.keyPairs.push({uuid:await uuid(), role: this.sarcatConfig.data.config.systemRole, operatorEmail:this.sarcatConfig.data.systemIdentification.operatorEmail, signKeys:signKeys, encKeys:encKeys})
        await this.keyManagement.write()
        return this.keyManagement.data.keyPairs.filter(x=>x.operatorEmail == this.sarcatConfig.data.systemIdentification.operatorEmail)
    }

    loadPrivateKey = async (keys) => {
        var pw = await this.password()
        console.log(keys, pw)
    }

    newPassword = async() => {

        var questions_3 = [
            {
                type: 'password',
                name: 'password1',
                message: `Type in your password`,
                mask: '*'
            },
            {
                type: 'password',
                name: 'password2',
                message: `Confirm password`,
                mask: '-'
            }
        ]
        try {
            var configPrompt_3 = new prompt(questions_3)
            var {password1, password2} = await configPrompt_3.ask()
        } catch(err){
            console.log(err)
        }

        if(password1 === password2){
            return this.makeHash(password1)
        } else {
            return this.newPassword()
        }
    }
    password = async() => {

        var questions_3 = [
            {
                type: 'password',
                name: 'password',
                message: `Type in your password`,
                mask: '-'
            }
        ]
        var configPrompt_3 = new prompt(questions_3)
        var res = await configPrompt_3.ask()
        return this.makeHash() 
    }


}

/**
 * use merkleTree in base manifest to array all hashes
 * var hash_array = [
    "d598d3b6f4efccee5a1c626ee1216eebb7d847595e03d3742e6a73e7e149743c",
    "8224248141f52f7eaf1157da53a5ebe680f0d087c8ba8d4db197faaa5820acba",
    "ac6eca18c15b25c4342dbb8cc9139eec2df561f610771ca492e0c1460ebaefba",
    "00bc58cc23bd3dc649bd9201222f82ef586a8d05042fb647aba398fab2dfc67c",
    "9f5be1e99e4a1629648e6928595f59e0968337f9539f0b72b5cc016715355991",
    "25745e8ca4486f319b4705d5e5fa79060802349b9596523fe7e5a5e883d853bd",
    "fded9fec8dd8535698e44cce9f84ab35784bbde6cec64439e8f1e06337511e90",
    "f616ab6dce5d3eb1cc49981999dcb5ffe563b27e81870ca5cdc50ad99ad3b1c7",
    "dfa66becfbe9483812ebd5bbfecfdb991b239d0a4231fb9fc745e84ae3397906",
    "5433e8c3325d4eb0adf957079a5b929f5c465bbc0f8148dff0b9aead5a457a67",
    "030931ed0e80e37f0651af1505adb4a3b771b02b28f5000f03b947569d64da52",
    "5db040f03b5b4d5dc9f280273594d5ed429e73b83f407be17b971516f02ac202",
    "eea373b44bcc950542815f139a6aa0d0c2694be1d2ebf9ecd3c53b12703bd686",
    "a2367f275a944250356ac95e94092875cd004e77921f8bf4dbb01a6d1797a758",
    "68c1ccce9ace81a28e27bfe2117f3dacf6eb04e1799535cd32187cb9d14c8059",
    "0002afa79c9278f3b530487b5556d39e7b09b2b0caac229b2e815ce25b9cb26b",
    "3095bdc29d7f4b2d81fecbc3235a38ffa00590d91c566d0499b2cbb55317c74c",
    "f2597892379faa3a3b436ec38e96b2cc4fde294dc97f136d4aebad6fbef8af90",
    "cbd4d72afee3701188743c4474de1e90cc3752eef1fb4bf7203a8b31e440c063",
    "2bf160968849651c9a1b98d284ae21d35d5dcda8ca260537c9cdf0e673e0e261",
    "a73e7b9d50c8667552203c7158454788c0a12e4b102c52acec1b9afa47af9cfe",
    "420ea1d7d7c1da94a634a23f3c34ea7a1d3f00349e1c9e17923ae614210b3e3f",
    "ad624d9ff98067b873075a895051bc6bb688069ae41794253d2f98e071b4b7d1",
    "c0bbedeca7409856be6ba0bc2b8de1d9d626ebef2b4e45c353049fa6ef232ece",
    "6209685c20d57fed83bceee2b3893153bc596aa52f728dcb07339e83f9076f3e",
    "e7ab15c10de793e994bf2d5baf641d26809f8313f66b70d89be57ccdb8d3f9c5",
    "0a6fe9ea4ca231be9f1a732bd0a08d08827af17e830314db986022692b8fbcd3",
    "27bf550c7072209aa2dc889c802c7333703cf66203c297931c844b74a96c24d0",
    "d133d26363b600cdcec083d261679c2bb414be1883c0bfcde2558af7c2e4fc79",
    "cae16470223fb7e5a3e0b8d0b42960127cf2a93df7057e1172d77e275887627b",
    "6a731c30c14975106a82ae697107f4cc3b66d99459ae51d366d8f2aa88df170f",
    "7ab99a600d2bc80f30e7b2dc99aa628f5393c50ef2391524aa882f2c45bbfbe5",
    "ddc7a4435dcb5b770a1500612b9b80eef7d77ab5b3841db6902b0cd875a61335",
    "43f6c91f849ef5a792ecf4d16fdf7c05856744db2935b1c4e91a5bbe8fe57f7b",
    "8fb70e61fe73ea12c801d1b6ae3b58fb796a1b0ce64e5d0eb1090e185a3b7bf9",
    "77edbfbe26802a2e214726643b0ef4d36d6985e2026aed6ea7caa616101f5d98",
    "6aae2b26ae59aae7f7ebbfc423a4e3e7d6f85fa8b7cc48a1026317eb82602a24",
    "84846823526d32279753048f5119fb075174a07fddae929ecf9c4e8fde6b1e8a",
    "b3f37d27b56a3d63a6167ab39c63dbeb4fadb53c1fb59bd7c85083bbe9eeb121",
    "31c0853d51e18f226670d74fb3defdb2d6e6cffeb489693affa0721c0be086e5",
    "d520ea3ec6576d747f89a7c9afcf0ee70806885d2e741d9a7f750b62470d739c",
    "c31737be83527e5d0e96a10459c92e03128c95104b4bec7f5720f1d22bdaa446",
    "a27b308811b6170c3718f51f4ed558d842a7f56bc9981b842323ee74a96cd05f",
    "420b2efd7078004eefd2e4454dacf5424691c985cadad2d7ed2c92504fd91aae",
    "8909ca5c870e4d19a646f382a763bbb1e34b1585fb73493cfc32f303f3afac20",
    "7607c500cd38ad32759fd7b2a5d895bf6c263b33b68c720e5b8bd9035bec0879",
    "5314ca7e466b11a21dd9c710efe5e7fbb71a6017a62cc7b93bc12e408b642ec7",
    "97018ddbcc73ed941207af74843b696c759a6e07fbaf6a0ea052b5140a4784dd",
    "10561408b098c5281cf50c2c31940abebf821430b5156438d65a08823322f2ae",
    "f9a389748f74ae920f1168aa1c0ba0aa8f2ae9a962d9ac4acad6ac8d495b1b24",
    "6ead57cb658c975ccd35d8d2903deccdd164758f6e47312a797cc53f3b041eff",
    "4d4c2b43eef0eb03a42aa84539fb6ee1f995ae2a7b30ca17f996b9ec5ce87881"
]

var exTXMerkle =    "ad5ddbab2618140a38dd69b5c797ee9c9b4a694086f6097165cbf82e2af12b38"

var singleTX =    "b3f37d27b56a3d63a6167ab39c63dbeb4fadb53c1fb59bd7c85083bbe9eeb121"

var newMerkle = await makeMerkle(hash_array)

console.log(await verifyMerkleProof(exTXMerkle,singleTX, hash_array))

// console.log(newMerkle, exTXMerkle, newMerkle == exTXMerkle)
 */
