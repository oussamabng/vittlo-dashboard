import { useState } from "react";
import {
  createStyles,
  Table,
  Timeline,
  ScrollArea,
  Group,
  Badge,
  Text,
  rem,
  Pagination,
  NativeSelect,
  Modal,
  Button,
} from "@mantine/core";
import { IconEye, IconTruckDelivery } from "@tabler/icons-react";
import { ActionIcon } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { nprogress } from "@mantine/nprogress";
import moment from "moment/moment";
import { useAuth } from "../hooks";

import { client } from "../graphql";
import { UPDATE_STATUS_DELIVERY } from "../graphql/mutations";
import { GET_TRACKING_ORDER } from "../graphql/queries";

export function convertUnderscoreToSpace(str) {
  return str.replace(/_/g, " ");
}
export function getDistanceValue(distance) {
  switch (distance) {
    case "SHORT_DISTANCE":
      return 400;
    case "MEDIUM_DISTANCE":
      return 500;
    case "LONG_DISTANCE":
      return 650;
    case "EXPRESS":
      return 750;
    default:
      return "/";
  }
}

export function descriptionTracking(status) {
  switch (status) {
    case "PENDING":
      return "The order was created by the admin.";
    case "IN_PROGRESS":
      return "The order was assigned to a mission for delivery.";
    case "OUT_FOR_DELIVERY":
      return "The order was taken by a delivery person who will start the trip.";
    case "DELIVERED":
      return "The order was successfully delivered to the shipping address.";
    case "CANCELLED":
      return "The order was cancelled by the admin.";
    default:
      return "";
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

export default function OrderTable({
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
  const [dataTracking, setDataTracking] = useState(null);
  const LIMIT = 5;

  const [openedTracking, { open: openTracking, close: closeTracking }] =
    useDisclosure(false);

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

  const fetchTrackingOrder = async (orderId) => {
    const { data } = await client.query({
      query: GET_TRACKING_ORDER,
      context: { accessToken: token },
      variables: {
        orderId: parseInt(orderId),
      },
    });
    setDataTracking(data?.orderTracking);
    openTracking();
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
          <Badge
            color={`${
              item?.status === "DELIVERED"
                ? "green"
                : item?.status === "PENDING"
                ? "orange"
                : "red"
            }`}
          >
            {item.status === "IN_PROGRESS"
              ? "IN PROGRESS"
              : item.status === "OUT_FOR_DELIVERY"
              ? "OUT FOR DELIVERY"
              : item.status}
          </Badge>
        </td>
        <td>{item.shippingAddress ?? "/"}</td>

        <td className="font-bold">{getDistanceValue(item?.deliveryFees)} DA</td>
        <td className="flex gap-2 items-center">
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
          <ActionIcon className="cursor-pointer">
            <IconTruckDelivery
              color="red"
              size={20}
              onClick={() => {
                fetchTrackingOrder(item?.id);
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
      <Modal
        centered
        opened={openedTracking}
        p="md"
        onClose={() => {
          setDataTracking(null);
          closeTracking();
        }}
        title="Order Tracking"
      >
        <Timeline
          py={10}
          active={dataTracking?.length - 1}
          bulletSize={16}
          lineWidth={2}
        >
          {dataTracking?.map((data, index) => (
            <Timeline.Item
              key={index}
              title={convertUnderscoreToSpace(data?.status)}
            >
              <Text color="dimmed" size="sm">
                {descriptionTracking(data?.status)}
              </Text>
              <Text size="xs" mt={4}>
                {moment(data?.createdAt).format("lll")}
              </Text>
            </Timeline.Item>
          ))}
        </Timeline>
      </Modal>
      <Table miw={800} verticalSpacing="sm">
        <thead>
          <tr>
            <th style={{ width: rem(40) }}></th>
            <th>Product</th>
            <th>Status</th>
            <th>Shipping Adress</th>
            <th>Shipping Fees</th>
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
