const selfsigned = require('selfsigned');
const fs = require('fs');
const path = require('path');

const attrs = [{ name: 'commonName', value: 'localhost' }];

(async () => {
    try {
        console.log("Generating certificates...");
        const pems = await selfsigned.generate(attrs, { days: 365 });

        const certDir = path.join(__dirname, '..', 'certificates');

        if (!fs.existsSync(certDir)) {
            fs.mkdirSync(certDir);
        }

        fs.writeFileSync(path.join(certDir, 'key.pem'), pems.private);
        fs.writeFileSync(path.join(certDir, 'cert.pem'), pems.cert);

        console.log('Certificates generated in /certificates folder!');
    } catch (err) {
        console.error('Error creating certs:', err);
    }
})();
