# Bitfinex Auto-Stop & Target (Node JS)

This Node JS script executes a long/short order when a trigger price is reached, then automatically places a 'one-cancels-other' limit+stop order to protect your position from loss and sell 100% when the target is hit.

You will need to download and install the following:

* nodeJS: [https://nodejs.org/en/download/](https://nodejs.org/en/download/)

To install and use the script:

1. Download the [Bitfinex-oco library](https://github.com/cryptomius/Bitfinex-oco/archive/master.zip) and unzip it somewhere on your computer (or clone the repository if you know how).
2. Open your Terminal/Command Prompt app, `cd` to the directory you placed it and then execute `npm install` to install the nodeJS dependencies
3. Open the ‘[oco.js](https://raw.githubusercontent.com/cryptomius/Bitfinex-oco/master/oco.js)’ file with a text editor (I use Sublime Text)
4. Enter in your Bitfinex API key and secret in the `SETUP` section.
5. Execute `node oco` for help on using the command line interface.

IMPORTANT: Your computer must be left running and connected to the internet for the stop to be placed by this script.

[More Crypto Tools by @cryptomius](https://github.com/cryptomius/Cryptomius-Crypto-Tools-Overview)

---
*Like this? Feel free to send me a tip! :-)*

**BTC**: 1GdpCvpiK6e5N5u89Dq21jJcqfzJ48zAy2  
**ETH & ERC20**: 0x13098ad7ac788e0bcd3ed38f04003c0df90ebbc9  
**ETC**: 0xb0b4efe2ad6d0ddc0d8bd030525e32580e85f0cd  
**LTC**: LdEu42hZUUSxxZboXGdes1snQfwrR7VWt3  
**DASH**: XnU3c743iqpros4YQgfsn9Nxq6T9bguH8e  
**ZEC**: t1gLKiEZP9RyKtHthvYi2Vo97fvJXL7YcMd  
**BCH**: 1H9dSN6nsoGDCG4GvPgCWRjP765kqJSXYN
