import { useState, useEffect } from "react";
import UsersTable from "../components/Table";
import {
  Button,
  Card,
  Flex,
  Grid,
  Group,
  Text,
  TextInput,
  Modal,
  Input,
  PasswordInput,
} from "@mantine/core";
import Papa from "papaparse";

import { IconSearch } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { nprogress } from "@mantine/nprogress";
import { IMaskInput } from "react-imask";

import { useAuth } from "../hooks";

import { client } from "../graphql";
import { GET_DELIVERY_USERS } from "../graphql/queries";
import { CREATE_DELIVERY } from "../graphql/mutations";

const Dashboard = () => {
  const LIMIT = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [btnLoading, setBtnLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const token = useAuth();
  const [opened, { open, close }] = useDisclosure(false);

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
      licensePlate: "",
      phoneNumber: "",
      adress: "",
      carColor: "",
      carModel: "",
      dateOfBirth: null,
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) => (value !== "" ? null : "Field required"),
      licensePlate: (value) => (value !== "" ? null : "Field required"),
      phoneNumber: (value) => (value !== "" ? null : "Field required"),
    },
  });

  const fetchDeliveryUsers = async () => {
    setLoading(true);
    const { data } = await client.query({
      query: GET_DELIVERY_USERS,
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

    setUsers(data?.getAllDeliveryUsers?.items);
    setTotalPages(data?.getAllDeliveryUsers?.totalPages);
    setTotalCount(data?.getAllDeliveryUsers?.totalCount);
    setCurrentPage(data?.getAllDeliveryUsers?.currentPage);

    setLoading(false);
  };

  function handleFileChange(event) {
    const file = event.target.files[0];

    Papa.parse(file, {
      complete: handleFileData,
      header: true,
    });
  }

  function handleFileData(results) {
    const ordersData = results.data;

    console.log(ordersData);
  }

  useEffect(() => {
    fetchDeliveryUsers();
  }, [currentPage]);
  const [keyword, setKeyword] = useState("");
  const [users, setUsers] = useState([]);

  const handleCreateDelivery = async ({
    email,
    password,
    licensePlate,
    phoneNumber,
  }) => {
    try {
      setBtnLoading(true);
      nprogress.start();
      const { data } = await client.mutate({
        mutation: CREATE_DELIVERY,
        variables: {
          input: {
            email,
            password,
            licensePlate,
            phoneNumber,
          },
        },
        context: { accessToken: token },
      });
      setBtnLoading(false);
      nprogress.complete();
      form.reset();
      setKeyword("");
      setCurrentPage(1);
      setUsers((prevState) => [...prevState, data?.createDelivery]);
      close();
    } catch (error) {
      setBtnLoading(false);
      nprogress.complete();
      alert("something wrong happened");
    }
  };

  const refetch = async () => {
    const { data } = client.query({
      query: GET_DELIVERY_USERS,
      context: { accessToken: token },
      fetchPolicy: "no-cache",
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
    setTotalCount(data?.getAllDeliveryUsers?.totalCount);
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
              title="Delivery User Creation"
            >
              <form
                onSubmit={form.onSubmit((values) =>
                  handleCreateDelivery(values)
                )}
                className="flex flex-col gap-2"
              >
                <TextInput
                  placeholder="Email"
                  label="Email"
                  withAsterisk
                  {...form.getInputProps("email")}
                />
                <PasswordInput
                  placeholder="Password"
                  label="Password"
                  {...form.getInputProps("password")}
                />
                <Input.Wrapper id={"phone"} label="Phone number" required>
                  <TextInput
                    {...form.getInputProps("phoneNumber")}
                    component={IMaskInput}
                    placeholder="+213 (000) 000000"
                    mask="+213 (000) 000000"
                    id={"phone"}
                  />
                </Input.Wrapper>

                <Group>
                  <TextInput
                    placeholder="License Plate"
                    label="License Plate"
                    withAsterisk
                    {...form.getInputProps("licensePlate")}
                  />{" "}
                  <TextInput
                    placeholder="Adress"
                    label="Adress"
                    withAsterisk
                    {...form.getInputProps("adress")}
                  />
                </Group>

                <Group>
                  <TextInput
                    placeholder="Car Color"
                    label="Car Color"
                    withAsterisk
                    {...form.getInputProps("carColor")}
                  />

                  <TextInput
                    placeholder="Car Model"
                    label="Car Model"
                    withAsterisk
                    {...form.getInputProps("carModel")}
                  />
                </Group>

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
                    Last Added delivery users
                  </Text>
                  <Group position="apart">
                    <Text weight={300} size={14} color="#404040">
                      Email, Status, License Plate ...
                    </Text>
                  </Group>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={open}
                    variant="outline"
                    color="#4E5AEC"
                    size="sm"
                  >
                    Create Delivery User
                  </Button>
                </div>
              </div>

              {/* <input type="file" onChange={handleFileChange} /> */}
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
              <UsersTable
                data={users}
                setData={setUsers}
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

export default Dashboard;
