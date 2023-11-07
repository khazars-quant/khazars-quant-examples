const khazars = require("khazars-quant")
require('dotenv').config()
var objs = []
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
async function getBal(arr)
{
    for(var i = 0 ; i < arr.length ; i++)
    {
        var e = arr[i];
        var s = (await e.spot.account())?.data?.balances;
        //var spots = getSpotBal("BTC",s)
        //console.log(spots)
        var future = await e.future.account();
        console.log(future)
    }
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
    console.log(objs)
    var bal = getBal(objs)
}
init()
