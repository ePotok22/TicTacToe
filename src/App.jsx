import React from "react";
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";

// View
import Board from "./views/Board";

export default function App() {
  return (
    <BrowserRouter>
      <div className="container mx-auto">
        <Routes >
          <Route path="/" element={<Board/>}/>
        </Routes>
      </div>
    </BrowserRouter>
  );
}
