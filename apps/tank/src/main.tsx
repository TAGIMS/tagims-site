import React from 'react';
import {createRoot} from 'react-dom/client';
import AccountApp from './Account';
import './globals.css';
import './studio.css';
import './hub-menu.css';
createRoot(document.getElementById('root')!).render(<AccountApp/>);
