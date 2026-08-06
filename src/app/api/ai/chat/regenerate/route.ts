import {
  regenerateChatSchema,
  type RegenerateChatInput,
} from "@/lib/ai/contracts";
import { completeText } from "@/lib/ai/generation";
import {
  handleRouteError,
  HttpError,
  parseBody,
  requireAiSession,
} from "@/lib/ai/http";
import { enforceAiRateLimit } from "@/lib/ai/usage";
import { connectToDatabase } from "@/lib/mongoose";
import { ChatModel } from "@/models";
import { successResponse } from "@/lib/api-response";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await requireAiSession(request);
    await enforceAiRateLimit(session.userId, "chat-regenerate");
    
    const input = await parseBody<RegenerateChatInput>(
      request,
      regenerateChatSchema,
    );
    
    await connectToDatabase();
    
    const chat = await ChatModel.findOne({
      id: input.chatId,
      userId: session.userId,
    });
    
    if (!chat) throw new HttpError(404, "NOT_FOUND", "Chat not found.");
    
    const messageIndex = chat.messages.findIndex(
      (message: { id: string }) => message.id === input.messageId,
    );
    
    if (messageIndex < 0 || chat.messages[messageIndex].role !== "assistant")
      throw new HttpError(404, "NOT_FOUND", "Assistant message not found.");
      
    const context = chat.messages
      .slice(0, messageIndex)
      .slice(-20)
      .map(
        (message: { role: string; content: string }) =>
          `${message.role}: ${message.content}`,
      )
      .join("\n");
      
    const result = await completeText({
      userId: session.userId,
      feature: "chat",
      system:
        "You are Luro AI. Produce an improved alternative response to the conversation.",
      prompt: context,
      resourceId: chat.id,
    });
    
    Object.assign(chat.messages[messageIndex], {
      content: result.content,
      model: result.model,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      status: "complete",
      createdAt: new Date(),
    });
    
    await chat.save();
    
    return successResponse(
      chat.messages[messageIndex],
      "Response regenerated.",
    );
  } catch (error) {
    return handleRouteError(error);
  }
}