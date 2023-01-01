import { ApolloProvider } from "@apollo/client";
import { ChakraProvider } from "@chakra-ui/react";
import { SessionProvider } from "next-auth/react";
import { theme } from "@client/utils/theme";
import { client } from "@client/utils/apollo";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <ChakraProvider theme={theme}>
        <ApolloProvider client={client}>
          <Component {...pageProps} />
        </ApolloProvider>
      </ChakraProvider>
    </SessionProvider>
  );
}
