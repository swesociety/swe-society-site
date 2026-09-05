import StandingsView from "@/components/election/StandingsView";

interface PageProps {
  params: { election: string };
}

export default function Page({ params }: PageProps) {
  return <StandingsView electionParam={params.election} />;
}

