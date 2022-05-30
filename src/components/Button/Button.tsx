import React from 'react';
import styles from './Button.module.scss';

export default class Button extends React.Component {
    render() {
        return (
            <button className={styles['my-button']}>ABC</button>
        );
    }
}
