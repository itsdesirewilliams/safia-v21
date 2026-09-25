import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ROUTES } from "@/lib/routes";

export default function NotFound() {
  return (
    <div className="bg-white">
      <Container size="narrow" className="py-24 text-center lg:py-32">
        <h1 className="text-h1 text-balance text-ink-950">Page Not Found</h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-600">
          The page you are looking for does not exist or has moved.
        </p>
        <div className="mt-10 flex justify-center">
          <ButtonLink href={ROUTES.home} variant="dark" size="lg">
            Back to home
          </ButtonLink>
        </div>
      </Container>
    </div>
  );
}
