import { NativeModules, AsyncStorage } from 'react-native';

const DEFAULT_NODE = '47.254.16.55:50051';

class TronWalletService {
  static instance;

  constructor()
  {
    if(TronWalletService.instance) { return TronWalletService.instance; }
    this._wallets = [];
    this._currentWallet = null;
    this._fullNodeHost = null;
    TronWalletService.instance = this;
  }

  async save() {
    try {
      await AsyncStorage.setItem('@walletron:wallets', JSON.stringify(this._wallets));
      await AsyncStorage.setItem('@walletron:fullNodeHost', this._fullNodeHost);

      if(this._currentWallet)
      { await AsyncStorage.setItem('@walletron:currentWalletName', this._currentWallet.name); }
    }
    catch (error)
    { console.log(`TronWalletService.save() => error: ${error}`); }
  }

  async load() {
    try {
      var wallets = await AsyncStorage.getItem('@walletron:wallets');
      this._wallets = wallets ? JSON.parse(wallets) : [];

      var fullNodeHost = await AsyncStorage.getItem('@walletron:fullNodeHost');
      this._fullNodeHost = fullNodeHost ? fullNodeHost : DEFAULT_NODE;

      var currentWalletName = await AsyncStorage.getItem('@walletron:currentWalletName');
      this.setCurrentWalletByName(currentWalletName);

      console.log(`finished load: ${JSON.stringify(this._wallets)}`);
    }
    catch (error)
    { console.log(`TronWalletService.load() => error: ${error}`); }
  }

  addWallet(wallet) {
    this._wallets.push(wallet);
  }

  getCurrentWallet() {
    return this._currentWallet;
  }

  hasCurrentWallet() {
    return (this._currentWallet != undefined);
  }

  getWalletByName(name) {
    var wallet = this._wallets.find(function(wallet) { return wallet.name === name; });
    return wallet;
  }

  walletExistsWithName(name) {
    var wallet = this._wallets.find(function(wallet) { return wallet.name === name; });
    return (wallet != undefined);
  }

  setCurrentWalletByName(name) {
    var wallet = this.getWalletByName(name);
    this._currentWallet = wallet;
  }

  async setFullNodeHost(fullNodeHostString) {
    try {
      var tronClient = NativeModules.TronClient;
      var result = await tronClient.setFullNodeHost(fullNodeHostString);

      this._fullNodeHost = fullNodeHostString;
      await this.save();
      return result;
    }
    catch (error)
    { console.log(`TronWalletService.setFullNodeHost() => error: ${error}`); }
    return false;
  }

  getFullNodeHost() {
    return this._fullNodeHost;
  }

  async signTransactionFromCurrentWallet(transaction) {
    if(this._currentWallet)
    {
      try
      {
        var tronClient = NativeModules.TronClient;
        var signedTransaction = await tronClient.signTransaction(this._currentWallet.privateKey, transaction);

        return signedTransaction;
      }
      catch (error)
      { console.log(`TronWalletService.signTransaction() => error: ${error}`); }
    }
    return null;
  }

  async broadcastTransaction(transaction) {
    if(this._currentWallet)
    {
      try
      {
        var tronClient = NativeModules.TronClient;
        var result = await tronClient.broadcastTransaction(transaction);

        console.log(`TronWalletService.broadcastTransaction() => result: ${result}`);
        return (result === 0);
      }
      catch (error)
      { console.log(`TronWalletService.broadcastTransaction() => error: ${error}`); }
    }
    return false;
  }

  async validateAddress(address) {
    try {
      var tronClient = NativeModules.TronClient;
      var addressValid = await tronClient.validateAddress(address);
      return addressValid;
    }
    catch (error)
    { console.log(`TronWalletService.validateAddress() => error: ${error}`); }
    return false;
  }

  async generateAccount(password) {
    try {
      var tronClient = NativeModules.TronClient;
      var generatedAccount = await tronClient.generateAccount(password);
      return generatedAccount;
    }
    catch (error)
    { console.log(`TronWalletService.generateAccount() => error: ${error}`); }
    return null;
  }

  async restoreAccountFromMnemonics(mnemonics, password) {
    try {
      var tronClient = NativeModules.TronClient;
      var restoredAccount = await tronClient.restoreAccountFromMnemonics(mnemonics, password);
      return restoredAccount;
    }
    catch (error)
    { console.log(`TronWalletService.restoreAccountFromMnemonics() => error: ${error}`); }
    return null;
  }

  async restoreAccountFromPrivateKey(privateKey)
  {
    try {
      var tronClient = NativeModules.TronClient;
      var restoredAccount = await tronClient.restoreAccountFromPrivateKey(privateKey);
      return restoredAccount;
    }
    catch (error)
    { console.log(`TronWalletService.restoreAccountFromPrivateKey() => error: ${error}`); }
    return null;
  }

  async getOfflineSendAssetFromCurrentWallet(toAddress, assetName, amount) {
    if(this._currentWallet)
    {
      try
      {
        var tronClient = NativeModules.TronClient;
        if(assetName === 'TRX')
        {
          var transaction = await tronClient.getOfflineSend(this._currentWallet.address, toAddress, amount);

          console.log(`TronWalletService.getOfflineSendAssetFromCurrentWallet() => result: ${transaction === null}`);
          return transaction;
        }
        else
        {
          var transaction = await tronClient.getOfflineSendAsset(this._currentWallet.address, toAddress, assetName, amount);

          console.log(`TronWalletService.getOfflineSendAssetFromCurrentWallet() => result: ${transaction === null}`);
          return transaction;
        }
      }
      catch (error)
      { console.log(`TronWalletService.getOfflineSendAssetFromCurrentWallet() => error: ${error}`); }
    }
    return null;
  }

  async sendAssetFromCurrentWallet(toAddress, assetName, amount) {
    if(this._currentWallet)
    {
      try
      {
        var tronClient = NativeModules.TronClient;
        if(assetName === 'TRX')
        {
          var result = await tronClient.send(this._currentWallet.privateKey, toAddress, amount);

          console.log(`TronWalletService.sendAssetFromCurrentWallet() => result: ${result}`);
          return (result === 0);
        }
        else
        {
          var result = await tronClient.sendAsset(this._currentWallet.privateKey, toAddress, assetName, amount);

          console.log(`TronWalletService.sendAssetFromCurrentWallet() => result: ${result}`);
          return (result === 0);
        }
      }
      catch (error)
      { console.log(`TronWalletService.sendAssetFromCurrentWallet() => error: ${error}`); }
    }
    return false;
  }

  async getOfflineFreezeBalanceFromCurrentWallet(amount, duration) {
    if(this._currentWallet)
    {
      try
      {
        var tronClient = NativeModules.TronClient;
        var transaction = await tronClient.getOfflineFreezeBalance(this._currentWallet.address, amount, duration);

        console.log(`TronWalletService.getOfflineFreezeBalanceFromCurrentWallet() => result: ${transaction === null}`);
        return transaction;
      }
      catch (error)
      { console.log(`TronWalletService.getOfflineFreezeBalanceFromCurrentWallet() => error: ${error}`); }
    }
    return null;
  }

  async freezeBalanceFromCurrentWallet(amount, duration) {
    if(this._currentWallet)
    {
      try
      {
        var tronClient = NativeModules.TronClient;
        var result = await tronClient.freezeBalance(this._currentWallet.privateKey, amount, duration);

        console.log(`TronWalletService.freezeBalanceFromCurrentWallet() => result: ${result}`);
        return (result === 0);
      }
      catch (error)
      { console.log(`TronWalletService.freezeBalanceFromCurrentWallet() => error: ${error}`); }
    }
    return false;
  }

  async getOfflineUnfreezeBalanceFromCurrentWallet() {
    if(this._currentWallet)
    {
      try
      {
        var tronClient = NativeModules.TronClient;
        var transaction = await tronClient.getOfflineUnfreezeBalance(this._currentWallet.address);

        console.log(`TronWalletService.getOfflineUnfreezeBalanceFromCurrentWallet() => result: ${transaction === null}`);
        return transaction;
      }
      catch (error)
      { console.log(`TronWalletService.getOfflineUnfreezeBalanceFromCurrentWallet() => error: ${error}`); }
    }
    return null;
  }

  async unfreezeBalanceFromCurrentWallet() {
    if(this._currentWallet)
    {
      try
      {
        var tronClient = NativeModules.TronClient;
        var result = await tronClient.unfreezeBalance(this._currentWallet.privateKey);

        console.log(`TronWalletService.unfreezeBalanceFromCurrentWallet() => result: ${result}`);
        return (result === 0);
      }
      catch (error)
      { console.log(`TronWalletService.unfreezeBalanceFromCurrentWallet() => error: ${error}`); }
    }
    return false;
  }

  async getOfflineVoteFromCurrentWallet(votes) {
    if(this._currentWallet)
    {
      try
      {
        var tronClient = NativeModules.TronClient;
        var transaction = await tronClient.getOfflineVote(this._currentWallet.address, votes);

        console.log(`TronWalletService.getOfflineVoteFromCurrentWallet() => result: ${transaction === null}`);
        return transaction;
      }
      catch (error)
      { console.log(`TronWalletService.getOfflineVoteFromCurrentWallet() => error: ${error}`); }
    }
    return null;
  }

  async voteFromCurrentWallet(votes) {
    if(this._currentWallet)
    {
      try
      {
        var tronClient = NativeModules.TronClient;
        var result = await tronClient.vote(this._currentWallet.privateKey, votes);

        console.log(`TronWalletService.voteFromCurrentWallet() => result: ${result}`);
        return (result === 0);
      }
      catch (error)
      { console.log(`TronWalletService.voteFromCurrentWallet() => error: ${error}`); }
    }
  }

  async getWitnesses() {
    try
    {
      var tronClient = NativeModules.TronClient;
      var result = await tronClient.getWitnesses();
      return result;
    }
    catch (error)
    { console.log(`TronWalletService.getWitnesses() => error: ${error}`); }

    return null;
  }

  getVoteCountForAddress(address) {
    if(this._currentWallet)
    {
      var vote = this._currentWallet.votes.find(function(vote) { return vote.address === address; });
      if(vote)
      { return vote.count; }
    }
    return null;
  }

  async updateCurrentWallet() {
    if(this._currentWallet)
    {
      try {
        var tronClient = NativeModules.TronClient;
        var account = await tronClient.getAccount(this._currentWallet.address);
        this._currentWallet.balance = account.balance;
        this._currentWallet.assets = account.assets;
        this._currentWallet.frozen = account.frozen;
        this._currentWallet.frozenTotal = account.frozenTotal;
        this._currentWallet.bandwidth = account.bandwidth;
        this._currentWallet.votes = account.votes;
        this._currentWallet.votesTotal = account.votesTotal;
        this._currentWallet.timestamp = Date.now;
        await this.save();
        return true;
      }
      catch (error)
      { console.log(`TronWalletService.updateCurrentWallet() => error: ${error}`); }
    }
    return false;
  }
}

export default new TronWalletService();
