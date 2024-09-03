import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userId = '8400339361';


  const fetchChannels = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/channels/${userId}`);
      
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
      <script src="https://telegram.org/js/telegram-web-app.js"></script>
      <script>
          let tg = window.Telegram.WebApp.initData.user.username;
          document.getElementById('root').innerHTML = window.Telegram.WebApp.initData.user.username;
      </script>

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
