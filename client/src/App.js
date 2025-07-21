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
      <div className="App">
        <header className="App-header">
          <h1>Guys Trip Planner</h1>
          <nav>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
            </ul>
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
