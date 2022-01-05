const fs = require('fs');
const metadata = require("../results/metadata.json");

function findRarity() {
    let traitCount = {};
    // get count of each trait type
    metadata.forEach(foxel => {
        foxel.attributes.forEach((trait) => {
            if (traitCount[trait.trait_type] == undefined) {
                traitCount[trait.trait_type] = {};
            }
            if (traitCount[trait.trait_type][trait.value] == undefined) {
                traitCount[trait.trait_type][trait.value] = 0;
            }
            traitCount[trait.trait_type][trait.value] += 1;;
        })
    });
    //get trait rarity by dividing count by total number of traits
    let traitRarity = JSON.parse(JSON.stringify(traitCount));
    Object.keys(traitRarity).forEach(trait => {
        Object.keys(traitRarity[trait]).forEach((value, key) => {
            traitRarity[trait][value] = traitRarity[trait][value] / (metadata.length / 100);
        })
    });

    // find rarity of each entry in metadata
    let rarity = [];
    metadata.forEach(foxel => {
        let rarityValue = 0;
        foxel.attributes.forEach((trait) => {
            rarityValue += traitRarity[trait.trait_type][trait.value];
        });
        rarity.push({
            [foxel.name]: rarityValue
        });

    });

    fs.writeFile("../results/foxelRarity.json", JSON.stringify(sortByRarity(rarity)), err => {
        if (err) {
            console.error(err);
            return
        }
    });
}

function sortByRarity(results) {
    //sort results into groups by rarity 
    let sortedResults = results.sort((a, b) => {
        return a[Object.keys(a)] - b[Object.keys(b)];
    });

    return sortedResults;
}


export default {
    findRarity
};