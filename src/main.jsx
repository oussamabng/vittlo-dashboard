import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./index.css";
import { MantineProvider } from "@mantine/core";
import Dashboard from "./pages/Dashboard.jsx";
import Orders from "./pages/Orders.jsx";
import Login from "./pages/Login.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";
import { Notifications } from "@mantine/notifications";

//apollo
import { ApolloProvider } from "@apollo/client";
import { client } from "./graphql";

import { NavigationProgress } from "@mantine/nprogress";
import Missions from "./pages/Missions.jsx";
import OrderDetails from "./pages/OrderDetails.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorPage />,
    element: <App />,
    children: [
      {
        path: "/",
        element: <Dashboard />,
      },
      {
        path: "/missions",
        element: <Missions />,
      },
      {
        path: "/orders",
        element: <Orders />,
      },
      {
        path: "/orders/:id",
        element: <OrderDetails />,
      },
    ],
  },
  { path: "/login", element: <Login /> },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <MantineProvider
        theme={{
          colors: {
            busybe: [
              "#F7F7F7",
              "#A6D4EC",
              "#A6D4EC",
              "#18AEF2",
              "#4E5AEC",
              "#4E5AEC",
              "#4E5AEC",
            ],
          },
          primaryColor: "busybe",
        }}
        withGlobalStyles
        withNormalizeCSS
      >
        <NavigationProgress />
        <Notifications position="top-right" />

        <RouterProvider router={router} />
      </MantineProvider>
    </ApolloProvider>
  </React.StrictMode>
);
