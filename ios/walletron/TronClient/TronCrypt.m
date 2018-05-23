//
//  TronCrypt.m
//  walletron
//
//  Created by Brandon Holland on 2018-05-22.
//  Copyright © 2018 650 Industries, Inc. All rights reserved.
//

#import "TronCrypt.h"

#import <TrezorCrypto/TrezorCrypto.h>
#import <NSData+FastHex/NSData+FastHex.h>
#import "Categories/NSString+Base58.h"

size_t const kTronCryptMnemonicStrength = 256;
size_t const kTronCryptSeedSize = 64;
size_t const kTronCryptPublicKeyHashSize = 20;
size_t const kTronCryptPrivateKeyLength = 32;

@implementation TronCrypt

#pragma mark -
#pragma mark Class Methods
#pragma mark

+ (NSString *) generateNewMnemonics
{
    const char *mnemonics = mnemonic_generate(kTronCryptMnemonicStrength);
    return [NSString stringWithCString: mnemonics encoding: NSUTF8StringEncoding];
}

+ (id) cryptWithMnemonics: (NSString *) mnemonics
                   secret: (NSString *) secret
{ return [[TronCrypt alloc] initWithMnemonics: mnemonics secret: secret]; }

+ (id) cryptWithPrivateKey: (NSString *) privateKey
{ return [[TronCrypt alloc] initWithPrivateKey: privateKey]; }

+ (id) generatedCryptWithSecret: (NSString *) secret
{ return [[TronCrypt alloc] initWithMnemonics: [TronCrypt generateNewMnemonics] secret: secret]; }

#pragma mark -
#pragma mark Creation + Destruction
#pragma mark

- (id) init
{
    if (self = [super init])
    {
        _mnemonics = nil;
        _address = nil;
        _privateKey = nil;
        _secret = nil;
        _valid = NO;
        _fromWords = NO;
    }
    return self;
}

- (id) initWithMnemonics: (NSString *) mnemonics
                  secret: (NSString *) secret
{
    if (self = [self init])
    {
        _mnemonics = mnemonics;
        _secret = secret;
        _fromWords = YES;
        
        [self _updateFromMnemonics];
    }
    return self;
}

- (id) initWithPrivateKey: (NSString *) privateKey
{
    if(self = [self init])
    {
        _privateKey = privateKey;
        _fromWords = NO;
        
        [self _updateFromPrivateKey];
    }
    return self;
}

#pragma mark -
#pragma mark Private Methods
#pragma mark

- (void) _updateFromMnemonics
{
    //Verify mnemonics is not null
    if(!_mnemonics)
    {
        //Invalidate crypt and return
        _valid = NO;
        return;
    }
    
    //Verify mnemonics are valid
    const char *words = [_mnemonics cStringUsingEncoding: NSUTF8StringEncoding];
    if(!mnemonic_check(words))
    {
        //Invalidate crypt and return
        _valid = NO;
        return;
    }
    
    //Declare variables
    HDNode node;
    uint8_t seed[kTronCryptSeedSize];
    uint8_t publicKeyHash[kTronCryptPublicKeyHashSize];
    uint8_t addr[kTronCryptPublicKeyHashSize + 1];
    const char *scrt = _secret ? [_secret cStringUsingEncoding: NSUTF8StringEncoding] : "";
    
    //Generate seed from mnemonics and populate keys
    mnemonic_to_seed(words, scrt, seed, nil);
    hdnode_from_seed(seed, kTronCryptSeedSize, SECP256K1_NAME, &node);
    hdnode_private_ckd_prime(&node, 44);
    hdnode_private_ckd_prime(&node, 0);
    hdnode_private_ckd_prime(&node, 0);
    hdnode_private_ckd(&node, 0);
    hdnode_private_ckd(&node, 0);
    hdnode_fill_public_key(&node);
    hdnode_get_ethereum_pubkeyhash(&node, publicKeyHash);
    
    //Get public address from seed
    memcpy(addr + 1, publicKeyHash, kTronCryptPublicKeyHashSize);
    addr[0] = 0xa0;
    NSData *addressData = [NSData dataWithBytes: &addr length: kTronCryptPublicKeyHashSize + 1];
    _address = [NSString encodedBase58StringWithData: addressData];
    
    //Get private key from seed
    NSData *privateKeyData = [NSData dataWithBytes: &node.private_key length: kTronCryptPrivateKeyLength];
    _privateKey = [privateKeyData hexStringRepresentationUppercase: YES];
    
    //Crypt is valid if we made it this far
    _valid = YES;
}

- (void) _updateFromPrivateKey
{
    if(!_privateKey || _privateKey.length != kTronCryptPrivateKeyLength * 2)
    {
        _valid = NO;
        return;
    }
    
    //Declare variables
    HDNode node;
    uint8_t publicKeyHash[kTronCryptPublicKeyHashSize];
    uint8_t addr[kTronCryptPublicKeyHashSize + 1];
    const uint8_t *privateKeyBytes = (uint8_t *)[[NSData dataWithHexString: _privateKey] bytes];
    
    //Populate keys
    hdnode_from_xprv(0, 0, 0, privateKeyBytes, (const char *)privateKeyBytes, &node);
    hdnode_fill_public_key(&node);
    hdnode_get_ethereum_pubkeyhash(&node, publicKeyHash);
    
    //Get public address
    memcpy(addr + 1, publicKeyHash, kTronCryptPublicKeyHashSize);
    addr[0] = 0xa0;
    NSData *addressData = [NSData dataWithBytes: &addr length: kTronCryptPublicKeyHashSize + 1];
    _address = [NSString encodedBase58StringWithData: addressData];
    
    //Crypt is valid if we made it this far
    _valid = YES;
}

#pragma mark -
#pragma mark Accessors
#pragma mark

- (BOOL) valid
{ return _valid; }

- (BOOL) fromWords
{ return _fromWords; }

- (NSString *) mnemonics
{ return _mnemonics; }

- (NSString *) address
{ return _address; }

- (NSString *) privateKey
{ return _privateKey; }

@end
