import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ToastContainer } from 'react-toastify';
import reportWebVitals from './reportWebVitals';
import './CSS/index.css';
import Sidebar from './Sidebar';
import 'bootstrap/dist/css/bootstrap.min.css';
import './CSS/table.css';
import './CSS/modal.css';
import './CSS/contextmenu.css';
import { BrowserRouter } from "react-router-dom";
import AppRoutes from './routes/AppRoutes';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <Sidebar />
      <AppRoutes />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
  </BrowserRouter>
);

reportWebVitals();
