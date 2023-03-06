import {
  BoxProps,
  Button,
  chakra,
  HStack,
  IconButton,
  Link,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { FC } from "react";
import { Link as RouteLink, useLocation, useNavigate } from "react-router-dom";
import { removeAuthToken } from "../auth/authStorage";

const RouterLink = chakra(RouteLink);
const DarkIcon = chakra(MoonIcon, {
  baseStyle: {
    w: "4",
    h: "4",
  },
});
const LightIcon = chakra(SunIcon, {
  baseStyle: {
    w: "4",
    h: "4",
  },
});

export const Footer: FC<BoxProps> = (props) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <HStack w="full" py="0" position="relative" {...props}>
      {location.pathname !== "/login" && (
        <Button
          left="0"
          position="absolute"
          size="sm"
          onClick={() => {
            removeAuthToken();
            navigate("/login");
          }}
        >
          Log out
        </Button>
      )}
      <Text
        display="inline-block"
        flexGrow={1}
        textAlign="center"
        color="gray.500"
        fontSize="xs"
      >
        Made with ❤️ in{" "}
        <Link color="blue.400" href="https://github.com/marzboard/marzboard">
          Marzboard
        </Link>
      </Text>
      <IconButton
        size="sm"
        aria-label="switch theme"
        onClick={toggleColorMode}
        position="absolute"
        right="0"
      >
        {colorMode === "light" ? <DarkIcon /> : <LightIcon />}
      </IconButton>
    </HStack>
  );
};
