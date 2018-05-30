import { NativeModules, AsyncStorage } from 'react-native';

class TronWalletService {
  static instance;

  constructor()
  {
    if(TronWalletService.instance) { return TronWalletService.instance; }
    this.wallets = [];
    this.currentWallet = null;
    TronWalletService.instance = this;
  }

  async save() {
    try {
      await AsyncStorage.setItem('@walletron:wallets', JSON.stringify(this._wallets));

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

  async validateAddress(address) {
    try {
      var tronClient = NativeModules.TronClient;
      var addressValid = await tronClient.validateAddress(address);
      return addressValid;
    }
    catch (error) { }
    return false;
  }

  async generateAccount(password) {
    try {
      var tronClient = NativeModules.TronClient;
      var generatedAccount = await tronClient.generateAccount(password);
      return generatedAccount;
    }
    catch (error) { }
    return null;
  }

  async restoreAccountFromMnemonics(mnemonics, password) {
    try {
      var tronClient = NativeModules.TronClient;
      var restoredAccount = await tronClient.restoreAccountFromMnemonics(mnemonics, password);
      return restoredAccount;
    }
    catch (error) { }
    return null;
  }

  async restoreAccountFromPrivateKey(privateKey)
  {
    try {
      var tronClient = NativeModules.TronClient;
      var restoredAccount = await tronClient.restoreAccountFromPrivateKey(privateKey);
      return restoredAccount;
    }
    catch (error) { }
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
