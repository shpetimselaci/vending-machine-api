import { Coins } from "@/constants/coins";
const coins = Object.values(Coins).filter((value) => !isNaN(Number(value))) as number[];
coins.sort((a, b) => a - b);

export const coinChange = (_amount: number) => {
  if (_amount < 0) {
    throw new Error("There's no change for negative amount");
  }
  if (_amount === 0) {
    return [];
  }

  const coinsToWorkWith = coins.filter((coin) => !(coin > _amount));
  let amount = Number(_amount);

  const change: number[] = [];
  for (let i = coinsToWorkWith.length - 1; i >= 0; i--) {
    const coin = coinsToWorkWith[i];

    const amountOfCoins = new Array(Math.floor(amount / coin)).fill(coin);
    change.unshift(...amountOfCoins);

    amount = amount % coin;

    if (amount === 0) {
      return change;
    }
  }

  return change;
};
