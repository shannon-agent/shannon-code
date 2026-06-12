import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Extensions() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const [search, setSearch] = useState("");

  let searchPlaceholder = "Search extensions...";
  let ctaText = "";
  let ctaIcon = "";
  let ctaAction: () => void = () => {};

  if (path.includes('agents')) {
    searchPlaceholder = "Search components...";
    ctaText = "Create New Agent";
    ctaIcon = "add";
    ctaAction = () => navigate('/extensions/agents');
  } else if (path.includes('datasources')) {
    searchPlaceholder = "Search knowledge...";
    ctaText = "Add Data Source";
    ctaIcon = "add_circle";
    ctaAction = () => navigate('/extensions/datasources');
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-surface pb-[32px]">
      {/* Extension Specific Top Bar */}
      <div className="flex justify-between items-center w-full px-lg py-sm border-b border-outline-variant/20 bg-surface/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-xl w-full">
          <div className="hidden lg:flex items-center bg-surface-container-lowest/50 rounded-full px-md py-xs border border-outline-variant/30 flex-1 max-w-md">
            <span className="material-symbols-outlined text-outline mr-sm">search</span>
            <Input
              className="bg-transparent border-none outline-none focus:ring-0 text-label-md font-label-md w-full"
              placeholder={searchPlaceholder}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-md shrink-0">
           {ctaText && (
             <Button onClick={ctaAction} className="bg-primary text-on-primary px-lg py-sm rounded-full font-bold text-label-md hover:bg-primary/90 flex items-center gap-1 cursor-pointer whitespace-nowrap">
                <span className="material-symbols-outlined text-[18px]">{ctaIcon}</span>
                {ctaText}
             </Button>
           )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
         <Outlet context={{ search }} />
      </div>
    </div>
  );
}
