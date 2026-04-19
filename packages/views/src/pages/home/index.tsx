/**
 * @file
 */
import './index.less';
import React from 'react';
import {createRoot} from 'react-dom/client';

import Header from 'views/src/pages/home/container/header';
import Content from 'views/src/pages/home/container/content';
import Footer from 'views/src/pages/home/container/footer';

function Home() {
    return (
        <div className="pandora-home">
            <Header />
            <Content />
            <Footer />
        </div>
    );
}

const root = createRoot(document.getElementById('root')!);
root.render(<Home />);

export default Home;
