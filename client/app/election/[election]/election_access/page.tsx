"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { getJWT, getUserID } from "@/data/cookies/getCookies";
import { APIENDPOINTS } from "@/data/urls";
import { decryptId } from "@/utils/encryption";
import axios from "axios";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Select from "react-select";

export interface ElectionAccess {
  election_accessid: number;
  electionid: number;
  session: string;
  allowed_sessions: string[];
}

const all_batches = ["2020", "2021", "2022", "2023", "2024"];

function Page({ params }: { params: { election: string } }) {
  const router = useRouter();
  const nth = decryptId(params.election, "election_access") || 0;

  const [disabled, setDisabled] = useState(false);
  const [ElectionAccess, setElectionAccess] = useState<ElectionAccess[] | null>(
    null
  );
  const [inputElectionAccess, setInputElectionAccess] =
    useState<ElectionAccess>({
      election_accessid: 0,
      electionid: 0,
      session: "",
      allowed_sessions: [],
    });

  const fetch_info = async (nth: number) => {
    try {
      const res = await axios.get(
        `${APIENDPOINTS.election.getAllElectionAccessByElectionId}/${nth}`
      );
      setElectionAccess(res.data);
    } catch (err) {
      console.error("Error fetching election access:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDisabled(true);

    const uid = getUserID();
    if (!uid) {
      router.push("/");
      return;
    }

    const data = {
      electionid: nth,
      session: inputElectionAccess.session,
      allowed_sessions: inputElectionAccess.allowed_sessions,
    };

    try {
      await axios
        .post(`${APIENDPOINTS.election.createElectionAccess}`, data, {
          headers: { Authorization: `Bearer ${getJWT()}` },
        })
        .then((res) => {
          if (res.status === 201) {
            toast({
              title: "Election Access Created",
              description: "Election access has been created successfully.",
              duration: 3000,
            });
          }
          setInputElectionAccess({
            election_accessid: 0,
            electionid: 0,
            session: "",
            allowed_sessions: [],
          });
          fetch_info(nth);
        });
    } catch (err) {
      console.error("Create error:", err);
    } finally {
      setDisabled(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios
        .delete(`${APIENDPOINTS.election.deleteElectionAccess}/${id}`, {
          headers: { Authorization: `Bearer ${getJWT()}` },
        })
        .then((res) => {
          if (res.status === 200) {
            toast({
              title: "Election Access Deleted",
              description: "Election access has been deleted successfully.",
              duration: 3000,
            });
          }
        });
      fetch_info(nth);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleEdit = (access: ElectionAccess) => {
    setInputElectionAccess(access);
  };

  useEffect(() => {
    const uid = getUserID();
    if (!uid) {
      router.push("/");
      return;
    }
    fetch_info(nth);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-4 text-white bg-black min-h-screen">
      <h1 className="text-3xl font-bold text-red-600 mb-6">
        Election Access Management
      </h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md mb-6 bg-neutral-900 p-4 rounded-xl shadow"
      >
        <div className="mb-4">
          <label className="block mb-2 text-red-400">Select Session:</label>
          <Select
            options={all_batches.map((batch) => ({
              value: batch,
              label: batch,
            }))}
            onChange={(selected) =>
              setInputElectionAccess({
                ...inputElectionAccess,
                session: selected?.value || "",
              })
            }
            value={
              inputElectionAccess.session
                ? {
                    value: inputElectionAccess.session,
                    label: inputElectionAccess.session,
                  }
                : null
            }
            className="text-black"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-red-400">Allowed Sessions:</label>
          <Select
            options={all_batches.map((batch) => ({
              value: batch,
              label: batch,
            }))}
            isMulti
            onChange={(selectedOptions) =>
              setInputElectionAccess({
                ...inputElectionAccess,
                allowed_sessions: selectedOptions.map((opt) => opt.value),
              })
            }
            value={inputElectionAccess.allowed_sessions.map((session) => ({
              value: session,
              label: session,
            }))}
            className="text-black"
          />
        </div>

        <Button
          type="submit"
          disabled={disabled}
          className="bg-red-600 hover:bg-red-700 text-white w-full"
        >
          Submit
        </Button>
      </form>

      {ElectionAccess ? (
        <div className="w-full max-w-4xl">
          <h2 className="text-2xl font-semibold mb-4 text-red-400">
            Election Access List
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {ElectionAccess.map((access) => (
              <Card
                key={access.election_accessid}
                className="bg-neutral-900 text-white"
              >
                <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div>
                    <p className="text-lg font-bold text-red-500">
                      Session: {access.session}
                    </p>
                    <p className="text-sm text-gray-300">
                      Allowed: {access.allowed_sessions.join(", ")}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <Button
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-900"
                      onClick={() => handleEdit(access)}
                    >
                      <Pencil className="h-4 w-4 mr-2" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-900"
                      onClick={() => handleDelete(access.election_accessid)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-4 text-gray-400">Loading election access data...</p>
      )}
    </div>
  );
}

export default Page;
