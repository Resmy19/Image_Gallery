// src/__tests__/Grid.test.js

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Grid from '../components/Grid';

// Mocking fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      page: {
        'content-items': {
          content: [
            { id: '1', 'poster-image': 'poster1.jpg', name: 'Image 1' },
            { id: '2', 'poster-image': 'poster2.jpg', name: 'Image 2' },
          ]
        }
      }
    }),
  })
);

// Mocking IntersectionObserver
global.IntersectionObserver = class {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {
    this.callback([{ isIntersecting: true, target: { dataset: { src: 'poster1.jpg' } } }]);
  }
  unobserve() {}
  disconnect() {}
};

describe('Grid Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders Grid component and fetches images', async () => {
    render(<Grid />);

    // Check if the NavBar is rendered
    expect(screen.getByAltText('Back')).toBeInTheDocument();
    expect(screen.getByAltText('Search')).toBeInTheDocument();

    // Check if loading message is shown
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Wait for images to be fetched and rendered
    await waitFor(() => {
      expect(screen.getAllByRole('img').length).toBeGreaterThan(0);
    });
  });

  test('scrolling reveals back to top button', async () => {
    render(<Grid />);

    // Wait for images to be fetched and rendered
    await waitFor(() => {
      expect(screen.getAllByRole('img').length).toBeGreaterThan(0);
    });

    const gridContainer = screen.getByTestId('grid-container');
    fireEvent.scroll(gridContainer, { target: { scrollY: 1000 } });
  });

  test('back to top button scrolls to top', async () => {
    render(<Grid />);

    // Wait for images to be fetched and rendered
    await waitFor(() => {
      expect(screen.getAllByRole('img').length).toBeGreaterThan(0);
    });

    const gridContainer = screen.getByTestId('grid-container');
    fireEvent.scroll(gridContainer, { target: { scrollY: 1000 } });
  });
});
