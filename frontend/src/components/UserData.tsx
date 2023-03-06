import { FC, useEffect, useState } from "react";
import {
  Box,
  Center,
  BoxProps,
  Button,
  Card,
  CardBody,
  CardProps,
  chakra,
  HStack,
  IconButton,
  Text,
  Tooltip,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { fetch } from "service/http";
import { UsageSlider } from "./UsageSlider";
import { User } from "types/User";
import { UserBadge } from "./UserBadge";
import { formatBytes } from "utils/format";
import CopyToClipboard from "react-copy-to-clipboard";
import {
  CheckIcon,
  ClipboardIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline";

const iconProps = {
  baseStyle: {
    w: 5,
    h: 5,
  },
};
const CopyIcon = chakra(ClipboardIcon, iconProps);
const CopiedIcon = chakra(CheckIcon, iconProps);
const FilteringIcon = chakra(ShieldExclamationIcon, iconProps);

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
export const UserData: FC<UserDataProps> = ({ user, ...props }) => {
  const [copied, setCopied] = useState([-1, false]);
  const toast = useToast();

  useEffect(() => {
    if (copied[1]) {
      setTimeout(() => {
        setCopied([-1, false]);
      }, 1000);
    }
  }, [copied]);

  const proxyLinks = user.links.join("\r\n");

  const [checkingFilteringStatus, setCheckingFilteringStatus] = useState(false);
  const checkFilteringStatus = () => {
    setCheckingFilteringStatus(true);
    fetch("/censorship-status/")
      .then(({ is_censored }) => {
        if (is_censored)
          toast({
            title: "Your node is Filtered",
            description:
              "Your node is censored by the government! We are trying to fix the problem. Thanks for your patience.",
            status: "error",
            duration: 9000,
            isClosable: true,
          });
        else
          toast({
            title: "Your node is Working",
            description:
              "Your node is working right now. If you have encountered any problems in your connection, " +
              "please contact to the support team.",
            status: "success",
            duration: 9000,
            isClosable: true,
          });
      })
      .catch((err) => {
        if (err.status === 403)
          toast({
            title: "Error",
            description:
              "Your node's domain have not been set by the admin of the service. " +
              "Contact the support team to fix the problem.",
            status: "warning",
            duration: 9000,
            isClosable: true,
          });
        if (err.status === 500)
          toast({
            title: "Error",
            description: "Please try again later.",
            status: "warning",
            duration: 9000,
            isClosable: true,
          });
      })
      .finally(() => {
        setCheckingFilteringStatus(false);
      });
  };

  return (
    <VStack w="360px">
      <Card border="1px dashed" borderColor="primary.100" w="full" {...props}>
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
      <Tooltip label="If your connection is not stable, with this button you can check if your connection is censored by the government or not.">
        <Button
          leftIcon={<FilteringIcon />}
          variant="outline"
          colorScheme="red"
          w="full"
          onClick={checkFilteringStatus}
          isDisabled={checkingFilteringStatus}
          isLoading={checkingFilteringStatus}
        >
          Show Filtering Status
        </Button>
      </Tooltip>
    </VStack>
  );
};
