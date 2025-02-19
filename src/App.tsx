import React from 'react';
import { createGlobalStyle } from 'styled-components';
import TaxCalculator from './components/TaxCalculator';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #f0f2f5;
  }
`;

const App: React.FC = () => {
  return (
    <>
      <GlobalStyle />
      <TaxCalculator />
    </>
  );
};

export default App;
