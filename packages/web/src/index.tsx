import './index.css';
import ReactDOM from 'react-dom/client';

import { App } from './App';

const container = document.getElementById('root');

if (!container) {
    throw new Error('Missing #root element in index.html');
}

const root = ReactDOM.createRoot(container);

root.render(<App />);
