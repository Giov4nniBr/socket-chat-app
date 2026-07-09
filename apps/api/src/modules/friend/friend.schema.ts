import z from "zod"

export const sendRequest = z.object({
    receiverEmail: z.email()
})

export type RequestDTO = z.infer<typeof sendRequest>