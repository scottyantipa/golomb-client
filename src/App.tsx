import React, { useEffect } from 'react';

const SERVER_HOST = 'localhost';
const SERVER_PORT = '8080';
const SERVER_URL = `http://${SERVER_HOST}:${SERVER_PORT}`;

const App: React.SFC = () => {
  useEffect(
    () => {
      const socket = new WebSocket(`ws://${SERVER_HOST}:${SERVER_PORT}/ws`);
      socket.addEventListener('message', (evt) => {
        console.log('message: ', evt.data);
      });
      return () => socket.close();
    },
    []
  );
  return (
    <div>
      <button onClick={() => {
        fetch(`${SERVER_URL}/solve`);
      }}>
        Solve
      </button>
    </div>
  )
}

export default App;
