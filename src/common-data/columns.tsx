import React from "react";
import { GridColDef } from "@mui/x-data-grid";
import styles from "./columns.module.scss";

export const columns: GridColDef[] = [
  {
    field: "text",
    headerName: "Name",
    flex: 2,
    renderCell: (params) => {
      return (
        <div className={styles.nameCell}>
          <img
            src={`https://xivapi.com/${
              params.row.result?.Icon ?? params.row.icon
            }`}
            alt="Icon"
          />
          <div>{params.row.text}</div>
        </div>
      );
    },
  },
  {
    field: "currentSaleValue",
    headerName: "Current Profit Per Item",
    flex: 1,
    valueFormatter: (value: number | undefined) => {
      if (value === undefined) return "API Issues.";
      return value.toLocaleString() + " gil";
    },
  },
  {
    field: "medianPrice",
    headerName: "Median Price",
    flex: 1,
    valueFormatter: (value: number | undefined) => {
      if (value === undefined) return "API Issues.";
      return value.toLocaleString() + " gil";
    },
  },
  {
    field: "medianStackSize",
    headerName: "Median Stack Size",
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
    valueFormatter: (value: number | undefined) => {
      if (value === undefined) return "API Issues.";
      return value.toLocaleString() + " gil";
    },
  },
  {
    field: "possibleMoneyPerDay",
    headerName: "Daily Profit at Median Price",
    flex: 1,
    valueFormatter: (value: number | undefined) => {
      if (value === undefined) return "API Issues.";
      return value.toLocaleString() + " gil";
    },
  },
];
