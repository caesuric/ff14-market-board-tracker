import React, { FC } from "react";
import { Outlet } from "react-router-dom";
import styles from "./Main.module.scss";

interface MainProps {}

const Main: FC<MainProps> = () => {
  return (
    <div className={styles.Main}>
      <div className={styles.topBar}>
        <img className={styles.logo} src="/logo192.png" alt="Site logo." />
        <div className={styles.topButton}>XIV Market Stats</div>
      </div>
      <div className={styles.mainPanel}>
        <Outlet />
      </div>
    </div>
  );
};

export { Main };
