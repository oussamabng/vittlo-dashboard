import React from "react";
import { Outlet } from "react-router-dom";
import { SideBar } from "./components/SideBar";
import { AppShell, Loader } from "@mantine/core";
import HeaderWithSearch from "./components/Header";

import { useAuth } from "./hooks";
import { useNavigate } from "react-router-dom";

function App() {
  const token = useAuth();
  const navigate = useNavigate();

  const [permissions, setPermissions] = React.useState(false);
  React.useEffect(() => {
    if (token !== null) {
      if (token === "expired") {
        navigate("/login");
      } else {
        setPermissions(true);
      }
    }
  }, [token]);

  if (!permissions)
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Loader size="sm" color="blue" />
      </div>
    );

  if (permissions)
    return (
      <>
        <AppShell
          fixed
          navbar={
            <SideBar
              width={{ base: 250, breakpoints: { sm: "100%", md: 275 } }}
              padding="xs"
            />
          }
          header={<HeaderWithSearch />}
        >
          <Outlet />
        </AppShell>
      </>
    );
}

export default App;
