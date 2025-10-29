import React from 'react';

const PollCard = ({ poll }) => {
  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h4 className="font-bold">{poll.question}</h4>
      <ul className="mt-2">
        {poll.options.map((opt,i)=><li key={i}>{opt}</li>)}
      </ul>
    </div>
  );
};

export default PollCard;
