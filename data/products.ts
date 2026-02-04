export interface Product {
  id: number
  name: string
  description: string
  price: number
  category: string
  size: string
  image: string
  badge?: string
}

export interface Promotion extends Product {
  originalPrice: number
  discount: number
}

export const products: Product[] = [
  {
    id: 1,
    name: "Johnnie Walker Black Label",
    description: "Whisky escocés mezclado con notas de vainilla y frutas oscuras",
    price: 185000,
    category: "Whisky",
    size: "750ml",
    image: "/johnnie-walker-black-label-whisky-bottle-premium-d.jpg",
  },
  {
    id: 2,
    name: "Absolut Vodka",
    description: "Vodka sueco premium, puro y versátil para cualquier ocasión",
    price: 89000,
    category: "Vodka",
    size: "750ml",
    image: "/absolut-vodka-bottle-premium-dark-background.jpg",
  },
  {
    id: 3,
    name: "Don Julio 70",
    description: "Tequila añejo cristalino con sabor suave y sofisticado",
    price: 320000,
    category: "Tequila",
    size: "700ml",
    image: "/don-julio-70-tequila-bottle-premium-dark-backgroun.jpg",
    badge: "Premium",
  },
  {
    id: 4,
    name: "Hendrick's Gin",
    description: "Gin escocés con infusión de pepino y pétalos de rosa",
    price: 175000,
    category: "Gin",
    size: "700ml",
    image: "/hendricks-gin-bottle-premium-dark-background.jpg",
  },
  {
    id: 5,
    name: "Bacardi Superior",
    description: "Ron blanco premium cubano, ideal para cócteles",
    price: 72000,
    category: "Ron",
    size: "750ml",
    image: "/bacardi-white-rum-bottle-premium-dark-background.jpg",
  },
  {
    id: 6,
    name: "Jack Daniel's Tennessee",
    description: "Whiskey americano con su característico sabor suave",
    price: 125000,
    category: "Whiskey",
    size: "750ml",
    image: "/jack-daniels-tennessee-whiskey-bottle-premium-dark.jpg",
  },
  {
    id: 7,
    name: "Grey Goose",
    description: "Vodka francés ultra premium destilado de los mejores ingredientes",
    price: 195000,
    category: "Vodka",
    size: "750ml",
    image: "/grey-goose-vodka-bottle-premium-dark-background.jpg",
    badge: "Bestseller",
  },
  {
    id: 8,
    name: "Moët & Chandon Imperial",
    description: "Champagne francés de renombre mundial, elegancia en cada copa",
    price: 280000,
    category: "Champagne",
    size: "750ml",
    image: "/moet-chandon-champagne-bottle-premium-dark-backgro.jpg",
    badge: "Exclusivo",
  },
]

export const promotions: Promotion[] = [
  {
    id: 101,
    name: "Buchanan's 12 años",
    description: "Whisky escocés premium",
    price: 145000,
    originalPrice: 175000,
    discount: 17,
    category: "Whisky",
    size: "750ml",
    image: "/buchanans-12-whisky-bottle-premium.jpg",
  },
  {
    id: 102,
    name: "Aguardiente Antioqueño",
    description: "El tradicional aguardiente colombiano",
    price: 42000,
    originalPrice: 52000,
    discount: 20,
    category: "Aguardiente",
    size: "750ml",
    image: "/aguardiente-antioqueno-bottle.jpg",
  },
  {
    id: 103,
    name: "Red Label 1L",
    description: "Johnnie Walker Red Label edición grande",
    price: 115000,
    originalPrice: 140000,
    discount: 18,
    category: "Whisky",
    size: "1L",
    image: "/johnnie-walker-red-label-whisky-bottle.jpg",
  },
]
