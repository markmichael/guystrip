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
    <div className="container">
      <h2 className="my-4 text-center">Nominations for Trip {tripId}</h2>
      <div className="card mb-4">
        <div className="card-body">
          <h3 className="card-title">Add a Nomination</h3>
          <form onSubmit={handleSubmit}>
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                value={newNomination}
                onChange={(e) => setNewNomination(e.target.value)}
                placeholder="Enter a nomination"
              />
              <button type="submit" className="btn btn-primary">Add Nomination</button>
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h3 className="card-title">Current Nominations:</h3>
          <ul className="list-group list-group-flush">
            {nominations.map((nomination) => (
              <li key={nomination.id} className="list-group-item">
                {editingNominationId === nomination.id ? (
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      value={editingNominationName}
                      onChange={(e) => setEditingNominationName(e.target.value)}
                    />
                    <button onClick={() => handleSaveEdit(nomination.id)} className="btn btn-success">Save</button>
                    <button onClick={handleCancelEdit} className="btn btn-secondary">Cancel</button>
                  </div>
                ) : (
                  <div className="d-flex justify-content-between align-items-center">
                    {nomination.name}
                    <button onClick={() => handleEditClick(nomination)} className="btn btn-outline-primary btn-sm">Edit</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="text-center mt-4">
        <button onClick={handleEndNominations} className="btn btn-success">End Nominations</button>
      </div>
    </div>
  );
}

export default Nominations;
