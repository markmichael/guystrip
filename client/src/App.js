import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import CreateTrip from './components/CreateTrip';
import TripList from './components/TripList';
import Nominations from './components/Nominations';
import RankedChoiceVote from './components/RankedChoiceVote';
import FinalVote from './components/FinalVote';
import TripPageLayout from './components/TripPageLayout';
import Sidebar from './components/Sidebar';
import './App.css';

function App() {
  const [trips, setTrips] = React.useState([]);
  const [includeArchived, setIncludeArchived] = React.useState(false);

  React.useEffect(() => {
    const fetchTrips = async () => {
      const response = await fetch(`http://localhost:3001/trips?includeArchived=${includeArchived}`);
      const data = await response.json();
      setTrips(data);
    };
    fetchTrips();
  }, [includeArchived]);

  React.useEffect(() => {
    localStorage.setItem('trips', JSON.stringify(trips));
  }, [trips]);

  const handleTripCreated = (newTrip) => {
    setTrips([...trips, newTrip]);
  };

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
            <Route path="/" element={<Home trips={trips} setTrips={setTrips} onTripCreated={handleTripCreated} includeArchived={includeArchived} setIncludeArchived={setIncludeArchived} />} />
            <Route path="/trips/:tripId/*" element={<TripPageLayout />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function Home({ trips, setTrips, onTripCreated, includeArchived, setIncludeArchived }) {
  return (
    <>
      <CreateTrip onTripCreated={onTripCreated} />
      <TripList trips={trips} setTrips={setTrips} includeArchived={includeArchived} setIncludeArchived={setIncludeArchived} />
    </>
  );
}

export default App;
