<?php
session_start();
$allowed_roles = ['faculty', 'super_admin'];

if (!isset($_SESSION['user_id']) || !in_array($_SESSION['role'], $allowed_roles)) {
    header("Location: ../index.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Term Maintenance - PUP</title>
    <link rel="stylesheet" href="../dashboard.css">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="dash-main-wrapper">
        <?php include('../component/sidebar.php'); ?>

        <main class="main-content">
            <div class="container">
                <header class="content-header">
                    <h1>Term Maintenance</h1>
                    <button id="addBtn" class="primary-btn">+ Add New Term</button>
                </header>

                <div class="table-header">
                    <div class="search-container">
                        <input type="text" id="search" placeholder="Search Term Code...">
                    </div>
                    <div class="export-buttons">
                        <button id="exportExcel">Export Excel</button>
                        <button id="exportPDF">Export PDF</button>
                    </div>
                </div>

                <div class="table-container card">
                    <table id="termTable">
                        <thead>
                            <tr>
                                <th data-column="term_id">ID <span class="sort-arrow">↕</span></th>
                                <th data-column="term_code">Term Code <span class="sort-arrow">↕</span></th>
                                <th data-column="start_date">Start Date <span class="sort-arrow">↕</span></th>
                                <th data-column="end_date">End Date <span class="sort-arrow">↕</span></th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="termTableBody"></tbody>
                    </table>
                </div>

                <div id="formModal" class="modal">
                    <div class="modal-content card">
                        <span class="close-modal">&times;</span>
                        <h2 id="modalTitle">Add New Term</h2>
                        <hr>
                        <div class="form-grid">
                            <input type="hidden" id="term_id">
                            <div class="form-row">
                                <label for="term_code">Term Code</label>
                                <input type="text" id="term_code" placeholder="Enter Term Code">
                            </div>
                            <div class="form-row">
                                <label for="start_date">Start Date</label>
                                <input type="date" id="start_date">
                            </div>
                            <div class="form-row">
                                <label for="end_date">End Date</label>
                                <input type="date" id="end_date">
                            </div>
                        </div>
                        <div class="form-buttons">
                            <button id="saveBtn">Save</button>
                            <button id="updateBtn" style="display:none;">Update</button>
                            <button id="cancelBtn" class="secondary-btn">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
    <script src="script.js"></script>
</body>
</html>