// src/App.js

import React from 'react';
import styled from 'styled-components';
import Grid from './components/Grid';

const AppContainer = styled.div`
  max-width: 480px;
  margin: 0 auto;
`;

function App() {
  return (
    <AppContainer data-testid="app-container">
      <Grid />
    </AppContainer>
  );
}

export default App;
