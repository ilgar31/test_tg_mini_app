import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userId = '840033936';


  const fetchChannels = async () => {
    try {
      const response = await fetch(`https://localhost:3001/api/channels/${userId}`);
      
      if (!response.ok) {
        throw new Error('No channels found. Please register.');
      }
      const data = await response.json();
      setChannels(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, [])

  const handleRefresh = () => {
    setLoading(true);
    setError('');
    fetchChannels();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        {error ? (
          <div>
            <p>{error}</p>
            <button onClick={handleRefresh}>Обновить страницу</button>
          </div>
        ) : (
          <ul>
            {channels.map(channel => (
              <li key={channel.id}>
                <a href={channel.link} target="_blank" rel="noopener noreferrer">
                  {channel.title}
                </a>
              </li>
            ))}
          </ul>
        )}
      </header>
    </div>
  );
}

export default App;
