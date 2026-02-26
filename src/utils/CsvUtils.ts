import Papa from "papaparse"

export class CsvUtil {
    static parse(content: ArrayBuffer, config?: Papa.ParseConfig) {
        const csvText = new TextDecoder().decode(content)
        const { data } = Papa.parse<string[]>(csvText, config)
        return data
    }
}
