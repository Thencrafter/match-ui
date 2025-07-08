import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [potentialMatches, setPotentialMatches] = useState({});
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [newPersonData, setNewPersonData] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      if (data.success) {
        setIsAuthenticated(true);
        setError('');
        fetchUsers(); // Load users after successful login
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('https://match-backend-rfu7.onrender.com/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSearch = async (searchedThing) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      const response = await fetch(`https://match-backend-rfu7.onrender.com/api/users/${searchedThing}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleFindMatch = async (userName, id) => {
    try {
      const response = await fetch(`https://match-backend-rfu7.onrender.com/api/find_match/${userName}&${id}`);
      const data = await response.json();
      setPotentialMatches(prev => ({
        ...prev,
        [userName]: data
      }));
    } catch (error) {
      console.error('Error finding matches:', error);
    }
  };

  const handleCreateMatch = async (user1, id1, user2, id2) => {
    try {
      const request = await fetch(`https://match-backend-rfu7.onrender.com/api/find_match/${user1}&${id1}&${user2}&${id2}`, {
        method: 'POST'
      });
      // Refresh the user list to show updated match status
      fetchUsers();
      // Clear the potential matches for the user
      setPotentialMatches(prev => {
        const newState = {...prev};
        delete newState[user1];
        return newState;
      });
    } catch (error) {
      console.error('Error creating match:', error);
    }
  };

  const handleRemoveMatch = async (userName, id) => {
    try {
      const request = await fetch(`https://match-backend-rfu7.onrender.com/api/delete_match/${userName}&${id}`, {
        method: 'POST'
      });
      // Refresh the user list to show updated match status
      fetchUsers();
    } catch (error) {
      console.error('Error removing match:', error);
    }
  };

  const handleAddPerson = async () => {
    try {
      const response = await axios.post('https://match-backend-rfu7.onrender.com/api/users', {
        text: newPersonData,
      });
      setShowAddPerson(false);
      setNewPersonData('');
      fetchUsers();
    } catch (error) {
      console.error('Error adding person:', error);
    }
  };

  const displayUsers = searchTerm ? searchResults : users;

  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <h1>Matchmaking App Login</h1>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Matchmaking App</h1>
        
        <div className="search-container">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyUp={(e) => handleSearch(e.target.value)}
          />
          <button onClick={() => setShowAddPerson(!showAddPerson)}>Add Person</button>
          <button onClick={fetchUsers}>Refresh List</button>
        </div>

        {showAddPerson && (
          <div className="add-person-container">
            <textarea
              placeholder="Do not touch this, I will add people myself. I'll also probably make this automatic later and remove the button"
              value={newPersonData}
              onChange={(e) => setNewPersonData(e.target.value)}
              rows={5}
              cols={50}
            />
            <button onClick={handleAddPerson}>Submit</button>
          </div>
        )}

        <div className="users-container">
          <h2>{searchTerm ? 'Search Results' : 'All Users'}</h2>
          {displayUsers.length === 0 ? (
            <p>No users found</p>
          ) : (
            <ul className="user-list">
              {displayUsers.map((user) => (
                <li key={user.Name} className="user-item">
                  <div className="user-info">
                    <h3>{user.Name}</h3>
                    <p>Age: {user.Age}</p>
                    <p>Timezone: {user.TimeZone}</p>
                    <p>Gender: {user.Gender}</p>
                    <p>Pronouns: {user.Pronouns}</p>
                    <p>Likes: {user.Likes.join(', ')}</p>
                    <p>Extra: {user.Extra}</p>
                    {user.Matched && (
                      <p>Matched with: {user.MatchedWith.Name}</p>
                    )}
                  </div>
                  <div className="user-actions">
                    {!user.Matched ? (
                      <>
                        <button onClick={() => handleFindMatch(user.Name, user.Id)}>
                          Find Matches
                        </button>
                        {potentialMatches[user.Name] && (
                          <div className="potential-matches">
                            <h4>Potential Matches for {user.Name}:</h4>
                            <ul>
                              {potentialMatches[user.Name].map((match) => (
                                <li key={match.Name}>
                                  <div className="match-info">
                                    <p>{match.Name}</p>
                                    <p>{match.Extra}</p>
                                  </div>
                                  <button onClick={() => handleCreateMatch(user.Name, user.Id, match.Name, match.Id)}>
                                    Match
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    ) : (
                      <button onClick={() => handleRemoveMatch(user.Name, user.Id)}>
                        Unmatch
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;