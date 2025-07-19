import React from 'react';

const TripList = ({ trips }) => {
  return (
    <div>
      <h2>Trips</h2>
      <ul>
        {trips.map((trip) => (
          <li key={trip.id}>
            {trip.name} ({trip.year})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TripList;
