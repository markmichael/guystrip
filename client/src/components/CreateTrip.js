import React, { useState } from 'react';

const CreateTrip = ({ onTripCreated }) => {
  const [name, setName] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('http://localhost:3001/trips', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, year }),
    });
    const newTrip = await response.json();
    onTripCreated(newTrip);
    setName('');
    setYear(new Date().getFullYear());
  };

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h2 className="card-title">Create a new trip</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="tripName" className="form-label">Name:</label>
            <input
              type="text"
              className="form-control"
              id="tripName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="tripYear" className="form-label">Year:</label>
            <input
              type="number"
              className="form-control"
              id="tripYear"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">Create</button>
        </form>
      </div>
    </div>
  );
};

export default CreateTrip;
