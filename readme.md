# Foxel Generator
This project generates the png assets and metadata for a collection of nfts. It then pushes that data to IPFS.
This is how the original batch of foxels was generated. This project is similar in intent to [Hashlips Art Engine](https://github.com/HashLips/hashlips_art_engine) but Hashlips was missing some core functionality so we had to build our own.

### Getting Started
Start by updating the config files with your own Infura IPFS node credentials.
Update the `/assets` directory with your own files if you wish but make sure you also update the `/hexKey.json` with your new asset information.
Everything is executed from main.js so use the command `node main.js` to start the process.

### Each foxel's dna is represented by a hex string:
If this is the foxels dna
`0d53ea36020e095062c0c7352b87b89a40187841bfc30efb2fe990d27fc78fa5`
We can map each character to a specific trait
Here is the breakdown:
|Head|Body|Ears|Eyes|Mouth|Neck|Nose|Paws|Tail|Sex|Dame DNA  |Sire DNA  |     Unused                       |
|----|----|----|----|-----|----|----|----|----|---|----------|----------|----------------------------------|
|0   |d   |  5 |  3 |  e  | a  |  3 |  6 |  0 |  2|0e095062c0|c7352b87b8|9a40187841bfc30efb2fe990d27fc78fa5|


