import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function Nominations() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [nominations, setNominations] = useState([]);
  const [newNomination, setNewNomination] = useState('');
  const [editingNominationId, setEditingNominationId] = useState(null);
  const [editingNominationName, setEditingNominationName] = useState('');

  useEffect(() => {
    const fetchNominations = async () => {
      const response = await fetch(`http://localhost:3001/trips/${tripId}/nominations`);
      const data = await response.json();
      setNominations(data);
    };
    fetchNominations();
  }, [tripId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newNomination.trim()) return;

    const response = await fetch(`http://localhost:3001/trips/${tripId}/nominations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: newNomination }),
    });
    const data = await response.json();
    setNominations([...nominations, data]);
    setNewNomination('');
  };

  const handleEditClick = (nomination) => {
    setEditingNominationId(nomination.id);
    setEditingNominationName(nomination.name);
  };

  const handleSaveEdit = async (nominationId) => {
    if (!editingNominationName.trim()) return;

    const response = await fetch(`http://localhost:3001/trips/${tripId}/nominations/${nominationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: editingNominationName }),
    });
    const data = await response.json();
    setNominations(nominations.map((nom) => (nom.id === nominationId ? data : nom)));
    setEditingNominationId(null);
    setEditingNominationName('');
  };

  const handleCancelEdit = () => {
    setEditingNominationId(null);
    setEditingNominationName('');
  };

  const handleEndNominations = async () => {
    const response = await fetch(`http://localhost:3001/trips/${tripId}/stage`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ stage: 'ranked-choice-vote' }),
    });
    if (response.ok) {
      navigate(`/trips/${tripId}/ranked-choice-vote`);
    } else {
      console.error('Failed to end nominations');
    }
  };

  return (
    <div>
      <h2>Nominations for Trip {tripId}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={newNomination}
          onChange={(e) => setNewNomination(e.target.value)}
          placeholder="Enter a nomination"
        />
        <button type="submit">Add Nomination</button>
      </form>
      <h3>Current Nominations:</h3>
      <ul>
        {nominations.map((nomination) => (
          <li key={nomination.id}>
            {editingNominationId === nomination.id ? (
              <>
                <input
                  type="text"
                  value={editingNominationName}
                  onChange={(e) => setEditingNominationName(e.target.value)}
                />
                <button onClick={() => handleSaveEdit(nomination.id)}>Save</button>
                <button onClick={handleCancelEdit}>Cancel</button>
              </>
            ) : (
              <>
                {nomination.name}
                <button onClick={() => handleEditClick(nomination)}>Edit</button>
              </>
            )}
          </li>
        ))}
      </ul>
      <button onClick={handleEndNominations}>End Nominations</button>
    </div>
  );
}

export default Nominations;
