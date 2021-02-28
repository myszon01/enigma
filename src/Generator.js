'use strict';
const crypto = require("crypto")
const sss = require('shamirs-secret-sharing')


const getDecriptEncriptOptions = {
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
}

const THRESHOLD = 2

module.exports = {

    generatePublicKeyAndPrivateKeyShards: (sharesNum) => {

        const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
            // The standard secure default length for RSA keys is 2048 bits
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
              },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem'
              }
        })
        
        const privateKeyShares = sss.split(privateKey, { shares: sharesNum, threshold: THRESHOLD })
        
        return {publicKey, privateKey, privateKeyShares}
    },

    encriptPublic: (data, publicKey) => {
        return crypto.publicEncrypt(
            {
                key: publicKey,
                ...getDecriptEncriptOptions
            },
            Buffer.from(data)
        ).toString("base64")
    },

    decriptData: (data, privateKey) => {
        return crypto.privateDecrypt(
            {
                key: privateKey,
                ...getDecriptEncriptOptions
            },
            new Buffer.from(data, 'base64')
        ).toString()
    },

    assemblePrivateKey: (privateShares) => {
        return sss.combine(privateShares)
    }
}

