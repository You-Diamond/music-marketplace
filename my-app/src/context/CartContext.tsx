"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

export interface CartItem {
  trackId: string
  trackTitle: string
  trackImage: string | null
  producerId: string
  producerName: string
  licenseId: string
  licenseName: string
  price: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (trackId: string, licenseId: string) => void
  clearCart: () => void
  cartTotal: number
  isInCart: (trackId: string, licenseId: string) => boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Загружаем корзину из localStorage при монтировании
  useEffect(() => {
    const savedCart = localStorage.getItem("aura_cart")
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (e) {
        console.error("Ошибка парсинга корзины", e)
      }
    }
  }, [])

  // Сохраняем корзину при изменениях
  useEffect(() => {
    localStorage.setItem("aura_cart", JSON.stringify(items))
  }, [items])

  const addToCart = (newItem: CartItem) => {
    setItems((prev) => {
      // Проверяем, есть ли уже этот бит с ЭТОЙ ЖЕ лицензией
      const exists = prev.some(
        (item) => item.trackId === newItem.trackId && item.licenseId === newItem.licenseId
      )
      if (exists) return prev // Если уже есть, ничего не меняем
      return [...prev, newItem]
    })
  }

  const removeFromCart = (trackId: string, licenseId: string) => {
    setItems((prev) =>
      prev.filter((item) => !(item.trackId === trackId && item.licenseId === licenseId))
    )
  }

  const clearCart = () => setItems([])

  const cartTotal = items.reduce((sum, item) => sum + item.price, 0)

  const isInCart = (trackId: string, licenseId: string) => {
    return items.some((item) => item.trackId === trackId && item.licenseId === licenseId)
  }

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, clearCart, cartTotal, isInCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart должен использоваться внутри CartProvider")
  return context
}