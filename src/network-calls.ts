export const getWorlds = async () => {
  const worldDataResponse = await fetch(
    "https://xivmarketstats.com:1414/rest/worlds"
  );
  const worldData = await worldDataResponse.json();
  return worldData;
};

export const getTaxRates = async (world: string) => {
  const taxRatesResponse = await fetch(
    `https://xivmarketstats.com:1414/rest/tax-rates/${world}`
  );
  const taxRatesData = await taxRatesResponse.json();
  return taxRatesData;
};

export const startGetCurrentMarketData = async (world: string, ids: any[]) => {
  let idsCommaSeparated = ids.join(",");
  if (ids.length < 2) idsCommaSeparated = ids[0].toString();
  const currentResponse = await fetch(
    `https://xivmarketstats.com:1414/rest/market-current/start/${world}/${idsCommaSeparated}`
  );
  const currentResponseData = await currentResponse.text();
  return currentResponseData;
};

export const startGetHistoricalMarketData = async (
  world: string,
  ids: any[]
) => {
  let idsCommaSeparated = ids.join(",");
  if (ids.length < 2) idsCommaSeparated = ids[0].toString();
  const historicalResponse = await fetch(
    `https://xivmarketstats.com:1414/rest/market-current/start/${world}/${idsCommaSeparated}`
  );
  const historicalResponseData = await historicalResponse.text();
  return historicalResponseData;
};

export const checkCurrentMarketDataJob = async (jobUuid: string) => {
  const response = await fetch(
    `https://xivmarketstats.com:1414/rest/market-current/status/${jobUuid}`
  );
  const responseData = await response.json();
  return responseData;
};

export const checkHistoricalMarketDataJob = async (jobUuid: string) => {
  const response = await fetch(
    `https://xivmarketstats.com:1414/rest/market-historical/status/${jobUuid}`
  );
  const responseData = await response.json();
  return responseData;
};

export const getCurrentMarketData = async (jobUuid: string) => {
  const response = await fetch(
    `https://xivmarketstats.com:1414/rest/market-current/result/${jobUuid}`
  );
  try {
    const responseData = await response.json();
    return responseData;
  } catch (e) {
    console.error(e);
    return {};
  }
};

export const getHistoricalMarketData = async (jobUuid: string) => {
  const response = await fetch(
    `https://xivmarketstats.com:1414/rest/market-historical/result/${jobUuid}`
  );
  try {
    const responseData = await response.json();
    return responseData;
  } catch (e) {
    console.error(e);
    return {};
  }
};
