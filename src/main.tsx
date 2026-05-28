
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
  // Load Material Symbols (outlined) font for the Demo 2 / Demo 3 icon set.
  import "react-material-symbols/outlined";

  createRoot(document.getElementById("root")!).render(<App />);
  