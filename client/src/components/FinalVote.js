import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const FinalVote = ({ currentTrip, refreshTrip }) => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [options, setOptions] = useState([]);
  const [voterName, setVoterName] = useState('');
  const [selectedChoice, setSelectedChoice] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const fetchOptionsAndResults = async () => {
      if (currentTrip.stage === 'final-vote') {
        const response = await fetch(`http://localhost:3001/trips/${tripId}/final-vote-options`);
        const data = await response.json();
        setOptions(data);
      } else {
        // If not in final-vote stage, show results by default
        handleViewResults();
      }
    };
    fetchOptionsAndResults();
  }, [tripId, currentTrip.stage]);

  const handleSubmitVote = async () => {
    if (!voterName || !selectedChoice) {
      alert('Please enter your name and select a choice.');
      return;
    }
    await fetch(`http://localhost:3001/trips/${tripId}/final-vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voter_name: voterName, final_choice_id: selectedChoice }),
    });
    alert('Vote submitted!');
    setVoterName('');
    setSelectedChoice('');
    refreshTrip(); // Refresh trip data after vote submission
  };

  const handleViewResults = async () => {
    const response = await fetch(`http://localhost:3001/trips/${tripId}/final-vote-results`);
    const data = await response.json();
    setResults(data);
    setShowResults(true);
  };

  const handleEndVoting = async () => {
    if (window.confirm('Are you sure you want to end final voting?')) {
      const response = await fetch(`http://localhost:3001/trips/${tripId}/stage`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stage: 'completed' }), // Assuming a 'completed' stage
      });
      if (response.ok) {
        refreshTrip();
        navigate('/'); // Navigate back to home
      } else {
        console.error('Failed to end final voting');
      }
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>Final Vote for Trip {currentTrip.name} ({currentTrip.year})</h2>
      </div>
      <div className="card-body">
        {currentTrip.stage === 'final-vote' && !showResults ? (
          <form>
            <div className="form-group">
              <label>Your Name:</label>
              <input
                type="text"
                className="form-control"
                value={voterName}
                onChange={(e) => setVoterName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Select your final choice:</label>
              {options.map((option) => (
                <div key={option.id} className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="finalChoice"
                    id={`choice-${option.id}`}
                    value={option.id}
                    checked={selectedChoice == option.id} // Use == for comparison as option.id might be number and selectedChoice string
                    onChange={(e) => setSelectedChoice(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor={`choice-${option.id}`}>
                    {option.name}
                  </label>
                </div>
              ))}
            </div>
            <button type="button" className="btn btn-primary" onClick={handleSubmitVote}>Submit Vote</button>
            <button type="button" className="btn btn-info ml-2" onClick={handleViewResults}>View Results</button>
          </form>
        ) : (
          <div>
            <h3>Results</h3>
            <ul className="list-group mb-3">
              {results.map(([name, count]) => (
                <li key={name} className="list-group-item d-flex justify-content-between align-items-center">
                  {name}
                  <span className="badge badge-primary badge-pill">{count}</span>
                </li>
              ))}
            </ul>
            {currentTrip.stage === 'final-vote' && (
              <button type="button" className="btn btn-success" onClick={handleEndVoting}>End Voting</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FinalVote;
