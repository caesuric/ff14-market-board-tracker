import React, { FC, useCallback, useEffect, useState } from "react";
import * as uuid from "uuid";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
  Checkbox,
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
import {
  checkCurrentMarketDataJob,
  checkHistoricalMarketDataJob,
  getCurrentMarketData,
  getHistoricalMarketData,
  getTaxRates,
  getWorlds,
  startGetCurrentMarketData,
  startGetHistoricalMarketData,
} from "network-calls";
import { formatDistance } from "date-fns";
import { CustomLoadingOverlay } from "components/CustomLoadingOverlay/CustomLoadingOverlay";
import { clamp } from "calculations";
import { BASE_URL } from "common-data/constants";

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
  const [currentResponseData, setCurrentResponseData] = useState<
    any | undefined
  >(undefined);
  const [historicalResponseData, setHistoricalResponseData] = useState<
    any | undefined
  >(undefined);
  const [loadingPercentage, setLoadingPercentage] = useState<number>(0);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const pullWorldData = async () => {
    try {
      const worldData = await getWorlds();
      setWorlds(worldData.sort());
      const loadedWorld = localStorage.getItem("world");
      if (!!loadedWorld) setWorld(loadedWorld);
    } catch (e) {
      console.error(e);
    }
  };
  const pullCraftingTypes = async () => {
    try {
      const craftingTypesResponse = await fetch(`${BASE_URL}/crafting-types`);
      const craftingTypesData = await craftingTypesResponse.json();
      setCraftingTypes(craftingTypesData);
    } catch (e) {
      console.error(e);
    }
  };
  const resetLoadedState = () => {
    for (const item of itemsToTrack) item.loaded2 = false;
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
      const taxRatesData = await getTaxRates(world);
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
      const currentDataJobUuid = await startGetCurrentMarketData(world, ids);
      const historicalDataJobUuid = await startGetHistoricalMarketData(
        world,
        ids
      );
      if (!currentDataJobUuid || !historicalDataJobUuid) return;
      const interval = setInterval(() => {
        Promise.allSettled([
          checkCurrentMarketDataJob(currentDataJobUuid),
          checkHistoricalMarketDataJob(historicalDataJobUuid),
        ]).then(([currentJobStatusResult, historicalJobStatusResult]) => {
          if (
            currentJobStatusResult.status === "rejected" ||
            historicalJobStatusResult.status === "rejected"
          )
            return;
          const currentJobStatus = currentJobStatusResult.value;
          const historicalJobStatus = historicalJobStatusResult.value;
          if (!currentJobStatus || !historicalJobStatus)
            clearInterval(interval);
          if (currentJobStatus.complete && historicalJobStatus.complete) {
            clearInterval(interval);
            setLoadingPercentage(99.9);
            setLoadingMessage("Almost done...");
            Promise.allSettled([
              getCurrentMarketData(currentDataJobUuid),
              getHistoricalMarketData(historicalDataJobUuid),
            ]).then(([currentDataResult, historicalDataResult]) => {
              if (
                currentDataResult.status === "rejected" ||
                historicalDataResult.status === "rejected"
              )
                return;
              const currentData = currentDataResult.value;
              const historicalData = historicalDataResult.value;
              setCurrentResponseData(currentData);
              setHistoricalResponseData(historicalData);
            });
          } else {
            const timeInSeconds = new Date().getTime() / 1000;
            const timeElapsedCurrent =
              timeInSeconds - currentJobStatus.last_update;
            const timeElapsedHistorical =
              timeInSeconds - historicalJobStatus.last_update;
            const currentJobPercentage = Math.min(
              (currentJobStatus.operation_time_so_far + timeElapsedCurrent) /
                currentJobStatus.estimated_operation_time,
              1
            );
            const historicalJobPercentage = Math.min(
              (historicalJobStatus.operation_time_so_far +
                timeElapsedHistorical) /
                historicalJobStatus.estimated_operation_time,
              1
            );
            const finalPercentage =
              Math.min(currentJobPercentage, historicalJobPercentage) * 100;
            const highestDurationInSeconds = Math.max(
              currentJobStatus.estimated_operation_time -
                currentJobStatus.operation_time_so_far -
                timeElapsedCurrent,
              historicalJobStatus.estimated_operation_time -
                historicalJobStatus.operation_time_so_far -
                timeElapsedHistorical
            );
            const duration = formatDistance(
              0,
              Math.max(Math.floor(highestDurationInSeconds), 0) * 1000,
              { includeSeconds: true }
            );
            setLoadingPercentage(clamp(finalPercentage, 0, 99));
            setLoadingMessage(`Estimated Time Remaining: ${duration}`);
          }
        });
      }, 1000);
      return () => clearInterval(interval);
    },
    [world]
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
        `${BASE_URL}/items-by-job/Mining/${levelSliderMin}-${levelSliderMax}`
      );
      const miningItemsData = await miningItems.json();
      for (const item of miningItemsData) items.push(item);
    }
    if (botanySelected) {
      const botanyItems = await fetch(
        `${BASE_URL}/items-by-job/Botany/${levelSliderMin}-${levelSliderMax}`
      );
      const botanyItemsData = await botanyItems.json();
      for (const item of botanyItemsData) items.push(item);
    }
    if (fishingSelected) {
      const fishingItems = await fetch(
        `${BASE_URL}/items-by-job/Fishing/${levelSliderMin}-${levelSliderMax}`
      );
      const fishingItemsData = await fishingItems.json();
      for (const item of fishingItemsData) items.push(item);
    }
    for (const craftingType in craftingSelections) {
      if (!craftingSelections[craftingType]) continue;
      const craftingItems = await fetch(
        `${BASE_URL}/items-by-job/${craftingType}/${levelSliderMin}-${levelSliderMax}`
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
        text: item.name,
        id: uuid.v4(),
        ffxivId: item.id,
        icon: `${item.icon_path}.png`,
        loaded: false,
        loaded2: false,
        result: {
          ID: item.id,
          _Score: 0,
          Name: item.name,
          _: "",
          Url: "",
          UrlType: "",
          Icon: `${item.icon_path}.png`,
        },
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
      saveData();
      pullItemsToTrack().then(() => {
        pullData(itemsToTrack);
      });
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
  useEffect(() => {
    if (!historicalResponseData || !currentResponseData) return;
    const finishedResults = [];
    for (let item of itemsToTrack) {
      try {
        const trackingItem = itemsToTrack.find(
          (i) => i.result?.ID === item.result?.ID
        );
        if (!!trackingItem && trackingItem.loaded2) {
          finishedResults.push(item);
          continue;
        }
        setItemsToTrack([...itemsToTrack]);
        const historicalData = historicalResponseData?.[item.result?.ID ?? 0];
        const currentData = currentResponseData?.[item.result?.ID ?? 0];
        if (!!trackingItem) trackingItem.loaded2 = true;
        if (!!historicalData) {
          item.dailySaleVelocity = historicalData.nq_daily_sale_velocity;
          item.averagePrice = historicalData.average_price_per_unit;
          item.medianPrice = historicalData.median_price;
          item.medianStackSize = historicalData.median_stack_size;
          item.possibleMoneyPerDay = Math.floor(
            historicalData.median_price * historicalData.nq_daily_sale_velocity
          );
        }
        if (!!currentData) {
          item.currentSaleValue = calculatePostTaxSaleValue(
            currentData.current_min_price_nq - 1
          );
          if (!!historicalData) {
            item.todaysProfitPotential =
              historicalData.nq_daily_sale_velocity * item.currentSaleValue;
          }
        }
        finishedResults.push(item);
      } catch (e) {
        console.error(e);
      }
    }
    setResults([...finishedResults]);
    setIsLoading(false);
  }, [
    historicalResponseData,
    currentResponseData,
    itemsToTrack,
    calculatePostTaxSaleValue,
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
          {lowestTaxRate !== undefined && (
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
            slots={{
              loadingOverlay: CustomLoadingOverlay({
                loadingPercentage,
                loadingMessage,
              }),
              toolbar: GridToolbar,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export { TrackByJob };
