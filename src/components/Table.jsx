import { useEffect, useState } from "react";
import {
  createStyles,
  Table,
  Loader,
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
import { IconEdit, IconEye } from "@tabler/icons-react";
import { ActionIcon } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { nprogress } from "@mantine/nprogress";

import { useAuth } from "../hooks";

import { client } from "../graphql";
import { UPDATE_STATUS_DELIVERY } from "../graphql/mutations";

const useStyles = createStyles((theme) => ({
  rowSelected: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.fn.rgba(theme.colors[theme.primaryColor][7], 0.2)
        : theme.colors[theme.primaryColor][0],
  },
}));

export default function UsersTable({
  data,
  currentPage,
  setCurrentPage,
  totalPages,
  refetch,
  loading,
  totalCount,
}) {
  const LIMIT = 5;

  const { classes, cx } = useStyles();
  const [selection, setSelection] = useState(["1"]);
  const [opened, { open, close }] = useDisclosure(false);
  const [openedInfo, { open: openInfo, close: closeInfo }] =
    useDisclosure(false);
  const [userSelected, setUserSelected] = useState(null);
  const [userStatus, setUserStatus] = useState(null);
  const [btnLoading, setBtnLoading] = useState(false);

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

      await refetch();
      setUserSelected(null);
      setUserStatus(null);
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
              {item.email}
            </Text>
          </Group>
        </td>
        <td>
          <Box w={80}>
            <Badge
              w={"100%"}
              color={`${
                item?.status === "ACTIVE"
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
        <td>{item.licensePlate ?? "/"}</td>
        <td>{item.phoneNumber ?? "/"}</td>
        <td>
          <div className="flex items-center gap-1">
            <ActionIcon className="cursor-pointer">
              <IconEye
                color="#0c6a1d"
                size={20}
                onClick={() => {
                  setUserSelected(item);
                  openInfo();
                  //TODO open details model
                }}
              />
            </ActionIcon>
            <ActionIcon className="cursor-pointer">
              <IconEdit
                color="#228be6"
                size={20}
                onClick={() => {
                  setUserSelected(item);
                  setUserStatus(
                    item?.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
                  );
                  open();
                }}
              />
            </ActionIcon>
          </div>
        </td>
      </tr>
    );
  });

  return (
    <ScrollArea>
      <Modal
        centered
        opened={opened}
        p="md"
        onClose={() => {
          setUserSelected(null);
          close();
        }}
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

      <Modal
        centered
        opened={openedInfo}
        p="md"
        onClose={() => {
          setUserSelected(null);
          closeInfo();
        }}
        title="User info"
      >
        <div className="flex flex-col gap-2 pt-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Email :</span>
            <span className="text-sm">{userSelected?.email}</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold">License Plate :</span>
            <span className="text-sm">{userSelected?.licensePlate ?? "/"}</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Phone Number :</span>
            <span className="text-sm">{userSelected?.phoneNumber ?? "/"}</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Status :</span>
            <span className="text-sm">{userSelected?.status ?? "/"}</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Car Model :</span>
            <span className="text-sm">{userSelected?.carModel ?? "/"}</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Car Color :</span>
            <span className="text-sm">{userSelected?.carColor ?? "/"}</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Adress :</span>
            <span className="text-sm">{userSelected?.adress ?? "/"}</span>
          </div>
        </div>
      </Modal>
      <Table miw={800} verticalSpacing="sm">
        <thead>
          <tr>
            <th style={{ width: rem(40) }}></th>
            <th>Email</th>
            <th>Status</th>
            <th>License Plate</th>
            <th>Phone Number</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
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
