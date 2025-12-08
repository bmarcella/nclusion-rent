import { Tabs } from "@/components/ui/Tabs";
import TabContent from "@/components/ui/Tabs/TabContent";
import TabList from "@/components/ui/Tabs/TabList";
import TabNav from "@/components/ui/Tabs/TabNav";
import SelectTypeRequest from "./SelectTypeRequest";
import { AuthRequest } from "../../AuthRequest/AuthRequest";
import { useEffect, useState } from "react";
import CreateRequestForm from "./CreateRequestForm";
import { useSessionUser } from "@/store/authStore";

export const Request = () => {
  // Persisted tab
  const [tab, setTab] = useState<"tab1" | "tab2">("tab1");
  const [selectedType, setSelectedType] = useState<any>();
  const { authority } = useSessionUser((state) => state.user);

  // Load initial tab from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("request_tab");
    if (saved == "tab1" || saved == "tab2") {
      setTab(saved);
    }
  }, []);

  // Save tab when it changes
  const handleTabChange = (value: string) => {
    setTab(value as "tab1" | "tab2");
    if (typeof window !== "undefined") {
      window.localStorage.setItem("request_tab", value);
    }
  };

  return (
    <Tabs value={tab} onChange={handleTabChange}>
      <TabList>
        <TabNav value="tab1">Requête</TabNav>
        {authority && authority[0] == "admin" && <TabNav value="tab2">Configuration</TabNav>}
      </TabList>
      <div className="p-4">
        <TabContent value="tab1">
          {!selectedType && <SelectTypeRequest GetSelected={setSelectedType} />}
          {selectedType && (
            <CreateRequestForm
              typeRequest={selectedType}
              goBack={() => {
                setSelectedType(undefined);
              }}
            />
          )}
        </TabContent>
        <TabContent value="tab2">
          {authority && authority[0] == "admin" && <AuthRequest />}
        </TabContent>
      </div>
    </Tabs>
  );
};
