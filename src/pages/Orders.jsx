import { useState, useEffect, useRef } from "react";
import OrderTable from "../components/OrderTable";
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
  Select,
  Input,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { nprogress } from "@mantine/nprogress";
import { IMaskInput } from "react-imask";
import * as XLSX from "xlsx";

import { data as wilayaData } from "../../wilaya";

import { useAuth } from "../hooks";

import { client } from "../graphql";
import { GET_ORDERS } from "../graphql/queries";
import { CREATE_ORDER } from "../graphql/mutations/auth.mutation";

const Orders = () => {
  const options = wilayaData.map((wilaya) => ({
    label: wilaya.name,
    value: wilaya.wilayaNumber,
    data: {
      wilayaNumber: wilaya.wilayaNumber,
      lat: wilaya.lat,
      long: wilaya.long,
      name: wilaya.name,
    },
  }));

  const createOrdersFromExcel = async (rows) => {
    setImportLoading(true);
    rows.forEach(async (row) => {
      await client.mutate({
        mutation: CREATE_ORDER,
        variables: {
          input: {
            deliveryFees: row?.deliveryFees,
            destinationLat: parseFloat(row?.destinationLat),
            destinationLong: parseFloat(row?.destinationLong),
            productName: row?.productName,
            productPrice: row?.productPrice,
            shippingAddress: row?.shippingAddress,
            senderFullName: row?.senderFullName,
            senderPhoneNumber: String(row?.senderPhoneNumber),
          },
        },
        context: { accessToken: token },
      });
    });
    setImportLoading(false);
    await refetch();
  };

  const LIMIT = 5;
  const [selectedWilaya, setSelectedWilaya] = useState(1);
  const excelRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [btnLoading, setBtnLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const token = useAuth();
  const [opened, { open, close }] = useDisclosure(false);

  const form = useForm({
    initialValues: {
      productName: "",
      productPrice: 1000,
      deliveryFees: "SHORT_DISTANCE",
      senderFullName: "",
      senderPhoneNumber: "",
    },

    validate: {
      productName: (value) => (value !== "" ? null : "Field required"),
      shippingAddress: (value) => (value !== "" ? null : "Field required"),
      senderFullName: (value) => (value !== "" ? null : "Field required"),
      senderPhoneNumber: (value) => (value !== "" ? null : "Field required"),
    },
  });

  const fetchDeliveryUsers = async () => {
    const { data } = await client.query({
      query: GET_ORDERS,
      fetchPolicy: "no-cache",

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
    productName,
    productPrice,
    senderFullName,
    senderPhoneNumber,
  }) => {
    try {
      setBtnLoading(true);
      nprogress.start();
      const wilaya = wilayaData.find(
        (item) => item.wilayaNumber === selectedWilaya
      );

      const { data } = await client.mutate({
        mutation: CREATE_ORDER,
        variables: {
          input: {
            deliveryFees: wilaya?.deliveryFees,
            destinationLat: wilaya?.lat,
            destinationLong: wilaya?.long,
            productName,
            productPrice,
            shippingAddress: wilaya?.name,
            senderFullName,
            senderPhoneNumber,
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

    setUsers(data?.orders?.items);
    setTotalPages(data?.orders?.totalPages);
    setCurrentPage(data?.orders?.currentPage);
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
                  placeholder="Product"
                  label="Product"
                  withAsterisk
                  {...form.getInputProps("productName")}
                />

                <TextInput
                  placeholder="Sender Full Name"
                  label="Sender Full Name"
                  withAsterisk
                  {...form.getInputProps("senderFullName")}
                />

                <Input.Wrapper
                  id={"phone"}
                  label="Sender Phone number"
                  required
                >
                  <TextInput
                    {...form.getInputProps("senderPhoneNumber")}
                    component={IMaskInput}
                    placeholder="+213 (000) 000000"
                    mask="+213 (000) 000000"
                    id={"phone"}
                  />
                </Input.Wrapper>

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

                <Select
                  label="Shipping Wilaya"
                  placeholder="Wilaya"
                  searchable
                  nothingFound="No options"
                  data={options}
                  onChange={(e) => {
                    setSelectedWilaya(e);
                  }}
                  value={selectedWilaya}
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
                    Last Orders
                  </Text>
                  <Group position="apart">
                    <Text weight={300} size={14} color="#404040">
                      Product, Status,Shipping Adress ...
                    </Text>
                  </Group>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={open}
                      variant="outline"
                      color="#4E5AEC"
                      size="sm"
                    >
                      Create Order
                    </Button>
                  </div>
                  {/*    <Button
                    onClick={() => {
                      excelRef.current.click();
                    }}
                    variant="filled"
                    className="bg-[#0CBF33]"
                    color="#0CBF33"
                    size="sm"
                    w={140}
                  >
                    {importLoading ? (
                      <Loader size="sm" color="white" />
                    ) : (
                      "Import Excel"
                    )}
                  </Button> */}
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
              <OrderTable
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
      <div className="relative">
        <div className="absolute">
          <input
            ref={excelRef}
            type="file"
            accept=".xlsx, .xls"
            className="opacity-0"
            onChange={(e) => {
              e.preventDefault();

              var files = e.target.files,
                f = files[0];
              var reader = new FileReader();
              reader.onload = function (e) {
                var data = e.target.result;
                let readedData = XLSX.read(data, { type: "binary" });
                const wsname = readedData.SheetNames[0];
                const ws = readedData.Sheets[wsname];

                /* Convert array to json*/
                const dataParse = XLSX.utils.sheet_to_json(ws, { header: 0 });
                createOrdersFromExcel(dataParse);
                console.log({ dataParse });
              };
              reader.readAsBinaryString(f);
            }}
          />
        </div>
      </div>
    </Flex>
  );
};

export default Orders;
