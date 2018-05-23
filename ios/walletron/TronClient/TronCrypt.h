//
//  TronCrypt.h
//  walletron
//
//  Created by Brandon Holland on 2018-05-22.
//  Copyright © 2018 650 Industries, Inc. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface TronCrypt : NSObject
{
    NSString *_mnemonics;
    NSString *_address;
    NSString *_privateKey;
    NSString *_secret;
    BOOL _valid;
    BOOL _fromWords;
}
+ (NSString *) generateNewMnemonics;
+ (id) cryptWithMnemonics: (NSString *) mnemonics
                   secret: (NSString *) secret;
+ (id) cryptWithPrivateKey: (NSString *) privateKey;
+ (id) generatedCryptWithSecret: (NSString *) secret;
- (id) initWithMnemonics: (NSString *) mnemonics
                  secret: (NSString *) secret;
- (id) initWithPrivateKey: (NSString *) privateKey;
- (BOOL) valid;
- (BOOL) fromWords;
- (NSString *) mnemonics;
- (NSString *) address;
- (NSString *) privateKey;
@end
