import React from 'react';
import { Link } from 'react-router-dom';

const TripList = ({ trips }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h2>Trips</h2>
      </div>
      <ul className="list-group list-group-flush">
        {trips.map((trip) => (
          <li key={trip.id} className="list-group-item">
            <Link to={`/trips/${trip.id}/nominate`}>
              {trip.name} ({trip.year})
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TripList;
