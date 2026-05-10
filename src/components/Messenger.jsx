import React, { useState, useRef, useEffect, useCallback  } from 'react';
import { Send, X, Search, Phone, Video, Edit, MoreVertical, Plus, Users, Smile, Paperclip, ChevronLeft, Trash2 } from 'lucide-react';
import io from 'socket.io-client';

const Avatar = ({ user, size = "10", showOnlineStatus = true }) => {
    const isOnline = user?.isOnline === true;
    const dimensionClass = `w-${size} h-${size}`;

    return (
        <div className={`relative ${dimensionClass}`}>
            {user?.profilePicture ? (
                <img
                    src={`http://localhost:8000${user.profilePicture}`}
                    alt={user?.name}
                    className={`rounded-full object-cover border-2 border-white shadow-md ${dimensionClass}`}
                />
            ) : (
                <div className={`rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold flex items-center justify-center border-2 border-white shadow-md ${dimensionClass}`}>
                    {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
                </div>
            )}

            {showOnlineStatus && isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full z-10"></span>
            )}
        </div>
    );
};

const MessengerApp = ({ onNotificationUpdate }) => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showUserSearch, setShowUserSearch] = useState(false);
    const [searchedUsers, setSearchedUsers] = useState([]);
    const [searchUserQuery, setSearchUserQuery] = useState('');
    const [searchingUsers, setSearchingUsers] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [hoveredMessageId, setHoveredMessageId] = useState(null);
    const [messageMenuId, setMessageMenuId] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);
    const [editingContent, setEditingContent] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [creatingConversation, setCreatingConversation] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState(new Set()); // Commenté car non implémenté côté serveur
    const otherUser = selectedConversation?.participants?.[0] || null;
    


    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const searchTimeoutRef = useRef(null);
    const messageMenuRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const socketRef = useRef(null);
    const conversationCreationRef = useRef(new Set());

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const jwt = localStorage.getItem('jwt');


    // Initialisation du WebSocket avec logs pour déboguer
    useEffect(() => {
        console.log('Initialisation Socket.io...');
        socketRef.current = io('http://localhost:3001', {
            auth: { token: jwt },
            transports: ['websocket'],
            reconnection: true,
        });

        socketRef.current.on('connect', () => console.log('✅ Socket connecté'));
        socketRef.current.on('disconnect', () => console.log('❌ Socket déconnecté'));
        socketRef.current.on('connect_error', (err) => console.error('❌ Erreur connexion Socket:', err));

        // Gestion de la liste complète des utilisateurs en ligne
        socketRef.current.on('users:online', (onlineUserIds) => {
            console.log('Liste des utilisateurs en ligne reçue :', onlineUserIds);

            // Mettre à jour le Set des utilisateurs en ligne
            setOnlineUsers(new Set(onlineUserIds));

            // Mettre à jour toutes les conversations existantes
            setConversations(prev => prev.map(conv => ({
                ...conv,
                participants: conv.participants.map(p => ({
                    ...p,
                    isOnline: onlineUserIds.includes(p.id)
                }))
            })));
        });

        socketRef.current.on('onlineUsers:update', (users) => {
            const map = new Map();
            users.forEach(id => map.set(id, true));
            setOnlineUsers(map);
            console.log('Users en ligne:', map);
        });

        // Gestion utilisateur en ligne (ajout)
        socketRef.current.on("user:online", ({ userId }) => {
            setOnlineUsers(prev => new Set(prev).add(userId));
        });

        // Gestion utilisateur hors ligne (retrait)
        socketRef.current.on("user:offline", ({ userId }) => {
            setOnlineUsers(prev => {
                const updated = new Set(prev);
                updated.delete(userId);
                return updated;
            });
        });

        // Gestion utilisateur en ligne
        socketRef.current.on('user:online', ({ userId }) => {
            console.log('🟢 Utilisateur en ligne:', userId);

            setOnlineUsers(prev => new Set([...prev, userId]));

            // Mise à jour globale des participants dans toutes les conversations
            setConversations(prev => prev.map(conv => ({
                ...conv,
                participants: conv.participants.map(p =>
                    p.id === userId ? { ...p, isOnline: true } : p
                )
            })));
        });


        // Gestion utilisateur hors ligne
        socketRef.current.on('user:offline', ({ userId }) => {
            console.log('🔴 Utilisateur hors ligne:', userId);

            setOnlineUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });

            setConversations(prev => prev.map(conv => ({
                ...conv,
                participants: conv.participants.map(p =>
                    p.id === userId ? { ...p, isOnline: false } : p
                )
            })));
        });

        // Nouveau message en temps réel
        socketRef.current.on('message:new', (rawMessage) => {
            console.log('📨 Nouveau message reçu via Socket:', rawMessage);

            // Normalise TOUT en string dès le début
            const newMessage = {
                id: String(rawMessage.id),                    // ← toujours string
                content: rawMessage.content || '',
                senderId: String(rawMessage.senderId),
                senderName: rawMessage.senderName || 'Inconnu',
                conversationId: String(rawMessage.conversationId),
                createdAt: rawMessage.createdAt,
                isOwn: String(rawMessage.senderId) === String(currentUser.id),
                isRead: rawMessage.isRead ?? false,
                image: rawMessage.image || null,
            };

            // setMessages(prev => {
            //     // Vérifie si on a un message temporaire avec le même contenu
            //     const tempMessage = prev.find(m => 
            //         String(m.id).startsWith('temp-') && 
            //         m.content === newMessage.content
            //     );

            //     if (tempMessage) {
            //         // Remplace le message temporaire par le vrai (on garde le vrai ID)
            //         return prev.map(m =>
            //             m.id === tempMessage.id
            //                 ? { ...newMessage, id: newMessage.id } // vrai ID
            //                 : m
            //         );
            //     }

            //     // Sinon, ajoute normalement (évite les doublons)
            //     if (prev.some(m => String(m.id) === newMessage.id)) {
            //         console.log('Doublon évité (ID déjà présent)');
            //         return prev;
            //     }

            //     return [...prev, newMessage];
            // });

            setMessages(prev => {
                if (prev.some(m => String(m.id) === newMessage.id)) return prev;
                return [...prev, newMessage];
            });


            // Mise à jour des conversations (dernier message + badge)
            setConversations(prev => prev.map(conv => {
                if (String(conv.id) === newMessage.conversationId) {
                    const isOwn = newMessage.isOwn;
                    return {
                        ...conv,
                        lastMessage: {
                            id: newMessage.id,
                            content: newMessage.content,
                            senderName: newMessage.senderName,
                            senderId: newMessage.senderId,
                            createdAt: newMessage.createdAt,
                        },
                        unreadCount: isOwn 
                            ? conv.unreadCount 
                            : (selectedConversation?.id.toString() === conv.id.toString() 
                                ? 0 
                                : (conv.unreadCount || 0) + 1),
                    };
                }
                return conv;
            }));
        });

        // Indicateur de frappe
         socketRef.current.on('typing:user', ({ userId, isTyping }) => {
            if (selectedConversation && userId !== currentUser.id) {
                setIsTyping(isTyping);
            }
        });

        // Conversation marquée comme lue
        socketRef.current.on('conversation:read', ({ conversationId }) => {
            // console.log('✅ Conversation lue via Socket:', conversationId);
            setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, unreadCount: 0 } : c));
            if (selectedConversation?.id === conversationId) {
                setMessages(prev => prev.map(m => m.senderId !== currentUser.id ? { ...m, isRead: true } : m));
            }
        });

        // Message supprimé
        socketRef.current.on('message:deleted', ({ conversationId, messageId }) => {
            // console.log('🗑️ Message supprimé via Socket:', messageId);
            if (selectedConversation?.id === conversationId) {
                setMessages(prev => prev.filter(m => m.id !== messageId));
            }
        });

        // Nouvelle conversation
        socketRef.current.on('conversation:created', () => {
            // console.log('🆕 Nouvelle conversation via Socket');
            fetchConversations();
        });

        // Statut en ligne / hors ligne (commenté car non implémenté côté serveur)
        // socketRef.current.on('user:online', ({ userId }) => {
        //     console.log('🟢 Utilisateur en ligne:', userId);
        //     setOnlineUsers(prev => new Set([...prev, userId]));
        //     setConversations(prev => prev.map(conv => ({
        //         ...conv,
        //         participants: conv.participants.map(p => p.id === userId ? { ...p, isOnline: true } : p),
        //     })));
        // });

        // socketRef.current.on('user:offline', ({ userId }) => {
        //     console.log('🔴 Utilisateur hors ligne:', userId);
        //     setOnlineUsers(prev => {
        //         const s = new Set(prev);
        //         s.delete(userId);
        //         return s;
        //     });
        //     setConversations(prev => prev.map(conv => ({
        //         ...conv,
        //         participants: conv.participants.map(p => p.id === userId ? { ...p, isOnline: false } : p),
        //     })));
        // });

        return () => {
            // console.log('Fermeture Socket.io');
            socketRef.current?.disconnect();
        };
    }, [jwt, currentUser.id]);

    // online or not
    useEffect(() => {
        if (!socketRef.current) return;

        // Quand quelqu'un se connecte
        socketRef.current.on("user:online", ({ userId }) => {
            setOnlineUsers(prev => new Set(prev.add(userId)));
        });

        // Quand quelqu'un se déconnecte
        socketRef.current.on("user:offline", ({ userId }) => {
            setOnlineUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
        });

        return () => {
            socketRef.current.off("user:online");
            socketRef.current.off("user:offline");
        };
    }, [socketRef.current]);
    // Rejoindre/quitter la conversation sélectionnée
    useEffect(() => {
        if (selectedConversation && socketRef.current) {
            // console.log('👥 Rejoindre conversation:', selectedConversation.id);
            socketRef.current.emit('conversation:join', selectedConversation.id);
            return () => {
                // console.log('👋 Quitter conversation:', selectedConversation.id);
                socketRef.current?.emit('conversation:leave', selectedConversation.id);
            };
        }
    }, [selectedConversation?.id]);

    // Chargement initial des conversations (une seule fois)
    useEffect(() => {
        fetchConversations();
    }, []);

    // Chargement des messages quand on change de conversation (une seule fois)
    useEffect(() => {
        if (selectedConversation) {
            fetchMessages();
        }
    }, [selectedConversation?.id]);

    // Mettre à jour les notifications
    useEffect(() => {
        const unreadCount = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
        onNotificationUpdate?.(unreadCount);
    }, [conversations, onNotificationUpdate]);

    // Scroll automatique vers le bas
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Update status compte
    const updateUserStatus = (userId, isOnline) => {
        setSelectedConversation(prev => {
            if (!prev) return prev;

            const updatedParticipants = prev.participants.map(p =>
                p.id === userId ? { ...p, isOnline } : p
            );

            return { ...prev, participants: updatedParticipants };
        });
    };

    // Vérifie si le participant est en ligne
    // const isParticipantOnline = onlineUsers.has(otherUser?.id);
    const isParticipantOnline = otherUser
    ? onlineUsers.has(otherUser.id)
    : false;
    // const isParticipantOnline = selectedConversation.participants[0]?.id
    // ? onlineUsers.has(selectedConversation.participants[0].id)
    // : false;
    // console.log('User en ligne:', onlineUsers);
    

    const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const content = newMessage;
        setNewMessage(''); // efface immédiatement pour une bonne UX
        setShowEmojiPicker(false);

        try {
            const res = await fetch(
                `http://localhost:8000/api/conversations/${selectedConversation.id}/messages`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${jwt}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ content }),
                }
            );

            if (res.ok) {
                // Le message sera reçu via WebSocket → pas besoin de fetchMessages()
                // console.log('Message envoyé avec succès');
                // Arrête l’indicateur de frappe
                socketRef.current?.emit('typing:stop', selectedConversation.id);
            } else {
                // En cas d’erreur, on remet le message dans l’input
                setNewMessage(content);
                console.error('Erreur envoi message');
            }
        } catch (err) {
            console.error('Erreur réseau:', err);
            setNewMessage(content);
        }
    };

    const fetchConversations = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/conversations', {
                headers: { Authorization: `Bearer ${jwt}` }
            });
            if (res.ok) {
                const data = await res.json();
                // setConversations(data.map(conv => ({ // Commenté car non implémenté côté serveur
                //     ...conv,
                //     participants: conv.participants.map(p => ({
                //         ...p,
                //         isOnline: onlineUsers.has(p.id),
                //     })),
                // })));
                setConversations(data);
            }
        } catch (err) {
            console.error('Erreur lors du chargement des conversations:', err);
        }
    };

    const fetchMessages = async () => {
        if (!selectedConversation) return;
        
        try {
            const res = await fetch(
                `http://localhost:8000/api/conversations/${selectedConversation.id}/messages`,
                { headers: { Authorization: `Bearer ${jwt}` } }
            );
            if (!res.ok) return;

            const data = await res.json();
            setMessages(data.map(msg => ({
                ...msg,
                isOwn: msg.senderId === currentUser.id
            })));
        } catch (err) {
            console.error('Erreur lors du chargement des messages:', err);
        }
    };

  // 🔥 Recherche optimisée avec debounce plus court et affichage instantané
    const searchUsers = useCallback(async (query) => {
        if (!query.trim()) {
            setSearchedUsers([]);
            return;
        }

        setSearchingUsers(true);
        try {
            const res = await fetch(
                `http://localhost:8000/api/users/search?q=${encodeURIComponent(query)}`,
                { headers: { Authorization: `Bearer ${jwt}` } }
            );
            if (res.ok) {
                const data = await res.json();
                const filtered = data.filter(u => u.id !== currentUser.id);
                setSearchedUsers(filtered);
            }
        } catch (err) {
            console.error('Erreur recherche:', err);
        } finally {
            setSearchingUsers(false);
        }
    }, [jwt, currentUser.id]);

    const handleSearchChange = (query) => {
        setSearchUserQuery(query);
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        searchTimeoutRef.current = setTimeout(() => {
            searchUsers(query);
        }, 100);
    };

       // 🔥 Création de conversation optimisée avec prévention des doublons
    const startConversation = async (userId) => {
        const userKey = `user_${userId}`;
        
        // 🔥 Empêcher les clicks multiples
        if (conversationCreationRef.current.has(userKey) || creatingConversation) {
            console.log('⏳ Création déjà en cours...');
            return;
        }

        conversationCreationRef.current.add(userKey);
        setCreatingConversation(true);

        try {
            const res = await fetch('http://localhost:8000/api/conversations/create-or-find', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${jwt}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ participantIds: [userId] })
            });

            if (!res.ok) throw new Error('Erreur création conversation');

            const data = await res.json();
            
            // 🔥 Fermer immédiatement le panneau de recherche
            setShowUserSearch(false);
            setSearchUserQuery('');
            setSearchedUsers([]);

            // 🔥 Recharger les conversations
            await fetchConversations();

            // 🔥 Attendre que les conversations soient chargées puis sélectionner
            setTimeout(() => {
                setConversations(prev => {
                    const conv = prev.find(c => c.id === data.id);
                    if (conv) {
                        setSelectedConversation(conv);
                        // 🔥 Charger immédiatement les messages
                        fetchMessages();
                    }
                    return prev;
                });
            }, 100);

        } catch (err) {
            console.error('Erreur création conversation:', err);
        } finally {
            conversationCreationRef.current.delete(userKey);
            setCreatingConversation(false);
        }
    };

    const deleteMessage = async (messageId) => {
        if (!window.confirm('Supprimer ce message ?')) return;

        try {
            const res = await fetch(
                `http://localhost:8000/api/conversations/${selectedConversation.id}/messages/${messageId}`,
                {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${jwt}` }
                }
            );

            if (res.ok) {
                // Le message sera supprimé via WebSocket
                setMessageMenuId(null);
            }
        } catch (err) {
            console.error('Erreur lors de la suppression du message:', err);
        }
    };

    // ✅ Envoi de message via API (WebSocket gérera la diffusion)
    const handleTyping = (e) => {
        setNewMessage(e.target.value);

        if (!socketRef.current || !selectedConversation) return;

        // Émettre l'événement de frappe
        socketRef.current.emit('typing:start', selectedConversation.id);

        // Arrêter après 2 secondes d'inactivité
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            socketRef.current.emit('typing:stop', selectedConversation.id);
        }, 2000);
    };

    // NOUVELLE FONCTION pour sélectionner et marquer comme lu immédiatement
    const handleSelectConversation = async (conv) => {
        let updatedConv = conv;

        if (conv.unreadCount > 0) {
            try {
                const res = await fetch(`http://localhost:8000/api/conversations/${conv.id}/read`, {
                    method: 'PATCH',
                    headers: { Authorization: `Bearer ${jwt}` },
                });

                if (res.ok) {
                    // Mettre à jour le state local
                    setConversations(prev =>
                        prev.map(c =>
                            c.id === conv.id ? { ...c, unreadCount: 0 } : c
                        )
                    );

                    // Recharger la conversation mise à jour
                    updatedConv = { ...conv, unreadCount: 0 };
                }
            } catch (err) {
                console.error('Erreur lors du marquage comme lu:', err);
            }
        }

        setSelectedConversation(updatedConv);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(
                `http://localhost:8000/api/conversations/${selectedConversation.id}/messages/image`,
                {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${jwt}` },
                    body: formData
                }
            );

            if (res.ok) {
                // Le message sera ajouté via WebSocket
                console.log('✅ Image envoyée avec succès');
            }
        } catch (err) {
            console.error('Erreur lors de l\'upload:', err);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const filteredConversations = conversations.filter(conv =>
        conv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.participants?.some(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const startEditingMessage = (msg) => {
        setEditingMessage(msg.id);
        setEditingContent(msg.content);
        setMessageMenuId(null); // ferme le menu automatiquement 💥
    };

    const saveEditedMessage = async () => {
        if (!editingContent.trim()) return;

        try {
            await fetch(`http://localhost:8000/api/messages/${editingMessage}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${jwt}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: editingContent })
            });

            // Mets à jour la liste localement (super important !)
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === editingMessage
                        ? { ...m, content: editingContent, editedAt: new Date() }
                        : m
                )
            );

            setEditingMessage(null);
            setEditingContent("");

        } catch (error) {
            console.error("Erreur update :", error);
        }
    };

    useEffect(() => {
        function handleClickOutside(e) {
            if (
                messageMenuRef.current &&
                !messageMenuRef.current.contains(e.target)
            ) {
                setMessageMenuId(null); // ferme le menu 🎉
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="flex h-screen bg-transparent overflow-hidden pt-1">
            {/* Sidebar Conversations */}
            <div className={`${selectedConversation ? 'hidden lg:flex' : 'flex'} w-full lg:w-96 bg-transparent flex-col border-r border-gray-200 shadow-sm`}>
                {/* Header */}
                <div className="p-4 md:p-6  border-b border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            Messages
                        </h1>
                        <button
                            onClick={() => setShowUserSearch(!showUserSearch)}
                            className="p-2.5 hover:bg-gray-100 rounded-full transition duration-200 hover:scale-110"
                            title="Nouveau message"
                        >
                            <Plus size={24} className="text-gray-700" strokeWidth={3} />
                        </button>
                    </div>

                    {!showUserSearch && (
                        <div className="relative group">
                            <Search size={18} className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-purple-600 transition" />
                            <input
                                type="text"
                                placeholder="Chercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:bg-gray-50 focus:ring-2 focus:ring-purple-500/30 transition"
                            />
                        </div>
                    )}
                </div>

                {/* User Search Panel */}
                {showUserSearch && (
                    <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-gray-900">Nouveau message</h2>
                            <button
                                onClick={() => {
                                    setShowUserSearch(false);
                                    setSearchUserQuery('');
                                    setSearchedUsers([]);
                                }}
                                className="p-1.5 hover:bg-gray-300 rounded-full transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="relative group">
                            <Search size={18} className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-purple-600 transition" />
                            <input
                                type="text"
                                placeholder="Chercher un utilisateur..."
                                value={searchUserQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                autoFocus
                                className="w-full pl-11 pr-4 py-3 bg-white rounded-full text-sm focus:outline-none border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition"
                            />
                        </div>

                        <div className="mt-4 max-h-80 overflow-y-auto space-y-1">
                            {searchingUsers && (
                                <div className="p-4 text-center text-gray-500">
                                    <p className="text-sm">Recherche en cours...</p>
                                </div>
                            )}

                            {!searchingUsers && searchUserQuery && searchedUsers.length === 0 && (
                                <div className="p-4 text-center text-gray-500">
                                    <p className="text-sm">Aucun utilisateur trouvé</p>
                                </div>
                            )}

                            {searchedUsers.map(user => (
                                <button
                                    key={user.id}
                                    onClick={() => startConversation(user.id)}
                                    className="w-full p-3 flex items-center gap-3 hover:bg-gray-100 transition duration-150 text-left rounded-xl group"
                                >
                                    <Avatar user={user} size="12" showOnlineStatus={user.isOnline} />

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 text-sm">{user.name}</h3>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>

                                    <div className="text-gray-300 group-hover:text-purple-600 transition">→</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    {filteredConversations.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 mt-12">
                            <p className="text-base font-semibold text-gray-600">Aucune conversation</p>
                            <p className="text-sm mt-2 text-gray-400">Commencez à discuter</p>
                        </div>
                    ) : (
                        filteredConversations.map(conv => {

                            // On récupère l'autre participant (celui qui n'est pas l'utilisateur courant)
                            const otherUser = conv.participants.find(p => p.id !== currentUser.id);
                            // console.log('Autre utilisateur:', otherUser);

                            // Vérifie si l'autre participant est en ligne via le map d'utilisateurs connectés
                            const isOnline = otherUser ? onlineUsers.has(otherUser.id) : false;
                            // console.log('en ligne:', isOnline);

                            return (
                                <div key={conv.id} className="group relative mx-3 my-1.5">
                                    <button
                                        onClick={() => handleSelectConversation(conv)}
                                        className={`w-full p-2 flex items-center gap-2 transition duration-150 text-left rounded-4
                                            ${selectedConversation?.id === conv.id ? 'bg-purple-100' : 'hover:bg-gray-100'}
                                            ${conv.unreadCount > 0 ? "font-bold" : "font-normal"}
                                        `}
                                    >
                                        {/* Avatar avec statut en ligne */}
                                        <Avatar user={otherUser} size="14" showOnlineStatus={isOnline} />

                                        <div className="flex-1 min-w-0">
                                            <h4 className="truncate text-sm text-gray-900">
                                                {conv.name}
                                            </h4>

                                            <p className="text-xs mt-0.5 truncate text-gray-600">
                                                {conv.lastMessage?.content ? (
                                                    <>
                                                        <span>
                                                            {Number(conv.lastMessage.senderId) === Number(currentUser.id)
                                                                ? "Vous"
                                                                : conv.lastMessage.senderName
                                                            }
                                                        </span>
                                                        : {conv.lastMessage.content.substring(0, 25)}...
                                                    </>
                                                ) : (
                                                    "Dites Bonjour👋"
                                                )}
                                            </p>
                                        </div>

                                        <div className="flex flex-col items-end justify-center flex-shrink-0 gap-1">
                                            {/* Heure du dernier message */}
                                            <span className="text-xs text-gray-500">
                                                {conv.lastMessage?.createdAt
                                                    ? new Date(conv.lastMessage.createdAt).toLocaleTimeString("fr-FR", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })
                                                    : ""
                                                }
                                            </span>

                                            {/* Petit point non lu */}
                                            {conv.unreadCount > 0 && (
                                                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                                            )}

                                            {/* Badge non lu */}
                                            {conv.unreadCount > 0 && (
                                                <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
                                                    {conv.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>

            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-transparent">
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b fixed border-gray-100 flex items-center justify-between bg-transparent sticky top-0 z-10 shadow-sm">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedConversation(null)}
                                    className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition"
                                >
                                    <ChevronLeft size={12} />
                                </button>
                                <Avatar user={selectedConversation.participants[0]} size="12" showOnlineStatus={isParticipantOnline} />
                                <div>
                                    <h2 className="font-bold text-gray-900 text-base">
                                        {selectedConversation.name}
                                    </h2>
                                    {/* <p className={`text-xs font-medium ${isTyping ? 'text-purple-600' : isParticipantOnline ? 'text-green-600' : 'text-gray-500'}`}>
                                        {isTyping ? '✍️ En train d\'écrire...' : isParticipantOnline ? 'En ligne' : 'Hors ligne'}
                                    </p> */}
                                    <p className={`text-xs font-medium ${
                                        isTyping ? "text-purple-600" : isParticipantOnline ? "text-green-600" : "text-gray-500"
                                    }`}> 
                                        {isTyping ? "✍️ En train d'écrire..." : isParticipantOnline ? "En ligne" : "Hors ligne"} 
                                    </p>

                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {/* <button className="p-2.5 hover:bg-gray-100 rounded-full transition duration-200 hover:scale-110">
                                    <Phone size={20} className="text-gray-600" />
                                </button>
                                <button className="p-2.5 hover:bg-gray-100 rounded-full transition duration-200 hover:scale-110">
                                    <Video size={20} className="text-gray-600" />
                                </button> */}
                                <button className="p-2.5 hover:bg-gray-100 rounded-full transition duration-200 hover:scale-110">
                                    <MoreVertical size={20} className="text-gray-600" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent scrollbar-hide">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-200 to-blue-200 flex items-center justify-center">
                                        <Smile size={32} className="text-purple-600" />
                                    </div>
                                    <p className="font-semibold text-gray-600">Démarrez la conversation!</p>
                                    <p className="text-sm text-gray-500">Dites bonjour 👋</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => (
                                    <div
                                        key={msg.id}
                                        className={`flex gap-3 group ${msg.isOwn ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
                                        onClick={() => !msg.isOwn && !msg.isRead && markMessageAsRead(msg.id)}
                                        onMouseEnter={() => setHoveredMessageId(msg.id)}
                                        onMouseLeave={() => setHoveredMessageId(null)}
                                    >
                                        {/* Indicateur visuel de non-lu dans le chat SUPPRIMÉ */}
                                        
                                        {!msg.isOwn && (
                                            <div className="w-8 h-8 flex-shrink-0">
                                                <Avatar user={selectedConversation.participants[0]} size="8" showOnlineStatus={false} />
                                            </div>
                                        )}
                                        
                                        <div className="relative max-w-ws">
                                           <div
                                                className={`px-3 py-1.5 rounded-4 shadow-sm transition hover:shadow-md
                                                ${msg.isOwn
                                                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-br-none'
                                                      : 'bg-gray-100 text-gray-900 rounded-bl-none'
                                                  }`}
                                                  >

                                                {msg.image ? (
                                                    <img
                                                        src={`http://localhost:8000${msg.image}`}
                                                        alt="Message image"
                                                        className="max-w-xs rounded-lg"
                                                    />
                                                ) : (
                                                    <p className="text-sm break-words leading-relaxed">{msg.content}</p>
                                                )}
                                                <p
                                                    className={`text-xs mt-1 left-2 opacity-50 ${
                                                        msg.isOwn ? 'text-blue-100' : 'text-gray-600'
                                                    }`}
                                                >
                                                    {new Date(msg.createdAt).toLocaleTimeString('fr-FR', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </p>
                                            </div>

                                            {msg.isOwn && hoveredMessageId === msg.id && (
                                                <div className="absolute -left-10 top-2 flex items-center gap-2">
                                                    <button
                                                        onClick={() => setMessageMenuId(messageMenuId === msg.id ? null : msg.id)}
                                                        className="p-1.5 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-full transition hover:scale-110"
                                                        title="Options"
                                                    >
                                                        <MoreVertical size={14} />
                                                    </button>
                                                </div>
                                            )}

                                            {messageMenuId === msg.id && msg.isOwn && (
                                                <div ref={messageMenuRef} className="absolute -left-20 top-0 bg-white border border-gray-200 rounded-xl shadow-lg p-2 z-50 animate-in fade-in zoom-in-95">
                                                    <button
                                                        onClick={() => deleteMessage(msg.id)}
                                                        className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition text-sm whitespace-nowrap"
                                                    >
                                                        <Trash2 size={16} />
                                                        Supprimer
                                                    </button>

                                                    <button
                                                        className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-gray-100 rounded-lg w-full"
                                                        onClick={() => startEditingMessage(msg)}
                                                    >
                                                        <Edit size={16} />
                                                        Modifier
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-gray-100 bg-transparent">
                            <div className="flex items-end gap-3 relative">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2.5 hover:bg-gray-100 rounded-full transition duration-200 hover:scale-110 flex-shrink-0"
                                >
                                    <Paperclip size={20} className="text-gray-600" />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />

                                <div className="flex-1 flex items-end gap-2 bg-gray-100 rounded-full px-4 py-2.5 focus-within:ring-2 focus-within:ring-purple-500/30 transition">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={handleTyping}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Aa"
                                        className="flex-1 bg-transparent focus:outline-none text-sm placeholder:text-gray-400"
                                    />
                                    <div className="relative" ref={emojiPickerRef}>
                                        <button
                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                            className="p-1 hover:bg-gray-200 rounded-full transition"
                                        >
                                            <Smile size={20} className="text-gray-600" />
                                        </button>

                                        {showEmojiPicker && (
                                            <div className="absolute bottom-12 right-0 z-50 animate-in fade-in zoom-in-95">
                                                <div className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
                                                    <div className="grid grid-cols-8 gap-1 p-3 w-80 max-h-64 overflow-y-auto">
                                                        {['😊', '😂', '❤️', '😍', '🎉', '🔥', '👍', '✨', '😭', '😤', '🤔', '😎', '🥳', '😘', '👏', '🎊', '💯', '🌟'].map((emoji, idx) => (
                                                            <button
                                                                key={idx}
                                                                onClick={() => {
                                                                    setNewMessage(newMessage + emoji);
                                                                    setShowEmojiPicker(false);
                                                                }}
                                                                className="hover:bg-gray-100 p-2 rounded-lg transition text-xl hover:scale-125"
                                                            >
                                                                {emoji}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={sendMessage}
                                    disabled={!newMessage.trim()}
                                    className="p-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-4 transition duration-200 hover:scale-110 flex-shrink-0 shadow-md hover:shadow-lg disabled:shadow-none"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="hidden lg:flex flex-1 items-center justify-center text-gray-400 flex-col gap-4">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-200 to-blue-200 flex items-center justify-center">
                            <Users size={48} className="text-purple-600" />
                        </div>
                        <p className="text-xl font-semibold text-gray-600">Sélectionnez une conversation</p>
                        <p className="text-base text-gray-500">Choisissez un ami pour commencer à discuter</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessengerApp;