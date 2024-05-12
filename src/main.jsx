import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SignupForm from "./auth/Signup";
import SigninForm from "./auth/Signin";
import GlobalRoom from "./rooms/GlobalRoom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <SigninForm />,
  },
  {
    path: "/secret-register",
    element: <SignupForm />,
  },
  {
    path: "/global-room",
    element: <GlobalRoom />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <main className="w-full min-h-screen flex items-center justify-center bg-[#f5f5f5]">
      <RouterProvider router={router} />
    </main>
  </React.StrictMode>
);
