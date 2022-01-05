const {
    createFoxelAssets
} = require('./modules/generator').default;
const {
    findRarity
} = require('./modules/findRarity').default;
const {
    pngsToIPFS
} = require('./modules/pngsToIPFS').default;

const {
    metadataToIPFS
} = require('./modules/metadataToIPFS').default;

const main = async () => {
    await createFoxelAssets();
    findRarity();
    await pngsToIPFS();
    await metadataToIPFS();
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });