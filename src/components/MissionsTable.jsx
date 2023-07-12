import { useEffect, useState } from "react";
import {
  createStyles,
  Table,
  Checkbox,
  ScrollArea,
  Group,
  Badge,
  Text,
  rem,
  Pagination,
  Box,
  NativeSelect,
  Modal,
  Button,
} from "@mantine/core";
import { IconEye } from "@tabler/icons-react";
import { ActionIcon } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { nprogress } from "@mantine/nprogress";

import { useAuth } from "../hooks";

import { client } from "../graphql";
import { UPDATE_STATUS_DELIVERY } from "../graphql/mutations";

export function getDistanceValue(distance) {
  switch (distance) {
    case "SHORT_DISTANCE":
      return 400;
    case "MEDIUM_DISTANCE":
      return 600;
    case "LONG_DISTANCE":
      return 700;
    case "EXPRESS":
      return 800;
    default:
      return "/";
  }
}

const useStyles = createStyles((theme) => ({
  rowSelected: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.fn.rgba(theme.colors[theme.primaryColor][7], 0.2)
        : theme.colors[theme.primaryColor][0],
  },
}));

export default function MissionsTable({
  data,
  currentPage,
  setCurrentPage,
  totalPages,
  refetch,
  loading,
  totalCount,
}) {
  const { classes, cx } = useStyles();
  const [openedInfo, { open: openInfo, close: closeInfo }] =
    useDisclosure(false);
  const [selection, setSelection] = useState(["1"]);
  const [opened, { open, close }] = useDisclosure(false);
  const [userSelected, setUserSelected] = useState(null);
  const [userStatus, setUserStatus] = useState(null);
  const [btnLoading, setBtnLoading] = useState(false);
  const LIMIT = 5;

  const token = useAuth();

  const handleUpdateDelivery = async () => {
    try {
      setBtnLoading(true);
      nprogress.start();

      await client.mutate({
        mutation: UPDATE_STATUS_DELIVERY,
        variables: {
          userId: parseFloat(userSelected?.id),
          status: userStatus,
        },
        context: { accessToken: token },
      });

      setBtnLoading(false);
      nprogress.complete();
      setUserSelected(null);
      setUserStatus(null);
      await refetch();
      close();
    } catch (error) {
      setBtnLoading(false);
      nprogress.complete();
      setUserSelected(null);
      setUserStatus(null);
      alert("something wrong happened");
    }
  };

  const rows = data?.map((item) => {
    const selected = selection.includes(item.id);
    return (
      <tr key={item.id} className={cx({ [classes.rowSelected]: selected })}>
        <td></td>
        <td>
          <Group spacing="sm">
            <Text size="sm" weight={500}>
              {item.productName}
            </Text>
          </Group>
        </td>
        <td>
          <Box w={80}>
            <Badge
              w={"100%"}
              color={`${
                item?.status === "DELIVERED"
                  ? "green"
                  : item?.status === "PENDING"
                  ? "orange"
                  : "red"
              }`}
            >
              {item.status}
            </Badge>
          </Box>
        </td>
        <td>{item.shippingAddress ?? "/"}</td>

        <td>{item.destinationLat ?? "/"}</td>
        <td>{item.destinationLong ?? "/"}</td>

        <td className="font-bold">5</td>
        <td>
          <ActionIcon className="cursor-pointer">
            <IconEye
              color="green"
              size={20}
              onClick={() => {
                setUserSelected(item);
                openInfo();
              }}
            />
          </ActionIcon>
        </td>
      </tr>
    );
  });

  return (
    <ScrollArea>
      <Modal
        centered
        opened={openedInfo}
        p="md"
        onClose={() => {
          setUserSelected(null);
          closeInfo();
        }}
        title="Order details"
      >
        {" "}
        <div className="flex flex-col gap-2 pt-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Product :</span>
            <span className="text-sm">{userSelected?.productName ?? "/"}</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Product Price :</span>
            <span className="text-sm">{userSelected?.productPrice ?? "/"}</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Tracking Code :</span>
            <span className="text-sm">{userSelected?.trackingCode ?? "/"}</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Status :</span>
            <span className="text-sm">{userSelected?.status ?? "/"}</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Latitude :</span>
            <span className="text-sm">
              {userSelected?.destinationLat ?? "/"}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Longitude :</span>
            <span className="text-sm">
              {userSelected?.destinationLong ?? "/"}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold">
              Delivery man responsible :
            </span>
            <span className="text-sm">
              {userSelected?.delivery?.email ?? "/"}
            </span>
          </div>
        </div>
      </Modal>
      <Modal
        centered
        opened={opened}
        p="md"
        onClose={close}
        title="Update Status"
      >
        <div className="flex flex-col gap-2">
          <NativeSelect
            data={["ACTIVE", "INACTIVE"]}
            label="User status"
            withAsterisk
            defaultValue={
              userSelected?.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
            }
            onChange={(e) => setUserStatus(e.currentTarget.value)}
          />
          <Button
            onClick={handleUpdateDelivery}
            mt={12}
            className="bg-[#4E5AEC]"
            variant="filled"
            color="#4E5AEC"
            size="sm"
          >
            Confirm
          </Button>
        </div>
      </Modal>
      <Table miw={800} verticalSpacing="sm">
        <thead>
          <tr>
            <th style={{ width: rem(40) }}></th>
            <th>Delivery responsible</th>
            <th>Status</th>
            <th>Current Adress</th>
            <th>Current Latitude</th>
            <th>Current Longitude</th>
            <th>Number of orders</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>{rows?.length > 0 ? rows : null}</tbody>
      </Table>
      {rows?.length === 0 && !loading && (
        <div className="w-full  flex justify-center items-center py-2">
          <iframe src="https://embed.lottiefiles.com/animation/102600"></iframe>
        </div>
      )}

      {loading && (
        <div className="w-full  flex justify-center items-center py-2">
          <Loader color="#4E5AEC" variant="bars" />
        </div>
      )}
      {totalCount > LIMIT && (
        <div className="flex justify-center items-center">
          <Pagination
            value={currentPage}
            onChange={setCurrentPage}
            my="md"
            total={totalPages}
          />
        </div>
      )}
    </ScrollArea>
  );
}
