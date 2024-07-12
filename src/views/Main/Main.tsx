import React, { FC } from "react";
import { NavLink, Outlet } from "react-router-dom";
import styles from "./Main.module.scss";

interface MainProps {}

const Main: FC<MainProps> = () => {
  return (
    <div className={styles.Main}>
      <div className={styles.topBar}>
        <img className={styles.logo} src="/logo192.png" alt="Site logo." />
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? styles.activeLink : styles.inactiveLink
          }
        >
          <div className={styles.topButton}>Item Tracker</div>
        </NavLink>
        <NavLink
          to="/track-by-job"
          className={({ isActive }) =>
            isActive ? styles.activeLink : styles.inactiveLink
          }
        >
          <div className={styles.topButton}>Track By Job</div>
        </NavLink>
      </div>
      <div className={styles.mainPanel}>
        <Outlet />
      </div>
    </div>
  );
};

export { Main };
