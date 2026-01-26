import Link from "next/link";
import { createSupabaseServerClientForServerComponent } from "@/app/api/auth/_lib/supabaseserver";

export default async function Home() {
  const supabase = await createSupabaseServerClientForServerComponent();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = Boolean(user);

  return (
    <div className="min-h-screen bg-linear-to-b from-fuchsia-50 via-white to-white">
      <header className="mx-auto max-w-6xl px-6 pt-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-900 font-extrabold tracking-tight"
            aria-label="Track My Time"
          >
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gray-900 text-white shadow-sm">
              T
            </span>
            <span className="text-base sm:text-lg">Track My Time</span>
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

          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition"
              >
                Mon dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-gray-800 ring-1 ring-gray-200 shadow-sm hover:bg-white transition"
                >
                  Se connecter
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition"
                >
                  Créer un compte
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <section className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-4 py-2 text-sm text-gray-700 shadow-sm">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              <span>Nouveau: page publique + statut</span>
            </div>

            <h1 className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-[0.95]">
              Suis ton temps,
              <br />
              sans effort.
            </h1>

            <p className="mt-5 text-base sm:text-lg text-gray-600 max-w-xl">
              Track My Time te permet de définir ta tâche courante, afficher ton
              statut (travail / pause / hors ligne) et garder un historique clair
              — avec une page publique propre si tu veux partager.
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

            <div className="mt-6 flex flex-wrap gap-2 text-xs text-gray-600">
              <span className="inline-flex items-center rounded-full border border-gray-200 bg-white/70 px-3 py-1">
                Tâche courante
              </span>
              <span className="inline-flex items-center rounded-full border border-gray-200 bg-white/70 px-3 py-1">
                Statut présence
              </span>
              <span className="inline-flex items-center rounded-full border border-gray-200 bg-white/70 px-3 py-1">
                Profil public
              </span>
              <span className="inline-flex items-center rounded-full border border-gray-200 bg-white/70 px-3 py-1">
                Historique
              </span>
            </div>
          </section>

          <section className="lg:col-span-6">
            <div className="relative">
              <div className="absolute -inset-6 bg-linear-to-r from-fuchsia-300/40 via-pink-300/35 to-indigo-300/40 blur-2xl rounded-[2.5rem]" />
              <div className="relative overflow-hidden rounded-[2.5rem] border border-gray-200 bg-white/70 backdrop-blur shadow-sm">
                <div className="p-6 sm:p-8">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm">
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-600" />
                      En ligne
                    </span>
                    <span className="text-xs text-gray-500">Profil public</span>
                  </div>

                  <div className="mt-6">
                    <p className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.05] text-gray-900">
                      Je suis en train d’
                      <span className="bg-clip-text text-transparent bg-linear-to-r from-fuchsia-600 to-indigo-600">
                        écrire un livre
                      </span>
                    </p>
                    <p className="mt-3 text-sm text-gray-600">
                      Une phrase simple, lisible, qui dit exactement ce que tu
                      fais.
                    </p>
                  </div>

                  <div className="mt-7 grid grid-cols-1 gap-3">
                    <div className="rounded-2xl border border-gray-200 bg-white/80 px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Tâches récentes
                      </p>
                      <div className="mt-3 space-y-2">
                        {[
                          { name: "Coder", tag: "travail" },
                          { name: "Faire du vélo", tag: "sport" },
                          { name: "Lecture", tag: "perso" },
                        ].map((t) => (
                          <div
                            key={t.name}
                            className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-3"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {t.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {t.tag}
                              </p>
                            </div>
                            <div className="h-8 w-20 rounded-lg bg-linear-to-r from-gray-100 to-gray-50" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* decorative stripes like the reference */}
                <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-70">
                  <div className="absolute inset-0 bg-linear-to-l from-white via-white/60 to-transparent" />
                  <div className="absolute inset-0 flex">
                    {Array.from({ length: 18 }).map((_, i) => (
                      <div
                        // eslint-disable-next-line react/no-array-index-key
                        key={i}
                        className="flex-1"
                        style={{
                          background:
                            i % 2 === 0
                              ? "rgba(236,72,153,0.08)"
                              : "rgba(99,102,241,0.06)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section id="how" className="mt-20">
          <div className="rounded-4xl border border-gray-200 bg-white/70 backdrop-blur shadow-sm p-6 sm:p-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
              Comment ça marche
            </h2>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  title: "Choisis une tâche",
                  desc: "Définis une tâche courante avec un tag. La phrase se met à jour automatiquement.",
                },
                {
                  title: "Change de statut",
                  desc: "Travail, pause ou hors ligne — ton profil affiche l’info clairement.",
                },
                {
                  title: "Partage (ou pas)",
                  desc: "Active le mode public et envoie ton lien. Sinon, garde tout privé.",
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

        <section id="features" className="mt-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                title: "Lisible",
                desc: "Une phrase d’activité en grand, compréhensible en 1 seconde.",
              },
              {
                title: "Simple",
                desc: "Un dashboard sans friction pour garder ton rythme.",
              },
              {
                title: "Partageable",
                desc: "Une page publique clean pour tes proches/clients/équipe.",
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
                  a: "Non. Tu actives le mode public uniquement si tu le souhaites.",
                },
                {
                  q: "Je peux juste afficher sans actions ?",
                  a: "Oui — la page publique est pensée pour être 100% lecture seule.",
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

        <footer className="mt-14 pb-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Track My Time
        </footer>
      </main>
    </div>
  );
}
