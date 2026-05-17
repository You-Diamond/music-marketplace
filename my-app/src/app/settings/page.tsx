"use client"

import { useState } from "react"

import Image from "next/image"

import {
  User,
  Shield,
  Bell,
  CreditCard,
  Truck,
  Globe,
  Camera,
  Save,
} from "lucide-react"

import clsx from "clsx"

import { COUNTRIES } from "@/constants/countries"

import { settingsMock } from "@/mocks/settings.mock"

const tabs = [
  {
    id: "profile",
    label: "Profile",
    icon: User,
  },

  {
    id: "credentials",
    label: "Credentials",
    icon: Shield,
  },

  {
    id: "socials",
    label: "Social Media",
    icon: Globe,
  },

  {
    id: "billing",
    label: "Billing Address",
    icon: CreditCard,
  },

  {
    id: "shipping",
    label: "Shipping Address",
    icon: Truck,
  },

  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
  },
]

function SectionTitle({
  title,
  description,
}: {
  title: string

  description: string
}) {
  return (
    <div>
      <h2 className="text-3xl font-black uppercase">
        {title}
      </h2>

      <p className="mt-3 text-sm text-zinc-500">
        {description}
      </p>
    </div>
  )
}

function Input({
  label,
  defaultValue,
  placeholder,
  type = "text",
}: {
  label: string

  defaultValue?: string

  placeholder?: string

  type?: string
}) {
  return (
    <div>
      <label className="text-xs uppercase tracking-[0.25em] text-zinc-500">
        {label}
      </label>

      <input
        type={type}
        defaultValue={
          defaultValue
        }
        placeholder={
          placeholder
        }
        className="mt-3 h-16 w-full rounded-2xl border border-white/10 bg-black/30 px-6 outline-none transition focus:border-white/20"
      />
    </div>
  )
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] =
    useState("profile")

  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-white/5 blur-[180px]" />
        </div>

        <div className="relative mx-auto max-w-[1800px] px-6 py-20 lg:px-10">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">
              Account
            </p>

            <h1 className="mt-6 text-6xl font-black uppercase leading-none md:text-7xl">
              Settings
            </h1>
          </div>

          <div className="mt-16 grid gap-8 xl:grid-cols-[340px_1fr]">
            <div className="h-fit rounded-[40px] border border-white/10 bg-white/[0.03] p-6">
              <div className="space-y-3">
                {tabs.map((tab) => {
                  const Icon =
                    tab.icon

                  return (
                    <button
                      key={tab.id}
                      onClick={() =>
                        setActiveTab(
                          tab.id
                        )
                      }
                      className={clsx(
                        "flex w-full items-center gap-4 rounded-2xl px-5 py-5 text-left transition",
                        activeTab ===
                          tab.id
                          ? "bg-white text-black"
                          : "hover:bg-white/[0.03]"
                      )}
                    >
                      <Icon
                        size={20}
                      />

                      <span className="text-sm font-black uppercase tracking-[0.15em]">
                        {tab.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="rounded-[40px] border border-white/10 bg-white/[0.03] p-8">
              {activeTab ===
                "profile" && (
                <div>
                  <SectionTitle
                    title="Profile"
                    description="Manage your public producer identity."
                  />

                  <div className="mt-10">
                    <div className="relative h-40 overflow-hidden rounded-[32px] border border-white/10">
                      <Image
                        src={
                          settingsMock
                            .profile
                            .banner ||
                          "/images/banner-1.jpg"
                        }
                        alt="Banner"
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="-mt-16 flex items-end gap-6 px-6">
                      <div className="relative h-32 w-32 overflow-hidden rounded-[32px] border-4 border-black">
                        <Image
                          src={
                            settingsMock
                              .profile
                              .avatar ||
                            "/images/avatar-1.jpg"
                          }
                          alt="Avatar"
                          fill
                          className="object-cover"
                        />
                      </div>

                      <button className="mb-3 flex items-center gap-3 rounded-full border border-white/10 bg-black/50 px-5 py-3 text-xs font-black uppercase tracking-[0.2em] transition hover:border-white/20">
                        <Camera
                          size={16}
                        />

                        Change Media
                      </button>
                    </div>
                  </div>

                  <div className="mt-10 grid gap-6 md:grid-cols-2">
                    <Input
                      label="First Name"
                      defaultValue={
                        settingsMock
                          .profile
                          .firstName
                      }
                    />

                    <Input
                      label="Last Name"
                      defaultValue={
                        settingsMock
                          .profile
                          .lastName
                      }
                    />

                    <Input
                      label="Display Name"
                      defaultValue={
                        settingsMock
                          .profile
                          .displayName
                      }
                    />

                    <Input
                      label="Username"
                      defaultValue={
                        settingsMock
                          .profile
                          .username
                      }
                    />
                  </div>

                  <div className="mt-6">
                    <label className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                      Biography
                    </label>

                    <textarea
                      rows={6}
                      defaultValue={
                        settingsMock
                          .profile
                          .biography
                      }
                      className="mt-3 w-full rounded-2xl border border-white/10 bg-black/30 px-6 py-5 outline-none transition focus:border-white/20"
                    />
                  </div>

                  <div className="mt-6">
                    <Input
                      label="Location"
                      defaultValue={
                        settingsMock
                          .profile
                          .location
                      }
                    />
                  </div>
                </div>
              )}

              {activeTab ===
                "credentials" && (
                <div>
                  <SectionTitle
                    title="Credentials"
                    description="Manage your login and account security."
                  />

                  <div className="mt-10 grid gap-6 md:grid-cols-2">
                    <Input
                      label="E-Mail"
                      type="email"
                      defaultValue={
                        settingsMock
                          .credentials
                          .email
                      }
                    />

                    <Input
                      label="Phone Number"
                      defaultValue={
                        settingsMock
                          .credentials
                          .phoneNumber
                      }
                    />

                    <Input
                      label="Current Password"
                      type="password"
                    />

                    <Input
                      label="New Password"
                      type="password"
                    />
                  </div>
                </div>
              )}

              {activeTab ===
                "socials" && (
                <div>
                  <SectionTitle
                    title="Social Media"
                    description="Connect your social platforms."
                  />

                  <div className="mt-10 grid gap-6">
                    <Input
                      label="Instagram"
                      defaultValue={
                        settingsMock
                          .socials
                          .instagram
                      }
                    />

                    <Input
                      label="YouTube"
                      defaultValue={
                        settingsMock
                          .socials
                          .youtube
                      }
                    />

                    <Input
                      label="TikTok"
                      defaultValue={
                        settingsMock
                          .socials
                          .tiktok
                      }
                    />

                    <Input
                      label="SoundCloud"
                      defaultValue={
                        settingsMock
                          .socials
                          .soundcloud
                      }
                    />

                    <Input
                      label="Telegram"
                      defaultValue={
                        settingsMock
                          .socials
                          .telegram
                      }
                    />

                    <Input
                      label="VK"
                      defaultValue={
                        settingsMock
                          .socials.vk
                      }
                    />
                  </div>
                </div>
              )}

              {(activeTab ===
                "billing" ||
                activeTab ===
                  "shipping") && (
                <div>
                  <SectionTitle
                    title={
                      activeTab ===
                      "billing"
                        ? "Billing Address"
                        : "Shipping Address"
                    }
                    description="Used for payments, invoices and licensing contracts."
                  />

                  {(() => {
                    const data =
                      activeTab ===
                      "billing"
                        ? settingsMock.billingAddress
                        : settingsMock.shippingAddress

                    return (
                      <div className="mt-10 grid gap-6 md:grid-cols-2">
                        <Input
                          label="Company Name"
                          defaultValue={
                            data.companyName
                          }
                        />

                        <Input
                          label="Phone"
                          defaultValue={
                            data.phone
                          }
                        />

                        <Input
                          label="First Name"
                          defaultValue={
                            data.firstName
                          }
                        />

                        <Input
                          label="Last Name"
                          defaultValue={
                            data.lastName
                          }
                        />

                        <Input
                          label="Unit / Apartment"
                          defaultValue={
                            data.unit
                          }
                        />

                        <Input
                          label="Street Address"
                          defaultValue={
                            data.streetAddress
                          }
                        />

                        <Input
                          label="City"
                          defaultValue={
                            data.city
                          }
                        />

                        <Input
                          label="State / Province"
                          defaultValue={
                            data.stateOrProvince
                          }
                        />

                        <div>
                          <label className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                            Country
                          </label>

                          <select
                            defaultValue={
                              data.country
                            }
                            className="mt-3 h-16 w-full rounded-2xl border border-white/10 bg-black/30 px-6 outline-none"
                          >
                            {COUNTRIES.map(
                              (
                                country
                              ) => (
                                <option
                                  key={
                                    country
                                  }
                                  value={
                                    country
                                  }
                                >
                                  {
                                    country
                                  }
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        <Input
                          label="ZIP / Postal Code"
                          defaultValue={
                            data.zipCode
                          }
                        />
                      </div>
                    )
                  })()}
                </div>
              )}

              {activeTab ===
                "notifications" && (
                <div>
                  <SectionTitle
                    title="Notifications"
                    description="Choose what notifications you want to receive."
                  />

                  <div className="mt-10 space-y-5">
                    {Object.entries(
                      settingsMock.notifications
                    ).map(
                      (
                        [
                          key,
                          value,
                        ]
                      ) => (
                        <div
                          key={key}
                          className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 p-6"
                        >
                          <div>
                            <h3 className="text-lg font-black uppercase">
                              {key.replace(
                                /([A-Z])/g,
                                " $1"
                              )}
                            </h3>
                          </div>

                          <button
                            className={clsx(
                              "relative h-8 w-16 rounded-full transition",
                              value
                                ? "bg-white"
                                : "bg-zinc-700"
                            )}
                          >
                            <div
                              className={clsx(
                                "absolute top-1 h-6 w-6 rounded-full bg-black transition",
                                value
                                  ? "left-9"
                                  : "left-1"
                              )}
                            />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              <div className="mt-14 flex justify-end">
                <button className="flex items-center gap-3 rounded-full bg-white px-8 py-5 text-sm font-black uppercase tracking-[0.2em] text-black transition hover:scale-[1.02]">
                  <Save
                    size={18}
                  />

                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}