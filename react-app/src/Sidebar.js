// Sidebar.js
import React, { useState } from 'react';
import { Collapse } from 'react-bootstrap';
import './CSS/sidebar.css';

function Sidebar() {
  const [openManufacturing, setOpenManufacturing] = useState(false);
  const [openGeneral, setOpenGeneral] = useState(false);

    return (
        <div className="sidebar bg-light">
            <ul className="list-unstyled">
                <li>
                    <button
                        onClick={() => setOpenManufacturing(!openManufacturing)}
                        aria-controls="manufacturing-collapse"
                        aria-expanded={openManufacturing}
                        className="btn btn-link"
                    >
                        製造部
                    </button>
                    <Collapse in={openManufacturing}>
                        <ul id="manufacturing-collapse" className="list-unstyled sidebar-items">
                            <li><a href="#progress">進捗</a></li>
                            <li><a href="#material">素材一覧</a></li>
                        </ul>
                    </Collapse>
                </li>
                <li>
                    <button
                        onClick={() => setOpenGeneral(!openGeneral)}
                        aria-controls="general-collapse"
                        aria-expanded={openGeneral}
                        className="btn btn-link"
                    >
                        総務部
                    </button>
                    <Collapse in={openGeneral}>
                        <ul id="general-collapse" className="list-unstyled sidebar-items">
                            <li><a href="/general/department">部署一覧</a></li>
                            <li><a href="/general/employee">従業員一覧</a></li>
                        </ul>
                    </Collapse>
                </li>
            </ul>
        </div>
    );
}

export default Sidebar;
