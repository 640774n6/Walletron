package com.bholland.tronclient;

import android.content.Context;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableArray;

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
import org.tron.protos.Protocol.Block;
import org.tron.protos.Protocol.Transaction;

import org.spongycastle.util.encoders.Hex;

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
  private static final String HOST_ADDRESS = "47.254.16.55:50051";
  private static final int TRX_DROP = 1000000;

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

  private boolean _broadcastTransaction(Transaction signaturedTransaction)
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
    return response.getResult();
  }

  @ReactMethod
  public void generateAccount(String password, Promise promise)
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

  @ReactMethod
  public void restoreAccount(String mnemonics, String password, Promise promise)
  {
    //Verify mnemonics are valid
    try
    {
      MnemonicValidator
        .ofWordList(English.INSTANCE)
        .validate(mnemonics);
    }
    catch(Exception e)
    {
      //Mnemonics are invalid, reject and return
      promise.reject("Failed to restore account", "Mnemonics invalid", null);
      return;
    }

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
    returnRestoredAccount.putString("mnemonics", mnemonics);

    //Return restored account map
    promise.resolve(returnRestoredAccount);
  }

  @ReactMethod
  public void getAccount(String accountAddress, Promise promise)
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
      promise.reject("Failed to get account", "No response from host", null);
      return;
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

    //Create account map
    WritableMap returnAccountMap = Arguments.createMap();
    returnAccountMap.putString("address", accountAddress);
    returnAccountMap.putString("name", responseAccount.getAccountName().toStringUtf8());
    returnAccountMap.putDouble("balance", (responseAccount.getBalance() / TRX_DROP));
    returnAccountMap.putArray("assets", returnAssets);

    //Return account map
    promise.resolve(returnAccountMap);
  }

  @ReactMethod
  public void send(String ownerPrivateKey, String toAddress, int amount, Promise promise)
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
      promise.reject("Failed to send", "No/bad response from host", null);
      return;
    }

    //Set timestamp and sign transaction
    transaction = TransactionUtils.setTimestamp(transaction);
    transaction = TransactionUtils.sign(transaction, ownerKey);

    //Attempt to broadcast the transaction
    boolean returnResult = _broadcastTransaction(transaction);

    //Return result
    promise.resolve(returnResult);
  }

  @ReactMethod
  public void sendAsset(String ownerPrivateKey, String toAddress, String assetName, int amount, Promise promise)
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
      promise.reject("Failed to send", "No/bad response from host", null);
      return;
    }

    //Set timestamp and sign transaction
    transaction = TransactionUtils.setTimestamp(transaction);
    transaction = TransactionUtils.sign(transaction, ownerKey);

    //Attempt to broadcast the transaction
    boolean returnResult = _broadcastTransaction(transaction);

    //Return result
    promise.resolve(returnResult);
  }
}
