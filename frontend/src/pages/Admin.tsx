import { FC, useEffect, useState } from "react";
import {
  Box,
  BoxProps,
  Center,
  chakra,
  Divider,
  HStack,
  IconButton,
  Select,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Footer } from "components/Footer";
import { fetch } from "service/http";
import { useNavigate } from "react-router-dom";
import {
  ArrowPathIcon,
  CheckIcon,
  ClipboardIcon,
} from "@heroicons/react/24/outline";
import { UsersTable } from "../components/UsersTable";
import { User } from "../types/User";

const iconProps = {
  baseStyle: {
    w: 5,
    h: 5,
  },
};
const CopyIcon = chakra(ClipboardIcon, iconProps);
const CopiedIcon = chakra(CheckIcon, iconProps);

type DataRowProps = { fieldName: string } & BoxProps;
const DataRow: FC<DataRowProps> = ({ children, fieldName, ...props }) => (
  <Box
    as="li"
    w="full"
    py={3}
    px={5}
    display="flex"
    alignItems="center"
    justifyContent="space-between"
    _hover={{
      backgroundColor: "#ffffff11",
    }}
    {...props}
  >
    <Text color="brand.dark" fontSize=".7rem">
      {fieldName.toUpperCase()}
    </Text>
    {children}
  </Box>
);

const ReloadIcon = chakra(ArrowPathIcon, iconProps);

interface IMarzbanNode {
  users: {
    total: number;
    users: User[];
  };
}

interface IAdminAPIResponse {
  nodes: Record<string, IMarzbanNode>;
}

export const Admin: FC = () => {
  const [data, setData] = useState<IAdminAPIResponse>();
  const [activeTab, setActiveTab] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [isRefetching, setIsRefetching] = useState(false);

  const refetchUsers = () => {
    setIsRefetching(true);
    fetch("/admin/")
      .then((r) => {
        setData(r);
        const k = Object.keys(r.nodes)[0];
        setActiveTab(k);
      })
      .catch((err) => {
        if (err.status === 403) navigate("/login");
      })
      .finally(() => {
        setIsLoading(false);
        setIsRefetching(false);
      });
  };

  useEffect(() => {
    refetchUsers();
  }, []);

  if (isLoading || !data)
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );

  return (
    <VStack justifyContent="space-between" minH="100vh" p="6">
      <HStack>
        <IconButton
          aria-label="refresh users"
          isDisabled={isRefetching}
          isLoading={isRefetching}
          onClick={refetchUsers}
          variant="outline"
        >
          <ReloadIcon />
        </IconButton>
        <Select
          mb={4}
          maxW={60}
          onChange={(d) => {
            setActiveTab(d.target.value);
          }}
        >
          {Object.keys(data.nodes).map((k) => (
            <option value={k}>{k}</option>
          ))}
        </Select>
      </HStack>
      <Divider pt={4} />
      {data.nodes[activeTab] && (
        <Box w="full" py={4}>
          <UsersTable users={data.nodes[activeTab].users.users} />
        </Box>
      )}
      <Footer />
    </VStack>
  );
};

export default Admin;
