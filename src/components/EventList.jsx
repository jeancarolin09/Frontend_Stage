import React from "react";
import { useEvents } from "../hooks/useEvents";

const EventList = () => {
  const { data: events, isLoading, isError } = useEvents();

  if (isLoading) return <p>Chargement des événements...</p>;
  if (isError) return <p>Erreur lors du chargement.</p>;
  if (!events.length) return <p>Aucun événement disponible.</p>;

  return (
    <div>
      <h2>Liste des événements</h2>
      <ul>
        {events.map((event) => (
          <li key={event.id}>
            <strong>{event.title}</strong> <br />
            {event.description} <br />
            Date: {new Date(event.event_date).toLocaleDateString()} <br />
            Heure: {new Date(event.event_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} <br />
            Lieu: {event.location_default}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventList;
