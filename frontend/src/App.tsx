import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) =>{
    e.preventDefault();
    console.log("Email:", email);
    console.log("Password:", password);
  }
  return (
    <div className="App">
      <h1>Spoonfeeder Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input 
          type='email'
          value={email}
          onChange={(e)=>setEmail(e.target.value)} />
        </div>
        <div>
          <label>Password</label>
          <input 
          type='password'
          value={password}
          onChange={(e)=>setPassword(e.target.value)} />
        </div>
        <button type='submit'>Login</button>
      </form>
    </div>
  );
}

export default App;
