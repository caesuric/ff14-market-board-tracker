import { animated, useTransition } from '@react-spring/web';
import React from 'react';
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import About from 'views/About';
import Home from 'views/Home';

export default function App() {
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
                <Content />
            </div>
        </BrowserRouter>
    )
}

function Content() {
    const location = useLocation();
    const transitions = useTransition(location, {
        from: { opacity: 0, transform: 'translate3d(100vw, 0, 0)' },
        enter: { opacity: 1, transform: 'translate3d(0, 0, 0)' },
        leave: { opacity: 0, transform: 'translate3d(-20vw, 0, 0)' }
    })

    return (
        <div>
            {transitions((props, item) => (
                <animated.div style={props}>
                    <div className="page">
                        <Routes location={item}>
                            <Route path="/" element={<Home />} />
                            <Route path="/about" element={<About />} />
                        </Routes>
                    </div>
                </animated.div>
            ))}
        </div>
    )
}
