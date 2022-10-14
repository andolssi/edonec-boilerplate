import React, { useState } from "react";

import { clsx } from "core-utils";
import ReactChildrenProps from "shared-types/ReactChildren";

import SidebarMobileOpenButtonIcon from "components/Icons/SidebarMobileOpenButtonIcon";

type Props = ReactChildrenProps;

const Sidebar: React.FC<Props> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="md:min-w-[18rem]" />
      <div
        className={clsx(
          "fixed z-20 max-h-screen min-h-screen w-72 min-w-[18rem] flex-col justify-between shadow transition duration-150 ease-in-out md:flex",
          { "translate-x-[-18rem]": !isOpen },
          "md:translate-x-0"
        )}
      >
        <div className="absolute top-0 left-0 h-screen w-72 bg-gray-900 shadow">
          <div
            className="absolute right-0 mt-16 -mr-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-tr rounded-br bg-gray-900 shadow md:hidden"
            id="mobile-toggler"
            onClick={() => setIsOpen(!isOpen)}
          >
            <SidebarMobileOpenButtonIcon isOpen={isOpen} />
          </div>
          <div className="scrollbar max-h-screen overflow-auto">{children}</div>
        </div>
      </div>
      <div
        onClick={() => setIsOpen(false)}
        className={clsx(
          "fixed  top-0 left-0 z-10 h-screen w-screen bg-white/30 opacity-0 backdrop-blur-sm transition-[opacity] md:hidden ",
          { "pointer-events-none": !isOpen },
          { "opacity-100": isOpen }
        )}
      />
    </>
  );
};

export default Sidebar;