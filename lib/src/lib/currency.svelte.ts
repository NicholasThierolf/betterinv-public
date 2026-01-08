import { toast } from "svelte-sonner";
import type { Currency } from "./types.ts"
import { env } from "$env/dynamic/public";
import { biFetch } from "./biFetch.ts";

class CurrencyManager {
    currency: Currency = $state("EUR");
    currencyMultiplier: number = $derived.by(() => {
        switch (this.currency) {
            case "EUR":
                return 1;
            case "USD":
                return 1.5;
            case "CAD":
                return 8;
        }
    });

    currencyFormaterWithKs: (input: number) => string = $derived.by(() => {

        const formater = this.currencyFormater;

        return (valueInEur: number) => {
            return formater(valueInEur, true);
        }
    });

    currencyFormater: (input: number, writeWithKs?: boolean) => string = $derived.by(() => {
        const smallNumberFormatter = new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: this.currency
        });

        const largeNumberFormatter = new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: this.currency,
            maximumFractionDigits: 1,
        });



        return (valueInEur: number, writeWithKs: boolean = false) => {
            const rate = this.currencyMultiplier;
            const converted = valueInEur * rate;

            if (converted < 1_000 || !writeWithKs)
                return smallNumberFormatter.format(converted);

            let formated: string;
            let symbol = "K";
            if (converted < 1_000_000)
                formated = largeNumberFormatter.format(converted / 1_000);
            else {
                formated = largeNumberFormatter.format(converted / 1_000_000);
                symbol = "M"
            }
            const match = formated.match(/\d+(?!.*\d)/);
            if (!match) return formated + symbol;
            const index = (match.index ?? 0) + match[0].length;
            return formated.slice(0, index) + symbol + formated.slice(index);
        };
    });

    get currencies(): Currency[] {
        return ["EUR", "USD", "CAD"]
    }

    changeCurrency(newCur: Currency) {
        this.currency = newCur;


        biFetch(`${env.PUBLIC_SERVER_URL}/api/preferences`, {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({
                currency: newCur
            })
        }).catch(() => {
            toast.error("Failed to reach the server", {
                duration: 5000
            })
        });
    }
}

export const currencyManager = new CurrencyManager();