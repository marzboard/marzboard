import {
  Box,
  chakra,
  HStack,
  IconButton,
  Slider,
  SliderFilledTrack,
  SliderProps,
  SliderTrack,
  Table,
  TableProps,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
} from "@chakra-ui/react";
import {
  CheckIcon,
  ClipboardIcon,
  LinkIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";
import { FC, useEffect, useState } from "react";
import { formatBytes } from "utils/format";
import CopyToClipboard from "react-copy-to-clipboard";
import { UserBadge } from "./UserBadge";
import { User } from "types/User";

const iconProps = {
  baseStyle: {
    w: 5,
    h: 5,
  },
};
const CopyIcon = chakra(ClipboardIcon, iconProps);
const CopiedIcon = chakra(CheckIcon, iconProps);
const SubscriptionLinkIcon = chakra(LinkIcon, iconProps);
const QRIcon = chakra(QrCodeIcon, iconProps);

type UsageSliderProps = {
  used: number;
  total: number | null;
} & SliderProps;
const UsageSlider: FC<UsageSliderProps> = (props) => {
  const { used, total, ...restOfProps } = props;
  const isUnlimited = total === 0 || total === null;
  const isReached = !isUnlimited && (used / total) * 100 >= 100;
  return (
    <>
      <Slider
        orientation="horizontal"
        value={isUnlimited ? 100 : Math.min((used / total) * 100, 100)}
        colorScheme={isReached ? "red" : "primary"}
        {...restOfProps}
      >
        <SliderTrack h="6px" borderRadius="full">
          <SliderFilledTrack borderRadius="full" />
        </SliderTrack>
      </Slider>
      <Text
        fontSize="xs"
        fontWeight="medium"
        color="gray.600"
        _dark={{
          color: "gray.400",
        }}
      >
        {formatBytes(used)} /{" "}
        {isUnlimited ? (
          <Text as="span" fontFamily="system-ui">
            ∞
          </Text>
        ) : (
          formatBytes(total)
        )}
      </Text>
    </>
  );
};

type UsersTableProps = { user: User } & TableProps;
export const UsersTable: FC<UsersTableProps> = ({ user, ...props }) => {
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
    <Box overflowX="auto" maxW="100vw">
      <Table {...props}>
        <Thead>
          <Tr>
            <Th>Username</Th>
            <Th>status</Th>
            <Th>banding usage</Th>
            <Th>lifetime usage</Th>
            <Th>reset every</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr key={user.username} className="interactive">
            <Td minW="150px">{user.username}</Td>
            <Td width="350px">
              <UserBadge expiryDate={user.expire} status={user.status} />
            </Td>
            <Td width="300px" minW="200px">
              <UsageSlider
                used={user.used_traffic}
                total={user.data_limit}
                colorScheme={user.status === "limited" ? "red" : "primary"}
              />
            </Td>
            <Td>{formatBytes(user.lifetime_used_traffic)}</Td>
            <Td textTransform="capitalize">{user.data_limit_reset_strategy}</Td>
            <Td width="150px">
              <HStack
                justifyContent="flex-end"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <CopyToClipboard
                  text={
                    user.subscription_url.startsWith("/")
                      ? window.location.origin + user.subscription_url
                      : user.subscription_url
                  }
                  onCopy={() => {
                    setCopied([0, true]);
                  }}
                >
                  <div>
                    <Tooltip
                      label={
                        copied[0] == 0 && copied[1]
                          ? "Copied"
                          : "Copy Subscription Link"
                      }
                      placement="top"
                    >
                      <IconButton
                        aria-label="copy subscription link"
                        bg="transparent"
                        _dark={{
                          _hover: {
                            bg: "gray.700",
                          },
                        }}
                      >
                        {copied[0] == 0 && copied[1] ? (
                          <CopiedIcon />
                        ) : (
                          <SubscriptionLinkIcon />
                        )}
                      </IconButton>
                    </Tooltip>
                  </div>
                </CopyToClipboard>
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
                        aria-label="copy configs"
                        bg="transparent"
                        _dark={{
                          _hover: {
                            bg: "gray.700",
                          },
                        }}
                      >
                        {copied[0] == 1 && copied[1] ? (
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
        </Tbody>
      </Table>
    </Box>
  );
};
