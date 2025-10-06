<?php
error_reporting(E_ERROR | E_PARSE);
header('Content-Type: application/json');
include '../../db.php';

$search = $_GET['search'] ?? '';

if ($search) {
    $searchTerm = "%$search%";
    $stmt = $conn->prepare("SELECT * FROM tbl_department WHERE dept_code LIKE ? OR dept_name LIKE ? ORDER BY dept_id DESC");
    $stmt->bind_param("ss", $searchTerm, $searchTerm);
    $stmt->execute();
    $result = $stmt->get_result();
    $departments = [];
    while ($row = $result->fetch_assoc()) {
        $departments[] = $row;
    }
    $stmt->close();
    echo json_encode($departments);
} else {
    $result = $conn->query("SELECT * FROM tbl_department ORDER BY dept_id DESC");
    $departments = [];
    while ($row = $result->fetch_assoc()) {
        $departments[] = $row;
    }
    echo json_encode($departments);
}
