// import CandidateCard from "@/components/dashboardpage/ApproveNomination/card";
// import React, { useState } from "react";

// interface CandidateInfo {
//   candidate_id: number;
//   electionid: number;
//   userId: number;
//   marka_name: string;
//   slogan?: string;
//   logo_url?: string;
//   committeepostid: number;
//   request_approval_status: boolean;
// }

// const dummyCandidates: CandidateInfo[] = [
//   {
//     candidate_id: 1,
//     electionid: 101,
//     userId: 201,
//     marka_name: "Lion",
//     slogan: "Leadership for the future",
//     logo_url: "https://example.com/lion.png",
//     committeepostid: 301,
//     request_approval_status: false,
//   },
//   {
//     candidate_id: 2,
//     electionid: 102,
//     userId: 202,
//     marka_name: "Eagle",
//     slogan: "Soaring to new heights",
//     logo_url: "https://example.com/eagle.png",
//     committeepostid: 302,
//     request_approval_status: true,
//   },
//   {
//     candidate_id: 3,
//     electionid: 103,
//     userId: 203,
//     marka_name: "Tiger",
//     slogan: "Strength and courage",
//     logo_url: "https://example.com/tiger.png",
//     committeepostid: 303,
//     request_approval_status: false,
//   },
// ];

// const ApprovingCandidate: React.FC = () => {
//   const [candidates, setCandidates] =
//     useState<CandidateInfo[]>(dummyCandidates);

//   const refreshCandidates = () => {
//     // Simulate reloading candidates after an action
//     setCandidates([...candidates]);
//   };

//   return (
//     <div className="p-4">
//       <h2 className="text-2xl font-bold text-white mb-4">Approve Candidates</h2>
//       {candidates.length === 0 ? (
//         <p className="text-gray-400">No candidates available.</p>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//           {candidates.map((candidate) => (
//             <CandidateCard
//               key={candidate.candidate_id}
//               candidate={candidate}
//               refreshCandidates={refreshCandidates}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ApprovingCandidate;

function ApproveNomination() {
  return <div>This is shaeakh</div>;
}

export default ApproveNomination;
