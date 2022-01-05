const {
    outputDirectory,
    quantityToGenerate
} = require('../config.json');
const hexKey = require('../hexKey.json');

const SHA256 = require('./SHA256');
const {
    v4: uuidv4
} = require('uuid');
const fs = require('fs');
const jimp = require('jimp');
const Jimp = require('jimp');
const {
    numToHexString,
    loopToOption,
    randomNumber
} = require('./utility').default;

const createFoxelAssets = async () => {
    // Creates a string of the foxel's genetics with rarity enforced
    function generateDNAHexString() {
        let hexString = "";
        let types = Object.keys(hexKey);
        for (let i = 0; i < types.length; i++) {
            let randomNum = randomNumber(1, 100);
            let type = types[i].toLowerCase();
            let typeObj = hexKey[type];
            let keys = Object.keys(typeObj);
            let results = [];
            for (let j = 0; j < keys.length; j++) {
                results.push({
                    index: keys[j],
                    rarity: typeObj[keys[j]].rarity
                });
            }

            let partArr = results.filter(item => item.rarity >= randomNum);

            // if array is empty, get the most common item(s)
            if (partArr.length == 0) {
                // get max rarity in results    
                let maxRarity = results.reduce((a, b) => a.rarity > b.rarity ? a : b);
                partArr = results.filter(item => item.rarity == maxRarity.rarity);
            }

            let closest = partArr.reduce(function (prev, curr) {
                return (curr.rarity <= prev.rarity ? curr : prev);
            }).rarity;

            partArr = results.filter(item => item.rarity == closest);

            let finalResult = partArr[randomNumber(0, partArr.length)];

            hexString += numToHexString(Number(finalResult.index));
        }
        // Add gender to hexString
        hexString += numToHexString(randomNumber(0, 15));
        // Add 19 0s for parent DNA plus 8 to signify sire gender
        let parentDNA = '00000000000000000008';
        let uuid = uuidv4();
        let hexStringEnd = SHA256(uuid).slice(0, 34);
        hexString += parentDNA + hexStringEnd;

        return hexString;
    }

    async function generateFoxel(hexString, iteration) {
        console.log(`Generating Foxel #${iteration}`);
        // Use hexString to find the assets referenced in json
        // Body
        const bodySetting = getSettings(hexString, 'Body');
        const bodyImg = await jimp.read(bodySetting.fullPath).then(img => img.resize(500, 500));
        // Ears
        const earsSetting = getSettings(hexString, 'Ears');
        const earsImg = await jimp.read(earsSetting.fullPath).then(img => img.resize(500, 500));
        // Eyes
        const eyesSetting = getSettings(hexString, 'Eyes');
        const eyesImg = await jimp.read(eyesSetting.fullPath).then(img => img.resize(500, 500));
        // Head
        const headSetting = getSettings(hexString, 'Head');
        const headImg = await jimp.read(headSetting.fullPath).then(img => img.resize(500, 500));
        // Mouth
        const mouthSetting = getSettings(hexString, 'Mouth');
        const mouthImg = await jimp.read(mouthSetting.fullPath).then(img => img.resize(500, 500));
        // Neck
        const neckSetting = getSettings(hexString, 'Neck');
        const neckImg = await jimp.read(neckSetting.fullPath).then(img => img.resize(500, 500));
        // Nose
        const noseSetting = getSettings(hexString, 'Nose');
        const noseImg = await jimp.read(noseSetting.fullPath).then(img => img.resize(500, 500));
        // Paws
        const pawsSetting = getSettings(hexString, 'Paws');
        const pawsImg = await jimp.read(pawsSetting.fullPath).then(img => img.resize(500, 500));
        // Tail
        const tailSetting = getSettings(hexString, 'Tail');
        const tailImg = await jimp.read(tailSetting.fullPath).then(img => img.resize(500, 500));

        // creat array with default layer order
        let layerOrder = [{
                name: 'Tail',
                setting: tailSetting.settings,
                image: tailImg
            },
            {
                name: 'Body',
                setting: bodySetting.settings,
                image: bodyImg
            },
            {
                name: 'Ears',
                setting: earsSetting.settings,
                image: earsImg
            },
            {
                name: 'Head',
                setting: headSetting.settings,
                image: headImg
            },
            {
                name: 'Neck',
                setting: neckSetting.settings,
                image: neckImg
            },
            {
                name: 'Mouth',
                setting: mouthSetting.settings,
                image: mouthImg
            },
            {
                name: 'Eyes',
                setting: eyesSetting.settings,
                image: eyesImg
            },
            {
                name: 'Nose',
                setting: noseSetting.settings,
                image: noseImg
            },
            {
                name: 'Paws',
                setting: pawsSetting.settings,
                image: pawsImg
            },
        ];
        // sort layers by specific layerOrder property
        layerOrder.sort((a, b) => a.setting.layer - b.setting.layer);

        // create new image
        let canvas = new Jimp(500, 500, (err) => {
            console.err(err);
        });

        for (let i = 0; i < layerOrder.length; i++) {
            let img = layerOrder[i].image;
            let name = layerOrder[i].name;
            let setting = layerOrder[i].setting;

            // if layer has changeHue property, change hue of layer
            if (setting.changeHue) {
                // need to add random number to hue
                let rand = randomNumber(0, 360);
                img.color([{
                    apply: 'hue',
                    params: [rand]
                }]);
            }

            // if layer is the head then we need to add left ear on top of layer
            if (name == 'Head') {
                // add existing image to canvas
                canvas.composite(img, 0, 0);
                // Add left ear on top of head
                canvas.composite(earsImg.clone().crop(150, 0, 350, 500), 150, 0);
            } else {
                canvas.composite(img, 0, 0);
            }
        }

        // resize canvas to OpenSea preffered size
        canvas.resize(350, 350);
        console.log(`Writing image to: ${outputDirectory}${iteration}.png`);

        // write image to file in output directory
        canvas.write(`${outputDirectory}${iteration}.png`);

        // generate metadata for foxel
        generateMetadata(hexString, layerOrder, iteration);

        return;
    }

    // get the settings for a specific layer and asset based on dna hex string
    function getSettings(hexString, type) {
        let fullPath = '../assets/PNG/';
        let fileType = '.png';
        // get the settings for the specific layer for the specific asset
        let settings = hexKey[type.toLowerCase()][loopToOption(hexString[Object.keys(hexKey).findIndex(item => item == type.toLowerCase())], Object.keys(hexKey[type.toLowerCase()]).length)];
        fullPath = fullPath + type + '/' + settings.imagePath + fileType;
        return {
            fullPath,
            settings
        };
    }

    // generate metadata for foxel and write to file
    function generateMetadata(hexString, layers, iteration) {
        let attributes = [];
        layers.sort((a, b) => a.name[0] > b.name[0] ? 1 : -1).forEach(layer => {
            attributes.push({
                trait_type: layer.name,
                value: layer.setting.name
            });
        });
        // format metadata to OpenSea specs
        let metadata = {
            dna: hexString,
            name: "Foxel #" + iteration,
            description: "Foxel",
            image: "",
            edition: 1,
            date: Date.now(),
            attributes: attributes
        };
        let file = fs.readFileSync('../results/metadata.json', 'utf8', err => {
            if (err) {
                console.error(err);
                return;
            }
        });
        let json = JSON.parse(file);
        json.push(metadata);
        fs.writeFileSync("../results/metadata.json", JSON.stringify(json), err => {
            if (err) {
                console.error(err);
                return;
            }
        });

    }

    for (let i = 1; i < quantityToGenerate + 1; i++) {
        await generateFoxel(generateDNAHexString(), i);
    }
}

export default {
    createFoxelAssets
};