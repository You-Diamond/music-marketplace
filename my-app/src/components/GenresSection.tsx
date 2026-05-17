import Link from "next/link"

const genres = [
  {
    title: "Trap",
    image:
      "/images/genres/trap.jpg",
  },

  {
    title: "Drill",
    image:
      "/images/genres/drill.jpg",
  },

  {
    title: "Rage",
    image:
      "/images/genres/rage.jpg",
  },

  {
    title: "Detroit",
    image:
      "/images/genres/detroit.jpg",
  },

  {
    title: "Pluggnb",
    image:
      "/images/genres/pluggnb.jpg",
  },

  {
    title: "Hyperpop",
    image:
      "/images/genres/hyperpop.jpg",
  },
]

export default function GenresSection() {
  return (
    <section className="px-6 py-24 lg:px-10">
      <div className="mx-auto max-w-[1800px]">
        <div className="flex items-end justify-between gap-10">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">
              Explore
            </p>

            <h2 className="mt-4 text-5xl font-black uppercase md:text-6xl">
              Genres
            </h2>
          </div>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {genres.map(
            (genre) => (
              <Link
                key={
                  genre.title
                }
                href={`/discover?genre=${genre.title}`}
                className="group relative overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.03]"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                <div
                  className="h-[320px] bg-cover bg-center transition duration-700 group-hover:scale-105"
                  style={{
                    backgroundImage: `url(${genre.image})`,
                  }}
                />

                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="text-4xl font-black uppercase">
                    {
                      genre.title
                    }
                  </h3>
                </div>
              </Link>
            )
          )}
        </div>
      </div>
    </section>
  )
}