export type TTransaction = {
    no: string
    merchant_name: string
    payment_channel_name: string
    transaction_date: string
    invoice_number: string
    customer_name: string
    report_code: string
    amount: string
    recon_code: string
    fee: string
    discount: string
    pay_to_merchant: string
    pay_out_date: string
    transaction_type: string
    promo_code: string
    clinic: string
    company: string
}

export type TSettlement = {
    filename: string
    total_amount_purchase: string
    total_fee: string
    total_purchase: string
    total_amount_refund: string
    total_refund: string
    total_settlement_amount: string
    total_discount: string
    total_transactions: string
    batch_id: string
    transactions: TTransaction[]
}

type TSettlementKeyWithoutTransactions = Exclude<keyof TSettlement, "transactions">

export class SettlementUseCase {
    private static readonly KEY: Record<string, TSettlementKeyWithoutTransactions> = {
        "Total Amount Purchase_": "total_amount_purchase",
        "Total Fee_": "total_fee",
        "Total Purchase_": "total_purchase",
        "Total Amount Refund_": "total_amount_refund",
        "Total Refund_": "total_refund",
        "Total Settlement Amount_": "total_settlement_amount",
        "Total Discount_": "total_discount",
        "Total Transactions_": "total_transactions",
        "Batch ID_": "batch_id",
    }

    private filterHeader(rows: string[][]) {
        return rows.filter((row): row is [string, string] => row.length === 2)
    }

    private filterDetail(rows: string[][]) {
        return rows.filter(
            (
                row,
            ): row is [
                string,
                string,
                string,
                string,
                string,
                string,
                string,
                string,
                string,
                string,
                string,
                string,
                string,
                string,
                string,
                string,
                string,
            ] => row.length === 17,
        )
    }

    process(filename: string, rows: string[][]) {
        const headerRows = this.filterHeader(rows)
        const settlement = { filename } as TSettlement

        for (const [key, value] of headerRows) {
            const field = SettlementUseCase.KEY[key]
            if (field) settlement[field] = value
        }

        const transactionRows = this.filterDetail(rows)
        const transactions = [] as TTransaction[]

        for (const tr of transactionRows) {
            if (tr[0] === "NO") continue

            transactions.push({
                no: tr[0].trimEnd(),
                merchant_name: tr[1].trimEnd(),
                payment_channel_name: tr[2].trimEnd(),
                transaction_date: tr[3].trimEnd(),
                invoice_number: tr[4].trimEnd(),
                customer_name: tr[5].trimEnd(),
                report_code: tr[6].trimEnd(),
                amount: tr[7].trimEnd(),
                recon_code: tr[8].trimEnd(),
                fee: tr[9].trimEnd(),
                discount: tr[10].trimEnd(),
                pay_to_merchant: tr[11].trimEnd(),
                pay_out_date: tr[12].trimEnd(),
                transaction_type: tr[13].trimEnd(),
                promo_code: tr[14].trimEnd(),
                clinic: tr[15].trimEnd(),
                company: tr[16].trimEnd(),
            })
        }

        settlement.transactions = transactions

        return settlement
    }

    async healthcheck(env: Env) {
        const headers = {
            Authorization: env.API_CLINIC_KEY,
        }

        const res = await fetch(env.API_CLINIC_SETTLEMENT_URL, {
            method: "GET",
            headers,
        })

        return {
            ok: res.ok,
            url: res.url,
            status: res.status,
            response: {
                body: await res.json(),
            },
        }
    }

    async send(env: Env, settlement: TSettlement) {
        const body = JSON.stringify(settlement)

        const headers = {
            Authorization: env.API_CLINIC_KEY,
            "Content-Type": "application/json",
            "Content-Length": `${body.length}`,
        }

        const res = await fetch(env.API_CLINIC_SETTLEMENT_URL, {
            method: "POST",
            headers,
            body,
        })

        return {
            ok: res.ok,
            url: res.url,
            status: res.status,
            response: {
                body: await res.json(),
            },
        }
    }
}
