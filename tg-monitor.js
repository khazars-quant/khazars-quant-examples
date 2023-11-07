const khazars = require("khazars-quant")
require('dotenv').config()
const targetUid = process.env.UID
const tg = require("./utils/tg")
const sleepInterval = 3600 * 1000;
var objs = []
function sleep (ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}
function getKeys()
{
    return JSON.parse(
        process.env.KEYS
    )
}
function getSpotBal(symble,data)
{
    var ret = false
    data.forEach(e => {
        if(e?.asset == symble)
        {
            ret = e ;   
        }
    });
    return ret;
}
function getFutureBal(data)
{
    return {
    totalInitialMargin: data.totalInitialMargin,
    totalMaintMargin: data.totalMaintMargin,
    totalWalletBalance: data.totalWalletBalance,
    totalUnrealizedProfit: data.totalUnrealizedProfit,
    totalMarginBalance: data.totalMarginBalance,
    totalPositionInitialMargin: data.totalPositionInitialMargin,
    totalOpenOrderInitialMargin: data.totalOpenOrderInitialMargin,
    totalCrossWalletBalance: data.totalCrossWalletBalance,
    totalCrossUnPnl: data.totalCrossUnPnl,
    availableBalance: data.availableBalance,
    maxWithdrawAmount: data.maxWithdrawAmount,
    }
}
async function getBal(arr)
{
    var total = {
        totalBalance:0,
        totalavailableBalance:0,
        totalMarginBalance:0,
        totalFutureBalance:0,
    }
    var ret = {
        details : [],
        total:{}
    }
    for(var i = 0 ; i < arr.length ; i++)
    {
        var t = {
            totalBalance:0,
            totalavailableBalance:0,
            totalMarginBalance:0,
        }
        var e = arr[i];
        var s = (await e.spot.account())?.data?.balances;
        var spots = getSpotBal("USDT",s)
        total.totalBalance+=Number(spots.free);
        total.totalavailableBalance+=Number(spots.free);
        total.totalMarginBalance+=Number(spots.free);
        
        t.totalBalance+=Number(spots.free);
        t.totalavailableBalance+=Number(spots.free);
        t.totalMarginBalance+=Number(spots.free);
        
        var f = (await e.future.account())?.data;
        var future = getFutureBal(f);
        total.totalBalance+=Number(future.totalCrossWalletBalance);
        total.totalavailableBalance+=Number(future.availableBalance);
        total.totalMarginBalance+=Number(future.totalMarginBalance);
        total.totalFutureBalance+=Number(future.totalCrossWalletBalance);
        
        t.totalBalance+=Number(future.totalCrossWalletBalance);
        t.totalavailableBalance+=Number(future.availableBalance);
        t.totalMarginBalance+=Number(future.totalMarginBalance);
        
        ret.details.push(
            {
                name:arr[i].name,
                spot :spots,
                future : future,
                total : t
            })
    }
    ret.total = total;
    return ret;
}
async function newMsg(text)
{
    await tg.send(targetUid , text ,{
        parse_mode:'MarkDown'
    } )
}
function markDownTemplate(data)
{
    var ret = ` 🔥 *Balance Call* 🔥 
🚀 Total Balance : \$\`${data.total.totalBalance}\`
💰 Future Balance : \$\`${data.total.totalFutureBalance}\`
🍺 Total Availiable : \$\`${data.total.totalavailableBalance}\`
🦋 Total Margin : \$\`${data.total.totalMarginBalance}\`
🌈 Unfinished Profited : \$\`${data.total.totalMarginBalance - data.total.totalBalance}\`
Time : \`${new Date().toLocaleString()}\`

*Details* :
`
     data.details.forEach(e => {
         ret+=`
\`${e.name}\` :
🌈 Total Balance : \$\`${e.total.totalBalance}\`
Total Availiable : \$\`${e.total.totalavailableBalance}\`
Total Margin : \$\`${e.total.totalMarginBalance}\`
Unfinished Profited : \$\`${e.total.totalMarginBalance - e.total.totalBalance}\`
`
     })
     return ret;
}
async function init()
{
    var keys = getKeys();
    for(var i = 0 ; i < keys.length ; i++)
    {
        objs.push(
            {
                "name":keys[i].name,
                "spot": new khazars.quant("binance_spot",[keys[i].key,keys[i].sec]),
                "future":new khazars.quant("binance_future",[keys[i].key,keys[i].sec])
            }
        )
    }
    while(true)
    {
        var bal = await getBal(objs)
        var text = markDownTemplate(bal);
        console.log(text)
        await newMsg(text);
        await sleep(sleepInterval);
    }
}
init()
