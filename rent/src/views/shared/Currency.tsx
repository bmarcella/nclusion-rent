/* eslint-disable @typescript-eslint/no-explicit-any */

interface CurrencyProps {
    amount: number | string
    format?: string
    tag?: string | any
}

function Currency({ amount, format = 'fr-FR', tag = 'HTG' }: CurrencyProps) {
    return (
        <>
            {tag} {new Intl.NumberFormat(format).format(Number(amount))}
        </>
    )
}

export default Currency
