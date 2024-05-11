import { DocsThemeConfig } from "nextra-theme-docs";
import React from "react";

const config: DocsThemeConfig = {
  logo: () => (
    <>
      <img src="/favicon/android-chrome-192x192.png" width={36} height={36} />
      <span
        style={{
          fontWeight: "bold",
          fontSize: "1.2rem",
          paddingLeft: 15,
          paddingRight: 10,
        }}
      >
        TGrid
      </span>
    </>
  ),
  // nextThemes: {
  //   defaultTheme: "dark",
  // },
  project: {
    link: "https://github.com/samchon/tgrid",
  },
  docsRepositoryBase: "https://github.com/samchon/tgrid/blob/master/website",
  footer: {
    text: () => (
      <span>
        Released under the MIT License.
        <br />
        <br />
        Copyright 2018 - {new Date().getFullYear()}{" "}
        <a
          href="https://github.com/samchon"
          target="_blank"
          style={{ color: "initial" }}
        >
          <u>Samchon</u>
        </a>{" "}
        & Contributors
      </span>
    ),
  },
  useNextSeoProps() {
    return {
      defaultTitle: "TGrid Guide Documents",
      titleTemplate: "TGrid Guide Documents - %s",
      additionalLinkTags: [
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/favicon/apple-touch-icon.png",
        },
        {
          rel: "manifest",
          href: "/favicon/site.webmanifest",
        },
        ...[16, 32].map((size) => ({
          rel: "icon",
          type: "image/png",
          sizes: `${size}x${size}`,
          href: `/favicon/favicon-${size}x${size}.png`,
        })),
      ],
      additionalMetaTags: [
        {
          property: "og:image",
          content: "/og.jpg",
        },
        {
          property: "og:type",
          content: "object",
        },
        {
          property: "og:title",
          content: "TGrid Guide Documents",
        },
        {
          property: "og:description",
          content: "TypeScript Grid Computing Framework.\n\nSupport RPC (Remote Procure Call) for WebSocket and Worker protocols",
        },
        {
          property: "og:site_name",
          content: "TGrid Guide Documents",
        },
        {
          property: "og:url",
          content: "https://tgrid.com",
        },
        {
          name: "twitter:card",
          content: "summary",
        },
        {
          name: "twitter:image",
          content: "https://tgrid.com/og.jpg",
        },
        {
          name: "twitter:title",
          content: "TGrid Guide Documents",
        },
        {
          name: "twitter:description",
          content: "TypeScript Grid Computing Framework.\n\nSupport RPC (Remote Procure Call) for WebSocket and Worker protocols",
        },
        {
          name: "twitter:site",
          content: "@SamchonGithub",
        },
      ],
    };
  },
};

export default config;
