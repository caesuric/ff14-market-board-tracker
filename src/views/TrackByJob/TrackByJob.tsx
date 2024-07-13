import React, { FC, useCallback, useEffect, useState } from "react";
import * as uuid from "uuid";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
  Checkbox,
  debounce,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Slider,
} from "@mui/material";
import { ItemInputLineData } from "item-input-line-data";
import { columns } from "common-data/columns";
import styles from "./TrackByJob.module.scss";

interface TrackByJobProps {}

const TrackByJob: FC<TrackByJobProps> = () => {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [initialApiLoad, setInitialApiLoad] = useState<boolean>(false);
  const [itemsToTrack, setItemsToTrack] = useState<ItemInputLineData[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [lowestTaxRate, setLowestTaxRate] = useState<number | undefined>(
    undefined
  );
  const [worlds, setWorlds] = useState<string[]>([]);
  const [world, setWorld] = useState<string>("");
  const [lowestTaxRateCities, setLowestTaxRateCities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [miningSelected, setMiningSelected] = useState<boolean>(false);
  const [botanySelected, setBotanySelected] = useState<boolean>(false);
  const [fishingSelected, setFishingSelected] = useState<boolean>(false);
  const [craftingSelections, setCraftingSelections] = useState<{
    [name: string]: boolean;
  }>({});
  const [craftingTypes, setCraftingTypes] = useState<string[]>([]);
  const [levelSliderMin, setLevelSliderMin] = useState<number>(90);
  const [levelSliderMax, setLevelSliderMax] = useState<number>(100);
  const pullWorldData = async () => {
    try {
      const worldDataResponse = await fetch(
        "https://universalis.app/api/v2/worlds"
      );
      const worldData = await worldDataResponse.json();
      setWorlds(worldData.map((world: any) => world.name).sort());
      const loadedWorld = localStorage.getItem("world");
      if (!!loadedWorld) setWorld(loadedWorld);
    } catch (e) {
      console.error(e);
    }
  };
  const pullCraftingTypes = async () => {
    try {
      const craftingTypesResponse = await fetch(
        "https://xivmarketstats.com:1414/rest/crafting-types/"
      );
      const craftingTypesData = await craftingTypesResponse.json();
      setCraftingTypes(craftingTypesData);
    } catch (e) {
      console.error(e);
    }
  };
  const resetLoadedState = () => {
    for (const item of itemsToTrack) item.loaded2 = false;
  };
  const median = (values: number[]) => {
    if (values.length === 0) throw new Error("No inputs");
    values.sort(function (a, b) {
      return a - b;
    });
    let half = Math.floor(values.length / 2);
    if (values.length % 2) return values[half];
    return (values[half - 1] + values[half]) / 2.0;
  };
  const calculatePostTaxSaleValue = useCallback(
    (price: number) => {
      if (!lowestTaxRate) return price;
      return Math.floor(price * (1 - lowestTaxRate / 100));
    },
    [lowestTaxRate]
  );
  const pullData = useCallback(
    async (items: ItemInputLineData[]) => {
      if (world === "") return;
      setIsLoading(true);
      const finishedResults = [];
      const taxRatesResponse = await fetch(
        `https://universalis.app/api/v2/tax-rates?world=${world}`
      );
      const taxRatesData = await taxRatesResponse.json();
      let taxRatesLowestCities = [];
      let taxRatesLowestNumber = 100;
      for (const city in taxRatesData) {
        if (taxRatesData[city] < taxRatesLowestNumber) {
          taxRatesLowestCities = [];
          taxRatesLowestCities.push(city);
          taxRatesLowestNumber = taxRatesData[city];
        } else if (taxRatesData[city] === taxRatesLowestNumber)
          taxRatesLowestCities.push(city);
      }
      setLowestTaxRate(taxRatesLowestNumber);
      setLowestTaxRateCities(taxRatesLowestCities);
      const ids = items
        .filter((item) => !item.loaded2)
        .map((item) => item.ffxivId);
      if (ids.length === 0) {
        setIsLoading(false);
        setResults([]);
        return;
      }
      const idsCommaSeparated = ids.join(",");
      const currentResponse = await fetch(
        `https://universalis.app/api/v2/${world}/${idsCommaSeparated}`
      );
      const currentResponseData = await currentResponse.json();
      const historicalResponse = await fetch(
        `https://universalis.app/api/v2/history/${world}/${idsCommaSeparated}?entriesWithin=2592000`
      );
      const historicalResponseData = await historicalResponse.json();
      for (let item of items) {
        try {
          const trackingItem = itemsToTrack.find(
            (i) => i.result?.ID === item.ffxivId
          );
          if (!!trackingItem && trackingItem.loaded2) {
            finishedResults.push(item);
            continue;
          }
          const xivApiResponse = await fetch(
            `https://beta.xivapi.com/api/1/sheet/Item/${item.ffxivId}?Fields=Name,Icon.path`
          );
          if (xivApiResponse.status === 404) continue;
          const xivApiData = await xivApiResponse.json();
          item.text = xivApiData.fields.Name;
          item.icon =
            xivApiData.fields.Icon.path
              .replace("ui/icon/", "i/")
              .replace(".tex", "") + ".png";
          setItemsToTrack([...itemsToTrack]);
          const historicalData =
            historicalResponseData?.items?.[item.ffxivId ?? 0] ??
            historicalResponseData;
          const currentData =
            currentResponseData?.items?.[item.ffxivId ?? 0] ??
            currentResponseData;
          if (historicalData?.entries === undefined) continue;
          if (historicalData.entries.length === 0) continue;
          if (!!trackingItem) trackingItem.loaded2 = true;
          const lastMonthEntries = historicalData.entries;
          let averagePricePerUnit = 0;
          let numItemsSold = 0;
          const stackSizes = [];
          const prices = [];
          for (let entry of lastMonthEntries) {
            averagePricePerUnit += entry.pricePerUnit * entry.quantity;
            numItemsSold += entry.quantity;
            stackSizes.push(entry.quantity);
            prices.push(entry.pricePerUnit);
          }
          averagePricePerUnit /= numItemsSold;
          item.nqSaleVelocity = Math.floor(historicalData.nqSaleVelocity);
          item.dailySaleVelocity = Math.floor(item.nqSaleVelocity / 7);
          item.averagePrice = Math.floor(averagePricePerUnit);
          item.medianPrice = median(prices);
          item.medianStackSize = median(stackSizes);
          item.currentSaleValue = calculatePostTaxSaleValue(
            currentData.minPriceNQ - 1
          );
          item.todaysProfitPotential =
            item.dailySaleVelocity * item.currentSaleValue;
          let marketValue = 0;
          for (let entry of lastMonthEntries)
            marketValue += entry.pricePerUnit * entry.quantity;
          item.monthlyMarketValue = marketValue;
          item.possibleMoneyPerDay = Math.floor(marketValue / 30);
          item.numberToGatherPerDay = Math.floor(
            item.possibleMoneyPerDay / item.medianPrice
          );
          finishedResults.push(item);
        } catch (e) {
          console.error(e);
        }
      }
      setResults([...finishedResults]);
      setIsLoading(false);
    },
    [calculatePostTaxSaleValue, itemsToTrack, world]
  );
  const saveData = useCallback(() => {
    const data = {
      miningSelected,
      botanySelected,
      fishingSelected,
      craftingSelections,
      levelSliderMin,
      levelSliderMax,
    };
    const jsonData = JSON.stringify(data);
    localStorage.setItem("trackByJob", jsonData);
    localStorage.setItem("world", world);
  }, [
    miningSelected,
    botanySelected,
    fishingSelected,
    craftingSelections,
    levelSliderMin,
    levelSliderMax,
    world,
  ]);
  const removeItemToTrack = useCallback(
    (item: string) => {
      itemsToTrack.splice(
        itemsToTrack.findIndex((i) => i.id === item),
        1
      );
      setItemsToTrack([...itemsToTrack]);
      const tempResults = [...results];
      tempResults.splice(
        tempResults.findIndex((i) => i.id === item),
        1
      );
      setResults([...tempResults]);
    },
    [itemsToTrack, results]
  );
  const pullItemsToTrack = useCallback(async () => {
    const items = [];
    if (miningSelected) {
      const miningItems = await fetch(
        `https://xivmarketstats.com:1414/rest/mining-items/${levelSliderMin}-${levelSliderMax}`
      );
      const miningItemsData = await miningItems.json();
      for (const item of miningItemsData) items.push(item);
    }
    if (botanySelected) {
      const botanyItems = await fetch(
        `https://xivmarketstats.com:1414/rest/botany-items/${levelSliderMin}-${levelSliderMax}`
      );
      const botanyItemsData = await botanyItems.json();
      for (const item of botanyItemsData) items.push(item);
    }
    if (fishingSelected) {
      const fishingItems = await fetch(
        `https://xivmarketstats.com:1414/rest/fishing-items/${levelSliderMin}-${levelSliderMax}`
      );
      const fishingItemsData = await fishingItems.json();
      for (const item of fishingItemsData) items.push(item);
    }
    for (const craftingType in craftingSelections) {
      if (!craftingSelections[craftingType]) continue;
      const craftingItems = await fetch(
        `https://xivmarketstats.com:1414/rest/crafting-items/${craftingType}/${levelSliderMin}-${levelSliderMax}`
      );
      const craftingItemsData = await craftingItems.json();
      for (const item of craftingItemsData) items.push(item);
    }
    const purgeList = [];
    for (const itemToTrack of itemsToTrack) {
      if (items.find((i) => i === itemToTrack.result?.ID)) continue;
      purgeList.push(itemToTrack.id);
    }
    for (const itemToPurge of purgeList) removeItemToTrack(itemToPurge);
    for (const item of items) {
      if (itemsToTrack.find((i) => i.result?.ID === item)) continue;
      itemsToTrack.push({
        text: "",
        id: uuid.v4(),
        ffxivId: item,
        loaded: false,
        loaded2: false,
      });
    }
    setItemsToTrack([...itemsToTrack]);
  }, [
    miningSelected,
    botanySelected,
    fishingSelected,
    craftingSelections,
    levelSliderMin,
    levelSliderMax,
    removeItemToTrack,
    itemsToTrack,
  ]);
  useEffect(() => {
    if (!loaded) {
      const savedData = localStorage.getItem("trackByJob");
      if (!!savedData) {
        const data = JSON.parse(savedData);
        setMiningSelected(data.miningSelected);
        setBotanySelected(data.botanySelected);
        setFishingSelected(data.fishingSelected);
        setCraftingSelections(data.craftingSelections);
        setLevelSliderMin(data.levelSliderMin);
        setLevelSliderMax(data.levelSliderMax);
      }
      setLoaded(true);
      pullWorldData();
      pullCraftingTypes();
    }
  }, [loaded, pullItemsToTrack, itemsToTrack, pullData]);
  useEffect(() => {
    if (!initialApiLoad && world !== "" && loaded) {
      setInitialApiLoad(true);
      pullItemsToTrack().then(() => {
        pullData(itemsToTrack);
      });
    }
  }, [
    initialApiLoad,
    world,
    setInitialApiLoad,
    itemsToTrack,
    pullData,
    pullItemsToTrack,
    loaded,
  ]);
  useEffect(() => {
    if (world !== "" && world !== localStorage.getItem("world")) {
      saveData();
      pullItemsToTrack().then(() => {
        pullData(itemsToTrack);
      });
    }
  }, [world, pullData, pullItemsToTrack, saveData, itemsToTrack]);
  useEffect(() => {
    if (loaded && initialApiLoad && world !== "" && !isLoading) {
      debounce(() => {
        saveData();
        pullItemsToTrack().then(() => {
          pullData(itemsToTrack);
        });
      }, 400);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    miningSelected,
    botanySelected,
    fishingSelected,
    craftingSelections,
    levelSliderMin,
    levelSliderMax,
  ]);

  return (
    <div className={styles.TrackByJob}>
      <div className={styles.mainPanel}>
        <div className={styles.leftSelector}>
          <div>
            <FormControl fullWidth>
              <InputLabel>Select World</InputLabel>
              <Select
                value={world}
                onChange={(e) => {
                  setWorld(e.target.value);
                  resetLoadedState();
                }}
                fullWidth
              >
                <MenuItem key="" value={""}>
                  None
                </MenuItem>
                {worlds.map((world) => (
                  <MenuItem key={world} value={world}>
                    {world}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <div className={styles.itemsToTrack}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={miningSelected}
                  onChange={(e, newValue) => setMiningSelected(newValue)}
                />
              }
              label="Mining"
            />
            <FormControlLabel
              control={
                <Checkbox
                  value={botanySelected}
                  checked={botanySelected}
                  onChange={(e, newValue) => setBotanySelected(newValue)}
                />
              }
              label="Botany"
            />
            <FormControlLabel
              control={
                <Checkbox
                  value={fishingSelected}
                  checked={fishingSelected}
                  onChange={(e, newValue) => setFishingSelected(newValue)}
                />
              }
              label="Fishing"
            />
            {craftingTypes.map((entry) => (
              <FormControlLabel
                control={
                  <Checkbox
                    value={craftingSelections[entry] ?? false}
                    checked={craftingSelections[entry] ?? false}
                    onChange={(e, newValue) => {
                      craftingSelections[entry] = newValue;
                      setCraftingSelections({ ...craftingSelections });
                    }}
                  />
                }
                label={entry}
                key={entry}
              />
            ))}
            <FormControlLabel
              control={
                <Slider
                  value={[levelSliderMin, levelSliderMax]}
                  onChange={(e, newValue) => {
                    if (typeof newValue === "number") return;
                    setLevelSliderMin(newValue[0]);
                    setLevelSliderMax(newValue[1]);
                  }}
                  valueLabelDisplay="auto"
                  min={1}
                  max={100}
                  marks={[
                    { value: 1, label: "1" },
                    { value: 10, label: "10" },
                    { value: 20, label: "20" },
                    { value: 30, label: "30" },
                    { value: 40, label: "40" },
                    { value: 50, label: "50" },
                    { value: 60, label: "60" },
                    { value: 70, label: "70" },
                    { value: 80, label: "80" },
                    { value: 90, label: "90" },
                    { value: 100, label: "100" },
                  ]}
                />
              }
              label="Level Range"
              labelPlacement="top"
            />
          </div>
          {!!lowestTaxRate && (
            <div className={styles.taxBox}>
              <div>Lowest Tax Rate: {lowestTaxRate}%</div>
              <div>
                Cities with lowest tax rate:{" "}
                <ul>
                  {lowestTaxRateCities.map((city) => (
                    <li key={city}>{city}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
        <div className={styles.grid}>
          <DataGrid
            loading={isLoading}
            rows={results}
            columns={columns}
            pageSize={100}
            components={{ Toolbar: GridToolbar }}
          />
        </div>
      </div>
    </div>
  );
};

export { TrackByJob };
