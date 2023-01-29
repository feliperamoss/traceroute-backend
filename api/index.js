const express = require('express');
const app = express();
const Traceroute = require('nodejs-traceroute');
const cors = require('cors');
const geoip = require('geoip-lite');

// import express, { response } from 'express';
// import cors from 'cors';
// const app = express();
// import Traceroute from 'nodejs-traceroute'
// import geoip from 'geoip-lite';

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
// app.use(express.static("code"));
app.use(express.urlencoded({extended: true}));

app.get('/api', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
    res.send("home");
});

// const traceroute = async (host) => {
//     return new Promise((resolve, reject) => {
//         const hops = [];
//         const traceroute = spawn('traceroute', [host]);

        // traceroute.stdout.on('data', (data) => {
            // const regexExp = /(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/gi;

    //         const lines = data.toString().split('\n');
    //
    //         for (let line of lines) {
    //
    //             const match = line.match(regexExp);
    //             if (match) {
    //                     hops.push(line);
    //                 }
    //             }
    //     });
    //
    //     traceroute.stderr.on('data', (data) => {
    //         reject(data.toString());
    //     });
    //
    //     traceroute.on('close', (code) => {
    //         if (code === 0) {
    //             resolve(hops);
    //         } else {
    //             reject(`Traceroute failed with code ${code}`);
    //         }
    //     });
    // });
// };

app.get('/api/traceroute',  async(req, res)=> {
    console.log(req.query.domain)
    let iplist = [];
    // iplist.push(req.ip)
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');

    if(req.query.domain) {
        try {
            const tracer = new Traceroute();
            tracer
                .on('pid', (pid) => {
                    console.log(`pid: ${pid}`);
                })
                .on('destination', (destination) => {
                    console.log(`destination: ${destination}`);
                })
                .on('hop', (hop) => {
                    // console.log(`hop: ${JSON.stringify(hop)}`);
                    iplist.push(hop.ip)
                })
                .on('close', async (code) => {
                    // console.log(`close: code ${code}`);
                    // const result = await geoLocations(iplist)
                    const result = iplist.map((e) => {
                        if(e !== "*") {
                            console.log(e)
                            const location = geoip.lookup(e)
                            if(location !== null) {
                                return {
                                    ip: e,
                                    lat: location.ll[0],
                                    lon: location.ll[1]
                                };
                            }
                        }
                    })
                    res.send(result)
                });
        
            tracer.trace(req.query.domain);
        } catch (ex) {
            console.log(ex);
        }
    }
})

// app.use('*', (req, res)=> {
//     res.send('Page not found')
// })

const port = process.env.PORT || 3000;

app.listen(port, ()=> {
    console.log(`Server started on port ${port}`)
})

module.exports = app;