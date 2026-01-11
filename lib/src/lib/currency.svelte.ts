import { toast } from "svelte-sonner";
import type { Currency, DayRates } from "@betterinv/types"
import { env } from "$env/dynamic/public";
import { biFetch } from "./biFetch.ts";

const dayRateKeys = {
    USD: 0,
    JPY: 1,
    CZK: 2,
    DKK: 3,
    GBP: 4,
    HUF: 5,
    PLN: 6,
    RON: 7,
    SEK: 8,
    CHF: 9,
    ISK: 10,
    NOK: 11,
    TRY: 12,
    AUD: 13,
    BRL: 14,
    CAD: 15,
    CNY: 16,
    HKD: 17,
    IDR: 18,
    ILS: 19,
    INR: 20,
    KRW: 21,
    MXN: 22,
    MYR: 23,
    NZD: 24,
    PHP: 25,
    SGD: 26,
    THB: 27,
    ZAR: 28
}

class CurrencyManager {
    currency: Currency = $state("EUR");

    rates: DayRates | null = null;

    get currencies(): { value: Currency, label: string }[] {
        return [{
            value: "EUR",
            label: "Euro"
        },
        {
            value: "USD",
            label: "US dollar"
        },
        {
            value: "CAD",
            label: "Canadian dollar"
        },
        {
            value: "AUD",
            label: "Australian dollar"
        },
        {
            value: "GBP",
            label: "British pound"
        },
        {
            value: "JPY",
            label: "Japanese yen"
        },
        {
            value: "CZK",
            label: "Czech koruna"
        },
        {
            value: "DKK",
            label: "Danish krone"
        },
        {
            value: "HUF",
            label: "Hungarian forint"
        },
        {
            value: "PLN",
            label: "Polish złoty"
        },
        {
            value: "RON",
            label: "Romanian leu"
        },
        {
            value: "SEK",
            label: "Swedish krona"
        },
        {
            value: "CHF",
            label: "Swiss franc"
        },
        {
            value: "ISK",
            label: "Icelandic króna"
        },
        {
            value: "NOK",
            label: "Norwegian krone"
        },
        {
            value: "TRY",
            label: "Turkish lira"
        },
        {
            value: "BRL",
            label: "Brazilian real"
        },
        {
            value: "CNY",
            label: "Chinese yuan"
        },
        {
            value: "HKD",
            label: "Hong Kong dollar"
        },
        {
            value: "IDR",
            label: "Indonesian rupiah"
        },
        {
            value: "ILS",
            label: "Israeli new shekel"
        },
        {
            value: "INR",
            label: "Indian rupee"
        },
        {
            value: "KRW",
            label: "South Korean won"
        },
        {
            value: "MXN",
            label: "Mexican peso"
        },
        {
            value: "MYR",
            label: "Malaysian ringgit"
        },
        {
            value: "NZD",
            label: "New Zealand dollar"
        },
        {
            value: "PHP",
            label: "Philippine peso"
        },
        {
            value: "SGD",
            label: "Singapore dollar"
        },
        {
            value: "THB",
            label: "Thai baht"
        },
        {
            value: "ZAR",
            label: "South African rand"
        },
        ]
    }

    currencyMultiplier: number = $derived.by(() => {
        if (this.currency === "EUR") return 1;
        if (this.rates === null) return 0.01;
        return this.rates[dayRateKeys[this.currency]];
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

        const largeNumberFormatterWithoutFraction = new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: this.currency,
            maximumFractionDigits: 0,
        });



        return (valueInEur: number, writeWithKs: boolean = false) => {
            const rate = this.currencyMultiplier;
            const converted = valueInEur * rate;

            if (converted < 1_000 || !writeWithKs)
                return smallNumberFormatter.format(converted);

            let formated: string;
            let symbol = "K";
            if (converted < 1_000_000) {
                if (converted < 10_000)
                    formated = largeNumberFormatter.format(converted / 1_000);
                else
                    formated = largeNumberFormatterWithoutFraction.format(converted / 1_000);
            }
            else {
                symbol = "M"
                if (converted < 10_000_000)
                    formated = largeNumberFormatter.format(converted / 1_000_000);
                else
                    formated = largeNumberFormatterWithoutFraction.format(converted / 1_000_000);

            }
            const match = formated.match(/\d+(?!.*\d)/);
            if (!match) return formated + symbol;
            const index = (match.index ?? 0) + match[0].length;
            return formated.slice(0, index) + symbol + formated.slice(index);
        };
    });

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