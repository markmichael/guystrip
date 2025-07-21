import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import Nominations from './Nominations';

// Mock useParams from react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ tripId: '1' }),
}));

describe('Nominations', () => {
  beforeEach(() => {
    global.fetch = jest.fn((url, options) => {
      if (url.includes('/nominations') && options?.method === 'POST') {
        return Promise.resolve({
          json: () => Promise.resolve({ id: 2, trip_id: 1, name: 'New York' }),
        });
      } else if (url.includes('/nominations') && options?.method === 'PUT') {
        return Promise.resolve({
          json: () => Promise.resolve({ id: 1, trip_id: 1, name: JSON.parse(options.body).name }),
        });
      } else if (url.includes('/nominations')) {
        return Promise.resolve({
          json: () => Promise.resolve([{ id: 1, trip_id: 1, name: 'Hawaii' }]),
        });
      }
      return Promise.reject(new Error('unknown url'));
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should display existing nominations', async () => {
    render(
      <Router>
        <Nominations />
      </Router>
    );

    expect(screen.getByText('Nominations for Trip 1')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Hawaii')).toBeInTheDocument();
    });
  });

  it('should add a new nomination', async () => {
    render(
      <Router>
        <Nominations />
      </Router>
    );

    fireEvent.change(screen.getByPlaceholderText('Enter a nomination'), {
      target: { value: 'New York' },
    });
    fireEvent.click(screen.getByText('Add Nomination'));

    await waitFor(() => {
      expect(screen.getByText('New York')).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText('Enter a nomination')).toHaveValue('');
  });

  it('should edit an existing nomination', async () => {
    render(
      <Router>
        <Nominations />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Hawaii')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Edit'));

    const editInput = screen.getByDisplayValue('Hawaii');
    fireEvent.change(editInput, { target: { value: 'Maui' } });

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(screen.getByText('Maui')).toBeInTheDocument();
    });
    expect(screen.queryByText('Hawaii')).not.toBeInTheDocument();
  });

  it('should not add an empty nomination', async () => {
    render(
      <Router>
        <Nominations />
      </Router>
    );

    fireEvent.click(screen.getByText('Add Nomination'));

    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalledWith(
        expect.stringContaining('/nominations'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });
});
