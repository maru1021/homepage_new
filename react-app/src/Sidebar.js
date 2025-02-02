import React, { useState, useEffect } from "react";
import { Collapse, Drawer, List, ListItem, ListItemIcon, ListItemText, Button, Divider, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { FaIndustry, FaUsers, FaSignOutAlt, FaToolbox } from "react-icons/fa";
import "./CSS/sidebar.css";

function Sidebar({ setToken }) {
  const navigate = useNavigate();

  // ローカルストレージから開閉状態を読み込む
  const [openManufacturing, setOpenManufacturing] = useState(
    JSON.parse(localStorage.getItem("openManufacturing")) || false
  );
  const [openTools, setOpenTools] = useState(
    JSON.parse(localStorage.getItem("openTools")) || false
  );
  const [openGeneral, setOpenGeneral] = useState(
    JSON.parse(localStorage.getItem("openGeneral")) || false
  );

  // 開閉状態をローカルストレージに保存
  useEffect(() => {
    localStorage.setItem("openManufacturing", JSON.stringify(openManufacturing));
    localStorage.setItem("openTools", JSON.stringify(openTools));
    localStorage.setItem("openGeneral", JSON.stringify(openGeneral));
  }, [openManufacturing, openTools, openGeneral]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/login");
  };

  return (
    <Drawer variant="permanent">
      <List >
        <Typography variant="h6" sx={{ p: 2, textAlign: "center", fontWeight: "bold", color: "black" }}>
          メニュー
        </Typography>
        <Divider />

        {/* 製造部 */}
        <ListItem button onClick={() => setOpenManufacturing(!openManufacturing)}>
          <ListItemIcon>
            <FaIndustry />
          </ListItemIcon>
          <ListItemText primary="製造部" />
        </ListItem>
        <Collapse in={openManufacturing} timeout="auto" unmountOnExit>
          <List sx={{ pl: 4 }}>
            <ListItem button component="a" href="#progress">
              <ListItemText primary="進捗" />
            </ListItem>
            <ListItem button component="a" href="#material">
              <ListItemText primary="素材一覧" />
            </ListItem>
            <ListItem button onClick={() => setOpenTools(!openTools)}>
              <ListItemIcon>
                <FaToolbox />
              </ListItemIcon>
              <ListItemText primary="工具管理" />
            </ListItem>
            <Collapse in={openTools} timeout="auto" unmountOnExit>
              <List sx={{ pl: 4 }}>
                <ListItem button component="a" href="#shuken">
                  <ListItemText primary="集研" />
                </ListItem>
                <ListItem button component="a" href="#preset">
                  <ListItemText primary="プリセット" />
                </ListItem>
                <ListItem button component="a" href="#tool-change">
                  <ListItemText primary="工具交換" />
                </ListItem>
              </List>
            </Collapse>
          </List>
        </Collapse>

        {/* 総務部 */}
        <ListItem button onClick={() => setOpenGeneral(!openGeneral)}>
          <ListItemIcon>
            <FaUsers />
          </ListItemIcon>
          <ListItemText primary="総務部" />
        </ListItem>
        <Collapse in={openGeneral} timeout="auto" unmountOnExit>
          <List sx={{ pl: 4 }}>
            <ListItem button component="a" href="/general/department">
              <ListItemText primary="部署一覧" />
            </ListItem>
            <ListItem button component="a" href="/general/employee">
              <ListItemText primary="従業員一覧" />
            </ListItem>
          </List>
        </Collapse>

        <Divider sx={{ mt: "auto" }} />

        {/* ログアウト */}
        <ListItem sx={{ justifyContent: "center", mt: 2 }}>
          <Button
            variant="contained"
            color="error"
            startIcon={<FaSignOutAlt />}
            onClick={handleLogout}
            sx={{ width: "100%", fontWeight: "bold" }}
          >
            ログアウト
          </Button>
        </ListItem>
      </List>
    </Drawer>
  );
}

Sidebar.propTypes = {
  setToken: PropTypes.func.isRequired,
};

export default Sidebar;
