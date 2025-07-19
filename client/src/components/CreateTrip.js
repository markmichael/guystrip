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
    <form onSubmit={handleSubmit}>
      <h2>Create a new trip</h2>
      <div>
        <label>Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Year:</label>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          required
        />
      </div>
      <button type="submit">Create</button>
    </form>
  );
};

export default CreateTrip;
