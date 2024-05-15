import GitHubIcon from "@mui/icons-material/GitHub";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { Button, Grid, Typography } from "@mui/material";
import { ReactNode } from "react";

import ProductHeroLayout from "../../components/home/ProductHeroLayout";
import React from "react";

const CYAN = "rgb(80, 200, 0)";
const PURPLE = "rgb(191, 64, 191)";
const YELLOW = "#DEC20B";

const QuickButton = (props: {
  title: string;
  href: string;
  icon?: ReactNode;
  color: "info" | "warning" | "success";
}) => (
  <Grid item xs={12} md={6}>
    <Button
      color={props.color}
      variant="outlined"
      size="large"
      component="a"
      href={props.href}
      startIcon={props.icon}
      fullWidth
      style={{ fontFamily: "unset", fontWeight: "bold" }}
    >
      {props.title}
    </Button>
  </Grid>
);

const HomeHeroMovie = () => (
  <ProductHeroLayout
    sxBackground={{
      background: `url(/images/home/background.jpg) no-repeat center top`,
      backgroundColor: "black",
      backgroundPosition: "center",
    }}
  >
    <Typography
      color="inherit"
      align="center"
      variant="h2"
      fontFamily="fantasy"
    >
      TGrid
    </Typography>
    <Typography
      color="inherit"
      align="center"
      variant="h5"
      fontFamily="cursive"
      sx={{ mb: 4, mt: { xs: 4, sm: 10 } }}
    >
      Remote Procedure Call
      <br />
      <br />
      TypeScript Grid Computing Framework
    </Typography>
    <br />
    <br />
    <Typography
      align="center"
      variant="h5"
      fontFamily="monospace"
      sx={{ fontWeight: "bold" }}
    >
      <React.Fragment>
        <span style={{ color: PURPLE }}>{"await "}</span>
        <span style={{ color: CYAN }}>driver</span>
        <span style={{ color: "gray" }}>{"."}</span>
        <span style={{ color: YELLOW }}>{"method("}</span>
        <span style={{ color: "gray" }}>{"...params"}</span>
        <span style={{ color: YELLOW }}>{")"}</span>
      </React.Fragment>
    </Typography>
    <br />
    <br />
    <br />
    <br />
    <Grid container spacing={2}>
      <QuickButton
        title="Guide Documents"
        icon={<MenuBookIcon />}
        href="/docs"
        color="info"
      />
      <QuickButton
        title="Github Repository"
        icon={<GitHubIcon />}
        href="https://github.com/samchon/tgrid"
        color="success"
      />
    </Grid>
  </ProductHeroLayout>
);
export default HomeHeroMovie;
