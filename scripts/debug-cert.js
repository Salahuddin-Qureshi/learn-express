const selfsigned = require('selfsigned');
const attrs = [{ name: 'commonName', value: 'localhost' }];
const pems = selfsigned.generate(attrs, { days: 365 });
console.log(pems);
