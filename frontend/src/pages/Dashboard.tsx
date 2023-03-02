import { FC, useEffect, useState } from "react";
import {
  Text,
  Box,
  Card,
  CardBody,
  Center,
  Spinner,
  VStack,
  TableProps,
  CardProps,
  BoxProps,
  Tooltip,
  IconButton,
  HStack,
  chakra,
  CardHeader,
} from "@chakra-ui/react";
import { Footer } from "components/Footer";
import { fetch } from "service/http";
import { UsageSlider } from "../components/UsageSlider";
import { User } from "../types/User";
import { useNavigate } from "react-router-dom";
import { UserBadge } from "../components/UserBadge";
import { formatBytes } from "../utils/format";
import CopyToClipboard from "react-copy-to-clipboard";
import { CheckIcon, ClipboardIcon } from "@heroicons/react/24/outline";

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

type UserDataProps = { user: User } & CardProps;
const UserData: FC<UserDataProps> = ({ user, ...props }) => {
  const [copied, setCopied] = useState([-1, false]);

  useEffect(() => {
    if (copied[1]) {
      setTimeout(() => {
        setCopied([-1, false]);
      }, 1000);
    }
  }, [copied]);

  const proxyLinks = user.links.join("\r\n");

  return (
    <Card border="1px dashed" borderColor="primary.100" minW="360px" {...props}>
      <CardBody>
        <VStack as="ul" spacing={0} listStyleType="none">
          <DataRow fieldName="username">
            <Text fontWeight="bold">{user.username}</Text>
          </DataRow>
          <DataRow fieldName="status">
            <UserBadge expiryDate={user.expire} status={user.status} />
          </DataRow>
          <DataRow fieldName="usage">
            <Box textAlign="center" minW="100px">
              <UsageSlider
                used={user.used_traffic}
                total={user.data_limit}
                colorScheme={user.status === "limited" ? "red" : "primary"}
                ml="auto"
                mr="0.4rem"
              />
            </Box>
          </DataRow>
          <DataRow fieldName="lifetime traffic">
            <Text fontWeight="bold">
              {formatBytes(user.lifetime_used_traffic)}
            </Text>
          </DataRow>
          <Box pt={10}>
            <HStack
              justifyContent="flex-end"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <CopyToClipboard
                text={proxyLinks}
                onCopy={() => {
                  setCopied([1, true]);
                }}
              >
                <div>
                  <Tooltip
                    label={
                      copied[0] == 1 && copied[1] ? "Copied" : "Copy Configs"
                    }
                    placement="top"
                  >
                    <IconButton
                      w="60px"
                      h="60px"
                      aria-label="copy configs"
                      variant="outline"
                      _dark={{
                        _hover: {
                          bg: "gray.800",
                        },
                      }}
                    >
                      {copied[0] == 1 && copied[1] ? (
                        <CopiedIcon w="40px" h="40px" />
                      ) : (
                        <CopyIcon w="40px" h="40px" />
                      )}
                    </IconButton>
                  </Tooltip>
                </div>
              </CopyToClipboard>
            </HStack>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
};

export const Dashboard: FC = () => {
  const [user, setUser] = useState<User>();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    fetch("/info/")
      .then(setUser)
      .catch(() => {
        navigate("/login", { replace: true });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading || !user)
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );

  return (
    <VStack justifyContent="space-between" minH="100vh" p="6">
      <UserData user={user} mt={20} />
      <Footer />
    </VStack>
  );
};

export default Dashboard;
