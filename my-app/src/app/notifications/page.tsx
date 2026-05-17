import Image from "next/image"

import Link from "next/link"

import {
  Bell,
  Heart,
  ShoppingCart,
  UserPlus,
  ListMusic,
  MessageCircle,
} from "lucide-react"

import clsx from "clsx"

import { notificationsMock } from "@/mocks/notifications.mock"

function getNotificationIcon(
  type: string
) {
  switch (type) {
    case "like":
      return (
        <Heart size={22} />
      )

    case "purchase":
      return (
        <ShoppingCart
          size={22}
        />
      )

    case "follow":
      return (
        <UserPlus
          size={22}
        />
      )

    case "playlist":
      return (
        <ListMusic
          size={22}
        />
      )

    default:
      return (
        <MessageCircle
          size={22}
        />
      )
  }
}

export default function NotificationsPage() {
  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-white/5 blur-[180px]" />
        </div>

        <div className="relative mx-auto max-w-[1400px] px-6 py-24 lg:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">
                Activity
              </p>

              <h1 className="mt-6 text-6xl font-black uppercase leading-none md:text-7xl">
                Notifications
              </h1>
            </div>

            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-6 py-4 text-sm font-black uppercase tracking-[0.2em]">
              <Bell size={18} />

              {
                notificationsMock.filter(
                  (
                    notification
                  ) =>
                    !notification.read
                ).length
              }{" "}
              Unread
            </div>
          </div>

          <div className="mt-16 overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.03]">
            {notificationsMock.map(
              (
                notification
              ) => (
                <Link
                  key={
                    notification.id
                  }
                  href={
                    notification.href ||
                    "#"
                  }
                  className={clsx(
                    "flex items-center gap-6 border-b border-white/5 p-8 transition hover:bg-white/[0.03]",
                    !notification.read &&
                      "bg-white/[0.02]"
                  )}
                >
                  <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                    {notification.image ? (
                      <Image
                        src={
                          notification.image
                        }
                        alt={
                          notification.title
                        }
                        fill
                        className="object-cover"
                      />
                    ) : (
                      getNotificationIcon(
                        notification.type
                      )
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                        {
                          notification.type
                        }
                      </div>

                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </div>

                    <h2 className="mt-4 text-2xl font-black uppercase">
                      {
                        notification.title
                      }
                    </h2>

                    <p className="mt-3 text-zinc-400">
                      {
                        notification.description
                      }
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                      {
                        notification.createdAt
                      }
                    </p>
                  </div>
                </Link>
              )
            )}
          </div>
        </div>
      </section>
    </main>
  )
}