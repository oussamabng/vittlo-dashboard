import React from "react";
import {
  Paper,
  createStyles,
  TextInput,
  PasswordInput,
  Checkbox,
  Button,
  Title,
  rem,
  Loader,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useNavigate } from "react-router-dom";
import { notifications } from "@mantine/notifications";

import { useAuth } from "../hooks";

import { useAuthStore } from "../store";

import { nprogress } from "@mantine/nprogress";

import { client } from "../graphql";
import { LOGIN_ADMIN } from "../graphql/mutations";

const useStyles = createStyles((theme) => ({
  wrapper: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#4E5AEC",
  },
  loader: {
    width: "100%",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  form: {
    borderRight: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.gray[3]
    }`,
    width: rem(450),
    paddingTop: rem(80),

    [theme.fn.smallerThan("sm")]: {
      maxWidth: "100%",
    },
  },

  title: {
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    fontSize: 22,
  },
}));

export default function AuthenticationImage() {
  const navigate = useNavigate();
  const token = useAuth();

  const { loginUser } = useAuthStore((state) => ({
    loginUser: state.loginUser,
  }));

  const form = useForm({
    initialValues: {
      email: "admin@vittlo.com",
      password: "password",
      keepLoggedIn: true,
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) => (value === "" ? "Field required" : null),
    },
  });
  const [loadingBtn, setLoading] = React.useState(false);
  const [permissions, setPermissions] = React.useState(false);

  const { classes } = useStyles();

  React.useEffect(() => {
    if (token !== null) {
      if (token === "expired") {
        setPermissions(true);
      } else {
        navigate("/");
      }
    }
  }, [token]);

  const handleLogin = async ({ email, password }) => {
    try {
      setLoading(true);
      nprogress.start();
      const { data } = await client.mutate({
        mutation: LOGIN_ADMIN,
        variables: {
          input: {
            email,
            password,
          },
        },
      });
      loginUser(data?.loginAdmin.refresh_token, data?.loginAdmin.access_token);
      setLoading(false);
      nprogress.complete();
      navigate("/");
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Wrong Credentials 🤥",
        color: "red",
      });
      setLoading(false);
      nprogress.complete();
      console.log(error.message);
    }
  };

  if (!permissions)
    return (
      <div className={classes.loader}>
        <Loader size="sm" color="blue" />
      </div>
    );

  if (permissions)
    return (
      <div className={classes.wrapper}>
        <Paper className={classes.form} radius={0} p={30}>
          <div className="flex flex-col items-center gap-2 justify-center">
            {" "}
            <img src="/logo.svg" alt="logo" />
            <Title
              order={2}
              className={classes.title}
              ta="center"
              fz={16}
              mt="sm"
              mb={50}
            >
              Vittlo Dashboard - Panel
            </Title>
          </div>

          <form onSubmit={form.onSubmit((values) => handleLogin(values))}>
            <TextInput
              label="Email address"
              placeholder="hello@gmail.com"
              size="sm"
              {...form.getInputProps("email")}
            />
            <PasswordInput
              label="Password"
              placeholder="Your password"
              mt="md"
              size="sm"
              sx={{
                label: {
                  fontSize: "14px",
                },
              }}
              {...form.getInputProps("password")}
            />
            {/* <Checkbox
              label="Keep me logged in"
              mt="xl"
              size="xs"
              {...form.getInputProps("keepLoggedIn")}
            /> */}
            <Button
              className="bg-[#4E5AEC]"
              variant="filled"
              color="#4E5AEC"
              fullWidth
              mt="xl"
              size="sm"
              type="submit"
            >
              {loadingBtn ? "Loading.." : "Login"}
            </Button>
          </form>
        </Paper>
      </div>
    );
}
