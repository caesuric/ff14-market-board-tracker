import React, { FC } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.scss';
import logo from 'assets/logo.svg';

interface SidebarProps {}

const Sidebar: FC<SidebarProps> = () => (
  <div className={styles.Sidebar}>
    <img src={logo} />
    <nav>
      <ul>
        <NavLink to="/" className={({isActive}) => (isActive ? styles.activeLink : '')}>
          <li>
            Home
          </li>
        </NavLink>
        <NavLink to="/about" className={({ isActive }) => (isActive ? styles.activeLink : '')}>
          <li>
            About
          </li>
        </NavLink>
      </ul>
    </nav>
  </div>
);

export default Sidebar;
