import React, { FC, SyntheticEvent, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import styles from "./Main.module.scss";
import { Tab, Tabs } from "@mui/material";

interface MainProps {}

const Main: FC<MainProps> = () => {
  const [value, setValue] = useState("itemTracker");
  const navigate = useNavigate();
  const location = useLocation();
  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setValue(newValue);
    if (newValue === "trackByJob") navigate("/track-by-job");
    else navigate("/");
  };
  useEffect(() => {
    if (location.pathname === "/track-by-job") setValue("trackByJob");
    else setValue("itemTracker");
  }, [location.pathname]);

  return (
    <div className={styles.Main}>
      <div className={styles.topBar}>
        <img className={styles.logo} src="/logo192.png" alt="Site logo." />
        <Tabs value={value} onChange={handleChange}>
          <Tab label="Item Tracker" value="itemTracker" />
          <Tab label="Track By Job" value="trackByJob" />
        </Tabs>
      </div>
      <div className={styles.mainPanel}>
        <Outlet />
      </div>
    </div>
  );
};

export { Main };
