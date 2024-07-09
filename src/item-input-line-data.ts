import { XivApiResult } from "xiv-api-result";

interface ItemInputLineData {
  text: string;
  id: string;
  loaded: boolean;
  loaded2: boolean;
  ffxivId?: string;
  result?: XivApiResult;
  nqSaleVelocity?: number;
  averagePrice?: number;
  medianPrice?: number;
  medianStackSize?: number;
  monthlyMarketValue?: number;
  possibleMoneyPerDay?: number;
  numberToGatherPerDay?: number;
}

export { ItemInputLineData };
