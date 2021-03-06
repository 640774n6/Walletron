package com.bholland.tronclient;

import android.content.Context;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableArray;

import com.google.protobuf.ByteString;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;

import org.tron.api.GrpcAPI;
import org.tron.api.GrpcAPI.*;
import org.tron.api.GrpcAPI.Return.response_code;
import org.tron.api.WalletGrpc;
import org.tron.api.WalletSolidityGrpc;

import org.tron.common.crypto.ECKey;
import org.tron.common.crypto.Hash;
import org.tron.common.crypto.SymmEncoder;
import org.tron.common.utils.*;

import org.tron.protos.Contract;
import org.tron.protos.Protocol.Account;
import org.tron.protos.Protocol.Account.Frozen;
import org.tron.protos.Protocol.Vote;
import org.tron.protos.Protocol.Block;
import org.tron.protos.Protocol.Transaction;
import org.tron.protos.Protocol.Witness;

import org.spongycastle.util.encoders.*;

import io.github.novacrypto.bip39.MnemonicGenerator;
import io.github.novacrypto.bip39.MnemonicValidator;
import io.github.novacrypto.bip39.SeedCalculator;
import io.github.novacrypto.bip39.Words;
import io.github.novacrypto.bip39.wordlists.English;

import java.security.SecureRandom;
import java.math.BigInteger;
import java.util.*;
import java.lang.*;

public class TronClientModule extends ReactContextBaseJavaModule
{
  /*
  "47.254.18.49:50051",
  "18.188.111.53:50051",
  "54.219.41.56:50051",
  "35.169.113.187:50051",
  "34.214.241.188:50051",
  "47.254.146.147:50051",
  "47.254.144.25:50051",
  "47.91.246.252:50051",
  "47.91.216.69:50051",
  "39.106.220.120:50051"
  */
  private static final String TAG = "TronClient";
  private static final String HOST_ADDRESS = "52.14.86.232:50051";
  private static final int TRX_DROP = 1000000;
  private static final int DECODED_PUBKEY_LENGTH = 21;
  private static final int DECODED_PREFIX_BYTE = 0xa0;
  private static final int PRIVATE_KEY_LENGTH = 64;

  private final ReactApplicationContext reactContext;

  private ManagedChannel channelFull = null;
  private WalletGrpc.WalletBlockingStub blockingStubFull = null;

  public TronClientModule(ReactApplicationContext reactContext)
  {
      super(reactContext);
      this.reactContext = reactContext;

      //Create channel
      channelFull = ManagedChannelBuilder.forTarget(HOST_ADDRESS)
        .usePlaintext(true)
        .build();

      //Create blocking stub
      blockingStubFull = WalletGrpc.newBlockingStub(channelFull);
  }

  @Override
  public String getName()
  { return "TronClient"; }

  private static byte[] _decode58Check(String input)
  {
    byte[] decodeCheck = Base58.decode(input);
    if (decodeCheck.length <= 4)
    { return null; }

    byte[] decodeData = new byte[decodeCheck.length - 4];
    System.arraycopy(decodeCheck, 0, decodeData, 0, decodeData.length);
    byte[] hash0 = Hash.sha256(decodeData);
    byte[] hash1 = Hash.sha256(hash0);
    if (hash1[0] == decodeCheck[decodeData.length] &&
        hash1[1] == decodeCheck[decodeData.length + 1] &&
        hash1[2] == decodeCheck[decodeData.length + 2] &&
        hash1[3] == decodeCheck[decodeData.length + 3])
    { return decodeData; }

    return null;
  }

  private static String _encode58Check(byte[] input)
  {
    byte[] hash0 = Hash.sha256(input);
    byte[] hash1 = Hash.sha256(hash0);
    byte[] inputCheck = new byte[input.length + 4];
    System.arraycopy(input, 0, inputCheck, 0, input.length);
    System.arraycopy(hash1, 0, inputCheck, input.length, 4);
    return Base58.encode(inputCheck);
  }

  private GrpcAPI.Return _broadcastTransaction(Transaction signaturedTransaction)
  {
    int i = 10;
    GrpcAPI.Return response = blockingStubFull.broadcastTransaction(signaturedTransaction);
    while (response.getResult() == false && response.getCode() == response_code.SERVER_BUSY && i > 0)
    {
      i--;
      response = blockingStubFull.broadcastTransaction(signaturedTransaction);
      try
      { Thread.sleep(300); }
      catch (InterruptedException e) { }
    }
    return response;
  }

  @ReactMethod
  public void setFullNodeHost(final String fullNodeHostString, final Promise promise)
  {
    new Thread(new Runnable()
    {
      public void run()
      {
        try
        {
          //Create channel
          channelFull = ManagedChannelBuilder.forTarget(fullNodeHostString)
            .usePlaintext(true)
            .build();

          //Create blocking stub
          blockingStubFull = WalletGrpc.newBlockingStub(channelFull);

          //Return true
          promise.resolve(true);
        }
        catch(Exception e)
        {
          //Exception, reject
          promise.reject("Failed to set full node host", "Native exception thrown", e);
        }
      }
    }).start();
  }

  @ReactMethod
  public void generateAccount(final String password, final Promise promise)
  {
    new Thread(new Runnable()
    {
      public void run()
      {
        try
        {
          //Create mnemonics
          final StringBuilder sb = new StringBuilder();
          byte[] entropy = new byte[Words.TWELVE.byteLength()];
          new SecureRandom().nextBytes(entropy);
          new MnemonicGenerator(English.INSTANCE)
          .createMnemonic(entropy, new MnemonicGenerator.Target()
          {
            @Override
            public void append(final CharSequence string)
            { sb.append(string); }
          });

          //Create ECKey from mnemonics seed
          String mnemonics = sb.toString();
          byte[] mnemonicSeedBytes = new SeedCalculator().calculateSeed(mnemonics, password);
          byte[] seedBytes = Arrays.copyOfRange(mnemonicSeedBytes, 0, 32);
          ECKey key = ECKey.fromPrivate(seedBytes);

          //Get public address
          byte[] addressBytes = key.getAddress();
          String address = _encode58Check(addressBytes);

          //Get private key
          byte[] privateKeyBytes = key.getPrivKeyBytes();
          String privateKey = ByteArray.toHexString(privateKeyBytes).toUpperCase();

          //Create generated account map
          WritableMap returnGeneratedAccount = Arguments.createMap();
          returnGeneratedAccount.putString("address", address);
          returnGeneratedAccount.putString("privateKey", privateKey);
          returnGeneratedAccount.putString("mnemonics", mnemonics);

          //Return generated account map
          promise.resolve(returnGeneratedAccount);
        }
        catch(Exception e)
        {
          //Exception, reject
          promise.reject("Failed to generate account", "Native exception thrown", e);
        }
      }
    }).start();
  }

  @ReactMethod
  public void restoreAccountFromMnemonics(final String mnemonics, final String password, final Promise promise)
  {
    new Thread(new Runnable()
    {
      public void run()
      {
        try
        {
          //Verify mnemonics are valid
          MnemonicValidator
            .ofWordList(English.INSTANCE)
            .validate(mnemonics);

          //Create ECKey from mnemonics seed
          byte[] mnemonicSeedBytes = new SeedCalculator().calculateSeed(mnemonics, password);
          byte[] seedBytes = Arrays.copyOfRange(mnemonicSeedBytes, 0, 32);
          ECKey key = ECKey.fromPrivate(seedBytes);

          //Get public address
          byte[] addressBytes = key.getAddress();
          String address = _encode58Check(addressBytes);

          //Get private key
          byte[] privateKeyBytes = key.getPrivKeyBytes();
          String privateKey = ByteArray.toHexString(privateKeyBytes).toUpperCase();

          //Create restored account map
          WritableMap returnRestoredAccount = Arguments.createMap();
          returnRestoredAccount.putString("address", address);
          returnRestoredAccount.putString("privateKey", privateKey);

          //Return restored account map
          promise.resolve(returnRestoredAccount);
        }
        catch(Exception e)
        {
          //Exception, reject
          promise.reject("Failed to restore account from mnemonics", "Native exception thrown", e);
        }
      }
    }).start();
  }

  @ReactMethod
  public void restoreAccountFromPrivateKey(final String privateKey, final Promise promise)
  {
    new Thread(new Runnable()
    {
      public void run()
      {
        try
        {
          //Get key
          byte[] privateKeyBytes = ByteArray.fromHexString(privateKey);
          ECKey key = ECKey.fromPrivate(privateKeyBytes);

          //Get public address
          byte[] addressBytes = key.getAddress();
          String address = _encode58Check(addressBytes);

          //Create restored account map
          WritableMap returnRestoredAccount = Arguments.createMap();
          returnRestoredAccount.putString("address", address);
          returnRestoredAccount.putString("privateKey", privateKey);

          //Return restored account map
          promise.resolve(returnRestoredAccount);
        }
        catch(Exception e)
        {
          //Exception, reject
          promise.reject("Failed to restore account from private key", "Native exception thrown", e);
        }
      }
    }).start();
  }

  @ReactMethod
  public void validateAddress(final String accountAddress, final Promise promise)
  {
    new Thread(new Runnable()
    {
      public void run()
      {
        try
        {
          byte[] decodedAddress = _decode58Check(accountAddress);
          int prefixByteValue = decodedAddress[0] & 0xFF;
          boolean addressIsValid = (decodedAddress != null &&
                                    decodedAddress.length == DECODED_PUBKEY_LENGTH &&
                                    prefixByteValue == DECODED_PREFIX_BYTE);
          promise.resolve(addressIsValid);
        }
        catch(Exception e)
        { promise.resolve(false); }
      }
    }).start();
  }

  @ReactMethod
  public void getAccount(final String accountAddress, final Promise promise)
  {
    new Thread(new Runnable()
    {
      public void run()
      {
        try
        {
          //Decode base58 address
          byte[] decodedAddress = _decode58Check(accountAddress);
          ByteString addressBS = ByteString.copyFrom(decodedAddress);

          //Attempt to get account using decoded address
          Account requestAccount = Account.newBuilder().setAddress(addressBS).build();
          Account responseAccount = blockingStubFull.getAccount(requestAccount);
          if(responseAccount == null)
          {
            //No response, reject and return
            promise.reject("Failed to get account", "No response from host for get account", null);
            return;
          }

          AccountNetMessage accountNetworkStats = blockingStubFull.getAccountNet(responseAccount);
          if(accountNetworkStats == null)
          {
            //No response, reject and return
            promise.reject("Failed to get account", "No response from host for get account network stats");
            return;
          }

          //Create bandwidth stats map
          WritableMap bandwidthStats = Arguments.createMap();
          bandwidthStats.putDouble("freeNetUsed", accountNetworkStats.getFreeNetUsed());
          bandwidthStats.putDouble("freeNetLimit", accountNetworkStats.getFreeNetLimit());
          bandwidthStats.putDouble("netUsed", accountNetworkStats.getNetUsed());
          bandwidthStats.putDouble("netLimit", accountNetworkStats.getNetLimit());

          //Parse votes
          long votesTotal = 0;
          List<Vote> votesList = responseAccount.getVotesList();
          WritableArray returnVotes = Arguments.createArray();
          for (Vote vote : votesList)
          {
            votesTotal += vote.getVoteCount();

            ByteString voteAddressBS = vote.getVoteAddress();
            byte[] voteAddressBytes = new byte[voteAddressBS.size()];
            voteAddressBS.copyTo(voteAddressBytes, 0);
            String voteAddress = _encode58Check(voteAddressBytes);

            WritableMap voteMap = Arguments.createMap();
            voteMap.putString("address", voteAddress);
            voteMap.putDouble("count", (double)vote.getVoteCount());
            returnVotes.pushMap(voteMap);
          }

          //Parse tokens
          Map<String, Long> responseAssetMap = responseAccount.getAssetMap();
          WritableArray returnAssets = Arguments.createArray();
          for (Map.Entry<String, Long> asset : responseAssetMap.entrySet())
          {
            WritableMap assetMap = Arguments.createMap();
            assetMap.putString("name", asset.getKey());
            assetMap.putDouble("balance", (double)asset.getValue());
            returnAssets.pushMap(assetMap);
          }

          //Parse frozen balances and total
          long frozenTotal = 0;
          List<Frozen> frozenList = responseAccount.getFrozenList();
          WritableArray returnFrozenBalances = Arguments.createArray();
          for (Frozen frozen : frozenList)
          {
            frozenTotal += frozen.getFrozenBalance();

            WritableMap frozenBalanceMap = Arguments.createMap();
            frozenBalanceMap.putDouble("balance", (frozen.getFrozenBalance() / TRX_DROP));
            frozenBalanceMap.putDouble("expireTime", (double)frozen.getExpireTime());
            returnFrozenBalances.pushMap(frozenBalanceMap);
          }

          //Create account map
          WritableMap returnAccountMap = Arguments.createMap();
          returnAccountMap.putString("address", accountAddress);
          returnAccountMap.putString("name", responseAccount.getAccountName().toStringUtf8());
          returnAccountMap.putDouble("balance", (responseAccount.getBalance() / TRX_DROP));
          returnAccountMap.putArray("assets", returnAssets);
          returnAccountMap.putArray("frozen", returnFrozenBalances);
          returnAccountMap.putDouble("frozenTotal", (frozenTotal / TRX_DROP));
          returnAccountMap.putMap("bandwidth", bandwidthStats);
          returnAccountMap.putArray("votes", returnVotes);
          returnAccountMap.putDouble("votesTotal", votesTotal);

          //Return account map
          promise.resolve(returnAccountMap);
        }
        catch(Exception e)
        {
          //Exception, reject
          promise.reject("Failed to get account", "Native exception thrown", e);
        }
      }
    }).start();
  }

  @ReactMethod
  public void getWitnesses(final Promise promise)
  {
    new Thread(new Runnable()
    {
      public void run()
      {
        try
        {
          //Attempt to get witness list
          WitnessList witnessList = blockingStubFull.listWitnesses(EmptyMessage.newBuilder().build());
          if(witnessList == null)
          {
            //No response, reject and return
            promise.reject("Failed to get witnesses", "No response from host for get witnesses", null);
            return;
          }

          //Parse witnesses
          List<Witness> witnesses = witnessList.getWitnessesList();
          WritableArray returnWitnesses = Arguments.createArray();
          for (Witness witness : witnesses)
          {
            ByteString witnessAddressBS = witness.getAddress();
            byte[] witnessAddressBytes = new byte[witnessAddressBS.size()];
            witnessAddressBS.copyTo(witnessAddressBytes, 0);
            String witnessAddress = _encode58Check(witnessAddressBytes);

            WritableMap witnessMap = Arguments.createMap();
            witnessMap.putString("address", witnessAddress);
            witnessMap.putString("url", witness.getUrl());
            witnessMap.putDouble("voteCount", (double)witness.getVoteCount());
            witnessMap.putDouble("totalProduced", (double)witness.getTotalProduced());
            witnessMap.putDouble("totalMissed", (double)witness.getTotalMissed());
            witnessMap.putDouble("latestBlockNum", (double)witness.getLatestBlockNum());
            witnessMap.putDouble("latestSlotNum", (double)witness.getLatestSlotNum());
            returnWitnesses.pushMap(witnessMap);
          }

          //Return witnesses
          promise.resolve(returnWitnesses);
        }
        catch(Exception e)
        {
          //Exception, reject
          promise.reject("Failed to get witnesses", "Native exception thrown", e);
        }
      }
    }).start();
  }

  @ReactMethod
  public void signTransaction(final String ownerPrivateKey, final String encodedTransaction, final Promise promise)
  {
    new Thread(new Runnable()
    {
      public void run()
      {
        try
        {
          //Get key
          byte[] ownerPrivateKeyBytes = ByteArray.fromHexString(ownerPrivateKey);
          ECKey ownerKey = ECKey.fromPrivate(ownerPrivateKeyBytes);

          //Parse transaction
          byte[] transactionBytes = org.spongycastle.util.encoders.Base64.decode(encodedTransaction);
          Transaction transaction = Transaction.parseFrom(transactionBytes);
          if(transaction == null)
          {
            //Problem creating transaction, reject and return
            promise.reject("Failed to sign transaction", "Decoder/parser error", null);
            return;
          }

          //Set timestamp and sign transaction
          transaction = TransactionUtils.setTimestamp(transaction);
          transaction = TransactionUtils.sign(transaction, ownerKey);

          //Get base64 encoded string of signed transaction
          byte[] signedTransactionBytes = transaction.toByteArray();
          String base64EncodedTransaction = new String(org.spongycastle.util.encoders.Base64.encode(signedTransactionBytes));

          //Return result
          promise.resolve(base64EncodedTransaction);
        }
        catch(Exception e)
        {
          //Exception, reject
          promise.reject("Failed to sign transaction", "Native exception thrown", e);
        }
      }
    }).start();
  }

  @ReactMethod
  public void broadcastTransaction(final String encodedTransaction, final Promise promise)
  {
    new Thread(new Runnable()
    {
      public void run()
      {
        try
        {
          //Parse transaction
          byte[] transactionBytes = org.spongycastle.util.encoders.Base64.decode(encodedTransaction);
          Transaction transaction = Transaction.parseFrom(transactionBytes);
          if(transaction == null)
          {
            //Problem creating transaction, reject and return
            promise.reject("Failed to broadcast transaction", "Decoder/parser error", null);
            return;
          }

          //Attempt to broadcast the transaction
          GrpcAPI.Return broadcastResponse = _broadcastTransaction(transaction);
          if(broadcastResponse == null)
          {
            promise.reject("Failed to broadcast transaction", "No/bad resppnse from host for broadcast transaction", null);
            return;
          }

          //Return result
          promise.resolve(broadcastResponse.getCodeValue());
        }
        catch(Exception e)
        {
          //Exception, reject
          promise.reject("Failed to broadcast transaction", "Native exception thrown", e);
        }
      }
    }).start();
  }

  @ReactMethod
  public void getOfflineSend(final String fromAddress, final String toAddress, final int amount, final Promise promise)
  {
    new Thread(new Runnable()
    {
      public void run()
      {
        try
        {
          //Get data for contract
          byte[] ownerAddressBytes = _decode58Check(fromAddress);
          ByteString ownerAddressBS = ByteString.copyFrom(ownerAddressBytes);
          byte[] decodedToAddress = _decode58Check(toAddress);
          ByteString toAddressBS = ByteString.copyFrom(decodedToAddress);

          //Create transfer contract
          Contract.TransferContract transferContract = Contract.TransferContract
            .newBuilder()
            .setOwnerAddress(ownerAddressBS)
            .setToAddress(toAddressBS)
            .setAmount(amount * TRX_DROP)
            .build();

          //Attempt to create the transaction using the transfer contract
          Transaction transaction = blockingStubFull.createTransaction(transferContract);
          if(transaction == null || transaction.getRawData().getContractCount() == 0)
          {
            //Problem creating transaction, reject and return
            promise.reject("Failed to get offline send", "No/bad response from host for create transaction", null);
            return;
          }

          //Get base64 encoded string of signed transaction
          byte[] transactionBytes = transaction.toByteArray();
          String base64EncodedTransaction = new String(org.spongycastle.util.encoders.Base64.encode(transactionBytes));

          //Return result
          promise.resolve(base64EncodedTransaction);
        }
        catch(Exception e)
        {
          //Exception, reject
          promise.reject("Failed to get offline send", "Native exception thrown", e);
        }
      }
    }).start();
  }

  @ReactMethod
  public void send(final String ownerPrivateKey, final String toAddress, final int amount, final Promise promise)
  {
    new Thread(new Runnable()
    {
      public void run()
      {
        try
        {
          //Get key
          byte[] ownerPrivateKeyBytes = ByteArray.fromHexString(ownerPrivateKey);
          ECKey ownerKey = ECKey.fromPrivate(ownerPrivateKeyBytes);

          //Get data for contract
          byte[] ownerAddressBytes = ownerKey.getAddress();
          ByteString ownerAddressBS = ByteString.copyFrom(ownerAddressBytes);
          byte[] decodedToAddress = _decode58Check(toAddress);
          ByteString toAddressBS = ByteString.copyFrom(decodedToAddress);

          //Create transfer contract
          Contract.TransferContract transferContract = Contract.TransferContract
            .newBuilder()
            .setOwnerAddress(ownerAddressBS)
            .setToAddress(toAddressBS)
            .setAmount(amount * TRX_DROP)
            .build();

          //Attempt to create the transaction using the transfer contract
          Transaction transaction = blockingStubFull.createTransaction(transferContract);
          if(transaction == null || transaction.getRawData().getContractCount() == 0)
          {
            //Problem creating transaction, reject and return
            promise.reject("Failed to send", "No/bad response from host for create transaction", null);
            return;
          }

          //Set timestamp and sign transaction
          transaction = TransactionUtils.setTimestamp(transaction);
          transaction = TransactionUtils.sign(transaction, ownerKey);

          //Attempt to broadcast the transaction
          GrpcAPI.Return broadcastResponse = _broadcastTransaction(transaction);
          if(broadcastResponse == null)
          {
            promise.reject("Failed to send", "No/bad resppnse from host for broadcast transaction", null);
            return;
          }

          //Return result
          promise.resolve(broadcastResponse.getCodeValue());
        }
        catch(Exception e)
        {
          //Exception, reject
          promise.reject("Failed to send", "Native exception thrown", e);
        }
      }
    }).start();
  }

  @ReactMethod
  public void getOfflineSendAsset(final String fromAddress, final String toAddress, final String assetName, final int amount, final Promise promise)
  {
    new Thread(new Runnable()
    {
      public void run()
      {
        try
        {
          //Get data for contract
          byte[] ownerAddressBytes = _decode58Check(fromAddress);
          ByteString ownerAddressBS = ByteString.copyFrom(ownerAddressBytes);
          byte[] decodedToAddress = _decode58Check(toAddress);
          ByteString toAddressBS = ByteString.copyFrom(decodedToAddress);
          byte[] assetNameBytes = assetName.getBytes();
          ByteString assetNameBS = ByteString.copyFrom(assetNameBytes);

          //Create transfer asset contract
          Contract.TransferAssetContract transferAssetContract = Contract.TransferAssetContract
            .newBuilder()
            .setOwnerAddress(ownerAddressBS)
            .setToAddress(toAddressBS)
            .setAssetName(assetNameBS)
            .setAmount(amount)
            .build();

          //Attempt to create the transaction using the transfer asset contract
          Transaction transaction = blockingStubFull.transferAsset(transferAssetContract);
          if(transaction == null || transaction.getRawData().getContractCount() == 0)
          {
            //Problem creating transaction, reject and return
            promise.reject("Failed to get offline send asset", "No/bad response from host for create transaction", null);
            return;
          }

          //Get base64 encoded string of signed transaction
          byte[] transactionBytes = transaction.toByteArray();
          String base64EncodedTransaction = new String(org.spongycastle.util.encoders.Base64.encode(transactionBytes));

          //Return result
          promise.resolve(base64EncodedTransaction);
        }
        catch(Exception e)
        {
          //Exception, reject
          promise.reject("Failed to offline send asset", "Native exception thrown", e);
        }
      }
    }).start();
  }

  @ReactMethod
  public void sendAsset(final String ownerPrivateKey, final String toAddress, final String assetName, final int amount, final Promise promise)
  {
    new Thread(new Runnable()
    {
      public void run()
      {
        try
        {
          //Get key
          byte[] ownerPrivateKeyBytes = ByteArray.fromHexString(ownerPrivateKey);
          ECKey ownerKey = ECKey.fromPrivate(ownerPrivateKeyBytes);

          //Get data for contract
          byte[] ownerAddressBytes = ownerKey.getAddress();
          ByteString ownerAddressBS = ByteString.copyFrom(ownerAddressBytes);
          byte[] decodedToAddress = _decode58Check(toAddress);
          ByteString toAddressBS = ByteString.copyFrom(decodedToAddress);
          byte[] assetNameBytes = assetName.getBytes();
          ByteString assetNameBS = ByteString.copyFrom(assetNameBytes);

          //Create transfer asset contract
          Contract.TransferAssetContract transferAssetContract = Contract.TransferAssetContract
            .newBuilder()
            .setOwnerAddress(ownerAddressBS)
            .setToAddress(toAddressBS)
            .setAssetName(assetNameBS)
            .setAmount(amount)
            .build();

          //Attempt to create the transaction using the transfer asset contract
          Transaction transaction = blockingStubFull.transferAsset(transferAssetContract);
          if(transaction == null || transaction.getRawData().getContractCount() == 0)
          {
            //Problem creating transaction, reject and return
            promise.reject("Failed to send asset", "No/bad response from host for create transaction", null);
            return;
          }

          //Set timestamp and sign transaction
          transaction = TransactionUtils.setTimestamp(transaction);
          transaction = TransactionUtils.sign(transaction, ownerKey);

          //Attempt to broadcast the transaction
          GrpcAPI.Return broadcastResponse = _broadcastTransaction(transaction);
          if(broadcastResponse == null)
          {
            promise.reject("Failed to send asset", "No/bad resppnse from host for broadcast transaction", null);
            return;
          }

          //Return result
          promise.resolve(broadcastResponse.getCodeValue());
        }
        catch(Exception e)
        {
          //Exception, reject
          promise.reject("Failed to send token", "Native exception thrown", e);
        }
      }
    }).start();
  }

  @ReactMethod
  public void getOfflineFreezeBalance(final String fromAddress, final int amount, final int duration, final Promise promise)
  {
    new Thread(new Runnable()
    {
      public void run()
      {
        try
        {
          //Get data for contract
          byte[] ownerAddressBytes = _decode58Check(fromAddress);
          ByteString ownerAddressBS = ByteString.copyFrom(ownerAddressBytes);

          //Create freeze balance contract
          Contract.FreezeBalanceContract freezeBalanceContract = Contract.FreezeBalanceContract
            .newBuilder()
            .setOwnerAddress(ownerAddressBS)
            .setFrozenBalance(amount * TRX_DROP)
            .setFrozenDuration(duration)
            .build();

          //Attempt to create the transaction using the freeze balance contract
          Transaction transaction = blockingStubFull.freezeBalance(freezeBalanceContract);
          if(transaction == null || transaction.getRawData().getContractCount() == 0)
          {
            //Problem creating transaction, reject and return
            promise.reject("Failed to get offline freeze balance", "No/bad response from host for create transaction", null);
            return;
          }

          //Get base64 encoded string of signed transaction
          byte[] transactionBytes = transaction.toByteArray();
          String base64EncodedTransaction = new String(org.spongycastle.util.encoders.Base64.encode(transactionBytes));

          //Return result
          promise.resolve(base64EncodedTransaction);
        }
        catch(Exception e)
        {
          //Exception, reject
          promise.reject("Failed to get offline freeze balance", "Native exception thrown", e);
        }
      }
    }).start();
  }

  @ReactMethod
  public void freezeBalance(final String ownerPrivateKey, final int amount, final int duration, final Promise promise)
  {
    new Thread(new Runnable()
    {
      public void run()
      {
        try
        {
          //Get key
          byte[] ownerPrivateKeyBytes = ByteArray.fromHexString(ownerPrivateKey);
          ECKey ownerKey = ECKey.fromPrivate(ownerPrivateKeyBytes);

          //Get data for contract
          byte[] ownerAddressBytes = ownerKey.getAddress();
          ByteString ownerAddressBS = ByteString.copyFrom(ownerAddressBytes);

          //Create freeze balance contract
          Contract.FreezeBalanceContract freezeBalanceContract = Contract.FreezeBalanceContract
            .newBuilder()
            .setOwnerAddress(ownerAddressBS)
            .setFrozenBalance(amount * TRX_DROP)
            .setFrozenDuration(duration)
            .build();

          //Attempt to create the transaction using the freeze balance contract
          Transaction transaction = blockingStubFull.freezeBalance(freezeBalanceContract);
          if(transaction == null || transaction.getRawData().getContractCount() == 0)
          {
            //Problem creating transaction, reject and return
            promise.reject("Failed to freeze balance", "No/bad response from host for create transaction", null);
            return;
          }

          //Set timestamp and sign transaction
          transaction = TransactionUtils.setTimestamp(transaction);
          transaction = TransactionUtils.sign(transaction, ownerKey);

          //Attempt to broadcast the transaction
          GrpcAPI.Return broadcastResponse = _broadcastTransaction(transaction);
          if(broadcastResponse == null)
          {
            promise.reject("Failed to freeze balance", "No/bad resppnse from host for broadcast transaction", null);
            return;
          }

          //Return result
          promise.resolve(broadcastResponse.getCodeValue());
        }
        catch(Exception e)
        {
          //Exception, reject
          promise.reject("Failed to freeze balance", "Native exception thrown", e);
        }
      }
    }).start();
  }

  @ReactMethod
  public void getOfflineUnfreezeBalance(final String fromAddress, final Promise promise)
  {
    new Thread(new Runnable()
    {
      public void run()
      {
        try
        {
          //Get data for contract
          byte[] ownerAddressBytes = _decode58Check(fromAddress);
          ByteString ownerAddressBS = ByteString.copyFrom(ownerAddressBytes);

          //Create unfreeze balance contract
          Contract.UnfreezeBalanceContract unfreezeBalanceContract = Contract.UnfreezeBalanceContract
            .newBuilder()
            .setOwnerAddress(ownerAddressBS)
            .build();

          //Attempt to create the transaction using the unfreeze balance contract
          Transaction transaction = blockingStubFull.unfreezeBalance(unfreezeBalanceContract);
          if(transaction == null || transaction.getRawData().getContractCount() == 0)
          {
            //Problem creating transaction, reject and return
            promise.reject("Failed to get offline unfreeze balance", "No/bad response from host for create transaction", null);
            return;
          }

          //Get base64 encoded string of signed transaction
          byte[] transactionBytes = transaction.toByteArray();
          String base64EncodedTransaction = new String(org.spongycastle.util.encoders.Base64.encode(transactionBytes));

          //Return result
          promise.resolve(base64EncodedTransaction);
        }
        catch(Exception e)
        {
          //Exception, reject
          promise.reject("Failed to get offline unfreeze balance", "Native exception thrown", e);
        }
      }
    }).start();
  }

  @ReactMethod
  public void unfreezeBalance(final String ownerPrivateKey, final Promise promise)
  {
    new Thread(new Runnable()
    {
      public void run()
      {
        try
        {
          //Get key
          byte[] ownerPrivateKeyBytes = ByteArray.fromHexString(ownerPrivateKey);
          ECKey ownerKey = ECKey.fromPrivate(ownerPrivateKeyBytes);

          //Get data for contract
          byte[] ownerAddressBytes = ownerKey.getAddress();
          ByteString ownerAddressBS = ByteString.copyFrom(ownerAddressBytes);

          //Create unfreeze balance contract
          Contract.UnfreezeBalanceContract unfreezeBalanceContract = Contract.UnfreezeBalanceContract
            .newBuilder()
            .setOwnerAddress(ownerAddressBS)
            .build();

          //Attempt to create the transaction using the unfreeze balance contract
          Transaction transaction = blockingStubFull.unfreezeBalance(unfreezeBalanceContract);
          if(transaction == null || transaction.getRawData().getContractCount() == 0)
          {
            //Problem creating transaction, reject and return
            promise.reject("Failed to unfreeze balance", "No/bad response from host for create transaction", null);
            return;
          }

          //Set timestamp and sign transaction
          transaction = TransactionUtils.setTimestamp(transaction);
          transaction = TransactionUtils.sign(transaction, ownerKey);

          //Attempt to broadcast the transaction
          GrpcAPI.Return broadcastResponse = _broadcastTransaction(transaction);
          if(broadcastResponse == null)
          {
            promise.reject("Failed to unfreeze balance", "No/bad resppnse from host for broadcast transaction", null);
            return;
          }

          //Return result
          promise.resolve(broadcastResponse.getCodeValue());
        }
        catch(Exception e)
        {
          //Exception, reject
          promise.reject("Failed to unfreeze balance", "Native exception thrown", e);
        }
      }
    }).start();
  }

  @ReactMethod
  public void getOfflineVote(final String fromAddress, final ReadableArray votes, final Promise promise)
  {
    new Thread(new Runnable()
    {
      public void run()
      {
        try
        {
          //Get data for contract
          byte[] ownerAddressBytes = _decode58Check(fromAddress);
          ByteString ownerAddressBS = ByteString.copyFrom(ownerAddressBytes);

          //Add votes to contract builder
          List<Contract.VoteWitnessContract.Vote> contractVotes = new ArrayList<Contract.VoteWitnessContract.Vote>();
          for (int i = 0; i < votes.size(); i++)
          {
            ReadableMap voteMap = votes.getMap(i);
            double voteCount = voteMap.getDouble("count");
            String voteAddress = voteMap.getString("address");
            byte[] decodedVoteAddress = _decode58Check(voteAddress);
            ByteString voteAddressBS = ByteString.copyFrom(decodedVoteAddress);

            Contract.VoteWitnessContract.Vote vote = Contract.VoteWitnessContract.Vote
              .newBuilder()
              .setVoteAddress(voteAddressBS)
              .setVoteCount((long)voteCount)
              .build();

            contractVotes.add(vote);
          }

          ///Create vote witness contract
          Contract.VoteWitnessContract voteWitnessContract = Contract.VoteWitnessContract
            .newBuilder()
            .setOwnerAddress(ownerAddressBS)
            .addAllVotes(contractVotes)
            .build();

          //Attempt to create the transaction using the vote witness contract
          Transaction transaction = blockingStubFull.voteWitnessAccount(voteWitnessContract);
          if(transaction == null || transaction.getRawData().getContractCount() == 0)
          {
            //Problem creating transaction, reject and return
            promise.reject("Failed to get offline vote", "No/bad response from host for create transaction", null);
            return;
          }

          //Get base64 encoded string of signed transaction
          byte[] transactionBytes = transaction.toByteArray();
          String base64EncodedTransaction = new String(org.spongycastle.util.encoders.Base64.encode(transactionBytes));

          //Return result
          promise.resolve(base64EncodedTransaction);
        }
        catch(Exception e)
        {
          //Exception, reject
          promise.reject("Failed to get offline vote", "Native exception thrown", e);
        }
      }
    }).start();
  }

  @ReactMethod
  public void vote(final String ownerPrivateKey, final ReadableArray votes, final Promise promise)
  {
    new Thread(new Runnable()
    {
      public void run()
      {
        try
        {
          //Get key
          byte[] ownerPrivateKeyBytes = ByteArray.fromHexString(ownerPrivateKey);
          ECKey ownerKey = ECKey.fromPrivate(ownerPrivateKeyBytes);

          //Get data for contract
          byte[] ownerAddressBytes = ownerKey.getAddress();
          ByteString ownerAddressBS = ByteString.copyFrom(ownerAddressBytes);

          //Add votes to contract builder
          List<Contract.VoteWitnessContract.Vote> contractVotes = new ArrayList<Contract.VoteWitnessContract.Vote>();
          for (int i = 0; i < votes.size(); i++)
          {
            ReadableMap voteMap = votes.getMap(i);
            double voteCount = voteMap.getDouble("count");
            String voteAddress = voteMap.getString("address");
            byte[] decodedVoteAddress = _decode58Check(voteAddress);
            ByteString voteAddressBS = ByteString.copyFrom(decodedVoteAddress);

            Contract.VoteWitnessContract.Vote vote = Contract.VoteWitnessContract.Vote
              .newBuilder()
              .setVoteAddress(voteAddressBS)
              .setVoteCount((long)voteCount)
              .build();

            contractVotes.add(vote);
          }

          ///Create vote witness contract
          Contract.VoteWitnessContract voteWitnessContract = Contract.VoteWitnessContract
            .newBuilder()
            .setOwnerAddress(ownerAddressBS)
            .addAllVotes(contractVotes)
            .build();

          //Attempt to create the transaction using the vote witness contract
          Transaction transaction = blockingStubFull.voteWitnessAccount(voteWitnessContract);
          if(transaction == null || transaction.getRawData().getContractCount() == 0)
          {
            //Problem creating transaction, reject and return
            promise.reject("Failed to vote", "No/bad response from host for create transaction", null);
            return;
          }

          //Set timestamp and sign transaction
          transaction = TransactionUtils.setTimestamp(transaction);
          transaction = TransactionUtils.sign(transaction, ownerKey);

          //Attempt to broadcast the transaction
          GrpcAPI.Return broadcastResponse = _broadcastTransaction(transaction);
          if(broadcastResponse == null)
          {
            promise.reject("Failed to vote", "No/bad resppnse from host for broadcast transaction", null);
            return;
          }

          //Return result
          promise.resolve(broadcastResponse.getCodeValue());
        }
        catch(Exception e)
        {
          //Exception, reject
          promise.reject("Failed to vote", "Native exception thrown", e);
        }
      }
    }).start();
  }
}
