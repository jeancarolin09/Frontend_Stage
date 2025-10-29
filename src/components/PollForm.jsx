import React, { useState } from 'react';

const PollForm = ({ onSubmit }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['','']);

  const addOption = () => setOptions([...options,'']);

  return (
    <div className="bg-purple-50 p-4 rounded">
      <input type="text" placeholder="Question" value={question} onChange={e=>setQuestion(e.target.value)} className="w-full border px-2 py-1 rounded mb-2"/>
      {options.map((opt,i)=><input key={i} type="text" placeholder={`Option ${i+1}`} value={opt} onChange={e=>{const newOpts=[...options]; newOpts[i]=e.target.value; setOptions(newOpts);}} className="w-full border px-2 py-1 rounded mb-2"/>)}
      <button onClick={addOption} className="bg-purple-600 text-white px-4 py-2 rounded mb-2">+ Option</button>
      <button onClick={()=>onSubmit({question, options})} className="bg-purple-800 text-white px-4 py-2 rounded">Créer le sondage</button>
    </div>
  );
};

export default PollForm;
