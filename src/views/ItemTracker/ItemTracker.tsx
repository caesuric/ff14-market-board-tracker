import React, { FC, useCallback, useEffect, useState } from "react";
import * as uuid from "uuid";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { ItemInputLine } from "components/ItemInputLine/ItemInputLine";
import { ItemInputLineData } from "item-input-line-data";
import { columns } from "common-data/columns";
import styles from "./ItemTracker.module.scss";
import {
  checkCurrentMarketDataJob,
  getCurrentMarketData,
  getHistoricalMarketData,
  getTaxRates,
  getWorlds,
  startGetCurrentMarketData,
  startGetHistoricalMarketData,
} from "network-calls";
import { formatDuration } from "date-fns";
import { CustomLoadingOverlay } from "components/CustomLoadingOverlay/CustomLoadingOverlay";

interface ItemTrackerProps {}

const ItemTracker: FC<ItemTrackerProps> = () => {
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
  const removeItemToTrack = (item: string) => {
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
    saveData();
  };
  const resetLoadedState = () => {
    for (const item of itemsToTrack) item.loaded2 = false;
  };
  const addItemToTrack = () => {
    const itemUuid = uuid.v4();
    itemsToTrack.push({
      text: "",
      id: itemUuid,
      loaded: false,
      loaded2: false,
    });
    setItemsToTrack([...itemsToTrack]);
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
        .map((item) => item.result?.ID);
      if (ids.length === 0) {
        setIsLoading(false);
        return;
      }
      const currentDataJobUuid = await startGetCurrentMarketData(world, ids);
      const historicalDataJobUuid = await startGetHistoricalMarketData(
        world,
        ids
      );
      const checkStatus = setInterval(async () => {
        const currentJobStatus = await checkCurrentMarketDataJob(
          currentDataJobUuid
        );
        const historicalJobStatus = await checkCurrentMarketDataJob(
          historicalDataJobUuid
        );
        if (currentJobStatus.complete && historicalJobStatus.complete) {
          clearInterval(checkStatus);
          setLoadingPercentage(99.9);
          setLoadingMessage("Almost done...");
          const currentData = await getCurrentMarketData(currentDataJobUuid);
          const historicalData = await getHistoricalMarketData(
            historicalDataJobUuid
          );
          setCurrentResponseData(currentData);
          setHistoricalResponseData(historicalData);
        } else {
          const currentJobPercentage = Math.min(
            currentJobStatus.operation_time_so_far /
              currentJobStatus.estimated_operation_time,
            1
          );
          const historicalJobPercentage = Math.min(
            historicalJobStatus.operation_time_so_far /
              historicalJobStatus.estimated_operation_time,
            1
          );
          const finalPercentage =
            Math.min(currentJobPercentage, historicalJobPercentage) * 100;
          const highestDurationInSeconds = Math.max(
            currentJobStatus.estimated_operation_time -
              currentJobStatus.operation_time_so_far,
            historicalJobStatus.estimated_operation_time -
              historicalJobStatus.operation_time_so_far
          );
          const duration = formatDuration({
            seconds: highestDurationInSeconds,
          });
          setLoadingPercentage(finalPercentage);
          setLoadingMessage(`Time Remaining: ${duration}`);
        }
      }, 1000);
    },
    [world]
  );
  const saveData = useCallback(() => {
    const data = [];
    for (let item of itemsToTrack) {
      data.push({
        ...item,
        loaded2: false,
      });
    }
    const jsonData = JSON.stringify(data);
    localStorage.setItem("itemsToTrack", jsonData);
    localStorage.setItem("world", world);
  }, [itemsToTrack, world]);
  useEffect(() => {
    if (!loaded) {
      const items = localStorage.getItem("itemsToTrack");
      pullWorldData();
      if (!!items) setItemsToTrack(JSON.parse(items));
      setLoaded(true);
    }
  }, [loaded]);
  useEffect(() => {
    if (world !== "" && world !== localStorage.getItem("world")) {
      pullData(itemsToTrack);
      saveData();
    }
  }, [world, pullData, saveData, itemsToTrack]);
  useEffect(() => {
    if (!initialApiLoad && itemsToTrack.length > 0 && world !== "") {
      pullData(itemsToTrack);
      setInitialApiLoad(true);
    }
  }, [initialApiLoad, itemsToTrack, pullData, world]);
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
        if (
          historicalData.entries.length === 0 &&
          currentData.entries.length === 0
        )
          continue;
        if (!!trackingItem) trackingItem.loaded2 = true;
        item.dailySaleVelocity = historicalData.nq_daily_sale_velocity;
        item.averagePrice = historicalData.average_price_per_unit;
        item.medianPrice = historicalData.median_price;
        item.medianStackSize = historicalData.median_stack_size;
        if (!!currentData) {
          item.currentSaleValue = calculatePostTaxSaleValue(
            currentData.current_min_price_nq - 1
          );
          item.todaysProfitPotential =
            historicalData.nq_daily_sale_velocity * item.currentSaleValue;
        }
        item.possibleMoneyPerDay = Math.floor(
          (historicalData.median_price * historicalData.num_items_sold) / 30
        );
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
    <div className={styles.ItemTracker}>
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
            {itemsToTrack.map((entry) => (
              <ItemInputLine
                key={entry.id}
                item={entry}
                onClick={() => removeItemToTrack(entry.id)}
                itemSelectedCallback={() => {
                  entry.loaded2 = false;
                  pullData(itemsToTrack);
                  saveData();
                }}
              />
            ))}
          </div>
          <Button onClick={addItemToTrack} className={styles.plusButton}>
            <FontAwesomeIcon icon={faPlus} />
          </Button>
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

export { ItemTracker };
