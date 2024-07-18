import {
  Box,
  CircularProgress,
  CircularProgressProps,
  styled,
  Typography,
} from "@mui/material";
import React from "react";

const StyledGridOverlay = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  backgroundColor:
    theme.palette.mode === "light"
      ? "rgba(255, 255, 255, 0.9)"
      : "rgba(18, 18, 18, 0.9)",
}));

function CircularProgressWithLabel(
  props: CircularProgressProps & { value: number }
) {
  return (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <CircularProgress variant="determinate" {...props} />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="caption"
          component="div"
          color="text.primary"
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

export const CustomLoadingOverlay = ({
  loadingPercentage,
  loadingMessage,
}: {
  loadingPercentage: number;
  loadingMessage: string;
}) => {
  return () => {
    return (
      <>
        <StyledGridOverlay>
          <CircularProgressWithLabel value={loadingPercentage} />
          <Box sx={{ mt: 2 }}>{loadingMessage}</Box>
        </StyledGridOverlay>
      </>
    );
  };
};
