import {
  Card,
  Container,
  Flex,
  Group,
  Space,
  Stack,
  Text,
} from "@mantine/core";
import React from "react";

const StatCard = ({ title, subtitle, value, color, isMoney = false }) => {
  return (
    <Card
      shadow="sm"
      padding={"lg"}
      radius={"md"}
      withBorder
      sx={{ height: 150, backgroundColor: color, width: 150 }}
    >
      <Stack justify="space-evenly" align="stretch">
        <Flex direction={"column"}>
          <Group position="center">
            <Text weight={"bold"} size={24} color="white">
              {title}
            </Text>
          </Group>
          <Group position="center">
            <Text weight={300} size={12} color="white">
              {subtitle}
            </Text>
          </Group>
        </Flex>
        <Space h="xl" />
        <Group position="center">
          <Text weight={"bold"} size={24} color="white">
            {value}
            {isMoney && <sup>DA</sup>}
          </Text>
        </Group>
      </Stack>
    </Card>
  );
};

export default StatCard;
