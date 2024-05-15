import { Box, Container, Grid } from "@mui/material";
import React from "react";

import HomeStrengthSectionMovie from "./HomeStrengthSectionMovie";

const BLUE = "rgb(0, 200, 255)";
const CYAN = "rgb(80, 200, 0)";
const PURPLE = "rgb(191, 64, 191)";
const YELLOW = "#DEC20B";

const sections: HomeStrengthSectionMovie.Props[] = [
  {
    title: "Remote Procedure Call",
    subTitle: (
      <React.Fragment>
        <span style={{ color: PURPLE }}>{"await "}</span>
        <span style={{ color: CYAN }}>driver</span>
        <span style={{ color: "gray" }}>{"."}</span>
        <span style={{ color: YELLOW }}>{"method("}</span>
        <span style={{ color: "gray" }}>{"...params"}</span>
        <span style={{ color: YELLOW }}>{")"}</span>
      </React.Fragment>
    ),
    description: (
      <React.Fragment>
        <p>You can call remote system's functions</p>
        <br />
        <p>
          <span style={{ color: BLUE }}>Provider</span>
          : functions for remote system
        </p>
        <br />
        <p>
          <span style={{ color: BLUE }}>Driver</span>
          <span style={{ color: "gray" }}>{"<"}</span>
          <span style={{ color: CYAN }}>Remote</span>
          <span style={{ color: "gray" }}>{">"}</span>
          : remote function caller
        </p>
      </React.Fragment>
    ),
    image: "/images/home/rpc.png",
    href: "/docs/remote-procedure-call",
  },
  {
    title: "Web Socket Protocol",
    subTitle: (
      <React.Fragment>
        <span style={{ color: BLUE }}>WebSocketAcceptor</span>
        <span style={{ color: "gray" }}>{"<"}</span>
        <span style={{ color: CYAN }}>Header</span>
        <span style={{ color: "gray" }}>{", "}</span>
        <span style={{ color: CYAN }}>Provider</span>
        <span style={{ color: "gray" }}>{", "}</span>
        <span style={{ color: CYAN }}>Remote</span>
        <span style={{ color: "gray" }}>{">"}</span>
      </React.Fragment>
    ),
    description: (
      <React.Fragment>
        <p>Supports RPC on WebSocket protocol</p>
        <br />
        <p>Available in both Web Browser and NodeJS</p>
        <br />
        <p>
          <span style={{ color: PURPLE }}>await</span>
          {" "}
          <span style={{ color: CYAN }}>remote</span>
          <span style={{ color: "gray" }}>{"."}</span>
          <span style={{ color: YELLOW }}>{"method("}</span>
          <span style={{ color: "gray" }}>{"...params"}</span>
          <span style={{ color: YELLOW }}>{")"}</span>
        </p>
      </React.Fragment>
    ),
    image: "/images/home/websocket.svg",
    href: "/docs/features/websocket",
  },
  {
    title: "Worker Protocol",
    subTitle: (
      <React.Fragment>
        <span style={{ color: BLUE }}>WorkerConnector</span>
        <span style={{ color: "gray" }}>{"<"}</span>
        <span style={{ color: CYAN }}>Header</span>
        <span style={{ color: "gray" }}>{", "}</span>
        <span style={{ color: CYAN }}>Provider</span>
        <span style={{ color: "gray" }}>{", "}</span>
        <span style={{ color: CYAN }}>Remote</span>
        <span style={{ color: "gray" }}>{">"}</span>
      </React.Fragment>
    ),
    description: (
      <React.Fragment>
        <p>Considers Worker as a remote system</p>
        <br />
        <p>So that supports RPC in Worker</p>
        <br />
        <p>So that supports RPC in SharedWorker</p>
      </React.Fragment>
    ),
    image: "/images/home/worker.svg",
    href: "/docs/features/worker",
  },
  {
    title: "NestJS WebSocket",
    subTitle: (
      <React.Fragment>
        <span style={{ color: PURPLE }}>@</span>
        <span style={{ color: YELLOW }}>{"WebSocketRoute()"}</span>
        <span style={{ color: "gray" }}>{" acceptor: "}</span>
        <span style={{ color: BLUE }}>WebSocketAcceptor</span>
        {/* <span style={{ color: "gray" }}>{"<"}</span>
        <span style={{ color: CYAN }}>{"H"}</span>
        <span style={{ color: "gray" }}>{", "}</span>
        <span style={{ color: CYAN }}>{"P"}</span>
        <span style={{ color: "gray" }}>{", "}</span>
        <span style={{ color: CYAN }}>{"R"}</span>
        <span style={{ color: "gray" }}>{">"}</span> */}
      </React.Fragment>
    ),
    description: (
      <React.Fragment>
        <p>WebSocket RPC in NestJS</p>
        <br />
        <p>Compatible with both HTTP and WebSocket protocols</p>
        <br/>
        <p>Supports SDK (Software Development Kit) generation</p>
      </React.Fragment>
    ),
    image: "/images/home/nestia.png",
    href: "/docs/features/websocket/#nestjs-integration",
    width: 120,
  },
];

const HomeStrengthMovie = () => (
  <Box sx={{ display: "flex" }}>
    <Container
      sx={{
        mt: 3,
        display: "flex",
        position: "relative",
      }}
    >
      <Grid container spacing={3}>
        {sections.map(HomeStrengthSectionMovie)}
      </Grid>
    </Container>
  </Box>
);
export default HomeStrengthMovie;
