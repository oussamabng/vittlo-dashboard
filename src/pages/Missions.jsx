import { useState, useEffect } from "react";
import MissionsTable from "../components/MissionsTable";
import {
  Button,
  Card,
  Flex,
  Grid,
  Group,
  Text,
  TextInput,
  Modal,
  NumberInput,
  NativeSelect,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { nprogress } from "@mantine/nprogress";

import { useAuth } from "../hooks";

import { client } from "../graphql";
import { GET_ORDERS } from "../graphql/queries";
import { CREATE_ORDER } from "../graphql/mutations/auth.mutation";

const Missions = () => {
  const LIMIT = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [btnLoading, setBtnLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const token = useAuth();
  const [opened, { open, close }] = useDisclosure(false);

  const form = useForm({
    initialValues: {
      productName: "",
      productPrice: 1000,
      shippingAddress: "",
      destinationLong: 0.5,
      destinationLat: 0.5,
      deliveryFees: "SHORT_DISTANCE",
    },

    validate: {
      productName: (value) => (value !== "" ? null : "Field required"),
      shippingAddress: (value) => (value !== "" ? null : "Field required"),
    },
  });

  const fetchDeliveryUsers = async () => {
    const { data } = await client.query({
      query: GET_ORDERS,
      context: { accessToken: token },
      variables: {
        pagination: {
          limit: LIMIT,
          page: currentPage,
        },
        search: {
          keyword,
        },
      },
    });

    setUsers(data?.orders?.items);
    setTotalPages(data?.orders?.totalPages);
    setCurrentPage(data?.orders?.currentPage);
    setTotalCount(data?.orders?.totalCount);
  };

  useEffect(() => {
    fetchDeliveryUsers();
  }, [currentPage]);
  const [keyword, setKeyword] = useState("");
  const [users, setUsers] = useState([]);

  const handleCreateOrder = async ({
    deliveryFees,
    destinationLat,
    destinationLong,
    productName,
    productPrice,
    shippingAddress,
  }) => {
    try {
      setBtnLoading(true);
      nprogress.start();
      const { data } = await client.mutate({
        mutation: CREATE_ORDER,
        variables: {
          input: {
            deliveryFees,
            destinationLat,
            destinationLong,
            productName,
            productPrice,
            shippingAddress,
          },
        },
        context: { accessToken: token },
      });
      setBtnLoading(false);
      nprogress.complete();
      form.reset();
      setKeyword("");
      setCurrentPage(1);
      setUsers((prevState) => [...prevState, data?.createOrder]);
      close();
    } catch (error) {
      setBtnLoading(false);
      nprogress.complete();
      alert("something wrong happened");
    }
  };

  const refetch = async () => {
    const { data } = client.query({
      query: GET_ORDERS,
      context: { accessToken: token },
      variables: {
        pagination: {
          limit: LIMIT,
          page: 1,
        },
        search: {
          keyword: "",
        },
      },
    });

    setUsers(data?.getAllDeliveryUsers?.items);
    setTotalPages(data?.getAllDeliveryUsers?.totalPages);
    setCurrentPage(data?.getAllDeliveryUsers?.currentPage);
    setTotalCount(data?.orders?.totalCount);
  };
  return (
    <Flex direction={"column"}>
      <Grid gutter={"md"}>
        <Grid.Col span={12}>
          <Card shadow="sm" withBorder sx={{ marginTop: 10 }}>
            <Modal
              centered
              opened={opened}
              p="md"
              onClose={close}
              title="Order Creation"
            >
              <form
                onSubmit={form.onSubmit((values) => handleCreateOrder(values))}
                className="flex flex-col gap-2"
              >
                <TextInput
                  placeholder="Product Name"
                  label="Product Name"
                  withAsterisk
                  {...form.getInputProps("productName")}
                />
                <NumberInput
                  placeholder="Product Price"
                  label="Product Price"
                  withAsterisk
                  step={100}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  formatter={(value) =>
                    !Number.isNaN(parseFloat(value))
                      ? `DA ${value}`.replace(
                          /\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g,
                          ","
                        )
                      : "DA "
                  }
                  {...form.getInputProps("productPrice")}
                />
                <TextInput
                  placeholder="Shipping Address"
                  label="Shipping Address"
                  withAsterisk
                  {...form.getInputProps("shippingAddress")}
                />

                <NumberInput
                  placeholder="destination Lat"
                  label="destination Lat"
                  withAsterisk
                  precision={2}
                  step={0.1}
                  {...form.getInputProps("destinationLat")}
                />

                <NumberInput
                  placeholder="destination Long"
                  label="destination Long"
                  withAsterisk
                  precision={2}
                  step={0.1}
                  {...form.getInputProps("destinationLong")}
                />
                <NativeSelect
                  data={[
                    { label: "SHORT DISTANCE", value: "SHORT_DISTANCE" },
                    { label: "MEDIUM DISTANCE", value: "MEDIUM_DISTANCE" },
                    { label: "LONG DISTANCE", value: "LONG_DISTANCE" },
                    { label: "EXPRESS", value: "EXPRESS" },
                  ]}
                  label="User status"
                  withAsterisk
                  {...form.getInputProps("deliveryFees")}
                />
                <Button
                  mt={12}
                  type="submit"
                  className="bg-[#4E5AEC]"
                  variant="filled"
                  color="#4E5AEC"
                  size="sm"
                >
                  {btnLoading ? "Loading.." : "Confirm"}
                </Button>
              </form>
            </Modal>
            <Card.Section p={20}>
              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-2">
                  <Text weight={700} size={24}>
                    Last Missions
                  </Text>
                  <Group position="apart">
                    <Text weight={300} size={14} color="#404040">
                      Delivery, Status, Nb Orders ...
                    </Text>
                  </Group>
                </div>
              </div>
            </Card.Section>
            <Card.Section p={20}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  fetchDeliveryUsers();
                }}
              >
                <TextInput
                  placeholder="Search"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  icon={<IconSearch />}
                  maw={400}
                />
              </form>
            </Card.Section>
            <Card.Section>
              <MissionsTable
                data={users}
                keyword={keyword}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalPages={totalPages}
                refetch={refetch}
                loading={loading}
                totalCount={totalCount}
              />
            </Card.Section>
          </Card>
        </Grid.Col>
      </Grid>
    </Flex>
  );
};

export default Missions;
