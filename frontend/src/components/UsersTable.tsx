import {
  Box,
  chakra,
  HStack,
  IconButton,
  Table,
  TableContainer,
  TableProps,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
  Tr,
} from "@chakra-ui/react";
import { CheckIcon, ClipboardIcon } from "@heroicons/react/24/outline";
import { FC, useEffect, useState } from "react";
import { formatBytes } from "utils/format";
import CopyToClipboard from "react-copy-to-clipboard";
import { UserBadge } from "./UserBadge";
import { User } from "types/User";
import { UsageSlider } from "./UsageSlider";

const iconProps = {
  baseStyle: {
    w: 5,
    h: 5,
  },
};
const CopyIcon = chakra(ClipboardIcon, iconProps);
const CopiedIcon = chakra(CheckIcon, iconProps);

type UsersTableProps = { users: User[] } & TableProps;
export const UsersTable: FC<UsersTableProps> = ({ users, ...props }) => {
  const [copied, setCopied] = useState([-1, -1, false]);

  useEffect(() => {
    if (copied[2]) {
      setTimeout(() => {
        setCopied([-1, -1, false]);
      }, 1000);
    }
  }, [copied]);

  return (
    <Box overflowX="auto" maxW="100vw">
      <TableContainer>
        <Table {...props}>
          <Thead>
            <Tr>
              <Th>Username</Th>
              <Th>status</Th>
              <Th>banding usage</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {users?.map((user, i) => {
              const proxyLinks = user.links.join("\r\n");
              return (
                <Tr key={user.username} className="interactive">
                  <Td minW={["0", null, null, "340px"]}>{user.username}</Td>
                  <Td>
                    <UserBadge expiryDate={user.expire} status={user.status} />
                  </Td>
                  <Td
                    width={["150px", null, null, "300px"]}
                    minW={["150px", null, null, "200px"]}
                  >
                    <UsageSlider
                      totalUsedTraffic={user.lifetime_used_traffic}
                      dataLimitResetStrategy={user.data_limit_reset_strategy}
                      used={user.used_traffic}
                      total={user.data_limit}
                      colorScheme={
                        user.status === "limited" ? "red" : "primary"
                      }
                    />
                  </Td>
                  <Td>
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
                          setCopied([i, 1, true]);
                        }}
                      >
                        <div>
                          <Tooltip
                            label={
                              copied[0] === i && copied[1] == 1 && copied[2]
                                ? "Copied"
                                : "Copy Configs"
                            }
                            placement="top"
                          >
                            <IconButton
                              aria-label="copy configs"
                              bg="transparent"
                              _dark={{
                                _hover: {
                                  bg: "gray.700",
                                },
                              }}
                            >
                              {copied[0] === i &&
                              copied[1] == 1 &&
                              copied[2] ? (
                                <CopiedIcon />
                              ) : (
                                <CopyIcon />
                              )}
                            </IconButton>
                          </Tooltip>
                        </div>
                      </CopyToClipboard>
                    </HStack>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};
