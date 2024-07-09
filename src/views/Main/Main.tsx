import React, { FC, useState } from "react";
import * as uuid from "uuid";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { Button } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { ItemInputLine } from "components/ItemInputLine/ItemInputLine";
import { ItemInputLineData } from "item-input-line-data";
import styles from "./Main.module.scss";

interface MainProps {}

const Main: FC<MainProps> = () => {
  const [itemsToTrack, setItemsToTrack] = useState<ItemInputLineData[]>([]);
  const [results, setResults] = useState<any[]>([]);
  if (itemsToTrack.length === 0) {
    const items = localStorage.getItem("itemsToTrack");
    if (!!items) {
      setItemsToTrack(JSON.parse(items));
    }
  }
  const removeItemToTrack = (item: string) => {
    itemsToTrack.splice(
      itemsToTrack.findIndex((i) => i.id === item),
      1
    );
    setItemsToTrack([...itemsToTrack]);
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
  const extractResult = (results: any, exactMatch: string) => {
    for (let item of results)
      if (item.Name.toLowerCase() === exactMatch.toLowerCase()) return item.ID;
    return results[0].ID;
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
  const pullMarketData = async (tempResults: any[]) => {
    const finishedResults = [...results];
    for (let item of tempResults) {
      try {
        const trackingItem = itemsToTrack.find(
          (i) => i.id === item.internalUuid
        );
        if (!!trackingItem && trackingItem.loaded2) continue;
        const response = await fetch(
          `/uapi/history/ultros/${item.id}?entriesWithin=2592000`
        );
        setItemsToTrack([...itemsToTrack]);
        const data = await response.json();
        console.log(data);
        if (data.entries.length === 0) continue;
        if (!!trackingItem) trackingItem.loaded2 = true;
        const lastMonthEntries = data.entries;
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
        item.nqSaleVelocity = Math.floor(data.nqSaleVelocity);
        item.averagePrice = Math.floor(averagePricePerUnit);
        item.medianPrice = median(prices);
        item.medianStackSize = median(stackSizes);
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
  };
  const pullData = async () => {
    console.log("pulling");
    const tempResults: any[] = [];
    for (let element of itemsToTrack) {
      if (!element.loaded) {
        const response = await fetch(`/xivapi/search?string=${element.text}`);
        element.loaded = true;
        setItemsToTrack([...itemsToTrack]);
        const data = await response.json();
        console.log(data);
        if (data.Results.length > 0) {
          const result = extractResult(data.Results, element.text);
          element.ffxivId = result;
        }
      }
      if (!!element.ffxivId)
        tempResults.push({
          id: element.ffxivId,
          name: element.text,
          internalUuid: element.id,
        });
    }
    pullMarketData(tempResults);
  };
  const saveData = () => {
    const data = [];
    for (let item of itemsToTrack) {
      data.push({
        ...item,
        loaded2: false,
      });
    }
    const jsonData = JSON.stringify(data);
    localStorage.setItem("itemsToTrack", jsonData);
  };
  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
    },
    {
      field: "averagePrice",
      headerName: "Average Price",
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
      headerName: "Median Stack Size",
      flex: 1,
    },
    {
      field: "nqSaleVelocity",
      headerName: "Weekly Sale Velocity",
      flex: 1,
    },
    {
      field: "monthlyMarketValue",
      headerName: "Monthly Market Value",
      flex: 1,
      valueFormatter: (params) => {
        return params.value.toLocaleString() + " gil";
      },
    },
    {
      field: "possibleMoneyPerDay",
      headerName: "Possible Money Per Day",
      flex: 1,
      valueFormatter: (params) => {
        return params.value.toLocaleString() + " gil";
      },
    },
    {
      field: "numberToGatherPerDay",
      headerName: "Number To Gather Per Day",
      flex: 1,
      valueFormatter: (params) => {
        return params.value.toLocaleString();
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
          <div className={styles.itemsToTrack}>
            {itemsToTrack.map((entry) => (
              <ItemInputLine
                key={entry.id}
                item={entry}
                onClick={() => removeItemToTrack(entry.id)}
              />
            ))}
          </div>
          <Button onClick={addItemToTrack} className={styles.plusButton}>
            <FontAwesomeIcon icon={faPlus} />
          </Button>
          <div>
            <Button onClick={pullData}>Pull</Button>
            <Button onClick={saveData}>Save</Button>
          </div>
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
