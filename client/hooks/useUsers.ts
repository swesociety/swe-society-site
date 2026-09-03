import { useToast } from "@/components/ui/use-toast";
import { MemberDataType } from "@/data/types";
import { APIENDPOINTS } from "@/data/urls";
import { headerConfig } from "@/lib/header_config";
import axios from "axios";
import { useEffect, useState } from "react";

export const useUsers = () => {
  const [data, setData] = useState<MemberDataType[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const { toast } = useToast();

  const fetchUsers = async () => {
    const response = await axios.get(APIENDPOINTS.users.getAllUsers);
    setData(response.data);
  };

  const handleDelete = async () => {
    console.log(selectedUserIds);
    try {
      const response = await axios.delete(APIENDPOINTS.users.DelMultiUser, {
        data: { userId: selectedUserIds },
        headers: headerConfig().headers,
      });
      setData((prevData) =>
        prevData.filter((user) => !selectedUserIds.includes(user.userid))
      );
      setSelectedUserIds([]);
      if (response.status === 200) {
        toast({
          title: "Successfully deleted",
          description: `You have deleted ${selectedUserIds.length} member successfully`,
        });
      }
      return true;
    } catch (error) {
      console.error("Error deleting users:", error);
      toast({
        title: "Error!!",
        description:
          (error as any).response?.data?.message || "An error occurred",
      });
      return false;
    }
  };

  const handleRoleUpdate = async (
    userIds: number[],
    newRoleId: number
  ): Promise<boolean> => {
    try {
      const response = await axios.put(
        APIENDPOINTS.role.assignRole,
        {
          roleid: newRoleId,
          userIds,
        },
        headerConfig()
      );

      if (response.status === 200) {
        // Get the role title from the response if available, or fetch it
        const roleResponse = await axios.get(
          APIENDPOINTS.role.getRoleInfo,
          headerConfig()
        );
        const newRoleTitle =
          roleResponse.data.find(
            (role: { roleid: number; roletitle: string }) =>
              role.roleid === newRoleId
          )?.roletitle || "";

        // Update the local state to reflect the role change
        setData((prevData) =>
          prevData.map((user) =>
            userIds.includes(user.userid)
              ? {
                  ...user,
                  roleid: newRoleId,
                  roletitle: newRoleTitle,
                  role: newRoleTitle,
                }
              : user
          )
        );

        setSelectedUserIds([]); // Clear selection after successful update

        toast({
          title: "Role Updated",
          description: `Role has been updated for ${userIds.length} user(s).`,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error updating role",
        description: "Please try again later.",
      });
      return false;
    }
  };

  const handleSelectUser = (userId: number, selected: boolean) => {
    setSelectedUserIds((prev) =>
      selected ? [...prev, userId] : prev.filter((id) => id !== userId)
    );
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    data,
    selectedUserIds,
    handleDelete,
    handleSelectUser,
    setSelectedUserIds,
    handleRoleUpdate,
  };
};
