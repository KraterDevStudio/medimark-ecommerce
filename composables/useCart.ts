export interface Product {
    id: number;
    title: string;
    price: number;
    image: string;
    description: string;
    category: string;
    is_archived?: boolean;
    categories?: { id: number; name: string; slug: string }[];
}

export interface CartItem extends Product {
    quantity: number;
}

export const useCart = () => {
    const items = useState<CartItem[]>('cart-items', () => [])

    const addToCart = (product: Product) => {
        const existing = items.value.find((i: CartItem) => i.id === product.id)
        if (existing) {
            existing.quantity++
        } else {
            items.value.push({ ...product, quantity: 1 })
        }
        storeCart()
    }

    const removeFromCart = (id: number) => {
        items.value = items.value.filter((i: CartItem) => i.id !== id)
        storeCart()
    }

    // auxiliar function to store cart status onto localStorage
    const storeCart = () => {
        localStorage.setItem('cart', JSON.stringify(items.value))
    }

    const updateQuantity = (id: number, quantity: number) => {
        const item = items.value.find((i: CartItem) => i.id === id)
        if (item) {
            if (quantity <= 0) {
                removeFromCart(id)
            } else {
                item.quantity = quantity
            }
            storeCart()
        }
    }

    const clearCart = () => {
        items.value = []
        storeCart()
    }

    const total = computed(() => {
        return items.value.reduce((sum: number, item: CartItem) => {
            const price = Number(item.price)
            const qty = Number(item.quantity)
            return sum + (price * qty)
        }, 0)
    })

    const cartCount = computed(() => {
        return items.value.reduce((sum: number, item: CartItem) => sum + Number(item.quantity), 0)
    })

    // Formatting utility inside composable for reuse
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
    }

    // load cart from localStorage, make sure it works on SSR   
    const loadCart = () => {
        if (process.server) return
        const cookies = localStorage.getItem('cart')
        if (cookies) {
            items.value = JSON.parse(cookies)
        }
    }

    const getItemQuantity = (id: number) => {
        return items.value.find((i: CartItem) => i.id === id)?.quantity || 0
    }

    return { items, addToCart, removeFromCart, updateQuantity, clearCart, total, cartCount, formatPrice, loadCart, getItemQuantity }
}
