import { createBrowserRouter } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Admin from "./pages/Admin";

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Dashboard />,
    },
    {
      path: "/login/",
      element: <Login />,
    },
    {
      path: "/admin/",
      element: <Admin />,
    },
  ],
  { basename: import.meta.env.BASE_URL }
);
