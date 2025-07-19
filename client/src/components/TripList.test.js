import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TripList from './TripList';

describe('TripList', () => {
  it('should display a list of trips', () => {
    const trips = [
      { id: 1, name: 'Test Trip 1', year: 2025 },
      { id: 2, name: 'Test Trip 2', year: 2026 },
    ];
    render(<TripList trips={trips} />);

    expect(screen.getByText('Test Trip 1 (2025)')).toBeInTheDocument();
    expect(screen.getByText('Test Trip 2 (2026)')).toBeInTheDocument();
  });
});
