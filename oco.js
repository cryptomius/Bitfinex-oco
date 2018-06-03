// This script will enter you into a position (limit / market / stop) and automatically set a 100% stop and target as an oco pair.

// SETUP
const bitfinexAPIKey			= ''			// leave blank to use API_KEY from .env file
const bitfinexAPISecret		= ''			// leave blank to use API_SECRET from .env file
// END SETUP

// run using `node oco` 

////////////////////////////////////

var argv = parseArguments()

var tradingPair = argv.pair.toUpperCase()
var tradeAmount	= argv.amount
var entryPrice = argv.entry
var stopPrice = argv.stop
var entryDirection = argv.short ? 'short' : 'long'
var entryLimitOrder	= argv.limit
var margin = !argv.exchange
var targetMultiplier = argv.target
var hiddenExitOrders = argv.hideexit
var targetoverride = argv.targetoverride

const bfxExchangeTakerFee = 0.002 // 0.2% 'taker' fee 

var roundToSignificantDigitsBFX = function(num) {
	// Bitfinex uses 5 significant digits
	// 	https://support.bitfinex.com/hc/en-us/articles/115000371105-How-is-precision-calculated-using-Significant-Digits
	var n = 5
  if(num == 0) { return 0 }
  var d = Math.ceil(Math.log10(num < 0 ? -num: num))
  var power = n - d
  var magnitude = Math.pow(10, power)
  var shifted = Math.round(num*magnitude)
  return shifted/magnitude
}

const BFX = require('bitfinex-api-node')
require('dotenv').config()
const { API_KEY, API_SECRET } = process.env
const { Order } = BFX.Models

const bfx = new BFX({
	apiKey: bitfinexAPIKey==''?API_KEY:bitfinexAPIKey,
	apiSecret: bitfinexAPISecret==''?API_SECRET:bitfinexAPISecret,

	ws: {
		autoReconnect: true,
		seqAudit: false,
		packetWDDelay: 10 * 1000
	}
})

entryPrice 	= roundToSignificantDigitsBFX(entryPrice)
stopPrice 	= roundToSignificantDigitsBFX(stopPrice)
tradeAmount = roundToSignificantDigitsBFX(tradeAmount)

const ws = bfx.ws()

ws.on('error', (err) => console.log(err))
ws.on('open', ws.auth.bind(ws))

ws.once('auth', () => {
	const o = new Order({
		cid: Date.now(),
		symbol: 't' + tradingPair,
		price: entryPrice,
		amount: (entryDirection=='long')?tradeAmount:-tradeAmount,
		hidden: hiddenExitOrders,
		type: Order.type[(!margin?"EXCHANGE_":"") + (entryPrice==0?"MARKET":entryLimitOrder?"LIMIT":"STOP")]
	}, ws)

	// Enable automatic updates
	o.registerListeners()

	o.on('update', () => {
		console.log(`Order updated: ${o.serialize()}`)
	})

	o.on('close', () => {
		console.log(`Order status: ${o.status}`)

		if (o.status != 'CANCELED') {
			console.log('-- POSITION ENTERED --')
			if(!margin){ tradeAmount = tradeAmount - (tradeAmount * bfxExchangeTakerFee) }
			
				amount1 = roundToSignificantDigitsBFX(((entryDirection=='long')?-tradeAmount:tradeAmount))

				console.log(' Average price of entry = ' + o.priceAvg)

				if(o.priceAvg != null){ entryPrice = o.priceAvg }

				price1 = roundToSignificantDigitsBFX(entryPrice-((stopPrice-entryPrice)*targetMultiplier))

				const o2 = new Order({
					cid: Date.now(),
					symbol: 't' + tradingPair,
					price: targetoverride?targetoverride:price1, // target price 
					amount: amount1,
					type: Order.type[(!margin?"EXCHANGE_":"") + "LIMIT"],
					oco: true,
					hidden: hiddenExitOrders,
					priceAuxLimit: stopPrice
				}, ws)

				

				o2.submit().then(() => {
					
					console.log('Submitted 100% stop and target order.')
					console.log('------------------------------------------')
					console.log('Good luck! Making gains? Drop me a tip: https://tinyurl.com/bfxoco')
					console.log('------------------------------------------')
					ws.close()
					process.exit()

				}).catch((err) => {
					console.error(err)
					ws.close()
					process.exit()
				})
			
		} else {
			ws.close()
			process.exit()
		}
	})

	o.submit().then(() => {
		console.log(`submitted entry order ${o.id}`)
	}).catch((err) => {
		console.error(err)
		process.exit()
	})
})

if (margin == false && entryDirection == 'short') {
	console.log('You must use margin=true if you want to go short.')
	process.exit()
}else{
	ws.open()
}

function parseArguments() {
	return require('yargs')
	.usage('Usage: node $0')
	.example('node $0 -p BTCUSD -a 0.004 -e 10000 -s 9000 -T 11000', 'Place a long market stop entry order for 0.004 BTC @ 10000 USD with stop at 9000 USD and close position at 11000.')
	// '-p <tradingPair>'
	.demand('pair')
	.alias('p', 'pair')
	.describe('p', 'Set trading pair eg. BTCUSD')
	// '-a <tradeAmount>'
	.demand('amount')
	.number('a')
	.alias('a', 'amount')
	.describe('a', 'Set amount to buy/sell')
	// '-e <entryPrice>'
	.number('e')
	.alias('e', 'entry')
	.describe('e', 'Set entry price (exclude for market price)')
	.default('e', 0)
	// '-s <stopPrice>'
	.demand('stop')
	.number('s')
	.alias('s', 'stop')
	.describe('s', 'Set stop price')
	// '-t <targetMultiplier>'
	.alias('t', 'target')
	.describe('t', 'Set target multiplier eg. 1.4 for 1:1.4 position closure. Default 1:1. Ignored if -T price is set.')
	.default('t', 1)
	// '-S' for 'short' (entry sell) entry direction. Default direction is 'long' (entry buy)
	.boolean('S')
	.alias('S', 'short')
	.describe('S', 'Enter short (entry sell) instead of long (entry buy) position')
	.default('S', false)
	// '-l' for limit-order entry
	.boolean('l')
	.alias('l', 'limit')
	.describe('l', 'Place limit-order instead of a market stop-order entry (ignored if entryPrice is 0)')
	.default('l', false)
	// '-x' for exchange trading
	.boolean('x')
	.alias('x', 'exchange')
	.describe('x', 'Trade on exchange instead of margin')
	.default('x', false)
	// '-h' for hidden exit orders
	.boolean('h')
	.alias('h', 'hideexit')
	.describe('h', 'Hide your target and stop orders from the orderbook')
	.default('h', false)
	.alias('T', 'targetoverride')
	.describe('T', 'Set target to close position.')
	.default('T', 0)
	.wrap(process.stdout.columns)
	.argv;
}
