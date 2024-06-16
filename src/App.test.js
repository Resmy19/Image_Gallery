// src/App.test.js

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import Grid from './components/Grid';

jest.mock('./components/Grid', () => () => <div data-testid="grid">Mocked Grid</div>);

describe('App Component', () => {
  test('renders App component and Grid component', () => {
    render(<App />);
    
    // Check if the AppContainer is rendered
    const appContainer = screen.getByTestId('app-container');
    expect(appContainer).toBeInTheDocument();
    
    // Check if the Grid component is rendered
    const gridComponent = screen.getByTestId('grid');
    expect(gridComponent).toBeInTheDocument();
    expect(gridComponent).toHaveTextContent('Mocked Grid');
  });
});
