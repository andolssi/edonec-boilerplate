import { Link } from "react-router-dom";

import { toPropperCase } from "helpers/toProperCase";

import Seperator from "./Seperator";
import { linkTranslator, useBreadcrumbs } from "./useBreadcrumbs";

const Breadcrumbs = () => {
  const { firstPath, pathList, currentPath } = useBreadcrumbs();

  if (!currentPath) return null;
  if (!linkTranslator[currentPath] && process.env.NODE_ENV === "development")
    throw new Error(
      "Link is not defined in linkTranslator, containers/MainWrapper/Breadcrumbs/useBreadcrumbs.ts"
    );

  return (
    <nav className="mt-4 mb-6 font-bold" aria-label="Breadcrumb">
      <ol className=" inline-flex list-none items-center justify-between p-0 text-xs font-normal text-gray-500 transition-colors dark:text-gray-200">
        <li className="flex items-center">
          <Link
            className="hover:text-primary-900 dark:hover:text-primary-600"
            to={firstPath}
          >
            {linkTranslator[firstPath]}
          </Link>
          <Seperator />
        </li>
        {pathList.map((path) => (
          <li key={path} className="flex items-center">
            <Link
              className="hover:text-primary-900 dark:hover:text-primary-600"
              to={path}
            >
              {linkTranslator[path]}
            </Link>
            <Seperator />
          </li>
        ))}
        <li>
          <span className="font-normal text-gray-400" aria-current="page">
            {linkTranslator[currentPath] || toPropperCase(currentPath)}
          </span>
        </li>
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
