import {
  createStyles,
  Header,
  Autocomplete,
  Group,
  Burger,
  rem,
  Code,
  ActionIcon,
  Badge,
  Indicator,
  Menu,
} from "@mantine/core";
import {
  IconBell,
  IconLogout,
  IconMessage,
  IconPlayerPause,
  IconSearch,
  IconSettings,
  IconSwitchHorizontal,
  IconTrash,
  IconHeart,
  IconStar,
  IconAlarm,
  IconCheck,
} from "@tabler/icons-react";
import { useState } from "react";

const useStyles = createStyles((theme) => ({
  header: {
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
    display: "flex",
    alignItems: "center",
    width: "100%",
    justifyContent: "space-between",
  },

  inner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  links: {
    [theme.fn.smallerThan("md")]: {
      display: "none",
    },
  },

  search: {
    [theme.fn.smallerThan("xs")]: {
      display: "none",
    },
  },

  link: {
    display: "block",
    lineHeight: 1,
    padding: `${rem(8)} ${rem(12)}`,
    borderRadius: theme.radius.sm,
    textDecoration: "none",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors.gray[7],
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    },
  },
}));

export default function HeaderWithSearch() {
  const { classes } = useStyles();
  const [userMenuOpened, setUserMenuOpened] = useState(false);

  return (
    <Header height={56} className={classes.header} mb={120}>
      <div className={classes.inner}>
        <img src="/logo.svg" alt="Logo" />
      </div>
      <span className="font-semibold text-[#4E5AEC]">Admin Panel</span>
    </Header>
  );
}
