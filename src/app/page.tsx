import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createSupabaseServerClientForServerComponent } from "@/app/api/auth/_lib/supabaseserver";
import { TypingWord } from "@/components/landing/typing-word";

export const metadata: Metadata = {
  title: "En ce moment – Suivi d’activité simple et lisible",
  description:
    "En ce moment te permet d’indiquer ce que tu fais maintenant, ton statut (travail, pause ou hors ligne) et de partager une page publique propre – ou de tout garder privé.",
  openGraph: {
    title: "En ce moment – Dis ce que tu fais. C’est tout.",
    description:
      "Une mini‑app minimaliste pour afficher ton activité actuelle, ton statut et une page publique claire pour ton entourage, tes clients ou ton équipe.",
  },
};

export default async function Home() {
  const supabase = await createSupabaseServerClientForServerComponent();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = Boolean(user);

  return (
    <div className="min-h-screen bg-linear-to-b from-fuchsia-50 via-white to-white overflow-x-hidden">
      <header className="mx-auto max-w-6xl px-4 pt-4 sm:px-6 sm:pt-6">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <Link
            href="/"
            className="inline-flex shrink-0 items-center gap-2 text-gray-900 font-extrabold tracking-tight"
            aria-label="En ce moment"
          >
            <Image
              src="/logo.png"
              alt="En ce moment"
              width={36}
              height={36}
              className="h-9 w-9 shrink-0 rounded-xl object-cover sm:h-9 sm:w-9"
              priority
            />
            <span className="hidden whitespace-nowrap text-base sm:inline sm:text-lg">
              En ce moment
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a className="hover:text-gray-900 transition" href="#how">
              Comment ça marche
            </a>
            <a className="hover:text-gray-900 transition" href="#features">
              Fonctionnalités
            </a>
            <a className="hover:text-gray-900 transition" href="#faq">
              FAQs
            </a>
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-gray-900 px-3 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-gray-800 transition sm:min-h-0 sm:px-4 sm:py-2 sm:text-sm"
              >
                <span className="whitespace-nowrap">Mon dashboard</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-white/80 px-3 py-2.5 text-xs font-semibold text-gray-800 ring-1 ring-gray-200 shadow-sm hover:bg-white transition sm:min-h-0 sm:px-4 sm:py-2 sm:text-sm"
                >
                  <span className="whitespace-nowrap">Se connecter</span>
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-gray-900 px-3 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-gray-800 transition sm:min-h-0 sm:px-4 sm:py-2 sm:text-sm"
                >
                  <span className="whitespace-nowrap">Créer un compte</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <section className="lg:col-span-6">
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-3 py-1.5 text-xs text-gray-700 shadow-sm sm:px-4 sm:py-2 sm:text-sm">
              <span className="shrink-0 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 sm:h-2 sm:w-2" />
              <span className="min-w-0 wrap-break-word">
                Minimaliste • activité • statut • page publique
              </span>
            </div>

            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.02]">
              Dis ce que tu fais.
              <br />
              C’est tout.
            </h1>

            <p className="mt-5 text-base sm:text-lg text-gray-600 max-w-xl">
              <span className="font-semibold text-gray-900">En ce moment</span>{" "}
              te permet d’indiquer ton activité actuelle, ton statut (travail,
              pause ou hors ligne) et de la partager via une page publique — ou
              de tout garder privé.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition"
              >
                Commencer
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-gray-800 ring-1 ring-gray-200 shadow-sm hover:bg-gray-50 transition"
              >
                J’ai déjà un compte
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 text-xs text-gray-600">
              <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-3 py-1">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                Données sécurisées
              </span>
              <span className="inline-flex items-center rounded-full border border-gray-200 bg-white/70 px-3 py-1">
                Mode public optionnel
              </span>
              <span className="inline-flex items-center rounded-full border border-gray-200 bg-white/70 px-3 py-1">
                Accès contrôlé par compte
              </span>
            </div>

            {/* micro-texts removed (keep landing minimal) */}
          </section>

          <section className="lg:col-span-6">
            <div className="relative">
              {/* premium glow */}
              <div className="pointer-events-none absolute -inset-10 rounded-[3rem] bg-linear-to-r from-fuchsia-300/35 via-pink-300/30 to-indigo-300/35 blur-3xl" />
              <div className="relative overflow-hidden rounded-[2.75rem] border border-gray-200 bg-white/55 backdrop-blur-xl shadow-[0_20px_80px_-50px_rgba(17,24,39,0.35)]">
                {/* subtle highlight */}
                <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/55 via-white/20 to-transparent" />

                <div className="relative px-6 pb-6 pt-6 sm:px-8 sm:pb-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-400/90" />
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-300/90" />
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/90" />
                    </div>
                    <span className="text-xs font-semibold text-gray-600">
                      Profil public
                    </span>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm">
                        <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                        Travail
                      </span>
                      <span className="text-xs text-gray-500">
                        En ce moment
                      </span>
                    </div>

                    <p className="mt-5 max-w-full text-[clamp(1.2rem,3.8vw,2.25rem)] font-extrabold tracking-tight leading-[1.05] text-gray-900">
                      Je suis en train d&apos;
                      <TypingWord
                        text="écrire un livre"
                        cycles={2}
                        className="bg-clip-text text-transparent bg-linear-to-r from-fuchsia-600 to-indigo-600"
                      />
                    </p>
                    <p className="mt-3 text-sm text-gray-600 max-w-lg">
                      Une phrase claire, lisible, qui dit exactement ce que tu
                      fais.
                    </p>
                  </div>

                  <div className="mt-7 grid grid-cols-1 gap-3">
                    <div className="rounded-3xl border border-gray-200 bg-white/70 p-4 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Activités récentes
                      </p>
                      <div className="mt-3 space-y-2">
                        {[
                          {
                            name: "Coder",
                            tag: "Travail",
                            when: "il y a 15 min",
                          },
                          {
                            name: "Faire du vélo",
                            tag: "Sport",
                            when: "il y a 1 h",
                          },
                          {
                            name: "Lecture",
                            tag: "Personnel",
                            when: "il y a 3 h",
                          },
                        ].map((t) => (
                          <div
                            key={t.name}
                            className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white/65 px-4 py-3"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {t.name}{" "}
                                <span className="text-gray-400 font-normal">
                                  —{" "}
                                </span>
                                <span className="text-gray-700 font-semibold">
                                  {t.tag}
                                </span>
                              </p>
                            </div>
                            <p className="shrink-0 text-xs font-semibold text-gray-500">
                              {t.when}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section id="features" className="mt-14">
          <div className="rounded-4xl border border-gray-200 bg-white/70 backdrop-blur shadow-sm p-6 sm:p-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
              Fonctionnalités
            </h2>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-gray-900">
                  Ton activité actuelle
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  Une phrase claire qui décrit ce que tu fais maintenant.
                  Compréhensible en une seconde.
                </p>
                <p className="mt-4 text-sm font-semibold text-gray-900">
                  Exemple affiché
                </p>
                <p className="mt-2 text-base font-extrabold tracking-tight text-gray-900">
                  Je suis en train d’{" "}
                  <span className="bg-clip-text text-transparent bg-linear-to-r from-fuchsia-600 to-indigo-600">
                    écrire un livre
                  </span>
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-gray-900">
                  Activités récentes
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  Un historique court et clair. Tu vois l’essentiel, tout de
                  suite.
                </p>
                <div className="mt-4 space-y-2">
                  {[
                    "Coder — Travail",
                    "Faire du vélo — Sport",
                    "Lecture — Personnel",
                  ].map((line) => (
                    <div
                      key={line}
                      className="rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2 text-sm font-semibold text-gray-800"
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-gray-900">Statut</p>
                <p className="mt-2 text-sm text-gray-600">
                  Travail, pause ou hors ligne — visible immédiatement.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-700">
                  <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 shadow-sm">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                    Travail
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 shadow-sm">
                    <span className="inline-block h-2 w-2 rounded-full bg-yellow-400" />
                    Pause
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 shadow-sm">
                    <span className="inline-block h-2 w-2 rounded-full bg-gray-300" />
                    Hors ligne
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="mt-14">
          <div className="rounded-4xl border border-gray-200 bg-white/70 backdrop-blur shadow-sm p-6 sm:p-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
              Comment ça marche
            </h2>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  title: "1. Décris ton activité",
                  desc: "Écris simplement ce que tu fais. Ajoute un tag si tu veux.",
                },
                {
                  title: "2. Choisis ton statut",
                  desc: "Travail, pause ou hors ligne — visible immédiatement.",
                },
                {
                  title: "3. Partage (ou pas)",
                  desc: "Active une page publique et partage le lien. Sinon, tout reste privé.",
                },
              ].map((c) => (
                <div
                  key={c.title}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <p className="text-sm font-semibold text-gray-900">
                    {c.title}
                  </p>
                  <p className="mt-2 text-sm text-gray-600">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                title: "Lisible",
                desc: "Une information claire, sans bruit.",
              },
              {
                title: "Simple",
                desc: "Pas de minuteur. Pas de friction. Juste l’essentiel.",
              },
              {
                title: "Partageable",
                desc: "Une page publique propre pour proches ou équipe.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur p-6 shadow-sm"
              >
                <p className="text-sm font-semibold text-gray-900">{f.title}</p>
                <p className="mt-2 text-sm text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="faq" className="mt-14">
          <div className="rounded-4xl border border-gray-200 bg-white/70 backdrop-blur shadow-sm p-6 sm:p-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
              FAQs
            </h2>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                {
                  q: "C’est public par défaut ?",
                  a: "Non. Le mode public est entièrement optionnel.",
                },
                {
                  q: "On peut seulement consulter ?",
                  a: "Oui. La page publique est 100 % en lecture seule.",
                },
              ].map((x) => (
                <div
                  key={x.q}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <p className="text-sm font-semibold text-gray-900">{x.q}</p>
                  <p className="mt-2 text-sm text-gray-600">{x.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer
        className="mt-20 w-full overflow-hidden bg-linear-to-b from-slate-50/60 via-white/80 to-slate-100/70 pt-20 pb-12 text-center backdrop-blur-xl"
        aria-label="Pied de page"
      >
        {/* Grand marqueur centré */}
        <p
          className="text-4xl font-extrabold tracking-[0.2em] text-slate-300/90 selection:bg-slate-200/50 sm:text-7xl md:text-8xl lg:text-9xl"
          style={{ textShadow: "0 1px 2px rgba(255,255,255,0.9)" }}
        >
          EN CE MOMENT
        </p>

        <div className="mx-auto mt-10 max-w-2xl pt-6">
          <p className="mt-8 text-xs tracking-wide text-slate-400">
            © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
