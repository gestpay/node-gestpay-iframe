'use strict';
var payModule = (function(BrowserEnabled, GestPay, configuration, util) {
  // BrowserEnabled is set by Gestpay. True if everything is OK
  if (!BrowserEnabled) {
    // if the browser is NOT supported...
    util.showErrors('', 'Browser not supported!', 'start');
    return;
  }

  //If the browser is supported, let's create the payment page.
  // shopLogin and encryptedString come from "/pay" action (see WsCryptEncrypt.encrypt())
  GestPay.CreatePaymentPage(
    configuration.shopLogin,
    configuration.encryptedString,
    pageLoadedCallback
  );

  /**
	 * After Gestpay has verified the page, created the iFrame, this function is called.
	 * Here you can check if the loading is valid. For example, if the shopLogin or the encryptedString are invalid,
	 * you'll get an error inside result.
	 * @param result
	 */
  function pageLoadedCallback(result) {
    // 10 means everything OK.
    //if ErrorCode is not 10, an error has occurred
    //result.ErrorCode will return the Error occurred
    //Result.ErrorDescription will return the Error Description
    if (result.ErrorCode != 10) {
      util.showErrors(
        result.ErrorCode,
        result.ErrorDescription,
        'pageLoadedCallback'
      );
      return;
    }

    // until now, the "Pay" button has been disabled. Since Gestpay has succesfully created the iframe, we can
    // enable the button.
    if (document.getElementById('submit')) {
      document.getElementById('submit').disabled = false;
      document.getElementById('submit').setAttribute('value', 'Pay');
    }

    // the PaRes variable is defined during the 3D-Secure process; after the 3D-Secure validation, this file is
    // re-called with a new PaRes variable. It will be used in "pay-secure.hbs" template.
    var PaRes = configuration.PaRes;

    if (PaRes) {
      var transKey = util.getCookie('transKey');
      handle3Dsecurity(PaRes, transKey);
    }
  }

  /**
	 * This is the only function exposed outside this js module. It is called when the user clicks on "pay".
	 * It will read data from the form and send the payment to Gestpay. Then, the paymentCompletedCallback is called.
	 * @returns {boolean} false to say that no other action must occour in the form.
	 */
  function checkCC() {
    document.getElementById('submit').disabled = true;
    GestPay.SendPayment(
      {
        CC: document.getElementById('CC').value,
        EXPMM: document.getElementById('ExpMM').value,
        EXPYY: document.getElementById('ExpYY').value,
        CVV2: document.getElementById('CVV2').value
      },
      paymentCompletedCallback
    );
    return false;
  }

  /**
	 * Once Gestpay has given a response, this function is called.
	 * If the card is not 3D-Enrolled, and the transaction is OK, result.ErrorCode will be 0.
	 * If the card is 3D-Enrolled, then another step is necessary. result.ErrorCode will be 8006.
	 * Else, we'll have an error.
	 * @param result Gestpay errorCodes and errorDescription.
	 */
  var paymentCompletedCallback = function(result) {
    if (result.ErrorCode == 0) {
      //Call went good. proceed to decrypt the Result.EncryptedResponse property
      redirectToResponsePage(result);
    } else if (result.ErrorCode == 8006) {
      // 8006 : Card holder authorization required
      start3DSecureVerification(result);
    } else {
      //Call failed for other errors
      //.... place here error handle code...
      util.showErrors(
        result.ErrorCode,
        result.ErrorDescription,
        'paymentCompletedCallback'
      );
    }
  };

  /**
	 * This function will redirect the user to the 3DSecure page from Gestpay.
	 * @param result
	 */
  function start3DSecureVerification(result) {
    //Get the TransKey
    //NOTE: you have to store this value somewhere (for example, in a cookie)
    //for further use. After the redirect, you'll need this.
    document.cookie = 'transKey=' + result.TransKey;
    //Store the encrypted string required to access the issuer authentication page
    document.cookie = 'encryptedString= ' + configuration.encryptedString;
    //Store the shopLogin required to access the issuer authentication page
    document.cookie = 'shopLogin=' + configuration.shopLogin;
    //Get the VBVRisp; we will need it soon !
    var VBVRisp = result.VBVRisp;

    //place here the code to redirect the card holder to the authentication website
    // similar behavior as an HTTP redirect
    var gestpay3dUrl = configuration.testEnv 
      ? 'https://sandbox.gestpay.net/pagam/pagam3d.aspx'
      : 'https://ecomm.sella.it/pagam/pagam3d.aspx';
    //after the 3d authentication, gestpay will redirect to this url:
    var baseUrl = util.getCookie('base_url');
    var redirectUrl = location.origin + baseUrl + '/pay-secure';
    document.location.replace(
      gestpay3dUrl +
        '?a=' +
        configuration.shopLogin +
        '&b=' +
        VBVRisp +
        '&c=' +
        redirectUrl
    );
  }

  /**
	 * If 3DSecure validation has been performed, this method will be called. transKey was saved in
	 * start3DSecureVerification function (at the first step), while PaRes is coming from Gestpay (second step).
	 * @param PaRes
	 * @param transKey
	 */
  function handle3Dsecurity(PaRes, transKey) {
    GestPay.SendPayment(
      {
        TransKey: transKey,
        PARes: PaRes
      },
      paymentSuccededCallback
    );
  }

  function redirectToResponsePage(result) {
    document.location.replace(
      'response?a=' + configuration.shopLogin + '&b=' + result.EncryptedString
    );
  }

  /**
	 * Called when the payment succeded (we hope so)
	 * @param result
	 */
  function paymentSuccededCallback(result) {
    if (result.ErrorCode != 0) {
      //Call failed an error has occurred
      util.showErrors(
        result.ErrorCode,
        result.ErrorDescription,
        'paymentSuccededCallback'
      );
    } else {
      //Call went good
      redirectToResponsePage(result);
    }
  }

  /**
	 * the only method exposed by this module is checkCC, others are internal 
	 */

  return {
    checkCC: checkCC
  };
})(window.BrowserEnabled, window.GestPay, window.configuration, util);
