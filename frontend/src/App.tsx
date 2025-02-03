import { Routes, Route } from "react-router-dom";
import HomeScreen from "./Screens/HomeScreen";
import SendScreen from "./Screens/SendScreen";
import ReceivedScreen from "./Screens/ReceivedScreen";
import Navbar from "./components/Navbar";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/send" element={<SendScreen />} />
        <Route path="/receive" element={<ReceivedScreen/>} />
      </Routes>
    </>
  );
}

export default App;
