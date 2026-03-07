import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Index from "./pages/Index";
import Professional from "./pages/Professional";
import Admin from "./pages/Admin";
import Login from "./pages/Login";

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/professional" element={<Professional />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
