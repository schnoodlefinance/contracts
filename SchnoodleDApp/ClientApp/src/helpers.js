import getWeb3 from "./getWeb3";
const { Duration } = require("luxon");
const humanizeDuration = require("humanize-duration");
const bigInt = require("big-integer");

let averageBlockTime = 0;
let decimals = 0;

export function scaleDownUnits(amount) {
  return bigInt(amount).divide(10 ** decimals).toJSNumber();
}

export function scaleUpUnits(amount) {
  return bigInt(amount).multiply(10 ** decimals);
}

export async function initializeHelpers(decimalsValue) {
  decimals = decimalsValue;
  await setAverageBlockTime();
}

export async function setAverageBlockTime() {
  const web3 = await getWeb3();
  const blockNumber = await web3.eth.getBlockNumber();

  if (blockNumber > 0) {
    const blocksDenominator = Math.min(500, blockNumber);
    const currentBlocktTimestamp = (await web3.eth.getBlock(blockNumber)).timestamp;
    const compareBlockTimestamp = (await web3.eth.getBlock(blockNumber - blocksDenominator)).timestamp;

    if (currentBlocktTimestamp === undefined || compareBlockTimestamp === undefined) {
      alert('Block timestamp unable to be obtained at this time. This may only be a temporary issue.');
    } else {
      averageBlockTime = (currentBlocktTimestamp - compareBlockTimestamp) / blocksDenominator;
    }
  }
}

export function calculateApy(amount, reward, blocks) {
  return reward === '0' ? 0 : Number((reward / amount / (blocks / blocksPerDuration({ years: 1 })) * 100).toPrecision(2));
}

export function blocksPerDuration(duration) {
  return averageBlockTime === 0 ? 0 : Math.floor(Duration.fromObject(duration).as('seconds') / averageBlockTime);
}

export function blocksDurationText(blocks) {
  if (blocks === 0) return;
  return 'Approximately ' + humanizeDuration(Duration.fromObject({ seconds: blocks * averageBlockTime }), { largest: 2, round: true });
}