import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreateTrip from './CreateTrip';

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ id: 1, name: 'Test Trip', year: 2025 }),
  })
);

describe('CreateTrip', () => {
  it('should create a new trip', async () => {
    const onTripCreated = jest.fn();
    render(<CreateTrip onTripCreated={onTripCreated} />);

    fireEvent.change(screen.getByLabelText('Name:'), {
      target: { value: 'Test Trip' },
    });
    fireEvent.change(screen.getByLabelText('Year:'), {
      target: { value: '2025' },
    });

    fireEvent.click(screen.getByText('Create'));

    await screen.findByText('Create a new trip');

    expect(onTripCreated).toHaveBeenCalledWith({ id: 1, name: 'Test Trip', year: 2025 });
  });
});
