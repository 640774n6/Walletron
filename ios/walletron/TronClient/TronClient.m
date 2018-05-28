
#import "TronClient.h"

#import <GRPCClient/GRPCCall+Tests.h>
#import <RxLibrary/GRXWriter+Immediate.h>
#import <RxLibrary/GRXWriter+Transformations.h>

#import <TronProtocol/core/Contract.pbobjc.h>
#import <TronProtocol/core/Tron.pbobjc.h>

#import "Categories/NSString+Base58.h"
#import "TronSignature.h"

static NSString * const kTronClientHostAddress = @"47.254.16.55:50051";
static int const kTronClientTrxDrop = 1000000;

@implementation TronClient

RCT_EXPORT_MODULE();

#pragma mark -
#pragma mark Creation + Destruction
#pragma mark

- (id) init
{
    if (self = [super init])
    {
        [GRPCCall useInsecureConnectionsForHost: kTronClientHostAddress];
        _wallet = [[Wallet alloc] initWithHost: kTronClientHostAddress];
    }
    return self;
}

#pragma mark -
#pragma mark Super Overrides
#pragma mark

+ (BOOL) requiresMainQueueSetup
{ return NO; }

#pragma mark -
#pragma mark Private Methods
#pragma mark

- (Transaction * _Nullable) _createTransactionWithTransferContract: (TransferContract *) transferContract
{
    //Declare variables
    __block Transaction * _Nullable returnTransaction = nil;
    
    //Attempt to create the transaction using the transfer contract
    dispatch_semaphore_t sema = dispatch_semaphore_create(0);
    [_wallet createTransactionWithRequest: transferContract handler:^(Transaction * _Nullable transaction, NSError * _Nullable error)
    {
         //If we got a valid response
         if(transaction && transaction.rawData.contractArray_Count > 0)
         { returnTransaction = transaction; }
        
        //Signal that create transaction is finished
        dispatch_semaphore_signal(sema);
    }];
    
    //Wait for create transaction to finish
    dispatch_semaphore_wait(sema, DISPATCH_TIME_FOREVER);
    
    //Return transaction
    return returnTransaction;
}

- (Transaction * _Nullable) _createTransactionWithTransferAssetContract: (TransferAssetContract *) transferAssetContract
{
    //Declare variables
    __block Transaction * _Nullable returnTransaction = nil;
    
    //Attempt to create the transaction using the transfer contract
    dispatch_semaphore_t sema = dispatch_semaphore_create(0);
    [_wallet transferAssetWithRequest: transferAssetContract handler:^(Transaction * _Nullable transaction, NSError * _Nullable error)
     {
         //If we got a valid response
         if(transaction && transaction.rawData.contractArray_Count > 0)
         { returnTransaction = transaction; }
         
         //Signal that create transaction is finished
         dispatch_semaphore_signal(sema);
     }];
    
    //Wait for create transaction to finish
    dispatch_semaphore_wait(sema, DISPATCH_TIME_FOREVER);
    
    //Return transaction
    return returnTransaction;
}

- (Return * _Nullable) _broadcastTransaction: (Transaction * _Nullable) transaction
{
    //Declare variables
    __block Return * _Nullable returnResponse = nil;
    
    //Attempt to broadcast transaction
    dispatch_semaphore_t sema = dispatch_semaphore_create(0);
    [_wallet broadcastTransactionWithRequest: transaction handler:^(Return * _Nullable response, NSError * _Nullable error)
    {
        //Get broadcast response
        returnResponse = response;
         
        //Signal that broadcast is finished
        dispatch_semaphore_signal(sema);
    }];
    
    //Wait for broadcast to finish
    dispatch_semaphore_wait(sema, DISPATCH_TIME_FOREVER);
    
    //Return response
    return returnResponse;
}

- (Return * _Nullable) _broadcastTransaction: (Transaction * _Nullable) transaction
                             numberOfRetries: (int) numberOfRetries
{
    //Declare variables
    int retryCounter = 0;
    
    //Attempt to broadcast transaction and retry if it failed becuase the node was busy
    __block Return * _Nullable returnResponse = [self _broadcastTransaction: transaction];
    while(!returnResponse.result && returnResponse.code == Return_response_code_ServerBusy && retryCounter < numberOfRetries)
    {
        //Increment retry counter
        retryCounter++;
        
        //Delay before trying again
        [NSThread sleepForTimeInterval: 0.3];
        
        //Attempt to broadcast transaction again
        returnResponse = [self _broadcastTransaction: transaction];
    }
    
    //Return the response
    return returnResponse;
}

#pragma mark -
#pragma mark Public Native Methods
#pragma mark

RCT_REMAP_METHOD(generateAccount,
                 password:(NSString *)password
                 generateAccountWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    @try
    {
        //Generate new tron signature then verify it is valid
        TronSignature *tronSignature = [TronSignature generatedSignatureWithSecret: password];
        if(!tronSignature.valid)
        {
            //Signature is invalid, reject and return
            reject(@"Failed to restore account", @"Mnemonics invalid", nil);
            return;
        }
        
        //Create generated account dictionary
        NSDictionary *returnGeneratedAccount =
        @{
            @"address": tronSignature.address,
            @"privateKey": tronSignature.privateKey,
            @"mnemonics": tronSignature.mnemonics
        };
        
        //Return the generated account dictionary
        resolve(returnGeneratedAccount);
    }
    @catch(NSException *e)
    {
        //Exception, reject
        NSDictionary *userInfo = @{ @"name": e.name, @"reason": e.reason };
        NSError *error = [NSError errorWithDomain: @"com.bholland.tronclient" code: 0 userInfo: userInfo];
        reject(@"Failed to generate account", @"Native exception thrown", error);
    }
}

RCT_REMAP_METHOD(restoreAccount,
                 mnemonics: (NSString *) mnemonics
                 password:(NSString *)password
                 restoreAccountWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    @try
        {
        //Create tron signature for mnemonics & password, then verify it is valid
        TronSignature *tronSignature = [TronSignature signatureWithMnemonics: mnemonics secret: password];
        if(!tronSignature.valid)
        {
            //Signature is invalid, reject and return
            reject(@"Failed to restore account", @"Mnemonics invalid", nil);
            return;
        }
        
        //Create restored account dictionary
        NSDictionary *returnRestoredAccount =
        @{
            @"address": tronSignature.address,
            @"privateKey": tronSignature.privateKey,
            @"mnemonics": tronSignature.mnemonics
        };
        
        //Return the restored account dictionary
        resolve(returnRestoredAccount);
    }
    @catch(NSException *e)
    {
        //Exception, reject
        NSDictionary *userInfo = @{ @"name": e.name, @"reason": e.reason };
        NSError *error = [NSError errorWithDomain: @"com.bholland.tronclient" code: 0 userInfo: userInfo];
        reject(@"Failed to restore account", @"Native exception thrown", error);
    }
}

RCT_REMAP_METHOD(validateAddress,
                 accountAddress:(NSString *)accountAddress
                 validateAddressWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    @try
    {
        BOOL addressIsValid = [TronSignature validatePublicKey: accountAddress];
        resolve(@(addressIsValid));
    }
    @catch(NSException *e)
    { resolve(@(false)); }
}

RCT_REMAP_METHOD(getAccount,
                 accountAddress:(NSString *)accountAddress
                 getAccountWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    @try
    {
        //Create account request using decoded base58 address
        Account *requestAccount = [Account message];
        requestAccount.address = [accountAddress decodedBase58Data];
        
        //Attempt to get the account
        [_wallet getAccountWithRequest: requestAccount handler: ^(Account * _Nullable responseAccount, NSError * _Nullable error)
        {
            @try
            {
                //If there was no response
                if(!responseAccount)
                {
                    //No response, reject and return
                    reject(@"Failed to get account", @"No response from host for get account", nil);
                    return;
                }
                
                //Create list of assets
                NSMutableArray *assets = [NSMutableArray arrayWithCapacity: responseAccount.asset.count];
                [responseAccount.asset enumerateKeysAndInt64sUsingBlock:^(NSString * _Nonnull key, int64_t value, BOOL * _Nonnull stop)
                 {
                     NSDictionary *asset = @{ @"name": key, @"balance": @(value) };
                     [assets addObject: asset];
                 }];
                
                //Create account dictionary
                NSDictionary *returnAccount =
                @{
                    @"address": accountAddress,
                    @"name": responseAccount.accountName,
                    @"balance": @((responseAccount.balance / kTronClientTrxDrop)),
                    @"assets": assets
                };
                
                //Return the account dictionary
                resolve(returnAccount);
            }
            @catch(NSException *e)
            {
                //Exception, reject
                NSDictionary *userInfo = @{ @"name": e.name, @"reason": e.reason };
                NSError *error = [NSError errorWithDomain: @"com.bholland.tronclient" code: 0 userInfo: userInfo];
                reject(@"Failed to get account", @"Native exception thrown", error);
            }
        }];
    }
    @catch(NSException *e)
    {
        //Exception, reject
        NSDictionary *userInfo = @{ @"name": e.name, @"reason": e.reason };
        NSError *error = [NSError errorWithDomain: @"com.bholland.tronclient" code: 0 userInfo: userInfo];
        reject(@"Failed to get account", @"Native exception thrown", error);
    }
}

RCT_REMAP_METHOD(send,
                 ownerPrivateKey:(NSString *)ownerPrivateKey
                 toAddress:(NSString *)toAddress
                 amount:(NSNumber * _Nonnull)amount
                 sendWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    @try
    {
        //Create tron signature for private key, then verify it is valid
        TronSignature *tronSignature = [TronSignature signatureWithPrivateKey: ownerPrivateKey];
        if(!tronSignature.valid)
        {
            //Signature is invalid, reject and return
            reject(@"Failed to send", @"Owner private key invalid", nil);
            return;
        }
        
        //Get data for contract
        NSData *ownerAddressData = [tronSignature.address decodedBase58Data];
        NSData *toAddressData = [toAddress decodedBase58Data];
        
        //Create transfer contract
        TransferContract *transferContract = [TransferContract message];
        transferContract.ownerAddress = ownerAddressData;
        transferContract.toAddress = toAddressData;
        transferContract.amount = ([amount longLongValue] * kTronClientTrxDrop);
        
        //Attempt to create the transaction using the transfer contract
        Transaction * _Nullable transaction = [self _createTransactionWithTransferContract: transferContract];
        if(!transaction)
        {
            //Problem creating transaction, reject and return
            reject(@"Failed to send", @"No/bad response from host for create transaction", nil);
            return;
        }
        
        //Set transaction timestamp and get signature
        transaction.rawData.timestamp = ([NSDate timeIntervalSinceReferenceDate] * 1000);
        NSData *signatureData = [tronSignature sign: transaction.rawData.data];
        
        //Add signature for each contract in transaction (Each contract could have a different signature in the future)
        for(int i = 0; i < transaction.rawData.contractArray_Count; i++)
        { [transaction.signatureArray addObject: signatureData]; }
        
        //Attempt to broadcast the transaction
        Return * _Nullable broadcastResponse = [self _broadcastTransaction: transaction numberOfRetries: 10];
        if(!broadcastResponse)
        {
            //Problem broadcasting transaction, reject and return
            reject(@"Failed to send", @"No/bad resppnse from host for broadcast transaction", nil);
            return;
        }
        
        //Return result
        resolve(@(broadcastResponse.code));
    }
    @catch(NSException *e)
    {
        //Exception, reject
        NSDictionary *userInfo = @{ @"name": e.name, @"reason": e.reason };
        NSError *error = [NSError errorWithDomain: @"com.bholland.tronclient" code: 0 userInfo: userInfo];
        reject(@"Failed to send", @"Native exception thrown", error);
    }
}

RCT_REMAP_METHOD(sendAsset,
                 ownerPrivateKey:(NSString *)ownerPrivateKey
                 toAddress:(NSString *)toAddress
                 assetName:(NSString *)tokenName
                 amount:(NSNumber * _Nonnull)amount
                 sendAssetWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    @try
    {
        //Create tron signature for private key, then verify it is valid
        TronSignature *tronSignature = [TronSignature signatureWithPrivateKey: ownerPrivateKey];
        if(!tronSignature.valid)
        {
            //Signature is invalid, reject and return
            reject(@"Failed to send token", @"Owner private key invalid", nil);
            return;
        }
        
        //Get data for contract
        NSData *ownerAddressData = [tronSignature.address decodedBase58Data];
        NSData *toAddressData = [toAddress decodedBase58Data];
        NSData *assetNameData = [tokenName dataUsingEncoding: NSUTF8StringEncoding];
        
        //Create transfer asset contract
        TransferAssetContract *transferAssetContract = [TransferAssetContract message];
        transferAssetContract.ownerAddress = ownerAddressData;
        transferAssetContract.toAddress = toAddressData;
        transferAssetContract.assetName = assetNameData;
        transferAssetContract.amount = [amount longLongValue];
        
        //Attempt to create the transaction using the transfer asset contract
        Transaction * _Nullable transaction = [self _createTransactionWithTransferAssetContract: transferAssetContract];
        if(!transaction)
        {
            //Problem creating transaction, reject and return
            reject(@"Failed to send token", @"No/bad response from host for create transaction", nil);
            return;
        }
        
        //Set transaction timestamp and get signature
        transaction.rawData.timestamp = ([NSDate timeIntervalSinceReferenceDate] * 1000);
        NSData *signatureData = [tronSignature sign: transaction.rawData.data];
        
        //Add signature for each contract in transaction (Each contract could have a different signature in the future)
        for(int i = 0; i < transaction.rawData.contractArray_Count; i++)
        { [transaction.signatureArray addObject: signatureData]; }
        
        //Attempt to broadcast the transaction
        Return * _Nullable broadcastResponse = [self _broadcastTransaction: transaction numberOfRetries: 10];
        if(!broadcastResponse)
        {
            //Problem broadcasting transaction, reject and return
            reject(@"Failed to send token", @"No/bad resppnse from host for broadcast transaction", nil);
            return;
        }
        
        //Return result
        resolve(@(broadcastResponse.code));
    }
    @catch(NSException *e)
    {
        //Exception, reject
        NSDictionary *userInfo = @{ @"name": e.name, @"reason": e.reason };
        NSError *error = [NSError errorWithDomain: @"com.bholland.tronclient" code: 0 userInfo: userInfo];
        reject(@"Failed to send token", @"Native exception thrown", error);
    }
}

@end
