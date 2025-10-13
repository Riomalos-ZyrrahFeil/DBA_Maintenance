<?php
error_reporting(E_ERROR | E_PARSE);
header('Content-Type: application/json');
error_log("SEARCH QUERY: " . $search);

include '../../db.php';

$search = $_GET['search'] ?? '';
$departments = [];

if (!empty($search)) {
    // Use search filter — only include non-deleted departments
    $searchTerm = "%$search%";
    $stmt = $conn->prepare("
        SELECT * FROM tbl_department 
        WHERE (dept_code LIKE ? OR dept_name LIKE ?)
        AND is_deleted = 0
        ORDER BY dept_id DESC
    "); 
    $stmt->bind_param("ss", $searchTerm, $searchTerm);
    $stmt->execute();
    $result = $stmt->get_result();

    while ($row = $result->fetch_assoc()) {
        $departments[] = $row;
    }

    $stmt->close();
} else {
    // Default: show all non-deleted departments
    $result = $conn->query("
        SELECT * FROM tbl_department 
        WHERE is_deleted = 0
        ORDER BY dept_id DESC
    ");

    while ($row = $result->fetch_assoc()) {
        $departments[] = $row;
    }
}

echo json_encode($departments);
$conn->close();
?>
