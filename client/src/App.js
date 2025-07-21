import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import CreateTrip from './components/CreateTrip';
import TripList from './components/TripList';
import Nominations from './components/Nominations';
import RankedChoiceVote from './components/RankedChoiceVote';
import './App.css';

function App() {
  return (
    <Router>
      <div className="container mt-4">
        <header className="text-center mb-4">
          <h1 className="display-4">Guys Trip Planner</h1>
          <nav className="nav justify-content-center">
            <Link to="/" className="nav-link">Home</Link>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/trips/:tripId/nominate" element={<Nominations />} />
            <Route path="/trips/:tripId/ranked-choice-vote" element={<RankedChoiceVote />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function Home() {
  const [trips, setTrips] = React.useState([]);

  React.useEffect(() => {
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
    <>
      <CreateTrip onTripCreated={handleTripCreated} />
      <TripList trips={trips} />
    </>
  );
}

export default App;
