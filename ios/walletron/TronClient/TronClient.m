
#import "TronClient.h"

#import <GRPCClient/GRPCCall+Tests.h>
#import <RxLibrary/GRXWriter+Immediate.h>
#import <RxLibrary/GRXWriter+Transformations.h>

#import "Categories/NSString+Base58.h"
#import "TronCrypt.h"

static NSString * const kHostAddress = @"47.254.16.55:50051";
static int const kTrxDrop = 1000000;

@implementation TronClient

RCT_EXPORT_MODULE();

- (id) init
{
    if (self = [super init])
    {
        [GRPCCall useInsecureConnectionsForHost: kHostAddress];
        _wallet = [[Wallet alloc] initWithHost: kHostAddress];
    }
    return self;
}

+ (BOOL) requiresMainQueueSetup
{ return NO; }

RCT_REMAP_METHOD(generateAccount,
                 password:(NSString *)password
                 generateAccountWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    //Generate new tron crypt then verify it is valid
    TronCrypt *tronCrypt = [TronCrypt generatedCryptWithSecret: password];
    if(!tronCrypt.valid)
    {
        //Crypt is invalid, reject and return
        reject(@"Failed to restore account", @"Mnemonics invalid", nil);
        return;
    }
    
    //Create generated account dictionary
    NSDictionary *returnGeneratedAccount =
    @{
        @"address": tronCrypt.address,
        @"privateKey": tronCrypt.privateKey,
        @"mnemonics": tronCrypt.mnemonics
    };
    
    //Return the generated account dictionary
    resolve(returnGeneratedAccount);
}

RCT_REMAP_METHOD(restoreAccount,
                 mnemonics: (NSString *) mnemonics
                 password:(NSString *)password
                 restoreAccountWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    //Create tron crypt for mnemonics & password, then verify it is valid
    TronCrypt *tronCrypt = [TronCrypt cryptWithMnemonics: mnemonics secret: password];
    if(!tronCrypt.valid)
    {
        //Crypt is invalid, reject and return
        reject(@"Failed to restore account", @"Mnemonics invalid", nil);
        return;
    }
    
    //Create restored account dictionary
    NSDictionary *returnRestoredAccount =
    @{
        @"address": tronCrypt.address,
        @"privateKey": tronCrypt.privateKey,
        @"mnemonics": tronCrypt.mnemonics
    };
    
    //Return the restored account dictionary
    resolve(returnRestoredAccount);
}

RCT_REMAP_METHOD(getAccount,
                 accountAddress:(NSString *)accountAddress
                 getAccountWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{    
    //Create account request using decoded base58 address
    Account *account = [Account message];
    account.address = [accountAddress decodedBase58Data];
    
    //Attempt to get the account
    [_wallet getAccountWithRequest: account handler: ^(Account * _Nullable response, NSError * _Nullable error)
    {
        //If there was a response
        if(response)
        {
            //Create list of assets
            NSMutableArray *assets = [NSMutableArray arrayWithCapacity: response.asset.count];
            [response.asset enumerateKeysAndInt64sUsingBlock:^(NSString * _Nonnull key, int64_t value, BOOL * _Nonnull stop)
            {
                NSDictionary *asset = @{ @"name": key, @"balance": @(value) };
                [assets addObject: asset];
            }];
            
            //Create account dictionary
            NSDictionary *returnAccount =
            @{
                @"address": accountAddress,
                @"name": response.accountName,
                @"balance": @((response.balance / kTrxDrop)),
                @"assets": assets
            };
            
            //Return the account dictionary
            resolve(returnAccount);
        }
        else
        { reject(@"no_response", @"No response from host", error); }
    }];
}

@end
