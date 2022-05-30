import React from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import About from './views/About/About';
import Home from './views/Home/Home';

export default class App extends React.Component {
    render() {
        return (
            <BrowserRouter>
                <div className="App">
                    <nav>
                        <ul>
                            <li>
                                <Link to="/">Home</Link>
                            </li>
                            <li>
                                <Link to="/about">About</Link>
                            </li>
                        </ul>
                    </nav>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/about" element={<About />} />
                    </Routes>
                </div>
            </BrowserRouter>
        );
    }
}
