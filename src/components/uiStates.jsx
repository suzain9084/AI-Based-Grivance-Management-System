import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export const LoadingState = ({ label = "Loading..." }) => (
  <Box
    sx={{
      minHeight: 280,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
    }}
  >
    <CircularProgress size={36} sx={{ color: "#111827" }} />
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
  </Box>
);

export const EmptyState = ({
  title = "Nothing here yet",
  description = "There is no data to show right now.",
  actionLabel,
  onAction,
}) => (
  <Box className="empty-state">
    <div className="empty-state-icon">✦</div>
    <Typography variant="h6" sx={{ mb: 0.5 }}>
      {title}
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mb: 2 }}>
      {description}
    </Typography>
    {actionLabel && onAction && (
      <Button
        variant="contained"
        onClick={onAction}
        sx={{ backgroundColor: "#111827", textTransform: "none", borderRadius: "10px" }}
      >
        {actionLabel}
      </Button>
    )}
  </Box>
);

export const GuestPrompt = ({
  title = "Sign in to continue",
  description = "Log in to view this page and manage your grievances.",
}) => {
  const navigate = useNavigate();

  return (
    <EmptyState
      title={title}
      description={description}
      actionLabel="Go to Login"
      onAction={() => navigate("/login")}
    />
  );
};
