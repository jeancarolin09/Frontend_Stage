import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';

const EventCard = ({ event, onClick }) => {
  return (
    <div onClick={onClick} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg cursor-pointer transition">
      <h3 className="text-xl font-bold mb-2">{event.title}</h3>
      <p className="text-gray-600 mb-2">{event.description}</p>
      <div className="flex space-x-4 text-gray-500 text-sm">
        <span className="flex items-center"><Calendar size={16}/> {event.date}</span>
        <span className="flex items-center"><Clock size={16}/> {event.time}</span>
        {event.location && <span className="flex items-center"><MapPin size={16}/> {event.location}</span>}
      </div>
    </div>
  );
};

export default EventCard;
