<?php
error_reporting(E_ERROR | E_PARSE);
header('Content-Type: application/json');
include '../../db.php';

// --- GET PARAMETERS ---
$search = $_GET['search'] ?? '';
$sort_by = $_GET['sort_by'] ?? 'dept_id'; // default column
$order = strtoupper($_GET['order'] ?? 'DESC'); // default order
$departments = [];

// --- ALLOWED COLUMNS TO PREVENT SQL INJECTION ---
$allowed_columns = ['dept_id', 'dept_code', 'dept_name'];
if (!in_array($sort_by, $allowed_columns)) {
    $sort_by = 'dept_id';
}
if ($order !== 'ASC' && $order !== 'DESC') {
    $order = 'DESC';
}

// --- QUERY HANDLING ---
if (!empty($search)) {
    // Search + Sort
    $searchTerm = "%$search%";
    $stmt = $conn->prepare("
        SELECT * FROM tbl_department 
        WHERE (dept_code LIKE ? OR dept_name LIKE ?)
        AND is_deleted = 0
        ORDER BY $sort_by $order
    ");
    $stmt->bind_param("ss", $searchTerm, $searchTerm);
    $stmt->execute();
    $result = $stmt->get_result();
} else {
    // Only Sort
    $result = $conn->query("
        SELECT * FROM tbl_department 
        WHERE is_deleted = 0
        ORDER BY $sort_by $order
    ");
}

// --- FETCH RESULTS ---
while ($row = $result->fetch_assoc()) {
    $departments[] = $row;
}

echo json_encode($departments);
$conn->close();
?>
