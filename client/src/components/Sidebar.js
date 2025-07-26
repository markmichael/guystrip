import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ tripId, currentStage }) => {
  const stages = [
    { name: 'Nomination', key: 'nomination', path: `/trips/${tripId}/nominate` },
    { name: 'Ranked Choice Vote', key: 'ranked-choice-vote', path: `/trips/${tripId}/ranked-choice-vote` },
    { name: 'Final Vote', key: 'final-vote', path: `/trips/${tripId}/final-vote` },
  ];

  const stageOrder = ['nomination', 'ranked-choice-vote', 'final-vote', 'completed'];
  const currentStageIndex = stageOrder.indexOf(currentStage);

  return (
    <div className="list-group">
      {stages.map((stage, index) => {
        const stageIndex = stageOrder.indexOf(stage.key);
        const isDisabled = stageIndex > currentStageIndex;

        return (
          <Link
            key={index}
            to={isDisabled ? '#' : stage.path}
            className={`list-group-item list-group-item-action ${currentStage === stage.key ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
            aria-disabled={isDisabled}
            onClick={(e) => isDisabled && e.preventDefault()}
          >
            {stage.name}
          </Link>
        );
      })}
    </div>
  );
};

export default Sidebar;
