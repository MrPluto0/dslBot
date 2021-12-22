/* eslint-disable no-multi-str */

// const { JSEncrypt } = require('nodejs-jsencrypt');
const { JSEncrypt } = require('encryptlong');
const fs = require('fs');
const { resolve } = require('path');

// Buffer.toString()
const pubKey = fs.readFileSync(resolve(__dirname, './static/rsa_1024_pub.pem')).toString();

const privKey = fs.readFileSync(resolve(__dirname, './static/rsa_1024_priv.pem')).toString();

/**
 * @exports encrypt the string
 */
module.exports = {

  /**
   * encrypt the string by publicKey
   * @param {String} string going to be encrypted
   * @returns
   */
  publicEncrypt(str) {
    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(pubKey);
    return encrypt.encryptLong(str);
  },

  /**
   * decrypt the string by privateKey
   * @param {String} string going to be decrypted
   * @returns
   */
  privateDecrypt(str) {
    const encrypt = new JSEncrypt();
    encrypt.setPrivateKey(privKey);
    return encrypt.decryptLong(str);
  },
};
