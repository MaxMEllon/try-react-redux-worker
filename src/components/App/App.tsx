import * as React from 'react';
import { Link } from "react-router";
import './App.css';
import logo from './logo.svg';

interface Props {
  increment: any,
  counter: {
    value: number
  }
}

class App extends React.Component<Props> {
  public render() {
    const a = this.props.counter
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React{a && a.value}</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.tsx</code> and save to reload.
        </p>
        <Link to="/page1">goto page1</Link>
        <button onClick={this.props.increment}>increment</button>
      </div>
    );
  }
}

export default App;
