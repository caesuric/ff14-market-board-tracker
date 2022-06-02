import React from 'react';
import logo from 'assets/logo.svg';
import styles from './home.module.scss';
import Button from 'components/Button/Button';

export default function Home() {
    return (
        // <div>
            <header className={styles['App-header']}>
                <img src={logo} className={styles['App-logo']} alt="logo" />
                <p>
                    Edit <code>src/App.js</code> and save to reload.
                </p>
                <a
                    className={styles['App-link']}
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn React
                </a>
                <Button />
                <button className={styles['my-button']}>DEF</button>
            </header>
        // </div>
    );
}
