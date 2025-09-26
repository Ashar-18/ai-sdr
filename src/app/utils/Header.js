"use client";
import React from "react";
import {
  Drawer,
  Box,
  Typography,
  Divider,
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton, // ✅ correct component
} from "@mui/material";
import Link from "next/link";

// MUI icons
import PeopleIcon from "@mui/icons-material/People";
import BookIcon from "@mui/icons-material/Book";
import PhoneIcon from "@mui/icons-material/Phone";
import BuildIcon from "@mui/icons-material/Build";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import ChatIcon from "@mui/icons-material/Chat";
import BarChartIcon from "@mui/icons-material/BarChart";
import LogoutIcon from "@mui/icons-material/Logout";

const drawerWidth = 280;

const categories = [
  {
    title: "Workspace",
    items: [
      { text: "Agents", icon: <PeopleIcon />, href: "/agents" },
      { text: "Knowledge Base", icon: <BookIcon />, href: "/knowledge-base" },
      { text: "Phone Numbers", icon: <PhoneIcon />, href: "/phone-numbers" },
    ],
  },
  {
    title: "Settings",
    items: [
      { text: "Tools", icon: <BuildIcon />, href: "/tools" },
      { text: "API Keys", icon: <VpnKeyIcon />, href: "/api-keys" },
    ],
  },
  {
    title: "History",
    items: [
      { text: "Chat History", icon: <ChatIcon />, href: "/chat-history" },
      { text: "Analytics", icon: <BarChartIcon />, href: "/analytics" },
    ],
  },
];

export default function DashboardLayout({ children }) {
  return (
    <Box sx={{ display: "flex" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#fafafa",
            borderRight: "1px solid #e0e0e0",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* Logo */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mb: 2,
            }}
          >
            <img src="/logo.png" alt="Logo" width={120} />
          </Box>

          {/* Heading */}
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: "bold", mb: 1, color: "text.secondary", textAlign:"center" }}
          >
            AI SDR Workspace
          </Typography>
          <Divider />
        </Box>

        {/* Category-wise links */}
        <Box sx={{ flexGrow: 1 }}>
          {categories.map((category, idx) => (
            <Box key={idx} sx={{ px: 2, mb: 2 }}>
              <Typography
                variant="caption"
                sx={{
                  textTransform: "uppercase",
                  fontWeight: "bold",
                  color: "text.secondary",
                  pl: 1,
                }}
              >
                {category.title}
              </Typography>
              <List>
  {category.items.map((item, i) => (
    <Link
      key={i}
      href={item.href}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <ListItemButton sx={{ borderRadius: 1, py: 0.5, px: 1.5 }}>
        <ListItemIcon sx={{ minWidth: 32, fontSize: "18px", color: "rgba(0,0,0,0.6)" }}>
          {item.icon}
        </ListItemIcon>
        <ListItemText
          primary={item.text}
          primaryTypographyProps={{
            fontSize: "0.85rem",
            fontWeight: 500,
            color: "rgba(0,0,0,0.6)",
          }}
        />
      </ListItemButton>
    </Link>
  ))}
</List>

              <Divider />
            </Box>
          ))}
        </Box>

        {/* Logout at bottom */}
        <Box sx={{ mt: "auto", p: 2 }}>
          <Divider />
          <List>
            <ListItemButton>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>

      {/* Main Content Area */}
      <Box
        sx={{width:"100%", p:3}}
      >
        {children}
      </Box>
    </Box>
  );
}
