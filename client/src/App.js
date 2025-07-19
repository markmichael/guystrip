import React, { useState, useEffect } from 'react';
import CreateTrip from './components/CreateTrip';
import TripList from './components/TripList';
import './App.css';

function App() {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const fetchTrips = async () => {
      const response = await fetch('http://localhost:3001/trips');
      const data = await response.json();
      setTrips(data);
    };
    fetchTrips();
  }, []);

  const handleTripCreated = (newTrip) => {
    setTrips([...trips, newTrip]);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Guys Trip Planner</h1>
      </header>
      <main>
        <CreateTrip onTripCreated={handleTripCreated} />
        <TripList trips={trips} />
      </main>
    </div>
  );
}

export default App;
