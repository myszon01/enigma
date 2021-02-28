'use strict'
const fs = require('fs');
const readline = require("readline");

const Generator = require('./Generator');

const generateKeysAndSaveToFolder = (numOfshards, folderPath) => {

    const {publicKey, privateKeyshards} = Generator.generatePublicKeyAndPrivateKeyShards(numOfshards);

    const publicKeyFilePath = `${folderPath}/public.txt`
    fs.writeFileSync(publicKeyFilePath, publicKey, function(err, data) {
        if (err) throw err;
    });
    console.log(`Public key saved in: ${publicKeyFilePath}`) 
            
            
    privateKeyshards.forEach((shards, i) => {
        const filePath = `${folderPath}/private[${i}].txt`
        fs.writeFileSync(filePath, shards, function(err, data) {
            if (err) throw err;
        });
        console.log(`Private shard ${i} key saved in: ${filePath}`) 
    });
}

const encriptDataWithPublicKey = (data, publicKeyFilePath) => {
    const retrivedPublicKey = fs.readFileSync(publicKeyFilePath, function(err, data) {
        if (err) throw err;
    });
    return Generator.encriptPublic(data, retrivedPublicKey);
}

const decriptDataWithPrivateKeyshards = (data, pathToPrivateKeyShard) => {
    const retrivedShard = pathToPrivateKeyShard.map((filePath) => {
        return fs.readFileSync(filePath, function(err, data) {
            if (err) throw err;
          });
    });
    const privateKey = Generator.assemblePrivateKey(retrivedShard)
    return Generator.decriptData(data, privateKey)
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const options = 
    '\n 1. Generate Keys ' +
    '\n 2. Encript msg using public key' +
    '\n 3. Decript msg using private shards' 


const welcomeStage = (msg) => rl.question(msg, function(option) {

    
    switch(option) {
        case '1': {
            rl.question("Path to the folder to which keys will be stored (default ./tmp)", function(folderPath) {
                if (!folderPath || folderPath == ''){
                    folderPath = `./tmp`
                }
                rl.question("How many shards would you like to devide your private key? (default 5)", function(numOfshards) {
                    numOfshards = parseInt(numOfshards)
                    if(!numOfshards || numOfshards < 2) {
                        numOfshards = 5
                    }
                    try {
                        generateKeysAndSaveToFolder(numOfshards, folderPath);
                    } catch(err) {
                        console.error(`Something went wrong check error and try again.`, err)
                    } finally {
                        welcomeStage(`What would you like to do? \n${options}\n`);
                    }
                });
            });
        };
        case '2': {
            rl.question("What is the msg you would like to encript?", function(msg) {
            
                rl.question("Path to you public key file? (default ./tmp/public.txt)", function(publicKeyFilePath) {
                    if(!publicKeyFilePath || publicKeyFilePath === '') {
                        publicKeyFilePath = './tmp/public.txt'
                    }
                    try {
                        console.log(`Your encripted msg is (base64 encoding): \n${encriptDataWithPublicKey(msg, publicKeyFilePath)}`);
                    } catch(err) {
                        console.error(`Something went wrong check error and try again.`, err)
                    } finally {
                        welcomeStage(`What would you like to do? \n${options}\n`);
                    }
                });
                rl.on('line', (input) => {
                    console.log(`Received: ${input}`);
                  });
            });
        };
        case '3': {
            rl.question("What is the msg you would like to decript?", function(msg) {
                rl.question("Path to you prvate shards? Seperate by ; (default ./tmp/private[0].txt;./tmp/private[1].txt)", function(pathToPrivateKeyShar) {
                    if(!pathToPrivateKeyShar || pathToPrivateKeyShar === '') {
                        pathToPrivateKeyShar = './tmp/private[0].txt;./tmp/private[1].txt'
                    }
                    pathToPrivateKeyShar = pathToPrivateKeyShar.split(';');
                    try {
                        console.log(`Your decripted msg is: \n${decriptDataWithPrivateKeyshards(msg, pathToPrivateKeyShar)}`);
                    } catch(err) {
                        console.error(`Something went wrong check error and try again.`, err)
                    } finally {
                        welcomeStage(`What would you like to do? \n${options}\n`);
                    }
                });
            });
        };
        default: {
            welcomeStage('You must choose one of the options or ctrl+c to exit \n');
        }
    }

    
});

welcomeStage(`Welcome in enigma. \n\nWhat would you like to do? (type number)' ${options} \n`);

rl.on("close", function() {
    console.log("\nBYE BYE !!!");
    process.exit(0);
});
