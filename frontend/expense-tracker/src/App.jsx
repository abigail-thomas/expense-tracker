import React from 'react'

import {
  BrowserRouter as Router, Routes, Route, Navigate,
} from "react-router-dom";

import Login from "./pages/Auth/Login";
import SignUp from "./pages/Auth/SignUp";
import Home from "./pages/Dashboard/Home";
import Income from "./pages/Dashboard/Income";
import Expense from "./pages/Dashboard/Expense";




const App = () => {
  return (
    <div className=''>
      <Router>
        <Routes>
          <Route path="/" element={<Root/>}/>
          <Route path="/Login"exact element={<Login/>}/>
          <Route path="/signUp"exact element={<SignUp/>}/>
          <Route path="/dashboard"exact element={<Home/>}/>
          <Route path="/income"exact element={<Income/>}/>
          <Route path="/expense"exact element={<Expense/>}/>
        </Routes>
      </Router>
    </div>
  )

}

export default App

const Root = () => {
  // check if the token exists in localStorage
  const isAuthenticated = !!localStorage.getItem("token");

  // redirect to dashboard if auth, else to login
  return isAuthenticated ? (
    <Navigate to="/dashboard" />
  ) : (
    <Navigate to="login" />
  );
};

