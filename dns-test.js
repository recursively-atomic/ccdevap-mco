const dns = require("dns");

dns.resolveSrv(
    "_mongodb._tcp.cluster0.3p3eox9.mongodb.net",
    (err, records) => {
        console.log(err);
        console.log(records);
    }
);