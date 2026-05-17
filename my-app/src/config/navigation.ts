import {
  Home,
  Music2,
  Library,
  Heart,
  Bell,
  MessageCircle,
  Settings,
  ShoppingCart,
  Upload,
} from "lucide-react"

export const sidebarNavigation =
  [
    {
      label: "Home",

      href: "/",

      icon: Home,
    },

    {
      label: "Discover",

      href: "/discover",

      icon: Music2,
    },

    {
      label: "Playlists",

      href: "/playlists",

      icon: Library,
    },

    {
      label: "Favorites",

      href: "/favorites",

      icon: Heart,
    },

    {
      label: "Notifications",

      href: "/notifications",

      icon: Bell,
    },

    {
      label: "Messages",

      href: "/messages",

      icon: MessageCircle,
    },

    {
      label: "Cart",

      href: "/cart",

      icon: ShoppingCart,
    },

    {
      label: "Upload",

      href: "/upload",

      icon: Upload,
    },

    {
      label: "Settings",

      href: "/settings",

      icon: Settings,
    },
  ]