/**
 * API: Get Chat Messages
 * Fetches all messages for a specific chat session
 */

import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prisma } from "../../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('sessionId');

  if (!sessionId) {
    return json({ error: 'Session ID required' }, { status: 400 });
  }

  try {
    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { sentAt: 'asc' },
      select: {
        id: true,
        sender: true,
        message: true,
        sentAt: true,
        agentName: true,
        recommendedProducts: true,
        isAI: true
      }
    });

    return json({ messages });
  } catch (error) {
    console.error('[API] Error fetching messages:', error);
    return json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
};
