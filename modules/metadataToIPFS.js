const fs = require("fs/promises");
const metadata = require("../results/metadataFinal.json");
const {
    infuraIPFSKey,
    infuraIPFSSecret
} = require('./config');
const auth =
    'Basic ' + Buffer.from(infuraIPFSKey + ':' + infuraIPFSSecret).toString('base64');
const ipfsAPI = require('ipfs-http-client');
const ipfs = ipfsAPI.create({
    host: 'ipfs.infura.io',
    port: '5001',
    protocol: 'https',
    headers: {
        authorization: auth
    }
})


const metadataToIPFS = async () => {
    // create array of ipfs content
    let ipfsArray = [];
    for (let i = 0; i < metadata.length; i++) {
        let data = metadata[i];
        ipfsArray.push({
            path: `/${metadata[i].name.replace('Foxel #','')}`,
            content: JSON.stringify(data)
        })
    }

    // add array to ipfs
    let results = [];
    for await (const result of ipfs.addAll(ipfsArray, {
        wrapWithDirectory: true
    })) {
        console.log(result);
        results.push(result);
    }
    // the very last result from this collection is the hash of the directory
    // all the files can be accessed from this hash + /1 /2 /3 etc
    await fs.writeFile('../results/ipfsLocationData.json', results)
}

export default {
    metadataToIPFS
};