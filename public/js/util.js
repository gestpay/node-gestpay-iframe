/**
 * Created by michelenasti on 21/03/17.
 */
'use strict';
var util = (function() {

	//private functions
	function showErrors(errorCode, errorDescription, phase) {
		var errorSection = document.getElementById('errorSection');
		errorSection.classList.remove('is-hidden');
		var errorCodeDiv = document.getElementById('ErrorCode');
		errorCodeDiv.innerHTML = errorCode;
		var errorDescriptionDiv = document.getElementById('ErrorDescription');
		errorDescriptionDiv.innerHTML = phase + '<br>' + errorDescription;
	}

	function getCookie(cname) {
		var name = cname + "=";
		var ca = document.cookie.split(';');
		for(var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			}
		}
		return "";
	}

	return {
		showErrors: showErrors,
		getCookie: getCookie
	}

}());