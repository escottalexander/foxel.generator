    // Utility Functions
    function hexStringToNum(hexStrChar) {
        const hexStringArr = ["a", "b", "c", "d", "e", "f"];
        if (!isNaN(Number(hexStrChar))) {
            return hexStrChar;
        } else {
            return (10 + hexStringArr.indexOf(hexStrChar)).toString();
        }
    }

    function numToHexString(num) {
        const hexStringArr = ["a", "b", "c", "d", "e", "f"];
        if (num <= 9) {
            return num.toString();
        } else {
            num -= 10;
            return (hexStringArr[num]).toString();
        }
    }

    // If hexString number exceeds available options start back from beginning
    function loopToOption(hexStr, loopLength) {
        let num = Number(hexStringToNum(hexStr));
        loopLength = Number(loopLength);
        if (Number(num) >= Number(loopLength)) {
            return (num % loopLength).toString();
        } else {
            return (num).toString();
        }
    }

    function randomNumber(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    export default {
        hexStringToNum,
        numToHexString,
        loopToOption,
        randomNumber
    };