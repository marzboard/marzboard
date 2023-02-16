import { FC, useEffect, useState } from "react";
import { Center, Spinner, VStack } from "@chakra-ui/react";
import { Footer } from "components/Footer";
import { fetch } from "service/http";
import { UsersTable } from "../components/UsersTable";
import { User } from "../types/User";
import { useNavigate } from "react-router-dom";

type ProxyType = {
  vmess?: {
    id: string;
  };
  vless?: {
    id: string;
  };
  trojan?: {
    password: string;
  };
  shadowsocks?: {
    password: string;
  };
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
      <UsersTable user={user} mt={20} />
      <Footer />
    </VStack>
  );
};

export default Dashboard;
