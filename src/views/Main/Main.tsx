import React, { FC, useCallback, useEffect, useState } from "react";
import * as uuid from "uuid";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
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
import styles from "./Main.module.scss";

interface MainProps {}

const Main: FC<MainProps> = () => {
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
  const pullWorldData = async () => {
    try {
      const worldDataResponse = await fetch("/uapi/worlds");
      console.log(worldDataResponse);
      const worldData = await worldDataResponse.json();
      setWorlds(worldData.map((world: any) => world.name).sort());
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
    resetLoadedState();
    pullData(itemsToTrack);
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
      const finishedResults = [];
      const taxRatesResponse = await fetch(`/uapi/tax-rates?world=${world}`);
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
      for (let item of items) {
        try {
          const trackingItem = itemsToTrack.find(
            (i) => i.result?.ID === item.result?.ID
          );
          if (!!trackingItem && trackingItem.loaded2) continue;
          const historicalResponse = await fetch(
            `/uapi/history/${world}/${item.result?.ID}?entriesWithin=2592000`
          );
          const currentResponse = await fetch(
            `/uapi/${world}/${item.result?.ID}`
          );
          setItemsToTrack([...itemsToTrack]);
          const historicalData = await historicalResponse.json();
          const currentData = await currentResponse.json();
          if (
            historicalData.entries.length === 0 &&
            currentData.entries.length === 0
          )
            continue;
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
          setResults([...finishedResults]);
        } catch (e) {
          console.error(e);
        }
      }
      setResults([...finishedResults]);
    },
    [calculatePostTaxSaleValue, itemsToTrack, world]
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

  const columns: GridColDef[] = [
    {
      field: "text",
      headerName: "Name",
      flex: 1,
      renderCell: (params) => {
        return (
          <div className={styles.nameCell}>
            <img src={`/xivapi/${params.row.result?.Icon}`} alt="Icon" />
            <div>{params.row.text}</div>
          </div>
        );
      },
    },
    {
      field: "currentSaleValue",
      headerName: "Current Profit Per Item",
      flex: 1,
      valueFormatter: (params) => {
        return params.value.toLocaleString() + " gil";
      },
    },
    {
      field: "medianPrice",
      headerName: "Median Price",
      flex: 1,
      valueFormatter: (params) => {
        return params.value.toLocaleString() + " gil";
      },
    },
    {
      field: "medianStackSize",
      headerName: "Median Stack Size (Historical)",
      flex: 1,
    },
    {
      field: "dailySaleVelocity",
      headerName: "Sales Per Day",
      flex: 1,
    },
    {
      field: "todaysProfitPotential",
      headerName: "Potential Profit Today",
      flex: 1,
      valueFormatter: (params) => {
        return params.value.toLocaleString() + " gil";
      },
    },
    {
      field: "possibleMoneyPerDay",
      headerName: "Daily Profit at Median Price",
      flex: 1,
      valueFormatter: (params) => {
        return params.value.toLocaleString() + " gil";
      },
    },
  ];

  return (
    <div className={styles.Main}>
      <div className={styles.topBar}>
        <img className={styles.logo} src="/logo192.png" alt="Site logo." />
        <div className={styles.topButton}>XIV Market Stats</div>
      </div>
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
                  resetLoadedState();
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

export default Main;
