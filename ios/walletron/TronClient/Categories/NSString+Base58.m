//
//  NSString+Base58.m
//  walletron
//
//  Created by Brandon Holland on 2018-05-20.
//  Copyright © 2018 650 Industries, Inc. All rights reserved.
//

#import "NSString+Base58.h"

#import <libbase58/libbase58.h>
#import <OpenSSL/openssl/sha.h>

size_t const kSha256Length = 32;
size_t const kBase58EncodedLength = 36;
size_t const kBase58DecodedLength = 25;
size_t const kBase58HashLength = 4;
uint8_t const kBase58PrefixByte = 0xa0;

static bool openssl_sha256(void *digest, const void *data, size_t datasz)
{
    SHA256(data, datasz, digest);
    return true;
}

@implementation NSString (Base58)

+ (NSString *) encodedBase58StringWithData: (NSData *) data
{
    //Make sure we have a sha256 implementation set
    if(!b58_sha256_impl)
    { b58_sha256_impl = openssl_sha256; }
    
    //Hash the data, then hash that hash
    uint8_t hash0[kSha256Length];
    uint8_t hash1[kSha256Length];
    openssl_sha256(hash0, data.bytes, data.length);
    openssl_sha256(hash1, hash0, kSha256Length);
    
    //Append the hash to the end of the data
    uint8_t addr_data[kBase58DecodedLength];
    memcpy(addr_data, data.bytes, data.length);
    memcpy(addr_data + (kBase58DecodedLength - kBase58HashLength), hash1, kBase58HashLength);
    
    //Create buffer to store base58 encoded string
    char addr[kBase58EncodedLength];
    size_t addr_size = kBase58EncodedLength;
    
    //Attempt to encode the base58 string
    int result = b58enc(addr, &addr_size, addr_data, kBase58DecodedLength);
    if(!result)
    { return nil; }

    //Return the base58 encoded string
    return [NSString stringWithCString: addr encoding: NSUTF8StringEncoding];
}

- (NSData *) decodedBase58Data
{
    //Make sure we have a sha256 implementation set
    if(!b58_sha256_impl)
    { b58_sha256_impl = openssl_sha256; }
    
    //Get utf8 bytes of the string (and length)
    const char *addr = [self UTF8String];
    const size_t b58_size = strlen(addr);
    
    //Create buffer to store decoded data
    uint8_t addr_bin[kBase58DecodedLength];
    size_t rv = sizeof(addr_bin);
    
    //Attempt to decode the base58 encoded string
    int result = b58tobin(addr_bin, &rv, addr, b58_size);
    if(!result)
    { return nil; }
    
    //Verify the base58 data
    int check = b58check(addr_bin, rv, addr, b58_size);
    if(check != kBase58PrefixByte)
    { return nil; }

    //Return the decoded base58 data
    return [NSData dataWithBytes: addr_bin length: (kBase58DecodedLength - kBase58HashLength)];
}

@end
