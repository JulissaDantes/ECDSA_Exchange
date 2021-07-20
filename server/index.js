const express = require('express');
const app = express();
const cors = require('cors');
const port = 3042;
const EC = require('elliptic').ec;
const ec = new EC('curve25519');
const ec1 = new EC('secp256k1');
const SHA256 = require('crypto-js/sha256');

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

class Account{
	constructor(keyPair, balance){
	this.accountName = keyPair.getPublic().encode('hex').toString().substr(24)
	this.publicKey = keyPair.getPublic().encode('hex').toString()
	this.privateKey = keyPair.getPrivate().toString('hex')
	this.balance = balance
	}
}
let runnning = false;
const accounts = []
accounts.push(new Account(ec.genKeyPair(),100))
accounts.push(new Account(ec.genKeyPair(),50))
accounts.push(new Account(ec.genKeyPair(),75))

function printInfo(){
	console.log("Available accounts: \n =================" )
	for(let account of accounts){
		console.log("(",accounts.indexOf(account),") ", account.accountName," (",account.balance,"ETH)")
	}
	console.log("Private Keys:\n =================")
	for(let account of accounts){
		console.log("(",accounts.indexOf(account),")", account.privateKey)
	}
}

app.get('/balance/:address', (req, res) => {
  const {address} = req.params;
  const crrtAccount = accounts.find(acc => acc.accountName.toLowerCase() == address.toLowerCase()) || 0;
  const balance = crrtAccount.balance;
  res.send({ balance });
});

app.post('/send', (req, res) => {
console.log('This is middleware', req.originalUrl);
	if(!runnning){
		runnning= true
	  const {transaction, signature, privateKey} = req.body;
	  const senderAccount = accounts.find(acc => acc.accountName.toLowerCase() == transaction.sender.toLowerCase());
	  const recipientAccount = accounts.find(acc => acc.accountName.toLowerCase() == transaction.recipient.toLowerCase());

	 //Verifies user has the right to transfer funds 
     const key = ec1.keyFromPrivate(req.body.key.priv, 'hex');
	 console.log("Am i getting a defined key:", key, 'full body',req.body.key.priv);
	 const hash = SHA256(JSON.stringify(transaction)).toString();
	 	 console.log("I exploded after this ln and this is my key",key,'and public is ',key.getPublic().encode('hex'));
	  if(key.verify(hash, signature)){
		   //removes from sender
		   senderAccount.balance -= Number(transaction.amount);
		   //adds amount to recipient	 
		   console.log("public receipient:",recipientAccount.accountName);	   
		   recipientAccount.balance += Number(transaction.amount);
	  }else{
		  throw new Error('This shall not pass')
	  }
	  printInfo();
	  runnning = false
	  res.send( {balance: senderAccount.balance} );
	}else{
		  res.send( {balance: 0} );
	}

});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
  printInfo();
});
