/**
 * @file
 */
import './index.scss';
import React from 'react';
import ReactDOM from 'react-dom';

import Header from 'views/src/pages/home/container/header';
import Content from 'views/src/pages/home/container/content';
import Footer from 'views/src/pages/home/container/footer';

// import React, {useRef, useEffect, useCallback, useState, useContext} from 'react';

function Home() {
    return (
        <div className="pandora-home">
            <Header />
            <Content />
            <Footer />
        </div>
    );
}

ReactDOM.render(
    <Home />,
    document.getElementById('root')
);

export default Home;
