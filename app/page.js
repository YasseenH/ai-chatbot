"use client";
import { useState } from "react";
import { Box, Stack, TextField, Button, Typography } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Custom dark theme with a smoother gradient background
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default:
        "linear-gradient(90deg, #0d47a1 0%, #133d68 0%, #1e1e1e 35%, #1e1e1e 66%, #133d68 100%, #0d47a1 100%)", // Smoother gradient with more color stops
      paper: "#2c2c2c",
    },
    primary: {
      main: "#90caf9",
    },
    secondary: {
      main: "#f48fb1",
    },
    text: {
      primary: "#ffffff",
      secondary: "#b0bec5",
    },
  },
  typography: {
    fontFamily: '"Roboto Mono", monospace',
  },
});

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi, I am your personal CS college assistant. How can I help you today?",
    },
  ]);
  const [message, setMessage] = useState("");

  const sendMessage = async () => {
    setMessage("");
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([...messages, { role: "user", content: message }]),
    }).then(async (res) => {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let result = "";
      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result;
        }
        const text = decoder.decode(value || new Uint8Array(), {
          stream: true,
        });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
        return reader.read().then(processText);
      });
    });
  };

  const formatContent = (content) => {
    return content.split("\n").map((line, index) => {
      // Handle bullet points
      if (line.startsWith("-")) {
        return (
          <Typography
            key={index}
            variant="body1"
            gutterBottom
            component="li"
            sx={{ ml: 2 }} // Indent bullet points
          >
            {line.slice(1).trim()}
          </Typography>
        );
        // Handle bold text
      } else if (line.startsWith("**") && line.endsWith("**")) {
        return (
          <Typography
            key={index}
            variant="body1"
            gutterBottom
            sx={{ fontWeight: "bold" }}
          >
            {line.slice(2, line.length - 2)}
          </Typography>
        );
        // Handle numbered lists
      } else if (/^\d+\./.test(line)) {
        return (
          <Typography key={index} variant="body1" gutterBottom>
            {line}
          </Typography>
        );
        // Handle regular paragraphs
      } else {
        return (
          <Typography key={index} variant="body1" gutterBottom>
            {line}
          </Typography>
        );
      }
    });
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        sx={{
          backgroundImage: darkTheme.palette.background.default,
        }}
      >
        {/* Title */}
        <Typography
          variant="h4"
          align="left"
          width="600px"
          mb={2}
          color="primary.main"
          sx={{ fontFamily: "Roboto Mono, monospace", fontWeight: "bold" }}
        >
          CS Personal Chatbot
        </Typography>

        <Stack
          width="700px"
          height="750px"
          direction="column"
          border="1px solid #444"
          borderRadius={8}
          p={4}
          spacing={2}
          bgcolor="background.paper"
          boxShadow="0px 4px 20px rgba(0, 0, 0, 0.5)"
        >
          <Stack
            direction={"column"}
            flexGrow={1}
            spacing={3}
            overflow={"auto"}
            maxHeight={"100%"}
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                display={"flex"}
                justifyContent={
                  message.role === "assistant" ? "flex-start" : "flex-end"
                }
              >
                <Box
                  bgcolor={
                    message.role === "assistant"
                      ? "primary.main"
                      : "secondary.main"
                  }
                  color={"white"}
                  borderRadius={12}
                  maxWidth="80%"
                  boxShadow="0px 4px 15px rgba(0, 0, 0, 0.2)"
                  sx={{
                    wordBreak: "break-word",
                    lineHeight: 1.5,
                    padding: "20px 25px",
                    fontFamily: "Roboto Mono, monospace",
                  }}
                >
                  {/* Dynamic Formatting of Content */}
                  {formatContent(message.content)}
                </Box>
              </Box>
            ))}
          </Stack>
          <Stack direction={"row"} spacing={2}>
            <TextField
              label="Type your message..."
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              variant="outlined"
              InputProps={{
                style: {
                  backgroundColor: "#333",
                  color: "white",
                  borderRadius: "25px",
                  fontFamily: "Roboto Mono, monospace",
                },
              }}
            />
            <Button
              variant="contained"
              onClick={sendMessage}
              sx={{
                backgroundColor: "primary.main",
                borderRadius: "25px",
                padding: "10px 20px",
                "&:hover": {
                  backgroundColor: "primary.dark",
                },
                fontFamily: "Roboto Mono, monospace",
              }}
            >
              Send
            </Button>
          </Stack>
        </Stack>
      </Box>
    </ThemeProvider>
  );
}
