import { useState } from "react";
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Mountain,
  LayoutDashboard,
  Compass,
  Map,
  Bookmark,
  Plus,
  Menu,
  X,
  MapPin,
  ChevronRight,
} from "lucide-react";

import "./AppLayout.css";

const navigationItems = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Explore",
    path: "/explore",
    icon: Compass,
  },
  {
    title: "Destinations",
    path: "/destinations",
    icon: Map,
  },
  {
    title: "Saved Places",
    path: "/saved-destinations",
    icon: Bookmark,
  },
];

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const getPageTitle = () => {
    const path = location.pathname;

    if (path === "/dashboard") return "Dashboard";
    if (path === "/explore") return "Explore";
    if (path === "/destinations") return "Destinations";
    if (path === "/saved-destinations") return "Saved Places";
    if (path === "/create-trip") return "Plan a Trip";

    if (path.startsWith("/trips/")) return "Trip Details";
    if (path.startsWith("/destination/")) return "Destination Details";
    if (path.startsWith("/destinations/")) return "Explore Region";

    return "TravelMate";
  };

  const pageTitle = getPageTitle();

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="app-layout">

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <button
          className="sidebar-overlay"
          onClick={closeSidebar}
          aria-label="Close navigation"
        />
      )}

      {/* Sidebar */}
      <aside className={`app-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>

        <div className="sidebar-brand">
          <div className="brand-icon">
            <Mountain size={25} />
          </div>

          <div>
            <h2>TravelMate</h2>
            <span>EXPLORE BEYOND</span>
          </div>

          <button
            className="mobile-close-button"
            onClick={closeSidebar}
            aria-label="Close sidebar"
          >
            <X size={21} />
          </button>
        </div>

        <div className="sidebar-section-label">
          MENU
        </div>

        <nav className="sidebar-navigation">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
              >
                <Icon size={19} />
                <span>{item.title}</span>
                {item.path === "/explore" && (
                  <span className="explore-indicator">NEW</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-divider" />

        <div className="sidebar-adventure-card">
          <div className="adventure-card-icon">
            <MapPin size={21} />
          </div>

          <h3>Your next adventure awaits</h3>

          <p>
            Discover new places and create unforgettable journeys.
          </p>

          <button
            onClick={() => {
              navigate("/create-trip");
              closeSidebar();
            }}
          >
            Plan a trip
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="sidebar-footer">
          <span className="footer-dot" />
          Your journey starts here
        </div>

      </aside>

      {/* Main Application */}
      <div className="app-main-wrapper">

        {/* Top Navigation */}
        <header className="app-topbar">

          <div className="topbar-left">
            <button
              className="mobile-menu-button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={23} />
            </button>

            <div className="page-heading">
              <span>YOUR TRAVEL SPACE</span>
              <h1>{pageTitle}</h1>
            </div>
          </div>

          <button
            className="topbar-create-button"
            onClick={() => navigate("/create-trip")}
          >
            <Plus size={18} />
            <span>Plan New Trip</span>
          </button>

        </header>

        {/* Page Content */}
        <main className="app-main">
          <Outlet />
        </main>

      </div>
    </div>
  );
}

export default AppLayout;
