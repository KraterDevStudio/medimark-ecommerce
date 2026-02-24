export interface Product {
    id: string;
    title: string;
    price: number;
    image: string;
    description: string;
    category: string;
    is_archived?: boolean;
    discount_percentage?: number;
    sale_start_date?: string;
    sale_end_date?: string;
    is_collection?: boolean;
    collection_items?: Partial<Product>[];
    categories?: { id: number; name: string; slug: string }[];
    created_at?: string;
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

    const removeFromCart = (id: string) => {
        items.value = items.value.filter((i: CartItem) => i.id !== id)
        storeCart()
    }

    // auxiliar function to store cart status onto localStorage
    const storeCart = () => {
        localStorage.setItem('cart', JSON.stringify(items.value))
    }

    const updateQuantity = (id: string, quantity: number) => {
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

    const getOriginalPrice = (product: Product) => {
        if (product.is_collection && product.collection_items && product.collection_items.length > 0) {
            return product.collection_items.reduce((sum, item) => sum + Number(item.price || 0), 0);
        }
        return Number(product.price);
    }

    const getEffectivePrice = (product: Product) => {
        const basePrice = Number(product.price);
        if (!product.discount_percentage || product.discount_percentage <= 0) return basePrice;

        const now = new Date();
        if (product.sale_start_date && new Date(product.sale_start_date) > now) return basePrice;
        if (product.sale_end_date && new Date(product.sale_end_date) < now) return basePrice;

        const discount = basePrice * (product.discount_percentage / 100);
        return basePrice - discount;
    }

    const total = computed(() => {
        return items.value.reduce((sum: number, item: CartItem) => {
            const price = getEffectivePrice(item)
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

    const getItemQuantity = (id: string) => {
        return items.value.find((i: CartItem) => i.id === id)?.quantity || 0
    }

    return { items, addToCart, removeFromCart, updateQuantity, clearCart, total, cartCount, formatPrice, loadCart, getItemQuantity, getEffectivePrice, getOriginalPrice }
}
