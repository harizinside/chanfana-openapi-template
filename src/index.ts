import { Hono } from "hono"
import { EmailWorker } from "presentation/workers/EmailWorker"

const hono = new Hono()

hono.get("/", async c => c.json({ message: "OK" }, 200))

export default {
    fetch: hono.fetch,
    email: EmailWorker.handle,
}
