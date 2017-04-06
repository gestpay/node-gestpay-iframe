const expect = require('expect');
//const rewire = require('rewire');

let GestpayService = require('./GestpayService');
let properties = require('../properties');

describe('GestpayService', () => {
  //initialization
  let gestpayService = new GestpayService();

  it('should request a cryptedString to Gestpay', () => {
    return gestpayService
      .encrypt({
        amount: '12'
      })
      .then(cryptedString => {
        expect(cryptedString).toBeA('string');
        expect(cryptedString.length).toBeGreaterThan(20);
      });
  });

  it('should Decrypt the string (with a mock)', () => {
    //mock wsCryptDecrypt.decrypt method
    expect.spyOn(gestpayService.wsCryptDecrypt, 'decrypt').andReturn(
      Promise.resolve({
        TransactionType: 'DECRYPT'
      })
    );

    let decryptObj = {
      cryptedString: 'abcdefghijklmno'
    };

    return gestpayService.decrypt(decryptObj).then(result => {
      expect(result).toBeAn('object').toInclude({
        TransactionType: 'DECRYPT'
      });
      expect(gestpayService.wsCryptDecrypt.decrypt).toHaveBeenCalledWith({
        shopLogin: properties.shopLogin,
        CryptedString: decryptObj.cryptedString
      });
    });

    gestpayService.decrypt.restore();
  });
});
