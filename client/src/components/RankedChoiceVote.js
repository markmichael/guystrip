import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function RankedChoiceVote({ currentTrip, refreshTrip }) {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [nominations, setNominations] = useState([]);
  const [voterName, setVoterName] = useState('');
  const [rankedChoices, setRankedChoices] = useState({});
  const [submittedVotes, setSubmittedVotes] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch nominations
      const nominationsResponse = await fetch(`http://localhost:3001/trips/${tripId}/nominations`);
      const nominationsData = await nominationsResponse.json();
      setNominations(nominationsData);

      // Fetch submitted votes (for displaying voters)
      const votesResponse = await fetch(`http://localhost:3001/trips/${tripId}/ranked-choice-votes`); // Assuming an endpoint to get all votes
      const votesData = await votesResponse.json();
      setSubmittedVotes(votesData);

      // If not in ranked-choice-vote stage, show results by default
      if (currentTrip.stage !== 'ranked-choice-vote') {
        handleViewResults();
      }
    };
    fetchData();
  }, [tripId, currentTrip.stage]);

  const handleRankChange = (rank, nominationId) => {
    setRankedChoices((prevChoices) => ({
      ...prevChoices,
      [rank]: nominationId,
    }));
  };

  const handleSubmitVote = async (e) => {
    e.preventDefault();
    if (!voterName.trim() || Object.keys(rankedChoices).length === 0) return;

    const response = await fetch(`http://localhost:3001/trips/${tripId}/ranked-choice-votes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ voter_name: voterName, ranked_choices: rankedChoices }),
    });
    if (response.ok) {
      const newVote = await response.json();
      setSubmittedVotes([...submittedVotes, newVote]);
      setVoterName('');
      setRankedChoices({});
    } else {
      console.error('Failed to submit vote');
    }
  };

  const handleViewResults = async () => {
    const response = await fetch(`http://localhost:3001/trips/${tripId}/ranked-choice-vote-results`);
    const data = await response.json();
    setResults(data);
    setShowResults(true);
  };

  const handleEndVoting = async () => {
    if (window.confirm('Are you sure you want to end ranked choice voting and proceed to the final vote?')) {
      const response = await fetch(`http://localhost:3001/trips/${tripId}/stage`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stage: 'final-vote' }),
      });
      if (response.ok) {
        refreshTrip();
        navigate(`/trips/${tripId}/final-vote`);
      } else {
        console.error('Failed to end ranked choice voting');
      }
    }
  };

  const handleReturnToNominations = async () => {
    if (window.confirm('Are you sure you want to return to the nomination phase? All ranked choice vote data will be discarded.')) {
      const response = await fetch(`http://localhost:3001/trips/${tripId}/revert-to-nomination`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        refreshTrip();
        navigate(`/trips/${tripId}/nominate`);
      } else {
        console.error('Failed to return to nominations');
      }
    }
  };

  return (
    <div className="container">
      <h2 className="my-4 text-center">Ranked Choice Vote for Trip {currentTrip.name} ({currentTrip.year})</h2>

      {currentTrip.stage === 'ranked-choice-vote' && !showResults ? (
        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h3 className="card-title">Submit Your Vote</h3>
                <form onSubmit={handleSubmitVote}>
                  <div className="mb-3">
                    <label htmlFor="voterName" className="form-label">Your Name:</label>
                    <input
                      type="text"
                      className="form-control"
                      id="voterName"
                      value={voterName}
                      onChange={(e) => setVoterName(e.target.value)}
                      required
                    />
                  </div>
                  <h4 className="mb-3">Rank your top 5 nominations:</h4>
                  {[1, 2, 3, 4, 5].map((rank) => (
                    <div key={rank} className="mb-2">
                      <label className="form-label">
                        {rank}.
                        <select
                          className="form-select"
                          value={rankedChoices[rank] || ''}
                          onChange={(e) => handleRankChange(rank, e.target.value)}
                        >
                          <option value="">Select a nomination</option>
                          {nominations.map((nom) => (
                            <option
                              key={nom.id}
                              value={nom.id}
                              disabled={
                                Object.values(rankedChoices).includes(String(nom.id)) &&
                                String(rankedChoices[rank]) !== String(nom.id)
                              }
                            >
                              {nom.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  ))}
                  <button type="submit" className="btn btn-primary mt-3">Submit Vote</button>
                </form>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h3 className="card-title">Voters:</h3>
                <ul className="list-group list-group-flush">
                  {submittedVotes.map((vote) => (
                    <li key={vote.id} className="list-group-item">{vote.voter_name}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-4 text-center">
              <button onClick={handleViewResults} className="btn btn-info me-2">View Results</button>
              <button onClick={handleEndVoting} className="btn btn-success">End Ranked Choice Voting and Proceed to Final Vote</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <h3>Ranked Choice Vote Results</h3>
          <ul className="list-group">
            {results.map(([name, score]) => (
              <li key={name} className="list-group-item d-flex justify-content-between align-items-center">
                {name}
                <span className="badge bg-primary rounded-pill">{score} points</span>
              </li>
            ))}
          </ul>
          {currentTrip.stage === 'ranked-choice-vote' && (
            <button onClick={() => setShowResults(false)} className="btn btn-secondary mt-3">Hide Results</button>
          )}
        </div>
      )}

      {currentTrip.stage === 'nomination' && (
        <div className="text-center mt-4">
          <button onClick={handleReturnToNominations} className="btn btn-warning">Return to Nomination Phase</button>
        </div>
      )}
    </div>
  );
}

export default RankedChoiceVote;
