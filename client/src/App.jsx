import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";

import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

import CreateTrip from "./pages/trips/CreateTrip";
import TripDetails from "./pages/trips/TripDetails";

import DestinationExplorer from "./pages/trips/DestinationExplorer";

import StateExplorer from "./pages/destinations/StateExplorer";
import StateDestinations from "./pages/destinations/StateDestinations";
import SavedDestinations from "./pages/destinations/SavedDestinations";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-trip" element={<CreateTrip />} />
          <Route path="/trips/:tripId" element={<TripDetails />} />
          <Route path="/explore" element={<DestinationExplorer />} />
          <Route path="/destinations" element={<StateExplorer />} />
          <Route path="/destinations/:state" element={<StateDestinations />} />
          <Route path="/saved-destinations" element={<SavedDestinations />}/>
        </Route>

        {/* Default route */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;

