const fs = require("fs/promises");
const metadata = require("../results/metadata.json");
const {
    outputDirectory,
    infuraIPFSKey,
    infuraIPFSSecret
} = require('./config');
const {
    hexStringToNum
} = require('./utility').default;
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


const pngsToIPFS = async () => {
    let itemsProcessed = 0;
    metadata.forEach(async (foxel, i, array) => {
        console.log(`Adding image ${foxel.name.replace('Foxel #', '')}.png to IPFS`);
        await fs.readFile(`${outputDirectory}${foxel.name.replace('Foxel #', '')}.png`)
            .then(async (data) => {
                const hash = (await ipfs.add(data)).path;
                console.log(`Image ${foxel.name.replace('Foxel #', '')}.png added to IPFS with hash ${hash}`);
                foxel.image = 'ipfs://' + hash;

                const sex = hexStringToNum(foxel.dna[9]) >= 8 ? 'Male' : 'Female';

                foxel.attributes.push({
                    trait_type: 'Sex',
                    value: sex
                });

                foxel.external_url = 'https://foxel.eth.link/foxel/' + foxel.name.replace('Foxel #', ''); //Need to fill this out!

                foxel.description = "**Foxel** is a community-driven game of fox-like creatures that can be bred, battled and traded.\n\n" +
                    "Each owner becomes a member of **FoxelDAO** and can contribute to the **Foxel** ecosystem through submitting ideas, voting and executing on the decisions of **FoxelDAO** with their own unique abilities.";
                console.log(`Updated metadata for ${foxel.name}`, foxel);
                itemsProcessed++;
            })
            .catch(err => {
                console.error(err)
            })
        console.log(`Processed ${itemsProcessed} items`);
        if (itemsProcessed === array.length) {
            await writeToFile('../results/metadataFinal.json', metadata);
        }
    })

};

async function writeToFile(fileName, data) {
    console.log('Writing metadata to new file');
    await fs.writeFile(fileName, JSON.stringify(data), 'utf8');
}

export default {
    pngsToIPFS
};