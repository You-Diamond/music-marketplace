"use client"

import { useState } from "react"

import Image from "next/image"

import {
  Send,
  Search,
  CheckCheck,
} from "lucide-react"

import clsx from "clsx"

import { conversationsMock } from "@/mocks/messages.mock"

export default function MessagesPage() {
  const [
    selectedConversationId,
    setSelectedConversationId,
  ] = useState(
    conversationsMock[0]?.id
  )

  const selectedConversation =
    conversationsMock.find(
      (conversation) =>
        conversation.id ===
        selectedConversationId
    )

  return (
    <main className="h-screen overflow-hidden">
      <section className="relative flex h-full">
        <div className="absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-white/5 blur-[180px]" />
        </div>

        <div className="relative grid w-full grid-cols-[420px_1fr]">
          <div className="border-r border-white/10 bg-black/50 backdrop-blur-3xl">
            <div className="border-b border-white/10 p-8">
              <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">
                Communication
              </p>

              <h1 className="mt-5 text-5xl font-black uppercase">
                Messages
              </h1>

              <div className="relative mt-8">
                <Search
                  size={18}
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500"
                />

                <input
                  placeholder="Search conversations..."
                  className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.03] pl-14 pr-5 outline-none transition focus:border-white/20"
                />
              </div>
            </div>

            <div className="overflow-y-auto">
              {conversationsMock.map(
                (
                  conversation
                ) => {
                  const user =
                    conversation
                      .participants[0]

                  const isActive =
                    selectedConversationId ===
                    conversation.id

                  return (
                    <button
                      key={
                        conversation.id
                      }
                      onClick={() =>
                        setSelectedConversationId(
                          conversation.id
                        )
                      }
                      className={clsx(
                        "flex w-full items-start gap-4 border-b border-white/5 p-6 text-left transition",
                        isActive
                          ? "bg-white/[0.05]"
                          : "hover:bg-white/[0.03]"
                      )}
                    >
                      <div className="relative">
                        <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white/10">
                          {user.avatar ? (
                            <Image
                              src={
                                user.avatar
                              }
                              alt={
                                user.displayName
                              }
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-white text-black">
                              {
                                user.displayName[0]
                              }
                            </div>
                          )}
                        </div>

                        {conversation.unreadCount >
                          0 && (
                          <div className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1 text-[10px] font-black text-black">
                            {
                              conversation.unreadCount
                            }
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h2 className="truncate text-lg font-black uppercase">
                              {
                                user.displayName
                              }
                            </h2>

                            <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                              @
                              {
                                user.username
                              }
                            </p>
                          </div>

                          <p className="shrink-0 text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                            {
                              conversation.lastMessageAt
                            }
                          </p>
                        </div>

                        <p className="mt-5 truncate text-sm text-zinc-400">
                          {
                            conversation.lastMessage
                          }
                        </p>
                      </div>
                    </button>
                  )
                }
              )}
            </div>
          </div>

          <div className="flex flex-col">
            {selectedConversation && (
              <>
                <div className="border-b border-white/10 bg-black/30 p-6 backdrop-blur-3xl">
                  <div className="flex items-center gap-4">
                    <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-white/10">
                      <Image
                        src={
                          selectedConversation
                            .participants[0]
                            .avatar ||
                          "/images/avatar-1.jpg"
                        }
                        alt="avatar"
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div>
                      <h2 className="text-2xl font-black uppercase">
                        {
                          selectedConversation
                            .participants[0]
                            .displayName
                        }
                      </h2>

                      <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                        @
                        {
                          selectedConversation
                            .participants[0]
                            .username
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-8 py-10">
                  <div className="mx-auto flex max-w-4xl flex-col gap-6">
                    {selectedConversation.messages.map(
                      (
                        message
                      ) => {
                        const isMine =
                          message.senderId ===
                          "me"

                        return (
                          <div
                            key={
                              message.id
                            }
                            className={clsx(
                              "flex",
                              isMine
                                ? "justify-end"
                                : "justify-start"
                            )}
                          >
                            <div
                              className={clsx(
                                "max-w-[70%] rounded-[28px] px-6 py-5",
                                isMine
                                  ? "bg-white text-black"
                                  : "border border-white/10 bg-white/[0.03]"
                              )}
                            >
                              <p className="text-sm leading-relaxed">
                                {
                                  message.content
                                }
                              </p>

                              <div className="mt-5 flex items-center justify-end gap-2">
                                <p
                                  className={clsx(
                                    "text-[10px] uppercase tracking-[0.25em]",
                                    isMine
                                      ? "text-black/60"
                                      : "text-zinc-500"
                                  )}
                                >
                                  {
                                    message.createdAt
                                  }
                                </p>

                                {isMine && (
                                  <CheckCheck
                                    size={
                                      14
                                    }
                                    className="text-black/60"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      }
                    )}
                  </div>
                </div>

                <div className="border-t border-white/10 bg-black/30 p-6 backdrop-blur-3xl">
                  <div className="mx-auto flex max-w-4xl items-center gap-4">
                    <input
                      placeholder="Write message..."
                      className="h-16 flex-1 rounded-2xl border border-white/10 bg-white/[0.03] px-6 outline-none transition focus:border-white/20"
                    />

                    <button className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-black transition hover:scale-105">
                      <Send
                        size={22}
                      />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}