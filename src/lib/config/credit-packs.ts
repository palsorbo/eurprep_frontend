export interface CreditPack {
    id: string
    name: string
    price: number
    credits: number
    bonus: number
    total: number
    description: string
    popular: boolean
    features?: string[]
}

export const CREDIT_PACKS: CreditPack[] = [
    {
        id: 'starter',
        name: 'Starter',
        price: 99,
        credits: 10,
        bonus: 0,
        total: 10,
        description: 'Perfect for casual users',
        popular: false,
        features: ['10 feedback analyses', 'Basic support']
    },
    {
        id: 'value',
        name: 'Value (Most Popular)',
        price: 299,
        credits: 30,
        bonus: 5,
        total: 35,
        description: 'Great value for serious seekers',
        popular: true,
        features: ['35 feedback analyses', 'Priority support', '25% bonus credits']
    },
    {
        id: 'pro-max',
        name: 'Pro Max',
        price: 999,
        credits: 100,
        bonus: 25,
        total: 125,
        description: 'Best for power learners & pros',
        popular: false,
        features: ['125 feedback analyses', 'Premium support', '25% bonus credits', 'Best value']
    }
]

export const getCreditPackById = (id: string): CreditPack | undefined => {
    return CREDIT_PACKS.find(pack => pack.id === id)
}

export const getPopularPack = (): CreditPack | undefined => {
    return CREDIT_PACKS.find(pack => pack.popular)
} 