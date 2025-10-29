import { useState, useEffect } from "react";
import axios from "axios";

export const useInvitations = (email) => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const token = localStorage.getItem("jwt"); // 🔑 récupère le JWT
        const res = await axios.get(
          `http://localhost:8000/api/invitations/user/${email}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // 🔑 envoie le token
            },
          }
        );
        setInvitations(res.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (email) fetchInvitations();
  }, [email]);

  return { invitations, loading, error, setInvitations };
};
