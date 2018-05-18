
#import "TronClient.h"

#import <GRPCClient/GRPCCall+Tests.h>
#import <RxLibrary/GRXWriter+Immediate.h>
#import <RxLibrary/GRXWriter+Transformations.h>

#import <libbase58/libbase58.h>
#import <OpenSSL/openssl/sha.h>

static NSString * const kHostAddress = @"47.254.16.55:50051";
static const int kTrxDrop = 1000000;

static bool my_sha256(void *digest, const void *data, size_t datasz)
{
    SHA256(data, datasz, digest);
    return true;
}

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

RCT_REMAP_METHOD(getAccount,
                 accountAddress:(NSString *)accountAddress
                 getAccountBalanceWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    //Decode base58 string address to bytes
    const char *addr = [accountAddress UTF8String];
    uint8_t addr_bin[25];
    const size_t b58_size = strlen(addr);
    size_t rv = sizeof(addr_bin);
    
    if(!b58_sha256_impl)
    { b58_sha256_impl = my_sha256; }
    
    int result = b58tobin(addr_bin, &rv, addr, b58_size);
    int check = b58check(addr_bin, rv, addr, b58_size);
    
    uint8_t trimmed_addr_bin[21];
    memcpy(trimmed_addr_bin, addr_bin, 21);
    
    //Create account request using decoded address bytes
    Account *account = [Account message];
    account.address = [NSData dataWithBytes: &trimmed_addr_bin length: 21];
    
    //Attempt to get the account
    [_wallet getAccountWithRequest: account handler: ^(Account * _Nullable response, NSError * _Nullable error)
    {
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
