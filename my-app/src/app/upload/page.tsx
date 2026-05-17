"use client"

import { useState } from "react"

import {
  Upload,
  Image as ImageIcon,
  Music2,
  FileArchive,
  Plus,
  X,
} from "lucide-react"

import clsx from "clsx"

import { DEFAULT_LICENSES } from "@/constants/licenses"

export default function UploadPage() {
  const [
    tags,
    setTags,
  ] = useState<string[]>([
    "dark",
    "trap",
  ])

  const [
    tagInput,
    setTagInput,
  ] = useState("")

  const [
    visibility,
    setVisibility,
  ] = useState<
    "public" | "private" | "unlisted"
  >("public")

  const [
    licenses,
    setLicenses,
  ] = useState(
    DEFAULT_LICENSES
  )

  function addTag() {
    if (!tagInput.trim())
      return

    setTags((prev) => [
      ...prev,
      tagInput.trim(),
    ])

    setTagInput("")
  }

  function removeTag(
    tag: string
  ) {
    setTags((prev) =>
      prev.filter(
        (item) =>
          item !== tag
      )
    )
  }

  function toggleLicense(
    id: string
  ) {
    setLicenses((prev) =>
      prev.map((license) =>
        license.id === id
          ? {
              ...license,
              enabled:
                !license.enabled,
            }
          : license
      )
    )
  }

  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-white/5 blur-[180px]" />
        </div>

        <div className="relative mx-auto max-w-[1400px] px-6 py-24 lg:px-10">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">
              Publishing
            </p>

            <h1 className="mt-6 text-6xl font-black uppercase leading-none md:text-7xl">
              Upload Beat
            </h1>
          </div>

          <div className="mt-16 grid gap-8 xl:grid-cols-[1fr_420px]">
            <div className="space-y-8">
              <div className="rounded-[40px] border border-white/10 bg-white/[0.03] p-8">
                <h2 className="text-3xl font-black uppercase">
                  Beat Information
                </h2>

                <div className="mt-10 grid gap-6">
                  <div>
                    <label className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                      Beat Title
                    </label>

                    <input
                      placeholder="Dark Horizon"
                      className="mt-3 h-16 w-full rounded-2xl border border-white/10 bg-black/30 px-6 outline-none transition focus:border-white/20"
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                      Description
                    </label>

                    <textarea
                      rows={6}
                      placeholder="Describe your beat..."
                      className="mt-3 w-full rounded-2xl border border-white/10 bg-black/30 px-6 py-5 outline-none transition focus:border-white/20"
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-3">
                    <div>
                      <label className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                        Genre
                      </label>

                      <input
                        placeholder="Trap"
                        className="mt-3 h-16 w-full rounded-2xl border border-white/10 bg-black/30 px-6 outline-none transition focus:border-white/20"
                      />
                    </div>

                    <div>
                      <label className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                        BPM
                      </label>

                      <input
                        type="number"
                        placeholder="140"
                        className="mt-3 h-16 w-full rounded-2xl border border-white/10 bg-black/30 px-6 outline-none transition focus:border-white/20"
                      />
                    </div>

                    <div>
                      <label className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                        Key
                      </label>

                      <input
                        placeholder="F Minor"
                        className="mt-3 h-16 w-full rounded-2xl border border-white/10 bg-black/30 px-6 outline-none transition focus:border-white/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                      Tags
                    </label>

                    <div className="mt-3 flex gap-3">
                      <input
                        value={
                          tagInput
                        }
                        onChange={(
                          e
                        ) =>
                          setTagInput(
                            e.target
                              .value
                          )
                        }
                        placeholder="dark trap rage..."
                        className="h-16 flex-1 rounded-2xl border border-white/10 bg-black/30 px-6 outline-none transition focus:border-white/20"
                      />

                      <button
                        type="button"
                        onClick={
                          addTag
                        }
                        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-black"
                      >
                        <Plus
                          size={22}
                        />
                      </button>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      {tags.map(
                        (tag) => (
                          <div
                            key={
                              tag
                            }
                            className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-5 py-3"
                          >
                            <span className="text-sm font-medium">
                              #
                              {
                                tag
                              }
                            </span>

                            <button
                              onClick={() =>
                                removeTag(
                                  tag
                                )
                              }
                            >
                              <X
                                size={
                                  16
                                }
                              />
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[40px] border border-white/10 bg-white/[0.03] p-8">
                <h2 className="text-3xl font-black uppercase">
                  Files
                </h2>

                <div className="mt-10 grid gap-6 md:grid-cols-3">
                  <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[32px] border border-dashed border-white/10 bg-black/30 p-8 text-center">
                    <ImageIcon
                      size={42}
                    />

                    <h3 className="mt-6 text-lg font-black uppercase">
                      Cover Image
                    </h3>

                    <p className="mt-3 text-sm text-zinc-500">
                      JPG, PNG
                    </p>
                  </div>

                  <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[32px] border border-dashed border-white/10 bg-black/30 p-8 text-center">
                    <Music2
                      size={42}
                    />

                    <h3 className="mt-6 text-lg font-black uppercase">
                      Audio File
                    </h3>

                    <p className="mt-3 text-sm text-zinc-500">
                      WAV, MP3
                    </p>
                  </div>

                  <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[32px] border border-dashed border-white/10 bg-black/30 p-8 text-center">
                    <FileArchive
                      size={42}
                    />

                    <h3 className="mt-6 text-lg font-black uppercase">
                      Stems
                    </h3>

                    <p className="mt-3 text-sm text-zinc-500">
                      ZIP, RAR
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[40px] border border-white/10 bg-white/[0.03] p-8">
                <h2 className="text-3xl font-black uppercase">
                  Licenses
                </h2>

                <div className="mt-10 space-y-5">
                  {licenses.map(
                    (
                      license
                    ) => (
                      <div
                        key={
                          license.id
                        }
                        className="flex items-center justify-between rounded-[28px] border border-white/10 bg-black/30 p-6"
                      >
                        <div>
                          <h3 className="text-xl font-black uppercase">
                            {
                              license.title
                            }
                          </h3>

                          <p className="mt-3 text-sm text-zinc-500">
                            $
                            {
                              license.price
                            }
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            toggleLicense(
                              license.id
                            )
                          }
                          className={clsx(
                            "rounded-full px-6 py-3 text-xs font-black uppercase tracking-[0.2em] transition",
                            license.enabled
                              ? "bg-white text-black"
                              : "border border-white/10 bg-white/[0.03]"
                          )}
                        >
                          {license.enabled
                            ? "Enabled"
                            : "Disabled"}
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="h-fit rounded-[40px] border border-white/10 bg-white/[0.03] p-8">
              <h2 className="text-3xl font-black uppercase">
                Publishing
              </h2>

              <div className="mt-10">
                <label className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                  Visibility
                </label>

                <div className="mt-5 flex flex-col gap-4">
                  {[
                    "public",
                    "private",
                    "unlisted",
                  ].map(
                    (
                      item
                    ) => (
                      <button
                        key={
                          item
                        }
                        onClick={() =>
                          setVisibility(
                            item as
                              | "public"
                              | "private"
                              | "unlisted"
                          )
                        }
                        className={clsx(
                          "rounded-2xl border px-6 py-5 text-left text-sm font-black uppercase tracking-[0.2em] transition",
                          visibility ===
                            item
                            ? "border-white bg-white text-black"
                            : "border-white/10 bg-black/30"
                        )}
                      >
                        {item}
                      </button>
                    )
                  )}
                </div>
              </div>

              <button className="mt-14 flex w-full items-center justify-center gap-3 rounded-full bg-white px-8 py-6 text-sm font-black uppercase tracking-[0.2em] text-black transition hover:scale-[1.02]">
                <Upload
                  size={20}
                />

                Publish Beat
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}