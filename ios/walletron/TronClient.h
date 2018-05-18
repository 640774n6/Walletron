
#import <React/RCTBridgeModule.h>
#import <TronProtocol/api/Api.pbrpc.h>

@interface TronClient : NSObject <RCTBridgeModule>
{
    Wallet *_wallet;
}
@end
