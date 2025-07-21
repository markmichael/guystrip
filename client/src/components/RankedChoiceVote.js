import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function RankedChoiceVote() {
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
    };
    fetchData();
  }, [tripId]);

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
    // Implement logic to end voting and potentially move to next phase
    // For now, just a placeholder
    alert('Voting ended!');
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
        navigate(`/trips/${tripId}/nominate`);
      } else {
        console.error('Failed to return to nominations');
      }
    }
  };

  return (
    <div>
      <h2>Ranked Choice Vote for Trip {tripId}</h2>

      {!showResults ? (
        <>
          <h3>Submit Your Vote</h3>
          <form onSubmit={handleSubmitVote}>
            <label>
              Your Name:
              <input
                type="text"
                value={voterName}
                onChange={(e) => setVoterName(e.target.value)}
                required
              />
            </label>
            <h4>Rank your top 5 nominations:</h4>
            """            {[1, 2, 3, 4, 5].map((rank) => (
              <div key={rank}>
                <label>
                  {rank}.
                  <select
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
            ))}""
            <button type="submit">Submit Vote</button>
          </form>

          <h3>Voters:</h3>
          <ul>
            {submittedVotes.map((vote) => (
              <li key={vote.id}>{vote.voter_name}</li>
            ))}
          </ul>

          <button onClick={handleViewResults}>View Results</button>
          <button onClick={handleEndVoting}>End Voting</button>
        </>
      ) : (
        <>
          <h3>Ranked Choice Vote Results</h3>
          <ul>
            {results.map(([name, score]) => (
              <li key={name}>{name}: {score} points</li>
            ))}
          </ul>
          <button onClick={() => setShowResults(false)}>Hide Results</button>
        </>
      )}

      <button onClick={handleReturnToNominations}>Return to Nomination Phase</button>
    </div>
  );
}

export default RankedChoiceVote;
