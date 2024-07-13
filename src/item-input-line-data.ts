import { XivApiResult } from "xiv-api-result";

interface ItemInputLineData {
  text: string;
  id: string;
  loaded: boolean;
  loaded2: boolean;
  ffxivId?: string;
  icon?: string;
  result?: XivApiResult;
  nqSaleVelocity?: number;
  dailySaleVelocity?: number;
  averagePrice?: number;
  medianPrice?: number;
  medianStackSize?: number;
  monthlyMarketValue?: number;
  possibleMoneyPerDay?: number;
  numberToGatherPerDay?: number;
  currentSaleValue?: number;
  todaysProfitPotential?: number;
}

export { ItemInputLineData };
