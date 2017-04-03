# node-gestpay-iframe

In this project you'll see an example e-commerce that will pay through Gestpay iFrame solution. 

## Prerequisites 

- NodeJS (4+)

## How to start 

- install the dependencies: `npm install`
- open file `properties.json` and set your `shopLogin`
- configure your server's ip address in Gestpay Merchant Back Office 
- launch the app with `npm start`

## Under the hood 
This example tries to be as simple as possible. Here is a list of npm packages used: 

- [Express](https://expressjs.com), a web framework. 
- [Handlebars](http://handlebarsjs.com), to render html templates 
- [Soap](https://www.npmjs.com/package/soap), a node package to interact with SOAP endpoints.  

## There's more

- `npm run watch`: will run the app but for every modification it will reload instantly. Useful during development. 
- `npm test`: will run all the tests
- `npm run test-watch`: if you change something, tests will re-run
- `npm run jsdoc`: you might like to have some documentation about the two modules used in this project, check it `out`. 

## Notable Files 

- `app.js`: this file contains all the front-end logic for iFrame solution to work. 
- `utils.js`: some utility functions, like showing errors, or getting cookies.
- `server.js` : contains all the express logic and configuration. 
- `gestpay_service/GestpayService.js`: used for communicating between server.js and wscryptdecrypt.js 
- `wscryptdecrypt/wscryptdectypt.js`: the low level file that will perform the soap calls to Gestpay. 
- `properties.json`: a file with some global properties. 

## A brief description of the user interaction

- The main entry point is `/`, where the user can choose a product to pay. 
- After clicking on _buy_ button, the server will ask Gestpay for an `encryptionString` and the user will redirect to `/pay`. 
- at `/pay` the user must insert the credit card data. Then he will click on _Pay_ button. 
- When the user clicks on _pay_, the payment is sent to Gestpay via an hidden iFrame. 
	- if the credit card is not 3d-secure, the result will be immediately shown to the user by redirecting him to `/response`.
	- If the credit card is 3d-secure, Gestpay will answer with errorCode 8006. You must redirect the user to a credit card company's page where the user will insert his private token. Then, the user is redirected to `/response`.  
- When the payment is completed, on `/response`, our server will decrypt the `encryptionString` received, and the transaction status is showed to the user. 