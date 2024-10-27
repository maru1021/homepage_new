import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
// import EventBasic from './EventBasic';
// import StateBasic from './StateBasic';
import BookList from './BookList';
import fetchBooks from './books';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
    {/* コメント */}
    {/* <div><EventBasic /></div>
    <div><StateBasic init={0} /></div> */}
    <div><BookList src={fetchBooks} /></div>
  </>
);

reportWebVitals();