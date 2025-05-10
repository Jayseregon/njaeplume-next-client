"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import DOMPurify from "dompurify";

type Props = {
  policyKey?: string;
};

const termageddonAPIPath = "https://app.termageddon.com/api/policy/";

export const Policy = ({ policyKey }: Props) => {
  const [policyContent, setPolicyContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPolicy = async () => {
      if (!policyKey) {
        setError("Error! Policy key is undefined.");

        return;
      }

      try {
        const policyElement = document.getElementById("policy");

        if (!policyElement) {
          setError("Error! Could not find policy element.");

          return;
        }

        const pol_extra = policyElement.dataset.extra
          ? "?" + policyElement.dataset.extra
          : "";
        const response = await axios.get(
          termageddonAPIPath + policyKey + pol_extra,
        );
        const sanitizedContent = DOMPurify.sanitize(response.data);

        setPolicyContent(sanitizedContent);
      } catch {
        // console.error("Error! Could not load policy.", err);
        setError("There has been an error loading this policy!");
      }
    };

    fetchPolicy();
  }, [policyKey]);

  const renderContent = (content: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");

    const traverseNodes = (node: ChildNode): React.ReactNode => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || "";

        // Apply semicolon formatting to all text nodes
        return text.split(";").join("; ");
      }

      if (node.nodeType !== Node.ELEMENT_NODE) {
        return null;
      }

      const element = node as HTMLElement;
      const elementClasses = element.className || "";

      switch (element.tagName) {
        case "H2":
          return (
            <h2
              className={`text-2xl font-bold my-4 text-start ${elementClasses}`.trim()}
            >
              {Array.from(element.childNodes).map((childNode, index) => (
                <React.Fragment key={index}>
                  {traverseNodes(childNode)}
                </React.Fragment>
              ))}
            </h2>
          );
        case "P":
          return (
            <p className={`my-2 ${elementClasses}`.trim()}>
              {Array.from(element.childNodes).map((childNode, index) => (
                <React.Fragment key={index}>
                  {traverseNodes(childNode)}
                </React.Fragment>
              ))}
            </p>
          );
        case "TABLE":
          return (
            <div className="overflow-x-auto my-4">
              <table
                className={`min-w-full bg-background ${elementClasses}`.trim()}
              >
                {Array.from(element.childNodes).map((childNode, index) => {
                  if (childNode.nodeType === Node.ELEMENT_NODE) {
                    return (
                      <React.Fragment key={index}>
                        {traverseNodes(childNode)}
                      </React.Fragment>
                    );
                  }

                  return null;
                })}
              </table>
            </div>
          );
        case "THEAD":
          return (
            <thead
              className={`bg-foreground text-background ${elementClasses}`.trim()}
            >
              {Array.from(element.childNodes).map((childNode, index) => {
                if (childNode.nodeType === Node.ELEMENT_NODE) {
                  return (
                    <React.Fragment key={index}>
                      {traverseNodes(childNode)}
                    </React.Fragment>
                  );
                }

                return null;
              })}
            </thead>
          );
        case "TBODY":
          return (
            <tbody className={`${elementClasses}`.trim()}>
              {Array.from(element.childNodes).map((childNode, index) => {
                if (childNode.nodeType === Node.ELEMENT_NODE) {
                  return (
                    <React.Fragment key={index}>
                      {traverseNodes(childNode)}
                    </React.Fragment>
                  );
                }

                return null;
              })}
            </tbody>
          );
        case "TR":
          return (
            <tr className={`border border-foreground ${elementClasses}`.trim()}>
              {Array.from(element.childNodes).map((childNode, index) => {
                if (childNode.nodeType === Node.ELEMENT_NODE) {
                  return (
                    <React.Fragment key={index}>
                      {traverseNodes(childNode)}
                    </React.Fragment>
                  );
                }

                return null;
              })}
            </tr>
          );
        case "TH":
          return (
            <th className={`px-4 py-2 text-center ${elementClasses}`.trim()}>
              {Array.from(element.childNodes).map((childNode, index) => (
                <React.Fragment key={index}>
                  {traverseNodes(childNode)}
                </React.Fragment>
              ))}
            </th>
          );
        case "TD": {
          return (
            <td
              className={`px-4 py-2 text-start align-top ${elementClasses}`.trim()}
            >
              {Array.from(element.childNodes).map((childNode, index) => (
                <React.Fragment key={index}>
                  {traverseNodes(childNode)}
                </React.Fragment>
              ))}
            </td>
          );
        }
        case "UL":
          return (
            <ul
              className={`list-disc list-inside text-start my-2 ${elementClasses}`.trim()}
            >
              {Array.from(element.childNodes).map((childNode, index) => {
                if (childNode.nodeType === Node.ELEMENT_NODE) {
                  return (
                    <React.Fragment key={index}>
                      {traverseNodes(childNode)}
                    </React.Fragment>
                  );
                }

                return null;
              })}
            </ul>
          );
        case "LI":
          return (
            <li className={`${elementClasses}`.trim()}>
              {Array.from(element.childNodes).map((childNode, index) => (
                <React.Fragment key={index}>
                  {traverseNodes(childNode)}
                </React.Fragment>
              ))}
            </li>
          );
        case "OL": // Handle OL elements
          return (
            <ol
              className={`list-decimal list-inside text-start my-2 ${elementClasses}`.trim()}
            >
              {Array.from(element.childNodes).map((childNode, index) => {
                if (childNode.nodeType === Node.ELEMENT_NODE) {
                  return (
                    <React.Fragment key={index}>
                      {traverseNodes(childNode)}
                    </React.Fragment>
                  );
                }

                return null;
              })}
            </ol>
          );
        case "A": // Handle A elements
          return (
            <a
              aria-label={element.getAttribute("aria-label") || undefined}
              className={`text-primary hover:underline ${elementClasses}`.trim()}
              href={element.getAttribute("href") || undefined}
              rel={element.getAttribute("rel") || undefined}
              target={element.getAttribute("target") || undefined}
            >
              {Array.from(element.childNodes).map((childNode, index) => (
                <React.Fragment key={index}>
                  {traverseNodes(childNode)}
                </React.Fragment>
              ))}
            </a>
          );
        case "SPAN": // Handle SPAN elements
          return (
            <span className={`${elementClasses}`.trim()}>
              {Array.from(element.childNodes).map((childNode, index) => (
                <React.Fragment key={index}>
                  {traverseNodes(childNode)}
                </React.Fragment>
              ))}
            </span>
          );
        case "BR":
          return <br />;
        default:
          return Array.from(element.childNodes).map((child, index) => (
            <React.Fragment key={index}>{traverseNodes(child)}</React.Fragment>
          ));
      }
    };

    return Array.from(doc.body.childNodes).map((node, index) => (
      <React.Fragment key={index}>{traverseNodes(node)}</React.Fragment>
    ));
  };

  return (
    <div
      className="text-justify w-full overflow-x-auto"
      data-extra="no-title=true"
      id="policy"
    >
      {error ? (
        <p>{error}</p>
      ) : policyContent ? (
        renderContent(policyContent)
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};
