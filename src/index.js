import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {
  Tolgee,
  DevTools,
  TolgeeProvider,
  FormatSimple,
  BackendFetch,
} from '@tolgee/react';

const tolgee = Tolgee()
  .use(DevTools())
  .use(BackendFetch())
  .use(FormatSimple())
  .init({
    language: 'en',
    apiUrl: process.env.REACT_APP_TOLGEE_API_URL,
    apiKey: process.env.REACT_APP_TOLGEE_API_KEY,
  });

// for production
staticData: {
}

console.log('index tolgee', tolgee);
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <TolgeeProvider
      tolgee={tolgee}
      loadingFallback={<span>Loading...</span>}
      onError={(error) => {
        console.error('Tolgee error:', error);
      }}
    >
      <App />
    </TolgeeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
