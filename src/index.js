import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

ReactDOM.render(
  <React.StrictMode>
    <div className="container">
      <p>
        Make sure your wordle results are in your clipboard, then click the
        "paste wordle" button. Or use the provided link to open a textbox that
        you can copy and paste into manually.
      </p>
      <p>
        Type things in the textboxes next to the emoji to change your results.
      </p>
      <App />
    </div>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
