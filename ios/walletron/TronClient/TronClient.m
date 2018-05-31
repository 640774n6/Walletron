
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
#pragma mark Create Transaction Methods
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

- (Transaction * _Nullable) _createTransactionWithFreezeBalanceContract: (FreezeBalanceContract *) freezeBalanceContract
{
    //Declare variables
    __block Transaction * _Nullable returnTransaction = nil;
    
    //Attempt to create the transaction using the freeze balance contract
    dispatch_semaphore_t sema = dispatch_semaphore_create(0);
    [_wallet freezeBalanceWithRequest: freezeBalanceContract handler:^(Transaction * _Nullable transaction, NSError * _Nullable error)
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

- (Transaction * _Nullable) _createTransactionWithUnfreezeBalanceContract: (UnfreezeBalanceContract *) unfreezeBalanceContract
{
    //Declare variables
    __block Transaction * _Nullable returnTransaction = nil;
    
    //Attempt to create the transaction using the unfreeze balance contract
    dispatch_semaphore_t sema = dispatch_semaphore_create(0);
    [_wallet unfreezeBalanceWithRequest: unfreezeBalanceContract handler:^(Transaction * _Nullable transaction, NSError * _Nullable error)
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

- (Transaction * _Nullable) _createTransactionWithVoteWitnessContract: (VoteWitnessContract *) voteWitnessContract
{
    //Declare variables
    __block Transaction * _Nullable returnTransaction = nil;
    
    //Attempt to create the transaction using the vote witness contract
    dispatch_semaphore_t sema = dispatch_semaphore_create(0);
    [_wallet voteWitnessAccountWithRequest: voteWitnessContract handler:^(Transaction * _Nullable transaction, NSError * _Nullable error)
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

#pragma mark -
#pragma mark Private Methods
#pragma mark

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

- (AccountNetMessage * _Nullable) _getAccountNetworkStats: (Account *) account
{
    //Declare variables
    __block AccountNetMessage * _Nullable returnAccountNetworkStats = nil;
    
    //Attempt to get the account network stats
    dispatch_semaphore_t sema = dispatch_semaphore_create(0);
    [_wallet getAccountNetWithRequest: account handler:^(AccountNetMessage * _Nullable accountNetworkStats, NSError * _Nullable error)
    {
        //If we got a valid response
        if(accountNetworkStats)
        { returnAccountNetworkStats = accountNetworkStats; }
        
        //Signal that get account network stats is finished
        dispatch_semaphore_signal(sema);
    }];
    
    //Wait for create transaction to finish
    dispatch_semaphore_wait(sema, DISPATCH_TIME_FOREVER);
    
    //Return account network stats
    return returnAccountNetworkStats;
}

- (Account * _Nullable) _getAccount: (Account *) account
{
    //Declare variables
    __block Account * _Nullable returnAccount = nil;
    
    //Attempt to get the account
    dispatch_semaphore_t sema = dispatch_semaphore_create(0);
    [_wallet getAccountWithRequest: account handler:^(Account * _Nullable accountResponse, NSError * _Nullable error)
    {
        //If we got a valid response
        if(accountResponse)
        { returnAccount = accountResponse; }
         
        //Signal that get account is finished
        dispatch_semaphore_signal(sema);
    }];
    
    //Wait for get account to finish
    dispatch_semaphore_wait(sema, DISPATCH_TIME_FOREVER);
    
    //Return account
    return returnAccount;
}

- (WitnessList * _Nullable) _getWitnesses
{
    //Declare variables
    __block WitnessList * _Nullable returnWitnessList = nil;
    
    //Attempt to get the witnesses
    dispatch_semaphore_t sema = dispatch_semaphore_create(0);
    [_wallet listWitnessesWithRequest: [EmptyMessage message] handler:^(WitnessList * _Nullable witnessListResponse, NSError * _Nullable error)
    {
        //If we got a valid response
        if(witnessListResponse)
        { returnWitnessList = witnessListResponse; }
         
        //Signal that get witnesses is finished
        dispatch_semaphore_signal(sema);
    }];
    
    //Wait for get witnesses to finish
    dispatch_semaphore_wait(sema, DISPATCH_TIME_FOREVER);
    
    //Return witnesses
    return returnWitnessList;
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

RCT_REMAP_METHOD(restoreAccountFromMnemonics,
                 mnemonics: (NSString *) mnemonics
                 password:(NSString *)password
                 restoreAccountFromMnemonicsWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    @try
        {
        //Create tron signature for mnemonics & password, then verify it is valid
        TronSignature *tronSignature = [TronSignature signatureWithMnemonics: mnemonics secret: password];
        if(!tronSignature.valid)
        {
            //Signature is invalid, reject and return
            reject(@"Failed to restore account from mnemonics", @"Mnemonics invalid", nil);
            return;
        }
        
        //Create restored account dictionary
        NSDictionary *returnRestoredAccount =
        @{
            @"address": tronSignature.address,
            @"privateKey": tronSignature.privateKey
        };
        
        //Return the restored account dictionary
        resolve(returnRestoredAccount);
    }
    @catch(NSException *e)
    {
        //Exception, reject
        NSDictionary *userInfo = @{ @"name": e.name, @"reason": e.reason };
        NSError *error = [NSError errorWithDomain: @"com.bholland.tronclient" code: 0 userInfo: userInfo];
        reject(@"Failed to restore account from mnemonics", @"Native exception thrown", error);
    }
}

RCT_REMAP_METHOD(restoreAccountFromPrivateKey,
                 privateKey: (NSString *) privateKey
                 restoreAccountFromMnemonicsWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    @try
    {
        //Create tron signature for private key, then verify it is valid
        TronSignature *tronSignature = [TronSignature signatureWithPrivateKey: privateKey];
        if(!tronSignature.valid)
        {
            //Signature is invalid, reject and return
            reject(@"Failed to restore account from private key", @"Private key invalid", nil);
            return;
        }
        
        //Create restored account dictionary
        NSDictionary *returnRestoredAccount =
        @{
          @"address": tronSignature.address,
          @"privateKey": tronSignature.privateKey,
        };
        
        //Return the restored account dictionary
        resolve(returnRestoredAccount);
    }
    @catch(NSException *e)
    {
        //Exception, reject
        NSDictionary *userInfo = @{ @"name": e.name, @"reason": e.reason };
        NSError *error = [NSError errorWithDomain: @"com.bholland.tronclient" code: 0 userInfo: userInfo];
        reject(@"Failed to restore account from private key", @"Native exception thrown", error);
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
        Account * _Nullable responseAccount = [self _getAccount: requestAccount];
        if(!responseAccount)
        {
            //No response, reject and return
            reject(@"Failed to get account", @"No response from host for get account", nil);
            return;
        }
        
        //Attempt to get account network stats
        AccountNetMessage * _Nullable accountNetworkStats = [self _getAccountNetworkStats: responseAccount];
        if(!accountNetworkStats)
        {
            //Problem getting account network stats, reject and return
            reject(@"Failed to get account", @"No response from host for get account network stats", nil);
            return;
        }
        
        //Create bandwidth stats dictionary
        NSDictionary *bandwidthStats =
        @{
            @"freeNetUsed": @(accountNetworkStats.freeNetUsed),
            @"freeNetLimit": @(accountNetworkStats.freeNetLimit),
            @"netUsed": @(accountNetworkStats.netUsed),
            @"netLimit": @(accountNetworkStats.netLimit)
        };
        
        //Create list of votes
        int64_t votesTotal = 0;
        NSMutableArray *votes = [NSMutableArray arrayWithCapacity: responseAccount.votesArray_Count];
        for(Vote *vote in responseAccount.votesArray)
        {
            votesTotal += vote.voteCount;
            
            NSString *voteAddress = [NSString encodedBase58StringWithData: vote.voteAddress];
            NSDictionary *voteDict = @{ @"address" : voteAddress, @"count": @(vote.voteCount) };
            [votes addObject: voteDict];
        }
        
        //Create list of assets
        NSMutableArray *assets = [NSMutableArray arrayWithCapacity: responseAccount.asset_Count];
        [responseAccount.asset enumerateKeysAndInt64sUsingBlock:^(NSString * _Nonnull key, int64_t value, BOOL * _Nonnull stop)
        {
            NSDictionary *asset = @{ @"name": key, @"balance": @(value) };
            [assets addObject: asset];
        }];
        
        //Create list of frozen balances and total
        int64_t frozenTotal = 0;
        NSMutableArray *frozenBalances = [NSMutableArray arrayWithCapacity: responseAccount.frozenArray_Count];
        for(Account_Frozen *frozen in responseAccount.frozenArray)
        {
            frozenTotal += frozen.frozenBalance;
            NSDictionary *frozenBalance =
            @{
                @"balance": @((frozen.frozenBalance / kTronClientTrxDrop)),
                @"expireTime": @(frozen.expireTime)
            };
            [frozenBalances addObject: frozenBalance];
        }
        
        //Create account dictionary
        NSDictionary *returnAccount =
        @{
            @"address": accountAddress,
            @"name": responseAccount.accountName,
            @"balance": @((responseAccount.balance / kTronClientTrxDrop)),
            @"assets": assets,
            @"frozen": frozenBalances,
            @"frozenTotal": @((frozenTotal / kTronClientTrxDrop)),
            @"bandwidth": bandwidthStats,
            @"votes": votes,
            @"votesTotal": @(votesTotal)
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
}

RCT_REMAP_METHOD(getWitnesses,
                 getWitnessesWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    @try
    {
        //Attempt to get the witnesses
        WitnessList * _Nullable witnesses = [self _getWitnesses];
        if(!witnesses)
        {
            //No response, reject and return
            reject(@"Failed to get witnesses", @"No response from host for get witnesses", nil);
            return;
        }
        
        //Create list of witnesses
        NSMutableArray *returnWitnesses = [NSMutableArray arrayWithCapacity: witnesses.witnessesArray_Count];
        for(Witness *witness in witnesses.witnessesArray)
        {
            NSString *witnessAddress = [NSString encodedBase58StringWithData: witness.address];
            NSDictionary *witnessDict =
            @{
                @"address": witnessAddress,
                @"url": witness.URL,
                @"voteCount": @(witness.voteCount),
                @"totalProduced": @(witness.totalProduced),
                @"totalMissed": @(witness.totalMissed),
                @"latestBlockNum": @(witness.latestBlockNum),
                @"latestSlotNum": @(witness.latestSlotNum)
            };
            [returnWitnesses addObject: witnessDict];
        }
        
        //Return the witnesses array
        resolve(returnWitnesses);
    }
    @catch(NSException *e)
    {
        //Exception, reject
        NSDictionary *userInfo = @{ @"name": e.name, @"reason": e.reason };
        NSError *error = [NSError errorWithDomain: @"com.bholland.tronclient" code: 0 userInfo: userInfo];
        reject(@"Failed to get witnesses", @"Native exception thrown", error);
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
            reject(@"Failed to send", @"No/bad response from host for broadcast transaction", nil);
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
            reject(@"Failed to send token", @"No/bad response from host for broadcast transaction", nil);
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

RCT_REMAP_METHOD(freezeBalance,
                 ownerPrivateKey:(NSString *)ownerPrivateKey
                 amount:(NSNumber * _Nonnull)amount
                 duration:(NSNumber * _Nonnull)duration
                 freezeBalanceWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    @try
    {
        //Create tron signature for private key, then verify it is valid
        TronSignature *tronSignature = [TronSignature signatureWithPrivateKey: ownerPrivateKey];
        if(!tronSignature.valid)
        {
            //Signature is invalid, reject and return
            reject(@"Failed to freeze balance", @"Owner private key invalid", nil);
            return;
        }
        
        //Get data for contract
        NSData *ownerAddressData = [tronSignature.address decodedBase58Data];
        
        //Create freeze balance contract
        FreezeBalanceContract *freezeBalanceContract = [FreezeBalanceContract message];
        freezeBalanceContract.ownerAddress = ownerAddressData;
        freezeBalanceContract.frozenBalance = ([amount longLongValue] * kTronClientTrxDrop);
        freezeBalanceContract.frozenDuration = [duration longLongValue];
        
        //Attempt to create the transaction using the freeze balance contract
        Transaction * _Nullable transaction = [self _createTransactionWithFreezeBalanceContract: freezeBalanceContract];
        if(!transaction)
        {
            //Problem creating transaction, reject and return
            reject(@"Failed to freeze balance", @"No/bad response from host for create transaction", nil);
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
            reject(@"Failed to freeze balance", @"No/bad response from host for broadcast transaction", nil);
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
        reject(@"Failed to freeze balance", @"Native exception thrown", error);
    }
}

RCT_REMAP_METHOD(unfreezeBalance,
                 ownerPrivateKey:(NSString *)ownerPrivateKey
                 unfreezeBalanceWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    @try
    {
        //Create tron signature for private key, then verify it is valid
        TronSignature *tronSignature = [TronSignature signatureWithPrivateKey: ownerPrivateKey];
        if(!tronSignature.valid)
        {
            //Signature is invalid, reject and return
            reject(@"Failed to unfreeze balance", @"Owner private key invalid", nil);
            return;
        }
        
        //Get data for contract
        NSData *ownerAddressData = [tronSignature.address decodedBase58Data];
        
        //Create unfreeze balance contract
        UnfreezeBalanceContract *unfreezeBalanceContract = [UnfreezeBalanceContract message];
        unfreezeBalanceContract.ownerAddress = ownerAddressData;
        
        //Attempt to create the transaction using the unfreeze balance contract
        Transaction * _Nullable transaction = [self _createTransactionWithUnfreezeBalanceContract: unfreezeBalanceContract];
        if(!transaction)
        {
            //Problem creating transaction, reject and return
            reject(@"Failed to unfreeze balance", @"No/bad response from host for create transaction", nil);
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
            reject(@"Failed to unfreeze balance", @"No/bad response from host for broadcast transaction", nil);
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
        reject(@"Failed to unfreeze balance", @"Native exception thrown", error);
    }
}

RCT_REMAP_METHOD(vote,
                 ownerPrivateKey:(NSString *)ownerPrivateKey
                 votes:(NSArray * _Nonnull)votes
                 voteWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    @try
    {
        //Create tron signature for private key, then verify it is valid
        TronSignature *tronSignature = [TronSignature signatureWithPrivateKey: ownerPrivateKey];
        if(!tronSignature.valid)
        {
            //Signature is invalid, reject and return
            reject(@"Failed to vote", @"Owner private key invalid", nil);
            return;
        }
        
        //Get data for contract
        NSData *ownerAddressData = [tronSignature.address decodedBase58Data];
        
        //Create contract votes array
        NSMutableArray *contractVotes = [NSMutableArray array];
        for(NSDictionary *vote in votes)
        {
            NSString *voteAddress = [vote objectForKey: @"address"];
            NSData *voteAddressData = [voteAddress decodedBase58Data];
            NSNumber *voteCount = [vote objectForKey: @"count"];
            
            VoteWitnessContract_Vote *contractVote = [VoteWitnessContract_Vote message];
            contractVote.voteAddress = voteAddressData;
            contractVote.voteCount = [voteCount longLongValue];
            [contractVotes addObject: contractVote];
        }
        
        //Create vote witness contract
        VoteWitnessContract *voteWitnessContract = [VoteWitnessContract message];
        voteWitnessContract.ownerAddress = ownerAddressData;
        voteWitnessContract.votesArray = contractVotes;
        
        //Attempt to create the transaction using the vote witness contract
        Transaction * _Nullable transaction = [self _createTransactionWithVoteWitnessContract: voteWitnessContract];
        if(!transaction)
        {
            //Problem creating transaction, reject and return
            reject(@"Failed to vote", @"No/bad response from host for create transaction", nil);
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
            reject(@"Failed to vote", @"No/bad response from host for broadcast transaction", nil);
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
        reject(@"Failed to vote", @"Native exception thrown", error);
    }
}

@end
