import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/app/api/auth/_lib/supabaseserver";
import { getUserPresence } from "@/lib/queries/presence";

export const runtime = "edge";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const supabase = createSupabaseAdminClient();
  const { username } = await params;
  const usernameParam = String(username || "").trim().toLowerCase();

  const { data: userData } = await supabase
    .from("users")
    .select(
      "user_id, username, firstname, lastname, profession, public_mode",
    )
    .ilike("username", usernameParam)
    .maybeSingle();

  const baseBackground = "#020617"; // slate-950

  if (!userData || !userData.public_mode) {
    return new ImageResponse(
      (
        <div
          style={{
            width: 1200,
            height: 630,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "80px 96px",
            backgroundColor: baseBackground,
            color: "#e5e7eb",
            fontSize: 40,
          }}
        >
          <div
            style={{
              fontSize: 28,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#9ca3af",
            }}
          >
            En ce moment
          </div>
          <div
            style={{
              marginTop: 32,
              fontWeight: 700,
            }}
          >
            Profil non disponible
          </div>
          <div
            style={{
              marginTop: 16,
              fontSize: 24,
              maxWidth: 780,
              lineHeight: 1.4,
              color: "#9ca3af",
            }}
          >
            Ce profil n’est pas public ou n’existe pas sur En ce moment.
          </div>
        </div>
      ),
    );
  }

  const displayName = `${(userData.firstname || "").trim()} ${(userData.lastname || "").trim()}`
    .trim()
    .replace(/\s+/g, " ");
  const niceName = displayName || `@${userData.username}`;

  const { data: presence } = await getUserPresence(supabase, userData.user_id);

  const statusLabel =
    presence?.status === "PAUSE"
      ? "En pause"
      : presence?.status === "OFFLINE"
        ? "Hors ligne"
        : "Au travail";

  const activity =
    (presence?.current_activity || "").trim() ||
    "Aucune activité publique en cours.";

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "56px 72px",
          gap: 40,
          backgroundColor: baseBackground,
          color: "#e5e7eb",
          fontSize: 40,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            maxWidth: 960,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 24,
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 24,
                backgroundColor: "#020617",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 20px 60px rgba(15,23,42,0.75)",
              }}
            >
              <span
                style={{
                  fontSize: 40,
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                }}
              >
                E
              </span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                }}
              >
                En ce moment
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 20,
                  color: "#9ca3af",
                }}
              >
                Profil public de {niceName}
              </div>
            </div>
          </div>

          {/* @username en haut à droite */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 18px",
              borderRadius: 999,
              border: "1px solid rgba(148,163,184,0.5)",
              backgroundColor: "rgba(15,23,42,0.7)",
              fontSize: 18,
              fontWeight: 600,
              maxWidth: 260,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            @{userData.username}
          </div>
        </div>

        {/* Carte d'activité (design proche de la carte profil publique) */}
        <div
          style={{
            width: "100%",
            maxWidth: 960,
            borderRadius: 32,
            backgroundColor: "rgba(15,23,42,0.9)",
            padding: "32px 36px",
            boxShadow: "0 26px 80px rgba(15,23,42,0.9)",
            border: "1px solid rgba(148,163,184,0.4)",
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: "-0.03em",
            }}
          >
            {activity}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 12,
              fontSize: 20,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                backgroundColor:
                  presence?.status === "PAUSE"
                    ? "#eab308"
                    : presence?.status === "OFFLINE"
                      ? "#9ca3af"
                      : "#22c55e",
              }}
            />
            <span
              style={{
                color: "#9ca3af",
              }}
            >
              Statut&nbsp;:
            </span>
            <span>{statusLabel}</span>
          </div>
        </div>
      </div>
    ),
  );
}

