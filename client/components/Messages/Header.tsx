import { useMutation } from "@apollo/client";
import { ActionIcon, Flex, Stack, Text } from "@mantine/core";
import { DELETE_CONVERSATION_MUTATION } from "@client/graphql/mutations";
import { CONVERSATIONS_QUERY } from "@client/graphql/queries";
import { ConversationsQuery } from "@client/types";
import {
  ConversationFragment,
  DeleteConversationMutation,
  DeleteConversationMutationVariables,
} from "@client/types/graphql";
import { formatUsernames } from "@client/utils/format-usernames";
import { IconArrowNarrowLeft, IconTrash } from "@tabler/icons";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { toast } from "react-hot-toast";

interface MessagesHeaderProps {
  conversation: ConversationFragment;
}

export function MessagesHeader({ conversation }: MessagesHeaderProps) {
  const router = useRouter();
  const { conversationId } = router.query;
  const { data: session } = useSession();

  const [deleteConversationMutation, { loading }] = useMutation<
    DeleteConversationMutation,
    DeleteConversationMutationVariables
  >(DELETE_CONVERSATION_MUTATION);

  const deleteConversation = useCallback(async () => {
    if (!conversationId || loading) return;

    try {
      const { data, errors } = await deleteConversationMutation({
        variables: { conversationId: conversationId as string },
        optimisticResponse: { deleteConversation: true },
        update(cache) {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          router.replace("/");
          const cacheData = cache.readQuery<ConversationsQuery>({ query: CONVERSATIONS_QUERY });

          const conversations = [...(cacheData?.conversations ?? [])];

          cache.writeQuery<ConversationsQuery>({
            query: CONVERSATIONS_QUERY,
            data: {
              conversations: conversations.filter((c) => c.id !== conversationId),
            },
          });
        },
      });

      if (!data?.deleteConversation || errors) {
        throw Error(errors?.[0].message ?? "Something went wrong. Please, try again later");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  }, [conversationId, loading, deleteConversationMutation, router]);

  return (
    <Stack
      align="center"
      spacing="lg"
      py="lg"
      px="md"
      sx={(theme) => ({ flexDirection: "row", borderBottom: `1px solid ${theme.colors.white[3]}` })}
      bg="white.2"
      w="100%"
    >
      <ActionIcon aria-label="Go back" display={{ base: "flex", sm: "none" }} onClick={() => router.replace("/")}>
        <IconArrowNarrowLeft />
      </ActionIcon>
      <Flex sx={{ flex: 1, overflow: "hidden" }} justify="space-between" align="center">
        <Flex gap={8} sx={{ flexDirection: "row", overflow: "hidden" }} align="center">
          <Text color="white.5">To:</Text>
          <Text
            weight={600}
            color="white.9"
            sx={{ whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}
          >
            {formatUsernames(conversation.participants ?? [], session?.user?.id ?? "")}
          </Text>
        </Flex>
        <ActionIcon ml="md" disabled={loading} aria-label="Delete conversation" onClick={() => deleteConversation()}>
          <IconTrash />
        </ActionIcon>
      </Flex>
    </Stack>
  );
}
