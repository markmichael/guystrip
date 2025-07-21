import React from 'react';
import { Link } from 'react-router-dom';

const TripList = ({ trips }) => {
  return (
    <div>
      <h2>Trips</h2>
      <ul>
        {trips.map((trip) => (
          <li key={trip.id}>
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
