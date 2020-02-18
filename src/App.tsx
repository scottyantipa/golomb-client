import React, { useEffect, useState } from 'react';
import './App.css';

const SERVER_HOST = 'localhost';
const SERVER_PORT = '8080';
const SERVER_URL = `http://${SERVER_HOST}:${SERVER_PORT}`;

enum SolverStates {
  Searching = 'Searching',
  Idle = 'Idle'
}

// _TODO_ Detect current state of solver on load.
const App: React.SFC = () => {
  /* Solver Inputs */
  const [timeoutText, setTimeoutText] = useState('30');
  const [orderText, setOrderText] = useState('5');

  /* Solver state */
  const [solverState, setSolverState] = useState(SolverStates.Idle);
  const [solution, setSolution] = useState(undefined);
  const [intermediateSolution, setIntermediateSolution] = useState(undefined);
  const [objBound, setObjBound] = useState<Number>(Infinity);
  const [currentVars, setCurrentVars] = useState<String>("n/a");

  /* UI state showing animated epsilon for search text */
  const [timeElapsed, setTimeElapsed] = useState(0);
  setTimeout(
    () => {
      setTimeElapsed(timeElapsed + 1);
    },
    100
  )

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

  // _TODO_ these should be validators on the input components
  const timeout = parseInt(timeoutText, 10);
  const validatedTimeout = isNaN(timeout) ? 30 : timeout;
  const order = parseInt(orderText, 10);
  const validatedOrder = isNaN(order) ? 5 : order;

  let stateText;
  if (solverState === SolverStates.Searching) {
    const numDots = timeElapsed % 5;
    stateText = "Searching" + (".".repeat(numDots));
  } else if (solverState === SolverStates.Idle) {
    stateText = "Idle"
  }

  return (
    <div>
      <div style={{ margin: '20px 0 0 20px' }}>
        <div>
          <label style={{ marginRight: 15 }}>Timeout (s)</label>
          <input type="number" value={timeoutText} onChange={(e) => setTimeoutText(e.target.value)} />
        </div>
        <div>
          <label style={{ marginRight: 15 }}>Ruler Order</label>
          <input type="number" value={orderText} onChange={(e) => setOrderText(e.target.value)} />
        </div>
        <div>
          <button
            onClick={() => {
              fetch(`${SERVER_URL}/solve?timeout=${validatedTimeout}&order=${validatedOrder}`);
            }}
          >
            Solve
          </button>
        </div>
      </div>
      <table className="results-table">
        <tbody>
          <tr>
            <td>State:</td>
            <td>{stateText}</td>
          </tr>
          <tr>
            <td>Bound:</td>
            <td>{objBound}</td>
          </tr>
          <tr>
            <td>Current:</td>
            <td>{currentVars}</td>
          </tr>
          <tr>
            <td>Intermediate:</td>
            <td>{intermediateSolution || "n/a"}</td>
          </tr>
          <tr>
            <td>Result:</td>
            <td>{solution || "n/a"}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default App;
