import { Container } from "@/components/ui/container";
import { PlaceholderPanel } from "@/components/ui/placeholder-panel";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  ABOUT_TEAM,
  ABOUT_TEAM_MEMBERS,
  type TeamMember,
} from "@/lib/about-us";

/**
 * Close-up studio-style portrait placeholder used while real headshots are
 * unavailable. It fills the image area of the card so the name overlay reads
 * like a real team photo; supplying `member.image` replaces it entirely.
 */
function PortraitPlaceholder() {
  return (
    <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_18%,#3a4756_0%,#202932_55%,#131a21_100%)]">
      <svg
        aria-hidden="true"
        viewBox="0 0 400 500"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        <g fill="#93a0ad">
          <path d="M20 500c8-96 84-152 180-152s172 56 180 152Z" />
          <rect x="160" y="300" width="80" height="72" rx="28" />
          <ellipse cx="200" cy="212" rx="94" ry="112" />
        </g>
        <g fill="#c4ced9" opacity="0.4">
          <ellipse cx="200" cy="196" rx="94" ry="96" />
        </g>
        <ellipse
          cx="248"
          cy="150"
          rx="70"
          ry="86"
          fill="none"
          stroke="#e7edf5"
          strokeOpacity="0.3"
          strokeWidth="8"
        />
      </svg>
      <span className="absolute right-4 top-4 text-[10px] font-medium uppercase tracking-[0.18em] text-white/45">
        Portrait placeholder
      </span>
    </div>
  );
}

export type AboutTeamProps = {
  /** Profiles to render; defaults to the developer-owned list in the content module. */
  members?: readonly TeamMember[];
};

/**
 * The Team section — the second of About Us's three fixed sections. Each card
 * is image-first: the name and position sit as an overlay on the bottom-left of
 * the image, with the short quote in the content area below. Adding real
 * portraits is a matter of setting `member.image` in the content module.
 */
export function AboutTeam({ members = ABOUT_TEAM_MEMBERS }: AboutTeamProps) {
  return (
    <section id="team" className="scroll-mt-28 bg-white py-20 lg:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            title={ABOUT_TEAM.title}
            description={ABOUT_TEAM.description}
          />
        </Reveal>

        {members.length === 0 ? (
          <Reveal delay={120} className="mt-12">
            <PlaceholderPanel
              kind="media"
              label={ABOUT_TEAM.empty.label}
              detail={ABOUT_TEAM.empty.detail}
            />
          </Reveal>
        ) : (
          <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member, index) => (
              <li key={member.name}>
                <Reveal delay={(index % 3) * 90} className="h-full">
                  <article className="flex h-full flex-col overflow-hidden rounded-card border border-ink-200 bg-white shadow-card">
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-ink-950">
                      {member.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={member.image}
                          alt={member.name}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : (
                        <PortraitPlaceholder />
                      )}

                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink-950/90 via-ink-950/45 to-transparent"
                      />
                      <div className="absolute inset-x-0 bottom-0 p-5">
                        <h3 className="text-h3 text-white">{member.name}</h3>
                        <p className="mt-1 text-sm font-semibold text-white/80">
                          {member.role}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      {member.bio && (
                        <p className="text-sm leading-relaxed text-ink-600">
                          {member.bio}
                        </p>
                      )}
                    </div>
                  </article>
                </Reveal>
              </li>
            ))}
          </ul>
        )}

        {members.length > 0 && (
          <p className="mt-8 text-sm text-ink-500">
            {ABOUT_TEAM.temporaryNote}
          </p>
        )}
      </Container>
    </section>
  );
}
