import { Container } from "@/components/ui/container";
import { PlaceholderPanel } from "@/components/ui/placeholder-panel";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  ABOUT_TEAM,
  ABOUT_TEAM_MEMBERS,
  type TeamMember,
} from "@/lib/about-us";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export type AboutTeamProps = {
  /** Profiles to render; defaults to the developer-owned list in the content module. */
  members?: readonly TeamMember[];
};

/**
 * The Team section — the second of About Us's three fixed sections. No
 * team-member profiles have been supplied, so the default list is empty and the
 * section renders a labelled placeholder rather than inventing names; adding
 * entries to `ABOUT_TEAM_MEMBERS` populates the grid with no other change.
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
                    {member.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={member.image}
                        alt={member.name}
                        className="block aspect-[4/5] w-full bg-ink-100"
                      />
                    ) : (
                      <div
                        aria-hidden="true"
                        className="flex aspect-[4/5] w-full items-center justify-center bg-ink-950 text-4xl font-extrabold tracking-tight text-white/80"
                      >
                        {initials(member.name)}
                      </div>
                    )}

                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="text-h3 text-ink-950">{member.name}</h3>
                      <p className="mt-2 text-sm font-semibold text-brand-600">
                        {member.role}
                      </p>
                      {member.bio && (
                        <p className="mt-4 text-sm leading-relaxed text-ink-600">
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
      </Container>
    </section>
  );
}
