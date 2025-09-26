"use client";
import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Paper,
  TableContainer,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";

export default function Agents() {
  const [open, setOpen] = useState(false);

  // placeholder agents (replace with backend)
  const [agents, setAgents] = useState([
    {
      name: "Agent 1",
      type: "Pipecat Agent",
      phone: "+1234567890",
      createdAt: "2025-09-26",
    },
  ]);

  // form state
  const [form, setForm] = useState({
    agentName: "",
    systemPrompt: "",
    tools: "",
    deepgramApiKey: "",
    deepgramModel: "",
    openaiApiKey: "",
    telnyxApiKey: "",
    elevenApiKey: "",
    elevenVoiceId: "",
    elevenModel: "",
    phoneNumber: "",
  });

  const handleChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleCreate = () => {
    if (!form.agentName) {
      // minimal guard - you can replace with nicer validation + snackbar
      alert("Agent name is required");
      return;
    }
    const newAgent = {
      name: form.agentName,
      type: "Pipecat Agent",
      phone: form.phoneNumber || "-",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setAgents((prev) => [newAgent, ...prev]);
    setForm({
      agentName: "",
      systemPrompt: "",
      tools: "",
      deepgramApiKey: "",
      deepgramModel: "",
      openaiApiKey: "",
      telnyxApiKey: "",
      elevenApiKey: "",
      elevenVoiceId: "",
      elevenModel: "",
      phoneNumber: "",
    });
    setOpen(false);
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Actions row */}
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          Create New Agent
        </Button>
      </Box>

      {/* Create Agent Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="lg"
        fullWidth
        aria-labelledby="create-agent-title"
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            py: 2,
          }}
        >
          <Typography
            id="create-agent-title"
            variant="h5"
            sx={{ fontWeight: 800, textAlign: "center" }}
          >
            Create New Agent
          </Typography>

          {/* close button */}
          <IconButton
            onClick={() => setOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
            aria-label="close"
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            maxHeight: "70vh",
            overflowY: "auto",
            px: 3,
            pt: 1,
            // thin white-ish scrollbar (webkit + firefox)
            "&::-webkit-scrollbar": { width: 6, height: 6 },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(255,255,255,0.6)",
              borderRadius: 6,
            },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.6) transparent",
            // subtle background for form area so white thumb is visible on dark themes
            bgcolor: (theme) =>
              theme.palette.mode === "dark" ? "transparent" : "background.paper",
          }}
        >
          <Grid container spacing={2} mt={0}>
            {/* Agent Name */}
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 700 }}>
                Agent name
              </Typography>
              <TextField
                name="agentName"
                value={form.agentName}
                onChange={handleChange}
                placeholder="Enter agent name"
                fullWidth
                size="small"
              />
            </Grid>

            {/* Agent Type (fixed) */}
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 700 }}>
                Agent type
              </Typography>
              <TextField
                value="Pipecat Agent"
                fullWidth
                size="small"
                disabled
              />
            </Grid>

            {/* System Prompt */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 700 }}>
                System prompt
              </Typography>
              <TextField
                name="systemPrompt"
                value={form.systemPrompt}
                onChange={handleChange}
                placeholder="System prompt for the agent..."
                fullWidth
                size="small"
                multiline
                rows={4}
              />
            </Grid>

            {/* Tools */}
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 700 }}>
                Tools
              </Typography>
              <TextField
                name="tools"
                value={form.tools}
                onChange={handleChange}
                select
                fullWidth
                size="small"
                placeholder="Select tool"
              >
                {/* Replace with backend options */}
                <MenuItem value="">-- select --</MenuItem>
                <MenuItem value="tool-1">Tool 1</MenuItem>
                <MenuItem value="tool-2">Tool 2</MenuItem>
              </TextField>
            </Grid>

            {/* Deepgram API & model */}
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 700 }}>
                Deepgram API key
              </Typography>
              <TextField
                name="deepgramApiKey"
                value={form.deepgramApiKey}
                onChange={handleChange}
                placeholder="sk-..."
                fullWidth
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 700 }}>
                Deepgram model
              </Typography>
              <TextField
                name="deepgramModel"
                value={form.deepgramModel}
                onChange={handleChange}
                select
                fullWidth
                size="small"
              >
                <MenuItem value="">-- select --</MenuItem>
                <MenuItem value="nova-3">nova-3</MenuItem>
                <MenuItem value="nova-2">nova-2</MenuItem>
              </TextField>
            </Grid>

            {/* OpenAI key */}
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 700 }}>
                OpenAI API key
              </Typography>
              <TextField
                name="openaiApiKey"
                value={form.openaiApiKey}
                onChange={handleChange}
                placeholder="sk-..."
                fullWidth
                size="small"
              />
            </Grid>

            {/* Telnyx */}
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 700 }}>
                Telnyx API key
              </Typography>
              <TextField
                name="telnyxApiKey"
                value={form.telnyxApiKey}
                onChange={handleChange}
                placeholder="telnyx-..."
                fullWidth
                size="small"
              />
            </Grid>

            {/* Eleven Labs */}
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 700 }}>
                Eleven Labs API key
              </Typography>
              <TextField
                name="elevenApiKey"
                value={form.elevenApiKey}
                onChange={handleChange}
                placeholder="eleven-..."
                fullWidth
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 700 }}>
                Eleven Labs voice id
              </Typography>
              <TextField
                name="elevenVoiceId"
                value={form.elevenVoiceId}
                onChange={handleChange}
                placeholder="voice-id"
                fullWidth
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 700 }}>
                Eleven Labs model
              </Typography>
              <TextField
                name="elevenModel"
                value={form.elevenModel}
                onChange={handleChange}
                select
                fullWidth
                size="small"
              >
                <MenuItem value="">-- select --</MenuItem>
                <MenuItem value="eleven_turbo_v2">eleven_turbo_v2</MenuItem>
              </TextField>
            </Grid>

            {/* Phone numbers */}
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 700 }}>
                Phone number
              </Typography>
              <TextField
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                select
                fullWidth
                size="small"
              >
                <MenuItem value="">-- select --</MenuItem>
                <MenuItem value="+1234567890">+1234567890</MenuItem>
                <MenuItem value="+9876543210">+9876543210</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Divider + heading (full width) */}
      <Divider sx={{ my: 3 }} />
      <Box sx={{ width: "100%" }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
          Agents
        </Typography>

        {/* Table container */}
        <Paper sx={{ width: "100%", overflow: "hidden" }}>
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Agent name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Created at</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {agents.map((agent, i) => (
                  <TableRow hover key={i}>
                    <TableCell>{agent.name}</TableCell>
                    <TableCell>{agent.type}</TableCell>
                    <TableCell>{agent.phone}</TableCell>
                    <TableCell>{agent.createdAt}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" aria-label="edit">
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Box>
  );
}
