import { SettlementUseCase } from "domain/usecase/SettlementUseCase"
import PostalMime from "postal-mime"
import { CsvUtil } from "utils/CsvUtils"

export class EmailWorker {
    static async handle(message: ForwardableEmailMessage, env: Env, _: ExecutionContext) {
        try {
            console.log("[INFO] Processing Settlement, Email from:", message.from)

            const settlementUseCase = new SettlementUseCase()

            const raw = await new Response(message.raw).arrayBuffer()
            const email = await new PostalMime().parse(raw)

            for (const attachment of email.attachments) {
                if (attachment.mimeType !== "text/csv") continue
                if (!(attachment.content instanceof ArrayBuffer)) continue

                const rows = CsvUtil.parse(attachment.content)

                const settlement = settlementUseCase.process(attachment.filename!, rows)

                const resHealthcheck = await settlementUseCase.healthcheck(env)
                if (resHealthcheck.ok) {
                    console.log("[INFO] Sending settlement to:", env.API_CLINIC_SETTLEMENT_URL)
                    await settlementUseCase.send(env, settlement)
                }
            }
        } catch (err) {
            console.error("[ERROR] Proccesing Settlement, Email From:", message.from)
            throw err
        }
    }
}
