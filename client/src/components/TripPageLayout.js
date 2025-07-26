import React, { useState, useEffect } from 'react';
import { useParams, Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import Nominations from './Nominations';
import RankedChoiceVote from './RankedChoiceVote';
import FinalVote from './FinalVote';

const TripPageLayout = () => {
  const { tripId } = useParams();
  const [currentTrip, setCurrentTrip] = useState(null);

  const fetchCurrentTrip = async () => {
    try {
      const response = await fetch(`http://localhost:3001/trips/${tripId}`);
      const data = await response.json();
      setCurrentTrip(data);
    } catch (error) {
      console.error("Failed to fetch current trip:", error);
      setCurrentTrip(null);
    }
  };

  useEffect(() => {
    fetchCurrentTrip();
  }, [tripId]);

  if (!currentTrip) {
    return <div>Loading trip details...</div>;
  }

  return (
    <div className="d-flex">
      <div className="col-md-3">
        <Sidebar tripId={currentTrip.id} currentStage={currentTrip.stage} />
      </div>
      <main className="col-md-9">
        <Routes>
          <Route path="nominate" element={<Nominations currentTrip={currentTrip} refreshTrip={fetchCurrentTrip} />} />
          <Route path="ranked-choice-vote" element={<RankedChoiceVote currentTrip={currentTrip} refreshTrip={fetchCurrentTrip} />} />
          <Route path="final-vote" element={<FinalVote currentTrip={currentTrip} refreshTrip={fetchCurrentTrip} />} />
        </Routes>
      </main>
    </div>
  );
};

export default TripPageLayout;
