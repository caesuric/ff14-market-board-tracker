import React, { FC } from 'react';
import styles from './Sidebar.module.scss';

interface SidebarProps {}

const Sidebar: FC<SidebarProps> = () => (
  <div className={styles.Sidebar}>
    Sidebar Component
  </div>
);

export default Sidebar;
