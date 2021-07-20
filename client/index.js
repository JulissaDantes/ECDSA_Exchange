import "./index.scss";

const server = "http://localhost:3042";
const EC = require('elliptic').ec;
const SHA256 = require('crypto-js/sha256');
const ec1 = new EC('secp256k1');

document.getElementById("exchange-address").addEventListener('input', ({ target: {value} }) => {
  if(value === "") {
    document.getElementById("balance").innerHTML = 0;
    return;
  }

  fetch(`${server}/balance/${value}`).then((response) => {
    return response.json();
  }).then(({ balance }) => {
    document.getElementById("balance").innerHTML = balance;
  });
});

document.getElementById("transfer-amount").addEventListener('click', () => {
  const sender = document.getElementById("exchange-address").value;
  const amount = document.getElementById("send-amount").value;
  const recipient = document.getElementById("recipient").value;
  const privateKey = document.getElementById("private-key").value;

  const transaction = {
    amount, recipient, sender, privateKey
  }

  const key = ec1.keyFromPrivate(privateKey, 'hex');
	console.log("is the first key defined:",key);
  const signature = key.sign(SHA256(JSON.stringify(transaction)).toString());
console.log("is the first sig defined:",signature);
  const body = JSON.stringify({
    transaction, signature:signature.toDER('hex'), privateKey: privateKey
  });

  const request = new Request(`${server}/send`, { method: 'POST', body });

  fetch(request, { headers: { 'Content-Type': 'application/json' }}).then(response => {
    return response.json();
  }).then(({ balance }) => {
    document.getElementById("balance").innerHTML = balance;
  });
});
