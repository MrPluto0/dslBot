/* eslint-disable no-multi-str */
const { JSEncrypt } = require('encryptlong');

const pubKey = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCouVyMYnx0tWGhE5/f1/LioeFD \
    f2yoKBEliqEir1f7yczGPKrvHrJl+0EWgO9kBkPb2niURARW94IGnFDv/nH+tsli \
    1rD6ta4gGDBSGUJ897r+D5Tgq+P/IL605nVTvTzoXYrhrmHWsbpUS8Bu+WRndPCJ \
    l48kqDwI806PnC5ivQIDAQAB';

export default {
  /**
   * encrypt the string by publicKey
   * @param {String} string going to be encrypted
   * @returns
   */
  publicEncrypt(str) {
    console.log(str);
    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(pubKey);
    return encrypt.encryptLong(str);
  },
};
