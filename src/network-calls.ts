import { BASE_URL } from "common-data/constants";

export const getWorlds = async () => {
  try {
    const worldDataResponse = await fetch(`${BASE_URL}/worlds`);
    const worldData = await worldDataResponse.json();
    return worldData;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getTaxRates = async (world: string) => {
  try {
    const taxRatesResponse = await fetch(`${BASE_URL}/tax-rates/${world}`);
    const taxRatesData = await taxRatesResponse.json();
    return taxRatesData;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const startGetCurrentMarketData = async (world: string, ids: any[]) => {
  try {
    let idsCommaSeparated = ids.join(",");
    if (ids.length < 2) idsCommaSeparated = ids[0].toString();
    const currentResponse = await fetch(
      `${BASE_URL}/market-current/start/${world}/${idsCommaSeparated}`
    );
    const currentResponseData = await currentResponse.text();
    return currentResponseData;
  } catch (e) {
    console.error(e);
  }
};

export const startGetHistoricalMarketData = async (
  world: string,
  ids: any[]
) => {
  try {
    let idsCommaSeparated = ids.join(",");
    if (ids.length < 2) idsCommaSeparated = ids[0].toString();
    const historicalResponse = await fetch(
      `${BASE_URL}/market-historical/start/${world}/${idsCommaSeparated}`
    );
    const historicalResponseData = await historicalResponse.text();
    return historicalResponseData;
  } catch (e) {
    console.error(e);
  }
};

export const checkCurrentMarketDataJob = async (jobUuid: string) => {
  try {
    const response = await fetch(
      `${BASE_URL}/market-current/status/${jobUuid}`
    );
    const responseData = await response.json();
    return responseData;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const checkHistoricalMarketDataJob = async (jobUuid: string) => {
  try {
    const response = await fetch(
      `${BASE_URL}/market-historical/status/${jobUuid}`
    );
    const responseData = await response.json();
    return responseData;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getCurrentMarketData = async (jobUuid: string) => {
  try {
    const response = await fetch(
      `${BASE_URL}/market-current/result/${jobUuid}`
    );
    const responseData = await response.json();
    return responseData;
  } catch (e) {
    console.error(e);
    return {};
  }
};

export const getHistoricalMarketData = async (jobUuid: string) => {
  try {
    const response = await fetch(
      `${BASE_URL}/market-historical/result/${jobUuid}`
    );

    const responseData = await response.json();
    return responseData;
  } catch (e) {
    console.error(e);
    return {};
  }
};
