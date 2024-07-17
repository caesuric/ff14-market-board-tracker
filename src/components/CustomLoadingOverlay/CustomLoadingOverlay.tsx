import {
  Box,
  CircularProgress,
  CircularProgressProps,
  Typography,
} from "@mui/material";
import React from "react";

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
        {/* <StyledGridOverlay> */}
        <CircularProgressWithLabel value={loadingPercentage} />
        <Box sx={{ mt: 2 }}>{loadingMessage}</Box>
        {/* </StyledGridOverlay> */}
      </>
    );
  };
};
