import type { Socket, Server } from "socket.io";
import {
  createMessageSchema,
  type createMessageDTO,
} from "../modules/message/message.schema.js";
import { MessageService } from "../modules/message/message.service.js";
import z from "zod";

export function registerChatHandlers(socket: Socket, io: Server) {
  const senderId = socket.data.user.id;

  socket.join(senderId);

  socket.on("message:send", async (payload: createMessageDTO) => {
    try {
      const validatePayload = createMessageSchema.safeParse(payload);

      if (!validatePayload.success) {
        return socket.emit("message:error", z.treeifyError(validatePayload.error));
      }

      const newMessage = await MessageService.send(
        senderId,
        validatePayload.data.receiverId,
        validatePayload.data.content,
      );

      io.to(validatePayload.data.receiverId).emit("message:receive", newMessage);
      io.to(senderId).emit("message:receive", newMessage);
    } catch (error: any) {
      socket.emit("message:error", { error: error.message ?? "unexpected error" });
    }
  });
}