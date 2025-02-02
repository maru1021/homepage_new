import React, { useState } from "react";
import { Collapse } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { FaIndustry, FaUsers, FaSignOutAlt, FaToolbox } from "react-icons/fa"; // Reactアイコン
import "./CSS/sidebar.css";

function Sidebar({ setToken }) {
  const [openManufacturing, setOpenManufacturing] = useState(false);
  const [openTools, setOpenTools] = useState(false); // 工具管理の状態
  const [openGeneral, setOpenGeneral] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/login");
  };

  return (
    <div className="sidebar bg-light">
      <div className="sidebar-header">
        <h3 className="text-center py-3">メニュー</h3>
      </div>
      <ul className="list-unstyled sidebar-menu">
        {/* 製造部 */}
        <li>
          <button
            onClick={() => setOpenManufacturing(!openManufacturing)}
            aria-controls="manufacturing-collapse"
            aria-expanded={openManufacturing}
            className="btn btn-link sidebar-link"
          >
            <FaIndustry className="me-2" />
            製造部
          </button>
          <Collapse in={openManufacturing}>
            <ul id="manufacturing-collapse" className="list-unstyled sidebar-items">
              <li>
                <a href="#progress" className="sidebar-item">進捗</a>
              </li>
              <li>
                <a href="#material" className="sidebar-item">素材一覧</a>
              </li>
              <li>
                {/* 工具管理 */}
                <button
                  onClick={() => setOpenTools(!openTools)}
                  aria-controls="tools-collapse"
                  aria-expanded={openTools}
                  className="btn btn-link sidebar-item"
                >
                  <FaToolbox className="me-2" />
                  工具管理
                </button>
                <Collapse in={openTools}>
                  <ul id="tools-collapse" className="list-unstyled sidebar-sub-items">
                    <li>
                      <a href="#shuken" className="sidebar-item">集研</a>
                    </li>
                    <li>
                      <a href="#preset" className="sidebar-item">プリセット</a>
                    </li>
                    <li>
                      <a href="#tool-change" className="sidebar-item">工具交換</a>
                    </li>
                  </ul>
                </Collapse>
              </li>
            </ul>
          </Collapse>
        </li>

        {/* 総務部 */}
        <li>
          <button
            onClick={() => setOpenGeneral(!openGeneral)}
            aria-controls="general-collapse"
            aria-expanded={openGeneral}
            className="btn btn-link sidebar-link"
          >
            <FaUsers className="me-2" />
            総務部
          </button>
          <Collapse in={openGeneral}>
            <ul id="general-collapse" className="list-unstyled sidebar-items">
              <li>
                <a href="/general/department" className="sidebar-item">部署一覧</a>
              </li>
              <li>
                <a href="/general/employee" className="sidebar-item">従業員一覧</a>
              </li>
            </ul>
          </Collapse>
        </li>
      </ul>

      {/* ログアウト */}
      <div className="sidebar-logout text-center mt-4">
        <button
          onClick={handleLogout}
          className="btn btn-danger btn-sm"
        >
          <FaSignOutAlt className="me-2" />
          ログアウト
        </button>
      </div>
    </div>
  );
}

Sidebar.propTypes = {
  setToken: PropTypes.func.isRequired,
};

export default Sidebar;
