import React from 'react';
import logo from './logo.svg';
import './Home.scss';
import Button from '../../components/Button/Button';

export default class Home extends React.Component {
    render() {
        return (
            <div>
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <p>
                        Edit <code>src/App.js</code> and save to reload.
                    </p>
                    <a
                        className="App-link"
                        href="https://reactjs.org"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Learn React
                    </a>
                    <Button />
                    <button className="my-button">DEF</button>
                </header>
            </div>
        );
    }
}
