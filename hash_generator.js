const bcrypt = require('bcryptjs');

const password = '123456';

bcrypt.hash(password, 10).then(hash => {
    console.log('--------------------------------------------------');
    console.log('COPIE ESTE HASH INTEIRO (DAQUI ATÉ O FINAL):');
    console.log(hash);
    console.log('--------------------------------------------------');
    process.exit();
});