import { Routes, Route } from "react-router-dom";
import HomeScreen from "./Screens/HomeScreen";
import SendScreen from "./Screens/SendScreen";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/send" element={<SendScreen />} />
    </Routes>
  );
}

export default App;
