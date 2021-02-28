const Generator = require('./Generator');



describe('test', () => {
    const numOfShards = 5;
    const {publicKey, privateKey, privateKeyShares} = Generator.generatePublicKeyAndPrivateKeyShards(numOfShards); 
    const randomString = 'thisIsRandom';
    let assembledPrivateKey;
    let encryptedRandomString;
    let decriptedRandomString;
    
    test('Creates the RSA key pair with a Private Key broken into 5 shards.', () => {
        expect(publicKey).not.toBeUndefined()
        expect(privateKeyShares.length).toBe(numOfShards);
      });

    test('Encrypts a random plain text string using the RSA Public Key.', () => {
        encryptedRandomString = Generator.encriptPublic(randomString, publicKey); 
        expect(encryptedRandomString).not.toBeUndefined()
    });
    
    test('Reassembles the Private Key using shard 2 &amp; 5.', () => {
        assembledPrivateKey = Generator.assemblePrivateKey([privateKeyShares[1], privateKeyShares[4]]); 
       expect(assembledPrivateKey.toString()).toBe(privateKey)
    });

    test('Decrypts the cypher text back into the plain text using the reassembled Private Key.', () => {
        decriptedRandomString = Generator.decriptData(encryptedRandomString, assembledPrivateKey); 
        expect(decriptedRandomString).not.toBeUndefined()
     });

     test('Asserts the decrypted plain text is equal to the original random plain text in Step 2.', () => {
        expect(decriptedRandomString).toBe(randomString)
     });
})
