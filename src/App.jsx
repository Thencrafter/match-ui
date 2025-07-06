import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [potentialMatches, setPotentialMatches] = useState({});
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [newPersonData, setNewPersonData] = useState('');

  // Fetch all users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/users/${searchTerm}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleFindMatch = async (userName) => {
    try {
      const response = await fetch(`http://localhost:5000/api/find_match/${userName}`);
      const data = await response.json();
      setPotentialMatches(prev => ({
        ...prev,
        [userName]: data
      }));
    } catch (error) {
      console.error('Error finding matches:', error);
    }
  };

  const handleCreateMatch = async (user1, user2) => {
    try {
      request = await fetch(`http://localhost:5000/api/find_match?user1=${user1}&user2=${user2}`, {
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

  const handleRemoveMatch = async (userName) => {
    try {
      await fetch(`http://localhost:5000/api/delete_match/${userName}`, {
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
      const response = await axios.post('http://localhost:5000/api/users', {
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
            onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>Search</button>
          <button onClick={() => setShowAddPerson(!showAddPerson)}>Add Person</button>
        </div>

        {showAddPerson && (
          <div className="add-person-container">
            <textarea
              placeholder="Enter person data in the format: [Name], [Age], [TimeZone], etc."
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
                    <p>Match Preference: {user.Match}</p>
                    {user.Matched && (
                      <p>Matched with: {user.MatchedWith}</p>
                    )}
                  </div>
                  <div className="user-actions">
                    {!user.Matched ? (
                      <>
                        <button onClick={() => handleFindMatch(user.Name)}>
                          Find Matches
                        </button>
                        {potentialMatches[user.Name] && (
                          <div className="potential-matches">
                            <h4>Potential Matches for {user.Name}:</h4>
                            <ul>
                              {potentialMatches[user.Name].map((match) => (
                                <li key={match.Name}>
                                  {match.Name}
                                  <button onClick={() => handleCreateMatch(user.Name, match.Name)}>
                                    Match
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    ) : (
                      <button onClick={() => handleRemoveMatch(user.Name)}>
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