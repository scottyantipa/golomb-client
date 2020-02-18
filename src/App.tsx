import React, { useEffect, useState } from 'react';

const SERVER_HOST = 'localhost';
const SERVER_PORT = '8080';
const SERVER_URL = `http://${SERVER_HOST}:${SERVER_PORT}`;

enum SolverStates {
  Searching = 'Searching',
  Idle = 'Idle'
}

const App: React.SFC = () => {
  const [solverState, setSolverState] = useState(SolverStates.Idle);
  const [solution, setSolution] = useState(undefined);
  const [intermediateSolution, setIntermediateSolution] = useState(undefined);
  const [objBound, setObjBound] = useState<Number>(Infinity);
  const [currentVars, setCurrentVars] = useState<String>("n/a");

  useEffect(
    () => {
      const socket = new WebSocket(`ws://${SERVER_HOST}:${SERVER_PORT}/ws`);
      socket.addEventListener('message', (evt) => {
        const eventName = evt.data.split(':')[0];
        const eventData = evt.data.split(':')[1];
        switch (eventName) {
          case 'StartSearch':
            setSolverState(SolverStates.Searching);
            setIntermediateSolution(undefined);
            setSolution(undefined);
            break;
          case 'Periodic':
            setSolverState(SolverStates.Searching);
            setCurrentVars(eventData);
            break;
          case 'ObjBound':
            setObjBound(parseInt(eventData));
            break;
          case 'NewSolution':
            setIntermediateSolution(eventData);
            break;
          case 'EndSearch':
            setSolverState(SolverStates.Idle);
            break;
          case 'Final':
            setSolution(eventData);
            break;
          default:
        }
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
      <br />
      <br />
      <div style={{ whiteSpace: 'pre', margin: 20 }}>
        <div>State:        {solverState}</div>
        <div>Bound:        {objBound}</div>
        <div>Current:      {currentVars}</div>
        <div>Intermediate: {intermediateSolution || "n/a"}</div>
        <div>Final:        {solution || "n/a"}</div>
      </div>
    </div>
  )
}

export default App;
