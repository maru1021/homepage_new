import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { Container, Card, CardContent, Typography,
    TextField, Button, Box
} from "@mui/material";

function Login({ setToken }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch("http://127.0.0.1:8000/auth/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                username: username,
                password: password,
            }),
        });
        const data = await response.json();
        if (response.ok) {
            setToken(data.access_token);
            navigate("/");
        } else {
            alert("ログインに失敗しました");
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f4f6f8",
            }}
        >
            <Container maxWidth="xs">
                <Card
                    sx={{
                        p: 3,
                        boxShadow: 3,
                        borderRadius: 2,
                        backgroundColor: "#fff",
                    }}
                >
                    <CardContent>
                        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: "bold" }}>
                            ログイン
                        </Typography>
                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="ユーザー名"
                                margin="normal"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <TextField
                                fullWidth
                                label="パスワード"
                                type="password"
                                margin="normal"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                color="primary"
                                sx={{
                                    mt: 3,
                                    backgroundColor: "#1976d2",
                                    color: "#fff",
                                    fontWeight: "bold",
                                    "&:hover": {
                                        backgroundColor: "#1565c0",
                                    },
                                }}
                            >
                                ログイン
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
}

Login.propTypes = {
    setToken: PropTypes.func.isRequired,
};

export default Login;
