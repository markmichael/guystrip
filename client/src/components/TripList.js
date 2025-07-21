import React from 'react';
import { Link } from 'react-router-dom';

const TripList = ({ trips, setTrips, includeArchived, setIncludeArchived }) => {

  const handleRename = async (tripId) => {
    const newName = prompt('Enter new trip name:');
    if (newName) {
      const response = await fetch(`http://localhost:3001/trips/${tripId}/rename`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });
      const updatedTrip = await response.json();
      setTrips(trips.map(t => t.id === tripId ? updatedTrip : t));
    }
  };

  const handleArchive = async (tripId) => {
    if (window.confirm('Are you sure you want to archive this trip?')) {
      const response = await fetch(`http://localhost:3001/trips/${tripId}/archive`, {
        method: 'PUT',
      });
      const updatedTrip = await response.json();
      setTrips(trips.map(t => t.id === tripId ? updatedTrip : t));
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>Trips</h2>
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            checked={includeArchived}
            onChange={(e) => setIncludeArchived(e.target.checked)}
            id="includeArchived"
          />
          <label className="form-check-label" htmlFor="includeArchived">
            Include Archived
          </label>
        </div>
      </div>
      <ul className="list-group list-group-flush">
        {trips.map((trip) => (
          <li key={trip.id} className="list-group-item d-flex justify-content-between align-items-center">
            <Link to={`/trips/${trip.id}/nominate`}>
              {trip.name} ({trip.year})
            </Link>
            <div>
              <button className="btn btn-secondary btn-sm" onClick={() => handleRename(trip.id)}>Rename</button>
              {trip.status !== 'archived' &&
                <button className="btn btn-danger btn-sm ml-2" onClick={() => handleArchive(trip.id)}>Archive</button>
              }
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TripList;
