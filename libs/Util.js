import React from 'react';

export default class Util {
  static async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
